/**
 * Content Registry - Central content management system
 *
 * This file defines all educational content, learning paths,
 * and provides utilities for navigation and progress tracking.
 *
 * Architecture:
 * - Content items are tagged with house, topics, difficulty
 * - Learning paths are ordered sequences pulling from any house
 * - Houses provide identity; paths provide structure
 */

const ContentRegistry = {

    // ═══════════════════════════════════════════════════════════════
    // CONTENT ITEMS
    // All educational content defined here with metadata
    // ═══════════════════════════════════════════════════════════════

    content: {
        // ─────────────────────────────────────────────────────────────
        // FORGE HOUSE - Hardware & Systems
        // ─────────────────────────────────────────────────────────────
        // ORPHAN - commented out during ISSUE-002 fix (Dec 29, 2025)
        //     prerequisites: [],
        //     objectives: [
        //         'Identify the four main Windows editions',
        //         'Explain key feature differences (BitLocker, domain join)',
        //         'Recommend appropriate editions for scenarios'
        //     ]
        // },

        'forge-windows-editions': {
            id: 'forge-windows-editions',
            title: 'Windows Editions',
            description: 'Understanding Home, Pro, Enterprise, and Education editions',
            house: 'forge',
            type: 'module', // module = presentation + applet + lab
            difficulty: 'beginner',
            duration: 45, // minutes
            topics: ['windows', 'operating-systems', 'licensing'],
            paths: ['aplus-core1'],
            components: {
                presentation: 'houses/forge/presentations/forge-windows-editions.presentation.html',
                applet: 'houses/forge/applets/forge-windows-edition-selector.applet.html',
                lab: 'houses/forge/labs/forge-windows-editions.lab.html'
            },
            prerequisites: [],
            objectives: [
                'Identify the four main Windows editions',
                'Explain key feature differences (BitLocker, domain join)',
                'Recommend appropriate editions for scenarios'
            ]
        },

        'forge-windows-settings': {
            id: 'forge-windows-settings',
            title: 'Windows Settings App',
            description: 'Navigating and configuring the modern Settings interface',
            house: 'forge',
            type: 'module',
            difficulty: 'beginner',
            duration: 40,
            topics: ['windows', 'configuration', 'user-interface'],
            paths: ['aplus-core1'],
            components: {
                presentation: 'houses/forge/presentations/forge-windows-settings.presentation.html',
                applet: 'houses/forge/applets/forge-settings.tool.html',
                lab: 'houses/forge/labs/forge-windows-settings.lab.html'
            },
            prerequisites: ['forge-windows-editions'],
            objectives: [
                'Access Control Panel via multiple methods',
                'Navigate category and icon views',
                'Configure settings not in Settings app'
            ]
        },

        'forge-control-panel': {
            id: 'forge-control-panel',
            title: 'Control Panel',
            description: 'Legacy configuration interface and advanced settings',
            house: 'forge',
            type: 'module',
            difficulty: 'beginner',
            duration: 35,
            topics: ['windows', 'configuration', 'legacy'],
            paths: ['aplus-core1'],
            components: {
                presentation: 'houses/forge/presentations/forge-control-panel.presentation.html',
                applet: 'houses/forge/applets/forge-control-panel.tool.html',
                lab: 'houses/forge/labs/forge-control-panel.lab.html'
            },
            prerequisites: ['forge-control-panel'],
            objectives: [
                'Launch and use common MMC snap-ins',
                'Manage services, events, and disks',
                'Create custom MMC consoles'
            ]
        },

        'forge-admin-tools': {
            id: 'forge-admin-tools',
            title: 'Administrative Tools',
            description: 'MMC consoles and system management utilities',
            house: 'forge',
            type: 'module',
            difficulty: 'intermediate',
            duration: 50,
            topics: ['windows', 'administration', 'mmc'],
            paths: ['aplus-core1'],
            components: {
                presentation: 'houses/forge/presentations/forge-admin-tools.presentation.html',
                applet: 'houses/forge/applets/forge-admin-tools.tool.html',
                lab: 'houses/forge/labs/forge-admin-tools.lab.html'
            },
            prerequisites: ['forge-admin-tools'],
            objectives: [
                'Use Task Manager for process management',
                'Analyze performance with Resource Monitor',
                'Run system diagnostics and repairs'
            ]
        },

        'forge-system-tools': {
            id: 'forge-system-tools',
            title: 'System Tools & Utilities',
            description: 'Task Manager, Resource Monitor, and diagnostic tools',
            house: 'forge',
            type: 'module',
            difficulty: 'intermediate',
            duration: 45,
            topics: ['windows', 'troubleshooting', 'performance'],
            paths: ['aplus-core1'],
            components: {
                presentation: 'houses/forge/presentations/forge-system-tools.presentation.html',
                applet: 'houses/forge/applets/forge-system-tools-sim.applet.html',
                lab: 'houses/forge/labs/forge-system-tools.lab.html'
            },
            prerequisites: ['forge-system-tools'],
            objectives: [
                'Navigate macOS and Linux file systems',
                'Use common command-line utilities',
                'Compare Windows, macOS, and Linux commands'
            ]
        },

        'forge-macos-linux-basics': {
            id: 'forge-macos-linux-basics',
            title: 'macOS & Linux Basics',
            description: 'Operating system fundamentals for macOS and Linux',
            house: 'forge',
            type: 'module',
            difficulty: 'intermediate',
            duration: 60,
            topics: ['macos', 'linux', 'operating-systems', 'command-line'],
            paths: ['aplus-core1'],
            components: {
                presentation: 'houses/forge/presentations/forge-macos-linux-basics.presentation.html',
                applet: 'houses/forge/applets/forge-command-translator.applet.html',
                lab: 'houses/forge/labs/forge-lab-macos-linux.lab.html'
            },
            prerequisites: [],
            objectives: [
                'Identify CPU types and specifications',
                'Understand RAM types and configurations',
                'Compare storage technologies (HDD, SSD, NVMe)',
                'Recognize motherboard components'
            ]
        },

        'forge-hardware-fundamentals': {
            id: 'forge-hardware-fundamentals',
            title: 'Hardware Fundamentals',
            description: 'CPUs, RAM, storage, and core PC components',
            house: 'forge',
            type: 'module',
            difficulty: 'beginner',
            duration: 90,
            topics: ['hardware', 'cpu', 'ram', 'storage', 'motherboard'],
            paths: ['aplus-core1'],
            components: {
                applet: 'houses/forge/applets/hardware/forge-hardware-trainer.applet.html'
            },
            prerequisites: ['forge-hardware-fundamentals'],
            objectives: [
                'Explain RAID levels 0, 1, 5, 6, 10',
                'Calculate storage capacity and fault tolerance',
                'Choose appropriate RAID for scenarios'
            ]
        },

        'forge-storage-raid': {
            id: 'forge-storage-raid',
            title: 'Storage & RAID',
            description: 'Storage devices, RAID levels, and data redundancy',
            house: 'forge',
            type: 'module',
            difficulty: 'intermediate',
            duration: 45,
            topics: ['storage', 'raid', 'hard-drives', 'ssd'],
            paths: ['aplus-core1'],
            components: {
                applet: 'houses/forge/tools/forge-raid-level.tool.html'
            },
            prerequisites: ['forge-hardware-fundamentals'],
            objectives: [
                'Identify expansion card types and slots',
                'Configure display connections and settings',
                'Set up and troubleshoot printers'
            ]
        },

        'forge-peripherals-expansion': {
            id: 'forge-peripherals-expansion',
            title: 'Peripherals & Expansion',
            description: 'Expansion cards, peripherals, and external devices',
            house: 'forge',
            type: 'module',
            difficulty: 'beginner',
            duration: 40,
            topics: ['peripherals', 'expansion-cards', 'displays', 'printers'],
            paths: ['aplus-core1'],
            components: {
                applet: 'houses/forge/applets/hardware/forge-hardware-trainer.applet.html'
            },
            prerequisites: [],
            objectives: [
                'Assess readiness for A+ Core 2 exam',
                'Identify knowledge gaps',
                'Practice exam-style questions'
            ]
        },

        // ─────────────────────────────────────────────────────────────
        // WEB HOUSE - Networking & Connections
        // ─────────────────────────────────────────────────────────────
        'forge-aplus-quiz': {
            id: 'forge-aplus-quiz',
            title: 'A+ Core 2 Practice Quiz',
            description: 'Test your knowledge of A+ Core 2 objectives',
            house: 'forge',
            type: 'quiz',
            difficulty: 'intermediate',
            duration: 15,
            topics: ['assessment', 'certification', 'aplus'],
            paths: ['aplus-core1'],
            components: {
                quiz: 'houses/forge/quizzes/forge-aplus-core2.quiz.html'
            },
            prerequisites: [],
            objectives: [
                'Name and describe all seven OSI layers',
                'Identify protocols at each layer',
                'Troubleshoot using the OSI model'
            ]
        },

        'web-osi-model': {
            id: 'web-osi-model',
            title: 'OSI Model',
            description: 'The seven layers of network communication',
            house: 'web',
            type: 'module',
            difficulty: 'beginner',
            duration: 60,
            topics: ['networking', 'protocols', 'fundamentals'],
            paths: ['comptia-network', 'ccna'],
            components: {
                presentation: 'houses/web/presentations/web-osi-model.presentation.html',
                applet: 'houses/web/tools/web-osi.tool.html',
                quiz: 'houses/web/quizzes/web-osi.quiz.html'
            },
            prerequisites: ['web-osi-model'],
            objectives: [
                'Compare TCP/IP to OSI model',
                'Understand IP addressing basics',
                'Analyze TCP vs UDP'
            ]
        },

        'web-tcpip': {
            id: 'web-tcpip',
            title: 'TCP/IP Model',
            description: 'The practical networking model',
            house: 'web',
            type: 'module',
            difficulty: 'beginner',
            duration: 50,
            topics: ['networking', 'tcp-ip', 'protocols'],
            paths: ['comptia-network', 'ccna'],
            components: {
                presentation: 'houses/web/presentations/web-tcp.presentation.html',
                applet: 'houses/web/tools/web-port.tool.html'
            },
            prerequisites: ['web-tcpip'],
            objectives: [
                'Convert between binary and decimal',
                'Identify IP address classes',
                'Calculate subnet masks and ranges'
            ]
        },

        'web-ip-addressing': {
            id: 'web-ip-addressing',
            title: 'IP Addressing & Subnetting',
            description: 'IPv4 classes, binary conversion, and subnet calculations',
            house: 'web',
            type: 'module',
            difficulty: 'intermediate',
            duration: 90,
            topics: ['ip-addressing', 'subnetting', 'binary'],
            paths: ['comptia-network', 'ccna'],
            components: {
                presentation: 'houses/web/presentations/web-subnetting.presentation.html',
                applet: 'houses/web/tools/web-subnetting.tool.html'
            },
            prerequisites: ['web-ip-addressing'],
            objectives: [
                'Apply VLSM to network designs',
                'Optimize IP address allocation',
                'Solve complex subnetting scenarios'
            ]
        },

        'web-vlsm': {
            id: 'web-vlsm',
            title: 'VLSM & Advanced Subnetting',
            description: 'Variable Length Subnet Masking for efficient IP allocation',
            house: 'web',
            type: 'module',
            difficulty: 'intermediate',
            duration: 60,
            topics: ['vlsm', 'subnetting', 'ip-addressing'],
            paths: ['comptia-network', 'ccna'],
            components: {
                applet: 'houses/web/applets/ip-addressing/vlsm/web-ip-vlsm.applet.html'
            },
            prerequisites: ['web-ip-addressing'],
            objectives: [
                'Understand IPv6 address structure',
                'Configure IPv6 on devices',
                'Compare IPv4 and IPv6'
            ]
        },

        'web-ipv6': {
            id: 'web-ipv6',
            title: 'IPv6 Fundamentals',
            description: 'Next-generation IP addressing and configuration',
            house: 'web',
            type: 'module',
            difficulty: 'intermediate',
            duration: 60,
            topics: ['ipv6', 'addressing', 'networking'],
            paths: ['comptia-network', 'ccna'],
            components: {
                presentation: 'houses/web/presentations/web-ipv6.presentation.html',
                applet: 'houses/web/tools/web-ipv6.tool.html'
            },
            prerequisites: ['web-osi-model'],
            objectives: [
                'Configure VLANs and trunk ports',
                'Understand switch operations',
                'Implement inter-VLAN routing'
            ]
        },

        'web-switching': {
            id: 'web-switching',
            title: 'Switching & VLANs',
            description: 'Layer 2 switching, VLANs, and trunking',
            house: 'web',
            type: 'module',
            difficulty: 'intermediate',
            duration: 75,
            topics: ['switching', 'vlans', 'layer2'],
            paths: ['comptia-network', 'ccna'],
            components: {
                presentation: 'houses/web/presentations/web-vlan.presentation.html',
                applet: 'houses/web/tools/web-vlan.tool.html'
            },
            prerequisites: ['web-switching'],
            objectives: [
                'Explain STP operation and port states',
                'Configure root bridge election',
                'Troubleshoot STP issues'
            ]
        },

        'web-stp': {
            id: 'web-stp',
            title: 'Spanning Tree Protocol',
            description: 'Loop prevention and redundancy in switched networks',
            house: 'web',
            type: 'module',
            difficulty: 'intermediate',
            duration: 60,
            topics: ['stp', 'switching', 'redundancy'],
            paths: ['comptia-network', 'ccna'],
            components: {
                presentation: 'houses/web/presentations/web-stp.presentation.html',
                applet: 'houses/web/tools/web-stp.tool.html'
            },
            prerequisites: ['web-ip-addressing'],
            objectives: [
                'Configure static routes',
                'Understand OSPF and EIGRP basics',
                'Analyze routing tables'
            ]
        },

        'web-routing': {
            id: 'web-routing',
            title: 'Routing Fundamentals',
            description: 'Static and dynamic routing concepts',
            house: 'web',
            type: 'module',
            difficulty: 'intermediate',
            duration: 75,
            topics: ['routing', 'ospf', 'eigrp'],
            paths: ['comptia-network', 'ccna'],
            components: {
                presentation: 'houses/web/presentations/web-ospf.presentation.html',
                applet: 'houses/web/tools/web-ospf-cost.tool.html'
            },
            prerequisites: ['web-routing'],
            objectives: [
                'Compare HSRP, VRRP, and GLBP',
                'Configure first hop redundancy',
                'Design highly available networks'
            ]
        },

        'web-fhrp': {
            id: 'web-fhrp',
            title: 'First Hop Redundancy',
            description: 'HSRP, VRRP, and GLBP for gateway redundancy',
            house: 'web',
            type: 'module',
            difficulty: 'advanced',
            duration: 45,
            topics: ['fhrp', 'hsrp', 'redundancy'],
            paths: ['ccna'],
            components: {
                presentation: 'houses/web/presentations/web-fhrp.presentation.html',
                applet: 'houses/web/tools/web-fhrp.tool.html'
            },
            prerequisites: ['web-osi-model'],
            objectives: [
                'Identify wireless standards and frequencies',
                'Configure wireless security',
                'Design wireless networks'
            ]
        },

        'web-wireless': {
            id: 'web-wireless',
            title: 'Wireless Networking',
            description: 'WiFi standards, security, and architecture',
            house: 'web',
            type: 'module',
            difficulty: 'intermediate',
            duration: 60,
            topics: ['wireless', 'wifi', '802.11'],
            paths: ['comptia-network', 'ccna'],
            components: {
                presentation: 'houses/web/presentations/web-wireless.presentation.html',
                applet: 'houses/web/tools/web-wireless.tool.html'
            },
            prerequisites: ['web-tcpip'],
            objectives: [
                'Configure DHCP and DNS',
                'Understand NAT and PAT',
                'Implement network time services'
            ]
        },

        'web-network-services': {
            id: 'web-network-services',
            title: 'Network Services',
            description: 'DHCP, DNS, NTP, and NAT',
            house: 'web',
            type: 'module',
            difficulty: 'beginner',
            duration: 60,
            topics: ['dhcp', 'dns', 'nat', 'services'],
            paths: ['comptia-network', 'ccna'],
            components: {
                presentation: 'houses/web/presentations/web-dhcp.presentation.html',
                applet: 'houses/web/tools/web-network-services.tool.html'
            },
            prerequisites: ['web-osi-model', 'web-tcpip'],
            objectives: [
                'Apply OSI model to troubleshooting',
                'Use network diagnostic tools',
                'Develop systematic troubleshooting methodology'
            ]
        },

        'web-troubleshooting': {
            id: 'web-troubleshooting',
            title: 'Network Troubleshooting',
            description: 'Systematic approach to diagnosing network issues',
            house: 'web',
            type: 'module',
            difficulty: 'intermediate',
            duration: 60,
            topics: ['troubleshooting', 'diagnostics', 'tools'],
            paths: ['comptia-network'],
            components: {
                presentation: 'houses/web/presentations/web-troubleshooting.presentation.html',
                applet: 'houses/web/tools/web-troubleshooting.tool.html'
            },
            prerequisites: [],
            objectives: [
                'Build virtual network topologies',
                'Configure devices interactively',
                'Test network connectivity'
            ]
        },

        'web-network-simulator': {
            id: 'web-network-simulator',
            title: 'Network Simulator Lab',
            description: 'Interactive packet tracer-style network simulator',
            house: 'web',
            type: 'lab',
            difficulty: 'intermediate',
            duration: 120,
            topics: ['simulation', 'practice', 'hands-on'],
            paths: ['comptia-network', 'ccna'],
            components: {
                applet: 'houses/web/simulators/web-packet-tracer-lite-v3.simulator.html'
            },
            prerequisites: ['web-ip-addressing', 'web-switching', 'web-routing'],
            objectives: [
                'Build enterprise network from scratch',
                'Configure VLANs, STP, OSPF, EIGRP progressively',
                'Implement HSRP, DHCP, ACLs, and SNMP',
                'Integrate multiple technologies in one topology',
                'Troubleshoot complex multi-protocol networks'
            ]
        },

        // ─────────────────────────────────────────────────────────────
        // SHIELD HOUSE - Security & Defense
        // ─────────────────────────────────────────────────────────────
        'web-cumulative-labs': {
            id: 'web-cumulative-labs',
            title: 'Cumulative Lab Series',
            description: 'Progressive hands-on labs building a complete enterprise network',
            house: 'web',
            type: 'lab',
            difficulty: 'advanced',
            duration: 360,
            topics: ['packet-tracer', 'enterprise', 'hands-on', 'routing', 'switching'],
            paths: ['comptia-network', 'ccna'],
            components: {
                lab: 'houses/web/labs/CUMULATIVE_LAB_SERIES.md'
            },
            prerequisites: [],
            objectives: [
                'Define confidentiality, integrity, availability',
                'Apply CIA triad to real scenarios',
                'Identify threats to each pillar'
            ]
        },

        'shield-cia-triad': {
            id: 'shield-cia-triad',
            title: 'CIA Triad',
            description: 'Confidentiality, Integrity, and Availability',
            house: 'shield',
            type: 'module',
            difficulty: 'beginner',
            duration: 40,
            topics: ['security', 'fundamentals', 'principles'],
            paths: ['security-plus'],
            components: {
                presentation: 'houses/shield/presentations/shield-cia-triad.presentation.html',
                applet: 'houses/shield/applets/fundamentals/five_pillars/shield-five-pillars.applet.html'
            },
            prerequisites: [],
            objectives: [
                'Understand the five pillars of information assurance',
                'Identify types of security controls',
                'Apply defense-in-depth principles'
            ]
        },

        'shield-security-fundamentals': {
            id: 'shield-security-fundamentals',
            title: 'Security Fundamentals',
            description: 'Core security concepts: 5 pillars, controls, and frameworks',
            house: 'shield',
            type: 'module',
            difficulty: 'beginner',
            duration: 60,
            topics: ['security', 'fundamentals', 'controls', 'five-pillars'],
            paths: ['security-plus'],
            components: {
                presentation: 'houses/shield/presentations/shield-security.presentation.html',
                applet: 'houses/shield/applets/fundamentals/five_pillars/shield-five-pillars.applet.html'
            },
            prerequisites: ['shield-cia-triad'],
            objectives: [
                'Identify common malware types',
                'Recognize social engineering techniques',
                'Understand threat actor motivations'
            ]
        },

        'shield-threat-types': {
            id: 'shield-threat-types',
            title: 'Threats & Attacks',
            description: 'Common attack vectors, malware types, and threat actors',
            house: 'shield',
            type: 'module',
            difficulty: 'beginner',
            duration: 75,
            topics: ['threats', 'malware', 'attacks', 'vulnerabilities'],
            paths: ['security-plus'],
            components: {
                applet: 'houses/shield/applets/threats/attacks_malware/shield-threat-attacks-malware.applet.html'
            },
            prerequisites: ['shield-threat-types'],
            objectives: [
                'Identify social engineering attack types',
                'Recognize phishing indicators',
                'Apply user awareness training principles'
            ]
        },
        'shield-web-attacks': {
            id: 'shield-web-attacks',
            title: 'Web Application Attacks',
            description: 'XSS, SQL injection, CSRF, and web vulnerabilities',
            house: 'shield',
            type: 'module',
            difficulty: 'intermediate',
            duration: 60,
            topics: ['web-attacks', 'xss', 'sql-injection', 'owasp'],
            paths: ['security-plus'],
            components: {
                applet: 'houses/shield/applets/threats/sql_injection_attack/shield-threat-sql-injection.applet.html'
            },
            prerequisites: ['shield-security-fundamentals'],
            objectives: [
                'Compare symmetric vs asymmetric encryption',
                'Understand hashing and digital signatures',
                'Explain PKI and certificate chains'
            ]
        },

        'shield-cryptography': {
            id: 'shield-cryptography',
            title: 'Cryptography Essentials',
            description: 'Encryption algorithms, hashing, and PKI concepts',
            house: 'shield',
            type: 'module',
            difficulty: 'intermediate',
            duration: 90,
            topics: ['cryptography', 'encryption', 'hashing', 'pki'],
            paths: ['security-plus'],
            components: {
                applet: 'houses/shield/applets/crypto/shield-crypto-symmetric-asymmetric.applet.html'
            },
            prerequisites: ['shield-security-fundamentals'],
            objectives: [
                'Configure firewall rules and policies',
                'Compare IDS vs IPS capabilities',
                'Implement secure network architectures'
            ]
        },

        'shield-network-security': {
            id: 'shield-network-security',
            title: 'Network Security',
            description: 'Firewalls, IDS/IPS, VPNs, and network defense',
            house: 'shield',
            type: 'module',
            difficulty: 'intermediate',
            duration: 75,
            topics: ['network-security', 'firewalls', 'vpn', 'ids-ips'],
            paths: ['security-plus', 'comptia-network'],
            components: {
                applet: 'houses/shield/applets/network/firewalls/shield-firewalls.applet.html'
            },
            prerequisites: ['shield-security-fundamentals'],
            objectives: [
                'Implement multi-factor authentication',
                'Apply role-based access control',
                'Manage identity and access lifecycles'
            ]
        },

        'shield-access-control': {
            id: 'shield-access-control',
            title: 'Access Control',
            description: 'Authentication, authorization, and identity management',
            house: 'shield',
            type: 'module',
            difficulty: 'intermediate',
            duration: 50,
            topics: ['access-control', 'authentication', 'authorization'],
            paths: ['security-plus'],
            components: {
                applet: 'houses/shield/applets/access/access_control/shield-access-control.applet.html'
            },
            prerequisites: ['shield-security-fundamentals'],
            objectives: [
                'Conduct risk assessments',
                'Calculate risk using quantitative methods',
                'Develop risk mitigation strategies'
            ]
        },

        'shield-risk-management': {
            id: 'shield-risk-management',
            title: 'Risk Management',
            description: 'Risk assessment, analysis, and mitigation strategies',
            house: 'shield',
            type: 'module',
            difficulty: 'intermediate',
            duration: 60,
            topics: ['risk-management', 'risk-analysis', 'compliance'],
            paths: ['security-plus'],
            components: {
                applet: 'houses/shield/applets/risk/risk_management/shield-risk-management.applet.html'
            },
            prerequisites: [],
            objectives: [
                'Understand CIA Triad and threat landscape',
                'Apply OSI model and network protocols',
                'Use encryption, hashing, and access controls',
                'Perform network scanning with Nmap and Wireshark',
                'Execute password cracking techniques ethically'
            ]
        },

        // ─────────────────────────────────────────────────────────────
        // CLOUD HOUSE - Infrastructure & Scale
        // ─────────────────────────────────────────────────────────────

        // --- Cloud Fundamentals ---
        'shield-cyber-arts-bootcamp': {
            id: 'shield-cyber-arts-bootcamp',
            title: 'Cyber Arts Bootcamp',
            description: '5-day intensive: Foundations, Networking, Cryptography, Blue Team, Red Team',
            house: 'shield',
            type: 'module',
            difficulty: 'beginner',
            duration: 300,
            topics: ['security', 'networking', 'cryptography', 'blue-team', 'red-team', 'bootcamp'],
            paths: ['security-plus'],
            components: {
                applet: 'houses/shield/applets/operations/shield-cyber-arts-bootcamp.applet.html'
            },
            prerequisites: [],
            objectives: [
                'Differentiate IaaS, PaaS, and SaaS',
                'Explain public, private, hybrid clouds',
                'Identify cloud benefits and considerations'
            ]
        },

        // EC-Council CSE Modules - Added during ISSUE-009 fix (Dec 29, 2025)
        'cse-06-monitoring': {
            id: 'cse-06-monitoring',
            title: 'CSE: Security Monitoring & IR',
            description: 'Cloud logging, SIEM/SOAR, CSPM, and incident response workflows',
            house: 'shield',
            type: 'module',
            difficulty: 'intermediate',
            duration: 45,
            topics: ['monitoring', 'siem', 'incident-response', 'cloud-security'],
            paths: ['cse'],
            components: {
                presentation: 'houses/shield/presentations/shield-cse-06-security-monitoring-incident-response.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'cse-07-risk': {
            id: 'cse-07-risk',
            title: 'CSE: Risk Assessment & Management',
            description: 'Cloud risk categories, NIST RMF, controls, and risk response strategies',
            house: 'shield',
            type: 'module',
            difficulty: 'intermediate',
            duration: 45,
            topics: ['risk-management', 'nist', 'controls', 'cloud-security'],
            paths: ['cse'],
            components: {
                presentation: 'houses/shield/presentations/shield-cse-07-risk-assessment-management.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'cse-08-compliance': {
            id: 'cse-08-compliance',
            title: 'CSE: Compliance & Governance',
            description: 'GDPR, HIPAA, PCI-DSS, SOX, NIST CSF, and cloud compliance tools',
            house: 'shield',
            type: 'module',
            difficulty: 'intermediate',
            duration: 45,
            topics: ['compliance', 'governance', 'gdpr', 'hipaa', 'pci-dss'],
            paths: ['cse'],
            components: {
                presentation: 'houses/shield/presentations/shield-cse-08-compliance-governance.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'cse-06-quiz': {
            id: 'cse-06-quiz',
            title: 'CSE: Security Monitoring Quiz',
            description: 'Test SIEM, SOAR, and IR knowledge',
            house: 'shield',
            type: 'quiz',
            difficulty: 'intermediate',
            duration: 15,
            topics: ['monitoring', 'siem', 'incident-response'],
            paths: ['cse'],
            components: {
                quiz: 'houses/shield/quizzes/shield-cse-06.quiz.html'
            },
            prerequisites: ['cse-06-monitoring'],
            objectives: []
        },
        'cse-07-quiz': {
            id: 'cse-07-quiz',
            title: 'CSE: Risk Management Quiz',
            description: 'Test risk assessment and NIST RMF knowledge',
            house: 'shield',
            type: 'quiz',
            difficulty: 'intermediate',
            duration: 15,
            topics: ['risk-management', 'nist'],
            paths: ['cse'],
            components: {
                quiz: 'houses/shield/quizzes/shield-cse-07.quiz.html'
            },
            prerequisites: ['cse-07-risk'],
            objectives: []
        },
        'cse-08-quiz': {
            id: 'cse-08-quiz',
            title: 'CSE: Compliance Quiz',
            description: 'Test GDPR, HIPAA, PCI-DSS compliance knowledge',
            house: 'shield',
            type: 'quiz',
            difficulty: 'intermediate',
            duration: 15,
            topics: ['compliance', 'governance'],
            paths: ['cse'],
            components: {
                quiz: 'houses/shield/quizzes/shield-cse-08.quiz.html'
            },
            prerequisites: ['cse-08-compliance'],
            objectives: []
        },

        'cloud-concepts': {
            id: 'cloud-concepts',
            title: 'Cloud Computing Concepts',
            description: 'IaaS, PaaS, SaaS and deployment models',
            house: 'cloud',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['cloud', 'fundamentals', 'service-models'],
            paths: ['aws-ccp', 'azure-fundamentals'],
            components: {
                presentation: 'houses/cloud/presentations/cloud-cloud.presentation.html',
                applet: 'houses/cloud/tools/cloud-cloud.tool.html',
                lab: 'houses/cloud/labs/cloud-lab.lab.html'
            },
            prerequisites: ['cloud-concepts'],
            objectives: [
                'Compare cloud service models',
                'Understand shared responsibility model',
                'Match services to appropriate model'
            ]
        },

        'cloud-models': {
            id: 'cloud-models',
            title: 'Cloud Service Models',
            description: 'Deep dive into IaaS, PaaS, SaaS, and shared responsibility',
            house: 'cloud',
            type: 'module',
            difficulty: 'beginner',
            duration: 40,
            topics: ['cloud', 'service-models', 'shared-responsibility'],
            paths: ['aws-ccp', 'azure-fundamentals'],
            components: {
                applet: 'houses/cloud/tools/cloud-ch01-cloud-models.tool.html',
                quiz: 'houses/cloud/quizzes/cloud-ch01-cloud-fundamentals.quiz.html'
            },
            prerequisites: ['cloud-concepts'],
            objectives: [
                'Compare major cloud providers',
                'Identify equivalent services across platforms',
                'Understand pricing models'
            ]
        },

        'cloud-providers': {
            id: 'cloud-providers',
            title: 'Cloud Provider Comparison',
            description: 'Compare AWS, Azure, and GCP services and pricing',
            house: 'cloud',
            type: 'tool',
            difficulty: 'beginner',
            duration: 30,
            topics: ['aws', 'azure', 'gcp', 'comparison'],
            paths: ['aws-ccp', 'azure-fundamentals'],
            components: {
                applet: 'houses/cloud/applets/fundamentals/cloud-provider-comparison.applet.html'
            },
            prerequisites: ['cloud-models'],
            objectives: [
                'Design basic cloud architectures',
                'Apply well-architected principles',
                'Select appropriate services for requirements'
            ]
        },

        // --- AWS Fundamentals ---
        'cloud-architecture': {
            id: 'cloud-architecture',
            title: 'Cloud Architecture Designer',
            description: 'Design cloud architectures with best practices',
            house: 'cloud',
            type: 'tool',
            difficulty: 'intermediate',
            duration: 60,
            topics: ['architecture', 'design', 'best-practices'],
            paths: ['aws-ccp'],
            components: {
                applet: 'houses/cloud/applets/architecture/cloud-architecture-designer.applet.html'
            },
            prerequisites: ['cloud-concepts'],
            objectives: [
                'Navigate AWS account structure',
                'Understand AWS Organizations',
                'Manage billing and cost explorer'
            ]
        },

        'cloud-aws-account': {
            id: 'cloud-aws-account',
            title: 'AWS Account Structure',
            description: 'AWS accounts, organizations, and billing',
            house: 'cloud',
            type: 'module',
            difficulty: 'beginner',
            duration: 35,
            topics: ['aws', 'account', 'billing', 'organizations'],
            paths: ['aws-ccp'],
            components: {
                presentation: 'houses/cloud/presentations/cloud-aws-fundamentals.presentation.html',
                applet: 'houses/cloud/tools/cloud-ch02-aws-account.tool.html'
            },
            prerequisites: ['cloud-aws-account'],
            objectives: [
                'Compare AWS support plans',
                'Understand Trusted Advisor checks',
                'Choose appropriate support level'
            ]
        },

        'cloud-aws-support': {
            id: 'cloud-aws-support',
            title: 'AWS Support Plans',
            description: 'AWS support tiers and Trusted Advisor',
            house: 'cloud',
            type: 'module',
            difficulty: 'beginner',
            duration: 25,
            topics: ['aws', 'support', 'trusted-advisor'],
            paths: ['aws-ccp'],
            components: {
                applet: 'houses/cloud/tools/cloud-ch03-support-plans.tool.html'
            },
            prerequisites: ['cloud-aws-account'],
            objectives: [
                'Understand AWS global infrastructure',
                'Select appropriate regions',
                'Explain high availability concepts'
            ]
        },

        'cloud-aws-regions': {
            id: 'cloud-aws-regions',
            title: 'AWS Global Infrastructure',
            description: 'Regions, Availability Zones, and Edge Locations',
            house: 'cloud',
            type: 'module',
            difficulty: 'beginner',
            duration: 30,
            topics: ['aws', 'regions', 'availability-zones', 'edge'],
            paths: ['aws-ccp'],
            components: {
                applet: 'houses/cloud/tools/cloud-ch04-aws-regions.tool.html'
            },
            prerequisites: ['cloud-aws-account'],
            objectives: [
                'Create and manage IAM users and roles',
                'Write IAM policies',
                'Apply security best practices'
            ]
        },

        'cloud-aws-security': {
            id: 'cloud-aws-security',
            title: 'AWS IAM & Security',
            description: 'Identity and Access Management fundamentals',
            house: 'cloud',
            type: 'module',
            difficulty: 'intermediate',
            duration: 50,
            topics: ['aws', 'iam', 'security', 'policies'],
            paths: ['aws-ccp'],
            components: {
                applet: 'houses/cloud/tools/cloud-ch05-security.tool.html',
                quiz: 'houses/cloud/quizzes/cloud-ch05-iam-security.quiz.html'
            },
            prerequisites: ['cloud-aws-account'],
            objectives: [
                'Use AWS Management Console',
                'Execute AWS CLI commands',
                'Understand SDK options'
            ]
        },

        // --- AWS Compute ---
        'cloud-aws-tools': {
            id: 'cloud-aws-tools',
            title: 'AWS Management Tools',
            description: 'Console, CLI, SDK, and CloudShell',
            house: 'cloud',
            type: 'module',
            difficulty: 'beginner',
            duration: 30,
            topics: ['aws', 'cli', 'sdk', 'management'],
            paths: ['aws-ccp'],
            components: {
                applet: 'houses/cloud/tools/cloud-ch06-aws-tools.tool.html'
            },
            prerequisites: ['cloud-aws-security'],
            objectives: [
                'Compare EC2 instance types',
                'Understand serverless with Lambda',
                'Choose appropriate compute service'
            ]
        },

        'cloud-aws-compute': {
            id: 'cloud-aws-compute',
            title: 'AWS Compute Services',
            description: 'EC2, Lambda, ECS, and compute options',
            house: 'cloud',
            type: 'module',
            difficulty: 'intermediate',
            duration: 60,
            topics: ['aws', 'ec2', 'lambda', 'compute'],
            paths: ['aws-ccp'],
            components: {
                applet: 'houses/cloud/tools/cloud-ch07-compute-services.tool.html'
            },
            prerequisites: ['cloud-aws-compute'],
            objectives: [
                'Select appropriate instance types',
                'Understand EC2 pricing models',
                'Configure instance settings'
            ]
        },

        // --- AWS Storage ---
        'cloud-aws-ec2': {
            id: 'cloud-aws-ec2',
            title: 'EC2 Instance Types',
            description: 'EC2 families, pricing, and configuration',
            house: 'cloud',
            type: 'module',
            difficulty: 'intermediate',
            duration: 45,
            topics: ['aws', 'ec2', 'instances', 'pricing'],
            paths: ['aws-ccp'],
            components: {
                applet: 'houses/cloud/tools/cloud-ch07-ec2-instance.tool.html'
            },
            prerequisites: ['cloud-aws-compute'],
            objectives: [
                'Compare S3 storage classes',
                'Understand block vs object storage',
                'Choose appropriate storage service'
            ]
        },

        // --- AWS Database ---
        'cloud-aws-storage': {
            id: 'cloud-aws-storage',
            title: 'AWS Storage Services',
            description: 'S3, EBS, EFS, and storage options',
            house: 'cloud',
            type: 'module',
            difficulty: 'intermediate',
            duration: 55,
            topics: ['aws', 's3', 'ebs', 'storage'],
            paths: ['aws-ccp'],
            components: {
                applet: 'houses/cloud/tools/cloud-ch08-storage-services.tool.html',
                quiz: 'houses/cloud/quizzes/cloud-ch08-storage.quiz.html'
            },
            prerequisites: ['cloud-aws-storage'],
            objectives: [
                'Compare RDS database engines',
                'Understand DynamoDB for NoSQL',
                'Select appropriate database service'
            ]
        },

        // --- AWS Networking ---
        'cloud-aws-database': {
            id: 'cloud-aws-database',
            title: 'AWS Database Services',
            description: 'RDS, DynamoDB, and database options',
            house: 'cloud',
            type: 'module',
            difficulty: 'intermediate',
            duration: 50,
            topics: ['aws', 'rds', 'dynamodb', 'database'],
            paths: ['aws-ccp'],
            components: {
                applet: 'houses/cloud/tools/cloud-ch09-database-services.tool.html',
                quiz: 'houses/cloud/quizzes/cloud-ch09-database.quiz.html'
            },
            prerequisites: ['cloud-aws-security'],
            objectives: [
                'Design VPC architecture',
                'Configure subnets and route tables',
                'Implement security groups and NACLs'
            ]
        },

        // --- AWS Advanced ---
        'cloud-aws-networking': {
            id: 'cloud-aws-networking',
            title: 'AWS VPC Networking',
            description: 'VPC, subnets, security groups, and network design',
            house: 'cloud',
            type: 'module',
            difficulty: 'intermediate',
            duration: 60,
            topics: ['aws', 'vpc', 'networking', 'security-groups'],
            paths: ['aws-ccp'],
            components: {
                applet: 'houses/cloud/tools/cloud-ch10-vpc-networking.tool.html',
                quiz: 'houses/cloud/quizzes/cloud-ch10-networking.quiz.html'
            },
            prerequisites: ['cloud-aws-compute'],
            objectives: [
                'Create CloudFormation templates',
                'Deploy with Elastic Beanstalk',
                'Apply infrastructure as code'
            ]
        },

        'cloud-aws-automation': {
            id: 'cloud-aws-automation',
            title: 'AWS Automation',
            description: 'CloudFormation, Elastic Beanstalk, and IaC',
            house: 'cloud',
            type: 'module',
            difficulty: 'advanced',
            duration: 45,
            topics: ['aws', 'cloudformation', 'automation', 'iac'],
            paths: ['aws-ccp', 'devops-fundamentals'],
            components: {
                applet: 'houses/cloud/tools/cloud-ch11-automation.tool.html'
            },
            prerequisites: [],
            objectives: [
                'Navigate AWS service categories',
                'Understand service purposes',
                'Find appropriate services for use cases'
            ]
        },

        'cloud-aws-services': {
            id: 'cloud-aws-services',
            title: 'AWS Service Explorer',
            description: 'Comprehensive AWS service catalog',
            house: 'cloud',
            type: 'tool',
            difficulty: 'beginner',
            duration: 30,
            topics: ['aws', 'services', 'catalog'],
            paths: ['aws-ccp'],
            components: {
                applet: 'houses/cloud/tools/cloud-aws-service.tool.html'
            },
            prerequisites: ['cloud-aws-networking'],
            objectives: [
                'Apply AWS to real scenarios',
                'Design solutions for requirements',
                'Understand migration strategies'
            ]
        },

        'cloud-aws-use-cases': {
            id: 'cloud-aws-use-cases',
            title: 'AWS Use Cases',
            description: 'Real-world AWS architecture patterns',
            house: 'cloud',
            type: 'module',
            difficulty: 'intermediate',
            duration: 40,
            topics: ['aws', 'architecture', 'patterns', 'use-cases'],
            paths: ['aws-ccp'],
            components: {
                applet: 'houses/cloud/tools/cloud-ch12-use-cases.tool.html'
            },
            prerequisites: ['cloud-aws-use-cases'],
            objectives: [
                'Assess AWS CCP readiness',
                'Identify knowledge gaps',
                'Practice exam-style questions'
            ]
        },

        // --- Azure ---
        'cloud-aws-practitioner': {
            id: 'cloud-aws-practitioner',
            title: 'AWS CCP Final Assessment',
            description: 'Comprehensive Cloud Practitioner practice exam',
            house: 'cloud',
            type: 'quiz',
            difficulty: 'intermediate',
            duration: 60,
            topics: ['aws', 'certification', 'assessment'],
            paths: ['aws-ccp'],
            components: {
                quiz: 'houses/cloud/quizzes/cloud-ch12-aws-practitioner-final.quiz.html'
            },
            prerequisites: ['cloud-concepts'],
            objectives: [
                'Navigate Azure portal',
                'Understand Azure service categories',
                'Compare Azure to AWS'
            ]
        },

        // ─────────────────────────────────────────────────────────────
        // KEY HOUSE - Cryptography & Secrets
        // ─────────────────────────────────────────────────────────────
        'cloud-azure-fundamentals': {
            id: 'cloud-azure-fundamentals',
            title: 'Azure Fundamentals',
            description: 'Microsoft Azure cloud platform basics',
            house: 'cloud',
            type: 'module',
            difficulty: 'beginner',
            duration: 60,
            topics: ['azure', 'fundamentals', 'microsoft'],
            paths: ['azure-fundamentals'],
            components: {
                presentation: 'houses/cloud/presentations/cloud-azure-fundamentals.presentation.html'
            },
            prerequisites: [],
            objectives: [
                'Explain symmetric vs asymmetric encryption',
                'Identify common algorithms (AES, RSA)',
                'Understand key exchange concepts'
            ]
        },

        // ─────────────────────────────────────────────────────────────
        // SCRIPT HOUSE - Automation & Efficiency
        // ─────────────────────────────────────────────────────────────

        // --- Linux Fundamentals ---
        'key-encryption-basics': {
            id: 'key-encryption-basics',
            title: 'Encryption Fundamentals',
            description: 'Symmetric and asymmetric encryption',
            house: 'key',
            type: 'module',
            difficulty: 'beginner',
            duration: 50,
            topics: ['cryptography', 'encryption', 'security'],
            paths: ['security-plus', 'cryptography-track'],
            components: {
                presentation: 'houses/key/presentations/key-encryption-basics.presentation.html',
                applet: 'houses/key/tools/key-aes.tool.html',
                lab: 'houses/key/labs/key-aes.lab.html'
            },
            prerequisites: [],
            objectives: [
                'Navigate the Linux file system',
                'Execute essential Linux commands',
                'Understand shell basics'
            ]
        },

        'script-linux-basics': {
            id: 'script-linux-basics',
            title: 'Linux Command Line Basics',
            description: 'Essential Linux commands and navigation',
            house: 'script',
            type: 'module',
            difficulty: 'beginner',
            duration: 60,
            topics: ['linux', 'command-line', 'fundamentals'],
            paths: ['comptia-linux', 'devops-fundamentals'],
            components: {
                presentation: 'houses/script/presentations/script-macos-linux-basics.presentation.html',
                applet: 'houses/script/tools/script-linux-command.tool.html',
                lab: 'houses/script/applets/linux/script-lab-macos-linux.applet.html'
            },
            prerequisites: ['script-linux-basics'],
            objectives: [
                'Navigate Linux directory hierarchy',
                'Understand FHS structure',
                'Manage files and directories'
            ]
        },

        'script-linux-filesystem': {
            id: 'script-linux-filesystem',
            title: 'Linux File System',
            description: 'Understanding Linux directory structure and file management',
            house: 'script',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['linux', 'filesystem', 'directories'],
            paths: ['comptia-linux'],
            components: {
                applet: 'houses/script/applets/linux/script-linux-filesystem-navigator.applet.html'
            },
            prerequisites: ['script-linux-filesystem'],
            objectives: [
                'Understand rwx permissions',
                'Calculate octal permission values',
                'Apply chmod and chown commands'
            ]
        },

        // --- Linux Interactive Labs (L-Series) ---
        'script-linux-permissions': {
            id: 'script-linux-permissions',
            title: 'Linux Permissions',
            description: 'File ownership, permissions, and access control',
            house: 'script',
            type: 'module',
            difficulty: 'intermediate',
            duration: 50,
            topics: ['linux', 'permissions', 'security', 'chmod'],
            paths: ['comptia-linux'],
            components: {
                applet: 'houses/script/tools/script-linux-permissions.tool.html'
            },
            prerequisites: [],
            objectives: [
                'Use whoami to display your username',
                'Use id to view UID, GID, and group memberships',
                'Use groups to list your group memberships'
            ]
        },

        'script-linux-lab-001': {
            id: 'script-linux-lab-001',
            title: 'L-001: User Identity',
            description: 'Learn to identify your user and group memberships in Linux',
            house: 'script',
            type: 'lab',
            difficulty: 'beginner',
            duration: 15,
            topics: ['linux', 'user-identity', 'whoami', 'id', 'groups', 'fundamentals'],
            paths: ['comptia-linux'],
            components: {
                lab: 'houses/script/applets/linux/script-linux-lab-001-user-identity.applet.html'
            },
            prerequisites: ['script-linux-lab-001'],
            objectives: [
                'Use pwd to display current directory',
                'Use ls to list directory contents',
                'Use cd to navigate between directories',
                'Understand hidden files with ls -la'
            ]
        },

        // --- Command Line Hacker Series (CLH) ---
        'script-linux-lab-002': {
            id: 'script-linux-lab-002',
            title: 'L-002: File Navigation',
            description: 'Navigate the Linux filesystem with pwd, ls, and cd',
            house: 'script',
            type: 'lab',
            difficulty: 'beginner',
            duration: 15,
            topics: ['linux', 'navigation', 'pwd', 'ls', 'cd', 'filesystem', 'fundamentals'],
            paths: ['comptia-linux'],
            components: {
                lab: 'houses/script/applets/linux/script-linux-lab-002-file-navigation.applet.html'
            },
            prerequisites: [],
            objectives: [
                'Identify your operator identity with whoami',
                'Locate your position in the filesystem with pwd',
                'Identify the target system with hostname',
                'Survey your environment with ls'
            ]
        },

        'script-clh-001': {
            id: 'script-clh-001',
            title: 'CLH-001: Introduction to Hacker CLI',
            description: 'Begin your journey as a command line operator with reconnaissance basics',
            house: 'script',
            type: 'lab',
            difficulty: 'beginner',
            duration: 20,
            topics: ['linux', 'hacking', 'reconnaissance', 'whoami', 'pwd', 'hostname', 'cli'],
            paths: ['comptia-linux', 'linux-mastery'],
            components: {
                presentation: 'houses/script/courses/clh/modules/clh-001/script-intro.module.html',
                lab: 'houses/script/labs/script-lab.lab.html',
                quiz: 'houses/script/quizzes/script-quiz.quiz.html'
            },
            prerequisites: [],
            objectives: [
                'Navigate directory structures with cd',
                'Perform deep scans with ls -la',
                'Extract intel from files with cat',
                'Return to base operations'
            ]
        },

        'script-clh-002': {
            id: 'script-clh-002',
            title: 'CLH-002: Navigation & Reconnaissance',
            description: 'Navigate filesystems and extract intel from target directories',
            house: 'script',
            type: 'lab',
            difficulty: 'beginner',
            duration: 25,
            topics: ['linux', 'hacking', 'navigation', 'reconnaissance', 'cd', 'cat', 'ls'],
            paths: ['comptia-linux', 'linux-mastery'],
            components: {
                presentation: 'houses/script/courses/clh/modules/clh-002/script-intro.module.html',
                lab: 'houses/script/courses/clh/modules/clh-002/script-lab.lab.html',
                quiz: 'houses/script/courses/clh/modules/clh-002/script-quiz.quiz.html'
            },
            prerequisites: [],
            objectives: [
                'Use grep to search file contents',
                'Extract hidden codes from text files',
                'Use grep options (-i, -n, -c)',
                'Document findings with line numbers'
            ]
        },

        'script-clh-003': {
            id: 'script-clh-003',
            title: 'CLH-003: Pattern Hunting',
            description: 'Hunt for hidden codes using grep and pattern matching',
            house: 'script',
            type: 'lab',
            difficulty: 'intermediate',
            duration: 30,
            topics: ['linux', 'hacking', 'grep', 'regex', 'pattern-matching', 'forensics'],
            paths: ['comptia-linux', 'linux-mastery'],
            components: {
                presentation: 'houses/script/courses/clh/modules/clh-003/script-intro.module.html',
                lab: 'houses/script/courses/clh/modules/clh-003/script-lab.lab.html',
                quiz: 'houses/script/courses/clh/modules/clh-003/script-quiz.quiz.html'
            },
            prerequisites: [],
            objectives: [
                'Analyze process snapshots',
                'Identify anomalous resource usage',
                'Hunt for unknown processes',
                'Document threat indicators'
            ]
        },

        'script-clh-004': {
            id: 'script-clh-004',
            title: 'CLH-004: Process Investigation',
            description: 'Identify malicious processes hiding among legitimate system processes',
            house: 'script',
            type: 'lab',
            difficulty: 'intermediate',
            duration: 30,
            topics: ['linux', 'hacking', 'processes', 'investigation', 'grep', 'malware'],
            paths: ['comptia-linux', 'linux-mastery'],
            components: {
                presentation: 'houses/script/courses/clh/modules/clh-004/script-intro.module.html',
                lab: 'houses/script/courses/clh/modules/clh-004/script-lab.lab.html',
                quiz: 'houses/script/courses/clh/modules/clh-004/script-quiz.quiz.html'
            },
            prerequisites: [],
            objectives: [
                'Navigate log directories',
                'Use head/tail for log preview',
                'Search for error patterns with grep',
                'Count and document error frequency'
            ]
        },

        'script-clh-005': {
            id: 'script-clh-005',
            title: 'CLH-005: Log Analysis',
            description: 'Analyze system logs to identify error patterns and anomalies',
            house: 'script',
            type: 'lab',
            difficulty: 'intermediate',
            duration: 35,
            topics: ['linux', 'hacking', 'logs', 'forensics', 'grep', 'head', 'tail'],
            paths: ['comptia-linux', 'linux-mastery'],
            components: {
                presentation: 'houses/script/courses/clh/modules/clh-005/script-intro.module.html',
                lab: 'houses/script/courses/clh/modules/clh-005/script-lab.lab.html',
                quiz: 'houses/script/courses/clh/modules/clh-005/script-quiz.quiz.html'
            },
            prerequisites: [],
            objectives: [
                'Create directories with mkdir',
                'Create files with touch',
                'Copy intel with cp',
                'Move and rename with mv',
                'Secure delete with rm'
            ]
        },

        'script-clh-006': {
            id: 'script-clh-006',
            title: 'CLH-006: File Operations',
            description: 'Master file creation, copying, moving, and deletion in the field',
            house: 'script',
            type: 'lab',
            difficulty: 'intermediate',
            duration: 30,
            topics: ['linux', 'hacking', 'files', 'mkdir', 'touch', 'cp', 'mv', 'rm'],
            paths: ['comptia-linux', 'linux-mastery'],
            components: {
                presentation: 'houses/script/courses/clh/modules/clh-006/script-intro.module.html',
                lab: 'houses/script/courses/clh/modules/clh-006/script-lab.lab.html',
                quiz: 'houses/script/courses/clh/modules/clh-006/script-quiz.quiz.html'
            },
            prerequisites: [],
            objectives: [
                'Analyze file permissions with ls -la',
                'Decode permission bits (rwx)',
                'Modify permissions with chmod',
                'Understand permission security'
            ]
        },

        'script-clh-007': {
            id: 'script-clh-007',
            title: 'CLH-007: Permissions & Access Control',
            description: 'Decode permission matrices and secure sensitive files',
            house: 'script',
            type: 'lab',
            difficulty: 'intermediate',
            duration: 35,
            topics: ['linux', 'hacking', 'permissions', 'chmod', 'security', 'access-control'],
            paths: ['comptia-linux', 'linux-mastery'],
            components: {
                presentation: 'houses/script/courses/clh/modules/clh-007/script-intro.module.html',
                lab: 'houses/script/courses/clh/modules/clh-007/script-lab.lab.html',
                quiz: 'houses/script/courses/clh/modules/clh-007/script-quiz.quiz.html'
            },
            prerequisites: [],
            objectives: [
                'Examine shell script structure',
                'Run scripts with bash command',
                'Understand shebang and execution',
                'Analyze automation scripts'
            ]
        },

        'script-clh-008': {
            id: 'script-clh-008',
            title: 'CLH-008: Shell Scripting Basics',
            description: 'Write and execute shell scripts for automated operations',
            house: 'script',
            type: 'lab',
            difficulty: 'intermediate',
            duration: 40,
            topics: ['linux', 'hacking', 'bash', 'scripting', 'automation'],
            paths: ['comptia-linux', 'linux-mastery'],
            components: {
                presentation: 'houses/script/courses/clh/modules/clh-008/script-intro.module.html',
                lab: 'houses/script/courses/clh/modules/clh-008/script-lab.lab.html',
                quiz: 'houses/script/courses/clh/modules/clh-008/script-quiz.quiz.html'
            },
            prerequisites: [],
            objectives: [
                'Extract columns with cut',
                'Sort and deduplicate data',
                'Parse fields with awk',
                'Transform text with sed'
            ]
        },

        'script-clh-009': {
            id: 'script-clh-009',
            title: 'CLH-009: Text Processing',
            description: 'Extract and transform data using cut, sort, uniq, awk, and sed',
            house: 'script',
            type: 'lab',
            difficulty: 'intermediate',
            duration: 40,
            topics: ['linux', 'hacking', 'text-processing', 'cut', 'sort', 'uniq', 'awk', 'sed'],
            paths: ['comptia-linux', 'linux-mastery'],
            components: {
                presentation: 'houses/script/courses/clh/modules/clh-009/script-intro.module.html',
                lab: 'houses/script/courses/clh/modules/clh-009/script-lab.lab.html',
                quiz: 'houses/script/courses/clh/modules/clh-009/script-quiz.quiz.html'
            },
            prerequisites: [],
            objectives: [
                'Redirect output to files',
                'Append data with >>',
                'Chain commands with pipes',
                'Split output with tee'
            ]
        },

        'script-clh-010': {
            id: 'script-clh-010',
            title: 'CLH-010: I/O Redirection',
            description: 'Control data streams with redirects, pipes, and tee',
            house: 'script',
            type: 'lab',
            difficulty: 'intermediate',
            duration: 35,
            topics: ['linux', 'hacking', 'io', 'redirection', 'pipes', 'tee'],
            paths: ['comptia-linux', 'linux-mastery'],
            components: {
                presentation: 'houses/script/courses/clh/modules/clh-010/script-intro.module.html',
                lab: 'houses/script/courses/clh/modules/clh-010/script-lab.lab.html',
                quiz: 'houses/script/courses/clh/modules/clh-010/script-quiz.quiz.html'
            },
            prerequisites: [],
            objectives: [
                'Use grep flags (-i, -v, -c, -n, -r)',
                'Write basic regex patterns',
                'Match complex patterns with extended regex',
                'Hunt for specific data in logs'
            ]
        },

        'script-clh-011': {
            id: 'script-clh-011',
            title: 'CLH-011: Advanced Grep & Regex',
            description: 'Hunt patterns with grep flags and regular expressions',
            house: 'script',
            type: 'lab',
            difficulty: 'intermediate',
            duration: 45,
            topics: ['linux', 'hacking', 'grep', 'regex', 'pattern-matching'],
            paths: ['comptia-linux', 'linux-mastery'],
            components: {
                presentation: 'houses/script/courses/clh/modules/clh-011/script-intro.module.html',
                lab: 'houses/script/courses/clh/modules/clh-011/script-lab.lab.html',
                quiz: 'houses/script/courses/clh/modules/clh-011/script-quiz.quiz.html'
            },
            prerequisites: [],
            objectives: [
                'Find equivalent commands across OSes',
                'Understand command syntax differences',
                'Work effectively in multi-platform environments'
            ]
        },

        'script-clh-012': {
            id: 'script-clh-012',
            title: 'CLH-012: Network Basics',
            description: 'Probe network connectivity with ping, netstat, ss, and ip commands',
            house: 'script',
            type: 'lab',
            difficulty: 'intermediate',
            duration: 45,
            topics: ['linux', 'hacking', 'networking', 'ping', 'netstat', 'ss', 'ip'],
            paths: ['comptia-linux', 'linux-mastery'],
            components: {
                presentation: 'houses/script/courses/clh/modules/clh-012/script-intro.module.html',
                lab: 'houses/script/courses/clh/modules/clh-012/script-lab.lab.html',
                quiz: 'houses/script/courses/clh/modules/clh-012/script-quiz.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },

        'script-clh-013': {
            id: 'script-clh-013',
            title: 'CLH-013: Environment Variables',
            description: 'Master shell environment with env, export, and PATH manipulation',
            house: 'script',
            type: 'lab',
            difficulty: 'intermediate',
            duration: 45,
            topics: ['linux', 'hacking', 'environment', 'env', 'export', 'PATH'],
            paths: ['comptia-linux', 'linux-mastery'],
            components: {
                presentation: 'houses/script/courses/clh/modules/clh-013/script-intro.module.html',
                lab: 'houses/script/courses/clh/modules/clh-013/script-lab.lab.html',
                quiz: 'houses/script/courses/clh/modules/clh-013/script-quiz.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },

        'script-clh-014': {
            id: 'script-clh-014',
            title: 'CLH-014: Process Control',
            description: 'Manage processes with ps, kill, jobs, bg, fg, and nohup',
            house: 'script',
            type: 'lab',
            difficulty: 'intermediate',
            duration: 45,
            topics: ['linux', 'hacking', 'processes', 'ps', 'kill', 'jobs', 'nohup'],
            paths: ['comptia-linux', 'linux-mastery'],
            components: {
                presentation: 'houses/script/courses/clh/modules/clh-014/script-intro.module.html',
                lab: 'houses/script/courses/clh/modules/clh-014/script-lab.lab.html',
                quiz: 'houses/script/courses/clh/modules/clh-014/script-quiz.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },

        'script-clh-015': {
            id: 'script-clh-015',
            title: 'CLH-015: Capstone Mission',
            description: 'Final investigation — apply all skills and earn CLI Engineer certification',
            house: 'script',
            type: 'lab',
            difficulty: 'intermediate',
            duration: 45,
            topics: ['linux', 'hacking', 'capstone', 'certification'],
            paths: ['comptia-linux', 'linux-mastery'],
            components: {
                presentation: 'houses/script/courses/clh/modules/clh-015/script-intro.module.html',
                lab: 'houses/script/courses/clh/modules/clh-015/script-lab.lab.html',
                quiz: 'houses/script/courses/clh/modules/clh-015/script-quiz.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },

        'script-clh-016': {
            id: 'script-clh-016',
            title: 'CLH-016: System Intel',
            description: 'Intelligence gathering and tactical reconnaissance operations',
            house: 'script',
            type: 'lab',
            difficulty: 'intermediate',
            duration: 45,
            topics: ['linux', 'hacking', 'reconnaissance', 'system-info', 'uname', 'uptime'],
            paths: ['linux-mastery'],
            components: {
                presentation: 'houses/script/courses/clh/modules/clh-016/script-intro.module.html',
                lab: 'houses/script/courses/clh/modules/clh-016/script-lab.lab.html',
                quiz: 'houses/script/courses/clh/modules/clh-016/script-quiz.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },

        'script-clh-017': {
            id: 'script-clh-017',
            title: 'CLH-017: Find & Locate',
            description: 'Search and file location discovery techniques',
            house: 'script',
            type: 'lab',
            difficulty: 'intermediate',
            duration: 45,
            topics: ['linux', 'hacking', 'find', 'locate', 'search', 'file-discovery'],
            paths: ['linux-mastery'],
            components: {
                presentation: 'houses/script/courses/clh/modules/clh-017/script-intro.module.html',
                lab: 'houses/script/courses/clh/modules/clh-017/script-lab.lab.html',
                quiz: 'houses/script/courses/clh/modules/clh-017/script-quiz.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },

        'script-clh-018': {
            id: 'script-clh-018',
            title: 'CLH-018: Archive Operations',
            description: 'Dead Drop Protocol — handling and extracting intel packages',
            house: 'script',
            type: 'lab',
            difficulty: 'intermediate',
            duration: 45,
            topics: ['linux', 'hacking', 'tar', 'gzip', 'archives', 'compression'],
            paths: ['linux-mastery'],
            components: {
                presentation: 'houses/script/courses/clh/modules/clh-018/script-intro.module.html',
                lab: 'houses/script/courses/clh/modules/clh-018/script-lab.lab.html',
                quiz: 'houses/script/courses/clh/modules/clh-018/script-quiz.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },

        'script-clh-019': {
            id: 'script-clh-019',
            title: 'CLH-019: Disk Forensics',
            description: 'Evidence Lab — digital forensics and disk image analysis',
            house: 'script',
            type: 'lab',
            difficulty: 'advanced',
            duration: 45,
            topics: ['linux', 'hacking', 'forensics', 'disk', 'df', 'du', 'mount'],
            paths: ['linux-mastery'],
            components: {
                presentation: 'houses/script/courses/clh/modules/clh-019/script-intro.module.html',
                lab: 'houses/script/courses/clh/modules/clh-019/script-lab.lab.html',
                quiz: 'houses/script/courses/clh/modules/clh-019/script-quiz.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },

        'script-clh-020': {
            id: 'script-clh-020',
            title: 'CLH-020: User Reconnaissance',
            description: 'User account profiling and privilege enumeration',
            house: 'script',
            type: 'lab',
            difficulty: 'advanced',
            duration: 45,
            topics: ['linux', 'hacking', 'users', 'whoami', 'id', 'passwd', 'enumeration'],
            paths: ['linux-mastery'],
            components: {
                presentation: 'houses/script/courses/clh/modules/clh-020/script-intro.module.html',
                lab: 'houses/script/courses/clh/modules/clh-020/script-lab.lab.html',
                quiz: 'houses/script/courses/clh/modules/clh-020/script-quiz.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },

        'script-clh-021': {
            id: 'script-clh-021',
            title: 'CLH-021: SSH Operations',
            description: 'Operation Silent Relay — secure encrypted tunnel establishment',
            house: 'script',
            type: 'lab',
            difficulty: 'advanced',
            duration: 45,
            topics: ['linux', 'hacking', 'ssh', 'tunnels', 'encryption', 'remote-access'],
            paths: ['linux-mastery'],
            components: {
                presentation: 'houses/script/courses/clh/modules/clh-021/script-intro.module.html',
                lab: 'houses/script/courses/clh/modules/clh-021/script-lab.lab.html',
                quiz: 'houses/script/courses/clh/modules/clh-021/script-quiz.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },

        'script-clh-022': {
            id: 'script-clh-022',
            title: 'CLH-022: Network Reconnaissance',
            description: 'Infrastructure mapping and lateral movement planning',
            house: 'script',
            type: 'lab',
            difficulty: 'advanced',
            duration: 45,
            topics: ['linux', 'hacking', 'networking', 'recon', 'mapping', 'lateral-movement'],
            paths: ['linux-mastery'],
            components: {
                presentation: 'houses/script/courses/clh/modules/clh-022/script-intro.module.html',
                lab: 'houses/script/courses/clh/modules/clh-022/script-lab.lab.html',
                quiz: 'houses/script/courses/clh/modules/clh-022/script-quiz.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },

        'script-clh-023': {
            id: 'script-clh-023',
            title: 'CLH-023: Service Management',
            description: 'Compromised server audit — identifying malicious services',
            house: 'script',
            type: 'lab',
            difficulty: 'advanced',
            duration: 45,
            topics: ['linux', 'hacking', 'services', 'systemctl', 'daemons', 'audit'],
            paths: ['linux-mastery'],
            components: {
                presentation: 'houses/script/courses/clh/modules/clh-023/script-intro.module.html',
                lab: 'houses/script/courses/clh/modules/clh-023/script-lab.lab.html',
                quiz: 'houses/script/courses/clh/modules/clh-023/script-quiz.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },

        'script-clh-024': {
            id: 'script-clh-024',
            title: 'CLH-024: Scheduled Tasks',
            description: 'Persistence Hunt — cron jobs and system timers',
            house: 'script',
            type: 'lab',
            difficulty: 'advanced',
            duration: 45,
            topics: ['linux', 'hacking', 'cron', 'crontab', 'persistence', 'scheduled-tasks'],
            paths: ['linux-mastery'],
            components: {
                presentation: 'houses/script/courses/clh/modules/clh-024/script-intro.module.html',
                lab: 'houses/script/courses/clh/modules/clh-024/script-lab.lab.html',
                quiz: 'houses/script/courses/clh/modules/clh-024/script-quiz.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },

        'script-clh-025': {
            id: 'script-clh-025',
            title: 'CLH-025: Package Management',
            description: 'Supply chain audit — package verification and integrity',
            house: 'script',
            type: 'lab',
            difficulty: 'advanced',
            duration: 45,
            topics: ['linux', 'hacking', 'apt', 'dpkg', 'packages', 'supply-chain'],
            paths: ['linux-mastery'],
            components: {
                presentation: 'houses/script/courses/clh/modules/clh-025/script-intro.module.html',
                lab: 'houses/script/courses/clh/modules/clh-025/script-lab.lab.html',
                quiz: 'houses/script/courses/clh/modules/clh-025/script-quiz.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },

        'script-clh-026': {
            id: 'script-clh-026',
            title: 'CLH-026: Access Control',
            description: 'Vault Security Review — hunting privilege escalation vectors',
            house: 'script',
            type: 'lab',
            difficulty: 'advanced',
            duration: 45,
            topics: ['linux', 'hacking', 'access-control', 'sudo', 'privilege-escalation'],
            paths: ['linux-mastery'],
            components: {
                presentation: 'houses/script/courses/clh/modules/clh-026/script-intro.module.html',
                lab: 'houses/script/courses/clh/modules/clh-026/script-lab.lab.html',
                quiz: 'houses/script/courses/clh/modules/clh-026/script-quiz.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },

        'script-clh-027': {
            id: 'script-clh-027',
            title: 'CLH-027: User Management',
            description: 'Identity Management — user account administration',
            house: 'script',
            type: 'lab',
            difficulty: 'advanced',
            duration: 45,
            topics: ['linux', 'hacking', 'useradd', 'usermod', 'groups', 'identity'],
            paths: ['linux-mastery'],
            components: {
                presentation: 'houses/script/courses/clh/modules/clh-027/script-intro.module.html',
                lab: 'houses/script/courses/clh/modules/clh-027/script-lab.lab.html',
                quiz: 'houses/script/courses/clh/modules/clh-027/script-quiz.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },

        'script-clh-028': {
            id: 'script-clh-028',
            title: 'CLH-028: System Monitoring',
            description: 'Threat Hunt — active incident response with real-time monitoring',
            house: 'script',
            type: 'lab',
            difficulty: 'advanced',
            duration: 50,
            topics: ['linux', 'hacking', 'monitoring', 'top', 'htop', 'incident-response'],
            paths: ['linux-mastery'],
            components: {
                presentation: 'houses/script/courses/clh/modules/clh-028/script-intro.module.html',
                lab: 'houses/script/courses/clh/modules/clh-028/script-lab.lab.html',
                quiz: 'houses/script/courses/clh/modules/clh-028/script-quiz.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },

        'script-clh-029': {
            id: 'script-clh-029',
            title: 'CLH-029: Vim Essentials',
            description: 'Master the modal editor of legends',
            house: 'script',
            type: 'lab',
            difficulty: 'advanced',
            duration: 50,
            topics: ['linux', 'hacking', 'vim', 'editor', 'modal-editing'],
            paths: ['linux-mastery'],
            components: {
                presentation: 'houses/script/courses/clh/modules/clh-029/script-intro.module.html',
                lab: 'houses/script/courses/clh/modules/clh-029/script-lab.lab.html',
                quiz: 'houses/script/courses/clh/modules/clh-029/script-quiz.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },

        'script-clh-030': {
            id: 'script-clh-030',
            title: 'CLH-030: OPERATION CHIMERA',
            description: 'High-stakes mission at maximum classification level',
            house: 'script',
            type: 'lab',
            difficulty: 'advanced',
            duration: 60,
            topics: ['linux', 'hacking', 'capstone', 'operation', 'advanced'],
            paths: ['linux-mastery'],
            components: {
                presentation: 'houses/script/courses/clh/modules/clh-030/script-intro.module.html',
                lab: 'houses/script/courses/clh/modules/clh-030/script-lab.lab.html',
                quiz: 'houses/script/courses/clh/modules/clh-030/script-quiz.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },

        'script-clh-031': {
            id: 'script-clh-031',
            title: 'CLH-031: Operation BLACKOUT',
            description: 'Final operation — the ultimate test of everything you have learned',
            house: 'script',
            type: 'lab',
            difficulty: 'advanced',
            duration: 60,
            topics: ['linux', 'hacking', 'final', 'operation', 'advanced'],
            paths: ['linux-mastery'],
            components: {
                lab: 'houses/script/courses/clh/modules/clh-031/script-lab.lab.html'
            },
            prerequisites: [],
            objectives: []
        },

        // --- PowerShell & Automation Applets ---

        'script-pwsh-fundamentals': {
            id: 'script-pwsh-fundamentals',
            title: 'PowerShell Fundamentals Visualizer',
            description: 'Interactive visualizer for PowerShell basics: cmdlets, variables, operators, and help system',
            house: 'script',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['powershell', 'scripting', 'cmdlets', 'variables'],
            paths: ['linux-mastery'],
            components: {
                applet: 'houses/script/applets/pwsh-fundamentals.html'
            },
            prerequisites: [],
            objectives: []
        },

        'script-pwsh-pipeline': {
            id: 'script-pwsh-pipeline',
            title: 'PowerShell Pipeline Visualizer',
            description: 'Visualize how objects flow through the PowerShell pipeline with filtering, sorting, and formatting',
            house: 'script',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['powershell', 'pipeline', 'objects', 'filtering'],
            paths: ['linux-mastery'],
            components: {
                applet: 'houses/script/applets/pwsh-pipeline.html'
            },
            prerequisites: [],
            objectives: []
        },

        'script-pwsh-scripting': {
            id: 'script-pwsh-scripting',
            title: 'PowerShell Scripting Concepts',
            description: 'Explore scripting constructs: loops, conditionals, functions, error handling, and script structure',
            house: 'script',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['powershell', 'scripting', 'functions', 'error-handling'],
            paths: ['linux-mastery'],
            components: {
                applet: 'houses/script/applets/pwsh-scripting.html'
            },
            prerequisites: [],
            objectives: []
        },

        'script-pwsh-admin': {
            id: 'script-pwsh-admin',
            title: 'PowerShell Admin Tasks',
            description: 'Practice common administrative tasks: user management, services, registry, and remote administration',
            house: 'script',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['powershell', 'administration', 'services', 'remote-management'],
            paths: ['linux-mastery'],
            components: {
                applet: 'houses/script/applets/pwsh-admin.html'
            },
            prerequisites: [],
            objectives: []
        },

        'script-automation-intro': {
            id: 'script-automation-intro',
            title: 'Automation Introduction',
            description: 'Introduction to automation concepts: task scheduling, scripted workflows, and repeatable processes',
            house: 'script',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['automation', 'scripting', 'task-scheduling', 'workflows'],
            paths: ['linux-mastery'],
            components: {
                applet: 'houses/script/applets/automation-intro.html'
            },
            prerequisites: [],
            objectives: []
        },

        'script-log-analysis': {
            id: 'script-log-analysis',
            title: 'Log Analysis Visualizer',
            description: 'Interactive log parsing and analysis: pattern matching, filtering, and anomaly detection',
            house: 'script',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['log-analysis', 'parsing', 'monitoring', 'troubleshooting'],
            paths: ['linux-mastery'],
            components: {
                applet: 'houses/script/applets/log-analysis.html'
            },
            prerequisites: [],
            objectives: []
        },

        'script-backup-strategies': {
            id: 'script-backup-strategies',
            title: 'Backup Strategies Visualizer',
            description: 'Compare backup strategies: full, incremental, differential, and rotation schemes',
            house: 'script',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['backup', 'disaster-recovery', 'data-protection', 'storage'],
            paths: ['linux-mastery'],
            components: {
                applet: 'houses/script/applets/backup-strategies.html'
            },
            prerequisites: [],
            objectives: []
        },

        'script-reporting-automation': {
            id: 'script-reporting-automation',
            title: 'Reporting Automation',
            description: 'Automate report generation: data collection, formatting, scheduling, and output delivery',
            house: 'script',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['automation', 'reporting', 'data-collection', 'scheduling'],
            paths: ['linux-mastery'],
            components: {
                applet: 'houses/script/applets/reporting-automation.html'
            },
            prerequisites: [],
            objectives: []
        },

        // --- Bash Scripting ---
        'script-command-translator': {
            id: 'script-command-translator',
            title: 'Cross-Platform Commands',
            description: 'Translate commands between Windows, macOS, and Linux',
            house: 'script',
            type: 'tool',
            difficulty: 'beginner',
            duration: 30,
            topics: ['cross-platform', 'commands', 'windows', 'linux', 'macos'],
            paths: ['aplus-core1', 'comptia-linux'],
            components: {
                applet: 'houses/script/applets/linux/script-command-translator.applet.html'
            },
            prerequisites: ['script-linux-basics'],
            objectives: [
                'Write bash scripts with variables and loops',
                'Use conditionals and functions',
                'Automate repetitive tasks'
            ]
        },

        // --- Python Programming (8-chapter series) ---
        'script-bash-scripting': {
            id: 'script-bash-scripting',
            title: 'Bash Scripting',
            description: 'Write shell scripts to automate Linux tasks',
            house: 'script',
            type: 'module',
            difficulty: 'intermediate',
            duration: 75,
            topics: ['bash', 'scripting', 'automation', 'shell'],
            paths: ['comptia-linux', 'devops-fundamentals'],
            components: {
                applet: 'houses/script/applets/linux/script-bash-scripting-playground.applet.html'
            },
            prerequisites: [],
            objectives: [
                'Write and run Python code',
                'Understand Python syntax',
                'Use variables and data types'
            ]
        },

        'script-python-basics': {
            id: 'script-python-basics',
            title: 'Python Basics',
            description: 'Introduction to Python programming',
            house: 'script',
            type: 'module',
            difficulty: 'beginner',
            duration: 60,
            topics: ['python', 'programming', 'fundamentals'],
            paths: ['python-fundamentals', 'devops-fundamentals'],
            components: {
                presentation: 'houses/script/presentations/python/script-python-chapter1.presentation.html',
                applet: 'houses/script/applets/python/script-python-chapter1.applet.html'
            },
            prerequisites: ['script-python-basics'],
            objectives: [
                'Manipulate strings effectively',
                'Use string methods and formatting',
                'Process text data'
            ]
        },

        'script-python-strings': {
            id: 'script-python-strings',
            title: 'Python Strings',
            description: 'String manipulation and operations',
            house: 'script',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['python', 'strings', 'text-processing'],
            paths: ['python-fundamentals'],
            components: {
                presentation: 'houses/script/presentations/python/script-python-chapter2.presentation.html',
                applet: 'houses/script/applets/python/script-python-chapter2-strings.applet.html'
            },
            prerequisites: ['script-python-strings'],
            objectives: [
                'Use if/elif/else statements',
                'Write for and while loops',
                'Control program execution flow'
            ]
        },

        'script-python-flow-control': {
            id: 'script-python-flow-control',
            title: 'Python Flow Control',
            description: 'Conditionals, loops, and program flow',
            house: 'script',
            type: 'module',
            difficulty: 'beginner',
            duration: 60,
            topics: ['python', 'conditionals', 'loops', 'flow-control'],
            paths: ['python-fundamentals'],
            components: {
                presentation: 'houses/script/presentations/python/script-python-chapter3.presentation.html',
                applet: 'houses/script/applets/python/script-python-chapter3-flow-control.applet.html'
            },
            prerequisites: ['script-python-flow-control'],
            objectives: [
                'Define and call functions',
                'Use parameters and return values',
                'Understand scope and namespaces'
            ]
        },

        'script-python-functions': {
            id: 'script-python-functions',
            title: 'Python Functions',
            description: 'Creating reusable code with functions',
            house: 'script',
            type: 'module',
            difficulty: 'intermediate',
            duration: 50,
            topics: ['python', 'functions', 'modularity'],
            paths: ['python-fundamentals'],
            components: {
                presentation: 'houses/script/presentations/python/script-python-chapter4.presentation.html',
                applet: 'houses/script/applets/python/script-python-chapter4-functions.applet.html'
            },
            prerequisites: ['script-python-functions'],
            objectives: [
                'Work with lists and tuples',
                'Use list comprehensions',
                'Manipulate collection data'
            ]
        },

        'script-python-collections': {
            id: 'script-python-collections',
            title: 'Python Collections',
            description: 'Lists, tuples, and data structures',
            house: 'script',
            type: 'module',
            difficulty: 'intermediate',
            duration: 55,
            topics: ['python', 'lists', 'tuples', 'collections'],
            paths: ['python-fundamentals'],
            components: {
                presentation: 'houses/script/presentations/python/script-python-chapter5.presentation.html',
                applet: 'houses/script/applets/python/script-python-chapter5-collections.applet.html'
            },
            prerequisites: ['script-python-collections'],
            objectives: [
                'Create and manipulate dictionaries',
                'Access and modify key-value pairs',
                'Use dictionary methods effectively'
            ]
        },

        'script-python-dictionaries': {
            id: 'script-python-dictionaries',
            title: 'Python Dictionaries',
            description: 'Key-value data structures',
            house: 'script',
            type: 'module',
            difficulty: 'intermediate',
            duration: 50,
            topics: ['python', 'dictionaries', 'key-value', 'data-structures'],
            paths: ['python-fundamentals'],
            components: {
                presentation: 'houses/script/presentations/python/script-python-chapter6.presentation.html',
                applet: 'houses/script/applets/python/script-python-chapter6-dictionaries.applet.html'
            },
            prerequisites: ['script-python-dictionaries'],
            objectives: [
                'Read from and write to files',
                'Handle file exceptions',
                'Process file data effectively'
            ]
        },

        'script-python-files': {
            id: 'script-python-files',
            title: 'Python File Handling',
            description: 'Reading and writing files',
            house: 'script',
            type: 'module',
            difficulty: 'intermediate',
            duration: 55,
            topics: ['python', 'files', 'io', 'data-processing'],
            paths: ['python-fundamentals', 'devops-fundamentals'],
            components: {
                presentation: 'houses/script/presentations/python/script-python-chapter7.presentation.html',
                applet: 'houses/script/applets/python/script-python-chapter7-file-handling.applet.html'
            },
            prerequisites: ['script-python-files'],
            objectives: [
                'Define classes and create objects',
                'Use inheritance and polymorphism',
                'Apply OOP design principles'
            ]
        },

        // --- PowerShell & Windows CLI ---
        'script-python-oop': {
            id: 'script-python-oop',
            title: 'Python OOP',
            description: 'Object-oriented programming in Python',
            house: 'script',
            type: 'module',
            difficulty: 'advanced',
            duration: 75,
            topics: ['python', 'oop', 'classes', 'objects'],
            paths: ['python-fundamentals'],
            components: {
                presentation: 'houses/script/presentations/python/script-python-chapter8.presentation.html',
                applet: 'houses/script/applets/python/script-python-chapter8-oop.applet.html'
            },
            prerequisites: [],
            objectives: [
                'Execute PowerShell commands',
                'Understand cmdlet structure',
                'Write basic PowerShell scripts'
            ]
        },

        'script-powershell-basics': {
            id: 'script-powershell-basics',
            title: 'PowerShell Basics',
            description: 'Introduction to PowerShell scripting',
            house: 'script',
            type: 'module',
            difficulty: 'beginner',
            duration: 60,
            topics: ['powershell', 'windows', 'scripting', 'automation'],
            paths: ['md-100', 'devops-fundamentals'],
            components: {
                applet: 'houses/script/applets/powershell/script-powershell-playground.applet.html'
            },
            prerequisites: ['script-powershell-basics'],
            objectives: [
                'Use essential Windows CLI commands',
                'Manage system from command line',
                'Troubleshoot with CLI tools'
            ]
        },

        'script-windows-cli': {
            id: 'script-windows-cli',
            title: 'Windows CLI Tools',
            description: 'Command-line utilities for Windows administration',
            house: 'script',
            type: 'module',
            difficulty: 'intermediate',
            duration: 50,
            topics: ['windows', 'command-line', 'administration'],
            paths: ['md-100', 'aplus-core1'],
            components: {
                applet: 'houses/script/applets/powershell/script-windows-cli-tools.applet.html'
            },
            prerequisites: ['script-windows-cli'],
            objectives: [
                'Navigate registry hives',
                'Understand registry data types',
                'Safely modify registry entries'
            ]
        },

        'script-windows-registry': {
            id: 'script-windows-registry',
            title: 'Windows Registry',
            description: 'Understanding and navigating the Windows Registry',
            house: 'script',
            type: 'module',
            difficulty: 'intermediate',
            duration: 45,
            topics: ['windows', 'registry', 'configuration'],
            paths: ['md-100', 'aplus-core1'],
            components: {
                applet: 'houses/script/tools/script-windows-registry.tool.html'
            },
            prerequisites: ['script-windows-cli'],
            objectives: [
                'Use Windows diagnostic tools',
                'Troubleshoot common issues',
                'Analyze system health'
            ]
        },

        // --- System Administration ---
        'script-windows-troubleshooting': {
            id: 'script-windows-troubleshooting',
            title: 'Windows Troubleshooting',
            description: 'Diagnostic tools and troubleshooting techniques',
            house: 'script',
            type: 'module',
            difficulty: 'intermediate',
            duration: 60,
            topics: ['windows', 'troubleshooting', 'diagnostics'],
            paths: ['md-100', 'aplus-core1'],
            components: {
                applet: 'houses/script/applets/powershell/script-windows-troubleshooting.applet.html'
            },
            prerequisites: ['script-linux-basics'],
            objectives: [
                'Monitor and manage processes',
                'Control system services',
                'Analyze resource usage'
            ]
        },

        'script-process-management': {
            id: 'script-process-management',
            title: 'Process Management',
            description: 'Managing system processes and services',
            house: 'script',
            type: 'module',
            difficulty: 'intermediate',
            duration: 45,
            topics: ['processes', 'services', 'linux', 'administration'],
            paths: ['comptia-linux', 'devops-fundamentals'],
            components: {
                applet: 'houses/script/tools/script-process-management.tool.html'
            },
            prerequisites: ['script-linux-basics'],
            objectives: [
                'Locate and read log files',
                'Configure logging systems',
                'Analyze logs for issues'
            ]
        },

        'script-log-management': {
            id: 'script-log-management',
            title: 'Log Management',
            description: 'System logging and log analysis',
            house: 'script',
            type: 'module',
            difficulty: 'intermediate',
            duration: 50,
            topics: ['logs', 'syslog', 'monitoring', 'analysis'],
            paths: ['comptia-linux', 'security-operations'],
            components: {
                applet: 'houses/script/tools/script-log-management.tool.html'
            },
            prerequisites: ['script-linux-basics'],
            objectives: [
                'Use package managers (apt, yum)',
                'Install and remove software',
                'Manage package repositories'
            ]
        },

        'script-package-management': {
            id: 'script-package-management',
            title: 'Package Management',
            description: 'Installing and managing software packages',
            house: 'script',
            type: 'module',
            difficulty: 'beginner',
            duration: 40,
            topics: ['packages', 'apt', 'yum', 'linux'],
            paths: ['comptia-linux'],
            components: {
                applet: 'houses/script/tools/script-package-manager.tool.html'
            },
            prerequisites: ['script-bash-scripting'],
            objectives: [
                'Understand REST APIs and data formats',
                'Apply infrastructure as code concepts',
                'Use configuration management tools'
            ]
        },

        // ─────────────────────────────────────────────────────────────
        // CODE HOUSE - Development & Engineering
        // ─────────────────────────────────────────────────────────────
        'script-automation-concepts': {
            id: 'script-automation-concepts',
            title: 'Automation Concepts',
            description: 'Infrastructure automation and programmability',
            house: 'script',
            type: 'module',
            difficulty: 'intermediate',
            duration: 60,
            topics: ['automation', 'ansible', 'infrastructure-as-code', 'apis'],
            paths: ['devops-fundamentals', 'ccna'],
            components: {
                presentation: 'houses/script/presentations/script-automation.presentation.html',
                applet: 'houses/script/tools/script-automation.tool.html'
            },
            prerequisites: [],
            objectives: [
                'Initialize and clone repositories',
                'Commit, push, and pull changes',
                'Understand branching basics'
            ]
        },

        'code-git-basics': {
            id: 'code-git-basics',
            title: 'Git Fundamentals',
            description: 'Version control essentials',
            house: 'code',
            type: 'module',
            difficulty: 'beginner',
            duration: 55,
            topics: ['git', 'version-control', 'development'],
            paths: ['devops-fundamentals'],
            components: {
                presentation: 'houses/code/presentations/code-git-basics.presentation.html',
                applet: 'houses/code/applets/code-pipeline-builder.applet.html',
                lab: 'houses/code/labs/code-cicd.lab.html'
            },
            prerequisites: ['code-git-basics'],
            objectives: [
                'Build and run Docker containers',
                'Write effective Dockerfiles',
                'Manage container lifecycles'
            ]
        },

        'code-docker': {
            id: 'code-docker',
            title: 'Docker Fundamentals',
            description: 'Containerization essentials for modern development',
            house: 'code',
            type: 'module',
            difficulty: 'intermediate',
            duration: 60,
            topics: ['docker', 'containers', 'devops'],
            paths: ['devops-fundamentals'],
            components: {
                presentation: 'houses/code/presentations/code-docker-fundamentals.presentation.html',
                applet: 'houses/code/applets/code-docker-playground.applet.html',
                quiz: 'houses/code/quizzes/code-docker.quiz.html',
                lab: 'houses/code/labs/code-docker.lab.html'
            },
            prerequisites: ['code-docker'],
            objectives: [
                'Deploy applications to Kubernetes',
                'Understand pods, services, and deployments',
                'Scale and manage containerized workloads'
            ]
        },

        'code-kubernetes': {
            id: 'code-kubernetes',
            title: 'Kubernetes Fundamentals',
            description: 'Container orchestration at scale',
            house: 'code',
            type: 'module',
            difficulty: 'intermediate',
            duration: 75,
            topics: ['kubernetes', 'k8s', 'orchestration', 'devops'],
            paths: ['devops-fundamentals'],
            components: {
                presentation: 'houses/code/presentations/code-kubernetes-fundamentals.presentation.html',
                applet: 'houses/code/applets/code-kubernetes-cluster-sim.applet.html',
                quiz: 'houses/code/quizzes/code-kubernetes.quiz.html',
                lab: 'houses/code/labs/code-kubernetes.lab.html'
            },
            prerequisites: ['code-git-basics'],
            objectives: [
                'Write Terraform configuration files',
                'Manage state and providers',
                'Deploy cloud infrastructure as code'
            ]
        },

        'code-terraform': {
            id: 'code-terraform',
            title: 'Terraform Fundamentals',
            description: 'Infrastructure as Code with HashiCorp Terraform',
            house: 'code',
            type: 'module',
            difficulty: 'intermediate',
            duration: 65,
            topics: ['terraform', 'iac', 'infrastructure', 'devops'],
            paths: ['devops-fundamentals', 'openstack'],
            components: {
                presentation: 'houses/code/presentations/code-terraform-fundamentals.presentation.html',
                applet: 'houses/code/tools/code-terraform.tool.html',
                quiz: 'houses/code/quizzes/code-terraform.quiz.html',
                lab: 'houses/code/labs/code-terraform.lab.html'
            },
            prerequisites: ['code-git-basics'],
            objectives: [
                'Write CloudFormation templates',
                'Create and update stacks',
                'Manage AWS resources declaratively'
            ]
        },

        'code-cloudformation': {
            id: 'code-cloudformation',
            title: 'CloudFormation Fundamentals',
            description: 'AWS Infrastructure as Code',
            house: 'code',
            type: 'module',
            difficulty: 'intermediate',
            duration: 55,
            topics: ['cloudformation', 'aws', 'iac', 'devops'],
            paths: ['devops-fundamentals', 'openstack'],
            components: {
                presentation: 'houses/code/presentations/code-cloudformation-fundamentals.presentation.html',
                applet: 'houses/code/applets/code-cloudformation-designer.applet.html',
                quiz: 'houses/code/quizzes/code-cloudformation.quiz.html',
                lab: 'houses/code/labs/code-cloudformation.lab.html'
            },
            prerequisites: ['code-git-basics', 'code-docker'],
            objectives: [
                'Build CI/CD pipelines',
                'Automate testing and deployment',
                'Implement DevOps best practices'
            ]
        },

        'code-cicd': {
            id: 'code-cicd',
            title: 'CI/CD Pipelines',
            description: 'Continuous Integration and Deployment',
            house: 'code',
            type: 'module',
            difficulty: 'intermediate',
            duration: 60,
            topics: ['cicd', 'pipelines', 'automation', 'devops'],
            paths: ['devops-fundamentals'],
            components: {
                presentation: 'houses/code/presentations/code-cicd-fundamentals.presentation.html',
                applet: 'houses/code/applets/code-pipeline-builder.applet.html',
                quiz: 'houses/code/quizzes/code-cicd.quiz.html',
                lab: 'houses/code/labs/code-cicd.lab.html'
            },
            prerequisites: [],
            objectives: [
                'Understand Agile principles',
                'Work in sprint cycles',
                'Apply SDLC methodologies'
            ]
        },

        // ─────────────────────────────────────────────────────────────
        // EYE HOUSE - Monitoring & Analysis
        // ─────────────────────────────────────────────────────────────
        'code-agile': {
            id: 'code-agile',
            title: 'Agile & SDLC',
            description: 'Software development methodologies',
            house: 'code',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['agile', 'scrum', 'sdlc', 'project-management'],
            paths: ['devops-fundamentals'],
            components: {
                presentation: 'houses/code/presentations/code-agile-sdlc.presentation.html',
                applet: 'houses/code/tools/code-sprint.tool.html',
                quiz: 'houses/code/quizzes/code-agile.quiz.html'
            },
            prerequisites: [],
            objectives: [
                'Locate common log files',
                'Parse log entries effectively',
                'Identify indicators in logs'
            ]
        },

        // Added during ISSUE-009 fix (Dec 29, 2025)
        'code-unit-testing': {
            id: 'code-unit-testing',
            title: 'Unit Testing',
            description: 'Test-driven development and unit testing fundamentals',
            house: 'code',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['testing', 'tdd', 'unit-tests', 'quality-assurance'],
            paths: ['devops-fundamentals'],
            components: {
                presentation: 'houses/code/presentations/code-unit-testing.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },

// ─────────────────────────────────────────────────────────────
        // SHIELD HOUSE - 134 new entries
        // ─────────────────────────────────────────────────────────────
        'eye-log-analysis': {
            id: 'eye-log-analysis',
            title: 'Log Analysis Basics',
            description: 'Reading and interpreting system logs',
            house: 'eye',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['logs', 'monitoring', 'troubleshooting'],
            paths: ['security-operations', 'linux-mastery'],
            components: {
                presentation: 'houses/eye/presentations/eye-log-basics.presentation.html',
                applet: 'houses/eye/tools/eye-siem.tool.html',
                lab: 'houses/eye/labs/eye-soc.lab.html'
            },
            prerequisites: [],
            objectives: []
        },

        // Added during ISSUE-009 fix (Dec 29, 2025) - moved from orphan at line ~9230
        'eye-soc-simulator': {
            id: 'eye-soc-simulator',
            title: 'SOC Simulator',
            description: 'Simulate Security Operations Center workflows and triage',
            house: 'eye',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['monitoring', 'soc', 'triage', 'incident-response'],
            paths: ['security-operations', 'security-plus'],
            components: {
                applet: 'houses/eye/tools/eye-soc.tool.html'
            },
            prerequisites: [],
            objectives: []
        },

        'shield-yara-training': {
            id: 'shield-yara-training',
            title: 'YARA Rules Training Lab',
            description: 'Write malware detection rules. Interactive rule builder with simulated samples.',
            house: 'shield',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 45,
            topics: ['threats', 'security'],
            paths: ['security-plus', 'security-operations'],
            components: {
                quiz: 'houses/shield/tools/shield-yara.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-osint-dorking': {
            id: 'shield-osint-dorking',
            title: 'OSINT: Google Dorking Lab',
            description: 'Learn Google search operators for security reconnaissance - find exposed files, configs & vulnerabilities',
            house: 'shield',
            type: 'lab',
            difficulty: 'beginner',
            duration: 55,
            topics: ['threats', 'security'],
            paths: ['security-plus', 'comptia-network', 'security-operations'],
            components: {
                lab: 'houses/shield/labs/shield-osint-google-dorking.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-security-fundamentals-complete': {
            id: 'shield-security-fundamentals-complete',
            title: 'Security Fundamentals (Complete)',
            description: 'Comprehensive: CIA Triad, threats, authentication, cryptography, network security with 15-question quiz',
            house: 'shield',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 25,
            topics: ['fundamentals', 'security'],
            paths: ['security-plus'],
            components: {
                quiz: 'houses/shield/presentations/shield-security-fundamentals.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-biometrics': {
            id: 'shield-biometrics',
            title: 'Biometrics',
            description: 'Biometric authentication methods',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['access-control', 'security'],
            paths: ['security-plus'],
            components: {
                applet: 'houses/shield/applets/access/biometrics/shield-biometrics.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-kerberos': {
            id: 'shield-kerberos',
            title: 'Kerberos',
            description: 'Kerberos authentication protocol',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['access-control', 'security'],
            paths: ['security-plus'],
            components: {
                applet: 'houses/shield/applets/access/kerberos/shield-kerberos.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-aaa-simulator': {
            id: 'shield-aaa-simulator',
            title: 'AAA Flow Simulator',
            description: 'Interactive Authentication, Authorization, Accounting workflow',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['access-control', 'security'],
            paths: ['security-plus'],
            components: {
                applet: 'houses/shield/tools/shield-aaa-flow.tool.html'
            },
            prerequisites: [],
            objectives: []
        },

        // ─────────────────────────────────────────────────────────────
        // CMMC MODULES - CloudFront CDN Hosted (AD-005)
        // ─────────────────────────────────────────────────────────────
        // These 17 modules are HTML5Point presentations requiring data/ folders.
        // Local shells exist but lack the player assets - use CloudFront URLs.
        // See: _planning/ARCHITECTURE_DECISIONS.md (AD-005, AD-006)
        // CDN Base: https://d2hie3dpn9wvbb.cloudfront.net/CMMC/
        // ─────────────────────────────────────────────────────────────

        'shield-access-models': {
            id: 'shield-access-models',
            title: 'Access Control Models',
            description: 'Compare RBAC, MAC, DAC, ABAC with scenario selector',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['access-control', 'security'],
            paths: ['security-plus'],
            components: {
                applet: 'houses/shield/applets/access/shield-access-control-models.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-cmmc-ac': {
            id: 'shield-cmmc-ac',
            title: 'CMMC Access Control',
            description: 'CMMC access control domain',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['risk-management', 'security'],
            paths: ['security-plus', 'aplus-core1', 'security-operations'],
            components: {
                applet: 'houses/shield/applets/compliance/cmmc_access_control/shield-cmmc-ac.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-cmmc-au': {
            id: 'shield-cmmc-au',
            title: 'CMMC Audit & Accountability',
            description: 'Audit and accountability controls',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['risk-management', 'security'],
            paths: ['security-plus', 'aplus-core1', 'security-operations'],
            components: {
                applet: 'houses/shield/applets/compliance/cmmc_audit_accountability/shield-cmmc-au.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-cmmc-at': {
            id: 'shield-cmmc-at',
            title: 'CMMC Awareness Training',
            description: 'Security awareness training',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['risk-management', 'security'],
            paths: ['security-plus', 'aplus-core1', 'security-operations'],
            components: {
                applet: 'houses/shield/applets/compliance/cmmc_awareness_training/shield-cmmc-at.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-cmmc-cm': {
            id: 'shield-cmmc-cm',
            title: 'CMMC Config Management',
            description: 'Configuration management controls',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['risk-management', 'security'],
            paths: ['security-plus', 'aplus-core1', 'security-operations'],
            components: {
                applet: 'houses/shield/applets/compliance/cmmc_config_management/shield-cmmc-cm.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-cmmc-cui': {
            id: 'shield-cmmc-cui',
            title: 'CMMC CUI',
            description: 'Controlled Unclassified Information',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['risk-management', 'security'],
            paths: ['security-plus', 'aplus-core1', 'security-operations'],
            components: {
                applet: 'houses/shield/applets/compliance/cui_overview/shield-cui-overview.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-cmmc-framework': {
            id: 'shield-cmmc-framework',
            title: 'CMMC Framework',
            description: 'CMMC framework overview',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['risk-management', 'security'],
            paths: ['security-plus', 'aplus-core1', 'comptia-network', 'security-operations'],
            components: {
                applet: 'houses/shield/applets/compliance/cmmc_framework/shield-cmmc-framework.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-cmmc-ia': {
            id: 'shield-cmmc-ia',
            title: 'CMMC Identification & Auth',
            description: 'Identification and authentication',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['risk-management', 'security'],
            paths: ['security-plus', 'aplus-core1', 'security-operations'],
            components: {
                applet: 'houses/shield/applets/compliance/cmmc_identification_auth/shield-cmmc-ia.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-cmmc-ir': {
            id: 'shield-cmmc-ir',
            title: 'CMMC Incident Response',
            description: 'Incident response controls',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['risk-management', 'security'],
            paths: ['security-plus', 'aplus-core1', 'security-operations'],
            components: {
                applet: 'houses/shield/applets/compliance/cmmc_incident_response/shield-cmmc-ir.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-cmmc-ma': {
            id: 'shield-cmmc-ma',
            title: 'CMMC Maintenance',
            description: 'System maintenance controls',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['risk-management', 'security'],
            paths: ['security-plus', 'aplus-core1', 'security-operations'],
            components: {
                applet: 'houses/shield/applets/compliance/cmmc_maintenance/shield-cmmc-ma.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-cmmc-mp': {
            id: 'shield-cmmc-mp',
            title: 'CMMC Media Protection',
            description: 'Media protection controls',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['risk-management', 'security'],
            paths: ['security-plus', 'aplus-core1', 'security-operations'],
            components: {
                applet: 'houses/shield/applets/compliance/cmmc_media_protection/shield-cmmc-mp.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-cmmc-ps': {
            id: 'shield-cmmc-ps',
            title: 'CMMC Personnel Security',
            description: 'Personnel security controls',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['risk-management', 'security'],
            paths: ['security-plus', 'aplus-core1', 'security-operations'],
            components: {
                applet: 'houses/shield/applets/compliance/cmmc_personnel_security/shield-cmmc-ps.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-cmmc-pe': {
            id: 'shield-cmmc-pe',
            title: 'CMMC Physical Protection',
            description: 'Physical protection controls',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['risk-management', 'security'],
            paths: ['security-plus', 'aplus-core1', 'security-operations'],
            components: {
                applet: 'houses/shield/applets/compliance/cmmc_physical_protection/shield-cmmc-pe.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-cmmc-quiz': {
            id: 'shield-cmmc-quiz',
            title: 'CMMC Quiz',
            description: 'Test CMMC knowledge',
            house: 'shield',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['risk-management', 'security'],
            paths: ['security-plus', 'aplus-core1', 'security-operations'],
            components: {
                quiz: 'houses/shield/applets/compliance/cmmc_quiz/shield-cmmc-comprehensive.quiz.html',
                applet: 'houses/shield/applets/compliance/cmmc_quiz/shield-cmmc-quiz.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-cmmc-ra': {
            id: 'shield-cmmc-ra',
            title: 'CMMC Risk Assessment',
            description: 'Risk assessment controls',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['risk-management', 'security'],
            paths: ['security-plus', 'aplus-core1', 'security-operations'],
            components: {
                applet: 'houses/shield/applets/compliance/cmmc_risk_assessment/shield-cmmc-ra.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-cmmc-ca': {
            id: 'shield-cmmc-ca',
            title: 'CMMC Security Assessment',
            description: 'Security assessment controls',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['risk-management', 'security'],
            paths: ['security-plus', 'aplus-core1', 'security-operations'],
            components: {
                applet: 'houses/shield/applets/compliance/cmmc_security_assessment/shield-cmmc-ca.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-cmmc-sc': {
            id: 'shield-cmmc-sc',
            title: 'CMMC System/Comm Protection',
            description: 'System and communications protection',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['risk-management', 'security'],
            paths: ['security-plus', 'aplus-core1', 'security-operations'],
            components: {
                applet: 'houses/shield/applets/compliance/cmmc_system_comm_protection/shield-cmmc-sc.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-cmmc-si': {
            id: 'shield-cmmc-si',
            title: 'CMMC System/Info Integrity',
            description: 'System and information integrity',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['risk-management', 'security'],
            paths: ['security-plus', 'aplus-core1', 'security-operations'],
            components: {
                applet: 'houses/shield/applets/compliance/cmmc_system_info_integrity/shield-cmmc-si.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-framework-selector': {
            id: 'shield-framework-selector',
            title: 'Framework Selector',
            description: 'Compare and choose security frameworks (NIST, ISO, COBIT, CIS, PCI-DSS)',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['risk-management', 'security'],
            paths: ['security-plus', 'comptia-network', 'security-operations'],
            components: {
                applet: 'houses/shield/applets/compliance/shield-framework-selector.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-block-mode': {
            id: 'shield-block-mode',
            title: 'Block Cipher Modes',
            description: 'Block cipher encryption modes',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['cryptography', 'security'],
            paths: ['security-plus', 'cryptography-track'],
            components: {
                applet: 'houses/shield/applets/crypto/shield-crypto-block-ciphers.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-blockchain': {
            id: 'shield-blockchain',
            title: 'Blockchain',
            description: 'Blockchain technology explained',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['cryptography', 'security'],
            paths: ['security-plus', 'cryptography-track'],
            components: {
                applet: 'houses/shield/applets/crypto/blockchain/shield-crypto-blockchain.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-checksum': {
            id: 'shield-checksum',
            title: 'Checksum Verifier',
            description: 'File integrity verification',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['cryptography', 'security'],
            paths: ['security-plus', 'cryptography-track'],
            components: {
                applet: 'houses/shield/applets/crypto/shield-checksum-verifier.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-cryptomatch': {
            id: 'shield-cryptomatch',
            title: 'CryptoMatch Game',
            description: 'Match crypto concepts',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['cryptography', 'security'],
            paths: ['security-plus', 'cryptography-track'],
            components: {
                applet: 'houses/shield/applets/games/crypto_match/shield-cryptomatch-native.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-diffie-hellman': {
            id: 'shield-diffie-hellman',
            title: 'Diffie-Hellman',
            description: 'Key exchange protocol',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['cryptography', 'security'],
            paths: ['security-plus', 'cryptography-track'],
            components: {
                applet: 'houses/shield/applets/crypto/shield-crypto-diffie-hellman.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-digital-sig': {
            id: 'shield-digital-sig',
            title: 'Digital Signatures',
            description: 'Digital signature creation',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['cryptography', 'security'],
            paths: ['security-plus', 'devops-fundamentals', 'comptia-network', 'cryptography-track'],
            components: {
                applet: 'houses/shield/applets/crypto/shield-crypto-digital-signatures.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-encryption': {
            id: 'shield-encryption',
            title: 'Encryption Fundamentals',
            description: 'Encryption basics',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['cryptography', 'security', 'encryption'],
            paths: ['security-plus', 'cryptography-track'],
            components: {
                applet: 'houses/shield/applets/crypto/shield-crypto-symmetric-asymmetric.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-factor-prime': {
            id: 'shield-factor-prime',
            title: 'Prime Factorization',
            description: 'RSA prime factoring',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['cryptography', 'security'],
            paths: ['security-plus'],
            components: {
                applet: 'houses/shield/applets/crypto/prime_factorization/shield-crypto-prime-factorization.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-gpg-lab': {
            id: 'shield-gpg-lab',
            title: 'GPG Encryption Lab',
            description: 'GPG encryption practice',
            house: 'shield',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['cryptography', 'security', 'encryption'],
            paths: ['security-plus', 'cryptography-track'],
            components: {
                lab: 'houses/shield/labs/shield-gpg-encryption.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-hashing': {
            id: 'shield-hashing',
            title: 'Hashing',
            description: 'Hash function concepts',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['cryptography', 'security', 'hashing'],
            paths: ['security-plus', 'cryptography-track'],
            components: {
                applet: 'houses/shield/applets/crypto/shield-crypto-hashing.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-encryption2': {
            id: 'shield-encryption2',
            title: 'Encryption II',
            description: 'Advanced encryption',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['cryptography', 'security', 'encryption'],
            paths: ['security-plus', 'cryptography-track'],
            components: {
                applet: 'houses/shield/applets/crypto/hashing_steganography/shield-encryption-ii.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-hash-lab': {
            id: 'shield-hash-lab',
            title: 'Hash Lab',
            description: 'Hashing hands-on lab',
            house: 'shield',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['cryptography', 'security', 'hashing'],
            paths: ['security-plus', 'cryptography-track'],
            components: {
                lab: 'houses/shield/labs/shield-hash.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-stego': {
            id: 'shield-stego',
            title: 'Steganography',
            description: 'Hide data in images',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['cryptography', 'security'],
            paths: ['security-plus', 'cryptography-track'],
            components: {
                applet: 'houses/shield/applets/crypto/shield-crypto-steganography.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-encrypt-task': {
            id: 'shield-encrypt-task',
            title: 'Encryption Task',
            description: 'Encryption exercise',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['cryptography', 'security', 'encryption'],
            paths: ['security-plus', 'cryptography-track'],
            components: {
                applet: 'houses/shield/applets/crypto/hashing_steganography/shield-encryption-task.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-hash-steg-pres': {
            id: 'shield-hash-steg-pres',
            title: 'Hash & Steg Presentation',
            description: 'Hashing and steganography slides',
            house: 'shield',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['cryptography', 'security', 'hashing'],
            paths: ['security-plus', 'cryptography-track'],
            components: {
                presentation: 'houses/shield/presentations/shield-hash-steg.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-hash-v3': {
            id: 'shield-hash-v3',
            title: 'Hashing v3',
            description: 'Updated hashing module',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['cryptography', 'security', 'hashing'],
            paths: ['security-plus', 'cryptography-track'],
            components: {
                applet: 'houses/shield/applets/crypto/shield-crypto-hashing.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-hashing-lab': {
            id: 'shield-hashing-lab',
            title: 'Hashing Lab',
            description: 'Hashing practice lab',
            house: 'shield',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['cryptography', 'security', 'hashing'],
            paths: ['security-plus', 'cryptography-track'],
            components: {
                lab: 'houses/shield/labs/shield-hashing.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-pki': {
            id: 'shield-pki',
            title: 'PKI',
            description: 'Public Key Infrastructure',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['cryptography', 'security'],
            paths: ['security-plus', 'cryptography-track'],
            components: {
                applet: 'houses/shield/applets/crypto/shield-crypto-pki.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-rsa': {
            id: 'shield-rsa',
            title: 'RSA',
            description: 'RSA encryption algorithm',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['cryptography', 'security'],
            paths: ['security-plus', 'cryptography-track'],
            components: {
                applet: 'houses/shield/applets/crypto/shield-crypto-rsa.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-xor-encryption': {
            id: 'shield-xor-encryption',
            title: 'XOR Encryption',
            description: 'XOR cipher mechanics and bitwise operations',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['cryptography', 'security'],
            paths: ['security-plus', 'cryptography-track'],
            components: {
                applet: 'houses/shield/applets/crypto/xor_encryption/shield-crypto-xor-encryption.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-aes': {
            id: 'shield-aes',
            title: 'AES Encryption',
            description: 'Advanced Encryption Standard block cipher',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['cryptography', 'security', 'encryption'],
            paths: ['security-plus', 'cryptography-track'],
            components: {
                applet: 'houses/shield/applets/crypto/shield-crypto-aes.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-caesar': {
            id: 'shield-caesar',
            title: 'Caesar Cipher',
            description: 'Classical substitution cipher and cryptanalysis',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['cryptography', 'security'],
            paths: ['security-plus', 'cryptography-track'],
            components: {
                applet: 'houses/shield/applets/crypto/shield-crypto-caesar.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-crypto-protocols': {
            id: 'shield-crypto-protocols',
            title: 'Cryptographic Protocols',
            description: 'TLS, SSL, IPsec, and other security protocols',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['cryptography', 'security'],
            paths: ['security-plus', 'cryptography-track'],
            components: {
                applet: 'houses/shield/applets/crypto/shield-crypto-protocols.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-hmac': {
            id: 'shield-hmac',
            title: 'HMAC',
            description: 'Hash-based Message Authentication Codes',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['cryptography', 'security', 'hashing'],
            paths: ['security-plus', 'cryptography-track'],
            components: {
                applet: 'houses/shield/applets/crypto/shield-crypto-hmac.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-key-exchange': {
            id: 'shield-key-exchange',
            title: 'Key Exchange',
            description: 'Key exchange protocols and secure key distribution',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['cryptography', 'security'],
            paths: ['security-plus', 'cryptography-track'],
            components: {
                applet: 'houses/shield/applets/crypto/shield-crypto-key-exchange.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-stream-ciphers': {
            id: 'shield-stream-ciphers',
            title: 'Stream Ciphers',
            description: 'Stream cipher algorithms and operation modes',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['cryptography', 'security', 'encryption'],
            paths: ['security-plus', 'cryptography-track'],
            components: {
                applet: 'houses/shield/applets/crypto/shield-crypto-stream-ciphers.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-career': {
            id: 'shield-career',
            title: 'Career Exploration',
            description: 'Cybersecurity career paths, progression, salaries & certifications',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['fundamentals', 'security'],
            paths: ['security-plus'],
            components: {
                applet: 'houses/shield/applets/fundamentals/career_exploration/shield-career-explorer.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-controls': {
            id: 'shield-controls',
            title: 'Cybersecurity Controls',
            description: 'Security control types',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['fundamentals', 'security'],
            paths: ['security-plus', 'security-operations'],
            components: {
                applet: 'houses/shield/applets/fundamentals/cybersecurity_controls/shield-cybersecurity-controls.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-data-roles': {
            id: 'shield-data-roles',
            title: 'Data Roles',
            description: 'Data ownership and roles',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['fundamentals', 'security'],
            paths: ['security-plus'],
            components: {
                applet: 'houses/shield/applets/fundamentals/data_roles/shield-dataroles.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-design-principles': {
            id: 'shield-design-principles',
            title: 'Design Principles',
            description: 'Security design principles',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['fundamentals', 'security'],
            paths: ['security-plus'],
            components: {
                applet: 'houses/shield/applets/fundamentals/design_principles/shield-cybersecuritydesignprinciples.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-ethics-challenge': {
            id: 'shield-ethics-challenge',
            title: 'Ethics Challenge',
            description: 'Cybersecurity ethics scenarios',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['fundamentals', 'security'],
            paths: ['security-plus'],
            components: {
                applet: 'houses/shield/applets/fundamentals/ethics_challenge/shield-ethics-challenge.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-ethics-conduct': {
            id: 'shield-ethics-conduct',
            title: 'Ethics & Professional Conduct',
            description: 'Professional ethics in security',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['fundamentals', 'security'],
            paths: ['security-plus'],
            components: {
                applet: 'houses/shield/applets/fundamentals/ethics_conduct/shield-ethics-prof-conduct.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-physical': {
            id: 'shield-physical',
            title: 'Physical Protection',
            description: 'Physical security controls',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['fundamentals', 'security'],
            paths: ['security-plus'],
            components: {
                applet: 'houses/shield/applets/fundamentals/physical_protection/shield-physical-environmental.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-privacy': {
            id: 'shield-privacy',
            title: 'Privacy',
            description: 'Privacy principles and laws',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['fundamentals', 'security'],
            paths: ['security-plus'],
            components: {
                applet: 'houses/shield/applets/fundamentals/privacy/shield-privacy.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-best-practices': {
            id: 'shield-best-practices',
            title: 'Security Best Practices',
            description: 'Security best practices guide',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['fundamentals', 'security'],
            paths: ['security-plus'],
            components: {
                applet: 'houses/shield/applets/fundamentals/shield-security-best-practices.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-cube': {
            id: 'shield-cube',
            title: 'The Cube',
            description: 'Cybersecurity cube concept',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['fundamentals', 'security'],
            paths: ['security-plus'],
            components: {
                applet: 'houses/shield/applets/fundamentals/the_cube/shield-cube.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-asset-classification': {
            id: 'shield-asset-classification',
            title: 'Asset Classification Wizard',
            description: 'Classify data assets per government and commercial standards',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['fundamentals', 'security'],
            paths: ['security-plus'],
            components: {
                applet: 'houses/shield/applets/fundamentals/shield-asset-classification-wizard.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-data-lifecycle': {
            id: 'shield-data-lifecycle',
            title: 'Data Lifecycle Visualizer',
            description: 'Track data through creation, storage, usage, archival, and destruction',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['fundamentals', 'security'],
            paths: ['security-plus'],
            components: {
                applet: 'houses/shield/tools/shield-data-lifecycle.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-cookie-caper': {
            id: 'shield-cookie-caper',
            title: 'Cookie Caper',
            description: 'Web cookies security game',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['fundamentals', 'security'],
            paths: ['security-plus'],
            components: {
                applet: 'houses/shield/applets/games/cookie_caper/shield-cookies-native.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-hat-match': {
            id: 'shield-hat-match',
            title: 'Cyber Hat Match',
            description: 'Match hacker types',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['fundamentals', 'security'],
            paths: ['security-plus'],
            components: {
                applet: 'houses/shield/applets/games/cyber_hat_match/shield-hatmatch-native.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-scramble': {
            id: 'shield-scramble',
            title: 'Cyber Scramble',
            description: 'Security term scramble',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['fundamentals', 'security'],
            paths: ['security-plus'],
            components: {
                applet: 'houses/shield/applets/games/cyber_scramble/shield-cyberscramble-native.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-eh-case': {
            id: 'shield-eh-case',
            title: 'Ethical Hacking Case',
            description: 'Ethical hacking scenario',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['threats', 'security'],
            paths: ['security-plus'],
            components: {
                applet: 'houses/shield/exams/shield-eh-exam-1-a.exam.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-hangman': {
            id: 'shield-hangman',
            title: 'Hacker Hangman',
            description: 'Security terms hangman',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['fundamentals', 'security'],
            paths: ['security-plus'],
            components: {
                applet: 'houses/shield/applets/games/hacker_hangman/shield-hangman-native.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-crime': {
            id: 'shield-crime',
            title: 'What',
            description: 'Identify cyber crimes',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['threats', 'security'],
            paths: ['security-plus'],
            components: {
                applet: 'houses/shield/applets/games/whats_my_crime/shield-crime-native.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-browser': {
            id: 'shield-browser',
            title: 'Browser Security Hardening',
            description: 'Secure browser configuration',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['network-security', 'security'],
            paths: ['security-plus'],
            components: {
                applet: 'houses/shield/applets/network/shield-browser-security-hardening.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-eap': {
            id: 'shield-eap',
            title: 'EAP',
            description: 'Extensible Authentication Protocol',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['network-security', 'security'],
            paths: ['security-plus'],
            components: {
                applet: 'houses/shield/applets/network/eap/shield-eap.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-home-network': {
            id: 'shield-home-network',
            title: 'Home Network Security',
            description: 'Secure your home network',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['network-security', 'security', 'networking'],
            paths: ['security-plus', 'comptia-network'],
            components: {
                applet: 'houses/shield/applets/network/shield-home-network-security.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-ids-ips': {
            id: 'shield-ids-ips',
            title: 'IDS/IPS',
            description: 'Intrusion detection/prevention',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['network-security', 'security'],
            paths: ['security-plus'],
            components: {
                applet: 'houses/shield/applets/network/ids_ips/shield-ids-ips.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-linux-fw': {
            id: 'shield-linux-fw',
            title: 'Linux Firewall Builder',
            description: 'Build iptables rules',
            house: 'shield',
            type: 'lab',
            difficulty: 'beginner',
            duration: 20,
            topics: ['network-security', 'security', 'linux'],
            paths: ['security-plus', 'comptia-linux'],
            components: {
                applet: 'houses/shield/applets/network/shield-linux-firewall-builder.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-nat-pat': {
            id: 'shield-nat-pat',
            title: 'NAT/PAT',
            description: 'Network address translation',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['network-security', 'security'],
            paths: ['security-plus', 'comptia-network'],
            components: {
                applet: 'houses/shield/applets/network/nat_pat/shield-nat.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-protocol': {
            id: 'shield-protocol',
            title: 'Protocol Analysis',
            description: 'Network protocol analysis',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['network-security', 'security'],
            paths: ['security-plus', 'comptia-network'],
            components: {
                applet: 'houses/shield/applets/network/protocol_analysis/shield-protocol-analysis.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-handshake': {
            id: 'shield-handshake',
            title: 'Three-Way Handshake',
            description: 'TCP handshake animation',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['network-security', 'security'],
            paths: ['security-plus'],
            components: {
                applet: 'houses/shield/applets/network/threeway_handshake/shield-threeway-handshake1-audio.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-vpn': {
            id: 'shield-vpn',
            title: 'VPN',
            description: 'Virtual Private Networks',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['network-security', 'security'],
            paths: ['security-plus'],
            components: {
                applet: 'houses/shield/applets/network/vpn/shield-vpn.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-wireless-sec': {
            id: 'shield-wireless-sec',
            title: 'Wireless Security',
            description: 'WiFi security protocols',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['network-security', 'security'],
            paths: ['security-plus'],
            components: {
                applet: 'houses/shield/applets/network/wireless_security/shield-wireless-security.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-change-mgmt': {
            id: 'shield-change-mgmt',
            title: 'Change Management',
            description: 'Change management process',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['risk-management', 'security'],
            paths: ['security-plus'],
            components: {
                applet: 'houses/shield/applets/risk/shield-change-management.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-config-mgmt': {
            id: 'shield-config-mgmt',
            title: 'Configuration Management',
            description: 'Config management controls',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['risk-management', 'security'],
            paths: ['security-plus'],
            components: {
                applet: 'houses/shield/applets/risk/config_management/shield-config-mgmt.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-scenario': {
            id: 'shield-scenario',
            title: 'Cybersecurity Scenario',
            description: 'Security scenario exercise',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['risk-management', 'security'],
            paths: ['security-plus'],
            components: {
                applet: 'houses/shield/applets/risk/cybersecurity_scenario/shield-cyber-scenario.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-incident-sim': {
            id: 'shield-incident-sim',
            title: 'Incident Response Simulator',
            description: 'IR workflow practice',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['risk-management', 'security'],
            paths: ['security-plus', 'security-operations'],
            components: {
                applet: 'houses/shield/tools/shield-incident-response.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-pspg': {
            id: 'shield-pspg',
            title: 'Policies & Procedures',
            description: 'Security policies and procedures',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['risk-management', 'security'],
            paths: ['security-plus'],
            components: {
                applet: 'houses/shield/applets/risk/pspg/shield-pspg.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-risk-analysis': {
            id: 'shield-risk-analysis',
            title: 'Risk Analysis',
            description: 'Risk analysis methods',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['risk-management', 'security'],
            paths: ['security-plus', 'security-operations'],
            components: {
                applet: 'houses/shield/applets/risk/risk_analysis/shield-risk-analysis.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-bia-calculator': {
            id: 'shield-bia-calculator',
            title: 'BIA Calculator',
            description: 'Calculate MTD, RTO, RPO, WRT for business continuity planning',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['risk-management', 'security'],
            paths: ['security-plus'],
            components: {
                applet: 'houses/shield/tools/shield-bia.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-crisc-calculator': {
            id: 'shield-crisc-calculator',
            title: 'CRISC Risk Calculator',
            description: 'Risk appetite, Three Lines of Defense, risk matrix and register',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['risk-management', 'security'],
            paths: ['security-plus', 'security-operations'],
            components: {
                applet: 'houses/shield/tools/shield-crisc-risk.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-buffer-overflow': {
            id: 'shield-buffer-overflow',
            title: 'Buffer Overflow',
            description: 'Buffer overflow attacks',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['threats', 'security'],
            paths: ['security-plus'],
            components: {
                applet: 'houses/shield/applets/threats/buffer_overflow_attack/shield-threat-buffer-overflow.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-xss': {
            id: 'shield-xss',
            title: 'Cross-Site Scripting',
            description: 'XSS attack types',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['threats', 'security'],
            paths: ['security-plus'],
            components: {
                applet: 'houses/shield/applets/threats/xss/shield-threat-xss.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-malware-ref': {
            id: 'shield-malware-ref',
            title: 'Malware Types Reference',
            description: 'Malware classification guide',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['threats', 'security'],
            paths: ['security-plus'],
            components: {
                applet: 'houses/shield/applets/threats/shield-malware-types.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-osint-challenge': {
            id: 'shield-osint-challenge',
            title: 'OSINT Challenge',
            description: 'OSINT practice challenge',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['threats', 'security'],
            paths: ['security-plus', 'comptia-network', 'security-operations'],
            components: {
                applet: 'houses/shield/applets/threats/osint_challenge/shield-osint-lab.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-phishing': {
            id: 'shield-phishing',
            title: 'Phishing Mystery',
            description: 'Identify phishing attacks',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['threats', 'security'],
            paths: ['security-plus'],
            components: {
                applet: 'houses/shield/applets/threats/phishing/shield-threat-phishing.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-ransomware': {
            id: 'shield-ransomware',
            title: 'Ransomware',
            description: 'Ransomware attack simulation',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['threats', 'security'],
            paths: ['security-plus'],
            components: {
                applet: 'houses/shield/applets/threats/ransomware_attack/shield-threat-ransomware.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-se-tactics': {
            id: 'shield-se-tactics',
            title: 'Social Engineering Tactics',
            description: 'SE attack techniques',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['threats', 'security'],
            paths: ['security-plus'],
            components: {
                applet: 'houses/shield/applets/threats/social_engineering_attack/shield-threat-social-engineering.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-apt': {
            id: 'shield-apt',
            title: 'Advanced Persistent Threats',
            description: 'APT attack lifecycle and nation-state threat actors',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['threats', 'security'],
            paths: ['security-plus'],
            components: {
                applet: 'houses/shield/applets/threats/apt/shield-threat-apt.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-botnets': {
            id: 'shield-botnets',
            title: 'Botnets',
            description: 'Botnet architecture, C2 communication, and DDoS coordination',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['threats', 'security'],
            paths: ['security-plus'],
            components: {
                applet: 'houses/shield/applets/threats/botnets/shield-threat-botnets.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-cryptojacking': {
            id: 'shield-cryptojacking',
            title: 'Cryptojacking',
            description: 'Unauthorized cryptocurrency mining attacks',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['threats', 'security'],
            paths: ['security-plus'],
            components: {
                applet: 'houses/shield/applets/threats/cryptojacking/shield-threat-cryptojacking.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-ddos': {
            id: 'shield-ddos',
            title: 'DDoS Attacks',
            description: 'Distributed denial-of-service attack types and mitigation',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['threats', 'security'],
            paths: ['security-plus'],
            components: {
                applet: 'houses/shield/applets/threats/ddos/shield-threat-ddos.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-dns-attacks': {
            id: 'shield-dns-attacks',
            title: 'DNS Attacks',
            description: 'DNS poisoning, hijacking, and tunneling attacks',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['threats', 'security'],
            paths: ['security-plus'],
            components: {
                applet: 'houses/shield/applets/threats/dns_attacks/shield-threat-dns-attacks.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-insider-threats': {
            id: 'shield-insider-threats',
            title: 'Insider Threats',
            description: 'Internal threat actors and data exfiltration risks',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['threats', 'security'],
            paths: ['security-plus'],
            components: {
                applet: 'houses/shield/applets/threats/insider_threats/shield-threat-insider-threats.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-iot-threats': {
            id: 'shield-iot-threats',
            title: 'IoT Threats',
            description: 'Internet of Things security vulnerabilities and attack vectors',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['threats', 'security'],
            paths: ['security-plus'],
            components: {
                applet: 'houses/shield/applets/threats/iot_threats/shield-threat-iot-threats.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-mitm': {
            id: 'shield-mitm',
            title: 'Man-in-the-Middle',
            description: 'MITM attack techniques and prevention',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['threats', 'security'],
            paths: ['security-plus'],
            components: {
                applet: 'houses/shield/applets/threats/mitm/shield-threat-mitm.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-privilege-escalation': {
            id: 'shield-privilege-escalation',
            title: 'Privilege Escalation',
            description: 'Vertical and horizontal privilege escalation techniques',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['threats', 'security'],
            paths: ['security-plus'],
            components: {
                applet: 'houses/shield/applets/threats/privilege_escalation/shield-threat-privilege-escalation.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-rootkits': {
            id: 'shield-rootkits',
            title: 'Rootkits',
            description: 'Rootkit types, detection, and removal techniques',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['threats', 'security'],
            paths: ['security-plus'],
            components: {
                applet: 'houses/shield/applets/threats/rootkits/shield-threat-rootkits.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-supply-chain': {
            id: 'shield-supply-chain',
            title: 'Supply Chain Attacks',
            description: 'Software supply chain compromise and vendor risk',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['threats', 'security'],
            paths: ['security-plus'],
            components: {
                applet: 'houses/shield/applets/threats/supply_chain/shield-threat-supply-chain.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-zero-day': {
            id: 'shield-zero-day',
            title: 'Zero-Day Exploits',
            description: 'Zero-day vulnerabilities and exploit lifecycle',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['threats', 'security'],
            paths: ['security-plus'],
            components: {
                applet: 'houses/shield/applets/threats/zero_day/shield-threat-zero-day.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-security-pres': {
            id: 'shield-security-pres',
            title: 'Security Presentation',
            description: 'Security fundamentals slides',
            house: 'shield',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['fundamentals', 'security'],
            paths: ['security-plus'],
            components: {
                presentation: 'houses/shield/presentations/shield-security.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-cia-quiz': {
            id: 'shield-cia-quiz',
            title: 'CIA Triad Quiz',
            description: 'Test CIA triad knowledge',
            house: 'shield',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['fundamentals', 'security'],
            paths: ['security-plus'],
            components: {
                quiz: 'houses/shield/quizzes/shield-cia-triad.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'cse-06-monitoring': {
            id: 'cse-06-monitoring',
            title: 'CSE: Security Monitoring & IR',
            description: 'Cloud logging, SIEM/SOAR, CSPM, and incident response workflows',
            house: 'shield',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['risk-management', 'security'],
            paths: ['cse'],
            components: {
                presentation: 'houses/shield/presentations/shield-cse-06-security-monitoring-incident-response.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'cse-07-risk': {
            id: 'cse-07-risk',
            title: 'CSE: Risk Assessment & Management',
            description: 'Cloud risk categories, NIST RMF, controls, and risk response strategies',
            house: 'shield',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['risk-management', 'security'],
            paths: ['cse'],
            components: {
                presentation: 'houses/shield/presentations/shield-cse-07-risk-assessment-management.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'cse-08-compliance': {
            id: 'cse-08-compliance',
            title: 'CSE: Compliance & Governance',
            description: 'GDPR, HIPAA, PCI-DSS, SOX, NIST CSF, and cloud compliance tools',
            house: 'shield',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['risk-management', 'security'],
            paths: ['cse'],
            components: {
                presentation: 'houses/shield/presentations/shield-cse-08-compliance-governance.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'cse-06-quiz': {
            id: 'cse-06-quiz',
            title: 'CSE: Security Monitoring Quiz',
            description: 'Test SIEM, SOAR, and IR knowledge',
            house: 'shield',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['risk-management', 'security'],
            paths: ['cse'],
            components: {
                quiz: 'houses/shield/quizzes/shield-cse-06.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'cse-07-quiz': {
            id: 'cse-07-quiz',
            title: 'CSE: Risk Management Quiz',
            description: 'Test risk assessment and NIST RMF knowledge',
            house: 'shield',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['risk-management', 'security'],
            paths: ['cse'],
            components: {
                quiz: 'houses/shield/quizzes/shield-cse-07.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'cse-08-quiz': {
            id: 'cse-08-quiz',
            title: 'CSE: Compliance Quiz',
            description: 'Test GDPR, HIPAA, PCI-DSS compliance knowledge',
            house: 'shield',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['risk-management', 'security'],
            paths: ['cse'],
            components: {
                quiz: 'houses/shield/quizzes/shield-cse-08.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-zero-trust': {
            id: 'shield-zero-trust',
            title: 'Zero Trust Architecture',
            description: 'NIST SP 800-207 tenets, deperimeterization, microsegmentation, continuous verification',
            house: 'shield',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 25,
            topics: ['architecture', 'security'],
            paths: ['security-plus'],
            components: {
                quiz: 'houses/shield/tools/shield-zero-trust.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-ir-forensics': {
            id: 'shield-ir-forensics',
            title: 'Incident Response & Forensics Lab',
            description: 'NIST SP 800-61R2 IR lifecycle, RFC 3227 volatility, digital forensics, IOC detection',
            house: 'shield',
            type: 'lab',
            difficulty: 'intermediate',
            duration: 55,
            topics: ['operations', 'security'],
            paths: ['security-plus', 'security-operations'],
            components: {
                lab: 'houses/shield/labs/shield-ir-forensics.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-ics-scada': {
            id: 'shield-ics-scada',
            title: 'ICS/SCADA Security Simulator',
            description: 'Industrial control systems, PLCs, RTUs, HMIs, Modbus/DNP3 protocols, critical infrastructure',
            house: 'shield',
            type: 'lab',
            difficulty: 'intermediate',
            duration: 55,
            topics: ['operations', 'security'],
            paths: ['security-plus'],
            components: {
                lab: 'houses/shield/applets/operations/shield-ics-scada-security.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-laws-regulations': {
            id: 'shield-laws-regulations',
            title: 'Laws & Regulations Reference',
            description: 'GDPR, HIPAA, SOX, GLBA, CCPA, PCI-DSS - US/international privacy and security laws',
            house: 'shield',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 25,
            topics: ['compliance', 'security', 'aws'],
            paths: ['security-plus', 'aws-ccp', 'security-operations'],
            components: {
                quiz: 'houses/shield/applets/compliance/shield-laws-regulations.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-security-models': {
            id: 'shield-security-models',
            title: 'Security Models Visualizer',
            description: 'Bell-LaPadula, Biba, Clark-Wilson, Brewer-Nash - confidentiality and integrity models',
            house: 'shield',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 25,
            topics: ['architecture', 'security'],
            paths: ['security-plus'],
            components: {
                quiz: 'houses/shield/tools/shield-security-models.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-secure-sdlc': {
            id: 'shield-secure-sdlc',
            title: 'Secure SDLC Framework',
            description: 'SDLC phases, DevSecOps, SAST/DAST/IAST, OWASP Top 10, CMM/CMMI maturity levels',
            house: 'shield',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 25,
            topics: ['fundamentals', 'security'],
            paths: ['security-plus', 'comptia-network', 'security-operations'],
            components: {
                quiz: 'houses/shield/applets/fundamentals/shield-secure-sdlc-framework.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-business-continuity': {
            id: 'shield-business-continuity',
            title: 'Business Continuity Planner',
            description: 'BIA, BCP, DRP - RTO, RPO, MTD calculations, hot/warm/cold sites, backup strategies',
            house: 'shield',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 25,
            topics: ['risk-management', 'security'],
            paths: ['security-plus'],
            components: {
                quiz: 'houses/shield/applets/risk/shield-business-continuity-planner.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-governance-dashboard': {
            id: 'shield-governance-dashboard',
            title: 'Security Governance Dashboard',
            description: 'Policy hierarchy, roles & responsibilities, control frameworks, (ISC)² Code of Ethics',
            house: 'shield',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 25,
            topics: ['compliance', 'security'],
            paths: ['security-plus', 'security-operations'],
            components: {
                quiz: 'houses/shield/applets/fundamentals/shield-security-governance-dashboard.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-cve-lookup': {
            id: 'shield-cve-lookup',
            title: 'CVE Lookup Tool',
            description: 'Search and analyze CVE vulnerabilities',
            house: 'shield',
            type: 'module',
            difficulty: 'beginner',
            duration: 30,
            topics: ['threats', 'security'],
            paths: ['security-plus'],
            components: {
                applet: 'houses/shield/tools/shield-cve-lookup.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-google-dorking': {
            id: 'shield-google-dorking',
            title: 'Google Dorking OSINT',
            description: 'OSINT techniques using Google search operators',
            house: 'shield',
            type: 'module',
            difficulty: 'beginner',
            duration: 30,
            topics: ['threats', 'security'],
            paths: ['security-plus', 'comptia-network', 'security-operations'],
            components: {
                applet: 'houses/shield/tools/shield-google-dorking-osint.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-attack-vector': {
            id: 'shield-attack-vector',
            title: 'Attack Vector Challenge',
            description: 'Interactive attack vector identification',
            house: 'shield',
            type: 'module',
            difficulty: 'beginner',
            duration: 30,
            topics: ['threats', 'security'],
            paths: ['security-plus'],
            components: {
                applet: 'houses/shield/challenges/shield-attack-vector-challenge.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-fundamentals-lab': {
            id: 'shield-fundamentals-lab',
            title: 'Security Fundamentals Lab',
            description: 'Hands-on exercises: CIA Triad, controls, ethics, design principles',
            house: 'shield',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['fundamentals', 'security'],
            paths: ['security-plus'],
            components: {
                lab: 'houses/shield/labs/shield-security-fundamentals.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-fundamentals-quiz': {
            id: 'shield-fundamentals-quiz',
            title: 'Security Fundamentals Quiz',
            description: '15-question assessment covering core security concepts',
            house: 'shield',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['fundamentals', 'security'],
            paths: ['security-plus'],
            components: {
                quiz: 'houses/shield/quizzes/shield-security-fundamentals.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-network-lab': {
            id: 'shield-network-lab',
            title: 'Network Security Lab',
            description: 'Hands-on: Firewalls, VPNs, IDS/IPS, protocols, wireless security',
            house: 'shield',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['network-security', 'security', 'networking'],
            paths: ['security-plus', 'comptia-network'],
            components: {
                lab: 'houses/shield/labs/shield-network-security.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-network-quiz': {
            id: 'shield-network-quiz',
            title: 'Network Security Quiz',
            description: '15-question assessment on network defense concepts',
            house: 'shield',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['network-security', 'security', 'networking'],
            paths: ['security-plus', 'comptia-network'],
            components: {
                quiz: 'houses/shield/quizzes/shield-network-security.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-crypto-lab': {
            id: 'shield-crypto-lab',
            title: 'Cryptography Lab',
            description: 'Hands-on: Encryption, hashing, key exchange, signatures, PKI',
            house: 'shield',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['cryptography', 'security'],
            paths: ['security-plus', 'cryptography-track'],
            components: {
                lab: 'houses/shield/labs/shield-cryptography.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-crypto-quiz': {
            id: 'shield-crypto-quiz',
            title: 'Cryptography Quiz',
            description: '15-question assessment on cryptographic concepts',
            house: 'shield',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['cryptography', 'security'],
            paths: ['security-plus', 'cryptography-track'],
            components: {
                quiz: 'houses/shield/quizzes/shield-cryptography.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-access-lab': {
            id: 'shield-access-lab',
            title: 'Access Control Lab',
            description: 'Hands-on: DAC/MAC/RBAC, biometrics, Kerberos, IAM',
            house: 'shield',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['access-control', 'security'],
            paths: ['security-plus'],
            components: {
                lab: 'houses/shield/labs/shield-access-control.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-access-quiz': {
            id: 'shield-access-quiz',
            title: 'Access Control Quiz',
            description: '15-question assessment on authentication and authorization',
            house: 'shield',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['access-control', 'security'],
            paths: ['security-plus'],
            components: {
                quiz: 'houses/shield/quizzes/shield-access-control.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-compliance-lab': {
            id: 'shield-compliance-lab',
            title: 'Compliance & Governance Lab',
            description: 'Hands-on: GDPR, HIPAA, PCI-DSS, CMMC frameworks',
            house: 'shield',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['compliance', 'security'],
            paths: ['security-plus', 'security-operations'],
            components: {
                lab: 'houses/shield/labs/shield-compliance.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-compliance-quiz': {
            id: 'shield-compliance-quiz',
            title: 'Compliance & Governance Quiz',
            description: '15-question assessment on regulatory compliance',
            house: 'shield',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['compliance', 'security'],
            paths: ['security-plus', 'security-operations'],
            components: {
                quiz: 'houses/shield/quizzes/shield-compliance.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-threats-lab': {
            id: 'shield-threats-lab',
            title: 'Threats & Attack Vectors Lab',
            description: 'Hands-on: Malware, social engineering, web attacks, OSINT',
            house: 'shield',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['threats', 'security'],
            paths: ['security-plus'],
            components: {
                lab: 'houses/shield/labs/shield-threats.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-threats-quiz': {
            id: 'shield-threats-quiz',
            title: 'Threats & Attack Vectors Quiz',
            description: '15-question assessment on threat landscape',
            house: 'shield',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['threats', 'security'],
            paths: ['security-plus'],
            components: {
                quiz: 'houses/shield/quizzes/shield-threats.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-cysa-toolkit': {
            id: 'shield-cysa-toolkit',
            title: 'CySA+ v3 Analyst Toolkit',
            description: 'Security operations, vulnerability management, threat intel, and incident response reference',
            house: 'shield',
            type: 'quiz',
            difficulty: 'intermediate',
            duration: 25,
            topics: ['operations', 'security'],
            paths: ['security-plus', 'security-operations'],
            components: {
                quiz: 'houses/shield/applets/operations/shield-cysa-analyst-toolkit.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-cfr310-ir': {
            id: 'shield-cfr310-ir',
            title: 'CFR-310 Incident Response',
            description: 'IR lifecycle, Windows/Linux tools, IOC checklist, containment strategies, data sources',
            house: 'shield',
            type: 'quiz',
            difficulty: 'intermediate',
            duration: 25,
            topics: ['operations', 'security'],
            paths: ['security-plus', 'security-operations'],
            components: {
                quiz: 'houses/shield/applets/operations/shield-cfr-310-incident-response.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-pentest-toolkit': {
            id: 'shield-pentest-toolkit',
            title: 'PenTest+ Penetration Testing Toolkit',
            description: 'Pentest methodologies, recon, exploitation, OWASP Top 10, privilege escalation, reporting',
            house: 'shield',
            type: 'quiz',
            difficulty: 'intermediate',
            duration: 25,
            topics: ['operations', 'security'],
            paths: ['security-plus', 'devops-fundamentals', 'security-operations'],
            components: {
                quiz: 'houses/shield/applets/operations/shield-pentest-plus-toolkit.applet.html'
            },
            prerequisites: [],
            objectives: []
        }
,

        // ─────────────────────────────────────────────────────────────
        // WEB HOUSE - 71 new entries
        // ─────────────────────────────────────────────────────────────
        'shield-cism-dashboard': {
            id: 'shield-cism-dashboard',
            title: 'CISM Management Dashboard',
            description: 'ISACA CISM 4 domains - governance, risk, program development, incident management',
            house: 'shield',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 25,
            topics: ['compliance', 'security'],
            paths: ['security-plus', 'security-operations'],
            components: {
                quiz: 'houses/shield/applets/governance/shield-cism-management-dashboard.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-burp-training': {
            id: 'web-burp-training',
            title: 'Burp Suite Training Lab',
            description: 'Interactive web app security testing. Intercept, modify, and analyze HTTP requests.',
            house: 'web',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 45,
            topics: ['simulators', 'networking'],
            paths: ['comptia-network', 'ccna'],
            components: {
                quiz: 'houses/web/tools/web-burp.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-sqlmap-training': {
            id: 'web-sqlmap-training',
            title: 'SQLMap Training Lab',
            description: 'SQL injection automation simulator. Database enumeration, data extraction, and injection techniques.',
            house: 'web',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 45,
            topics: ['simulators', 'networking'],
            paths: ['comptia-network', 'ccna'],
            components: {
                quiz: 'houses/web/tools/web-sqlmap.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-gobuster-training': {
            id: 'web-gobuster-training',
            title: 'Gobuster Training Lab',
            description: 'Directory and DNS enumeration simulator. Hidden paths, subdomains, and vhost discovery.',
            house: 'web',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 45,
            topics: ['simulators', 'networking'],
            paths: ['comptia-network', 'ccna'],
            components: {
                quiz: 'houses/web/tools/web-gobuster.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-nikto-training': {
            id: 'web-nikto-training',
            title: 'Nikto Training Lab',
            description: 'Web server vulnerability scanner simulator. Misconfigurations, outdated software, and dangerous files.',
            house: 'web',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 45,
            topics: ['simulators', 'networking'],
            paths: ['comptia-network', 'ccna'],
            components: {
                quiz: 'houses/web/tools/web-nikto.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-networking-guide': {
            id: 'web-networking-guide',
            title: 'Networking Interactive Guide',
            description: 'Chapters 7-10: IP addressing, subnetting, NAT/PAT, routing protocols with flashcards and quiz',
            house: 'web',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 35,
            topics: ['visualizers', 'networking'],
            paths: ['comptia-network', 'ccna'],
            components: {
                quiz: 'houses/web/applets/web-networking-interactive.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-exam-flashcards': {
            id: 'web-exam-flashcards',
            title: 'Networking Exam Flashcards',
            description: '85 flashcards covering all networking topics - Windows, CIDR, OSI, cabling, wireless & more',
            house: 'web',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['visualizers', 'networking'],
            paths: ['comptia-network', 'ccna', 'aws-ccp'],
            components: {
                applet: 'houses/web/exams/web-networking-exam-flashcards.exam.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-nat': {
            id: 'web-nat',
            title: 'NAT Visualization',
            description: 'Network Address Translation concepts',
            house: 'web',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['ip-addressing', 'networking'],
            paths: ['comptia-network', 'ccna'],
            components: {
                applet: 'houses/web/applets/ip-addressing/nat-pat/web-ip-nat-pat.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-binary-converter': {
            id: 'web-binary-converter',
            title: 'Binary/Decimal Converter',
            description: 'Convert between binary and decimal',
            house: 'web',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['ip-addressing', 'networking'],
            paths: ['comptia-network', 'ccna'],
            components: {
                applet: 'houses/web/applets/ip-addressing/web-binary-decimal-converter.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-binary-ip': {
            id: 'web-binary-ip',
            title: 'Binary IP Addressing',
            description: 'Understand IP addresses in binary',
            house: 'web',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['ip-addressing', 'networking'],
            paths: ['comptia-network', 'ccna'],
            components: {
                applet: 'houses/web/applets/ip-addressing/binary-ip/web-ip-binary-ip.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-class-a': {
            id: 'web-class-a',
            title: 'Class A Networks',
            description: 'Class A IP addressing explained',
            house: 'web',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['ip-addressing', 'networking'],
            paths: ['comptia-network', 'ccna'],
            components: {
                applet: 'houses/web/applets/ip-addressing/ipv4-classes/web-ip-ipv4-classes.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-class-b': {
            id: 'web-class-b',
            title: 'Class B Networks',
            description: 'Class B IP addressing explained',
            house: 'web',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['ip-addressing', 'networking'],
            paths: ['comptia-network', 'ccna'],
            components: {
                applet: 'houses/web/applets/ip-addressing/ipv4-classes/web-ip-ipv4-classes.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-intro-subnetting': {
            id: 'web-intro-subnetting',
            title: 'Intro to Subnetting',
            description: 'Subnetting fundamentals',
            house: 'web',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['ip-addressing', 'networking'],
            paths: ['comptia-network', 'ccna'],
            components: {
                applet: 'houses/web/applets/ip-addressing/subnetting-practice/web-ip-subnetting-practice.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-network-classes': {
            id: 'web-network-classes',
            title: 'Network Classes',
            description: 'IP address classes visualization',
            house: 'web',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['ip-addressing', 'networking'],
            paths: ['comptia-network', 'ccna'],
            components: {
                applet: 'houses/web/applets/ip-addressing/network-classes/web-ip-network-classes.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-network-addressing': {
            id: 'web-network-addressing',
            title: 'Understanding Addresses',
            description: 'IP addressing fundamentals',
            house: 'web',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['ip-addressing', 'networking'],
            paths: ['comptia-network', 'ccna'],
            components: {
                applet: 'houses/web/applets/ip-addressing/private-public-ip/web-ip-private-public-ip.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-cidr-notation': {
            id: 'web-cidr-notation',
            title: 'CIDR Notation',
            description: 'Classless Inter-Domain Routing notation and calculations',
            house: 'web',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['ip-addressing', 'networking'],
            paths: ['comptia-network', 'ccna'],
            components: {
                applet: 'houses/web/applets/ip-addressing/cidr-notation/web-ip-cidr-notation.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-subnet-calculator': {
            id: 'web-subnet-calculator',
            title: 'Subnet Calculator',
            description: 'Interactive subnet calculation tool',
            house: 'web',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['ip-addressing', 'networking'],
            paths: ['comptia-network', 'ccna'],
            components: {
                applet: 'houses/web/applets/ip-addressing/subnet-calculator/web-ip-subnet-calculator.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-subnet-masks': {
            id: 'web-subnet-masks',
            title: 'Subnet Masks',
            description: 'Understanding and applying subnet masks',
            house: 'web',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['ip-addressing', 'networking'],
            paths: ['comptia-network', 'ccna'],
            components: {
                applet: 'houses/web/applets/ip-addressing/subnet-masks/web-ip-subnet-masks.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-supernetting': {
            id: 'web-supernetting',
            title: 'Supernetting',
            description: 'Route aggregation and supernet calculations',
            house: 'web',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['ip-addressing', 'networking'],
            paths: ['comptia-network', 'ccna'],
            components: {
                applet: 'houses/web/applets/ip-addressing/supernetting/web-ip-supernetting.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-wildcard-masks': {
            id: 'web-wildcard-masks',
            title: 'Wildcard Masks',
            description: 'Wildcard mask calculations for ACLs and routing',
            house: 'web',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['ip-addressing', 'networking'],
            paths: ['comptia-network', 'ccna'],
            components: {
                applet: 'houses/web/applets/ip-addressing/wildcard-masks/web-ip-wildcard-masks.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-ipv6-addressing': {
            id: 'web-ipv6-addressing',
            title: 'IPv6 Addressing',
            description: 'IPv6 address types, notation, and configuration',
            house: 'web',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['ip-addressing', 'networking'],
            paths: ['comptia-network', 'ccna'],
            components: {
                applet: 'houses/web/applets/ip-addressing/ipv6-addressing/web-ip-ipv6-addressing.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-acl-viz': {
            id: 'web-acl-viz',
            title: 'ACL Visualizer',
            description: 'Access Control Lists visualization',
            house: 'web',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['visualizers', 'networking'],
            paths: ['comptia-network', 'ccna'],
            components: {
                applet: 'houses/web/tools/web-acl.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-cable-viz': {
            id: 'web-cable-viz',
            title: 'Cable Visualizer',
            description: 'Network cable types and standards',
            house: 'web',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['visualizers', 'networking'],
            paths: ['comptia-network', 'ccna'],
            components: {
                applet: 'houses/web/tools/web-cable.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-devices-viz': {
            id: 'web-devices-viz',
            title: 'Devices Visualizer',
            description: 'Network device types and roles',
            house: 'web',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['visualizers', 'networking'],
            paths: ['comptia-network', 'ccna'],
            components: {
                applet: 'houses/web/tools/web-devices.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-etherchannel-viz': {
            id: 'web-etherchannel-viz',
            title: 'EtherChannel Visualizer',
            description: 'Link aggregation visualization',
            house: 'web',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['routing-switching', 'networking'],
            paths: ['comptia-network', 'ccna'],
            components: {
                applet: 'houses/web/tools/web-etherchannel.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-fhrp-viz': {
            id: 'web-fhrp-viz',
            title: 'FHRP Visualizer',
            description: 'Gateway redundancy protocols',
            house: 'web',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['routing-switching', 'networking'],
            paths: ['comptia-network', 'ccna'],
            components: {
                applet: 'houses/web/tools/web-fhrp.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-ipv6-viz': {
            id: 'web-ipv6-viz',
            title: 'IPv6 Visualizer',
            description: 'IPv6 addressing visualization',
            house: 'web',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['ip-addressing', 'networking'],
            paths: ['comptia-network', 'ccna'],
            components: {
                applet: 'houses/web/tools/web-ipv6.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-osi-deep-viz': {
            id: 'web-osi-deep-viz',
            title: 'OSI Deep Dive Visualizer',
            description: 'Detailed OSI layer exploration',
            house: 'web',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['visualizers', 'networking'],
            paths: ['comptia-network', 'ccna'],
            components: {
                applet: 'houses/web/tools/web-osi-deep-dive.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-osi-viz': {
            id: 'web-osi-viz',
            title: 'OSI Visualizer',
            description: 'OSI model interactive diagram',
            house: 'web',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['visualizers', 'networking'],
            paths: ['comptia-network', 'ccna'],
            components: {
                applet: 'houses/web/tools/web-osi.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-ospf-cost-viz': {
            id: 'web-ospf-cost-viz',
            title: 'OSPF Cost Visualizer',
            description: 'OSPF cost calculation tool',
            house: 'web',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['routing-switching', 'networking'],
            paths: ['comptia-network', 'ccna'],
            components: {
                applet: 'houses/web/tools/web-ospf-cost.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-port-viz': {
            id: 'web-port-viz',
            title: 'Port Visualizer',
            description: 'Common ports and protocols',
            house: 'web',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['visualizers', 'networking'],
            paths: ['comptia-network', 'ccna'],
            components: {
                applet: 'houses/web/tools/web-port.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-qos-viz': {
            id: 'web-qos-viz',
            title: 'QoS Visualizer',
            description: 'Quality of Service concepts',
            house: 'web',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['visualizers', 'networking'],
            paths: ['comptia-network', 'ccna'],
            components: {
                applet: 'houses/web/tools/web-qos.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-security-viz': {
            id: 'web-security-viz',
            title: 'Security Visualizer',
            description: 'Network security concepts',
            house: 'web',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['visualizers', 'networking'],
            paths: ['comptia-network', 'ccna', 'security-plus'],
            components: {
                applet: 'houses/web/tools/web-security.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-stp-viz': {
            id: 'web-stp-viz',
            title: 'STP Visualizer',
            description: 'Spanning Tree Protocol simulation',
            house: 'web',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['routing-switching', 'networking'],
            paths: ['comptia-network', 'ccna'],
            components: {
                applet: 'houses/web/tools/web-stp.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-subnetting-viz': {
            id: 'web-subnetting-viz',
            title: 'Subnetting Visualizer',
            description: 'Subnet calculation visualization',
            house: 'web',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['ip-addressing', 'networking'],
            paths: ['comptia-network', 'ccna'],
            components: {
                applet: 'houses/web/tools/web-subnetting.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-switch-ops-viz': {
            id: 'web-switch-ops-viz',
            title: 'Switch Operations Visualizer',
            description: 'Switch forwarding process',
            house: 'web',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['routing-switching', 'networking'],
            paths: ['comptia-network', 'ccna'],
            components: {
                applet: 'houses/web/tools/web-switch-operations.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-topology-viz': {
            id: 'web-topology-viz',
            title: 'Topology Visualizer',
            description: 'Network topology types',
            house: 'web',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['visualizers', 'networking'],
            paths: ['comptia-network', 'ccna'],
            components: {
                applet: 'houses/web/tools/web-topology.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-troubleshoot-viz': {
            id: 'web-troubleshoot-viz',
            title: 'Troubleshooting Visualizer',
            description: 'Network troubleshooting process',
            house: 'web',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['visualizers', 'networking'],
            paths: ['comptia-network', 'ccna'],
            components: {
                applet: 'houses/web/tools/web-troubleshooting.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-vlan-viz': {
            id: 'web-vlan-viz',
            title: 'VLAN Visualizer',
            description: 'Virtual LAN concepts',
            house: 'web',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['routing-switching', 'networking'],
            paths: ['comptia-network', 'ccna'],
            components: {
                applet: 'houses/web/tools/web-vlan.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-wireless-arch-viz': {
            id: 'web-wireless-arch-viz',
            title: 'Wireless Architecture Visualizer',
            description: 'Wireless network architecture',
            house: 'web',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['wireless', 'networking'],
            paths: ['comptia-network', 'ccna'],
            components: {
                applet: 'houses/web/tools/web-wireless-architecture.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-wireless-viz': {
            id: 'web-wireless-viz',
            title: 'Wireless Visualizer',
            description: 'WiFi standards and concepts',
            house: 'web',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['wireless', 'networking'],
            paths: ['comptia-network', 'ccna'],
            components: {
                applet: 'houses/web/tools/web-wireless.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-http-codes': {
            id: 'web-http-codes',
            title: 'HTTP Status Codes',
            description: 'HTTP response codes reference',
            house: 'web',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['visualizers', 'networking'],
            paths: ['comptia-network', 'ccna'],
            components: {
                applet: 'houses/web/applets/services/web-http-status-codes.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-smb': {
            id: 'web-smb',
            title: 'SMB File Sharing Guide',
            description: 'SMB protocol and file sharing',
            house: 'web',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['visualizers', 'networking'],
            paths: ['comptia-network', 'ccna'],
            components: {
                applet: 'houses/web/applets/services/web-smb-file-sharing.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-server-compare': {
            id: 'web-server-compare',
            title: 'Web Server Comparison',
            description: 'Compare Apache, Nginx, IIS',
            house: 'web',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['visualizers', 'networking'],
            paths: ['comptia-network', 'ccna'],
            components: {
                applet: 'houses/web/applets/services/web-server-comparison.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-arp-pres': {
            id: 'web-arp-pres',
            title: 'ARP Presentation',
            description: 'Address Resolution Protocol',
            house: 'web',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['presentations', 'networking'],
            paths: ['comptia-network', 'ccna'],
            components: {
                presentation: 'houses/web/presentations/web-arp.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-cables-pres': {
            id: 'web-cables-pres',
            title: 'Cables Presentation',
            description: 'Network cabling types',
            house: 'web',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['presentations', 'networking'],
            paths: ['comptia-network', 'ccna'],
            components: {
                presentation: 'houses/web/presentations/web-cables.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-devices-pres': {
            id: 'web-devices-pres',
            title: 'Devices Presentation',
            description: 'Network devices overview',
            house: 'web',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['presentations', 'networking'],
            paths: ['comptia-network', 'ccna'],
            components: {
                presentation: 'houses/web/presentations/web-devices.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-dhcp-pres': {
            id: 'web-dhcp-pres',
            title: 'DHCP Presentation',
            description: 'Dynamic Host Configuration',
            house: 'web',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['presentations', 'networking'],
            paths: ['comptia-network', 'ccna'],
            components: {
                presentation: 'houses/web/presentations/web-dhcp.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-dns-pres': {
            id: 'web-dns-pres',
            title: 'DNS Presentation',
            description: 'Domain Name System',
            house: 'web',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['presentations', 'networking'],
            paths: ['comptia-network', 'ccna'],
            components: {
                presentation: 'houses/web/presentations/web-dns.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-eigrp-pres': {
            id: 'web-eigrp-pres',
            title: 'EIGRP Presentation',
            description: 'Enhanced Interior Gateway Routing',
            house: 'web',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['presentations', 'networking'],
            paths: ['comptia-network', 'ccna'],
            components: {
                presentation: 'houses/web/presentations/web-eigrp.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-etherchannel-pres': {
            id: 'web-etherchannel-pres',
            title: 'EtherChannel Presentation',
            description: 'Link aggregation',
            house: 'web',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['presentations', 'networking'],
            paths: ['comptia-network', 'ccna'],
            components: {
                presentation: 'houses/web/presentations/web-etherchannel.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-ipv6-pres': {
            id: 'web-ipv6-pres',
            title: 'IPv6 Presentation',
            description: 'IPv6 addressing slides',
            house: 'web',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['presentations', 'networking'],
            paths: ['comptia-network', 'ccna'],
            components: {
                presentation: 'houses/web/presentations/web-ipv6.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-nat-pres': {
            id: 'web-nat-pres',
            title: 'NAT Presentation',
            description: 'Network Address Translation',
            house: 'web',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['presentations', 'networking'],
            paths: ['comptia-network', 'ccna'],
            components: {
                presentation: 'houses/web/presentations/web-nat.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-network-essentials-pres': {
            id: 'web-network-essentials-pres',
            title: 'Network Essentials',
            description: 'Networking fundamentals overview',
            house: 'web',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['presentations', 'networking'],
            paths: ['comptia-network', 'ccna'],
            components: {
                presentation: 'houses/web/presentations/web-network-essentials.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-ntp-pres': {
            id: 'web-ntp-pres',
            title: 'NTP Presentation',
            description: 'Network Time Protocol',
            house: 'web',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['presentations', 'networking'],
            paths: ['comptia-network', 'ccna'],
            components: {
                presentation: 'houses/web/presentations/web-ntp.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-osi-deep-pres': {
            id: 'web-osi-deep-pres',
            title: 'OSI Deep Dive',
            description: 'Detailed OSI model exploration',
            house: 'web',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['presentations', 'networking'],
            paths: ['comptia-network', 'ccna'],
            components: {
                presentation: 'houses/web/presentations/web-osi-deep-dive.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-osi-model-pres': {
            id: 'web-osi-model-pres',
            title: 'OSI Model',
            description: 'OSI 7-layer model reference',
            house: 'web',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['presentations', 'networking'],
            paths: ['comptia-network', 'ccna'],
            components: {
                presentation: 'houses/web/presentations/web-osi-model.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-ports-pres': {
            id: 'web-ports-pres',
            title: 'Ports Presentation',
            description: 'Common ports and protocols',
            house: 'web',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['presentations', 'networking'],
            paths: ['comptia-network', 'ccna'],
            components: {
                presentation: 'houses/web/presentations/web-ports.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-subnetting-pres': {
            id: 'web-subnetting-pres',
            title: 'Subnetting Presentation',
            description: 'IP subnetting fundamentals',
            house: 'web',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['presentations', 'networking'],
            paths: ['comptia-network', 'ccna'],
            components: {
                presentation: 'houses/web/presentations/web-subnetting.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-switch-ops-pres': {
            id: 'web-switch-ops-pres',
            title: 'Switch Operations',
            description: 'Layer 2 switching concepts',
            house: 'web',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['presentations', 'networking'],
            paths: ['comptia-network', 'ccna'],
            components: {
                presentation: 'houses/web/presentations/web-switch-operations.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-topologies-pres': {
            id: 'web-topologies-pres',
            title: 'Topologies Presentation',
            description: 'Network topology types',
            house: 'web',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['presentations', 'networking'],
            paths: ['comptia-network', 'ccna'],
            components: {
                presentation: 'houses/web/presentations/web-topologies.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-troubleshoot-pres': {
            id: 'web-troubleshoot-pres',
            title: 'Troubleshooting Presentation',
            description: 'Network troubleshooting methods',
            house: 'web',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['presentations', 'networking'],
            paths: ['comptia-network', 'ccna'],
            components: {
                presentation: 'houses/web/presentations/web-troubleshooting.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-wireless-arch-pres': {
            id: 'web-wireless-arch-pres',
            title: 'Wireless Architecture',
            description: 'Wireless network design',
            house: 'web',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['wireless', 'networking'],
            paths: ['comptia-network', 'ccna'],
            components: {
                presentation: 'houses/web/presentations/web-wireless-architecture.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-network-sim-v2': {
            id: 'web-network-sim-v2',
            title: 'Network Simulator v2',
            description: 'Interactive network simulation',
            house: 'web',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['simulators', 'networking'],
            paths: ['comptia-network', 'ccna'],
            components: {
                lab: 'houses/web/simulators/web-interactive-network-simulatorv2.simulator.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-osi-quiz': {
            id: 'web-osi-quiz',
            title: 'OSI Model Quiz',
            description: 'Test OSI model knowledge',
            house: 'web',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['visualizers', 'networking'],
            paths: ['comptia-network', 'ccna'],
            components: {
                quiz: 'houses/web/quizzes/web-osi.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-subnetting-quiz': {
            id: 'web-subnetting-quiz',
            title: 'Subnetting Quiz',
            description: 'Test subnetting skills',
            house: 'web',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['ip-addressing', 'networking'],
            paths: ['comptia-network', 'ccna'],
            components: {
                quiz: 'houses/web/quizzes/web-subnetting.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-ports-quiz': {
            id: 'web-ports-quiz',
            title: 'Ports & Protocols Quiz',
            description: 'Test networking ports knowledge',
            house: 'web',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['visualizers', 'networking'],
            paths: ['comptia-network', 'ccna'],
            components: {
                quiz: 'houses/web/quizzes/web-networking-fundamentals-ports.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-subnet-calc': {
            id: 'web-subnet-calc',
            title: 'Subnet Calculator',
            description: 'Calculate subnets, CIDR, and IP ranges',
            house: 'web',
            type: 'module',
            difficulty: 'beginner',
            duration: 30,
            topics: ['ip-addressing', 'networking'],
            paths: ['comptia-network', 'ccna'],
            components: {
                applet: 'houses/web/tools/web-subnet.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-dns-reference': {
            id: 'web-dns-reference',
            title: 'DNS Header Reference',
            description: 'DNS packet structure reference',
            house: 'web',
            type: 'module',
            difficulty: 'beginner',
            duration: 30,
            topics: ['presentations', 'networking'],
            paths: ['comptia-network', 'ccna'],
            components: {
                applet: 'houses/web/tools/web-dns-header.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-ip-addressing-module': {
            id: 'web-ip-addressing-module',
            title: 'IP Addressing (Ch 7-10)',
            description: 'Comprehensive IP addressing module',
            house: 'web',
            type: 'module',
            difficulty: 'beginner',
            duration: 30,
            topics: ['ip-addressing', 'networking'],
            paths: ['comptia-network', 'ccna'],
            components: {
                applet: 'houses/web/modules/web-ip-addressing-ch7-10.module.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-flashcards': {
            id: 'web-flashcards',
            title: 'Networking Flashcards',
            description: 'Study flashcards for networking concepts',
            house: 'web',
            type: 'module',
            difficulty: 'beginner',
            duration: 30,
            topics: ['visualizers', 'networking'],
            paths: ['comptia-network', 'ccna', 'aws-ccp'],
            components: {
                applet: 'houses/web/modules/web-networking-flashcards.module.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-textbook': {
            id: 'web-textbook',
            title: 'Networking Textbook (Ch 7-20)',
            description: 'Complete networking textbook reference',
            house: 'web',
            type: 'module',
            difficulty: 'beginner',
            duration: 30,
            topics: ['presentations', 'networking'],
            paths: ['comptia-network', 'ccna'],
            components: {
                applet: 'houses/web/textbook/web-networking-textbook-ch7-20.textbook.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-midterm': {
            id: 'web-midterm',
            title: 'Networking Midterm Exam',
            description: 'Comprehensive midterm assessment',
            house: 'web',
            type: 'module',
            difficulty: 'beginner',
            duration: 30,
            topics: ['labs', 'networking'],
            paths: ['comptia-network', 'ccna'],
            components: {
                applet: 'houses/web/exams/web-networking-midterm.exam.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-networking-fundamentals-lab': {
            id: 'web-networking-fundamentals-lab',
            title: 'Networking Fundamentals Lab',
            description: 'OSI model, IP addressing, TCP/UDP, devices, VLANs, and routing with interactive exercises',
            house: 'web',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['labs', 'networking'],
            paths: ['comptia-network', 'ccna'],
            components: {
                lab: 'houses/web/labs/web-networking-fundamentals.lab.html'
            },
            prerequisites: [],
            objectives: []
        }
,

        // ─────────────────────────────────────────────────────────────
        // CLOUD HOUSE - 35 new entries
        // ─────────────────────────────────────────────────────────────
        'web-static-routes-lab': {
            id: 'web-static-routes-lab',
            title: 'Static Routes Lab',
            description: 'Build a multi-layer Packet Tracer topology with static routing',
            house: 'web',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['labs', 'networking'],
            paths: ['comptia-network', 'ccna'],
            components: {
                lab: 'houses/web/labs/web-static-routes.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'cloud-architecture-designer': {
            id: 'cloud-architecture-designer',
            title: 'Cloud Architecture Designer',
            description: 'Interactive tool for designing cloud architectures',
            house: 'cloud',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['cloud'],
            paths: ['openstack'],
            components: {
                applet: 'houses/cloud/applets/architecture/cloud-architecture-designer.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'cloud-support-plans': {
            id: 'cloud-support-plans',
            title: 'AWS Support Plans',
            description: 'Compare AWS support tiers and features',
            house: 'cloud',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['cloud', 'aws'],
            paths: ['openstack', 'aws-ccp', 'comptia-network'],
            components: {
                applet: 'houses/cloud/tools/cloud-ch03-support-plans.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'cloud-regions': {
            id: 'cloud-regions',
            title: 'AWS Regions Explorer',
            description: 'Global infrastructure and availability zones',
            house: 'cloud',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['cloud', 'aws'],
            paths: ['openstack', 'aws-ccp'],
            components: {
                applet: 'houses/cloud/tools/cloud-ch04-aws-regions.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'cloud-iam-quiz': {
            id: 'cloud-iam-quiz',
            title: 'IAM Security Quiz',
            description: 'Test your AWS IAM knowledge',
            house: 'cloud',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['cloud'],
            paths: ['openstack', 'aws-ccp', 'security-plus'],
            components: {
                quiz: 'houses/cloud/quizzes/cloud-ch05-iam-security.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'cloud-ec2-visualizer': {
            id: 'cloud-ec2-visualizer',
            title: 'EC2 Instance Visualizer',
            description: 'Interactive EC2 instance types and pricing',
            house: 'cloud',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['cloud'],
            paths: ['openstack', 'aws-ccp'],
            components: {
                applet: 'houses/cloud/tools/cloud-ch07-ec2-instance.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'cloud-storage-quiz': {
            id: 'cloud-storage-quiz',
            title: 'Storage Services Quiz',
            description: 'Test your AWS storage knowledge',
            house: 'cloud',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['cloud'],
            paths: ['openstack'],
            components: {
                quiz: 'houses/cloud/quizzes/cloud-ch08-storage.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'cloud-database-quiz': {
            id: 'cloud-database-quiz',
            title: 'Database Services Quiz',
            description: 'Test your AWS database knowledge',
            house: 'cloud',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['cloud'],
            paths: ['openstack'],
            components: {
                quiz: 'houses/cloud/quizzes/cloud-ch09-database.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'cloud-networking-quiz': {
            id: 'cloud-networking-quiz',
            title: 'VPC Networking Quiz',
            description: 'Test your AWS networking knowledge',
            house: 'cloud',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['cloud', 'networking'],
            paths: ['openstack', 'aws-ccp', 'comptia-network'],
            components: {
                quiz: 'houses/cloud/quizzes/cloud-ch10-networking.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'cloud-automation': {
            id: 'cloud-automation',
            title: 'AWS Automation Explorer',
            description: 'CloudFormation, Elastic Beanstalk, and automation',
            house: 'cloud',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['cloud', 'aws'],
            paths: ['openstack', 'aws-ccp'],
            components: {
                applet: 'houses/cloud/tools/cloud-ch11-automation.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'cloud-use-cases': {
            id: 'cloud-use-cases',
            title: 'AWS Use Cases',
            description: 'Real-world AWS implementation scenarios',
            house: 'cloud',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['cloud', 'aws'],
            paths: ['openstack', 'aws-ccp'],
            components: {
                applet: 'houses/cloud/tools/cloud-ch12-use-cases.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'cloud-fundamentals-quiz': {
            id: 'cloud-fundamentals-quiz',
            title: 'Cloud Fundamentals Quiz',
            description: 'Test your cloud computing basics',
            house: 'cloud',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['cloud'],
            paths: ['openstack'],
            components: {
                quiz: 'houses/cloud/quizzes/cloud-ch01-cloud-fundamentals.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'cloud-visualizer': {
            id: 'cloud-visualizer',
            title: 'Cloud Visualizer',
            description: 'Interactive cloud concepts visualization',
            house: 'cloud',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['cloud'],
            paths: ['openstack'],
            components: {
                applet: 'houses/cloud/tools/cloud-cloud.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'cloud-lab-simulator': {
            id: 'cloud-lab-simulator',
            title: 'Cloud Lab Simulator',
            description: 'Hands-on cloud environment simulation',
            house: 'cloud',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['cloud'],
            paths: ['openstack'],
            components: {
                lab: 'houses/cloud/labs/cloud-lab.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'cloud-aws-fundamentals-pres': {
            id: 'cloud-aws-fundamentals-pres',
            title: 'AWS Fundamentals Presentation',
            description: 'Slide deck covering AWS basics',
            house: 'cloud',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['cloud', 'aws'],
            paths: ['openstack', 'aws-ccp'],
            components: {
                presentation: 'houses/cloud/presentations/cloud-aws-fundamentals.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'cloud-presentation': {
            id: 'cloud-presentation',
            title: 'Cloud Computing Presentation',
            description: 'Comprehensive cloud concepts slides',
            house: 'cloud',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['cloud'],
            paths: ['openstack'],
            components: {
                presentation: 'houses/cloud/presentations/cloud-cloud.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'cse-01-fundamentals': {
            id: 'cse-01-fundamentals',
            title: 'CSE: Cloud Fundamentals',
            description: 'Cloud computing basics and shared responsibility model',
            house: 'cloud',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['cloud'],
            paths: ['cse'],
            components: {
                presentation: 'houses/cloud/presentations/cloud-cse-01-cloud-fundamentals.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'cse-02-iam': {
            id: 'cse-02-iam',
            title: 'CSE: Identity & Access Management',
            description: 'IAM, RBAC, MFA, and identity federation in cloud',
            house: 'cloud',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['cloud'],
            paths: ['cse'],
            components: {
                presentation: 'houses/cloud/presentations/cloud-cse-02-identity-access-management.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'cse-03-encryption': {
            id: 'cse-03-encryption',
            title: 'CSE: Data Protection & Encryption',
            description: 'Encryption at rest/transit, key management, DLP',
            house: 'cloud',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['cloud', 'encryption'],
            paths: ['cse'],
            components: {
                presentation: 'houses/cloud/presentations/cloud-cse-03-data-protection-encryption.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'cse-04-network': {
            id: 'cse-04-network',
            title: 'CSE: Network Security',
            description: 'VPC, NACLs, security groups, firewalls, IDS/IPS',
            house: 'cloud',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['cloud', 'networking'],
            paths: ['cse'],
            components: {
                presentation: 'houses/cloud/presentations/cloud-cse-04-network-security.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'cse-05-appsec': {
            id: 'cse-05-appsec',
            title: 'CSE: Application Security',
            description: 'Secure SDLC, WAF, OWASP Top 10, container security',
            house: 'cloud',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['cloud'],
            paths: ['cse'],
            components: {
                presentation: 'houses/cloud/presentations/cloud-cse-05-application-security.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'cse-01-quiz': {
            id: 'cse-01-quiz',
            title: 'CSE: Cloud Fundamentals Quiz',
            description: 'Test your cloud computing basics knowledge',
            house: 'cloud',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['cloud'],
            paths: ['cse'],
            components: {
                quiz: 'houses/cloud/quizzes/cloud-cse-01.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'cse-02-quiz': {
            id: 'cse-02-quiz',
            title: 'CSE: IAM Quiz',
            description: 'Test identity and access management knowledge',
            house: 'cloud',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['cloud'],
            paths: ['cse'],
            components: {
                quiz: 'houses/cloud/quizzes/cloud-cse-02.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'cse-03-quiz': {
            id: 'cse-03-quiz',
            title: 'CSE: Data Protection Quiz',
            description: 'Test encryption and data protection knowledge',
            house: 'cloud',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['cloud'],
            paths: ['cse'],
            components: {
                quiz: 'houses/cloud/quizzes/cloud-cse-03.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'cse-04-quiz': {
            id: 'cse-04-quiz',
            title: 'CSE: Network Security Quiz',
            description: 'Test cloud network security knowledge',
            house: 'cloud',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['cloud', 'networking'],
            paths: ['cse'],
            components: {
                quiz: 'houses/cloud/quizzes/cloud-cse-04.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'cse-05-quiz': {
            id: 'cse-05-quiz',
            title: 'CSE: Application Security Quiz',
            description: 'Test application security knowledge',
            house: 'cloud',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['cloud'],
            paths: ['cse'],
            components: {
                quiz: 'houses/cloud/quizzes/cloud-cse-05.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'cse-06-monitoring': {
            id: 'cse-06-monitoring',
            title: 'CSE: Security Monitoring & IR',
            description: 'SIEM, SOAR, CSPM, CNAPP, and incident response',
            house: 'cloud',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['cloud'],
            paths: ['cse'],
            components: {
                presentation: 'houses/cloud/presentations/cloud-cse-06-security-monitoring-ir.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'cse-06-quiz': {
            id: 'cse-06-quiz',
            title: 'CSE: Monitoring & IR Quiz',
            description: 'Test cloud monitoring and IR knowledge',
            house: 'cloud',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['cloud'],
            paths: ['cse'],
            components: {
                quiz: 'houses/cloud/quizzes/cloud-cse-06.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'cse-07-risk': {
            id: 'cse-07-risk',
            title: 'CSE: Risk Assessment & Management',
            description: 'Risk frameworks, NIST RMF, quantitative vs qualitative',
            house: 'cloud',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['cloud'],
            paths: ['cse'],
            components: {
                presentation: 'houses/cloud/presentations/cloud-cse-07-risk-assessment.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'cse-07-quiz': {
            id: 'cse-07-quiz',
            title: 'CSE: Risk Assessment Quiz',
            description: 'Test cloud risk management knowledge',
            house: 'cloud',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['cloud'],
            paths: ['cse'],
            components: {
                quiz: 'houses/cloud/quizzes/cloud-cse-07.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'cse-08-compliance': {
            id: 'cse-08-compliance',
            title: 'CSE: Compliance & Governance',
            description: 'GDPR, FISMA, PCI-DSS, HIPAA, NIST, ISO, CSA CCM',
            house: 'cloud',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['cloud'],
            paths: ['cse'],
            components: {
                presentation: 'houses/cloud/presentations/cloud-cse-08-compliance-governance.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'cse-08-quiz': {
            id: 'cse-08-quiz',
            title: 'CSE: Compliance Quiz - Final',
            description: 'Final quiz covering cloud compliance frameworks',
            house: 'cloud',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['cloud'],
            paths: ['cse'],
            components: {
                quiz: 'houses/cloud/quizzes/cloud-cse-08.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'cloud-aws-quiz': {
            id: 'cloud-aws-quiz',
            title: 'AWS Fundamentals Quiz',
            description: 'Comprehensive AWS knowledge test',
            house: 'cloud',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['cloud', 'aws'],
            paths: ['openstack', 'aws-ccp'],
            components: {
                quiz: 'houses/cloud/quizzes/cloud-aws-fundamentals.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'cloud-aws-services-lab': {
            id: 'cloud-aws-services-lab',
            title: 'AWS Services Lab',
            description: 'Hands-on exercises for AWS infrastructure, compute, storage, databases, VPC, and IAM',
            house: 'cloud',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['cloud', 'aws'],
            paths: ['openstack', 'aws-ccp'],
            components: {
                lab: 'houses/cloud/labs/cloud-aws-services.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'cloud-architecture-lab': {
            id: 'cloud-architecture-lab',
            title: 'Cloud Architecture Lab',
            description: 'Design patterns, multi-cloud strategies, high availability, and IaC principles',
            house: 'cloud',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['cloud'],
            paths: ['openstack'],
            components: {
                lab: 'houses/cloud/labs/cloud-architecture.lab.html'
            },
            prerequisites: [],
            objectives: []
        }
,

        // ─────────────────────────────────────────────────────────────
        // FORGE HOUSE - 37 new entries
        // ─────────────────────────────────────────────────────────────
        'cloud-security-lab': {
            id: 'cloud-security-lab',
            title: 'Cloud Security Lab',
            description: 'Shared responsibility, IAM, encryption, network security, and compliance for CLF-C02',
            house: 'cloud',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['cloud'],
            paths: ['openstack', 'security-plus'],
            components: {
                lab: 'houses/cloud/labs/cloud-security.lab.html'
            },
            prerequisites: [],
            objectives: []
        },

        // ─────────────────────────────────────────────────────────────
        // EC-Council CSE v1 Complete Modules (SPELL-023)
        // ─────────────────────────────────────────────────────────────
        'cse-module01': {
            id: 'cse-module01',
            title: 'CSE Module 01: Cloud Computing & Security Fundamentals',
            description: 'Complete module covering cloud deployment models, service models, shared responsibility, CSP comparison, threats, and security architecture',
            house: 'cloud',
            type: 'module',
            difficulty: 'beginner',
            duration: 90,
            topics: ['cloud', 'security', 'iaas', 'paas', 'saas', 'shared-responsibility', 'zero-trust', 'cloud-architecture'],
            paths: ['cse'],
            components: {
                presentation: 'houses/cloud/presentations/cloud-cse-module01.presentation.html',
                lab: 'houses/cloud/labs/cloud-cse-module01.lab.html',
                quiz: 'houses/cloud/quizzes/cloud-cse-module01.quiz.html'
            },
            prerequisites: [],
            objectives: [
                'Explain NIST cloud computing definition and characteristics',
                'Differentiate between IaaS, PaaS, and SaaS service models',
                'Identify Private, Public, and Hybrid deployment models',
                'Apply the shared responsibility matrix across service models',
                'Compare AWS, Azure, and GCP service equivalents',
                'Recognize OWASP Cloud-Native Top 10 security risks',
                'Apply CIA Triad, Defense in Depth, and Zero Trust principles',
                'Describe secure landing zone architecture patterns'
            ]
        },

        'cse-module02': {
            id: 'cse-module02',
            title: 'CSE Module 02: Identity and Access Management (IAM) in Cloud',
            description: 'Complete module covering IAM fundamentals, RBAC, identity federation, SSO, MFA, least privilege, and IAM auditing',
            house: 'cloud',
            type: 'module',
            difficulty: 'intermediate',
            duration: 90,
            topics: ['cloud', 'security', 'iam', 'rbac', 'sso', 'mfa', 'federation', 'zero-trust', 'least-privilege'],
            paths: ['cse'],
            components: {
                presentation: 'houses/cloud/presentations/cloud-cse-module02.presentation.html',
                lab: 'houses/cloud/labs/cloud-cse-module02.lab.html',
                quiz: 'houses/cloud/quizzes/cloud-cse-module02.quiz.html'
            },
            prerequisites: ['cse-module01'],
            objectives: [
                'Define key IAM terminology (Identity, Access, AuthN, AuthZ, Accounting)',
                'Compare legacy vs modern IAM architectures',
                'Identify principal types (users, admins, service principals, managed identities)',
                'Apply Role-Based Access Control (RBAC) with appropriate scopes',
                'Configure identity federation for hybrid and multicloud environments',
                'Implement SSO and SSPR for improved security and user experience',
                'Enforce MFA using multiple factor types',
                'Apply principle of least privilege with JEA, JIT, and conditional access',
                'Configure IAM auditing and integrate with SIEM platforms'
            ]
        },

        'cse-module03': {
            id: 'cse-module03',
            title: 'CSE Module 03: Data Protection and Encryption in Cloud',
            description: 'Complete module covering data classification, encryption at rest/transit, key management services, DLP, and disaster recovery',
            house: 'cloud',
            type: 'module',
            difficulty: 'advanced',
            duration: 100,
            topics: ['cloud', 'security', 'encryption', 'data-protection', 'key-management', 'dlp', 'disaster-recovery', 'backup'],
            paths: ['cse'],
            components: {
                presentation: 'houses/cloud/presentations/cloud-cse-module03.presentation.html',
                lab: 'houses/cloud/labs/cloud-cse-module03.lab.html',
                quiz: 'houses/cloud/quizzes/cloud-cse-module03.quiz.html'
            },
            prerequisites: ['cse-module01', 'cse-module02'],
            objectives: [
                'Apply data classification frameworks (Public, Internal, Confidential, Restricted)',
                'Implement encryption at rest using AES-256 and provider-managed keys',
                'Configure encryption in transit using TLS 1.2/1.3 protocols',
                'Compare customer-managed vs cloud-managed key services',
                'Evaluate HSM vs software-based key management solutions',
                'Implement DLP policies across cloud storage and services',
                'Design backup strategies with appropriate RTO/RPO targets',
                'Differentiate between backup and replication for DR planning',
                'Apply M01-02 concepts to data protection scenarios'
            ]
        },

        'cse-module04': {
            id: 'cse-module04',
            title: 'CSE Module 04: Network Security in Cloud',
            description: 'Complete module covering VPCs, network segmentation, NACLs, security groups, remote access, firewalls, and IDS/IPS',
            house: 'cloud',
            type: 'module',
            difficulty: 'advanced',
            duration: 100,
            topics: ['cloud', 'security', 'networking', 'vpc', 'firewall', 'nacl', 'security-groups', 'bastion', 'waf', 'ids', 'ips'],
            paths: ['cse'],
            components: {
                presentation: 'houses/cloud/presentations/cloud-cse-module04.presentation.html',
                lab: 'houses/cloud/labs/cloud-cse-module04.lab.html',
                quiz: 'houses/cloud/quizzes/cloud-cse-module04.quiz.html'
            },
            prerequisites: ['cse-module01', 'cse-module02', 'cse-module03'],
            objectives: [
                'Understand cloud network fundamentals and software-defined networking',
                'Configure Virtual Private Clouds (VPCs) and Virtual Networks',
                'Design multi-tier network architectures with proper segmentation',
                'Implement NACLs and Security Groups for access control',
                'Differentiate between stateful and stateless firewalls',
                'Configure secure remote access using VPC Endpoints and Bastion hosts',
                'Implement Just-In-Time (JIT) VM access for least privilege',
                'Deploy Web Application Firewalls (WAF) for Layer 7 protection',
                'Compare IDS vs IPS capabilities for threat detection and prevention',
                'Apply M01-03 concepts to network security scenarios'
            ]
        },

        'cse-module05': {
            id: 'cse-module05',
            title: 'CSE Module 05: Application Security in Cloud',
            description: 'Complete module covering Secure SDLC, WAF, OWASP Top 10, secure coding, API security, serverless, and containers',
            house: 'cloud',
            type: 'module',
            difficulty: 'advanced',
            duration: 110,
            topics: ['cloud', 'security', 'application-security', 'sdlc', 'waf', 'owasp', 'sast', 'dast', 'api', 'serverless', 'containers', 'kubernetes'],
            paths: ['cse'],
            components: {
                presentation: 'houses/cloud/presentations/cloud-cse-module05.presentation.html',
                lab: 'houses/cloud/labs/cloud-cse-module05.lab.html',
                quiz: 'houses/cloud/quizzes/cloud-cse-module05.quiz.html'
            },
            prerequisites: ['cse-module01', 'cse-module02', 'cse-module03', 'cse-module04'],
            objectives: [
                'Apply Secure SDLC phases per NIST SP 800-64',
                'Understand the 3 Rs of secure software (Reliability, Resiliency, Recovery)',
                'Implement Web Application Firewalls for Layer 7 protection',
                'Identify and mitigate OWASP Top 10 vulnerabilities',
                'Apply security by design principles',
                'Compare SAST, DAST, and RASP testing methodologies',
                'Implement API security best practices',
                'Secure serverless functions (Lambda, Azure Functions)',
                'Apply container security for Docker and Kubernetes',
                'Integrate M01-04 concepts into application security scenarios'
            ]
        },

        'cse-module06': {
            id: 'cse-module06',
            title: 'CSE Module 06: Security Monitoring & Incident Response',
            description: 'Complete module covering cloud logging, SIEM/SOAR, CSPM, CNAPP, and incident response procedures',
            house: 'cloud',
            type: 'module',
            difficulty: 'advanced',
            duration: 120,
            topics: ['cloud', 'security', 'monitoring', 'siem', 'soar', 'cspm', 'cnapp', 'incident-response', 'logging', 'forensics'],
            paths: ['cse'],
            components: {
                presentation: 'houses/cloud/presentations/cloud-cse-module06.presentation.html',
                lab: 'houses/cloud/labs/cloud-cse-module06.lab.html',
                quiz: 'houses/cloud/quizzes/cloud-cse-module06.quiz.html'
            },
            prerequisites: ['cse-module01', 'cse-module02', 'cse-module03', 'cse-module04', 'cse-module05'],
            objectives: [
                'Configure and analyze cloud-native logging services (CloudTrail, CloudWatch, Azure Monitor)',
                'Understand SIEM architecture and log aggregation strategies',
                'Implement SOAR playbooks for automated incident response',
                'Differentiate between CSPM, CWPP, and CNAPP platforms',
                'Apply the NIST Incident Response lifecycle (Prepare, Detect, Contain, Eradicate, Recover, Lessons)',
                'Perform cloud forensics with proper evidence preservation',
                'Configure real-time alerting and threat detection',
                'Conduct post-incident reviews and documentation',
                'Integrate M01-05 concepts into monitoring and IR scenarios'
            ]
        },

        'cse-module07': {
            id: 'cse-module07',
            title: 'CSE Module 07: Risk Assessment & Management',
            description: 'Complete module covering cloud security risks, NIST RMF, quantitative analysis, BCP/DRP, and risk response strategies',
            house: 'cloud',
            type: 'module',
            difficulty: 'advanced',
            duration: 120,
            topics: ['cloud', 'security', 'risk-assessment', 'nist-rmf', 'bcp', 'drp', 'quantitative-analysis', 'threat-modeling'],
            paths: ['cse'],
            components: {
                presentation: 'houses/cloud/presentations/cloud-cse-module07.presentation.html',
                lab: 'houses/cloud/labs/cloud-cse-module07.lab.html',
                quiz: 'houses/cloud/quizzes/cloud-cse-module07.quiz.html'
            },
            prerequisites: ['cse-module01', 'cse-module02', 'cse-module03', 'cse-module04', 'cse-module05', 'cse-module06'],
            objectives: [
                'Identify and categorize cloud security risks (attack surface, human error, misconfiguration)',
                'Apply NIST Risk Management Framework (SP 800-37) 7-step lifecycle',
                'Calculate ALE, SLE, and ARO for quantitative risk analysis',
                'Differentiate qualitative vs quantitative risk assessment approaches',
                'Develop Business Continuity Plans (BCP) and Disaster Recovery Plans (DRP)',
                'Apply RTO/RPO requirements to cloud disaster recovery',
                'Perform STRIDE and DREAD threat modeling',
                'Execute vulnerability assessments and prioritize remediation',
                'Apply risk response strategies (Mitigate, Avoid, Accept, Transfer)',
                'Integrate M01-06 concepts into comprehensive risk assessment scenarios'
            ]
        },

        'cse-module08': {
            id: 'cse-module08',
            title: 'CSE Module 08: Cloud Compliance & Governance',
            description: 'Capstone module covering regulatory compliance (GDPR, HIPAA, PCI-DSS, SOX), security standards (NIST CSF, ISO 27001, CSA CCM, FedRAMP), and cloud security governance',
            house: 'cloud',
            type: 'module',
            difficulty: 'advanced',
            duration: 130,
            topics: ['cloud', 'security', 'compliance', 'governance', 'gdpr', 'hipaa', 'pci-dss', 'nist', 'iso27001', 'fedramp', 'auditing', 'penetration-testing'],
            paths: ['cse'],
            components: {
                presentation: 'houses/cloud/presentations/cloud-cse-module08.presentation.html',
                lab: 'houses/cloud/labs/cloud-cse-module08.lab.html',
                quiz: 'houses/cloud/quizzes/cloud-cse-module08.quiz.html'
            },
            prerequisites: ['cse-module01', 'cse-module02', 'cse-module03', 'cse-module04', 'cse-module05', 'cse-module06', 'cse-module07'],
            objectives: [
                'Understand regulatory compliance requirements (GDPR, HIPAA, PCI-DSS, SOX, FISMA, FERPA, GLBA)',
                'Apply cloud security standards (NIST CSF, NIST 800-53, ISO 27001, CSA CCM, CIS Benchmarks)',
                'Navigate FedRAMP authorization paths (Ready, Authorized, Tailored)',
                'Implement HITRUST CSF for healthcare compliance',
                'Configure cloud-native auditing tools (Azure Policy, AWS Config, GCP Compliance)',
                'Apply cloud security governance principles',
                'Perform cloud security assessments and penetration testing',
                'Generate compliance evidence and audit reports',
                'Integrate M01-07 concepts into comprehensive compliance scenarios'
            ]
        },
        'cloud-cse-comprehensive-review': {
            id: 'cloud-cse-comprehensive-review',
            title: 'CSE Comprehensive Review',
            description: 'Jeopardy-style review game covering all 8 modules of the EC-Council Cloud Security Engineer course',
            house: 'cloud',
            type: 'quiz',
            difficulty: 'advanced',
            duration: 30,
            topics: ['cloud', 'security', 'CSE', 'review', 'comprehensive'],
            paths: ['cse'],
            components: {
                quiz: 'houses/cloud/cse/reviews/cse-comprehensive-review.html'
            },
            prerequisites: [],
            objectives: []
        },

        'forge-admin-tools-explorer': {
            id: 'forge-admin-tools-explorer',
            title: 'Admin Tools Explorer',
            description: 'Interactive Windows administrative tools guide',
            house: 'forge',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['systems'],
            paths: ['aplus-core1'],
            components: {
                applet: 'houses/forge/applets/forge-admin-tools.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-command-translator': {
            id: 'forge-command-translator',
            title: 'Command Translator',
            description: 'Translate commands between Windows and Linux',
            house: 'forge',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['systems'],
            paths: ['aplus-core1'],
            components: {
                applet: 'houses/forge/applets/forge-command-translator.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-control-panel-explorer': {
            id: 'forge-control-panel-explorer',
            title: 'Control Panel Explorer',
            description: 'Interactive Control Panel navigation guide',
            house: 'forge',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['systems'],
            paths: ['aplus-core1'],
            components: {
                applet: 'houses/forge/applets/forge-control-panel.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-settings-explorer': {
            id: 'forge-settings-explorer',
            title: 'Settings Explorer',
            description: 'Interactive Windows Settings app guide',
            house: 'forge',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['systems'],
            paths: ['aplus-core1'],
            components: {
                applet: 'houses/forge/applets/forge-settings.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-system-tools-sim': {
            id: 'forge-system-tools-sim',
            title: 'System Tools Simulator',
            description: 'Simulate Windows system management tools',
            house: 'forge',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['systems'],
            paths: ['aplus-core1'],
            components: {
                applet: 'houses/forge/applets/forge-system-tools-sim.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-windows-edition-selector': {
            id: 'forge-windows-edition-selector',
            title: 'Windows Edition Selector',
            description: 'Compare and select Windows editions',
            house: 'forge',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['systems', 'windows'],
            paths: ['aplus-core1'],
            components: {
                applet: 'houses/forge/applets/forge-windows-edition-selector.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-backup-planner': {
            id: 'forge-backup-planner',
            title: 'Backup Strategy Planner',
            description: 'Design backup and recovery strategies',
            house: 'forge',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['systems'],
            paths: ['aplus-core1'],
            components: {
                applet: 'houses/forge/applets/hardware/forge-backup-strategy-planner.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-cpu-architecture': {
            id: 'forge-cpu-architecture',
            title: 'CPU Architecture',
            description: 'Interactive CPU components and architecture',
            house: 'forge',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['systems'],
            paths: ['aplus-core1'],
            components: {
                applet: 'houses/forge/applets/hardware/cpu_architecture/forge-cpu-architecture.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-display-types': {
            id: 'forge-display-types',
            title: 'Display Technologies',
            description: 'Monitor types and display technologies',
            house: 'forge',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['systems'],
            paths: ['aplus-core1'],
            components: {
                applet: 'houses/forge/applets/hardware/display_types/forge-display-types.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-hard-drive': {
            id: 'forge-hard-drive',
            title: 'Hard Drive Geometry',
            description: 'Hard drive structure and geometry concepts',
            house: 'forge',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['systems'],
            paths: ['aplus-core1'],
            components: {
                applet: 'houses/forge/applets/hardware/hard_drive_geometry/forge-hard-drive-geometry-native.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-laptop-hardware': {
            id: 'forge-laptop-hardware',
            title: 'Laptop Hardware',
            description: 'Laptop-specific components and upgrades',
            house: 'forge',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['systems'],
            paths: ['aplus-core1'],
            components: {
                applet: 'houses/forge/applets/hardware/laptop_hardware/forge-laptop-hardware.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-mobile-accessories': {
            id: 'forge-mobile-accessories',
            title: 'Mobile Accessories',
            description: 'Mobile device accessories and connections',
            house: 'forge',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['systems'],
            paths: ['aplus-core1'],
            components: {
                applet: 'houses/forge/applets/hardware/mobile_accessories/forge-mobile-accessories.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-motherboards': {
            id: 'forge-motherboards',
            title: 'Motherboards',
            description: 'Motherboard components and form factors',
            house: 'forge',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['systems'],
            paths: ['aplus-core1'],
            components: {
                applet: 'houses/forge/applets/hardware/motherboards/forge-motherboards.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-network-cables': {
            id: 'forge-network-cables',
            title: 'Network Cables',
            description: 'Cable types, standards, and termination',
            house: 'forge',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['systems', 'networking'],
            paths: ['aplus-core1'],
            components: {
                applet: 'houses/forge/applets/hardware/network_cables/forge-network-cables.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-network-ports': {
            id: 'forge-network-ports',
            title: 'Network Ports',
            description: 'Physical network port types and usage',
            house: 'forge',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['systems', 'networking'],
            paths: ['aplus-core1'],
            components: {
                applet: 'houses/forge/applets/hardware/network_ports/forge-network-ports.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-peripheral-devices': {
            id: 'forge-peripheral-devices',
            title: 'Peripheral Devices',
            description: 'Input/output devices and connections',
            house: 'forge',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['systems'],
            paths: ['aplus-core1'],
            components: {
                applet: 'houses/forge/applets/hardware/peripheral_devices/forge-peripheral-devices.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-power-supplies': {
            id: 'forge-power-supplies',
            title: 'Power Supplies',
            description: 'PSU specifications and power requirements',
            house: 'forge',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['systems'],
            paths: ['aplus-core1'],
            components: {
                applet: 'houses/forge/applets/hardware/power_supplies/forge-power-supplies.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-printers': {
            id: 'forge-printers',
            title: 'Printers',
            description: 'Printer types, maintenance, and troubleshooting',
            house: 'forge',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['systems'],
            paths: ['aplus-core1'],
            components: {
                applet: 'houses/forge/applets/hardware/printers/forge-printers.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-raid-storage': {
            id: 'forge-raid-storage',
            title: 'RAID Storage',
            description: 'RAID configurations and storage arrays',
            house: 'forge',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['systems'],
            paths: ['aplus-core1'],
            components: {
                applet: 'houses/forge/applets/hardware/raid_storage/forge-raid-storage.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-ram-types': {
            id: 'forge-ram-types',
            title: 'RAM Types',
            description: 'Memory types, speeds, and compatibility',
            house: 'forge',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['systems'],
            paths: ['aplus-core1'],
            components: {
                applet: 'houses/forge/applets/hardware/ram_types/forge-ram-types.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-storage-devices': {
            id: 'forge-storage-devices',
            title: 'Storage Devices',
            description: 'HDD, SSD, and storage technologies',
            house: 'forge',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['systems'],
            paths: ['aplus-core1'],
            components: {
                applet: 'houses/forge/applets/hardware/storage_devices/forge-storage-devices.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-virtualization': {
            id: 'forge-virtualization',
            title: 'Virtualization',
            description: 'Virtual machines and hypervisors',
            house: 'forge',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['systems'],
            paths: ['aplus-core1'],
            components: {
                applet: 'houses/forge/applets/hardware/virtualization/forge-virtualization.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-wireless': {
            id: 'forge-wireless',
            title: 'Wireless Networking',
            description: 'WiFi standards and wireless technologies',
            house: 'forge',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['systems', 'networking'],
            paths: ['aplus-core1'],
            components: {
                applet: 'houses/forge/applets/hardware/wireless_networking/forge-wireless-networking.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-admin-tools-lab': {
            id: 'forge-admin-tools-lab',
            title: 'Admin Tools Lab',
            description: 'Hands-on administrative tools practice',
            house: 'forge',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['systems'],
            paths: ['aplus-core1'],
            components: {
                lab: 'houses/forge/labs/forge-admin-tools.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-control-panel-lab': {
            id: 'forge-control-panel-lab',
            title: 'Control Panel Lab',
            description: 'Hands-on Control Panel exercises',
            house: 'forge',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['systems'],
            paths: ['aplus-core1'],
            components: {
                lab: 'houses/forge/labs/forge-control-panel.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-macos-linux-lab': {
            id: 'forge-macos-linux-lab',
            title: 'macOS & Linux Lab',
            description: 'Cross-platform OS exercises',
            house: 'forge',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['systems', 'linux'],
            paths: ['aplus-core1'],
            components: {
                lab: 'houses/forge/labs/forge-lab-macos-linux.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-system-tools-lab': {
            id: 'forge-system-tools-lab',
            title: 'System Tools Lab',
            description: 'Practice with system utilities',
            house: 'forge',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['systems'],
            paths: ['aplus-core1'],
            components: {
                lab: 'houses/forge/labs/forge-system-tools.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-windows-editions-lab': {
            id: 'forge-windows-editions-lab',
            title: 'Windows Editions Lab',
            description: 'Compare Windows editions hands-on',
            house: 'forge',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['systems', 'windows'],
            paths: ['aplus-core1'],
            components: {
                lab: 'houses/forge/labs/forge-windows-editions.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-windows-settings-lab': {
            id: 'forge-windows-settings-lab',
            title: 'Windows Settings Lab',
            description: 'Settings app configuration exercises',
            house: 'forge',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['systems', 'windows'],
            paths: ['aplus-core1'],
            components: {
                lab: 'houses/forge/labs/forge-windows-settings.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-windows-admin-quiz': {
            id: 'forge-windows-admin-quiz',
            title: 'Windows Admin Quiz',
            description: 'Test Windows administration knowledge',
            house: 'forge',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['systems', 'windows'],
            paths: ['aplus-core1'],
            components: {
                quiz: 'houses/forge/quizzes/forge-windows-admin.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-aplus-core2-quiz': {
            id: 'forge-aplus-core2-quiz',
            title: 'A+ Core 2 Quiz (Ch 19-22)',
            description: 'CompTIA A+ Core 2 chapters 19-22 assessment',
            house: 'forge',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['systems'],
            paths: ['aplus-core2'],
            components: {
                quiz: 'houses/forge/quizzes/forge-aplus-core2-ch19-22.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-core2-ch13-quiz': {
            id: 'forge-core2-ch13-quiz',
            title: 'A+ Core 2: Chapter 13 Quiz',
            description: 'Windows Editions & Requirements assessment',
            house: 'forge',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['windows', 'editions', 'licensing', 'comptia'],
            paths: ['aplus-core2'],
            components: {
                quiz: 'houses/forge/applets/comptia-aplus/core-2/quizzes/forge-ch13.quiz.html'
            },
            prerequisites: []
        },
        'forge-core2-ch14-quiz': {
            id: 'forge-core2-ch14-quiz',
            title: 'A+ Core 2: Chapter 14 Quiz',
            description: 'Windows Settings assessment',
            house: 'forge',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['windows', 'settings', 'control-panel', 'comptia'],
            paths: ['aplus-core2'],
            components: {
                quiz: 'houses/forge/applets/comptia-aplus/core-2/quizzes/forge-ch14.quiz.html'
            },
            prerequisites: []
        },
        'forge-core2-ch15-quiz': {
            id: 'forge-core2-ch15-quiz',
            title: 'A+ Core 2: Chapter 15 Quiz',
            description: 'Admin Tools assessment',
            house: 'forge',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['windows', 'administration', 'mmc', 'comptia'],
            paths: ['aplus-core2'],
            components: {
                quiz: 'houses/forge/applets/comptia-aplus/core-2/quizzes/forge-ch15.quiz.html'
            },
            prerequisites: []
        },
        'forge-core2-ch16-quiz': {
            id: 'forge-core2-ch16-quiz',
            title: 'A+ Core 2: Chapter 16 Quiz',
            description: 'System Tools assessment',
            house: 'forge',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['windows', 'system-tools', 'troubleshooting', 'comptia'],
            paths: ['aplus-core2'],
            components: {
                quiz: 'houses/forge/applets/comptia-aplus/core-2/quizzes/forge-ch16.quiz.html'
            },
            prerequisites: []
        },
        'forge-core2-ch17-quiz': {
            id: 'forge-core2-ch17-quiz',
            title: 'A+ Core 2: Chapter 17 Quiz',
            description: 'macOS & Linux assessment',
            house: 'forge',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['macos', 'linux', 'operating-systems', 'comptia'],
            paths: ['aplus-core2'],
            components: {
                quiz: 'houses/forge/applets/comptia-aplus/core-2/quizzes/forge-ch17.quiz.html'
            },
            prerequisites: []
        },
        'forge-core2-ch18-quiz': {
            id: 'forge-core2-ch18-quiz',
            title: 'A+ Core 2: Chapter 18 Quiz',
            description: 'Users & Groups assessment',
            house: 'forge',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['users', 'groups', 'permissions', 'comptia'],
            paths: ['aplus-core2'],
            components: {
                quiz: 'houses/forge/applets/comptia-aplus/core-2/quizzes/forge-ch18.quiz.html'
            },
            prerequisites: []
        },
        'forge-core2-ch19-quiz': {
            id: 'forge-core2-ch19-quiz',
            title: 'A+ Core 2: Chapter 19 Quiz',
            description: 'Security Fundamentals assessment',
            house: 'forge',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['security', 'authentication', 'comptia'],
            paths: ['aplus-core2'],
            components: {
                quiz: 'houses/forge/applets/comptia-aplus/core-2/quizzes/forge-ch19.quiz.html'
            },
            prerequisites: []
        },
        'forge-core2-ch20-quiz': {
            id: 'forge-core2-ch20-quiz',
            title: 'A+ Core 2: Chapter 20 Quiz',
            description: 'Malware assessment',
            house: 'forge',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['malware', 'security', 'comptia'],
            paths: ['aplus-core2'],
            components: {
                quiz: 'houses/forge/applets/comptia-aplus/core-2/quizzes/forge-ch20.quiz.html'
            },
            prerequisites: []
        },
        'forge-core2-ch21-quiz': {
            id: 'forge-core2-ch21-quiz',
            title: 'A+ Core 2: Chapter 21 Quiz',
            description: 'Physical Security assessment',
            house: 'forge',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['physical-security', 'security', 'comptia'],
            paths: ['aplus-core2'],
            components: {
                quiz: 'houses/forge/applets/comptia-aplus/core-2/quizzes/forge-ch21.quiz.html'
            },
            prerequisites: []
        },
        'forge-core2-ch22-quiz': {
            id: 'forge-core2-ch22-quiz',
            title: 'A+ Core 2: Chapter 22 Quiz',
            description: 'Incident Response assessment',
            house: 'forge',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['incident-response', 'procedures', 'comptia'],
            paths: ['aplus-core2'],
            components: {
                quiz: 'houses/forge/applets/comptia-aplus/core-2/quizzes/forge-ch22.quiz.html'
            },
            prerequisites: []
        },
        'forge-core2-ch23-quiz': {
            id: 'forge-core2-ch23-quiz',
            title: 'A+ Core 2: Chapter 23 Quiz',
            description: 'Change Management assessment',
            house: 'forge',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['change-management', 'procedures', 'comptia'],
            paths: ['aplus-core2'],
            components: {
                quiz: 'houses/forge/applets/comptia-aplus/core-2/quizzes/forge-ch23.quiz.html'
            },
            prerequisites: []
        },
        'forge-core2-ch24-quiz': {
            id: 'forge-core2-ch24-quiz',
            title: 'A+ Core 2: Chapter 24 Quiz',
            description: 'Documentation assessment',
            house: 'forge',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['documentation', 'professionalism', 'comptia'],
            paths: ['aplus-core2'],
            components: {
                quiz: 'houses/forge/applets/comptia-aplus/core-2/quizzes/forge-ch24.quiz.html'
            },
            prerequisites: []
        },
        'forge-aplus-jeopardy': {
            id: 'forge-aplus-jeopardy',
            title: 'A+ Jeopardy',
            description: 'CompTIA A+ review in Jeopardy format',
            house: 'forge',
            type: 'review',
            difficulty: 'beginner',
            duration: 30,
            topics: ['systems'],
            paths: ['aplus-core2'],
            components: {
                applet: 'houses/forge/reviews/forge-aplus-jeopardy.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-cpu-arch-ref': {
            id: 'forge-cpu-arch-ref',
            title: 'CPU Architecture Reference',
            description: 'CPU architecture and components reference',
            house: 'forge',
            type: 'module',
            difficulty: 'beginner',
            duration: 30,
            topics: ['systems'],
            paths: ['aplus-core1'],
            components: {
                applet: 'houses/forge/applets/forge-cpu-architecture.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-windows-shortcuts': {
            id: 'forge-windows-shortcuts',
            title: 'Windows Shortcuts Reference',
            description: 'Essential Windows keyboard shortcuts',
            house: 'forge',
            type: 'module',
            difficulty: 'beginner',
            duration: 30,
            topics: ['systems', 'windows'],
            paths: ['aplus-core1'],
            components: {
                applet: 'houses/forge/applets/forge-windows-shortcuts.applet.html',
                module: 'houses/forge/applets/comptia-aplus/forge-windows-shortcuts.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-hardware-lab': {
            id: 'forge-hardware-lab',
            title: 'Hardware Essentials Lab',
            description: 'Hands-on exercises covering CPUs, motherboards, RAM, storage, and power supplies',
            house: 'forge',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['systems'],
            paths: ['aplus-core1'],
            components: {
                lab: 'houses/forge/labs/forge-hardware-essentials.lab.html'
            },
            prerequisites: [],
            objectives: []
        }
,

        // ─────────────────────────────────────────────────────────────
        // SCRIPT HOUSE - 68 new entries
        // ─────────────────────────────────────────────────────────────
        'forge-hardware-quiz': {
            id: 'forge-hardware-quiz',
            title: 'Hardware Essentials Quiz',
            description: '15 questions covering A+ Core 1 hardware topics',
            house: 'forge',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['systems'],
            paths: ['aplus-core1'],
            components: {
                quiz: 'houses/forge/quizzes/forge-hardware-essentials.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-macos-linux-lab': {
            id: 'script-macos-linux-lab',
            title: 'macOS & Linux Lab',
            description: 'Hands-on practice with macOS and Linux systems',
            house: 'script',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['scripting', 'linux'],
            paths: ['comptia-linux', 'linux-mastery'],
            components: {
                lab: 'houses/script/applets/linux/script-lab-macos-linux.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-python-file-handling': {
            id: 'script-python-file-handling',
            title: 'Python File Handling',
            description: 'Reading, writing, and manipulating files',
            house: 'script',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['scripting', 'python'],
            paths: ['comptia-linux', 'linux-mastery', 'python-fundamentals'],
            components: {
                applet: 'houses/script/applets/python/script-python-chapter7-file-handling.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-package-manager': {
            id: 'script-package-manager',
            title: 'Package Manager',
            description: 'Managing software with apt, yum, and pip',
            house: 'script',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['scripting'],
            paths: ['comptia-linux', 'linux-mastery'],
            components: {
                applet: 'houses/script/tools/script-package-manager.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-automation-presentation': {
            id: 'script-automation-presentation',
            title: 'Automation Presentation',
            description: 'Slide deck on automation fundamentals',
            house: 'script',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['scripting'],
            paths: ['comptia-linux', 'linux-mastery'],
            components: {
                presentation: 'houses/script/presentations/script-automation.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-macos-linux-basics': {
            id: 'script-macos-linux-basics',
            title: 'macOS & Linux Basics',
            description: 'Introduction to macOS and Linux operating systems',
            house: 'script',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['scripting', 'linux'],
            paths: ['comptia-linux', 'linux-mastery'],
            components: {
                presentation: 'houses/script/presentations/script-macos-linux-basics.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-scripting-basics': {
            id: 'script-scripting-basics',
            title: 'Scripting Basics',
            description: 'Fundamentals of shell scripting',
            house: 'script',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['scripting'],
            paths: ['comptia-linux', 'linux-mastery'],
            components: {
                presentation: 'houses/script/presentations/script-scripting-basics.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-linux-quiz': {
            id: 'script-linux-quiz',
            title: 'Linux Basics Quiz',
            description: 'Test your Linux knowledge',
            house: 'script',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['scripting', 'linux'],
            paths: ['comptia-linux', 'linux-mastery'],
            components: {
                quiz: 'houses/script/quizzes/script-linux-basics.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'clh-001': {
            id: 'clh-001',
            title: 'CLH-001: Introduction to Hacker CLI',
            description: 'Begin your journey as a command line operator. Reconnaissance basics.',
            house: 'script',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['clh', 'command line hacker', 'linux', 'terminal', 'cli', 'scripting'],
            paths: ['comptia-linux', 'linux-mastery'],
            components: {
                lab: 'houses/script/labs/script-lab.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'clh-002': {
            id: 'clh-002',
            title: 'CLH-002: Navigation & Reconnaissance',
            description: 'Navigate filesystems and extract intel from target directories.',
            house: 'script',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['clh', 'command line hacker', 'linux', 'terminal', 'cli', 'scripting'],
            paths: ['comptia-linux', 'linux-mastery', 'security-operations'],
            components: {
                lab: 'houses/script/courses/clh/modules/clh-002/script-lab.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'clh-003': {
            id: 'clh-003',
            title: 'CLH-003: Pattern Hunting',
            description: 'Hunt for hidden codes using grep. Find the secret in mystery.txt.',
            house: 'script',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['clh', 'command line hacker', 'linux', 'terminal', 'cli', 'scripting'],
            paths: ['comptia-linux', 'linux-mastery', 'comptia-network'],
            components: {
                lab: 'houses/script/courses/clh/modules/clh-003/script-lab.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'clh-004': {
            id: 'clh-004',
            title: 'CLH-004: Process Investigation',
            description: 'Hunt suspicious processes. Find the malware hiding in the process list.',
            house: 'script',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['clh', 'command line hacker', 'linux', 'terminal', 'cli', 'scripting'],
            paths: ['comptia-linux', 'linux-mastery'],
            components: {
                lab: 'houses/script/courses/clh/modules/clh-004/script-lab.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'clh-005': {
            id: 'clh-005',
            title: 'CLH-005: Log Analysis',
            description: 'Analyze system logs. Find error patterns and document anomalies.',
            house: 'script',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['clh', 'command line hacker', 'linux', 'terminal', 'cli', 'scripting'],
            paths: ['comptia-linux', 'linux-mastery'],
            components: {
                lab: 'houses/script/courses/clh/modules/clh-005/script-lab.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'clh-006': {
            id: 'clh-006',
            title: 'CLH-006: File Operations',
            description: 'Create, copy, move, and delete files during field operations.',
            house: 'script',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['clh', 'command line hacker', 'linux', 'terminal', 'cli', 'scripting'],
            paths: ['comptia-linux', 'linux-mastery'],
            components: {
                lab: 'houses/script/courses/clh/modules/clh-006/script-lab.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'clh-007': {
            id: 'clh-007',
            title: 'CLH-007: Permissions & Access Control',
            description: 'Decode permission matrices and secure sensitive files.',
            house: 'script',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['clh', 'command line hacker', 'linux', 'terminal', 'cli', 'scripting'],
            paths: ['comptia-linux', 'linux-mastery'],
            components: {
                lab: 'houses/script/courses/clh/modules/clh-007/script-lab.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'clh-008': {
            id: 'clh-008',
            title: 'CLH-008: Shell Scripting Basics',
            description: 'Write and execute shell scripts for automated operations.',
            house: 'script',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['clh', 'command line hacker', 'linux', 'terminal', 'cli', 'scripting'],
            paths: ['comptia-linux', 'linux-mastery'],
            components: {
                lab: 'houses/script/courses/clh/modules/clh-008/script-lab.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'clh-009': {
            id: 'clh-009',
            title: 'CLH-009: Text Processing',
            description: 'Extract and analyze data with cut, sort, uniq, awk, and sed.',
            house: 'script',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['clh', 'command line hacker', 'linux', 'terminal', 'cli', 'scripting'],
            paths: ['comptia-linux', 'linux-mastery'],
            components: {
                lab: 'houses/script/courses/clh/modules/clh-009/script-lab.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'clh-010': {
            id: 'clh-010',
            title: 'CLH-010: I/O Redirection',
            description: 'Control data streams with redirects, pipes, and tee.',
            house: 'script',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['clh', 'command line hacker', 'linux', 'terminal', 'cli', 'scripting'],
            paths: ['comptia-linux', 'linux-mastery'],
            components: {
                lab: 'houses/script/courses/clh/modules/clh-010/script-lab.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'clh-011': {
            id: 'clh-011',
            title: 'CLH-011: Advanced Grep & Regex',
            description: 'Hunt patterns with grep flags and regular expressions.',
            house: 'script',
            type: 'lab',
            difficulty: 'advanced',
            duration: 45,
            topics: ['clh', 'command line hacker', 'linux', 'terminal', 'cli', 'scripting'],
            paths: ['comptia-linux', 'linux-mastery'],
            components: {
                lab: 'houses/script/courses/clh/modules/clh-011/script-lab.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'clh-012': {
            id: 'clh-012',
            title: 'CLH-012: Network Basics',
            description: 'Probe network connectivity with ping, netstat, ss, and ip commands.',
            house: 'script',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['clh', 'command line hacker', 'linux', 'terminal', 'cli', 'scripting', 'networking'],
            paths: ['comptia-linux', 'linux-mastery', 'comptia-network'],
            components: {
                lab: 'houses/script/courses/clh/modules/clh-012/script-lab.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'clh-013': {
            id: 'clh-013',
            title: 'CLH-013: Environment Variables',
            description: 'Master shell environment with env, export, and PATH manipulation.',
            house: 'script',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['clh', 'command line hacker', 'linux', 'terminal', 'cli', 'scripting'],
            paths: ['comptia-linux', 'linux-mastery'],
            components: {
                lab: 'houses/script/courses/clh/modules/clh-013/script-lab.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'clh-014': {
            id: 'clh-014',
            title: 'CLH-014: Process Control',
            description: 'Manage processes with ps, kill, jobs, bg, fg, and nohup.',
            house: 'script',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['clh', 'command line hacker', 'linux', 'terminal', 'cli', 'scripting'],
            paths: ['comptia-linux', 'linux-mastery'],
            components: {
                lab: 'houses/script/courses/clh/modules/clh-014/script-lab.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'clh-015': {
            id: 'clh-015',
            title: 'CLH-015: Capstone Mission',
            description: 'Final investigation. Apply all skills. Earn CLI Engineer certification.',
            house: 'script',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['clh', 'command line hacker', 'linux', 'terminal', 'cli', 'scripting'],
            paths: ['comptia-linux', 'linux-mastery'],
            components: {
                lab: 'houses/script/courses/clh/modules/clh-015/script-lab.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'clh-001-quiz': {
            id: 'clh-001-quiz',
            title: 'CLH-001 Quiz',
            description: 'Test CLH-001 knowledge',
            house: 'script',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['clh', 'command line hacker', 'linux', 'terminal', 'cli', 'scripting'],
            paths: ['comptia-linux', 'linux-mastery'],
            components: {
                quiz: 'houses/script/clh/script-clh-001.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'clh-002-quiz': {
            id: 'clh-002-quiz',
            title: 'CLH-002 Quiz',
            description: 'Test CLH-002 knowledge',
            house: 'script',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['clh', 'command line hacker', 'linux', 'terminal', 'cli', 'scripting'],
            paths: ['comptia-linux', 'linux-mastery'],
            components: {
                quiz: 'houses/script/clh/script-clh-002.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'clh-003-quiz': {
            id: 'clh-003-quiz',
            title: 'CLH-003 Quiz',
            description: 'Test CLH-003 knowledge',
            house: 'script',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['clh', 'command line hacker', 'linux', 'terminal', 'cli', 'scripting'],
            paths: ['comptia-linux', 'linux-mastery'],
            components: {
                quiz: 'houses/script/clh/script-clh-003.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'clh-004-quiz': {
            id: 'clh-004-quiz',
            title: 'CLH-004 Quiz',
            description: 'Test CLH-004 knowledge',
            house: 'script',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['clh', 'command line hacker', 'linux', 'terminal', 'cli', 'scripting'],
            paths: ['comptia-linux', 'linux-mastery'],
            components: {
                quiz: 'houses/script/clh/script-clh-004.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'clh-005-quiz': {
            id: 'clh-005-quiz',
            title: 'CLH-005 Quiz',
            description: 'Test CLH-005 knowledge',
            house: 'script',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['clh', 'command line hacker', 'linux', 'terminal', 'cli', 'scripting'],
            paths: ['comptia-linux', 'linux-mastery'],
            components: {
                quiz: 'houses/script/clh/script-clh-005.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'clh-006-quiz': {
            id: 'clh-006-quiz',
            title: 'CLH-006 Quiz',
            description: 'Test CLH-006 knowledge',
            house: 'script',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['clh', 'command line hacker', 'linux', 'terminal', 'cli', 'scripting'],
            paths: ['comptia-linux', 'linux-mastery'],
            components: {
                quiz: 'houses/script/clh/script-clh-006.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'clh-007-quiz': {
            id: 'clh-007-quiz',
            title: 'CLH-007 Quiz',
            description: 'Test CLH-007 knowledge',
            house: 'script',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['clh', 'command line hacker', 'linux', 'terminal', 'cli', 'scripting'],
            paths: ['comptia-linux', 'linux-mastery'],
            components: {
                quiz: 'houses/script/clh/script-clh-007.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'clh-008-quiz': {
            id: 'clh-008-quiz',
            title: 'CLH-008 Quiz',
            description: 'Test CLH-008 knowledge',
            house: 'script',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['clh', 'command line hacker', 'linux', 'terminal', 'cli', 'scripting'],
            paths: ['comptia-linux', 'linux-mastery'],
            components: {
                quiz: 'houses/script/clh/script-clh-008.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'clh-009-quiz': {
            id: 'clh-009-quiz',
            title: 'CLH-009 Quiz',
            description: 'Test CLH-009 knowledge',
            house: 'script',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['clh', 'command line hacker', 'linux', 'terminal', 'cli', 'scripting'],
            paths: ['comptia-linux', 'linux-mastery'],
            components: {
                quiz: 'houses/script/clh/script-clh-009.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'clh-010-quiz': {
            id: 'clh-010-quiz',
            title: 'CLH-010 Quiz',
            description: 'Test CLH-010 knowledge',
            house: 'script',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['clh', 'command line hacker', 'linux', 'terminal', 'cli', 'scripting'],
            paths: ['comptia-linux', 'linux-mastery'],
            components: {
                quiz: 'houses/script/clh/script-clh-010.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'clh-011-quiz': {
            id: 'clh-011-quiz',
            title: 'CLH-011 Quiz',
            description: 'Test CLH-011 knowledge',
            house: 'script',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['clh', 'command line hacker', 'linux', 'terminal', 'cli', 'scripting'],
            paths: ['comptia-linux', 'linux-mastery'],
            components: {
                quiz: 'houses/script/clh/script-clh-011.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'clh-012-quiz': {
            id: 'clh-012-quiz',
            title: 'CLH-012 Quiz',
            description: 'Test CLH-012 knowledge',
            house: 'script',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['clh', 'command line hacker', 'linux', 'terminal', 'cli', 'scripting'],
            paths: ['comptia-linux', 'linux-mastery'],
            components: {
                quiz: 'houses/script/clh/script-clh-012.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'clh-013-quiz': {
            id: 'clh-013-quiz',
            title: 'CLH-013 Quiz',
            description: 'Test CLH-013 knowledge',
            house: 'script',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['clh', 'command line hacker', 'linux', 'terminal', 'cli', 'scripting'],
            paths: ['comptia-linux', 'linux-mastery'],
            components: {
                quiz: 'houses/script/clh/script-clh-013.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'clh-014-quiz': {
            id: 'clh-014-quiz',
            title: 'CLH-014 Quiz',
            description: 'Test CLH-014 knowledge',
            house: 'script',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['clh', 'command line hacker', 'linux', 'terminal', 'cli', 'scripting'],
            paths: ['comptia-linux', 'linux-mastery'],
            components: {
                quiz: 'houses/script/clh/script-clh-014.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'clh-015-quiz': {
            id: 'clh-015-quiz',
            title: 'CLH-015 Quiz',
            description: 'Test CLH-015 knowledge',
            house: 'script',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['clh', 'command line hacker', 'linux', 'terminal', 'cli', 'scripting'],
            paths: ['comptia-linux', 'linux-mastery'],
            components: {
                quiz: 'houses/script/clh/script-clh-015.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'clh-001-presentation': {
            id: 'clh-001-presentation',
            title: 'CLH-001 Reading',
            description: 'Introduction to the Hacker CLI concepts',
            house: 'script',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['clh', 'command line hacker', 'linux', 'terminal', 'cli', 'scripting'],
            paths: ['comptia-linux', 'linux-mastery'],
            components: {
                presentation: 'houses/script/clh/script-clh-001-intro.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'clh-002-presentation': {
            id: 'clh-002-presentation',
            title: 'CLH-002 Reading',
            description: 'Navigation & Reconnaissance concepts',
            house: 'script',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['clh', 'command line hacker', 'linux', 'terminal', 'cli', 'scripting'],
            paths: ['comptia-linux', 'linux-mastery'],
            components: {
                presentation: 'houses/script/clh/script-clh-002-intro.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'clh-003-presentation': {
            id: 'clh-003-presentation',
            title: 'CLH-003 Reading',
            description: 'Network Analysis concepts',
            house: 'script',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['clh', 'command line hacker', 'linux', 'terminal', 'cli', 'scripting'],
            paths: ['comptia-linux', 'linux-mastery'],
            components: {
                presentation: 'houses/script/clh/script-clh-003-intro.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'clh-004-presentation': {
            id: 'clh-004-presentation',
            title: 'CLH-004 Reading',
            description: 'Text Analysis & Pattern Hunting concepts',
            house: 'script',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['clh', 'command line hacker', 'linux', 'terminal', 'cli', 'scripting'],
            paths: ['comptia-linux', 'linux-mastery'],
            components: {
                presentation: 'houses/script/clh/script-clh-004-intro.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'clh-005-presentation': {
            id: 'clh-005-presentation',
            title: 'CLH-005 Reading',
            description: 'Process Investigation concepts',
            house: 'script',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['clh', 'command line hacker', 'linux', 'terminal', 'cli', 'scripting'],
            paths: ['comptia-linux', 'linux-mastery'],
            components: {
                presentation: 'houses/script/clh/script-clh-005-intro.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'clh-006-presentation': {
            id: 'clh-006-presentation',
            title: 'CLH-006 Reading',
            description: 'Permissions & Access Control concepts',
            house: 'script',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['clh', 'command line hacker', 'linux', 'terminal', 'cli', 'scripting'],
            paths: ['comptia-linux', 'linux-mastery'],
            components: {
                presentation: 'houses/script/clh/script-clh-006-intro.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'clh-007-presentation': {
            id: 'clh-007-presentation',
            title: 'CLH-007 Reading',
            description: 'Shell Scripting Basics concepts',
            house: 'script',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['clh', 'command line hacker', 'linux', 'terminal', 'cli', 'scripting'],
            paths: ['comptia-linux', 'linux-mastery'],
            components: {
                presentation: 'houses/script/clh/script-clh-007-intro.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'clh-008-presentation': {
            id: 'clh-008-presentation',
            title: 'CLH-008 Reading',
            description: 'Advanced Shell Scripting concepts',
            house: 'script',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['clh', 'command line hacker', 'linux', 'terminal', 'cli', 'scripting'],
            paths: ['comptia-linux', 'linux-mastery'],
            components: {
                presentation: 'houses/script/clh/script-clh-008-intro.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'clh-009-presentation': {
            id: 'clh-009-presentation',
            title: 'CLH-009 Reading',
            description: 'System Administration concepts',
            house: 'script',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['clh', 'command line hacker', 'linux', 'terminal', 'cli', 'scripting'],
            paths: ['comptia-linux', 'linux-mastery'],
            components: {
                presentation: 'houses/script/clh/script-clh-009-intro.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'clh-010-presentation': {
            id: 'clh-010-presentation',
            title: 'CLH-010 Reading',
            description: 'Log Analysis & Forensics concepts',
            house: 'script',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['clh', 'command line hacker', 'linux', 'terminal', 'cli', 'scripting'],
            paths: ['comptia-linux', 'linux-mastery'],
            components: {
                presentation: 'houses/script/clh/script-clh-010-intro.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'clh-011-presentation': {
            id: 'clh-011-presentation',
            title: 'CLH-011 Reading',
            description: 'Network Reconnaissance concepts',
            house: 'script',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['clh', 'command line hacker', 'linux', 'terminal', 'cli', 'scripting'],
            paths: ['comptia-linux', 'linux-mastery'],
            components: {
                presentation: 'houses/script/clh/script-clh-011-intro.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'clh-012-presentation': {
            id: 'clh-012-presentation',
            title: 'CLH-012 Reading',
            description: 'Web Enumeration concepts',
            house: 'script',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['clh', 'command line hacker', 'linux', 'terminal', 'cli', 'scripting'],
            paths: ['comptia-linux', 'linux-mastery'],
            components: {
                presentation: 'houses/script/clh/script-clh-012-intro.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'clh-013-presentation': {
            id: 'clh-013-presentation',
            title: 'CLH-013 Reading',
            description: 'Incident Response concepts',
            house: 'script',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['clh', 'command line hacker', 'linux', 'terminal', 'cli', 'scripting'],
            paths: ['comptia-linux', 'linux-mastery'],
            components: {
                presentation: 'houses/script/clh/script-clh-013-intro.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'clh-014-presentation': {
            id: 'clh-014-presentation',
            title: 'CLH-014 Reading',
            description: 'Automation & Tooling concepts',
            house: 'script',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['clh', 'command line hacker', 'linux', 'terminal', 'cli', 'scripting'],
            paths: ['comptia-linux', 'linux-mastery'],
            components: {
                presentation: 'houses/script/clh/script-clh-014-intro.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'clh-015-presentation': {
            id: 'clh-015-presentation',
            title: 'CLH-015 Reading',
            description: 'Capstone Challenge preparation',
            house: 'script',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['clh', 'command line hacker', 'linux', 'terminal', 'cli', 'scripting'],
            paths: ['comptia-linux', 'linux-mastery'],
            components: {
                presentation: 'houses/script/clh/script-clh-015-intro.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-linux-lab': {
            id: 'script-linux-lab',
            title: 'Linux/Bash Lab',
            description: 'Hands-on exercises for shell navigation, file operations, text processing, and scripting',
            house: 'script',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['linux', 'scripting'],
            paths: ['comptia-linux', 'linux-mastery'],
            components: {
                lab: 'houses/script/labs/script-linux-bash.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-linux-quiz': {
            id: 'script-linux-quiz',
            title: 'Linux/Bash Quiz',
            description: '15 questions covering essential Linux and Bash concepts',
            house: 'script',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['linux', 'scripting'],
            paths: ['comptia-linux', 'linux-mastery'],
            components: {
                quiz: 'houses/script/quizzes/script-linux-bash.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-python-lab': {
            id: 'script-python-lab',
            title: 'Python Programming Lab',
            description: 'From basics to OOP with hands-on exercises covering all Python fundamentals',
            house: 'script',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['python', 'scripting'],
            paths: ['comptia-linux', 'linux-mastery', 'python-fundamentals'],
            components: {
                lab: 'houses/script/labs/script-python.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-python-quiz': {
            id: 'script-python-quiz',
            title: 'Python Programming Quiz',
            description: '15 questions testing Python syntax, data structures, and OOP',
            house: 'script',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['python', 'scripting'],
            paths: ['comptia-linux', 'linux-mastery', 'python-fundamentals'],
            components: {
                quiz: 'houses/script/quizzes/script-python.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'python-ch1-presentation': {
            id: 'python-ch1-presentation',
            title: 'Python Ch.1 Reading',
            description: 'The First Bit - Python introduction concepts',
            house: 'script',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['python', 'scripting'],
            paths: ['comptia-linux', 'linux-mastery', 'python-fundamentals'],
            components: {
                presentation: 'houses/script/presentations/python/script-python-chapter1.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'python-ch2-presentation': {
            id: 'python-ch2-presentation',
            title: 'Python Ch.2 Reading',
            description: 'Strings - Text manipulation concepts',
            house: 'script',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['python', 'scripting'],
            paths: ['comptia-linux', 'linux-mastery', 'python-fundamentals'],
            components: {
                presentation: 'houses/script/presentations/python/script-python-chapter2.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'python-ch3-presentation': {
            id: 'python-ch3-presentation',
            title: 'Python Ch.3 Reading',
            description: 'Flow Control - Conditionals and loops',
            house: 'script',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['python', 'scripting'],
            paths: ['comptia-linux', 'linux-mastery', 'python-fundamentals'],
            components: {
                presentation: 'houses/script/presentations/python/script-python-chapter3.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'python-ch4-presentation': {
            id: 'python-ch4-presentation',
            title: 'Python Ch.4 Reading',
            description: 'Functions - Reusable code concepts',
            house: 'script',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['python', 'scripting'],
            paths: ['comptia-linux', 'linux-mastery', 'python-fundamentals'],
            components: {
                presentation: 'houses/script/presentations/python/script-python-chapter4.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'python-ch5-presentation': {
            id: 'python-ch5-presentation',
            title: 'Python Ch.5 Reading',
            description: 'Collections - Lists and tuples concepts',
            house: 'script',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['python', 'scripting'],
            paths: ['comptia-linux', 'linux-mastery', 'python-fundamentals'],
            components: {
                presentation: 'houses/script/presentations/python/script-python-chapter5.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'python-ch6-presentation': {
            id: 'python-ch6-presentation',
            title: 'Python Ch.6 Reading',
            description: 'Dictionaries - Key-value pair concepts',
            house: 'script',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['python', 'scripting'],
            paths: ['comptia-linux', 'linux-mastery', 'python-fundamentals'],
            components: {
                presentation: 'houses/script/presentations/python/script-python-chapter6.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'python-ch7-presentation': {
            id: 'python-ch7-presentation',
            title: 'Python Ch.7 Reading',
            description: 'File Handling - Reading and writing files',
            house: 'script',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['python', 'scripting'],
            paths: ['comptia-linux', 'linux-mastery', 'python-fundamentals'],
            components: {
                presentation: 'houses/script/presentations/python/script-python-chapter7.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'python-ch8-presentation': {
            id: 'python-ch8-presentation',
            title: 'Python Ch.8 Reading',
            description: 'OOP - Object-oriented programming concepts',
            house: 'script',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['python', 'scripting'],
            paths: ['comptia-linux', 'linux-mastery', 'python-fundamentals'],
            components: {
                presentation: 'houses/script/presentations/python/script-python-chapter8.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-powershell-lab': {
            id: 'script-powershell-lab',
            title: 'PowerShell Automation Lab',
            description: 'Master Windows automation with object pipelines, scripting, and system administration',
            house: 'script',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['powershell', 'scripting'],
            paths: ['comptia-linux', 'linux-mastery'],
            components: {
                lab: 'houses/script/labs/script-powershell.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-powershell-quiz': {
            id: 'script-powershell-quiz',
            title: 'PowerShell Automation Quiz',
            description: '15 questions on cmdlets, pipelines, and Windows automation',
            house: 'script',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['powershell', 'scripting'],
            paths: ['comptia-linux', 'linux-mastery'],
            components: {
                quiz: 'houses/script/quizzes/script-powershell.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-sysadmin-lab': {
            id: 'script-sysadmin-lab',
            title: 'Sysadmin & Automation Lab',
            description: 'Cross-platform automation for logs, backups, scheduling, and user management',
            house: 'script',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['sysadmin', 'scripting'],
            paths: ['comptia-linux', 'linux-mastery'],
            components: {
                lab: 'houses/script/labs/script-sysadmin.lab.html'
            },
            prerequisites: [],
            objectives: []
        }
,

        // ─────────────────────────────────────────────────────────────
        // CODE HOUSE - 31 new entries
        // ─────────────────────────────────────────────────────────────
        'script-sysadmin-quiz': {
            id: 'script-sysadmin-quiz',
            title: 'Sysadmin & Automation Quiz',
            description: '15 questions on automation best practices and system administration',
            house: 'script',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['sysadmin', 'scripting'],
            paths: ['comptia-linux', 'linux-mastery'],
            components: {
                quiz: 'houses/script/quizzes/script-sysadmin.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'code-version-control': {
            id: 'code-version-control',
            title: 'Version Control Guide',
            description: 'Comprehensive Git guide: workflows, branching strategies, and GitHub integration',
            house: 'code',
            type: 'module',
            difficulty: 'beginner',
            duration: 30,
            topics: ['devops'],
            paths: ['devops-fundamentals'],
            components: {
                applet: 'houses/code/presentations/code-git-basics.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'code-automation-devops': {
            id: 'code-automation-devops',
            title: 'Network Automation & DevOps',
            description: 'REST APIs, NETCONF, RESTCONF, and automation fundamentals',
            house: 'code',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 45,
            topics: ['devops', 'networking'],
            paths: ['devops-fundamentals', 'comptia-network'],
            components: {
                presentation: 'houses/code/presentations/code-automation.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'code-api-visualizer': {
            id: 'code-api-visualizer',
            title: 'API & Automation Visualizer',
            description: 'Interactive visualization of network automation and API concepts',
            house: 'code',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['devops'],
            paths: ['devops-fundamentals'],
            components: {
                applet: 'houses/code/tools/code-automation.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'code-devnet-guide': {
            id: 'code-devnet-guide',
            title: 'Cisco DevNet Sandbox Guide',
            description: 'Complete guide to DevNet labs, Python automation, and Ansible playbooks',
            house: 'code',
            type: 'module',
            difficulty: 'beginner',
            duration: 30,
            topics: ['devops'],
            paths: ['devops-fundamentals', 'ccna'],
            components: {
                applet: 'houses/code/tools/code-terraform.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'code-docker-basics': {
            id: 'code-docker-basics',
            title: 'Docker Basics',
            description: 'Container fundamentals: images, containers, and Docker commands',
            house: 'code',
            type: 'lab',
            difficulty: 'beginner',
            duration: 65,
            topics: ['devops', 'docker'],
            paths: ['devops-fundamentals'],
            components: {
                lab: 'houses/code/presentations/code-docker-fundamentals.presentation.html'
            },
        'code-unit-testing': {
            id: 'code-unit-testing',
            title: 'Unit Testing',
            description: 'Test-driven development and unit testing fundamentals',
            house: 'code',
            type: 'lab',
            difficulty: 'beginner',
            duration: 65,
            topics: ['devops'],
            paths: ['devops-fundamentals'],
            components: {},
            prerequisites: [],
            objectives: []
        },
            prerequisites: [],
            objectives: []
        },
        'code-cloudformation-designer': {
            id: 'code-cloudformation-designer',
            title: 'CloudFormation Designer',
            description: 'Visual CloudFormation template builder',
            house: 'code',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['devops'],
            paths: ['devops-fundamentals'],
            components: {
                applet: 'houses/code/applets/code-cloudformation-designer.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'code-docker-playground': {
            id: 'code-docker-playground',
            title: 'Docker Playground',
            description: 'Interactive Docker container sandbox',
            house: 'code',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['devops', 'docker'],
            paths: ['devops-fundamentals'],
            components: {
                applet: 'houses/code/applets/code-docker-playground.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'code-kubernetes-sim': {
            id: 'code-kubernetes-sim',
            title: 'Kubernetes Cluster Simulator',
            description: 'Simulate Kubernetes cluster operations',
            house: 'code',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['devops'],
            paths: ['devops-fundamentals'],
            components: {
                applet: 'houses/code/applets/code-kubernetes-cluster-sim.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'code-pipeline-builder': {
            id: 'code-pipeline-builder',
            title: 'Pipeline Builder',
            description: 'Design and visualize CI/CD pipelines',
            house: 'code',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['devops'],
            paths: ['devops-fundamentals', 'python-fundamentals'],
            components: {
                applet: 'houses/code/applets/code-pipeline-builder.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'code-sprint-simulator': {
            id: 'code-sprint-simulator',
            title: 'Sprint Simulator',
            description: 'Agile sprint planning and simulation',
            house: 'code',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['devops'],
            paths: ['devops-fundamentals'],
            components: {
                applet: 'houses/code/tools/code-sprint.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'code-cicd-lab': {
            id: 'code-cicd-lab',
            title: 'CI/CD Lab',
            description: 'Hands-on CI/CD pipeline implementation',
            house: 'code',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['devops'],
            paths: ['devops-fundamentals'],
            components: {
                lab: 'houses/code/labs/code-cicd.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'code-cloudformation-lab': {
            id: 'code-cloudformation-lab',
            title: 'CloudFormation Lab',
            description: 'Build infrastructure with CloudFormation',
            house: 'code',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['devops'],
            paths: ['devops-fundamentals'],
            components: {
                lab: 'houses/code/labs/code-cloudformation.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'code-docker-lab': {
            id: 'code-docker-lab',
            title: 'Docker Lab',
            description: 'Container creation and management exercises',
            house: 'code',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['devops', 'docker'],
            paths: ['devops-fundamentals'],
            components: {
                lab: 'houses/code/labs/code-docker.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'code-kubernetes-lab': {
            id: 'code-kubernetes-lab',
            title: 'Kubernetes Lab',
            description: 'Deploy and manage Kubernetes workloads',
            house: 'code',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['devops'],
            paths: ['devops-fundamentals'],
            components: {
                lab: 'houses/code/labs/code-kubernetes.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'code-terraform-lab': {
            id: 'code-terraform-lab',
            title: 'Terraform Lab',
            description: 'Infrastructure provisioning with Terraform',
            house: 'code',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['devops'],
            paths: ['devops-fundamentals'],
            components: {
                lab: 'houses/code/labs/code-terraform.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'code-agile-sdlc': {
            id: 'code-agile-sdlc',
            title: 'Agile & SDLC',
            description: 'Software development lifecycle and Agile methodologies',
            house: 'code',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['devops'],
            paths: ['devops-fundamentals'],
            components: {
                presentation: 'houses/code/presentations/code-agile-sdlc.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'code-cicd-fundamentals': {
            id: 'code-cicd-fundamentals',
            title: 'CI/CD Fundamentals',
            description: 'Continuous Integration and Delivery concepts',
            house: 'code',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['devops'],
            paths: ['devops-fundamentals'],
            components: {
                presentation: 'houses/code/presentations/code-cicd-fundamentals.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'code-cloudformation-fundamentals': {
            id: 'code-cloudformation-fundamentals',
            title: 'CloudFormation Fundamentals',
            description: 'AWS infrastructure as code with CloudFormation',
            house: 'code',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['devops'],
            paths: ['devops-fundamentals'],
            components: {
                presentation: 'houses/code/presentations/code-cloudformation-fundamentals.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'code-kubernetes-fundamentals': {
            id: 'code-kubernetes-fundamentals',
            title: 'Kubernetes Fundamentals',
            description: 'Container orchestration with Kubernetes',
            house: 'code',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['devops'],
            paths: ['devops-fundamentals'],
            components: {
                presentation: 'houses/code/presentations/code-kubernetes-fundamentals.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'code-terraform-fundamentals': {
            id: 'code-terraform-fundamentals',
            title: 'Terraform Fundamentals',
            description: 'Multi-cloud infrastructure with Terraform',
            house: 'code',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['devops'],
            paths: ['devops-fundamentals'],
            components: {
                presentation: 'houses/code/presentations/code-terraform-fundamentals.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'code-agile-quiz': {
            id: 'code-agile-quiz',
            title: 'Agile Quiz',
            description: 'Test your Agile and SDLC knowledge',
            house: 'code',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['devops'],
            paths: ['devops-fundamentals'],
            components: {
                quiz: 'houses/code/quizzes/code-agile.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'code-cicd-quiz': {
            id: 'code-cicd-quiz',
            title: 'CI/CD Quiz',
            description: 'Test your CI/CD knowledge',
            house: 'code',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['devops'],
            paths: ['devops-fundamentals'],
            components: {
                quiz: 'houses/code/quizzes/code-cicd.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'code-cloudformation-quiz': {
            id: 'code-cloudformation-quiz',
            title: 'CloudFormation Quiz',
            description: 'Test your CloudFormation knowledge',
            house: 'code',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['devops'],
            paths: ['devops-fundamentals'],
            components: {
                quiz: 'houses/code/quizzes/code-cloudformation.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'code-docker-quiz': {
            id: 'code-docker-quiz',
            title: 'Docker Quiz',
            description: 'Test your Docker knowledge',
            house: 'code',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['devops', 'docker'],
            paths: ['devops-fundamentals'],
            components: {
                quiz: 'houses/code/quizzes/code-docker.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'code-kubernetes-quiz': {
            id: 'code-kubernetes-quiz',
            title: 'Kubernetes Quiz',
            description: 'Test your Kubernetes knowledge',
            house: 'code',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['devops'],
            paths: ['devops-fundamentals'],
            components: {
                quiz: 'houses/code/quizzes/code-kubernetes.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'code-terraform-quiz': {
            id: 'code-terraform-quiz',
            title: 'Terraform Quiz',
            description: 'Test your Terraform knowledge',
            house: 'code',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['devops'],
            paths: ['devops-fundamentals'],
            components: {
                quiz: 'houses/code/quizzes/code-terraform.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'code-data-format-converter': {
            id: 'code-data-format-converter',
            title: 'Data Format Converter',
            description: 'Convert between JSON, XML, and YAML formats with syntax highlighting and validation',
            house: 'code',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['devops'],
            paths: ['devops-fundamentals'],
            components: {
                applet: 'houses/code/applets/code-data-format-converter.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'code-api-explorer': {
            id: 'code-api-explorer',
            title: 'API Explorer',
            description: 'Build and test HTTP requests with headers, parameters, auth, and response visualization',
            house: 'code',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['devops'],
            paths: ['devops-fundamentals'],
            components: {
                applet: 'houses/code/tools/code-api.tool.html'
            },
            prerequisites: [],
            objectives: []
        }
,

        // ─────────────────────────────────────────────────────────────
        // KEY HOUSE - 36 new entries
        // ─────────────────────────────────────────────────────────────
        'code-ansible-visualizer': {
            id: 'code-ansible-visualizer',
            title: 'Ansible Playbook Visualizer',
            description: 'Parse and visualize Ansible playbook structure - plays, tasks, handlers, and variables',
            house: 'code',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['devops'],
            paths: ['devops-fundamentals'],
            components: {
                applet: 'houses/code/tools/code-ansible-playbook.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'key-symmetric-vs-asymmetric': {
            id: 'key-symmetric-vs-asymmetric',
            title: 'Symmetric vs Asymmetric',
            description: 'Understanding the differences and use cases for each approach',
            house: 'key',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 35,
            topics: ['cryptography'],
            paths: ['cryptography-track', 'security-plus'],
            components: {
                presentation: 'houses/key/presentations/key-advanced-symmetric.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'key-hashing-integrity': {
            id: 'key-hashing-integrity',
            title: 'Hashing & Integrity',
            description: 'Hash functions, checksums, and verifying data integrity',
            house: 'key',
            type: 'lab',
            difficulty: 'beginner',
            duration: 65,
            topics: ['cryptography', 'hashing'],
            paths: ['cryptography-track', 'security-plus'],
            components: {
                lab: 'houses/key/tools/key-hmac.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'key-digital-signatures': {
            id: 'key-digital-signatures',
            title: 'Digital Signatures',
            description: 'Creating and verifying digital signatures for authentication',
            house: 'key',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 35,
            topics: ['cryptography'],
            paths: ['cryptography-track', 'security-plus', 'devops-fundamentals', 'comptia-network'],
            components: {
                presentation: 'houses/key/tools/key-cert.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'key-pki-deep-dive': {
            id: 'key-pki-deep-dive',
            title: 'PKI Deep Dive',
            description: 'Certificate authorities, chains of trust, and PKI infrastructure',
            house: 'key',
            type: 'lab',
            difficulty: 'beginner',
            duration: 65,
            topics: ['cryptography'],
            paths: ['cryptography-track', 'security-plus'],
            components: {
                lab: 'houses/key/presentations/key-certificates.presentation.html'
            },
        'key-tls-ssl': {
            id: 'key-tls-ssl',
            title: 'TLS/SSL Explained',
            description: 'Transport Layer Security protocols and secure web communications',
            house: 'key',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 35,
            topics: ['cryptography'],
            paths: ['cryptography-track', 'security-plus'],
            components: {},
            prerequisites: [],
            objectives: []
        },
            prerequisites: [],
            objectives: []
        },
        'key-cryptography-fundamentals': {
            id: 'key-cryptography-fundamentals',
            title: 'Cryptography Fundamentals (CEH)',
            description: 'Complete CEH coverage: classical ciphers, symmetric/asymmetric, hashing, PKI, digital signatures, crypto tools & GAK ethics',
            house: 'key',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 35,
            topics: ['cryptography'],
            paths: ['cryptography-track', 'security-plus', 'security-operations'],
            components: {
                quiz: 'houses/key/presentations/key-cryptography-fundamentals.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'key-aes-lab': {
            id: 'key-aes-lab',
            title: 'AES Encryption Lab',
            description: 'Hands-on AES encryption implementation and analysis',
            house: 'key',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['cryptography', 'encryption'],
            paths: ['cryptography-track', 'security-plus'],
            components: {
                lab: 'houses/key/labs/key-aes.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'key-attack-lab': {
            id: 'key-attack-lab',
            title: 'Cryptographic Attack Lab',
            description: 'Practice common cryptographic attacks and defenses',
            house: 'key',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['cryptography'],
            paths: ['cryptography-track', 'security-plus'],
            components: {
                lab: 'houses/key/labs/key-attack.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'key-cert-lab': {
            id: 'key-cert-lab',
            title: 'Certificate Lab',
            description: 'Create and manage digital certificates',
            house: 'key',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['cryptography'],
            paths: ['cryptography-track', 'security-plus'],
            components: {
                lab: 'houses/key/labs/key-cert.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'key-ecc-lab': {
            id: 'key-ecc-lab',
            title: 'Elliptic Curve Lab',
            description: 'Implement ECC algorithms and key exchange',
            house: 'key',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['cryptography'],
            paths: ['cryptography-track', 'security-plus'],
            components: {
                lab: 'houses/key/labs/key-ecc.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'key-hmac-lab': {
            id: 'key-hmac-lab',
            title: 'HMAC Lab',
            description: 'Message authentication code implementation',
            house: 'key',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['cryptography'],
            paths: ['cryptography-track', 'security-plus'],
            components: {
                lab: 'houses/key/labs/key-hmac.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'key-hsm-lab': {
            id: 'key-hsm-lab',
            title: 'HSM Lab',
            description: 'Hardware Security Module operations',
            house: 'key',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['cryptography'],
            paths: ['cryptography-track', 'security-plus'],
            components: {
                lab: 'houses/key/labs/key-hsm.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'key-kdf-lab': {
            id: 'key-kdf-lab',
            title: 'Key Derivation Lab',
            description: 'Key derivation function implementation',
            house: 'key',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['cryptography'],
            paths: ['cryptography-track', 'security-plus'],
            components: {
                lab: 'houses/key/labs/key-kdf.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'key-pqc-lab': {
            id: 'key-pqc-lab',
            title: 'Post-Quantum Crypto Lab',
            description: 'Quantum-resistant cryptography experiments',
            house: 'key',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['cryptography'],
            paths: ['cryptography-track', 'security-plus'],
            components: {
                lab: 'houses/key/labs/key-pqc.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'key-cryptanalysis': {
            id: 'key-cryptanalysis',
            title: 'Cryptanalysis',
            description: 'Breaking ciphers and analyzing weaknesses',
            house: 'key',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['cryptography'],
            paths: ['cryptography-track', 'security-plus'],
            components: {
                presentation: 'houses/key/presentations/key-cryptanalysis.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'key-elliptic-curve': {
            id: 'key-elliptic-curve',
            title: 'Elliptic Curve Cryptography',
            description: 'ECC fundamentals and applications',
            house: 'key',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['cryptography'],
            paths: ['cryptography-track', 'security-plus'],
            components: {
                presentation: 'houses/key/presentations/key-elliptic-curve.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'key-key-derivation': {
            id: 'key-key-derivation',
            title: 'Key Derivation',
            description: 'KDFs, PBKDF2, Argon2, and key stretching',
            house: 'key',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['cryptography'],
            paths: ['cryptography-track', 'security-plus'],
            components: {
                presentation: 'houses/key/presentations/key-derivation.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'key-key-management': {
            id: 'key-key-management',
            title: 'Key Management',
            description: 'Key lifecycle, rotation, and best practices',
            house: 'key',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['cryptography'],
            paths: ['cryptography-track', 'security-plus'],
            components: {
                presentation: 'houses/key/presentations/key-management.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'key-message-auth': {
            id: 'key-message-auth',
            title: 'Message Authentication',
            description: 'MACs, HMAC, and message integrity',
            house: 'key',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['cryptography'],
            paths: ['cryptography-track', 'security-plus'],
            components: {
                presentation: 'houses/key/presentations/key-message-authentication.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'key-post-quantum': {
            id: 'key-post-quantum',
            title: 'Post-Quantum Cryptography',
            description: 'Quantum computing threats and PQC algorithms',
            house: 'key',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['cryptography'],
            paths: ['cryptography-track', 'security-plus'],
            components: {
                presentation: 'houses/key/presentations/key-post-quantum.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'key-cert-quiz': {
            id: 'key-cert-quiz',
            title: 'Certificates Quiz',
            description: 'Test your PKI and certificate knowledge',
            house: 'key',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['cryptography'],
            paths: ['cryptography-track', 'security-plus'],
            components: {
                quiz: 'houses/key/quizzes/key-cert.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'key-cryptanalysis-quiz': {
            id: 'key-cryptanalysis-quiz',
            title: 'Cryptanalysis Quiz',
            description: 'Test your cipher breaking knowledge',
            house: 'key',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['cryptography'],
            paths: ['cryptography-track', 'security-plus'],
            components: {
                quiz: 'houses/key/quizzes/key-cryptanalysis.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'key-ecc-quiz': {
            id: 'key-ecc-quiz',
            title: 'ECC Quiz',
            description: 'Test your elliptic curve knowledge',
            house: 'key',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['cryptography'],
            paths: ['cryptography-track', 'security-plus'],
            components: {
                quiz: 'houses/key/quizzes/key-ecc.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'key-hsm-quiz': {
            id: 'key-hsm-quiz',
            title: 'HSM Quiz',
            description: 'Test your hardware security module knowledge',
            house: 'key',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['cryptography'],
            paths: ['cryptography-track', 'security-plus'],
            components: {
                quiz: 'houses/key/quizzes/key-hsm.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'key-kdf-quiz': {
            id: 'key-kdf-quiz',
            title: 'KDF Quiz',
            description: 'Test your key derivation knowledge',
            house: 'key',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['cryptography'],
            paths: ['cryptography-track', 'security-plus'],
            components: {
                quiz: 'houses/key/quizzes/key-kdf.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'key-mac-quiz': {
            id: 'key-mac-quiz',
            title: 'MAC Quiz',
            description: 'Test your message authentication knowledge',
            house: 'key',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['cryptography'],
            paths: ['cryptography-track', 'security-plus'],
            components: {
                quiz: 'houses/key/quizzes/key-mac.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'key-pqc-quiz': {
            id: 'key-pqc-quiz',
            title: 'PQC Quiz',
            description: 'Test your post-quantum cryptography knowledge',
            house: 'key',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['cryptography'],
            paths: ['cryptography-track', 'security-plus'],
            components: {
                quiz: 'houses/key/quizzes/key-pqc.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'key-symmetric-quiz': {
            id: 'key-symmetric-quiz',
            title: 'Symmetric Encryption Quiz',
            description: 'Test your symmetric crypto knowledge',
            house: 'key',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['cryptography', 'encryption'],
            paths: ['cryptography-track', 'security-plus'],
            components: {
                quiz: 'houses/key/quizzes/key-symmetric.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'key-aes-explorer': {
            id: 'key-aes-explorer',
            title: 'AES Explorer',
            description: 'Interactive AES encryption visualization',
            house: 'key',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['cryptography'],
            paths: ['cryptography-track', 'security-plus'],
            components: {
                applet: 'houses/key/tools/key-aes.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'key-cryptanalysis-tool': {
            id: 'key-cryptanalysis-tool',
            title: 'Cryptanalysis Lab Tool',
            description: 'Cipher analysis and breaking tools',
            house: 'key',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['cryptography'],
            paths: ['cryptography-track', 'security-plus'],
            components: {
                applet: 'houses/key/labs/key-cryptanalysis.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'key-ecc-visualizer': {
            id: 'key-ecc-visualizer',
            title: 'ECC Visualizer',
            description: 'Elliptic curve visualization and calculations',
            house: 'key',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['cryptography'],
            paths: ['cryptography-track', 'security-plus'],
            components: {
                applet: 'houses/key/tools/key-ecc.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'key-kdf-analyzer': {
            id: 'key-kdf-analyzer',
            title: 'KDF Analyzer',
            description: 'Key derivation function analysis tool',
            house: 'key',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['cryptography'],
            paths: ['cryptography-track', 'security-plus'],
            components: {
                applet: 'houses/key/tools/key-kdf.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'key-lifecycle': {
            id: 'key-lifecycle',
            title: 'Key Lifecycle Manager',
            description: 'Key generation, storage, and rotation simulator',
            house: 'key',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['cryptography'],
            paths: ['cryptography-track', 'security-plus'],
            components: {
                applet: 'houses/key/tools/key-lifecycle.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'key-pqc-explorer': {
            id: 'key-pqc-explorer',
            title: 'PQC Explorer',
            description: 'Post-quantum cryptography algorithm explorer',
            house: 'key',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['cryptography'],
            paths: ['cryptography-track', 'security-plus'],
            components: {
                applet: 'houses/key/tools/key-pqc.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'key-hash-stego-intro': {
            id: 'key-hash-stego-intro',
            title: 'Hash & Steganography Intro',
            description: 'Introduction to hashing and steganography concepts',
            house: 'key',
            type: 'module',
            difficulty: 'beginner',
            duration: 30,
            topics: ['cryptography', 'hashing'],
            paths: ['cryptography-track', 'security-plus'],
            components: {
                applet: 'houses/key/modules/key-hash-stego-intro.module.html'
            },
            prerequisites: [],
            objectives: []
        }
,

        // ─────────────────────────────────────────────────────────────
        // EYE HOUSE - 21 new entries
        // ─────────────────────────────────────────────────────────────
        'key-crypto-stego-lab': {
            id: 'key-crypto-stego-lab',
            title: 'Crypto & Steganography Lab',
            description: 'Hands-on cryptography and steganography exercises',
            house: 'key',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['cryptography'],
            paths: ['cryptography-track', 'security-plus'],
            components: {
                lab: 'houses/key/labs/key-crypto-stego.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-wireshark-training': {
            id: 'eye-wireshark-training',
            title: 'Wireshark Training Lab',
            description: 'Master network protocol analysis with interactive filter practice and challenges',
            house: 'eye',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 45,
            topics: ['monitoring'],
            paths: ['security-operations', 'security-plus'],
            components: {
                quiz: 'houses/eye/tools/eye-wireshark.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-packet-analyzer': {
            id: 'eye-packet-analyzer',
            title: 'Packet Analyzer',
            description: 'Interactive Wireshark-style packet analysis tool for security operations',
            house: 'eye',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['monitoring'],
            paths: ['security-operations', 'security-plus', 'comptia-network'],
            components: {
                applet: 'houses/eye/tools/eye-packet.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-traffic-lab': {
            id: 'eye-traffic-lab',
            title: 'Traffic Analysis Lab',
            description: 'Hands-on exercises analyzing real network traffic patterns',
            house: 'eye',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['monitoring'],
            paths: ['security-operations', 'security-plus'],
            components: {
                lab: 'houses/eye/labs/eye-traffic.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-siem-intro': {
            id: 'eye-siem-intro',
            title: 'SIEM Introduction',
            description: 'Understanding Security Information and Event Management systems',
            house: 'eye',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 35,
            topics: ['monitoring'],
            paths: ['security-operations', 'security-plus'],
            components: {
                presentation: 'houses/eye/presentations/eye-siem-fundamentals.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-splunk-basics': {
            id: 'eye-splunk-basics',
            title: 'Splunk Fundamentals',
            description: 'Search Processing Language (SPL) and basic queries',
            house: 'eye',
            type: 'lab',
            difficulty: 'beginner',
            duration: 65,
            topics: ['monitoring'],
            paths: ['security-operations', 'security-plus'],
            components: {
                lab: 'houses/eye/tools/eye-siem.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-threat-hunting': {
            id: 'eye-threat-hunting',
            title: 'Threat Hunting',
            description: 'Proactive search for threats in your environment',
            house: 'eye',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 35,
            topics: ['monitoring'],
            paths: ['security-operations', 'security-plus'],
            components: {
                quiz: 'houses/eye/presentations/eye-threat-hunting.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-incident-timeline': {
            id: 'eye-incident-timeline',
            title: 'Incident Timeline',
            description: 'Constructing chronological event sequences for investigations',
            house: 'eye',
            type: 'lab',
            difficulty: 'beginner',
            duration: 35,
            topics: ['monitoring'],
            paths: ['security-operations', 'security-plus'],
            components: {
                lab: 'houses/eye/labs/eye-incident-timeline.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-hunting-lab': {
            id: 'eye-hunting-lab',
            title: 'Threat Hunting Lab',
            description: 'Hands-on practice with proactive threat hunting techniques',
            house: 'eye',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['monitoring'],
            paths: ['security-operations', 'security-plus'],
            components: {
                lab: 'houses/eye/labs/eye-hunting.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-siem-lab': {
            id: 'eye-siem-lab',
            title: 'SIEM Lab',
            description: 'Practical exercises with SIEM platforms and log correlation',
            house: 'eye',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['monitoring'],
            paths: ['security-operations', 'security-plus'],
            components: {
                lab: 'houses/eye/labs/eye-siem.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-soc-lab': {
            id: 'eye-soc-lab',
            title: 'SOC Operations Lab',
            description: 'Security Operations Center workflow simulation',
            house: 'eye',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['monitoring'],
            paths: ['security-operations', 'security-plus'],
            components: {
                lab: 'houses/eye/labs/eye-soc.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-log-correlation': {
            id: 'eye-log-correlation',
            title: 'Log Correlation',
            description: 'Connecting events across multiple log sources',
            house: 'eye',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['monitoring'],
            paths: ['security-operations', 'security-plus'],
            components: {
                presentation: 'houses/eye/presentations/eye-log-correlation.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-network-traffic': {
            id: 'eye-network-traffic',
            title: 'Network Traffic Analysis',
            description: 'Deep dive into network traffic patterns and anomaly detection',
            house: 'eye',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['monitoring', 'networking'],
            paths: ['security-operations', 'security-plus', 'comptia-network'],
            components: {
                presentation: 'houses/eye/presentations/eye-network-traffic-analysis.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-soc-operations': {
            id: 'eye-soc-operations',
            title: 'SOC Operations',
            description: 'Security Operations Center procedures and best practices',
            house: 'eye',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['monitoring'],
            paths: ['security-operations', 'security-plus'],
            components: {
                presentation: 'houses/eye/presentations/eye-soc-operations.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-correlation-quiz': {
            id: 'eye-correlation-quiz',
            title: 'Correlation Quiz',
            description: 'Test your log correlation and event analysis skills',
            house: 'eye',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['monitoring'],
            paths: ['security-operations', 'security-plus'],
            components: {
                quiz: 'houses/eye/quizzes/eye-correlation.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-hunting-quiz': {
            id: 'eye-hunting-quiz',
            title: 'Threat Hunting Quiz',
            description: 'Assess your threat hunting knowledge',
            house: 'eye',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['monitoring'],
            paths: ['security-operations', 'security-plus'],
            components: {
                quiz: 'houses/eye/quizzes/eye-hunting.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-siem-quiz': {
            id: 'eye-siem-quiz',
            title: 'SIEM Quiz',
            description: 'Test your SIEM concepts and query skills',
            house: 'eye',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['monitoring'],
            paths: ['security-operations', 'security-plus'],
            components: {
                quiz: 'houses/eye/quizzes/eye-siem.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-soc-quiz': {
            id: 'eye-soc-quiz',
            title: 'SOC Operations Quiz',
            description: 'Evaluate your SOC workflow knowledge',
            house: 'eye',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['monitoring'],
            paths: ['security-operations', 'security-plus'],
            components: {
                quiz: 'houses/eye/quizzes/eye-soc.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-traffic-quiz': {
            id: 'eye-traffic-quiz',
            title: 'Traffic Analysis Quiz',
            description: 'Test your network traffic analysis skills',
            house: 'eye',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['monitoring'],
            paths: ['security-operations', 'security-plus'],
            components: {
                quiz: 'houses/eye/quizzes/eye-traffic.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-correlation-engine': {
            id: 'eye-correlation-engine',
            title: 'Correlation Engine',
            description: 'Interactive tool for building correlation rules',
            house: 'eye',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['monitoring'],
            paths: ['security-operations', 'security-plus'],
            components: {
                applet: 'houses/eye/tools/eye-correlation.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-hunt-workbench': {
            id: 'eye-hunt-workbench',
            title: 'Hunt Workbench',
            description: 'Threat hunting workspace with hypothesis tracking',
            house: 'eye',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['monitoring'],
            paths: ['security-operations', 'security-plus'],
            components: {
                applet: 'houses/eye/tools/eye-hunt.tool.html'
            },
            prerequisites: [],
            objectives: []
        },

        // ─────────────────────────────────────────────────────────────
        // DARK ARTS HOUSE - Offensive Security & Ethical Hacking
        // ─────────────────────────────────────────────────────────────

        'dark-arts-cyberops-200201': {
            id: 'dark-arts-cyberops-200201',
            title: 'CyberOps Associate 200-201',
            description: 'Cisco CyberOps certification prep: SOC fundamentals, threat analysis, incident response',
            house: 'dark-arts',
            type: 'module',
            difficulty: 'intermediate',
            duration: 240,
            topics: ['security-operations', 'soc', 'incident-response', 'cyberops'],
            paths: ['security-operations'],
            components: {
                presentation: 'houses/eye/modules/cyberops/index.html',
                applet: 'houses/eye/applets/cyberops/week1/index.html'
            },
            prerequisites: [],
            objectives: ['Complete all 8 weeks of CyberOps training', 'Pass the final assessment']
        },
        'dark-arts-feh-01': {
            id: 'dark-arts-feh-01',
            title: 'FEH-01: The Hacker Mindset',
            description: 'Ethics, legality, hacker types, kill chain, MITRE ATT&CK',
            house: 'dark-arts',
            type: 'module',
            difficulty: 'beginner',
            duration: 30,
            topics: ['ethical-hacking', 'methodology'],
            paths: [],
            components: {
                presentation: 'houses/dark-arts/presentations/dark-arts-feh-01.presentation.html'
            },
            prerequisites: [],
            objectives: ['Understand ethical hacking principles', 'Explain the Cyber Kill Chain']
        },
        'dark-arts-feh-02': {
            id: 'dark-arts-feh-02',
            title: 'FEH-02: Reconnaissance & OSINT',
            description: 'Google dorking, whois, Shodan, footprinting, metadata analysis',
            house: 'dark-arts',
            type: 'module',
            difficulty: 'beginner',
            duration: 35,
            topics: ['reconnaissance', 'osint'],
            paths: [],
            components: {
                presentation: 'houses/dark-arts/presentations/dark-arts-feh-02.presentation.html'
            },
            prerequisites: ['dark-arts-feh-01'],
            objectives: ['Perform passive reconnaissance', 'Use OSINT tools and techniques']
        },
        'dark-arts-feh-03': {
            id: 'dark-arts-feh-03',
            title: 'FEH-03: Scanning & Enumeration',
            description: 'Nmap, port scanning, service detection, vulnerability scanning',
            house: 'dark-arts',
            type: 'module',
            difficulty: 'intermediate',
            duration: 35,
            topics: ['scanning', 'enumeration', 'nmap'],
            paths: [],
            components: {
                presentation: 'houses/dark-arts/presentations/dark-arts-feh-03.presentation.html'
            },
            prerequisites: ['dark-arts-feh-02'],
            objectives: ['Perform network scanning with Nmap', 'Enumerate services and hosts']
        },
        'dark-arts-feh-04': {
            id: 'dark-arts-feh-04',
            title: 'FEH-04: Vulnerability Assessment',
            description: 'CVEs, CVSS scoring, vulnerability databases, risk assessment',
            house: 'dark-arts',
            type: 'module',
            difficulty: 'intermediate',
            duration: 30,
            topics: ['vulnerabilities', 'risk-assessment'],
            paths: [],
            components: {
                presentation: 'houses/dark-arts/presentations/dark-arts-feh-04.presentation.html'
            },
            prerequisites: ['dark-arts-feh-03'],
            objectives: ['Understand CVE and CVSS', 'Prioritize vulnerabilities by risk']
        },
        'dark-arts-feh-05': {
            id: 'dark-arts-feh-05',
            title: 'FEH-05: System Exploitation',
            description: 'Password attacks, privilege escalation, post-exploitation',
            house: 'dark-arts',
            type: 'module',
            difficulty: 'intermediate',
            duration: 35,
            topics: ['exploitation', 'privilege-escalation'],
            paths: [],
            components: {
                presentation: 'houses/dark-arts/presentations/dark-arts-feh-05.presentation.html'
            },
            prerequisites: ['dark-arts-feh-04'],
            objectives: ['Understand exploitation methodology', 'Identify privilege escalation vectors']
        },
        'dark-arts-feh-06': {
            id: 'dark-arts-feh-06',
            title: 'FEH-06: Web Application Security',
            description: 'OWASP Top 10, SQL injection, XSS, CSRF, SSRF',
            house: 'dark-arts',
            type: 'module',
            difficulty: 'intermediate',
            duration: 35,
            topics: ['web-security', 'owasp'],
            paths: [],
            components: {
                presentation: 'houses/dark-arts/presentations/dark-arts-feh-06.presentation.html'
            },
            prerequisites: ['dark-arts-feh-05'],
            objectives: ['Understand OWASP Top 10', 'Identify web application vulnerabilities']
        },
        'dark-arts-feh-07': {
            id: 'dark-arts-feh-07',
            title: 'FEH-07: Network Attacks & Defense',
            description: 'Sniffing, ARP poisoning, MITM, DNS attacks, DoS/DDoS',
            house: 'dark-arts',
            type: 'module',
            difficulty: 'intermediate',
            duration: 35,
            topics: ['network-attacks', 'defense'],
            paths: [],
            components: {
                presentation: 'houses/dark-arts/presentations/dark-arts-feh-07.presentation.html'
            },
            prerequisites: ['dark-arts-feh-06'],
            objectives: ['Understand network attack techniques', 'Apply network defense strategies']
        },
        'dark-arts-feh-08': {
            id: 'dark-arts-feh-08',
            title: 'FEH-08: Social Engineering',
            description: 'Phishing, pretexting, vishing, physical security attacks',
            house: 'dark-arts',
            type: 'module',
            difficulty: 'intermediate',
            duration: 30,
            topics: ['social-engineering', 'human-factors'],
            paths: [],
            components: {
                presentation: 'houses/dark-arts/presentations/dark-arts-feh-08.presentation.html'
            },
            prerequisites: ['dark-arts-feh-07'],
            objectives: ['Identify social engineering techniques', 'Build security awareness programs']
        },
        'dark-arts-feh-09': {
            id: 'dark-arts-feh-09',
            title: 'FEH-09: Cryptography & Steganography',
            description: 'Encryption, hashing, PKI, steganography, cryptographic attacks',
            house: 'dark-arts',
            type: 'module',
            difficulty: 'intermediate',
            duration: 35,
            topics: ['cryptography', 'steganography'],
            paths: [],
            components: {
                presentation: 'houses/dark-arts/presentations/dark-arts-feh-09.presentation.html'
            },
            prerequisites: ['dark-arts-feh-08'],
            objectives: ['Understand encryption algorithms', 'Identify cryptographic weaknesses']
        },
        'dark-arts-feh-10': {
            id: 'dark-arts-feh-10',
            title: 'FEH-10: Malware Analysis Basics',
            description: 'Malware types, analysis methodology, IOCs, reverse engineering intro',
            house: 'dark-arts',
            type: 'module',
            difficulty: 'intermediate',
            duration: 35,
            topics: ['malware', 'analysis', 'reverse-engineering'],
            paths: [],
            components: {
                presentation: 'houses/dark-arts/presentations/dark-arts-feh-10.presentation.html'
            },
            prerequisites: ['dark-arts-feh-09'],
            objectives: ['Classify malware types', 'Perform basic static and dynamic analysis']
        },

        // ─────────────────────────────────────────────────────────────
        // DARK ARTS VAULT - Offensive Linux Terminal Labs (Sprint L-5)
        // ─────────────────────────────────────────────────────────────

        // Warmup Drills
        'da-linux-nmap-drill': {
            id: 'da-linux-nmap-drill',
            title: 'Nmap Scanning Drill',
            description: 'Practice nmap scan types: TCP connect, SYN, UDP, version, OS detection, and aggressive scans',
            house: 'dark-arts',
            type: 'lab',
            difficulty: 'beginner',
            duration: 15,
            topics: ['nmap', 'scanning', 'reconnaissance'],
            paths: [],
            components: {
                lab: 'dark-arts/vault/labs/linux/da-linux-nmap-drill.lab.html'
            },
            prerequisites: [],
            objectives: ['Execute 8 different nmap scan types', 'Understand scan flag differences']
        },
        'da-linux-hash-drill': {
            id: 'da-linux-hash-drill',
            title: 'Hash Identification Drill',
            description: 'Identify hash types: MD5, SHA-1, SHA-256, NTLM, bcrypt, SHA-512, MySQL, Linux crypt',
            house: 'dark-arts',
            type: 'lab',
            difficulty: 'beginner',
            duration: 15,
            topics: ['hashing', 'hash-identification', 'password-cracking'],
            paths: [],
            components: {
                lab: 'dark-arts/vault/labs/linux/da-linux-hash-drill.lab.html'
            },
            prerequisites: [],
            objectives: ['Identify 8 common hash formats', 'Match hashes to hashcat modes']
        },
        'da-linux-recon-drill': {
            id: 'da-linux-recon-drill',
            title: 'Reconnaissance Drill',
            description: 'DNS and OSINT recon: whois, dig, nslookup, host, dnsrecon, and reverse DNS',
            house: 'dark-arts',
            type: 'lab',
            difficulty: 'beginner',
            duration: 15,
            topics: ['reconnaissance', 'dns', 'osint'],
            paths: [],
            components: {
                lab: 'dark-arts/vault/labs/linux/da-linux-recon-drill.lab.html'
            },
            prerequisites: [],
            objectives: ['Use 8 reconnaissance tools', 'Extract DNS records and domain information']
        },

        // Prep Labs
        'da-linux-enumeration': {
            id: 'da-linux-enumeration',
            title: 'Enumeration Preparation',
            description: 'Guided 8-phase enumeration workflow: host discovery through vulnerability scanning',
            house: 'dark-arts',
            type: 'lab',
            difficulty: 'intermediate',
            duration: 25,
            topics: ['enumeration', 'scanning', 'methodology'],
            paths: [],
            components: {
                lab: 'dark-arts/vault/labs/linux/da-linux-enumeration-prep.lab.html'
            },
            prerequisites: ['da-linux-nmap-drill'],
            objectives: ['Complete full enumeration workflow', 'Document findings systematically']
        },
        'da-linux-exploitation': {
            id: 'da-linux-exploitation',
            title: 'Exploitation Preparation',
            description: 'Guided 8-phase exploitation workflow: vulnerability research through documentation',
            house: 'dark-arts',
            type: 'lab',
            difficulty: 'intermediate',
            duration: 25,
            topics: ['exploitation', 'metasploit', 'methodology'],
            paths: [],
            components: {
                lab: 'dark-arts/vault/labs/linux/da-linux-exploitation-prep.lab.html'
            },
            prerequisites: ['da-linux-enumeration'],
            objectives: ['Complete full exploitation workflow', 'Document exploitation steps']
        },

        // Mission Labs
        'da-linux-nmap-advanced': {
            id: 'da-linux-nmap-advanced',
            title: 'Advanced Nmap Techniques',
            description: 'NSE scripts, vulnerability scanning, evasion techniques, idle scan, and output formats',
            house: 'dark-arts',
            type: 'lab',
            difficulty: 'advanced',
            duration: 30,
            topics: ['nmap', 'nse', 'evasion', 'scanning'],
            paths: [],
            components: {
                lab: 'dark-arts/vault/labs/linux/da-linux-nmap-advanced.lab.html'
            },
            prerequisites: ['da-linux-nmap-drill'],
            objectives: ['Use NSE script categories', 'Apply 10 advanced scanning techniques']
        },
        'da-linux-hashcat': {
            id: 'da-linux-hashcat',
            title: 'Hashcat Training Lab',
            description: 'GPU-accelerated cracking: dictionary, mask, rule-based, combinator, and PRINCE attacks',
            house: 'dark-arts',
            type: 'lab',
            difficulty: 'advanced',
            duration: 30,
            topics: ['hashcat', 'password-cracking', 'hash-attacks'],
            paths: [],
            components: {
                lab: 'dark-arts/vault/labs/linux/da-linux-hashcat.lab.html'
            },
            prerequisites: ['da-linux-hash-drill'],
            objectives: ['Execute 10 different hashcat attack modes', 'Crack various hash types']
        },
        'da-linux-hydra': {
            id: 'da-linux-hydra',
            title: 'Hydra Password Attack Lab',
            description: 'Network service brute-forcing with THC-Hydra across SSH, FTP, HTTP, and SMB',
            house: 'dark-arts',
            type: 'lab',
            difficulty: 'advanced',
            duration: 25,
            topics: ['hydra', 'brute-force', 'password-attacks'],
            paths: [],
            components: {
                lab: 'dark-arts/vault/labs/linux/da-linux-hydra.lab.html'
            },
            prerequisites: ['da-linux-hash-drill'],
            objectives: ['Brute-force 8 different service types', 'Apply rate limiting and evasion']
        },
        'da-linux-metasploit': {
            id: 'da-linux-metasploit',
            title: 'Metasploit Framework Lab',
            description: 'Full Metasploit workflow: search, configure, exploit, and post-exploitation with meterpreter',
            house: 'dark-arts',
            type: 'lab',
            difficulty: 'advanced',
            duration: 35,
            topics: ['metasploit', 'msfconsole', 'exploitation'],
            paths: [],
            components: {
                lab: 'dark-arts/vault/labs/linux/da-linux-metasploit.lab.html'
            },
            prerequisites: ['da-linux-exploitation'],
            objectives: ['Complete 10-step Metasploit attack chain', 'Manage sessions and extract data']
        },
        'da-linux-privesc': {
            id: 'da-linux-privesc',
            title: 'Linux Privilege Escalation Lab',
            description: 'Escalate from www-data to root via SUID, sudo, cron, capabilities, kernel exploits, and GTFOBins',
            house: 'dark-arts',
            type: 'lab',
            difficulty: 'advanced',
            duration: 35,
            topics: ['privilege-escalation', 'suid', 'sudo', 'kernel-exploits'],
            paths: [],
            components: {
                lab: 'dark-arts/vault/labs/linux/da-linux-privesc.lab.html'
            },
            prerequisites: ['da-linux-enumeration'],
            objectives: ['Discover 10 privilege escalation vectors', 'Achieve root access']
        },
        'da-linux-enumscripts': {
            id: 'da-linux-enumscripts',
            title: 'Enumeration Scripts Lab',
            description: 'Automated enumeration with LinPEAS, LinEnum, pspy, and linux-exploit-suggester',
            house: 'dark-arts',
            type: 'lab',
            difficulty: 'intermediate',
            duration: 25,
            topics: ['linpeas', 'linenum', 'pspy', 'automation'],
            paths: [],
            components: {
                lab: 'dark-arts/vault/labs/linux/da-linux-enumscripts.lab.html'
            },
            prerequisites: ['da-linux-enumeration'],
            objectives: ['Run 8 automated enumeration tools', 'Interpret enumeration output']
        },
        'da-linux-reverse-shells': {
            id: 'da-linux-reverse-shells',
            title: 'Reverse Shell Lab',
            description: 'Establish and stabilize reverse shells: bash, python, netcat, socat SSL, and PHP payloads',
            house: 'dark-arts',
            type: 'lab',
            difficulty: 'advanced',
            duration: 30,
            topics: ['reverse-shells', 'netcat', 'socat', 'payloads'],
            paths: [],
            components: {
                lab: 'dark-arts/vault/labs/linux/da-linux-reverse-shells.lab.html'
            },
            prerequisites: ['da-linux-exploitation'],
            objectives: ['Generate 8 reverse shell types', 'Stabilize and upgrade shell access']
        },
        'da-linux-post-exploitation': {
            id: 'da-linux-post-exploitation',
            title: 'Post-Exploitation Lab',
            description: 'Persistence, lateral movement, data exfiltration, pivoting, and operational security',
            house: 'dark-arts',
            type: 'lab',
            difficulty: 'advanced',
            duration: 40,
            topics: ['post-exploitation', 'persistence', 'lateral-movement', 'pivoting'],
            paths: [],
            components: {
                lab: 'dark-arts/vault/labs/linux/da-linux-post-exploitation.lab.html'
            },
            prerequisites: ['da-linux-privesc'],
            objectives: ['Complete 10 post-exploitation objectives', 'Generate final pentest report']
        },

        // ═══════════════════════════════════════════════════════════════
        // AUTO-GENERATED ENTRIES (registry-generator.js)
        // Generated: 2026-02-21
        // ═══════════════════════════════════════════════════════════════

        // ─── FORGE HOUSE (auto-generated) ───
        'forge-bit-dash': {
            id: 'forge-bit-dash',
            title: 'Bit Dash',
            description: 'Bit Dash — applet content for forge house',
            house: 'forge',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['bit', 'dash', 'hardware', 'systems'],
            paths: ['aplus-core1'],
            components: {
                applet: 'houses/forge/games/forge-bit-dash.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-bluetooth-pairing': {
            id: 'forge-bluetooth-pairing',
            title: 'Bluetooth Pairing',
            description: 'Bluetooth Pairing — lab content for forge house',
            house: 'forge',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['bluetooth', 'pairing', 'hardware', 'systems'],
            paths: ['aplus-core1'],
            components: {
                lab: 'houses/forge/applets/comptia-aplus/core-1/labs/forge-bluetooth-pairing.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-cable-matching': {
            id: 'forge-cable-matching',
            title: 'Cable Matching',
            description: 'Cable Matching — lab content for forge house',
            house: 'forge',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['cable', 'matching', 'hardware', 'systems'],
            paths: ['aplus-core1'],
            components: {
                lab: 'houses/forge/applets/comptia-aplus/core-1/labs/forge-cable-matching.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-change-management': {
            id: 'forge-change-management',
            title: 'Change Management',
            description: 'Change Management — module content for forge house',
            house: 'forge',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['change', 'management', 'hardware', 'systems'],
            paths: ['aplus-core2'],
            components: {
                lab: 'houses/forge/applets/comptia-aplus/core-2/labs/forge-change-management.lab.html',
                presentation: 'houses/forge/applets/comptia-aplus/core-2/presentations/forge-change-management.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-chip-match': {
            id: 'forge-chip-match',
            title: 'Chip Match',
            description: 'Chip Match — applet content for forge house',
            house: 'forge',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['chip', 'match', 'hardware', 'systems'],
            paths: ['aplus-core1'],
            components: {
                applet: 'houses/forge/games/forge-chip-match.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-cloud-scenarios': {
            id: 'forge-cloud-scenarios',
            title: 'Cloud Service Scenarios Lab',
            description: 'Cloud Service Scenarios Lab — lab content for forge house',
            house: 'forge',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['cloud', 'service', 'scenarios', 'hardware', 'systems'],
            paths: ['aplus-core1'],
            components: {
                lab: 'houses/forge/applets/comptia-aplus/core-1/labs/forge-cloud-scenarios.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-command-line': {
            id: 'forge-command-line',
            title: 'Advanced Command Line Lab',
            description: 'Advanced Command Line Lab — lab content for forge house',
            house: 'forge',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['command', 'line', 'hardware', 'systems'],
            paths: ['aplus-core1'],
            components: {
                lab: 'houses/forge/applets/comptia-aplus/core-1/labs/forge-command-line.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-core2-midterm': {
            id: 'forge-core2-midterm',
            title: 'Core 2 Midterm Exam',
            description: 'Core 2 Midterm Exam — quiz content for forge house',
            house: 'forge',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['core', 'midterm', 'exam', 'hardware', 'systems'],
            paths: ['aplus-core2'],
            components: {
                quiz: 'houses/forge/applets/comptia-aplus/core-2/quizzes/forge-core2-midterm.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-core2-quiz-ch19-22': {
            id: 'forge-core2-quiz-ch19-22',
            title: 'CompTIA A+ Certification Quiz – Chapters 19–22',
            description: 'CompTIA A+ Certification Quiz – Chapters 19–22 — module content for forge house',
            house: 'forge',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['comptia', 'certification', 'chapters', 'hardware', 'systems'],
            paths: ['aplus-core2'],
            components: {
                quiz: 'houses/forge/applets/comptia-aplus/core-2/quizzes/forge-core2-quiz-ch19-22.quiz.html',
                applet: 'houses/forge/applets/comptia-aplus/forge-core2-quiz-ch19-22.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-core2-roleplay': {
            id: 'forge-core2-roleplay',
            title: 'Core 2 Roleplay Lab',
            description: 'Core 2 Roleplay Lab — module content for forge house',
            house: 'forge',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['core', 'roleplay', 'hardware', 'systems'],
            paths: ['aplus-core2'],
            components: {
                lab: 'houses/forge/labs/forge-core2-roleplay.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-cpu-sockets': {
            id: 'forge-cpu-sockets',
            title: 'CPU Socket Identification Lab',
            description: 'CPU Socket Identification Lab — lab content for forge house',
            house: 'forge',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['cpu', 'socket', 'identification', 'hardware', 'systems'],
            paths: ['aplus-core1'],
            components: {
                lab: 'houses/forge/applets/comptia-aplus/core-1/labs/forge-cpu-sockets.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-diagnostic-tools': {
            id: 'forge-diagnostic-tools',
            title: 'Hardware Diagnostic Tools',
            description: 'Hardware Diagnostic Tools — lab content for forge house',
            house: 'forge',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['hardware', 'diagnostic', 'tools', 'systems'],
            paths: ['aplus-core1'],
            components: {
                lab: 'houses/forge/applets/comptia-aplus/core-1/labs/forge-diagnostic-tools.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-display-troubleshoot': {
            id: 'forge-display-troubleshoot',
            title: 'Display Troubleshooting Lab',
            description: 'Display Troubleshooting Lab — lab content for forge house',
            house: 'forge',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['display', 'troubleshooting', 'hardware', 'systems'],
            paths: ['aplus-core1'],
            components: {
                lab: 'houses/forge/applets/comptia-aplus/core-1/labs/forge-display-troubleshoot.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-dns-config': {
            id: 'forge-dns-config',
            title: 'DNS Configuration Lab',
            description: 'DNS Configuration Lab — lab content for forge house',
            house: 'forge',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['dns', 'configuration', 'hardware', 'systems'],
            paths: ['aplus-core1'],
            components: {
                lab: 'houses/forge/applets/comptia-aplus/core-1/labs/forge-dns-config.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-docking-config': {
            id: 'forge-docking-config',
            title: 'Docking Station Configuration',
            description: 'Docking Station Configuration — lab content for forge house',
            house: 'forge',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['docking', 'station', 'configuration', 'hardware', 'systems'],
            paths: ['aplus-core1'],
            components: {
                lab: 'houses/forge/applets/comptia-aplus/core-1/labs/forge-docking-config.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-documentation': {
            id: 'forge-documentation',
            title: 'Documentation & Professionalism',
            description: 'Documentation & Professionalism — module content for forge house',
            house: 'forge',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['documentation', 'professionalism', 'hardware', 'systems'],
            paths: ['aplus-core2'],
            components: {
                lab: 'houses/forge/applets/comptia-aplus/core-2/labs/forge-documentation.lab.html',
                presentation: 'houses/forge/applets/comptia-aplus/core-2/presentations/forge-documentation.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-email-config': {
            id: 'forge-email-config',
            title: 'Mobile Email Configuration',
            description: 'Mobile Email Configuration — lab content for forge house',
            house: 'forge',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['mobile', 'email', 'configuration', 'hardware', 'systems'],
            paths: ['aplus-core1'],
            components: {
                lab: 'houses/forge/applets/comptia-aplus/core-1/labs/forge-email-config.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-esd-workspace': {
            id: 'forge-esd-workspace',
            title: 'ESD-Safe Workspace Setup',
            description: 'ESD-Safe Workspace Setup — lab content for forge house',
            house: 'forge',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['esd-safe', 'workspace', 'setup', 'hardware', 'systems'],
            paths: ['aplus-core1'],
            components: {
                lab: 'houses/forge/applets/comptia-aplus/core-1/labs/forge-esd-workspace.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-expansion-cards': {
            id: 'forge-expansion-cards',
            title: 'Expansion Cards & Interfaces',
            description: 'Expansion Cards & Interfaces — applet content for forge house',
            house: 'forge',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['expansion', 'cards', 'interfaces', 'hardware', 'systems'],
            paths: ['aplus-core1'],
            components: {
                applet: 'houses/forge/applets/hardware/expansion_cards/forge-expansion-cards.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-hardware-diagnosis': {
            id: 'forge-hardware-diagnosis',
            title: 'Hardware Diagnosis Simulator',
            description: 'Hardware Diagnosis Simulator — lab content for forge house',
            house: 'forge',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['hardware', 'diagnosis', 'simulator', 'systems'],
            paths: ['aplus-core1'],
            components: {
                lab: 'houses/forge/applets/comptia-aplus/core-1/labs/forge-hardware-diagnosis.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-incident-response': {
            id: 'forge-incident-response',
            title: 'Incident Response',
            description: 'Incident Response — module content for forge house',
            house: 'forge',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['incident', 'response', 'hardware', 'systems'],
            paths: ['aplus-core2'],
            components: {
                lab: 'houses/forge/applets/comptia-aplus/core-2/labs/forge-incident-response.lab.html',
                presentation: 'houses/forge/applets/comptia-aplus/core-2/presentations/forge-incident-response.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-laptop-memory': {
            id: 'forge-laptop-memory',
            title: 'Laptop Memory Upgrade',
            description: 'Laptop Memory Upgrade — lab content for forge house',
            house: 'forge',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['laptop', 'memory', 'upgrade', 'hardware', 'systems'],
            paths: ['aplus-core1'],
            components: {
                lab: 'houses/forge/applets/comptia-aplus/core-1/labs/forge-laptop-memory.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-malware': {
            id: 'forge-malware',
            title: 'Malware & Social Engineering',
            description: 'Malware & Social Engineering — module content for forge house',
            house: 'forge',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['malware', 'social', 'engineering', 'hardware', 'systems'],
            paths: ['aplus-core2'],
            components: {
                lab: 'houses/forge/applets/comptia-aplus/core-2/labs/forge-malware.lab.html',
                presentation: 'houses/forge/applets/comptia-aplus/core-2/presentations/forge-malware.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-mdm-config': {
            id: 'forge-mdm-config',
            title: 'MDM Policy Configuration Lab',
            description: 'MDM Policy Configuration Lab — lab content for forge house',
            house: 'forge',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['mdm', 'policy', 'configuration', 'hardware', 'systems'],
            paths: ['aplus-core1'],
            components: {
                lab: 'houses/forge/applets/comptia-aplus/core-1/labs/forge-mdm-config.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-mobile-email': {
            id: 'forge-mobile-email',
            title: 'Mobile Email Configuration Lab',
            description: 'Mobile Email Configuration Lab — lab content for forge house',
            house: 'forge',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['mobile', 'email', 'configuration', 'hardware', 'systems'],
            paths: ['aplus-core1'],
            components: {
                lab: 'houses/forge/applets/comptia-aplus/core-1/labs/forge-mobile-email.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-mobile-identifier': {
            id: 'forge-mobile-identifier',
            title: 'Mobile Device Identifiers',
            description: 'Mobile Device Identifiers — lab content for forge house',
            house: 'forge',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['mobile', 'device', 'identifiers', 'hardware', 'systems'],
            paths: ['aplus-core1'],
            components: {
                lab: 'houses/forge/applets/comptia-aplus/core-1/labs/forge-mobile-identifier.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-mobile-sync': {
            id: 'forge-mobile-sync',
            title: 'Mobile Sync Troubleshooting Lab',
            description: 'Mobile Sync Troubleshooting Lab — lab content for forge house',
            house: 'forge',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['mobile', 'sync', 'troubleshooting', 'hardware', 'systems'],
            paths: ['aplus-core1'],
            components: {
                lab: 'houses/forge/applets/comptia-aplus/core-1/labs/forge-mobile-sync.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-multimeter-jedit-v1': {
            id: 'forge-multimeter-jedit-v1',
            title: 'Digital Multimeter Simulator',
            description: 'Digital Multimeter Simulator — applet content for forge house',
            house: 'forge',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['digital', 'multimeter', 'simulator', 'hardware', 'systems'],
            paths: ['aplus-core1'],
            components: {
                applet: 'houses/forge/applets/hardware/multimeter/forge-multimeter-jedit-v1.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-network-commands': {
            id: 'forge-network-commands',
            title: 'Network Commands Lab',
            description: 'Network Commands Lab — lab content for forge house',
            house: 'forge',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['network', 'commands', 'hardware', 'systems'],
            paths: ['aplus-core1'],
            components: {
                lab: 'houses/forge/applets/comptia-aplus/core-1/labs/forge-network-commands.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-network-config': {
            id: 'forge-network-config',
            title: 'Network Configuration Lab',
            description: 'Network Configuration Lab — lab content for forge house',
            house: 'forge',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['network', 'configuration', 'hardware', 'systems'],
            paths: ['aplus-core1'],
            components: {
                lab: 'houses/forge/applets/comptia-aplus/core-1/labs/forge-network-config.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-network-design': {
            id: 'forge-network-design',
            title: 'Advanced Network Designer',
            description: 'Advanced Network Designer — lab content for forge house',
            house: 'forge',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['network', 'designer', 'hardware', 'systems'],
            paths: ['aplus-core1'],
            components: {
                lab: 'houses/forge/applets/comptia-aplus/core-1/labs/forge-network-design.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-os-core': {
            id: 'forge-os-core',
            title: 'Instruction Set, 32-bit vs 64-bit, x86 vs x64',
            description: 'Instruction Set, 32-bit vs 64-bit, x86 vs x64 — tool content for forge house',
            house: 'forge',
            type: 'tool',
            difficulty: 'beginner',
            duration: 20,
            topics: ['instruction', 'set', '32-bit', 'hardware', 'systems'],
            paths: ['aplus-core1'],
            components: {
                applet: 'houses/forge/tools/forge-os-core.tool.html',
                tool: 'houses/forge/applets/comptia-aplus/core-2/tools/forge-os-core.tool.html',
                module: 'houses/forge/applets/comptia-aplus/forge-os-core.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-pc-builder': {
            id: 'forge-pc-builder',
            title: 'PC Builder Simulator',
            description: 'PC Builder Simulator — lab content for forge house',
            house: 'forge',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['builder', 'simulator', 'hardware', 'systems'],
            paths: ['aplus-core1'],
            components: {
                lab: 'houses/forge/applets/comptia-aplus/core-1/labs/forge-pc-builder.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-pc-components': {
            id: 'forge-pc-components',
            title: 'PC Components Identification',
            description: 'PC Components Identification — lab content for forge house',
            house: 'forge',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['components', 'identification', 'hardware', 'systems'],
            paths: ['aplus-core1'],
            components: {
                lab: 'houses/forge/applets/comptia-aplus/core-1/labs/forge-pc-components.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-physical-security': {
            id: 'forge-physical-security',
            title: 'Physical Security',
            description: 'Physical Security — module content for forge house',
            house: 'forge',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['physical', 'security', 'hardware', 'systems'],
            paths: ['aplus-core2'],
            components: {
                lab: 'houses/forge/applets/comptia-aplus/core-2/labs/forge-physical-security.lab.html',
                presentation: 'houses/forge/applets/comptia-aplus/core-2/presentations/forge-physical-security.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-port-identification': {
            id: 'forge-port-identification',
            title: 'Port Identification',
            description: 'Port Identification — lab content for forge house',
            house: 'forge',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['port', 'identification', 'hardware', 'systems'],
            paths: ['aplus-core1'],
            components: {
                lab: 'houses/forge/applets/comptia-aplus/core-1/labs/forge-port-identification.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-post-beep-codes': {
            id: 'forge-post-beep-codes',
            title: 'POST Beep Codes',
            description: 'POST Beep Codes — lab content for forge house',
            house: 'forge',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['post', 'beep', 'codes', 'hardware', 'systems'],
            paths: ['aplus-core1'],
            components: {
                lab: 'houses/forge/applets/comptia-aplus/core-1/labs/forge-post-beep-codes.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-printer-troubleshoot': {
            id: 'forge-printer-troubleshoot',
            title: 'Printer Troubleshooting Simulator',
            description: 'Printer Troubleshooting Simulator — lab content for forge house',
            house: 'forge',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['printer', 'troubleshooting', 'simulator', 'hardware', 'systems'],
            paths: ['aplus-core1'],
            components: {
                lab: 'houses/forge/applets/comptia-aplus/core-1/labs/forge-printer-troubleshoot.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-protocol-analysis': {
            id: 'forge-protocol-analysis',
            title: 'Protocol Analysis Lab',
            description: 'Protocol Analysis Lab — lab content for forge house',
            house: 'forge',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['protocol', 'analysis', 'hardware', 'systems'],
            paths: ['aplus-core1'],
            components: {
                lab: 'houses/forge/applets/comptia-aplus/core-1/labs/forge-protocol-analysis.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-psu-connectors': {
            id: 'forge-psu-connectors',
            title: 'PSU Connectors',
            description: 'PSU Connectors — lab content for forge house',
            house: 'forge',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['psu', 'connectors', 'hardware', 'systems'],
            paths: ['aplus-core1'],
            components: {
                lab: 'houses/forge/applets/comptia-aplus/core-1/labs/forge-psu-connectors.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-rack-stack': {
            id: 'forge-rack-stack',
            title: 'Rack Stack',
            description: 'Rack Stack — applet content for forge house',
            house: 'forge',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['rack', 'stack', 'hardware', 'systems'],
            paths: ['aplus-core1'],
            components: {
                applet: 'houses/forge/games/forge-rack-stack.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-raid-calculator': {
            id: 'forge-raid-calculator',
            title: 'RAID Puzzle',
            description: 'RAID Puzzle — applet content for forge house',
            house: 'forge',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['raid', 'puzzle', 'hardware', 'systems'],
            paths: ['aplus-core1'],
            components: {
                applet: 'houses/forge/games/forge-raid-calculator.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-raid-config': {
            id: 'forge-raid-config',
            title: 'RAID Configuration Builder',
            description: 'RAID Configuration Builder — lab content for forge house',
            house: 'forge',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['raid', 'configuration', 'builder', 'hardware', 'systems'],
            paths: ['aplus-core1'],
            components: {
                lab: 'houses/forge/applets/comptia-aplus/core-1/labs/forge-raid-config.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-ram-identification': {
            id: 'forge-ram-identification',
            title: 'RAM Identification Lab',
            description: 'RAM Identification Lab — lab content for forge house',
            house: 'forge',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['ram', 'identification', 'hardware', 'systems'],
            paths: ['aplus-core1'],
            components: {
                lab: 'houses/forge/applets/comptia-aplus/core-1/labs/forge-ram-identification.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-router-config': {
            id: 'forge-router-config',
            title: 'SOHO Router Configuration',
            description: 'SOHO Router Configuration — lab content for forge house',
            house: 'forge',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['soho', 'router', 'configuration', 'hardware', 'systems'],
            paths: ['aplus-core1'],
            components: {
                lab: 'houses/forge/applets/comptia-aplus/core-1/labs/forge-router-config.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-security-fundamentals': {
            id: 'forge-security-fundamentals',
            title: 'Security Fundamentals',
            description: 'Security Fundamentals — module content for forge house',
            house: 'forge',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['security', 'hardware', 'systems'],
            paths: ['aplus-core2'],
            components: {
                lab: 'houses/forge/applets/comptia-aplus/core-2/labs/forge-security-fundamentals.lab.html',
                presentation: 'houses/forge/applets/comptia-aplus/core-2/presentations/forge-security-fundamentals.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-server-roles': {
            id: 'forge-server-roles',
            title: 'Server Role Identification',
            description: 'Server Role Identification — lab content for forge house',
            house: 'forge',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['server', 'role', 'identification', 'hardware', 'systems'],
            paths: ['aplus-core1'],
            components: {
                lab: 'houses/forge/applets/comptia-aplus/core-1/labs/forge-server-roles.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-settings': {
            id: 'forge-settings',
            title: 'Windows 11 Settings Explorer',
            description: 'Windows 11 Settings Explorer — tool content for forge house',
            house: 'forge',
            type: 'tool',
            difficulty: 'beginner',
            duration: 20,
            topics: ['windows', 'settings', 'explorer', 'hardware', 'systems'],
            paths: ['aplus-core1'],
            components: {
                applet: 'houses/forge/tools/forge-settings.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-soho-designer': {
            id: 'forge-soho-designer',
            title: 'SOHO Network Designer',
            description: 'SOHO Network Designer — lab content for forge house',
            house: 'forge',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['soho', 'network', 'designer', 'hardware', 'systems'],
            paths: ['aplus-core1'],
            components: {
                lab: 'houses/forge/applets/comptia-aplus/core-1/labs/forge-soho-designer.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-soho-rescue': {
            id: 'forge-soho-rescue',
            title: 'SOHO RESCUE | Network Troubleshooting Game',
            description: 'SOHO RESCUE | Network Troubleshooting Game — lab content for forge house',
            house: 'forge',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['soho', 'rescue', 'network', 'hardware', 'systems'],
            paths: ['aplus-core1'],
            components: {
                lab: 'houses/forge/applets/comptia-aplus/core-1/labs/forge-soho-rescue.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-storage-upgrade': {
            id: 'forge-storage-upgrade',
            title: 'Laptop Storage Upgrade',
            description: 'Laptop Storage Upgrade — lab content for forge house',
            house: 'forge',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['laptop', 'storage', 'upgrade', 'hardware', 'systems'],
            paths: ['aplus-core1'],
            components: {
                lab: 'houses/forge/applets/comptia-aplus/core-1/labs/forge-storage-upgrade.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-subnet-calculator': {
            id: 'forge-subnet-calculator',
            title: 'Subnet Calculator Lab',
            description: 'Subnet Calculator Lab — lab content for forge house',
            house: 'forge',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['subnet', 'calculator', 'hardware', 'systems'],
            paths: ['aplus-core1'],
            components: {
                lab: 'houses/forge/applets/comptia-aplus/core-1/labs/forge-subnet-calculator.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-topology-builder': {
            id: 'forge-topology-builder',
            title: 'Network Topology Builder',
            description: 'Network Topology Builder — lab content for forge house',
            house: 'forge',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['network', 'topology', 'builder', 'hardware', 'systems'],
            paths: ['aplus-core1'],
            components: {
                lab: 'houses/forge/applets/comptia-aplus/core-1/labs/forge-topology-builder.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-troubleshooting': {
            id: 'forge-troubleshooting',
            title: 'Troubleshooting Methodology',
            description: 'Troubleshooting Methodology — lab content for forge house',
            house: 'forge',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['troubleshooting', 'methodology', 'hardware', 'systems'],
            paths: ['aplus-core1'],
            components: {
                lab: 'houses/forge/applets/comptia-aplus/core-1/labs/forge-troubleshooting.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-troubleshooting-flowchart': {
            id: 'forge-troubleshooting-flowchart',
            title: 'Troubleshooting Flowchart Lab',
            description: 'Troubleshooting Flowchart Lab — lab content for forge house',
            house: 'forge',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['troubleshooting', 'flowchart', 'hardware', 'systems'],
            paths: ['aplus-core1'],
            components: {
                lab: 'houses/forge/applets/comptia-aplus/core-1/labs/forge-troubleshooting-flowchart.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-troubleshoot-scenarios': {
            id: 'forge-troubleshoot-scenarios',
            title: 'A+ Troubleshooting Scenarios',
            description: 'Interactive troubleshooting scenarios covering 10 real-world A+ exam situations',
            house: 'forge',
            type: 'lab',
            difficulty: 'intermediate',
            duration: 45,
            topics: ['troubleshooting', 'hardware', 'networking', 'software', 'mobile'],
            paths: ['aplus-core1'],
            components: {
                lab: 'houses/forge/applets/comptia-aplus/core-1/labs/forge-troubleshooting-scenarios.lab.html'
            },
            prerequisites: ['forge-troubleshooting-flowchart'],
            objectives: ['Practice systematic troubleshooting across all A+ domains']
        },
        'forge-users-groups': {
            id: 'forge-users-groups',
            title: 'Users, Groups & Permissions',
            description: 'Users, Groups & Permissions — module content for forge house',
            house: 'forge',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['users', 'groups', 'permissions', 'hardware', 'systems'],
            paths: ['aplus-core2'],
            components: {
                lab: 'houses/forge/applets/comptia-aplus/core-2/labs/forge-users-groups.lab.html',
                presentation: 'houses/forge/applets/comptia-aplus/core-2/presentations/forge-users-groups.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-vm-setup': {
            id: 'forge-vm-setup',
            title: 'Virtual Machine Setup',
            description: 'Virtual Machine Setup — lab content for forge house',
            house: 'forge',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['virtual', 'machine', 'setup', 'hardware', 'systems'],
            paths: ['aplus-core1'],
            components: {
                lab: 'houses/forge/applets/comptia-aplus/core-1/labs/forge-vm-setup.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-windows10-components': {
            id: 'forge-windows10-components',
            title: 'Windows 10 Security Components',
            description: 'Windows 10 Security Components — applet content for forge house',
            house: 'forge',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['windows', 'security', 'components', 'hardware', 'systems'],
            paths: ['aplus-core1'],
            components: {
                applet: 'houses/forge/tools/forge-windows10-components.tool.html',
                module: 'houses/forge/applets/forge-windows10-components.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-wireless-security': {
            id: 'forge-wireless-security',
            title: 'Wireless Security Configuration',
            description: 'Wireless Security Configuration — lab content for forge house',
            house: 'forge',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['wireless', 'security', 'configuration', 'hardware', 'systems'],
            paths: ['aplus-core1'],
            components: {
                lab: 'houses/forge/applets/comptia-aplus/core-1/labs/forge-wireless-security.lab.html'
            },
            prerequisites: [],
            objectives: []
        },

        // ─── WEB HOUSE (auto-generated) ───
        'web-dns-troubleshooting': {
            id: 'web-dns-troubleshooting',
            title: 'DNS Troubleshooting Lab',
            description: 'DNS Troubleshooting Lab — lab content for web house',
            house: 'web',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['dns', 'troubleshooting', 'networking', 'protocols'],
            paths: ['comptia-network'],
            components: {
                lab: 'houses/web/labs/web-dns-troubleshooting.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-firewall-rules': {
            id: 'web-firewall-rules',
            title: 'Firewall Rules Lab',
            description: 'Firewall Rules Lab — lab content for web house',
            house: 'web',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['firewall', 'rules', 'networking', 'protocols'],
            paths: ['comptia-network'],
            components: {
                lab: 'houses/web/labs/web-firewall-rules.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-ip-ipv6-challenge': {
            id: 'web-ip-ipv6-challenge',
            title: 'Ip Ipv6 Challenge',
            description: 'Ip Ipv6 Challenge — applet content for web house',
            house: 'web',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['ipv6', 'challenge', 'networking', 'protocols'],
            paths: ['comptia-network'],
            components: {
                applet: 'houses/web/applets/ip-addressing/ipv6-challenge/web-ip-ipv6-challenge.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-ip-mac-addressing': {
            id: 'web-ip-mac-addressing',
            title: 'Ip Mac Addressing',
            description: 'Ip Mac Addressing — applet content for web house',
            house: 'web',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['mac', 'addressing', 'networking', 'protocols'],
            paths: ['comptia-network'],
            components: {
                applet: 'houses/web/applets/ip-addressing/mac-addressing/web-ip-mac-addressing.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-lab-troubleshooting': {
            id: 'web-lab-troubleshooting',
            title: 'Cumulative Lab Troubleshooting Guide - Network Essentials',
            description: 'Cumulative Lab Troubleshooting Guide - Network Essentials — reference content for web house',
            house: 'web',
            type: 'reference',
            difficulty: 'beginner',
            duration: 15,
            topics: ['cumulative', 'troubleshooting', 'guide', 'networking', 'protocols'],
            paths: ['comptia-network'],
            components: {
                reference: 'houses/web/troubleshooting/web-lab-troubleshooting.reference.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-network-architect': {
            id: 'web-network-architect',
            title: 'Network Architect',
            description: 'Network Architect — applet content for web house',
            house: 'web',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['network', 'architect', 'networking', 'protocols'],
            paths: ['comptia-network'],
            components: {
                applet: 'houses/web/games/web-network-architect.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-networking-ch7-10': {
            id: 'web-networking-ch7-10',
            title: 'Networking Essentials • Interactive Guide (Ch.7–10) — v2.0',
            description: 'Networking Essentials • Interactive Guide (Ch.7–10) — v2.0 — quiz content for web house',
            house: 'web',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['networking', 'interactive', 'guide', 'protocols'],
            paths: ['comptia-network'],
            components: {
                quiz: 'houses/web/quizzes/web-networking-ch7-10.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-networking-ch7-20': {
            id: 'web-networking-ch7-20',
            title: 'Networking Essentials • Interactive Textbook (Ch.7–20) — v3.0',
            description: 'Networking Essentials • Interactive Textbook (Ch.7–20) — v3.0 — quiz content for web house',
            house: 'web',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['networking', 'interactive', 'textbook', 'protocols'],
            paths: ['comptia-network'],
            components: {
                quiz: 'houses/web/quizzes/web-networking-ch7-20.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-networking-final-review': {
            id: 'web-networking-final-review',
            title: 'Networking Exam Flashcards',
            description: 'Networking Exam Flashcards — quiz content for web house',
            house: 'web',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['networking', 'exam', 'flashcards', 'protocols'],
            paths: ['comptia-network'],
            components: {
                quiz: 'houses/web/quizzes/web-networking-final-review.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-osi': {
            id: 'web-osi',
            title: 'OSI Model - The 7 Layers of Networking',
            description: 'OSI Model - The 7 Layers of Networking — module content for web house',
            house: 'web',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['osi', 'model', 'layers', 'networking', 'protocols'],
            paths: ['comptia-network'],
            components: {
                presentation: 'houses/web/presentations/web-osi.presentation.html',
                quiz: 'houses/web/quizzes/web-osi.quiz.html',
                applet: 'houses/web/tools/web-osi.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-packet-analysis': {
            id: 'web-packet-analysis',
            title: 'Packet Analysis Lab',
            description: 'Packet Analysis Lab — lab content for web house',
            house: 'web',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['packet', 'analysis', 'networking', 'protocols'],
            paths: ['comptia-network'],
            components: {
                lab: 'houses/web/labs/web-packet-analysis.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-packet-invaders': {
            id: 'web-packet-invaders',
            title: 'Packet Invaders',
            description: 'Packet Invaders — applet content for web house',
            house: 'web',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['packet', 'invaders', 'networking', 'protocols'],
            paths: ['comptia-network'],
            components: {
                applet: 'houses/web/games/web-packet-invaders.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-packet-run': {
            id: 'web-packet-run',
            title: 'Packet Run',
            description: 'Packet Run — applet content for web house',
            house: 'web',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['packet', 'run', 'networking', 'protocols'],
            paths: ['comptia-network'],
            components: {
                applet: 'houses/web/games/web-packet-run.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-packet-sniffer': {
            id: 'web-packet-sniffer',
            title: 'Packet Sniffer',
            description: 'Packet Sniffer — applet content for web house',
            house: 'web',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['packet', 'sniffer', 'networking', 'protocols'],
            paths: ['comptia-network'],
            components: {
                applet: 'houses/web/games/web-packet-sniffer.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-subnetting-practice': {
            id: 'web-subnetting-practice',
            title: 'Subnetting Practice Lab',
            description: 'Subnetting Practice Lab — lab content for web house',
            house: 'web',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['subnetting', 'networking', 'protocols'],
            paths: ['comptia-network'],
            components: {
                lab: 'houses/web/labs/web-subnetting-practice.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-vlan-config': {
            id: 'web-vlan-config',
            title: 'VLAN Configuration Lab',
            description: 'VLAN Configuration Lab — lab content for web house',
            house: 'web',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['vlan', 'configuration', 'networking', 'protocols'],
            paths: ['ccna'],
            components: {
                lab: 'houses/web/labs/web-vlan-config.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-week3': {
            id: 'web-week3',
            title: 'Networking Fundamentals & Ports Quiz',
            description: 'Networking Fundamentals & Ports Quiz — quiz content for web house',
            house: 'web',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['networking', 'ports', 'protocols'],
            paths: ['comptia-network'],
            components: {
                quiz: 'houses/web/quizzes/web-week3.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-wireless-warzone': {
            id: 'web-wireless-warzone',
            title: 'Wireless Warzone',
            description: 'Wireless Warzone — applet content for web house',
            house: 'web',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['wireless', 'warzone', 'networking', 'protocols'],
            paths: ['comptia-network'],
            components: {
                applet: 'houses/web/games/web-wireless-warzone.applet.html'
            },
            prerequisites: [],
            objectives: []
        },

        // ─── SHIELD HOUSE (auto-generated) ───
        'shield-cmmc-overview': {
            id: 'shield-cmmc-overview',
            title: 'CMMC Framework Overview',
            description: 'CMMC Framework Overview — applet content for shield house',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['cmmc', 'framework', 'overview', 'security', 'defense'],
            paths: ['security-plus'],
            components: {
                applet: 'houses/shield/applets/compliance/cmmc_overview/shield-cmmc-overview.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-crypto-crypto-protocols': {
            id: 'shield-crypto-crypto-protocols',
            title: 'Cryptographic Protocols',
            description: 'Cryptographic Protocols — applet content for shield house',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['cryptographic', 'protocols', 'security', 'defense'],
            paths: ['security-plus'],
            components: {
                applet: 'houses/shield/applets/crypto/crypto_protocols/shield-crypto-crypto-protocols.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-crypto-cryptography-intro': {
            id: 'shield-crypto-cryptography-intro',
            title: 'Introduction to Cryptography',
            description: 'Introduction to Cryptography — applet content for shield house',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['cryptography', 'security', 'defense'],
            paths: ['security-plus'],
            components: {
                applet: 'houses/shield/applets/crypto/cryptography_intro/shield-crypto-cryptography-intro.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-crypto-encryption': {
            id: 'shield-crypto-encryption',
            title: 'Encryption & Data Formatting',
            description: 'Encryption & Data Formatting — applet content for shield house',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['encryption', 'data', 'formatting', 'security', 'defense'],
            paths: ['security-plus'],
            components: {
                applet: 'houses/shield/applets/crypto/encrypt_data/shield-crypto-encryption.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-crypto-hashing-walkthrough': {
            id: 'shield-crypto-hashing-walkthrough',
            title: 'Hashing: Step-by-Step Walkthrough',
            description: 'Hashing: Step-by-Step Walkthrough — applet content for shield house',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['hashing', 'step-by-step', 'walkthrough', 'security', 'defense'],
            paths: ['security-plus'],
            components: {
                applet: 'houses/shield/applets/crypto/hashing_walkthrough/shield-crypto-hashing-walkthrough.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-crypto-steganography': {
            id: 'shield-crypto-steganography',
            title: 'Crypto Steganography',
            description: 'Crypto Steganography — module content for shield house',
            house: 'shield',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['crypto', 'steganography', 'security', 'defense'],
            paths: ['security-plus'],
            components: {
                applet: 'houses/shield/applets/crypto/steganography/shield-crypto-steganography.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-crypto-stream-ciphers': {
            id: 'shield-crypto-stream-ciphers',
            title: 'Crypto Stream Ciphers',
            description: 'Crypto Stream Ciphers — module content for shield house',
            house: 'shield',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['crypto', 'stream', 'ciphers', 'security', 'defense'],
            paths: ['security-plus'],
            components: {
                applet: 'houses/shield/applets/crypto/stream_ciphers/shield-crypto-stream-ciphers.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-crypto-symmetric-vs-asymmetric': {
            id: 'shield-crypto-symmetric-vs-asymmetric',
            title: 'Symmetric vs Asymmetric Encryption',
            description: 'Symmetric vs Asymmetric Encryption — applet content for shield house',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['symmetric', 'asymmetric', 'encryption', 'security', 'defense'],
            paths: ['security-plus'],
            components: {
                applet: 'houses/shield/applets/crypto/symmetric_vs_asymmetric/shield-crypto-symmetric-vs-asymmetric.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-dr-malware': {
            id: 'shield-dr-malware',
            title: 'Dr. Malware',
            description: 'Dr. Malware — applet content for shield house',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['malware', 'security', 'defense'],
            paths: ['security-plus'],
            components: {
                applet: 'houses/shield/games/shield-dr-malware.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-linux-audit': {
            id: 'shield-linux-audit',
            title: 'Mission: Audit Logging',
            description: 'Mission: Audit Logging — lab content for shield house',
            house: 'shield',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['mission', 'audit', 'logging', 'security', 'defense'],
            paths: ['security-plus'],
            components: {
                lab: 'houses/shield/labs/linux/shield-linux-audit.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-linux-audit-drill': {
            id: 'shield-linux-audit-drill',
            title: 'Audit Log Drill',
            description: 'Audit Log Drill — lab content for shield house',
            house: 'shield',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['audit', 'log', 'drill', 'security', 'defense'],
            paths: ['security-plus'],
            components: {
                lab: 'houses/shield/labs/linux/shield-linux-audit-drill.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-linux-file-integrity': {
            id: 'shield-linux-file-integrity',
            title: 'Mission: File Integrity Monitoring',
            description: 'Mission: File Integrity Monitoring — lab content for shield house',
            house: 'shield',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['mission', 'file', 'integrity', 'security', 'defense'],
            paths: ['security-plus'],
            components: {
                lab: 'houses/shield/labs/linux/shield-linux-file-integrity.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-linux-firewall': {
            id: 'shield-linux-firewall',
            title: 'Mission: Firewall Configuration',
            description: 'Mission: Firewall Configuration — lab content for shield house',
            house: 'shield',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['mission', 'firewall', 'configuration', 'security', 'defense'],
            paths: ['security-plus'],
            components: {
                lab: 'houses/shield/labs/linux/shield-linux-firewall.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-linux-firewall-drill': {
            id: 'shield-linux-firewall-drill',
            title: 'Firewall Rules Drill',
            description: 'Firewall Rules Drill — lab content for shield house',
            house: 'shield',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['firewall', 'rules', 'drill', 'security', 'defense'],
            paths: ['security-plus'],
            components: {
                lab: 'houses/shield/labs/linux/shield-linux-firewall-drill.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-linux-hardening': {
            id: 'shield-linux-hardening',
            title: 'Capstone: Full Server Hardening',
            description: 'Capstone: Full Server Hardening — lab content for shield house',
            house: 'shield',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['capstone', 'full', 'server', 'security', 'defense'],
            paths: ['security-plus'],
            components: {
                lab: 'houses/shield/labs/linux/shield-linux-hardening.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-linux-password-policy': {
            id: 'shield-linux-password-policy',
            title: 'Mission: Password Policy',
            description: 'Mission: Password Policy — lab content for shield house',
            house: 'shield',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['mission', 'password', 'policy', 'security', 'defense'],
            paths: ['security-plus'],
            components: {
                lab: 'houses/shield/labs/linux/shield-linux-password-policy.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-linux-perms-drill': {
            id: 'shield-linux-perms-drill',
            title: 'Permissions Drill',
            description: 'Permissions Drill — lab content for shield house',
            house: 'shield',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['permissions', 'drill', 'security', 'defense'],
            paths: ['security-plus'],
            components: {
                lab: 'houses/shield/labs/linux/shield-linux-perms-drill.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-linux-selinux': {
            id: 'shield-linux-selinux',
            title: 'Mission: SELinux/AppArmor',
            description: 'Mission: SELinux/AppArmor — lab content for shield house',
            house: 'shield',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['mission', 'selinuxapparmor', 'security', 'defense'],
            paths: ['security-plus'],
            components: {
                lab: 'houses/shield/labs/linux/shield-linux-selinux.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-linux-ssh-drill': {
            id: 'shield-linux-ssh-drill',
            title: 'SSH Hardening Drill',
            description: 'SSH Hardening Drill — lab content for shield house',
            house: 'shield',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['ssh', 'hardening', 'drill', 'security', 'defense'],
            paths: ['security-plus'],
            components: {
                lab: 'houses/shield/labs/linux/shield-linux-ssh-drill.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-linux-ssh-hardening-prep': {
            id: 'shield-linux-ssh-hardening-prep',
            title: 'SSH Hardening Prep',
            description: 'SSH Hardening Prep — lab content for shield house',
            house: 'shield',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['ssh', 'hardening', 'prep', 'security', 'defense'],
            paths: ['security-plus'],
            components: {
                lab: 'houses/shield/labs/linux/shield-linux-ssh-hardening-prep.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-linux-ssh-security': {
            id: 'shield-linux-ssh-security',
            title: 'Mission: Secure SSH',
            description: 'Mission: Secure SSH — lab content for shield house',
            house: 'shield',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['mission', 'secure', 'ssh', 'security', 'defense'],
            paths: ['security-plus'],
            components: {
                lab: 'houses/shield/labs/linux/shield-linux-ssh-security.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-linux-sudo': {
            id: 'shield-linux-sudo',
            title: 'Mission: Privilege Management',
            description: 'Mission: Privilege Management — lab content for shield house',
            house: 'shield',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['mission', 'privilege', 'management', 'security', 'defense'],
            paths: ['security-plus'],
            components: {
                lab: 'houses/shield/labs/linux/shield-linux-sudo.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-linux-sudo-policy-prep': {
            id: 'shield-linux-sudo-policy-prep',
            title: 'Sudo Policy Prep',
            description: 'Sudo Policy Prep — lab content for shield house',
            house: 'shield',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['sudo', 'policy', 'prep', 'security', 'defense'],
            paths: ['security-plus'],
            components: {
                lab: 'houses/shield/labs/linux/shield-linux-sudo-policy-prep.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-malware-zoo': {
            id: 'shield-malware-zoo',
            title: 'Malware Zoo',
            description: 'Malware Zoo — lab content for shield house',
            house: 'shield',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['malware', 'zoo', 'security', 'defense'],
            paths: ['security-plus'],
            components: {
                lab: 'houses/shield/games/shield-malware-zoo.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-social-engineering': {
            id: 'shield-social-engineering',
            title: 'Social Engineering Attacks',
            description: 'Social Engineering Attacks — presentation content for shield house',
            house: 'shield',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 20,
            topics: ['social', 'engineering', 'attacks', 'security', 'defense'],
            paths: ['security-plus'],
            components: {
                presentation: 'houses/shield/presentations/shield-social-engineering.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-threat-code-injection': {
            id: 'shield-threat-code-injection',
            title: 'Threat Code Injection',
            description: 'Threat Code Injection — applet content for shield house',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['threat', 'code', 'injection', 'security', 'defense'],
            paths: ['security-plus'],
            components: {
                applet: 'houses/shield/applets/threats/code_injection_attack/shield-threat-code-injection.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-threat-google-hacking': {
            id: 'shield-threat-google-hacking',
            title: 'Threat Google Hacking',
            description: 'Threat Google Hacking — applet content for shield house',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['threat', 'google', 'hacking', 'security', 'defense'],
            paths: ['security-plus'],
            components: {
                applet: 'houses/shield/applets/threats/google_hacking/shield-threat-google-hacking.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-threat-heartbleed': {
            id: 'shield-threat-heartbleed',
            title: 'Threat Heartbleed',
            description: 'Threat Heartbleed — applet content for shield house',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['threat', 'heartbleed', 'security', 'defense'],
            paths: ['security-plus'],
            components: {
                applet: 'houses/shield/applets/threats/heartbleed_attack/shield-threat-heartbleed.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-threat-meltdown-spectre': {
            id: 'shield-threat-meltdown-spectre',
            title: 'Threat Meltdown Spectre',
            description: 'Threat Meltdown Spectre — applet content for shield house',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['threat', 'meltdown', 'spectre', 'security', 'defense'],
            paths: ['security-plus'],
            components: {
                applet: 'houses/shield/applets/threats/meltdown_spectre/shield-threat-meltdown-spectre.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-threat-pen-testing': {
            id: 'shield-threat-pen-testing',
            title: 'Threat Pen Testing',
            description: 'Threat Pen Testing — applet content for shield house',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['threat', 'pen', 'testing', 'security', 'defense'],
            paths: ['security-plus'],
            components: {
                applet: 'houses/shield/applets/threats/pen_testing_methodology/shield-threat-pen-testing.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-threat-runner': {
            id: 'shield-threat-runner',
            title: 'Threat Runner',
            description: 'Threat Runner — applet content for shield house',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['threat', 'runner', 'security', 'defense'],
            paths: ['security-plus'],
            components: {
                applet: 'houses/shield/games/shield-threat-runner.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-threat-social-engineering-tactics': {
            id: 'shield-threat-social-engineering-tactics',
            title: 'Threat Social Engineering Tactics',
            description: 'Threat Social Engineering Tactics — applet content for shield house',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['threat', 'social', 'engineering', 'security', 'defense'],
            paths: ['security-plus'],
            components: {
                applet: 'houses/shield/applets/threats/social_engineering_tactics/shield-threat-social-engineering-tactics.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-threat-spoofing': {
            id: 'shield-threat-spoofing',
            title: 'Threat Spoofing',
            description: 'Threat Spoofing — applet content for shield house',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['threat', 'spoofing', 'security', 'defense'],
            paths: ['security-plus'],
            components: {
                applet: 'houses/shield/applets/threats/spoofing_attacks/shield-threat-spoofing.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-threat-stuxnet': {
            id: 'shield-threat-stuxnet',
            title: 'Threat Stuxnet',
            description: 'Threat Stuxnet — applet content for shield house',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['threat', 'stuxnet', 'security', 'defense'],
            paths: ['security-plus'],
            components: {
                applet: 'houses/shield/applets/threats/stuxnet/shield-threat-stuxnet.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-threat-swarm': {
            id: 'shield-threat-swarm',
            title: 'Threat Swarm',
            description: 'Threat Swarm — applet content for shield house',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['threat', 'swarm', 'security', 'defense'],
            paths: ['security-plus'],
            components: {
                applet: 'houses/shield/games/shield-threat-swarm.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-threat-threat-actors': {
            id: 'shield-threat-threat-actors',
            title: 'Threat Threat Actors',
            description: 'Threat Threat Actors — applet content for shield house',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['threat', 'actors', 'security', 'defense'],
            paths: ['security-plus'],
            components: {
                applet: 'houses/shield/applets/threats/threat_actors/shield-threat-threat-actors.applet.html'
            },
            prerequisites: [],
            objectives: []
        },

        // ─── CLOUD HOUSE (auto-generated) ───
        'cloud-ad-attack-path': {
            id: 'cloud-ad-attack-path',
            title: 'AD Attack Path',
            description: 'AD Attack Path — applet content for cloud house',
            house: 'cloud',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['attack', 'path', 'cloud', 'infrastructure'],
            paths: ['wsa'],
            components: {
                applet: 'houses/cloud/games/cloud-ad-attack-path.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'cloud-destroyer': {
            id: 'cloud-destroyer',
            title: 'Cloud Destroyer',
            description: 'Cloud Destroyer — applet content for cloud house',
            house: 'cloud',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['cloud', 'destroyer', 'infrastructure'],
            paths: ['cse'],
            components: {
                applet: 'houses/cloud/games/cloud-destroyer.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'cloud-gauntlet': {
            id: 'cloud-gauntlet',
            title: 'WSA Skills Gauntlet',
            description: 'WSA Skills Gauntlet — module content for cloud house',
            house: 'cloud',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['wsa', 'skills', 'gauntlet', 'cloud', 'infrastructure'],
            paths: ['wsa'],
            components: {
                module: 'houses/cloud/modules/wsa/gauntlet/cloud-gauntlet.module.html'
            },
            prerequisites: [],
            objectives: []
        },
        'cloud-gauntlet-advanced': {
            id: 'cloud-gauntlet-advanced',
            title: 'WSA Advanced Skills Gauntlet',
            description: 'WSA Advanced Skills Gauntlet — module content for cloud house',
            house: 'cloud',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['wsa', 'skills', 'gauntlet', 'cloud', 'infrastructure'],
            paths: ['wsa'],
            components: {
                module: 'houses/cloud/modules/wsa/gauntlet-advanced/cloud-gauntlet-advanced.module.html'
            },
            prerequisites: [],
            objectives: []
        },
        'cloud-gui': {
            id: 'cloud-gui',
            title: 'WSA M01 GUI Lab: Server Manager',
            description: 'WSA M01 GUI Lab: Server Manager — lab content for cloud house',
            house: 'cloud',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['wsa', 'm01', 'gui', 'cloud', 'infrastructure'],
            paths: ['wsa'],
            components: {
                lab: 'houses/cloud/labs/cloud-gui.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'cloud-gui-style-samples': {
            id: 'cloud-gui-style-samples',
            title: 'WSA GUI Style Samples',
            description: 'WSA GUI Style Samples — module content for cloud house',
            house: 'cloud',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['wsa', 'gui', 'style', 'cloud', 'infrastructure'],
            paths: ['wsa'],
            components: {
                module: 'houses/cloud/modules/wsa/cloud-gui-style-samples.module.html'
            },
            prerequisites: [],
            objectives: []
        },
        'cloud-guilab': {
            id: 'cloud-guilab',
            title: 'WSA M01 GUI Lab: Server Manager Configuration',
            description: 'WSA M01 GUI Lab: Server Manager Configuration — module content for cloud house',
            house: 'cloud',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['wsa', 'm01', 'gui', 'cloud', 'infrastructure'],
            paths: ['wsa'],
            components: {
                module: 'houses/cloud/modules/wsa/m19-troubleshooting-migration/cloud-guilab.module.html'
            },
            prerequisites: [],
            objectives: []
        },
        'cloud-hop': {
            id: 'cloud-hop',
            title: 'Cloud Hop',
            description: 'Cloud Hop — applet content for cloud house',
            house: 'cloud',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['cloud', 'hop', 'infrastructure'],
            paths: ['cse'],
            components: {
                applet: 'houses/cloud/games/cloud-hop.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'cloud-ps': {
            id: 'cloud-ps',
            title: 'WSA M01 PowerShell Lab',
            description: 'WSA M01 PowerShell Lab — lab content for cloud house',
            house: 'cloud',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['wsa', 'm01', 'powershell', 'cloud', 'infrastructure'],
            paths: ['wsa'],
            components: {
                lab: 'houses/cloud/labs/cloud-ps.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'cloud-pslab': {
            id: 'cloud-pslab',
            title: 'WSA M01 PowerShell Lab: Server Administration Basics',
            description: 'WSA M01 PowerShell Lab: Server Administration Basics — module content for cloud house',
            house: 'cloud',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['wsa', 'm01', 'powershell', 'cloud', 'infrastructure'],
            paths: ['wsa'],
            components: {
                module: 'houses/cloud/modules/wsa/m19-troubleshooting-migration/cloud-pslab.module.html'
            },
            prerequisites: [],
            objectives: []
        },
        'cloud-quiz': {
            id: 'cloud-quiz',
            title: 'WSA M01 Quiz: Windows Server Fundamentals',
            description: 'WSA M01 Quiz: Windows Server Fundamentals — quiz content for cloud house',
            house: 'cloud',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['wsa', 'm01', 'windows', 'cloud', 'infrastructure'],
            paths: ['wsa'],
            components: {
                quiz: 'houses/cloud/quizzes/cloud-quiz.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'cloud-quizquiz': {
            id: 'cloud-quizquiz',
            title: 'WSA M01 Quiz: Server Installation & Configuration',
            description: 'WSA M01 Quiz: Server Installation & Configuration — module content for cloud house',
            house: 'cloud',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['wsa', 'm01', 'server', 'cloud', 'infrastructure'],
            paths: ['wsa'],
            components: {
                module: 'houses/cloud/modules/wsa/m19-troubleshooting-migration/cloud-quizquiz.module.html'
            },
            prerequisites: [],
            objectives: []
        },
        'cloud-save-the-pod': {
            id: 'cloud-save-the-pod',
            title: 'POD CROSSING - Docker Ocean Delivery',
            description: 'POD CROSSING - Docker Ocean Delivery — module content for cloud house',
            house: 'cloud',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['pod', 'crossing', 'docker', 'cloud', 'infrastructure'],
            paths: ['wsa'],
            components: {
                module: 'houses/cloud/modules/wsa/games/cloud-save-the-pod.module.html'
            },
            prerequisites: [],
            objectives: []
        },
        'cloud-simulation': {
            id: 'cloud-simulation',
            title: 'FAILSAFE Simulation',
            description: 'FAILSAFE Simulation — module content for cloud house',
            house: 'cloud',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['failsafe', 'simulation', 'cloud', 'infrastructure'],
            paths: ['wsa'],
            components: {
                module: 'houses/cloud/modules/wsa/midterm-outpost/cloud-simulation.module.html'
            },
            prerequisites: [],
            objectives: []
        },
        'cloud-wsa-review': {
            id: 'cloud-wsa-review',
            title: 'Windows Server Review',
            description: 'Windows Server Review — module content for cloud house',
            house: 'cloud',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['windows', 'server', 'cloud', 'infrastructure'],
            paths: ['wsa'],
            components: {
                module: 'houses/cloud/modules/wsa/reviews/cloud-wsa-review.module.html'
            },
            prerequisites: [],
            objectives: []
        },

        // ─── SCRIPT HOUSE (auto-generated) ───
        'script-bash-arrays': {
            id: 'script-bash-arrays',
            title: 'Mission: Bash Arrays',
            description: 'Mission: Bash Arrays — lab content for script house',
            house: 'script',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['mission', 'bash', 'arrays', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                lab: 'houses/script/labs/linux/script-bash-arrays.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-bash-basics': {
            id: 'script-bash-basics',
            title: 'Mission: Bash Basics',
            description: 'Mission: Bash Basics — lab content for script house',
            house: 'script',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['mission', 'bash', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                lab: 'houses/script/labs/linux/script-bash-basics.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-bash-conditionals': {
            id: 'script-bash-conditionals',
            title: 'Mission: Bash Conditionals',
            description: 'Mission: Bash Conditionals — lab content for script house',
            house: 'script',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['mission', 'bash', 'conditionals', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                lab: 'houses/script/labs/linux/script-bash-conditionals.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-bash-conditions-drill': {
            id: 'script-bash-conditions-drill',
            title: 'Bash Conditionals Drill',
            description: 'Bash Conditionals Drill — lab content for script house',
            house: 'script',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['bash', 'conditionals', 'drill', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                lab: 'houses/script/labs/linux/script-bash-conditions-drill.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-bash-cron': {
            id: 'script-bash-cron',
            title: 'Mission: Bash Cron',
            description: 'Mission: Bash Cron — lab content for script house',
            house: 'script',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['mission', 'bash', 'cron', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                lab: 'houses/script/labs/linux/script-bash-cron.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-bash-cron-setup-prep': {
            id: 'script-bash-cron-setup-prep',
            title: 'Prep: Cron Backup Setup',
            description: 'Prep: Cron Backup Setup — lab content for script house',
            house: 'script',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['prep', 'cron', 'backup', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                lab: 'houses/script/labs/linux/script-bash-cron-setup-prep.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-bash-functions': {
            id: 'script-bash-functions',
            title: 'Mission: Bash Functions',
            description: 'Mission: Bash Functions — lab content for script house',
            house: 'script',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['mission', 'bash', 'functions', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                lab: 'houses/script/labs/linux/script-bash-functions.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-bash-io-redirect': {
            id: 'script-bash-io-redirect',
            title: 'Mission: I/O Redirection',
            description: 'Mission: I/O Redirection — lab content for script house',
            house: 'script',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['mission', 'redirection', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                lab: 'houses/script/labs/linux/script-bash-io-redirect.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-bash-log-processor-prep': {
            id: 'script-bash-log-processor-prep',
            title: 'Prep: Log Processor',
            description: 'Prep: Log Processor — lab content for script house',
            house: 'script',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['prep', 'log', 'processor', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                lab: 'houses/script/labs/linux/script-bash-log-processor-prep.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-bash-loops': {
            id: 'script-bash-loops',
            title: 'Mission: Bash Loops',
            description: 'Mission: Bash Loops — lab content for script house',
            house: 'script',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['mission', 'bash', 'loops', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                lab: 'houses/script/labs/linux/script-bash-loops.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-bash-loops-drill': {
            id: 'script-bash-loops-drill',
            title: 'Bash Loops Drill',
            description: 'Bash Loops Drill — lab content for script house',
            house: 'script',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['bash', 'loops', 'drill', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                lab: 'houses/script/labs/linux/script-bash-loops-drill.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-bash-pipes': {
            id: 'script-bash-pipes',
            title: 'Mission: Bash Pipes',
            description: 'Mission: Bash Pipes — lab content for script house',
            house: 'script',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['mission', 'bash', 'pipes', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                lab: 'houses/script/labs/linux/script-bash-pipes.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-bash-redirect-drill': {
            id: 'script-bash-redirect-drill',
            title: 'Bash Redirect Drill',
            description: 'Bash Redirect Drill — lab content for script house',
            house: 'script',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['bash', 'redirect', 'drill', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                lab: 'houses/script/labs/linux/script-bash-redirect-drill.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-bash-variables-drill': {
            id: 'script-bash-variables-drill',
            title: 'Bash Variables Drill',
            description: 'Bash Variables Drill — lab content for script house',
            house: 'script',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['bash', 'variables', 'drill', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                lab: 'houses/script/labs/linux/script-bash-variables-drill.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-blacksite-demo': {
            id: 'script-blacksite-demo',
            title: 'BLACKSITE TERMINAL',
            description: 'BLACKSITE TERMINAL — applet content for script house',
            house: 'script',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['blacksite', 'terminal', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                applet: 'houses/script/courses/grep-pipe-mastery/script-blacksite-demo.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-certificate': {
            id: 'script-certificate',
            title: 'Certificate - Zero to Python',
            description: 'Certificate - Zero to Python — module content for script house',
            house: 'script',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['certificate', 'zero', 'python', 'linux', 'command-line'],
            paths: ['python-fundamentals'],
            components: {
                module: 'houses/script/modules/python/script-certificate.module.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-clh-001-intro-to-hacker-cli': {
            id: 'script-clh-001-intro-to-hacker-cli',
            title: 'CLH-001: Introduction to Hacker CLI',
            description: 'CLH-001: Introduction to Hacker CLI — applet content for script house',
            house: 'script',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['clh-001', 'hacker', 'cli', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                applet: 'houses/script/applets/linux/script-clh-001-intro-to-hacker-cli.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-clh-002-navigation-recon': {
            id: 'script-clh-002-navigation-recon',
            title: 'CLH-002: Navigation & Reconnaissance',
            description: 'CLH-002: Navigation & Reconnaissance — applet content for script house',
            house: 'script',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['clh-002', 'navigation', 'reconnaissance', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                applet: 'houses/script/applets/linux/script-clh-002-navigation-recon.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-clh-003-pattern-hunting': {
            id: 'script-clh-003-pattern-hunting',
            title: 'CLH-003: Pattern Hunting',
            description: 'CLH-003: Pattern Hunting — applet content for script house',
            house: 'script',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['clh-003', 'pattern', 'hunting', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                applet: 'houses/script/applets/linux/script-clh-003-pattern-hunting.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-clh-004-process-investigation': {
            id: 'script-clh-004-process-investigation',
            title: 'CLH-004: Process Investigation',
            description: 'CLH-004: Process Investigation — applet content for script house',
            house: 'script',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['clh-004', 'process', 'investigation', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                applet: 'houses/script/applets/linux/script-clh-004-process-investigation.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-clh-005-log-analysis': {
            id: 'script-clh-005-log-analysis',
            title: 'CLH-005: Log Analysis',
            description: 'CLH-005: Log Analysis — applet content for script house',
            house: 'script',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['clh-005', 'log', 'analysis', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                applet: 'houses/script/applets/linux/script-clh-005-log-analysis.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-clh-006-file-operations': {
            id: 'script-clh-006-file-operations',
            title: 'CLH-006: File Operations',
            description: 'CLH-006: File Operations — applet content for script house',
            house: 'script',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['clh-006', 'file', 'operations', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                applet: 'houses/script/applets/linux/script-clh-006-file-operations.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-clh-007-permissions': {
            id: 'script-clh-007-permissions',
            title: 'CLH-007: Permissions & Access Control',
            description: 'CLH-007: Permissions & Access Control — applet content for script house',
            house: 'script',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['clh-007', 'permissions', 'access', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                applet: 'houses/script/applets/linux/script-clh-007-permissions.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-clh-008-shell-scripting': {
            id: 'script-clh-008-shell-scripting',
            title: 'CLH-008: Shell Scripting Basics',
            description: 'CLH-008: Shell Scripting Basics — applet content for script house',
            house: 'script',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['clh-008', 'shell', 'scripting', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                applet: 'houses/script/applets/linux/script-clh-008-shell-scripting.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-clh-009-text-processing': {
            id: 'script-clh-009-text-processing',
            title: 'CLH-009: Text Processing',
            description: 'CLH-009: Text Processing — applet content for script house',
            house: 'script',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['clh-009', 'text', 'processing', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                applet: 'houses/script/applets/linux/script-clh-009-text-processing.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-clh-010-io-redirection': {
            id: 'script-clh-010-io-redirection',
            title: 'CLH-010: I/O Redirection',
            description: 'CLH-010: I/O Redirection — applet content for script house',
            house: 'script',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['clh-010', 'redirection', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                applet: 'houses/script/applets/linux/script-clh-010-io-redirection.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-clh-011-advanced-grep': {
            id: 'script-clh-011-advanced-grep',
            title: 'CLH-011: Advanced Grep & Regex',
            description: 'CLH-011: Advanced Grep & Regex — applet content for script house',
            house: 'script',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['clh-011', 'grep', 'regex', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                applet: 'houses/script/applets/linux/script-clh-011-advanced-grep.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-clh-012-network-basics': {
            id: 'script-clh-012-network-basics',
            title: 'CLH-012: Network Basics',
            description: 'CLH-012: Network Basics — applet content for script house',
            house: 'script',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['clh-012', 'network', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                applet: 'houses/script/applets/linux/script-clh-012-network-basics.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-clh-013-environment': {
            id: 'script-clh-013-environment',
            title: 'CLH-013: Environment Variables',
            description: 'CLH-013: Environment Variables — applet content for script house',
            house: 'script',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['clh-013', 'environment', 'variables', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                applet: 'houses/script/applets/linux/script-clh-013-environment.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-clh-014-process-control': {
            id: 'script-clh-014-process-control',
            title: 'CLH-014: Process Control',
            description: 'CLH-014: Process Control — applet content for script house',
            house: 'script',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['clh-014', 'process', 'control', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                applet: 'houses/script/applets/linux/script-clh-014-process-control.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-clh-015-capstone': {
            id: 'script-clh-015-capstone',
            title: 'CLH-015: Capstone Mission',
            description: 'CLH-015: Capstone Mission — applet content for script house',
            house: 'script',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['clh-015', 'capstone', 'mission', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                applet: 'houses/script/applets/linux/script-clh-015-capstone.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-clh-016-intro': {
            id: 'script-clh-016-intro',
            title: 'CLH-016: System Intel',
            description: 'CLH-016: System Intel — applet content for script house',
            house: 'script',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['clh-016', 'system', 'intel', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                applet: 'houses/script/clh/script-clh-016-intro.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-clh-016-system-intel': {
            id: 'script-clh-016-system-intel',
            title: 'CLH-016: System Intel',
            description: 'CLH-016: System Intel — applet content for script house',
            house: 'script',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['clh-016', 'system', 'intel', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                applet: 'houses/script/applets/linux/script-clh-016-system-intel.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-clh-017-find-locate': {
            id: 'script-clh-017-find-locate',
            title: 'CLH-017: Find & Locate',
            description: 'CLH-017: Find & Locate — applet content for script house',
            house: 'script',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['clh-017', 'find', 'locate', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                applet: 'houses/script/applets/linux/script-clh-017-find-locate.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-clh-017-intro': {
            id: 'script-clh-017-intro',
            title: 'CLH-017: Find & Locate',
            description: 'CLH-017: Find & Locate — applet content for script house',
            house: 'script',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['clh-017', 'find', 'locate', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                applet: 'houses/script/clh/script-clh-017-intro.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-clh-018-archive-ops': {
            id: 'script-clh-018-archive-ops',
            title: 'CLH-018: Archive Operations',
            description: 'CLH-018: Archive Operations — applet content for script house',
            house: 'script',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['clh-018', 'archive', 'operations', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                applet: 'houses/script/applets/linux/script-clh-018-archive-ops.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-clh-018-intro': {
            id: 'script-clh-018-intro',
            title: 'CLH-018: Archive Operations',
            description: 'CLH-018: Archive Operations — applet content for script house',
            house: 'script',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['clh-018', 'archive', 'operations', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                applet: 'houses/script/clh/script-clh-018-intro.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-clh-019-disk-forensics': {
            id: 'script-clh-019-disk-forensics',
            title: 'CLH-019: Disk Forensics',
            description: 'CLH-019: Disk Forensics — applet content for script house',
            house: 'script',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['clh-019', 'disk', 'forensics', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                applet: 'houses/script/applets/linux/script-clh-019-disk-forensics.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-clh-019-intro': {
            id: 'script-clh-019-intro',
            title: 'CLH-019: Disk Forensics',
            description: 'CLH-019: Disk Forensics — applet content for script house',
            house: 'script',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['clh-019', 'disk', 'forensics', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                applet: 'houses/script/clh/script-clh-019-intro.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-clh-020-intro': {
            id: 'script-clh-020-intro',
            title: 'CLH-020: User Reconnaissance',
            description: 'CLH-020: User Reconnaissance — applet content for script house',
            house: 'script',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['clh-020', 'user', 'reconnaissance', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                applet: 'houses/script/clh/script-clh-020-intro.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-clh-020-user-recon': {
            id: 'script-clh-020-user-recon',
            title: 'CLH-020: User Reconnaissance',
            description: 'CLH-020: User Reconnaissance — applet content for script house',
            house: 'script',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['clh-020', 'user', 'reconnaissance', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                applet: 'houses/script/applets/linux/script-clh-020-user-recon.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-clh-021-intro': {
            id: 'script-clh-021-intro',
            title: 'CLH-021: SSH Operations',
            description: 'CLH-021: SSH Operations — applet content for script house',
            house: 'script',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['clh-021', 'ssh', 'operations', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                applet: 'houses/script/clh/script-clh-021-intro.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-clh-021-ssh-ops': {
            id: 'script-clh-021-ssh-ops',
            title: 'CLH-021: SSH Operations',
            description: 'CLH-021: SSH Operations — applet content for script house',
            house: 'script',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['clh-021', 'ssh', 'operations', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                applet: 'houses/script/applets/linux/script-clh-021-ssh-ops.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-clh-022-intro': {
            id: 'script-clh-022-intro',
            title: 'CLH-022: Network Reconnaissance',
            description: 'CLH-022: Network Reconnaissance — applet content for script house',
            house: 'script',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['clh-022', 'network', 'reconnaissance', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                applet: 'houses/script/clh/script-clh-022-intro.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-clh-022-network-recon': {
            id: 'script-clh-022-network-recon',
            title: 'CLH-022: Network Reconnaissance',
            description: 'CLH-022: Network Reconnaissance — applet content for script house',
            house: 'script',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['clh-022', 'network', 'reconnaissance', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                applet: 'houses/script/applets/linux/script-clh-022-network-recon.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-clh-023-intro': {
            id: 'script-clh-023-intro',
            title: 'CLH-023: Service Management',
            description: 'CLH-023: Service Management — applet content for script house',
            house: 'script',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['clh-023', 'service', 'management', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                applet: 'houses/script/clh/script-clh-023-intro.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-clh-023-services': {
            id: 'script-clh-023-services',
            title: 'CLH-023: Service Management',
            description: 'CLH-023: Service Management — applet content for script house',
            house: 'script',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['clh-023', 'service', 'management', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                applet: 'houses/script/applets/linux/script-clh-023-services.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-clh-024-cron': {
            id: 'script-clh-024-cron',
            title: 'CLH-024: Scheduled Tasks',
            description: 'CLH-024: Scheduled Tasks — applet content for script house',
            house: 'script',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['clh-024', 'scheduled', 'tasks', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                applet: 'houses/script/applets/linux/script-clh-024-cron.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-clh-024-intro': {
            id: 'script-clh-024-intro',
            title: 'CLH-024: Scheduled Tasks',
            description: 'CLH-024: Scheduled Tasks — applet content for script house',
            house: 'script',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['clh-024', 'scheduled', 'tasks', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                applet: 'houses/script/clh/script-clh-024-intro.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-clh-025-intro': {
            id: 'script-clh-025-intro',
            title: 'CLH-025: Package Management',
            description: 'CLH-025: Package Management — applet content for script house',
            house: 'script',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['clh-025', 'package', 'management', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                applet: 'houses/script/clh/script-clh-025-intro.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-clh-025-packages': {
            id: 'script-clh-025-packages',
            title: 'CLH-025: Package Management',
            description: 'CLH-025: Package Management — applet content for script house',
            house: 'script',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['clh-025', 'package', 'management', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                applet: 'houses/script/applets/linux/script-clh-025-packages.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-clh-026-access': {
            id: 'script-clh-026-access',
            title: 'CLH-026: Access Control',
            description: 'CLH-026: Access Control — applet content for script house',
            house: 'script',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['clh-026', 'access', 'control', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                applet: 'houses/script/applets/linux/script-clh-026-access.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-clh-026-intro': {
            id: 'script-clh-026-intro',
            title: 'CLH-026: Access Control',
            description: 'CLH-026: Access Control — applet content for script house',
            house: 'script',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['clh-026', 'access', 'control', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                applet: 'houses/script/clh/script-clh-026-intro.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-clh-027-intro': {
            id: 'script-clh-027-intro',
            title: 'CLH-027: User Management',
            description: 'CLH-027: User Management — applet content for script house',
            house: 'script',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['clh-027', 'user', 'management', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                applet: 'houses/script/clh/script-clh-027-intro.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-clh-027-users': {
            id: 'script-clh-027-users',
            title: 'CLH-027: User Management',
            description: 'CLH-027: User Management — applet content for script house',
            house: 'script',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['clh-027', 'user', 'management', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                applet: 'houses/script/applets/linux/script-clh-027-users.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-clh-028-intro': {
            id: 'script-clh-028-intro',
            title: 'CLH-028: System Monitoring',
            description: 'CLH-028: System Monitoring — applet content for script house',
            house: 'script',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['clh-028', 'system', 'monitoring', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                applet: 'houses/script/clh/script-clh-028-intro.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-clh-028-monitoring': {
            id: 'script-clh-028-monitoring',
            title: 'CLH-028: System Monitoring',
            description: 'CLH-028: System Monitoring — applet content for script house',
            house: 'script',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['clh-028', 'system', 'monitoring', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                applet: 'houses/script/applets/linux/script-clh-028-monitoring.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-clh-029-intro': {
            id: 'script-clh-029-intro',
            title: 'CLH-029: Vim Essentials',
            description: 'CLH-029: Vim Essentials — applet content for script house',
            house: 'script',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['clh-029', 'vim', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                applet: 'houses/script/clh/script-clh-029-intro.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-clh-029-vim': {
            id: 'script-clh-029-vim',
            title: 'CLH-029: Vim Essentials',
            description: 'CLH-029: Vim Essentials — applet content for script house',
            house: 'script',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['clh-029', 'vim', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                applet: 'houses/script/applets/linux/script-clh-029-vim.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-clh-030-chimera': {
            id: 'script-clh-030-chimera',
            title: 'CLH-030: OPERATION CHIMERA',
            description: 'CLH-030: OPERATION CHIMERA — applet content for script house',
            house: 'script',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['clh-030', 'operation', 'chimera', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                applet: 'houses/script/applets/linux/script-clh-030-chimera.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-clh-030-intro': {
            id: 'script-clh-030-intro',
            title: 'CLH-030: Final Operation',
            description: 'CLH-030: Final Operation — applet content for script house',
            house: 'script',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['clh-030', 'final', 'operation', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                applet: 'houses/script/clh/script-clh-030-intro.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-clh-031-blackout': {
            id: 'script-clh-031-blackout',
            title: 'CLH-031: Operation BLACKOUT',
            description: 'CLH-031: Operation BLACKOUT — applet content for script house',
            house: 'script',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['clh-031', 'operation', 'blackout', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                applet: 'houses/script/applets/linux/script-clh-031-blackout.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-cron-builder': {
            id: 'script-cron-builder',
            title: 'Cron Job Builder',
            description: 'Cron Job Builder — lab content for script house',
            house: 'script',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['cron', 'job', 'builder', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                lab: 'houses/script/labs/script-cron-builder.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-directory': {
            id: 'script-directory',
            title: 'Linux Directory Explorer',
            description: 'Linux Directory Explorer — tool content for script house',
            house: 'script',
            type: 'tool',
            difficulty: 'beginner',
            duration: 20,
            topics: ['linux', 'directory', 'explorer', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                applet: 'houses/script/linux/tools/script-directory.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-linux-compression': {
            id: 'script-linux-compression',
            title: 'Mission: Compression & Archives',
            description: 'Mission: Compression & Archives — lab content for script house',
            house: 'script',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['mission', 'compression', 'archives', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                lab: 'houses/script/labs/linux/script-linux-compression.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-linux-disk-drill': {
            id: 'script-linux-disk-drill',
            title: 'Disk Drill',
            description: 'Disk Drill — lab content for script house',
            house: 'script',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['disk', 'drill', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                lab: 'houses/script/labs/linux/script-linux-disk-drill.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-linux-disk-mgmt': {
            id: 'script-linux-disk-mgmt',
            title: 'Disk Management Mission',
            description: 'Disk Management Mission — lab content for script house',
            house: 'script',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['disk', 'management', 'mission', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                lab: 'houses/script/labs/linux/script-linux-disk-mgmt.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-linux-disk-partition-prep': {
            id: 'script-linux-disk-partition-prep',
            title: 'Disk Partition Prep',
            description: 'Disk Partition Prep — lab content for script house',
            house: 'script',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['disk', 'partition', 'prep', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                lab: 'houses/script/labs/linux/script-linux-disk-partition-prep.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-linux-env-vars': {
            id: 'script-linux-env-vars',
            title: 'Environment Variables Mission',
            description: 'Environment Variables Mission — lab content for script house',
            house: 'script',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['environment', 'variables', 'mission', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                lab: 'houses/script/labs/linux/script-linux-env-vars.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-linux-file-mgmt-prep': {
            id: 'script-linux-file-mgmt-prep',
            title: 'Prep: File Management Chain',
            description: 'Prep: File Management Chain — lab content for script house',
            house: 'script',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['prep', 'file', 'management', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                lab: 'houses/script/labs/linux/script-linux-file-mgmt-prep.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-linux-file-ops': {
            id: 'script-linux-file-ops',
            title: 'Mission: File Operations',
            description: 'Mission: File Operations — lab content for script house',
            house: 'script',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['mission', 'file', 'operations', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                lab: 'houses/script/labs/linux/script-linux-file-ops.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-linux-file-search': {
            id: 'script-linux-file-search',
            title: 'Mission: File Searching',
            description: 'Mission: File Searching — lab content for script house',
            house: 'script',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['mission', 'file', 'searching', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                lab: 'houses/script/labs/linux/script-linux-file-search.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-linux-find-drill': {
            id: 'script-linux-find-drill',
            title: 'File Finding Drill',
            description: 'File Finding Drill — lab content for script house',
            house: 'script',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['file', 'finding', 'drill', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                lab: 'houses/script/labs/linux/script-linux-find-drill.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-linux-links': {
            id: 'script-linux-links',
            title: 'Mission: Links & Symlinks',
            description: 'Mission: Links & Symlinks — lab content for script house',
            house: 'script',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['mission', 'links', 'symlinks', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                lab: 'houses/script/labs/linux/script-linux-links.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-linux-log-analysis': {
            id: 'script-linux-log-analysis',
            title: 'Log Analysis Mission',
            description: 'Log Analysis Mission — lab content for script house',
            house: 'script',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['log', 'analysis', 'mission', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                lab: 'houses/script/labs/linux/script-linux-log-analysis.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-linux-log-analysis-mission': {
            id: 'script-linux-log-analysis-mission',
            title: 'Log Analysis Mission',
            description: 'Log Analysis Mission — lab content for script house',
            house: 'script',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['log', 'analysis', 'mission', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                lab: 'houses/script/labs/linux/script-linux-log-analysis-mission.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-linux-log-analysis-prep': {
            id: 'script-linux-log-analysis-prep',
            title: 'Prep: Log Analysis',
            description: 'Prep: Log Analysis — lab content for script house',
            house: 'script',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['prep', 'log', 'analysis', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                lab: 'houses/script/labs/linux/script-linux-log-analysis-prep.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-linux-log-investigation-prep': {
            id: 'script-linux-log-investigation-prep',
            title: 'Log Investigation Prep',
            description: 'Log Investigation Prep — lab content for script house',
            house: 'script',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['log', 'investigation', 'prep', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                lab: 'houses/script/labs/linux/script-linux-log-investigation-prep.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-linux-mkdir-drill': {
            id: 'script-linux-mkdir-drill',
            title: 'Directory Builder Drill',
            description: 'Directory Builder Drill — lab content for script house',
            house: 'script',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['directory', 'builder', 'drill', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                lab: 'houses/script/labs/linux/script-linux-mkdir-drill.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-linux-nav-drill': {
            id: 'script-linux-nav-drill',
            title: 'Navigation Drill',
            description: 'Navigation Drill — lab content for script house',
            house: 'script',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['navigation', 'drill', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                lab: 'houses/script/labs/linux/script-linux-nav-drill.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-linux-network-config': {
            id: 'script-linux-network-config',
            title: 'Network Configuration Mission',
            description: 'Network Configuration Mission — lab content for script house',
            house: 'script',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['network', 'configuration', 'mission', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                lab: 'houses/script/labs/linux/script-linux-network-config.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-linux-network-drill': {
            id: 'script-linux-network-drill',
            title: 'Network Drill',
            description: 'Network Drill — lab content for script house',
            house: 'script',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['network', 'drill', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                lab: 'houses/script/labs/linux/script-linux-network-drill.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-linux-package-mgmt': {
            id: 'script-linux-package-mgmt',
            title: 'Package Management Mission',
            description: 'Package Management Mission — lab content for script house',
            house: 'script',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['package', 'management', 'mission', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                lab: 'houses/script/labs/linux/script-linux-package-mgmt.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-linux-permissions-drill': {
            id: 'script-linux-permissions-drill',
            title: 'Permissions Drill',
            description: 'Permissions Drill — lab content for script house',
            house: 'script',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['permissions', 'drill', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                lab: 'houses/script/labs/linux/script-linux-permissions-drill.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-linux-process-drill': {
            id: 'script-linux-process-drill',
            title: 'Process Drill',
            description: 'Process Drill — lab content for script house',
            house: 'script',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['process', 'drill', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                lab: 'houses/script/labs/linux/script-linux-process-drill.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-linux-process-lifecycle': {
            id: 'script-linux-process-lifecycle',
            title: 'Process Lifecycle Visualizer',
            description: 'Process Lifecycle Visualizer — lab content for script house',
            house: 'script',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['process', 'lifecycle', 'visualizer', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                lab: 'houses/script/labs/linux/script-linux-process-lifecycle.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-linux-process-mgmt': {
            id: 'script-linux-process-mgmt',
            title: 'Process Management Mission',
            description: 'Process Management Mission — lab content for script house',
            house: 'script',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['process', 'management', 'mission', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                lab: 'houses/script/labs/linux/script-linux-process-mgmt.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-linux-service-drill': {
            id: 'script-linux-service-drill',
            title: 'Service Drill',
            description: 'Service Drill — lab content for script house',
            house: 'script',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['service', 'drill', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                lab: 'houses/script/labs/linux/script-linux-service-drill.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-linux-service-mgmt': {
            id: 'script-linux-service-mgmt',
            title: 'Service Management Mission',
            description: 'Service Management Mission — lab content for script house',
            house: 'script',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['service', 'management', 'mission', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                lab: 'houses/script/labs/linux/script-linux-service-mgmt.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-linux-ssh': {
            id: 'script-linux-ssh',
            title: 'SSH Operations Mission',
            description: 'SSH Operations Mission — lab content for script house',
            house: 'script',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['ssh', 'operations', 'mission', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                lab: 'houses/script/labs/linux/script-linux-ssh.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-linux-sysadmin-reference': {
            id: 'script-linux-sysadmin-reference',
            title: 'Sysadmin Quick Reference',
            description: 'Sysadmin Quick Reference — lab content for script house',
            house: 'script',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['sysadmin', 'quick', 'reference', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                lab: 'houses/script/labs/linux/script-linux-sysadmin-reference.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-linux-systemctl': {
            id: 'script-linux-systemctl',
            title: 'Service Management Mission',
            description: 'Service Management Mission — lab content for script house',
            house: 'script',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['service', 'management', 'mission', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                lab: 'houses/script/labs/linux/script-linux-systemctl.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-linux-text-viewing': {
            id: 'script-linux-text-viewing',
            title: 'Mission: Text Viewing & Processing',
            description: 'Mission: Text Viewing & Processing — lab content for script house',
            house: 'script',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['mission', 'text', 'viewing', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                lab: 'houses/script/labs/linux/script-linux-text-viewing.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-linux-users': {
            id: 'script-linux-users',
            title: 'Mission: User Management',
            description: 'Mission: User Management — lab content for script house',
            house: 'script',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['mission', 'user', 'management', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                lab: 'houses/script/labs/linux/script-linux-users.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-linux-viewing-drill': {
            id: 'script-linux-viewing-drill',
            title: 'File Viewing Drill',
            description: 'File Viewing Drill — lab content for script house',
            house: 'script',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['file', 'viewing', 'drill', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                lab: 'houses/script/labs/linux/script-linux-viewing-drill.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-linux-wildcards': {
            id: 'script-linux-wildcards',
            title: 'Mission: Wildcards & Globbing',
            description: 'Mission: Wildcards & Globbing — lab content for script house',
            house: 'script',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['mission', 'wildcards', 'globbing', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                lab: 'houses/script/labs/linux/script-linux-wildcards.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-lm-01-welcome': {
            id: 'script-lm-01-welcome',
            title: 'LM-01: Welcome to Linux - Linux Mastery',
            description: 'LM-01: Welcome to Linux - Linux Mastery — module content for script house',
            house: 'script',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['lm-01', 'welcome', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                module: 'houses/script/modules/linux-mastery/script-lm-01-welcome.module.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-lm-02-first-commands': {
            id: 'script-lm-02-first-commands',
            title: 'LM-02: Your First Commands - Linux Mastery',
            description: 'LM-02: Your First Commands - Linux Mastery — module content for script house',
            house: 'script',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['lm-02', 'your', 'first', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                module: 'houses/script/modules/linux-mastery/script-lm-02-first-commands.module.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-lm-03-getting-help': {
            id: 'script-lm-03-getting-help',
            title: 'LM-03: Getting Help - Linux Mastery',
            description: 'LM-03: Getting Help - Linux Mastery — module content for script house',
            house: 'script',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['lm-03', 'getting', 'help', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                module: 'houses/script/modules/linux-mastery/script-lm-03-getting-help.module.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-lm-04-terminal-environment': {
            id: 'script-lm-04-terminal-environment',
            title: 'LM-04: The Terminal Environment - Linux Mastery',
            description: 'LM-04: The Terminal Environment - Linux Mastery — module content for script house',
            house: 'script',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['lm-04', 'terminal', 'environment', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                module: 'houses/script/modules/linux-mastery/script-lm-04-terminal-environment.module.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-lm-05-section1-practice': {
            id: 'script-lm-05-section1-practice',
            title: 'LM-05: Section 1 Practice - Linux Mastery',
            description: 'LM-05: Section 1 Practice - Linux Mastery — module content for script house',
            house: 'script',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['lm-05', 'section', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                module: 'houses/script/modules/linux-mastery/script-lm-05-section1-practice.module.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-lm-06-navigation': {
            id: 'script-lm-06-navigation',
            title: 'LM-06: Directory Navigation - Linux Mastery',
            description: 'LM-06: Directory Navigation - Linux Mastery — module content for script house',
            house: 'script',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['lm-06', 'directory', 'navigation', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                module: 'houses/script/modules/linux-mastery/script-lm-06-navigation.module.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-lm-07-listing-files': {
            id: 'script-lm-07-listing-files',
            title: 'LM-07: Listing Files - Linux Mastery',
            description: 'LM-07: Listing Files - Linux Mastery — module content for script house',
            house: 'script',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['lm-07', 'listing', 'files', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                module: 'houses/script/modules/linux-mastery/script-lm-07-listing-files.module.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-lm-08-file-operations': {
            id: 'script-lm-08-file-operations',
            title: 'LM-08: File Operations | Linux Mastery',
            description: 'LM-08: File Operations | Linux Mastery — module content for script house',
            house: 'script',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['lm-08', 'file', 'operations', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                module: 'houses/script/modules/linux-mastery/script-lm-08-file-operations.module.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-lm-09-copy-move': {
            id: 'script-lm-09-copy-move',
            title: 'LM-09: Copy & Move | Linux Mastery',
            description: 'LM-09: Copy & Move | Linux Mastery — module content for script house',
            house: 'script',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['lm-09', 'copy', 'move', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                module: 'houses/script/modules/linux-mastery/script-lm-09-copy-move.module.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-lm-10-viewing-files': {
            id: 'script-lm-10-viewing-files',
            title: 'LM-10: Viewing Files | Linux Mastery',
            description: 'LM-10: Viewing Files | Linux Mastery — module content for script house',
            house: 'script',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['lm-10', 'viewing', 'files', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                module: 'houses/script/modules/linux-mastery/script-lm-10-viewing-files.module.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-lm-11-finding-files': {
            id: 'script-lm-11-finding-files',
            title: 'LM-11: Finding Files | Linux Mastery',
            description: 'LM-11: Finding Files | Linux Mastery — module content for script house',
            house: 'script',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['lm-11', 'finding', 'files', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                module: 'houses/script/modules/linux-mastery/script-lm-11-finding-files.module.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-lm-12-section2-practice': {
            id: 'script-lm-12-section2-practice',
            title: 'LM-12: Section 2 Practice | Linux Mastery',
            description: 'LM-12: Section 2 Practice | Linux Mastery — module content for script house',
            house: 'script',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['lm-12', 'section', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                module: 'houses/script/modules/linux-mastery/script-lm-12-section2-practice.module.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-lm-13-grep-basics': {
            id: 'script-lm-13-grep-basics',
            title: 'LM-13: grep Basics | Linux Mastery',
            description: 'LM-13: grep Basics | Linux Mastery — module content for script house',
            house: 'script',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['lm-13', 'grep', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                module: 'houses/script/modules/linux-mastery/script-lm-13-grep-basics.module.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-lm-14-regular-expressions': {
            id: 'script-lm-14-regular-expressions',
            title: 'LM-14: Regular Expressions | Linux Mastery',
            description: 'LM-14: Regular Expressions | Linux Mastery — module content for script house',
            house: 'script',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['lm-14', 'regular', 'expressions', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                module: 'houses/script/modules/linux-mastery/script-lm-14-regular-expressions.module.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-lm-15-sed-editor': {
            id: 'script-lm-15-sed-editor',
            title: 'LM-15: sed Stream Editor | Linux Mastery',
            description: 'LM-15: sed Stream Editor | Linux Mastery — module content for script house',
            house: 'script',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['lm-15', 'sed', 'stream', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                module: 'houses/script/modules/linux-mastery/script-lm-15-sed-editor.module.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-lm-16-awk-processing': {
            id: 'script-lm-16-awk-processing',
            title: 'LM-16: awk Processing | Linux Mastery',
            description: 'LM-16: awk Processing | Linux Mastery — module content for script house',
            house: 'script',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['lm-16', 'awk', 'processing', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                module: 'houses/script/modules/linux-mastery/script-lm-16-awk-processing.module.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-lm-17-sort-uniq': {
            id: 'script-lm-17-sort-uniq',
            title: 'LM-17: sort & uniq | Linux Mastery',
            description: 'LM-17: sort & uniq | Linux Mastery — module content for script house',
            house: 'script',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['lm-17', 'sort', 'uniq', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                module: 'houses/script/modules/linux-mastery/script-lm-17-sort-uniq.module.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-lm-18-cut-paste': {
            id: 'script-lm-18-cut-paste',
            title: 'LM-18: cut & paste | Linux Mastery',
            description: 'LM-18: cut & paste | Linux Mastery — module content for script house',
            house: 'script',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['lm-18', 'cut', 'paste', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                module: 'houses/script/modules/linux-mastery/script-lm-18-cut-paste.module.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-lm-19-text-pipelines': {
            id: 'script-lm-19-text-pipelines',
            title: 'LM-19: Text Pipelines | Linux Mastery',
            description: 'LM-19: Text Pipelines | Linux Mastery — module content for script house',
            house: 'script',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['lm-19', 'text', 'pipelines', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                module: 'houses/script/modules/linux-mastery/script-lm-19-text-pipelines.module.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-lm-20-section3-practice': {
            id: 'script-lm-20-section3-practice',
            title: 'LM-20: Section 3 Practice | Linux Mastery',
            description: 'LM-20: Section 3 Practice | Linux Mastery — module content for script house',
            house: 'script',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['lm-20', 'section', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                module: 'houses/script/modules/linux-mastery/script-lm-20-section3-practice.module.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-lm-21-users-groups': {
            id: 'script-lm-21-users-groups',
            title: 'LM-21: Users and Groups | Linux Mastery',
            description: 'LM-21: Users and Groups | Linux Mastery — module content for script house',
            house: 'script',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['lm-21', 'users', 'groups', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                module: 'houses/script/modules/linux-mastery/script-lm-21-users-groups.module.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-lm-22-file-permissions': {
            id: 'script-lm-22-file-permissions',
            title: 'LM-22: File Permissions | Linux Mastery',
            description: 'LM-22: File Permissions | Linux Mastery — module content for script house',
            house: 'script',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['lm-22', 'file', 'permissions', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                module: 'houses/script/modules/linux-mastery/script-lm-22-file-permissions.module.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-lm-23-chmod': {
            id: 'script-lm-23-chmod',
            title: 'LM-23: chmod | Linux Mastery',
            description: 'LM-23: chmod | Linux Mastery — module content for script house',
            house: 'script',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['lm-23', 'chmod', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                module: 'houses/script/modules/linux-mastery/script-lm-23-chmod.module.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-lm-24-chown': {
            id: 'script-lm-24-chown',
            title: 'LM-24: chown | Linux Mastery',
            description: 'LM-24: chown | Linux Mastery — module content for script house',
            house: 'script',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['lm-24', 'chown', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                module: 'houses/script/modules/linux-mastery/script-lm-24-chown.module.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-lm-25-sudo': {
            id: 'script-lm-25-sudo',
            title: 'LM-25: sudo | Linux Mastery',
            description: 'LM-25: sudo | Linux Mastery — module content for script house',
            house: 'script',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['lm-25', 'sudo', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                module: 'houses/script/modules/linux-mastery/script-lm-25-sudo.module.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-lm-26-special-permissions': {
            id: 'script-lm-26-special-permissions',
            title: 'LM-26: Special Permissions | Linux Mastery',
            description: 'LM-26: Special Permissions | Linux Mastery — module content for script house',
            house: 'script',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['lm-26', 'special', 'permissions', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                module: 'houses/script/modules/linux-mastery/script-lm-26-special-permissions.module.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-lm-27-section4-practice': {
            id: 'script-lm-27-section4-practice',
            title: 'LM-27: Section 4 Practice | Linux Mastery',
            description: 'LM-27: Section 4 Practice | Linux Mastery — module content for script house',
            house: 'script',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['lm-27', 'section', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                module: 'houses/script/modules/linux-mastery/script-lm-27-section4-practice.module.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-lm-28-process-basics': {
            id: 'script-lm-28-process-basics',
            title: 'LM-28: Process Basics | Linux Mastery',
            description: 'LM-28: Process Basics | Linux Mastery — module content for script house',
            house: 'script',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['lm-28', 'process', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                module: 'houses/script/modules/linux-mastery/script-lm-28-process-basics.module.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-lm-29-ps-top': {
            id: 'script-lm-29-ps-top',
            title: 'LM-29: ps and top | Linux Mastery',
            description: 'LM-29: ps and top | Linux Mastery — module content for script house',
            house: 'script',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['lm-29', 'top', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                module: 'houses/script/modules/linux-mastery/script-lm-29-ps-top.module.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-lm-30-background-jobs': {
            id: 'script-lm-30-background-jobs',
            title: 'LM-30: Background Jobs | Linux Mastery',
            description: 'LM-30: Background Jobs | Linux Mastery — module content for script house',
            house: 'script',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['lm-30', 'background', 'jobs', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                module: 'houses/script/modules/linux-mastery/script-lm-30-background-jobs.module.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-lm-31-signals-kill': {
            id: 'script-lm-31-signals-kill',
            title: 'LM-31: Signals and kill | Linux Mastery',
            description: 'LM-31: Signals and kill | Linux Mastery — module content for script house',
            house: 'script',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['lm-31', 'signals', 'kill', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                module: 'houses/script/modules/linux-mastery/script-lm-31-signals-kill.module.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-lm-32-cron': {
            id: 'script-lm-32-cron',
            title: 'LM-32: cron | Linux Mastery',
            description: 'LM-32: cron | Linux Mastery — module content for script house',
            house: 'script',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['lm-32', 'cron', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                module: 'houses/script/modules/linux-mastery/script-lm-32-cron.module.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-lm-33-systemd': {
            id: 'script-lm-33-systemd',
            title: 'LM-33: systemd | Linux Mastery',
            description: 'LM-33: systemd | Linux Mastery — module content for script house',
            house: 'script',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['lm-33', 'systemd', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                module: 'houses/script/modules/linux-mastery/script-lm-33-systemd.module.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-lm-34-section5-practice': {
            id: 'script-lm-34-section5-practice',
            title: 'LM-34: Section 5 Practice | Linux Mastery',
            description: 'LM-34: Section 5 Practice | Linux Mastery — module content for script house',
            house: 'script',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['lm-34', 'section', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                module: 'houses/script/modules/linux-mastery/script-lm-34-section5-practice.module.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-lm-35-network-info': {
            id: 'script-lm-35-network-info',
            title: 'LM-35: Network Info | Linux Mastery',
            description: 'LM-35: Network Info | Linux Mastery — module content for script house',
            house: 'script',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['lm-35', 'network', 'info', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                module: 'houses/script/modules/linux-mastery/script-lm-35-network-info.module.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-lm-36-connectivity': {
            id: 'script-lm-36-connectivity',
            title: 'LM-36: Connectivity | Linux Mastery',
            description: 'LM-36: Connectivity | Linux Mastery — module content for script house',
            house: 'script',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['lm-36', 'connectivity', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                module: 'houses/script/modules/linux-mastery/script-lm-36-connectivity.module.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-lm-37-dns-tools': {
            id: 'script-lm-37-dns-tools',
            title: 'LM-37: DNS Tools | Linux Mastery',
            description: 'LM-37: DNS Tools | Linux Mastery — module content for script house',
            house: 'script',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['lm-37', 'dns', 'tools', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                module: 'houses/script/modules/linux-mastery/script-lm-37-dns-tools.module.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-lm-38-downloading': {
            id: 'script-lm-38-downloading',
            title: 'LM-38: Downloading | Linux Mastery',
            description: 'LM-38: Downloading | Linux Mastery — module content for script house',
            house: 'script',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['lm-38', 'downloading', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                module: 'houses/script/modules/linux-mastery/script-lm-38-downloading.module.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-lm-39-ssh-basics': {
            id: 'script-lm-39-ssh-basics',
            title: 'LM-39: SSH Basics | Linux Mastery',
            description: 'LM-39: SSH Basics | Linux Mastery — module content for script house',
            house: 'script',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['lm-39', 'ssh', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                module: 'houses/script/modules/linux-mastery/script-lm-39-ssh-basics.module.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-lm-40-section6-practice': {
            id: 'script-lm-40-section6-practice',
            title: 'LM-40: Section 6 Practice | Linux Mastery',
            description: 'LM-40: Section 6 Practice | Linux Mastery — module content for script house',
            house: 'script',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['lm-40', 'section', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                module: 'houses/script/modules/linux-mastery/script-lm-40-section6-practice.module.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-lm-41-first-script': {
            id: 'script-lm-41-first-script',
            title: 'LM-41: First Script | Linux Mastery',
            description: 'LM-41: First Script | Linux Mastery — module content for script house',
            house: 'script',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['lm-41', 'first', 'script', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                module: 'houses/script/modules/linux-mastery/script-lm-41-first-script.module.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-lm-42-variables': {
            id: 'script-lm-42-variables',
            title: 'LM-42: Variables | Linux Mastery',
            description: 'LM-42: Variables | Linux Mastery — module content for script house',
            house: 'script',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['lm-42', 'variables', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                module: 'houses/script/modules/linux-mastery/script-lm-42-variables.module.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-lm-43-user-input': {
            id: 'script-lm-43-user-input',
            title: 'LM-43: User Input | Linux Mastery',
            description: 'LM-43: User Input | Linux Mastery — module content for script house',
            house: 'script',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['lm-43', 'user', 'input', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                module: 'houses/script/modules/linux-mastery/script-lm-43-user-input.module.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-lm-44-conditionals': {
            id: 'script-lm-44-conditionals',
            title: 'LM-44: Conditionals | Linux Mastery',
            description: 'LM-44: Conditionals | Linux Mastery — module content for script house',
            house: 'script',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['lm-44', 'conditionals', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                module: 'houses/script/modules/linux-mastery/script-lm-44-conditionals.module.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-lm-45-loops': {
            id: 'script-lm-45-loops',
            title: 'LM-45: Loops | Linux Mastery',
            description: 'LM-45: Loops | Linux Mastery — module content for script house',
            house: 'script',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['lm-45', 'loops', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                module: 'houses/script/modules/linux-mastery/script-lm-45-loops.module.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-lm-46-functions': {
            id: 'script-lm-46-functions',
            title: 'LM-46: Functions | Linux Mastery',
            description: 'LM-46: Functions | Linux Mastery — module content for script house',
            house: 'script',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['lm-46', 'functions', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                module: 'houses/script/modules/linux-mastery/script-lm-46-functions.module.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-lm-47-practical-scripts': {
            id: 'script-lm-47-practical-scripts',
            title: 'LM-47: Practical Scripts | Linux Mastery',
            description: 'LM-47: Practical Scripts | Linux Mastery — module content for script house',
            house: 'script',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['lm-47', 'practical', 'scripts', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                module: 'houses/script/modules/linux-mastery/script-lm-47-practical-scripts.module.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-lm-48-section7-practice': {
            id: 'script-lm-48-section7-practice',
            title: 'LM-48: Section 7 Practice | Linux Mastery',
            description: 'LM-48: Section 7 Practice | Linux Mastery — module content for script house',
            house: 'script',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['lm-48', 'section', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                module: 'houses/script/modules/linux-mastery/script-lm-48-section7-practice.module.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-lm-49-links': {
            id: 'script-lm-49-links',
            title: 'LM-49: Links | Linux Mastery',
            description: 'LM-49: Links | Linux Mastery — module content for script house',
            house: 'script',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['lm-49', 'links', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                module: 'houses/script/modules/linux-mastery/script-lm-49-links.module.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-lm-50-text-editors': {
            id: 'script-lm-50-text-editors',
            title: 'LM-50: Text Editors | Linux Mastery',
            description: 'LM-50: Text Editors | Linux Mastery — module content for script house',
            house: 'script',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['lm-50', 'text', 'editors', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                module: 'houses/script/modules/linux-mastery/script-lm-50-text-editors.module.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-lm-51-package-management': {
            id: 'script-lm-51-package-management',
            title: 'LM-51: Package Management | Linux Mastery',
            description: 'LM-51: Package Management | Linux Mastery — module content for script house',
            house: 'script',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['lm-51', 'package', 'management', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                module: 'houses/script/modules/linux-mastery/script-lm-51-package-management.module.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-lm-52-environment-path': {
            id: 'script-lm-52-environment-path',
            title: 'LM-52: Environment & PATH | Linux Mastery',
            description: 'LM-52: Environment & PATH | Linux Mastery — module content for script house',
            house: 'script',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['lm-52', 'environment', 'path', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                module: 'houses/script/modules/linux-mastery/script-lm-52-environment-path.module.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-lm-53-next-steps': {
            id: 'script-lm-53-next-steps',
            title: 'LM-53: Next Steps | Linux Mastery - Graduation',
            description: 'LM-53: Next Steps | Linux Mastery - Graduation — module content for script house',
            house: 'script',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['lm-53', 'next', 'steps', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                module: 'houses/script/modules/linux-mastery/script-lm-53-next-steps.module.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-mission-file-operations': {
            id: 'script-mission-file-operations',
            title: 'Mission: File Operations',
            description: 'Mission: File Operations — lab content for script house',
            house: 'script',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['mission', 'file', 'operations', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                lab: 'houses/script/linux/labs/script-mission-file-operations.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-mission-file-search': {
            id: 'script-mission-file-search',
            title: 'Mission: File Search',
            description: 'Mission: File Search — lab content for script house',
            house: 'script',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['mission', 'file', 'search', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                lab: 'houses/script/linux/labs/script-mission-file-search.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-mission-permissions': {
            id: 'script-mission-permissions',
            title: 'Mission: Server Permissions',
            description: 'Mission: Server Permissions — lab content for script house',
            house: 'script',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['mission', 'server', 'permissions', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                lab: 'houses/script/linux/labs/script-mission-permissions.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-mission-text-viewing': {
            id: 'script-mission-text-viewing',
            title: 'Mission: Log Analysis',
            description: 'Mission: Log Analysis — lab content for script house',
            house: 'script',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['mission', 'log', 'analysis', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                lab: 'houses/script/linux/labs/script-mission-text-viewing.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-patch-tuesday': {
            id: 'script-patch-tuesday',
            title: 'Patch Tuesday - Vulnerability Triage Game',
            description: 'Patch Tuesday - Vulnerability Triage Game — lab content for script house',
            house: 'script',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['patch', 'tuesday', 'vulnerability', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                lab: 'houses/script/labs/script-patch-tuesday.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-permission': {
            id: 'script-permission',
            title: 'Linux Permission Calculator',
            description: 'Linux Permission Calculator — tool content for script house',
            house: 'script',
            type: 'tool',
            difficulty: 'beginner',
            duration: 20,
            topics: ['linux', 'permission', 'calculator', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                applet: 'houses/script/linux/tools/script-permission.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-pipe-snake': {
            id: 'script-pipe-snake',
            title: 'Pipe Snake',
            description: 'Pipe Snake — applet content for script house',
            house: 'script',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['pipe', 'snake', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                applet: 'houses/script/games/script-pipe-snake.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-process': {
            id: 'script-process',
            title: 'Process Lifecycle - Linux Tools',
            description: 'Process Lifecycle - Linux Tools — tool content for script house',
            house: 'script',
            type: 'tool',
            difficulty: 'beginner',
            duration: 20,
            topics: ['process', 'lifecycle', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                applet: 'houses/script/linux/tools/script-process.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-python-exam-chapter1': {
            id: 'script-python-exam-chapter1',
            title: 'Chapter 1 Practical Exam - Python Fundamentals',
            description: 'Chapter 1 Practical Exam - Python Fundamentals — exam content for script house',
            house: 'script',
            type: 'exam',
            difficulty: 'beginner',
            duration: 30,
            topics: ['chapter', 'practical', 'exam', 'linux', 'command-line'],
            paths: ['python-fundamentals'],
            components: {
                quiz: 'houses/script/exams/script-python-exam-chapter1.exam.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-python-exam-chapter2': {
            id: 'script-python-exam-chapter2',
            title: 'Chapter 2 Practical Exam - Strings',
            description: 'Chapter 2 Practical Exam - Strings — exam content for script house',
            house: 'script',
            type: 'exam',
            difficulty: 'beginner',
            duration: 30,
            topics: ['chapter', 'practical', 'exam', 'linux', 'command-line'],
            paths: ['python-fundamentals'],
            components: {
                quiz: 'houses/script/exams/script-python-exam-chapter2.exam.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-python-exam-chapter3': {
            id: 'script-python-exam-chapter3',
            title: 'Chapter 3 Practical Exam - Flow Control',
            description: 'Chapter 3 Practical Exam - Flow Control — exam content for script house',
            house: 'script',
            type: 'exam',
            difficulty: 'beginner',
            duration: 30,
            topics: ['chapter', 'practical', 'exam', 'linux', 'command-line'],
            paths: ['python-fundamentals'],
            components: {
                quiz: 'houses/script/exams/script-python-exam-chapter3.exam.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-python-exam-chapter4': {
            id: 'script-python-exam-chapter4',
            title: 'Python Chapter 4 Exam: Functions - Practical Exam',
            description: 'Python Chapter 4 Exam: Functions - Practical Exam — exam content for script house',
            house: 'script',
            type: 'exam',
            difficulty: 'beginner',
            duration: 30,
            topics: ['python', 'chapter', 'exam', 'linux', 'command-line'],
            paths: ['python-fundamentals'],
            components: {
                quiz: 'houses/script/exams/script-python-exam-chapter4.exam.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-python-exam-chapter5': {
            id: 'script-python-exam-chapter5',
            title: 'Python Chapter 5 Exam: Collections - Practical Exam',
            description: 'Python Chapter 5 Exam: Collections - Practical Exam — exam content for script house',
            house: 'script',
            type: 'exam',
            difficulty: 'beginner',
            duration: 30,
            topics: ['python', 'chapter', 'exam', 'linux', 'command-line'],
            paths: ['python-fundamentals'],
            components: {
                quiz: 'houses/script/exams/script-python-exam-chapter5.exam.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-python-exam-chapter6': {
            id: 'script-python-exam-chapter6',
            title: 'Python Chapter 6 Exam: Dictionaries - Practical Exam',
            description: 'Python Chapter 6 Exam: Dictionaries - Practical Exam — exam content for script house',
            house: 'script',
            type: 'exam',
            difficulty: 'beginner',
            duration: 30,
            topics: ['python', 'chapter', 'exam', 'linux', 'command-line'],
            paths: ['python-fundamentals'],
            components: {
                quiz: 'houses/script/exams/script-python-exam-chapter6.exam.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-python-exam-chapter7': {
            id: 'script-python-exam-chapter7',
            title: 'Python Chapter 7 Exam: File Handling - Practical Assessment',
            description: 'Python Chapter 7 Exam: File Handling - Practical Assessment — exam content for script house',
            house: 'script',
            type: 'exam',
            difficulty: 'beginner',
            duration: 30,
            topics: ['python', 'chapter', 'exam', 'linux', 'command-line'],
            paths: ['python-fundamentals'],
            components: {
                quiz: 'houses/script/exams/script-python-exam-chapter7.exam.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-python-exam-chapter8': {
            id: 'script-python-exam-chapter8',
            title: 'Python Chapter 8 Exam: OOP - Final Practical Assessment',
            description: 'Python Chapter 8 Exam: OOP - Final Practical Assessment — exam content for script house',
            house: 'script',
            type: 'exam',
            difficulty: 'beginner',
            duration: 30,
            topics: ['python', 'chapter', 'exam', 'linux', 'command-line'],
            paths: ['python-fundamentals'],
            components: {
                quiz: 'houses/script/exams/script-python-exam-chapter8.exam.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-python-immersive-chapter1': {
            id: 'script-python-immersive-chapter1',
            title: 'Python Chapter 1: The First Bit - Immersive Learning',
            description: 'Python Chapter 1: The First Bit - Immersive Learning — module content for script house',
            house: 'script',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['python', 'chapter', 'first', 'linux', 'command-line'],
            paths: ['python-fundamentals'],
            components: {
                module: 'houses/script/modules/python/script-python-immersive-chapter1.module.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-python-immersive-chapter2': {
            id: 'script-python-immersive-chapter2',
            title: 'Python Chapter 2: Strings - Immersive Learning',
            description: 'Python Chapter 2: Strings - Immersive Learning — module content for script house',
            house: 'script',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['python', 'chapter', 'strings', 'linux', 'command-line'],
            paths: ['python-fundamentals'],
            components: {
                module: 'houses/script/modules/python/script-python-immersive-chapter2.module.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-python-immersive-chapter3': {
            id: 'script-python-immersive-chapter3',
            title: 'Python Chapter 3: Flow Control - Immersive Learning',
            description: 'Python Chapter 3: Flow Control - Immersive Learning — module content for script house',
            house: 'script',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['python', 'chapter', 'flow', 'linux', 'command-line'],
            paths: ['python-fundamentals'],
            components: {
                module: 'houses/script/modules/python/script-python-immersive-chapter3.module.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-python-immersive-chapter4': {
            id: 'script-python-immersive-chapter4',
            title: 'Python Chapter 4: Functions - Immersive Learning',
            description: 'Python Chapter 4: Functions - Immersive Learning — module content for script house',
            house: 'script',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['python', 'chapter', 'functions', 'linux', 'command-line'],
            paths: ['python-fundamentals'],
            components: {
                module: 'houses/script/modules/python/script-python-immersive-chapter4.module.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-python-immersive-chapter5': {
            id: 'script-python-immersive-chapter5',
            title: 'Python Chapter 5: Collections - Immersive Learning',
            description: 'Python Chapter 5: Collections - Immersive Learning — module content for script house',
            house: 'script',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['python', 'chapter', 'collections', 'linux', 'command-line'],
            paths: ['python-fundamentals'],
            components: {
                module: 'houses/script/modules/python/script-python-immersive-chapter5.module.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-python-immersive-chapter6': {
            id: 'script-python-immersive-chapter6',
            title: 'Python Chapter 6: Dictionaries - Immersive Learning',
            description: 'Python Chapter 6: Dictionaries - Immersive Learning — module content for script house',
            house: 'script',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['python', 'chapter', 'dictionaries', 'linux', 'command-line'],
            paths: ['python-fundamentals'],
            components: {
                module: 'houses/script/modules/python/script-python-immersive-chapter6.module.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-python-immersive-chapter7': {
            id: 'script-python-immersive-chapter7',
            title: 'Python Chapter 7: File Handling - Immersive Learning',
            description: 'Python Chapter 7: File Handling - Immersive Learning — module content for script house',
            house: 'script',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['python', 'chapter', 'file', 'linux', 'command-line'],
            paths: ['python-fundamentals'],
            components: {
                module: 'houses/script/modules/python/script-python-immersive-chapter7.module.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-python-immersive-chapter8': {
            id: 'script-python-immersive-chapter8',
            title: 'Python Chapter 8: Object-Oriented Programming - Immersive Learning',
            description: 'Python Chapter 8: Object-Oriented Programming - Immersive Learning — module content for script house',
            house: 'script',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['python', 'chapter', 'object-oriented', 'linux', 'command-line'],
            paths: ['python-fundamentals'],
            components: {
                module: 'houses/script/modules/python/script-python-immersive-chapter8.module.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-quick': {
            id: 'script-quick',
            title: 'Linux Quick Reference',
            description: 'Linux Quick Reference — reference content for script house',
            house: 'script',
            type: 'reference',
            difficulty: 'beginner',
            duration: 15,
            topics: ['linux', 'quick', 'reference', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                reference: 'houses/script/linux/script-quick.reference.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-service': {
            id: 'script-service',
            title: 'Service Dependency Map - Linux Tools',
            description: 'Service Dependency Map - Linux Tools — tool content for script house',
            house: 'script',
            type: 'tool',
            difficulty: 'beginner',
            duration: 20,
            topics: ['service', 'dependency', 'map', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                applet: 'houses/script/linux/tools/script-service.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-shell-sprint': {
            id: 'script-shell-sprint',
            title: 'Shell Sprint',
            description: 'Shell Sprint — applet content for script house',
            house: 'script',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['shell', 'sprint', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                applet: 'houses/script/games/script-shell-sprint.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-template-warmup': {
            id: 'script-template-warmup',
            title: 'File Navigation Warmup',
            description: 'File Navigation Warmup — lab content for script house',
            house: 'script',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['file', 'navigation', 'warmup', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                lab: 'houses/script/linux/labs/script-template-warmup.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-ubuntu-components': {
            id: 'script-ubuntu-components',
            title: 'Ubuntu Security Components',
            description: 'Ubuntu Security Components — applet content for script house',
            house: 'script',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['ubuntu', 'security', 'components', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                applet: 'houses/script/applets/linux/script-ubuntu-components.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-warmup-navigation': {
            id: 'script-warmup-navigation',
            title: 'Directory Navigation Warmup',
            description: 'Directory Navigation Warmup — lab content for script house',
            house: 'script',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['directory', 'navigation', 'warmup', 'linux', 'command-line'],
            paths: ['linux-mastery'],
            components: {
                lab: 'houses/script/linux/labs/script-warmup-navigation.lab.html'
            },
            prerequisites: [],
            objectives: []
        },

        // ─── EYE HOUSE (auto-generated) ───
        'eye-5-tuple-approach': {
            id: 'eye-5-tuple-approach',
            title: '5-Tuple Approach',
            description: '5-Tuple Approach — applet content for eye house',
            house: 'eye',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['5-tuple', 'approach', 'monitoring', 'analysis'],
            paths: ['security-operations'],
            components: {
                applet: 'houses/eye/applets/cyberops/eye-5-tuple-approach.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-acl-demo': {
            id: 'eye-acl-demo',
            title: 'Lab 4.5: ACL Demonstration',
            description: 'Lab 4.5: ACL Demonstration — lab content for eye house',
            house: 'eye',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['acl', 'demonstration', 'monitoring', 'analysis'],
            paths: ['security-operations'],
            components: {
                lab: 'houses/eye/applets/cyberops/week4/labs/eye-acl-demo.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-app-visibility-control': {
            id: 'eye-app-visibility-control',
            title: 'Application Visibility & Control',
            description: 'Application Visibility & Control — applet content for eye house',
            house: 'eye',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['application', 'visibility', 'control', 'monitoring', 'analysis'],
            paths: ['security-operations'],
            components: {
                applet: 'houses/eye/applets/cyberops/eye-app-visibility-control.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-artifact-elements': {
            id: 'eye-artifact-elements',
            title: '4.6 Interpret Artifact Elements',
            description: '4.6 Interpret Artifact Elements — applet content for eye house',
            house: 'eye',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['interpret', 'artifact', 'elements', 'monitoring', 'analysis'],
            paths: ['security-operations'],
            components: {
                applet: 'houses/eye/applets/cyberops/eye-artifact-elements.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-asymmetric-encryption': {
            id: 'eye-asymmetric-encryption',
            title: 'Asymmetric Encryption',
            description: 'Asymmetric Encryption — lab content for eye house',
            house: 'eye',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['asymmetric', 'encryption', 'monitoring', 'analysis'],
            paths: ['security-operations'],
            components: {
                lab: 'houses/eye/applets/cyberops/week6/labs/eye-asymmetric-encryption.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-attack-surface': {
            id: 'eye-attack-surface',
            title: 'Attack Surface Management',
            description: 'Attack Surface Management — applet content for eye house',
            house: 'eye',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['attack', 'surface', 'management', 'monitoring', 'analysis'],
            paths: ['security-operations'],
            components: {
                applet: 'houses/eye/applets/cyberops/eye-attack-surface.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-attack-surface-vuln': {
            id: 'eye-attack-surface-vuln',
            title: 'Attack Surface & Vulnerability',
            description: 'Attack Surface & Vulnerability — applet content for eye house',
            house: 'eye',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['attack', 'surface', 'vulnerability', 'monitoring', 'analysis'],
            paths: ['security-operations'],
            components: {
                applet: 'houses/eye/applets/cyberops/eye-attack-surface-vuln.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-attribution-investigation': {
            id: 'eye-attribution-investigation',
            title: 'Attribution in Investigation',
            description: 'Attribution in Investigation — applet content for eye house',
            house: 'eye',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['attribution', 'investigation', 'monitoring', 'analysis'],
            paths: ['security-operations'],
            components: {
                applet: 'houses/eye/applets/cyberops/eye-attribution-investigation.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-certificate': {
            id: 'eye-certificate',
            title: 'Certificate',
            description: 'Certificate — module content for eye house',
            house: 'eye',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['certificate', 'monitoring', 'analysis'],
            paths: ['security-operations'],
            components: {
                module: 'houses/eye/modules/cyberops/eye-certificate.module.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-certificate-stores': {
            id: 'eye-certificate-stores',
            title: 'Lab 5: Certificate Stores',
            description: 'Lab 5: Certificate Stores — lab content for eye house',
            house: 'eye',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['certificate', 'stores', 'monitoring', 'analysis'],
            paths: ['security-operations'],
            components: {
                lab: 'houses/eye/applets/cyberops/week6/labs/eye-certificate-stores.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-chain-of-custody': {
            id: 'eye-chain-of-custody',
            title: 'Lab 8: Chain of Custody',
            description: 'Lab 8: Chain of Custody — lab content for eye house',
            house: 'eye',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['chain', 'custody', 'monitoring', 'analysis'],
            paths: ['security-operations'],
            components: {
                lab: 'houses/eye/applets/cyberops/week7/labs/eye-chain-of-custody.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-content-filtering': {
            id: 'eye-content-filtering',
            title: 'Content Filtering Data',
            description: 'Content Filtering Data — applet content for eye house',
            house: 'eye',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['content', 'filtering', 'data', 'monitoring', 'analysis'],
            paths: ['security-operations'],
            components: {
                applet: 'houses/eye/applets/cyberops/eye-content-filtering.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-cvss-terminology': {
            id: 'eye-cvss-terminology',
            title: 'CVSS Terminology',
            description: 'CVSS Terminology — applet content for eye house',
            house: 'eye',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['cvss', 'terminology', 'monitoring', 'analysis'],
            paths: ['security-operations'],
            components: {
                applet: 'houses/eye/applets/cyberops/eye-cvss-terminology.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-data-loss-traffic': {
            id: 'eye-data-loss-traffic',
            title: 'Data Loss from Traffic Analysis',
            description: 'Data Loss from Traffic Analysis — applet content for eye house',
            house: 'eye',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['data', 'loss', 'from', 'monitoring', 'analysis'],
            paths: ['security-operations'],
            components: {
                applet: 'houses/eye/applets/cyberops/eye-data-loss-traffic.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-data-types-output': {
            id: 'eye-data-types-output',
            title: 'Data Types from Security Output',
            description: 'Data Types from Security Output — applet content for eye house',
            house: 'eye',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['data', 'types', 'from', 'monitoring', 'analysis'],
            paths: ['security-operations'],
            components: {
                applet: 'houses/eye/applets/cyberops/eye-data-types-output.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-data-visibility': {
            id: 'eye-data-visibility',
            title: 'Data Visibility',
            description: 'Data Visibility — applet content for eye house',
            house: 'eye',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['data', 'visibility', 'monitoring', 'analysis'],
            paths: ['security-operations'],
            components: {
                applet: 'houses/eye/applets/cyberops/eye-data-visibility.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-data-visibility-challenges': {
            id: 'eye-data-visibility-challenges',
            title: 'Data Visibility Challenges',
            description: 'Data Visibility Challenges — applet content for eye house',
            house: 'eye',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['data', 'visibility', 'challenges', 'monitoring', 'analysis'],
            paths: ['security-operations'],
            components: {
                applet: 'houses/eye/applets/cyberops/eye-data-visibility-challenges.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-detection-methods': {
            id: 'eye-detection-methods',
            title: 'Detection Methods',
            description: 'Detection Methods — applet content for eye house',
            house: 'eye',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['detection', 'methods', 'monitoring', 'analysis'],
            paths: ['security-operations'],
            components: {
                applet: 'houses/eye/applets/cyberops/eye-detection-methods.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-digital-signatures': {
            id: 'eye-digital-signatures',
            title: 'Digital Signatures',
            description: 'Digital Signatures — lab content for eye house',
            house: 'eye',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['digital', 'signatures', 'monitoring', 'analysis'],
            paths: ['security-operations'],
            components: {
                lab: 'houses/eye/applets/cyberops/week6/labs/eye-digital-signatures.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-disk-images': {
            id: 'eye-disk-images',
            title: 'Compare Disk Images',
            description: 'Compare Disk Images — applet content for eye house',
            house: 'eye',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['compare', 'disk', 'images', 'monitoring', 'analysis'],
            paths: ['security-operations'],
            components: {
                applet: 'houses/eye/applets/cyberops/eye-disk-images.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-dns-traffic': {
            id: 'eye-dns-traffic',
            title: 'Lab 5.3: Exploring DNS Traffic',
            description: 'Lab 5.3: Exploring DNS Traffic — lab content for eye house',
            house: 'eye',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['exploring', 'dns', 'traffic', 'monitoring', 'analysis'],
            paths: ['security-operations'],
            components: {
                lab: 'houses/eye/applets/cyberops/week5/labs/eye-dns-traffic.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-endpoint-attacks': {
            id: 'eye-endpoint-attacks',
            title: 'Endpoint Attacks',
            description: 'Endpoint Attacks — applet content for eye house',
            house: 'eye',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['endpoint', 'attacks', 'monitoring', 'analysis'],
            paths: ['security-operations'],
            components: {
                applet: 'houses/eye/applets/cyberops/eye-endpoint-attacks.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-evaluation-week1': {
            id: 'eye-evaluation-week1',
            title: 'Week 1 Evaluation',
            description: 'CyberOps Week 1 Evaluation',
            house: 'eye',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['week', 'evaluation', 'monitoring', 'analysis'],
            paths: ['security-operations'],
            components: {
                applet: 'houses/eye/applets/cyberops/week1/eye-evaluation.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-evaluation-week2': {
            id: 'eye-evaluation-week2',
            title: 'Week 2 Evaluation',
            description: 'CyberOps Week 2 Evaluation',
            house: 'eye',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['week', 'evaluation', 'monitoring', 'analysis'],
            paths: ['security-operations'],
            components: {
                applet: 'houses/eye/applets/cyberops/week2/eye-evaluation.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-evaluation-week3': {
            id: 'eye-evaluation-week3',
            title: 'Week 3 Evaluation',
            description: 'CyberOps Week 3 Evaluation',
            house: 'eye',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['week', 'evaluation', 'monitoring', 'analysis'],
            paths: ['security-operations'],
            components: {
                applet: 'houses/eye/applets/cyberops/week3/eye-evaluation.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-evaluation-week4': {
            id: 'eye-evaluation-week4',
            title: 'Week 4 Evaluation',
            description: 'CyberOps Week 4 Evaluation',
            house: 'eye',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['week', 'evaluation', 'monitoring', 'analysis'],
            paths: ['security-operations'],
            components: {
                applet: 'houses/eye/applets/cyberops/week4/eye-evaluation.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-evaluation-week5': {
            id: 'eye-evaluation-week5',
            title: 'Week 5 Evaluation',
            description: 'CyberOps Week 5 Evaluation',
            house: 'eye',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['week', 'evaluation', 'monitoring', 'analysis'],
            paths: ['security-operations'],
            components: {
                applet: 'houses/eye/applets/cyberops/week5/eye-evaluation.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-evaluation-week6': {
            id: 'eye-evaluation-week6',
            title: 'Week 6 Evaluation',
            description: 'CyberOps Week 6 Evaluation',
            house: 'eye',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['week', 'evaluation', 'monitoring', 'analysis'],
            paths: ['security-operations'],
            components: {
                applet: 'houses/eye/applets/cyberops/week6/eye-evaluation.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-evaluation-week7': {
            id: 'eye-evaluation-week7',
            title: 'Week 7 Evaluation',
            description: 'CyberOps Week 7 Evaluation',
            house: 'eye',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['week', 'evaluation', 'monitoring', 'analysis'],
            paths: ['security-operations'],
            components: {
                applet: 'houses/eye/applets/cyberops/week7/eye-evaluation.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-evasion-obfuscation': {
            id: 'eye-evasion-obfuscation',
            title: 'Evasion & Obfuscation',
            description: 'Evasion & Obfuscation — applet content for eye house',
            house: 'eye',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['evasion', 'obfuscation', 'monitoring', 'analysis'],
            paths: ['security-operations'],
            components: {
                applet: 'houses/eye/applets/cyberops/eye-evasion-obfuscation.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-evidence-types': {
            id: 'eye-evidence-types',
            title: 'Types of Evidence',
            description: 'Types of Evidence — applet content for eye house',
            house: 'eye',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['types', 'evidence', 'monitoring', 'analysis'],
            paths: ['security-operations'],
            components: {
                applet: 'houses/eye/applets/cyberops/eye-evidence-types.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-exploring-nmap': {
            id: 'eye-exploring-nmap',
            title: 'Interactive Nmap Lab',
            description: 'Interactive Nmap Lab — lab content for eye house',
            house: 'eye',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['interactive', 'nmap', 'monitoring', 'analysis'],
            paths: ['security-operations'],
            components: {
                lab: 'houses/eye/applets/cyberops/week3/labs/eye-exploring-nmap.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-firewall-data': {
            id: 'eye-firewall-data',
            title: 'Firewall Log Analysis',
            description: 'Firewall Log Analysis — applet content for eye house',
            house: 'eye',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['firewall', 'log', 'analysis', 'monitoring'],
            paths: ['security-operations'],
            components: {
                applet: 'houses/eye/applets/cyberops/eye-firewall-data.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-firewall-operations': {
            id: 'eye-firewall-operations',
            title: '4.2 Compare Firewall Operations',
            description: '4.2 Compare Firewall Operations — applet content for eye house',
            house: 'eye',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['compare', 'firewall', 'operations', 'monitoring', 'analysis'],
            paths: ['security-operations'],
            components: {
                applet: 'houses/eye/applets/cyberops/eye-firewall-operations.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-forensic-elements': {
            id: 'eye-forensic-elements',
            title: '5.7 Forensic Evidence Elements',
            description: '5.7 Forensic Evidence Elements — applet content for eye house',
            house: 'eye',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['forensic', 'evidence', 'elements', 'monitoring', 'analysis'],
            paths: ['security-operations'],
            components: {
                applet: 'houses/eye/applets/cyberops/eye-forensic-elements.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-google-dorking': {
            id: 'eye-google-dorking',
            title: 'Google Dork Syntax for Finding Recipe PDFs',
            description: 'Google Dork Syntax for Finding Recipe PDFs — applet content for eye house',
            house: 'eye',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['google', 'dork', 'syntax', 'monitoring', 'analysis'],
            paths: ['security-operations'],
            components: {
                applet: 'houses/eye/applets/osint/eye-google-dorking.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-hashing-openssl': {
            id: 'eye-hashing-openssl',
            title: 'Hashing with OpenSSL',
            description: 'Hashing with OpenSSL — lab content for eye house',
            house: 'eye',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['hashing', 'openssl', 'monitoring', 'analysis'],
            paths: ['security-operations'],
            components: {
                lab: 'houses/eye/applets/cyberops/week6/labs/eye-hashing-openssl.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-incident-handling': {
            id: 'eye-incident-handling',
            title: 'Eye House - Full Incident Response Simulation',
            description: 'Eye House - Full Incident Response Simulation — lab content for eye house',
            house: 'eye',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['eye', 'full', 'incident', 'monitoring', 'analysis'],
            paths: ['security-operations'],
            components: {
                lab: 'houses/eye/applets/cyberops/week7/labs/eye-incident-handling.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-intrusion-elements': {
            id: 'eye-intrusion-elements',
            title: '4.5 Identify Intrusion Elements',
            description: '4.5 Identify Intrusion Elements — applet content for eye house',
            house: 'eye',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['identify', 'intrusion', 'elements', 'monitoring', 'analysis'],
            paths: ['security-operations'],
            components: {
                applet: 'houses/eye/applets/cyberops/eye-intrusion-elements.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-intrusion-events': {
            id: 'eye-intrusion-events',
            title: '4.0 Categorize Intrusion Events',
            description: '4.0 Categorize Intrusion Events — applet content for eye house',
            house: 'eye',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['categorize', 'intrusion', 'events', 'monitoring', 'analysis'],
            paths: ['security-operations'],
            components: {
                applet: 'houses/eye/applets/cyberops/eye-intrusion-events.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-irp-elements': {
            id: 'eye-irp-elements',
            title: '5.8 Elements of an IRP',
            description: '5.8 Elements of an IRP — applet content for eye house',
            house: 'eye',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['elements', 'irp', 'monitoring', 'analysis'],
            paths: ['security-operations'],
            components: {
                applet: 'houses/eye/applets/cyberops/eye-irp-elements.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-lab-1-0-6-top-hacker': {
            id: 'eye-lab-1-0-6-top-hacker',
            title: 'Lab 1.0.6: Top Hacker Shows Us How It\'s Done',
            description: 'Lab 1.0.6: Top Hacker Shows Us How It\'s Done — lab content for eye house',
            house: 'eye',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['106', 'top', 'hacker', 'monitoring', 'analysis'],
            paths: ['security-operations'],
            components: {
                lab: 'houses/eye/applets/cyberops/labs/eye-lab-1-0-6-top-hacker.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-lab-1-2-3-attack-details': {
            id: 'eye-lab-1-2-3-attack-details',
            title: 'Lab 1.2.3: Learning the Details of Attacks',
            description: 'Lab 1.2.3: Learning the Details of Attacks — lab content for eye house',
            house: 'eye',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['123', 'learning', 'details', 'monitoring', 'analysis'],
            paths: ['security-operations'],
            components: {
                lab: 'houses/eye/applets/cyberops/labs/eye-lab-1-2-3-attack-details.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-lab-2-2-5-becoming-defender': {
            id: 'eye-lab-2-2-5-becoming-defender',
            title: 'Lab 2.2.5: Becoming a Defender',
            description: 'Lab 2.2.5: Becoming a Defender — lab content for eye house',
            house: 'eye',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['225', 'becoming', 'defender', 'monitoring', 'analysis'],
            paths: ['security-operations'],
            components: {
                lab: 'houses/eye/applets/cyberops/labs/eye-lab-2-2-5-becoming-defender.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-lab-3-0-3-running-processes': {
            id: 'eye-lab-3-0-3-running-processes',
            title: 'Lab 3.0.3: Identify Running Processes',
            description: 'Lab 3.0.3: Identify Running Processes — lab content for eye house',
            house: 'eye',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['303', 'identify', 'running', 'monitoring', 'analysis'],
            paths: ['security-operations'],
            components: {
                lab: 'houses/eye/applets/cyberops/labs/eye-lab-3-0-3-running-processes.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-lab-3-2-11-windows-internals': {
            id: 'eye-lab-3-2-11-windows-internals',
            title: 'Lab 3.2.11: Processes, Threads, Handles & Registry',
            description: 'Lab 3.2.11: Processes, Threads, Handles & Registry — lab content for eye house',
            house: 'eye',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['3211', 'processes', 'threads', 'monitoring', 'analysis'],
            paths: ['security-operations'],
            components: {
                lab: 'houses/eye/applets/cyberops/labs/eye-lab-3-2-11-windows-internals.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-lab-3-3-10-user-accounts': {
            id: 'eye-lab-3-3-10-user-accounts',
            title: 'Lab 3.3.10: Create User Accounts',
            description: 'Lab 3.3.10: Create User Accounts — lab content for eye house',
            house: 'eye',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['3310', 'create', 'user', 'monitoring', 'analysis'],
            paths: ['security-operations'],
            components: {
                lab: 'houses/eye/applets/cyberops/labs/eye-lab-3-3-10-user-accounts.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-linux-servers': {
            id: 'eye-linux-servers',
            title: 'Linux Servers',
            description: 'Linux Servers — lab content for eye house',
            house: 'eye',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['linux', 'servers', 'monitoring', 'analysis'],
            paths: ['security-operations'],
            components: {
                lab: 'houses/eye/applets/cyberops/week2/labs/eye-linux-servers.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-log-centipede': {
            id: 'eye-log-centipede',
            title: 'Log Centipede',
            description: 'Log Centipede — applet content for eye house',
            house: 'eye',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['log', 'centipede', 'monitoring', 'analysis'],
            paths: ['security-operations'],
            components: {
                applet: 'houses/eye/games/eye-log-centipede.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-log-detective': {
            id: 'eye-log-detective',
            title: 'Log Detective',
            description: 'Log Detective — lab content for eye house',
            house: 'eye',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['log', 'detective', 'monitoring', 'analysis'],
            paths: ['security-operations'],
            components: {
                lab: 'houses/eye/labs/eye-log-detective.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-logging-network-activity': {
            id: 'eye-logging-network-activity',
            title: 'Lab 5.2: Logging Network Activity',
            description: 'Lab 5.2: Logging Network Activity — lab content for eye house',
            house: 'eye',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['logging', 'network', 'activity', 'monitoring', 'analysis'],
            paths: ['security-operations'],
            components: {
                lab: 'houses/eye/applets/cyberops/week5/labs/eye-logging-network-activity.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-malware-analysis-output': {
            id: 'eye-malware-analysis-output',
            title: 'Malware Analysis Tool Output',
            description: 'Malware Analysis Tool Output — applet content for eye house',
            house: 'eye',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['malware', 'analysis', 'output', 'monitoring'],
            paths: ['security-operations'],
            components: {
                applet: 'houses/eye/applets/cyberops/eye-malware-analysis-output.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-memory-forensics': {
            id: 'eye-memory-forensics',
            title: 'Lab 6: Memory Forensics',
            description: 'Lab 6: Memory Forensics — module content for eye house',
            house: 'eye',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['memory', 'forensics', 'monitoring', 'analysis'],
            paths: ['security-operations'],
            components: {
                lab: 'houses/eye/applets/cyberops/week7/labs/eye-memory-forensics.lab.html',
                applet: 'houses/eye/games/eye-memory-forensics.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-mysql-attack': {
            id: 'eye-mysql-attack',
            title: 'Lab 5.4: Attacking MySQL Database',
            description: 'Lab 5.4: Attacking MySQL Database — lab content for eye house',
            house: 'eye',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['attacking', 'mysql', 'database', 'monitoring', 'analysis'],
            paths: ['security-operations'],
            components: {
                lab: 'houses/eye/applets/cyberops/week5/labs/eye-mysql-attack.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-network-attacks': {
            id: 'eye-network-attacks',
            title: 'Network Attacks & Detection',
            description: 'Network Attacks & Detection — applet content for eye house',
            house: 'eye',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['network', 'attacks', 'detection', 'monitoring', 'analysis'],
            paths: ['security-operations'],
            components: {
                applet: 'houses/eye/applets/cyberops/eye-network-attacks.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-network-forensics': {
            id: 'eye-network-forensics',
            title: 'Lab 7: Network Forensics',
            description: 'Lab 7: Network Forensics — lab content for eye house',
            house: 'eye',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['network', 'forensics', 'monitoring', 'analysis'],
            paths: ['security-operations'],
            components: {
                lab: 'houses/eye/applets/cyberops/week7/labs/eye-network-forensics.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-network-profiling': {
            id: 'eye-network-profiling',
            title: '5.5 Network & Server Profiling',
            description: '5.5 Network & Server Profiling — applet content for eye house',
            house: 'eye',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['network', 'server', 'profiling', 'monitoring', 'analysis'],
            paths: ['security-operations'],
            components: {
                applet: 'houses/eye/applets/cyberops/eye-network-profiling.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-nist-800-86': {
            id: 'eye-nist-800-86',
            title: '5.1 NIST SP 800-86 Concepts',
            description: '5.1 NIST SP 800-86 Concepts — applet content for eye house',
            house: 'eye',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['nist', '800-86', 'concepts', 'monitoring', 'analysis'],
            paths: ['security-operations'],
            components: {
                applet: 'houses/eye/applets/cyberops/eye-nist-800-86.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-nsm-data-types': {
            id: 'eye-nsm-data-types',
            title: 'NSM Data Types',
            description: 'NSM Data Types — applet content for eye house',
            house: 'eye',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['nsm', 'data', 'types', 'monitoring', 'analysis'],
            paths: ['security-operations'],
            components: {
                applet: 'houses/eye/applets/cyberops/eye-nsm-data-types.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-packet-flow': {
            id: 'eye-packet-flow',
            title: 'Lab 4.4: Packet Flow Visualization',
            description: 'Lab 4.4: Packet Flow Visualization — lab content for eye house',
            house: 'eye',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['packet', 'flow', 'visualization', 'monitoring', 'analysis'],
            paths: ['security-operations'],
            components: {
                lab: 'houses/eye/applets/cyberops/week4/labs/eye-packet-flow.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-pcap-forensics': {
            id: 'eye-pcap-forensics',
            title: 'Eye House - PCAP Forensics Investigation Lab',
            description: 'Eye House - PCAP Forensics Investigation Lab — lab content for eye house',
            house: 'eye',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['eye', 'pcap', 'forensics', 'monitoring', 'analysis'],
            paths: ['security-operations'],
            components: {
                lab: 'houses/eye/applets/cyberops/week7/labs/eye-pcap-forensics.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-protected-data': {
            id: 'eye-protected-data',
            title: '5.4 Protected Data',
            description: '5.4 Protected Data — applet content for eye house',
            house: 'eye',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['protected', 'data', 'monitoring', 'analysis'],
            paths: ['security-operations'],
            components: {
                applet: 'houses/eye/applets/cyberops/eye-protected-data.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-regular-expressions': {
            id: 'eye-regular-expressions',
            title: '4.7 Basic Regular Expressions',
            description: '4.7 Basic Regular Expressions — applet content for eye house',
            house: 'eye',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['regular', 'expressions', 'monitoring', 'analysis'],
            paths: ['security-operations'],
            components: {
                applet: 'houses/eye/applets/cyberops/eye-regular-expressions.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-risk-rating': {
            id: 'eye-risk-rating',
            title: 'Risk Rating',
            description: 'Risk Rating — applet content for eye house',
            house: 'eye',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['risk', 'rating', 'monitoring', 'analysis'],
            paths: ['security-operations'],
            components: {
                applet: 'houses/eye/applets/cyberops/eye-risk-rating.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-risk-register': {
            id: 'eye-risk-register',
            title: 'Risk Register',
            description: 'Risk Register — applet content for eye house',
            house: 'eye',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['risk', 'register', 'monitoring', 'analysis'],
            paths: ['security-operations'],
            components: {
                applet: 'houses/eye/applets/cyberops/eye-risk-register.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-security-approaches': {
            id: 'eye-security-approaches',
            title: 'Security Approaches',
            description: 'Security Approaches — applet content for eye house',
            house: 'eye',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['security', 'approaches', 'monitoring', 'analysis'],
            paths: ['security-operations'],
            components: {
                applet: 'houses/eye/applets/cyberops/eye-security-approaches.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-security-policy': {
            id: 'eye-security-policy',
            title: '5.2 Security Policy Management',
            description: '5.2 Security Policy Management — applet content for eye house',
            house: 'eye',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['security', 'policy', 'management', 'monitoring', 'analysis'],
            paths: ['security-operations'],
            components: {
                applet: 'houses/eye/applets/cyberops/eye-security-policy.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-server-logs': {
            id: 'eye-server-logs',
            title: 'Lab 5.5: Reading Server Logs',
            description: 'Lab 5.5: Reading Server Logs — lab content for eye house',
            house: 'eye',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['reading', 'server', 'logs', 'monitoring', 'analysis'],
            paths: ['security-operations'],
            components: {
                lab: 'houses/eye/applets/cyberops/week5/labs/eye-server-logs.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-siem-overview': {
            id: 'eye-siem-overview',
            title: 'SIEM Overview',
            description: 'SIEM Overview — applet content for eye house',
            house: 'eye',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['siem', 'overview', 'monitoring', 'analysis'],
            paths: ['security-operations'],
            components: {
                applet: 'houses/eye/applets/cyberops/eye-siem-overview.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-snort-rules': {
            id: 'eye-snort-rules',
            title: 'Eye House - Snort IDS Rule Writing Lab',
            description: 'Eye House - Snort IDS Rule Writing Lab — lab content for eye house',
            house: 'eye',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['eye', 'snort', 'ids', 'monitoring', 'analysis'],
            paths: ['security-operations'],
            components: {
                lab: 'houses/eye/applets/cyberops/week7/labs/eye-snort-rules.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-soc-metrics': {
            id: 'eye-soc-metrics',
            title: '5.3 SOC Metrics & Scope',
            description: '5.3 SOC Metrics & Scope — applet content for eye house',
            house: 'eye',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['soc', 'metrics', 'scope', 'monitoring', 'analysis'],
            paths: ['security-operations'],
            components: {
                applet: 'houses/eye/applets/cyberops/eye-soc-metrics.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-soc-overview': {
            id: 'eye-soc-overview',
            title: 'SOC Overview',
            description: 'SOC Overview — applet content for eye house',
            house: 'eye',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['soc', 'overview', 'monitoring', 'analysis'],
            paths: ['security-operations'],
            components: {
                applet: 'houses/eye/applets/cyberops/eye-soc-overview.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-soc-triage': {
            id: 'eye-soc-triage',
            title: 'SOC Alert Triage Simulator',
            description: 'SOC Alert Triage Simulator — lab content for eye house',
            house: 'eye',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['soc', 'alert', 'triage', 'monitoring', 'analysis'],
            paths: ['security-operations'],
            components: {
                lab: 'houses/eye/applets/cyberops/week5/labs/eye-soc-triage.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-source-technologies': {
            id: 'eye-source-technologies',
            title: '4.1 Source Technologies & Events',
            description: '4.1 Source Technologies & Events — applet content for eye house',
            house: 'eye',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['source', 'technologies', 'events', 'monitoring', 'analysis'],
            paths: ['security-operations'],
            components: {
                applet: 'houses/eye/applets/cyberops/eye-source-technologies.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-symmetric-encryption': {
            id: 'eye-symmetric-encryption',
            title: 'Symmetric Encryption',
            description: 'Symmetric Encryption — lab content for eye house',
            house: 'eye',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['symmetric', 'encryption', 'monitoring', 'analysis'],
            paths: ['security-operations'],
            components: {
                lab: 'houses/eye/applets/cyberops/week6/labs/eye-symmetric-encryption.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-tcp-stream-extraction': {
            id: 'eye-tcp-stream-extraction',
            title: '4.4 Extract Files from TCP Stream',
            description: '4.4 Extract Files from TCP Stream — applet content for eye house',
            house: 'eye',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['extract', 'files', 'from', 'monitoring', 'analysis'],
            paths: ['security-operations'],
            components: {
                applet: 'houses/eye/applets/cyberops/eye-tcp-stream-extraction.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-tcpdump-netflow': {
            id: 'eye-tcpdump-netflow',
            title: 'tcpdump & NetFlow',
            description: 'tcpdump & NetFlow — applet content for eye house',
            house: 'eye',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['tcpdump', 'netflow', 'monitoring', 'analysis'],
            paths: ['security-operations'],
            components: {
                applet: 'houses/eye/applets/cyberops/eye-tcpdump-netflow.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-threat-actor-profiling': {
            id: 'eye-threat-actor-profiling',
            title: 'Eye House - Threat Actor Profiling Lab',
            description: 'Eye House - Threat Actor Profiling Lab — lab content for eye house',
            house: 'eye',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['eye', 'threat', 'actor', 'monitoring', 'analysis'],
            paths: ['security-operations'],
            components: {
                lab: 'houses/eye/applets/cyberops/week7/labs/eye-threat-actor-profiling.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-tls-ssl-analysis': {
            id: 'eye-tls-ssl-analysis',
            title: 'Lab 6: TLS/SSL Analysis',
            description: 'Lab 6: TLS/SSL Analysis — lab content for eye house',
            house: 'eye',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['tlsssl', 'analysis', 'monitoring'],
            paths: ['security-operations'],
            components: {
                lab: 'houses/eye/applets/cyberops/week6/labs/eye-tls-ssl-analysis.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-tracing-route': {
            id: 'eye-tracing-route',
            title: 'Interactive Traceroute Lab',
            description: 'Interactive Traceroute Lab — lab content for eye house',
            house: 'eye',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['interactive', 'traceroute', 'monitoring', 'analysis'],
            paths: ['security-operations'],
            components: {
                lab: 'houses/eye/applets/cyberops/week3/labs/eye-tracing-route.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-traffic-analysis': {
            id: 'eye-traffic-analysis',
            title: '4.3 Traffic Analysis Techniques',
            description: '4.3 Traffic Analysis Techniques — applet content for eye house',
            house: 'eye',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['traffic', 'analysis', 'techniques', 'monitoring'],
            paths: ['security-operations'],
            components: {
                applet: 'houses/eye/applets/cyberops/eye-traffic-analysis.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-verify-ipv4-ipv6': {
            id: 'eye-verify-ipv4-ipv6',
            title: 'Verify IPv4 and IPv6 Addressing',
            description: 'Verify IPv4 and IPv6 Addressing — lab content for eye house',
            house: 'eye',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['verify', 'ipv4', 'ipv6', 'monitoring', 'analysis'],
            paths: ['security-operations'],
            components: {
                lab: 'houses/eye/applets/cyberops/week3/labs/eye-verify-ipv4-ipv6.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-vpn-fundamentals': {
            id: 'eye-vpn-fundamentals',
            title: 'Lab 7: VPN Fundamentals',
            description: 'Lab 7: VPN Fundamentals — lab content for eye house',
            house: 'eye',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['vpn', 'monitoring', 'analysis'],
            paths: ['security-operations'],
            components: {
                lab: 'houses/eye/applets/cyberops/week6/labs/eye-vpn-fundamentals.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-web-attacks': {
            id: 'eye-web-attacks',
            title: 'Web Application Attacks',
            description: 'Web Application Attacks — applet content for eye house',
            house: 'eye',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['web', 'application', 'attacks', 'monitoring', 'analysis'],
            paths: ['security-operations'],
            components: {
                applet: 'houses/eye/applets/cyberops/eye-web-attacks.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-whats-going-on': {
            id: 'eye-whats-going-on',
            title: 'Lab 5.1: What\'s Going On?',
            description: 'Lab 5.1: What\'s Going On? — lab content for eye house',
            house: 'eye',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['whats', 'going', 'monitoring', 'analysis'],
            paths: ['security-operations'],
            components: {
                lab: 'houses/eye/applets/cyberops/week5/labs/eye-whats-going-on.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-windows-system-resources': {
            id: 'eye-windows-system-resources',
            title: 'Windows System Resources',
            description: 'Windows System Resources — lab content for eye house',
            house: 'eye',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['windows', 'system', 'resources', 'monitoring', 'analysis'],
            paths: ['security-operations'],
            components: {
                lab: 'houses/eye/applets/cyberops/week2/labs/eye-windows-system-resources.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-windows-task-manager': {
            id: 'eye-windows-task-manager',
            title: 'Windows Task Manager',
            description: 'Windows Task Manager — lab content for eye house',
            house: 'eye',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['windows', 'task', 'manager', 'monitoring', 'analysis'],
            paths: ['security-operations'],
            components: {
                lab: 'houses/eye/applets/cyberops/week2/labs/eye-windows-task-manager.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-wireshark-crypto': {
            id: 'eye-wireshark-crypto',
            title: 'Lab 8: Wireshark Crypto Analysis',
            description: 'Lab 8: Wireshark Crypto Analysis — lab content for eye house',
            house: 'eye',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['wireshark', 'crypto', 'analysis', 'monitoring'],
            paths: ['security-operations'],
            components: {
                lab: 'houses/eye/applets/cyberops/week6/labs/eye-wireshark-crypto.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-wireshark-ethernet': {
            id: 'eye-wireshark-ethernet',
            title: 'Wireshark Ethernet Frames',
            description: 'Wireshark Ethernet Frames — lab content for eye house',
            house: 'eye',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['wireshark', 'ethernet', 'frames', 'monitoring', 'analysis'],
            paths: ['security-operations'],
            components: {
                lab: 'houses/eye/applets/cyberops/week3/labs/eye-wireshark-ethernet.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-wireshark-http-https': {
            id: 'eye-wireshark-http-https',
            title: 'Lab 4.3: Wireshark HTTP/HTTPS',
            description: 'Lab 4.3: Wireshark HTTP/HTTPS — lab content for eye house',
            house: 'eye',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['wireshark', 'httphttps', 'monitoring', 'analysis'],
            paths: ['security-operations'],
            components: {
                lab: 'houses/eye/applets/cyberops/week4/labs/eye-wireshark-http-https.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-wireshark-intro': {
            id: 'eye-wireshark-intro',
            title: 'Introduction to Wireshark',
            description: 'Introduction to Wireshark — lab content for eye house',
            house: 'eye',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['wireshark', 'monitoring', 'analysis'],
            paths: ['security-operations'],
            components: {
                lab: 'houses/eye/applets/cyberops/week3/labs/eye-wireshark-intro.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-wireshark-tcp-handshake': {
            id: 'eye-wireshark-tcp-handshake',
            title: 'Wireshark TCP 3-Way Handshake',
            description: 'Wireshark TCP 3-Way Handshake — lab content for eye house',
            house: 'eye',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['wireshark', 'tcp', '3-way', 'monitoring', 'analysis'],
            paths: ['security-operations'],
            components: {
                lab: 'houses/eye/applets/cyberops/week3/labs/eye-wireshark-tcp-handshake.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-wireshark-tcp-udp': {
            id: 'eye-wireshark-tcp-udp',
            title: 'Lab 4.2: Wireshark TCP/UDP',
            description: 'Lab 4.2: Wireshark TCP/UDP — lab content for eye house',
            house: 'eye',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['wireshark', 'tcpudp', 'monitoring', 'analysis'],
            paths: ['security-operations'],
            components: {
                lab: 'houses/eye/applets/cyberops/week4/labs/eye-wireshark-tcp-udp.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-wireshark-udp-dns': {
            id: 'eye-wireshark-udp-dns',
            title: 'Lab 4.1: Wireshark UDP/DNS',
            description: 'Lab 4.1: Wireshark UDP/DNS — lab content for eye house',
            house: 'eye',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['wireshark', 'udpdns', 'monitoring', 'analysis'],
            paths: ['security-operations'],
            components: {
                lab: 'houses/eye/applets/cyberops/week4/labs/eye-wireshark-udp-dns.lab.html'
            },
            prerequisites: [],
            objectives: []
        },

        // ─── KEY HOUSE (auto-generated) ───
        'key-cipher-bubbles': {
            id: 'key-cipher-bubbles',
            title: 'Cipher Bubbles',
            description: 'Cipher Bubbles — applet content for key house',
            house: 'key',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['cipher', 'bubbles', 'cryptography', 'encryption'],
            paths: ['cryptography-track'],
            components: {
                applet: 'houses/key/games/key-cipher-bubbles.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'key-cipher-cracker': {
            id: 'key-cipher-cracker',
            title: 'Cipher Cracker',
            description: 'Cipher Cracker — presentation content for key house',
            house: 'key',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 20,
            topics: ['cipher', 'cracker', 'cryptography', 'encryption'],
            paths: ['cryptography-track'],
            components: {
                presentation: 'houses/key/games/key-cipher-cracker.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'key-crypto-pong': {
            id: 'key-crypto-pong',
            title: 'Crypto Pong',
            description: 'Crypto Pong — applet content for key house',
            house: 'key',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['crypto', 'pong', 'cryptography', 'encryption'],
            paths: ['cryptography-track'],
            components: {
                applet: 'houses/key/games/key-crypto-pong.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'key-firewall-builder': {
            id: 'key-firewall-builder',
            title: 'Firewall Builder',
            description: 'Firewall Builder — lab content for key house',
            house: 'key',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['firewall', 'builder', 'cryptography', 'encryption'],
            paths: ['cryptography-track'],
            components: {
                lab: 'houses/key/labs/key-firewall-builder.lab.html'
            },
            prerequisites: [],
            objectives: []
        },

        'key-encryption-ascii-binary': {
            id: 'key-encryption-ascii-binary',
            title: 'Encryption Lab: ASCII, Binary & Hex',
            description: 'Interactive ASCII, Binary, and Hex conversion with XOR encryption',
            house: 'key',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['encryption', 'ascii', 'binary', 'hex', 'xor'],
            paths: ['cryptography-track'],
            components: {
                lab: 'houses/key/labs/key-encryption-ascii-binary.lab.html'
            },
            prerequisites: [],
            objectives: [
                'Convert between ASCII, Binary, and Hex representations',
                'Understand XOR encryption fundamentals',
                'Analyze hex key tables and character encoding'
            ]
        },
        'key-encryption-dh-rsa': {
            id: 'key-encryption-dh-rsa',
            title: 'Encryption Lab: Diffie-Hellman & RSA',
            description: 'Hands-on Diffie-Hellman key exchange and RSA encryption/decryption',
            house: 'key',
            type: 'lab',
            difficulty: 'intermediate',
            duration: 45,
            topics: ['encryption', 'diffie-hellman', 'rsa', 'asymmetric', 'key-exchange'],
            paths: ['cryptography-track'],
            components: {
                lab: 'houses/key/labs/key-encryption-dh-rsa.lab.html'
            },
            prerequisites: ['key-encryption-ascii-binary'],
            objectives: [
                'Simulate Diffie-Hellman key exchange',
                'Encrypt and decrypt messages using RSA',
                'Understand public/private key relationships'
            ]
        },
        'key-hashing-algorithms': {
            id: 'key-hashing-algorithms',
            title: 'Hashing Algorithms Lab: MD5 to SHA-512',
            description: 'Interactive hashing lab covering MD5, SHA-1, SHA-256, SHA-384, and SHA-512',
            house: 'key',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['hashing', 'md5', 'sha', 'integrity', 'cryptography'],
            paths: ['cryptography-track'],
            components: {
                lab: 'houses/key/labs/key-hashing-algorithms.lab.html'
            },
            prerequisites: [],
            objectives: [
                'Generate and compare hashes using multiple algorithms',
                'Understand the avalanche effect in hashing',
                'Identify hash types from their output format'
            ]
        },

        // ─── CODE HOUSE (auto-generated) ───
        'code-build-breaker': {
            id: 'code-build-breaker',
            title: 'Build Breaker',
            description: 'Build Breaker — applet content for code house',
            house: 'code',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['build', 'breaker', 'development', 'devops'],
            paths: ['devops-fundamentals'],
            components: {
                applet: 'houses/code/games/code-build-breaker.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'code-kill-nine': {
            id: 'code-kill-nine',
            title: 'kill -9 v1.0 - The AI Uprising',
            description: 'kill -9 v1.0 - The AI Uprising — applet content for code house',
            house: 'code',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['kill', 'v10', 'uprising', 'development', 'devops'],
            paths: ['devops-fundamentals'],
            components: {
                applet: 'houses/code/games/code-kill-nine.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'code-kubernetes-rescue': {
            id: 'code-kubernetes-rescue',
            title: 'Kubernetes Rescue',
            description: 'Kubernetes Rescue — applet content for code house',
            house: 'code',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['kubernetes', 'rescue', 'development', 'devops'],
            paths: ['devops-fundamentals'],
            components: {
                applet: 'houses/code/games/code-kubernetes-rescue.applet.html'
            },
            prerequisites: [],
            objectives: []
        },

// ═══════════════════════════════════════════════════════════════
        // AUTO-GENERATED ENTRIES (registry-generator.js)
        // Generated: 2026-02-21
        // ═══════════════════════════════════════════════════════════════

        // ─── FORGE HOUSE (auto-generated) ───
        'forge-aplus-core2': {
            id: 'forge-aplus-core2',
            title: 'CompTIA A+ Certification Quiz – Chapters 19–22',
            description: 'CompTIA A+ Certification Quiz – Chapters 19–22 — module content for forge house',
            house: 'forge',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['comptia', 'certification', 'chapters', 'hardware', 'systems'],
            paths: ['aplus-core2'],
            components: {
                quiz: 'houses/forge/applets/comptia-aplus/core-2/quizzes/forge-aplus-core2.quiz.html',
                'aplus-core2': 'houses/forge/quizzes/forge-aplus-core2.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-aplus-core2-ch19-22': {
            id: 'forge-aplus-core2-ch19-22',
            title: 'A+ Core 2: Chapters 19-22',
            description: 'A+ Core 2: Chapters 19-22 — module content for forge house',
            house: 'forge',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['core', 'chapters', '19-22', 'hardware', 'systems'],
            paths: ['aplus-core2'],
            components: {
                quiz: 'houses/forge/applets/comptia-aplus/core-2/quizzes/forge-aplus-core2-ch19-22.quiz.html',
                'aplus-core2-ch19-22': 'houses/forge/quizzes/forge-aplus-core2-ch19-22.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-lab-macos-linux': {
            id: 'forge-lab-macos-linux',
            title: 'macOS and Linux Fundamentals',
            description: 'macOS and Linux Fundamentals — module content for forge house',
            house: 'forge',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['macos', 'linux', 'hardware', 'systems'],
            paths: ['aplus-core2'],
            components: {
                lab: 'houses/forge/applets/comptia-aplus/core-2/labs/forge-lab-macos-linux.lab.html',
                'lab-macos-linux': 'houses/forge/labs/forge-lab-macos-linux.lab.html'
            },
            prerequisites: [],
            objectives: []
        },

        // ─── SHIELD HOUSE (auto-generated) ───
        'shield-crypto-aes': {
            id: 'shield-crypto-aes',
            title: 'AES',
            description: 'AES — module content for shield house',
            house: 'shield',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['aes', 'security', 'defense'],
            paths: ['security-plus'],
            components: {
                applet: 'houses/shield/applets/crypto/aes/shield-crypto-aes.applet.html',
                'crypto-aes': 'houses/shield/applets/crypto/shield-crypto-aes.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-crypto-block-ciphers': {
            id: 'shield-crypto-block-ciphers',
            title: 'Block Cipher Modes',
            description: 'Block Cipher Modes — module content for shield house',
            house: 'shield',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['block', 'cipher', 'modes', 'security', 'defense'],
            paths: ['security-plus'],
            components: {
                applet: 'houses/shield/applets/crypto/block_ciphers/shield-crypto-block-ciphers.applet.html',
                'crypto-block-ciphers': 'houses/shield/applets/crypto/shield-crypto-block-ciphers.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-crypto-caesar': {
            id: 'shield-crypto-caesar',
            title: 'Caesar Cipher',
            description: 'Caesar Cipher — module content for shield house',
            house: 'shield',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['caesar', 'cipher', 'security', 'defense'],
            paths: ['security-plus'],
            components: {
                applet: 'houses/shield/applets/crypto/caesar/shield-crypto-caesar.applet.html',
                'crypto-caesar': 'houses/shield/applets/crypto/shield-crypto-caesar.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-crypto-diffie-hellman': {
            id: 'shield-crypto-diffie-hellman',
            title: 'Diffie-Hellman Key Exchange',
            description: 'Diffie-Hellman Key Exchange — module content for shield house',
            house: 'shield',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['diffie-hellman', 'key', 'exchange', 'security', 'defense'],
            paths: ['security-plus'],
            components: {
                applet: 'houses/shield/applets/crypto/diffie_hellman/shield-crypto-diffie-hellman.applet.html',
                'crypto-diffie-hellman': 'houses/shield/applets/crypto/shield-crypto-diffie-hellman.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-crypto-digital-signatures': {
            id: 'shield-crypto-digital-signatures',
            title: 'Digital Signatures',
            description: 'Digital Signatures — module content for shield house',
            house: 'shield',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['digital', 'signatures', 'security', 'defense'],
            paths: ['security-plus'],
            components: {
                applet: 'houses/shield/applets/crypto/digital_signatures/shield-crypto-digital-signatures.applet.html',
                'crypto-digital-signatures': 'houses/shield/applets/crypto/shield-crypto-digital-signatures.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-crypto-hashing': {
            id: 'shield-crypto-hashing',
            title: 'Cryptographic Hashing',
            description: 'Cryptographic Hashing — module content for shield house',
            house: 'shield',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['cryptographic', 'hashing', 'security', 'defense'],
            paths: ['security-plus'],
            components: {
                applet: 'houses/shield/applets/crypto/hashing/shield-crypto-hashing.applet.html',
                'crypto-hashing': 'houses/shield/applets/crypto/shield-crypto-hashing.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-crypto-hmac': {
            id: 'shield-crypto-hmac',
            title: 'HMAC',
            description: 'HMAC — module content for shield house',
            house: 'shield',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['hmac', 'security', 'defense'],
            paths: ['security-plus'],
            components: {
                applet: 'houses/shield/applets/crypto/hmac/shield-crypto-hmac.applet.html',
                'crypto-hmac': 'houses/shield/applets/crypto/shield-crypto-hmac.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-crypto-key-exchange': {
            id: 'shield-crypto-key-exchange',
            title: 'Key Exchange Mechanisms',
            description: 'Key Exchange Mechanisms — module content for shield house',
            house: 'shield',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['key', 'exchange', 'mechanisms', 'security', 'defense'],
            paths: ['security-plus'],
            components: {
                applet: 'houses/shield/applets/crypto/key_exchange/shield-crypto-key-exchange.applet.html',
                'crypto-key-exchange': 'houses/shield/applets/crypto/shield-crypto-key-exchange.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-crypto-pki': {
            id: 'shield-crypto-pki',
            title: 'Public Key Infrastructure',
            description: 'Public Key Infrastructure — module content for shield house',
            house: 'shield',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['public', 'key', 'infrastructure', 'security', 'defense'],
            paths: ['security-plus'],
            components: {
                applet: 'houses/shield/applets/crypto/pki/shield-crypto-pki.applet.html',
                'crypto-pki': 'houses/shield/applets/crypto/shield-crypto-pki.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-crypto-rsa': {
            id: 'shield-crypto-rsa',
            title: 'RSA Algorithm',
            description: 'RSA Algorithm — module content for shield house',
            house: 'shield',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['rsa', 'algorithm', 'security', 'defense'],
            paths: ['security-plus'],
            components: {
                applet: 'houses/shield/applets/crypto/rsa/shield-crypto-rsa.applet.html',
                'crypto-rsa': 'houses/shield/applets/crypto/shield-crypto-rsa.applet.html'
            },
            prerequisites: [],
            objectives: []
        },

        // ─── CLOUD HOUSE (auto-generated) ───
        'cloud-wsa-m01-fundamentals': {
            id: 'cloud-wsa-m01-fundamentals',
            title: 'WSA M01 GUI Lab: Server Manager Configuration',
            description: 'WSA M01 GUI Lab: Server Manager Configuration — module content for cloud house',
            house: 'cloud',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['wsa', 'm01', 'gui', 'cloud', 'infrastructure'],
            paths: ['wsa'],
            components: {
                module: 'houses/cloud/modules/wsa/m01-fundamentals/cloud-guilab.module.html',
                presentation: 'houses/cloud/modules/wsa/m01-fundamentals/cloud-presentation.module.html',
                pslab: 'houses/cloud/modules/wsa/m01-fundamentals/cloud-pslab.module.html',
                quizquiz: 'houses/cloud/modules/wsa/m01-fundamentals/cloud-quizquiz.module.html'
            },
            prerequisites: [],
            objectives: []
        },
        'cloud-wsa-m02-active-directory': {
            id: 'cloud-wsa-m02-active-directory',
            title: 'WSA M02 GUI Lab: AD Users & Computers',
            description: 'WSA M02 GUI Lab: AD Users & Computers — module content for cloud house',
            house: 'cloud',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['wsa', 'm02', 'gui', 'cloud', 'infrastructure'],
            paths: ['wsa'],
            components: {
                module: 'houses/cloud/modules/wsa/m02-active-directory/cloud-guilab.module.html',
                presentation: 'houses/cloud/modules/wsa/m02-active-directory/cloud-presentation.module.html',
                pslab: 'houses/cloud/modules/wsa/m02-active-directory/cloud-pslab.module.html',
                quizquiz: 'houses/cloud/modules/wsa/m02-active-directory/cloud-quizquiz.module.html'
            },
            prerequisites: [],
            objectives: []
        },
        'cloud-wsa-m03-storage': {
            id: 'cloud-wsa-m03-storage',
            title: 'WSA M03 GUI Lab: Disk Management',
            description: 'WSA M03 GUI Lab: Disk Management — module content for cloud house',
            house: 'cloud',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['wsa', 'm03', 'gui', 'cloud', 'infrastructure'],
            paths: ['wsa'],
            components: {
                module: 'houses/cloud/modules/wsa/m03-storage/cloud-guilab.module.html',
                presentation: 'houses/cloud/modules/wsa/m03-storage/cloud-presentation.module.html',
                pslab: 'houses/cloud/modules/wsa/m03-storage/cloud-pslab.module.html',
                quizquiz: 'houses/cloud/modules/wsa/m03-storage/cloud-quizquiz.module.html'
            },
            prerequisites: [],
            objectives: []
        },
        'cloud-wsa-m04-hyperv': {
            id: 'cloud-wsa-m04-hyperv',
            title: 'WSA M04 GUI Lab: Hyper-V Manager',
            description: 'WSA M04 GUI Lab: Hyper-V Manager — module content for cloud house',
            house: 'cloud',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['wsa', 'm04', 'gui', 'cloud', 'infrastructure'],
            paths: ['wsa'],
            components: {
                module: 'houses/cloud/modules/wsa/m04-hyperv/cloud-guilab.module.html',
                presentation: 'houses/cloud/modules/wsa/m04-hyperv/cloud-presentation.module.html',
                pslab: 'houses/cloud/modules/wsa/m04-hyperv/cloud-pslab.module.html',
                quizquiz: 'houses/cloud/modules/wsa/m04-hyperv/cloud-quizquiz.module.html'
            },
            prerequisites: [],
            objectives: []
        },
        'cloud-wsa-m05-containers': {
            id: 'cloud-wsa-m05-containers',
            title: 'WSA M05 GUI Lab: Container Management',
            description: 'WSA M05 GUI Lab: Container Management — module content for cloud house',
            house: 'cloud',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['wsa', 'm05', 'gui', 'cloud', 'infrastructure'],
            paths: ['wsa'],
            components: {
                module: 'houses/cloud/modules/wsa/m05-containers/cloud-guilab.module.html',
                presentation: 'houses/cloud/modules/wsa/m05-containers/cloud-presentation.module.html',
                pslab: 'houses/cloud/modules/wsa/m05-containers/cloud-pslab.module.html',
                quizquiz: 'houses/cloud/modules/wsa/m05-containers/cloud-quizquiz.module.html'
            },
            prerequisites: [],
            objectives: []
        },
        'cloud-wsa-m06-clustering': {
            id: 'cloud-wsa-m06-clustering',
            title: 'WSA M06 GUI Lab: Failover Cluster Manager',
            description: 'WSA M06 GUI Lab: Failover Cluster Manager — module content for cloud house',
            house: 'cloud',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['wsa', 'm06', 'gui', 'cloud', 'infrastructure'],
            paths: ['wsa'],
            components: {
                module: 'houses/cloud/modules/wsa/m06-clustering/cloud-guilab.module.html',
                presentation: 'houses/cloud/modules/wsa/m06-clustering/cloud-presentation.module.html',
                pslab: 'houses/cloud/modules/wsa/m06-clustering/cloud-pslab.module.html',
                quizquiz: 'houses/cloud/modules/wsa/m06-clustering/cloud-quizquiz.module.html'
            },
            prerequisites: [],
            objectives: []
        },
        'cloud-wsa-m07-monitoring': {
            id: 'cloud-wsa-m07-monitoring',
            title: 'WSA M07 GUI Lab: Event Viewer & Performance Monitor',
            description: 'WSA M07 GUI Lab: Event Viewer & Performance Monitor — module content for cloud house',
            house: 'cloud',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['wsa', 'm07', 'gui', 'cloud', 'infrastructure'],
            paths: ['wsa'],
            components: {
                module: 'houses/cloud/modules/wsa/m07-monitoring/cloud-guilab.module.html',
                presentation: 'houses/cloud/modules/wsa/m07-monitoring/cloud-presentation.module.html',
                pslab: 'houses/cloud/modules/wsa/m07-monitoring/cloud-pslab.module.html',
                quizquiz: 'houses/cloud/modules/wsa/m07-monitoring/cloud-quizquiz.module.html'
            },
            prerequisites: [],
            objectives: []
        },
        'cloud-wsa-m08-dns': {
            id: 'cloud-wsa-m08-dns',
            title: 'WSA M08 GUI Lab: DNS Manager',
            description: 'WSA M08 GUI Lab: DNS Manager — module content for cloud house',
            house: 'cloud',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['wsa', 'm08', 'gui', 'cloud', 'infrastructure'],
            paths: ['wsa'],
            components: {
                module: 'houses/cloud/modules/wsa/m08-dns/cloud-guilab.module.html',
                presentation: 'houses/cloud/modules/wsa/m08-dns/cloud-presentation.module.html',
                pslab: 'houses/cloud/modules/wsa/m08-dns/cloud-pslab.module.html',
                quizquiz: 'houses/cloud/modules/wsa/m08-dns/cloud-quizquiz.module.html'
            },
            prerequisites: [],
            objectives: []
        },
        'cloud-wsa-m09-dhcp': {
            id: 'cloud-wsa-m09-dhcp',
            title: 'WSA M09 GUI Lab: DHCP Console',
            description: 'WSA M09 GUI Lab: DHCP Console — module content for cloud house',
            house: 'cloud',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['wsa', 'm09', 'gui', 'cloud', 'infrastructure'],
            paths: ['wsa'],
            components: {
                module: 'houses/cloud/modules/wsa/m09-dhcp/cloud-guilab.module.html',
                presentation: 'houses/cloud/modules/wsa/m09-dhcp/cloud-presentation.module.html',
                pslab: 'houses/cloud/modules/wsa/m09-dhcp/cloud-pslab.module.html',
                quizquiz: 'houses/cloud/modules/wsa/m09-dhcp/cloud-quizquiz.module.html'
            },
            prerequisites: [],
            objectives: []
        },
        'cloud-wsa-m10-group-policy': {
            id: 'cloud-wsa-m10-group-policy',
            title: 'WSA M10 GUI Lab: Group Policy Management',
            description: 'WSA M10 GUI Lab: Group Policy Management — module content for cloud house',
            house: 'cloud',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['wsa', 'm10', 'gui', 'cloud', 'infrastructure'],
            paths: ['wsa'],
            components: {
                module: 'houses/cloud/modules/wsa/m10-group-policy/cloud-guilab.module.html',
                presentation: 'houses/cloud/modules/wsa/m10-group-policy/cloud-presentation.module.html',
                pslab: 'houses/cloud/modules/wsa/m10-group-policy/cloud-pslab.module.html',
                quizquiz: 'houses/cloud/modules/wsa/m10-group-policy/cloud-quizquiz.module.html'
            },
            prerequisites: [],
            objectives: []
        },
        'cloud-wsa-m11-iis': {
            id: 'cloud-wsa-m11-iis',
            title: 'WSA M11 GUI Lab: IIS Manager',
            description: 'WSA M11 GUI Lab: IIS Manager — module content for cloud house',
            house: 'cloud',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['wsa', 'm11', 'gui', 'cloud', 'infrastructure'],
            paths: ['wsa'],
            components: {
                module: 'houses/cloud/modules/wsa/m11-iis/cloud-guilab.module.html',
                presentation: 'houses/cloud/modules/wsa/m11-iis/cloud-presentation.module.html',
                pslab: 'houses/cloud/modules/wsa/m11-iis/cloud-pslab.module.html',
                quizquiz: 'houses/cloud/modules/wsa/m11-iis/cloud-quizquiz.module.html'
            },
            prerequisites: [],
            objectives: []
        },
        'cloud-wsa-m12-remote-desktop': {
            id: 'cloud-wsa-m12-remote-desktop',
            title: 'WSA M12 GUI Lab: Remote Desktop Services',
            description: 'WSA M12 GUI Lab: Remote Desktop Services — module content for cloud house',
            house: 'cloud',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['wsa', 'm12', 'gui', 'cloud', 'infrastructure'],
            paths: ['wsa'],
            components: {
                module: 'houses/cloud/modules/wsa/m12-remote-desktop/cloud-guilab.module.html',
                presentation: 'houses/cloud/modules/wsa/m12-remote-desktop/cloud-presentation.module.html',
                pslab: 'houses/cloud/modules/wsa/m12-remote-desktop/cloud-pslab.module.html',
                quizquiz: 'houses/cloud/modules/wsa/m12-remote-desktop/cloud-quizquiz.module.html'
            },
            prerequisites: [],
            objectives: []
        },
        'cloud-wsa-m13-certificate-services': {
            id: 'cloud-wsa-m13-certificate-services',
            title: 'WSA M13 GUI Lab: Certificate Authority',
            description: 'WSA M13 GUI Lab: Certificate Authority — module content for cloud house',
            house: 'cloud',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['wsa', 'm13', 'gui', 'cloud', 'infrastructure'],
            paths: ['wsa'],
            components: {
                module: 'houses/cloud/modules/wsa/m13-certificate-services/cloud-guilab.module.html',
                presentation: 'houses/cloud/modules/wsa/m13-certificate-services/cloud-presentation.module.html',
                pslab: 'houses/cloud/modules/wsa/m13-certificate-services/cloud-pslab.module.html',
                quizquiz: 'houses/cloud/modules/wsa/m13-certificate-services/cloud-quizquiz.module.html'
            },
            prerequisites: [],
            objectives: []
        },
        'cloud-wsa-m14-advanced-networking': {
            id: 'cloud-wsa-m14-advanced-networking',
            title: 'WSA M14 GUI Lab: Advanced Networking',
            description: 'WSA M14 GUI Lab: Advanced Networking — module content for cloud house',
            house: 'cloud',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['wsa', 'm14', 'gui', 'cloud', 'infrastructure'],
            paths: ['wsa'],
            components: {
                module: 'houses/cloud/modules/wsa/m14-advanced-networking/cloud-guilab.module.html',
                presentation: 'houses/cloud/modules/wsa/m14-advanced-networking/cloud-presentation.module.html',
                pslab: 'houses/cloud/modules/wsa/m14-advanced-networking/cloud-pslab.module.html',
                quizquiz: 'houses/cloud/modules/wsa/m14-advanced-networking/cloud-quizquiz.module.html'
            },
            prerequisites: [],
            objectives: []
        },
        'cloud-wsa-m15-ad-sites': {
            id: 'cloud-wsa-m15-ad-sites',
            title: 'WSA M15 GUI Lab: AD Sites & Services',
            description: 'WSA M15 GUI Lab: AD Sites & Services — module content for cloud house',
            house: 'cloud',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['wsa', 'm15', 'gui', 'cloud', 'infrastructure'],
            paths: ['wsa'],
            components: {
                module: 'houses/cloud/modules/wsa/m15-ad-sites/cloud-guilab.module.html',
                presentation: 'houses/cloud/modules/wsa/m15-ad-sites/cloud-presentation.module.html',
                pslab: 'houses/cloud/modules/wsa/m15-ad-sites/cloud-pslab.module.html',
                quizquiz: 'houses/cloud/modules/wsa/m15-ad-sites/cloud-quizquiz.module.html'
            },
            prerequisites: [],
            objectives: []
        },
        'cloud-wsa-m16-backup-recovery': {
            id: 'cloud-wsa-m16-backup-recovery',
            title: 'WSA M16 GUI Lab: Windows Server Backup',
            description: 'WSA M16 GUI Lab: Windows Server Backup — module content for cloud house',
            house: 'cloud',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['wsa', 'm16', 'gui', 'cloud', 'infrastructure'],
            paths: ['wsa'],
            components: {
                module: 'houses/cloud/modules/wsa/m16-backup-recovery/cloud-guilab.module.html',
                presentation: 'houses/cloud/modules/wsa/m16-backup-recovery/cloud-presentation.module.html',
                pslab: 'houses/cloud/modules/wsa/m16-backup-recovery/cloud-pslab.module.html',
                quizquiz: 'houses/cloud/modules/wsa/m16-backup-recovery/cloud-quizquiz.module.html'
            },
            prerequisites: [],
            objectives: []
        },
        'cloud-wsa-m17-firewall-security': {
            id: 'cloud-wsa-m17-firewall-security',
            title: 'WSA M17 GUI Lab: Windows Firewall',
            description: 'WSA M17 GUI Lab: Windows Firewall — module content for cloud house',
            house: 'cloud',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['wsa', 'm17', 'gui', 'cloud', 'infrastructure'],
            paths: ['wsa'],
            components: {
                module: 'houses/cloud/modules/wsa/m17-firewall-security/cloud-guilab.module.html',
                presentation: 'houses/cloud/modules/wsa/m17-firewall-security/cloud-presentation.module.html',
                pslab: 'houses/cloud/modules/wsa/m17-firewall-security/cloud-pslab.module.html',
                quizquiz: 'houses/cloud/modules/wsa/m17-firewall-security/cloud-quizquiz.module.html'
            },
            prerequisites: [],
            objectives: []
        },
        'cloud-wsa-m18-powershell-automation': {
            id: 'cloud-wsa-m18-powershell-automation',
            title: 'WSA M18 GUI Lab: PowerShell Automation',
            description: 'WSA M18 GUI Lab: PowerShell Automation — module content for cloud house',
            house: 'cloud',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['wsa', 'm18', 'gui', 'cloud', 'infrastructure'],
            paths: ['wsa'],
            components: {
                module: 'houses/cloud/modules/wsa/m18-powershell-automation/cloud-guilab.module.html',
                presentation: 'houses/cloud/modules/wsa/m18-powershell-automation/cloud-presentation.module.html',
                pslab: 'houses/cloud/modules/wsa/m18-powershell-automation/cloud-pslab.module.html',
                quizquiz: 'houses/cloud/modules/wsa/m18-powershell-automation/cloud-quizquiz.module.html'
            },
            prerequisites: [],
            objectives: []
        },
        'cloud-wsa-m19-troubleshooting-migration': {
            id: 'cloud-wsa-m19-troubleshooting-migration',
            title: 'WSA M19 GUI Lab: Troubleshooting & Migration',
            description: 'WSA M19 GUI Lab: Troubleshooting & Migration — module content for cloud house',
            house: 'cloud',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['wsa', 'm19', 'gui', 'cloud', 'infrastructure'],
            paths: ['wsa'],
            components: {
                module: 'houses/cloud/modules/wsa/m19-troubleshooting-migration/cloud-guilab.module.html',
                presentation: 'houses/cloud/modules/wsa/m19-troubleshooting-migration/cloud-presentation.module.html',
                pslab: 'houses/cloud/modules/wsa/m19-troubleshooting-migration/cloud-pslab.module.html',
                quizquiz: 'houses/cloud/modules/wsa/m19-troubleshooting-migration/cloud-quizquiz.module.html'
            },
            prerequisites: [],
            objectives: []
        },
        'cloud-wsa-m20-failsafe-capstone': {
            id: 'cloud-wsa-m20-failsafe-capstone',
            title: 'FAILSAFE Simulation',
            description: 'FAILSAFE Simulation — module content for cloud house',
            house: 'cloud',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['failsafe', 'simulation', 'cloud', 'infrastructure'],
            paths: ['wsa'],
            components: {
                module: 'houses/cloud/modules/wsa/m20-failsafe-capstone/cloud-simulation.module.html'
            },
            prerequisites: [],
            objectives: []
        },

// ─── FORGE HOUSE (remaining REG-001 fixes) ───
        'forge-core2-admin-tools': {
            id: 'forge-core2-admin-tools',
            title: 'Administrative Tools Lab (Core 2)',
            description: 'Administrative Tools Lab (Core 2) — module content for forge house',
            house: 'forge',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['administrative', 'tools', 'hardware', 'systems'],
            paths: ['aplus-core2'],
            components: {
                lab: 'houses/forge/applets/comptia-aplus/core-2/labs/forge-admin-tools.lab.html',
                presentation: 'houses/forge/applets/comptia-aplus/core-2/presentations/forge-admin-tools.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-core2-control-panel': {
            id: 'forge-core2-control-panel',
            title: 'Control Panel Lab (Core 2)',
            description: 'Control Panel Lab (Core 2) — module content for forge house',
            house: 'forge',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['control', 'panel', 'hardware', 'systems'],
            paths: ['aplus-core2'],
            components: {
                lab: 'houses/forge/applets/comptia-aplus/core-2/labs/forge-control-panel.lab.html',
                presentation: 'houses/forge/applets/comptia-aplus/core-2/presentations/forge-control-panel.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-core2-roleplay-v2': {
            id: 'forge-core2-roleplay-v2',
            title: 'Core 2 Roleplay Lab - IT Support Scenarios',
            description: 'Core 2 Roleplay Lab - IT Support Scenarios (Core 2) — lab content for forge house',
            house: 'forge',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['roleplay', 'support', 'scenarios', 'hardware', 'systems'],
            paths: ['aplus-core2'],
            components: {
                lab: 'houses/forge/applets/comptia-aplus/core-2/labs/forge-core2-roleplay.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-core2-system-tools': {
            id: 'forge-core2-system-tools',
            title: 'System Tools Lab (Core 2)',
            description: 'System Tools Lab (Core 2) — module content for forge house',
            house: 'forge',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['system', 'tools', 'hardware', 'systems'],
            paths: ['aplus-core2'],
            components: {
                lab: 'houses/forge/applets/comptia-aplus/core-2/labs/forge-system-tools.lab.html',
                presentation: 'houses/forge/applets/comptia-aplus/core-2/presentations/forge-system-tools.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-core2-windows-editions': {
            id: 'forge-core2-windows-editions',
            title: 'Windows Editions Lab (Core 2)',
            description: 'Windows Editions Lab (Core 2) — module content for forge house',
            house: 'forge',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['windows', 'editions', 'hardware', 'systems'],
            paths: ['aplus-core2'],
            components: {
                lab: 'houses/forge/applets/comptia-aplus/core-2/labs/forge-windows-editions.lab.html',
                presentation: 'houses/forge/applets/comptia-aplus/core-2/presentations/forge-windows-editions.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-core2-windows-settings': {
            id: 'forge-core2-windows-settings',
            title: 'Windows Settings Lab (Core 2)',
            description: 'Windows Settings Lab (Core 2) — module content for forge house',
            house: 'forge',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['windows', 'settings', 'hardware', 'systems'],
            paths: ['aplus-core2'],
            components: {
                lab: 'houses/forge/applets/comptia-aplus/core-2/labs/forge-windows-settings.lab.html',
                presentation: 'houses/forge/applets/comptia-aplus/core-2/presentations/forge-windows-settings.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-core2-macos-linux-basics': {
            id: 'forge-core2-macos-linux-basics',
            title: 'macOS & Linux Basics (Core 2)',
            description: 'macOS & Linux Basics (Core 2) — presentation content for forge house',
            house: 'forge',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 20,
            topics: ['macos', 'linux', 'basics', 'hardware', 'systems'],
            paths: ['aplus-core2'],
            components: {
                presentation: 'houses/forge/applets/comptia-aplus/core-2/presentations/forge-macos-linux-basics.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-core2-windows-shortcuts': {
            id: 'forge-core2-windows-shortcuts',
            title: 'Windows Keyboard Shortcuts (Core 2)',
            description: 'Windows Keyboard Shortcuts (Core 2) — applet content for forge house',
            house: 'forge',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['windows', 'keyboard', 'shortcuts', 'hardware', 'systems'],
            paths: ['aplus-core2'],
            components: {
                applet: 'houses/forge/applets/comptia-aplus/core-2/reference/forge-windows-shortcuts.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-backup-or-bust': {
            id: 'forge-backup-or-bust',
            title: 'Backup or Bust | Under Renovation',
            description: 'Backup or Bust | Under Renovation — tool content for forge house',
            house: 'forge',
            type: 'tool',
            difficulty: 'beginner',
            duration: 20,
            topics: ['backup', 'bust', 'under', 'hardware', 'systems'],
            paths: ['aplus-core1'],
            components: {
                tool: 'houses/forge/reviews/forge-backup-or-bust.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-admin-tools-tool': {
            id: 'forge-admin-tools-tool',
            title: 'Administrative Tools Explorer',
            description: 'Administrative Tools Explorer — tool content for forge house',
            house: 'forge',
            type: 'tool',
            difficulty: 'beginner',
            duration: 20,
            topics: ['administrative', 'tools', 'explorer', 'hardware', 'systems'],
            paths: ['aplus-core1'],
            components: {
                tool: 'houses/forge/tools/forge-admin-tools.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-control-panel-tool': {
            id: 'forge-control-panel-tool',
            title: 'Control Panel Explorer',
            description: 'Control Panel Explorer — tool content for forge house',
            house: 'forge',
            type: 'tool',
            difficulty: 'beginner',
            duration: 20,
            topics: ['control', 'panel', 'explorer', 'hardware', 'systems'],
            paths: ['aplus-core1'],
            components: {
                tool: 'houses/forge/tools/forge-control-panel.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-system-tools-sim-tool': {
            id: 'forge-system-tools-sim-tool',
            title: 'System Tools Simulator',
            description: 'System Tools Simulator — tool content for forge house',
            house: 'forge',
            type: 'tool',
            difficulty: 'beginner',
            duration: 20,
            topics: ['system', 'tools', 'simulator', 'hardware', 'systems'],
            paths: ['aplus-core1'],
            components: {
                tool: 'houses/forge/tools/forge-system-tools-sim.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-windows-edition-selector-tool': {
            id: 'forge-windows-edition-selector-tool',
            title: 'Windows Edition Selector',
            description: 'Windows Edition Selector — tool content for forge house',
            house: 'forge',
            type: 'tool',
            difficulty: 'beginner',
            duration: 20,
            topics: ['windows', 'edition', 'selector', 'hardware', 'systems'],
            paths: ['aplus-core1'],
            components: {
                tool: 'houses/forge/tools/forge-windows-edition-selector.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        // ─── MD-100: Windows Client — Forge House ───
        'forge-md100-m01': {
            id: 'forge-md100-m01',
            title: 'MD-100 M01: Install the Windows Client',
            description: 'Windows editions, requirements, installation methods, upgrade paths, and deployment tools',
            house: 'forge',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 30,
            topics: ['windows', 'installation', 'deployment', 'editions', 'upgrade'],
            paths: ['md-100'],
            components: {
                presentation: 'houses/forge/md-100/presentations/md100-m01-install-windows.presentation.html'
            },
            prerequisites: [],
            objectives: ['Identify Windows editions and their features', 'Evaluate installation and deployment methods']
        },
        'forge-md100-m02': {
            id: 'forge-md100-m02',
            title: 'MD-100 M02: Configure Authorization & Authentication',
            description: 'Authentication types, user/group management, UAC, device registration, and Windows Hello',
            house: 'forge',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 30,
            topics: ['authentication', 'authorization', 'uac', 'azure-ad', 'users', 'groups'],
            paths: ['md-100'],
            components: {
                presentation: 'houses/forge/md-100/presentations/md100-m02-auth-authorization.presentation.html'
            },
            prerequisites: ['forge-md100-m01'],
            objectives: ['Configure authentication methods', 'Manage users, groups, and UAC']
        },
        'forge-md100-m03': {
            id: 'forge-md100-m03',
            title: 'MD-100 M03: Post-Installation Settings',
            description: 'Settings vs Control Panel, registry, Group Policy, driver management, and peripherals',
            house: 'forge',
            type: 'presentation',
            difficulty: 'intermediate',
            duration: 30,
            topics: ['configuration', 'registry', 'group-policy', 'drivers', 'peripherals'],
            paths: ['md-100'],
            components: {
                presentation: 'houses/forge/md-100/presentations/md100-m03-post-install-config.presentation.html'
            },
            prerequisites: ['forge-md100-m02'],
            objectives: ['Configure post-installation settings', 'Manage drivers and device peripherals']
        },
        'forge-md100-m04': {
            id: 'forge-md100-m04',
            title: 'MD-100 M04: Configuring Networking',
            description: 'IP configuration, DNS, wireless, VPN protocols, remote access and management',
            house: 'forge',
            type: 'presentation',
            difficulty: 'intermediate',
            duration: 35,
            topics: ['networking', 'ip', 'dns', 'vpn', 'remote-access', 'wireless'],
            paths: ['md-100'],
            components: {
                presentation: 'houses/forge/md-100/presentations/md100-m04-networking.presentation.html'
            },
            prerequisites: ['forge-md100-m03'],
            objectives: ['Configure IP networking and name resolution', 'Implement remote access solutions']
        },
        'forge-md100-m05': {
            id: 'forge-md100-m05',
            title: 'MD-100 M05: Configure Storage',
            description: 'Disk types, volumes, file systems, Storage Spaces, and maintenance tools',
            house: 'forge',
            type: 'presentation',
            difficulty: 'intermediate',
            duration: 30,
            topics: ['storage', 'disks', 'volumes', 'ntfs', 'storage-spaces'],
            paths: ['md-100'],
            components: {
                presentation: 'houses/forge/md-100/presentations/md100-m05-storage.presentation.html'
            },
            prerequisites: ['forge-md100-m04'],
            objectives: ['Manage storage devices and volumes', 'Implement Storage Spaces']
        },
        'forge-md100-m06': {
            id: 'forge-md100-m06',
            title: 'MD-100 M06: Configure Data Access & Usage',
            description: 'NTFS permissions, file sharing, OneDrive, folder redirection, and EFS',
            house: 'forge',
            type: 'presentation',
            difficulty: 'intermediate',
            duration: 30,
            topics: ['ntfs', 'permissions', 'sharing', 'onedrive', 'efs'],
            paths: ['md-100'],
            components: {
                presentation: 'houses/forge/md-100/presentations/md100-m06-data-access.presentation.html'
            },
            prerequisites: ['forge-md100-m05'],
            objectives: ['Configure file access permissions', 'Manage shared folders and user files']
        },
        'forge-md100-m07': {
            id: 'forge-md100-m07',
            title: 'MD-100 M07: Manage Apps & Windows Updates',
            description: 'App deployment, UWP, Edge browser, servicing model, and update management',
            house: 'forge',
            type: 'presentation',
            difficulty: 'intermediate',
            duration: 35,
            topics: ['apps', 'updates', 'edge', 'wsus', 'servicing'],
            paths: ['md-100'],
            components: {
                presentation: 'houses/forge/md-100/presentations/md100-m07-apps-updates.presentation.html'
            },
            prerequisites: ['forge-md100-m06'],
            objectives: ['Deploy and manage applications', 'Configure Windows Update settings']
        },
        'forge-md100-m08': {
            id: 'forge-md100-m08',
            title: 'MD-100 M08: Configure Threat Protection',
            description: 'Malware types, Microsoft Defender, BitLocker, firewall rules, and advanced protection',
            house: 'forge',
            type: 'presentation',
            difficulty: 'intermediate',
            duration: 35,
            topics: ['security', 'defender', 'bitlocker', 'firewall', 'malware'],
            paths: ['md-100'],
            components: {
                presentation: 'houses/forge/md-100/presentations/md100-m08-threat-protection.presentation.html'
            },
            prerequisites: ['forge-md100-m07'],
            objectives: ['Configure Microsoft Defender and BitLocker', 'Implement firewall and advanced protection']
        },
        'forge-md100-m09': {
            id: 'forge-md100-m09',
            title: 'MD-100 M09: Support the Windows Client',
            description: 'Troubleshooting methodology, Windows architecture, diagnostics, performance, and recovery',
            house: 'forge',
            type: 'presentation',
            difficulty: 'advanced',
            duration: 35,
            topics: ['troubleshooting', 'diagnostics', 'performance', 'event-viewer', 'recovery'],
            paths: ['md-100'],
            components: {
                presentation: 'houses/forge/md-100/presentations/md100-m09-support-environment.presentation.html'
            },
            prerequisites: ['forge-md100-m08'],
            objectives: ['Apply troubleshooting methodologies', 'Use diagnostic and recovery tools']
        },
        'forge-md100-m10': {
            id: 'forge-md100-m10',
            title: 'MD-100 M10: Troubleshoot OS & Apps',
            description: 'File recovery, app compatibility, startup repair, service issues, DISM and SFC',
            house: 'forge',
            type: 'presentation',
            difficulty: 'advanced',
            duration: 35,
            topics: ['troubleshooting', 'recovery', 'startup', 'services', 'dism', 'sfc'],
            paths: ['md-100'],
            components: {
                presentation: 'houses/forge/md-100/presentations/md100-m10-troubleshoot-os-apps.presentation.html'
            },
            prerequisites: ['forge-md100-m09'],
            objectives: ['Troubleshoot application and startup issues', 'Perform system file repair']
        },
        'forge-md100-m11': {
            id: 'forge-md100-m11',
            title: 'MD-100 M11: Troubleshoot Hardware & Drivers',
            description: 'Driver failures, error codes, BSOD analysis, hardware diagnostics, and peripherals',
            house: 'forge',
            type: 'presentation',
            difficulty: 'advanced',
            duration: 30,
            topics: ['hardware', 'drivers', 'bsod', 'diagnostics', 'peripherals'],
            paths: ['md-100'],
            components: {
                presentation: 'houses/forge/md-100/presentations/md100-m11-troubleshoot-hardware.presentation.html'
            },
            prerequisites: ['forge-md100-m10'],
            objectives: ['Diagnose driver and hardware failures', 'Analyze BSOD stop codes']
        },
        'forge-md100-m01-lab': {
            id: 'forge-md100-m01-lab',
            title: 'Lab: Install the Windows Client',
            description: 'Hands-on exercises for Windows installation, editions, and deployment',
            house: 'forge',
            type: 'lab',
            difficulty: 'beginner',
            duration: 25,
            topics: ['windows', 'installation', 'deployment', 'editions'],
            paths: ['md-100'],
            components: {
                lab: 'houses/forge/md-100/labs/md100-m01-install.lab.html'
            },
            prerequisites: ['forge-md100-m01'],
            objectives: ['Practice edition selection and deployment planning']
        },
        'forge-md100-m02-lab': {
            id: 'forge-md100-m02-lab',
            title: 'Lab: Authorization & Authentication',
            description: 'Hands-on exercises for user management, UAC, and Azure AD',
            house: 'forge',
            type: 'lab',
            difficulty: 'beginner',
            duration: 25,
            topics: ['authentication', 'users', 'groups', 'uac'],
            paths: ['md-100'],
            components: {
                lab: 'houses/forge/md-100/labs/md100-m02-auth.lab.html'
            },
            prerequisites: ['forge-md100-m02'],
            objectives: ['Practice user/group management and UAC configuration']
        },
        'forge-md100-m03-lab': {
            id: 'forge-md100-m03-lab',
            title: 'Lab: Post-Installation Configuration',
            description: 'Hands-on exercises for registry, Group Policy, and driver management',
            house: 'forge',
            type: 'lab',
            difficulty: 'intermediate',
            duration: 25,
            topics: ['configuration', 'registry', 'group-policy', 'drivers'],
            paths: ['md-100'],
            components: {
                lab: 'houses/forge/md-100/labs/md100-m03-config.lab.html'
            },
            prerequisites: ['forge-md100-m03'],
            objectives: ['Practice configuration using registry, GPO, and Device Manager']
        },
        'forge-md100-m04-lab': {
            id: 'forge-md100-m04-lab',
            title: 'Lab: Networking',
            description: 'Hands-on exercises for IP configuration, DNS, VPN, and remote access',
            house: 'forge',
            type: 'lab',
            difficulty: 'intermediate',
            duration: 30,
            topics: ['networking', 'ip', 'dns', 'vpn'],
            paths: ['md-100'],
            components: {
                lab: 'houses/forge/md-100/labs/md100-m04-networking.lab.html'
            },
            prerequisites: ['forge-md100-m04'],
            objectives: ['Practice IP configuration and network troubleshooting']
        },
        'forge-md100-m05-lab': {
            id: 'forge-md100-m05-lab',
            title: 'Lab: Storage Configuration',
            description: 'Hands-on exercises for disk management, volumes, and Storage Spaces',
            house: 'forge',
            type: 'lab',
            difficulty: 'intermediate',
            duration: 25,
            topics: ['storage', 'disks', 'volumes', 'storage-spaces'],
            paths: ['md-100'],
            components: {
                lab: 'houses/forge/md-100/labs/md100-m05-storage.lab.html'
            },
            prerequisites: ['forge-md100-m05'],
            objectives: ['Practice disk management and Storage Spaces configuration']
        },
        'forge-md100-m06-lab': {
            id: 'forge-md100-m06-lab',
            title: 'Lab: Data Access',
            description: 'Hands-on exercises for NTFS permissions, sharing, and file management',
            house: 'forge',
            type: 'lab',
            difficulty: 'intermediate',
            duration: 25,
            topics: ['ntfs', 'permissions', 'sharing', 'onedrive'],
            paths: ['md-100'],
            components: {
                lab: 'houses/forge/md-100/labs/md100-m06-data-access.lab.html'
            },
            prerequisites: ['forge-md100-m06'],
            objectives: ['Practice NTFS permission configuration and file sharing']
        },
        'forge-md100-m07-lab': {
            id: 'forge-md100-m07-lab',
            title: 'Lab: Apps & Updates',
            description: 'Hands-on exercises for app deployment, Edge policies, and update management',
            house: 'forge',
            type: 'lab',
            difficulty: 'intermediate',
            duration: 25,
            topics: ['apps', 'updates', 'edge', 'wsus'],
            paths: ['md-100'],
            components: {
                lab: 'houses/forge/md-100/labs/md100-m07-apps.lab.html'
            },
            prerequisites: ['forge-md100-m07'],
            objectives: ['Practice app deployment and update management']
        },
        'forge-md100-m08-lab': {
            id: 'forge-md100-m08-lab',
            title: 'Lab: Threat Protection',
            description: 'Hands-on exercises for Defender, BitLocker, and firewall configuration',
            house: 'forge',
            type: 'lab',
            difficulty: 'intermediate',
            duration: 30,
            topics: ['security', 'defender', 'bitlocker', 'firewall'],
            paths: ['md-100'],
            components: {
                lab: 'houses/forge/md-100/labs/md100-m08-security.lab.html'
            },
            prerequisites: ['forge-md100-m08'],
            objectives: ['Practice security configuration and threat protection']
        },
        'forge-md100-m09-lab': {
            id: 'forge-md100-m09-lab',
            title: 'Lab: Support Environment',
            description: 'Hands-on exercises for troubleshooting methodology, diagnostics, and recovery',
            house: 'forge',
            type: 'lab',
            difficulty: 'advanced',
            duration: 30,
            topics: ['troubleshooting', 'diagnostics', 'event-viewer', 'recovery'],
            paths: ['md-100'],
            components: {
                lab: 'houses/forge/md-100/labs/md100-m09-support.lab.html'
            },
            prerequisites: ['forge-md100-m09'],
            objectives: ['Practice using diagnostic and recovery tools']
        },
        'forge-md100-m10-lab': {
            id: 'forge-md100-m10-lab',
            title: 'Lab: OS & App Troubleshooting',
            description: 'Hands-on exercises for file recovery, startup repair, and system file repair',
            house: 'forge',
            type: 'lab',
            difficulty: 'advanced',
            duration: 30,
            topics: ['troubleshooting', 'recovery', 'startup', 'dism', 'sfc'],
            paths: ['md-100'],
            components: {
                lab: 'houses/forge/md-100/labs/md100-m10-troubleshoot.lab.html'
            },
            prerequisites: ['forge-md100-m10'],
            objectives: ['Practice boot repair and system file troubleshooting']
        },
        'forge-md100-m11-lab': {
            id: 'forge-md100-m11-lab',
            title: 'Lab: Hardware & Driver Troubleshooting',
            description: 'Hands-on exercises for driver management, BSOD analysis, and hardware diagnostics',
            house: 'forge',
            type: 'lab',
            difficulty: 'advanced',
            duration: 25,
            topics: ['hardware', 'drivers', 'bsod', 'diagnostics'],
            paths: ['md-100'],
            components: {
                lab: 'houses/forge/md-100/labs/md100-m11-hardware.lab.html'
            },
            prerequisites: ['forge-md100-m11'],
            objectives: ['Practice driver troubleshooting and BSOD analysis']
        },
        'forge-md100-m01-quiz': {
            id: 'forge-md100-m01-quiz',
            title: 'Quiz: Install the Windows Client',
            description: '15-question assessment on Windows installation and deployment',
            house: 'forge',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['windows', 'installation', 'deployment', 'editions'],
            paths: ['md-100'],
            components: {
                quiz: 'houses/forge/md-100/quizzes/md100-m01-quiz.quiz.html'
            },
            prerequisites: ['forge-md100-m01-lab'],
            objectives: ['Assess Windows installation knowledge']
        },
        'forge-md100-m02-quiz': {
            id: 'forge-md100-m02-quiz',
            title: 'Quiz: Authorization & Authentication',
            description: '15-question assessment on authentication and user management',
            house: 'forge',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['authentication', 'users', 'groups', 'uac'],
            paths: ['md-100'],
            components: {
                quiz: 'houses/forge/md-100/quizzes/md100-m02-quiz.quiz.html'
            },
            prerequisites: ['forge-md100-m02-lab'],
            objectives: ['Assess authentication and authorization knowledge']
        },
        'forge-md100-m03-quiz': {
            id: 'forge-md100-m03-quiz',
            title: 'Quiz: Post-Installation Settings',
            description: '15-question assessment on Windows configuration tools',
            house: 'forge',
            type: 'quiz',
            difficulty: 'intermediate',
            duration: 15,
            topics: ['configuration', 'registry', 'group-policy', 'drivers'],
            paths: ['md-100'],
            components: {
                quiz: 'houses/forge/md-100/quizzes/md100-m03-quiz.quiz.html'
            },
            prerequisites: ['forge-md100-m03-lab'],
            objectives: ['Assess configuration and driver management knowledge']
        },
        'forge-md100-m04-quiz': {
            id: 'forge-md100-m04-quiz',
            title: 'Quiz: Networking',
            description: '15-question assessment on Windows networking',
            house: 'forge',
            type: 'quiz',
            difficulty: 'intermediate',
            duration: 15,
            topics: ['networking', 'ip', 'dns', 'vpn'],
            paths: ['md-100'],
            components: {
                quiz: 'houses/forge/md-100/quizzes/md100-m04-quiz.quiz.html'
            },
            prerequisites: ['forge-md100-m04-lab'],
            objectives: ['Assess networking configuration knowledge']
        },
        'forge-md100-m05-quiz': {
            id: 'forge-md100-m05-quiz',
            title: 'Quiz: Storage',
            description: '15-question assessment on Windows storage',
            house: 'forge',
            type: 'quiz',
            difficulty: 'intermediate',
            duration: 15,
            topics: ['storage', 'disks', 'volumes', 'storage-spaces'],
            paths: ['md-100'],
            components: {
                quiz: 'houses/forge/md-100/quizzes/md100-m05-quiz.quiz.html'
            },
            prerequisites: ['forge-md100-m05-lab'],
            objectives: ['Assess storage management knowledge']
        },
        'forge-md100-m06-quiz': {
            id: 'forge-md100-m06-quiz',
            title: 'Quiz: Data Access & Usage',
            description: '15-question assessment on NTFS permissions and file sharing',
            house: 'forge',
            type: 'quiz',
            difficulty: 'intermediate',
            duration: 15,
            topics: ['ntfs', 'permissions', 'sharing'],
            paths: ['md-100'],
            components: {
                quiz: 'houses/forge/md-100/quizzes/md100-m06-quiz.quiz.html'
            },
            prerequisites: ['forge-md100-m06-lab'],
            objectives: ['Assess data access and permission knowledge']
        },
        'forge-md100-m07-quiz': {
            id: 'forge-md100-m07-quiz',
            title: 'Quiz: Apps & Windows Updates',
            description: '15-question assessment on app management and Windows updates',
            house: 'forge',
            type: 'quiz',
            difficulty: 'intermediate',
            duration: 15,
            topics: ['apps', 'updates', 'edge', 'wsus'],
            paths: ['md-100'],
            components: {
                quiz: 'houses/forge/md-100/quizzes/md100-m07-quiz.quiz.html'
            },
            prerequisites: ['forge-md100-m07-lab'],
            objectives: ['Assess app deployment and update management knowledge']
        },
        'forge-md100-m08-quiz': {
            id: 'forge-md100-m08-quiz',
            title: 'Quiz: Threat Protection',
            description: '15-question assessment on security and threat protection',
            house: 'forge',
            type: 'quiz',
            difficulty: 'intermediate',
            duration: 15,
            topics: ['security', 'defender', 'bitlocker', 'firewall'],
            paths: ['md-100'],
            components: {
                quiz: 'houses/forge/md-100/quizzes/md100-m08-quiz.quiz.html'
            },
            prerequisites: ['forge-md100-m08-lab'],
            objectives: ['Assess security configuration knowledge']
        },
        'forge-md100-m09-quiz': {
            id: 'forge-md100-m09-quiz',
            title: 'Quiz: Support the Windows Client',
            description: '15-question assessment on troubleshooting and diagnostics',
            house: 'forge',
            type: 'quiz',
            difficulty: 'advanced',
            duration: 15,
            topics: ['troubleshooting', 'diagnostics', 'event-viewer'],
            paths: ['md-100'],
            components: {
                quiz: 'houses/forge/md-100/quizzes/md100-m09-quiz.quiz.html'
            },
            prerequisites: ['forge-md100-m09-lab'],
            objectives: ['Assess troubleshooting methodology and diagnostic tool knowledge']
        },
        'forge-md100-m10-quiz': {
            id: 'forge-md100-m10-quiz',
            title: 'Quiz: Troubleshoot OS & Apps',
            description: '15-question assessment on OS and application troubleshooting',
            house: 'forge',
            type: 'quiz',
            difficulty: 'advanced',
            duration: 15,
            topics: ['troubleshooting', 'recovery', 'startup', 'dism'],
            paths: ['md-100'],
            components: {
                quiz: 'houses/forge/md-100/quizzes/md100-m10-quiz.quiz.html'
            },
            prerequisites: ['forge-md100-m10-lab'],
            objectives: ['Assess OS troubleshooting and repair knowledge']
        },
        'forge-md100-m11-quiz': {
            id: 'forge-md100-m11-quiz',
            title: 'Quiz: Hardware & Drivers',
            description: '15-question assessment on hardware and driver troubleshooting',
            house: 'forge',
            type: 'quiz',
            difficulty: 'advanced',
            duration: 15,
            topics: ['hardware', 'drivers', 'bsod', 'diagnostics'],
            paths: ['md-100'],
            components: {
                quiz: 'houses/forge/md-100/quizzes/md100-m11-quiz.quiz.html'
            },
            prerequisites: ['forge-md100-m11-lab'],
            objectives: ['Assess hardware troubleshooting and BSOD analysis knowledge']
        },
        // ─── MD-100 REVIEW GAMES ───
        'forge-md100-midterm-review': {
            id: 'forge-md100-midterm-review',
            title: 'MD-100 Midterm Review (M01-M06)',
            description: 'Jeopardy-style review covering installation, auth, config, networking, storage, and data access',
            house: 'forge',
            type: 'quiz',
            difficulty: 'intermediate',
            duration: 30,
            topics: ['windows-install', 'auth', 'config', 'networking', 'storage', 'data-access'],
            paths: ['md-100'],
            components: {
                quiz: 'houses/forge/md-100/reviews/md100-midterm-review.html'
            },
            prerequisites: ['forge-md100-m06-quiz'],
            objectives: ['Review modules 1-6 for midterm preparation']
        },
        'forge-md100-final-review': {
            id: 'forge-md100-final-review',
            title: 'MD-100 Final Review (M07-M11)',
            description: 'Jeopardy-style review covering apps, security, support, and troubleshooting',
            house: 'forge',
            type: 'quiz',
            difficulty: 'advanced',
            duration: 30,
            topics: ['apps', 'security', 'support', 'troubleshooting', 'hardware'],
            paths: ['md-100'],
            components: {
                quiz: 'houses/forge/md-100/reviews/md100-final-review.html'
            },
            prerequisites: ['forge-md100-m11-quiz'],
            objectives: ['Review modules 7-11 for final exam preparation']
        },
        'forge-md100-comprehensive-review': {
            id: 'forge-md100-comprehensive-review',
            title: 'MD-100 Comprehensive Review',
            description: 'Cross-cutting Jeopardy review spanning all 11 modules for full exam prep',
            house: 'forge',
            type: 'quiz',
            difficulty: 'advanced',
            duration: 40,
            topics: ['deployment', 'identity', 'networking', 'management', 'security', 'troubleshooting'],
            paths: ['md-100'],
            components: {
                quiz: 'houses/forge/md-100/reviews/md100-comprehensive-review.html'
            },
            prerequisites: ['forge-md100-final-review'],
            objectives: ['Comprehensive exam preparation across all MD-100 domains']
        },
        // ─── OPENSTACK (Cloud House) ───
        'cloud-openstack-intro': {
            id: 'cloud-openstack-intro',
            title: 'OpenStack: Introduction & Environment',
            description: 'OpenStack architecture, origin, hardware/software requirements, networking options',
            house: 'cloud',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 30,
            topics: ['openstack', 'iaas', 'cloud-architecture', 'networking'],
            paths: ['openstack'],
            components: {
                presentation: 'houses/cloud/openstack/presentations/openstack-intro-environment.presentation.html'
            },
            prerequisites: [],
            objectives: ['Understand OpenStack architecture and deployment requirements']
        },
        'cloud-openstack-projects': {
            id: 'cloud-openstack-projects',
            title: 'OpenStack: Core Projects',
            description: 'Nova, Neutron, Swift, Cinder, Keystone, Glance, Horizon, Heat',
            house: 'cloud',
            type: 'presentation',
            difficulty: 'intermediate',
            duration: 35,
            topics: ['nova', 'neutron', 'swift', 'cinder', 'keystone', 'glance'],
            paths: ['openstack'],
            components: {
                presentation: 'houses/cloud/openstack/presentations/openstack-projects.presentation.html'
            },
            prerequisites: ['cloud-openstack-intro'],
            objectives: ['Describe core OpenStack projects and their roles']
        },
        'cloud-openstack-install': {
            id: 'cloud-openstack-install',
            title: 'OpenStack: Installation',
            description: 'Manual installation: prerequisites, NTP, MariaDB, RabbitMQ, Keystone, Glance, Nova, Neutron',
            house: 'cloud',
            type: 'presentation',
            difficulty: 'advanced',
            duration: 40,
            topics: ['installation', 'keystone', 'glance', 'nova', 'neutron', 'configuration'],
            paths: ['openstack'],
            components: {
                presentation: 'houses/cloud/openstack/presentations/openstack-installation.presentation.html'
            },
            prerequisites: ['cloud-openstack-projects'],
            objectives: ['Walk through OpenStack manual installation process']
        },
        'cloud-openstack-operation': {
            id: 'cloud-openstack-operation',
            title: 'OpenStack: Operation',
            description: 'Horizon dashboard, CLI management, launching instances, floating IPs, SSH access',
            house: 'cloud',
            type: 'presentation',
            difficulty: 'intermediate',
            duration: 30,
            topics: ['horizon', 'cli', 'instances', 'floating-ip', 'vnc'],
            paths: ['openstack'],
            components: {
                presentation: 'houses/cloud/openstack/presentations/openstack-operation.presentation.html'
            },
            prerequisites: ['cloud-openstack-install'],
            objectives: ['Manage OpenStack through dashboard and CLI']
        },
        'cloud-openstack-install-lab': {
            id: 'cloud-openstack-install-lab',
            title: 'Lab: Install OpenStack',
            description: 'Interactive lab covering network config, NTP, database, and core service installation',
            house: 'cloud',
            type: 'lab',
            difficulty: 'advanced',
            duration: 45,
            topics: ['installation', 'networking', 'configuration', 'services'],
            paths: ['openstack'],
            components: {
                lab: 'houses/cloud/openstack/labs/openstack-install.lab.html'
            },
            prerequisites: ['cloud-openstack-intro'],
            objectives: ['Practice OpenStack installation steps']
        },
        'cloud-openstack-launch-lab': {
            id: 'cloud-openstack-launch-lab',
            title: 'Lab: Launch Virtual Machine',
            description: 'Interactive lab for uploading images, creating networks, and launching instances',
            house: 'cloud',
            type: 'lab',
            difficulty: 'intermediate',
            duration: 35,
            topics: ['instances', 'images', 'networks', 'security-groups'],
            paths: ['openstack'],
            components: {
                lab: 'houses/cloud/openstack/labs/openstack-launch-vm.lab.html'
            },
            prerequisites: ['cloud-openstack-projects'],
            objectives: ['Launch and configure OpenStack instances']
        },
        'cloud-openstack-advanced-lab': {
            id: 'cloud-openstack-advanced-lab',
            title: 'Lab: Advanced OpenStack Operations',
            description: 'Flavors, volumes, network topology, snapshots, and troubleshooting',
            house: 'cloud',
            type: 'lab',
            difficulty: 'advanced',
            duration: 40,
            topics: ['flavors', 'volumes', 'cinder', 'snapshots', 'troubleshooting'],
            paths: ['openstack'],
            components: {
                lab: 'houses/cloud/openstack/labs/openstack-advanced-ops.lab.html'
            },
            prerequisites: ['cloud-openstack-install'],
            objectives: ['Perform advanced OpenStack administration tasks']
        },
        'cloud-openstack-intro-quiz': {
            id: 'cloud-openstack-intro-quiz',
            title: 'Quiz: Introduction & Environment',
            description: '15-question assessment on OpenStack fundamentals and architecture',
            house: 'cloud',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['openstack', 'architecture', 'requirements', 'networking'],
            paths: ['openstack'],
            components: {
                quiz: 'houses/cloud/openstack/quizzes/openstack-intro-quiz.quiz.html'
            },
            prerequisites: ['cloud-openstack-install-lab'],
            objectives: ['Assess understanding of OpenStack fundamentals']
        },
        'cloud-openstack-projects-quiz': {
            id: 'cloud-openstack-projects-quiz',
            title: 'Quiz: OpenStack Projects',
            description: '15-question assessment on core and optional OpenStack projects',
            house: 'cloud',
            type: 'quiz',
            difficulty: 'intermediate',
            duration: 15,
            topics: ['nova', 'neutron', 'swift', 'cinder', 'keystone', 'glance'],
            paths: ['openstack'],
            components: {
                quiz: 'houses/cloud/openstack/quizzes/openstack-projects-quiz.quiz.html'
            },
            prerequisites: ['cloud-openstack-launch-lab'],
            objectives: ['Assess knowledge of OpenStack project ecosystem']
        },
        'cloud-openstack-install-quiz': {
            id: 'cloud-openstack-install-quiz',
            title: 'Quiz: OpenStack Installation',
            description: '15-question assessment on installation procedures and configuration',
            house: 'cloud',
            type: 'quiz',
            difficulty: 'advanced',
            duration: 15,
            topics: ['installation', 'configuration', 'services', 'database'],
            paths: ['openstack'],
            components: {
                quiz: 'houses/cloud/openstack/quizzes/openstack-install-quiz.quiz.html'
            },
            prerequisites: ['cloud-openstack-advanced-lab'],
            objectives: ['Assess OpenStack installation knowledge']
        },
        'cloud-openstack-operation-quiz': {
            id: 'cloud-openstack-operation-quiz',
            title: 'Quiz: OpenStack Operations',
            description: '15-question assessment on dashboard and CLI operations',
            house: 'cloud',
            type: 'quiz',
            difficulty: 'intermediate',
            duration: 15,
            topics: ['horizon', 'cli', 'instances', 'floating-ip'],
            paths: ['openstack'],
            components: {
                quiz: 'houses/cloud/openstack/quizzes/openstack-operation-quiz.quiz.html'
            },
            prerequisites: ['cloud-openstack-operation'],
            objectives: ['Assess OpenStack operational knowledge']
        },
        'cloud-openstack-review': {
            id: 'cloud-openstack-review',
            title: 'OpenStack Comprehensive Review',
            description: 'Jeopardy-style review covering all 4 OpenStack lessons',
            house: 'cloud',
            type: 'quiz',
            difficulty: 'advanced',
            duration: 30,
            topics: ['openstack', 'architecture', 'installation', 'operations', 'projects'],
            paths: ['openstack'],
            components: {
                quiz: 'houses/cloud/openstack/reviews/openstack-comprehensive-review.html'
            },
            prerequisites: ['cloud-openstack-operation-quiz'],
            objectives: ['Comprehensive OpenStack review for exam preparation']
        },
        // ─── WEB HOUSE (remaining REG-001 fixes) ───
        'web-troubleshooting-lab': {
            id: 'web-troubleshooting-lab',
            title: 'Network Troubleshooting Lab',
            description: 'Network Troubleshooting Lab — lab content for web house',
            house: 'web',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['network', 'troubleshooting', 'networking', 'protocols'],
            paths: ['comptia-network'],
            components: {
                lab: 'houses/web/labs/web-troubleshooting.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-dns-resolver-race': {
            id: 'web-dns-resolver-race',
            title: 'DNS Resolver Race',
            description: 'DNS Resolver Race — tool content for web house',
            house: 'web',
            type: 'tool',
            difficulty: 'beginner',
            duration: 20,
            topics: ['resolver', 'race', 'networking', 'protocols'],
            paths: ['comptia-network'],
            components: {
                tool: 'houses/web/reviews/web-dns-resolver-race.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-subnet-siege': {
            id: 'web-subnet-siege',
            title: 'Subnet Siege',
            description: 'Subnet Siege — tool content for web house',
            house: 'web',
            type: 'tool',
            difficulty: 'beginner',
            duration: 20,
            topics: ['subnet', 'siege', 'networking', 'protocols'],
            paths: ['comptia-network'],
            components: {
                tool: 'houses/web/reviews/web-subnet-siege.html'
            },
            prerequisites: [],
            objectives: []
        },
        // ─── SHIELD HOUSE (remaining REG-001 fixes) ───
        'shield-hash-v3-v2': {
            id: 'shield-hash-v3-v2',
            title: 'Hashing & Steganography — Interactive Presentation',
            description: 'Hashing & Steganography — Interactive Presentation — applet content for shield house',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['hashing', 'steganography', 'interactive', 'security', 'defense'],
            paths: ['security-plus'],
            components: {
                applet: 'houses/shield/applets/crypto/hashing_steganography/shield-hash-v3.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-stego-v2': {
            id: 'shield-stego-v2',
            title: 'Hashing & Steganography — Interactive Presentation',
            description: 'Hashing & Steganography — Interactive Presentation — applet content for shield house',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['hashing', 'steganography', 'interactive', 'security', 'defense'],
            paths: ['security-plus'],
            components: {
                applet: 'houses/shield/applets/crypto/hashing_steganography/shield-stego.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        // ─── SHIELD HOUSE — Cyber Law & Policy Framework ───
        'shield-cf-mm01-pres': {
            id: 'shield-cf-mm01-pres',
            title: 'MM1: Introduction to Legal/Regulatory/Policy Issues',
            description: 'Cyber Framework Micromodule 1 — CIA Triad, threat actors, motives, cybersecurity knowledge gap, competing interests in cybersecurity policy',
            house: 'shield',
            type: 'presentation',
            difficulty: 'intermediate',
            duration: 30,
            topics: ['cyber-law', 'CIA-triad', 'threat-actors', 'cybersecurity-policy'],
            paths: ['cyber-framework'],
            components: {
                presentation: 'houses/shield/cyber-framework/presentations/cf-mm01-intro.presentation.html'
            },
            prerequisites: [],
            objectives: ['Describe cybersecurity concepts', 'Identify threat actors and motives', 'Analyze competing interests in cybersecurity']
        },
        'shield-cf-mm02-pres': {
            id: 'shield-cf-mm02-pres',
            title: 'MM2: Government Agency Roles & Responsibilities',
            description: 'Cyber Framework Micromodule 2 — DOJ/FBI, NIST, DHS, CISA, NSA, US Cyber Command, regulatory agencies, PPD-41, NCIRP',
            house: 'shield',
            type: 'presentation',
            difficulty: 'intermediate',
            duration: 35,
            topics: ['government-agencies', 'CISA', 'NSA', 'FBI', 'PPD-41', 'NCIRP'],
            paths: ['cyber-framework'],
            components: {
                presentation: 'houses/shield/cyber-framework/presentations/cf-mm02-gov-agencies.presentation.html'
            },
            prerequisites: ['shield-cf-mm01-pres'],
            objectives: ['Describe roles of US government agencies', 'Explain federal cyber incident response']
        },
        'shield-cf-mm03-pres': {
            id: 'shield-cf-mm03-pres',
            title: 'MM3: Major Cybersecurity Legislation',
            description: 'Cyber Framework Micromodule 3 — CFAA (18 USC 1030), Van Buren v. US, state data breach notification laws',
            house: 'shield',
            type: 'presentation',
            difficulty: 'intermediate',
            duration: 35,
            topics: ['CFAA', 'Van-Buren', 'data-breach-notification', 'cybersecurity-legislation'],
            paths: ['cyber-framework'],
            components: {
                presentation: 'houses/shield/cyber-framework/presentations/cf-mm03-legislation.presentation.html'
            },
            prerequisites: ['shield-cf-mm02-pres'],
            objectives: ['Explain the CFAA', 'Analyze Van Buren implications', 'Understand state breach notification obligations']
        },
        'shield-cf-mm04-pres': {
            id: 'shield-cf-mm04-pres',
            title: 'MM4: Major Regulatory Frameworks',
            description: 'Cyber Framework Micromodule 4 — FTC Section 5, HIPAA Security Rule, GLBA Safeguards Rule, SEC cyber disclosures',
            house: 'shield',
            type: 'presentation',
            difficulty: 'intermediate',
            duration: 35,
            topics: ['FTC', 'HIPAA', 'GLBA', 'SEC', 'regulatory-frameworks'],
            paths: ['cyber-framework'],
            components: {
                presentation: 'houses/shield/cyber-framework/presentations/cf-mm04-regulatory.presentation.html'
            },
            prerequisites: ['shield-cf-mm03-pres'],
            objectives: ['Describe the regulatory environment', 'Identify chief federal regulators', 'Summarize cybersecurity regulations']
        },
        'shield-cf-mm05-pres': {
            id: 'shield-cf-mm05-pres',
            title: 'MM5: Critical Infrastructure & NIST CSF',
            description: 'Cyber Framework Micromodule 5 — 16 CI sectors, DHS/CISA protection, NIST Cybersecurity Framework 2.0 (Core, Tiers, Profiles)',
            house: 'shield',
            type: 'presentation',
            difficulty: 'intermediate',
            duration: 30,
            topics: ['critical-infrastructure', 'NIST-CSF', 'CISA', 'risk-management'],
            paths: ['cyber-framework'],
            components: {
                presentation: 'houses/shield/cyber-framework/presentations/cf-mm05-nist-cip.presentation.html'
            },
            prerequisites: ['shield-cf-mm04-pres'],
            objectives: ['Describe DHS CI protection', 'Articulate NIST CSF benefits', 'Summarize CSF components']
        },
        'shield-cf-mm06-pres': {
            id: 'shield-cf-mm06-pres',
            title: 'MM6: Encryption Law & Policy',
            description: 'Cyber Framework Micromodule 6 — Going Dark problem, Apple v. FBI, encryption backdoors, 5th Amendment forced decryption, Foregone Conclusion Doctrine',
            house: 'shield',
            type: 'presentation',
            difficulty: 'advanced',
            duration: 35,
            topics: ['encryption', 'Apple-v-FBI', 'going-dark', '5th-amendment', 'forced-decryption'],
            paths: ['cyber-framework'],
            components: {
                presentation: 'houses/shield/cyber-framework/presentations/cf-mm06-encryption.presentation.html'
            },
            prerequisites: ['shield-cf-mm05-pres'],
            objectives: ['Explain the Going Dark problem', 'Summarize Apple v. FBI', 'Analyze forced decryption under 5th Amendment']
        },
        'shield-cf-mm07-pres': {
            id: 'shield-cf-mm07-pres',
            title: 'MM7: Data Breach Litigation',
            description: 'Cyber Framework Micromodule 7 — negligence claims, Article III standing, Economic Loss Doctrine, Clapper, Remijas, Spokeo, TransUnion cases',
            house: 'shield',
            type: 'presentation',
            difficulty: 'advanced',
            duration: 35,
            topics: ['breach-litigation', 'negligence', 'standing', 'economic-loss-doctrine'],
            paths: ['cyber-framework'],
            components: {
                presentation: 'houses/shield/cyber-framework/presentations/cf-mm07-breach-litigation.presentation.html'
            },
            prerequisites: ['shield-cf-mm06-pres'],
            objectives: ['Identify causes of action in breach cases', 'Explain legal standing', 'Analyze standing hurdles']
        },
        'shield-cf-mm08-pres': {
            id: 'shield-cf-mm08-pres',
            title: 'MM8: International Law & Cyber War',
            description: 'Cyber Framework Micromodule 8 — international law in cyberspace, Tallinn Manual, jus ad bellum, jus in bello, NATO Article 5, use of force doctrine',
            house: 'shield',
            type: 'presentation',
            difficulty: 'advanced',
            duration: 40,
            topics: ['international-law', 'cyber-war', 'Tallinn-Manual', 'NATO', 'jus-ad-bellum'],
            paths: ['cyber-framework'],
            components: {
                presentation: 'houses/shield/cyber-framework/presentations/cf-mm08-cyber-war.presentation.html'
            },
            prerequisites: ['shield-cf-mm07-pres'],
            objectives: ['Discuss IL applicability to cyberspace', 'Identify cyber use of force', 'Apply LOAC to cyber operations']
        },
        'shield-cf-mm01-quiz': {
            id: 'shield-cf-mm01-quiz',
            title: 'MM1 Quiz: Cybersecurity Fundamentals',
            description: 'Quiz on CIA Triad, threat actors, motives, competing interests in cybersecurity',
            house: 'shield',
            type: 'quiz',
            difficulty: 'intermediate',
            duration: 15,
            topics: ['CIA-triad', 'threat-actors', 'cybersecurity-policy'],
            paths: ['cyber-framework'],
            components: {
                quiz: 'houses/shield/cyber-framework/quizzes/cf-mm01-quiz.quiz.html'
            },
            prerequisites: ['shield-cf-mm01-pres'],
            objectives: []
        },
        'shield-cf-mm02-quiz': {
            id: 'shield-cf-mm02-quiz',
            title: 'MM2 Quiz: Government Agencies',
            description: 'Quiz on US government agency roles in cybersecurity',
            house: 'shield',
            type: 'quiz',
            difficulty: 'intermediate',
            duration: 15,
            topics: ['government-agencies', 'CISA', 'FBI', 'PPD-41'],
            paths: ['cyber-framework'],
            components: {
                quiz: 'houses/shield/cyber-framework/quizzes/cf-mm02-quiz.quiz.html'
            },
            prerequisites: ['shield-cf-mm02-pres'],
            objectives: []
        },
        'shield-cf-mm03-quiz': {
            id: 'shield-cf-mm03-quiz',
            title: 'MM3 Quiz: CFAA & Data Breach Laws',
            description: 'Quiz on CFAA, Van Buren, state data breach notification laws',
            house: 'shield',
            type: 'quiz',
            difficulty: 'intermediate',
            duration: 15,
            topics: ['CFAA', 'Van-Buren', 'data-breach-notification'],
            paths: ['cyber-framework'],
            components: {
                quiz: 'houses/shield/cyber-framework/quizzes/cf-mm03-quiz.quiz.html'
            },
            prerequisites: ['shield-cf-mm03-pres'],
            objectives: []
        },
        'shield-cf-mm04-quiz': {
            id: 'shield-cf-mm04-quiz',
            title: 'MM4 Quiz: Regulatory Frameworks',
            description: 'Quiz on FTC, HIPAA, GLBA, SEC regulatory frameworks',
            house: 'shield',
            type: 'quiz',
            difficulty: 'intermediate',
            duration: 15,
            topics: ['FTC', 'HIPAA', 'GLBA', 'SEC'],
            paths: ['cyber-framework'],
            components: {
                quiz: 'houses/shield/cyber-framework/quizzes/cf-mm04-quiz.quiz.html'
            },
            prerequisites: ['shield-cf-mm04-pres'],
            objectives: []
        },
        'shield-cf-mm05-quiz': {
            id: 'shield-cf-mm05-quiz',
            title: 'MM5 Quiz: NIST CSF & Critical Infrastructure',
            description: 'Quiz on NIST Cybersecurity Framework, critical infrastructure protection',
            house: 'shield',
            type: 'quiz',
            difficulty: 'intermediate',
            duration: 15,
            topics: ['NIST-CSF', 'critical-infrastructure'],
            paths: ['cyber-framework'],
            components: {
                quiz: 'houses/shield/cyber-framework/quizzes/cf-mm05-quiz.quiz.html'
            },
            prerequisites: ['shield-cf-mm05-pres'],
            objectives: []
        },
        'shield-cf-mm06-quiz': {
            id: 'shield-cf-mm06-quiz',
            title: 'MM6 Quiz: Encryption Law',
            description: 'Quiz on encryption policy, Apple v. FBI, forced decryption, 5th Amendment',
            house: 'shield',
            type: 'quiz',
            difficulty: 'advanced',
            duration: 15,
            topics: ['encryption', 'Apple-v-FBI', '5th-amendment'],
            paths: ['cyber-framework'],
            components: {
                quiz: 'houses/shield/cyber-framework/quizzes/cf-mm06-quiz.quiz.html'
            },
            prerequisites: ['shield-cf-mm06-pres'],
            objectives: []
        },
        'shield-cf-mm07-quiz': {
            id: 'shield-cf-mm07-quiz',
            title: 'MM7 Quiz: Breach Litigation',
            description: 'Quiz on negligence claims, Article III standing, landmark breach cases',
            house: 'shield',
            type: 'quiz',
            difficulty: 'advanced',
            duration: 15,
            topics: ['breach-litigation', 'negligence', 'standing'],
            paths: ['cyber-framework'],
            components: {
                quiz: 'houses/shield/cyber-framework/quizzes/cf-mm07-quiz.quiz.html'
            },
            prerequisites: ['shield-cf-mm07-pres'],
            objectives: []
        },
        'shield-cf-mm08-quiz': {
            id: 'shield-cf-mm08-quiz',
            title: 'MM8 Quiz: International Law & Cyber War',
            description: 'Quiz on international law in cyberspace, use of force, Tallinn Manual, NATO Article 5',
            house: 'shield',
            type: 'quiz',
            difficulty: 'advanced',
            duration: 15,
            topics: ['international-law', 'cyber-war', 'NATO'],
            paths: ['cyber-framework'],
            components: {
                quiz: 'houses/shield/cyber-framework/quizzes/cf-mm08-quiz.quiz.html'
            },
            prerequisites: ['shield-cf-mm08-pres'],
            objectives: []
        },
        'shield-cf-mm01-lab': {
            id: 'shield-cf-mm01-lab',
            title: 'MM1 Lab: Cybersecurity Law Foundations',
            description: 'Hands-on lab analyzing CIA Triad impacts, threat actor profiling, motive analysis, and competing interests',
            house: 'shield',
            type: 'lab',
            difficulty: 'intermediate',
            duration: 45,
            topics: ['CIA-triad', 'threat-actors', 'cybersecurity-policy'],
            paths: ['cyber-framework'],
            components: {
                lab: 'houses/shield/cyber-framework/labs/cf-mm01-intro.lab.html'
            },
            prerequisites: ['shield-cf-mm01-pres'],
            objectives: []
        },
        'shield-cf-mm02-lab': {
            id: 'shield-cf-mm02-lab',
            title: 'MM2 Lab: Government Agencies in Cybersecurity',
            description: 'Lab on agency mission matching, cyber incident response scenarios, NCIRP application',
            house: 'shield',
            type: 'lab',
            difficulty: 'intermediate',
            duration: 45,
            topics: ['government-agencies', 'PPD-41', 'NCIRP'],
            paths: ['cyber-framework'],
            components: {
                lab: 'houses/shield/cyber-framework/labs/cf-mm02-gov-agencies.lab.html'
            },
            prerequisites: ['shield-cf-mm02-pres'],
            objectives: []
        },
        'shield-cf-mm03-lab': {
            id: 'shield-cf-mm03-lab',
            title: 'MM3 Lab: CFAA & Data Breach Notification',
            description: 'Lab on CFAA case analysis, Van Buren application, multi-state breach notification compliance',
            house: 'shield',
            type: 'lab',
            difficulty: 'intermediate',
            duration: 45,
            topics: ['CFAA', 'Van-Buren', 'data-breach-notification'],
            paths: ['cyber-framework'],
            components: {
                lab: 'houses/shield/cyber-framework/labs/cf-mm03-legislation.lab.html'
            },
            prerequisites: ['shield-cf-mm03-pres'],
            objectives: []
        },
        'shield-cf-mm04-lab': {
            id: 'shield-cf-mm04-lab',
            title: 'MM4 Lab: Regulatory Compliance',
            description: 'Lab on regulatory compliance mapping, FTC consent order analysis, HIPAA assessment, SEC disclosure',
            house: 'shield',
            type: 'lab',
            difficulty: 'intermediate',
            duration: 45,
            topics: ['FTC', 'HIPAA', 'GLBA', 'SEC'],
            paths: ['cyber-framework'],
            components: {
                lab: 'houses/shield/cyber-framework/labs/cf-mm04-regulatory.lab.html'
            },
            prerequisites: ['shield-cf-mm04-pres'],
            objectives: []
        },
        'shield-cf-mm05-lab': {
            id: 'shield-cf-mm05-lab',
            title: 'MM5 Lab: NIST Framework Application',
            description: 'Lab on CSF core function mapping, implementation tier assessment, profile gap analysis, CI sector analysis',
            house: 'shield',
            type: 'lab',
            difficulty: 'intermediate',
            duration: 45,
            topics: ['NIST-CSF', 'critical-infrastructure', 'risk-management'],
            paths: ['cyber-framework'],
            components: {
                lab: 'houses/shield/cyber-framework/labs/cf-mm05-nist-cip.lab.html'
            },
            prerequisites: ['shield-cf-mm05-pres'],
            objectives: []
        },
        'shield-cf-mm06-lab': {
            id: 'shield-cf-mm06-lab',
            title: 'MM6 Lab: Encryption Policy Analysis',
            description: 'Lab on Going Dark debate, Apple v. FBI case brief, 5th Amendment decryption scenarios, Foregone Conclusion analysis',
            house: 'shield',
            type: 'lab',
            difficulty: 'advanced',
            duration: 50,
            topics: ['encryption', 'Apple-v-FBI', '5th-amendment'],
            paths: ['cyber-framework'],
            components: {
                lab: 'houses/shield/cyber-framework/labs/cf-mm06-encryption.lab.html'
            },
            prerequisites: ['shield-cf-mm06-pres'],
            objectives: []
        },
        'shield-cf-mm07-lab': {
            id: 'shield-cf-mm07-lab',
            title: 'MM7 Lab: Breach Litigation Analysis',
            description: 'Lab on negligence elements, standing analysis, case comparison, Economic Loss Doctrine application',
            house: 'shield',
            type: 'lab',
            difficulty: 'advanced',
            duration: 50,
            topics: ['breach-litigation', 'negligence', 'standing'],
            paths: ['cyber-framework'],
            components: {
                lab: 'houses/shield/cyber-framework/labs/cf-mm07-breach-litigation.lab.html'
            },
            prerequisites: ['shield-cf-mm07-pres'],
            objectives: []
        },
        'shield-cf-mm08-lab': {
            id: 'shield-cf-mm08-lab',
            title: 'MM8 Lab: International Cyber Law',
            description: 'Lab on use of force spectrum, Tallinn Manual application, IHL principles, NATO Article 5 scenarios',
            house: 'shield',
            type: 'lab',
            difficulty: 'advanced',
            duration: 50,
            topics: ['international-law', 'cyber-war', 'NATO', 'Tallinn-Manual'],
            paths: ['cyber-framework'],
            components: {
                lab: 'houses/shield/cyber-framework/labs/cf-mm08-cyber-war.lab.html'
            },
            prerequisites: ['shield-cf-mm08-pres'],
            objectives: []
        },
        'shield-cf-comprehensive-review': {
            id: 'shield-cf-comprehensive-review',
            title: 'Cyber Framework Comprehensive Review',
            description: 'Jeopardy-style review game covering all 8 micromodules of the Cyber Law & Policy Framework course',
            house: 'shield',
            type: 'quiz',
            difficulty: 'advanced',
            duration: 30,
            topics: ['cyber-law', 'review', 'comprehensive'],
            paths: ['cyber-framework'],
            components: {
                quiz: 'houses/shield/cyber-framework/reviews/cf-comprehensive-review.html'
            },
            prerequisites: [],
            objectives: []
        },


        // ─── SCRIPT HOUSE — Linux Administration ───
        'script-la-ch01-pres': {
            id: 'script-la-ch01-pres',
            title: 'Linux Admin Ch 1: Introduction to Linux',
            description: 'Linux Administration Chapter 1 — Introduction to Linux',
            house: 'script',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 30,
            topics: ["linux","CLI","shell","terminal"],
            paths: ['linux-admin'],
            components: {
                presentation: 'houses/script/linux/presentations/la-ch01-intro.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-la-ch01-quiz': {
            id: 'script-la-ch01-quiz',
            title: 'Linux Admin Ch 1 Quiz: Introduction to Linux',
            description: 'Quiz on Linux Administration Chapter 1 — Introduction to Linux',
            house: 'script',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ["linux","CLI","shell","terminal"],
            paths: ['linux-admin'],
            components: {
                quiz: 'houses/script/linux/quizzes/la-ch01-quiz.quiz.html'
            },
            prerequisites: ['script-la-ch01-pres'],
            objectives: []
        },
        'script-la-ch01-lab': {
            id: 'script-la-ch01-lab',
            title: 'Linux Admin Ch 1 Lab: Introduction to Linux',
            description: 'Hands-on lab for Linux Administration Chapter 1 — Introduction to Linux',
            house: 'script',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ["linux","CLI","shell","terminal"],
            paths: ['linux-admin'],
            components: {
                lab: 'houses/script/linux/labs/la-ch01-intro.lab.html'
            },
            prerequisites: ['script-la-ch01-pres'],
            objectives: []
        },
        'script-la-ch02-pres': {
            id: 'script-la-ch02-pres',
            title: 'Linux Admin Ch 2: Linux Distributions & Uses',
            description: 'Linux Administration Chapter 2 — Linux Distributions & Uses',
            house: 'script',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 30,
            topics: ["distributions","Ubuntu","CentOS","Kali"],
            paths: ['linux-admin'],
            components: {
                presentation: 'houses/script/linux/presentations/la-ch02-distros.presentation.html'
            },
            prerequisites: ['script-la-ch01-pres'],
            objectives: []
        },
        'script-la-ch02-quiz': {
            id: 'script-la-ch02-quiz',
            title: 'Linux Admin Ch 2 Quiz: Linux Distributions & Uses',
            description: 'Quiz on Linux Administration Chapter 2 — Linux Distributions & Uses',
            house: 'script',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ["distributions","Ubuntu","CentOS","Kali"],
            paths: ['linux-admin'],
            components: {
                quiz: 'houses/script/linux/quizzes/la-ch02-quiz.quiz.html'
            },
            prerequisites: ['script-la-ch02-pres'],
            objectives: []
        },
        'script-la-ch02-lab': {
            id: 'script-la-ch02-lab',
            title: 'Linux Admin Ch 2 Lab: Linux Distributions & Uses',
            description: 'Hands-on lab for Linux Administration Chapter 2 — Linux Distributions & Uses',
            house: 'script',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ["distributions","Ubuntu","CentOS","Kali"],
            paths: ['linux-admin'],
            components: {
                lab: 'houses/script/linux/labs/la-ch02-distros.lab.html'
            },
            prerequisites: ['script-la-ch02-pres'],
            objectives: []
        },
        'script-la-ch03-pres': {
            id: 'script-la-ch03-pres',
            title: 'Linux Admin Ch 3: Grep, Pipes & Text Processing',
            description: 'Linux Administration Chapter 3 — Grep, Pipes & Text Processing',
            house: 'script',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 30,
            topics: ["grep","pipes","regex","text-processing"],
            paths: ['linux-admin'],
            components: {
                presentation: 'houses/script/linux/presentations/la-ch03-grep-pipes.presentation.html'
            },
            prerequisites: ['script-la-ch02-pres'],
            objectives: []
        },
        'script-la-ch03-quiz': {
            id: 'script-la-ch03-quiz',
            title: 'Linux Admin Ch 3 Quiz: Grep, Pipes & Text Processing',
            description: 'Quiz on Linux Administration Chapter 3 — Grep, Pipes & Text Processing',
            house: 'script',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ["grep","pipes","regex","text-processing"],
            paths: ['linux-admin'],
            components: {
                quiz: 'houses/script/linux/quizzes/la-ch03-quiz.quiz.html'
            },
            prerequisites: ['script-la-ch03-pres'],
            objectives: []
        },
        'script-la-ch03-lab': {
            id: 'script-la-ch03-lab',
            title: 'Linux Admin Ch 3 Lab: Grep, Pipes & Text Processing',
            description: 'Hands-on lab for Linux Administration Chapter 3 — Grep, Pipes & Text Processing',
            house: 'script',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ["grep","pipes","regex","text-processing"],
            paths: ['linux-admin'],
            components: {
                lab: 'houses/script/linux/labs/la-ch03-grep-pipes.lab.html'
            },
            prerequisites: ['script-la-ch03-pres'],
            objectives: []
        },
        'script-la-ch04-pres': {
            id: 'script-la-ch04-pres',
            title: 'Linux Admin Ch 4: Process Management & Nice Values',
            description: 'Linux Administration Chapter 4 — Process Management & Nice Values',
            house: 'script',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 30,
            topics: ["processes","nice","top","ps","kill"],
            paths: ['linux-admin'],
            components: {
                presentation: 'houses/script/linux/presentations/la-ch04-processes.presentation.html'
            },
            prerequisites: ['script-la-ch03-pres'],
            objectives: []
        },
        'script-la-ch04-quiz': {
            id: 'script-la-ch04-quiz',
            title: 'Linux Admin Ch 4 Quiz: Process Management & Nice Values',
            description: 'Quiz on Linux Administration Chapter 4 — Process Management & Nice Values',
            house: 'script',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ["processes","nice","top","ps","kill"],
            paths: ['linux-admin'],
            components: {
                quiz: 'houses/script/linux/quizzes/la-ch04-quiz.quiz.html'
            },
            prerequisites: ['script-la-ch04-pres'],
            objectives: []
        },
        'script-la-ch04-lab': {
            id: 'script-la-ch04-lab',
            title: 'Linux Admin Ch 4 Lab: Process Management & Nice Values',
            description: 'Hands-on lab for Linux Administration Chapter 4 — Process Management & Nice Values',
            house: 'script',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ["processes","nice","top","ps","kill"],
            paths: ['linux-admin'],
            components: {
                lab: 'houses/script/linux/labs/la-ch04-processes.lab.html'
            },
            prerequisites: ['script-la-ch04-pres'],
            objectives: []
        },
        'script-la-ch05-pres': {
            id: 'script-la-ch05-pres',
            title: 'Linux Admin Ch 5: Daemons & Services',
            description: 'Linux Administration Chapter 5 — Daemons & Services',
            house: 'script',
            type: 'presentation',
            difficulty: 'intermediate',
            duration: 30,
            topics: ["daemons","systemd","services","init"],
            paths: ['linux-admin'],
            components: {
                presentation: 'houses/script/linux/presentations/la-ch05-daemons.presentation.html'
            },
            prerequisites: ['script-la-ch04-pres'],
            objectives: []
        },
        'script-la-ch05-quiz': {
            id: 'script-la-ch05-quiz',
            title: 'Linux Admin Ch 5 Quiz: Daemons & Services',
            description: 'Quiz on Linux Administration Chapter 5 — Daemons & Services',
            house: 'script',
            type: 'quiz',
            difficulty: 'intermediate',
            duration: 15,
            topics: ["daemons","systemd","services","init"],
            paths: ['linux-admin'],
            components: {
                quiz: 'houses/script/linux/quizzes/la-ch05-quiz.quiz.html'
            },
            prerequisites: ['script-la-ch05-pres'],
            objectives: []
        },
        'script-la-ch05-lab': {
            id: 'script-la-ch05-lab',
            title: 'Linux Admin Ch 5 Lab: Daemons & Services',
            description: 'Hands-on lab for Linux Administration Chapter 5 — Daemons & Services',
            house: 'script',
            type: 'lab',
            difficulty: 'intermediate',
            duration: 45,
            topics: ["daemons","systemd","services","init"],
            paths: ['linux-admin'],
            components: {
                lab: 'houses/script/linux/labs/la-ch05-daemons.lab.html'
            },
            prerequisites: ['script-la-ch05-pres'],
            objectives: []
        },
        'script-la-ch06-pres': {
            id: 'script-la-ch06-pres',
            title: 'Linux Admin Ch 6: Initialization, X Windows & Localization',
            description: 'Linux Administration Chapter 6 — Initialization, X Windows & Localization',
            house: 'script',
            type: 'presentation',
            difficulty: 'intermediate',
            duration: 30,
            topics: ["boot","init","X11","localization"],
            paths: ['linux-admin'],
            components: {
                presentation: 'houses/script/linux/presentations/la-ch06-init-xwindows.presentation.html'
            },
            prerequisites: ['script-la-ch05-pres'],
            objectives: []
        },
        'script-la-ch06-quiz': {
            id: 'script-la-ch06-quiz',
            title: 'Linux Admin Ch 6 Quiz: Initialization, X Windows & Localization',
            description: 'Quiz on Linux Administration Chapter 6 — Initialization, X Windows & Localization',
            house: 'script',
            type: 'quiz',
            difficulty: 'intermediate',
            duration: 15,
            topics: ["boot","init","X11","localization"],
            paths: ['linux-admin'],
            components: {
                quiz: 'houses/script/linux/quizzes/la-ch06-quiz.quiz.html'
            },
            prerequisites: ['script-la-ch06-pres'],
            objectives: []
        },
        'script-la-ch06-lab': {
            id: 'script-la-ch06-lab',
            title: 'Linux Admin Ch 6 Lab: Initialization, X Windows & Localization',
            description: 'Hands-on lab for Linux Administration Chapter 6 — Initialization, X Windows & Localization',
            house: 'script',
            type: 'lab',
            difficulty: 'intermediate',
            duration: 45,
            topics: ["boot","init","X11","localization"],
            paths: ['linux-admin'],
            components: {
                lab: 'houses/script/linux/labs/la-ch06-init-xwindows.lab.html'
            },
            prerequisites: ['script-la-ch06-pres'],
            objectives: []
        },
        'script-la-ch07-pres': {
            id: 'script-la-ch07-pres',
            title: 'Linux Admin Ch 7: Display Managers & User Sessions',
            description: 'Linux Administration Chapter 7 — Display Managers & User Sessions',
            house: 'script',
            type: 'presentation',
            difficulty: 'intermediate',
            duration: 30,
            topics: ["display-manager","GDM","LightDM","sessions"],
            paths: ['linux-admin'],
            components: {
                presentation: 'houses/script/linux/presentations/la-ch07-display-mgr.presentation.html'
            },
            prerequisites: ['script-la-ch06-pres'],
            objectives: []
        },
        'script-la-ch07-quiz': {
            id: 'script-la-ch07-quiz',
            title: 'Linux Admin Ch 7 Quiz: Display Managers & User Sessions',
            description: 'Quiz on Linux Administration Chapter 7 — Display Managers & User Sessions',
            house: 'script',
            type: 'quiz',
            difficulty: 'intermediate',
            duration: 15,
            topics: ["display-manager","GDM","LightDM","sessions"],
            paths: ['linux-admin'],
            components: {
                quiz: 'houses/script/linux/quizzes/la-ch07-quiz.quiz.html'
            },
            prerequisites: ['script-la-ch07-pres'],
            objectives: []
        },
        'script-la-ch07-lab': {
            id: 'script-la-ch07-lab',
            title: 'Linux Admin Ch 7 Lab: Display Managers & User Sessions',
            description: 'Hands-on lab for Linux Administration Chapter 7 — Display Managers & User Sessions',
            house: 'script',
            type: 'lab',
            difficulty: 'intermediate',
            duration: 45,
            topics: ["display-manager","GDM","LightDM","sessions"],
            paths: ['linux-admin'],
            components: {
                lab: 'houses/script/linux/labs/la-ch07-display-mgr.lab.html'
            },
            prerequisites: ['script-la-ch07-pres'],
            objectives: []
        },
        'script-la-ch08-pres': {
            id: 'script-la-ch08-pres',
            title: 'Linux Admin Ch 8: Network Interface Configuration',
            description: 'Linux Administration Chapter 8 — Network Interface Configuration',
            house: 'script',
            type: 'presentation',
            difficulty: 'intermediate',
            duration: 30,
            topics: ["networking","ifconfig","ip","netplan"],
            paths: ['linux-admin'],
            components: {
                presentation: 'houses/script/linux/presentations/la-ch08-network.presentation.html'
            },
            prerequisites: ['script-la-ch07-pres'],
            objectives: []
        },
        'script-la-ch08-quiz': {
            id: 'script-la-ch08-quiz',
            title: 'Linux Admin Ch 8 Quiz: Network Interface Configuration',
            description: 'Quiz on Linux Administration Chapter 8 — Network Interface Configuration',
            house: 'script',
            type: 'quiz',
            difficulty: 'intermediate',
            duration: 15,
            topics: ["networking","ifconfig","ip","netplan"],
            paths: ['linux-admin'],
            components: {
                quiz: 'houses/script/linux/quizzes/la-ch08-quiz.quiz.html'
            },
            prerequisites: ['script-la-ch08-pres'],
            objectives: []
        },
        'script-la-ch08-lab': {
            id: 'script-la-ch08-lab',
            title: 'Linux Admin Ch 8 Lab: Network Interface Configuration',
            description: 'Hands-on lab for Linux Administration Chapter 8 — Network Interface Configuration',
            house: 'script',
            type: 'lab',
            difficulty: 'intermediate',
            duration: 45,
            topics: ["networking","ifconfig","ip","netplan"],
            paths: ['linux-admin'],
            components: {
                lab: 'houses/script/linux/labs/la-ch08-network.lab.html'
            },
            prerequisites: ['script-la-ch08-pres'],
            objectives: []
        },
        'script-la-ch09-pres': {
            id: 'script-la-ch09-pres',
            title: 'Linux Admin Ch 9: IPv4 Protocol & Networking',
            description: 'Linux Administration Chapter 9 — IPv4 Protocol & Networking',
            house: 'script',
            type: 'presentation',
            difficulty: 'advanced',
            duration: 30,
            topics: ["IPv4","TCP-IP","subnetting","routing"],
            paths: ['linux-admin'],
            components: {
                presentation: 'houses/script/linux/presentations/la-ch09-ipv4.presentation.html'
            },
            prerequisites: ['script-la-ch08-pres'],
            objectives: []
        },
        'script-la-ch09-quiz': {
            id: 'script-la-ch09-quiz',
            title: 'Linux Admin Ch 9 Quiz: IPv4 Protocol & Networking',
            description: 'Quiz on Linux Administration Chapter 9 — IPv4 Protocol & Networking',
            house: 'script',
            type: 'quiz',
            difficulty: 'advanced',
            duration: 15,
            topics: ["IPv4","TCP-IP","subnetting","routing"],
            paths: ['linux-admin'],
            components: {
                quiz: 'houses/script/linux/quizzes/la-ch09-quiz.quiz.html'
            },
            prerequisites: ['script-la-ch09-pres'],
            objectives: []
        },
        'script-la-ch09-lab': {
            id: 'script-la-ch09-lab',
            title: 'Linux Admin Ch 9 Lab: IPv4 Protocol & Networking',
            description: 'Hands-on lab for Linux Administration Chapter 9 — IPv4 Protocol & Networking',
            house: 'script',
            type: 'lab',
            difficulty: 'advanced',
            duration: 45,
            topics: ["IPv4","TCP-IP","subnetting","routing"],
            paths: ['linux-admin'],
            components: {
                lab: 'houses/script/linux/labs/la-ch09-ipv4.lab.html'
            },
            prerequisites: ['script-la-ch09-pres'],
            objectives: []
        },
        'script-la-ch10-pres': {
            id: 'script-la-ch10-pres',
            title: 'Linux Admin Ch 10: File Compression & Archiving',
            description: 'Linux Administration Chapter 10 — File Compression & Archiving',
            house: 'script',
            type: 'presentation',
            difficulty: 'advanced',
            duration: 30,
            topics: ["tar","gzip","bzip2","compression"],
            paths: ['linux-admin'],
            components: {
                presentation: 'houses/script/linux/presentations/la-ch10-compression.presentation.html'
            },
            prerequisites: ['script-la-ch09-pres'],
            objectives: []
        },
        'script-la-ch10-quiz': {
            id: 'script-la-ch10-quiz',
            title: 'Linux Admin Ch 10 Quiz: File Compression & Archiving',
            description: 'Quiz on Linux Administration Chapter 10 — File Compression & Archiving',
            house: 'script',
            type: 'quiz',
            difficulty: 'advanced',
            duration: 15,
            topics: ["tar","gzip","bzip2","compression"],
            paths: ['linux-admin'],
            components: {
                quiz: 'houses/script/linux/quizzes/la-ch10-quiz.quiz.html'
            },
            prerequisites: ['script-la-ch10-pres'],
            objectives: []
        },
        'script-la-ch10-lab': {
            id: 'script-la-ch10-lab',
            title: 'Linux Admin Ch 10 Lab: File Compression & Archiving',
            description: 'Hands-on lab for Linux Administration Chapter 10 — File Compression & Archiving',
            house: 'script',
            type: 'lab',
            difficulty: 'advanced',
            duration: 45,
            topics: ["tar","gzip","bzip2","compression"],
            paths: ['linux-admin'],
            components: {
                lab: 'houses/script/linux/labs/la-ch10-compression.lab.html'
            },
            prerequisites: ['script-la-ch10-pres'],
            objectives: []
        },
        'script-la-ch11-pres': {
            id: 'script-la-ch11-pres',
            title: 'Linux Admin Ch 11: Linux Encryption',
            description: 'Linux Administration Chapter 11 — Linux Encryption',
            house: 'script',
            type: 'presentation',
            difficulty: 'advanced',
            duration: 30,
            topics: ["GPG","LUKS","encryption","hashing"],
            paths: ['linux-admin'],
            components: {
                presentation: 'houses/script/linux/presentations/la-ch11-encryption.presentation.html'
            },
            prerequisites: ['script-la-ch10-pres'],
            objectives: []
        },
        'script-la-ch11-quiz': {
            id: 'script-la-ch11-quiz',
            title: 'Linux Admin Ch 11 Quiz: Linux Encryption',
            description: 'Quiz on Linux Administration Chapter 11 — Linux Encryption',
            house: 'script',
            type: 'quiz',
            difficulty: 'advanced',
            duration: 15,
            topics: ["GPG","LUKS","encryption","hashing"],
            paths: ['linux-admin'],
            components: {
                quiz: 'houses/script/linux/quizzes/la-ch11-quiz.quiz.html'
            },
            prerequisites: ['script-la-ch11-pres'],
            objectives: []
        },
        'script-la-ch11-lab': {
            id: 'script-la-ch11-lab',
            title: 'Linux Admin Ch 11 Lab: Linux Encryption',
            description: 'Hands-on lab for Linux Administration Chapter 11 — Linux Encryption',
            house: 'script',
            type: 'lab',
            difficulty: 'advanced',
            duration: 45,
            topics: ["GPG","LUKS","encryption","hashing"],
            paths: ['linux-admin'],
            components: {
                lab: 'houses/script/linux/labs/la-ch11-encryption.lab.html'
            },
            prerequisites: ['script-la-ch11-pres'],
            objectives: []
        },
        'script-la-ch12-pres': {
            id: 'script-la-ch12-pres',
            title: 'Linux Admin Ch 12: Compiling Source Code',
            description: 'Linux Administration Chapter 12 — Compiling Source Code',
            house: 'script',
            type: 'presentation',
            difficulty: 'advanced',
            duration: 30,
            topics: ["gcc","make","compilation","source-code"],
            paths: ['linux-admin'],
            components: {
                presentation: 'houses/script/linux/presentations/la-ch12-compile.presentation.html'
            },
            prerequisites: ['script-la-ch11-pres'],
            objectives: []
        },
        'script-la-ch12-quiz': {
            id: 'script-la-ch12-quiz',
            title: 'Linux Admin Ch 12 Quiz: Compiling Source Code',
            description: 'Quiz on Linux Administration Chapter 12 — Compiling Source Code',
            house: 'script',
            type: 'quiz',
            difficulty: 'advanced',
            duration: 15,
            topics: ["gcc","make","compilation","source-code"],
            paths: ['linux-admin'],
            components: {
                quiz: 'houses/script/linux/quizzes/la-ch12-quiz.quiz.html'
            },
            prerequisites: ['script-la-ch12-pres'],
            objectives: []
        },
        'script-la-ch12-lab': {
            id: 'script-la-ch12-lab',
            title: 'Linux Admin Ch 12 Lab: Compiling Source Code',
            description: 'Hands-on lab for Linux Administration Chapter 12 — Compiling Source Code',
            house: 'script',
            type: 'lab',
            difficulty: 'advanced',
            duration: 45,
            topics: ["gcc","make","compilation","source-code"],
            paths: ['linux-admin'],
            components: {
                lab: 'houses/script/linux/labs/la-ch12-compile.lab.html'
            },
            prerequisites: ['script-la-ch12-pres'],
            objectives: []
        },
        'script-la-comprehensive-review': {
            id: 'script-la-comprehensive-review',
            title: 'Linux Administration Comprehensive Review',
            description: 'Jeopardy-style review game covering all 12 chapters of the Linux Administration course',
            house: 'script',
            type: 'quiz',
            difficulty: 'advanced',
            duration: 30,
            topics: ['linux', 'review', 'comprehensive'],
            paths: ['linux-admin'],
            components: {
                quiz: 'houses/script/linux/reviews/la-comprehensive-review.html'
            },
            prerequisites: [],
            objectives: []
        },
        // ─── EYE HOUSE — CompTIA CySA+ (CS0-003) ───
        'eye-cysa-ch01-pres': {
            id: 'eye-cysa-ch01-pres',
            title: 'CySA+ Ch 1: Today\u2019s Cybersecurity Analyst',
            description: 'CompTIA CySA+ Chapter 1 \u2014 Today\u2019s Cybersecurity Analyst',
            house: 'eye',
            type: 'presentation',
            difficulty: 'intermediate',
            duration: 35,
            topics: ["SOC","CIA-triad","cybersecurity-analyst","frameworks"],
            paths: ['cysa'],
            components: {
                presentation: 'houses/eye/cysa/presentations/cysa-ch01-analyst.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-cysa-ch01-quiz': {
            id: 'eye-cysa-ch01-quiz',
            title: 'CySA+ Ch 1 Quiz: Today\u2019s Cybersecurity Analyst',
            description: 'Quiz on CySA+ Chapter 1 \u2014 Today\u2019s Cybersecurity Analyst',
            house: 'eye',
            type: 'quiz',
            difficulty: 'intermediate',
            duration: 15,
            topics: ["SOC","CIA-triad","cybersecurity-analyst","frameworks"],
            paths: ['cysa'],
            components: {
                quiz: 'houses/eye/cysa/quizzes/cysa-ch01-quiz.quiz.html'
            },
            prerequisites: ['eye-cysa-ch01-pres'],
            objectives: []
        },
        'eye-cysa-ch01-lab': {
            id: 'eye-cysa-ch01-lab',
            title: 'CySA+ Ch 1 Lab: Today\u2019s Cybersecurity Analyst',
            description: 'Hands-on lab for CySA+ Chapter 1 \u2014 Today\u2019s Cybersecurity Analyst',
            house: 'eye',
            type: 'lab',
            difficulty: 'intermediate',
            duration: 45,
            topics: ["SOC","CIA-triad","cybersecurity-analyst","frameworks"],
            paths: ['cysa'],
            components: {
                lab: 'houses/eye/cysa/labs/cysa-ch01-analyst.lab.html'
            },
            prerequisites: ['eye-cysa-ch01-pres'],
            objectives: []
        },
        'eye-cysa-ch02-pres': {
            id: 'eye-cysa-ch02-pres',
            title: 'CySA+ Ch 2: Using Threat Intelligence',
            description: 'CompTIA CySA+ Chapter 2 — Using Threat Intelligence',
            house: 'eye',
            type: 'presentation',
            difficulty: 'intermediate',
            duration: 35,
            topics: ["threat-intelligence","STIX","TAXII","OSINT"],
            paths: ['cysa'],
            components: {
                presentation: 'houses/eye/cysa/presentations/cysa-ch02-threat-intel.presentation.html'
            },
            prerequisites: ['eye-cysa-ch01-pres'],
            objectives: []
        },
        'eye-cysa-ch02-quiz': {
            id: 'eye-cysa-ch02-quiz',
            title: 'CySA+ Ch 2 Quiz: Using Threat Intelligence',
            description: 'Quiz on CySA+ Chapter 2 — Using Threat Intelligence',
            house: 'eye',
            type: 'quiz',
            difficulty: 'intermediate',
            duration: 15,
            topics: ["threat-intelligence","STIX","TAXII","OSINT"],
            paths: ['cysa'],
            components: {
                quiz: 'houses/eye/cysa/quizzes/cysa-ch02-quiz.quiz.html'
            },
            prerequisites: ['eye-cysa-ch02-pres'],
            objectives: []
        },
        'eye-cysa-ch02-lab': {
            id: 'eye-cysa-ch02-lab',
            title: 'CySA+ Ch 2 Lab: Using Threat Intelligence',
            description: 'Hands-on lab for CySA+ Chapter 2 — Using Threat Intelligence',
            house: 'eye',
            type: 'lab',
            difficulty: 'intermediate',
            duration: 45,
            topics: ["threat-intelligence","STIX","TAXII","OSINT"],
            paths: ['cysa'],
            components: {
                lab: 'houses/eye/cysa/labs/cysa-ch02-threat-intel.lab.html'
            },
            prerequisites: ['eye-cysa-ch02-pres'],
            objectives: []
        },
        'eye-cysa-ch03-pres': {
            id: 'eye-cysa-ch03-pres',
            title: 'CySA+ Ch 3: Reconnaissance & Intelligence Gathering',
            description: 'CompTIA CySA+ Chapter 3 — Reconnaissance & Intelligence Gathering',
            house: 'eye',
            type: 'presentation',
            difficulty: 'intermediate',
            duration: 35,
            topics: ["reconnaissance","enumeration","OSINT","pentesting"],
            paths: ['cysa'],
            components: {
                presentation: 'houses/eye/cysa/presentations/cysa-ch03-recon.presentation.html'
            },
            prerequisites: ['eye-cysa-ch02-pres'],
            objectives: []
        },
        'eye-cysa-ch03-quiz': {
            id: 'eye-cysa-ch03-quiz',
            title: 'CySA+ Ch 3 Quiz: Reconnaissance & Intelligence Gathering',
            description: 'Quiz on CySA+ Chapter 3 — Reconnaissance & Intelligence Gathering',
            house: 'eye',
            type: 'quiz',
            difficulty: 'intermediate',
            duration: 15,
            topics: ["reconnaissance","enumeration","OSINT","pentesting"],
            paths: ['cysa'],
            components: {
                quiz: 'houses/eye/cysa/quizzes/cysa-ch03-quiz.quiz.html'
            },
            prerequisites: ['eye-cysa-ch03-pres'],
            objectives: []
        },
        'eye-cysa-ch03-lab': {
            id: 'eye-cysa-ch03-lab',
            title: 'CySA+ Ch 3 Lab: Reconnaissance & Intelligence Gathering',
            description: 'Hands-on lab for CySA+ Chapter 3 — Reconnaissance & Intelligence Gathering',
            house: 'eye',
            type: 'lab',
            difficulty: 'intermediate',
            duration: 45,
            topics: ["reconnaissance","enumeration","OSINT","pentesting"],
            paths: ['cysa'],
            components: {
                lab: 'houses/eye/cysa/labs/cysa-ch03-recon.lab.html'
            },
            prerequisites: ['eye-cysa-ch03-pres'],
            objectives: []
        },
        'eye-cysa-ch04-pres': {
            id: 'eye-cysa-ch04-pres',
            title: 'CySA+ Ch 4: Vulnerability Management Program',
            description: 'CompTIA CySA+ Chapter 4 — Vulnerability Management Program',
            house: 'eye',
            type: 'presentation',
            difficulty: 'intermediate',
            duration: 35,
            topics: ["vulnerability-management","risk-assessment","scanning"],
            paths: ['cysa'],
            components: {
                presentation: 'houses/eye/cysa/presentations/cysa-ch04-vuln-mgmt.presentation.html'
            },
            prerequisites: ['eye-cysa-ch03-pres'],
            objectives: []
        },
        'eye-cysa-ch04-quiz': {
            id: 'eye-cysa-ch04-quiz',
            title: 'CySA+ Ch 4 Quiz: Vulnerability Management Program',
            description: 'Quiz on CySA+ Chapter 4 — Vulnerability Management Program',
            house: 'eye',
            type: 'quiz',
            difficulty: 'intermediate',
            duration: 15,
            topics: ["vulnerability-management","risk-assessment","scanning"],
            paths: ['cysa'],
            components: {
                quiz: 'houses/eye/cysa/quizzes/cysa-ch04-quiz.quiz.html'
            },
            prerequisites: ['eye-cysa-ch04-pres'],
            objectives: []
        },
        'eye-cysa-ch04-lab': {
            id: 'eye-cysa-ch04-lab',
            title: 'CySA+ Ch 4 Lab: Vulnerability Management Program',
            description: 'Hands-on lab for CySA+ Chapter 4 — Vulnerability Management Program',
            house: 'eye',
            type: 'lab',
            difficulty: 'intermediate',
            duration: 45,
            topics: ["vulnerability-management","risk-assessment","scanning"],
            paths: ['cysa'],
            components: {
                lab: 'houses/eye/cysa/labs/cysa-ch04-vuln-mgmt.lab.html'
            },
            prerequisites: ['eye-cysa-ch04-pres'],
            objectives: []
        },
        'eye-cysa-ch05-pres': {
            id: 'eye-cysa-ch05-pres',
            title: 'CySA+ Ch 5: Analyzing Vulnerability Scans',
            description: 'CompTIA CySA+ Chapter 5 — Analyzing Vulnerability Scans',
            house: 'eye',
            type: 'presentation',
            difficulty: 'intermediate',
            duration: 35,
            topics: ["vulnerability-scanning","CVSS","Nessus","scan-analysis"],
            paths: ['cysa'],
            components: {
                presentation: 'houses/eye/cysa/presentations/cysa-ch05-vuln-scans.presentation.html'
            },
            prerequisites: ['eye-cysa-ch04-pres'],
            objectives: []
        },
        'eye-cysa-ch05-quiz': {
            id: 'eye-cysa-ch05-quiz',
            title: 'CySA+ Ch 5 Quiz: Analyzing Vulnerability Scans',
            description: 'Quiz on CySA+ Chapter 5 — Analyzing Vulnerability Scans',
            house: 'eye',
            type: 'quiz',
            difficulty: 'intermediate',
            duration: 15,
            topics: ["vulnerability-scanning","CVSS","Nessus","scan-analysis"],
            paths: ['cysa'],
            components: {
                quiz: 'houses/eye/cysa/quizzes/cysa-ch05-quiz.quiz.html'
            },
            prerequisites: ['eye-cysa-ch05-pres'],
            objectives: []
        },
        'eye-cysa-ch05-lab': {
            id: 'eye-cysa-ch05-lab',
            title: 'CySA+ Ch 5 Lab: Analyzing Vulnerability Scans',
            description: 'Hands-on lab for CySA+ Chapter 5 — Analyzing Vulnerability Scans',
            house: 'eye',
            type: 'lab',
            difficulty: 'intermediate',
            duration: 45,
            topics: ["vulnerability-scanning","CVSS","Nessus","scan-analysis"],
            paths: ['cysa'],
            components: {
                lab: 'houses/eye/cysa/labs/cysa-ch05-vuln-scans.lab.html'
            },
            prerequisites: ['eye-cysa-ch05-pres'],
            objectives: []
        },
        'eye-cysa-ch06-pres': {
            id: 'eye-cysa-ch06-pres',
            title: 'CySA+ Ch 6: Cloud Security',
            description: 'CompTIA CySA+ Chapter 6 — Cloud Security',
            house: 'eye',
            type: 'presentation',
            difficulty: 'intermediate',
            duration: 35,
            topics: ["cloud-security","IaaS","PaaS","SaaS","shared-responsibility"],
            paths: ['cysa'],
            components: {
                presentation: 'houses/eye/cysa/presentations/cysa-ch06-cloud.presentation.html'
            },
            prerequisites: ['eye-cysa-ch05-pres'],
            objectives: []
        },
        'eye-cysa-ch06-quiz': {
            id: 'eye-cysa-ch06-quiz',
            title: 'CySA+ Ch 6 Quiz: Cloud Security',
            description: 'Quiz on CySA+ Chapter 6 — Cloud Security',
            house: 'eye',
            type: 'quiz',
            difficulty: 'intermediate',
            duration: 15,
            topics: ["cloud-security","IaaS","PaaS","SaaS","shared-responsibility"],
            paths: ['cysa'],
            components: {
                quiz: 'houses/eye/cysa/quizzes/cysa-ch06-quiz.quiz.html'
            },
            prerequisites: ['eye-cysa-ch06-pres'],
            objectives: []
        },
        'eye-cysa-ch06-lab': {
            id: 'eye-cysa-ch06-lab',
            title: 'CySA+ Ch 6 Lab: Cloud Security',
            description: 'Hands-on lab for CySA+ Chapter 6 — Cloud Security',
            house: 'eye',
            type: 'lab',
            difficulty: 'intermediate',
            duration: 45,
            topics: ["cloud-security","IaaS","PaaS","SaaS","shared-responsibility"],
            paths: ['cysa'],
            components: {
                lab: 'houses/eye/cysa/labs/cysa-ch06-cloud.lab.html'
            },
            prerequisites: ['eye-cysa-ch06-pres'],
            objectives: []
        },
        'eye-cysa-ch07-pres': {
            id: 'eye-cysa-ch07-pres',
            title: 'CySA+ Ch 7: Infrastructure Security & Controls',
            description: 'CompTIA CySA+ Chapter 7 — Infrastructure Security & Controls',
            house: 'eye',
            type: 'presentation',
            difficulty: 'intermediate',
            duration: 35,
            topics: ["infrastructure-security","network-controls","hardening"],
            paths: ['cysa'],
            components: {
                presentation: 'houses/eye/cysa/presentations/cysa-ch07-infra.presentation.html'
            },
            prerequisites: ['eye-cysa-ch06-pres'],
            objectives: []
        },
        'eye-cysa-ch07-quiz': {
            id: 'eye-cysa-ch07-quiz',
            title: 'CySA+ Ch 7 Quiz: Infrastructure Security & Controls',
            description: 'Quiz on CySA+ Chapter 7 — Infrastructure Security & Controls',
            house: 'eye',
            type: 'quiz',
            difficulty: 'intermediate',
            duration: 15,
            topics: ["infrastructure-security","network-controls","hardening"],
            paths: ['cysa'],
            components: {
                quiz: 'houses/eye/cysa/quizzes/cysa-ch07-quiz.quiz.html'
            },
            prerequisites: ['eye-cysa-ch07-pres'],
            objectives: []
        },
        'eye-cysa-ch07-lab': {
            id: 'eye-cysa-ch07-lab',
            title: 'CySA+ Ch 7 Lab: Infrastructure Security & Controls',
            description: 'Hands-on lab for CySA+ Chapter 7 — Infrastructure Security & Controls',
            house: 'eye',
            type: 'lab',
            difficulty: 'intermediate',
            duration: 45,
            topics: ["infrastructure-security","network-controls","hardening"],
            paths: ['cysa'],
            components: {
                lab: 'houses/eye/cysa/labs/cysa-ch07-infra.lab.html'
            },
            prerequisites: ['eye-cysa-ch07-pres'],
            objectives: []
        },
        'eye-cysa-ch08-pres': {
            id: 'eye-cysa-ch08-pres',
            title: 'CySA+ Ch 8: Identity & Access Management',
            description: 'CompTIA CySA+ Chapter 8 — Identity & Access Management',
            house: 'eye',
            type: 'presentation',
            difficulty: 'intermediate',
            duration: 35,
            topics: ["IAM","authentication","authorization","MFA"],
            paths: ['cysa'],
            components: {
                presentation: 'houses/eye/cysa/presentations/cysa-ch08-iam.presentation.html'
            },
            prerequisites: ['eye-cysa-ch07-pres'],
            objectives: []
        },
        'eye-cysa-ch08-quiz': {
            id: 'eye-cysa-ch08-quiz',
            title: 'CySA+ Ch 8 Quiz: Identity & Access Management',
            description: 'Quiz on CySA+ Chapter 8 — Identity & Access Management',
            house: 'eye',
            type: 'quiz',
            difficulty: 'intermediate',
            duration: 15,
            topics: ["IAM","authentication","authorization","MFA"],
            paths: ['cysa'],
            components: {
                quiz: 'houses/eye/cysa/quizzes/cysa-ch08-quiz.quiz.html'
            },
            prerequisites: ['eye-cysa-ch08-pres'],
            objectives: []
        },
        'eye-cysa-ch08-lab': {
            id: 'eye-cysa-ch08-lab',
            title: 'CySA+ Ch 8 Lab: Identity & Access Management',
            description: 'Hands-on lab for CySA+ Chapter 8 — Identity & Access Management',
            house: 'eye',
            type: 'lab',
            difficulty: 'intermediate',
            duration: 45,
            topics: ["IAM","authentication","authorization","MFA"],
            paths: ['cysa'],
            components: {
                lab: 'houses/eye/cysa/labs/cysa-ch08-iam.lab.html'
            },
            prerequisites: ['eye-cysa-ch08-pres'],
            objectives: []
        },
        'eye-cysa-ch09-pres': {
            id: 'eye-cysa-ch09-pres',
            title: 'CySA+ Ch 9: Software & Hardware Development Security',
            description: 'CompTIA CySA+ Chapter 9 — Software & Hardware Development Security',
            house: 'eye',
            type: 'presentation',
            difficulty: 'advanced',
            duration: 35,
            topics: ["SDLC","secure-coding","DevSecOps"],
            paths: ['cysa'],
            components: {
                presentation: 'houses/eye/cysa/presentations/cysa-ch09-dev-security.presentation.html'
            },
            prerequisites: ['eye-cysa-ch08-pres'],
            objectives: []
        },
        'eye-cysa-ch09-quiz': {
            id: 'eye-cysa-ch09-quiz',
            title: 'CySA+ Ch 9 Quiz: Software & Hardware Development Security',
            description: 'Quiz on CySA+ Chapter 9 — Software & Hardware Development Security',
            house: 'eye',
            type: 'quiz',
            difficulty: 'advanced',
            duration: 15,
            topics: ["SDLC","secure-coding","DevSecOps"],
            paths: ['cysa'],
            components: {
                quiz: 'houses/eye/cysa/quizzes/cysa-ch09-quiz.quiz.html'
            },
            prerequisites: ['eye-cysa-ch09-pres'],
            objectives: []
        },
        'eye-cysa-ch09-lab': {
            id: 'eye-cysa-ch09-lab',
            title: 'CySA+ Ch 9 Lab: Software & Hardware Development Security',
            description: 'Hands-on lab for CySA+ Chapter 9 — Software & Hardware Development Security',
            house: 'eye',
            type: 'lab',
            difficulty: 'advanced',
            duration: 45,
            topics: ["SDLC","secure-coding","DevSecOps"],
            paths: ['cysa'],
            components: {
                lab: 'houses/eye/cysa/labs/cysa-ch09-dev-security.lab.html'
            },
            prerequisites: ['eye-cysa-ch09-pres'],
            objectives: []
        },
        'eye-cysa-ch10-pres': {
            id: 'eye-cysa-ch10-pres',
            title: 'CySA+ Ch 10: Security Operations & Monitoring',
            description: 'CompTIA CySA+ Chapter 10 — Security Operations & Monitoring',
            house: 'eye',
            type: 'presentation',
            difficulty: 'advanced',
            duration: 35,
            topics: ["SIEM","security-monitoring","SOC-operations","logging"],
            paths: ['cysa'],
            components: {
                presentation: 'houses/eye/cysa/presentations/cysa-ch10-secops.presentation.html'
            },
            prerequisites: ['eye-cysa-ch09-pres'],
            objectives: []
        },
        'eye-cysa-ch10-quiz': {
            id: 'eye-cysa-ch10-quiz',
            title: 'CySA+ Ch 10 Quiz: Security Operations & Monitoring',
            description: 'Quiz on CySA+ Chapter 10 — Security Operations & Monitoring',
            house: 'eye',
            type: 'quiz',
            difficulty: 'advanced',
            duration: 15,
            topics: ["SIEM","security-monitoring","SOC-operations","logging"],
            paths: ['cysa'],
            components: {
                quiz: 'houses/eye/cysa/quizzes/cysa-ch10-quiz.quiz.html'
            },
            prerequisites: ['eye-cysa-ch10-pres'],
            objectives: []
        },
        'eye-cysa-ch10-lab': {
            id: 'eye-cysa-ch10-lab',
            title: 'CySA+ Ch 10 Lab: Security Operations & Monitoring',
            description: 'Hands-on lab for CySA+ Chapter 10 — Security Operations & Monitoring',
            house: 'eye',
            type: 'lab',
            difficulty: 'advanced',
            duration: 45,
            topics: ["SIEM","security-monitoring","SOC-operations","logging"],
            paths: ['cysa'],
            components: {
                lab: 'houses/eye/cysa/labs/cysa-ch10-secops.lab.html'
            },
            prerequisites: ['eye-cysa-ch10-pres'],
            objectives: []
        },
        'eye-cysa-ch11-pres': {
            id: 'eye-cysa-ch11-pres',
            title: 'CySA+ Ch 11: Building an Incident Response Program',
            description: 'CompTIA CySA+ Chapter 11 — Building an Incident Response Program',
            house: 'eye',
            type: 'presentation',
            difficulty: 'advanced',
            duration: 35,
            topics: ["incident-response","IR-planning","NIST-800-61"],
            paths: ['cysa'],
            components: {
                presentation: 'houses/eye/cysa/presentations/cysa-ch11-ir.presentation.html'
            },
            prerequisites: ['eye-cysa-ch10-pres'],
            objectives: []
        },
        'eye-cysa-ch11-quiz': {
            id: 'eye-cysa-ch11-quiz',
            title: 'CySA+ Ch 11 Quiz: Building an Incident Response Program',
            description: 'Quiz on CySA+ Chapter 11 — Building an Incident Response Program',
            house: 'eye',
            type: 'quiz',
            difficulty: 'advanced',
            duration: 15,
            topics: ["incident-response","IR-planning","NIST-800-61"],
            paths: ['cysa'],
            components: {
                quiz: 'houses/eye/cysa/quizzes/cysa-ch11-quiz.quiz.html'
            },
            prerequisites: ['eye-cysa-ch11-pres'],
            objectives: []
        },
        'eye-cysa-ch11-lab': {
            id: 'eye-cysa-ch11-lab',
            title: 'CySA+ Ch 11 Lab: Building an Incident Response Program',
            description: 'Hands-on lab for CySA+ Chapter 11 — Building an Incident Response Program',
            house: 'eye',
            type: 'lab',
            difficulty: 'advanced',
            duration: 45,
            topics: ["incident-response","IR-planning","NIST-800-61"],
            paths: ['cysa'],
            components: {
                lab: 'houses/eye/cysa/labs/cysa-ch11-ir.lab.html'
            },
            prerequisites: ['eye-cysa-ch11-pres'],
            objectives: []
        },
        'eye-cysa-ch12-pres': {
            id: 'eye-cysa-ch12-pres',
            title: 'CySA+ Ch 12: Analyzing Indicators of Compromise',
            description: 'CompTIA CySA+ Chapter 12 — Analyzing Indicators of Compromise',
            house: 'eye',
            type: 'presentation',
            difficulty: 'advanced',
            duration: 35,
            topics: ["IOC","threat-analysis","malware-indicators","network-indicators"],
            paths: ['cysa'],
            components: {
                presentation: 'houses/eye/cysa/presentations/cysa-ch12-ioc.presentation.html'
            },
            prerequisites: ['eye-cysa-ch11-pres'],
            objectives: []
        },
        'eye-cysa-ch12-quiz': {
            id: 'eye-cysa-ch12-quiz',
            title: 'CySA+ Ch 12 Quiz: Analyzing Indicators of Compromise',
            description: 'Quiz on CySA+ Chapter 12 — Analyzing Indicators of Compromise',
            house: 'eye',
            type: 'quiz',
            difficulty: 'advanced',
            duration: 15,
            topics: ["IOC","threat-analysis","malware-indicators","network-indicators"],
            paths: ['cysa'],
            components: {
                quiz: 'houses/eye/cysa/quizzes/cysa-ch12-quiz.quiz.html'
            },
            prerequisites: ['eye-cysa-ch12-pres'],
            objectives: []
        },
        'eye-cysa-ch12-lab': {
            id: 'eye-cysa-ch12-lab',
            title: 'CySA+ Ch 12 Lab: Analyzing Indicators of Compromise',
            description: 'Hands-on lab for CySA+ Chapter 12 — Analyzing Indicators of Compromise',
            house: 'eye',
            type: 'lab',
            difficulty: 'advanced',
            duration: 45,
            topics: ["IOC","threat-analysis","malware-indicators","network-indicators"],
            paths: ['cysa'],
            components: {
                lab: 'houses/eye/cysa/labs/cysa-ch12-ioc.lab.html'
            },
            prerequisites: ['eye-cysa-ch12-pres'],
            objectives: []
        },
        'eye-cysa-ch13-pres': {
            id: 'eye-cysa-ch13-pres',
            title: 'CySA+ Ch 13: Forensic Analysis & Techniques',
            description: 'CompTIA CySA+ Chapter 13 — Forensic Analysis & Techniques',
            house: 'eye',
            type: 'presentation',
            difficulty: 'advanced',
            duration: 35,
            topics: ["digital-forensics","evidence-collection","chain-of-custody"],
            paths: ['cysa'],
            components: {
                presentation: 'houses/eye/cysa/presentations/cysa-ch13-forensics.presentation.html'
            },
            prerequisites: ['eye-cysa-ch12-pres'],
            objectives: []
        },
        'eye-cysa-ch13-quiz': {
            id: 'eye-cysa-ch13-quiz',
            title: 'CySA+ Ch 13 Quiz: Forensic Analysis & Techniques',
            description: 'Quiz on CySA+ Chapter 13 — Forensic Analysis & Techniques',
            house: 'eye',
            type: 'quiz',
            difficulty: 'advanced',
            duration: 15,
            topics: ["digital-forensics","evidence-collection","chain-of-custody"],
            paths: ['cysa'],
            components: {
                quiz: 'houses/eye/cysa/quizzes/cysa-ch13-quiz.quiz.html'
            },
            prerequisites: ['eye-cysa-ch13-pres'],
            objectives: []
        },
        'eye-cysa-ch13-lab': {
            id: 'eye-cysa-ch13-lab',
            title: 'CySA+ Ch 13 Lab: Forensic Analysis & Techniques',
            description: 'Hands-on lab for CySA+ Chapter 13 — Forensic Analysis & Techniques',
            house: 'eye',
            type: 'lab',
            difficulty: 'advanced',
            duration: 45,
            topics: ["digital-forensics","evidence-collection","chain-of-custody"],
            paths: ['cysa'],
            components: {
                lab: 'houses/eye/cysa/labs/cysa-ch13-forensics.lab.html'
            },
            prerequisites: ['eye-cysa-ch13-pres'],
            objectives: []
        },
        'eye-cysa-ch14-pres': {
            id: 'eye-cysa-ch14-pres',
            title: 'CySA+ Ch 14: Containment, Eradication & Recovery',
            description: 'CompTIA CySA+ Chapter 14 — Containment, Eradication & Recovery',
            house: 'eye',
            type: 'presentation',
            difficulty: 'advanced',
            duration: 35,
            topics: ["containment","eradication","recovery","incident-handling"],
            paths: ['cysa'],
            components: {
                presentation: 'houses/eye/cysa/presentations/cysa-ch14-recovery.presentation.html'
            },
            prerequisites: ['eye-cysa-ch13-pres'],
            objectives: []
        },
        'eye-cysa-ch14-quiz': {
            id: 'eye-cysa-ch14-quiz',
            title: 'CySA+ Ch 14 Quiz: Containment, Eradication & Recovery',
            description: 'Quiz on CySA+ Chapter 14 — Containment, Eradication & Recovery',
            house: 'eye',
            type: 'quiz',
            difficulty: 'advanced',
            duration: 15,
            topics: ["containment","eradication","recovery","incident-handling"],
            paths: ['cysa'],
            components: {
                quiz: 'houses/eye/cysa/quizzes/cysa-ch14-quiz.quiz.html'
            },
            prerequisites: ['eye-cysa-ch14-pres'],
            objectives: []
        },
        'eye-cysa-ch14-lab': {
            id: 'eye-cysa-ch14-lab',
            title: 'CySA+ Ch 14 Lab: Containment, Eradication & Recovery',
            description: 'Hands-on lab for CySA+ Chapter 14 — Containment, Eradication & Recovery',
            house: 'eye',
            type: 'lab',
            difficulty: 'advanced',
            duration: 45,
            topics: ["containment","eradication","recovery","incident-handling"],
            paths: ['cysa'],
            components: {
                lab: 'houses/eye/cysa/labs/cysa-ch14-recovery.lab.html'
            },
            prerequisites: ['eye-cysa-ch14-pres'],
            objectives: []
        },
        'eye-cysa-ch15-pres': {
            id: 'eye-cysa-ch15-pres',
            title: 'CySA+ Ch 15: Risk Management',
            description: 'CompTIA CySA+ Chapter 15 — Risk Management',
            house: 'eye',
            type: 'presentation',
            difficulty: 'advanced',
            duration: 35,
            topics: ["risk-management","risk-frameworks","BIA","risk-mitigation"],
            paths: ['cysa'],
            components: {
                presentation: 'houses/eye/cysa/presentations/cysa-ch15-risk.presentation.html'
            },
            prerequisites: ['eye-cysa-ch14-pres'],
            objectives: []
        },
        'eye-cysa-ch15-quiz': {
            id: 'eye-cysa-ch15-quiz',
            title: 'CySA+ Ch 15 Quiz: Risk Management',
            description: 'Quiz on CySA+ Chapter 15 — Risk Management',
            house: 'eye',
            type: 'quiz',
            difficulty: 'advanced',
            duration: 15,
            topics: ["risk-management","risk-frameworks","BIA","risk-mitigation"],
            paths: ['cysa'],
            components: {
                quiz: 'houses/eye/cysa/quizzes/cysa-ch15-quiz.quiz.html'
            },
            prerequisites: ['eye-cysa-ch15-pres'],
            objectives: []
        },
        'eye-cysa-ch15-lab': {
            id: 'eye-cysa-ch15-lab',
            title: 'CySA+ Ch 15 Lab: Risk Management',
            description: 'Hands-on lab for CySA+ Chapter 15 — Risk Management',
            house: 'eye',
            type: 'lab',
            difficulty: 'advanced',
            duration: 45,
            topics: ["risk-management","risk-frameworks","BIA","risk-mitigation"],
            paths: ['cysa'],
            components: {
                lab: 'houses/eye/cysa/labs/cysa-ch15-risk.lab.html'
            },
            prerequisites: ['eye-cysa-ch15-pres'],
            objectives: []
        },
        'eye-cysa-ch16-pres': {
            id: 'eye-cysa-ch16-pres',
            title: 'CySA+ Ch 16: Policy & Compliance',
            description: 'CompTIA CySA+ Chapter 16 — Policy & Compliance',
            house: 'eye',
            type: 'presentation',
            difficulty: 'advanced',
            duration: 35,
            topics: ["policy","compliance","governance","regulations"],
            paths: ['cysa'],
            components: {
                presentation: 'houses/eye/cysa/presentations/cysa-ch16-compliance.presentation.html'
            },
            prerequisites: ['eye-cysa-ch15-pres'],
            objectives: []
        },
        'eye-cysa-ch16-quiz': {
            id: 'eye-cysa-ch16-quiz',
            title: 'CySA+ Ch 16 Quiz: Policy & Compliance',
            description: 'Quiz on CySA+ Chapter 16 — Policy & Compliance',
            house: 'eye',
            type: 'quiz',
            difficulty: 'advanced',
            duration: 15,
            topics: ["policy","compliance","governance","regulations"],
            paths: ['cysa'],
            components: {
                quiz: 'houses/eye/cysa/quizzes/cysa-ch16-quiz.quiz.html'
            },
            prerequisites: ['eye-cysa-ch16-pres'],
            objectives: []
        },
        'eye-cysa-ch16-lab': {
            id: 'eye-cysa-ch16-lab',
            title: 'CySA+ Ch 16 Lab: Policy & Compliance',
            description: 'Hands-on lab for CySA+ Chapter 16 — Policy & Compliance',
            house: 'eye',
            type: 'lab',
            difficulty: 'advanced',
            duration: 45,
            topics: ["policy","compliance","governance","regulations"],
            paths: ['cysa'],
            components: {
                lab: 'houses/eye/cysa/labs/cysa-ch16-compliance.lab.html'
            },
            prerequisites: ['eye-cysa-ch16-pres'],
            objectives: []
        },
        'eye-cysa-comprehensive-review': {
            id: 'eye-cysa-comprehensive-review',
            title: 'CySA+ Comprehensive Review',
            description: 'Jeopardy-style review game covering all 16 chapters of the CompTIA CySA+ course',
            house: 'eye',
            type: 'quiz',
            difficulty: 'advanced',
            duration: 30,
            topics: ['CySA+', 'review', 'comprehensive'],
            paths: ['cysa'],
            components: {
                quiz: 'houses/eye/cysa/reviews/cysa-comprehensive-review.html'
            },
            prerequisites: [],
            objectives: []
        },
        // ─── CLOUD HOUSE (remaining REG-001 fixes) ───
        'cloud-architect': {
            id: 'cloud-architect',
            title: 'Cloud Architect',
            description: 'Cloud Architect — tool content for cloud house',
            house: 'cloud',
            type: 'tool',
            difficulty: 'beginner',
            duration: 20,
            topics: ['cloud', 'architect', 'infrastructure'],
            paths: ['cse'],
            components: {
                tool: 'houses/cloud/games/cloud-architect.html'
            },
            prerequisites: [],
            objectives: []
        },
        'cloud-concepts-v2': {
            id: 'cloud-concepts-v2',
            title: 'Cloud Computing Concepts',
            description: 'Cloud Computing Concepts — presentation content for cloud house',
            house: 'cloud',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 20,
            topics: ['cloud', 'computing', 'concepts', 'infrastructure'],
            paths: ['cse'],
            components: {
                presentation: 'houses/cloud/presentations/cloud-concepts.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        // ─── SCRIPT HOUSE (remaining REG-001 fixes) ───
        'script-clh-016-quiz': {
            id: 'script-clh-016-quiz',
            title: 'CLH-016 Quiz: System Intel',
            description: 'CLH-016 Quiz: System Intel — quiz content for script house',
            house: 'script',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['clh016', 'quiz', 'system', 'scripting', 'automation'],
            paths: ['linux-mastery'],
            components: {
                quiz: 'houses/script/clh/script-clh-016.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-clh-017-quiz': {
            id: 'script-clh-017-quiz',
            title: 'CLH-017 Quiz: Find & Locate',
            description: 'CLH-017 Quiz: Find & Locate — quiz content for script house',
            house: 'script',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['clh017', 'quiz', 'find', 'scripting', 'automation'],
            paths: ['linux-mastery'],
            components: {
                quiz: 'houses/script/clh/script-clh-017.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-clh-018-quiz': {
            id: 'script-clh-018-quiz',
            title: 'CLH-018 Quiz: Archive Operations',
            description: 'CLH-018 Quiz: Archive Operations — quiz content for script house',
            house: 'script',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['clh018', 'quiz', 'archive', 'scripting', 'automation'],
            paths: ['linux-mastery'],
            components: {
                quiz: 'houses/script/clh/script-clh-018.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-clh-019-quiz': {
            id: 'script-clh-019-quiz',
            title: 'CLH-019 Quiz: Disk Forensics',
            description: 'CLH-019 Quiz: Disk Forensics — quiz content for script house',
            house: 'script',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['clh019', 'quiz', 'disk', 'scripting', 'automation'],
            paths: ['linux-mastery'],
            components: {
                quiz: 'houses/script/clh/script-clh-019.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-clh-020-quiz': {
            id: 'script-clh-020-quiz',
            title: 'CLH-020 Quiz: User Reconnaissance',
            description: 'CLH-020 Quiz: User Reconnaissance — quiz content for script house',
            house: 'script',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['clh020', 'quiz', 'user', 'scripting', 'automation'],
            paths: ['linux-mastery'],
            components: {
                quiz: 'houses/script/clh/script-clh-020.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-clh-021-quiz': {
            id: 'script-clh-021-quiz',
            title: 'CLH-021 Quiz: SSH Operations',
            description: 'CLH-021 Quiz: SSH Operations — quiz content for script house',
            house: 'script',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['clh021', 'quiz', 'operations', 'scripting', 'automation'],
            paths: ['linux-mastery'],
            components: {
                quiz: 'houses/script/clh/script-clh-021.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-clh-022-quiz': {
            id: 'script-clh-022-quiz',
            title: 'CLH-022 Quiz: Network Reconnaissance',
            description: 'CLH-022 Quiz: Network Reconnaissance — quiz content for script house',
            house: 'script',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['clh022', 'quiz', 'network', 'scripting', 'automation'],
            paths: ['linux-mastery'],
            components: {
                quiz: 'houses/script/clh/script-clh-022.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-clh-023-quiz': {
            id: 'script-clh-023-quiz',
            title: 'CLH-023 Quiz: Service Management',
            description: 'CLH-023 Quiz: Service Management — quiz content for script house',
            house: 'script',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['clh023', 'quiz', 'service', 'scripting', 'automation'],
            paths: ['linux-mastery'],
            components: {
                quiz: 'houses/script/clh/script-clh-023.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-clh-024-quiz': {
            id: 'script-clh-024-quiz',
            title: 'CLH-024 Quiz: Scheduled Tasks',
            description: 'CLH-024 Quiz: Scheduled Tasks — quiz content for script house',
            house: 'script',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['clh024', 'quiz', 'scheduled', 'scripting', 'automation'],
            paths: ['linux-mastery'],
            components: {
                quiz: 'houses/script/clh/script-clh-024.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-clh-025-quiz': {
            id: 'script-clh-025-quiz',
            title: 'CLH-025 Quiz: Package Management',
            description: 'CLH-025 Quiz: Package Management — quiz content for script house',
            house: 'script',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['clh025', 'quiz', 'package', 'scripting', 'automation'],
            paths: ['linux-mastery'],
            components: {
                quiz: 'houses/script/clh/script-clh-025.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-clh-026-quiz': {
            id: 'script-clh-026-quiz',
            title: 'CLH-026 Quiz: Access Control',
            description: 'CLH-026 Quiz: Access Control — quiz content for script house',
            house: 'script',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['clh026', 'quiz', 'access', 'scripting', 'automation'],
            paths: ['linux-mastery'],
            components: {
                quiz: 'houses/script/clh/script-clh-026.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-clh-027-quiz': {
            id: 'script-clh-027-quiz',
            title: 'CLH-027 Quiz: User Management',
            description: 'CLH-027 Quiz: User Management — quiz content for script house',
            house: 'script',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['clh027', 'quiz', 'user', 'scripting', 'automation'],
            paths: ['linux-mastery'],
            components: {
                quiz: 'houses/script/clh/script-clh-027.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-clh-028-quiz': {
            id: 'script-clh-028-quiz',
            title: 'CLH-028 Quiz: System Monitoring',
            description: 'CLH-028 Quiz: System Monitoring — quiz content for script house',
            house: 'script',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['clh028', 'quiz', 'system', 'scripting', 'automation'],
            paths: ['linux-mastery'],
            components: {
                quiz: 'houses/script/clh/script-clh-028.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-clh-029-quiz': {
            id: 'script-clh-029-quiz',
            title: 'CLH-029 Quiz: Vim Essentials',
            description: 'CLH-029 Quiz: Vim Essentials — quiz content for script house',
            house: 'script',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['clh029', 'quiz', 'essentials', 'scripting', 'automation'],
            paths: ['linux-mastery'],
            components: {
                quiz: 'houses/script/clh/script-clh-029.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-clh-030-quiz': {
            id: 'script-clh-030-quiz',
            title: 'CLH-030 Certification: Shadow Agent Exam',
            description: 'CLH-030 Certification: Shadow Agent Exam — quiz content for script house',
            house: 'script',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['clh030', 'certification', 'shadow', 'scripting', 'automation'],
            paths: ['linux-mastery'],
            components: {
                quiz: 'houses/script/clh/script-clh-030.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-dont-kill-the-server': {
            id: 'script-dont-kill-the-server',
            title: 'Don\'t Kill the Server',
            description: 'Don\'t Kill the Server — tool content for script house',
            house: 'script',
            type: 'tool',
            difficulty: 'beginner',
            duration: 20,
            topics: ['dont', 'kill', 'server', 'scripting', 'automation'],
            paths: ['linux-mastery'],
            components: {
                tool: 'houses/script/games/script-dont-kill-the-server.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-linux-permissions-lab': {
            id: 'script-linux-permissions-lab',
            title: 'Mission: File Permissions',
            description: 'Mission: File Permissions — lab content for script house',
            house: 'script',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['mission', 'file', 'permissions', 'scripting', 'automation'],
            paths: ['linux-mastery'],
            components: {
                lab: 'houses/script/labs/linux/script-linux-permissions.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-linux-cli-review': {
            id: 'script-linux-cli-review',
            title: 'Linux & CLI Review',
            description: 'Linux & CLI Review — tool content for script house',
            house: 'script',
            type: 'tool',
            difficulty: 'beginner',
            duration: 20,
            topics: ['linux', 'review', 'scripting', 'automation'],
            paths: ['linux-mastery'],
            components: {
                tool: 'houses/script/reviews/script-linux-cli-review.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-permission-puzzle': {
            id: 'script-permission-puzzle',
            title: 'Permission Puzzle',
            description: 'Permission Puzzle — tool content for script house',
            house: 'script',
            type: 'tool',
            difficulty: 'beginner',
            duration: 20,
            topics: ['permission', 'puzzle', 'scripting', 'automation'],
            paths: ['linux-mastery'],
            components: {
                tool: 'houses/script/reviews/script-permission-puzzle.html'
            },
            prerequisites: [],
            objectives: []
        },
        // ─── EYE HOUSE (remaining REG-001 fixes) ───
        'eye-log-correlation-lab': {
            id: 'eye-log-correlation-lab',
            title: 'Lab 5: Log Correlation Analysis',
            description: 'Lab 5: Log Correlation Analysis — lab content for eye house',
            house: 'eye',
            type: 'lab',
            difficulty: 'beginner',
            duration: 30,
            topics: ['correlation', 'analysis', 'monitoring'],
            paths: ['security-operations'],
            components: {
                lab: 'houses/eye/applets/cyberops/week7/labs/eye-log-correlation.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-alert-triage': {
            id: 'eye-alert-triage',
            title: 'Alert Triage',
            description: 'Alert Triage — tool content for eye house',
            house: 'eye',
            type: 'tool',
            difficulty: 'beginner',
            duration: 20,
            topics: ['alert', 'triage', 'monitoring', 'analysis'],
            paths: ['security-operations'],
            components: {
                tool: 'houses/eye/games/eye-alert-triage.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-threat-modeler': {
            id: 'eye-threat-modeler',
            title: 'STRIDE Threat Modeler',
            description: 'STRIDE Threat Modeler — tool content for eye house',
            house: 'eye',
            type: 'tool',
            difficulty: 'beginner',
            duration: 20,
            topics: ['stride', 'threat', 'modeler', 'monitoring', 'analysis'],
            paths: ['security-operations'],
            components: {
                tool: 'houses/eye/games/eye-threat-modeler.html'
            },
            prerequisites: [],
            objectives: []
        },
        // ─── KEY HOUSE (remaining REG-001 fixes) ───
        'key-dont-leak-the-key': {
            id: 'key-dont-leak-the-key',
            title: 'Don\'t Leak the Key',
            description: 'Don\'t Leak the Key — tool content for key house',
            house: 'key',
            type: 'tool',
            difficulty: 'beginner',
            duration: 20,
            topics: ['dont', 'leak', 'cryptography', 'encryption'],
            paths: ['cryptography-track'],
            components: {
                tool: 'houses/key/games/key-dont-leak-the-key.html'
            },
            prerequisites: [],
            objectives: []
        },
        'key-tls-ssl': {
            id: 'key-tls-ssl',
            title: 'TLS/SSL Explained',
            description: 'TLS/SSL Explained — presentation content for key house',
            house: 'key',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 20,
            topics: ['tlsssl', 'explained', 'cryptography', 'encryption'],
            paths: ['cryptography-track'],
            components: {
                presentation: 'houses/key/presentations/key-tls-ssl.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'key-hash-cracker': {
            id: 'key-hash-cracker',
            title: 'Hash Cracker',
            description: 'Hash Cracker — tool content for key house',
            house: 'key',
            type: 'tool',
            difficulty: 'beginner',
            duration: 20,
            topics: ['hash', 'cracker', 'cryptography', 'encryption'],
            paths: ['cryptography-track'],
            components: {
                tool: 'houses/key/reviews/key-hash-cracker.html'
            },
            prerequisites: [],
            objectives: []
        },
        // ─── CODE HOUSE (remaining REG-001 fixes) ───
        'code-unit-testing-v2': {
            id: 'code-unit-testing-v2',
            title: 'Unit Testing Hands-On Lab',
            description: 'Unit Testing Hands-On Lab — module content for code house',
            house: 'code',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['unit', 'testing', 'handson', 'programming', 'development'],
            paths: ['devops-fundamentals'],
            components: {
                lab: 'houses/code/labs/code-unit-testing.lab.html',
                quiz: 'houses/code/quizzes/code-unit-testing.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'code-git-blame': {
            id: 'code-git-blame',
            title: 'git blame v2.43 - Pipeline Forensics',
            description: 'git blame v2.43 - Pipeline Forensics — tool content for code house',
            house: 'code',
            type: 'tool',
            difficulty: 'beginner',
            duration: 20,
            topics: ['blame', 'v243', 'pipeline', 'programming', 'development'],
            paths: ['devops-fundamentals'],
            components: {
                tool: 'houses/code/games/code-git-blame.html'
            },
            prerequisites: [],
            objectives: []
        },
        // ─── GENERAL / NON-HOUSE (remaining REG-001 fixes) ───
        'general-audit-tool': {
            id: 'general-audit-tool',
            title: 'Content Audit Tool',
            description: 'Content Audit Tool — tool content for Hexworth Prime',
            house: 'general',
            type: 'tool',
            difficulty: 'beginner',
            duration: 20,
            topics: ['content', 'audit', 'tool', 'platform', 'utility'],
            paths: [],
            components: {
                tool: 'admin/audit-tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'general-faq': {
            id: 'general-faq',
            title: 'Faq',
            description: 'Faq — tool content for Hexworth Prime',
            house: 'general',
            type: 'tool',
            difficulty: 'beginner',
            duration: 20,
            topics: ['platform', 'utility'],
            paths: [],
            components: {
                tool: 'faq.html'
            },
            prerequisites: [],
            objectives: []
        },
        'general-product-info': {
            id: 'general-product-info',
            title: 'Hexworth Prime - Product Overview',
            description: 'Hexworth Prime - Product Overview — tool content for Hexworth Prime',
            house: 'general',
            type: 'tool',
            difficulty: 'beginner',
            duration: 20,
            topics: ['hexworth', 'prime', 'product', 'platform', 'utility'],
            paths: [],
            components: {
                tool: 'product-info.html'
            },
            prerequisites: [],
            objectives: []
        },
        'general-a2-shadow-encoder': {
            id: 'general-a2-shadow-encoder',
            title: 'Box A2: The Shadow Encoder | CTF Arena',
            description: 'Box A2: The Shadow Encoder | CTF Arena — tool content for Hexworth Prime',
            house: 'general',
            type: 'tool',
            difficulty: 'beginner',
            duration: 20,
            topics: ['shadow', 'encoder', 'arena', 'platform', 'utility'],
            paths: [],
            components: {
                tool: 'workshop/a2-shadow-encoder/current.html'
            },
            prerequisites: [],
            objectives: []
        },





        // ─── DARK ARTS - Offensive Security (auto-generated) ───
        'dark-arts-buffer-overflow-lab': {
            id: 'dark-arts-buffer-overflow-lab',
            title: 'Buffer Overflow & Exploitation Lab',
            description: 'Buffer Overflow & Exploitation Lab — lab content for Dark Arts house',
            house: 'dark-arts',
            type: 'lab',
            difficulty: 'intermediate',
            duration: 30,
            topics: ['buffer-overflow', 'exploitation', 'offensive-security', 'ethical-hacking'],
            paths: [],
            components: {
                lab: 'dark-arts/vault/buffer-overflow-lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'dark-arts-ceh-attack-reference': {
            id: 'dark-arts-ceh-attack-reference',
            title: 'CEH v12 Attack Reference',
            description: 'CEH v12 Attack Reference — reference content for Dark Arts house',
            house: 'dark-arts',
            type: 'reference',
            difficulty: 'intermediate',
            duration: 15,
            topics: ['ceh', 'attacks', 'offensive-security', 'ethical-hacking'],
            paths: [],
            components: {
                reference: 'dark-arts/vault/ceh-attack-reference.html'
            },
            prerequisites: [],
            objectives: []
        },
        'dark-arts-cloud-hacking-lab': {
            id: 'dark-arts-cloud-hacking-lab',
            title: 'Cloud Security & Hacking Lab',
            description: 'Cloud Security & Hacking Lab — lab content for Dark Arts house',
            house: 'dark-arts',
            type: 'lab',
            difficulty: 'intermediate',
            duration: 30,
            topics: ['cloud', 'hacking', 'offensive-security', 'ethical-hacking'],
            paths: [],
            components: {
                lab: 'dark-arts/vault/cloud-hacking-lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'dark-arts-csrf-attack-lab': {
            id: 'dark-arts-csrf-attack-lab',
            title: 'CSRF Attack Lab',
            description: 'CSRF Attack Lab — lab content for Dark Arts house',
            house: 'dark-arts',
            type: 'lab',
            difficulty: 'intermediate',
            duration: 30,
            topics: ['csrf', 'web-attacks', 'offensive-security', 'ethical-hacking'],
            paths: [],
            components: {
                lab: 'dark-arts/vault/csrf-attack-lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'dark-arts-dos-ddos-lab': {
            id: 'dark-arts-dos-ddos-lab',
            title: 'DoS/DDoS Attacks Lab',
            description: 'DoS/DDoS Attacks Lab — lab content for Dark Arts house',
            house: 'dark-arts',
            type: 'lab',
            difficulty: 'intermediate',
            duration: 30,
            topics: ['dos', 'ddos', 'offensive-security', 'ethical-hacking'],
            paths: [],
            components: {
                lab: 'dark-arts/vault/dos-ddos-lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'dark-arts-enumeration-lab': {
            id: 'dark-arts-enumeration-lab',
            title: 'Enumeration Techniques Lab',
            description: 'Enumeration Techniques Lab — lab content for Dark Arts house',
            house: 'dark-arts',
            type: 'lab',
            difficulty: 'intermediate',
            duration: 30,
            topics: ['enumeration', 'reconnaissance', 'offensive-security', 'ethical-hacking'],
            paths: [],
            components: {
                lab: 'dark-arts/vault/enumeration-lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'dark-arts-footprinting-lab': {
            id: 'dark-arts-footprinting-lab',
            title: 'Footprinting & Reconnaissance Lab',
            description: 'Footprinting & Reconnaissance Lab — lab content for Dark Arts house',
            house: 'dark-arts',
            type: 'lab',
            difficulty: 'intermediate',
            duration: 30,
            topics: ['footprinting', 'reconnaissance', 'offensive-security', 'ethical-hacking'],
            paths: [],
            components: {
                lab: 'dark-arts/vault/footprinting-lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'dark-arts-gate-6': {
            id: 'dark-arts-gate-6',
            title: 'Gate VI: Static Analysis Investigation',
            description: 'Gate VI: Static Analysis Investigation — gate challenge for Dark Arts',
            house: 'dark-arts',
            type: 'lab',
            difficulty: 'advanced',
            duration: 45,
            topics: ['static-analysis', 'ctf', 'offensive-security', 'ethical-hacking'],
            paths: [],
            components: {
                lab: 'dark-arts/vault/gates/gate-6.html'
            },
            prerequisites: [],
            objectives: []
        },
        'dark-arts-gate-7': {
            id: 'dark-arts-gate-7',
            title: 'Gate 7: Operation Shadow Hunt',
            description: 'Gate 7: Operation Shadow Hunt — gate challenge for Dark Arts',
            house: 'dark-arts',
            type: 'lab',
            difficulty: 'advanced',
            duration: 45,
            topics: ['shadow-hunt', 'ctf', 'offensive-security', 'ethical-hacking'],
            paths: [],
            components: {
                lab: 'dark-arts/vault/gates/gate-7.html'
            },
            prerequisites: [],
            objectives: []
        },
        'dark-arts-gate-10': {
            id: 'dark-arts-gate-10',
            title: 'Gate 10: Incident Response Capstone',
            description: 'Gate 10: Incident Response Capstone — gate challenge for Dark Arts',
            house: 'dark-arts',
            type: 'lab',
            difficulty: 'advanced',
            duration: 60,
            topics: ['incident-response', 'ctf', 'offensive-security', 'ethical-hacking'],
            paths: [],
            components: {
                lab: 'dark-arts/vault/gates/gate-10.html'
            },
            prerequisites: [],
            objectives: []
        },
        'dark-arts-gate-11': {
            id: 'dark-arts-gate-11',
            title: 'Gate 11: Crypto Challenge',
            description: 'Gate 11: Crypto Challenge — gate challenge for Dark Arts',
            house: 'dark-arts',
            type: 'lab',
            difficulty: 'advanced',
            duration: 45,
            topics: ['cryptography', 'ctf', 'offensive-security', 'ethical-hacking'],
            paths: [],
            components: {
                lab: 'dark-arts/vault/gates/gate-11.html'
            },
            prerequisites: [],
            objectives: []
        },
        'dark-arts-gate-1': {
            id: 'dark-arts-gate-1',
            title: '. . .',
            description: '. . . — lab content for Dark Arts',
            house: 'dark-arts',
            type: 'lab',
            difficulty: 'intermediate',
            duration: 30,
            topics: ['offensive-security', 'ethical-hacking'],
            paths: [],
            components: {
                lab: 'dark-arts/gate-1.html'
            },
            prerequisites: [],
            objectives: []
        },
        'dark-arts-gate-2': {
            id: 'dark-arts-gate-2',
            title: '. . . .',
            description: '. . . . — lab content for Dark Arts',
            house: 'dark-arts',
            type: 'lab',
            difficulty: 'intermediate',
            duration: 30,
            topics: ['offensive-security', 'ethical-hacking'],
            paths: [],
            components: {
                lab: 'dark-arts/gates/gate-2.html'
            },
            prerequisites: [],
            objectives: []
        },
        'dark-arts-gate-3': {
            id: 'dark-arts-gate-3',
            title: '. . . . .',
            description: '. . . . . — lab content for Dark Arts',
            house: 'dark-arts',
            type: 'lab',
            difficulty: 'intermediate',
            duration: 30,
            topics: ['offensive-security', 'ethical-hacking'],
            paths: [],
            components: {
                lab: 'dark-arts/gates/gate-3.html'
            },
            prerequisites: [],
            objectives: []
        },
        'dark-arts-gate-4': {
            id: 'dark-arts-gate-4',
            title: '. . . . . .',
            description: '. . . . . . — lab content for Dark Arts',
            house: 'dark-arts',
            type: 'lab',
            difficulty: 'intermediate',
            duration: 30,
            topics: ['offensive-security', 'ethical-hacking'],
            paths: [],
            components: {
                lab: 'dark-arts/gates/gate-4.html'
            },
            prerequisites: [],
            objectives: []
        },
        'dark-arts-gate-5': {
            id: 'dark-arts-gate-5',
            title: '. . . . . . .',
            description: '. . . . . . . — lab content for Dark Arts',
            house: 'dark-arts',
            type: 'lab',
            difficulty: 'intermediate',
            duration: 30,
            topics: ['offensive-security', 'ethical-hacking'],
            paths: [],
            components: {
                lab: 'dark-arts/gates/gate-5.html'
            },
            prerequisites: [],
            objectives: []
        },
        'dark-arts-cyber-kill-chain': {
            id: 'dark-arts-cyber-kill-chain',
            title: 'Cyber Kill Chain',
            description: 'Cyber Kill Chain — lab content for Dark Arts',
            house: 'dark-arts',
            type: 'lab',
            difficulty: 'intermediate',
            duration: 30,
            topics: ['offensive-security', 'ethical-hacking'],
            paths: [],
            components: {
                lab: 'dark-arts/vault/cyber-kill-chain.html'
            },
            prerequisites: [],
            objectives: []
        },
        'dark-arts-gate-8': {
            id: 'dark-arts-gate-8',
            title: 'Gate 8: Dynamic Analysis Sandbox',
            description: 'Gate 8: Dynamic Analysis Sandbox — lab content for Dark Arts',
            house: 'dark-arts',
            type: 'lab',
            difficulty: 'intermediate',
            duration: 30,
            topics: ['offensive-security', 'ethical-hacking'],
            paths: [],
            components: {
                lab: 'dark-arts/vault/gates/gate-8.html'
            },
            prerequisites: [],
            objectives: []
        },
        'dark-arts-gate-9': {
            id: 'dark-arts-gate-9',
            title: 'Gate 9: Reverse Engineering',
            description: 'Gate 9: Reverse Engineering — lab content for Dark Arts',
            house: 'dark-arts',
            type: 'lab',
            difficulty: 'intermediate',
            duration: 30,
            topics: ['offensive-security', 'ethical-hacking'],
            paths: [],
            components: {
                lab: 'dark-arts/vault/gates/gate-9.html'
            },
            prerequisites: [],
            objectives: []
        },
        'dark-arts-gate-12': {
            id: 'dark-arts-gate-12',
            title: 'Gate 12: Social Engineering',
            description: 'Gate 12: Social Engineering — lab content for Dark Arts',
            house: 'dark-arts',
            type: 'lab',
            difficulty: 'intermediate',
            duration: 30,
            topics: ['offensive-security', 'ethical-hacking'],
            paths: [],
            components: {
                lab: 'dark-arts/vault/gates/gate-12.html'
            },
            prerequisites: [],
            objectives: []
        },
        'dark-arts-gate-13': {
            id: 'dark-arts-gate-13',
            title: 'Gate 13: The Synthesis',
            description: 'Gate 13: The Synthesis — lab content for Dark Arts',
            house: 'dark-arts',
            type: 'lab',
            difficulty: 'intermediate',
            duration: 30,
            topics: ['offensive-security', 'ethical-hacking'],
            paths: [],
            components: {
                lab: 'dark-arts/vault/gates/gate-13.html'
            },
            prerequisites: [],
            objectives: []
        },
        'da-gate8-caseboard': {
            id: 'da-gate8-caseboard',
            title: 'Case Board — Operation Gone Dark',
            description: 'Case Board — Operation Gone Dark — lab content for Dark Arts',
            house: 'dark-arts',
            type: 'lab',
            difficulty: 'intermediate',
            duration: 30,
            topics: ['offensive-security', 'ethical-hacking'],
            paths: [],
            components: {
                lab: 'dark-arts/vault/gates/gate-8/caseboard.html'
            },
            prerequisites: [],
            objectives: []
        },
        'da-gate8-datadrill': {
            id: 'da-gate8-datadrill',
            title: 'DataDrill Pro — Operation Gone Dark',
            description: 'DataDrill Pro — Operation Gone Dark — lab content for Dark Arts',
            house: 'dark-arts',
            type: 'lab',
            difficulty: 'intermediate',
            duration: 30,
            topics: ['offensive-security', 'ethical-hacking'],
            paths: [],
            components: {
                lab: 'dark-arts/vault/gates/gate-8/datadrill.html'
            },
            prerequisites: [],
            objectives: []
        },
        'da-gate8-desktop': {
            id: 'da-gate8-desktop',
            title: 'Desktop PC — Operation Gone Dark',
            description: 'Desktop PC — Operation Gone Dark — lab content for Dark Arts',
            house: 'dark-arts',
            type: 'lab',
            difficulty: 'intermediate',
            duration: 30,
            topics: ['offensive-security', 'ethical-hacking'],
            paths: [],
            components: {
                lab: 'dark-arts/vault/gates/gate-8/desktop.html'
            },
            prerequisites: [],
            objectives: []
        },
        'da-gate8-laptop': {
            id: 'da-gate8-laptop',
            title: 'MacBook Pro — Operation Gone Dark',
            description: 'MacBook Pro — Operation Gone Dark — lab content for Dark Arts',
            house: 'dark-arts',
            type: 'lab',
            difficulty: 'intermediate',
            duration: 30,
            topics: ['offensive-security', 'ethical-hacking'],
            paths: [],
            components: {
                lab: 'dark-arts/vault/gates/gate-8/laptop.html'
            },
            prerequisites: [],
            objectives: []
        },
        'da-gate8-phone': {
            id: 'da-gate8-phone',
            title: 'Phone — Operation Gone Dark',
            description: 'Phone — Operation Gone Dark — lab content for Dark Arts',
            house: 'dark-arts',
            type: 'lab',
            difficulty: 'intermediate',
            duration: 30,
            topics: ['offensive-security', 'ethical-hacking'],
            paths: [],
            components: {
                lab: 'dark-arts/vault/gates/gate-8/phone.html'
            },
            prerequisites: [],
            objectives: []
        },
        'da-gate8-case-summary': {
            id: 'da-gate8-case-summary',
            title: 'Det. Novak Case Summary - Case #2026-MP-04871',
            description: 'Det. Novak Case Summary - Case #2026-MP-04871 — lab content for Dark Arts',
            house: 'dark-arts',
            type: 'lab',
            difficulty: 'intermediate',
            duration: 30,
            topics: ['offensive-security', 'ethical-hacking'],
            paths: [],
            components: {
                lab: 'dark-arts/vault/gates/gate-8/reports/case-summary.html'
            },
            prerequisites: [],
            objectives: []
        },
        'da-gate8-debrief': {
            id: 'da-gate8-debrief',
            title: 'OPERATION GONE DARK - Final Debrief',
            description: 'OPERATION GONE DARK - Final Debrief — lab content for Dark Arts',
            house: 'dark-arts',
            type: 'lab',
            difficulty: 'intermediate',
            duration: 30,
            topics: ['offensive-security', 'ethical-hacking'],
            paths: [],
            components: {
                lab: 'dark-arts/vault/gates/gate-8/reports/debrief.html'
            },
            prerequisites: [],
            objectives: []
        },
        'da-gate8-interview-bartender': {
            id: 'da-gate8-interview-bartender',
            title: 'Interview: Maria Santos - Case #2026-MP-04871',
            description: 'Interview: Maria Santos - Case #2026-MP-04871 — lab content for Dark Arts',
            house: 'dark-arts',
            type: 'lab',
            difficulty: 'intermediate',
            duration: 30,
            topics: ['offensive-security', 'ethical-hacking'],
            paths: [],
            components: {
                lab: 'dark-arts/vault/gates/gate-8/reports/interview-bartender.html'
            },
            prerequisites: [],
            objectives: []
        },
        'da-gate8-interview-colleague': {
            id: 'da-gate8-interview-colleague',
            title: 'Interview: Karen Liu - Case #2026-MP-04871',
            description: 'Interview: Karen Liu - Case #2026-MP-04871 — lab content for Dark Arts',
            house: 'dark-arts',
            type: 'lab',
            difficulty: 'intermediate',
            duration: 30,
            topics: ['offensive-security', 'ethical-hacking'],
            paths: [],
            components: {
                lab: 'dark-arts/vault/gates/gate-8/reports/interview-colleague.html'
            },
            prerequisites: [],
            objectives: []
        },
        'da-gate8-interview-neighbor': {
            id: 'da-gate8-interview-neighbor',
            title: 'Interview: James Chen - Case #2026-MP-04871',
            description: 'Interview: James Chen - Case #2026-MP-04871 — lab content for Dark Arts',
            house: 'dark-arts',
            type: 'lab',
            difficulty: 'intermediate',
            duration: 30,
            topics: ['offensive-security', 'ethical-hacking'],
            paths: [],
            components: {
                lab: 'dark-arts/vault/gates/gate-8/reports/interview-neighbor.html'
            },
            prerequisites: [],
            objectives: []
        },
        'da-gate8-police-report': {
            id: 'da-gate8-police-report',
            title: 'Missing Persons Report - Case #2026-MP-04871',
            description: 'Missing Persons Report - Case #2026-MP-04871 — lab content for Dark Arts',
            house: 'dark-arts',
            type: 'lab',
            difficulty: 'intermediate',
            duration: 30,
            topics: ['offensive-security', 'ethical-hacking'],
            paths: [],
            components: {
                lab: 'dark-arts/vault/gates/gate-8/reports/police-report.html'
            },
            prerequisites: [],
            objectives: []
        },
        'dark-arts-idor-attack-lab': {
            id: 'dark-arts-idor-attack-lab',
            title: 'IDOR Attack Lab',
            description: 'IDOR Attack Lab — lab content for Dark Arts',
            house: 'dark-arts',
            type: 'lab',
            difficulty: 'intermediate',
            duration: 30,
            topics: ['offensive-security', 'ethical-hacking'],
            paths: [],
            components: {
                lab: 'dark-arts/vault/idor-attack-lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'dark-arts-ids-evasion-lab': {
            id: 'dark-arts-ids-evasion-lab',
            title: 'IDS/IPS & Firewall Evasion Lab',
            description: 'IDS/IPS & Firewall Evasion Lab — lab content for Dark Arts',
            house: 'dark-arts',
            type: 'lab',
            difficulty: 'intermediate',
            duration: 30,
            topics: ['offensive-security', 'ethical-hacking'],
            paths: [],
            components: {
                lab: 'dark-arts/vault/ids-evasion-lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'dark-arts-iot-security-lab': {
            id: 'dark-arts-iot-security-lab',
            title: 'IoT Security Lab',
            description: 'IoT Security Lab — lab content for Dark Arts',
            house: 'dark-arts',
            type: 'lab',
            difficulty: 'intermediate',
            duration: 30,
            topics: ['offensive-security', 'ethical-hacking'],
            paths: [],
            components: {
                lab: 'dark-arts/vault/iot-security-lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'dark-arts-jwt-attack-lab': {
            id: 'dark-arts-jwt-attack-lab',
            title: 'JWT Attack Lab',
            description: 'JWT Attack Lab — lab content for Dark Arts',
            house: 'dark-arts',
            type: 'lab',
            difficulty: 'intermediate',
            duration: 30,
            topics: ['offensive-security', 'ethical-hacking'],
            paths: [],
            components: {
                lab: 'dark-arts/vault/jwt-attack-lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'dark-arts-malware-analysis-lab': {
            id: 'dark-arts-malware-analysis-lab',
            title: 'Malware Analysis Lab',
            description: 'Malware Analysis Lab — lab content for Dark Arts',
            house: 'dark-arts',
            type: 'lab',
            difficulty: 'intermediate',
            duration: 30,
            topics: ['offensive-security', 'ethical-hacking'],
            paths: [],
            components: {
                lab: 'dark-arts/vault/malware-analysis-lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'dark-arts-mobile-security-lab': {
            id: 'dark-arts-mobile-security-lab',
            title: 'Mobile Platform Security Lab',
            description: 'Mobile Platform Security Lab — lab content for Dark Arts',
            house: 'dark-arts',
            type: 'lab',
            difficulty: 'intermediate',
            duration: 30,
            topics: ['offensive-security', 'ethical-hacking'],
            paths: [],
            components: {
                lab: 'dark-arts/vault/mobile-security-lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'dark-arts-network-scanning-lab': {
            id: 'dark-arts-network-scanning-lab',
            title: 'Network Scanning & Port Analysis Lab',
            description: 'Network Scanning & Port Analysis Lab — lab content for Dark Arts',
            house: 'dark-arts',
            type: 'lab',
            difficulty: 'intermediate',
            duration: 30,
            topics: ['offensive-security', 'ethical-hacking'],
            paths: [],
            components: {
                lab: 'dark-arts/vault/network-scanning-lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'dark-arts-network-sniffing-lab': {
            id: 'dark-arts-network-sniffing-lab',
            title: 'Network Sniffing & Spoofing Lab',
            description: 'Network Sniffing & Spoofing Lab — lab content for Dark Arts',
            house: 'dark-arts',
            type: 'lab',
            difficulty: 'intermediate',
            duration: 30,
            topics: ['offensive-security', 'ethical-hacking'],
            paths: [],
            components: {
                lab: 'dark-arts/vault/network-sniffing-lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'dark-arts-nmap-scanning-lab': {
            id: 'dark-arts-nmap-scanning-lab',
            title: 'Network Scanning Lab',
            description: 'Network Scanning Lab — lab content for Dark Arts',
            house: 'dark-arts',
            type: 'lab',
            difficulty: 'intermediate',
            duration: 30,
            topics: ['offensive-security', 'ethical-hacking'],
            paths: [],
            components: {
                lab: 'dark-arts/vault/nmap-scanning-lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'dark-arts-owasp-top10-lab': {
            id: 'dark-arts-owasp-top10-lab',
            title: 'OWASP Top 10 Attack Lab',
            description: 'OWASP Top 10 Attack Lab — lab content for Dark Arts',
            house: 'dark-arts',
            type: 'lab',
            difficulty: 'intermediate',
            duration: 30,
            topics: ['offensive-security', 'ethical-hacking'],
            paths: [],
            components: {
                lab: 'dark-arts/vault/owasp-top10-lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'dark-arts-password-attacks-lab': {
            id: 'dark-arts-password-attacks-lab',
            title: 'Password Attacks Lab',
            description: 'Password Attacks Lab — lab content for Dark Arts',
            house: 'dark-arts',
            type: 'lab',
            difficulty: 'intermediate',
            duration: 30,
            topics: ['offensive-security', 'ethical-hacking'],
            paths: [],
            components: {
                lab: 'dark-arts/vault/password-attacks-lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'dark-arts-privilege-escalation-lab': {
            id: 'dark-arts-privilege-escalation-lab',
            title: 'Privilege Escalation Lab',
            description: 'Privilege Escalation Lab — lab content for Dark Arts',
            house: 'dark-arts',
            type: 'lab',
            difficulty: 'intermediate',
            duration: 30,
            topics: ['offensive-security', 'ethical-hacking'],
            paths: [],
            components: {
                lab: 'dark-arts/vault/privilege-escalation-lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'da-dark-arts-quiz': {
            id: 'da-dark-arts-quiz',
            title: 'Dark Arts Mastery Challenge - The Vault',
            description: 'Dark Arts Mastery Challenge - The Vault — quiz content for Dark Arts',
            house: 'dark-arts',
            type: 'quiz',
            difficulty: 'intermediate',
            duration: 15,
            topics: ['offensive-security', 'ethical-hacking'],
            paths: [],
            components: {
                quiz: 'dark-arts/vault/quizzes/dark-arts-quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'dark-arts-session-hijacking-lab': {
            id: 'dark-arts-session-hijacking-lab',
            title: 'Session Hijacking Lab',
            description: 'Session Hijacking Lab — lab content for Dark Arts',
            house: 'dark-arts',
            type: 'lab',
            difficulty: 'intermediate',
            duration: 30,
            topics: ['offensive-security', 'ethical-hacking'],
            paths: [],
            components: {
                lab: 'dark-arts/vault/session-hijacking-lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'dark-arts-social-engineering-advanced': {
            id: 'dark-arts-social-engineering-advanced',
            title: 'Social Engineering Advanced Lab',
            description: 'Social Engineering Advanced Lab — lab content for Dark Arts',
            house: 'dark-arts',
            type: 'lab',
            difficulty: 'intermediate',
            duration: 30,
            topics: ['offensive-security', 'ethical-hacking'],
            paths: [],
            components: {
                lab: 'dark-arts/vault/social-engineering-advanced.html'
            },
            prerequisites: [],
            objectives: []
        },
        'dark-arts-sql-injection-lab': {
            id: 'dark-arts-sql-injection-lab',
            title: 'SQL Injection Lab',
            description: 'SQL Injection Lab — lab content for Dark Arts',
            house: 'dark-arts',
            type: 'lab',
            difficulty: 'intermediate',
            duration: 30,
            topics: ['offensive-security', 'ethical-hacking'],
            paths: [],
            components: {
                lab: 'dark-arts/vault/sql-injection-lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'dark-arts-ssrf-attack-lab': {
            id: 'dark-arts-ssrf-attack-lab',
            title: 'SSRF Attack Lab',
            description: 'SSRF Attack Lab — lab content for Dark Arts',
            house: 'dark-arts',
            type: 'lab',
            difficulty: 'intermediate',
            duration: 30,
            topics: ['offensive-security', 'ethical-hacking'],
            paths: [],
            components: {
                lab: 'dark-arts/vault/ssrf-attack-lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'dark-arts-steganography-lab': {
            id: 'dark-arts-steganography-lab',
            title: 'Steganography Lab',
            description: 'Steganography Lab — lab content for Dark Arts',
            house: 'dark-arts',
            type: 'lab',
            difficulty: 'intermediate',
            duration: 30,
            topics: ['offensive-security', 'ethical-hacking'],
            paths: [],
            components: {
                lab: 'dark-arts/vault/steganography-lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'da-analysis-toolkit': {
            id: 'da-analysis-toolkit',
            title: 'Malware Analysis Toolkit',
            description: 'Malware Analysis Toolkit — tool content for Dark Arts',
            house: 'dark-arts',
            type: 'tool',
            difficulty: 'intermediate',
            duration: 20,
            topics: ['offensive-security', 'ethical-hacking'],
            paths: [],
            components: {
                applet: 'dark-arts/vault/tools/analysis-toolkit.html'
            },
            prerequisites: [],
            objectives: []
        },
        'da-hashcat-training': {
            id: 'da-hashcat-training',
            title: 'Hashcat Training Lab',
            description: 'Hashcat Training Lab — tool content for Dark Arts',
            house: 'dark-arts',
            type: 'tool',
            difficulty: 'intermediate',
            duration: 20,
            topics: ['offensive-security', 'ethical-hacking'],
            paths: [],
            components: {
                applet: 'dark-arts/vault/tools/hashcat-training.html'
            },
            prerequisites: [],
            objectives: []
        },
        'da-hydra-training': {
            id: 'da-hydra-training',
            title: 'Hydra Training Lab',
            description: 'Hydra Training Lab — tool content for Dark Arts',
            house: 'dark-arts',
            type: 'tool',
            difficulty: 'intermediate',
            duration: 20,
            topics: ['offensive-security', 'ethical-hacking'],
            paths: [],
            components: {
                applet: 'dark-arts/vault/tools/hydra-training.html'
            },
            prerequisites: [],
            objectives: []
        },
        'da-john-training': {
            id: 'da-john-training',
            title: 'John the Ripper Training Lab',
            description: 'John the Ripper Training Lab — tool content for Dark Arts',
            house: 'dark-arts',
            type: 'tool',
            difficulty: 'intermediate',
            duration: 20,
            topics: ['offensive-security', 'ethical-hacking'],
            paths: [],
            components: {
                applet: 'dark-arts/vault/tools/john-training.html'
            },
            prerequisites: [],
            objectives: []
        },
        'da-metasploit-training': {
            id: 'da-metasploit-training',
            title: 'Metasploit Training Lab',
            description: 'Metasploit Training Lab — tool content for Dark Arts',
            house: 'dark-arts',
            type: 'tool',
            difficulty: 'intermediate',
            duration: 20,
            topics: ['offensive-security', 'ethical-hacking'],
            paths: [],
            components: {
                applet: 'dark-arts/vault/tools/metasploit-training.html'
            },
            prerequisites: [],
            objectives: []
        },
        'da-nmap-training': {
            id: 'da-nmap-training',
            title: 'Nmap Training Lab',
            description: 'Nmap Training Lab — tool content for Dark Arts',
            house: 'dark-arts',
            type: 'tool',
            difficulty: 'intermediate',
            duration: 20,
            topics: ['offensive-security', 'ethical-hacking'],
            paths: [],
            components: {
                applet: 'dark-arts/vault/tools/nmap-training.html'
            },
            prerequisites: [],
            objectives: []
        },
        'dark-arts-wireless-attacks-lab': {
            id: 'dark-arts-wireless-attacks-lab',
            title: 'Wireless Attacks Lab',
            description: 'Wireless Attacks Lab — lab content for Dark Arts',
            house: 'dark-arts',
            type: 'lab',
            difficulty: 'intermediate',
            duration: 30,
            topics: ['offensive-security', 'ethical-hacking'],
            paths: [],
            components: {
                lab: 'dark-arts/vault/wireless-attacks-lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'dark-arts-xss-attacks-lab': {
            id: 'dark-arts-xss-attacks-lab',
            title: 'XSS Attacks Lab',
            description: 'XSS Attacks Lab — lab content for Dark Arts',
            house: 'dark-arts',
            type: 'lab',
            difficulty: 'intermediate',
            duration: 30,
            topics: ['offensive-security', 'ethical-hacking'],
            paths: [],
            components: {
                lab: 'dark-arts/vault/xss-attacks-lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'dark-arts-advanced-dynamic-analysis': {
            id: 'dark-arts-advanced-dynamic-analysis',
            title: 'Advanced Dynamic Analysis',
            description: 'Advanced Dynamic Analysis — barricade content for Dark Arts house',
            house: 'dark-arts',
            type: 'barricade',
            difficulty: 'beginner',
            duration: 10,
            topics: ['dynamic', 'analysis', 'offensive-security', 'ethical-hacking'],
            paths: [],
            components: {
                barricade: 'dark-arts/vault/modules/advanced-dynamic-analysis.barricade.html'
            },
            prerequisites: [],
            objectives: []
        },
        'dark-arts-advanced-reverse-engineering': {
            id: 'dark-arts-advanced-reverse-engineering',
            title: 'Advanced Reverse Engineering',
            description: 'Advanced Reverse Engineering — barricade content for Dark Arts house',
            house: 'dark-arts',
            type: 'barricade',
            difficulty: 'beginner',
            duration: 10,
            topics: ['reverse', 'engineering', 'offensive-security', 'ethical-hacking'],
            paths: [],
            components: {
                barricade: 'dark-arts/vault/modules/advanced-reverse-engineering.barricade.html'
            },
            prerequisites: [],
            objectives: []
        },
        'dark-arts-behavioral-analysis': {
            id: 'dark-arts-behavioral-analysis',
            title: 'Behavioral Analysis',
            description: 'Behavioral Analysis — module content for Dark Arts house',
            house: 'dark-arts',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['behavioral', 'analysis', 'offensive-security', 'ethical-hacking'],
            paths: [],
            components: {
                module: 'dark-arts/vault/modules/behavioral-analysis.module.html'
            },
            prerequisites: [],
            objectives: []
        },
        'dark-arts-botnet-architecture': {
            id: 'dark-arts-botnet-architecture',
            title: 'Botnet Architecture & C2',
            description: 'Botnet Architecture & C2 — presentation content for Dark Arts house',
            house: 'dark-arts',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 20,
            topics: ['botnet', 'architecture', 'offensive-security', 'ethical-hacking'],
            paths: [],
            components: {
                presentation: 'dark-arts/vault/botnet-architecture.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'dark-arts-ctf-leaderboard': {
            id: 'dark-arts-ctf-leaderboard',
            title: 'Dark Arts Division • CTF Leaderboard',
            description: 'Dark Arts Division • CTF Leaderboard — applet content for Dark Arts house',
            house: 'dark-arts',
            type: 'applet',
            difficulty: 'beginner',
            duration: 25,
            topics: ['dark', 'arts', 'division', 'offensive-security', 'ethical-hacking'],
            paths: [],
            components: {
                applet: 'dark-arts/ctf-leaderboard.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'dark-arts-dynamic-analysis': {
            id: 'dark-arts-dynamic-analysis',
            title: 'Dynamic Analysis',
            description: 'Dynamic Analysis — module content for Dark Arts house',
            house: 'dark-arts',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['dynamic', 'analysis', 'offensive-security', 'ethical-hacking'],
            paths: [],
            components: {
                module: 'dark-arts/vault/modules/dynamic-analysis.module.html'
            },
            prerequisites: [],
            objectives: []
        },
        'dark-arts-incident-response': {
            id: 'dark-arts-incident-response',
            title: 'Incident Response',
            description: 'Incident Response — module content for Dark Arts house',
            house: 'dark-arts',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['incident', 'response', 'offensive-security', 'ethical-hacking'],
            paths: [],
            components: {
                module: 'dark-arts/vault/modules/incident-response.module.html'
            },
            prerequisites: [],
            objectives: []
        },
        'dark-arts-malware-families': {
            id: 'dark-arts-malware-families',
            title: 'Malware Families',
            description: 'Malware Families — module content for Dark Arts house',
            house: 'dark-arts',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['malware', 'families', 'offensive-security', 'ethical-hacking'],
            paths: [],
            components: {
                module: 'dark-arts/vault/modules/malware-families.module.html'
            },
            prerequisites: [],
            objectives: []
        },
        'dark-arts-redteam': {
            id: 'dark-arts-redteam',
            title: 'Red Team Scenarios',
            description: 'Red Team Scenarios — barricade content for Dark Arts house',
            house: 'dark-arts',
            type: 'barricade',
            difficulty: 'beginner',
            duration: 10,
            topics: ['red', 'team', 'scenarios', 'offensive-security', 'ethical-hacking'],
            paths: [],
            components: {
                barricade: 'dark-arts/vault/modules/redteam.barricade.html'
            },
            prerequisites: [],
            objectives: []
        },
        'dark-arts-reverse-engineering': {
            id: 'dark-arts-reverse-engineering',
            title: 'Reverse Engineering Basics',
            description: 'Reverse Engineering Basics — module content for Dark Arts house',
            house: 'dark-arts',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['reverse', 'engineering', 'offensive-security', 'ethical-hacking'],
            paths: [],
            components: {
                module: 'dark-arts/vault/modules/reverse-engineering.module.html'
            },
            prerequisites: [],
            objectives: []
        },
        'dark-arts-sample': {
            id: 'dark-arts-sample',
            title: 'CTF Leaderboard • Podium Style',
            description: 'CTF Leaderboard • Podium Style — tool content for Dark Arts house',
            house: 'dark-arts',
            type: 'tool',
            difficulty: 'beginner',
            duration: 20,
            topics: ['ctf', 'leaderboard', 'podium', 'offensive-security', 'ethical-hacking'],
            paths: [],
            components: {
                applet: 'houses/dark-arts/tools/ctf-leaderboard/dark-arts-sample.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'dark-arts-sandbox-setup': {
            id: 'dark-arts-sandbox-setup',
            title: 'Sandbox Setup Guide',
            description: 'Sandbox Setup Guide — module content for Dark Arts house',
            house: 'dark-arts',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['sandbox', 'setup', 'guide', 'offensive-security', 'ethical-hacking'],
            paths: [],
            components: {
                module: 'dark-arts/vault/modules/sandbox-setup.module.html'
            },
            prerequisites: [],
            objectives: []
        },
        'dark-arts-static-analysis': {
            id: 'dark-arts-static-analysis',
            title: 'Static Analysis 101',
            description: 'Static Analysis 101 — module content for Dark Arts house',
            house: 'dark-arts',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['static', 'analysis', '101', 'offensive-security', 'ethical-hacking'],
            paths: [],
            components: {
                module: 'dark-arts/vault/modules/static-analysis.module.html'
            },
            prerequisites: [],
            objectives: []
        },
        'dark-arts-tier-locked': {
            id: 'dark-arts-tier-locked',
            title: 'Tier Locked',
            description: 'Tier Locked — barricade content for Dark Arts house',
            house: 'dark-arts',
            type: 'barricade',
            difficulty: 'beginner',
            duration: 10,
            topics: ['tier', 'locked', 'offensive-security', 'ethical-hacking'],
            paths: ['security-operations'],
            components: {
                barricade: 'dark-arts/vault/modules/tier-locked.barricade.html'
            },
            prerequisites: [],
            objectives: []
        },
    },

    // ═══════════════════════════════════════════════════════════════
    // LEARNING PATHS
    // Curated sequences that pull from multiple houses
    // ═══════════════════════════════════════════════════════════════

    paths: {
        // ORPHAN RESOLVED - moved to content section during ISSUE-009 fix (Dec 29, 2025)
        // Original was incorrectly placed in paths section, now properly located near eye-log-analysis (line ~2289)
        // 'eye-soc-simulator': {
        //     id: 'eye-soc-simulator',
        //     title: 'SOC Simulator',
        //     description: 'Simulate Security Operations Center workflows and triage',
        //     house: 'eye',
        //     type: 'applet',
        //     difficulty: 'beginner',
        //     duration: 20,
        //     topics: ['monitoring'],
        //     paths: ['security-operations', 'security-plus'],
        //     components: {
        //         applet: 'houses/eye/tools/eye-soc.tool.html'
        //     },
        // },

        'comptia-aplus': {
            id: 'comptia-aplus',
            title: 'CompTIA A+ Certification',
            description: 'Hardware, OS, networking, troubleshooting - Core 1 & Core 2',
            icon: '🎓',
            certification: 'CompTIA A+ 220-1101 & 220-1102',
            difficulty: 'beginner',
            estimatedHours: 60,
            color: '#f59e0b',
            modules: [
                // Core 2 - Operating Systems
                'forge-windows-editions',
                'forge-windows-settings',
                'forge-control-panel',
                'forge-admin-tools',
                'forge-system-tools',
                'forge-macos-linux-basics',
                // Core 1 - Hardware
                'forge-hardware-fundamentals',
                'forge-storage-raid',
                'forge-peripherals-expansion',
                // Networking basics
                'web-osi-model',
                'web-tcpip',
                // Assessment
                'forge-aplus-quiz'
            ]
        },

        'comptia-network': {
            id: 'comptia-network',
            title: 'CompTIA Network+',
            description: 'Network architecture, operations, and security',
            icon: '🌐',
            certification: 'CompTIA Network+ N10-008',
            difficulty: 'intermediate',
            estimatedHours: 50,
            color: '#3b82f6',
            modules: [
                // Domain 1: Networking Concepts
                'web-osi-model',
                'web-tcpip',
                'web-ip-addressing',
                'web-vlsm',
                'web-ipv6',
                // Domain 2: Network Implementation
                'web-switching',
                'web-stp',
                'web-routing',
                'web-wireless',
                'web-network-services',
                // Domain 3: Network Operations
                'web-troubleshooting',
                // Domain 4: Network Security
                'shield-cia-triad',
                // Hands-on Lab
                'web-network-simulator'
            ]
        },

        'comptia-security': {
            id: 'comptia-security',
            title: 'CompTIA Security+',
            description: 'Security fundamentals, threats, and defenses',
            icon: '🛡️',
            certification: 'CompTIA Security+ SY0-701',
            difficulty: 'intermediate',
            estimatedHours: 45,
            color: '#ef4444',
            modules: [
                // Domain 1: General Security Concepts
                'shield-cia-triad',
                'shield-security-fundamentals',
                // Domain 2: Threats, Vulnerabilities, and Mitigations
                'shield-threat-types',
                'shield-social-engineering',
                'shield-web-attacks',
                // Domain 3: Security Architecture
                'shield-network-security',
                'shield-cryptography',
                'key-encryption-basics',
                // Domain 4: Security Operations
                'shield-access-control',
                // Domain 5: Security Program Management
                'shield-risk-management',
                // Networking context
                'web-osi-model'
            ]
        },

        'windows-admin': {
            id: 'windows-admin',
            title: 'Windows Administration',
            description: 'Complete Windows desktop and server management',
            icon: '🪟',
            certification: null,
            difficulty: 'intermediate',
            estimatedHours: 35,
            color: '#0078d4',
            modules: [
                'forge-windows-editions',
                'forge-windows-settings',
                'forge-control-panel',
                'forge-admin-tools',
                'forge-system-tools'
            ]
        },

        'aws-ccp': {
            id: 'aws-ccp',
            title: 'AWS Cloud Practitioner',
            description: 'Complete AWS Cloud Practitioner certification preparation',
            icon: '☁️',
            certification: 'AWS Certified Cloud Practitioner CLF-C02',
            difficulty: 'beginner',
            estimatedHours: 40,
            color: '#ff9900',
            modules: [
                // Fundamentals
                'cloud-concepts',
                'cloud-models',
                'cloud-providers',
                'cloud-architecture',
                // AWS Account & Support
                'cloud-aws-account',
                'cloud-aws-support',
                'cloud-aws-regions',
                'cloud-aws-security',
                'cloud-aws-tools',
                // AWS Services
                'cloud-aws-compute',
                'cloud-aws-ec2',
                'cloud-aws-storage',
                'cloud-aws-database',
                'cloud-aws-networking',
                // Advanced
                'cloud-aws-automation',
                'cloud-aws-services',
                'cloud-aws-use-cases',
                'cloud-aws-practitioner'
            ]
        },

        'azure-fundamentals': {
            id: 'azure-fundamentals',
            title: 'Azure Fundamentals',
            description: 'Microsoft Azure cloud platform fundamentals',
            icon: '🔷',
            certification: 'Microsoft Azure Fundamentals AZ-900',
            difficulty: 'beginner',
            estimatedHours: 25,
            color: '#0078d4',
            modules: [
                'cloud-concepts',
                'cloud-models',
                'cloud-providers',
                'cloud-azure-fundamentals'
            ]
        },

        'devops-fundamentals': {
            id: 'devops-fundamentals',
            title: 'DevOps Fundamentals',
            description: 'CI/CD, automation, and infrastructure as code',
            icon: '🔄',
            certification: null,
            difficulty: 'intermediate',
            estimatedHours: 40,
            color: '#10b981',
            modules: [
                'code-git-basics',
                'script-linux-basics',
                'script-bash-scripting',
                'script-python-basics',
                'script-python-files',
                'script-automation-concepts',
                'cloud-concepts'
            ]
        },

        'comptia-linux': {
            id: 'comptia-linux',
            title: 'CompTIA Linux+',
            description: 'Linux system administration and command line mastery',
            icon: '🐧',
            certification: 'CompTIA Linux+ XK0-005',
            difficulty: 'intermediate',
            estimatedHours: 50,
            color: '#a78bfa',
            modules: [
                // System Management
                'script-linux-basics',
                'script-linux-lab-001',  // L-001: User Identity
                'script-linux-lab-002',  // L-002: File Navigation
                'script-linux-filesystem',
                'script-linux-permissions',
                'script-command-translator',
                // Scripting & Automation
                'script-bash-scripting',
                'script-process-management',
                'script-log-management',
                'script-package-management',
                // Advanced
                'script-automation-concepts'
            ]
        },

        'python-fundamentals': {
            id: 'python-fundamentals',
            title: 'Python Programming',
            description: 'Complete Python programming from basics to OOP',
            icon: '🐍',
            certification: null,
            difficulty: 'beginner',
            estimatedHours: 35,
            color: '#fbbf24',
            modules: [
                'script-python-basics',
                'script-python-strings',
                'script-python-flow-control',
                'script-python-functions',
                'script-python-collections',
                'script-python-dictionaries',
                'script-python-files',
                'script-python-oop'
            ]
        },
    },

    // ═══════════════════════════════════════════════════════════════
    // HOUSE DEFINITIONS
    // Metadata for each house
    // ═══════════════════════════════════════════════════════════════

    houses: {
        web: {
            id: 'web',
            name: 'House of the Web',
            shortName: 'The Web',
            icon: '🕸️',
            domain: 'Networking & Connections',
            color: '#60a5fa',
            description: 'Master the interconnected world of networks and protocols'
        },
        shield: {
            id: 'shield',
            name: 'House of the Shield',
            shortName: 'The Shield',
            icon: '🛡️',
            domain: 'Security & Defense',
            color: '#f87171',
            description: 'Defend systems and protect against threats'
        },
        forge: {
            id: 'forge',
            name: 'House of the Forge',
            shortName: 'The Forge',
            icon: '⚒️',
            domain: 'Hardware & Systems',
            color: '#fbbf24',
            description: 'Build and configure the physical and virtual machines'
        },
        script: {
            id: 'script',
            name: 'House of the Script',
            shortName: 'The Script',
            icon: '📜',
            domain: 'Automation & Efficiency',
            color: '#a78bfa',
            description: 'Automate everything, script once run forever'
        },
        cloud: {
            id: 'cloud',
            name: 'House of the Cloud',
            shortName: 'The Cloud',
            icon: '☁️',
            domain: 'Infrastructure & Scale',
            color: '#38bdf8',
            description: 'Build empires in the ether, scale infinitely'
        },
        code: {
            id: 'code',
            name: 'House of the Code',
            shortName: 'The Code',
            icon: '💻',
            domain: 'Development & Engineering',
            color: '#4ade80',
            description: 'Create software that shapes the digital world'
        },
        key: {
            id: 'key',
            name: 'House of the Key',
            shortName: 'The Key',
            icon: '🔑',
            domain: 'Cryptography & Secrets',
            color: '#f472b6',
            description: 'Guard secrets with the power of mathematics'
        },
        eye: {
            id: 'eye',
            name: 'House of the Eye',
            shortName: 'The Eye',
            icon: '👁️',
            domain: 'Monitoring & Analysis',
            color: '#c084fc',
            description: 'See everything, analyze all, miss nothing'
        },
        'command-line-hacker': {
            id: 'command-line-hacker',
            title: 'Command Line Hacker',
            description: 'Master the terminal as a tool for reconnaissance, analysis, and operations',
            icon: '💀',
            certification: null,
            difficulty: 'intermediate',
            estimatedHours: 75,
            color: '#00ff41',
            homePage: 'houses/script/courses/clh/index.html',
            modules: [
                // Foundation (CLH-001 to CLH-005)
                'script-clh-001',  // Introduction to Hacker CLI
                'script-clh-002',  // Navigation & Reconnaissance
                'script-clh-003',  // Pattern Hunting (grep)
                'script-clh-004',  // Process Investigation
                'script-clh-005',  // Log Analysis
                // Operations (CLH-006 to CLH-008)
                'script-clh-006',  // File Operations
                'script-clh-007',  // Permissions & Access Control
                'script-clh-008',  // Shell Scripting Basics
                // Analysis (CLH-009 to CLH-011)
                'script-clh-009',  // Text Processing
                'script-clh-010',  // I/O Redirection
                'script-clh-011',  // Advanced Grep & Regex
                // Advanced (CLH-012 to CLH-015)
                'script-clh-012',  // Network Basics
                'script-clh-013',  // Environment Variables
                'script-clh-014',  // Process Control
                'script-clh-015',  // Capstone Mission
                // Tactical (CLH-016 to CLH-022)
                'script-clh-016',  // System Intel
                'script-clh-017',  // Find & Locate
                'script-clh-018',  // Archive Operations
                'script-clh-019',  // Disk Forensics
                'script-clh-020',  // User Reconnaissance
                'script-clh-021',  // SSH Operations
                'script-clh-022',  // Network Reconnaissance
                // Black Ops (CLH-023 to CLH-027)
                'script-clh-023',  // Service Management
                'script-clh-024',  // Scheduled Tasks
                'script-clh-025',  // Package Management
                'script-clh-026',  // Access Control
                'script-clh-027',  // User Management
                // Ghost Tier (CLH-028 to CLH-031)
                'script-clh-028',  // System Monitoring
                'script-clh-029',  // Vim Essentials
                'script-clh-030',  // OPERATION CHIMERA
                'script-clh-031',  // Operation BLACKOUT
            ]
        },
        'dark-arts': {
            id: 'dark-arts',
            name: 'House of the Dark Arts',
            shortName: 'The Dark Arts',
            icon: '🌑',
            domain: 'Offensive Security',
            color: '#6b21a8',
            description: 'Understand attacks to build better defenses'
        },
        'divergent': {
            id: 'divergent',
            name: 'The Factionless',
            shortName: 'Factionless',
            icon: '⚡',
            domain: 'All Domains',
            color: '#ff00ff',
            description: 'You cannot be contained. All houses are open to you.',
            hidden: true  // Don't show in house lists - Divergents explore all houses
        },
    },

    // ═══════════════════════════════════════════════════════════════
    // UTILITY METHODS
    // ═══════════════════════════════════════════════════════════════

    /**
     * Get all content for a specific house
     */
    getHouseContent(houseId) {
        return Object.values(this.content).filter(c => c.house === houseId);
    },

    /**
     * Get all content for a learning path
     */
    getPathContent(pathId) {
        const path = this.paths[pathId];
        if (!path) return [];
        return path.modules.map(moduleId => this.content[moduleId]).filter(Boolean);
    },

    /**
     * Get content by topic
     */
    getContentByTopic(topic) {
        return Object.values(this.content).filter(c => c.topics.includes(topic));
    },

    /**
     * Get user progress for a path
     */
    getPathProgress(pathId) {
        const progress = JSON.parse(localStorage.getItem('hexworth_progress') || '{}');
        const path = this.paths[pathId];
        if (!path) return { completed: 0, total: 0, percent: 0 };

        let completed = 0;
        path.modules.forEach(moduleId => {
            const content = this.content[moduleId];
            if (content) {
                const houseProgress = progress[content.house] || {};
                // Check if any component is completed
                const moduleKey = moduleId.replace(`${content.house}-`, '');
                if (houseProgress[moduleKey]?.completed) {
                    completed++;
                }
            }
        });

        return {
            completed,
            total: path.modules.length,
            percent: Math.round((completed / path.modules.length) * 100)
        };
    },

    /**
     * Get user progress for a house
     */
    getHouseProgress(houseId) {
        const houseContent = this.getHouseContent(houseId);
        const progress = JSON.parse(localStorage.getItem('hexworth_progress') || '{}');
        const houseProgress = progress[houseId] || {};

        let completed = 0;
        houseContent.forEach(content => {
            const moduleKey = content.id.replace(`${houseId}-`, '');
            if (houseProgress[moduleKey]?.completed) {
                completed++;
            }
        });

        return {
            completed,
            total: houseContent.length,
            percent: houseContent.length > 0 ? Math.round((completed / houseContent.length) * 100) : 0
        };
    },

    /**
     * Check if prerequisites are met for content
     */
    prerequisitesMet(contentId) {
        const content = this.content[contentId];
        if (!content || !content.prerequisites.length) return true;

        const progress = JSON.parse(localStorage.getItem('hexworth_progress') || '{}');

        return content.prerequisites.every(prereqId => {
            const prereq = this.content[prereqId];
            if (!prereq) return true;
            const houseProgress = progress[prereq.house] || {};
            const moduleKey = prereqId.replace(`${prereq.house}-`, '');
            return houseProgress[moduleKey]?.completed;
        });
    },

    /**
     * Get recommended next content based on progress
     */
    getRecommendedContent(houseId) {
        const houseContent = this.getHouseContent(houseId);

        // Find first incomplete module with met prerequisites
        for (const content of houseContent) {
            const progress = JSON.parse(localStorage.getItem('hexworth_progress') || '{}');
            const houseProgress = progress[content.house] || {};
            const moduleKey = content.id.replace(`${content.house}-`, '');

            if (!houseProgress[moduleKey]?.completed && this.prerequisitesMet(content.id)) {
                return content;
            }
        }

        return null;
    },

    /**
     * Get all available paths for a house
     */
    getPathsForHouse(houseId) {
        return Object.values(this.paths).filter(path =>
            path.modules.some(moduleId => {
                const content = this.content[moduleId];
                return content && content.house === houseId;
            })
        );
    }
};

// Export for module systems (Node.js)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ContentRegistry;
}

// Export for browser (make available on window for dynamic script loading)
if (typeof window !== 'undefined') {
    window.ContentRegistry = ContentRegistry;
}

// ORPHAN RESOLVED - moved to houses section during ISSUE-012 fix (Dec 29, 2025)
// Original location was outside ContentRegistry object, now properly placed at line ~9498
// 'divergent': {
//     id: 'divergent',
//     name: 'The Factionless',
//     shortName: 'Factionless',
//     icon: '⚡',
//     domain: 'All Domains',
//     color: '#ff00ff',
//     description: 'You cannot be contained. All houses are open to you.',
//     hidden: true  // Don't show in house lists - Divergents explore all houses
// }