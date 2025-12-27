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
                presentation: 'houses/forge/presentations/windows-editions.html',
                applet: 'houses/forge/applets/windows-edition-selector.html',
                lab: 'houses/forge/labs/windows-editions-lab.html'
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
                presentation: 'houses/forge/presentations/windows-settings.html',
                applet: 'houses/forge/applets/settings-explorer.html',
                lab: 'houses/forge/labs/windows-settings-lab.html'
            },
            prerequisites: ['forge-windows-editions'],
            objectives: [
                'Navigate all Settings app categories',
                'Configure common system settings',
                'Understand Settings vs Control Panel'
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
                presentation: 'houses/forge/presentations/control-panel.html',
                applet: 'houses/forge/applets/control-panel-explorer.html',
                lab: 'houses/forge/labs/control-panel-lab.html'
            },
            prerequisites: ['forge-windows-settings'],
            objectives: [
                'Access Control Panel via multiple methods',
                'Navigate category and icon views',
                'Configure settings not in Settings app'
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
                presentation: 'houses/forge/presentations/admin-tools.html',
                applet: 'houses/forge/applets/admin-tools-explorer.html',
                lab: 'houses/forge/labs/admin-tools-lab.html'
            },
            prerequisites: ['forge-control-panel'],
            objectives: [
                'Launch and use common MMC snap-ins',
                'Manage services, events, and disks',
                'Create custom MMC consoles'
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
                presentation: 'houses/forge/presentations/system-tools.html',
                applet: 'houses/forge/applets/system-tools-sim.html',
                lab: 'houses/forge/labs/system-tools-lab.html'
            },
            prerequisites: ['forge-admin-tools'],
            objectives: [
                'Use Task Manager for process management',
                'Analyze performance with Resource Monitor',
                'Run system diagnostics and repairs'
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
                presentation: 'houses/forge/presentations/macos-linux-basics.html',
                applet: 'houses/forge/applets/command-translator.html',
                lab: 'houses/forge/labs/lab-macos-linux.html'
            },
            prerequisites: ['forge-system-tools'],
            objectives: [
                'Navigate macOS and Linux file systems',
                'Use common command-line utilities',
                'Compare Windows, macOS, and Linux commands'
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
                applet: 'houses/forge/applets/hardware/hardware-trainer.html'
            },
            prerequisites: [],
            objectives: [
                'Identify CPU types and specifications',
                'Understand RAM types and configurations',
                'Compare storage technologies (HDD, SSD, NVMe)',
                'Recognize motherboard components'
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
                applet: 'houses/forge/applets/hardware/raid-level-visualizer.html'
            },
            prerequisites: ['forge-hardware-fundamentals'],
            objectives: [
                'Explain RAID levels 0, 1, 5, 6, 10',
                'Calculate storage capacity and fault tolerance',
                'Choose appropriate RAID for scenarios'
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
                applet: 'houses/forge/applets/hardware/hardware-trainer.html'
            },
            prerequisites: ['forge-hardware-fundamentals'],
            objectives: [
                'Identify expansion card types and slots',
                'Configure display connections and settings',
                'Set up and troubleshoot printers'
            ]
        },

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
                quiz: 'houses/forge/quizzes/aplus-core2-quiz.html'
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
                presentation: 'houses/web/presentations/osi-model.html',
                applet: 'houses/web/applets/visualizers/osi-visualizer.html',
                quiz: 'houses/web/quizzes/osi-quiz.html'
            },
            prerequisites: [],
            objectives: [
                'Name and describe all seven OSI layers',
                'Identify protocols at each layer',
                'Troubleshoot using the OSI model'
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
                presentation: 'houses/web/presentations/tcp-presentation.html',
                applet: 'houses/web/applets/visualizers/port-visualizer.html'
            },
            prerequisites: ['web-osi-model'],
            objectives: [
                'Compare TCP/IP to OSI model',
                'Understand IP addressing basics',
                'Analyze TCP vs UDP'
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
                presentation: 'houses/web/presentations/subnetting-presentation.html',
                applet: 'houses/web/applets/visualizers/subnetting-visualizer.html'
            },
            prerequisites: ['web-tcpip'],
            objectives: [
                'Convert between binary and decimal',
                'Identify IP address classes',
                'Calculate subnet masks and ranges'
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
                applet: 'houses/web/applets/ip-addressing/VLSM/'
            },
            prerequisites: ['web-ip-addressing'],
            objectives: [
                'Apply VLSM to network designs',
                'Optimize IP address allocation',
                'Solve complex subnetting scenarios'
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
                presentation: 'houses/web/presentations/ipv6-presentation.html',
                applet: 'houses/web/applets/visualizers/ipv6-visualizer.html'
            },
            prerequisites: ['web-ip-addressing'],
            objectives: [
                'Understand IPv6 address structure',
                'Configure IPv6 on devices',
                'Compare IPv4 and IPv6'
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
                presentation: 'houses/web/presentations/vlan-presentation.html',
                applet: 'houses/web/applets/visualizers/vlan-visualizer.html'
            },
            prerequisites: ['web-osi-model'],
            objectives: [
                'Configure VLANs and trunk ports',
                'Understand switch operations',
                'Implement inter-VLAN routing'
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
                presentation: 'houses/web/presentations/stp-presentation.html',
                applet: 'houses/web/applets/visualizers/stp-visualizer.html'
            },
            prerequisites: ['web-switching'],
            objectives: [
                'Explain STP operation and port states',
                'Configure root bridge election',
                'Troubleshoot STP issues'
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
                presentation: 'houses/web/presentations/ospf-presentation.html',
                applet: 'houses/web/applets/visualizers/ospf-cost-visualizer.html'
            },
            prerequisites: ['web-ip-addressing'],
            objectives: [
                'Configure static routes',
                'Understand OSPF and EIGRP basics',
                'Analyze routing tables'
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
                presentation: 'houses/web/presentations/fhrp-presentation.html',
                applet: 'houses/web/applets/visualizers/fhrp-visualizer.html'
            },
            prerequisites: ['web-routing'],
            objectives: [
                'Compare HSRP, VRRP, and GLBP',
                'Configure first hop redundancy',
                'Design highly available networks'
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
                presentation: 'houses/web/presentations/wireless-presentation.html',
                applet: 'houses/web/applets/visualizers/wireless-visualizer.html'
            },
            prerequisites: ['web-osi-model'],
            objectives: [
                'Identify wireless standards and frequencies',
                'Configure wireless security',
                'Design wireless networks'
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
                presentation: 'houses/web/presentations/dhcp-presentation.html',
                applet: 'houses/web/applets/visualizers/network-services-visualizer.html'
            },
            prerequisites: ['web-tcpip'],
            objectives: [
                'Configure DHCP and DNS',
                'Understand NAT and PAT',
                'Implement network time services'
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
                presentation: 'houses/web/presentations/troubleshooting-presentation.html',
                applet: 'houses/web/applets/visualizers/troubleshooting-visualizer.html'
            },
            prerequisites: ['web-osi-model', 'web-tcpip'],
            objectives: [
                'Apply OSI model to troubleshooting',
                'Use network diagnostic tools',
                'Develop systematic troubleshooting methodology'
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
                applet: 'houses/web/simulators/packet-tracer-lite-v3.html'
            },
            prerequisites: [],
            objectives: [
                'Build virtual network topologies',
                'Configure devices interactively',
                'Test network connectivity'
            ]
        },

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
                presentation: 'houses/shield/presentations/cia-triad.html',
                applet: 'houses/shield/applets/fundamentals/five_pillars/FivePillars.html'
            },
            prerequisites: [],
            objectives: [
                'Define confidentiality, integrity, availability',
                'Apply CIA triad to real scenarios',
                'Identify threats to each pillar'
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
                presentation: 'houses/shield/presentations/security-presentation.html',
                applet: 'houses/shield/applets/fundamentals/'
            },
            prerequisites: ['shield-cia-triad'],
            objectives: [
                'Understand the five pillars of information assurance',
                'Identify types of security controls',
                'Apply defense-in-depth principles'
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
                applet: 'houses/shield/applets/threats/'
            },
            prerequisites: ['shield-security-fundamentals'],
            objectives: [
                'Identify common malware types',
                'Recognize social engineering techniques',
                'Understand threat actor motivations'
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
                applet: 'houses/shield/applets/threats/social_engineering/social_engineering.html'
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
            paths: ['comptia-security'],
            components: {
                applet: 'houses/shield/applets/threats/'
            },
            prerequisites: ['shield-threat-types'],
            objectives: [
                'Understand XSS attack vectors',
                'Recognize SQL injection patterns',
                'Apply OWASP mitigation strategies'
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
                applet: 'houses/shield/applets/crypto/'
            },
            prerequisites: ['shield-security-fundamentals'],
            objectives: [
                'Compare symmetric vs asymmetric encryption',
                'Understand hashing and digital signatures',
                'Explain PKI and certificate chains'
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
                applet: 'houses/shield/applets/network/'
            },
            prerequisites: ['shield-security-fundamentals'],
            objectives: [
                'Configure firewall rules and policies',
                'Compare IDS vs IPS capabilities',
                'Implement secure network architectures'
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
                applet: 'houses/shield/applets/access/'
            },
            prerequisites: ['shield-security-fundamentals'],
            objectives: [
                'Implement multi-factor authentication',
                'Apply role-based access control',
                'Manage identity and access lifecycles'
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
                applet: 'houses/shield/applets/risk/'
            },
            prerequisites: ['shield-security-fundamentals'],
            objectives: [
                'Conduct risk assessments',
                'Calculate risk using quantitative methods',
                'Develop risk mitigation strategies'
            ]
        },

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
                applet: 'houses/shield/applets/operations/cyber-arts-bootcamp.html'
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
                presentation: 'houses/cloud/presentations/cloud-presentation.html',
                applet: 'houses/cloud/applets/fundamentals/cloud-visualizer.html',
                lab: 'houses/cloud/labs/cloud-lab-simulator.html'
            },
            prerequisites: [],
            objectives: [
                'Differentiate IaaS, PaaS, and SaaS',
                'Explain public, private, hybrid clouds',
                'Identify cloud benefits and considerations'
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
                applet: 'houses/cloud/applets/fundamentals/ch01-cloud-models-visualizer.html',
                quiz: 'houses/cloud/applets/fundamentals/ch01-cloud-fundamentals-quiz.html'
            },
            prerequisites: ['cloud-concepts'],
            objectives: [
                'Compare cloud service models',
                'Understand shared responsibility model',
                'Match services to appropriate model'
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
                applet: 'houses/cloud/applets/fundamentals/cloud-provider-comparison.html'
            },
            prerequisites: ['cloud-concepts'],
            objectives: [
                'Compare major cloud providers',
                'Identify equivalent services across platforms',
                'Understand pricing models'
            ]
        },

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
                applet: 'houses/cloud/applets/architecture/cloud-architecture-designer.html'
            },
            prerequisites: ['cloud-models'],
            objectives: [
                'Design basic cloud architectures',
                'Apply well-architected principles',
                'Select appropriate services for requirements'
            ]
        },

        // --- AWS Fundamentals ---
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
                presentation: 'houses/cloud/presentations/aws-fundamentals.html',
                applet: 'houses/cloud/applets/aws/ch02-aws-account-explorer.html'
            },
            prerequisites: ['cloud-concepts'],
            objectives: [
                'Navigate AWS account structure',
                'Understand AWS Organizations',
                'Manage billing and cost explorer'
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
                applet: 'houses/cloud/applets/aws/ch03-support-plans-visualizer.html'
            },
            prerequisites: ['cloud-aws-account'],
            objectives: [
                'Compare AWS support plans',
                'Understand Trusted Advisor checks',
                'Choose appropriate support level'
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
                applet: 'houses/cloud/applets/aws/ch04-aws-regions-explorer.html'
            },
            prerequisites: ['cloud-aws-account'],
            objectives: [
                'Understand AWS global infrastructure',
                'Select appropriate regions',
                'Explain high availability concepts'
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
                applet: 'houses/cloud/applets/aws/ch05-security-visualizer.html',
                quiz: 'houses/cloud/applets/aws/ch05-iam-security-quiz.html'
            },
            prerequisites: ['cloud-aws-account'],
            objectives: [
                'Create and manage IAM users and roles',
                'Write IAM policies',
                'Apply security best practices'
            ]
        },

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
                applet: 'houses/cloud/applets/aws/ch06-aws-tools-explorer.html'
            },
            prerequisites: ['cloud-aws-account'],
            objectives: [
                'Use AWS Management Console',
                'Execute AWS CLI commands',
                'Understand SDK options'
            ]
        },

        // --- AWS Compute ---
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
                applet: 'houses/cloud/applets/aws/ch07-compute-services-explorer.html'
            },
            prerequisites: ['cloud-aws-security'],
            objectives: [
                'Compare EC2 instance types',
                'Understand serverless with Lambda',
                'Choose appropriate compute service'
            ]
        },

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
                applet: 'houses/cloud/applets/aws/ch07-ec2-instance-visualizer.html'
            },
            prerequisites: ['cloud-aws-compute'],
            objectives: [
                'Select appropriate instance types',
                'Understand EC2 pricing models',
                'Configure instance settings'
            ]
        },

        // --- AWS Storage ---
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
                applet: 'houses/cloud/applets/aws/ch08-storage-services-explorer.html',
                quiz: 'houses/cloud/applets/aws/ch08-storage-quiz.html'
            },
            prerequisites: ['cloud-aws-compute'],
            objectives: [
                'Compare S3 storage classes',
                'Understand block vs object storage',
                'Choose appropriate storage service'
            ]
        },

        // --- AWS Database ---
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
                applet: 'houses/cloud/applets/aws/ch09-database-services-explorer.html',
                quiz: 'houses/cloud/applets/aws/ch09-database-quiz.html'
            },
            prerequisites: ['cloud-aws-storage'],
            objectives: [
                'Compare RDS database engines',
                'Understand DynamoDB for NoSQL',
                'Select appropriate database service'
            ]
        },

        // --- AWS Networking ---
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
                applet: 'houses/cloud/applets/aws/ch10-vpc-networking-visualizer.html',
                quiz: 'houses/cloud/applets/aws/ch10-networking-quiz.html'
            },
            prerequisites: ['cloud-aws-security'],
            objectives: [
                'Design VPC architecture',
                'Configure subnets and route tables',
                'Implement security groups and NACLs'
            ]
        },

        // --- AWS Advanced ---
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
                applet: 'houses/cloud/applets/aws/ch11-automation-explorer.html'
            },
            prerequisites: ['cloud-aws-compute'],
            objectives: [
                'Create CloudFormation templates',
                'Deploy with Elastic Beanstalk',
                'Apply infrastructure as code'
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
                applet: 'houses/cloud/applets/aws/aws-service-explorer.html'
            },
            prerequisites: [],
            objectives: [
                'Navigate AWS service categories',
                'Understand service purposes',
                'Find appropriate services for use cases'
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
                applet: 'houses/cloud/applets/aws/ch12-use-cases-visualizer.html'
            },
            prerequisites: ['cloud-aws-networking'],
            objectives: [
                'Apply AWS to real scenarios',
                'Design solutions for requirements',
                'Understand migration strategies'
            ]
        },

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
                quiz: 'houses/cloud/applets/aws/ch12-aws-practitioner-final-quiz.html'
            },
            prerequisites: ['cloud-aws-use-cases'],
            objectives: [
                'Assess AWS CCP readiness',
                'Identify knowledge gaps',
                'Practice exam-style questions'
            ]
        },

        // --- Azure ---
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
                presentation: 'houses/cloud/presentations/azure-fundamentals.html'
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
                presentation: 'houses/key/presentations/encryption-basics.html',
                applet: 'houses/key/tools/aes-explorer.html',
                lab: 'houses/key/labs/aes-lab.html'
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
                presentation: 'houses/script/presentations/macos-linux-basics.html',
                applet: 'houses/script/applets/linux/linux-command-simulator.html',
                lab: 'houses/script/applets/linux/lab-macos-linux.html'
            },
            prerequisites: [],
            objectives: [
                'Navigate the Linux file system',
                'Execute essential Linux commands',
                'Understand shell basics'
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
                applet: 'houses/script/applets/linux/linux-filesystem-navigator.html'
            },
            prerequisites: ['script-linux-basics'],
            objectives: [
                'Navigate Linux directory hierarchy',
                'Understand FHS structure',
                'Manage files and directories'
            ]
        },

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
                applet: 'houses/script/applets/linux/linux-permissions-calculator.html'
            },
            prerequisites: ['script-linux-filesystem'],
            objectives: [
                'Understand rwx permissions',
                'Calculate octal permission values',
                'Apply chmod and chown commands'
            ]
        },

        // --- Linux Interactive Labs (L-Series) ---
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
                lab: 'houses/script/applets/linux/linux-lab-001-user-identity.html'
            },
            prerequisites: [],
            objectives: [
                'Use whoami to display your username',
                'Use id to view UID, GID, and group memberships',
                'Use groups to list your group memberships'
            ]
        },

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
                lab: 'houses/script/applets/linux/linux-lab-002-file-navigation.html'
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
                lab: 'houses/script/applets/linux/clh-001-intro-to-hacker-cli.html'
            },
            prerequisites: [],
            objectives: [
                'Identify your operator identity with whoami',
                'Locate your position in the filesystem with pwd',
                'Identify the target system with hostname',
                'Survey your environment with ls'
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
                lab: 'houses/script/applets/linux/clh-002-navigation-recon.html'
            },
            prerequisites: ['script-clh-001'],
            objectives: [
                'Navigate directory structures with cd',
                'Perform deep scans with ls -la',
                'Extract intel from files with cat',
                'Return to base operations'
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
                lab: 'houses/script/applets/linux/clh-003-pattern-hunting.html'
            },
            prerequisites: ['script-clh-002'],
            objectives: [
                'Use grep to search file contents',
                'Extract hidden codes from text files',
                'Use grep options (-i, -n, -c)',
                'Document findings with line numbers'
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
                lab: 'houses/script/applets/linux/clh-004-process-investigation.html'
            },
            prerequisites: ['script-clh-003'],
            objectives: [
                'Analyze process snapshots',
                'Identify anomalous resource usage',
                'Hunt for unknown processes',
                'Document threat indicators'
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
                lab: 'houses/script/applets/linux/clh-005-log-analysis.html'
            },
            prerequisites: ['script-clh-004'],
            objectives: [
                'Navigate log directories',
                'Use head/tail for log preview',
                'Search for error patterns with grep',
                'Count and document error frequency'
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
                lab: 'houses/script/applets/linux/clh-006-file-operations.html'
            },
            prerequisites: ['script-clh-005'],
            objectives: [
                'Create directories with mkdir',
                'Create files with touch',
                'Copy intel with cp',
                'Move and rename with mv',
                'Secure delete with rm'
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
                lab: 'houses/script/applets/linux/clh-007-permissions.html'
            },
            prerequisites: ['script-clh-006'],
            objectives: [
                'Analyze file permissions with ls -la',
                'Decode permission bits (rwx)',
                'Modify permissions with chmod',
                'Understand permission security'
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
                lab: 'houses/script/applets/linux/clh-008-shell-scripting.html'
            },
            prerequisites: ['script-clh-007'],
            objectives: [
                'Examine shell script structure',
                'Run scripts with bash command',
                'Understand shebang and execution',
                'Analyze automation scripts'
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
                lab: 'houses/script/applets/linux/clh-009-text-processing.html'
            },
            prerequisites: ['script-clh-008'],
            objectives: [
                'Extract columns with cut',
                'Sort and deduplicate data',
                'Parse fields with awk',
                'Transform text with sed'
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
                lab: 'houses/script/applets/linux/clh-010-io-redirection.html'
            },
            prerequisites: ['script-clh-009'],
            objectives: [
                'Redirect output to files',
                'Append data with >>',
                'Chain commands with pipes',
                'Split output with tee'
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
                lab: 'houses/script/applets/linux/clh-011-advanced-grep.html'
            },
            prerequisites: ['script-clh-010'],
            objectives: [
                'Use grep flags (-i, -v, -c, -n, -r)',
                'Write basic regex patterns',
                'Match complex patterns with extended regex',
                'Hunt for specific data in logs'
            ]
        },

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
                applet: 'houses/script/applets/linux/command-translator.html'
            },
            prerequisites: [],
            objectives: [
                'Find equivalent commands across OSes',
                'Understand command syntax differences',
                'Work effectively in multi-platform environments'
            ]
        },

        // --- Bash Scripting ---
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
                applet: 'houses/script/applets/linux/bash-scripting-playground.html'
            },
            prerequisites: ['script-linux-basics'],
            objectives: [
                'Write bash scripts with variables and loops',
                'Use conditionals and functions',
                'Automate repetitive tasks'
            ]
        },

        // --- Python Programming (8-chapter series) ---
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
                presentation: 'houses/script/presentations/python/python-chapter1.html',
                applet: 'houses/script/applets/python/python-chapter1-applet.html'
            },
            prerequisites: [],
            objectives: [
                'Write and run Python code',
                'Understand Python syntax',
                'Use variables and data types'
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
                presentation: 'houses/script/presentations/python/python-chapter2.html',
                applet: 'houses/script/applets/python/python-chapter2-strings.html'
            },
            prerequisites: ['script-python-basics'],
            objectives: [
                'Manipulate strings effectively',
                'Use string methods and formatting',
                'Process text data'
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
                presentation: 'houses/script/presentations/python/python-chapter3.html',
                applet: 'houses/script/applets/python/python-chapter3-flow-control.html'
            },
            prerequisites: ['script-python-strings'],
            objectives: [
                'Use if/elif/else statements',
                'Write for and while loops',
                'Control program execution flow'
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
                presentation: 'houses/script/presentations/python/python-chapter4.html',
                applet: 'houses/script/applets/python/python-chapter4-functions.html'
            },
            prerequisites: ['script-python-flow-control'],
            objectives: [
                'Define and call functions',
                'Use parameters and return values',
                'Understand scope and namespaces'
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
                presentation: 'houses/script/presentations/python/python-chapter5.html',
                applet: 'houses/script/applets/python/python-chapter5-collections.html'
            },
            prerequisites: ['script-python-functions'],
            objectives: [
                'Work with lists and tuples',
                'Use list comprehensions',
                'Manipulate collection data'
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
                presentation: 'houses/script/presentations/python/python-chapter6.html',
                applet: 'houses/script/applets/python/python-chapter6-dictionaries.html'
            },
            prerequisites: ['script-python-collections'],
            objectives: [
                'Create and manipulate dictionaries',
                'Access and modify key-value pairs',
                'Use dictionary methods effectively'
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
                presentation: 'houses/script/presentations/python/python-chapter7.html',
                applet: 'houses/script/applets/python/python-chapter7-file-handling.html'
            },
            prerequisites: ['script-python-dictionaries'],
            objectives: [
                'Read from and write to files',
                'Handle file exceptions',
                'Process file data effectively'
            ]
        },

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
                presentation: 'houses/script/presentations/python/python-chapter8.html',
                applet: 'houses/script/applets/python/python-chapter8-oop.html'
            },
            prerequisites: ['script-python-files'],
            objectives: [
                'Define classes and create objects',
                'Use inheritance and polymorphism',
                'Apply OOP design principles'
            ]
        },

        // --- PowerShell & Windows CLI ---
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
                applet: 'houses/script/applets/powershell/powershell-playground.html'
            },
            prerequisites: [],
            objectives: [
                'Execute PowerShell commands',
                'Understand cmdlet structure',
                'Write basic PowerShell scripts'
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
                applet: 'houses/script/applets/powershell/windows-cli-tools.html'
            },
            prerequisites: ['script-powershell-basics'],
            objectives: [
                'Use essential Windows CLI commands',
                'Manage system from command line',
                'Troubleshoot with CLI tools'
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
                applet: 'houses/script/applets/powershell/windows-registry-explorer.html'
            },
            prerequisites: ['script-windows-cli'],
            objectives: [
                'Navigate registry hives',
                'Understand registry data types',
                'Safely modify registry entries'
            ]
        },

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
                applet: 'houses/script/applets/powershell/windows-troubleshooting.html'
            },
            prerequisites: ['script-windows-cli'],
            objectives: [
                'Use Windows diagnostic tools',
                'Troubleshoot common issues',
                'Analyze system health'
            ]
        },

        // --- System Administration ---
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
                applet: 'houses/script/applets/sysadmin/process-management-visualizer.html'
            },
            prerequisites: ['script-linux-basics'],
            objectives: [
                'Monitor and manage processes',
                'Control system services',
                'Analyze resource usage'
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
                applet: 'houses/script/applets/sysadmin/log-management-visualizer.html'
            },
            prerequisites: ['script-linux-basics'],
            objectives: [
                'Locate and read log files',
                'Configure logging systems',
                'Analyze logs for issues'
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
                applet: 'houses/script/applets/sysadmin/package-manager-simulator.html'
            },
            prerequisites: ['script-linux-basics'],
            objectives: [
                'Use package managers (apt, yum)',
                'Install and remove software',
                'Manage package repositories'
            ]
        },

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
                presentation: 'houses/script/presentations/automation-presentation.html',
                applet: 'houses/script/applets/sysadmin/automation-visualizer.html'
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
                presentation: 'houses/code/presentations/git-basics.html',
                applet: 'houses/code/applets/pipeline-builder.html',
                lab: 'houses/code/labs/cicd-lab.html'
            },
            prerequisites: [],
            objectives: [
                'Initialize and clone repositories',
                'Commit, push, and pull changes',
                'Understand branching basics'
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
                presentation: 'houses/code/presentations/docker-fundamentals.html',
                applet: 'houses/code/applets/docker-playground.html',
                quiz: 'houses/code/quizzes/docker-quiz.html',
                lab: 'houses/code/labs/docker-lab.html'
            },
            prerequisites: ['code-git-basics'],
            objectives: [
                'Build and run Docker containers',
                'Write effective Dockerfiles',
                'Manage container lifecycles'
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
                presentation: 'houses/code/presentations/kubernetes-fundamentals.html',
                applet: 'houses/code/applets/kubernetes-cluster-sim.html',
                quiz: 'houses/code/quizzes/kubernetes-quiz.html',
                lab: 'houses/code/labs/kubernetes-lab.html'
            },
            prerequisites: ['code-docker'],
            objectives: [
                'Deploy applications to Kubernetes',
                'Understand pods, services, and deployments',
                'Scale and manage containerized workloads'
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
                presentation: 'houses/code/presentations/terraform-fundamentals.html',
                applet: 'houses/code/applets/terraform-visualizer.html',
                quiz: 'houses/code/quizzes/terraform-quiz.html',
                lab: 'houses/code/labs/terraform-lab.html'
            },
            prerequisites: ['code-git-basics'],
            objectives: [
                'Write Terraform configuration files',
                'Manage state and providers',
                'Deploy cloud infrastructure as code'
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
                presentation: 'houses/code/presentations/cloudformation-fundamentals.html',
                applet: 'houses/code/applets/cloudformation-designer.html',
                quiz: 'houses/code/quizzes/cloudformation-quiz.html',
                lab: 'houses/code/labs/cloudformation-lab.html'
            },
            prerequisites: ['code-git-basics'],
            objectives: [
                'Write CloudFormation templates',
                'Create and update stacks',
                'Manage AWS resources declaratively'
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
                presentation: 'houses/code/presentations/cicd-fundamentals.html',
                applet: 'houses/code/applets/pipeline-builder.html',
                quiz: 'houses/code/quizzes/cicd-quiz.html',
                lab: 'houses/code/labs/cicd-lab.html'
            },
            prerequisites: ['code-git-basics', 'code-docker'],
            objectives: [
                'Build CI/CD pipelines',
                'Automate testing and deployment',
                'Implement DevOps best practices'
            ]
        },

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
                presentation: 'houses/code/presentations/agile-sdlc.html',
                applet: 'houses/code/applets/sprint-simulator.html',
                quiz: 'houses/code/quizzes/agile-quiz.html'
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
                presentation: 'houses/eye/presentations/log-basics.html',
                applet: 'houses/eye/tools/siem-simulator.html',
                lab: 'houses/eye/labs/soc-lab.html'
            },
            prerequisites: [],
            objectives: [
                'Locate common log files',
                'Parse log entries effectively',
                'Identify indicators in logs'
            ]
        },

// ─────────────────────────────────────────────────────────────
        // SHIELD HOUSE - 134 new entries
        // ─────────────────────────────────────────────────────────────
        'shield-yara-training': {
            id: 'shield-yara-training',
            title: 'YARA Rules Training Lab',
            description: 'Write malware detection rules. Interactive rule builder with simulated samples.',
            house: 'shield',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 45,
            topics: ['threats', 'security'],
            paths: [],
            components: {
                quiz: 'houses/shield/tools/yara-training.html'
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
            paths: [],
            components: {
                lab: 'houses/shield/labs/osint-google-dorking.html'
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
            paths: [],
            components: {
                quiz: 'houses/shield/presentations/security-fundamentals.html'
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
            paths: [],
            components: {
                applet: 'houses/shield/applets/access/biometrics/Biometrics.html'
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
            paths: [],
            components: {
                applet: 'houses/shield/applets/access/kerberos/kerberos.html'
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
            paths: [],
            components: {
                applet: 'houses/shield/applets/access/aaa-flow-simulator.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-access-models': {
            id: 'shield-access-models',
            title: 'Access Control Models',
            description: 'Compare RBAC, MAC, DAC, ABAC with scenario selector',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['access-control', 'security'],
            paths: [],
            components: {
                applet: 'houses/shield/applets/access/access-control-models.html'
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
            paths: [],
            components: {
                applet: 'houses/shield/applets/compliance/cmmc_access_control/ACv2.html'
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
            paths: [],
            components: {
                applet: 'houses/shield/applets/compliance/cmmc_audit_accountability/AUv2.html'
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
            paths: [],
            components: {
                applet: 'houses/shield/applets/compliance/cmmc_awareness_training/ATv2.html'
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
            paths: [],
            components: {
                applet: 'houses/shield/applets/compliance/cmmc_config_management/CMv2.html'
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
            paths: [],
            components: {
                applet: 'houses/shield/applets/compliance/cmmc_cui/CUI_2.html'
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
            paths: [],
            components: {
                applet: 'houses/shield/applets/compliance/cmmc_framework/CMMCFrameworkv2.html'
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
            paths: [],
            components: {
                applet: 'houses/shield/applets/compliance/cmmc_identification_auth/IAv2.html'
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
            paths: [],
            components: {
                applet: 'houses/shield/applets/compliance/cmmc_incident_response/IRv2.html'
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
            paths: [],
            components: {
                applet: 'houses/shield/applets/compliance/cmmc_maintenance/MAv2.html'
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
            paths: [],
            components: {
                applet: 'houses/shield/applets/compliance/cmmc_media_protection/MPv2.html'
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
            paths: [],
            components: {
                applet: 'houses/shield/applets/compliance/cmmc_personnel_security/PSv2.html'
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
            paths: [],
            components: {
                applet: 'houses/shield/applets/compliance/cmmc_physical_protection/PEv2.html'
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
            paths: [],
            components: {
                quiz: 'houses/shield/applets/compliance/cmmc_quiz/CMMCTestKnowledge2.html'
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
            paths: [],
            components: {
                applet: 'houses/shield/applets/compliance/cmmc_risk_assessment/RAv2.html'
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
            paths: [],
            components: {
                applet: 'houses/shield/applets/compliance/cmmc_security_assessment/CAv2.html'
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
            paths: [],
            components: {
                applet: 'houses/shield/applets/compliance/cmmc_system_comm_protection/SCv2.html'
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
            paths: [],
            components: {
                applet: 'houses/shield/applets/compliance/cmmc_system_info_integrity/SIv2.html'
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
            paths: [],
            components: {
                applet: 'houses/shield/applets/compliance/framework-selector.html'
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
            paths: [],
            components: {
                applet: 'houses/shield/applets/crypto/block_mode/Block.html'
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
            paths: [],
            components: {
                applet: 'houses/shield/applets/crypto/blockchain/blockchain.html'
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
            paths: [],
            components: {
                applet: 'houses/shield/applets/crypto/checksum-verifier.html'
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
            paths: [],
            components: {
                applet: 'houses/shield/applets/crypto/cryptomatch/CryptoMatch.html'
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
            paths: [],
            components: {
                applet: 'houses/shield/applets/crypto/diffie_hellman/diffie_hellman.html'
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
            paths: [],
            components: {
                applet: 'houses/shield/applets/crypto/digital_signatures/DigitalSignature.html'
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
            paths: [],
            components: {
                applet: 'houses/shield/applets/crypto/encrypt_data/EncryptData.html'
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
            paths: [],
            components: {
                applet: 'houses/shield/applets/crypto/encryption/encryption_jedit_6_1.html'
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
            paths: [],
            components: {
                applet: 'houses/shield/applets/crypto/factor_prime/FactorPrime.html'
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
            paths: [],
            components: {
                lab: 'houses/shield/applets/crypto/gpg-encryption-lab.html'
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
            paths: [],
            components: {
                applet: 'houses/shield/applets/crypto/hashing/Hashing.html'
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
            paths: [],
            components: {
                applet: 'houses/shield/applets/crypto/hashing_narrated/Hashing_vo.html'
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
            paths: [],
            components: {
                applet: 'houses/shield/applets/crypto/hashing_steganography/Encryption_II.html'
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
            paths: [],
            components: {
                lab: 'houses/shield/applets/crypto/hashing_steganography/Hash_Lab.html'
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
            paths: [],
            components: {
                applet: 'houses/shield/applets/crypto/hashing_steganography/Stego.html'
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
            paths: [],
            components: {
                applet: 'houses/shield/applets/crypto/hashing_steganography/encryption_task.html'
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
            paths: [],
            components: {
                presentation: 'houses/shield/applets/crypto/hashing_steganography/hash_steg_presentation.html'
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
            paths: [],
            components: {
                applet: 'houses/shield/applets/crypto/hashing_steganography/hash_v3.html'
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
            paths: [],
            components: {
                lab: 'houses/shield/applets/crypto/hashing_steganography/hashing_Lab.html'
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
            paths: [],
            components: {
                applet: 'houses/shield/applets/crypto/pki/pki.html'
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
            paths: [],
            components: {
                applet: 'houses/shield/applets/crypto/rsa/RSA.html'
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
            paths: [],
            components: {
                applet: 'houses/shield/applets/fundamentals/career_exploration/index.html'
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
            paths: [],
            components: {
                applet: 'houses/shield/applets/fundamentals/cybersecurity_controls/cybersecurity_controls.html'
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
            paths: [],
            components: {
                applet: 'houses/shield/applets/fundamentals/data_roles/dataroles.html'
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
            paths: [],
            components: {
                applet: 'houses/shield/applets/fundamentals/design_principles/cybersecuritydesignprinciples.html'
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
            paths: [],
            components: {
                applet: 'houses/shield/applets/fundamentals/ethics_challenge/ethics_challenge.html'
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
            paths: [],
            components: {
                applet: 'houses/shield/applets/fundamentals/ethics_conduct/EthicsProfConduct.html'
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
            paths: [],
            components: {
                applet: 'houses/shield/applets/fundamentals/physical_protection/physical_environmental.html'
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
            paths: [],
            components: {
                applet: 'houses/shield/applets/fundamentals/privacy/privacy.html'
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
            paths: [],
            components: {
                applet: 'houses/shield/applets/fundamentals/security-best-practices.html'
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
            paths: [],
            components: {
                applet: 'houses/shield/applets/fundamentals/the_cube/cube.html'
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
            paths: [],
            components: {
                applet: 'houses/shield/applets/fundamentals/asset-classification-wizard.html'
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
            paths: [],
            components: {
                applet: 'houses/shield/applets/fundamentals/data-lifecycle-visualizer.html'
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
            paths: [],
            components: {
                applet: 'houses/shield/applets/games/cookie_caper/cookies.html'
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
            paths: [],
            components: {
                applet: 'houses/shield/applets/games/cyber_hat_match/hatmatch.html'
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
            paths: [],
            components: {
                applet: 'houses/shield/applets/games/cyber_scramble/cyberscramble.html'
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
            paths: [],
            components: {
                applet: 'houses/shield/applets/games/ethical_hacking_case/EH_exam_1A.html'
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
            paths: [],
            components: {
                applet: 'houses/shield/applets/games/hacker_hangman/hangman.html'
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
            paths: [],
            components: {
                applet: 'houses/shield/applets/games/whats_my_crime/crime.html'
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
            paths: [],
            components: {
                applet: 'houses/shield/applets/network/browser-security-hardening.html'
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
            paths: [],
            components: {
                applet: 'houses/shield/applets/network/eap/EAP.html'
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
            paths: [],
            components: {
                applet: 'houses/shield/applets/network/home-network-security.html'
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
            paths: [],
            components: {
                applet: 'houses/shield/applets/network/ids_ips/IDS_IPS.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-linux-fw': {
            id: 'shield-linux-fw',
            title: 'Linux Firewall Builder',
            description: 'Build iptables rules',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['network-security', 'security', 'linux'],
            paths: [],
            components: {
                applet: 'houses/shield/applets/network/linux-firewall-builder.html'
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
            paths: [],
            components: {
                applet: 'houses/shield/applets/network/nat_pat/NAT.html'
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
            paths: [],
            components: {
                applet: 'houses/shield/applets/network/protocol_analysis/ProtocolAnalysis.html'
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
            paths: [],
            components: {
                applet: 'houses/shield/applets/network/threeway_handshake/threeway_handshake1_audio.html'
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
            paths: [],
            components: {
                applet: 'houses/shield/applets/network/vpn/vpn.html'
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
            paths: [],
            components: {
                applet: 'houses/shield/applets/network/wireless_security/WirelessSecurity.html'
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
            paths: [],
            components: {
                applet: 'houses/shield/applets/risk/change-management.html'
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
            paths: [],
            components: {
                applet: 'houses/shield/applets/risk/config_management/ConfigMgmt.html'
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
            paths: [],
            components: {
                applet: 'houses/shield/applets/risk/cybersecurity_scenario/cyber_scenario.html'
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
            paths: [],
            components: {
                applet: 'houses/shield/applets/risk/incident-response-simulator.html'
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
            paths: [],
            components: {
                applet: 'houses/shield/applets/risk/pspg/PSPG.html'
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
            paths: [],
            components: {
                applet: 'houses/shield/applets/risk/risk_analysis/risk_analysis.html'
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
            paths: [],
            components: {
                applet: 'houses/shield/applets/risk/bia-calculator.html'
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
            paths: [],
            components: {
                applet: 'houses/shield/applets/risk/crisc-risk-calculator.html'
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
            paths: [],
            components: {
                applet: 'houses/shield/applets/threats/buffer_overflow/bufferoverflow.html'
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
            paths: [],
            components: {
                applet: 'houses/shield/applets/threats/code_injection/codeinjection.html'
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
            paths: [],
            components: {
                applet: 'houses/shield/applets/threats/cross_site_scripting/crosssitescripting.html'
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
            paths: [],
            components: {
                applet: 'houses/shield/applets/threats/google_hacking/googlehacking.html'
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
            paths: [],
            components: {
                applet: 'houses/shield/applets/threats/heartbleed/heartbleed.html'
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
            paths: [],
            components: {
                applet: 'houses/shield/applets/threats/malware-types-reference.html'
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
            paths: [],
            components: {
                applet: 'houses/shield/applets/threats/meltdown_spectre/meltdown_spectre.html'
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
            paths: [],
            components: {
                applet: 'houses/shield/applets/threats/os_command_injection/oscommandinjection.html'
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
            paths: [],
            components: {
                applet: 'houses/shield/applets/threats/osint/OSINT.html'
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
            paths: [],
            components: {
                applet: 'houses/shield/applets/threats/osint_challenge/OSINT_PD_Challenge.html'
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
            paths: [],
            components: {
                applet: 'houses/shield/applets/threats/pen_testing/pen_testing.html'
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
            paths: [],
            components: {
                applet: 'houses/shield/applets/threats/phishing_mystery/phishing.html'
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
            paths: [],
            components: {
                applet: 'houses/shield/applets/threats/ransomware/RansomwareAttack.html'
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
            paths: [],
            components: {
                applet: 'houses/shield/applets/threats/social_engineering_tactics/SocialEngineeringTactics.html'
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
            paths: [],
            components: {
                applet: 'houses/shield/applets/threats/spoofing/spoofing1.html'
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
            paths: [],
            components: {
                applet: 'houses/shield/applets/threats/stuxnet/stuxnet.html'
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
            paths: [],
            components: {
                applet: 'houses/shield/applets/threats/threat_actors/ThreatActors.html'
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
            paths: [],
            components: {
                presentation: 'houses/shield/presentations/security-presentation.html'
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
            paths: [],
            components: {
                quiz: 'houses/shield/quizzes/cia-triad-quiz.html'
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
            paths: [],
            components: {
                presentation: 'houses/shield/presentations/cse-06-security-monitoring-incident-response.html'
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
            paths: [],
            components: {
                presentation: 'houses/shield/presentations/cse-07-risk-assessment-management.html'
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
            paths: [],
            components: {
                presentation: 'houses/shield/presentations/cse-08-compliance-governance.html'
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
            paths: [],
            components: {
                quiz: 'houses/shield/quizzes/cse-06-quiz.html'
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
            paths: [],
            components: {
                quiz: 'houses/shield/quizzes/cse-07-quiz.html'
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
            paths: [],
            components: {
                quiz: 'houses/shield/quizzes/cse-08-quiz.html'
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
            paths: [],
            components: {
                quiz: 'houses/shield/applets/architecture/zero-trust-visualizer.html'
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
            paths: [],
            components: {
                lab: 'houses/shield/applets/operations/ir-forensics-lab.html'
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
            paths: [],
            components: {
                lab: 'houses/shield/applets/operations/ics-scada-security.html'
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
            paths: [],
            components: {
                quiz: 'houses/shield/applets/compliance/laws-regulations-reference.html'
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
            paths: [],
            components: {
                quiz: 'houses/shield/applets/architecture/security-models-visualizer.html'
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
            paths: [],
            components: {
                quiz: 'houses/shield/applets/fundamentals/secure-sdlc-framework.html'
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
            paths: [],
            components: {
                quiz: 'houses/shield/applets/risk/business-continuity-planner.html'
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
            paths: [],
            components: {
                quiz: 'houses/shield/applets/fundamentals/security-governance-dashboard.html'
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
            paths: [],
            components: {
                applet: 'houses/shield/tools/cve-lookup.html'
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
            paths: [],
            components: {
                applet: 'houses/shield/tools/google-dorking-osint.html'
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
            paths: [],
            components: {
                applet: 'houses/shield/challenges/attack-vector-challenge.html'
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
            paths: [],
            components: {
                lab: 'houses/shield/labs/security-fundamentals-lab.html'
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
            paths: [],
            components: {
                quiz: 'houses/shield/quizzes/security-fundamentals-quiz.html'
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
            paths: [],
            components: {
                lab: 'houses/shield/labs/network-security-lab.html'
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
            paths: [],
            components: {
                quiz: 'houses/shield/quizzes/network-security-quiz.html'
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
            paths: [],
            components: {
                lab: 'houses/shield/labs/cryptography-lab.html'
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
            paths: [],
            components: {
                quiz: 'houses/shield/quizzes/cryptography-quiz.html'
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
            paths: [],
            components: {
                lab: 'houses/shield/labs/access-control-lab.html'
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
            paths: [],
            components: {
                quiz: 'houses/shield/quizzes/access-control-quiz.html'
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
            paths: [],
            components: {
                lab: 'houses/shield/labs/compliance-lab.html'
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
            paths: [],
            components: {
                quiz: 'houses/shield/quizzes/compliance-quiz.html'
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
            paths: [],
            components: {
                lab: 'houses/shield/labs/threats-lab.html'
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
            paths: [],
            components: {
                quiz: 'houses/shield/quizzes/threats-quiz.html'
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
            paths: [],
            components: {
                quiz: 'houses/shield/applets/operations/cysa-analyst-toolkit.html'
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
            paths: [],
            components: {
                quiz: 'houses/shield/applets/operations/cfr-310-incident-response.html'
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
            paths: [],
            components: {
                quiz: 'houses/shield/applets/operations/pentest-plus-toolkit.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-cism-dashboard': {
            id: 'shield-cism-dashboard',
            title: 'CISM Management Dashboard',
            description: 'ISACA CISM 4 domains - governance, risk, program development, incident management',
            house: 'shield',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 25,
            topics: ['compliance', 'security'],
            paths: [],
            components: {
                quiz: 'houses/shield/applets/governance/cism-management-dashboard.html'
            },
            prerequisites: [],
            objectives: []
        }
,

        // ─────────────────────────────────────────────────────────────
        // WEB HOUSE - 71 new entries
        // ─────────────────────────────────────────────────────────────
        'web-burp-training': {
            id: 'web-burp-training',
            title: 'Burp Suite Training Lab',
            description: 'Interactive web app security testing. Intercept, modify, and analyze HTTP requests.',
            house: 'web',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 45,
            topics: ['simulators', 'networking'],
            paths: [],
            components: {
                quiz: 'houses/web/tools/burp-training.html'
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
            paths: [],
            components: {
                quiz: 'houses/web/tools/sqlmap-training.html'
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
            paths: [],
            components: {
                quiz: 'houses/web/tools/gobuster-training.html'
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
            paths: [],
            components: {
                quiz: 'houses/web/tools/nikto-training.html'
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
            paths: [],
            components: {
                quiz: 'houses/web/applets/networking-interactive-guide.html'
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
            paths: [],
            components: {
                applet: 'houses/web/applets/networking-exam-flashcards.html'
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
            paths: [],
            components: {
                applet: 'houses/web/applets/ip-addressing/IPv6Challenge/IPv6Challenge.html'
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
            paths: [],
            components: {
                applet: 'houses/web/applets/ip-addressing/NAT/NAT.html'
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
            paths: [],
            components: {
                applet: 'houses/web/applets/ip-addressing/VLSM_challenge/VLSM_challenge.html'
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
            paths: [],
            components: {
                applet: 'houses/web/applets/ip-addressing/binary-decimal-converter.html'
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
            paths: [],
            components: {
                applet: 'houses/web/applets/ip-addressing/binaryIP/binaryIP.html'
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
            paths: [],
            components: {
                applet: 'houses/web/applets/ip-addressing/classA/classA.html'
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
            paths: [],
            components: {
                applet: 'houses/web/applets/ip-addressing/classB/classB.html'
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
            paths: [],
            components: {
                applet: 'houses/web/applets/ip-addressing/intro_subnetting/intro_subnetting.html'
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
            paths: [],
            components: {
                applet: 'houses/web/applets/ip-addressing/macaddressing/EMate_pizzaparty_exercise_102918.html'
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
            paths: [],
            components: {
                applet: 'houses/web/applets/ip-addressing/network_classes2/network_classes2.html'
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
            paths: [],
            components: {
                applet: 'houses/web/applets/ip-addressing/networkaddressing/EMate_understanding_addresses.html'
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
            paths: [],
            components: {
                applet: 'houses/web/applets/visualizers/acl-visualizer.html'
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
            paths: [],
            components: {
                applet: 'houses/web/applets/visualizers/cable-visualizer.html'
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
            paths: [],
            components: {
                applet: 'houses/web/applets/visualizers/devices-visualizer.html'
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
            paths: [],
            components: {
                applet: 'houses/web/applets/visualizers/etherchannel-visualizer.html'
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
            paths: [],
            components: {
                applet: 'houses/web/applets/visualizers/fhrp-visualizer.html'
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
            paths: [],
            components: {
                applet: 'houses/web/applets/visualizers/ipv6-visualizer.html'
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
            paths: [],
            components: {
                applet: 'houses/web/applets/visualizers/osi-deep-dive-visualizer.html'
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
            paths: [],
            components: {
                applet: 'houses/web/applets/visualizers/osi-visualizer.html'
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
            paths: [],
            components: {
                applet: 'houses/web/applets/visualizers/ospf-cost-visualizer.html'
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
            paths: [],
            components: {
                applet: 'houses/web/applets/visualizers/port-visualizer.html'
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
            paths: [],
            components: {
                applet: 'houses/web/applets/visualizers/qos-visualizer.html'
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
            paths: [],
            components: {
                applet: 'houses/web/applets/visualizers/security-visualizer.html'
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
            paths: [],
            components: {
                applet: 'houses/web/applets/visualizers/stp-visualizer.html'
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
            paths: [],
            components: {
                applet: 'houses/web/applets/visualizers/subnetting-visualizer.html'
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
            paths: [],
            components: {
                applet: 'houses/web/applets/visualizers/switch-operations-visualizer.html'
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
            paths: [],
            components: {
                applet: 'houses/web/applets/visualizers/topology-visualizer.html'
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
            paths: [],
            components: {
                applet: 'houses/web/applets/visualizers/troubleshooting-visualizer.html'
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
            paths: [],
            components: {
                applet: 'houses/web/applets/visualizers/vlan-visualizer.html'
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
            paths: [],
            components: {
                applet: 'houses/web/applets/visualizers/wireless-architecture-visualizer.html'
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
            paths: [],
            components: {
                applet: 'houses/web/applets/visualizers/wireless-visualizer.html'
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
            paths: [],
            components: {
                applet: 'houses/web/applets/services/http-status-codes.html'
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
            paths: [],
            components: {
                applet: 'houses/web/applets/services/smb-file-sharing-guide.html'
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
            paths: [],
            components: {
                applet: 'houses/web/applets/services/web-server-comparison.html'
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
            paths: [],
            components: {
                presentation: 'houses/web/presentations/arp-presentation.html'
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
            paths: [],
            components: {
                presentation: 'houses/web/presentations/cables-presentation.html'
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
            paths: [],
            components: {
                presentation: 'houses/web/presentations/devices-presentation.html'
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
            paths: [],
            components: {
                presentation: 'houses/web/presentations/dhcp-presentation.html'
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
            paths: [],
            components: {
                presentation: 'houses/web/presentations/dns-presentation.html'
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
            paths: [],
            components: {
                presentation: 'houses/web/presentations/eigrp-presentation.html'
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
            paths: [],
            components: {
                presentation: 'houses/web/presentations/etherchannel-presentation.html'
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
            paths: [],
            components: {
                presentation: 'houses/web/presentations/ipv6-presentation.html'
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
            paths: [],
            components: {
                presentation: 'houses/web/presentations/nat-presentation.html'
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
            paths: [],
            components: {
                presentation: 'houses/web/presentations/network-essentials-presentation.html'
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
            paths: [],
            components: {
                presentation: 'houses/web/presentations/ntp-presentation.html'
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
            paths: [],
            components: {
                presentation: 'houses/web/presentations/osi-deep-dive-presentation.html'
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
            paths: [],
            components: {
                presentation: 'houses/web/presentations/osi-model.html'
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
            paths: [],
            components: {
                presentation: 'houses/web/presentations/ports-presentation.html'
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
            paths: [],
            components: {
                presentation: 'houses/web/presentations/subnetting-presentation.html'
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
            paths: [],
            components: {
                presentation: 'houses/web/presentations/switch-operations-presentation.html'
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
            paths: [],
            components: {
                presentation: 'houses/web/presentations/topologies-presentation.html'
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
            paths: [],
            components: {
                presentation: 'houses/web/presentations/troubleshooting-presentation.html'
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
            paths: [],
            components: {
                presentation: 'houses/web/presentations/wireless-architecture-presentation.html'
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
            paths: [],
            components: {
                lab: 'houses/web/simulators/interactive-network-simulator.v2.html'
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
            paths: [],
            components: {
                quiz: 'houses/web/quizzes/osi-quiz.html'
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
            paths: [],
            components: {
                quiz: 'houses/web/quizzes/subnetting-quiz.html'
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
            paths: [],
            components: {
                quiz: 'houses/web/quizzes/networking-fundamentals-ports.html'
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
            paths: [],
            components: {
                applet: 'houses/web/tools/subnet-calculator.html'
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
            paths: [],
            components: {
                applet: 'houses/web/tools/dns-header-reference.html'
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
            paths: [],
            components: {
                applet: 'houses/web/modules/ip-addressing-ch7-10.html'
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
            paths: [],
            components: {
                applet: 'houses/web/modules/networking-flashcards.html'
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
            paths: [],
            components: {
                applet: 'houses/web/textbook/networking-textbook-ch7-20.html'
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
            paths: [],
            components: {
                applet: 'houses/web/exams/networking-midterm.html'
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
            paths: [],
            components: {
                lab: 'houses/web/labs/networking-fundamentals-lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-static-routes-lab': {
            id: 'web-static-routes-lab',
            title: 'Static Routes Lab',
            description: 'Build a multi-layer Packet Tracer topology with static routing',
            house: 'web',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['labs', 'networking'],
            paths: [],
            components: {
                lab: 'houses/web/labs/static-routes-lab.html'
            },
            prerequisites: [],
            objectives: []
        }
,

        // ─────────────────────────────────────────────────────────────
        // CLOUD HOUSE - 35 new entries
        // ─────────────────────────────────────────────────────────────
        'cloud-architecture-designer': {
            id: 'cloud-architecture-designer',
            title: 'Cloud Architecture Designer',
            description: 'Interactive tool for designing cloud architectures',
            house: 'cloud',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['cloud'],
            paths: [],
            components: {
                applet: 'houses/cloud/applets/architecture/cloud-architecture-designer.html'
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
            paths: [],
            components: {
                applet: 'houses/cloud/applets/aws/ch03-support-plans-visualizer.html'
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
            paths: [],
            components: {
                applet: 'houses/cloud/applets/aws/ch04-aws-regions-explorer.html'
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
            paths: [],
            components: {
                quiz: 'houses/cloud/applets/aws/ch05-iam-security-quiz.html'
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
            paths: [],
            components: {
                applet: 'houses/cloud/applets/aws/ch07-ec2-instance-visualizer.html'
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
            paths: [],
            components: {
                quiz: 'houses/cloud/applets/aws/ch08-storage-quiz.html'
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
            paths: [],
            components: {
                quiz: 'houses/cloud/applets/aws/ch09-database-quiz.html'
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
            paths: [],
            components: {
                quiz: 'houses/cloud/applets/aws/ch10-networking-quiz.html'
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
            paths: [],
            components: {
                applet: 'houses/cloud/applets/aws/ch11-automation-explorer.html'
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
            paths: [],
            components: {
                applet: 'houses/cloud/applets/aws/ch12-use-cases-visualizer.html'
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
            paths: [],
            components: {
                quiz: 'houses/cloud/applets/fundamentals/ch01-cloud-fundamentals-quiz.html'
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
            paths: [],
            components: {
                applet: 'houses/cloud/applets/fundamentals/cloud-visualizer.html'
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
            paths: [],
            components: {
                lab: 'houses/cloud/labs/cloud-lab-simulator.html'
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
            paths: [],
            components: {
                presentation: 'houses/cloud/presentations/aws-fundamentals.html'
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
            paths: [],
            components: {
                presentation: 'houses/cloud/presentations/cloud-presentation.html'
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
            paths: [],
            components: {
                presentation: 'houses/cloud/presentations/cse-01-cloud-fundamentals.html'
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
            paths: [],
            components: {
                presentation: 'houses/cloud/presentations/cse-02-identity-access-management.html'
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
            paths: [],
            components: {
                presentation: 'houses/cloud/presentations/cse-03-data-protection-encryption.html'
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
            paths: [],
            components: {
                presentation: 'houses/cloud/presentations/cse-04-network-security.html'
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
            paths: [],
            components: {
                presentation: 'houses/cloud/presentations/cse-05-application-security.html'
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
            paths: [],
            components: {
                quiz: 'houses/cloud/quizzes/cse-01-quiz.html'
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
            paths: [],
            components: {
                quiz: 'houses/cloud/quizzes/cse-02-quiz.html'
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
            paths: [],
            components: {
                quiz: 'houses/cloud/quizzes/cse-03-quiz.html'
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
            paths: [],
            components: {
                quiz: 'houses/cloud/quizzes/cse-04-quiz.html'
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
            paths: [],
            components: {
                quiz: 'houses/cloud/quizzes/cse-05-quiz.html'
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
            paths: [],
            components: {
                presentation: 'houses/cloud/presentations/cse-06-security-monitoring-ir.html'
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
            paths: [],
            components: {
                quiz: 'houses/cloud/quizzes/cse-06-quiz.html'
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
            paths: [],
            components: {
                presentation: 'houses/cloud/presentations/cse-07-risk-assessment.html'
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
            paths: [],
            components: {
                quiz: 'houses/cloud/quizzes/cse-07-quiz.html'
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
            paths: [],
            components: {
                presentation: 'houses/cloud/presentations/cse-08-compliance-governance.html'
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
            paths: [],
            components: {
                quiz: 'houses/cloud/quizzes/cse-08-quiz.html'
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
            paths: [],
            components: {
                quiz: 'houses/cloud/quizzes/aws-fundamentals-quiz.html'
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
            paths: [],
            components: {
                lab: 'houses/cloud/labs/aws-services-lab.html'
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
            paths: [],
            components: {
                lab: 'houses/cloud/labs/cloud-architecture-lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'cloud-security-lab': {
            id: 'cloud-security-lab',
            title: 'Cloud Security Lab',
            description: 'Shared responsibility, IAM, encryption, network security, and compliance for CLF-C02',
            house: 'cloud',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['cloud'],
            paths: [],
            components: {
                lab: 'houses/cloud/labs/cloud-security-lab.html'
            },
            prerequisites: [],
            objectives: []
        }
,

        // ─────────────────────────────────────────────────────────────
        // FORGE HOUSE - 37 new entries
        // ─────────────────────────────────────────────────────────────
        'forge-admin-tools-explorer': {
            id: 'forge-admin-tools-explorer',
            title: 'Admin Tools Explorer',
            description: 'Interactive Windows administrative tools guide',
            house: 'forge',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['systems'],
            paths: [],
            components: {
                applet: 'houses/forge/applets/admin-tools-explorer.html'
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
            paths: [],
            components: {
                applet: 'houses/forge/applets/command-translator.html'
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
            paths: [],
            components: {
                applet: 'houses/forge/applets/control-panel-explorer.html'
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
            paths: [],
            components: {
                applet: 'houses/forge/applets/settings-explorer.html'
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
            paths: [],
            components: {
                applet: 'houses/forge/applets/system-tools-sim.html'
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
            paths: [],
            components: {
                applet: 'houses/forge/applets/windows-edition-selector.html'
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
            paths: [],
            components: {
                applet: 'houses/forge/applets/hardware/backup-strategy-planner.html'
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
            paths: [],
            components: {
                applet: 'houses/forge/applets/hardware/cpu_architecture/cpu_architecture.html'
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
            paths: [],
            components: {
                applet: 'houses/forge/applets/hardware/display_types/display_types.html'
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
            paths: [],
            components: {
                applet: 'houses/forge/applets/hardware/hard_drive_geometry/hard_drive_geometry1.html'
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
            paths: [],
            components: {
                applet: 'houses/forge/applets/hardware/laptop_hardware/laptop_hardware.html'
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
            paths: [],
            components: {
                applet: 'houses/forge/applets/hardware/mobile_accessories/mobile_accessories.html'
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
            paths: [],
            components: {
                applet: 'houses/forge/applets/hardware/motherboards/motherboards.html'
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
            paths: [],
            components: {
                applet: 'houses/forge/applets/hardware/multimeter/multimeter_jedit_v1.html'
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
            paths: [],
            components: {
                applet: 'houses/forge/applets/hardware/network_cables/network_cables.html'
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
            paths: [],
            components: {
                applet: 'houses/forge/applets/hardware/network_ports/network_ports.html'
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
            paths: [],
            components: {
                applet: 'houses/forge/applets/hardware/peripheral_devices/peripheral_devices.html'
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
            paths: [],
            components: {
                applet: 'houses/forge/applets/hardware/power_supplies/power_supplies.html'
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
            paths: [],
            components: {
                applet: 'houses/forge/applets/hardware/printers/printers.html'
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
            paths: [],
            components: {
                applet: 'houses/forge/applets/hardware/raid_storage/raid_storage.html'
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
            paths: [],
            components: {
                applet: 'houses/forge/applets/hardware/ram_types/ram_types.html'
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
            paths: [],
            components: {
                applet: 'houses/forge/applets/hardware/storage_devices/storage_devices.html'
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
            paths: [],
            components: {
                applet: 'houses/forge/applets/hardware/virtualization/virtualization.html'
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
            paths: [],
            components: {
                applet: 'houses/forge/applets/hardware/wireless_networking/wireless_networking.html'
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
            paths: [],
            components: {
                lab: 'houses/forge/labs/admin-tools-lab.html'
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
            paths: [],
            components: {
                lab: 'houses/forge/labs/control-panel-lab.html'
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
            paths: [],
            components: {
                lab: 'houses/forge/labs/lab-macos-linux.html'
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
            paths: [],
            components: {
                lab: 'houses/forge/labs/system-tools-lab.html'
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
            paths: [],
            components: {
                lab: 'houses/forge/labs/windows-editions-lab.html'
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
            paths: [],
            components: {
                lab: 'houses/forge/labs/windows-settings-lab.html'
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
            paths: [],
            components: {
                quiz: 'houses/forge/quizzes/windows-admin-quiz.html'
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
            paths: [],
            components: {
                quiz: 'houses/forge/quizzes/aplus-core2-ch19-22.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-aplus-jeopardy': {
            id: 'forge-aplus-jeopardy',
            title: 'A+ Jeopardy',
            description: 'CompTIA A+ review in Jeopardy format',
            house: 'forge',
            type: 'module',
            difficulty: 'beginner',
            duration: 30,
            topics: ['systems'],
            paths: [],
            components: {
                applet: 'houses/forge/games/aplus-jeopardy.html'
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
            paths: [],
            components: {
                applet: 'houses/forge/reference/cpu-architecture.html'
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
            paths: [],
            components: {
                applet: 'houses/forge/reference/windows-shortcuts.html'
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
            paths: [],
            components: {
                lab: 'houses/forge/labs/hardware-essentials-lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-hardware-quiz': {
            id: 'forge-hardware-quiz',
            title: 'Hardware Essentials Quiz',
            description: '15 questions covering A+ Core 1 hardware topics',
            house: 'forge',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['systems'],
            paths: [],
            components: {
                quiz: 'houses/forge/quizzes/hardware-essentials-quiz.html'
            },
            prerequisites: [],
            objectives: []
        }
,

        // ─────────────────────────────────────────────────────────────
        // SCRIPT HOUSE - 68 new entries
        // ─────────────────────────────────────────────────────────────
        'script-macos-linux-lab': {
            id: 'script-macos-linux-lab',
            title: 'macOS & Linux Lab',
            description: 'Hands-on practice with macOS and Linux systems',
            house: 'script',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['scripting', 'linux'],
            paths: [],
            components: {
                lab: 'houses/script/applets/linux/lab-macos-linux.html'
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
            paths: [],
            components: {
                applet: 'houses/script/applets/python/python-chapter7-file-handling.html'
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
            paths: [],
            components: {
                applet: 'houses/script/applets/sysadmin/package-manager-simulator.html'
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
            paths: [],
            components: {
                presentation: 'houses/script/presentations/automation-presentation.html'
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
            paths: [],
            components: {
                presentation: 'houses/script/presentations/macos-linux-basics.html'
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
            paths: [],
            components: {
                presentation: 'houses/script/presentations/scripting-basics.html'
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
            paths: [],
            components: {
                quiz: 'houses/script/quizzes/linux-basics-quiz.html'
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
            topics: ['clh', 'scripting'],
            paths: [],
            components: {
                lab: 'houses/script/applets/linux/clh-001-intro-to-hacker-cli.html'
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
            topics: ['clh', 'scripting'],
            paths: [],
            components: {
                lab: 'houses/script/applets/linux/clh-002-navigation-recon.html'
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
            topics: ['clh', 'scripting'],
            paths: [],
            components: {
                lab: 'houses/script/applets/linux/clh-003-pattern-hunting.html'
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
            topics: ['clh', 'scripting'],
            paths: [],
            components: {
                lab: 'houses/script/applets/linux/clh-004-process-investigation.html'
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
            topics: ['clh', 'scripting'],
            paths: [],
            components: {
                lab: 'houses/script/applets/linux/clh-005-log-analysis.html'
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
            topics: ['clh', 'scripting'],
            paths: [],
            components: {
                lab: 'houses/script/applets/linux/clh-006-file-operations.html'
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
            topics: ['clh', 'scripting'],
            paths: [],
            components: {
                lab: 'houses/script/applets/linux/clh-007-permissions.html'
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
            topics: ['clh', 'scripting'],
            paths: [],
            components: {
                lab: 'houses/script/applets/linux/clh-008-shell-scripting.html'
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
            topics: ['clh', 'scripting'],
            paths: [],
            components: {
                lab: 'houses/script/applets/linux/clh-009-text-processing.html'
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
            topics: ['clh', 'scripting'],
            paths: [],
            components: {
                lab: 'houses/script/applets/linux/clh-010-io-redirection.html'
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
            topics: ['clh', 'scripting'],
            paths: [],
            components: {
                lab: 'houses/script/applets/linux/clh-011-advanced-grep.html'
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
            topics: ['clh', 'scripting', 'networking'],
            paths: [],
            components: {
                lab: 'houses/script/applets/linux/clh-012-network-basics.html'
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
            topics: ['clh', 'scripting'],
            paths: [],
            components: {
                lab: 'houses/script/applets/linux/clh-013-environment.html'
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
            topics: ['clh', 'scripting'],
            paths: [],
            components: {
                lab: 'houses/script/applets/linux/clh-014-process-control.html'
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
            topics: ['clh', 'scripting'],
            paths: [],
            components: {
                lab: 'houses/script/applets/linux/clh-015-capstone.html'
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
            topics: ['clh', 'scripting'],
            paths: [],
            components: {
                quiz: 'houses/script/clh/clh-001-quiz.html'
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
            topics: ['clh', 'scripting'],
            paths: [],
            components: {
                quiz: 'houses/script/clh/clh-002-quiz.html'
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
            topics: ['clh', 'scripting'],
            paths: [],
            components: {
                quiz: 'houses/script/clh/clh-003-quiz.html'
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
            topics: ['clh', 'scripting'],
            paths: [],
            components: {
                quiz: 'houses/script/clh/clh-004-quiz.html'
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
            topics: ['clh', 'scripting'],
            paths: [],
            components: {
                quiz: 'houses/script/clh/clh-005-quiz.html'
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
            topics: ['clh', 'scripting'],
            paths: [],
            components: {
                quiz: 'houses/script/clh/clh-006-quiz.html'
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
            topics: ['clh', 'scripting'],
            paths: [],
            components: {
                quiz: 'houses/script/clh/clh-007-quiz.html'
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
            topics: ['clh', 'scripting'],
            paths: [],
            components: {
                quiz: 'houses/script/clh/clh-008-quiz.html'
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
            topics: ['clh', 'scripting'],
            paths: [],
            components: {
                quiz: 'houses/script/clh/clh-009-quiz.html'
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
            topics: ['clh', 'scripting'],
            paths: [],
            components: {
                quiz: 'houses/script/clh/clh-010-quiz.html'
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
            topics: ['clh', 'scripting'],
            paths: [],
            components: {
                quiz: 'houses/script/clh/clh-011-quiz.html'
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
            topics: ['clh', 'scripting'],
            paths: [],
            components: {
                quiz: 'houses/script/clh/clh-012-quiz.html'
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
            topics: ['clh', 'scripting'],
            paths: [],
            components: {
                quiz: 'houses/script/clh/clh-013-quiz.html'
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
            topics: ['clh', 'scripting'],
            paths: [],
            components: {
                quiz: 'houses/script/clh/clh-014-quiz.html'
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
            topics: ['clh', 'scripting'],
            paths: [],
            components: {
                quiz: 'houses/script/clh/clh-015-quiz.html'
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
            topics: ['clh', 'scripting'],
            paths: [],
            components: {
                presentation: 'houses/script/clh/clh-001-intro.html'
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
            topics: ['clh', 'scripting'],
            paths: [],
            components: {
                presentation: 'houses/script/clh/clh-002-intro.html'
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
            topics: ['clh', 'scripting'],
            paths: [],
            components: {
                presentation: 'houses/script/clh/clh-003-intro.html'
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
            topics: ['clh', 'scripting'],
            paths: [],
            components: {
                presentation: 'houses/script/clh/clh-004-intro.html'
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
            topics: ['clh', 'scripting'],
            paths: [],
            components: {
                presentation: 'houses/script/clh/clh-005-intro.html'
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
            topics: ['clh', 'scripting'],
            paths: [],
            components: {
                presentation: 'houses/script/clh/clh-006-intro.html'
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
            topics: ['clh', 'scripting'],
            paths: [],
            components: {
                presentation: 'houses/script/clh/clh-007-intro.html'
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
            topics: ['clh', 'scripting'],
            paths: [],
            components: {
                presentation: 'houses/script/clh/clh-008-intro.html'
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
            topics: ['clh', 'scripting'],
            paths: [],
            components: {
                presentation: 'houses/script/clh/clh-009-intro.html'
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
            topics: ['clh', 'scripting'],
            paths: [],
            components: {
                presentation: 'houses/script/clh/clh-010-intro.html'
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
            topics: ['clh', 'scripting'],
            paths: [],
            components: {
                presentation: 'houses/script/clh/clh-011-intro.html'
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
            topics: ['clh', 'scripting'],
            paths: [],
            components: {
                presentation: 'houses/script/clh/clh-012-intro.html'
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
            topics: ['clh', 'scripting'],
            paths: [],
            components: {
                presentation: 'houses/script/clh/clh-013-intro.html'
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
            topics: ['clh', 'scripting'],
            paths: [],
            components: {
                presentation: 'houses/script/clh/clh-014-intro.html'
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
            topics: ['clh', 'scripting'],
            paths: [],
            components: {
                presentation: 'houses/script/clh/clh-015-intro.html'
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
            paths: [],
            components: {
                lab: 'houses/script/labs/linux-bash-lab.html'
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
            paths: [],
            components: {
                quiz: 'houses/script/quizzes/linux-bash-quiz.html'
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
            paths: [],
            components: {
                lab: 'houses/script/labs/python-lab.html'
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
            paths: [],
            components: {
                quiz: 'houses/script/quizzes/python-quiz.html'
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
            paths: [],
            components: {
                presentation: 'houses/script/presentations/python/python-chapter1.html'
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
            paths: [],
            components: {
                presentation: 'houses/script/presentations/python/python-chapter2.html'
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
            paths: [],
            components: {
                presentation: 'houses/script/presentations/python/python-chapter3.html'
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
            paths: [],
            components: {
                presentation: 'houses/script/presentations/python/python-chapter4.html'
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
            paths: [],
            components: {
                presentation: 'houses/script/presentations/python/python-chapter5.html'
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
            paths: [],
            components: {
                presentation: 'houses/script/presentations/python/python-chapter6.html'
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
            paths: [],
            components: {
                presentation: 'houses/script/presentations/python/python-chapter7.html'
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
            paths: [],
            components: {
                presentation: 'houses/script/presentations/python/python-chapter8.html'
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
            paths: [],
            components: {
                lab: 'houses/script/labs/powershell-lab.html'
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
            paths: [],
            components: {
                quiz: 'houses/script/quizzes/powershell-quiz.html'
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
            paths: [],
            components: {
                lab: 'houses/script/labs/sysadmin-lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-sysadmin-quiz': {
            id: 'script-sysadmin-quiz',
            title: 'Sysadmin & Automation Quiz',
            description: '15 questions on automation best practices and system administration',
            house: 'script',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['sysadmin', 'scripting'],
            paths: [],
            components: {
                quiz: 'houses/script/quizzes/sysadmin-quiz.html'
            },
            prerequisites: [],
            objectives: []
        }
,

        // ─────────────────────────────────────────────────────────────
        // CODE HOUSE - 31 new entries
        // ─────────────────────────────────────────────────────────────
        'code-version-control': {
            id: 'code-version-control',
            title: 'Version Control Guide',
            description: 'Comprehensive Git guide: workflows, branching strategies, and GitHub integration',
            house: 'code',
            type: 'module',
            difficulty: 'beginner',
            duration: 30,
            topics: ['devops'],
            paths: [],
            components: {
                applet: 'houses/code/presentations/git-basics.html'
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
            paths: [],
            components: {
                presentation: 'houses/code/presentations/automation-presentation.html'
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
            paths: [],
            components: {
                applet: 'houses/code/applets/automation-visualizer.html'
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
            paths: [],
            components: {
                applet: 'houses/code/applets/terraform-visualizer.html'
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
            paths: [],
            components: {
                applet: 'houses/code/applets/config_management/ConfigMgmt.html'
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
            paths: [],
            components: {
                lab: 'houses/code/presentations/docker-fundamentals.html'
            },
            prerequisites: [],
            objectives: []
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
            paths: [],
            components: {},
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
            paths: [],
            components: {
                applet: 'houses/code/applets/cloudformation-designer.html'
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
            paths: [],
            components: {
                applet: 'houses/code/applets/docker-playground.html'
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
            paths: [],
            components: {
                applet: 'houses/code/applets/kubernetes-cluster-sim.html'
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
            paths: [],
            components: {
                applet: 'houses/code/applets/pipeline-builder.html'
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
            paths: [],
            components: {
                applet: 'houses/code/applets/sprint-simulator.html'
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
            paths: [],
            components: {
                lab: 'houses/code/labs/cicd-lab.html'
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
            paths: [],
            components: {
                lab: 'houses/code/labs/cloudformation-lab.html'
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
            paths: [],
            components: {
                lab: 'houses/code/labs/docker-lab.html'
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
            paths: [],
            components: {
                lab: 'houses/code/labs/kubernetes-lab.html'
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
            paths: [],
            components: {
                lab: 'houses/code/labs/terraform-lab.html'
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
            paths: [],
            components: {
                presentation: 'houses/code/presentations/agile-sdlc.html'
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
            paths: [],
            components: {
                presentation: 'houses/code/presentations/cicd-fundamentals.html'
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
            paths: [],
            components: {
                presentation: 'houses/code/presentations/cloudformation-fundamentals.html'
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
            paths: [],
            components: {
                presentation: 'houses/code/presentations/kubernetes-fundamentals.html'
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
            paths: [],
            components: {
                presentation: 'houses/code/presentations/terraform-fundamentals.html'
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
            paths: [],
            components: {
                quiz: 'houses/code/quizzes/agile-quiz.html'
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
            paths: [],
            components: {
                quiz: 'houses/code/quizzes/cicd-quiz.html'
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
            paths: [],
            components: {
                quiz: 'houses/code/quizzes/cloudformation-quiz.html'
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
            paths: [],
            components: {
                quiz: 'houses/code/quizzes/docker-quiz.html'
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
            paths: [],
            components: {
                quiz: 'houses/code/quizzes/kubernetes-quiz.html'
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
            paths: [],
            components: {
                quiz: 'houses/code/quizzes/terraform-quiz.html'
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
            paths: [],
            components: {
                applet: 'houses/code/applets/data-format-converter.html'
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
            paths: [],
            components: {
                applet: 'houses/code/applets/api-explorer.html'
            },
            prerequisites: [],
            objectives: []
        },
        'code-ansible-visualizer': {
            id: 'code-ansible-visualizer',
            title: 'Ansible Playbook Visualizer',
            description: 'Parse and visualize Ansible playbook structure - plays, tasks, handlers, and variables',
            house: 'code',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['devops'],
            paths: [],
            components: {
                applet: 'houses/code/applets/ansible-playbook-visualizer.html'
            },
            prerequisites: [],
            objectives: []
        }
,

        // ─────────────────────────────────────────────────────────────
        // KEY HOUSE - 36 new entries
        // ─────────────────────────────────────────────────────────────
        'key-symmetric-vs-asymmetric': {
            id: 'key-symmetric-vs-asymmetric',
            title: 'Symmetric vs Asymmetric',
            description: 'Understanding the differences and use cases for each approach',
            house: 'key',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 35,
            topics: ['cryptography'],
            paths: [],
            components: {
                presentation: 'houses/key/presentations/advanced-symmetric.html'
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
            paths: [],
            components: {
                lab: 'houses/key/tools/hmac-calculator.html'
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
            paths: [],
            components: {
                presentation: 'houses/key/tools/cert-inspector.html'
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
            paths: [],
            components: {
                lab: 'houses/key/presentations/certificates.html'
            },
            prerequisites: [],
            objectives: []
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
            paths: [],
            components: {},
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
            paths: [],
            components: {
                quiz: 'houses/key/presentations/cryptography-fundamentals.html'
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
            paths: [],
            components: {
                lab: 'houses/key/labs/aes-lab.html'
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
            paths: [],
            components: {
                lab: 'houses/key/labs/attack-lab.html'
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
            paths: [],
            components: {
                lab: 'houses/key/labs/cert-lab.html'
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
            paths: [],
            components: {
                lab: 'houses/key/labs/ecc-lab.html'
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
            paths: [],
            components: {
                lab: 'houses/key/labs/hmac-lab.html'
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
            paths: [],
            components: {
                lab: 'houses/key/labs/hsm-lab.html'
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
            paths: [],
            components: {
                lab: 'houses/key/labs/kdf-lab.html'
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
            paths: [],
            components: {
                lab: 'houses/key/labs/pqc-lab.html'
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
            paths: [],
            components: {
                presentation: 'houses/key/presentations/cryptanalysis.html'
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
            paths: [],
            components: {
                presentation: 'houses/key/presentations/elliptic-curve.html'
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
            paths: [],
            components: {
                presentation: 'houses/key/presentations/key-derivation.html'
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
            paths: [],
            components: {
                presentation: 'houses/key/presentations/key-management.html'
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
            paths: [],
            components: {
                presentation: 'houses/key/presentations/message-authentication.html'
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
            paths: [],
            components: {
                presentation: 'houses/key/presentations/post-quantum.html'
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
            paths: [],
            components: {
                quiz: 'houses/key/quizzes/cert-quiz.html'
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
            paths: [],
            components: {
                quiz: 'houses/key/quizzes/cryptanalysis-quiz.html'
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
            paths: [],
            components: {
                quiz: 'houses/key/quizzes/ecc-quiz.html'
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
            paths: [],
            components: {
                quiz: 'houses/key/quizzes/hsm-quiz.html'
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
            paths: [],
            components: {
                quiz: 'houses/key/quizzes/kdf-quiz.html'
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
            paths: [],
            components: {
                quiz: 'houses/key/quizzes/mac-quiz.html'
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
            paths: [],
            components: {
                quiz: 'houses/key/quizzes/pqc-quiz.html'
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
            paths: [],
            components: {
                quiz: 'houses/key/quizzes/symmetric-quiz.html'
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
            paths: [],
            components: {
                applet: 'houses/key/tools/aes-explorer.html'
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
            paths: [],
            components: {
                applet: 'houses/key/tools/cryptanalysis-lab.html'
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
            paths: [],
            components: {
                applet: 'houses/key/tools/ecc-visualizer.html'
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
            paths: [],
            components: {
                applet: 'houses/key/tools/kdf-analyzer.html'
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
            paths: [],
            components: {
                applet: 'houses/key/tools/key-lifecycle.html'
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
            paths: [],
            components: {
                applet: 'houses/key/tools/pqc-explorer.html'
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
            paths: [],
            components: {
                applet: 'houses/key/modules/hash-stego-intro.html'
            },
            prerequisites: [],
            objectives: []
        },
        'key-crypto-stego-lab': {
            id: 'key-crypto-stego-lab',
            title: 'Crypto & Steganography Lab',
            description: 'Hands-on cryptography and steganography exercises',
            house: 'key',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['cryptography'],
            paths: [],
            components: {
                lab: 'houses/key/labs/crypto-stego-lab.html'
            },
            prerequisites: [],
            objectives: []
        }
,

        // ─────────────────────────────────────────────────────────────
        // EYE HOUSE - 21 new entries
        // ─────────────────────────────────────────────────────────────
        'eye-wireshark-training': {
            id: 'eye-wireshark-training',
            title: 'Wireshark Training Lab',
            description: 'Master network protocol analysis with interactive filter practice and challenges',
            house: 'eye',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 45,
            topics: ['monitoring'],
            paths: [],
            components: {
                quiz: 'houses/eye/tools/wireshark-training.html'
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
            paths: [],
            components: {
                applet: 'houses/eye/tools/packet-analyzer.html'
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
            paths: [],
            components: {
                lab: 'houses/eye/labs/traffic-lab.html'
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
            paths: [],
            components: {
                presentation: 'houses/eye/presentations/siem-fundamentals.html'
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
            paths: [],
            components: {
                lab: 'houses/eye/tools/siem-simulator.html'
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
            paths: [],
            components: {
                quiz: 'houses/eye/presentations/threat-hunting.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-incident-timeline': {
            id: 'eye-incident-timeline',
            title: 'Incident Timeline',
            description: 'Constructing chronological event sequences for investigations',
            house: 'eye',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 35,
            topics: ['monitoring'],
            paths: [],
            components: {
                presentation: 'houses/eye/labs/correlation-lab.html'
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
            paths: [],
            components: {
                lab: 'houses/eye/labs/hunting-lab.html'
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
            paths: [],
            components: {
                lab: 'houses/eye/labs/siem-lab.html'
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
            paths: [],
            components: {
                lab: 'houses/eye/labs/soc-lab.html'
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
            paths: [],
            components: {
                presentation: 'houses/eye/presentations/log-correlation.html'
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
            paths: [],
            components: {
                presentation: 'houses/eye/presentations/network-traffic-analysis.html'
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
            paths: [],
            components: {
                presentation: 'houses/eye/presentations/soc-operations.html'
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
            paths: [],
            components: {
                quiz: 'houses/eye/quizzes/correlation-quiz.html'
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
            paths: [],
            components: {
                quiz: 'houses/eye/quizzes/hunting-quiz.html'
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
            paths: [],
            components: {
                quiz: 'houses/eye/quizzes/siem-quiz.html'
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
            paths: [],
            components: {
                quiz: 'houses/eye/quizzes/soc-quiz.html'
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
            paths: [],
            components: {
                quiz: 'houses/eye/quizzes/traffic-quiz.html'
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
            paths: [],
            components: {
                applet: 'houses/eye/tools/correlation-engine.html'
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
            paths: [],
            components: {
                applet: 'houses/eye/tools/hunt-workbench.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-soc-simulator': {
            id: 'eye-soc-simulator',
            title: 'SOC Simulator',
            description: 'Simulate Security Operations Center workflows and triage',
            house: 'eye',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['monitoring'],
            paths: [],
            components: {
                applet: 'houses/eye/tools/soc-simulator.html'
            },
            prerequisites: [],
            objectives: []
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // LEARNING PATHS
    // Curated sequences that pull from multiple houses
    // ═══════════════════════════════════════════════════════════════

    paths: {
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

        'command-line-hacker': {
            id: 'command-line-hacker',
            title: 'Command Line Hacker',
            description: 'Master the terminal as a tool for reconnaissance, analysis, and operations',
            icon: '💀',
            certification: null,
            difficulty: 'intermediate',
            estimatedHours: 30,
            color: '#00ff41',
            modules: [
                // Foundation (CLH-001 to CLH-005)
                'script-clh-001',  // CLH-001: Introduction to Hacker CLI
                'script-clh-002',  // CLH-002: Navigation & Reconnaissance
                'script-clh-003',  // CLH-003: Pattern Hunting (grep)
                'script-clh-004',  // CLH-004: Process Investigation
                'script-clh-005',  // CLH-005: Log Analysis
                // Operations (CLH-006 to CLH-008)
                'script-clh-006',  // CLH-006: File Operations
                'script-clh-007',  // CLH-007: Permissions & Access Control
                'script-clh-008',  // CLH-008: Shell Scripting Basics
                // Analysis (CLH-009 to CLH-011)
                'script-clh-009',  // CLH-009: Text Processing
                'script-clh-010',  // CLH-010: I/O Redirection
                'script-clh-011',  // CLH-011: Advanced Grep & Regex
                // Future labs:
                // 'script-clh-012',  // CLH-012: Network Basics
                // 'script-clh-013',  // CLH-013: Environment Variables
                // 'script-clh-014',  // CLH-014: Process Control
                // 'script-clh-015',  // CLH-015: Capstone Mission
            ]
        }
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
        'dark-arts': {
            id: 'dark-arts',
            name: 'House of the Dark Arts',
            shortName: 'The Dark Arts',
            icon: '🌑',
            domain: 'Offensive Security',
            color: '#6b21a8',
            description: 'Understand attacks to build better defenses',
            restricted: true,
            unlockRequirement: 'five-gates'
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
        }
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

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ContentRegistry;
}
