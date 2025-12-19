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
                applet: 'houses/web/applets/osi-explorer.html',
                lab: 'houses/web/labs/osi-lab.html'
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
                applet: 'houses/shield/applets/cia-scenarios.html',
                lab: 'houses/shield/labs/cia-lab.html'
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
                applet: 'houses/shield/applets/threats/social-engineering-attacks.html'
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

        // ─────────────────────────────────────────────────────────────
        // CLOUD HOUSE - Infrastructure & Scale
        // ─────────────────────────────────────────────────────────────
        'cloud-concepts': {
            id: 'cloud-concepts',
            title: 'Cloud Computing Concepts',
            description: 'IaaS, PaaS, SaaS and deployment models',
            house: 'cloud',
            type: 'module',
            difficulty: 'beginner',
            duration: 45,
            topics: ['cloud', 'aws', 'azure', 'fundamentals'],
            paths: ['aws-ccp', 'azure-fundamentals'],
            components: {
                presentation: 'houses/cloud/presentations/cloud-concepts.html',
                applet: 'houses/cloud/applets/service-model-matcher.html',
                lab: 'houses/cloud/labs/cloud-concepts-lab.html'
            },
            prerequisites: [],
            objectives: [
                'Differentiate IaaS, PaaS, and SaaS',
                'Explain public, private, hybrid clouds',
                'Identify cloud benefits and considerations'
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
                applet: 'houses/key/applets/cipher-playground.html',
                lab: 'houses/key/labs/encryption-lab.html'
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
                applet: 'houses/code/applets/git-visualizer.html',
                lab: 'houses/code/labs/git-lab.html'
            },
            prerequisites: [],
            objectives: [
                'Initialize and clone repositories',
                'Commit, push, and pull changes',
                'Understand branching basics'
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
                applet: 'houses/eye/applets/log-parser.html',
                lab: 'houses/eye/labs/log-analysis-lab.html'
            },
            prerequisites: [],
            objectives: [
                'Locate common log files',
                'Parse log entries effectively',
                'Identify indicators in logs'
            ]
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
            description: 'AWS fundamentals and cloud concepts',
            icon: '☁️',
            certification: 'AWS Certified Cloud Practitioner',
            difficulty: 'beginner',
            estimatedHours: 30,
            color: '#ff9900',
            modules: [
                'cloud-concepts'
                // More to be added
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
