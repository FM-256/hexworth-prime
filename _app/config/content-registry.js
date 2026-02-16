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
            paths: ['comptia-aplus', 'windows-admin'],
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
            paths: ['comptia-aplus', 'windows-admin'],
            components: {
                presentation: 'houses/forge/presentations/forge-windows-settings.presentation.html',
                applet: 'houses/forge/applets/forge-settings.tool.html',
                lab: 'houses/forge/labs/forge-windows-settings.lab.html'
            },
            prerequisites: ['forge-windows-settings'],
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
            paths: ['comptia-aplus', 'windows-admin'],
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
            paths: ['comptia-aplus', 'windows-admin'],
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
            paths: ['comptia-aplus', 'windows-admin'],
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
            paths: ['comptia-aplus'],
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
            paths: ['comptia-aplus'],
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
            paths: ['comptia-aplus'],
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
            paths: ['comptia-aplus'],
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
            paths: ['comptia-aplus'],
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
                applet: 'houses/web/applets/ip-addressing/VLSM/web-vlsm.applet.html'
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
            paths: ['comptia-security', 'security-fundamentals'],
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
            paths: ['comptia-security', 'security-fundamentals'],
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
            paths: ['comptia-security'],
            components: {
                applet: 'houses/shield/applets/threats/attacks_malware/shield-attacks.applet.html'
            },
            prerequisites: ['shield-threat-types'],
            objectives: [
                'Identify social engineering attack types',
                'Recognize phishing indicators',
                'Apply user awareness training principles'
            ]
        },

        'shield-social-engineering': {
            id: 'shield-social-engineering',
            title: 'Social Engineering',
            description: 'Phishing, pretexting, baiting, and human-based attacks',
            house: 'shield',
            type: 'module',
            difficulty: 'intermediate',
            duration: 45,
            topics: ['social-engineering', 'phishing', 'attacks'],
            paths: ['comptia-security'],
            components: {
                applet: 'houses/shield/applets/threats/social_engineering/shield-social-engineering.applet.html'
            },
            prerequisites: ['shield-threat-types'],
            objectives: [
                'Understand XSS attack vectors',
                'Recognize SQL injection patterns',
                'Apply OWASP mitigation strategies'
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
            paths: ['comptia-security'],
            components: {
                applet: 'houses/shield/applets/threats/sql_injection/shield-sq-linjection.applet.html'
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
            paths: ['comptia-security'],
            components: {
                applet: 'houses/shield/applets/crypto/cryptography/shield-cryptography.applet.html'
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
            paths: ['comptia-security', 'comptia-network'],
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
            paths: ['comptia-security'],
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
            paths: ['comptia-security'],
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
            paths: ['security-fundamentals', 'comptia-security'],
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
            paths: ['comptia-security', 'ec-council-cse'],
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
            paths: ['comptia-security', 'ec-council-cse'],
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
            paths: ['comptia-security', 'ec-council-cse'],
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
            paths: ['ec-council-cse'],
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
            paths: ['ec-council-cse'],
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
            paths: ['ec-council-cse'],
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
            paths: ['comptia-security', 'cryptography-track'],
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
            paths: ['comptia-linux', 'command-line-hacker'],
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
            paths: ['comptia-linux', 'command-line-hacker'],
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
            paths: ['comptia-linux', 'command-line-hacker'],
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
            paths: ['comptia-linux', 'command-line-hacker'],
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
            paths: ['comptia-linux', 'command-line-hacker'],
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
            paths: ['comptia-linux', 'command-line-hacker'],
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
            paths: ['comptia-linux', 'command-line-hacker'],
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
            paths: ['comptia-linux', 'command-line-hacker'],
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
            paths: ['comptia-linux', 'command-line-hacker'],
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
            paths: ['comptia-linux', 'command-line-hacker'],
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
            paths: ['comptia-linux', 'command-line-hacker'],
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
            paths: ['comptia-linux', 'command-line-hacker'],
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
            paths: ['comptia-linux', 'command-line-hacker'],
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
            paths: ['comptia-linux', 'command-line-hacker'],
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
            paths: ['comptia-linux', 'command-line-hacker'],
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
            paths: ['command-line-hacker'],
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
            paths: ['command-line-hacker'],
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
            paths: ['command-line-hacker'],
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
            paths: ['command-line-hacker'],
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
            paths: ['command-line-hacker'],
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
            paths: ['command-line-hacker'],
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
            paths: ['command-line-hacker'],
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
            paths: ['command-line-hacker'],
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
            paths: ['command-line-hacker'],
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
            paths: ['command-line-hacker'],
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
            paths: ['command-line-hacker'],
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
            paths: ['command-line-hacker'],
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
            paths: ['command-line-hacker'],
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
            paths: ['command-line-hacker'],
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
            paths: ['command-line-hacker'],
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
            paths: ['command-line-hacker'],
            components: {
                lab: 'houses/script/courses/clh/modules/clh-031/script-lab.lab.html'
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
            paths: ['comptia-aplus', 'comptia-linux'],
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
            paths: ['windows-admin', 'devops-fundamentals'],
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
            paths: ['windows-admin', 'comptia-aplus'],
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
            paths: ['windows-admin', 'comptia-aplus'],
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
            paths: ['windows-admin', 'comptia-aplus'],
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
            paths: ['devops-fundamentals', 'developer-essentials'],
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
            paths: ['devops-fundamentals', 'cloud-fundamentals'],
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
            paths: ['devops-fundamentals', 'cloud-fundamentals'],
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
            paths: ['devops-fundamentals', 'developer-essentials'],
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
            paths: ['developer-essentials', 'devops-fundamentals'],
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
            paths: ['security-operations', 'sysadmin-essentials'],
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
            paths: ['security-operations', 'comptia-security'],
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
            paths: ['comptia-security', 'security-fundamentals', 'security-operations'],
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
            paths: ['comptia-security', 'security-fundamentals', 'comptia-network', 'security-operations'],
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
            paths: ['comptia-security', 'security-fundamentals'],
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
            paths: ['comptia-security', 'security-fundamentals'],
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
            paths: ['comptia-security', 'security-fundamentals'],
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
            paths: ['comptia-security', 'security-fundamentals'],
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
            paths: ['comptia-security', 'security-fundamentals'],
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
            paths: ['comptia-security', 'security-fundamentals', 'comptia-aplus', 'security-operations'],
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
            paths: ['comptia-security', 'security-fundamentals', 'comptia-aplus', 'security-operations'],
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
            paths: ['comptia-security', 'security-fundamentals', 'comptia-aplus', 'security-operations'],
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
            paths: ['comptia-security', 'security-fundamentals', 'comptia-aplus', 'security-operations'],
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
            paths: ['comptia-security', 'security-fundamentals', 'comptia-aplus', 'security-operations'],
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
            paths: ['comptia-security', 'security-fundamentals', 'comptia-aplus', 'comptia-network', 'security-operations'],
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
            paths: ['comptia-security', 'security-fundamentals', 'comptia-aplus', 'security-operations'],
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
            paths: ['comptia-security', 'security-fundamentals', 'comptia-aplus', 'security-operations'],
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
            paths: ['comptia-security', 'security-fundamentals', 'comptia-aplus', 'security-operations'],
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
            paths: ['comptia-security', 'security-fundamentals', 'comptia-aplus', 'security-operations'],
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
            paths: ['comptia-security', 'security-fundamentals', 'comptia-aplus', 'security-operations'],
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
            paths: ['comptia-security', 'security-fundamentals', 'comptia-aplus', 'security-operations'],
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
            paths: ['comptia-security', 'security-fundamentals', 'comptia-aplus', 'security-operations'],
            components: {
                quiz: 'houses/shield/applets/compliance/cmmc_quiz/shield-cmmc-comprehensive.quiz.html'
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
            paths: ['comptia-security', 'security-fundamentals', 'comptia-aplus', 'security-operations'],
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
            paths: ['comptia-security', 'security-fundamentals', 'comptia-aplus', 'security-operations'],
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
            paths: ['comptia-security', 'security-fundamentals', 'comptia-aplus', 'security-operations'],
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
            paths: ['comptia-security', 'security-fundamentals', 'comptia-aplus', 'security-operations'],
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
            paths: ['comptia-security', 'security-fundamentals', 'comptia-network', 'security-operations'],
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
            paths: ['comptia-security', 'security-fundamentals', 'cryptography-track'],
            components: {
                applet: 'houses/shield/applets/crypto/block_mode/shield-block.applet.html'
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
            paths: ['comptia-security', 'security-fundamentals', 'cryptography-track'],
            components: {
                applet: 'houses/shield/applets/crypto/blockchain/shield-blockchain.applet.html'
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
            paths: ['comptia-security', 'security-fundamentals', 'cryptography-track'],
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
            paths: ['comptia-security', 'security-fundamentals', 'cryptography-track'],
            components: {
                applet: 'houses/shield/applets/crypto/cryptomatch/shield-crypto-match.applet.html'
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
            paths: ['comptia-security', 'security-fundamentals', 'cryptography-track'],
            components: {
                applet: 'houses/shield/applets/crypto/diffie_hellman/shield-diffie-hellman.applet.html'
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
            paths: ['comptia-security', 'security-fundamentals', 'devops-fundamentals', 'comptia-network', 'cryptography-track'],
            components: {
                applet: 'houses/shield/applets/crypto/digital_signatures/shield-digital-signature.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-encrypt-data': {
            id: 'shield-encrypt-data',
            title: 'Encrypt Data',
            description: 'Data encryption exercise',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['cryptography', 'security', 'encryption'],
            paths: ['comptia-security', 'security-fundamentals', 'cryptography-track'],
            components: {
                applet: 'houses/shield/applets/crypto/encrypt_data/shield-encrypt-data.applet.html'
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
            paths: ['comptia-security', 'security-fundamentals', 'cryptography-track'],
            components: {
                applet: 'houses/shield/applets/crypto/encryption/shield-encryption-jedit-6-1.applet.html'
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
            paths: ['comptia-security', 'security-fundamentals'],
            components: {
                applet: 'houses/shield/applets/crypto/factor_prime/shield-factor-prime.applet.html'
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
            paths: ['comptia-security', 'security-fundamentals', 'cryptography-track'],
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
            paths: ['comptia-security', 'security-fundamentals', 'cryptography-track'],
            components: {
                applet: 'houses/shield/applets/crypto/hashing/shield-hashing.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-hashing-vo': {
            id: 'shield-hashing-vo',
            title: 'Hashing (Narrated)',
            description: 'Narrated hashing tutorial',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['cryptography', 'security', 'hashing'],
            paths: ['comptia-security', 'security-fundamentals', 'cryptography-track'],
            components: {
                applet: 'houses/shield/applets/crypto/hashing_narrated/shield-hashing-vo.applet.html'
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
            paths: ['comptia-security', 'security-fundamentals', 'cryptography-track'],
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
            paths: ['comptia-security', 'security-fundamentals', 'cryptography-track'],
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
            paths: ['comptia-security', 'security-fundamentals', 'cryptography-track'],
            components: {
                applet: 'houses/shield/applets/crypto/hashing_steganography/shield-stego.applet.html'
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
            paths: ['comptia-security', 'security-fundamentals', 'cryptography-track'],
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
            paths: ['comptia-security', 'security-fundamentals', 'cryptography-track'],
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
            paths: ['comptia-security', 'security-fundamentals', 'cryptography-track'],
            components: {
                applet: 'houses/shield/applets/crypto/hashing_steganography/shield-hash-v3.applet.html'
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
            paths: ['comptia-security', 'security-fundamentals', 'cryptography-track'],
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
            paths: ['comptia-security', 'security-fundamentals', 'cryptography-track'],
            components: {
                applet: 'houses/shield/applets/crypto/pki/shield-pki.applet.html'
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
            paths: ['comptia-security', 'security-fundamentals', 'cryptography-track'],
            components: {
                applet: 'houses/shield/applets/crypto/rsa/shield-rsa.applet.html'
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
            paths: ['comptia-security', 'security-fundamentals'],
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
            paths: ['comptia-security', 'security-fundamentals', 'security-operations'],
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
            paths: ['comptia-security', 'security-fundamentals'],
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
            paths: ['comptia-security', 'security-fundamentals'],
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
            paths: ['comptia-security', 'security-fundamentals'],
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
            paths: ['comptia-security', 'security-fundamentals'],
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
            paths: ['comptia-security', 'security-fundamentals'],
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
            paths: ['comptia-security', 'security-fundamentals'],
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
            paths: ['comptia-security', 'security-fundamentals'],
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
            paths: ['comptia-security', 'security-fundamentals'],
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
            paths: ['comptia-security', 'security-fundamentals'],
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
            paths: ['comptia-security', 'security-fundamentals'],
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
            paths: ['comptia-security', 'security-fundamentals'],
            components: {
                applet: 'houses/shield/applets/games/cookie_caper/shield-cookies.applet.html'
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
            paths: ['comptia-security', 'security-fundamentals'],
            components: {
                applet: 'houses/shield/applets/games/cyber_hat_match/shield-hatmatch.applet.html'
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
            paths: ['comptia-security', 'security-fundamentals'],
            components: {
                applet: 'houses/shield/applets/games/cyber_scramble/shield-cyberscramble.applet.html'
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
            paths: ['comptia-security', 'security-fundamentals'],
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
            paths: ['comptia-security', 'security-fundamentals'],
            components: {
                applet: 'houses/shield/applets/games/hacker_hangman/shield-hangman.applet.html'
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
            paths: ['comptia-security', 'security-fundamentals'],
            components: {
                applet: 'houses/shield/applets/games/whats_my_crime/shield-crime.applet.html'
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
            paths: ['comptia-security', 'security-fundamentals'],
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
            paths: ['comptia-security', 'security-fundamentals'],
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
            paths: ['comptia-security', 'security-fundamentals', 'comptia-network'],
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
            paths: ['comptia-security', 'security-fundamentals'],
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
            paths: ['comptia-security', 'security-fundamentals', 'comptia-linux'],
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
            paths: ['comptia-security', 'security-fundamentals', 'comptia-network'],
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
            paths: ['comptia-security', 'security-fundamentals', 'comptia-network'],
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
            paths: ['comptia-security', 'security-fundamentals'],
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
            paths: ['comptia-security', 'security-fundamentals'],
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
            paths: ['comptia-security', 'security-fundamentals'],
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
            paths: ['comptia-security', 'security-fundamentals'],
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
            paths: ['comptia-security', 'security-fundamentals'],
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
            paths: ['comptia-security', 'security-fundamentals'],
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
            paths: ['comptia-security', 'security-fundamentals', 'security-operations'],
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
            paths: ['comptia-security', 'security-fundamentals'],
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
            paths: ['comptia-security', 'security-fundamentals', 'security-operations'],
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
            paths: ['comptia-security', 'security-fundamentals'],
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
            paths: ['comptia-security', 'security-fundamentals', 'security-operations'],
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
            paths: ['comptia-security', 'security-fundamentals'],
            components: {
                applet: 'houses/shield/applets/threats/buffer_overflow/shield-bufferoverflow.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-code-injection': {
            id: 'shield-code-injection',
            title: 'Code Injection',
            description: 'Code injection attacks',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['threats', 'security'],
            paths: ['comptia-security', 'security-fundamentals'],
            components: {
                applet: 'houses/shield/applets/threats/code_injection/shield-codeinjection.applet.html'
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
            paths: ['comptia-security', 'security-fundamentals'],
            components: {
                applet: 'houses/shield/applets/threats/cross_site_scripting/shield-crosssitescripting.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-google-hacking': {
            id: 'shield-google-hacking',
            title: 'Google Hacking',
            description: 'Google dorking techniques',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['threats', 'security'],
            paths: ['comptia-security', 'security-fundamentals'],
            components: {
                applet: 'houses/shield/applets/threats/google_hacking/shield-googlehacking.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-heartbleed': {
            id: 'shield-heartbleed',
            title: 'Heartbleed',
            description: 'Heartbleed vulnerability',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['threats', 'security'],
            paths: ['comptia-security', 'security-fundamentals'],
            components: {
                applet: 'houses/shield/applets/threats/heartbleed/shield-heartbleed.applet.html'
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
            paths: ['comptia-security', 'security-fundamentals'],
            components: {
                applet: 'houses/shield/applets/threats/shield-malware-types.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-meltdown': {
            id: 'shield-meltdown',
            title: 'Meltdown & Spectre',
            description: 'CPU vulnerabilities',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['threats', 'security'],
            paths: ['comptia-security', 'security-fundamentals'],
            components: {
                applet: 'houses/shield/applets/threats/meltdown_spectre/shield-meltdown-spectre.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-os-injection': {
            id: 'shield-os-injection',
            title: 'OS Command Injection',
            description: 'Command injection attacks',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['threats', 'security'],
            paths: ['comptia-security', 'security-fundamentals'],
            components: {
                applet: 'houses/shield/applets/threats/os_command_injection/shield-oscommandinjection.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-osint': {
            id: 'shield-osint',
            title: 'OSINT',
            description: 'Open source intelligence',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['threats', 'security'],
            paths: ['comptia-security', 'security-fundamentals', 'comptia-network', 'security-operations'],
            components: {
                applet: 'houses/shield/applets/threats/osint/shield-osint.applet.html'
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
            paths: ['comptia-security', 'security-fundamentals', 'comptia-network', 'security-operations'],
            components: {
                applet: 'houses/shield/applets/threats/osint_challenge/shield-osint-lab.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-pentest': {
            id: 'shield-pentest',
            title: 'Penetration Testing',
            description: 'Pen testing methodology',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['threats', 'security'],
            paths: ['comptia-security', 'security-fundamentals', 'devops-fundamentals', 'security-operations'],
            components: {
                applet: 'houses/shield/applets/threats/pen_testing/shield-pen-testing.applet.html'
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
            paths: ['comptia-security', 'security-fundamentals'],
            components: {
                applet: 'houses/shield/applets/threats/phishing_mystery/shield-phishing.applet.html'
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
            paths: ['comptia-security', 'security-fundamentals'],
            components: {
                applet: 'houses/shield/applets/threats/ransomware/shield-ransomware-attack.applet.html'
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
            paths: ['comptia-security', 'security-fundamentals'],
            components: {
                applet: 'houses/shield/applets/threats/social_engineering_tactics/shield-social-engineering-tactics.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-spoofing': {
            id: 'shield-spoofing',
            title: 'Spoofing',
            description: 'Spoofing attack types',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['threats', 'security'],
            paths: ['comptia-security', 'security-fundamentals'],
            components: {
                applet: 'houses/shield/applets/threats/spoofing/shield-spoofing1.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-stuxnet': {
            id: 'shield-stuxnet',
            title: 'Stuxnet',
            description: 'Stuxnet case study',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['threats', 'security'],
            paths: ['comptia-security', 'security-fundamentals'],
            components: {
                applet: 'houses/shield/applets/threats/stuxnet/shield-stuxnet.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-threat-actors': {
            id: 'shield-threat-actors',
            title: 'Threat Actors',
            description: 'Types of threat actors',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['threats', 'security'],
            paths: ['comptia-security', 'security-fundamentals'],
            components: {
                applet: 'houses/shield/applets/threats/threat_actors/shield-threat-actors.applet.html'
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
            paths: ['comptia-security', 'security-fundamentals'],
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
            paths: ['comptia-security', 'security-fundamentals'],
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
            paths: ['comptia-security', 'security-fundamentals'],
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
            paths: ['comptia-security', 'security-fundamentals', 'security-operations'],
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
            paths: ['comptia-security', 'security-fundamentals', 'security-operations'],
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
            paths: ['comptia-security', 'security-fundamentals'],
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
            paths: ['comptia-security', 'security-fundamentals', 'security-operations'],
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
            paths: ['comptia-security', 'security-fundamentals', 'security-operations'],
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
            paths: ['comptia-security', 'security-fundamentals'],
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
            paths: ['comptia-security', 'security-fundamentals', 'security-operations'],
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
            paths: ['comptia-security', 'security-fundamentals'],
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
            paths: ['comptia-security', 'security-fundamentals', 'aws-ccp', 'security-operations'],
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
            paths: ['comptia-security', 'security-fundamentals'],
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
            paths: ['comptia-security', 'security-fundamentals', 'comptia-network', 'security-operations'],
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
            paths: ['comptia-security', 'security-fundamentals'],
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
            paths: ['comptia-security', 'security-fundamentals', 'security-operations'],
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
            paths: ['comptia-security', 'security-fundamentals'],
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
            paths: ['comptia-security', 'security-fundamentals', 'comptia-network', 'security-operations'],
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
            paths: ['comptia-security', 'security-fundamentals'],
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
            paths: ['comptia-security', 'security-fundamentals'],
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
            paths: ['comptia-security', 'security-fundamentals'],
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
            paths: ['comptia-security', 'security-fundamentals', 'comptia-network'],
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
            paths: ['comptia-security', 'security-fundamentals', 'comptia-network'],
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
            paths: ['comptia-security', 'security-fundamentals', 'cryptography-track'],
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
            paths: ['comptia-security', 'security-fundamentals', 'cryptography-track'],
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
            paths: ['comptia-security', 'security-fundamentals'],
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
            paths: ['comptia-security', 'security-fundamentals'],
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
            paths: ['comptia-security', 'security-fundamentals', 'security-operations'],
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
            paths: ['comptia-security', 'security-fundamentals', 'security-operations'],
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
            paths: ['comptia-security', 'security-fundamentals'],
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
            paths: ['comptia-security', 'security-fundamentals'],
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
            paths: ['comptia-security', 'security-fundamentals', 'security-operations'],
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
            paths: ['comptia-security', 'security-fundamentals', 'security-operations'],
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
            paths: ['comptia-security', 'security-fundamentals', 'devops-fundamentals', 'security-operations'],
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
            paths: ['comptia-security', 'security-fundamentals', 'security-operations'],
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
        'web-ipv6-challenge': {
            id: 'web-ipv6-challenge',
            title: 'IPv6 Challenge',
            description: 'Practice IPv6 addressing exercises',
            house: 'web',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['ip-addressing', 'networking'],
            paths: ['comptia-network', 'ccna'],
            components: {
                applet: 'houses/web/applets/ip-addressing/IPv6Challenge/web-ipv6-challenge.applet.html'
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
                applet: 'houses/web/applets/ip-addressing/NAT/web-nat.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-vlsm-challenge': {
            id: 'web-vlsm-challenge',
            title: 'VLSM Challenge',
            description: 'Variable length subnet masking practice',
            house: 'web',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['ip-addressing', 'networking'],
            paths: ['comptia-network', 'ccna'],
            components: {
                applet: 'houses/web/applets/ip-addressing/VLSM_challenge/web-vlsm-challenge.applet.html'
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
                applet: 'houses/web/applets/ip-addressing/binaryIP/web-binary-ip.applet.html'
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
                applet: 'houses/web/applets/ip-addressing/classA/web-class-a.applet.html'
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
                applet: 'houses/web/applets/ip-addressing/classB/web-class-b.applet.html'
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
                applet: 'houses/web/applets/ip-addressing/intro_subnetting/web-intro-subnetting.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-mac-addressing': {
            id: 'web-mac-addressing',
            title: 'MAC Addressing',
            description: 'Physical addressing exercises',
            house: 'web',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['ip-addressing', 'networking'],
            paths: ['comptia-network', 'ccna'],
            components: {
                applet: 'houses/web/applets/ip-addressing/macaddressing/web-emate-pizzaparty-exercise-102918.applet.html'
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
                applet: 'houses/web/applets/ip-addressing/network_classes2/web-network-classes2.applet.html'
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
                applet: 'houses/web/applets/ip-addressing/networkaddressing/web-emate-understanding-addresses.applet.html'
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
            paths: ['comptia-network', 'ccna', 'comptia-security'],
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
            paths: ['cloud-fundamentals'],
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
            paths: ['cloud-fundamentals', 'aws-ccp', 'comptia-network'],
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
            paths: ['cloud-fundamentals', 'aws-ccp'],
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
            paths: ['cloud-fundamentals', 'aws-ccp', 'comptia-security'],
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
            paths: ['cloud-fundamentals', 'aws-ccp'],
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
            paths: ['cloud-fundamentals'],
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
            paths: ['cloud-fundamentals'],
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
            paths: ['cloud-fundamentals', 'aws-ccp', 'comptia-network'],
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
            paths: ['cloud-fundamentals', 'aws-ccp'],
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
            paths: ['cloud-fundamentals', 'aws-ccp'],
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
            paths: ['cloud-fundamentals'],
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
            paths: ['cloud-fundamentals'],
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
            paths: ['cloud-fundamentals'],
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
            paths: ['cloud-fundamentals', 'aws-ccp'],
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
            paths: ['cloud-fundamentals'],
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
            paths: ['cloud-fundamentals'],
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
            paths: ['cloud-fundamentals', 'aws-ccp'],
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
            paths: ['cloud-fundamentals', 'cryptography-track'],
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
            paths: ['cloud-fundamentals', 'comptia-network', 'comptia-security'],
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
            paths: ['cloud-fundamentals', 'comptia-security'],
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
            paths: ['cloud-fundamentals'],
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
            paths: ['cloud-fundamentals', 'aws-ccp'],
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
            paths: ['cloud-fundamentals'],
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
            paths: ['cloud-fundamentals', 'comptia-network', 'comptia-security'],
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
            paths: ['cloud-fundamentals', 'comptia-security'],
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
            paths: ['cloud-fundamentals', 'comptia-security'],
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
            paths: ['cloud-fundamentals'],
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
            paths: ['cloud-fundamentals', 'security-operations'],
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
            paths: ['cloud-fundamentals', 'security-operations'],
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
            paths: ['cloud-fundamentals', 'security-operations'],
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
            paths: ['cloud-fundamentals', 'security-operations'],
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
            paths: ['cloud-fundamentals', 'aws-ccp'],
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
            paths: ['cloud-fundamentals', 'aws-ccp'],
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
            paths: ['cloud-fundamentals'],
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
            paths: ['cloud-fundamentals', 'comptia-security'],
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
            paths: ['cloud-security-essentials', 'comptia-security'],
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
            paths: ['cloud-security-essentials', 'comptia-security'],
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
            paths: ['cloud-security-essentials', 'comptia-security'],
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
            paths: ['cloud-security-essentials', 'comptia-security'],
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
            paths: ['cloud-security-essentials', 'comptia-security'],
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
            paths: ['cloud-security-essentials', 'comptia-security', 'soc-analyst'],
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
            paths: ['cloud-security-essentials', 'comptia-security', 'risk-management'],
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
            paths: ['cloud-security-essentials', 'comptia-security', 'compliance-professional'],
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

        'forge-admin-tools-explorer': {
            id: 'forge-admin-tools-explorer',
            title: 'Admin Tools Explorer',
            description: 'Interactive Windows administrative tools guide',
            house: 'forge',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['systems'],
            paths: ['comptia-aplus', 'sysadmin-essentials'],
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
            paths: ['comptia-aplus', 'sysadmin-essentials'],
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
            paths: ['comptia-aplus', 'sysadmin-essentials'],
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
            paths: ['comptia-aplus', 'sysadmin-essentials'],
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
            paths: ['comptia-aplus', 'sysadmin-essentials'],
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
            paths: ['comptia-aplus', 'sysadmin-essentials'],
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
            paths: ['comptia-aplus', 'sysadmin-essentials'],
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
            paths: ['comptia-aplus', 'sysadmin-essentials'],
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
            paths: ['comptia-aplus', 'sysadmin-essentials'],
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
            paths: ['comptia-aplus', 'sysadmin-essentials'],
            components: {
                applet: 'houses/forge/applets/hardware/hard_drive_geometry/forge-hard-drive-geometry1.applet.html'
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
            paths: ['comptia-aplus', 'sysadmin-essentials'],
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
            paths: ['comptia-aplus', 'sysadmin-essentials'],
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
            paths: ['comptia-aplus', 'sysadmin-essentials', 'aws-ccp'],
            components: {
                applet: 'houses/forge/applets/hardware/motherboards/forge-motherboards.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-multimeter': {
            id: 'forge-multimeter',
            title: 'Multimeter Training',
            description: 'Learn to use a multimeter for hardware testing',
            house: 'forge',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['systems'],
            paths: ['comptia-aplus', 'sysadmin-essentials'],
            components: {
                applet: 'houses/forge/applets/hardware/multimeter/forge-multimeter-jedit-v1.applet.html'
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
            paths: ['comptia-aplus', 'sysadmin-essentials', 'comptia-network'],
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
            paths: ['comptia-aplus', 'sysadmin-essentials', 'comptia-network'],
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
            paths: ['comptia-aplus', 'sysadmin-essentials'],
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
            paths: ['comptia-aplus', 'sysadmin-essentials'],
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
            paths: ['comptia-aplus', 'sysadmin-essentials'],
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
            paths: ['comptia-aplus', 'sysadmin-essentials'],
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
            paths: ['comptia-aplus', 'sysadmin-essentials'],
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
            paths: ['comptia-aplus', 'sysadmin-essentials'],
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
            paths: ['comptia-aplus', 'sysadmin-essentials'],
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
            paths: ['comptia-aplus', 'sysadmin-essentials', 'comptia-network'],
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
            paths: ['comptia-aplus', 'sysadmin-essentials'],
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
            paths: ['comptia-aplus', 'sysadmin-essentials'],
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
            paths: ['comptia-aplus', 'sysadmin-essentials', 'comptia-linux'],
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
            paths: ['comptia-aplus', 'sysadmin-essentials'],
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
            paths: ['comptia-aplus', 'sysadmin-essentials'],
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
            paths: ['comptia-aplus', 'sysadmin-essentials'],
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
            paths: ['comptia-aplus', 'sysadmin-essentials'],
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
            paths: ['comptia-aplus', 'sysadmin-essentials'],
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
            paths: ['comptia-aplus'],
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
            paths: ['comptia-aplus'],
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
            paths: ['comptia-aplus'],
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
            paths: ['comptia-aplus'],
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
            paths: ['comptia-aplus'],
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
            paths: ['comptia-aplus'],
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
            paths: ['comptia-aplus'],
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
            paths: ['comptia-aplus'],
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
            paths: ['comptia-aplus'],
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
            paths: ['comptia-aplus'],
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
            paths: ['comptia-aplus'],
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
            paths: ['comptia-aplus'],
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
            paths: ['comptia-aplus', 'sysadmin-essentials'],
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
            paths: ['comptia-aplus', 'sysadmin-essentials'],
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
            paths: ['comptia-aplus', 'sysadmin-essentials'],
            components: {
                applet: 'houses/forge/applets/forge-windows-shortcuts.applet.html'
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
            paths: ['comptia-aplus', 'sysadmin-essentials'],
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
            paths: ['comptia-aplus', 'sysadmin-essentials'],
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
            paths: ['comptia-linux', 'sysadmin-essentials'],
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
            paths: ['comptia-linux', 'sysadmin-essentials', 'python-fundamentals'],
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
            paths: ['comptia-linux', 'sysadmin-essentials'],
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
            paths: ['comptia-linux', 'sysadmin-essentials'],
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
            paths: ['comptia-linux', 'sysadmin-essentials'],
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
            paths: ['comptia-linux', 'sysadmin-essentials'],
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
            paths: ['comptia-linux', 'sysadmin-essentials'],
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
            paths: ['comptia-linux', 'sysadmin-essentials', 'command-line-hacker'],
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
            paths: ['comptia-linux', 'sysadmin-essentials', 'security-operations', 'command-line-hacker'],
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
            paths: ['comptia-linux', 'sysadmin-essentials', 'comptia-network', 'command-line-hacker'],
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
            paths: ['comptia-linux', 'sysadmin-essentials', 'command-line-hacker'],
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
            paths: ['comptia-linux', 'sysadmin-essentials', 'command-line-hacker'],
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
            paths: ['comptia-linux', 'sysadmin-essentials', 'command-line-hacker'],
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
            paths: ['comptia-linux', 'sysadmin-essentials', 'command-line-hacker'],
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
            paths: ['comptia-linux', 'sysadmin-essentials', 'command-line-hacker'],
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
            paths: ['comptia-linux', 'sysadmin-essentials', 'command-line-hacker'],
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
            paths: ['comptia-linux', 'sysadmin-essentials', 'command-line-hacker'],
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
            paths: ['comptia-linux', 'sysadmin-essentials', 'command-line-hacker'],
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
            paths: ['comptia-linux', 'sysadmin-essentials', 'comptia-network', 'command-line-hacker'],
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
            paths: ['comptia-linux', 'sysadmin-essentials', 'command-line-hacker'],
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
            paths: ['comptia-linux', 'sysadmin-essentials', 'command-line-hacker'],
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
            paths: ['comptia-linux', 'sysadmin-essentials', 'command-line-hacker'],
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
            paths: ['comptia-linux', 'sysadmin-essentials', 'command-line-hacker'],
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
            paths: ['comptia-linux', 'sysadmin-essentials', 'command-line-hacker'],
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
            paths: ['comptia-linux', 'sysadmin-essentials', 'command-line-hacker'],
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
            paths: ['comptia-linux', 'sysadmin-essentials', 'command-line-hacker'],
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
            paths: ['comptia-linux', 'sysadmin-essentials', 'command-line-hacker'],
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
            paths: ['comptia-linux', 'sysadmin-essentials', 'command-line-hacker'],
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
            paths: ['comptia-linux', 'sysadmin-essentials', 'command-line-hacker'],
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
            paths: ['comptia-linux', 'sysadmin-essentials', 'command-line-hacker'],
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
            paths: ['comptia-linux', 'sysadmin-essentials', 'command-line-hacker'],
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
            paths: ['comptia-linux', 'sysadmin-essentials', 'command-line-hacker'],
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
            paths: ['comptia-linux', 'sysadmin-essentials', 'command-line-hacker'],
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
            paths: ['comptia-linux', 'sysadmin-essentials', 'command-line-hacker'],
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
            paths: ['comptia-linux', 'sysadmin-essentials', 'command-line-hacker'],
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
            paths: ['comptia-linux', 'sysadmin-essentials', 'command-line-hacker'],
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
            paths: ['comptia-linux', 'sysadmin-essentials', 'command-line-hacker'],
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
            paths: ['comptia-linux', 'sysadmin-essentials', 'command-line-hacker'],
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
            paths: ['comptia-linux', 'sysadmin-essentials', 'command-line-hacker'],
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
            paths: ['comptia-linux', 'sysadmin-essentials', 'command-line-hacker'],
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
            paths: ['comptia-linux', 'sysadmin-essentials', 'command-line-hacker'],
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
            paths: ['comptia-linux', 'sysadmin-essentials', 'command-line-hacker'],
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
            paths: ['comptia-linux', 'sysadmin-essentials', 'command-line-hacker'],
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
            paths: ['comptia-linux', 'sysadmin-essentials', 'command-line-hacker'],
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
            paths: ['comptia-linux', 'sysadmin-essentials', 'command-line-hacker'],
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
            paths: ['comptia-linux', 'sysadmin-essentials', 'command-line-hacker'],
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
            paths: ['comptia-linux', 'sysadmin-essentials', 'command-line-hacker'],
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
            paths: ['comptia-linux', 'sysadmin-essentials', 'command-line-hacker'],
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
            paths: ['comptia-linux', 'sysadmin-essentials', 'command-line-hacker'],
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
            paths: ['comptia-linux', 'sysadmin-essentials', 'command-line-hacker'],
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
            paths: ['comptia-linux', 'sysadmin-essentials', 'command-line-hacker'],
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
            paths: ['comptia-linux', 'sysadmin-essentials', 'command-line-hacker'],
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
            paths: ['comptia-linux', 'sysadmin-essentials'],
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
            paths: ['comptia-linux', 'sysadmin-essentials'],
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
            paths: ['comptia-linux', 'sysadmin-essentials', 'python-fundamentals'],
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
            paths: ['comptia-linux', 'sysadmin-essentials', 'python-fundamentals'],
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
            paths: ['comptia-linux', 'sysadmin-essentials', 'python-fundamentals'],
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
            paths: ['comptia-linux', 'sysadmin-essentials', 'python-fundamentals'],
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
            paths: ['comptia-linux', 'sysadmin-essentials', 'python-fundamentals'],
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
            paths: ['comptia-linux', 'sysadmin-essentials', 'python-fundamentals'],
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
            paths: ['comptia-linux', 'sysadmin-essentials', 'python-fundamentals'],
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
            paths: ['comptia-linux', 'sysadmin-essentials', 'python-fundamentals'],
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
            paths: ['comptia-linux', 'sysadmin-essentials', 'python-fundamentals'],
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
            paths: ['comptia-linux', 'sysadmin-essentials', 'python-fundamentals'],
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
            paths: ['comptia-linux', 'sysadmin-essentials'],
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
            paths: ['comptia-linux', 'sysadmin-essentials'],
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
            paths: ['comptia-linux', 'sysadmin-essentials'],
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
            paths: ['comptia-linux', 'sysadmin-essentials'],
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
            paths: ['developer-essentials', 'devops-fundamentals'],
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
            paths: ['developer-essentials', 'devops-fundamentals', 'comptia-network'],
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
            paths: ['developer-essentials', 'devops-fundamentals'],
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
            paths: ['developer-essentials', 'devops-fundamentals', 'ccna'],
            components: {
                applet: 'houses/code/tools/code-terraform.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'code-config-management': {
            id: 'code-config-management',
            title: 'Configuration Management',
            description: 'Infrastructure as Code principles and configuration automation',
            house: 'code',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['devops'],
            paths: ['developer-essentials', 'devops-fundamentals'],
            components: {
                applet: 'houses/code/applets/config_management/code-config-mgmt.applet.html'
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
            paths: ['developer-essentials', 'devops-fundamentals'],
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
            paths: ['developer-essentials', 'devops-fundamentals'],
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
            paths: ['developer-essentials', 'devops-fundamentals'],
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
            paths: ['developer-essentials', 'devops-fundamentals'],
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
            paths: ['developer-essentials', 'devops-fundamentals'],
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
            paths: ['developer-essentials', 'devops-fundamentals', 'python-fundamentals'],
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
            paths: ['developer-essentials', 'devops-fundamentals'],
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
            paths: ['developer-essentials', 'devops-fundamentals'],
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
            paths: ['developer-essentials', 'devops-fundamentals'],
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
            paths: ['developer-essentials', 'devops-fundamentals'],
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
            paths: ['developer-essentials', 'devops-fundamentals'],
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
            paths: ['developer-essentials', 'devops-fundamentals'],
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
            paths: ['developer-essentials', 'devops-fundamentals'],
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
            paths: ['developer-essentials', 'devops-fundamentals'],
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
            paths: ['developer-essentials', 'devops-fundamentals'],
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
            paths: ['developer-essentials', 'devops-fundamentals'],
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
            paths: ['developer-essentials', 'devops-fundamentals'],
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
            paths: ['developer-essentials', 'devops-fundamentals'],
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
            paths: ['developer-essentials', 'devops-fundamentals'],
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
            paths: ['developer-essentials', 'devops-fundamentals'],
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
            paths: ['developer-essentials', 'devops-fundamentals'],
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
            paths: ['developer-essentials', 'devops-fundamentals'],
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
            paths: ['developer-essentials', 'devops-fundamentals'],
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
            paths: ['developer-essentials', 'devops-fundamentals'],
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
            paths: ['developer-essentials', 'devops-fundamentals'],
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
            paths: ['developer-essentials', 'devops-fundamentals'],
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
            paths: ['cryptography-track', 'comptia-security'],
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
            paths: ['cryptography-track', 'comptia-security'],
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
            paths: ['cryptography-track', 'comptia-security', 'devops-fundamentals', 'comptia-network'],
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
            paths: ['cryptography-track', 'comptia-security'],
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
            paths: ['cryptography-track', 'comptia-security'],
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
            paths: ['cryptography-track', 'comptia-security', 'security-operations'],
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
            paths: ['cryptography-track', 'comptia-security'],
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
            paths: ['cryptography-track', 'comptia-security'],
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
            paths: ['cryptography-track', 'comptia-security'],
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
            paths: ['cryptography-track', 'comptia-security'],
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
            paths: ['cryptography-track', 'comptia-security'],
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
            paths: ['cryptography-track', 'comptia-security'],
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
            paths: ['cryptography-track', 'comptia-security'],
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
            paths: ['cryptography-track', 'comptia-security'],
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
            paths: ['cryptography-track', 'comptia-security'],
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
            paths: ['cryptography-track', 'comptia-security'],
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
            paths: ['cryptography-track', 'comptia-security'],
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
            paths: ['cryptography-track', 'comptia-security'],
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
            paths: ['cryptography-track', 'comptia-security'],
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
            paths: ['cryptography-track', 'comptia-security'],
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
            paths: ['cryptography-track', 'comptia-security'],
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
            paths: ['cryptography-track', 'comptia-security'],
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
            paths: ['cryptography-track', 'comptia-security'],
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
            paths: ['cryptography-track', 'comptia-security'],
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
            paths: ['cryptography-track', 'comptia-security'],
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
            paths: ['cryptography-track', 'comptia-security'],
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
            paths: ['cryptography-track', 'comptia-security'],
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
            paths: ['cryptography-track', 'comptia-security'],
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
            paths: ['cryptography-track', 'comptia-security'],
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
            paths: ['cryptography-track', 'comptia-security'],
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
            paths: ['cryptography-track', 'comptia-security'],
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
            paths: ['cryptography-track', 'comptia-security'],
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
            paths: ['cryptography-track', 'comptia-security'],
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
            paths: ['cryptography-track', 'comptia-security'],
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
            paths: ['cryptography-track', 'comptia-security'],
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
            paths: ['cryptography-track', 'comptia-security'],
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
            paths: ['security-operations', 'comptia-security'],
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
            paths: ['security-operations', 'comptia-security', 'comptia-network'],
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
            paths: ['security-operations', 'comptia-security'],
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
            paths: ['security-operations', 'comptia-security'],
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
            paths: ['security-operations', 'comptia-security'],
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
            paths: ['security-operations', 'comptia-security'],
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
            paths: ['security-operations', 'comptia-security'],
            components: {
                presentation: 'houses/eye/labs/eye-correlation.lab.html'
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
            paths: ['security-operations', 'comptia-security'],
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
            paths: ['security-operations', 'comptia-security'],
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
            paths: ['security-operations', 'comptia-security'],
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
            paths: ['security-operations', 'comptia-security'],
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
            paths: ['security-operations', 'comptia-security', 'comptia-network'],
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
            paths: ['security-operations', 'comptia-security'],
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
            paths: ['security-operations', 'comptia-security'],
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
            paths: ['security-operations', 'comptia-security'],
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
            paths: ['security-operations', 'comptia-security'],
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
            paths: ['security-operations', 'comptia-security'],
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
            paths: ['security-operations', 'comptia-security'],
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
            paths: ['security-operations', 'comptia-security'],
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
            paths: ['security-operations', 'comptia-security'],
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
        }
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
        //     paths: ['security-operations', 'comptia-security'],
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