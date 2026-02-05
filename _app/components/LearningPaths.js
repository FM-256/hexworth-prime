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
            icon: '🛡️',
            color: '#a855f7',
            modules: [
                {
                    id: 'shield-cia-triad',
                    title: 'CIA Triad Fundamentals',
                    type: 'presentation',
                    difficulty: 'beginner',
                    duration: '20 min',
                    href: 'presentations/cia-triad.html',
                    prerequisites: []
                },
                {
                    id: 'shield-cia-triad-quiz',
                    title: 'CIA Triad Challenge',
                    type: 'quiz',
                    difficulty: 'beginner',
                    duration: '15 min',
                    href: 'quizzes/cia-triad-quiz.html',
                    prerequisites: ['shield-cia-triad']
                },
                {
                    id: 'shield-security-fundamentals',
                    title: 'Security Fundamentals',
                    type: 'presentation',
                    difficulty: 'beginner',
                    duration: '30 min',
                    href: 'presentations/security-presentation.html',
                    prerequisites: ['shield-cia-triad-quiz']
                },
                {
                    id: 'shield-access-control',
                    title: 'Access Control Models',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'applets/access/access-control-models.html',
                    prerequisites: ['shield-security-fundamentals']
                },
                {
                    id: 'shield-threats',
                    title: 'Threat Landscape',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'applets/threats/threat-actors.html',
                    prerequisites: ['shield-access-control']
                },
                {
                    id: 'shield-risk',
                    title: 'Risk Assessment',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '35 min',
                    href: 'applets/risk/risk-assessment.html',
                    prerequisites: ['shield-threats']
                },
                {
                    id: 'shield-network-security',
                    title: 'Network Security Basics',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'applets/network/network-security.html',
                    prerequisites: ['shield-risk']
                },
                {
                    id: 'shield-crypto-intro',
                    title: 'Cryptography Introduction',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'applets/crypto/crypto-basics.html',
                    prerequisites: ['shield-network-security']
                },
                {
                    id: 'shield-yara-training',
                    title: 'YARA Rule Training',
                    type: 'tool',
                    difficulty: 'advanced',
                    duration: '45 min',
                    href: 'tools/yara-training.html',
                    prerequisites: ['shield-crypto-intro']
                }
            ]
        },

        web: {
            name: 'Web House - Networking',
            description: 'Build expertise in network fundamentals',
            icon: '🌐',
            color: '#3b82f6',
            modules: [
                {
                    id: 'web-osi-model',
                    title: 'OSI Model Fundamentals',
                    type: 'presentation',
                    difficulty: 'beginner',
                    duration: '25 min',
                    href: 'presentations/osi-model.html',
                    prerequisites: []
                },
                {
                    id: 'web-osi-quiz',
                    title: 'OSI Model Challenge',
                    type: 'quiz',
                    difficulty: 'beginner',
                    duration: '15 min',
                    href: 'quizzes/osi-quiz.html',
                    prerequisites: ['web-osi-model']
                },
                {
                    id: 'web-ip-addressing',
                    title: 'IP Addressing Basics',
                    type: 'applet',
                    difficulty: 'beginner',
                    duration: '30 min',
                    href: 'applets/ip-addressing/ip-address-explorer.html',
                    prerequisites: ['web-osi-quiz']
                },
                {
                    id: 'web-subnetting',
                    title: 'Subnetting Fundamentals',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '40 min',
                    href: 'presentations/subnetting.html',
                    prerequisites: ['web-ip-addressing']
                },
                {
                    id: 'web-subnetting-quiz',
                    title: 'Subnetting Challenge',
                    type: 'quiz',
                    difficulty: 'intermediate',
                    duration: '20 min',
                    href: 'quizzes/subnetting-quiz.html',
                    prerequisites: ['web-subnetting']
                },
                {
                    id: 'web-switching',
                    title: 'Network Switching',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'presentations/switch-operations.html',
                    prerequisites: ['web-subnetting-quiz']
                },
                {
                    id: 'web-vlan',
                    title: 'VLAN Configuration',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '35 min',
                    href: 'presentations/vlan.html',
                    prerequisites: ['web-switching']
                },
                {
                    id: 'web-routing',
                    title: 'Routing Fundamentals',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '35 min',
                    href: 'presentations/topologies.html',
                    prerequisites: ['web-vlan']
                },
                {
                    id: 'web-ospf',
                    title: 'OSPF Protocol',
                    type: 'presentation',
                    difficulty: 'advanced',
                    duration: '40 min',
                    href: 'presentations/ospf.html',
                    prerequisites: ['web-routing']
                },
                {
                    id: 'web-network-simulator',
                    title: 'Network Simulator Lab',
                    type: 'lab',
                    difficulty: 'advanced',
                    duration: '60 min',
                    href: 'simulators/interactive-network-simulator.v2.html',
                    prerequisites: ['web-ospf']
                }
            ]
        },

        forge: {
            name: 'Forge House - Systems',
            description: 'Master operating systems and hardware',
            icon: '🔨',
            color: '#f97316',
            modules: [
                {
                    id: 'forge-windows-editions',
                    title: 'Windows Editions',
                    type: 'presentation',
                    difficulty: 'beginner',
                    duration: '20 min',
                    href: 'presentations/windows-editions.html',
                    prerequisites: []
                },
                {
                    id: 'forge-windows-editions-applet',
                    title: 'Windows Edition Selector',
                    type: 'applet',
                    difficulty: 'beginner',
                    duration: '15 min',
                    href: 'applets/windows-edition-selector.html',
                    prerequisites: ['forge-windows-editions']
                },
                {
                    id: 'forge-windows-settings',
                    title: 'Windows Settings',
                    type: 'presentation',
                    difficulty: 'beginner',
                    duration: '25 min',
                    href: 'presentations/windows-settings.html',
                    prerequisites: ['forge-windows-editions-applet']
                },
                {
                    id: 'forge-control-panel',
                    title: 'Control Panel',
                    type: 'presentation',
                    difficulty: 'beginner',
                    duration: '30 min',
                    href: 'presentations/control-panel.html',
                    prerequisites: ['forge-windows-settings']
                },
                {
                    id: 'forge-admin-tools',
                    title: 'Administrative Tools',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '35 min',
                    href: 'presentations/admin-tools.html',
                    prerequisites: ['forge-control-panel']
                },
                {
                    id: 'forge-system-tools',
                    title: 'System Tools',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'presentations/system-tools.html',
                    prerequisites: ['forge-admin-tools']
                },
                {
                    id: 'forge-hardware',
                    title: 'Hardware Components',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '40 min',
                    href: 'applets/hardware/hardware-trainer.html',
                    prerequisites: ['forge-system-tools']
                },
                {
                    id: 'forge-macos-linux',
                    title: 'macOS & Linux Basics',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '35 min',
                    href: 'presentations/macos-linux-basics.html',
                    prerequisites: ['forge-hardware']
                },
                {
                    id: 'forge-quiz',
                    title: 'Windows Admin Challenge',
                    type: 'quiz',
                    difficulty: 'intermediate',
                    duration: '20 min',
                    href: 'quizzes/windows-admin-quiz.html',
                    prerequisites: ['forge-macos-linux']
                }
            ]
        },

        script: {
            name: 'Script House - Automation',
            description: 'Learn scripting and automation',
            icon: '📜',
            color: '#22c55e',
            modules: [
                {
                    id: 'script-basics',
                    title: 'Scripting Fundamentals',
                    type: 'presentation',
                    difficulty: 'beginner',
                    duration: '20 min',
                    href: 'presentations/scripting-basics.html',
                    prerequisites: []
                },
                {
                    id: 'script-linux-commands',
                    title: 'Linux Command Simulator',
                    type: 'applet',
                    difficulty: 'beginner',
                    duration: '30 min',
                    href: 'applets/linux/linux-command-simulator.html',
                    prerequisites: ['script-basics']
                },
                {
                    id: 'script-linux-filesystem',
                    title: 'Linux Filesystem Navigator',
                    type: 'applet',
                    difficulty: 'beginner',
                    duration: '25 min',
                    href: 'applets/linux/linux-filesystem-navigator.html',
                    prerequisites: ['script-linux-commands']
                },
                {
                    id: 'script-linux-permissions',
                    title: 'Linux Permissions',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'applets/linux/linux-permissions-calculator.html',
                    prerequisites: ['script-linux-filesystem']
                },
                {
                    id: 'script-bash',
                    title: 'Bash Scripting',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '45 min',
                    href: 'applets/linux/bash-scripting-playground.html',
                    prerequisites: ['script-linux-permissions']
                },
                {
                    id: 'script-powershell',
                    title: 'PowerShell Playground',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '40 min',
                    href: 'applets/powershell/powershell-playground.html',
                    prerequisites: ['script-bash']
                },
                {
                    id: 'script-python-intro',
                    title: 'Python: Getting Started',
                    type: 'applet',
                    difficulty: 'beginner',
                    duration: '30 min',
                    href: 'applets/python/python-chapter1-applet.html',
                    prerequisites: ['script-basics']
                },
                {
                    id: 'script-python-strings',
                    title: 'Python: Strings',
                    type: 'applet',
                    difficulty: 'beginner',
                    duration: '25 min',
                    href: 'applets/python/python-chapter2-strings.html',
                    prerequisites: ['script-python-intro']
                },
                {
                    id: 'script-python-flow',
                    title: 'Python: Flow Control',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'applets/python/python-chapter3-flow-control.html',
                    prerequisites: ['script-python-strings']
                },
                {
                    id: 'script-automation',
                    title: 'Automation Visualizer',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '35 min',
                    href: 'applets/sysadmin/automation-visualizer.html',
                    prerequisites: ['script-powershell', 'script-python-flow']
                },
                {
                    id: 'script-linux-quiz',
                    title: 'Linux Basics Challenge',
                    type: 'quiz',
                    difficulty: 'intermediate',
                    duration: '20 min',
                    href: 'quizzes/linux-basics-quiz.html',
                    prerequisites: ['script-automation']
                }
            ]
        },

        cloud: {
            name: 'Cloud House - Cloud Computing',
            description: 'Explore cloud platforms and services',
            icon: '☁️',
            color: '#06b6d4',
            modules: [
                {
                    id: 'cloud-concepts',
                    title: 'Cloud Computing Concepts',
                    type: 'presentation',
                    difficulty: 'beginner',
                    duration: '25 min',
                    href: 'presentations/cloud-concepts.html',
                    prerequisites: []
                },
                {
                    id: 'cloud-models',
                    title: 'Cloud Models Visualizer',
                    type: 'applet',
                    difficulty: 'beginner',
                    duration: '20 min',
                    href: 'applets/fundamentals/ch01-cloud-models-visualizer.html',
                    prerequisites: ['cloud-concepts']
                },
                {
                    id: 'cloud-aws-fundamentals',
                    title: 'AWS Fundamentals',
                    type: 'presentation',
                    difficulty: 'beginner',
                    duration: '30 min',
                    href: 'presentations/aws-fundamentals.html',
                    prerequisites: ['cloud-models']
                },
                {
                    id: 'cloud-aws-account',
                    title: 'AWS Account Explorer',
                    type: 'applet',
                    difficulty: 'beginner',
                    duration: '25 min',
                    href: 'applets/aws/ch02-aws-account-explorer.html',
                    prerequisites: ['cloud-aws-fundamentals']
                },
                {
                    id: 'cloud-aws-regions',
                    title: 'AWS Regions Explorer',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '20 min',
                    href: 'applets/aws/ch04-aws-regions-explorer.html',
                    prerequisites: ['cloud-aws-account']
                },
                {
                    id: 'cloud-aws-iam',
                    title: 'AWS IAM Security',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '35 min',
                    href: 'applets/aws/ch05-security-visualizer.html',
                    prerequisites: ['cloud-aws-regions']
                },
                {
                    id: 'cloud-aws-compute',
                    title: 'AWS Compute Services',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '40 min',
                    href: 'applets/aws/ch07-compute-services-explorer.html',
                    prerequisites: ['cloud-aws-iam']
                },
                {
                    id: 'cloud-aws-storage',
                    title: 'AWS Storage Services',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'applets/aws/ch08-storage-services-explorer.html',
                    prerequisites: ['cloud-aws-compute']
                },
                {
                    id: 'cloud-azure',
                    title: 'Azure Fundamentals',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'presentations/azure-fundamentals.html',
                    prerequisites: ['cloud-aws-storage']
                },
                {
                    id: 'cloud-architecture',
                    title: 'Cloud Architecture Designer',
                    type: 'applet',
                    difficulty: 'advanced',
                    duration: '45 min',
                    href: 'applets/architecture/cloud-architecture-designer.html',
                    prerequisites: ['cloud-azure']
                },
                {
                    id: 'cloud-aws-quiz',
                    title: 'AWS Fundamentals Challenge',
                    type: 'quiz',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'quizzes/aws-fundamentals-quiz.html',
                    prerequisites: ['cloud-architecture']
                }
            ]
        },

        code: {
            name: 'Code House - DevOps',
            description: 'Master CI/CD and infrastructure as code',
            icon: '💻',
            color: '#ec4899',
            modules: [
                {
                    id: 'code-git-basics',
                    title: 'Git Basics',
                    type: 'presentation',
                    difficulty: 'beginner',
                    duration: '25 min',
                    href: 'presentations/git-basics.html',
                    prerequisites: []
                },
                {
                    id: 'code-agile',
                    title: 'Agile & SDLC',
                    type: 'presentation',
                    difficulty: 'beginner',
                    duration: '30 min',
                    href: 'presentations/agile-sdlc.html',
                    prerequisites: ['code-git-basics']
                },
                {
                    id: 'code-agile-quiz',
                    title: 'Agile Challenge',
                    type: 'quiz',
                    difficulty: 'beginner',
                    duration: '15 min',
                    href: 'quizzes/agile-quiz.html',
                    prerequisites: ['code-agile']
                },
                {
                    id: 'code-cicd',
                    title: 'CI/CD Fundamentals',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '35 min',
                    href: 'presentations/cicd-fundamentals.html',
                    prerequisites: ['code-agile-quiz']
                },
                {
                    id: 'code-pipeline',
                    title: 'Pipeline Builder',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '40 min',
                    href: 'applets/pipeline-builder.html',
                    prerequisites: ['code-cicd']
                },
                {
                    id: 'code-docker',
                    title: 'Docker Fundamentals',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '35 min',
                    href: 'presentations/docker-fundamentals.html',
                    prerequisites: ['code-pipeline']
                },
                {
                    id: 'code-docker-playground',
                    title: 'Docker Playground',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '45 min',
                    href: 'applets/docker-playground.html',
                    prerequisites: ['code-docker']
                },
                {
                    id: 'code-kubernetes',
                    title: 'Kubernetes Fundamentals',
                    type: 'presentation',
                    difficulty: 'advanced',
                    duration: '40 min',
                    href: 'presentations/kubernetes-fundamentals.html',
                    prerequisites: ['code-docker-playground']
                },
                {
                    id: 'code-terraform',
                    title: 'Terraform Fundamentals',
                    type: 'presentation',
                    difficulty: 'advanced',
                    duration: '40 min',
                    href: 'presentations/terraform-fundamentals.html',
                    prerequisites: ['code-kubernetes']
                },
                {
                    id: 'code-terraform-visualizer',
                    title: 'Terraform Visualizer',
                    type: 'applet',
                    difficulty: 'advanced',
                    duration: '45 min',
                    href: 'applets/terraform-visualizer.html',
                    prerequisites: ['code-terraform']
                }
            ]
        },

        key: {
            name: 'Key House - Cryptography',
            description: 'Unlock the secrets of cryptography',
            icon: '🔑',
            color: '#eab308',
            modules: [
                {
                    id: 'key-encryption-basics',
                    title: 'Encryption Basics',
                    type: 'presentation',
                    difficulty: 'beginner',
                    duration: '25 min',
                    href: 'presentations/encryption-basics.html',
                    prerequisites: []
                },
                {
                    id: 'key-symmetric',
                    title: 'Symmetric Encryption',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'presentations/advanced-symmetric.html',
                    prerequisites: ['key-encryption-basics']
                },
                {
                    id: 'key-aes-explorer',
                    title: 'AES Explorer',
                    type: 'tool',
                    difficulty: 'intermediate',
                    duration: '35 min',
                    href: 'tools/aes-explorer.html',
                    prerequisites: ['key-symmetric']
                },
                {
                    id: 'key-ecc',
                    title: 'Elliptic Curve Cryptography',
                    type: 'presentation',
                    difficulty: 'advanced',
                    duration: '35 min',
                    href: 'presentations/elliptic-curve.html',
                    prerequisites: ['key-aes-explorer']
                },
                {
                    id: 'key-kdf',
                    title: 'Key Derivation Functions',
                    type: 'presentation',
                    difficulty: 'advanced',
                    duration: '30 min',
                    href: 'presentations/key-derivation.html',
                    prerequisites: ['key-ecc']
                },
                {
                    id: 'key-hmac',
                    title: 'Message Authentication',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'presentations/message-authentication.html',
                    prerequisites: ['key-kdf']
                },
                {
                    id: 'key-certificates',
                    title: 'Digital Certificates',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'presentations/certificates.html',
                    prerequisites: ['key-hmac']
                },
                {
                    id: 'key-pqc',
                    title: 'Post-Quantum Cryptography',
                    type: 'presentation',
                    difficulty: 'advanced',
                    duration: '35 min',
                    href: 'presentations/post-quantum.html',
                    prerequisites: ['key-certificates']
                }
            ]
        },

        eye: {
            name: 'Eye House - Monitoring & Detection',
            description: 'Master security monitoring and SOC operations',
            icon: '👁️',
            color: '#6366f1',
            modules: [
                {
                    id: 'eye-log-basics',
                    title: 'Log Analysis Basics',
                    type: 'presentation',
                    difficulty: 'beginner',
                    duration: '25 min',
                    href: 'presentations/log-basics.html',
                    prerequisites: []
                },
                {
                    id: 'eye-soc-operations',
                    title: 'SOC Operations',
                    type: 'presentation',
                    difficulty: 'beginner',
                    duration: '30 min',
                    href: 'presentations/soc-operations.html',
                    prerequisites: ['eye-log-basics']
                },
                {
                    id: 'eye-soc-simulator',
                    title: 'SOC Simulator',
                    type: 'tool',
                    difficulty: 'intermediate',
                    duration: '45 min',
                    href: 'tools/soc-simulator.html',
                    prerequisites: ['eye-soc-operations']
                },
                {
                    id: 'eye-siem',
                    title: 'SIEM Fundamentals',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '35 min',
                    href: 'presentations/siem-fundamentals.html',
                    prerequisites: ['eye-soc-simulator']
                },
                {
                    id: 'eye-log-correlation',
                    title: 'Log Correlation',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'presentations/log-correlation.html',
                    prerequisites: ['eye-siem']
                },
                {
                    id: 'eye-correlation-engine',
                    title: 'Correlation Engine',
                    type: 'tool',
                    difficulty: 'advanced',
                    duration: '40 min',
                    href: 'tools/correlation-engine.html',
                    prerequisites: ['eye-log-correlation']
                },
                {
                    id: 'eye-threat-hunting',
                    title: 'Threat Hunting',
                    type: 'presentation',
                    difficulty: 'advanced',
                    duration: '35 min',
                    href: 'presentations/threat-hunting.html',
                    prerequisites: ['eye-correlation-engine']
                },
                {
                    id: 'eye-hunt-workbench',
                    title: 'Hunt Workbench',
                    type: 'tool',
                    difficulty: 'advanced',
                    duration: '50 min',
                    href: 'tools/hunt-workbench.html',
                    prerequisites: ['eye-threat-hunting']
                },
                {
                    id: 'eye-traffic-analysis',
                    title: 'Network Traffic Analysis',
                    type: 'presentation',
                    difficulty: 'advanced',
                    duration: '40 min',
                    href: 'presentations/network-traffic-analysis.html',
                    prerequisites: ['eye-hunt-workbench']
                }
            ]
        },

        // DevOps Fundamentals Path (accessible from Script House)
        'devops-fundamentals': {
            name: 'DevOps Fundamentals',
            description: 'Master CI/CD, containerization, and infrastructure as code',
            icon: '⚙️',
            color: '#8b5cf6',
            modules: [
                {
                    id: 'devops-git-basics',
                    title: 'Git Basics',
                    type: 'presentation',
                    difficulty: 'beginner',
                    duration: '25 min',
                    href: '../code/presentations/git-basics.html',
                    prerequisites: []
                },
                {
                    id: 'devops-agile',
                    title: 'Agile & SDLC',
                    type: 'presentation',
                    difficulty: 'beginner',
                    duration: '30 min',
                    href: '../code/presentations/agile-sdlc.html',
                    prerequisites: ['devops-git-basics']
                },
                {
                    id: 'devops-cicd',
                    title: 'CI/CD Fundamentals',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '35 min',
                    href: '../code/presentations/cicd-fundamentals.html',
                    prerequisites: ['devops-agile']
                },
                {
                    id: 'devops-pipeline',
                    title: 'Pipeline Builder',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '40 min',
                    href: '../code/applets/pipeline-builder.html',
                    prerequisites: ['devops-cicd']
                },
                {
                    id: 'devops-docker',
                    title: 'Docker Fundamentals',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '35 min',
                    href: '../code/presentations/docker-fundamentals.html',
                    prerequisites: ['devops-pipeline']
                },
                {
                    id: 'devops-docker-playground',
                    title: 'Docker Playground',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '45 min',
                    href: '../code/applets/docker-playground.html',
                    prerequisites: ['devops-docker']
                },
                {
                    id: 'devops-kubernetes',
                    title: 'Kubernetes Fundamentals',
                    type: 'presentation',
                    difficulty: 'advanced',
                    duration: '40 min',
                    href: '../code/presentations/kubernetes-fundamentals.html',
                    prerequisites: ['devops-docker-playground']
                },
                {
                    id: 'devops-terraform',
                    title: 'Terraform Fundamentals',
                    type: 'presentation',
                    difficulty: 'advanced',
                    duration: '40 min',
                    href: '../code/presentations/terraform-fundamentals.html',
                    prerequisites: ['devops-kubernetes']
                },
                {
                    id: 'devops-terraform-visualizer',
                    title: 'Terraform Visualizer',
                    type: 'applet',
                    difficulty: 'advanced',
                    duration: '45 min',
                    href: '../code/applets/terraform-visualizer.html',
                    prerequisites: ['devops-terraform']
                }
            ]
        },

        // Linux Mastery - Skills-First Learning Path
        'linux-mastery': {
            name: 'Linux Mastery',
            description: 'Master Linux from the ground up - pure skills, no pressure',
            icon: '🐧',
            color: '#22c55e',
            modules: [
                // Section 1: Getting Started
                {
                    id: 'lm-01-welcome',
                    title: 'Welcome to Linux',
                    type: 'presentation',
                    difficulty: 'beginner',
                    duration: '15 min',
                    href: 'modules/linux-mastery/lm-01-welcome.html',
                    prerequisites: []
                },
                {
                    id: 'lm-02-first-commands',
                    title: 'Your First Commands',
                    type: 'lab',
                    difficulty: 'beginner',
                    duration: '20 min',
                    href: 'modules/linux-mastery/lm-02-first-commands.html',
                    prerequisites: ['lm-01-welcome']
                },
                {
                    id: 'lm-03-getting-help',
                    title: 'Getting Help',
                    type: 'lab',
                    difficulty: 'beginner',
                    duration: '15 min',
                    href: 'modules/linux-mastery/lm-03-getting-help.html',
                    prerequisites: ['lm-02-first-commands']
                },
                {
                    id: 'lm-04-terminal-environment',
                    title: 'The Terminal Environment',
                    type: 'presentation',
                    difficulty: 'beginner',
                    duration: '15 min',
                    href: 'modules/linux-mastery/lm-04-terminal-environment.html',
                    prerequisites: ['lm-03-getting-help']
                },
                {
                    id: 'lm-05-section1-practice',
                    title: 'Section 1 Practice',
                    type: 'lab',
                    difficulty: 'beginner',
                    duration: '25 min',
                    href: 'modules/linux-mastery/lm-05-section1-practice.html',
                    prerequisites: ['lm-04-terminal-environment']
                },
                // Section 2: Navigation & Files
                {
                    id: 'lm-06-navigation',
                    title: 'Directory Navigation',
                    type: 'lab',
                    difficulty: 'beginner',
                    duration: '20 min',
                    href: 'modules/linux-mastery/lm-06-navigation.html',
                    prerequisites: ['lm-05-section1-practice']
                },
                {
                    id: 'lm-07-listing-files',
                    title: 'Listing Files',
                    type: 'lab',
                    difficulty: 'beginner',
                    duration: '20 min',
                    href: 'modules/linux-mastery/lm-07-listing-files.html',
                    prerequisites: ['lm-06-navigation']
                },
                {
                    id: 'lm-08-file-operations',
                    title: 'File Operations',
                    type: 'lab',
                    difficulty: 'beginner',
                    duration: '25 min',
                    href: 'modules/linux-mastery/lm-08-file-operations.html',
                    prerequisites: ['lm-07-listing-files']
                },
                {
                    id: 'lm-09-copy-move',
                    title: 'Copy and Move',
                    type: 'lab',
                    difficulty: 'beginner',
                    duration: '20 min',
                    href: 'modules/linux-mastery/lm-09-copy-move.html',
                    prerequisites: ['lm-08-file-operations']
                },
                {
                    id: 'lm-10-viewing-files',
                    title: 'Viewing Files',
                    type: 'lab',
                    difficulty: 'beginner',
                    duration: '20 min',
                    href: 'modules/linux-mastery/lm-10-viewing-files.html',
                    prerequisites: ['lm-09-copy-move']
                },
                {
                    id: 'lm-11-finding-files',
                    title: 'Finding Files',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'modules/linux-mastery/lm-11-finding-files.html',
                    prerequisites: ['lm-10-viewing-files']
                },
                {
                    id: 'lm-12-section2-practice',
                    title: 'Section 2 Practice',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'modules/linux-mastery/lm-12-section2-practice.html',
                    prerequisites: ['lm-11-finding-files']
                },
                // Section 3: Text Processing
                {
                    id: 'lm-13-grep-basics',
                    title: 'grep Basics',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'modules/linux-mastery/lm-13-grep-basics.html',
                    prerequisites: ['lm-12-section2-practice']
                },
                {
                    id: 'lm-14-regular-expressions',
                    title: 'Regular Expressions',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'modules/linux-mastery/lm-14-regular-expressions.html',
                    prerequisites: ['lm-13-grep-basics']
                },
                {
                    id: 'lm-15-sed-editor',
                    title: 'sed Stream Editor',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'modules/linux-mastery/lm-15-sed-editor.html',
                    prerequisites: ['lm-14-regular-expressions']
                },
                {
                    id: 'lm-16-awk-processing',
                    title: 'awk Processing',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'modules/linux-mastery/lm-16-awk-processing.html',
                    prerequisites: ['lm-15-sed-editor']
                },
                {
                    id: 'lm-17-sort-uniq',
                    title: 'sort and uniq',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '20 min',
                    href: 'modules/linux-mastery/lm-17-sort-uniq.html',
                    prerequisites: ['lm-16-awk-processing']
                },
                {
                    id: 'lm-18-cut-paste',
                    title: 'cut and paste',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '20 min',
                    href: 'modules/linux-mastery/lm-18-cut-paste.html',
                    prerequisites: ['lm-17-sort-uniq']
                },
                {
                    id: 'lm-19-text-pipelines',
                    title: 'Text Pipelines',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'modules/linux-mastery/lm-19-text-pipelines.html',
                    prerequisites: ['lm-18-cut-paste']
                },
                {
                    id: 'lm-20-section3-practice',
                    title: 'Section 3 Practice',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '35 min',
                    href: 'modules/linux-mastery/lm-20-section3-practice.html',
                    prerequisites: ['lm-19-text-pipelines']
                },
                // Section 4: Permissions & Users
                {
                    id: 'lm-21-users-groups',
                    title: 'Users and Groups',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '20 min',
                    href: 'modules/linux-mastery/lm-21-users-groups.html',
                    prerequisites: ['lm-20-section3-practice']
                },
                {
                    id: 'lm-22-file-permissions',
                    title: 'File Permissions',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'modules/linux-mastery/lm-22-file-permissions.html',
                    prerequisites: ['lm-21-users-groups']
                },
                {
                    id: 'lm-23-chmod',
                    title: 'chmod',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'modules/linux-mastery/lm-23-chmod.html',
                    prerequisites: ['lm-22-file-permissions']
                },
                {
                    id: 'lm-24-chown',
                    title: 'chown',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '20 min',
                    href: 'modules/linux-mastery/lm-24-chown.html',
                    prerequisites: ['lm-23-chmod']
                },
                {
                    id: 'lm-25-sudo',
                    title: 'sudo',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '20 min',
                    href: 'modules/linux-mastery/lm-25-sudo.html',
                    prerequisites: ['lm-24-chown']
                },
                {
                    id: 'lm-26-special-permissions',
                    title: 'Special Permissions',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'modules/linux-mastery/lm-26-special-permissions.html',
                    prerequisites: ['lm-25-sudo']
                },
                {
                    id: 'lm-27-section4-practice',
                    title: 'Section 4 Practice',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '35 min',
                    href: 'modules/linux-mastery/lm-27-section4-practice.html',
                    prerequisites: ['lm-26-special-permissions']
                },
                // Section 5: Processes
                {
                    id: 'lm-28-process-basics',
                    title: 'Process Basics',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'modules/linux-mastery/lm-28-process-basics.html',
                    prerequisites: ['lm-27-section4-practice']
                },
                {
                    id: 'lm-29-ps-top',
                    title: 'ps and top',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'modules/linux-mastery/lm-29-ps-top.html',
                    prerequisites: ['lm-28-process-basics']
                },
                {
                    id: 'lm-30-background-jobs',
                    title: 'Background Jobs',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'modules/linux-mastery/lm-30-background-jobs.html',
                    prerequisites: ['lm-29-ps-top']
                },
                {
                    id: 'lm-31-signals-kill',
                    title: 'Signals and kill',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '20 min',
                    href: 'modules/linux-mastery/lm-31-signals-kill.html',
                    prerequisites: ['lm-30-background-jobs']
                },
                {
                    id: 'lm-32-cron',
                    title: 'cron',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'modules/linux-mastery/lm-32-cron.html',
                    prerequisites: ['lm-31-signals-kill']
                },
                {
                    id: 'lm-33-systemd',
                    title: 'systemd',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'modules/linux-mastery/lm-33-systemd.html',
                    prerequisites: ['lm-32-cron']
                },
                {
                    id: 'lm-34-section5-practice',
                    title: 'Section 5 Practice',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '35 min',
                    href: 'modules/linux-mastery/lm-34-section5-practice.html',
                    prerequisites: ['lm-33-systemd']
                },
                // Section 6: Networking Basics
                {
                    id: 'lm-35-network-info',
                    title: 'Network Info',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '20 min',
                    href: 'modules/linux-mastery/lm-35-network-info.html',
                    prerequisites: ['lm-34-section5-practice']
                },
                {
                    id: 'lm-36-connectivity',
                    title: 'Connectivity',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '20 min',
                    href: 'modules/linux-mastery/lm-36-connectivity.html',
                    prerequisites: ['lm-35-network-info']
                },
                {
                    id: 'lm-37-dns-tools',
                    title: 'DNS Tools',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '20 min',
                    href: 'modules/linux-mastery/lm-37-dns-tools.html',
                    prerequisites: ['lm-36-connectivity']
                },
                {
                    id: 'lm-38-downloading',
                    title: 'Downloading',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '20 min',
                    href: 'modules/linux-mastery/lm-38-downloading.html',
                    prerequisites: ['lm-37-dns-tools']
                },
                {
                    id: 'lm-39-ssh-basics',
                    title: 'SSH Basics',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'modules/linux-mastery/lm-39-ssh-basics.html',
                    prerequisites: ['lm-38-downloading']
                },
                {
                    id: 'lm-40-section6-practice',
                    title: 'Section 6 Practice',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'modules/linux-mastery/lm-40-section6-practice.html',
                    prerequisites: ['lm-39-ssh-basics']
                },
                // Section 7: Shell Scripting
                {
                    id: 'lm-41-first-script',
                    title: 'First Script',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '20 min',
                    href: 'modules/linux-mastery/lm-41-first-script.html',
                    prerequisites: ['lm-40-section6-practice']
                },
                {
                    id: 'lm-42-variables',
                    title: 'Variables',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'modules/linux-mastery/lm-42-variables.html',
                    prerequisites: ['lm-41-first-script']
                },
                {
                    id: 'lm-43-user-input',
                    title: 'User Input',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '20 min',
                    href: 'modules/linux-mastery/lm-43-user-input.html',
                    prerequisites: ['lm-42-variables']
                },
                {
                    id: 'lm-44-conditionals',
                    title: 'Conditionals',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'modules/linux-mastery/lm-44-conditionals.html',
                    prerequisites: ['lm-43-user-input']
                },
                {
                    id: 'lm-45-loops',
                    title: 'Loops',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'modules/linux-mastery/lm-45-loops.html',
                    prerequisites: ['lm-44-conditionals']
                },
                {
                    id: 'lm-46-functions',
                    title: 'Functions',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'modules/linux-mastery/lm-46-functions.html',
                    prerequisites: ['lm-45-loops']
                },
                {
                    id: 'lm-47-practical-scripts',
                    title: 'Practical Scripts',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'modules/linux-mastery/lm-47-practical-scripts.html',
                    prerequisites: ['lm-46-functions']
                },
                {
                    id: 'lm-48-section7-practice',
                    title: 'Section 7 Practice',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '35 min',
                    href: 'modules/linux-mastery/lm-48-section7-practice.html',
                    prerequisites: ['lm-47-practical-scripts']
                },
                // Section 8: Beyond Basics
                {
                    id: 'lm-49-links',
                    title: 'Links',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '20 min',
                    href: 'modules/linux-mastery/lm-49-links.html',
                    prerequisites: ['lm-48-section7-practice']
                },
                {
                    id: 'lm-50-text-editors',
                    title: 'Text Editors',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'modules/linux-mastery/lm-50-text-editors.html',
                    prerequisites: ['lm-49-links']
                },
                {
                    id: 'lm-51-package-management',
                    title: 'Package Management',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'modules/linux-mastery/lm-51-package-management.html',
                    prerequisites: ['lm-50-text-editors']
                },
                {
                    id: 'lm-52-environment-path',
                    title: 'Environment & PATH',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '20 min',
                    href: 'modules/linux-mastery/lm-52-environment-path.html',
                    prerequisites: ['lm-51-package-management']
                },
                {
                    id: 'lm-53-next-steps',
                    title: 'Next Steps',
                    type: 'presentation',
                    difficulty: 'beginner',
                    duration: '15 min',
                    href: 'modules/linux-mastery/lm-53-next-steps.html',
                    prerequisites: ['lm-52-environment-path']
                }
            ]
        },

        // CompTIA Linux+ XK0-005 Certification Path
        'comptia-linux': {
            name: 'CompTIA Linux+ (XK0-005)',
            description: 'Complete Linux administration certification prep covering system management, security, scripting, and troubleshooting',
            icon: '🐧',
            color: '#22c55e',
            modules: [
                // Section 1: Linux Fundamentals
                {
                    id: 'linux-section1-intro',
                    title: 'Section 1: Linux System Overview',
                    type: 'presentation',
                    difficulty: 'beginner',
                    duration: '25 min',
                    href: 'applets/linux/ubuntu-components.html',
                    prerequisites: []
                },
                {
                    id: 'linux-section1-quiz',
                    title: 'Section 1 Quiz: Linux Fundamentals',
                    type: 'quiz',
                    difficulty: 'beginner',
                    duration: '15 min',
                    href: 'quizzes/linux-section1-quiz.html',
                    prerequisites: ['linux-section1-intro']
                },
                // Section 2: Command Line Essentials
                {
                    id: 'linux-section2-cli',
                    title: 'Section 2: Command Line Essentials',
                    type: 'applet',
                    difficulty: 'beginner',
                    duration: '30 min',
                    href: 'applets/linux/linux-command-simulator.html',
                    prerequisites: ['linux-section1-quiz']
                },
                {
                    id: 'linux-section2-quiz',
                    title: 'Section 2 Quiz: CLI Commands',
                    type: 'quiz',
                    difficulty: 'beginner',
                    duration: '15 min',
                    href: 'quizzes/linux-basics-quiz.html',
                    prerequisites: ['linux-section2-cli']
                },
                // Section 3: File System Navigation
                {
                    id: 'linux-section3-filesystem',
                    title: 'Section 3: File System Navigation',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'applets/linux/linux-filesystem-navigator.html',
                    prerequisites: ['linux-section2-quiz']
                },
                {
                    id: 'linux-section3-lab',
                    title: 'Section 3 Lab: File Navigation',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '20 min',
                    href: 'applets/linux/linux-lab-002-file-navigation.html',
                    prerequisites: ['linux-section3-filesystem']
                },
                // Section 4: Permissions & Security
                {
                    id: 'linux-section4-permissions',
                    title: 'Section 4: Linux Permissions',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'applets/linux/linux-permissions-calculator.html',
                    prerequisites: ['linux-section3-lab']
                },
                {
                    id: 'linux-section4-lab',
                    title: 'Section 4 Lab: User Identity',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'applets/linux/linux-lab-001-user-identity.html',
                    prerequisites: ['linux-section4-permissions']
                },
                // Section 5: Scripting & Automation
                {
                    id: 'linux-section5-bash',
                    title: 'Section 5: Bash Scripting',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '45 min',
                    href: 'applets/linux/bash-scripting-playground.html',
                    prerequisites: ['linux-section4-lab']
                },
                {
                    id: 'linux-section5-quiz',
                    title: 'Section 5 Quiz: Bash Scripting',
                    type: 'quiz',
                    difficulty: 'intermediate',
                    duration: '20 min',
                    href: 'quizzes/linux-bash-quiz.html',
                    prerequisites: ['linux-section5-bash']
                },
                // Section 6: Cross-Platform
                {
                    id: 'linux-section6-macos',
                    title: 'Section 6: macOS & Linux',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'applets/linux/lab-macos-linux.html',
                    prerequisites: ['linux-section5-quiz']
                }
            ]
        },

        // CompTIA A+ Core 1 (220-1101) — Forge House
        'aplus-core1': {
            name: 'CompTIA A+ Core 1 (220-1101)',
            description: 'Hardware, networking, mobile devices, virtualization, and troubleshooting',
            icon: '🔧',
            color: '#f97316',
            modules: [
                {
                    id: 'aplus-core1-ch01',
                    title: 'Motherboards',
                    type: 'chapter',
                    href: 'houses/forge/applets/comptia-aplus/core-1/chapters/ch01-motherboards/index.html'
                },
                {
                    id: 'aplus-core1-ch02',
                    title: 'Expansion Cards & Storage',
                    type: 'chapter',
                    href: 'houses/forge/applets/comptia-aplus/core-1/chapters/ch02-expansion-storage/index.html'
                },
                {
                    id: 'aplus-core1-ch03',
                    title: 'Peripherals & Connectors',
                    type: 'chapter',
                    href: 'houses/forge/applets/comptia-aplus/core-1/chapters/ch03-peripherals/index.html'
                },
                {
                    id: 'aplus-core1-ch04',
                    title: 'Printers & Multifunction Devices',
                    type: 'chapter',
                    href: 'houses/forge/applets/comptia-aplus/core-1/chapters/ch04-printers/index.html'
                },
                {
                    id: 'aplus-core1-ch05',
                    title: 'Networking Fundamentals',
                    type: 'chapter',
                    href: 'houses/forge/applets/comptia-aplus/core-1/chapters/ch05-networking/index.html'
                },
                {
                    id: 'aplus-core1-ch06',
                    title: 'TCP/IP & Network Services',
                    type: 'chapter',
                    href: 'houses/forge/applets/comptia-aplus/core-1/chapters/ch06-tcpip/index.html'
                },
                {
                    id: 'aplus-core1-ch07',
                    title: 'Wireless Networking',
                    type: 'chapter',
                    href: 'houses/forge/applets/comptia-aplus/core-1/chapters/ch07-wireless/index.html'
                },
                {
                    id: 'aplus-core1-ch08',
                    title: 'Cloud & Virtualization',
                    type: 'chapter',
                    href: 'houses/forge/applets/comptia-aplus/core-1/chapters/ch08-cloud/index.html'
                },
                {
                    id: 'aplus-core1-ch09',
                    title: 'Laptops & Mobile Devices',
                    type: 'chapter',
                    href: 'houses/forge/applets/comptia-aplus/core-1/chapters/ch09-laptops/index.html'
                },
                {
                    id: 'aplus-core1-ch10',
                    title: 'Mobile Device Configuration',
                    type: 'chapter',
                    href: 'houses/forge/applets/comptia-aplus/core-1/chapters/ch10-mobile/index.html'
                },
                {
                    id: 'aplus-core1-ch11',
                    title: 'Troubleshooting Methodology',
                    type: 'chapter',
                    href: 'houses/forge/applets/comptia-aplus/core-1/chapters/ch11-troubleshooting/index.html'
                },
                {
                    id: 'aplus-core1-ch12',
                    title: 'Hardware & Network Troubleshooting',
                    type: 'chapter',
                    href: 'houses/forge/applets/comptia-aplus/core-1/chapters/ch12-hw-network-troubleshooting/index.html'
                }
            ]
        },

        // CompTIA A+ Core 2 (220-1102) — Forge House
        'aplus-core2': {
            name: 'CompTIA A+ Core 2 (220-1102)',
            description: 'Operating systems, security, software troubleshooting, and operational procedures',
            icon: '🖥️',
            color: '#ea580c',
            modules: [
                {
                    id: 'aplus-core2-ch13',
                    title: 'Windows Editions & Features',
                    type: 'chapter',
                    href: 'houses/forge/applets/comptia-aplus/core-2/chapters/ch13-windows-editions/index.html'
                },
                {
                    id: 'aplus-core2-ch14',
                    title: 'Windows Settings & Configuration',
                    type: 'chapter',
                    href: 'houses/forge/applets/comptia-aplus/core-2/chapters/ch14-windows-settings/index.html'
                },
                {
                    id: 'aplus-core2-ch15',
                    title: 'Administrative Tools',
                    type: 'chapter',
                    href: 'houses/forge/applets/comptia-aplus/core-2/chapters/ch15-admin-tools/index.html'
                },
                {
                    id: 'aplus-core2-ch16',
                    title: 'System Utilities',
                    type: 'chapter',
                    href: 'houses/forge/applets/comptia-aplus/core-2/chapters/ch16-system-tools/index.html'
                },
                {
                    id: 'aplus-core2-ch17',
                    title: 'macOS & Linux Basics',
                    type: 'chapter',
                    href: 'houses/forge/applets/comptia-aplus/core-2/chapters/ch17-macos-linux/index.html'
                },
                {
                    id: 'aplus-core2-ch18',
                    title: 'Users, Groups & Permissions',
                    type: 'chapter',
                    href: 'houses/forge/applets/comptia-aplus/core-2/chapters/ch18-users-groups/index.html'
                },
                {
                    id: 'aplus-core2-ch19',
                    title: 'Security Fundamentals',
                    type: 'chapter',
                    href: 'houses/forge/applets/comptia-aplus/core-2/chapters/ch19-security/index.html'
                },
                {
                    id: 'aplus-core2-ch20',
                    title: 'Malware Detection & Removal',
                    type: 'chapter',
                    href: 'houses/forge/applets/comptia-aplus/core-2/chapters/ch20-malware/index.html'
                },
                {
                    id: 'aplus-core2-ch21',
                    title: 'Physical Security',
                    type: 'chapter',
                    href: 'houses/forge/applets/comptia-aplus/core-2/chapters/ch21-physical-security/index.html'
                },
                {
                    id: 'aplus-core2-ch22',
                    title: 'Incident Response',
                    type: 'chapter',
                    href: 'houses/forge/applets/comptia-aplus/core-2/chapters/ch22-incident-response/index.html'
                },
                {
                    id: 'aplus-core2-ch23',
                    title: 'Change Management',
                    type: 'chapter',
                    href: 'houses/forge/applets/comptia-aplus/core-2/chapters/ch23-change-management/index.html'
                },
                {
                    id: 'aplus-core2-ch24',
                    title: 'Documentation & Professionalism',
                    type: 'chapter',
                    href: 'houses/forge/applets/comptia-aplus/core-2/chapters/ch24-documentation/index.html'
                }
            ]
        },

        // Windows Server Administration (AZ-800) — Cloud House
        'wsa': {
            name: 'Windows Server Administration',
            description: 'AZ-800 Windows Server Administration: installation, AD DS, storage, virtualization, networking, and security',
            icon: '🖥️',
            color: '#06b6d4',
            modules: [
                // Phase 1: Foundation & Core Services
                {
                    id: 'wsa-m01-fundamentals',
                    title: 'Server Installation & Configuration',
                    type: 'presentation',
                    difficulty: 'beginner',
                    duration: '45 min',
                    href: 'modules/wsa/m01-fundamentals/presentation.html',
                    prerequisites: []
                },
                {
                    id: 'wsa-m02-active-directory',
                    title: 'Active Directory Domain Services',
                    type: 'presentation',
                    difficulty: 'beginner',
                    duration: '50 min',
                    href: 'modules/wsa/m02-active-directory/presentation.html',
                    prerequisites: ['wsa-m01-fundamentals']
                },
                {
                    id: 'wsa-m03-storage',
                    title: 'Storage & File Systems',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '45 min',
                    href: 'modules/wsa/m03-storage/presentation.html',
                    prerequisites: ['wsa-m02-active-directory']
                },
                {
                    id: 'wsa-m04-hyperv',
                    title: 'Hyper-V Virtualization',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '50 min',
                    href: 'modules/wsa/m04-hyperv/presentation.html',
                    prerequisites: ['wsa-m03-storage']
                },
                {
                    id: 'wsa-m05-containers',
                    title: 'Docker Containers',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '45 min',
                    href: 'modules/wsa/m05-containers/presentation.html',
                    prerequisites: ['wsa-m04-hyperv']
                },
                {
                    id: 'wsa-m06-clustering',
                    title: 'Failover Clustering',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '45 min',
                    href: 'modules/wsa/m06-clustering/presentation.html',
                    prerequisites: ['wsa-m05-containers']
                },
                {
                    id: 'wsa-m07-monitoring',
                    title: 'Monitoring & Performance',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '40 min',
                    href: 'modules/wsa/m07-monitoring/presentation.html',
                    prerequisites: ['wsa-m06-clustering']
                },
                {
                    id: 'wsa-m08-dns',
                    title: 'DNS & Name Resolution',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '45 min',
                    href: 'modules/wsa/m08-dns/presentation.html',
                    prerequisites: ['wsa-m07-monitoring']
                },
                {
                    id: 'wsa-m09-dhcp',
                    title: 'DHCP Services',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '40 min',
                    href: 'modules/wsa/m09-dhcp/presentation.html',
                    prerequisites: ['wsa-m08-dns']
                },
                {
                    id: 'wsa-m10-group-policy',
                    title: 'Group Policy',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '50 min',
                    href: 'modules/wsa/m10-group-policy/presentation.html',
                    prerequisites: ['wsa-m09-dhcp']
                },
                // Phase 2: Advanced Services & Operations
                {
                    id: 'wsa-m11-iis',
                    title: 'IIS & Web Services',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '45 min',
                    href: 'modules/wsa/m11-iis/presentation.html',
                    prerequisites: ['wsa-m10-group-policy']
                },
                {
                    id: 'wsa-m12-remote-desktop',
                    title: 'Remote Desktop Services',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '40 min',
                    href: 'modules/wsa/m12-remote-desktop/presentation.html',
                    prerequisites: ['wsa-m11-iis']
                },
                {
                    id: 'wsa-m13-certificate-services',
                    title: 'Certificate Services (PKI)',
                    type: 'presentation',
                    difficulty: 'advanced',
                    duration: '45 min',
                    href: 'modules/wsa/m13-certificate-services/presentation.html',
                    prerequisites: ['wsa-m12-remote-desktop']
                },
                {
                    id: 'wsa-m14-advanced-networking',
                    title: 'Advanced Networking',
                    type: 'presentation',
                    difficulty: 'advanced',
                    duration: '45 min',
                    href: 'modules/wsa/m14-advanced-networking/presentation.html',
                    prerequisites: ['wsa-m13-certificate-services']
                },
                {
                    id: 'wsa-m15-ad-sites',
                    title: 'AD Sites & Replication',
                    type: 'presentation',
                    difficulty: 'advanced',
                    duration: '40 min',
                    href: 'modules/wsa/m15-ad-sites/presentation.html',
                    prerequisites: ['wsa-m14-advanced-networking']
                },
                {
                    id: 'wsa-m16-backup-recovery',
                    title: 'Backup & Disaster Recovery',
                    type: 'presentation',
                    difficulty: 'advanced',
                    duration: '45 min',
                    href: 'modules/wsa/m16-backup-recovery/presentation.html',
                    prerequisites: ['wsa-m15-ad-sites']
                },
                {
                    id: 'wsa-m17-firewall-security',
                    title: 'Windows Firewall & Security',
                    type: 'presentation',
                    difficulty: 'advanced',
                    duration: '45 min',
                    href: 'modules/wsa/m17-firewall-security/presentation.html',
                    prerequisites: ['wsa-m16-backup-recovery']
                },
                {
                    id: 'wsa-m18-powershell-automation',
                    title: 'PowerShell Automation',
                    type: 'presentation',
                    difficulty: 'advanced',
                    duration: '50 min',
                    href: 'modules/wsa/m18-powershell-automation/presentation.html',
                    prerequisites: ['wsa-m17-firewall-security']
                },
                {
                    id: 'wsa-m19-troubleshooting',
                    title: 'Troubleshooting & Migration',
                    type: 'presentation',
                    difficulty: 'advanced',
                    duration: '45 min',
                    href: 'modules/wsa/m19-troubleshooting-migration/presentation.html',
                    prerequisites: ['wsa-m18-powershell-automation']
                },
                // Capstone
                {
                    id: 'wsa-m20-capstone',
                    title: 'Failsafe Protocol (Capstone)',
                    type: 'lab',
                    difficulty: 'advanced',
                    duration: '90 min',
                    href: 'modules/wsa/m20-failsafe-capstone/index.html',
                    prerequisites: ['wsa-m19-troubleshooting']
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
                const prereqsMet = module.prerequisites.every(p => completedSet.has(p));
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
        return module.prerequisites.every(p => completedSet.has(p));
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
            available: module.prerequisites.every(p => completedSet.has(p)),
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
}

// Make globally available
window.LearningPaths = LearningPaths;
