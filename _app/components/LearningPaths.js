/**
 * LearningPaths.js - Learning Path Definitions for Hexworth Prime
 *
 * Defines the sequence of modules for each house, including:
 * - Module order and prerequisites
 * - Suggested learning paths
 * - Module metadata (type, difficulty, duration estimates)
 */

class LearningPaths {
    // Learning paths for each house
    static PATHS = {
        shield: {
            name: 'Shield House - Security Fundamentals',
            description: 'Master the foundations of cybersecurity',
            icon: '/assets/images/icons/icon-shield.webp',
            color: '#a855f7',
            modules: [
                {
                    id: 'shield-cia-triad',
                    title: 'CIA Triad Fundamentals',
                    type: 'presentation',
                    difficulty: 'beginner',
                    duration: '20 min',
                    href: 'presentations/shield-cia-triad.presentation.html',
                    prerequisites: []
                },
                {
                    id: 'shield-cia-quiz',
                    title: 'CIA Triad Challenge',
                    type: 'quiz',
                    difficulty: 'beginner',
                    duration: '15 min',
                    href: 'quizzes/shield-cia-triad.quiz.html',
                    prerequisites: ['shield-cia-triad']
                },
                {
                    id: 'shield-security-fundamentals',
                    title: 'Security Fundamentals',
                    type: 'presentation',
                    difficulty: 'beginner',
                    duration: '30 min',
                    href: 'presentations/shield-security.presentation.html',
                    prerequisites: ['shield-cia-quiz']
                },
                {
                    id: 'shield-access-control',
                    title: 'Access Control Models',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'applets/access/shield-access-control-models.applet.html',
                    prerequisites: ['shield-security-fundamentals']
                },
                {
                    id: 'shield-threat-actors',
                    title: 'Threat Landscape',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'houses/shield/applets/threats/threat_actors/shield-threat-threat-actors.applet.html',
                    prerequisites: ['shield-access-control']
                },
                {
                    id: 'shield-risk-management',
                    title: 'Risk Assessment',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '35 min',
                    href: 'houses/shield/applets/risk/risk_management/shield-risk-management.applet.html',
                    prerequisites: ['shield-threat-actors']
                },
                {
                    id: 'shield-network-security',
                    title: 'Network Security Basics',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'houses/shield/applets/network/shield-home-network-security.applet.html',
                    prerequisites: ['shield-risk-management']
                },
                {
                    id: 'shield-crypto-intro',
                    title: 'Cryptography Introduction',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'houses/key/presentations/key-encryption-basics.presentation.html',
                    prerequisites: ['shield-network-security']
                },
                {
                    id: 'shield-yara-training',
                    title: 'YARA Rule Training',
                    type: 'tool',
                    difficulty: 'advanced',
                    duration: '45 min',
                    href: 'tools/shield-yara.tool.html',
                    prerequisites: ['shield-crypto-intro']
                },
                {
                    id: 'shield-contra',
                    title: 'Contra',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '20 min',
                    href: 'games/shield-contra.applet.html',
                    prerequisites: []
                },
                {
                    id: 'shield-debugger',
                    title: 'Debugger',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '20 min',
                    href: 'games/shield-debugger.applet.html',
                    prerequisites: []
                },
                {
                    id: 'shield-threatdex',
                    title: 'ThreatDex',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'games/shield-threatdex.applet.html',
                    prerequisites: []
                },
                {
                    id: 'shield-web-security-headers-lab',
                    title: 'Web Security Headers Lab',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'games/shield-web-security-headers-lab.applet.html',
                    prerequisites: []
                }
            ]
        },

        web: {
            name: 'Web House - Networking',
            description: 'Build expertise in network fundamentals',
            icon: '/assets/images/icons/icon-globe.webp',
            color: '#3b82f6',
            modules: [
                {
                    id: 'web-osi-model',
                    title: 'OSI Model Fundamentals',
                    type: 'presentation',
                    difficulty: 'beginner',
                    duration: '25 min',
                    href: 'presentations/web-osi-model.presentation.html',
                    prerequisites: []
                },
                {
                    id: 'web-osi-quiz',
                    title: 'OSI Model Challenge',
                    type: 'quiz',
                    difficulty: 'beginner',
                    duration: '15 min',
                    href: 'quizzes/web-osi.quiz.html',
                    prerequisites: ['web-osi-model']
                },
                {
                    id: 'web-ip-addressing',
                    title: 'IP Addressing Basics',
                    type: 'applet',
                    difficulty: 'beginner',
                    duration: '30 min',
                    href: 'houses/web/applets/ip-addressing/binary-ip/web-ip-binary-ip.applet.html',
                    prerequisites: ['web-osi-quiz']
                },
                {
                    id: 'web-subnetting-pres',
                    title: 'Subnetting Fundamentals',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '40 min',
                    href: 'houses/web/presentations/web-subnetting.presentation.html',
                    prerequisites: ['web-ip-addressing']
                },
                {
                    id: 'web-subnetting-quiz',
                    title: 'Subnetting Challenge',
                    type: 'quiz',
                    difficulty: 'intermediate',
                    duration: '20 min',
                    href: 'quizzes/web-subnetting.quiz.html',
                    prerequisites: ['web-subnetting-pres']
                },
                {
                    id: 'web-switch-ops-pres',
                    title: 'Network Switching',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'houses/web/presentations/web-switch-operations.presentation.html',
                    prerequisites: ['web-subnetting-quiz']
                },
                {
                    id: 'web-switching',
                    title: 'VLAN Configuration',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '35 min',
                    href: 'houses/web/presentations/web-vlan.presentation.html',
                    prerequisites: ['web-switch-ops-pres']
                },
                {
                    id: 'web-topologies-pres',
                    title: 'Routing Fundamentals',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '35 min',
                    href: 'houses/web/presentations/web-topologies.presentation.html',
                    prerequisites: ['web-switching']
                },
                {
                    id: 'web-routing',
                    title: 'OSPF Protocol',
                    type: 'presentation',
                    difficulty: 'advanced',
                    duration: '40 min',
                    href: 'houses/web/presentations/web-ospf.presentation.html',
                    prerequisites: ['web-topologies-pres']
                },
                {
                    id: 'web-network-simulator',
                    title: 'Network Simulator Lab',
                    type: 'lab',
                    difficulty: 'advanced',
                    duration: '60 min',
                    href: 'simulators/web-interactive-network-simulatorv2.simulator.html',
                    prerequisites: ['web-routing']
                },
                {
                    id: 'web-dns-resolver-race',
                    title: 'DNS Resolver Race',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '20 min',
                    href: 'games/web-dns-resolver-race.applet.html',
                    prerequisites: []
                },
                {
                    id: 'web-subnet-siege',
                    title: 'Subnet Siege',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'games/web-subnet-siege.applet.html',
                    prerequisites: []
                }
            ]
        },

        forge: {
            name: 'Forge House - Systems',
            description: 'Master operating systems and hardware',
            icon: '<img src="/assets/images/icons/icon-tools.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain">',
            color: '#f97316',
            modules: [
                {
                    id: 'forge-windows-editions',
                    title: 'Windows Editions',
                    type: 'presentation',
                    difficulty: 'beginner',
                    duration: '20 min',
                    href: 'presentations/forge-windows-editions.presentation.html',
                    prerequisites: []
                },
                {
                    id: 'forge-windows-settings',
                    title: 'Windows Settings',
                    type: 'presentation',
                    difficulty: 'beginner',
                    duration: '25 min',
                    href: 'presentations/forge-windows-settings.presentation.html',
                    prerequisites: ['forge-windows-editions']
                },
                {
                    id: 'forge-control-panel',
                    title: 'Control Panel',
                    type: 'presentation',
                    difficulty: 'beginner',
                    duration: '30 min',
                    href: 'presentations/forge-control-panel.presentation.html',
                    prerequisites: ['forge-windows-settings']
                },
                {
                    id: 'forge-admin-tools',
                    title: 'Administrative Tools',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '35 min',
                    href: 'presentations/forge-admin-tools.presentation.html',
                    prerequisites: ['forge-control-panel']
                },
                {
                    id: 'forge-system-tools',
                    title: 'System Tools',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'presentations/forge-system-tools.presentation.html',
                    prerequisites: ['forge-admin-tools']
                },
                {
                    id: 'forge-hardware-fundamentals',
                    title: 'Hardware Components',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '40 min',
                    href: 'applets/hardware/forge-hardware-trainer.applet.html',
                    prerequisites: ['forge-system-tools']
                },
                {
                    id: 'forge-macos-linux-basics',
                    title: 'macOS & Linux Basics',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '35 min',
                    href: 'presentations/forge-macos-linux-basics.presentation.html',
                    prerequisites: ['forge-hardware-fundamentals']
                },
                {
                    id: 'forge-windows-admin-quiz',
                    title: 'Windows Admin Challenge',
                    type: 'quiz',
                    difficulty: 'intermediate',
                    duration: '20 min',
                    href: 'quizzes/forge-windows-admin.quiz.html',
                    prerequisites: ['forge-macos-linux-basics']
                }
            ]
        },

        script: {
            name: 'Script House - Automation',
            description: 'Learn scripting and automation',
            icon: '/assets/images/icons/icon-scroll.webp',
            color: '#22c55e',
            modules: [
                {
                    id: 'script-scripting-basics',
                    title: 'Scripting Fundamentals',
                    type: 'presentation',
                    difficulty: 'beginner',
                    duration: '20 min',
                    href: 'presentations/script-scripting-basics.presentation.html',
                    prerequisites: []
                },
                {
                    id: 'script-linux-basics',
                    title: 'Linux Command Simulator',
                    type: 'applet',
                    difficulty: 'beginner',
                    duration: '30 min',
                    href: 'houses/script/tools/script-linux-command.tool.html',
                    prerequisites: ['script-scripting-basics']
                },
                {
                    id: 'script-linux-filesystem',
                    title: 'Linux Filesystem Navigator',
                    type: 'applet',
                    difficulty: 'beginner',
                    duration: '25 min',
                    href: 'applets/linux/script-linux-filesystem-navigator.applet.html',
                    prerequisites: ['script-linux-basics']
                },
                {
                    id: 'script-linux-permissions',
                    title: 'Linux Permissions',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'houses/script/tools/script-linux-permissions.tool.html',
                    prerequisites: ['script-linux-filesystem']
                },
                {
                    id: 'script-bash-scripting',
                    title: 'Bash Scripting',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '45 min',
                    href: 'applets/linux/script-bash-scripting-playground.applet.html',
                    prerequisites: ['script-linux-permissions']
                },
                {
                    id: 'script-powershell-basics',
                    title: 'PowerShell Playground',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '40 min',
                    href: 'applets/powershell/script-powershell-playground.applet.html',
                    prerequisites: ['script-bash-scripting']
                },
                {
                    id: 'script-python-basics',
                    title: 'Python: Getting Started',
                    type: 'applet',
                    difficulty: 'beginner',
                    duration: '30 min',
                    href: 'applets/python/script-python-chapter1.applet.html',
                    prerequisites: ['script-scripting-basics']
                },
                {
                    id: 'script-python-strings',
                    title: 'Python: Strings',
                    type: 'applet',
                    difficulty: 'beginner',
                    duration: '25 min',
                    href: 'applets/python/script-python-chapter2-strings.applet.html',
                    prerequisites: ['script-python-basics']
                },
                {
                    id: 'script-python-flow-control',
                    title: 'Python: Flow Control',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'applets/python/script-python-chapter3-flow-control.applet.html',
                    prerequisites: ['script-python-strings']
                },
                {
                    id: 'script-automation-concepts',
                    title: 'Automation Visualizer',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '35 min',
                    href: 'houses/script/tools/script-automation.tool.html',
                    prerequisites: ['script-powershell-basics', 'script-python-flow-control']
                },
                {
                    id: 'script-linux-quiz',
                    title: 'Linux Basics Challenge',
                    type: 'quiz',
                    difficulty: 'intermediate',
                    duration: '20 min',
                    href: 'quizzes/script-linux-basics.quiz.html',
                    prerequisites: ['script-automation-concepts']
                }
            ]
        },

        cloud: {
            name: 'Cloud House - Cloud Computing',
            description: 'Explore cloud platforms and services',
            icon: '/assets/images/icons/icon-globe.webp',
            color: '#06b6d4',
            modules: [
                {
                    id: 'cloud-concepts',
                    title: 'Cloud Computing Concepts',
                    type: 'presentation',
                    difficulty: 'beginner',
                    duration: '25 min',
                    href: 'presentations/cloud-concepts.presentation.html',
                    prerequisites: []
                },
                {
                    id: 'cloud-models',
                    title: 'Cloud Models Visualizer',
                    type: 'applet',
                    difficulty: 'beginner',
                    duration: '20 min',
                    href: 'houses/cloud/tools/cloud-ch01-cloud-models.tool.html',
                    prerequisites: ['cloud-concepts']
                },
                {
                    id: 'cloud-aws-fundamentals-pres',
                    title: 'AWS Fundamentals',
                    type: 'presentation',
                    difficulty: 'beginner',
                    duration: '30 min',
                    href: 'presentations/cloud-aws-fundamentals.presentation.html',
                    prerequisites: ['cloud-models']
                },
                {
                    id: 'cloud-aws-account',
                    title: 'AWS Account Explorer',
                    type: 'applet',
                    difficulty: 'beginner',
                    duration: '25 min',
                    href: 'houses/cloud/tools/cloud-ch02-aws-account.tool.html',
                    prerequisites: ['cloud-aws-fundamentals-pres']
                },
                {
                    id: 'cloud-aws-regions',
                    title: 'AWS Regions Explorer',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '20 min',
                    href: 'houses/cloud/tools/cloud-ch04-aws-regions.tool.html',
                    prerequisites: ['cloud-aws-account']
                },
                {
                    id: 'cloud-aws-security',
                    title: 'AWS IAM Security',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '35 min',
                    href: 'houses/cloud/tools/cloud-ch05-security.tool.html',
                    prerequisites: ['cloud-aws-regions']
                },
                {
                    id: 'cloud-aws-compute',
                    title: 'AWS Compute Services',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '40 min',
                    href: 'houses/cloud/tools/cloud-ch07-compute-services.tool.html',
                    prerequisites: ['cloud-aws-security']
                },
                {
                    id: 'cloud-aws-storage',
                    title: 'AWS Storage Services',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'houses/cloud/tools/cloud-ch08-storage-services.tool.html',
                    prerequisites: ['cloud-aws-compute']
                },
                {
                    id: 'cloud-azure-fundamentals',
                    title: 'Azure Fundamentals',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'presentations/cloud-azure-fundamentals.presentation.html',
                    prerequisites: ['cloud-aws-storage']
                },
                {
                    id: 'cloud-architecture',
                    title: 'Cloud Architecture Designer',
                    type: 'applet',
                    difficulty: 'advanced',
                    duration: '45 min',
                    href: 'applets/architecture/cloud-architecture-designer.applet.html',
                    prerequisites: ['cloud-azure-fundamentals']
                },
                {
                    id: 'cloud-aws-quiz',
                    title: 'AWS Fundamentals Challenge',
                    type: 'quiz',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'quizzes/cloud-aws-fundamentals.quiz.html',
                    prerequisites: ['cloud-architecture']
                }
            ]
        },

        'cloud-api': {
            name: 'Cloud API Series',
            description: 'API security, design patterns, and cloud platform APIs',
            icon: '/assets/images/icons/icon-globe.webp',
            color: '#06b6d4',
            courseHref: 'houses/cloud/index.html',
            modules: [
                {
                    id: 'cloud-api-002',
                    title: 'Authentication & Authorization',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'houses/cloud/api/cloud-api-002.presentation.html',
                    prerequisites: []
                },
                {
                    id: 'cloud-api-003',
                    title: 'API Design & Documentation',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'houses/cloud/api/cloud-api-003.presentation.html',
                    prerequisites: ['cloud-api-002']
                },
                {
                    id: 'cloud-api-004',
                    title: 'Rate Limiting, Throttling & Resilience',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'houses/cloud/api/cloud-api-004.presentation.html',
                    prerequisites: ['cloud-api-003']
                },
                {
                    id: 'cloud-api-005',
                    title: 'OWASP API Security Top 10',
                    type: 'presentation',
                    difficulty: 'advanced',
                    duration: '35 min',
                    href: 'houses/cloud/api/cloud-api-005.presentation.html',
                    prerequisites: ['cloud-api-004']
                },
                {
                    id: 'cloud-api-006',
                    title: 'Hands-On API Penetration Testing',
                    type: 'lab',
                    difficulty: 'advanced',
                    duration: '45 min',
                    href: 'houses/cloud/api/cloud-api-006.lab.html',
                    prerequisites: ['cloud-api-005']
                },
                {
                    id: 'cloud-api-007',
                    title: 'Cloud APIs: AWS, Azure & GCP Patterns',
                    type: 'presentation',
                    difficulty: 'advanced',
                    duration: '35 min',
                    href: 'houses/cloud/api/cloud-api-007.presentation.html',
                    prerequisites: ['cloud-api-006']
                },
                {
                    id: 'cloud-api-foundations-lab',
                    title: 'API Foundations Lab',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '40 min',
                    href: 'houses/cloud/games/cloud-api-foundations-lab.applet.html',
                    prerequisites: ['cloud-api-007']
                }
            ]
        },

        code: {
            name: 'Code House - DevOps',
            description: 'Master CI/CD and infrastructure as code',
            icon: '/assets/images/icons/icon-laptop.webp',
            color: '#ec4899',
            modules: [
                {
                    id: 'code-git-basics',
                    title: 'Git Basics',
                    type: 'presentation',
                    difficulty: 'beginner',
                    duration: '25 min',
                    href: 'presentations/code-git-basics.presentation.html',
                    prerequisites: []
                },
                {
                    id: 'code-agile',
                    title: 'Agile & SDLC',
                    type: 'presentation',
                    difficulty: 'beginner',
                    duration: '30 min',
                    href: 'presentations/code-agile-sdlc.presentation.html',
                    prerequisites: ['code-git-basics']
                },
                {
                    id: 'code-agile-quiz',
                    title: 'Agile Challenge',
                    type: 'quiz',
                    difficulty: 'beginner',
                    duration: '15 min',
                    href: 'quizzes/code-agile.quiz.html',
                    prerequisites: ['code-agile']
                },
                {
                    id: 'code-cicd-fundamentals',
                    title: 'CI/CD Fundamentals',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '35 min',
                    href: 'presentations/code-cicd-fundamentals.presentation.html',
                    prerequisites: ['code-agile-quiz']
                },
                {
                    id: 'code-pipeline-builder',
                    title: 'Pipeline Builder',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '40 min',
                    href: 'applets/code-pipeline-builder.applet.html',
                    prerequisites: ['code-cicd-fundamentals']
                },
                {
                    id: 'code-docker',
                    title: 'Docker Fundamentals',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '35 min',
                    href: 'presentations/code-docker-fundamentals.presentation.html',
                    prerequisites: ['code-cicd']
                },
                {
                    id: 'code-docker-playground',
                    title: 'Docker Playground',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '45 min',
                    href: 'applets/code-docker-playground.applet.html',
                    prerequisites: ['code-docker']
                },
                {
                    id: 'code-kubernetes',
                    title: 'Kubernetes Fundamentals',
                    type: 'presentation',
                    difficulty: 'advanced',
                    duration: '40 min',
                    href: 'presentations/code-kubernetes-fundamentals.presentation.html',
                    prerequisites: ['code-docker-playground']
                },
                {
                    id: 'code-terraform-fundamentals',
                    title: 'Terraform Fundamentals',
                    type: 'presentation',
                    difficulty: 'advanced',
                    duration: '40 min',
                    href: 'presentations/code-terraform-fundamentals.presentation.html',
                    prerequisites: ['code-kubernetes']
                },
                {
                    id: 'code-terraform',
                    title: 'Terraform Visualizer',
                    type: 'applet',
                    difficulty: 'advanced',
                    duration: '45 min',
                    href: 'houses/code/tools/code-terraform.tool.html',
                    prerequisites: ['code-terraform']
                }
            ]
        },

        'python-engineering': {
            name: 'Python Engineering - Advanced Python',
            description: 'Advanced Python for software engineers with cybersecurity use cases',
            icon: '/assets/images/icons/icon-snake.webp',
            color: '#4ade80',
            courseHref: 'houses/code/modules/python-engineering/index.html',
            modules: [
                {
                    id: 'code-pye-ch01',
                    title: 'The Engineer\'s Toolkit',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '2 hours',
                    href: 'houses/code/modules/python-engineering/code-pye-chapter01.module.html',
                    prerequisites: []
                },
                {
                    id: 'code-pye-ch02',
                    title: 'Advanced Data Structures',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '2 hours 30 min',
                    href: 'houses/code/modules/python-engineering/code-pye-chapter02.module.html',
                    prerequisites: ['code-pye-ch01']
                },
                {
                    id: 'code-pye-ch03',
                    title: 'Decorators & Context Managers',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '2 hours 30 min',
                    href: 'houses/code/modules/python-engineering/code-pye-chapter03.module.html',
                    prerequisites: ['code-pye-ch02']
                },
                {
                    id: 'code-pye-ch04',
                    title: 'Error Handling & Logging',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '2 hours',
                    href: 'houses/code/modules/python-engineering/code-pye-chapter04.module.html',
                    prerequisites: ['code-pye-ch03']
                },
                {
                    id: 'code-pye-ch05',
                    title: 'OOP Design Patterns',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '2 hours 30 min',
                    href: 'houses/code/modules/python-engineering/code-pye-chapter05.module.html',
                    prerequisites: ['code-pye-ch04']
                },
                {
                    id: 'code-pye-midterm',
                    title: 'Midterm: Security Event Processor',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '3 hours',
                    href: 'houses/code/modules/python-engineering/code-pye-midterm.module.html',
                    prerequisites: ['code-pye-ch05']
                },
                {
                    id: 'code-pye-ch06',
                    title: 'Type Hints & Testing',
                    type: 'presentation',
                    difficulty: 'advanced',
                    duration: '2 hours 30 min',
                    href: 'houses/code/modules/python-engineering/code-pye-chapter06.module.html',
                    prerequisites: ['code-pye-midterm']
                },
                {
                    id: 'code-pye-ch07',
                    title: 'APIs & Web Services',
                    type: 'presentation',
                    difficulty: 'advanced',
                    duration: '2 hours 30 min',
                    href: 'houses/code/modules/python-engineering/code-pye-chapter07.module.html',
                    prerequisites: ['code-pye-ch06']
                },
                {
                    id: 'code-pye-ch08',
                    title: 'Database Access',
                    type: 'presentation',
                    difficulty: 'advanced',
                    duration: '2 hours 30 min',
                    href: 'houses/code/modules/python-engineering/code-pye-chapter08.module.html',
                    prerequisites: ['code-pye-ch07']
                },
                {
                    id: 'code-pye-ch09',
                    title: 'Async & Concurrency',
                    type: 'presentation',
                    difficulty: 'advanced',
                    duration: '2 hours 30 min',
                    href: 'houses/code/modules/python-engineering/code-pye-chapter09.module.html',
                    prerequisites: ['code-pye-ch08']
                },
                {
                    id: 'code-pye-ch10',
                    title: 'DevOps Scripting',
                    type: 'presentation',
                    difficulty: 'advanced',
                    duration: '2 hours 30 min',
                    href: 'houses/code/modules/python-engineering/code-pye-chapter10.module.html',
                    prerequisites: ['code-pye-ch09']
                },
                {
                    id: 'code-pye-capstone',
                    title: 'Capstone: Security Operations Toolkit',
                    type: 'lab',
                    difficulty: 'advanced',
                    duration: '4 hours',
                    href: 'houses/code/modules/python-engineering/code-pye-capstone.module.html',
                    prerequisites: ['code-pye-ch10']
                }
            ]
        },

        'python-hub': {
            name: 'Python Hub - Graphics, Stdlib & Projects',
            description: 'Visual programming, standard library mastery, and capstone projects',
            icon: '/assets/images/icons/icon-snake.webp',
            color: '#4ade80',
            courseHref: 'houses/code/modules/python-hub/index.html',
            modules: [
                {
                    id: 'pyh-graphics-01',
                    title: 'Turtle Fundamentals',
                    type: 'presentation',
                    difficulty: 'beginner',
                    duration: '45 min',
                    href: 'houses/code/modules/python-hub/modules/pyh-graphics-01.module.html',
                    prerequisites: []
                },
                {
                    id: 'pyh-graphics-02',
                    title: 'Turtle Patterns & Fractals',
                    type: 'presentation',
                    difficulty: 'beginner',
                    duration: '45 min',
                    href: 'houses/code/modules/python-hub/modules/pyh-graphics-02.module.html',
                    prerequisites: ['pyh-graphics-01']
                },
                {
                    id: 'pyh-graphics-03',
                    title: 'tkinter Basics',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '50 min',
                    href: 'houses/code/modules/python-hub/modules/pyh-graphics-03.module.html',
                    prerequisites: ['pyh-graphics-02']
                },
                {
                    id: 'pyh-graphics-04',
                    title: 'tkinter Canvas & Widgets',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '50 min',
                    href: 'houses/code/modules/python-hub/modules/pyh-graphics-04.module.html',
                    prerequisites: ['pyh-graphics-03']
                },
                {
                    id: 'pyh-graphics-05',
                    title: 'Matplotlib Fundamentals',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '50 min',
                    href: 'houses/code/modules/python-hub/modules/pyh-graphics-05.module.html',
                    prerequisites: ['pyh-graphics-04']
                },
                {
                    id: 'pyh-graphics-06',
                    title: 'Matplotlib Advanced',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '50 min',
                    href: 'houses/code/modules/python-hub/modules/pyh-graphics-06.module.html',
                    prerequisites: ['pyh-graphics-05']
                },
                {
                    id: 'pyh-graphics-07',
                    title: 'Pillow Image Processing',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '50 min',
                    href: 'houses/code/modules/python-hub/modules/pyh-graphics-07.module.html',
                    prerequisites: ['pyh-graphics-06']
                },
                {
                    id: 'pyh-graphics-08',
                    title: 'Pygame Game Development',
                    type: 'presentation',
                    difficulty: 'advanced',
                    duration: '60 min',
                    href: 'houses/code/modules/python-hub/modules/pyh-graphics-08.module.html',
                    prerequisites: ['pyh-graphics-07']
                },
                {
                    id: 'pyh-stdlib-01',
                    title: 'Files, Paths & OS',
                    type: 'presentation',
                    difficulty: 'beginner',
                    duration: '45 min',
                    href: 'houses/code/modules/python-hub/modules/pyh-stdlib-01.module.html',
                    prerequisites: []
                },
                {
                    id: 'pyh-stdlib-02',
                    title: 'Text Processing',
                    type: 'presentation',
                    difficulty: 'beginner',
                    duration: '45 min',
                    href: 'houses/code/modules/python-hub/modules/pyh-stdlib-02.module.html',
                    prerequisites: ['pyh-stdlib-01']
                },
                {
                    id: 'pyh-stdlib-03',
                    title: 'Data Formats',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '45 min',
                    href: 'houses/code/modules/python-hub/modules/pyh-stdlib-03.module.html',
                    prerequisites: ['pyh-stdlib-02']
                },
                {
                    id: 'pyh-stdlib-04',
                    title: 'Collections & Itertools',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '50 min',
                    href: 'houses/code/modules/python-hub/modules/pyh-stdlib-04.module.html',
                    prerequisites: ['pyh-stdlib-03']
                },
                {
                    id: 'pyh-stdlib-05',
                    title: 'Date, Time & Math',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '45 min',
                    href: 'houses/code/modules/python-hub/modules/pyh-stdlib-05.module.html',
                    prerequisites: ['pyh-stdlib-04']
                },
                {
                    id: 'pyh-stdlib-06',
                    title: 'CLI & Arguments',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '45 min',
                    href: 'houses/code/modules/python-hub/modules/pyh-stdlib-06.module.html',
                    prerequisites: ['pyh-stdlib-05']
                },
                {
                    id: 'pyh-stdlib-07',
                    title: 'Subprocess & Automation',
                    type: 'presentation',
                    difficulty: 'advanced',
                    duration: '50 min',
                    href: 'houses/code/modules/python-hub/modules/pyh-stdlib-07.module.html',
                    prerequisites: ['pyh-stdlib-06']
                },
                {
                    id: 'pyh-stdlib-08',
                    title: 'Logging & Debugging',
                    type: 'presentation',
                    difficulty: 'advanced',
                    duration: '50 min',
                    href: 'houses/code/modules/python-hub/modules/pyh-stdlib-08.module.html',
                    prerequisites: ['pyh-stdlib-07']
                },
                {
                    id: 'pyh-project-01',
                    title: 'Project: CLI Toolkit',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '60 min',
                    href: 'houses/code/modules/python-hub/modules/pyh-project-01.module.html',
                    prerequisites: ['pyh-stdlib-08']
                },
                {
                    id: 'pyh-project-02',
                    title: 'Project: Log Analyzer',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '60 min',
                    href: 'houses/code/modules/python-hub/modules/pyh-project-02.module.html',
                    prerequisites: ['pyh-project-01']
                },
                {
                    id: 'pyh-project-03',
                    title: 'Project: Fractal Generator',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '60 min',
                    href: 'houses/code/modules/python-hub/modules/pyh-project-03.module.html',
                    prerequisites: ['pyh-project-02']
                },
                {
                    id: 'pyh-project-04',
                    title: 'Project: Data Dashboard',
                    type: 'lab',
                    difficulty: 'advanced',
                    duration: '90 min',
                    href: 'houses/code/modules/python-hub/modules/pyh-project-04.module.html',
                    prerequisites: ['pyh-project-03']
                },
                {
                    id: 'pyh-project-05',
                    title: 'Project: Image Filter Studio',
                    type: 'lab',
                    difficulty: 'advanced',
                    duration: '90 min',
                    href: 'houses/code/modules/python-hub/modules/pyh-project-05.module.html',
                    prerequisites: ['pyh-project-04']
                },
                {
                    id: 'pyh-project-06',
                    title: 'Project: Snake Game',
                    type: 'lab',
                    difficulty: 'advanced',
                    duration: '90 min',
                    href: 'houses/code/modules/python-hub/modules/pyh-project-06.module.html',
                    prerequisites: ['pyh-project-05']
                }
            ]
        },

        key: {
            name: 'Key House - Cryptography',
            description: 'Unlock the secrets of cryptography',
            icon: '/assets/images/icons/icon-key.webp',
            color: '#eab308',
            modules: [
                {
                    id: 'key-encryption-basics',
                    title: 'Encryption Basics',
                    type: 'presentation',
                    difficulty: 'beginner',
                    duration: '25 min',
                    href: 'presentations/key-encryption-basics.presentation.html',
                    prerequisites: []
                },
                {
                    id: 'key-symmetric-vs-asymmetric',
                    title: 'Symmetric Encryption',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'presentations/key-advanced-symmetric.presentation.html',
                    prerequisites: ['key-encryption-basics']
                },
                {
                    id: 'key-aes-explorer',
                    title: 'AES Explorer',
                    type: 'tool',
                    difficulty: 'intermediate',
                    duration: '35 min',
                    href: 'tools/key-aes.tool.html',
                    prerequisites: ['key-symmetric-vs-asymmetric']
                },
                {
                    id: 'key-elliptic-curve',
                    title: 'Elliptic Curve Cryptography',
                    type: 'presentation',
                    difficulty: 'advanced',
                    duration: '35 min',
                    href: 'presentations/key-elliptic-curve.presentation.html',
                    prerequisites: ['key-aes-explorer']
                },
                {
                    id: 'key-key-derivation',
                    title: 'Key Derivation Functions',
                    type: 'presentation',
                    difficulty: 'advanced',
                    duration: '30 min',
                    href: 'presentations/key-derivation.presentation.html',
                    prerequisites: ['key-elliptic-curve']
                },
                {
                    id: 'key-message-auth',
                    title: 'Message Authentication',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'presentations/key-message-authentication.presentation.html',
                    prerequisites: ['key-key-derivation']
                },
                {
                    id: 'key-pki-deep-dive',
                    title: 'Digital Certificates',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'presentations/key-certificates.presentation.html',
                    prerequisites: ['key-message-auth']
                },
                {
                    id: 'key-post-quantum',
                    title: 'Post-Quantum Cryptography',
                    type: 'presentation',
                    difficulty: 'advanced',
                    duration: '35 min',
                    href: 'presentations/key-post-quantum.presentation.html',
                    prerequisites: ['key-pki-deep-dive']
                }
            ]
        },

        eye: {
            name: 'Eye House - Monitoring & Detection',
            description: 'Master security monitoring and SOC operations',
            icon: '/assets/images/icons/icon-detective.webp',
            color: '#6366f1',
            modules: [
                {
                    id: 'eye-log-analysis',
                    title: 'Log Analysis Basics',
                    type: 'presentation',
                    difficulty: 'beginner',
                    duration: '25 min',
                    href: 'presentations/eye-log-basics.presentation.html',
                    prerequisites: []
                },
                {
                    id: 'eye-soc-operations',
                    title: 'SOC Operations',
                    type: 'presentation',
                    difficulty: 'beginner',
                    duration: '30 min',
                    href: 'presentations/eye-soc-operations.presentation.html',
                    prerequisites: ['eye-log-analysis']
                },
                {
                    id: 'eye-soc-simulator',
                    title: 'SOC Simulator',
                    type: 'tool',
                    difficulty: 'intermediate',
                    duration: '45 min',
                    href: 'tools/eye-soc.tool.html',
                    prerequisites: ['eye-soc-operations']
                },
                {
                    id: 'eye-siem-intro',
                    title: 'SIEM Fundamentals',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '35 min',
                    href: 'presentations/eye-siem-fundamentals.presentation.html',
                    prerequisites: ['eye-soc-simulator']
                },
                {
                    id: 'eye-log-correlation',
                    title: 'Log Correlation',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'presentations/eye-log-correlation.presentation.html',
                    prerequisites: ['eye-siem-intro']
                },
                {
                    id: 'eye-correlation-engine',
                    title: 'Correlation Engine',
                    type: 'tool',
                    difficulty: 'advanced',
                    duration: '40 min',
                    href: 'tools/eye-correlation.tool.html',
                    prerequisites: ['eye-log-correlation']
                },
                {
                    id: 'eye-threat-hunting',
                    title: 'Threat Hunting',
                    type: 'presentation',
                    difficulty: 'advanced',
                    duration: '35 min',
                    href: 'presentations/eye-threat-hunting.presentation.html',
                    prerequisites: ['eye-correlation-engine']
                },
                {
                    id: 'eye-hunt-workbench',
                    title: 'Hunt Workbench',
                    type: 'tool',
                    difficulty: 'advanced',
                    duration: '50 min',
                    href: 'tools/eye-hunt.tool.html',
                    prerequisites: ['eye-threat-hunting']
                },
                {
                    id: 'eye-network-traffic',
                    title: 'Network Traffic Analysis',
                    type: 'presentation',
                    difficulty: 'advanced',
                    duration: '40 min',
                    href: 'presentations/eye-network-traffic-analysis.presentation.html',
                    prerequisites: ['eye-hunt-workbench']
                },
                {
                    id: 'eye-detection-engineering',
                    title: 'Detection Engineering',
                    type: 'applet',
                    difficulty: 'advanced',
                    duration: '30 min',
                    href: 'games/eye-detection-engineering.applet.html',
                    prerequisites: []
                },
                {
                    id: 'eye-log-analysis-lab',
                    title: 'Log Analysis Lab',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'games/eye-log-analysis-lab.applet.html',
                    prerequisites: []
                },
                {
                    id: 'eye-security-onion-soc',
                    title: 'Security Onion SOC',
                    type: 'applet',
                    difficulty: 'advanced',
                    duration: '35 min',
                    href: 'games/eye-security-onion-soc.applet.html',
                    prerequisites: []
                },
                {
                    id: 'eye-threat-hunting-lab',
                    title: 'Threat Hunting Lab',
                    type: 'lab',
                    difficulty: 'advanced',
                    duration: '30 min',
                    href: 'games/eye-threat-hunting-lab.applet.html',
                    prerequisites: []
                }
            ]
        },

        // DevOps Fundamentals Path (accessible from Script House)
        'python-fundamentals': {
            name: 'Python Programming',
            description: 'Python fundamentals — strings, flow control, functions, GUI, dictionaries, OOP',
            icon: '/assets/images/icons/icon-snake.webp',
            color: '#3b82f6',
            courseHref: 'houses/script/modules/python/index.html',
            modules: [
                {
                    id: 'python-ch1-presentation',
                    title: 'Chapter 1: The First Bit',
                    type: 'presentation',
                    difficulty: 'beginner',
                    duration: '30 min',
                    href: 'houses/script/presentations/python/script-python-chapter1.presentation.html',
                    prerequisites: []
                },
                {
                    id: 'script-python-immersive-chapter1',
                    title: 'Chapter 1: Immersive Lab',
                    type: 'lab',
                    difficulty: 'beginner',
                    duration: '45 min',
                    href: 'houses/script/modules/python/script-python-immersive-chapter1.module.html',
                    prerequisites: ['python-ch1-presentation']
                },
                {
                    id: 'python-ch2-presentation',
                    title: 'Chapter 2: Strings & Input',
                    type: 'presentation',
                    difficulty: 'beginner',
                    duration: '30 min',
                    href: 'houses/script/presentations/python/script-python-chapter2.presentation.html',
                    prerequisites: ['script-python-immersive-chapter1']
                },
                {
                    id: 'script-python-immersive-chapter2',
                    title: 'Chapter 2: Immersive Lab',
                    type: 'lab',
                    difficulty: 'beginner',
                    duration: '45 min',
                    href: 'houses/script/modules/python/script-python-immersive-chapter2.module.html',
                    prerequisites: ['python-ch2-presentation']
                },
                {
                    id: 'python-ch3-presentation',
                    title: 'Chapter 3: Flow Control',
                    type: 'presentation',
                    difficulty: 'beginner',
                    duration: '35 min',
                    href: 'houses/script/presentations/python/script-python-chapter3.presentation.html',
                    prerequisites: ['script-python-immersive-chapter2']
                },
                {
                    id: 'script-python-immersive-chapter3',
                    title: 'Chapter 3: Immersive Lab',
                    type: 'lab',
                    difficulty: 'beginner',
                    duration: '45 min',
                    href: 'houses/script/modules/python/script-python-immersive-chapter3.module.html',
                    prerequisites: ['python-ch3-presentation']
                },
                {
                    id: 'python-ch4-presentation',
                    title: 'Chapter 4: Functions',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '35 min',
                    href: 'houses/script/presentations/python/script-python-chapter4.presentation.html',
                    prerequisites: ['script-python-immersive-chapter3']
                },
                {
                    id: 'script-python-immersive-chapter4',
                    title: 'Chapter 4: Immersive Lab',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '45 min',
                    href: 'houses/script/modules/python/script-python-immersive-chapter4.module.html',
                    prerequisites: ['python-ch4-presentation']
                },
                {
                    id: 'python-ch5-presentation',
                    title: 'Chapter 5: Collections',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '35 min',
                    href: 'houses/script/presentations/python/script-python-chapter5.presentation.html',
                    prerequisites: ['script-python-immersive-chapter4']
                },
                {
                    id: 'script-python-immersive-chapter5',
                    title: 'Chapter 5: Immersive Lab',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '45 min',
                    href: 'houses/script/modules/python/script-python-immersive-chapter5.module.html',
                    prerequisites: ['python-ch5-presentation']
                },
                {
                    id: 'python-ch6-presentation',
                    title: 'Chapter 6: Dictionaries',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '35 min',
                    href: 'houses/script/presentations/python/script-python-chapter6.presentation.html',
                    prerequisites: ['script-python-immersive-chapter5']
                },
                {
                    id: 'script-python-immersive-chapter6',
                    title: 'Chapter 6: Immersive Lab',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '45 min',
                    href: 'houses/script/modules/python/script-python-immersive-chapter6.module.html',
                    prerequisites: ['python-ch6-presentation']
                },
                {
                    id: 'python-ch7-presentation',
                    title: 'Chapter 7: File Handling',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '35 min',
                    href: 'houses/script/presentations/python/script-python-chapter7.presentation.html',
                    prerequisites: ['script-python-immersive-chapter6']
                },
                {
                    id: 'script-python-immersive-chapter7',
                    title: 'Chapter 7: Immersive Lab',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '45 min',
                    href: 'houses/script/modules/python/script-python-immersive-chapter7.module.html',
                    prerequisites: ['python-ch7-presentation']
                },
                {
                    id: 'python-ch8-presentation',
                    title: 'Chapter 8: Object-Oriented Programming',
                    type: 'presentation',
                    difficulty: 'advanced',
                    duration: '40 min',
                    href: 'houses/script/presentations/python/script-python-chapter8.presentation.html',
                    prerequisites: ['script-python-immersive-chapter7']
                },
                {
                    id: 'script-python-immersive-chapter8',
                    title: 'Chapter 8: Immersive Lab',
                    type: 'lab',
                    difficulty: 'advanced',
                    duration: '45 min',
                    href: 'houses/script/modules/python/script-python-immersive-chapter8.module.html',
                    prerequisites: ['python-ch8-presentation']
                }
            ]
        },

        'devops-fundamentals': {
            name: 'DevOps Fundamentals',
            description: 'Master CI/CD, containerization, and infrastructure as code',
            icon: '/assets/images/icons/icon-gear.webp',
            color: '#8b5cf6',
            courseHref: 'houses/devops-fundamentals/index.html',
            modules: [
                {
                    id: 'code-git-basics',
                    title: 'Git Basics',
                    type: 'presentation',
                    difficulty: 'beginner',
                    duration: '25 min',
                    href: 'houses/code/presentations/code-git-basics.presentation.html',
                    prerequisites: []
                },
                {
                    id: 'code-agile-sdlc',
                    title: 'Agile & SDLC',
                    type: 'presentation',
                    difficulty: 'beginner',
                    duration: '30 min',
                    href: 'houses/code/presentations/code-agile-sdlc.presentation.html',
                    prerequisites: ['code-git-basics']
                },
                {
                    id: 'code-cicd-fundamentals',
                    title: 'CI/CD Fundamentals',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '35 min',
                    href: 'houses/code/presentations/code-cicd-fundamentals.presentation.html',
                    prerequisites: ['code-agile-sdlc']
                },
                {
                    id: 'code-cicd',
                    title: 'Pipeline Builder',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '40 min',
                    href: 'houses/code/applets/code-pipeline-builder.applet.html',
                    prerequisites: ['code-cicd-fundamentals']
                },
                {
                    id: 'code-docker-basics',
                    title: 'Docker Fundamentals',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '35 min',
                    href: 'houses/code/presentations/code-docker-fundamentals.presentation.html',
                    prerequisites: ['code-cicd']
                },
                {
                    id: 'code-docker',
                    title: 'Docker Playground',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '45 min',
                    href: 'houses/code/applets/code-docker-playground.applet.html',
                    prerequisites: ['code-docker-basics']
                },
                {
                    id: 'code-kubernetes-fundamentals',
                    title: 'Kubernetes Fundamentals',
                    type: 'presentation',
                    difficulty: 'advanced',
                    duration: '40 min',
                    href: 'houses/code/presentations/code-kubernetes-fundamentals.presentation.html',
                    prerequisites: ['code-docker']
                },
                {
                    id: 'code-terraform-fundamentals',
                    title: 'Terraform Fundamentals',
                    type: 'presentation',
                    difficulty: 'advanced',
                    duration: '40 min',
                    href: 'houses/code/presentations/code-terraform-fundamentals.presentation.html',
                    prerequisites: ['code-kubernetes-fundamentals']
                },
                {
                    id: 'code-terraform',
                    title: 'Terraform Visualizer',
                    type: 'applet',
                    difficulty: 'advanced',
                    duration: '45 min',
                    href: 'houses/code/tools/code-terraform.tool.html',
                    prerequisites: ['code-terraform-fundamentals']
                }
            ]
        },

        // Linux Mastery - Skills-First Learning Path
        'linux-mastery': {
            name: 'Linux Mastery',
            description: 'Master Linux from the ground up - pure skills, no pressure',
            icon: '/assets/images/icons/icon-penguin.webp',
            color: '#22c55e',
            modules: [
                // Section 1: Getting Started
                {
                    id: 'script-lm-01-welcome',
                    title: 'Welcome to Linux',
                    type: 'presentation',
                    difficulty: 'beginner',
                    duration: '15 min',
                    href: 'houses/script/modules/linux-mastery/script-lm-01-welcome.module.html',
                    prerequisites: []
                },
                {
                    id: 'script-lm-02-first-commands',
                    title: 'Your First Commands',
                    type: 'lab',
                    difficulty: 'beginner',
                    duration: '20 min',
                    href: 'houses/script/modules/linux-mastery/script-lm-02-first-commands.module.html',
                    prerequisites: ['script-lm-01-welcome']
                },
                {
                    id: 'script-lm-03-getting-help',
                    title: 'Getting Help',
                    type: 'lab',
                    difficulty: 'beginner',
                    duration: '15 min',
                    href: 'houses/script/modules/linux-mastery/script-lm-03-getting-help.module.html',
                    prerequisites: ['script-lm-02-first-commands']
                },
                {
                    id: 'script-lm-04-terminal-environment',
                    title: 'The Terminal Environment',
                    type: 'presentation',
                    difficulty: 'beginner',
                    duration: '15 min',
                    href: 'houses/script/modules/linux-mastery/script-lm-04-terminal-environment.module.html',
                    prerequisites: ['script-lm-03-getting-help']
                },
                {
                    id: 'script-lm-05-section1-practice',
                    title: 'Section 1 Practice',
                    type: 'lab',
                    difficulty: 'beginner',
                    duration: '25 min',
                    href: 'houses/script/modules/linux-mastery/script-lm-05-section1-practice.module.html',
                    prerequisites: ['script-lm-04-terminal-environment']
                },
                // Section 2: Navigation & Files
                {
                    id: 'script-lm-06-navigation',
                    title: 'Directory Navigation',
                    type: 'lab',
                    difficulty: 'beginner',
                    duration: '20 min',
                    href: 'houses/script/modules/linux-mastery/script-lm-06-navigation.module.html',
                    prerequisites: ['script-lm-05-section1-practice']
                },
                {
                    id: 'script-lm-07-listing-files',
                    title: 'Listing Files',
                    type: 'lab',
                    difficulty: 'beginner',
                    duration: '20 min',
                    href: 'houses/script/modules/linux-mastery/script-lm-07-listing-files.module.html',
                    prerequisites: ['script-lm-06-navigation']
                },
                {
                    id: 'script-lm-08-file-operations',
                    title: 'File Operations',
                    type: 'lab',
                    difficulty: 'beginner',
                    duration: '25 min',
                    href: 'houses/script/modules/linux-mastery/script-lm-08-file-operations.module.html',
                    prerequisites: ['script-lm-07-listing-files']
                },
                {
                    id: 'script-lm-09-copy-move',
                    title: 'Copy and Move',
                    type: 'lab',
                    difficulty: 'beginner',
                    duration: '20 min',
                    href: 'houses/script/modules/linux-mastery/script-lm-09-copy-move.module.html',
                    prerequisites: ['script-lm-08-file-operations']
                },
                {
                    id: 'script-lm-10-viewing-files',
                    title: 'Viewing Files',
                    type: 'lab',
                    difficulty: 'beginner',
                    duration: '20 min',
                    href: 'houses/script/modules/linux-mastery/script-lm-10-viewing-files.module.html',
                    prerequisites: ['script-lm-09-copy-move']
                },
                {
                    id: 'script-lm-11-finding-files',
                    title: 'Finding Files',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'houses/script/modules/linux-mastery/script-lm-11-finding-files.module.html',
                    prerequisites: ['script-lm-10-viewing-files']
                },
                {
                    id: 'script-lm-12-section2-practice',
                    title: 'Section 2 Practice',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'houses/script/modules/linux-mastery/script-lm-12-section2-practice.module.html',
                    prerequisites: ['script-lm-11-finding-files']
                },
                // Section 3: Text Processing
                {
                    id: 'script-lm-13-grep-basics',
                    title: 'grep Basics',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'houses/script/modules/linux-mastery/script-lm-13-grep-basics.module.html',
                    prerequisites: ['script-lm-12-section2-practice']
                },
                {
                    id: 'script-lm-14-regular-expressions',
                    title: 'Regular Expressions',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'houses/script/modules/linux-mastery/script-lm-14-regular-expressions.module.html',
                    prerequisites: ['script-lm-13-grep-basics']
                },
                {
                    id: 'script-lm-15-sed-editor',
                    title: 'sed Stream Editor',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'houses/script/modules/linux-mastery/script-lm-15-sed-editor.module.html',
                    prerequisites: ['script-lm-14-regular-expressions']
                },
                {
                    id: 'script-lm-16-awk-processing',
                    title: 'awk Processing',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'houses/script/modules/linux-mastery/script-lm-16-awk-processing.module.html',
                    prerequisites: ['script-lm-15-sed-editor']
                },
                {
                    id: 'script-lm-17-sort-uniq',
                    title: 'sort and uniq',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '20 min',
                    href: 'houses/script/modules/linux-mastery/script-lm-17-sort-uniq.module.html',
                    prerequisites: ['script-lm-16-awk-processing']
                },
                {
                    id: 'script-lm-18-cut-paste',
                    title: 'cut and paste',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '20 min',
                    href: 'houses/script/modules/linux-mastery/script-lm-18-cut-paste.module.html',
                    prerequisites: ['script-lm-17-sort-uniq']
                },
                {
                    id: 'script-lm-19-text-pipelines',
                    title: 'Text Pipelines',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'houses/script/modules/linux-mastery/script-lm-19-text-pipelines.module.html',
                    prerequisites: ['script-lm-18-cut-paste']
                },
                {
                    id: 'script-lm-20-section3-practice',
                    title: 'Section 3 Practice',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '35 min',
                    href: 'houses/script/modules/linux-mastery/script-lm-20-section3-practice.module.html',
                    prerequisites: ['script-lm-19-text-pipelines']
                },
                // Section 4: Permissions & Users
                {
                    id: 'script-lm-21-users-groups',
                    title: 'Users and Groups',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '20 min',
                    href: 'houses/script/modules/linux-mastery/script-lm-21-users-groups.module.html',
                    prerequisites: ['script-lm-20-section3-practice']
                },
                {
                    id: 'script-lm-22-file-permissions',
                    title: 'File Permissions',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'houses/script/modules/linux-mastery/script-lm-22-file-permissions.module.html',
                    prerequisites: ['script-lm-21-users-groups']
                },
                {
                    id: 'script-lm-23-chmod',
                    title: 'chmod',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'houses/script/modules/linux-mastery/script-lm-23-chmod.module.html',
                    prerequisites: ['script-lm-22-file-permissions']
                },
                {
                    id: 'script-lm-24-chown',
                    title: 'chown',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '20 min',
                    href: 'houses/script/modules/linux-mastery/script-lm-24-chown.module.html',
                    prerequisites: ['script-lm-23-chmod']
                },
                {
                    id: 'script-lm-25-sudo',
                    title: 'sudo',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '20 min',
                    href: 'houses/script/modules/linux-mastery/script-lm-25-sudo.module.html',
                    prerequisites: ['script-lm-24-chown']
                },
                {
                    id: 'script-lm-26-special-permissions',
                    title: 'Special Permissions',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'houses/script/modules/linux-mastery/script-lm-26-special-permissions.module.html',
                    prerequisites: ['script-lm-25-sudo']
                },
                {
                    id: 'script-lm-27-section4-practice',
                    title: 'Section 4 Practice',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '35 min',
                    href: 'houses/script/modules/linux-mastery/script-lm-27-section4-practice.module.html',
                    prerequisites: ['script-lm-26-special-permissions']
                },
                // Section 5: Processes
                {
                    id: 'script-lm-28-process-basics',
                    title: 'Process Basics',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'houses/script/modules/linux-mastery/script-lm-28-process-basics.module.html',
                    prerequisites: ['script-lm-27-section4-practice']
                },
                {
                    id: 'script-lm-29-ps-top',
                    title: 'ps and top',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'houses/script/modules/linux-mastery/script-lm-29-ps-top.module.html',
                    prerequisites: ['script-lm-28-process-basics']
                },
                {
                    id: 'script-lm-30-background-jobs',
                    title: 'Background Jobs',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'houses/script/modules/linux-mastery/script-lm-30-background-jobs.module.html',
                    prerequisites: ['script-lm-29-ps-top']
                },
                {
                    id: 'script-lm-31-signals-kill',
                    title: 'Signals and kill',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '20 min',
                    href: 'houses/script/modules/linux-mastery/script-lm-31-signals-kill.module.html',
                    prerequisites: ['script-lm-30-background-jobs']
                },
                {
                    id: 'script-lm-32-cron',
                    title: 'cron',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'houses/script/modules/linux-mastery/script-lm-32-cron.module.html',
                    prerequisites: ['script-lm-31-signals-kill']
                },
                {
                    id: 'script-lm-33-systemd',
                    title: 'systemd',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'houses/script/modules/linux-mastery/script-lm-33-systemd.module.html',
                    prerequisites: ['script-lm-32-cron']
                },
                {
                    id: 'script-lm-34-section5-practice',
                    title: 'Section 5 Practice',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '35 min',
                    href: 'houses/script/modules/linux-mastery/script-lm-34-section5-practice.module.html',
                    prerequisites: ['script-lm-33-systemd']
                },
                // Section 6: Networking Basics
                {
                    id: 'script-lm-35-network-info',
                    title: 'Network Info',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '20 min',
                    href: 'houses/script/modules/linux-mastery/script-lm-35-network-info.module.html',
                    prerequisites: ['script-lm-34-section5-practice']
                },
                {
                    id: 'script-lm-36-connectivity',
                    title: 'Connectivity',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '20 min',
                    href: 'houses/script/modules/linux-mastery/script-lm-36-connectivity.module.html',
                    prerequisites: ['script-lm-35-network-info']
                },
                {
                    id: 'script-lm-37-dns-tools',
                    title: 'DNS Tools',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '20 min',
                    href: 'houses/script/modules/linux-mastery/script-lm-37-dns-tools.module.html',
                    prerequisites: ['script-lm-36-connectivity']
                },
                {
                    id: 'script-lm-38-downloading',
                    title: 'Downloading',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '20 min',
                    href: 'houses/script/modules/linux-mastery/script-lm-38-downloading.module.html',
                    prerequisites: ['script-lm-37-dns-tools']
                },
                {
                    id: 'script-lm-39-ssh-basics',
                    title: 'SSH Basics',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'houses/script/modules/linux-mastery/script-lm-39-ssh-basics.module.html',
                    prerequisites: ['script-lm-38-downloading']
                },
                {
                    id: 'script-lm-40-section6-practice',
                    title: 'Section 6 Practice',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'houses/script/modules/linux-mastery/script-lm-40-section6-practice.module.html',
                    prerequisites: ['script-lm-39-ssh-basics']
                },
                // Section 7: Shell Scripting
                {
                    id: 'script-lm-41-first-script',
                    title: 'First Script',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '20 min',
                    href: 'houses/script/modules/linux-mastery/script-lm-41-first-script.module.html',
                    prerequisites: ['script-lm-40-section6-practice']
                },
                {
                    id: 'script-lm-42-variables',
                    title: 'Variables',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'houses/script/modules/linux-mastery/script-lm-42-variables.module.html',
                    prerequisites: ['script-lm-41-first-script']
                },
                {
                    id: 'script-lm-43-user-input',
                    title: 'User Input',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '20 min',
                    href: 'houses/script/modules/linux-mastery/script-lm-43-user-input.module.html',
                    prerequisites: ['script-lm-42-variables']
                },
                {
                    id: 'script-lm-44-conditionals',
                    title: 'Conditionals',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'houses/script/modules/linux-mastery/script-lm-44-conditionals.module.html',
                    prerequisites: ['script-lm-43-user-input']
                },
                {
                    id: 'script-lm-45-loops',
                    title: 'Loops',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'houses/script/modules/linux-mastery/script-lm-45-loops.module.html',
                    prerequisites: ['script-lm-44-conditionals']
                },
                {
                    id: 'script-lm-46-functions',
                    title: 'Functions',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'houses/script/modules/linux-mastery/script-lm-46-functions.module.html',
                    prerequisites: ['script-lm-45-loops']
                },
                {
                    id: 'script-lm-47-practical-scripts',
                    title: 'Practical Scripts',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'houses/script/modules/linux-mastery/script-lm-47-practical-scripts.module.html',
                    prerequisites: ['script-lm-46-functions']
                },
                {
                    id: 'script-lm-48-section7-practice',
                    title: 'Section 7 Practice',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '35 min',
                    href: 'houses/script/modules/linux-mastery/script-lm-48-section7-practice.module.html',
                    prerequisites: ['script-lm-47-practical-scripts']
                },
                // Section 8: Beyond Basics
                {
                    id: 'script-lm-49-links',
                    title: 'Links',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '20 min',
                    href: 'houses/script/modules/linux-mastery/script-lm-49-links.module.html',
                    prerequisites: ['script-lm-48-section7-practice']
                },
                {
                    id: 'script-lm-50-text-editors',
                    title: 'Text Editors',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'houses/script/modules/linux-mastery/script-lm-50-text-editors.module.html',
                    prerequisites: ['script-lm-49-links']
                },
                {
                    id: 'script-lm-51-package-management',
                    title: 'Package Management',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'houses/script/modules/linux-mastery/script-lm-51-package-management.module.html',
                    prerequisites: ['script-lm-50-text-editors']
                },
                {
                    id: 'script-lm-52-environment-path',
                    title: 'Environment & PATH',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '20 min',
                    href: 'houses/script/modules/linux-mastery/script-lm-52-environment-path.module.html',
                    prerequisites: ['script-lm-51-package-management']
                },
                {
                    id: 'script-lm-53-next-steps',
                    title: 'Next Steps',
                    type: 'presentation',
                    difficulty: 'beginner',
                    duration: '15 min',
                    href: 'houses/script/modules/linux-mastery/script-lm-53-next-steps.module.html',
                    prerequisites: ['script-lm-52-environment-path']
                }
            ]
        },

        // CompTIA Linux+ XK0-005 Certification Path
        'comptia-linux': {
            name: 'CompTIA Linux+ (XK0-005)',
            description: 'Complete Linux administration certification prep covering system management, security, scripting, and troubleshooting',
            icon: '/assets/images/icons/icon-penguin.webp',
            color: '#22c55e',
            courseHref: 'houses/matrix/adv-linux/index.html',
            modules: [
                // Section 1: Linux Fundamentals
                {
                    id: 'script-ubuntu-components',
                    title: 'Section 1: Linux System Overview',
                    type: 'applet',
                    difficulty: 'beginner',
                    duration: '25 min',
                    href: 'houses/script/applets/linux/script-ubuntu-components.applet.html',
                    prerequisites: []
                },
                {
                    id: 'script-linux-quiz',
                    title: 'Section 1 Quiz: Linux Fundamentals',
                    type: 'quiz',
                    difficulty: 'beginner',
                    duration: '15 min',
                    href: 'houses/script/quizzes/script-linux-basics.quiz.html',
                    prerequisites: ['script-ubuntu-components']
                },
                // Section 2: Command Line Essentials
                {
                    id: 'script-linux-basics',
                    title: 'Section 2: Command Line Essentials',
                    type: 'applet',
                    difficulty: 'beginner',
                    duration: '30 min',
                    href: 'houses/script/tools/script-linux-command.tool.html',
                    prerequisites: ['script-linux-quiz']
                },
                {
                    id: 'script-linux-quiz-s2',
                    title: 'Section 2 Quiz: CLI Commands',
                    type: 'quiz',
                    difficulty: 'beginner',
                    duration: '15 min',
                    href: 'houses/script/quizzes/script-linux-basics.quiz.html',
                    prerequisites: ['script-linux-basics']
                },
                // Section 3: File System Navigation
                {
                    id: 'script-linux-filesystem',
                    title: 'Section 3: File System Navigation',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'houses/script/applets/linux/script-linux-filesystem-navigator.applet.html',
                    prerequisites: ['script-linux-quiz-s2']
                },
                {
                    id: 'script-linux-lab-002',
                    title: 'Section 3 Lab: File Navigation',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '20 min',
                    href: 'houses/script/applets/linux/script-linux-lab-002-file-navigation.applet.html',
                    prerequisites: ['script-linux-filesystem']
                },
                // Section 4: Permissions & Security
                {
                    id: 'script-linux-permissions',
                    title: 'Section 4: Linux Permissions',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'houses/script/tools/script-linux-permissions.tool.html',
                    prerequisites: ['script-linux-lab-002']
                },
                {
                    id: 'script-linux-lab-001',
                    title: 'Section 4 Lab: User Identity',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'houses/script/applets/linux/script-linux-lab-001-user-identity.applet.html',
                    prerequisites: ['script-linux-permissions']
                },
                // Section 5: Scripting & Automation
                {
                    id: 'script-bash-scripting',
                    title: 'Section 5: Bash Scripting',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '45 min',
                    href: 'houses/script/applets/linux/script-bash-scripting-playground.applet.html',
                    prerequisites: ['script-linux-lab-001']
                },
                {
                    id: 'script-linux-bash-quiz',
                    title: 'Section 5 Quiz: Bash Scripting',
                    type: 'quiz',
                    difficulty: 'intermediate',
                    duration: '20 min',
                    href: 'houses/script/quizzes/script-linux-bash.quiz.html',
                    prerequisites: ['script-bash-scripting']
                },
                // Section 6: Cross-Platform
                {
                    id: 'script-macos-linux-lab',
                    title: 'Section 6: macOS & Linux',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'houses/script/applets/linux/script-lab-macos-linux.applet.html',
                    prerequisites: ['script-linux-bash-quiz']
                }
            ]
        },

        // CompTIA A+ Core 1 (220-1101) — Forge House
        'aplus-core1': {
            name: 'CompTIA A+ Core 1 (220-1101)',
            description: 'Hardware, networking, mobile devices, virtualization, and troubleshooting',
            icon: '/assets/images/icons/icon-wrench.webp',
            color: '#f97316',
            courseHref: 'houses/forge/applets/comptia-aplus/core-1/index.html',
            modules: [
                {
                    id: 'forge-aplus-core1-ch01',
                    title: 'Motherboards',
                    type: 'applet',
                    href: 'houses/forge/applets/comptia-aplus/core-1/chapters/ch01-motherboards/index.html'
                },
                {
                    id: 'forge-aplus-core1-ch02',
                    title: 'Expansion Cards & Storage',
                    type: 'applet',
                    href: 'houses/forge/applets/comptia-aplus/core-1/chapters/ch02-expansion-storage/index.html'
                },
                {
                    id: 'forge-aplus-core1-ch03',
                    title: 'Peripherals & Connectors',
                    type: 'applet',
                    href: 'houses/forge/applets/comptia-aplus/core-1/chapters/ch03-peripherals/index.html'
                },
                {
                    id: 'forge-aplus-core1-ch04',
                    title: 'Printers & Multifunction Devices',
                    type: 'applet',
                    href: 'houses/forge/applets/comptia-aplus/core-1/chapters/ch04-printers/index.html'
                },
                {
                    id: 'forge-aplus-core1-ch05',
                    title: 'Networking Fundamentals',
                    type: 'applet',
                    href: 'houses/forge/applets/comptia-aplus/core-1/chapters/ch05-networking/index.html'
                },
                {
                    id: 'forge-aplus-core1-ch06',
                    title: 'TCP/IP & Network Services',
                    type: 'applet',
                    href: 'houses/forge/applets/comptia-aplus/core-1/chapters/ch06-tcpip/index.html'
                },
                {
                    id: 'forge-aplus-core1-ch07',
                    title: 'Wireless Networking',
                    type: 'applet',
                    href: 'houses/forge/applets/comptia-aplus/core-1/chapters/ch07-wireless/index.html'
                },
                {
                    id: 'forge-aplus-core1-ch08',
                    title: 'Cloud & Virtualization',
                    type: 'applet',
                    href: 'houses/forge/applets/comptia-aplus/core-1/chapters/ch08-cloud/index.html'
                },
                {
                    id: 'forge-aplus-core1-ch09',
                    title: 'Laptops & Mobile Devices',
                    type: 'applet',
                    href: 'houses/forge/applets/comptia-aplus/core-1/chapters/ch09-laptops/index.html'
                },
                {
                    id: 'forge-aplus-core1-ch10',
                    title: 'Mobile Device Configuration',
                    type: 'applet',
                    href: 'houses/forge/applets/comptia-aplus/core-1/chapters/ch10-mobile/index.html'
                },
                {
                    id: 'forge-aplus-core1-ch11',
                    title: 'Troubleshooting Methodology',
                    type: 'applet',
                    href: 'houses/forge/applets/comptia-aplus/core-1/chapters/ch11-troubleshooting/index.html'
                },
                {
                    id: 'forge-aplus-core1-ch12',
                    title: 'Hardware & Network Troubleshooting',
                    type: 'applet',
                    href: 'houses/forge/applets/comptia-aplus/core-1/chapters/ch12-hw-network-troubleshooting/index.html'
                },
                {
                    id: 'forge-aplus-core1-prep-round-2',
                    title: 'A+ Core 1 Prep — Round 2',
                    type: 'quiz',
                    href: 'houses/forge/applets/comptia-aplus/core-1/quizzes/forge-aplus-core1-prep-round-2.quiz.html',
                    prerequisites: ['forge-aplus-core1-ch12']
                },
                {
                    id: 'forge-aplus-core1-prep-round-3',
                    title: 'A+ Core 1 Prep — Round 3',
                    type: 'quiz',
                    href: 'houses/forge/applets/comptia-aplus/core-1/quizzes/forge-aplus-core1-prep-round-3.quiz.html',
                    prerequisites: ['forge-aplus-core1-prep-round-2']
                },
                {
                    id: 'forge-aplus-core1-prep-round-4',
                    title: 'A+ Core 1 Prep — Round 4',
                    type: 'quiz',
                    href: 'houses/forge/applets/comptia-aplus/core-1/quizzes/forge-aplus-core1-prep-round-4.quiz.html',
                    prerequisites: ['forge-aplus-core1-prep-round-3']
                }
            ]
        },

        // CompTIA A+ Core 2 (220-1102) — Forge House
        'aplus-core2': {
            name: 'CompTIA A+ Core 2 (220-1102)',
            description: 'Operating systems, security, software troubleshooting, and operational procedures',
            icon: '/assets/images/icons/icon-desktop.webp',
            color: '#ea580c',
            courseHref: 'houses/forge/applets/comptia-aplus/core-2/index.html',
            modules: [
                {
                    id: 'forge-aplus-core2-ch13',
                    title: 'Windows Editions & Features',
                    type: 'applet',
                    href: 'houses/forge/applets/comptia-aplus/core-2/chapters/ch13-windows-editions/index.html'
                },
                {
                    id: 'forge-aplus-core2-ch14',
                    title: 'Windows Settings & Configuration',
                    type: 'applet',
                    href: 'houses/forge/applets/comptia-aplus/core-2/chapters/ch14-windows-settings/index.html'
                },
                {
                    id: 'forge-aplus-core2-ch15',
                    title: 'Administrative Tools',
                    type: 'applet',
                    href: 'houses/forge/applets/comptia-aplus/core-2/chapters/ch15-admin-tools/index.html'
                },
                {
                    id: 'forge-aplus-core2-ch16',
                    title: 'System Utilities',
                    type: 'applet',
                    href: 'houses/forge/applets/comptia-aplus/core-2/chapters/ch16-system-tools/index.html'
                },
                {
                    id: 'forge-aplus-core2-ch17',
                    title: 'macOS & Linux Basics',
                    type: 'applet',
                    href: 'houses/forge/applets/comptia-aplus/core-2/chapters/ch17-macos-linux/index.html'
                },
                {
                    id: 'forge-aplus-core2-ch18',
                    title: 'Users, Groups & Permissions',
                    type: 'applet',
                    href: 'houses/forge/applets/comptia-aplus/core-2/chapters/ch18-users-groups/index.html'
                },
                {
                    id: 'forge-aplus-core2-ch19',
                    title: 'Security Fundamentals',
                    type: 'applet',
                    href: 'houses/forge/applets/comptia-aplus/core-2/chapters/ch19-security/index.html'
                },
                {
                    id: 'forge-aplus-core2-ch20',
                    title: 'Malware Detection & Removal',
                    type: 'applet',
                    href: 'houses/forge/applets/comptia-aplus/core-2/chapters/ch20-malware/index.html'
                },
                {
                    id: 'forge-aplus-core2-ch21',
                    title: 'Physical Security',
                    type: 'applet',
                    href: 'houses/forge/applets/comptia-aplus/core-2/chapters/ch21-physical-security/index.html'
                },
                {
                    id: 'forge-aplus-core2-ch22',
                    title: 'Incident Response',
                    type: 'applet',
                    href: 'houses/forge/applets/comptia-aplus/core-2/chapters/ch22-incident-response/index.html'
                },
                {
                    id: 'forge-aplus-core2-ch23',
                    title: 'Change Management',
                    type: 'applet',
                    href: 'houses/forge/applets/comptia-aplus/core-2/chapters/ch23-change-management/index.html'
                },
                {
                    id: 'forge-aplus-core2-ch24',
                    title: 'Documentation & Professionalism',
                    type: 'applet',
                    href: 'houses/forge/applets/comptia-aplus/core-2/chapters/ch24-documentation/index.html'
                }
            ]
        },

        // Microsoft MD-100: Windows Client — Forge House
        'md-100': {
            name: 'MD-100: Windows Client',
            description: 'Microsoft 365 Modern Desktop Administrator — installation, authentication, networking, storage, security, and troubleshooting',
            icon: '/assets/images/icons/icon-window.webp',
            color: '#ea580c',
            courseHref: 'houses/forge/md-100/index.html',
            modules: [
                {
                    id: 'forge-md100-m01',
                    title: 'Install the Windows Client',
                    type: 'presentation',
                    href: 'houses/forge/md-100/presentations/forge-md100-m01-install-windows.presentation.html'
                },
                {
                    id: 'forge-md100-m02',
                    title: 'Configure Authorization & Authentication',
                    type: 'presentation',
                    href: 'houses/forge/md-100/presentations/forge-md100-m02-auth-authorization.presentation.html'
                },
                {
                    id: 'forge-md100-m03',
                    title: 'Post-Installation Settings & Personalization',
                    type: 'presentation',
                    href: 'houses/forge/md-100/presentations/forge-md100-m03-post-install-config.presentation.html'
                },
                {
                    id: 'forge-md100-m04',
                    title: 'Configuring Networking',
                    type: 'presentation',
                    href: 'houses/forge/md-100/presentations/forge-md100-m04-networking.presentation.html'
                },
                {
                    id: 'forge-md100-m05',
                    title: 'Configure Storage',
                    type: 'presentation',
                    href: 'houses/forge/md-100/presentations/forge-md100-m05-storage.presentation.html'
                },
                {
                    id: 'forge-md100-m06',
                    title: 'Configure Data Access & Usage',
                    type: 'presentation',
                    href: 'houses/forge/md-100/presentations/forge-md100-m06-data-access.presentation.html'
                },
                {
                    id: 'forge-md100-m07',
                    title: 'Manage Apps & Windows Updates',
                    type: 'presentation',
                    href: 'houses/forge/md-100/presentations/forge-md100-m07-apps-updates.presentation.html'
                },
                {
                    id: 'forge-md100-m08',
                    title: 'Configure Threat Protection',
                    type: 'presentation',
                    href: 'houses/forge/md-100/presentations/forge-md100-m08-threat-protection.presentation.html'
                },
                {
                    id: 'forge-md100-m09',
                    title: 'Support the Windows Client',
                    type: 'presentation',
                    href: 'houses/forge/md-100/presentations/forge-md100-m09-support-environment.presentation.html'
                },
                {
                    id: 'forge-md100-m10',
                    title: 'Troubleshoot OS & Apps',
                    type: 'presentation',
                    href: 'houses/forge/md-100/presentations/forge-md100-m10-troubleshoot-os-apps.presentation.html'
                },
                {
                    id: 'forge-md100-m11',
                    title: 'Troubleshoot Hardware & Drivers',
                    type: 'presentation',
                    href: 'houses/forge/md-100/presentations/forge-md100-m11-troubleshoot-hardware.presentation.html'
                },
                {
                    id: 'forge-md100-m01-lab',
                    title: 'Lab: Install the Windows Client',
                    type: 'lab',
                    href: 'houses/forge/md-100/labs/forge-md100-m01-install.lab.html'
                },
                {
                    id: 'forge-md100-m02-lab',
                    title: 'Lab: Authorization & Authentication',
                    type: 'lab',
                    href: 'houses/forge/md-100/labs/forge-md100-m02-auth.lab.html'
                },
                {
                    id: 'forge-md100-m03-lab',
                    title: 'Lab: Post-Installation Configuration',
                    type: 'lab',
                    href: 'houses/forge/md-100/labs/forge-md100-m03-config.lab.html'
                },
                {
                    id: 'forge-md100-m04-lab',
                    title: 'Lab: Networking',
                    type: 'lab',
                    href: 'houses/forge/md-100/labs/forge-md100-m04-networking.lab.html'
                },
                {
                    id: 'forge-md100-m05-lab',
                    title: 'Lab: Storage Configuration',
                    type: 'lab',
                    href: 'houses/forge/md-100/labs/forge-md100-m05-storage.lab.html'
                },
                {
                    id: 'forge-md100-m06-lab',
                    title: 'Lab: Data Access',
                    type: 'lab',
                    href: 'houses/forge/md-100/labs/forge-md100-m06-data-access.lab.html'
                },
                {
                    id: 'forge-md100-m07-lab',
                    title: 'Lab: Apps & Updates',
                    type: 'lab',
                    href: 'houses/forge/md-100/labs/forge-md100-m07-apps.lab.html'
                },
                {
                    id: 'forge-md100-m08-lab',
                    title: 'Lab: Threat Protection',
                    type: 'lab',
                    href: 'houses/forge/md-100/labs/forge-md100-m08-security.lab.html'
                },
                {
                    id: 'forge-md100-m09-lab',
                    title: 'Lab: Support Environment',
                    type: 'lab',
                    href: 'houses/forge/md-100/labs/forge-md100-m09-support.lab.html'
                },
                {
                    id: 'forge-md100-m10-lab',
                    title: 'Lab: OS & App Troubleshooting',
                    type: 'lab',
                    href: 'houses/forge/md-100/labs/forge-md100-m10-troubleshoot.lab.html'
                },
                {
                    id: 'forge-md100-m11-lab',
                    title: 'Lab: Hardware & Driver Troubleshooting',
                    type: 'lab',
                    href: 'houses/forge/md-100/labs/forge-md100-m11-hardware.lab.html'
                },
                {
                    id: 'forge-md100-m01-sim',
                    title: 'Sim: Operation First Boot',
                    type: 'lab',
                    href: 'houses/forge/md-100/labs/forge-md100-m01-sim.lab.html',
                    prerequisites: ['forge-md100-m01-lab']
                },
                {
                    id: 'forge-md100-m02-sim',
                    title: 'Sim: Operation Lockdown',
                    type: 'lab',
                    href: 'houses/forge/md-100/labs/forge-md100-m02-sim.lab.html',
                    prerequisites: ['forge-md100-m01-sim']
                },
                {
                    id: 'forge-md100-m03-sim',
                    title: 'Sim: Operation Executive Suite',
                    type: 'lab',
                    href: 'houses/forge/md-100/labs/forge-md100-m03-sim.lab.html',
                    prerequisites: ['forge-md100-m02-sim']
                },
                {
                    id: 'forge-md100-m04-sim',
                    title: 'Sim: Operation Dark Subnet',
                    type: 'lab',
                    href: 'houses/forge/md-100/labs/forge-md100-m04-sim.lab.html',
                    prerequisites: ['forge-md100-m03-sim']
                },
                {
                    id: 'forge-md100-m05-sim',
                    title: 'Sim: Operation Capacity Zero',
                    type: 'lab',
                    href: 'houses/forge/md-100/labs/forge-md100-m05-sim.lab.html',
                    prerequisites: ['forge-md100-m04-sim']
                },
                {
                    id: 'forge-md100-midterm-sim',
                    title: 'Sim: WORKSTATION Midterm',
                    type: 'lab',
                    href: 'houses/forge/md-100/labs/forge-md100-midterm-sim.lab.html',
                    prerequisites: ['forge-md100-m05-sim']
                },
                {
                    id: 'forge-md100-m06-sim',
                    title: 'Sim: Operation Need to Know',
                    type: 'lab',
                    href: 'houses/forge/md-100/labs/forge-md100-m06-sim.lab.html',
                    prerequisites: ['forge-md100-midterm-sim']
                },
                {
                    id: 'forge-md100-m07-sim',
                    title: 'Sim: Operation Sales Floor',
                    type: 'lab',
                    href: 'houses/forge/md-100/labs/forge-md100-m07-sim.lab.html',
                    prerequisites: ['forge-md100-m06-sim']
                },
                {
                    id: 'forge-md100-m08-sim',
                    title: 'Sim: Operation Containment',
                    type: 'lab',
                    href: 'houses/forge/md-100/labs/forge-md100-m08-sim.lab.html',
                    prerequisites: ['forge-md100-m07-sim']
                },
                {
                    id: 'forge-md100-m09-sim',
                    title: 'Sim: Operation Bottleneck',
                    type: 'lab',
                    href: 'houses/forge/md-100/labs/forge-md100-m09-sim.lab.html',
                    prerequisites: ['forge-md100-m08-sim']
                },
                {
                    id: 'forge-md100-m10-sim',
                    title: 'Sim: Operation Phoenix',
                    type: 'lab',
                    href: 'houses/forge/md-100/labs/forge-md100-m10-sim.lab.html',
                    prerequisites: ['forge-md100-m09-sim']
                },
                {
                    id: 'forge-md100-m11-sim',
                    title: 'Sim: Operation Triage',
                    type: 'lab',
                    href: 'houses/forge/md-100/labs/forge-md100-m11-sim.lab.html',
                    prerequisites: ['forge-md100-m10-sim']
                }
            ]
        },

        // Microsoft MD-101: Managing Modern Desktops — Forge House
        'md-101': {
            name: 'MD-101: Managing Modern Desktops',
            description: 'Microsoft 365 Modern Desktop Administrator — device enrollment, profiles, application management, security, deployment, and updates',
            icon: '/assets/images/icons/icon-window.webp',
            color: '#ea580c',
            courseHref: 'houses/forge/md-101/index.html',
            modules: [
                {
                    id: 'forge-md101-m01',
                    title: 'Modern Management',
                    type: 'presentation',
                    href: 'houses/forge/md-101/presentations/forge-md101-m01-modern-management.presentation.html',
                    prerequisites: []
                },
                {
                    id: 'forge-md101-m01-lab',
                    title: 'Lab: Modern Management',
                    type: 'lab',
                    href: 'houses/forge/md-101/labs/forge-md101-m01-modern-management.lab.html',
                    prerequisites: ['forge-md101-m01']
                },
                {
                    id: 'forge-md101-m01-quiz',
                    title: 'Quiz: Modern Management',
                    type: 'quiz',
                    href: 'houses/forge/md-101/quizzes/forge-md101-m01-quiz.quiz.html',
                    prerequisites: ['forge-md101-m01-lab']
                },
                {
                    id: 'forge-md101-m02',
                    title: 'Device Enrollment',
                    type: 'presentation',
                    href: 'houses/forge/md-101/presentations/forge-md101-m02-device-enrollment.presentation.html',
                    prerequisites: ['forge-md101-m01-quiz']
                },
                {
                    id: 'forge-md101-m02-lab',
                    title: 'Lab: Device Enrollment',
                    type: 'lab',
                    href: 'houses/forge/md-101/labs/forge-md101-m02-device-enrollment.lab.html',
                    prerequisites: ['forge-md101-m02']
                },
                {
                    id: 'forge-md101-m02-quiz',
                    title: 'Quiz: Device Enrollment',
                    type: 'quiz',
                    href: 'houses/forge/md-101/quizzes/forge-md101-m02-quiz.quiz.html',
                    prerequisites: ['forge-md101-m02-lab']
                },
                {
                    id: 'forge-md101-m03',
                    title: 'Configuring Profiles',
                    type: 'presentation',
                    href: 'houses/forge/md-101/presentations/forge-md101-m03-configuring-profiles.presentation.html',
                    prerequisites: ['forge-md101-m02-quiz']
                },
                {
                    id: 'forge-md101-m03-lab',
                    title: 'Lab: Configuring Profiles',
                    type: 'lab',
                    href: 'houses/forge/md-101/labs/forge-md101-m03-configuring-profiles.lab.html',
                    prerequisites: ['forge-md101-m03']
                },
                {
                    id: 'forge-md101-m03-quiz',
                    title: 'Quiz: Configuring Profiles',
                    type: 'quiz',
                    href: 'houses/forge/md-101/quizzes/forge-md101-m03-quiz.quiz.html',
                    prerequisites: ['forge-md101-m03-lab']
                },
                {
                    id: 'forge-md101-m04',
                    title: 'Application Management',
                    type: 'presentation',
                    href: 'houses/forge/md-101/presentations/forge-md101-m04-application-management.presentation.html',
                    prerequisites: ['forge-md101-m03-quiz']
                },
                {
                    id: 'forge-md101-m04-lab',
                    title: 'Lab: Application Management',
                    type: 'lab',
                    href: 'houses/forge/md-101/labs/forge-md101-m04-application-management.lab.html',
                    prerequisites: ['forge-md101-m04']
                },
                {
                    id: 'forge-md101-m04-quiz',
                    title: 'Quiz: Application Management',
                    type: 'quiz',
                    href: 'houses/forge/md-101/quizzes/forge-md101-m04-quiz.quiz.html',
                    prerequisites: ['forge-md101-m04-lab']
                },
                {
                    id: 'forge-md101-m05',
                    title: 'Authentication & Compliance',
                    type: 'presentation',
                    href: 'houses/forge/md-101/presentations/forge-md101-m05-auth-compliance.presentation.html',
                    prerequisites: ['forge-md101-m04-quiz']
                },
                {
                    id: 'forge-md101-m05-lab',
                    title: 'Lab: Authentication & Compliance',
                    type: 'lab',
                    href: 'houses/forge/md-101/labs/forge-md101-m05-auth-compliance.lab.html',
                    prerequisites: ['forge-md101-m05']
                },
                {
                    id: 'forge-md101-m05-quiz',
                    title: 'Quiz: Authentication & Compliance',
                    type: 'quiz',
                    href: 'houses/forge/md-101/quizzes/forge-md101-m05-quiz.quiz.html',
                    prerequisites: ['forge-md101-m05-lab']
                },
                {
                    id: 'forge-md101-m06',
                    title: 'Managing Security',
                    type: 'presentation',
                    href: 'houses/forge/md-101/presentations/forge-md101-m06-managing-security.presentation.html',
                    prerequisites: ['forge-md101-m05-quiz']
                },
                {
                    id: 'forge-md101-m06-lab',
                    title: 'Lab: Managing Security',
                    type: 'lab',
                    href: 'houses/forge/md-101/labs/forge-md101-m06-managing-security.lab.html',
                    prerequisites: ['forge-md101-m06']
                },
                {
                    id: 'forge-md101-m06-quiz',
                    title: 'Quiz: Managing Security',
                    type: 'quiz',
                    href: 'houses/forge/md-101/quizzes/forge-md101-m06-quiz.quiz.html',
                    prerequisites: ['forge-md101-m06-lab']
                },
                {
                    id: 'forge-md101-m07',
                    title: 'Deployment with Endpoint Manager I',
                    type: 'presentation',
                    href: 'houses/forge/md-101/presentations/forge-md101-m07-deployment-part1.presentation.html',
                    prerequisites: ['forge-md101-m06-quiz']
                },
                {
                    id: 'forge-md101-m07-lab',
                    title: 'Lab: Deployment with Endpoint Manager I',
                    type: 'lab',
                    href: 'houses/forge/md-101/labs/forge-md101-m07-deployment-part1.lab.html',
                    prerequisites: ['forge-md101-m07']
                },
                {
                    id: 'forge-md101-m07-quiz',
                    title: 'Quiz: Deployment with Endpoint Manager I',
                    type: 'quiz',
                    href: 'houses/forge/md-101/quizzes/forge-md101-m07-quiz.quiz.html',
                    prerequisites: ['forge-md101-m07-lab']
                },
                {
                    id: 'forge-md101-m08',
                    title: 'Deployment with Endpoint Manager II',
                    type: 'presentation',
                    href: 'houses/forge/md-101/presentations/forge-md101-m08-deployment-part2.presentation.html',
                    prerequisites: ['forge-md101-m07-quiz']
                },
                {
                    id: 'forge-md101-m08-lab',
                    title: 'Lab: Deployment with Endpoint Manager II',
                    type: 'lab',
                    href: 'houses/forge/md-101/labs/forge-md101-m08-deployment-part2.lab.html',
                    prerequisites: ['forge-md101-m08']
                },
                {
                    id: 'forge-md101-m08-quiz',
                    title: 'Quiz: Deployment with Endpoint Manager II',
                    type: 'quiz',
                    href: 'houses/forge/md-101/quizzes/forge-md101-m08-quiz.quiz.html',
                    prerequisites: ['forge-md101-m08-lab']
                },
                {
                    id: 'forge-md101-m09',
                    title: 'Managing Updates',
                    type: 'presentation',
                    href: 'houses/forge/md-101/presentations/forge-md101-m09-managing-updates.presentation.html',
                    prerequisites: ['forge-md101-m08-quiz']
                },
                {
                    id: 'forge-md101-m09-lab',
                    title: 'Lab: Managing Updates',
                    type: 'lab',
                    href: 'houses/forge/md-101/labs/forge-md101-m09-managing-updates.lab.html',
                    prerequisites: ['forge-md101-m09']
                },
                {
                    id: 'forge-md101-m09-quiz',
                    title: 'Quiz: Managing Updates',
                    type: 'quiz',
                    href: 'houses/forge/md-101/quizzes/forge-md101-m09-quiz.quiz.html',
                    prerequisites: ['forge-md101-m09-lab']
                }
            ]
        },

        // Advanced Linux Administration (CTS4321C), Matrix House course path.
        // Registered 2026-05-28 to close FLOW-001 unchained-content findings on ALA
        // presentations and quizzes (19 files). Includes the full 38-module pedagogical
        // chain (reviews, presentations, labs, quizzes, exams) for consumers that
        // traverse the full progression.
        'adv-linux': {
            name: 'Advanced Linux Administration (CTS4321C)',
            description: 'Production Linux administration: CLI mastery, systemd, networking, hardening, DNS, automation, file integrity, and performance analysis. 12 CTF labs across 4 weeks.',
            icon: '/assets/images/icons/icon-terminal.webp',
            color: '#00ff41',
            courseHref: 'houses/matrix/adv-linux/index.html',
            modules: [
                {
                    id: 'ala-r1',
                    title: 'ALA-R1: Cell Navigation',
                    type: 'review',
                    difficulty: 'beginner',
                    duration: '15 min',
                    href: 'houses/matrix/adv-linux/ala-r1.html',
                    prerequisites: []
                },
                {
                    id: 'ala-r2',
                    title: 'ALA-R2: Access Control',
                    type: 'review',
                    difficulty: 'beginner',
                    duration: '15 min',
                    href: 'houses/matrix/adv-linux/ala-r2.html',
                    prerequisites: ['ala-r1']
                },
                {
                    id: 'ala-r3',
                    title: 'ALA-R3: Process Authority',
                    type: 'review',
                    difficulty: 'beginner',
                    duration: '15 min',
                    href: 'houses/matrix/adv-linux/ala-r3.html',
                    prerequisites: ['ala-r2']
                },
                {
                    id: 'ala-r4',
                    title: 'ALA-R4: Grid Basics',
                    type: 'review',
                    difficulty: 'beginner',
                    duration: '15 min',
                    href: 'houses/matrix/adv-linux/ala-r4.html',
                    prerequisites: ['ala-r3']
                },
                {
                    id: 'ala-r5',
                    title: 'ALA-R5: Signal Processing',
                    type: 'review',
                    difficulty: 'beginner',
                    duration: '15 min',
                    href: 'houses/matrix/adv-linux/ala-r5.html',
                    prerequisites: ['ala-r4']
                },
                {
                    id: 'ala-w1-cli',
                    title: 'Advanced CLI Operations',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'houses/matrix/adv-linux/presentations/ala-w1-cli-operations.presentation.html',
                    prerequisites: ['ala-r5']
                },
                {
                    id: 'ala-w1-systemd',
                    title: 'Service Authority: systemd Deep Dive',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'houses/matrix/adv-linux/presentations/ala-w1-systemd.presentation.html',
                    prerequisites: ['ala-w1-cli']
                },
                {
                    id: 'ala-w1-network-config',
                    title: 'Grid Interface Configuration',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'houses/matrix/adv-linux/presentations/ala-w1-network-config.presentation.html',
                    prerequisites: ['ala-w1-systemd']
                },
                {
                    id: 'ala-w1-network-diag',
                    title: 'Grid Diagnostics',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'houses/matrix/adv-linux/presentations/ala-w1-network-diag.presentation.html',
                    prerequisites: ['ala-w1-network-config']
                },
                {
                    id: 'ala-l01',
                    title: 'ALA-L01: Dead Cell Recovery',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'houses/matrix/adv-linux/labs/ala-l01-dead-cell-recovery/index.html',
                    prerequisites: ['ala-w1-network-diag']
                },
                {
                    id: 'ala-l02',
                    title: 'ALA-L02: Grid Handshake',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '35 min',
                    href: 'houses/matrix/adv-linux/labs/ala-l02-grid-handshake/index.html',
                    prerequisites: ['ala-l01']
                },
                {
                    id: 'ala-l03',
                    title: 'ALA-L03: Signal in the Noise',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '35 min',
                    href: 'houses/matrix/adv-linux/labs/ala-l03-signal-in-the-noise/index.html',
                    prerequisites: ['ala-l02']
                },
                {
                    id: 'ala-w1-quiz',
                    title: 'Week 1 Quiz: CLI Operations and Networking',
                    type: 'quiz',
                    difficulty: 'intermediate',
                    duration: '15 min',
                    href: 'houses/matrix/adv-linux/quizzes/ala-w1.quiz.html',
                    prerequisites: ['ala-l03']
                },
                {
                    id: 'ala-w2-firewalls',
                    title: 'Perimeter Shield: Linux Firewalls',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'houses/matrix/adv-linux/presentations/ala-w2-firewalls.presentation.html',
                    prerequisites: ['ala-w1-quiz']
                },
                {
                    id: 'ala-w2-authentication',
                    title: 'Dual-Lock Protocol: Authentication Hardening',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'houses/matrix/adv-linux/presentations/ala-w2-authentication.presentation.html',
                    prerequisites: ['ala-w2-firewalls']
                },
                {
                    id: 'ala-w2-antivirus',
                    title: 'Threat Sentinel: ClamAV',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'houses/matrix/adv-linux/presentations/ala-w2-antivirus.presentation.html',
                    prerequisites: ['ala-w2-authentication']
                },
                {
                    id: 'ala-w2-packages',
                    title: 'Grid Armory: Package Management',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'houses/matrix/adv-linux/presentations/ala-w2-packages.presentation.html',
                    prerequisites: ['ala-w2-antivirus']
                },
                {
                    id: 'ala-l04',
                    title: 'ALA-L04: Lockdown Protocol',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '35 min',
                    href: 'houses/matrix/adv-linux/labs/ala-l04-lockdown-protocol/index.html',
                    prerequisites: ['ala-w2-packages']
                },
                {
                    id: 'ala-l05',
                    title: 'ALA-L05: The Insider',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '35 min',
                    href: 'houses/matrix/adv-linux/labs/ala-l05-the-insider/index.html',
                    prerequisites: ['ala-l04']
                },
                {
                    id: 'ala-l06',
                    title: 'ALA-L06: Field Assembly',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '35 min',
                    href: 'houses/matrix/adv-linux/labs/ala-l06-field-assembly/index.html',
                    prerequisites: ['ala-l05']
                },
                {
                    id: 'ala-w2-quiz',
                    title: 'Week 2 Quiz: Hardening and Package Management',
                    type: 'quiz',
                    difficulty: 'intermediate',
                    duration: '15 min',
                    href: 'houses/matrix/adv-linux/quizzes/ala-w2.quiz.html',
                    prerequisites: ['ala-l06']
                },
                {
                    id: 'ala-midterm',
                    title: 'ALA Midterm Exam',
                    type: 'exam',
                    difficulty: 'advanced',
                    duration: '45 min',
                    href: 'houses/matrix/adv-linux/exams/ala-midterm.exam.html',
                    prerequisites: ['ala-w2-quiz']
                },
                {
                    id: 'ala-w3-dns-fundamentals',
                    title: 'DNS Fundamentals',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'houses/matrix/adv-linux/presentations/ala-w3-dns-fundamentals.presentation.html',
                    prerequisites: ['ala-midterm']
                },
                {
                    id: 'ala-w3-bind-deployment',
                    title: 'BIND9 Deployment',
                    type: 'presentation',
                    difficulty: 'advanced',
                    duration: '35 min',
                    href: 'houses/matrix/adv-linux/presentations/ala-w3-bind-deployment.presentation.html',
                    prerequisites: ['ala-w3-dns-fundamentals']
                },
                {
                    id: 'ala-w3-bash-scripting',
                    title: 'Bash Scripting Fundamentals',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'houses/matrix/adv-linux/presentations/ala-w3-bash-scripting.presentation.html',
                    prerequisites: ['ala-w3-bind-deployment']
                },
                {
                    id: 'ala-w3-automation',
                    title: 'Linux Automation',
                    type: 'presentation',
                    difficulty: 'advanced',
                    duration: '30 min',
                    href: 'houses/matrix/adv-linux/presentations/ala-w3-automation.presentation.html',
                    prerequisites: ['ala-w3-bash-scripting']
                },
                {
                    id: 'ala-l07',
                    title: 'ALA-L07: Name Authority',
                    type: 'lab',
                    difficulty: 'advanced',
                    duration: '40 min',
                    href: 'houses/matrix/adv-linux/labs/ala-l07-name-authority/index.html',
                    prerequisites: ['ala-w3-automation']
                },
                {
                    id: 'ala-l08',
                    title: 'ALA-L08: The Night Shift',
                    type: 'lab',
                    difficulty: 'advanced',
                    duration: '40 min',
                    href: 'houses/matrix/adv-linux/labs/ala-l08-the-night-shift/index.html',
                    prerequisites: ['ala-l07']
                },
                {
                    id: 'ala-l09',
                    title: 'ALA-L09: Poisoned Records',
                    type: 'lab',
                    difficulty: 'advanced',
                    duration: '40 min',
                    href: 'houses/matrix/adv-linux/labs/ala-l09-poisoned-records/index.html',
                    prerequisites: ['ala-l08']
                },
                {
                    id: 'ala-w3-quiz',
                    title: 'Week 3 Quiz: DNS and Automation',
                    type: 'quiz',
                    difficulty: 'intermediate',
                    duration: '15 min',
                    href: 'houses/matrix/adv-linux/quizzes/ala-w3.quiz.html',
                    prerequisites: ['ala-l09']
                },
                {
                    id: 'ala-w4-file-integrity',
                    title: 'File Integrity and Auditing',
                    type: 'presentation',
                    difficulty: 'advanced',
                    duration: '30 min',
                    href: 'houses/matrix/adv-linux/presentations/ala-w4-file-integrity.presentation.html',
                    prerequisites: ['ala-w3-quiz']
                },
                {
                    id: 'ala-w4-performance',
                    title: 'Linux Performance Analysis',
                    type: 'presentation',
                    difficulty: 'advanced',
                    duration: '30 min',
                    href: 'houses/matrix/adv-linux/presentations/ala-w4-performance.presentation.html',
                    prerequisites: ['ala-w4-file-integrity']
                },
                {
                    id: 'ala-w4-log-management',
                    title: 'Log Management',
                    type: 'presentation',
                    difficulty: 'advanced',
                    duration: '30 min',
                    href: 'houses/matrix/adv-linux/presentations/ala-w4-log-management.presentation.html',
                    prerequisites: ['ala-w4-performance']
                },
                {
                    id: 'ala-l10',
                    title: 'ALA-L10: Ghost in the Cell',
                    type: 'lab',
                    difficulty: 'advanced',
                    duration: '45 min',
                    href: 'houses/matrix/adv-linux/labs/ala-l10-ghost-in-the-cell/index.html',
                    prerequisites: ['ala-w4-log-management']
                },
                {
                    id: 'ala-l11',
                    title: 'ALA-L11: Flatline',
                    type: 'lab',
                    difficulty: 'advanced',
                    duration: '45 min',
                    href: 'houses/matrix/adv-linux/labs/ala-l11-flatline/index.html',
                    prerequisites: ['ala-l10']
                },
                {
                    id: 'ala-l12',
                    title: 'ALA-L12: Full Cell Audit',
                    type: 'lab',
                    difficulty: 'advanced',
                    duration: '45 min',
                    href: 'houses/matrix/adv-linux/labs/ala-l12-full-cell-audit/index.html',
                    prerequisites: ['ala-l11']
                },
                {
                    id: 'ala-w4-quiz',
                    title: 'Week 4 Quiz: Filesystem and Performance',
                    type: 'quiz',
                    difficulty: 'intermediate',
                    duration: '15 min',
                    href: 'houses/matrix/adv-linux/quizzes/ala-w4.quiz.html',
                    prerequisites: ['ala-l12']
                },
                {
                    id: 'ala-final',
                    title: 'ALA Final Exam',
                    type: 'exam',
                    difficulty: 'advanced',
                    duration: '60 min',
                    href: 'houses/matrix/adv-linux/exams/ala-final.exam.html',
                    prerequisites: ['ala-w4-quiz']
                }
            ]
        },
        // OpenStack Cloud Platform — Cloud House
        'openstack': {
            name: 'OpenStack Cloud Platform',
            description: 'Infrastructure-as-a-Service cloud operating system — architecture, core projects, installation, and operations',
            icon: '/assets/images/icons/icon-globe.webp',
            color: '#0ea5e9',
            courseHref: 'houses/cloud/openstack/index.html',
            modules: [
                {
                    id: 'cloud-openstack-intro',
                    title: 'Introduction & Environment',
                    type: 'presentation',
                    href: 'houses/cloud/openstack/presentations/cloud-openstack-intro-environment.presentation.html'
                },
                {
                    id: 'cloud-openstack-projects',
                    title: 'OpenStack Projects',
                    type: 'presentation',
                    href: 'houses/cloud/openstack/presentations/cloud-openstack-projects.presentation.html'
                },
                {
                    id: 'cloud-openstack-install',
                    title: 'OpenStack Installation',
                    type: 'presentation',
                    href: 'houses/cloud/openstack/presentations/cloud-openstack-installation.presentation.html'
                },
                {
                    id: 'cloud-openstack-operation',
                    title: 'OpenStack Operation',
                    type: 'presentation',
                    href: 'houses/cloud/openstack/presentations/cloud-openstack-operation.presentation.html'
                },
                {
                    id: 'cloud-openstack-install-lab',
                    title: 'Lab: Install OpenStack',
                    type: 'lab',
                    href: 'houses/cloud/openstack/labs/cloud-openstack-install.lab.html'
                },
                {
                    id: 'cloud-openstack-launch-lab',
                    title: 'Lab: Launch Virtual Machine',
                    type: 'lab',
                    href: 'houses/cloud/openstack/labs/cloud-openstack-launch-vm.lab.html'
                },
                {
                    id: 'cloud-openstack-advanced-lab',
                    title: 'Lab: Advanced Operations',
                    type: 'lab',
                    href: 'houses/cloud/openstack/labs/cloud-openstack-advanced-ops.lab.html'
                }
            ]
        },

        // EC-Council Cloud Security Engineer (CSE v1) — Cloud + Shield
        'cse': {
            name: 'EC-Council Cloud Security Engineer',
            description: 'CSE v1 — cloud fundamentals, IAM, data protection, network security, app security, monitoring, risk, compliance',
            icon: '/assets/images/icons/icon-shield.webp',
            color: '#0ea5e9',
            courseHref: 'houses/cloud/cse/index.html',
            modules: [
                { id: 'cse-01-fundamentals', title: 'Cloud Computing Fundamentals', type: 'presentation', href: 'houses/cloud/presentations/cloud-cse-01-cloud-fundamentals.presentation.html' },
                { id: 'cse-02-iam', title: 'Identity & Access Management', type: 'presentation', href: 'houses/cloud/presentations/cloud-cse-02-identity-access-management.presentation.html' },
                { id: 'cse-03-encryption', title: 'Data Protection & Encryption', type: 'presentation', href: 'houses/cloud/presentations/cloud-cse-03-data-protection-encryption.presentation.html' },
                { id: 'cse-04-network', title: 'Network Security in Cloud', type: 'presentation', href: 'houses/cloud/presentations/cloud-cse-04-network-security.presentation.html' },
                { id: 'cse-05-appsec', title: 'Application Security in Cloud', type: 'presentation', href: 'houses/cloud/presentations/cloud-cse-05-application-security.presentation.html' },
                { id: 'cse-06-monitoring', title: 'Security Monitoring & Incident Response', type: 'presentation', href: 'houses/cloud/presentations/cloud-cse-06-security-monitoring-ir.presentation.html' },
                { id: 'cse-07-risk', title: 'Risk Assessment & Management', type: 'presentation', href: 'houses/cloud/presentations/cloud-cse-07-risk-assessment.presentation.html' },
                { id: 'cse-08-compliance', title: 'Compliance & Governance', type: 'presentation', href: 'houses/cloud/presentations/cloud-cse-08-compliance-governance.presentation.html' },
                { id: 'cse-module01', title: 'Module 1: Cloud Fundamentals Lab', type: 'lab', href: 'houses/cloud/labs/cloud-cse-module01.lab.html' },
                { id: 'cse-module02', title: 'Module 2: IAM Lab', type: 'lab', href: 'houses/cloud/labs/cloud-cse-module02.lab.html' },
                { id: 'cse-module03', title: 'Module 3: Encryption Lab', type: 'lab', href: 'houses/cloud/labs/cloud-cse-module03.lab.html' },
                { id: 'cse-module04', title: 'Module 4: Network Security Lab', type: 'lab', href: 'houses/cloud/labs/cloud-cse-module04.lab.html' },
                { id: 'cse-module05', title: 'Module 5: App Security Lab', type: 'lab', href: 'houses/cloud/labs/cloud-cse-module05.lab.html' },
                { id: 'cse-module06', title: 'Module 6: Monitoring Lab', type: 'lab', href: 'houses/cloud/labs/cloud-cse-module06.lab.html' },
                { id: 'cse-module07', title: 'Module 7: Risk Assessment Lab', type: 'lab', href: 'houses/cloud/labs/cloud-cse-module07.lab.html' },
                { id: 'cse-module08', title: 'Module 8: Compliance Lab', type: 'lab', href: 'houses/cloud/labs/cloud-cse-module08.lab.html' }
            ]
        },

        // Cyber Law & Policy Framework — Shield House
        'cyber-framework': {
            name: 'Cyber Law & Policy Framework',
            description: 'Law and Policy of Cybersecurity — legal landscape, government roles, CFAA, regulatory frameworks, NIST CSF, encryption law, breach litigation, and international cyber law',
            icon: '/assets/images/icons/icon-scales.webp',
            color: '#10b981',
            courseHref: 'houses/shield/cyber-framework/index.html',
            modules: [
                { id: 'shield-cf-mm01-pres', title: 'MM1: Introduction to Legal/Regulatory/Policy Issues', type: 'presentation', href: 'houses/shield/cyber-framework/presentations/shield-cf-mm01-intro.presentation.html' },
                { id: 'shield-cf-mm01-lab', title: 'MM1 Lab: Cybersecurity Law Foundations', type: 'lab', href: 'houses/shield/cyber-framework/labs/shield-cf-mm01-intro.lab.html' },
                { id: 'shield-cf-mm02-pres', title: 'MM2: Government Agency Roles & Responsibilities', type: 'presentation', href: 'houses/shield/cyber-framework/presentations/shield-cf-mm02-gov-agencies.presentation.html' },
                { id: 'shield-cf-mm02-lab', title: 'MM2 Lab: Government Agencies in Cybersecurity', type: 'lab', href: 'houses/shield/cyber-framework/labs/shield-cf-mm02-gov-agencies.lab.html' },
                { id: 'shield-cf-mm03-pres', title: 'MM3: Major Cybersecurity Legislation', type: 'presentation', href: 'houses/shield/cyber-framework/presentations/shield-cf-mm03-legislation.presentation.html' },
                { id: 'shield-cf-mm03-lab', title: 'MM3 Lab: CFAA & Data Breach Notification', type: 'lab', href: 'houses/shield/cyber-framework/labs/shield-cf-mm03-legislation.lab.html' },
                { id: 'shield-cf-mm04-pres', title: 'MM4: Major Regulatory Frameworks', type: 'presentation', href: 'houses/shield/cyber-framework/presentations/shield-cf-mm04-regulatory.presentation.html' },
                { id: 'shield-cf-mm04-lab', title: 'MM4 Lab: Regulatory Compliance', type: 'lab', href: 'houses/shield/cyber-framework/labs/shield-cf-mm04-regulatory.lab.html' },
                { id: 'shield-cf-mm05-pres', title: 'MM5: Critical Infrastructure & NIST CSF', type: 'presentation', href: 'houses/shield/cyber-framework/presentations/shield-cf-mm05-nist-cip.presentation.html' },
                { id: 'shield-cf-mm05-lab', title: 'MM5 Lab: NIST Framework Application', type: 'lab', href: 'houses/shield/cyber-framework/labs/shield-cf-mm05-nist-cip.lab.html' },
                { id: 'shield-cf-mm06-pres', title: 'MM6: Encryption Law & Policy', type: 'presentation', href: 'houses/shield/cyber-framework/presentations/shield-cf-mm06-encryption.presentation.html' },
                { id: 'shield-cf-mm06-lab', title: 'MM6 Lab: Encryption Policy Analysis', type: 'lab', href: 'houses/shield/cyber-framework/labs/shield-cf-mm06-encryption.lab.html' },
                { id: 'shield-cf-mm07-pres', title: 'MM7: Data Breach Litigation', type: 'presentation', href: 'houses/shield/cyber-framework/presentations/shield-cf-mm07-breach-litigation.presentation.html' },
                { id: 'shield-cf-mm07-lab', title: 'MM7 Lab: Breach Litigation Analysis', type: 'lab', href: 'houses/shield/cyber-framework/labs/shield-cf-mm07-breach-litigation.lab.html' },
                { id: 'shield-cf-mm08-pres', title: 'MM8: International Law & Cyber War', type: 'presentation', href: 'houses/shield/cyber-framework/presentations/shield-cf-mm08-cyber-war.presentation.html' },
                { id: 'shield-cf-mm08-lab', title: 'MM8 Lab: International Cyber Law', type: 'lab', href: 'houses/shield/cyber-framework/labs/shield-cf-mm08-cyber-war.lab.html' }
            ]
        },

        // Linux Administration — Script House
        'linux-admin': {
            name: 'Linux Administration',
            description: 'Advanced Linux administration — distributions, processes, daemons, display managers, networking, IPv4, compression, encryption, grep/pipes, and compilation',
            icon: '/assets/images/icons/icon-penguin.webp',
            color: '#22c55e',
            courseHref: 'houses/script/linux/index.html',
            modules: [
                { id: 'script-la-ch01-pres', title: 'Introduction to Linux', type: 'presentation', href: 'houses/script/linux/presentations/script-la-ch01-intro.presentation.html' },
                { id: 'script-la-ch01-lab', title: 'Linux Basics Lab', type: 'lab', href: 'houses/script/linux/labs/script-la-ch01-intro.lab.html' },
                { id: 'script-la-ch01-quiz', title: 'Ch 1 Quiz', type: 'quiz', href: 'houses/script/linux/quizzes/script-la-ch01-quiz.quiz.html' },
                { id: 'script-la-ch02-pres', title: 'Linux Distributions & Uses', type: 'presentation', href: 'houses/script/linux/presentations/script-la-ch02-distros.presentation.html' },
                { id: 'script-la-ch02-lab', title: 'Distributions Lab', type: 'lab', href: 'houses/script/linux/labs/script-la-ch02-distros.lab.html' },
                { id: 'script-la-ch02-quiz', title: 'Ch 2 Quiz', type: 'quiz', href: 'houses/script/linux/quizzes/script-la-ch02-quiz.quiz.html' },
                { id: 'script-la-ch03-pres', title: 'Grep, Pipes & Text Processing', type: 'presentation', href: 'houses/script/linux/presentations/script-la-ch03-grep-pipes.presentation.html' },
                { id: 'script-la-ch03-lab', title: 'Grep & Pipes Lab', type: 'lab', href: 'houses/script/linux/labs/script-la-ch03-grep-pipes.lab.html' },
                { id: 'script-la-ch03-quiz', title: 'Ch 3 Quiz', type: 'quiz', href: 'houses/script/linux/quizzes/script-la-ch03-quiz.quiz.html' },
                { id: 'script-la-ch04-pres', title: 'Process Management & Nice Values', type: 'presentation', href: 'houses/script/linux/presentations/script-la-ch04-processes.presentation.html' },
                { id: 'script-la-ch04-lab', title: 'Process Management Lab', type: 'lab', href: 'houses/script/linux/labs/script-la-ch04-processes.lab.html' },
                { id: 'script-la-ch04-quiz', title: 'Ch 4 Quiz', type: 'quiz', href: 'houses/script/linux/quizzes/script-la-ch04-quiz.quiz.html' },
                { id: 'script-la-ch05-pres', title: 'Daemons & Services', type: 'presentation', href: 'houses/script/linux/presentations/script-la-ch05-daemons.presentation.html' },
                { id: 'script-la-ch05-lab', title: 'Daemons Lab', type: 'lab', href: 'houses/script/linux/labs/script-la-ch05-daemons.lab.html' },
                { id: 'script-la-ch05-quiz', title: 'Ch 5 Quiz', type: 'quiz', href: 'houses/script/linux/quizzes/script-la-ch05-quiz.quiz.html' },
                { id: 'script-la-ch06-pres', title: 'Initialization, X Windows & Localization', type: 'presentation', href: 'houses/script/linux/presentations/script-la-ch06-init-xwindows.presentation.html' },
                { id: 'script-la-ch06-lab', title: 'Init & X Windows Lab', type: 'lab', href: 'houses/script/linux/labs/script-la-ch06-init-xwindows.lab.html' },
                { id: 'script-la-ch06-quiz', title: 'Ch 6 Quiz', type: 'quiz', href: 'houses/script/linux/quizzes/script-la-ch06-quiz.quiz.html' },
                { id: 'script-la-ch07-pres', title: 'Display Managers & User Sessions', type: 'presentation', href: 'houses/script/linux/presentations/script-la-ch07-display-mgr.presentation.html' },
                { id: 'script-la-ch07-lab', title: 'Display Managers Lab', type: 'lab', href: 'houses/script/linux/labs/script-la-ch07-display-mgr.lab.html' },
                { id: 'script-la-ch07-quiz', title: 'Ch 7 Quiz', type: 'quiz', href: 'houses/script/linux/quizzes/script-la-ch07-quiz.quiz.html' },
                { id: 'script-la-ch08-pres', title: 'Network Interface Configuration', type: 'presentation', href: 'houses/script/linux/presentations/script-la-ch08-network.presentation.html' },
                { id: 'script-la-ch08-lab', title: 'Network Configuration Lab', type: 'lab', href: 'houses/script/linux/labs/script-la-ch08-network.lab.html' },
                { id: 'script-la-ch08-quiz', title: 'Ch 8 Quiz', type: 'quiz', href: 'houses/script/linux/quizzes/script-la-ch08-quiz.quiz.html' },
                { id: 'script-la-ch09-pres', title: 'IPv4 Protocol & Networking', type: 'presentation', href: 'houses/script/linux/presentations/script-la-ch09-ipv4.presentation.html' },
                { id: 'script-la-ch09-lab', title: 'IPv4 Networking Lab', type: 'lab', href: 'houses/script/linux/labs/script-la-ch09-ipv4.lab.html' },
                { id: 'script-la-ch09-quiz', title: 'Ch 9 Quiz', type: 'quiz', href: 'houses/script/linux/quizzes/script-la-ch09-quiz.quiz.html' },
                { id: 'script-la-ch10-pres', title: 'File Compression & Archiving', type: 'presentation', href: 'houses/script/linux/presentations/script-la-ch10-compression.presentation.html' },
                { id: 'script-la-ch10-lab', title: 'Compression Lab', type: 'lab', href: 'houses/script/linux/labs/script-la-ch10-compression.lab.html' },
                { id: 'script-la-ch10-quiz', title: 'Ch 10 Quiz', type: 'quiz', href: 'houses/script/linux/quizzes/script-la-ch10-quiz.quiz.html' },
                { id: 'script-la-ch11-pres', title: 'Linux Encryption', type: 'presentation', href: 'houses/script/linux/presentations/script-la-ch11-encryption.presentation.html' },
                { id: 'script-la-ch11-lab', title: 'Encryption Lab', type: 'lab', href: 'houses/script/linux/labs/script-la-ch11-encryption.lab.html' },
                { id: 'script-la-ch11-quiz', title: 'Ch 11 Quiz', type: 'quiz', href: 'houses/script/linux/quizzes/script-la-ch11-quiz.quiz.html' },
                { id: 'script-la-ch12-pres', title: 'Compiling Source Code', type: 'presentation', href: 'houses/script/linux/presentations/script-la-ch12-compile.presentation.html' },
                { id: 'script-la-ch12-lab', title: 'Source Compilation Lab', type: 'lab', href: 'houses/script/linux/labs/script-la-ch12-compile.lab.html' },
                { id: 'script-la-ch12-quiz', title: 'Ch 12 Quiz', type: 'quiz', href: 'houses/script/linux/quizzes/script-la-ch12-quiz.quiz.html' }
            ]
        },

        // CompTIA CySA+ (CS0-003) — Eye House
        'cysa': {
            name: 'CompTIA CySA+',
            description: 'CS0-003 — SOC analyst curriculum: threat intelligence, vulnerability management, cloud security, IAM, security operations, incident response, forensics, risk management, compliance',
            icon: '/assets/images/icons/icon-detective.webp',
            color: '#a855f7',
            courseHref: 'houses/eye/cysa/index.html',
            modules: [
                { id: 'eye-cysa-ch01-pres', title: 'Ch 1: Today\'s Cybersecurity Analyst', type: 'presentation', href: 'houses/eye/cysa/presentations/eye-cysa-ch01-analyst.presentation.html' },
                { id: 'eye-cysa-ch01-lab', title: 'Ch 1 Lab: Cybersecurity Analyst Foundations', type: 'lab', href: 'houses/eye/cysa/labs/eye-cysa-ch01-analyst.lab.html' },
                { id: 'eye-cysa-ch02-pres', title: 'Ch 2: Using Threat Intelligence', type: 'presentation', href: 'houses/eye/cysa/presentations/eye-cysa-ch02-threat-intel.presentation.html' },
                { id: 'eye-cysa-ch02-lab', title: 'Ch 2 Lab: Threat Intelligence Analysis', type: 'lab', href: 'houses/eye/cysa/labs/eye-cysa-ch02-threat-intel.lab.html' },
                { id: 'eye-cysa-ch03-pres', title: 'Ch 3: Reconnaissance & Intelligence Gathering', type: 'presentation', href: 'houses/eye/cysa/presentations/eye-cysa-ch03-recon.presentation.html' },
                { id: 'eye-cysa-ch03-lab', title: 'Ch 3 Lab: Reconnaissance Techniques', type: 'lab', href: 'houses/eye/cysa/labs/eye-cysa-ch03-recon.lab.html' },
                { id: 'eye-cysa-ch04-pres', title: 'Ch 4: Vulnerability Management Program', type: 'presentation', href: 'houses/eye/cysa/presentations/eye-cysa-ch04-vuln-mgmt.presentation.html' },
                { id: 'eye-cysa-ch04-lab', title: 'Ch 4 Lab: Vulnerability Management', type: 'lab', href: 'houses/eye/cysa/labs/eye-cysa-ch04-vuln-mgmt.lab.html' },
                { id: 'eye-cysa-ch05-pres', title: 'Ch 5: Analyzing Vulnerability Scans', type: 'presentation', href: 'houses/eye/cysa/presentations/eye-cysa-ch05-vuln-scans.presentation.html' },
                { id: 'eye-cysa-ch05-lab', title: 'Ch 5 Lab: Vulnerability Scan Analysis', type: 'lab', href: 'houses/eye/cysa/labs/eye-cysa-ch05-vuln-scans.lab.html' },
                { id: 'eye-cysa-ch06-pres', title: 'Ch 6: Cloud Security', type: 'presentation', href: 'houses/eye/cysa/presentations/eye-cysa-ch06-cloud.presentation.html' },
                { id: 'eye-cysa-ch06-lab', title: 'Ch 6 Lab: Cloud Security Controls', type: 'lab', href: 'houses/eye/cysa/labs/eye-cysa-ch06-cloud.lab.html' },
                { id: 'eye-cysa-ch07-pres', title: 'Ch 7: Infrastructure Security & Controls', type: 'presentation', href: 'houses/eye/cysa/presentations/eye-cysa-ch07-infra.presentation.html' },
                { id: 'eye-cysa-ch07-lab', title: 'Ch 7 Lab: Infrastructure Security', type: 'lab', href: 'houses/eye/cysa/labs/eye-cysa-ch07-infra.lab.html' },
                { id: 'eye-cysa-ch08-pres', title: 'Ch 8: Identity & Access Management', type: 'presentation', href: 'houses/eye/cysa/presentations/eye-cysa-ch08-iam.presentation.html' },
                { id: 'eye-cysa-ch08-lab', title: 'Ch 8 Lab: IAM Security', type: 'lab', href: 'houses/eye/cysa/labs/eye-cysa-ch08-iam.lab.html' },
                { id: 'eye-cysa-ch09-pres', title: 'Ch 9: Software & Hardware Development Security', type: 'presentation', href: 'houses/eye/cysa/presentations/eye-cysa-ch09-dev-security.presentation.html' },
                { id: 'eye-cysa-ch09-lab', title: 'Ch 9 Lab: Development Security', type: 'lab', href: 'houses/eye/cysa/labs/eye-cysa-ch09-dev-security.lab.html' },
                { id: 'eye-cysa-ch10-pres', title: 'Ch 10: Security Operations & Monitoring', type: 'presentation', href: 'houses/eye/cysa/presentations/eye-cysa-ch10-secops.presentation.html' },
                { id: 'eye-cysa-ch10-lab', title: 'Ch 10 Lab: Security Operations', type: 'lab', href: 'houses/eye/cysa/labs/eye-cysa-ch10-secops.lab.html' },
                { id: 'eye-cysa-ch11-pres', title: 'Ch 11: Building an Incident Response Program', type: 'presentation', href: 'houses/eye/cysa/presentations/eye-cysa-ch11-ir.presentation.html' },
                { id: 'eye-cysa-ch11-lab', title: 'Ch 11 Lab: Incident Response', type: 'lab', href: 'houses/eye/cysa/labs/eye-cysa-ch11-ir.lab.html' },
                { id: 'eye-cysa-ch12-pres', title: 'Ch 12: Analyzing Indicators of Compromise', type: 'presentation', href: 'houses/eye/cysa/presentations/eye-cysa-ch12-ioc.presentation.html' },
                { id: 'eye-cysa-ch12-lab', title: 'Ch 12 Lab: IOC Analysis', type: 'lab', href: 'houses/eye/cysa/labs/eye-cysa-ch12-ioc.lab.html' },
                { id: 'eye-cysa-ch13-pres', title: 'Ch 13: Forensic Analysis & Techniques', type: 'presentation', href: 'houses/eye/cysa/presentations/eye-cysa-ch13-forensics.presentation.html' },
                { id: 'eye-cysa-ch13-lab', title: 'Ch 13 Lab: Digital Forensics', type: 'lab', href: 'houses/eye/cysa/labs/eye-cysa-ch13-forensics.lab.html' },
                { id: 'eye-cysa-ch14-pres', title: 'Ch 14: Containment, Eradication & Recovery', type: 'presentation', href: 'houses/eye/cysa/presentations/eye-cysa-ch14-recovery.presentation.html' },
                { id: 'eye-cysa-ch14-lab', title: 'Ch 14 Lab: Incident Recovery', type: 'lab', href: 'houses/eye/cysa/labs/eye-cysa-ch14-recovery.lab.html' },
                { id: 'eye-cysa-ch15-pres', title: 'Ch 15: Risk Management', type: 'presentation', href: 'houses/eye/cysa/presentations/eye-cysa-ch15-risk.presentation.html' },
                { id: 'eye-cysa-ch15-lab', title: 'Ch 15 Lab: Risk Management', type: 'lab', href: 'houses/eye/cysa/labs/eye-cysa-ch15-risk.lab.html' },
                { id: 'eye-cysa-ch16-pres', title: 'Ch 16: Policy & Compliance', type: 'presentation', href: 'houses/eye/cysa/presentations/eye-cysa-ch16-compliance.presentation.html' },
                { id: 'eye-cysa-ch16-lab', title: 'Ch 16 Lab: Policy & Compliance', type: 'lab', href: 'houses/eye/cysa/labs/eye-cysa-ch16-compliance.lab.html' }
            ]
        },

        // Windows Server Administration (AZ-800) — Cloud House
        'wsa': {
            name: 'Windows Server Administration',
            description: 'AZ-800 Windows Server Administration: installation, AD DS, storage, virtualization, networking, and security',
            icon: '/assets/images/icons/icon-desktop.webp',
            color: '#06b6d4',
            // Keiser course alignment (added 2026-05-28). Source syllabus:
            // /home/eq/hexworth-shared/Raw sources/Faculty docs/CTS1328C MS Managing and Maintaining Server Operating Systems.docx
            courseCode: 'CTS1328C',
            courseTitle: 'Managing and Maintaining Server Operating Systems',
            creditHours: 3.0,
            weeks: 4,
            textbook: {
                title: 'Hands-On Microsoft Windows Server 2019, 3rd Edition',
                author: 'Eckert',
                isbn: '9780357436158',
            },
            // 6 Course Objectives lifted verbatim from the syllabus. Modules
            // reference these by id via the `co` field below (e.g. `co: [1]`).
            courseObjectives: [
                { id: 1, text: 'Demonstrate the installation, configuration, and maintenance of a server environment by successful deployment.' },
                { id: 2, text: 'Successfully manage storage and file systems by demonstrating a well-designed and properly configured highly available storage solution and file services.' },
                { id: 3, text: 'Implement and configure virtualization solutions by demonstrating the successful deployment of a virtualized server/client environment.' },
                { id: 4, text: 'Deployment of highly available resources by the implementation of server clustering, failover clustering, and virtual machines.' },
                { id: 5, text: 'Demonstrate environment stability by implementing server monitoring techniques and backup strategies.' },
                { id: 6, text: 'Explain and demonstrate containers by implementing Nano Server image deployment.' },
            ],
            // Student Learning Outcomes (program level, per syllabus). SLO #4
            // is not listed in the CTS1328C syllabus (belongs to a different
            // concentration) so it is intentionally omitted here.
            slos: [
                { id: 'SLO1', text: 'Students will articulate and evaluate the needs for business-based technology practices within organizational objectives.' },
                { id: 'SLO2', text: 'Students will support the technology environment to maintain and advance organizational communications.' },
                { id: 'SLO3', text: 'Students can identify and explain differences between technical and human-based technical issues and provide solutions to those issues.' },
                { id: 'SLO5', text: 'Students can configure, secure, and troubleshoot issues to alleviate network risk and provide optimal/required network performance.' },
                { id: 'SLO6', text: 'Students will apply best practices and techniques to document complex configurations.' },
            ],
            // Grading rubric from syllabus. Totals 100. Instructor gradebook
            // owns the actual implementation; this is canonical reference only.
            gradingRubric: {
                quizzes: 15,
                homework: 10,
                labs: 30,
                final: 20,
                postTest: 5,
                professionalism: 10,
                discussions: 10,
            },
            modules: [
                // Phase 1: Foundation & Core Services
                {
                    id: 'wsa-module01',
                    title: 'Server Installation & Configuration',
                    type: 'presentation',
                    difficulty: 'beginner',
                    duration: '45 min',
                    href: 'houses/cloud/modules/wsa/m01-fundamentals/cloud-presentation.module.html',
                    prerequisites: [],
                    // Syllabus alignment: Week 1 covers COs 1 and 2 per the
                    // syllabus topical outline. M01 (server install +
                    // configuration) maps to CO 1; storage/file systems
                    // belong in m03. M01 also touches SLO #5 (configure +
                    // troubleshoot for optimal network performance).
                    co: [1],
                    slo: ['SLO5'],
                    syllabusWeek: 1,
                },
                {
                    id: 'wsa-module02',
                    title: 'Active Directory Domain Services',
                    type: 'presentation',
                    difficulty: 'beginner',
                    duration: '50 min',
                    href: 'houses/cloud/modules/wsa/m02-active-directory/cloud-presentation.module.html',
                    prerequisites: ['wsa-module01'],
                    co: [1],
                    slo: ["SLO5"],
                    syllabusWeek: 1,
                },
                {
                    id: 'wsa-module03',
                    title: 'Storage & File Systems',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '45 min',
                    href: 'houses/cloud/modules/wsa/m03-storage/cloud-presentation.module.html',
                    prerequisites: ['wsa-module02'],
                    co: [2],
                    slo: ["SLO5"],
                    syllabusWeek: 1,
                },
                {
                    id: 'wsa-module04',
                    title: 'Hyper-V Virtualization',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '50 min',
                    href: 'houses/cloud/modules/wsa/m04-hyperv/cloud-presentation.module.html',
                    prerequisites: ['wsa-module03'],
                    co: [3],
                    slo: ["SLO5"],
                    syllabusWeek: 2,
                },
                {
                    id: 'wsa-module05',
                    title: 'Docker Containers',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '45 min',
                    href: 'houses/cloud/modules/wsa/m05-containers/cloud-presentation.module.html',
                    prerequisites: ['wsa-module04'],
                    co: [6],
                    slo: ["SLO5"],
                    syllabusWeek: 4,
                },
                {
                    id: 'wsa-module06',
                    title: 'Failover Clustering',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '45 min',
                    href: 'houses/cloud/modules/wsa/m06-clustering/cloud-presentation.module.html',
                    prerequisites: ['wsa-module05'],
                    co: [4],
                    slo: ["SLO5"],
                    syllabusWeek: 2,
                },
                {
                    id: 'wsa-module07',
                    title: 'Monitoring & Performance',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '40 min',
                    href: 'houses/cloud/modules/wsa/m07-monitoring/cloud-presentation.module.html',
                    prerequisites: ['wsa-module06'],
                    co: [5],
                    slo: ["SLO5","SLO6"],
                    syllabusWeek: 3,
                },
                {
                    id: 'wsa-module08',
                    title: 'DNS & Name Resolution',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '45 min',
                    href: 'houses/cloud/modules/wsa/m08-dns/cloud-presentation.module.html',
                    prerequisites: ['wsa-module07'],
                    co: [],
                    slo: ["SLO5"],
                },
                {
                    id: 'wsa-module09',
                    title: 'DHCP Services',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '40 min',
                    href: 'houses/cloud/modules/wsa/m09-dhcp/cloud-presentation.module.html',
                    prerequisites: ['wsa-module08'],
                    co: [],
                    slo: ["SLO5"],
                },
                {
                    id: 'wsa-module10',
                    title: 'Group Policy',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '50 min',
                    href: 'houses/cloud/modules/wsa/m10-group-policy/cloud-presentation.module.html',
                    prerequisites: ['wsa-module09'],
                    co: [1],
                    slo: ["SLO5"],
                    syllabusWeek: 1,
                },
                // Phase 2: Advanced Services & Operations
                {
                    id: 'wsa-module11',
                    title: 'IIS & Web Services',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '45 min',
                    href: 'houses/cloud/modules/wsa/m11-iis/cloud-presentation.module.html',
                    prerequisites: ['wsa-module10'],
                    co: [],
                    slo: ["SLO5"],
                },
                {
                    id: 'wsa-module12',
                    title: 'Remote Desktop Services',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '40 min',
                    href: 'houses/cloud/modules/wsa/m12-remote-desktop/cloud-presentation.module.html',
                    prerequisites: ['wsa-module11'],
                    co: [],
                    slo: ["SLO5"],
                },
                {
                    id: 'wsa-module13',
                    title: 'Certificate Services (PKI)',
                    type: 'presentation',
                    difficulty: 'advanced',
                    duration: '45 min',
                    href: 'houses/cloud/modules/wsa/m13-certificate-services/cloud-presentation.module.html',
                    prerequisites: ['wsa-module12'],
                    co: [],
                    slo: ["SLO5"],
                },
                {
                    id: 'wsa-module14',
                    title: 'Advanced Networking',
                    type: 'presentation',
                    difficulty: 'advanced',
                    duration: '45 min',
                    href: 'houses/cloud/modules/wsa/m14-advanced-networking/cloud-presentation.module.html',
                    prerequisites: ['wsa-module13'],
                    co: [],
                    slo: ["SLO5"],
                },
                {
                    id: 'wsa-module15',
                    title: 'AD Sites & Replication',
                    type: 'presentation',
                    difficulty: 'advanced',
                    duration: '40 min',
                    href: 'houses/cloud/modules/wsa/m15-ad-sites/cloud-presentation.module.html',
                    prerequisites: ['wsa-module14'],
                    co: [1],
                    slo: ["SLO5"],
                    syllabusWeek: 1,
                },
                {
                    id: 'wsa-module16',
                    title: 'Backup & Disaster Recovery',
                    type: 'presentation',
                    difficulty: 'advanced',
                    duration: '45 min',
                    href: 'houses/cloud/modules/wsa/m16-backup-recovery/cloud-presentation.module.html',
                    prerequisites: ['wsa-module15'],
                    co: [5],
                    slo: ["SLO5"],
                    syllabusWeek: 3,
                },
                {
                    id: 'wsa-module17',
                    title: 'Windows Firewall & Security',
                    type: 'presentation',
                    difficulty: 'advanced',
                    duration: '45 min',
                    href: 'houses/cloud/modules/wsa/m17-firewall-security/cloud-presentation.module.html',
                    prerequisites: ['wsa-module16'],
                    co: [],
                    slo: ["SLO5"],
                },
                {
                    id: 'wsa-module18',
                    title: 'PowerShell Automation',
                    type: 'presentation',
                    difficulty: 'advanced',
                    duration: '50 min',
                    href: 'houses/cloud/modules/wsa/m18-powershell-automation/cloud-presentation.module.html',
                    prerequisites: ['wsa-module17'],
                    co: [],
                    slo: ["SLO6"],
                },
                {
                    id: 'wsa-module19',
                    title: 'Troubleshooting & Migration',
                    type: 'presentation',
                    difficulty: 'advanced',
                    duration: '45 min',
                    href: 'houses/cloud/modules/wsa/m19-troubleshooting-migration/cloud-presentation.module.html',
                    prerequisites: ['wsa-module18'],
                    co: [],
                    slo: ["SLO5"],
                },
                // Capstone
                {
                    id: 'wsa-module20-failsafe',
                    title: 'Failsafe Protocol (Capstone)',
                    type: 'lab',
                    difficulty: 'advanced',
                    duration: '90 min',
                    href: 'houses/cloud/modules/wsa/m20-failsafe-capstone/index.html',
                    prerequisites: ['wsa-module19']
                }
            ]
        },

        // CompTIA Security+ SY0-701 — Shield House
        'security-plus': {
            name: 'CompTIA Security+ (SY0-701)',
            description: 'Complete Security+ certification prep covering general security concepts, threats, architecture, operations, and program management',
            icon: '/assets/images/icons/icon-padlock.webp',
            color: '#a855f7',
            courseHref: 'houses/shield/security-plus/index.html',
            modules: [
                // Domain 1: General Security Concepts
                {
                    id: 'shield-cia-triad',
                    title: 'CIA Triad Fundamentals',
                    type: 'presentation',
                    difficulty: 'beginner',
                    duration: '20 min',
                    href: 'houses/shield/presentations/shield-cia-triad.presentation.html',
                    prerequisites: []
                },
                {
                    id: 'shield-cia-quiz',
                    title: 'CIA Triad Challenge',
                    type: 'quiz',
                    difficulty: 'beginner',
                    duration: '15 min',
                    href: 'houses/shield/quizzes/shield-cia-triad.quiz.html',
                    prerequisites: ['shield-cia-triad']
                },
                {
                    id: 'shield-security-pres',
                    title: 'Security Fundamentals',
                    type: 'presentation',
                    difficulty: 'beginner',
                    duration: '30 min',
                    href: 'houses/shield/presentations/shield-security.presentation.html',
                    prerequisites: ['shield-cia-quiz']
                },
                {
                    id: 'shield-controls',
                    title: 'Cybersecurity Controls',
                    type: 'applet',
                    difficulty: 'beginner',
                    duration: '25 min',
                    href: 'houses/shield/applets/fundamentals/cybersecurity_controls/shield-cybersecurity-controls.applet.html',
                    prerequisites: ['shield-security-pres']
                },
                {
                    id: 'shield-design-principles',
                    title: 'Security Design Principles',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'houses/shield/applets/fundamentals/design_principles/shield-cybersecuritydesignprinciples.applet.html',
                    prerequisites: ['shield-controls']
                },
                {
                    id: 'shield-fundamentals-lab',
                    title: 'Security Fundamentals Lab',
                    type: 'lab',
                    difficulty: 'beginner',
                    duration: '30 min',
                    href: 'houses/shield/labs/shield-security-fundamentals.lab.html',
                    prerequisites: ['shield-design-principles']
                },
                // Domain 2: Threats, Vulnerabilities, and Mitigations
                {
                    id: 'shield-threat-types',
                    title: 'Threats & Attacks',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'houses/shield/applets/threats/attacks_malware/shield-threat-attacks-malware.applet.html',
                    prerequisites: ['shield-fundamentals-lab']
                },
                {
                    id: 'shield-phishing',
                    title: 'Social Engineering',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'houses/shield/applets/threats/phishing/shield-threat-phishing.applet.html',
                    prerequisites: ['shield-threat-types']
                },
                {
                    id: 'shield-threat-xss',
                    title: 'Web Application Attacks',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'houses/shield/applets/threats/xss/shield-threat-xss.applet.html',
                    prerequisites: ['shield-phishing']
                },
                {
                    id: 'shield-threats-quiz',
                    title: 'Threats & Vulnerabilities Challenge',
                    type: 'quiz',
                    difficulty: 'intermediate',
                    duration: '20 min',
                    href: 'houses/shield/quizzes/shield-threats.quiz.html',
                    prerequisites: ['shield-threat-xss']
                },
                {
                    id: 'shield-threats-lab',
                    title: 'Threats Lab',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '35 min',
                    href: 'houses/shield/labs/shield-threats.lab.html',
                    prerequisites: ['shield-threats-quiz']
                },
                // Domain 3: Security Architecture
                {
                    id: 'shield-network-security',
                    title: 'Network Security',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'houses/shield/applets/network/firewalls/shield-firewalls.applet.html',
                    prerequisites: ['shield-threats-lab']
                },
                {
                    id: 'shield-ids-ips',
                    title: 'IDS/IPS',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'houses/shield/applets/network/ids_ips/shield-ids-ips.applet.html',
                    prerequisites: ['shield-network-security']
                },
                {
                    id: 'shield-vpn',
                    title: 'VPN Technologies',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'houses/shield/applets/network/vpn/shield-vpn.applet.html',
                    prerequisites: ['shield-ids-ips']
                },
                {
                    id: 'shield-crypto-intro',
                    title: 'Cryptography Essentials',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '35 min',
                    href: 'houses/shield/applets/crypto/cryptography_intro/shield-crypto-cryptography-intro.applet.html',
                    prerequisites: ['shield-vpn']
                },
                {
                    id: 'shield-network-quiz',
                    title: 'Network Security Challenge',
                    type: 'quiz',
                    difficulty: 'intermediate',
                    duration: '20 min',
                    href: 'houses/shield/quizzes/shield-network-security.quiz.html',
                    prerequisites: ['shield-crypto-intro']
                },
                {
                    id: 'shield-network-lab',
                    title: 'Network Security Lab',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '35 min',
                    href: 'houses/shield/labs/shield-network-security.lab.html',
                    prerequisites: ['shield-network-quiz']
                },
                // Domain 4: Security Operations
                {
                    id: 'shield-access-control',
                    title: 'Access Control',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'houses/shield/applets/access/access_control/shield-access-control.applet.html',
                    prerequisites: ['shield-network-lab']
                },
                {
                    id: 'shield-biometrics',
                    title: 'Biometrics',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '20 min',
                    href: 'houses/shield/applets/access/biometrics/shield-biometrics.applet.html',
                    prerequisites: ['shield-access-control']
                },
                {
                    id: 'shield-kerberos',
                    title: 'Kerberos Authentication',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '20 min',
                    href: 'houses/shield/applets/access/kerberos/shield-kerberos.applet.html',
                    prerequisites: ['shield-biometrics']
                },
                {
                    id: 'shield-incident-sim',
                    title: 'Incident Response',
                    type: 'tool',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'houses/shield/tools/shield-incident-response.tool.html',
                    prerequisites: ['shield-kerberos']
                },
                {
                    id: 'cse-06-monitoring',
                    title: 'Security Monitoring & Incident Response',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'houses/shield/presentations/shield-cse-06-security-monitoring-incident-response.presentation.html',
                    prerequisites: ['shield-incident-sim']
                },
                {
                    id: 'shield-access-quiz',
                    title: 'Access Control Challenge',
                    type: 'quiz',
                    difficulty: 'intermediate',
                    duration: '15 min',
                    href: 'houses/shield/quizzes/shield-access-control.quiz.html',
                    prerequisites: ['cse-06-monitoring']
                },
                {
                    id: 'shield-access-lab',
                    title: 'Access Control Lab',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'houses/shield/labs/shield-access-control.lab.html',
                    prerequisites: ['shield-access-quiz']
                },
                // Domain 5: Security Program Management
                {
                    id: 'shield-risk-management',
                    title: 'Risk Management',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'houses/shield/applets/risk/risk_management/shield-risk-management.applet.html',
                    prerequisites: ['shield-access-lab']
                },
                {
                    id: 'shield-risk-analysis',
                    title: 'Risk Analysis',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'houses/shield/applets/risk/risk_analysis/shield-risk-analysis.applet.html',
                    prerequisites: ['shield-risk-management']
                },
                {
                    id: 'cse-07-risk',
                    title: 'Risk Assessment & Management',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'houses/shield/presentations/shield-cse-07-risk-assessment-management.presentation.html',
                    prerequisites: ['shield-risk-analysis']
                },
                {
                    id: 'cse-08-compliance',
                    title: 'Compliance & Governance',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'houses/shield/presentations/shield-cse-08-compliance-governance.presentation.html',
                    prerequisites: ['cse-07-risk']
                },
                {
                    id: 'shield-framework-selector',
                    title: 'Security Frameworks',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'houses/shield/applets/compliance/shield-framework-selector.applet.html',
                    prerequisites: ['cse-08-compliance']
                },
                {
                    id: 'shield-compliance-lab',
                    title: 'Compliance Lab',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'houses/shield/labs/shield-compliance.lab.html',
                    prerequisites: ['shield-framework-selector']
                },
                // Final Assessment
                {
                    id: 'shield-fundamentals-quiz',
                    title: 'Security+ Comprehensive Challenge',
                    type: 'quiz',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'houses/shield/quizzes/shield-security-fundamentals.quiz.html',
                    prerequisites: ['shield-compliance-lab']
                }
            ]
        },

        // CompTIA Network+ N10-009 — Web House
        'comptia-network': {
            name: 'CompTIA Network+ (N10-009)',
            description: 'Complete Network+ certification prep covering networking concepts, implementation, operations, security, and troubleshooting',
            icon: '/assets/images/icons/icon-globe.webp',
            color: '#3b82f6',
            courseHref: 'houses/web/network-plus/index.html',
            modules: [
                // Domain 1: Networking Concepts
                {
                    id: 'web-osi-model-pres',
                    title: 'OSI Model Fundamentals',
                    type: 'presentation',
                    difficulty: 'beginner',
                    duration: '25 min',
                    href: 'houses/web/presentations/web-osi-model.presentation.html',
                    prerequisites: []
                },
                {
                    id: 'web-osi-quiz',
                    title: 'OSI Model Challenge',
                    type: 'quiz',
                    difficulty: 'beginner',
                    duration: '15 min',
                    href: 'houses/web/quizzes/web-osi.quiz.html',
                    prerequisites: ['web-osi-model-pres']
                },
                {
                    id: 'web-tcpip',
                    title: 'TCP/IP Fundamentals',
                    type: 'presentation',
                    difficulty: 'beginner',
                    duration: '30 min',
                    href: 'houses/web/presentations/web-tcp.presentation.html',
                    prerequisites: ['web-osi-quiz']
                },
                {
                    id: 'web-ip-binary-ip',
                    title: 'IP Addressing',
                    type: 'applet',
                    difficulty: 'beginner',
                    duration: '30 min',
                    href: 'houses/web/applets/ip-addressing/binary-ip/web-ip-binary-ip.applet.html',
                    prerequisites: ['web-tcpip']
                },
                {
                    id: 'web-subnetting-pres',
                    title: 'Subnetting Fundamentals',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '40 min',
                    href: 'houses/web/presentations/web-subnetting.presentation.html',
                    prerequisites: ['web-ip-binary-ip']
                },
                {
                    id: 'web-subnetting-quiz',
                    title: 'Subnetting Challenge',
                    type: 'quiz',
                    difficulty: 'intermediate',
                    duration: '20 min',
                    href: 'houses/web/quizzes/web-subnetting.quiz.html',
                    prerequisites: ['web-subnetting-pres']
                },
                {
                    id: 'web-ipv6-pres',
                    title: 'IPv6 Addressing',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'houses/web/presentations/web-ipv6.presentation.html',
                    prerequisites: ['web-subnetting-quiz']
                },
                {
                    id: 'web-ports-pres',
                    title: 'Ports & Protocols',
                    type: 'presentation',
                    difficulty: 'beginner',
                    duration: '25 min',
                    href: 'houses/web/presentations/web-ports.presentation.html',
                    prerequisites: ['web-ipv6-pres']
                },
                {
                    id: 'web-ports-quiz',
                    title: 'Ports & Protocols Challenge',
                    type: 'quiz',
                    difficulty: 'beginner',
                    duration: '15 min',
                    href: 'houses/web/quizzes/web-networking-fundamentals-ports.quiz.html',
                    prerequisites: ['web-ports-pres']
                },
                // Domain 2: Network Implementation
                {
                    id: 'web-cables-pres',
                    title: 'Network Cabling',
                    type: 'presentation',
                    difficulty: 'beginner',
                    duration: '20 min',
                    href: 'houses/web/presentations/web-cables.presentation.html',
                    prerequisites: ['web-ports-quiz']
                },
                {
                    id: 'web-devices-pres',
                    title: 'Network Devices',
                    type: 'presentation',
                    difficulty: 'beginner',
                    duration: '25 min',
                    href: 'houses/web/presentations/web-devices.presentation.html',
                    prerequisites: ['web-cables-pres']
                },
                {
                    id: 'web-switch-ops-pres',
                    title: 'Network Switching',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'houses/web/presentations/web-switch-operations.presentation.html',
                    prerequisites: ['web-devices-pres']
                },
                {
                    id: 'web-switching',
                    title: 'VLAN Configuration',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '35 min',
                    href: 'houses/web/presentations/web-vlan.presentation.html',
                    prerequisites: ['web-switch-ops-pres']
                },
                {
                    id: 'web-stp',
                    title: 'Spanning Tree Protocol',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'houses/web/presentations/web-stp.presentation.html',
                    prerequisites: ['web-switching']
                },
                {
                    id: 'web-topologies-pres',
                    title: 'Routing Fundamentals',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '35 min',
                    href: 'houses/web/presentations/web-topologies.presentation.html',
                    prerequisites: ['web-stp']
                },
                {
                    id: 'web-routing',
                    title: 'OSPF Protocol',
                    type: 'presentation',
                    difficulty: 'advanced',
                    duration: '40 min',
                    href: 'houses/web/presentations/web-ospf.presentation.html',
                    prerequisites: ['web-topologies-pres']
                },
                {
                    id: 'web-wireless',
                    title: 'Wireless Networking',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'houses/web/presentations/web-wireless.presentation.html',
                    prerequisites: ['web-routing']
                },
                {
                    id: 'web-wireless-arch-pres',
                    title: 'Wireless Architecture',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'houses/web/presentations/web-wireless-architecture.presentation.html',
                    prerequisites: ['web-wireless']
                },
                // Domain 3: Network Operations
                {
                    id: 'web-dns-pres',
                    title: 'DNS Services',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'houses/web/presentations/web-dns.presentation.html',
                    prerequisites: ['web-wireless-arch-pres']
                },
                {
                    id: 'web-dhcp-pres',
                    title: 'DHCP Services',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '20 min',
                    href: 'houses/web/presentations/web-dhcp.presentation.html',
                    prerequisites: ['web-dns-pres']
                },
                {
                    id: 'web-nat-pres',
                    title: 'NAT & PAT',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'houses/web/presentations/web-nat.presentation.html',
                    prerequisites: ['web-dhcp-pres']
                },
                {
                    id: 'web-networking-ch7-10',
                    title: 'Networking Chapters 7-10 Challenge',
                    type: 'quiz',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'houses/web/quizzes/web-networking-ch7-10.quiz.html',
                    prerequisites: ['web-nat-pres']
                },
                // Domain 4: Network Security
                {
                    id: 'web-security-viz',
                    title: 'Network Security Tools',
                    type: 'tool',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'houses/web/tools/web-security.tool.html',
                    prerequisites: ['web-networking-ch7-10']
                },
                {
                    id: 'web-acl-viz',
                    title: 'Access Control Lists',
                    type: 'tool',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'houses/web/tools/web-acl.tool.html',
                    prerequisites: ['web-security-viz']
                },
                // Domain 5: Network Troubleshooting
                {
                    id: 'web-troubleshoot-pres',
                    title: 'Network Troubleshooting',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '35 min',
                    href: 'houses/web/presentations/web-troubleshooting.presentation.html',
                    prerequisites: ['web-acl-viz']
                },
                {
                    id: 'web-troubleshoot-viz',
                    title: 'Troubleshooting Toolkit',
                    type: 'tool',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'houses/web/tools/web-troubleshooting.tool.html',
                    prerequisites: ['web-troubleshoot-pres']
                },
                {
                    id: 'web-static-routes-lab',
                    title: 'Static Routes Lab',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'houses/web/labs/web-static-routes.lab.html',
                    prerequisites: ['web-troubleshoot-viz']
                },
                // Hands-on & Final
                {
                    id: 'web-network-sim-v2',
                    title: 'Network Simulator Lab',
                    type: 'lab',
                    difficulty: 'advanced',
                    duration: '60 min',
                    href: 'houses/web/simulators/web-interactive-network-simulatorv2.simulator.html',
                    prerequisites: ['web-static-routes-lab']
                },
                {
                    id: 'web-networking-final',
                    title: 'Network+ Final Review',
                    type: 'quiz',
                    difficulty: 'advanced',
                    duration: '30 min',
                    href: 'houses/web/quizzes/web-networking-final-review.quiz.html',
                    prerequisites: ['web-network-sim-v2']
                }
            ]
        },

        // Cryptography Track — Key House (Primary Learning Path)
        'cryptography-track': {
            name: 'Cryptography Track',
            description: 'Master cryptography from fundamentals through post-quantum: symmetric, asymmetric, hashing, PKI, digital signatures, key management, and beyond',
            icon: '/assets/images/icons/icon-padlock.webp',
            color: '#eab308',
            courseHref: 'houses/cryptography-track/index.html',
            modules: [
                // Foundation
                {
                    id: 'key-encryption-basics',
                    title: 'Encryption Basics',
                    type: 'presentation',
                    difficulty: 'beginner',
                    duration: '25 min',
                    href: 'houses/key/presentations/key-encryption-basics.presentation.html',
                    prerequisites: []
                },
                {
                    id: 'key-cryptography-fundamentals',
                    title: 'Cryptography Fundamentals (CEH)',
                    type: 'presentation',
                    difficulty: 'beginner',
                    duration: '35 min',
                    href: 'houses/key/presentations/key-cryptography-fundamentals.presentation.html',
                    prerequisites: ['key-encryption-basics']
                },
                // Symmetric Encryption
                {
                    id: 'key-symmetric-vs-asymmetric',
                    title: 'Symmetric Encryption',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'houses/key/presentations/key-advanced-symmetric.presentation.html',
                    prerequisites: ['key-cryptography-fundamentals']
                },
                {
                    id: 'key-aes-explorer',
                    title: 'AES Explorer',
                    type: 'tool',
                    difficulty: 'intermediate',
                    duration: '35 min',
                    href: 'houses/key/tools/key-aes.tool.html',
                    prerequisites: ['key-symmetric-vs-asymmetric']
                },
                {
                    id: 'key-aes-lab',
                    title: 'AES Encryption Lab',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '45 min',
                    href: 'houses/key/labs/key-aes.lab.html',
                    prerequisites: ['key-aes-explorer']
                },
                {
                    id: 'key-symmetric-quiz',
                    title: 'Symmetric Encryption Quiz',
                    type: 'quiz',
                    difficulty: 'intermediate',
                    duration: '15 min',
                    href: 'houses/key/quizzes/key-symmetric.quiz.html',
                    prerequisites: ['key-aes-lab']
                },
                // Hashing & Integrity
                {
                    id: 'key-hash-stego-intro',
                    title: 'Hash & Steganography Intro',
                    type: 'presentation',
                    difficulty: 'beginner',
                    duration: '30 min',
                    href: 'houses/key/modules/key-hash-stego-intro.module.html',
                    prerequisites: ['key-symmetric-quiz']
                },
                {
                    id: 'shield-crypto-hmac',
                    title: 'Message Authentication (HMAC)',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'houses/key/presentations/key-message-authentication.presentation.html',
                    prerequisites: ['key-hash-stego-intro']
                },
                {
                    id: 'key-hashing-integrity',
                    title: 'HMAC Tool',
                    type: 'tool',
                    difficulty: 'intermediate',
                    duration: '20 min',
                    href: 'houses/key/tools/key-hmac.tool.html',
                    prerequisites: ['shield-crypto-hmac']
                },
                {
                    id: 'key-hmac-lab',
                    title: 'HMAC Lab',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '45 min',
                    href: 'houses/key/labs/key-hmac.lab.html',
                    prerequisites: ['key-hashing-integrity']
                },
                {
                    id: 'key-mac-quiz',
                    title: 'Message Authentication Quiz',
                    type: 'quiz',
                    difficulty: 'intermediate',
                    duration: '15 min',
                    href: 'houses/key/quizzes/key-mac.quiz.html',
                    prerequisites: ['key-hmac-lab']
                },
                // Asymmetric / ECC
                {
                    id: 'key-elliptic-curve',
                    title: 'Elliptic Curve Cryptography',
                    type: 'presentation',
                    difficulty: 'advanced',
                    duration: '35 min',
                    href: 'houses/key/presentations/key-elliptic-curve.presentation.html',
                    prerequisites: ['key-mac-quiz']
                },
                {
                    id: 'key-ecc-visualizer',
                    title: 'ECC Visualizer',
                    type: 'tool',
                    difficulty: 'advanced',
                    duration: '20 min',
                    href: 'houses/key/tools/key-ecc.tool.html',
                    prerequisites: ['key-elliptic-curve']
                },
                {
                    id: 'key-ecc-lab',
                    title: 'Elliptic Curve Lab',
                    type: 'lab',
                    difficulty: 'advanced',
                    duration: '45 min',
                    href: 'houses/key/labs/key-ecc.lab.html',
                    prerequisites: ['key-ecc-visualizer']
                },
                {
                    id: 'key-ecc-quiz',
                    title: 'ECC Quiz',
                    type: 'quiz',
                    difficulty: 'advanced',
                    duration: '15 min',
                    href: 'houses/key/quizzes/key-ecc.quiz.html',
                    prerequisites: ['key-ecc-lab']
                },
                // PKI & Digital Signatures
                {
                    id: 'key-pki-deep-dive',
                    title: 'Digital Certificates & PKI',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'houses/key/presentations/key-certificates.presentation.html',
                    prerequisites: ['key-ecc-quiz']
                },
                {
                    id: 'key-digital-signatures',
                    title: 'Certificate Tool',
                    type: 'tool',
                    difficulty: 'intermediate',
                    duration: '20 min',
                    href: 'houses/key/tools/key-cert.tool.html',
                    prerequisites: ['key-pki-deep-dive']
                },
                {
                    id: 'key-cert-lab',
                    title: 'Certificate Lab',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '45 min',
                    href: 'houses/key/labs/key-cert.lab.html',
                    prerequisites: ['key-digital-signatures']
                },
                {
                    id: 'key-cert-quiz',
                    title: 'Certificates Quiz',
                    type: 'quiz',
                    difficulty: 'intermediate',
                    duration: '15 min',
                    href: 'houses/key/quizzes/key-cert.quiz.html',
                    prerequisites: ['key-cert-lab']
                },
                // Key Derivation & Management
                {
                    id: 'key-key-derivation',
                    title: 'Key Derivation Functions',
                    type: 'presentation',
                    difficulty: 'advanced',
                    duration: '30 min',
                    href: 'houses/key/presentations/key-derivation.presentation.html',
                    prerequisites: ['key-cert-quiz']
                },
                {
                    id: 'key-kdf-analyzer',
                    title: 'KDF Analyzer',
                    type: 'tool',
                    difficulty: 'advanced',
                    duration: '20 min',
                    href: 'houses/key/tools/key-kdf.tool.html',
                    prerequisites: ['key-key-derivation']
                },
                {
                    id: 'key-kdf-lab',
                    title: 'Key Derivation Lab',
                    type: 'lab',
                    difficulty: 'advanced',
                    duration: '45 min',
                    href: 'houses/key/labs/key-kdf.lab.html',
                    prerequisites: ['key-kdf-analyzer']
                },
                {
                    id: 'key-kdf-quiz',
                    title: 'KDF Quiz',
                    type: 'quiz',
                    difficulty: 'advanced',
                    duration: '15 min',
                    href: 'houses/key/quizzes/key-kdf.quiz.html',
                    prerequisites: ['key-kdf-lab']
                },
                {
                    id: 'key-key-management',
                    title: 'Key Management',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'houses/key/presentations/key-management.presentation.html',
                    prerequisites: ['key-kdf-quiz']
                },
                {
                    id: 'key-lifecycle',
                    title: 'Key Lifecycle Manager',
                    type: 'tool',
                    difficulty: 'intermediate',
                    duration: '20 min',
                    href: 'houses/key/tools/key-lifecycle.tool.html',
                    prerequisites: ['key-key-management']
                },
                // HSM
                {
                    id: 'key-hsm-lab',
                    title: 'Hardware Security Module Lab',
                    type: 'lab',
                    difficulty: 'advanced',
                    duration: '45 min',
                    href: 'houses/key/labs/key-hsm.lab.html',
                    prerequisites: ['key-lifecycle']
                },
                {
                    id: 'key-hsm-quiz',
                    title: 'HSM Quiz',
                    type: 'quiz',
                    difficulty: 'advanced',
                    duration: '15 min',
                    href: 'houses/key/quizzes/key-hsm.quiz.html',
                    prerequisites: ['key-hsm-lab']
                },
                // Cryptanalysis & Attacks
                {
                    id: 'key-cryptanalysis',
                    title: 'Cryptanalysis',
                    type: 'presentation',
                    difficulty: 'advanced',
                    duration: '25 min',
                    href: 'houses/key/presentations/key-cryptanalysis.presentation.html',
                    prerequisites: ['key-hsm-quiz']
                },
                {
                    id: 'key-cryptanalysis-tool',
                    title: 'Cryptanalysis Lab',
                    type: 'lab',
                    difficulty: 'advanced',
                    duration: '45 min',
                    href: 'houses/key/labs/key-cryptanalysis.lab.html',
                    prerequisites: ['key-cryptanalysis']
                },
                {
                    id: 'key-attack-lab',
                    title: 'Cryptographic Attack Lab',
                    type: 'lab',
                    difficulty: 'advanced',
                    duration: '45 min',
                    href: 'houses/key/labs/key-attack.lab.html',
                    prerequisites: ['key-cryptanalysis-tool']
                },
                {
                    id: 'key-cryptanalysis-quiz',
                    title: 'Cryptanalysis Quiz',
                    type: 'quiz',
                    difficulty: 'advanced',
                    duration: '15 min',
                    href: 'houses/key/quizzes/key-cryptanalysis.quiz.html',
                    prerequisites: ['key-attack-lab']
                },
                // Post-Quantum
                {
                    id: 'key-post-quantum',
                    title: 'Post-Quantum Cryptography',
                    type: 'presentation',
                    difficulty: 'advanced',
                    duration: '35 min',
                    href: 'houses/key/presentations/key-post-quantum.presentation.html',
                    prerequisites: ['key-cryptanalysis-quiz']
                },
                {
                    id: 'key-pqc-explorer',
                    title: 'PQC Explorer',
                    type: 'tool',
                    difficulty: 'advanced',
                    duration: '20 min',
                    href: 'houses/key/tools/key-pqc.tool.html',
                    prerequisites: ['key-post-quantum']
                },
                {
                    id: 'key-pqc-lab',
                    title: 'Post-Quantum Crypto Lab',
                    type: 'lab',
                    difficulty: 'advanced',
                    duration: '45 min',
                    href: 'houses/key/labs/key-pqc.lab.html',
                    prerequisites: ['key-pqc-explorer']
                },
                {
                    id: 'key-pqc-quiz',
                    title: 'PQC Quiz',
                    type: 'quiz',
                    difficulty: 'advanced',
                    duration: '15 min',
                    href: 'houses/key/quizzes/key-pqc.quiz.html',
                    prerequisites: ['key-pqc-lab']
                }
            ]
        },

        // Security+ Cryptography Domain — Key House
        // Focused subset of Security+ SY0-701 cryptography objectives
        'security-plus-crypto': {
            name: 'Security+ Cryptography Domain',
            description: 'CompTIA Security+ SY0-701 cryptography objectives: symmetric/asymmetric encryption, hashing, PKI, digital signatures, and key exchange',
            icon: '/assets/images/icons/icon-shield.webp',
            color: '#eab308',
            courseHref: 'houses/shield/security-plus/index.html',
            modules: [
                // Crypto Foundations (maps to SY0-701 Domain 1.4)
                {
                    id: 'key-encryption-basics',
                    title: 'Encryption Basics',
                    type: 'presentation',
                    difficulty: 'beginner',
                    duration: '25 min',
                    href: 'houses/key/presentations/key-encryption-basics.presentation.html',
                    prerequisites: []
                },
                // Symmetric Encryption (maps to SY0-701 3.7)
                {
                    id: 'key-symmetric-vs-asymmetric',
                    title: 'Symmetric Encryption',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'houses/key/presentations/key-advanced-symmetric.presentation.html',
                    prerequisites: ['key-encryption-basics']
                },
                {
                    id: 'key-aes-explorer',
                    title: 'AES Explorer',
                    type: 'tool',
                    difficulty: 'intermediate',
                    duration: '35 min',
                    href: 'houses/key/tools/key-aes.tool.html',
                    prerequisites: ['key-symmetric-vs-asymmetric']
                },
                {
                    id: 'key-symmetric-quiz',
                    title: 'Symmetric Encryption Quiz',
                    type: 'quiz',
                    difficulty: 'intermediate',
                    duration: '15 min',
                    href: 'houses/key/quizzes/key-symmetric.quiz.html',
                    prerequisites: ['key-aes-explorer']
                },
                // Hashing (maps to SY0-701 1.4)
                {
                    id: 'key-message-auth',
                    title: 'Hashing & Message Authentication',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'houses/key/presentations/key-message-authentication.presentation.html',
                    prerequisites: ['key-symmetric-quiz']
                },
                {
                    id: 'key-hashing-integrity',
                    title: 'HMAC Tool',
                    type: 'tool',
                    difficulty: 'intermediate',
                    duration: '20 min',
                    href: 'houses/key/tools/key-hmac.tool.html',
                    prerequisites: ['key-message-auth']
                },
                {
                    id: 'key-mac-quiz',
                    title: 'Message Authentication Quiz',
                    type: 'quiz',
                    difficulty: 'intermediate',
                    duration: '15 min',
                    href: 'houses/key/quizzes/key-mac.quiz.html',
                    prerequisites: ['key-hashing-integrity']
                },
                // Asymmetric / Key Exchange (maps to SY0-701 3.7)
                {
                    id: 'key-elliptic-curve',
                    title: 'Asymmetric Encryption & ECC',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '35 min',
                    href: 'houses/key/presentations/key-elliptic-curve.presentation.html',
                    prerequisites: ['key-mac-quiz']
                },
                {
                    id: 'key-ecc-quiz',
                    title: 'ECC Quiz',
                    type: 'quiz',
                    difficulty: 'intermediate',
                    duration: '15 min',
                    href: 'houses/key/quizzes/key-ecc.quiz.html',
                    prerequisites: ['key-elliptic-curve']
                },
                // PKI & Digital Signatures (maps to SY0-701 1.4, 3.7)
                {
                    id: 'key-pki-deep-dive',
                    title: 'PKI & Digital Certificates',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'houses/key/presentations/key-certificates.presentation.html',
                    prerequisites: ['key-ecc-quiz']
                },
                {
                    id: 'key-digital-signatures',
                    title: 'Certificate Tool',
                    type: 'tool',
                    difficulty: 'intermediate',
                    duration: '20 min',
                    href: 'houses/key/tools/key-cert.tool.html',
                    prerequisites: ['key-pki-deep-dive']
                },
                {
                    id: 'key-cert-quiz',
                    title: 'Certificates Quiz',
                    type: 'quiz',
                    difficulty: 'intermediate',
                    duration: '15 min',
                    href: 'houses/key/quizzes/key-cert.quiz.html',
                    prerequisites: ['key-digital-signatures']
                },
                // Key Management (maps to SY0-701 1.4)
                {
                    id: 'key-key-management',
                    title: 'Key Management',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'houses/key/presentations/key-management.presentation.html',
                    prerequisites: ['key-cert-quiz']
                },
                {
                    id: 'key-lifecycle',
                    title: 'Key Lifecycle Manager',
                    type: 'tool',
                    difficulty: 'intermediate',
                    duration: '20 min',
                    href: 'houses/key/tools/key-lifecycle.tool.html',
                    prerequisites: ['key-key-management']
                }
            ]
        },

        // CompTIA CySA+ CS0-003 — Shield + Eye Houses
        'cysa-plus': {
            name: 'CompTIA CySA+ (CS0-003)',
            description: 'Security analyst certification prep covering threat detection, analysis, vulnerability management, incident response, and security operations',
            icon: '/assets/images/icons/icon-magnifier.webp',
            color: '#a855f7',
            courseHref: 'houses/eye/cysa/index.html',
            modules: [
                // Domain 1: Security Operations
                {
                    id: 'eye-soc-operations',
                    title: 'SOC Operations',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'houses/eye/presentations/eye-soc-operations.presentation.html',
                    prerequisites: []
                },
                {
                    id: 'eye-soc-simulator',
                    title: 'SOC Simulator',
                    type: 'tool',
                    difficulty: 'intermediate',
                    duration: '45 min',
                    href: 'houses/eye/tools/eye-soc.tool.html',
                    prerequisites: ['eye-soc-operations']
                },
                {
                    id: 'cyberops-soc-overview',
                    title: 'SOC Overview',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '20 min',
                    href: 'houses/eye/applets/cyberops/eye-soc-overview.applet.html',
                    prerequisites: ['eye-soc-simulator']
                },
                {
                    id: 'cyberops-soc-metrics',
                    title: 'SOC Metrics',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '20 min',
                    href: 'houses/eye/applets/cyberops/eye-soc-metrics.applet.html',
                    prerequisites: ['cyberops-soc-overview']
                },
                {
                    id: 'eye-soc-quiz',
                    title: 'SOC Operations Quiz',
                    type: 'quiz',
                    difficulty: 'intermediate',
                    duration: '15 min',
                    href: 'houses/eye/quizzes/eye-soc.quiz.html',
                    prerequisites: ['cyberops-soc-metrics']
                },
                {
                    id: 'eye-soc-lab',
                    title: 'SOC Operations Lab',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '40 min',
                    href: 'houses/eye/labs/eye-soc.lab.html',
                    prerequisites: ['eye-soc-quiz']
                },
                // Domain 2: Vulnerability Management
                {
                    id: 'shield-risk-management',
                    title: 'Risk Management',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'houses/shield/applets/risk/risk_management/shield-risk-management.applet.html',
                    prerequisites: ['eye-soc-lab']
                },
                {
                    id: 'shield-risk-analysis',
                    title: 'Risk Analysis',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'houses/shield/applets/risk/risk_analysis/shield-risk-analysis.applet.html',
                    prerequisites: ['shield-risk-management']
                },
                {
                    id: 'cyberops-risk-rating',
                    title: 'Risk Rating & CVSS',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '20 min',
                    href: 'houses/eye/applets/cyberops/eye-risk-rating.applet.html',
                    prerequisites: ['shield-risk-analysis']
                },
                {
                    id: 'cyberops-cvss-terminology',
                    title: 'CVSS Terminology',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '20 min',
                    href: 'houses/eye/applets/cyberops/eye-cvss-terminology.applet.html',
                    prerequisites: ['cyberops-risk-rating']
                },
                {
                    id: 'cyberops-attack-surface-vuln',
                    title: 'Attack Surface & Vulnerabilities',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'houses/eye/applets/cyberops/eye-attack-surface-vuln.applet.html',
                    prerequisites: ['cyberops-cvss-terminology']
                },
                {
                    id: 'shield-cve-lookup',
                    title: 'CVE Lookup Tool',
                    type: 'tool',
                    difficulty: 'intermediate',
                    duration: '20 min',
                    href: 'houses/shield/tools/shield-cve-lookup.tool.html',
                    prerequisites: ['cyberops-attack-surface-vuln']
                },
                // Domain 3: Incident Response & Management
                {
                    id: 'shield-incident-sim',
                    title: 'Incident Response',
                    type: 'tool',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'houses/shield/tools/shield-incident-response.tool.html',
                    prerequisites: ['shield-cve-lookup']
                },
                {
                    id: 'cyberops-irp-elements',
                    title: 'Incident Response Plan Elements',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '20 min',
                    href: 'houses/eye/applets/cyberops/eye-irp-elements.applet.html',
                    prerequisites: ['shield-incident-sim']
                },
                {
                    id: 'shield-ir-forensics',
                    title: 'IR & Forensics Lab',
                    type: 'lab',
                    difficulty: 'advanced',
                    duration: '45 min',
                    href: 'houses/shield/labs/shield-ir-forensics.lab.html',
                    prerequisites: ['cyberops-irp-elements']
                },
                {
                    id: 'cyberops-nist-800-86',
                    title: 'NIST 800-86 Forensics',
                    type: 'applet',
                    difficulty: 'advanced',
                    duration: '20 min',
                    href: 'houses/eye/applets/cyberops/eye-nist-800-86.applet.html',
                    prerequisites: ['shield-ir-forensics']
                },
                {
                    id: 'cyberops-evidence-types',
                    title: 'Evidence Types',
                    type: 'applet',
                    difficulty: 'advanced',
                    duration: '20 min',
                    href: 'houses/eye/applets/cyberops/eye-evidence-types.applet.html',
                    prerequisites: ['cyberops-nist-800-86']
                },
                // Domain 4: Reporting & Communication
                {
                    id: 'cse-06-monitoring',
                    title: 'Security Monitoring & Incident Response',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'houses/shield/presentations/shield-cse-06-security-monitoring-incident-response.presentation.html',
                    prerequisites: ['cyberops-evidence-types']
                },
                {
                    id: 'cse-07-risk',
                    title: 'Risk Assessment & Management',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'houses/shield/presentations/shield-cse-07-risk-assessment-management.presentation.html',
                    prerequisites: ['cse-06-monitoring']
                },
                {
                    id: 'cse-08-compliance',
                    title: 'Compliance & Governance',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'houses/shield/presentations/shield-cse-08-compliance-governance.presentation.html',
                    prerequisites: ['cse-07-risk']
                },
                {
                    id: 'shield-cysa-toolkit',
                    title: 'CySA+ Analyst Toolkit',
                    type: 'applet',
                    difficulty: 'advanced',
                    duration: '45 min',
                    href: 'houses/shield/applets/operations/shield-cysa-analyst-toolkit.applet.html',
                    prerequisites: ['cse-08-compliance']
                }
            ]
        },

        // CompTIA CASP+ CAS-004 — Shield House (Advanced)
        'casp-plus': {
            name: 'CompTIA CASP+ (CAS-004)',
            description: 'Advanced security practitioner certification covering security architecture, operations, engineering, cryptography, and governance at the enterprise level',
            icon: '/assets/images/icons/icon-institution.webp',
            color: '#dc2626',
            courseHref: 'houses/casp-plus/index.html',
            modules: [
                // Domain 1: Security Architecture
                {
                    id: 'shield-security-pres',
                    title: 'Security Fundamentals',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'houses/shield/presentations/shield-security.presentation.html',
                    prerequisites: []
                },
                {
                    id: 'shield-design-principles',
                    title: 'Security Design Principles',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'houses/shield/applets/fundamentals/design_principles/shield-cybersecuritydesignprinciples.applet.html',
                    prerequisites: ['shield-security-pres']
                },
                {
                    id: 'shield-zero-trust',
                    title: 'Zero Trust Architecture',
                    type: 'tool',
                    difficulty: 'advanced',
                    duration: '35 min',
                    href: 'houses/shield/tools/shield-zero-trust.tool.html',
                    prerequisites: ['shield-design-principles']
                },
                {
                    id: 'shield-security-models',
                    title: 'Security Models',
                    type: 'tool',
                    difficulty: 'advanced',
                    duration: '30 min',
                    href: 'houses/shield/tools/shield-security-models.tool.html',
                    prerequisites: ['shield-zero-trust']
                },
                {
                    id: 'shield-governance-dashboard',
                    title: 'Security Governance Dashboard',
                    type: 'applet',
                    difficulty: 'advanced',
                    duration: '30 min',
                    href: 'houses/shield/applets/fundamentals/shield-security-governance-dashboard.applet.html',
                    prerequisites: ['shield-security-models']
                },
                // Domain 2: Security Operations
                {
                    id: 'shield-network-security',
                    title: 'Enterprise Firewalls',
                    type: 'applet',
                    difficulty: 'advanced',
                    duration: '30 min',
                    href: 'houses/shield/applets/network/firewalls/shield-firewalls.applet.html',
                    prerequisites: ['shield-governance-dashboard']
                },
                {
                    id: 'shield-ids-ips',
                    title: 'IDS/IPS Systems',
                    type: 'applet',
                    difficulty: 'advanced',
                    duration: '25 min',
                    href: 'houses/shield/applets/network/ids_ips/shield-ids-ips.applet.html',
                    prerequisites: ['shield-network-security']
                },
                {
                    id: 'shield-vpn',
                    title: 'Enterprise VPN',
                    type: 'applet',
                    difficulty: 'advanced',
                    duration: '25 min',
                    href: 'houses/shield/applets/network/vpn/shield-vpn.applet.html',
                    prerequisites: ['shield-ids-ips']
                },
                {
                    id: 'shield-linux-firewall',
                    title: 'Linux Firewall Builder',
                    type: 'applet',
                    difficulty: 'advanced',
                    duration: '35 min',
                    href: 'houses/shield/applets/network/shield-linux-firewall-builder.applet.html',
                    prerequisites: ['shield-vpn']
                },
                {
                    id: 'shield-incident-sim',
                    title: 'Incident Response',
                    type: 'tool',
                    difficulty: 'advanced',
                    duration: '30 min',
                    href: 'houses/shield/tools/shield-incident-response.tool.html',
                    prerequisites: ['shield-linux-firewall']
                },
                {
                    id: 'shield-ir-forensics',
                    title: 'IR & Forensics Lab',
                    type: 'lab',
                    difficulty: 'advanced',
                    duration: '45 min',
                    href: 'houses/shield/labs/shield-ir-forensics.lab.html',
                    prerequisites: ['shield-incident-sim']
                },
                // Domain 3: Security Engineering & Cryptography
                {
                    id: 'shield-crypto-intro',
                    title: 'Cryptography Essentials',
                    type: 'applet',
                    difficulty: 'advanced',
                    duration: '35 min',
                    href: 'houses/shield/applets/crypto/cryptography_intro/shield-crypto-cryptography-intro.applet.html',
                    prerequisites: ['shield-ir-forensics']
                },
                {
                    id: 'shield-pki',
                    title: 'PKI Infrastructure',
                    type: 'applet',
                    difficulty: 'advanced',
                    duration: '30 min',
                    href: 'houses/shield/applets/crypto/pki/shield-crypto-pki.applet.html',
                    prerequisites: ['shield-crypto-intro']
                },
                {
                    id: 'shield-blockchain',
                    title: 'Blockchain Security',
                    type: 'applet',
                    difficulty: 'advanced',
                    duration: '25 min',
                    href: 'houses/shield/applets/crypto/blockchain/shield-crypto-blockchain.applet.html',
                    prerequisites: ['shield-pki']
                },
                {
                    id: 'shield-crypto-lab',
                    title: 'Cryptography Lab',
                    type: 'lab',
                    difficulty: 'advanced',
                    duration: '40 min',
                    href: 'houses/shield/labs/shield-cryptography.lab.html',
                    prerequisites: ['shield-blockchain']
                },
                // Domain 4: Governance, Risk, and Compliance
                {
                    id: 'shield-risk-management',
                    title: 'Enterprise Risk Management',
                    type: 'applet',
                    difficulty: 'advanced',
                    duration: '30 min',
                    href: 'houses/shield/applets/risk/risk_management/shield-risk-management.applet.html',
                    prerequisites: ['shield-crypto-lab']
                },
                {
                    id: 'shield-risk-analysis',
                    title: 'Risk Analysis',
                    type: 'applet',
                    difficulty: 'advanced',
                    duration: '25 min',
                    href: 'houses/shield/applets/risk/risk_analysis/shield-risk-analysis.applet.html',
                    prerequisites: ['shield-risk-management']
                },
                {
                    id: 'shield-business-continuity',
                    title: 'Business Continuity Planning',
                    type: 'applet',
                    difficulty: 'advanced',
                    duration: '30 min',
                    href: 'houses/shield/applets/risk/shield-business-continuity-planner.applet.html',
                    prerequisites: ['shield-risk-analysis']
                },
                {
                    id: 'shield-bia-calculator',
                    title: 'Business Impact Analysis',
                    type: 'tool',
                    difficulty: 'advanced',
                    duration: '25 min',
                    href: 'houses/shield/tools/shield-bia.tool.html',
                    prerequisites: ['shield-business-continuity']
                },
                {
                    id: 'shield-framework-selector',
                    title: 'Security Frameworks',
                    type: 'applet',
                    difficulty: 'advanced',
                    duration: '25 min',
                    href: 'houses/shield/applets/compliance/shield-framework-selector.applet.html',
                    prerequisites: ['shield-bia-calculator']
                },
                {
                    id: 'shield-laws-regulations',
                    title: 'Laws & Regulations',
                    type: 'applet',
                    difficulty: 'advanced',
                    duration: '25 min',
                    href: 'houses/shield/applets/compliance/shield-laws-regulations.applet.html',
                    prerequisites: ['shield-framework-selector']
                },
                {
                    id: 'shield-cism-dashboard',
                    title: 'CISM Management Dashboard',
                    type: 'applet',
                    difficulty: 'advanced',
                    duration: '30 min',
                    href: 'houses/shield/applets/governance/shield-cism-management-dashboard.applet.html',
                    prerequisites: ['shield-laws-regulations']
                },
                {
                    id: 'shield-compliance-lab',
                    title: 'Compliance Lab',
                    type: 'lab',
                    difficulty: 'advanced',
                    duration: '30 min',
                    href: 'houses/shield/labs/shield-compliance.lab.html',
                    prerequisites: ['shield-cism-dashboard']
                }
            ]
        },

        // Cisco CCNA 200-301 — Web House
        'ccna': {
            name: 'Cisco CCNA (200-301)',
            description: 'CCNA certification prep covering network fundamentals, network access, IP connectivity, IP services, security fundamentals, and automation',
            icon: '/assets/images/icons/icon-wrench.webp',
            color: '#3b82f6',
            courseHref: 'houses/web/ccna/index.html',
            modules: [
                // Domain 1: Network Fundamentals
                {
                    id: 'web-osi-model-pres',
                    title: 'OSI Model Fundamentals',
                    type: 'presentation',
                    difficulty: 'beginner',
                    duration: '25 min',
                    href: 'houses/web/presentations/web-osi-model.presentation.html',
                    prerequisites: []
                },
                {
                    id: 'web-osi-deep-pres',
                    title: 'OSI Model Deep Dive',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'houses/web/presentations/web-osi-deep-dive.presentation.html',
                    prerequisites: ['web-osi-model-pres']
                },
                {
                    id: 'web-tcpip',
                    title: 'TCP/IP Fundamentals',
                    type: 'presentation',
                    difficulty: 'beginner',
                    duration: '30 min',
                    href: 'houses/web/presentations/web-tcp.presentation.html',
                    prerequisites: ['web-osi-deep-pres']
                },
                {
                    id: 'web-ip-binary-ip',
                    title: 'IP Addressing',
                    type: 'applet',
                    difficulty: 'beginner',
                    duration: '30 min',
                    href: 'houses/web/applets/ip-addressing/binary-ip/web-ip-binary-ip.applet.html',
                    prerequisites: ['web-tcpip']
                },
                {
                    id: 'web-subnetting-pres',
                    title: 'Subnetting Fundamentals',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '40 min',
                    href: 'houses/web/presentations/web-subnetting.presentation.html',
                    prerequisites: ['web-ip-binary-ip']
                },
                {
                    id: 'web-ip-vlsm',
                    title: 'VLSM Challenge',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'houses/web/applets/ip-addressing/vlsm/web-ip-vlsm.applet.html',
                    prerequisites: ['web-subnetting-pres']
                },
                {
                    id: 'web-ipv6-pres',
                    title: 'IPv6 Addressing',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'houses/web/presentations/web-ipv6.presentation.html',
                    prerequisites: ['web-ip-vlsm']
                },
                {
                    id: 'web-cables-pres',
                    title: 'Network Cabling',
                    type: 'presentation',
                    difficulty: 'beginner',
                    duration: '20 min',
                    href: 'houses/web/presentations/web-cables.presentation.html',
                    prerequisites: ['web-ipv6-pres']
                },
                {
                    id: 'web-devices-pres',
                    title: 'Network Devices',
                    type: 'presentation',
                    difficulty: 'beginner',
                    duration: '25 min',
                    href: 'houses/web/presentations/web-devices.presentation.html',
                    prerequisites: ['web-cables-pres']
                },
                // Domain 2: Network Access
                {
                    id: 'web-switch-ops-pres',
                    title: 'Switch Operations',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'houses/web/presentations/web-switch-operations.presentation.html',
                    prerequisites: ['web-devices-pres']
                },
                {
                    id: 'web-switching',
                    title: 'VLAN Configuration',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '35 min',
                    href: 'houses/web/presentations/web-vlan.presentation.html',
                    prerequisites: ['web-switch-ops-pres']
                },
                {
                    id: 'web-stp',
                    title: 'Spanning Tree Protocol',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'houses/web/presentations/web-stp.presentation.html',
                    prerequisites: ['web-switching']
                },
                {
                    id: 'web-etherchannel-pres',
                    title: 'EtherChannel',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'houses/web/presentations/web-etherchannel.presentation.html',
                    prerequisites: ['web-stp']
                },
                {
                    id: 'web-wireless',
                    title: 'Wireless Networking',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'houses/web/presentations/web-wireless.presentation.html',
                    prerequisites: ['web-etherchannel-pres']
                },
                {
                    id: 'web-wireless-arch-pres',
                    title: 'Wireless Architecture',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'houses/web/presentations/web-wireless-architecture.presentation.html',
                    prerequisites: ['web-wireless']
                },
                // Domain 3: IP Connectivity
                {
                    id: 'web-topologies-pres',
                    title: 'Routing Fundamentals',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '35 min',
                    href: 'houses/web/presentations/web-topologies.presentation.html',
                    prerequisites: ['web-wireless-arch-pres']
                },
                {
                    id: 'web-routing',
                    title: 'OSPF Protocol',
                    type: 'presentation',
                    difficulty: 'advanced',
                    duration: '40 min',
                    href: 'houses/web/presentations/web-ospf.presentation.html',
                    prerequisites: ['web-topologies-pres']
                },
                {
                    id: 'web-eigrp-pres',
                    title: 'EIGRP Protocol',
                    type: 'presentation',
                    difficulty: 'advanced',
                    duration: '35 min',
                    href: 'houses/web/presentations/web-eigrp.presentation.html',
                    prerequisites: ['web-routing']
                },
                {
                    id: 'web-fhrp',
                    title: 'First Hop Redundancy Protocols',
                    type: 'presentation',
                    difficulty: 'advanced',
                    duration: '30 min',
                    href: 'houses/web/presentations/web-fhrp.presentation.html',
                    prerequisites: ['web-eigrp-pres']
                },
                {
                    id: 'web-static-routes-lab',
                    title: 'Static Routes Lab',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'houses/web/labs/web-static-routes.lab.html',
                    prerequisites: ['web-fhrp']
                },
                // Domain 4: IP Services
                {
                    id: 'web-dns-pres',
                    title: 'DNS Services',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'houses/web/presentations/web-dns.presentation.html',
                    prerequisites: ['web-static-routes-lab']
                },
                {
                    id: 'web-dhcp-pres',
                    title: 'DHCP Services',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '20 min',
                    href: 'houses/web/presentations/web-dhcp.presentation.html',
                    prerequisites: ['web-dns-pres']
                },
                {
                    id: 'web-nat-pres',
                    title: 'NAT & PAT',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'houses/web/presentations/web-nat.presentation.html',
                    prerequisites: ['web-dhcp-pres']
                },
                {
                    id: 'web-ntp-pres',
                    title: 'NTP Services',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '20 min',
                    href: 'houses/web/presentations/web-ntp.presentation.html',
                    prerequisites: ['web-nat-pres']
                },
                {
                    id: 'web-arp-pres',
                    title: 'ARP Protocol',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '20 min',
                    href: 'houses/web/presentations/web-arp.presentation.html',
                    prerequisites: ['web-ntp-pres']
                },
                {
                    id: 'web-qos-viz',
                    title: 'QoS Fundamentals',
                    type: 'tool',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'houses/web/tools/web-qos.tool.html',
                    prerequisites: ['web-arp-pres']
                },
                // Domain 5: Security Fundamentals
                {
                    id: 'web-security-viz',
                    title: 'Network Security Tools',
                    type: 'tool',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'houses/web/tools/web-security.tool.html',
                    prerequisites: ['web-qos-viz']
                },
                {
                    id: 'web-acl-viz',
                    title: 'Access Control Lists',
                    type: 'tool',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'houses/web/tools/web-acl.tool.html',
                    prerequisites: ['web-security-viz']
                },
                // Domain 6: Automation & Programmability
                {
                    id: 'web-troubleshoot-pres',
                    title: 'Network Troubleshooting',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '35 min',
                    href: 'houses/web/presentations/web-troubleshooting.presentation.html',
                    prerequisites: ['web-acl-viz']
                },
                {
                    id: 'web-network-sim-v2',
                    title: 'Network Simulator Lab',
                    type: 'lab',
                    difficulty: 'advanced',
                    duration: '60 min',
                    href: 'houses/web/simulators/web-interactive-network-simulatorv2.simulator.html',
                    prerequisites: ['web-troubleshoot-pres']
                },
                {
                    id: 'web-network-simulator',
                    title: 'Packet Tracer Lite',
                    type: 'lab',
                    difficulty: 'advanced',
                    duration: '60 min',
                    href: 'houses/web/simulators/web-packet-tracer-lite-v3.simulator.html',
                    prerequisites: ['web-network-sim-v2']
                },
                {
                    id: 'web-networking-final',
                    title: 'CCNA Final Review',
                    type: 'quiz',
                    difficulty: 'advanced',
                    duration: '30 min',
                    href: 'houses/web/quizzes/web-networking-final-review.quiz.html',
                    prerequisites: ['web-network-simulator']
                }
            ]
        },

        // AWS Cloud Practitioner (CLF-C02) — Cloud House
        'aws-ccp': {
            name: 'AWS Cloud Practitioner (CLF-C02)',
            description: 'AWS Certified Cloud Practitioner prep covering cloud concepts, AWS services, security, architecture, pricing, and support',
            icon: '/assets/images/icons/icon-square-filled.webp',
            color: '#f97316',
            courseHref: 'houses/aws-ccp/index.html',
            modules: [
                // Domain 1: Cloud Concepts
                {
                    id: 'cloud-concepts',
                    title: 'Cloud Computing Concepts',
                    type: 'presentation',
                    difficulty: 'beginner',
                    duration: '25 min',
                    href: 'houses/cloud/presentations/cloud-concepts.presentation.html',
                    prerequisites: []
                },
                {
                    id: 'cloud-models',
                    title: 'Cloud Service & Deployment Models',
                    type: 'tool',
                    difficulty: 'beginner',
                    duration: '20 min',
                    href: 'houses/cloud/tools/cloud-ch01-cloud-models.tool.html',
                    prerequisites: ['cloud-concepts']
                },
                {
                    id: 'cloud-fundamentals-quiz',
                    title: 'Cloud Fundamentals Quiz',
                    type: 'quiz',
                    difficulty: 'beginner',
                    duration: '15 min',
                    href: 'houses/cloud/quizzes/cloud-ch01-cloud-fundamentals.quiz.html',
                    prerequisites: ['cloud-models']
                },
                {
                    id: 'cloud-providers',
                    title: 'Cloud Provider Comparison',
                    type: 'applet',
                    difficulty: 'beginner',
                    duration: '20 min',
                    href: 'houses/cloud/applets/fundamentals/cloud-provider-comparison.applet.html',
                    prerequisites: ['cloud-fundamentals-quiz']
                },
                // Domain 2: Security & Compliance
                {
                    id: 'cloud-aws-fundamentals-pres',
                    title: 'AWS Fundamentals',
                    type: 'presentation',
                    difficulty: 'beginner',
                    duration: '30 min',
                    href: 'houses/cloud/presentations/cloud-aws-fundamentals.presentation.html',
                    prerequisites: ['cloud-providers']
                },
                {
                    id: 'cloud-aws-account',
                    title: 'AWS Account & Setup',
                    type: 'tool',
                    difficulty: 'beginner',
                    duration: '25 min',
                    href: 'houses/cloud/tools/cloud-ch02-aws-account.tool.html',
                    prerequisites: ['cloud-aws-fundamentals-pres']
                },
                {
                    id: 'cloud-aws-support',
                    title: 'AWS Support Plans',
                    type: 'tool',
                    difficulty: 'beginner',
                    duration: '15 min',
                    href: 'houses/cloud/tools/cloud-ch03-support-plans.tool.html',
                    prerequisites: ['cloud-aws-account']
                },
                {
                    id: 'cloud-aws-regions',
                    title: 'AWS Global Infrastructure',
                    type: 'tool',
                    difficulty: 'intermediate',
                    duration: '20 min',
                    href: 'houses/cloud/tools/cloud-ch04-aws-regions.tool.html',
                    prerequisites: ['cloud-aws-support']
                },
                {
                    id: 'cloud-aws-security',
                    title: 'IAM & Security',
                    type: 'tool',
                    difficulty: 'intermediate',
                    duration: '35 min',
                    href: 'houses/cloud/tools/cloud-ch05-security.tool.html',
                    prerequisites: ['cloud-aws-regions']
                },
                {
                    id: 'cloud-iam-quiz',
                    title: 'IAM Security Quiz',
                    type: 'quiz',
                    difficulty: 'intermediate',
                    duration: '15 min',
                    href: 'houses/cloud/quizzes/cloud-ch05-iam-security.quiz.html',
                    prerequisites: ['cloud-aws-security']
                },
                // Domain 3: Cloud Technology & Services
                {
                    id: 'cloud-aws-tools',
                    title: 'AWS Management Tools',
                    type: 'tool',
                    difficulty: 'intermediate',
                    duration: '20 min',
                    href: 'houses/cloud/tools/cloud-ch06-aws-tools.tool.html',
                    prerequisites: ['cloud-iam-quiz']
                },
                {
                    id: 'cloud-aws-compute',
                    title: 'AWS Compute Services',
                    type: 'tool',
                    difficulty: 'intermediate',
                    duration: '40 min',
                    href: 'houses/cloud/tools/cloud-ch07-compute-services.tool.html',
                    prerequisites: ['cloud-aws-tools']
                },
                {
                    id: 'cloud-aws-ec2',
                    title: 'EC2 Instance Explorer',
                    type: 'tool',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'houses/cloud/tools/cloud-ch07-ec2-instance.tool.html',
                    prerequisites: ['cloud-aws-compute']
                },
                {
                    id: 'cloud-aws-storage',
                    title: 'AWS Storage Services',
                    type: 'tool',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'houses/cloud/tools/cloud-ch08-storage-services.tool.html',
                    prerequisites: ['cloud-aws-ec2']
                },
                {
                    id: 'cloud-storage-quiz',
                    title: 'Storage Services Quiz',
                    type: 'quiz',
                    difficulty: 'intermediate',
                    duration: '15 min',
                    href: 'houses/cloud/quizzes/cloud-ch08-storage.quiz.html',
                    prerequisites: ['cloud-aws-storage']
                },
                {
                    id: 'cloud-aws-database',
                    title: 'AWS Database Services',
                    type: 'tool',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'houses/cloud/tools/cloud-ch09-database-services.tool.html',
                    prerequisites: ['cloud-storage-quiz']
                },
                {
                    id: 'cloud-database-quiz',
                    title: 'Database Services Quiz',
                    type: 'quiz',
                    difficulty: 'intermediate',
                    duration: '15 min',
                    href: 'houses/cloud/quizzes/cloud-ch09-database.quiz.html',
                    prerequisites: ['cloud-aws-database']
                },
                {
                    id: 'cloud-aws-networking',
                    title: 'VPC & Networking',
                    type: 'tool',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'houses/cloud/tools/cloud-ch10-vpc-networking.tool.html',
                    prerequisites: ['cloud-database-quiz']
                },
                {
                    id: 'cloud-networking-quiz',
                    title: 'Networking Quiz',
                    type: 'quiz',
                    difficulty: 'intermediate',
                    duration: '15 min',
                    href: 'houses/cloud/quizzes/cloud-ch10-networking.quiz.html',
                    prerequisites: ['cloud-aws-networking']
                },
                // Domain 4: Billing, Pricing & Support
                {
                    id: 'cloud-aws-automation',
                    title: 'Automation & Infrastructure',
                    type: 'tool',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'houses/cloud/tools/cloud-ch11-automation.tool.html',
                    prerequisites: ['cloud-networking-quiz']
                },
                {
                    id: 'cloud-aws-use-cases',
                    title: 'AWS Use Cases & Architecture',
                    type: 'tool',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'houses/cloud/tools/cloud-ch12-use-cases.tool.html',
                    prerequisites: ['cloud-aws-automation']
                },
                {
                    id: 'cloud-architecture',
                    title: 'Cloud Architecture Designer',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '45 min',
                    href: 'houses/cloud/applets/architecture/cloud-architecture-designer.applet.html',
                    prerequisites: ['cloud-aws-use-cases']
                },
                {
                    id: 'cloud-aws-practitioner',
                    title: 'AWS CCP Practice Exam',
                    type: 'quiz',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'houses/cloud/quizzes/cloud-ch12-aws-practitioner-final.quiz.html',
                    prerequisites: ['cloud-architecture']
                }
            ]
        },

        // Microsoft Azure Fundamentals (AZ-900) — Cloud House
        'azure-fundamentals': {
            name: 'Azure Fundamentals (AZ-900)',
            description: 'Microsoft Azure Fundamentals certification prep covering cloud concepts, Azure services, security, privacy, compliance, and pricing',
            icon: '/assets/images/icons/icon-diamond.webp',
            color: '#0ea5e9',
            courseHref: 'houses/cloud/az-900/index.html',
            modules: [
                // Cloud Concepts
                {
                    id: 'cloud-concepts',
                    title: 'Cloud Computing Concepts',
                    type: 'presentation',
                    difficulty: 'beginner',
                    duration: '25 min',
                    href: 'houses/cloud/presentations/cloud-concepts.presentation.html',
                    prerequisites: []
                },
                {
                    id: 'cloud-models',
                    title: 'Cloud Models & Deployment',
                    type: 'tool',
                    difficulty: 'beginner',
                    duration: '20 min',
                    href: 'houses/cloud/tools/cloud-ch01-cloud-models.tool.html',
                    prerequisites: ['cloud-concepts']
                },
                {
                    id: 'cloud-providers',
                    title: 'Cloud Provider Comparison',
                    type: 'applet',
                    difficulty: 'beginner',
                    duration: '20 min',
                    href: 'houses/cloud/applets/fundamentals/cloud-provider-comparison.applet.html',
                    prerequisites: ['cloud-models']
                },
                // Azure Core Services
                {
                    id: 'cloud-azure-fundamentals',
                    title: 'Azure Fundamentals',
                    type: 'presentation',
                    difficulty: 'beginner',
                    duration: '30 min',
                    href: 'houses/cloud/presentations/cloud-azure-fundamentals.presentation.html',
                    prerequisites: ['cloud-providers']
                },
                {
                    id: 'cloud-aws-quiz',
                    title: 'Azure Fundamentals Quiz',
                    type: 'quiz',
                    difficulty: 'beginner',
                    duration: '20 min',
                    href: 'houses/cloud/quizzes/cloud-aws-fundamentals.quiz.html',
                    prerequisites: ['cloud-azure-fundamentals']
                },
                // Cloud Security
                {
                    id: 'cse-01-fundamentals',
                    title: 'Cloud Security Fundamentals',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'houses/cloud/presentations/cloud-cse-01-cloud-fundamentals.presentation.html',
                    prerequisites: ['cloud-aws-quiz']
                },
                {
                    id: 'cse-02-iam',
                    title: 'Identity & Access Management',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'houses/cloud/presentations/cloud-cse-02-identity-access-management.presentation.html',
                    prerequisites: ['cse-01-fundamentals']
                },
                {
                    id: 'cse-02-quiz',
                    title: 'IAM Quiz',
                    type: 'quiz',
                    difficulty: 'intermediate',
                    duration: '15 min',
                    href: 'houses/cloud/quizzes/cloud-cse-02.quiz.html',
                    prerequisites: ['cse-02-iam']
                },
                {
                    id: 'cse-03-encryption',
                    title: 'Data Protection & Encryption',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'houses/cloud/presentations/cloud-cse-03-data-protection-encryption.presentation.html',
                    prerequisites: ['cse-02-quiz']
                },
                {
                    id: 'cse-03-quiz',
                    title: 'Data Protection Quiz',
                    type: 'quiz',
                    difficulty: 'intermediate',
                    duration: '15 min',
                    href: 'houses/cloud/quizzes/cloud-cse-03.quiz.html',
                    prerequisites: ['cse-03-encryption']
                },
                // Compliance & Pricing
                {
                    id: 'cse-04-network',
                    title: 'Cloud Network Security',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'houses/cloud/presentations/cloud-cse-04-network-security.presentation.html',
                    prerequisites: ['cse-03-quiz']
                },
                {
                    id: 'cse-04-quiz',
                    title: 'Network Security Quiz',
                    type: 'quiz',
                    difficulty: 'intermediate',
                    duration: '15 min',
                    href: 'houses/cloud/quizzes/cloud-cse-04.quiz.html',
                    prerequisites: ['cse-04-network']
                },
                {
                    id: 'cloud-cse-08-compliance',
                    title: 'Cloud Compliance & Governance',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'houses/cloud/presentations/cloud-cse-08-compliance-governance.presentation.html',
                    prerequisites: ['cse-04-quiz']
                },
                {
                    id: 'cloud-cse-08-quiz',
                    title: 'Compliance Quiz',
                    type: 'quiz',
                    difficulty: 'intermediate',
                    duration: '15 min',
                    href: 'houses/cloud/quizzes/cloud-cse-08.quiz.html',
                    prerequisites: ['cloud-cse-08-compliance']
                },
                {
                    id: 'cloud-architecture',
                    title: 'Cloud Architecture Designer',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '45 min',
                    href: 'houses/cloud/applets/architecture/cloud-architecture-designer.applet.html',
                    prerequisites: ['cloud-cse-08-quiz']
                }
            ]
        },

        // AWS Developer Associate (DVA-C02) — Code House
        'aws-developer': {
            name: 'AWS Developer Associate (DVA-C02)',
            description: 'AWS Developer Associate certification prep covering development with AWS services, deployment, security, troubleshooting, and refactoring',
            icon: '/assets/images/icons/icon-globe.webp',
            color: '#ec4899',
            courseHref: 'houses/aws-developer/index.html',
            modules: [
                // Domain 1: Development with AWS Services
                {
                    id: 'code-git-basics',
                    title: 'Git Basics',
                    type: 'presentation',
                    difficulty: 'beginner',
                    duration: '25 min',
                    href: 'houses/code/presentations/code-git-basics.presentation.html',
                    prerequisites: []
                },
                {
                    id: 'code-agile-sdlc',
                    title: 'Agile & SDLC',
                    type: 'presentation',
                    difficulty: 'beginner',
                    duration: '30 min',
                    href: 'houses/code/presentations/code-agile-sdlc.presentation.html',
                    prerequisites: ['code-git-basics']
                },
                {
                    id: 'code-unit-testing',
                    title: 'Unit Testing',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'houses/code/presentations/code-unit-testing.presentation.html',
                    prerequisites: ['code-agile-sdlc']
                },
                {
                    id: 'code-unit-testing-lab',
                    title: 'Unit Testing Lab',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '40 min',
                    href: 'houses/code/labs/code-unit-testing.lab.html',
                    prerequisites: ['code-unit-testing']
                },
                {
                    id: 'code-api-explorer',
                    title: 'API Development',
                    type: 'tool',
                    difficulty: 'intermediate',
                    duration: '35 min',
                    href: 'houses/code/tools/code-api.tool.html',
                    prerequisites: ['code-unit-testing-lab']
                },
                // Domain 2: Deployment
                {
                    id: 'code-cicd-fundamentals',
                    title: 'CI/CD Fundamentals',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '35 min',
                    href: 'houses/code/presentations/code-cicd-fundamentals.presentation.html',
                    prerequisites: ['code-api-explorer']
                },
                {
                    id: 'code-cicd',
                    title: 'Pipeline Builder',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '40 min',
                    href: 'houses/code/applets/code-pipeline-builder.applet.html',
                    prerequisites: ['code-cicd-fundamentals']
                },
                {
                    id: 'code-cicd-lab',
                    title: 'CI/CD Lab',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '45 min',
                    href: 'houses/code/labs/code-cicd.lab.html',
                    prerequisites: ['code-cicd']
                },
                {
                    id: 'code-docker-basics',
                    title: 'Docker Fundamentals',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '35 min',
                    href: 'houses/code/presentations/code-docker-fundamentals.presentation.html',
                    prerequisites: ['code-cicd-lab']
                },
                {
                    id: 'code-docker',
                    title: 'Docker Playground',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '45 min',
                    href: 'houses/code/applets/code-docker-playground.applet.html',
                    prerequisites: ['code-docker-basics']
                },
                {
                    id: 'code-docker-lab',
                    title: 'Docker Lab',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '40 min',
                    href: 'houses/code/labs/code-docker.lab.html',
                    prerequisites: ['code-docker']
                },
                // Domain 3: Security
                {
                    id: 'cloud-aws-security',
                    title: 'AWS IAM Security',
                    type: 'tool',
                    difficulty: 'intermediate',
                    duration: '35 min',
                    href: 'houses/cloud/tools/cloud-ch05-security.tool.html',
                    prerequisites: ['code-docker-lab']
                },
                // Domain 4: Troubleshooting & Optimization
                {
                    id: 'code-automation-devops',
                    title: 'Automation & DevOps',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'houses/code/presentations/code-automation.presentation.html',
                    prerequisites: ['cloud-aws-security']
                },
                {
                    id: 'code-cloudformation-fundamentals',
                    title: 'CloudFormation Fundamentals',
                    type: 'presentation',
                    difficulty: 'advanced',
                    duration: '35 min',
                    href: 'houses/code/presentations/code-cloudformation-fundamentals.presentation.html',
                    prerequisites: ['code-automation-devops']
                },
                {
                    id: 'code-cloudformation',
                    title: 'CloudFormation Designer',
                    type: 'applet',
                    difficulty: 'advanced',
                    duration: '40 min',
                    href: 'houses/code/applets/code-cloudformation-designer.applet.html',
                    prerequisites: ['code-cloudformation-fundamentals']
                },
                {
                    id: 'code-cloudformation-lab',
                    title: 'CloudFormation Lab',
                    type: 'lab',
                    difficulty: 'advanced',
                    duration: '45 min',
                    href: 'houses/code/labs/code-cloudformation.lab.html',
                    prerequisites: ['code-cloudformation']
                },
                {
                    id: 'code-kubernetes-fundamentals',
                    title: 'Kubernetes (EKS)',
                    type: 'presentation',
                    difficulty: 'advanced',
                    duration: '40 min',
                    href: 'houses/code/presentations/code-kubernetes-fundamentals.presentation.html',
                    prerequisites: ['code-cloudformation-lab']
                },
                {
                    id: 'code-kubernetes',
                    title: 'Kubernetes Cluster Simulator',
                    type: 'applet',
                    difficulty: 'advanced',
                    duration: '45 min',
                    href: 'houses/code/applets/code-kubernetes-cluster-sim.applet.html',
                    prerequisites: ['code-kubernetes-fundamentals']
                },
                {
                    id: 'code-kubernetes-lab',
                    title: 'Kubernetes Lab',
                    type: 'lab',
                    difficulty: 'advanced',
                    duration: '45 min',
                    href: 'houses/code/labs/code-kubernetes.lab.html',
                    prerequisites: ['code-kubernetes']
                },
                {
                    id: 'code-terraform-fundamentals',
                    title: 'Terraform & IaC',
                    type: 'presentation',
                    difficulty: 'advanced',
                    duration: '40 min',
                    href: 'houses/code/presentations/code-terraform-fundamentals.presentation.html',
                    prerequisites: ['code-kubernetes-lab']
                },
                {
                    id: 'code-terraform-lab',
                    title: 'Terraform Lab',
                    type: 'lab',
                    difficulty: 'advanced',
                    duration: '45 min',
                    href: 'houses/code/labs/code-terraform.lab.html',
                    prerequisites: ['code-terraform-fundamentals']
                }
            ]
        },

        // Security Operations / SOC Analyst — Eye House
        'security-operations': {
            name: 'Security Operations (SOC Analyst)',
            description: 'SOC analyst career path covering log analysis, SIEM operations, threat detection, incident investigation, network traffic analysis, and threat hunting',
            icon: '/assets/images/icons/icon-shield.webp',
            color: '#6366f1',
            courseHref: 'houses/security-operations/index.html',
            modules: [
                // Tier 1: Log Analysis & Triage
                {
                    id: 'eye-log-analysis',
                    title: 'Log Analysis Basics',
                    type: 'presentation',
                    difficulty: 'beginner',
                    duration: '25 min',
                    href: 'houses/eye/presentations/eye-log-basics.presentation.html',
                    prerequisites: []
                },
                {
                    id: 'eye-soc-operations',
                    title: 'SOC Operations',
                    type: 'presentation',
                    difficulty: 'beginner',
                    duration: '30 min',
                    href: 'houses/eye/presentations/eye-soc-operations.presentation.html',
                    prerequisites: ['eye-log-analysis']
                },
                {
                    id: 'cyberops-soc-overview',
                    title: 'SOC Overview',
                    type: 'applet',
                    difficulty: 'beginner',
                    duration: '20 min',
                    href: 'houses/eye/applets/cyberops/eye-soc-overview.applet.html',
                    prerequisites: ['eye-soc-operations']
                },
                {
                    id: 'cyberops-security-approaches',
                    title: 'Security Approaches',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '20 min',
                    href: 'houses/eye/applets/cyberops/eye-security-approaches.applet.html',
                    prerequisites: ['cyberops-soc-overview']
                },
                {
                    id: 'cyberops-security-policy',
                    title: 'Security Policy',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '20 min',
                    href: 'houses/eye/applets/cyberops/eye-security-policy.applet.html',
                    prerequisites: ['cyberops-security-approaches']
                },
                {
                    id: 'eye-soc-simulator',
                    title: 'SOC Simulator',
                    type: 'tool',
                    difficulty: 'intermediate',
                    duration: '45 min',
                    href: 'houses/eye/tools/eye-soc.tool.html',
                    prerequisites: ['cyberops-security-policy']
                },
                {
                    id: 'eye-soc-quiz',
                    title: 'SOC Operations Quiz',
                    type: 'quiz',
                    difficulty: 'intermediate',
                    duration: '15 min',
                    href: 'houses/eye/quizzes/eye-soc.quiz.html',
                    prerequisites: ['eye-soc-simulator']
                },
                {
                    id: 'eye-soc-lab',
                    title: 'SOC Operations Lab',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '40 min',
                    href: 'houses/eye/labs/eye-soc.lab.html',
                    prerequisites: ['eye-soc-quiz']
                },
                // Tier 2: SIEM & Correlation
                {
                    id: 'eye-siem-intro',
                    title: 'SIEM Fundamentals',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '35 min',
                    href: 'houses/eye/presentations/eye-siem-fundamentals.presentation.html',
                    prerequisites: ['eye-soc-lab']
                },
                {
                    id: 'cyberops-siem-overview',
                    title: 'SIEM Overview',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '20 min',
                    href: 'houses/eye/applets/cyberops/eye-siem-overview.applet.html',
                    prerequisites: ['eye-siem-intro']
                },
                {
                    id: 'eye-splunk-basics',
                    title: 'SIEM Tool',
                    type: 'tool',
                    difficulty: 'intermediate',
                    duration: '40 min',
                    href: 'houses/eye/tools/eye-siem.tool.html',
                    prerequisites: ['cyberops-siem-overview']
                },
                {
                    id: 'eye-siem-quiz',
                    title: 'SIEM Quiz',
                    type: 'quiz',
                    difficulty: 'intermediate',
                    duration: '15 min',
                    href: 'houses/eye/quizzes/eye-siem.quiz.html',
                    prerequisites: ['eye-splunk-basics']
                },
                {
                    id: 'eye-siem-lab',
                    title: 'SIEM Lab',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '45 min',
                    href: 'houses/eye/labs/eye-siem.lab.html',
                    prerequisites: ['eye-siem-quiz']
                },
                {
                    id: 'eye-log-correlation',
                    title: 'Log Correlation',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'houses/eye/presentations/eye-log-correlation.presentation.html',
                    prerequisites: ['eye-siem-lab']
                },
                {
                    id: 'eye-correlation-engine',
                    title: 'Correlation Engine',
                    type: 'tool',
                    difficulty: 'advanced',
                    duration: '40 min',
                    href: 'houses/eye/tools/eye-correlation.tool.html',
                    prerequisites: ['eye-log-correlation']
                },
                {
                    id: 'eye-correlation-quiz',
                    title: 'Correlation Quiz',
                    type: 'quiz',
                    difficulty: 'advanced',
                    duration: '15 min',
                    href: 'houses/eye/quizzes/eye-correlation.quiz.html',
                    prerequisites: ['eye-correlation-engine']
                },
                {
                    id: 'eye-incident-timeline',
                    title: 'Correlation Lab',
                    type: 'lab',
                    difficulty: 'advanced',
                    duration: '40 min',
                    href: 'houses/eye/labs/eye-correlation.lab.html',
                    prerequisites: ['eye-correlation-quiz']
                },
                // Tier 3: Network Traffic & Threat Detection
                {
                    id: 'eye-network-traffic',
                    title: 'Network Traffic Analysis',
                    type: 'presentation',
                    difficulty: 'advanced',
                    duration: '40 min',
                    href: 'houses/eye/presentations/eye-network-traffic-analysis.presentation.html',
                    prerequisites: ['eye-incident-timeline']
                },
                {
                    id: 'cyberops-nsm-data-types',
                    title: 'NSM Data Types',
                    type: 'applet',
                    difficulty: 'advanced',
                    duration: '20 min',
                    href: 'houses/eye/applets/cyberops/eye-nsm-data-types.applet.html',
                    prerequisites: ['eye-network-traffic']
                },
                {
                    id: 'cyberops-5-tuple-approach',
                    title: '5-Tuple Approach',
                    type: 'applet',
                    difficulty: 'advanced',
                    duration: '20 min',
                    href: 'houses/eye/applets/cyberops/eye-5-tuple-approach.applet.html',
                    prerequisites: ['cyberops-nsm-data-types']
                },
                {
                    id: 'cyberops-tcpdump-netflow',
                    title: 'tcpdump & NetFlow',
                    type: 'applet',
                    difficulty: 'advanced',
                    duration: '25 min',
                    href: 'houses/eye/applets/cyberops/eye-tcpdump-netflow.applet.html',
                    prerequisites: ['cyberops-5-tuple-approach']
                },
                {
                    id: 'eye-wireshark-training',
                    title: 'Wireshark Analysis',
                    type: 'tool',
                    difficulty: 'advanced',
                    duration: '40 min',
                    href: 'houses/eye/tools/eye-wireshark.tool.html',
                    prerequisites: ['cyberops-tcpdump-netflow']
                },
                {
                    id: 'eye-packet-analyzer',
                    title: 'Packet Inspector',
                    type: 'tool',
                    difficulty: 'advanced',
                    duration: '30 min',
                    href: 'houses/eye/tools/eye-packet.tool.html',
                    prerequisites: ['eye-wireshark-training']
                },
                {
                    id: 'eye-traffic-quiz',
                    title: 'Traffic Analysis Quiz',
                    type: 'quiz',
                    difficulty: 'advanced',
                    duration: '15 min',
                    href: 'houses/eye/quizzes/eye-traffic.quiz.html',
                    prerequisites: ['eye-packet-analyzer']
                },
                {
                    id: 'eye-traffic-lab',
                    title: 'Traffic Analysis Lab',
                    type: 'lab',
                    difficulty: 'advanced',
                    duration: '45 min',
                    href: 'houses/eye/labs/eye-traffic.lab.html',
                    prerequisites: ['eye-traffic-quiz']
                },
                // Tier 4: Threat Hunting
                {
                    id: 'eye-threat-hunting',
                    title: 'Threat Hunting',
                    type: 'presentation',
                    difficulty: 'advanced',
                    duration: '35 min',
                    href: 'houses/eye/presentations/eye-threat-hunting.presentation.html',
                    prerequisites: ['eye-traffic-lab']
                },
                {
                    id: 'cyberops-detection-methods',
                    title: 'Detection Methods',
                    type: 'applet',
                    difficulty: 'advanced',
                    duration: '20 min',
                    href: 'houses/eye/applets/cyberops/eye-detection-methods.applet.html',
                    prerequisites: ['eye-threat-hunting']
                },
                {
                    id: 'cyberops-evasion-obfuscation',
                    title: 'Evasion & Obfuscation',
                    type: 'applet',
                    difficulty: 'advanced',
                    duration: '20 min',
                    href: 'houses/eye/applets/cyberops/eye-evasion-obfuscation.applet.html',
                    prerequisites: ['cyberops-detection-methods']
                },
                {
                    id: 'eye-hunt-workbench',
                    title: 'Hunt Workbench',
                    type: 'tool',
                    difficulty: 'advanced',
                    duration: '50 min',
                    href: 'houses/eye/tools/eye-hunt.tool.html',
                    prerequisites: ['cyberops-evasion-obfuscation']
                },
                {
                    id: 'eye-hunting-quiz',
                    title: 'Threat Hunting Quiz',
                    type: 'quiz',
                    difficulty: 'advanced',
                    duration: '15 min',
                    href: 'houses/eye/quizzes/eye-hunting.quiz.html',
                    prerequisites: ['eye-hunt-workbench']
                },
                {
                    id: 'eye-hunting-lab',
                    title: 'Threat Hunting Lab',
                    type: 'lab',
                    difficulty: 'advanced',
                    duration: '45 min',
                    href: 'houses/eye/labs/eye-hunting.lab.html',
                    prerequisites: ['eye-hunting-quiz']
                }
            ]
        },

        // ═══════════════════════════════════════════════════════════
        // AI HOUSE — House of the Machine
        // ═══════════════════════════════════════════════════════════

        'ai-foundations': {
            name: 'AI Foundations',
            description: 'Agent concepts, the automation rubric, and the 3-component model',
            icon: '/assets/images/icons/icon-brain.webp',
            color: '#a855f7',
            courseHref: 'houses/ai/index.html',
            modules: [
                {
                    id: 'ai-what-are-agents',
                    title: 'What Are AI Agents?',
                    type: 'applet',
                    difficulty: 'beginner',
                    duration: '25 min',
                    href: 'houses/ai/modules/ai-what-are-agents.applet.html',
                    prerequisites: []
                },
                {
                    id: 'ai-automation-rubric',
                    title: 'The Automation Rubric',
                    type: 'applet',
                    difficulty: 'beginner',
                    duration: '30 min',
                    href: 'houses/ai/modules/ai-automation-rubric.applet.html',
                    prerequisites: ['ai-what-are-agents']
                },
                {
                    id: 'ai-agent-components',
                    title: 'Agent Components Deep Dive',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '35 min',
                    href: 'houses/ai/modules/ai-agent-components.applet.html',
                    prerequisites: ['ai-automation-rubric']
                },
                {
                    id: 'ai-foundations-presentation',
                    title: 'AI Foundations (Slides)',
                    type: 'presentation',
                    difficulty: 'beginner',
                    duration: '20 min',
                    href: 'houses/ai/presentations/ai-foundations.presentation.html',
                    prerequisites: []
                },
                {
                    id: 'ai-flashcards',
                    title: 'AI Flashcards',
                    type: 'tool',
                    difficulty: 'beginner',
                    duration: '15 min',
                    href: 'houses/ai/tools/ai-flashcards.tool.html',
                    prerequisites: []
                },
                {
                    id: 'ai-model-architecture-presentation',
                    title: 'How LLMs Work (Slides)',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'houses/ai/presentations/ai-model-architecture.presentation.html',
                    prerequisites: ['ai-what-are-agents']
                },
                {
                    id: 'ai-agent-patterns-presentation',
                    title: 'Agent Patterns (Slides)',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'houses/ai/presentations/ai-agent-patterns.presentation.html',
                    prerequisites: ['ai-agent-components']
                },
                {
                    id: 'ai-llm-comparison',
                    title: 'LLM Comparison Calculator',
                    type: 'tool',
                    difficulty: 'beginner',
                    duration: '15 min',
                    href: 'houses/ai/tools/ai-llm-comparison.tool.html',
                    prerequisites: ['ai-model-architecture-presentation']
                },
                {
                    id: 'ai-foundations-quiz',
                    title: 'AI Foundations Quiz',
                    type: 'quiz',
                    difficulty: 'beginner',
                    duration: '15 min',
                    href: 'houses/ai/quizzes/ai-foundations.quiz.html',
                    prerequisites: ['ai-agent-components']
                }
            ]
        },

        'ai-builder': {
            name: 'Agent Builder',
            description: 'No-code platforms, prompt engineering, and building real agents',
            icon: '/assets/images/icons/icon-wrench.webp',
            color: '#a855f7',
            courseHref: 'houses/ai/index.html',
            modules: [
                {
                    id: 'ai-nocode-platforms',
                    title: 'No-Code Agent Platforms',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '35 min',
                    href: 'houses/ai/modules/ai-nocode-platforms.applet.html',
                    prerequisites: []
                },
                {
                    id: 'ai-prompt-engineering',
                    title: 'Prompt Engineering for Agents',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'houses/ai/modules/ai-prompt-engineering.applet.html',
                    prerequisites: ['ai-nocode-platforms']
                },
                {
                    id: 'ai-agent-workflow-lab',
                    title: 'Build an Agent Workflow',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '40 min',
                    href: 'houses/ai/labs/ai-agent-workflow.lab.html',
                    prerequisites: ['ai-prompt-engineering']
                },
                {
                    id: 'ai-rag-pipeline-lab',
                    title: 'Build a RAG Pipeline',
                    type: 'lab',
                    difficulty: 'advanced',
                    duration: '45 min',
                    href: 'houses/ai/labs/ai-rag-pipeline.lab.html',
                    prerequisites: ['ai-agent-workflow-lab']
                },
                {
                    id: 'ai-cost-calculator',
                    title: 'AI Cost Calculator',
                    type: 'tool',
                    difficulty: 'beginner',
                    duration: '15 min',
                    href: 'houses/ai/tools/ai-cost-calculator.tool.html',
                    prerequisites: []
                },
                {
                    id: 'ai-prompt-tester',
                    title: 'Prompt Tester',
                    type: 'tool',
                    difficulty: 'intermediate',
                    duration: '20 min',
                    href: 'houses/ai/tools/ai-prompt-tester.tool.html',
                    prerequisites: ['ai-prompt-engineering']
                },
                {
                    id: 'ai-tokenizer',
                    title: 'Token Counter & Tokenizer',
                    type: 'tool',
                    difficulty: 'beginner',
                    duration: '10 min',
                    href: 'houses/ai/tools/ai-tokenizer.tool.html',
                    prerequisites: []
                },
                {
                    id: 'ai-prompt-engineering-presentation',
                    title: 'Prompt Engineering (Slides)',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'houses/ai/presentations/ai-prompt-engineering.presentation.html',
                    prerequisites: []
                },
                {
                    id: 'ai-vector-database-lab',
                    title: 'Vector Database Lab',
                    type: 'lab',
                    difficulty: 'advanced',
                    duration: '40 min',
                    href: 'houses/ai/labs/ai-vector-database.lab.html',
                    prerequisites: ['ai-rag-pipeline-lab']
                },
                {
                    id: 'ai-fine-tuning-lab',
                    title: 'Fine-Tuning Lab',
                    type: 'lab',
                    difficulty: 'advanced',
                    duration: '45 min',
                    href: 'houses/ai/labs/ai-fine-tuning.lab.html',
                    prerequisites: ['ai-rag-pipeline-lab']
                },
                {
                    id: 'ai-benchmark-explorer',
                    title: 'AI Benchmark Explorer',
                    type: 'tool',
                    difficulty: 'intermediate',
                    duration: '15 min',
                    href: 'houses/ai/tools/ai-benchmark-explorer.tool.html',
                    prerequisites: []
                },
                {
                    id: 'ai-deployment-presentation',
                    title: 'Deployment & MLOps (Slides)',
                    type: 'presentation',
                    difficulty: 'advanced',
                    duration: '25 min',
                    href: 'houses/ai/presentations/ai-deployment.presentation.html',
                    prerequisites: []
                },
                {
                    id: 'ai-agent-builder-sim',
                    title: 'Agent Builder Sim',
                    type: 'game',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'houses/ai/games/ai-agent-builder.applet.html',
                    prerequisites: ['ai-agent-workflow-lab']
                },
                {
                    id: 'ai-builder-quiz',
                    title: 'Agent Builder Quiz',
                    type: 'quiz',
                    difficulty: 'intermediate',
                    duration: '15 min',
                    href: 'houses/ai/quizzes/ai-builder.quiz.html',
                    prerequisites: ['ai-rag-pipeline-lab']
                }
            ]
        },

        'ai-security': {
            name: 'Security Automation',
            description: 'SOC agents, guardrails, and responsible AI deployment',
            icon: '/assets/images/icons/icon-shield.webp',
            color: '#a855f7',
            courseHref: 'houses/ai/index.html',
            modules: [
                {
                    id: 'ai-soc-automation',
                    title: 'SOC Agent Automation',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '35 min',
                    href: 'houses/ai/modules/ai-soc-automation.applet.html',
                    prerequisites: []
                },
                {
                    id: 'ai-soc-triage-lab',
                    title: 'SOC Triage Agent Lab',
                    type: 'lab',
                    difficulty: 'advanced',
                    duration: '45 min',
                    href: 'houses/ai/labs/ai-soc-triage.lab.html',
                    prerequisites: ['ai-soc-automation']
                },
                {
                    id: 'ai-guardrails',
                    title: 'Guardrails & Graduated Autonomy',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'houses/ai/modules/ai-guardrails.applet.html',
                    prerequisites: ['ai-soc-automation']
                },
                {
                    id: 'ai-prompt-injection-lab',
                    title: 'Prompt Injection Lab',
                    type: 'lab',
                    difficulty: 'advanced',
                    duration: '40 min',
                    href: 'houses/ai/labs/ai-prompt-injection.lab.html',
                    prerequisites: ['ai-guardrails']
                },
                {
                    id: 'ai-safety-guardrails-presentation',
                    title: 'AI Safety & Guardrails (Slides)',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '20 min',
                    href: 'houses/ai/presentations/ai-safety-guardrails.presentation.html',
                    prerequisites: []
                },
                {
                    id: 'ai-ethics-debate-lab',
                    title: 'AI Ethics Debate Lab',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'houses/ai/labs/ai-ethics-debate.lab.html',
                    prerequisites: ['ai-guardrails']
                },
                {
                    id: 'ai-red-team-challenge',
                    title: 'Red Team Challenge',
                    type: 'game',
                    difficulty: 'advanced',
                    duration: '30 min',
                    href: 'houses/ai/games/ai-red-team-challenge.applet.html',
                    prerequisites: ['ai-prompt-injection-lab']
                },
                {
                    id: 'ai-guardrail-challenge',
                    title: 'Guardrail Challenge',
                    type: 'game',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'houses/ai/games/ai-guardrail-challenge.applet.html',
                    prerequisites: ['ai-guardrails']
                },
                {
                    id: 'ai-triage-trainer',
                    title: 'Triage Trainer',
                    type: 'game',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'houses/ai/games/ai-triage-trainer.applet.html',
                    prerequisites: ['ai-soc-triage-lab']
                },
                {
                    id: 'ai-security-quiz',
                    title: 'AI Security Quiz',
                    type: 'quiz',
                    difficulty: 'intermediate',
                    duration: '15 min',
                    href: 'houses/ai/quizzes/ai-security.quiz.html',
                    prerequisites: ['ai-prompt-injection-lab']
                }
            ]
        },

        // Signal Toolkit — standalone tool reference pages (not in any house)
        'signal-toolkit': {
            name: 'Signal Toolkit Library',
            description: 'Field-ready tool reference guides for IT and cybersecurity professionals',
            icon: '/assets/images/icons/icon-tools.webp',
            color: '#10b981',
            courseHref: 'signal/toolkit/index.html',
            modules: [
                {
                    id: 'signal-tool-arduino-ide',
                    title: 'Arduino IDE',
                    type: 'tool',
                    difficulty: 'beginner',
                    duration: '10 min',
                    href: 'signal/toolkit/tools/arduino-ide.tool.html',
                    prerequisites: []
                },
                {
                    id: 'signal-tool-balenaetcher',
                    title: 'balenaEtcher',
                    type: 'tool',
                    difficulty: 'beginner',
                    duration: '10 min',
                    href: 'signal/toolkit/tools/balenaetcher.tool.html',
                    prerequisites: []
                },
                {
                    id: 'signal-tool-clonezilla',
                    title: 'Clonezilla',
                    type: 'tool',
                    difficulty: 'intermediate',
                    duration: '10 min',
                    href: 'signal/toolkit/tools/clonezilla.tool.html',
                    prerequisites: []
                },
                {
                    id: 'signal-tool-coolterm',
                    title: 'CoolTerm',
                    type: 'tool',
                    difficulty: 'beginner',
                    duration: '10 min',
                    href: 'signal/toolkit/tools/coolterm.tool.html',
                    prerequisites: []
                },
                {
                    id: 'signal-tool-dban',
                    title: 'DBAN',
                    type: 'tool',
                    difficulty: 'intermediate',
                    duration: '10 min',
                    href: 'signal/toolkit/tools/dban.tool.html',
                    prerequisites: []
                },
                {
                    id: 'signal-tool-gparted',
                    title: 'GParted',
                    type: 'tool',
                    difficulty: 'intermediate',
                    duration: '10 min',
                    href: 'signal/toolkit/tools/gparted.tool.html',
                    prerequisites: []
                },
                {
                    id: 'signal-tool-hirens-bootcd',
                    title: "Hiren's BootCD",
                    type: 'tool',
                    difficulty: 'intermediate',
                    duration: '10 min',
                    href: 'signal/toolkit/tools/hirens-bootcd.tool.html',
                    prerequisites: []
                },
                {
                    id: 'signal-tool-memtest86',
                    title: 'MemTest86',
                    type: 'tool',
                    difficulty: 'beginner',
                    duration: '10 min',
                    href: 'signal/toolkit/tools/memtest86.tool.html',
                    prerequisites: []
                },
                {
                    id: 'signal-tool-minicom',
                    title: 'Minicom',
                    type: 'tool',
                    difficulty: 'intermediate',
                    duration: '10 min',
                    href: 'signal/toolkit/tools/minicom.tool.html',
                    prerequisites: []
                },
                {
                    id: 'signal-tool-nmap',
                    title: 'Nmap',
                    type: 'tool',
                    difficulty: 'intermediate',
                    duration: '10 min',
                    href: 'signal/toolkit/tools/nmap.tool.html',
                    prerequisites: []
                },
                {
                    id: 'signal-tool-platformio',
                    title: 'PlatformIO',
                    type: 'tool',
                    difficulty: 'intermediate',
                    duration: '10 min',
                    href: 'signal/toolkit/tools/platformio.tool.html',
                    prerequisites: []
                },
                {
                    id: 'signal-tool-putty',
                    title: 'PuTTY',
                    type: 'tool',
                    difficulty: 'beginner',
                    duration: '10 min',
                    href: 'signal/toolkit/tools/putty.tool.html',
                    prerequisites: []
                },
                {
                    id: 'signal-tool-raspberry-pi-imager',
                    title: 'Raspberry Pi Imager',
                    type: 'tool',
                    difficulty: 'beginner',
                    duration: '10 min',
                    href: 'signal/toolkit/tools/raspberry-pi-imager.tool.html',
                    prerequisites: []
                },
                {
                    id: 'signal-tool-retropie',
                    title: 'RetroPie',
                    type: 'tool',
                    difficulty: 'intermediate',
                    duration: '10 min',
                    href: 'signal/toolkit/tools/retropie.tool.html',
                    prerequisites: []
                },
                {
                    id: 'signal-tool-rufus',
                    title: 'Rufus',
                    type: 'tool',
                    difficulty: 'beginner',
                    duration: '10 min',
                    href: 'signal/toolkit/tools/rufus.tool.html',
                    prerequisites: []
                },
                {
                    id: 'signal-tool-screen',
                    title: 'GNU Screen',
                    type: 'tool',
                    difficulty: 'intermediate',
                    duration: '10 min',
                    href: 'signal/toolkit/tools/screen.tool.html',
                    prerequisites: []
                },
                {
                    id: 'signal-tool-thonny',
                    title: 'Thonny',
                    type: 'tool',
                    difficulty: 'beginner',
                    duration: '10 min',
                    href: 'signal/toolkit/tools/thonny.tool.html',
                    prerequisites: []
                },
                {
                    id: 'signal-tool-ventoy',
                    title: 'Ventoy',
                    type: 'tool',
                    difficulty: 'beginner',
                    duration: '10 min',
                    href: 'signal/toolkit/tools/ventoy.tool.html',
                    prerequisites: []
                },
                {
                    id: 'signal-tool-vscode',
                    title: 'VS Code',
                    type: 'tool',
                    difficulty: 'beginner',
                    duration: '10 min',
                    href: 'signal/toolkit/tools/vscode.tool.html',
                    prerequisites: []
                },
                {
                    id: 'signal-tool-wireshark',
                    title: 'Wireshark',
                    type: 'tool',
                    difficulty: 'intermediate',
                    duration: '10 min',
                    href: 'signal/toolkit/tools/wireshark.tool.html',
                    prerequisites: []
                }
            ]
        }
    };

    /**
     * Get all modules for a house
     */
    static getHouseModules(houseId) {
        const path = this.PATHS[houseId];
        return path ? path.modules : [];
    }

    /**
     * Get a specific module by ID
     */
    static getModule(moduleId) {
        for (const [houseId, path] of Object.entries(this.PATHS)) {
            const module = path.modules.find(m => m.id === moduleId);
            if (module) {
                return { ...module, houseId };
            }
        }
        return null;
    }

    /**
     * Get the next module in the learning path
     */
    static getNextModule(houseId, currentModuleId) {
        const modules = this.getHouseModules(houseId);
        const currentIndex = modules.findIndex(m => m.id === currentModuleId);

        if (currentIndex === -1 || currentIndex >= modules.length - 1) {
            return null; // No next module
        }

        const nextModule = modules[currentIndex + 1];
        return {
            ...nextModule,
            href: this.resolveModuleHref(houseId, nextModule.href)
        };
    }

    /**
     * Get the next incomplete module for a user
     */
    static getNextIncompleteModule(houseId, completedModuleIds) {
        const modules = this.getHouseModules(houseId);
        const completedSet = new Set(completedModuleIds);

        for (const module of modules) {
            if (!completedSet.has(module.id)) {
                // Check if prerequisites are met
                const prereqsMet = (module.prerequisites || []).every(p => completedSet.has(p));
                if (prereqsMet) {
                    return {
                        ...module,
                        href: this.resolveModuleHref(houseId, module.href)
                    };
                }
            }
        }

        return null; // All modules completed or prereqs not met
    }

    /**
     * Resolve module href to full path from house root
     */
    static resolveModuleHref(houseId, href) {
        // If already absolute or starts with http, return as-is
        if (href.startsWith('/') || href.startsWith('http')) {
            return href;
        }
        // Relative path from house directory
        return href;
    }

    /**
     * Check if a module is available (prerequisites met)
     */
    static isModuleAvailable(moduleId, completedModuleIds) {
        const module = this.getModule(moduleId);
        if (!module) return false;

        const completedSet = new Set(completedModuleIds);
        return (module.prerequisites || []).every(p => completedSet.has(p));
    }

    /**
     * Get learning path overview for a house
     */
    static getPathOverview(houseId, completedModuleIds = []) {
        const path = this.PATHS[houseId];
        if (!path) return null;

        const completedSet = new Set(completedModuleIds);
        const modules = path.modules.map(module => ({
            ...module,
            completed: completedSet.has(module.id),
            available: (module.prerequisites || []).every(p => completedSet.has(p)),
            href: this.resolveModuleHref(houseId, module.href)
        }));

        const completedCount = modules.filter(m => m.completed).length;

        return {
            ...path,
            houseId,
            modules,
            totalModules: modules.length,
            completedCount,
            progressPercent: Math.round((completedCount / modules.length) * 100),
            nextModule: this.getNextIncompleteModule(houseId, completedModuleIds)
        };
    }

    /**
     * Get all paths overview
     */
    static getAllPathsOverview(completedModuleIds = []) {
        return Object.keys(this.PATHS).map(houseId =>
            this.getPathOverview(houseId, completedModuleIds)
        );
    }

    /**
     * Calculate total estimated duration for a path
     */
    static getPathDuration(houseId) {
        const modules = this.getHouseModules(houseId);
        let totalMinutes = 0;

        modules.forEach(module => {
            if (!module.duration) return;
            const match = module.duration.match(/(\d+)/);
            if (match) {
                totalMinutes += parseInt(match[1]);
            }
        });

        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;

        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    }

    static registerPath(key, pathData) {
        LearningPaths.PATHS[key] = pathData;
    }

    static registerArctic() {
        if (typeof ArcticData === 'undefined') return;
        const FACTION_ICONS = {
            penguin: '/assets/images/icons/icon-terminal.webp',
            parrot: '/assets/images/icons/icon-shield.webp',
            dragon: '/assets/images/icons/icon-skull.webp'
        };
        const FACTION_COLORS = { penguin: '#3ab8e0', parrot: '#3ac8a0', dragon: '#d05050' };

        // Arctic hrefs are relative from district pages (../../../houses/...).
        // Normalize to _app-root paths (houses/...) for the student dashboard.
        function normalizeHref(href) {
            return href.replace(/^(\.\.\/)+/, '');
        }

        const allModules = [];
        ArcticData.districts.forEach(d => {
            const mods = (d.modules || []).map(m => ({
                id: m.id, title: m.title, type: m.type,
                difficulty: 'intermediate', duration: '15 min',
                href: normalizeHref(m.href), prerequisites: []
            }));
            allModules.push(...mods);
            LearningPaths.registerPath('arctic-' + d.id, {
                name: 'Arctic: ' + d.name,
                description: d.description || d.lore || '',
                icon: FACTION_ICONS[d.faction] || '/assets/images/icons/icon-terminal.webp',
                color: FACTION_COLORS[d.faction] || '#3ab8e0',
                courseHref: 'arctic/districts/' + d.id + '/index.html',
                modules: mods
            });
        });

        // Parent path so "The Arctic" appears as a full house path
        LearningPaths.registerPath('arctic', {
            name: 'The Arctic — Linux Training Hub',
            description: '12 districts, 3 factions, 368 modules. Master Linux from CLI fundamentals through offensive security.',
            icon: '/assets/images/icons/icon-terminal.webp',
            color: '#3ab8e0',
            courseHref: 'arctic/index.html',
            modules: allModules
        });
    }
}

// Make globally available
window.LearningPaths = LearningPaths;
