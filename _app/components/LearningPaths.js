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
                    href: 'presentations/shield-cia-triad.presentation.html',
                    prerequisites: []
                },
                {
                    id: 'shield-cia-triad-quiz',
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
                    prerequisites: ['shield-cia-triad-quiz']
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
                    id: 'shield-threats',
                    title: 'Threat Landscape',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'houses/shield/applets/threats/threat_actors/shield-threat-actors.applet.html',
                    prerequisites: ['shield-access-control']
                },
                {
                    id: 'shield-risk',
                    title: 'Risk Assessment',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '35 min',
                    href: 'houses/shield/applets/risk/risk_management/shield-risk-management.applet.html',
                    prerequisites: ['shield-threats']
                },
                {
                    id: 'shield-network-security',
                    title: 'Network Security Basics',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'houses/shield/applets/network/shield-home-network-security.applet.html',
                    prerequisites: ['shield-risk']
                },
                {
                    id: 'shield-crypto-intro',
                    title: 'Cryptography Introduction',
                    type: 'applet',
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
                    href: 'houses/web/applets/ip-addressing/binaryIP/web-binary-ip.applet.html',
                    prerequisites: ['web-osi-quiz']
                },
                {
                    id: 'web-subnetting',
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
                    prerequisites: ['web-subnetting']
                },
                {
                    id: 'web-switching',
                    title: 'Network Switching',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'houses/web/presentations/web-switch-operations.presentation.html',
                    prerequisites: ['web-subnetting-quiz']
                },
                {
                    id: 'web-vlan',
                    title: 'VLAN Configuration',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '35 min',
                    href: 'houses/web/presentations/web-vlan.presentation.html',
                    prerequisites: ['web-switching']
                },
                {
                    id: 'web-routing',
                    title: 'Routing Fundamentals',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '35 min',
                    href: 'houses/web/presentations/web-topologies.presentation.html',
                    prerequisites: ['web-vlan']
                },
                {
                    id: 'web-ospf',
                    title: 'OSPF Protocol',
                    type: 'presentation',
                    difficulty: 'advanced',
                    duration: '40 min',
                    href: 'houses/web/presentations/web-ospf.presentation.html',
                    prerequisites: ['web-routing']
                },
                {
                    id: 'web-network-simulator',
                    title: 'Network Simulator Lab',
                    type: 'lab',
                    difficulty: 'advanced',
                    duration: '60 min',
                    href: 'simulators/web-interactive-network-simulatorv2.simulator.html',
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
                    href: 'presentations/forge-windows-editions.presentation.html',
                    prerequisites: []
                },
                {
                    id: 'forge-windows-editions-applet',
                    title: 'Windows Edition Selector',
                    type: 'applet',
                    difficulty: 'beginner',
                    duration: '15 min',
                    href: 'applets/forge-windows-edition-selector.applet.html',
                    prerequisites: ['forge-windows-editions']
                },
                {
                    id: 'forge-windows-settings',
                    title: 'Windows Settings',
                    type: 'presentation',
                    difficulty: 'beginner',
                    duration: '25 min',
                    href: 'presentations/forge-windows-settings.presentation.html',
                    prerequisites: ['forge-windows-editions-applet']
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
                    id: 'forge-hardware',
                    title: 'Hardware Components',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '40 min',
                    href: 'applets/hardware/forge-hardware-trainer.applet.html',
                    prerequisites: ['forge-system-tools']
                },
                {
                    id: 'forge-macos-linux',
                    title: 'macOS & Linux Basics',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '35 min',
                    href: 'presentations/forge-macos-linux-basics.presentation.html',
                    prerequisites: ['forge-hardware']
                },
                {
                    id: 'forge-quiz',
                    title: 'Windows Admin Challenge',
                    type: 'quiz',
                    difficulty: 'intermediate',
                    duration: '20 min',
                    href: 'quizzes/forge-windows-admin.quiz.html',
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
                    href: 'presentations/script-scripting-basics.presentation.html',
                    prerequisites: []
                },
                {
                    id: 'script-linux-commands',
                    title: 'Linux Command Simulator',
                    type: 'applet',
                    difficulty: 'beginner',
                    duration: '30 min',
                    href: 'houses/script/tools/script-linux-command.tool.html',
                    prerequisites: ['script-basics']
                },
                {
                    id: 'script-linux-filesystem',
                    title: 'Linux Filesystem Navigator',
                    type: 'applet',
                    difficulty: 'beginner',
                    duration: '25 min',
                    href: 'applets/linux/script-linux-filesystem-navigator.applet.html',
                    prerequisites: ['script-linux-commands']
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
                    id: 'script-bash',
                    title: 'Bash Scripting',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '45 min',
                    href: 'applets/linux/script-bash-scripting-playground.applet.html',
                    prerequisites: ['script-linux-permissions']
                },
                {
                    id: 'script-powershell',
                    title: 'PowerShell Playground',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '40 min',
                    href: 'applets/powershell/script-powershell-playground.applet.html',
                    prerequisites: ['script-bash']
                },
                {
                    id: 'script-python-intro',
                    title: 'Python: Getting Started',
                    type: 'applet',
                    difficulty: 'beginner',
                    duration: '30 min',
                    href: 'applets/python/script-python-chapter1.applet.html',
                    prerequisites: ['script-basics']
                },
                {
                    id: 'script-python-strings',
                    title: 'Python: Strings',
                    type: 'applet',
                    difficulty: 'beginner',
                    duration: '25 min',
                    href: 'applets/python/script-python-chapter2-strings.applet.html',
                    prerequisites: ['script-python-intro']
                },
                {
                    id: 'script-python-flow',
                    title: 'Python: Flow Control',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'applets/python/script-python-chapter3-flow-control.applet.html',
                    prerequisites: ['script-python-strings']
                },
                {
                    id: 'script-automation',
                    title: 'Automation Visualizer',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '35 min',
                    href: 'houses/script/tools/script-automation.tool.html',
                    prerequisites: ['script-powershell', 'script-python-flow']
                },
                {
                    id: 'script-linux-quiz',
                    title: 'Linux Basics Challenge',
                    type: 'quiz',
                    difficulty: 'intermediate',
                    duration: '20 min',
                    href: 'quizzes/script-linux-basics.quiz.html',
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
                    id: 'cloud-aws-fundamentals',
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
                    prerequisites: ['cloud-aws-fundamentals']
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
                    id: 'cloud-aws-iam',
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
                    prerequisites: ['cloud-aws-iam']
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
                    id: 'cloud-azure',
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
                    prerequisites: ['cloud-azure']
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
                    id: 'code-cicd',
                    title: 'CI/CD Fundamentals',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '35 min',
                    href: 'presentations/code-cicd-fundamentals.presentation.html',
                    prerequisites: ['code-agile-quiz']
                },
                {
                    id: 'code-pipeline',
                    title: 'Pipeline Builder',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '40 min',
                    href: 'applets/code-pipeline-builder.applet.html',
                    prerequisites: ['code-cicd']
                },
                {
                    id: 'code-docker',
                    title: 'Docker Fundamentals',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '35 min',
                    href: 'presentations/code-docker-fundamentals.presentation.html',
                    prerequisites: ['code-pipeline']
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
                    id: 'code-terraform',
                    title: 'Terraform Fundamentals',
                    type: 'presentation',
                    difficulty: 'advanced',
                    duration: '40 min',
                    href: 'presentations/code-terraform-fundamentals.presentation.html',
                    prerequisites: ['code-kubernetes']
                },
                {
                    id: 'code-terraform-visualizer',
                    title: 'Terraform Visualizer',
                    type: 'applet',
                    difficulty: 'advanced',
                    duration: '45 min',
                    href: 'houses/code/tools/code-terraform.tool.html',
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
                    href: 'presentations/key-encryption-basics.presentation.html',
                    prerequisites: []
                },
                {
                    id: 'key-symmetric',
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
                    prerequisites: ['key-symmetric']
                },
                {
                    id: 'key-ecc',
                    title: 'Elliptic Curve Cryptography',
                    type: 'presentation',
                    difficulty: 'advanced',
                    duration: '35 min',
                    href: 'presentations/key-elliptic-curve.presentation.html',
                    prerequisites: ['key-aes-explorer']
                },
                {
                    id: 'key-kdf',
                    title: 'Key Derivation Functions',
                    type: 'presentation',
                    difficulty: 'advanced',
                    duration: '30 min',
                    href: 'presentations/key-derivation.presentation.html',
                    prerequisites: ['key-ecc']
                },
                {
                    id: 'key-hmac',
                    title: 'Message Authentication',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'presentations/key-message-authentication.presentation.html',
                    prerequisites: ['key-kdf']
                },
                {
                    id: 'key-certificates',
                    title: 'Digital Certificates',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'presentations/key-certificates.presentation.html',
                    prerequisites: ['key-hmac']
                },
                {
                    id: 'key-pqc',
                    title: 'Post-Quantum Cryptography',
                    type: 'presentation',
                    difficulty: 'advanced',
                    duration: '35 min',
                    href: 'presentations/key-post-quantum.presentation.html',
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
                    prerequisites: ['eye-log-basics']
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
                    id: 'eye-siem',
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
                    prerequisites: ['eye-siem']
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
                    id: 'eye-traffic-analysis',
                    title: 'Network Traffic Analysis',
                    type: 'presentation',
                    difficulty: 'advanced',
                    duration: '40 min',
                    href: 'presentations/eye-network-traffic-analysis.presentation.html',
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
                    href: 'houses/code/presentations/code-git-basics.presentation.html',
                    prerequisites: []
                },
                {
                    id: 'devops-agile',
                    title: 'Agile & SDLC',
                    type: 'presentation',
                    difficulty: 'beginner',
                    duration: '30 min',
                    href: 'houses/code/presentations/code-agile-sdlc.presentation.html',
                    prerequisites: ['devops-git-basics']
                },
                {
                    id: 'devops-cicd',
                    title: 'CI/CD Fundamentals',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '35 min',
                    href: 'houses/code/presentations/code-cicd-fundamentals.presentation.html',
                    prerequisites: ['devops-agile']
                },
                {
                    id: 'devops-pipeline',
                    title: 'Pipeline Builder',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '40 min',
                    href: 'houses/code/applets/code-pipeline-builder.applet.html',
                    prerequisites: ['devops-cicd']
                },
                {
                    id: 'devops-docker',
                    title: 'Docker Fundamentals',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '35 min',
                    href: 'houses/code/presentations/code-docker-fundamentals.presentation.html',
                    prerequisites: ['devops-pipeline']
                },
                {
                    id: 'devops-docker-playground',
                    title: 'Docker Playground',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '45 min',
                    href: 'houses/code/applets/code-docker-playground.applet.html',
                    prerequisites: ['devops-docker']
                },
                {
                    id: 'devops-kubernetes',
                    title: 'Kubernetes Fundamentals',
                    type: 'presentation',
                    difficulty: 'advanced',
                    duration: '40 min',
                    href: 'houses/code/presentations/code-kubernetes-fundamentals.presentation.html',
                    prerequisites: ['devops-docker-playground']
                },
                {
                    id: 'devops-terraform',
                    title: 'Terraform Fundamentals',
                    type: 'presentation',
                    difficulty: 'advanced',
                    duration: '40 min',
                    href: 'houses/code/presentations/code-terraform-fundamentals.presentation.html',
                    prerequisites: ['devops-kubernetes']
                },
                {
                    id: 'devops-terraform-visualizer',
                    title: 'Terraform Visualizer',
                    type: 'applet',
                    difficulty: 'advanced',
                    duration: '45 min',
                    href: 'houses/code/tools/code-terraform.tool.html',
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
                    href: 'houses/script/modules/linux-mastery/script-lm-01-welcome.module.html',
                    prerequisites: []
                },
                {
                    id: 'lm-02-first-commands',
                    title: 'Your First Commands',
                    type: 'lab',
                    difficulty: 'beginner',
                    duration: '20 min',
                    href: 'houses/script/modules/linux-mastery/script-lm-02-first-commands.module.html',
                    prerequisites: ['lm-01-welcome']
                },
                {
                    id: 'lm-03-getting-help',
                    title: 'Getting Help',
                    type: 'lab',
                    difficulty: 'beginner',
                    duration: '15 min',
                    href: 'houses/script/modules/linux-mastery/script-lm-03-getting-help.module.html',
                    prerequisites: ['lm-02-first-commands']
                },
                {
                    id: 'lm-04-terminal-environment',
                    title: 'The Terminal Environment',
                    type: 'presentation',
                    difficulty: 'beginner',
                    duration: '15 min',
                    href: 'houses/script/modules/linux-mastery/script-lm-04-terminal-environment.module.html',
                    prerequisites: ['lm-03-getting-help']
                },
                {
                    id: 'lm-05-section1-practice',
                    title: 'Section 1 Practice',
                    type: 'lab',
                    difficulty: 'beginner',
                    duration: '25 min',
                    href: 'houses/script/modules/linux-mastery/script-lm-05-section1-practice.module.html',
                    prerequisites: ['lm-04-terminal-environment']
                },
                // Section 2: Navigation & Files
                {
                    id: 'lm-06-navigation',
                    title: 'Directory Navigation',
                    type: 'lab',
                    difficulty: 'beginner',
                    duration: '20 min',
                    href: 'houses/script/modules/linux-mastery/script-lm-06-navigation.module.html',
                    prerequisites: ['lm-05-section1-practice']
                },
                {
                    id: 'lm-07-listing-files',
                    title: 'Listing Files',
                    type: 'lab',
                    difficulty: 'beginner',
                    duration: '20 min',
                    href: 'houses/script/modules/linux-mastery/script-lm-07-listing-files.module.html',
                    prerequisites: ['lm-06-navigation']
                },
                {
                    id: 'lm-08-file-operations',
                    title: 'File Operations',
                    type: 'lab',
                    difficulty: 'beginner',
                    duration: '25 min',
                    href: 'houses/script/modules/linux-mastery/script-lm-08-file-operations.module.html',
                    prerequisites: ['lm-07-listing-files']
                },
                {
                    id: 'lm-09-copy-move',
                    title: 'Copy and Move',
                    type: 'lab',
                    difficulty: 'beginner',
                    duration: '20 min',
                    href: 'houses/script/modules/linux-mastery/script-lm-09-copy-move.module.html',
                    prerequisites: ['lm-08-file-operations']
                },
                {
                    id: 'lm-10-viewing-files',
                    title: 'Viewing Files',
                    type: 'lab',
                    difficulty: 'beginner',
                    duration: '20 min',
                    href: 'houses/script/modules/linux-mastery/script-lm-10-viewing-files.module.html',
                    prerequisites: ['lm-09-copy-move']
                },
                {
                    id: 'lm-11-finding-files',
                    title: 'Finding Files',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'houses/script/modules/linux-mastery/script-lm-11-finding-files.module.html',
                    prerequisites: ['lm-10-viewing-files']
                },
                {
                    id: 'lm-12-section2-practice',
                    title: 'Section 2 Practice',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'houses/script/modules/linux-mastery/script-lm-12-section2-practice.module.html',
                    prerequisites: ['lm-11-finding-files']
                },
                // Section 3: Text Processing
                {
                    id: 'lm-13-grep-basics',
                    title: 'grep Basics',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'houses/script/modules/linux-mastery/script-lm-13-grep-basics.module.html',
                    prerequisites: ['lm-12-section2-practice']
                },
                {
                    id: 'lm-14-regular-expressions',
                    title: 'Regular Expressions',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'houses/script/modules/linux-mastery/script-lm-14-regular-expressions.module.html',
                    prerequisites: ['lm-13-grep-basics']
                },
                {
                    id: 'lm-15-sed-editor',
                    title: 'sed Stream Editor',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'houses/script/modules/linux-mastery/script-lm-15-sed-editor.module.html',
                    prerequisites: ['lm-14-regular-expressions']
                },
                {
                    id: 'lm-16-awk-processing',
                    title: 'awk Processing',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'houses/script/modules/linux-mastery/script-lm-16-awk-processing.module.html',
                    prerequisites: ['lm-15-sed-editor']
                },
                {
                    id: 'lm-17-sort-uniq',
                    title: 'sort and uniq',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '20 min',
                    href: 'houses/script/modules/linux-mastery/script-lm-17-sort-uniq.module.html',
                    prerequisites: ['lm-16-awk-processing']
                },
                {
                    id: 'lm-18-cut-paste',
                    title: 'cut and paste',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '20 min',
                    href: 'houses/script/modules/linux-mastery/script-lm-18-cut-paste.module.html',
                    prerequisites: ['lm-17-sort-uniq']
                },
                {
                    id: 'lm-19-text-pipelines',
                    title: 'Text Pipelines',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'houses/script/modules/linux-mastery/script-lm-19-text-pipelines.module.html',
                    prerequisites: ['lm-18-cut-paste']
                },
                {
                    id: 'lm-20-section3-practice',
                    title: 'Section 3 Practice',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '35 min',
                    href: 'houses/script/modules/linux-mastery/script-lm-20-section3-practice.module.html',
                    prerequisites: ['lm-19-text-pipelines']
                },
                // Section 4: Permissions & Users
                {
                    id: 'lm-21-users-groups',
                    title: 'Users and Groups',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '20 min',
                    href: 'houses/script/modules/linux-mastery/script-lm-21-users-groups.module.html',
                    prerequisites: ['lm-20-section3-practice']
                },
                {
                    id: 'lm-22-file-permissions',
                    title: 'File Permissions',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'houses/script/modules/linux-mastery/script-lm-22-file-permissions.module.html',
                    prerequisites: ['lm-21-users-groups']
                },
                {
                    id: 'lm-23-chmod',
                    title: 'chmod',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'houses/script/modules/linux-mastery/script-lm-23-chmod.module.html',
                    prerequisites: ['lm-22-file-permissions']
                },
                {
                    id: 'lm-24-chown',
                    title: 'chown',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '20 min',
                    href: 'houses/script/modules/linux-mastery/script-lm-24-chown.module.html',
                    prerequisites: ['lm-23-chmod']
                },
                {
                    id: 'lm-25-sudo',
                    title: 'sudo',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '20 min',
                    href: 'houses/script/modules/linux-mastery/script-lm-25-sudo.module.html',
                    prerequisites: ['lm-24-chown']
                },
                {
                    id: 'lm-26-special-permissions',
                    title: 'Special Permissions',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'houses/script/modules/linux-mastery/script-lm-26-special-permissions.module.html',
                    prerequisites: ['lm-25-sudo']
                },
                {
                    id: 'lm-27-section4-practice',
                    title: 'Section 4 Practice',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '35 min',
                    href: 'houses/script/modules/linux-mastery/script-lm-27-section4-practice.module.html',
                    prerequisites: ['lm-26-special-permissions']
                },
                // Section 5: Processes
                {
                    id: 'lm-28-process-basics',
                    title: 'Process Basics',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'houses/script/modules/linux-mastery/script-lm-28-process-basics.module.html',
                    prerequisites: ['lm-27-section4-practice']
                },
                {
                    id: 'lm-29-ps-top',
                    title: 'ps and top',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'houses/script/modules/linux-mastery/script-lm-29-ps-top.module.html',
                    prerequisites: ['lm-28-process-basics']
                },
                {
                    id: 'lm-30-background-jobs',
                    title: 'Background Jobs',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'houses/script/modules/linux-mastery/script-lm-30-background-jobs.module.html',
                    prerequisites: ['lm-29-ps-top']
                },
                {
                    id: 'lm-31-signals-kill',
                    title: 'Signals and kill',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '20 min',
                    href: 'houses/script/modules/linux-mastery/script-lm-31-signals-kill.module.html',
                    prerequisites: ['lm-30-background-jobs']
                },
                {
                    id: 'lm-32-cron',
                    title: 'cron',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'houses/script/modules/linux-mastery/script-lm-32-cron.module.html',
                    prerequisites: ['lm-31-signals-kill']
                },
                {
                    id: 'lm-33-systemd',
                    title: 'systemd',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'houses/script/modules/linux-mastery/script-lm-33-systemd.module.html',
                    prerequisites: ['lm-32-cron']
                },
                {
                    id: 'lm-34-section5-practice',
                    title: 'Section 5 Practice',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '35 min',
                    href: 'houses/script/modules/linux-mastery/script-lm-34-section5-practice.module.html',
                    prerequisites: ['lm-33-systemd']
                },
                // Section 6: Networking Basics
                {
                    id: 'lm-35-network-info',
                    title: 'Network Info',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '20 min',
                    href: 'houses/script/modules/linux-mastery/script-lm-35-network-info.module.html',
                    prerequisites: ['lm-34-section5-practice']
                },
                {
                    id: 'lm-36-connectivity',
                    title: 'Connectivity',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '20 min',
                    href: 'houses/script/modules/linux-mastery/script-lm-36-connectivity.module.html',
                    prerequisites: ['lm-35-network-info']
                },
                {
                    id: 'lm-37-dns-tools',
                    title: 'DNS Tools',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '20 min',
                    href: 'houses/script/modules/linux-mastery/script-lm-37-dns-tools.module.html',
                    prerequisites: ['lm-36-connectivity']
                },
                {
                    id: 'lm-38-downloading',
                    title: 'Downloading',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '20 min',
                    href: 'houses/script/modules/linux-mastery/script-lm-38-downloading.module.html',
                    prerequisites: ['lm-37-dns-tools']
                },
                {
                    id: 'lm-39-ssh-basics',
                    title: 'SSH Basics',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'houses/script/modules/linux-mastery/script-lm-39-ssh-basics.module.html',
                    prerequisites: ['lm-38-downloading']
                },
                {
                    id: 'lm-40-section6-practice',
                    title: 'Section 6 Practice',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'houses/script/modules/linux-mastery/script-lm-40-section6-practice.module.html',
                    prerequisites: ['lm-39-ssh-basics']
                },
                // Section 7: Shell Scripting
                {
                    id: 'lm-41-first-script',
                    title: 'First Script',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '20 min',
                    href: 'houses/script/modules/linux-mastery/script-lm-41-first-script.module.html',
                    prerequisites: ['lm-40-section6-practice']
                },
                {
                    id: 'lm-42-variables',
                    title: 'Variables',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'houses/script/modules/linux-mastery/script-lm-42-variables.module.html',
                    prerequisites: ['lm-41-first-script']
                },
                {
                    id: 'lm-43-user-input',
                    title: 'User Input',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '20 min',
                    href: 'houses/script/modules/linux-mastery/script-lm-43-user-input.module.html',
                    prerequisites: ['lm-42-variables']
                },
                {
                    id: 'lm-44-conditionals',
                    title: 'Conditionals',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'houses/script/modules/linux-mastery/script-lm-44-conditionals.module.html',
                    prerequisites: ['lm-43-user-input']
                },
                {
                    id: 'lm-45-loops',
                    title: 'Loops',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'houses/script/modules/linux-mastery/script-lm-45-loops.module.html',
                    prerequisites: ['lm-44-conditionals']
                },
                {
                    id: 'lm-46-functions',
                    title: 'Functions',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'houses/script/modules/linux-mastery/script-lm-46-functions.module.html',
                    prerequisites: ['lm-45-loops']
                },
                {
                    id: 'lm-47-practical-scripts',
                    title: 'Practical Scripts',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'houses/script/modules/linux-mastery/script-lm-47-practical-scripts.module.html',
                    prerequisites: ['lm-46-functions']
                },
                {
                    id: 'lm-48-section7-practice',
                    title: 'Section 7 Practice',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '35 min',
                    href: 'houses/script/modules/linux-mastery/script-lm-48-section7-practice.module.html',
                    prerequisites: ['lm-47-practical-scripts']
                },
                // Section 8: Beyond Basics
                {
                    id: 'lm-49-links',
                    title: 'Links',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '20 min',
                    href: 'houses/script/modules/linux-mastery/script-lm-49-links.module.html',
                    prerequisites: ['lm-48-section7-practice']
                },
                {
                    id: 'lm-50-text-editors',
                    title: 'Text Editors',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'houses/script/modules/linux-mastery/script-lm-50-text-editors.module.html',
                    prerequisites: ['lm-49-links']
                },
                {
                    id: 'lm-51-package-management',
                    title: 'Package Management',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'houses/script/modules/linux-mastery/script-lm-51-package-management.module.html',
                    prerequisites: ['lm-50-text-editors']
                },
                {
                    id: 'lm-52-environment-path',
                    title: 'Environment & PATH',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '20 min',
                    href: 'houses/script/modules/linux-mastery/script-lm-52-environment-path.module.html',
                    prerequisites: ['lm-51-package-management']
                },
                {
                    id: 'lm-53-next-steps',
                    title: 'Next Steps',
                    type: 'presentation',
                    difficulty: 'beginner',
                    duration: '15 min',
                    href: 'houses/script/modules/linux-mastery/script-lm-53-next-steps.module.html',
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
                    href: 'houses/script/applets/linux/script-ubuntu-components.applet.html',
                    prerequisites: []
                },
                {
                    id: 'linux-section1-quiz',
                    title: 'Section 1 Quiz: Linux Fundamentals',
                    type: 'quiz',
                    difficulty: 'beginner',
                    duration: '15 min',
                    href: 'houses/script/quizzes/script-linux-basics.quiz.html',
                    prerequisites: ['linux-section1-intro']
                },
                // Section 2: Command Line Essentials
                {
                    id: 'linux-section2-cli',
                    title: 'Section 2: Command Line Essentials',
                    type: 'applet',
                    difficulty: 'beginner',
                    duration: '30 min',
                    href: 'houses/script/tools/script-linux-command.tool.html',
                    prerequisites: ['linux-section1-quiz']
                },
                {
                    id: 'linux-section2-quiz',
                    title: 'Section 2 Quiz: CLI Commands',
                    type: 'quiz',
                    difficulty: 'beginner',
                    duration: '15 min',
                    href: 'houses/script/quizzes/script-linux-basics.quiz.html',
                    prerequisites: ['linux-section2-cli']
                },
                // Section 3: File System Navigation
                {
                    id: 'linux-section3-filesystem',
                    title: 'Section 3: File System Navigation',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'houses/script/applets/linux/script-linux-filesystem-navigator.applet.html',
                    prerequisites: ['linux-section2-quiz']
                },
                {
                    id: 'linux-section3-lab',
                    title: 'Section 3 Lab: File Navigation',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '20 min',
                    href: 'houses/script/applets/linux/script-linux-lab-002-file-navigation.applet.html',
                    prerequisites: ['linux-section3-filesystem']
                },
                // Section 4: Permissions & Security
                {
                    id: 'linux-section4-permissions',
                    title: 'Section 4: Linux Permissions',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'houses/script/tools/script-linux-permissions.tool.html',
                    prerequisites: ['linux-section3-lab']
                },
                {
                    id: 'linux-section4-lab',
                    title: 'Section 4 Lab: User Identity',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'houses/script/applets/linux/script-linux-lab-001-user-identity.applet.html',
                    prerequisites: ['linux-section4-permissions']
                },
                // Section 5: Scripting & Automation
                {
                    id: 'linux-section5-bash',
                    title: 'Section 5: Bash Scripting',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '45 min',
                    href: 'houses/script/applets/linux/script-bash-scripting-playground.applet.html',
                    prerequisites: ['linux-section4-lab']
                },
                {
                    id: 'linux-section5-quiz',
                    title: 'Section 5 Quiz: Bash Scripting',
                    type: 'quiz',
                    difficulty: 'intermediate',
                    duration: '20 min',
                    href: 'houses/script/quizzes/script-linux-bash.quiz.html',
                    prerequisites: ['linux-section5-bash']
                },
                // Section 6: Cross-Platform
                {
                    id: 'linux-section6-macos',
                    title: 'Section 6: macOS & Linux',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'houses/script/applets/linux/script-lab-macos-linux.applet.html',
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
            courseHref: 'houses/forge/applets/comptia-aplus/core-1/index.html',
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
            courseHref: 'houses/forge/applets/comptia-aplus/core-2/index.html',
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
                    href: 'houses/cloud/modules/wsa/m01-fundamentals/cloud-presentation.module.html',
                    prerequisites: []
                },
                {
                    id: 'wsa-m02-active-directory',
                    title: 'Active Directory Domain Services',
                    type: 'presentation',
                    difficulty: 'beginner',
                    duration: '50 min',
                    href: 'houses/cloud/modules/wsa/m02-active-directory/cloud-presentation.module.html',
                    prerequisites: ['wsa-m01-fundamentals']
                },
                {
                    id: 'wsa-m03-storage',
                    title: 'Storage & File Systems',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '45 min',
                    href: 'houses/cloud/modules/wsa/m03-storage/cloud-presentation.module.html',
                    prerequisites: ['wsa-m02-active-directory']
                },
                {
                    id: 'wsa-m04-hyperv',
                    title: 'Hyper-V Virtualization',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '50 min',
                    href: 'houses/cloud/modules/wsa/m04-hyperv/cloud-presentation.module.html',
                    prerequisites: ['wsa-m03-storage']
                },
                {
                    id: 'wsa-m05-containers',
                    title: 'Docker Containers',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '45 min',
                    href: 'houses/cloud/modules/wsa/m05-containers/cloud-presentation.module.html',
                    prerequisites: ['wsa-m04-hyperv']
                },
                {
                    id: 'wsa-m06-clustering',
                    title: 'Failover Clustering',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '45 min',
                    href: 'houses/cloud/modules/wsa/m06-clustering/cloud-presentation.module.html',
                    prerequisites: ['wsa-m05-containers']
                },
                {
                    id: 'wsa-m07-monitoring',
                    title: 'Monitoring & Performance',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '40 min',
                    href: 'houses/cloud/modules/wsa/m07-monitoring/cloud-presentation.module.html',
                    prerequisites: ['wsa-m06-clustering']
                },
                {
                    id: 'wsa-m08-dns',
                    title: 'DNS & Name Resolution',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '45 min',
                    href: 'houses/cloud/modules/wsa/m08-dns/cloud-presentation.module.html',
                    prerequisites: ['wsa-m07-monitoring']
                },
                {
                    id: 'wsa-m09-dhcp',
                    title: 'DHCP Services',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '40 min',
                    href: 'houses/cloud/modules/wsa/m09-dhcp/cloud-presentation.module.html',
                    prerequisites: ['wsa-m08-dns']
                },
                {
                    id: 'wsa-m10-group-policy',
                    title: 'Group Policy',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '50 min',
                    href: 'houses/cloud/modules/wsa/m10-group-policy/cloud-presentation.module.html',
                    prerequisites: ['wsa-m09-dhcp']
                },
                // Phase 2: Advanced Services & Operations
                {
                    id: 'wsa-m11-iis',
                    title: 'IIS & Web Services',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '45 min',
                    href: 'houses/cloud/modules/wsa/m11-iis/cloud-presentation.module.html',
                    prerequisites: ['wsa-m10-group-policy']
                },
                {
                    id: 'wsa-m12-remote-desktop',
                    title: 'Remote Desktop Services',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '40 min',
                    href: 'houses/cloud/modules/wsa/m12-remote-desktop/cloud-presentation.module.html',
                    prerequisites: ['wsa-m11-iis']
                },
                {
                    id: 'wsa-m13-certificate-services',
                    title: 'Certificate Services (PKI)',
                    type: 'presentation',
                    difficulty: 'advanced',
                    duration: '45 min',
                    href: 'houses/cloud/modules/wsa/m13-certificate-services/cloud-presentation.module.html',
                    prerequisites: ['wsa-m12-remote-desktop']
                },
                {
                    id: 'wsa-m14-advanced-networking',
                    title: 'Advanced Networking',
                    type: 'presentation',
                    difficulty: 'advanced',
                    duration: '45 min',
                    href: 'houses/cloud/modules/wsa/m14-advanced-networking/cloud-presentation.module.html',
                    prerequisites: ['wsa-m13-certificate-services']
                },
                {
                    id: 'wsa-m15-ad-sites',
                    title: 'AD Sites & Replication',
                    type: 'presentation',
                    difficulty: 'advanced',
                    duration: '40 min',
                    href: 'houses/cloud/modules/wsa/m15-ad-sites/cloud-presentation.module.html',
                    prerequisites: ['wsa-m14-advanced-networking']
                },
                {
                    id: 'wsa-m16-backup-recovery',
                    title: 'Backup & Disaster Recovery',
                    type: 'presentation',
                    difficulty: 'advanced',
                    duration: '45 min',
                    href: 'houses/cloud/modules/wsa/m16-backup-recovery/cloud-presentation.module.html',
                    prerequisites: ['wsa-m15-ad-sites']
                },
                {
                    id: 'wsa-m17-firewall-security',
                    title: 'Windows Firewall & Security',
                    type: 'presentation',
                    difficulty: 'advanced',
                    duration: '45 min',
                    href: 'houses/cloud/modules/wsa/m17-firewall-security/cloud-presentation.module.html',
                    prerequisites: ['wsa-m16-backup-recovery']
                },
                {
                    id: 'wsa-m18-powershell-automation',
                    title: 'PowerShell Automation',
                    type: 'presentation',
                    difficulty: 'advanced',
                    duration: '50 min',
                    href: 'houses/cloud/modules/wsa/m18-powershell-automation/cloud-presentation.module.html',
                    prerequisites: ['wsa-m17-firewall-security']
                },
                {
                    id: 'wsa-m19-troubleshooting',
                    title: 'Troubleshooting & Migration',
                    type: 'presentation',
                    difficulty: 'advanced',
                    duration: '45 min',
                    href: 'houses/cloud/modules/wsa/m19-troubleshooting-migration/cloud-presentation.module.html',
                    prerequisites: ['wsa-m18-powershell-automation']
                },
                // Capstone
                {
                    id: 'wsa-m20-capstone',
                    title: 'Failsafe Protocol (Capstone)',
                    type: 'lab',
                    difficulty: 'advanced',
                    duration: '90 min',
                    href: 'houses/cloud/modules/wsa/m20-failsafe-capstone/index.html',
                    prerequisites: ['wsa-m19-troubleshooting']
                }
            ]
        },

        // CompTIA Security+ SY0-701 — Shield House
        'security-plus': {
            name: 'CompTIA Security+ (SY0-701)',
            description: 'Complete Security+ certification prep covering general security concepts, threats, architecture, operations, and program management',
            icon: '🔐',
            color: '#a855f7',
            modules: [
                // Domain 1: General Security Concepts
                {
                    id: 'secplus-cia-triad',
                    title: 'CIA Triad Fundamentals',
                    type: 'presentation',
                    difficulty: 'beginner',
                    duration: '20 min',
                    href: 'houses/shield/presentations/shield-cia-triad.presentation.html',
                    prerequisites: []
                },
                {
                    id: 'secplus-cia-quiz',
                    title: 'CIA Triad Challenge',
                    type: 'quiz',
                    difficulty: 'beginner',
                    duration: '15 min',
                    href: 'houses/shield/quizzes/shield-cia-triad.quiz.html',
                    prerequisites: ['secplus-cia-triad']
                },
                {
                    id: 'secplus-security-fundamentals',
                    title: 'Security Fundamentals',
                    type: 'presentation',
                    difficulty: 'beginner',
                    duration: '30 min',
                    href: 'houses/shield/presentations/shield-security.presentation.html',
                    prerequisites: ['secplus-cia-quiz']
                },
                {
                    id: 'secplus-security-controls',
                    title: 'Cybersecurity Controls',
                    type: 'applet',
                    difficulty: 'beginner',
                    duration: '25 min',
                    href: 'houses/shield/applets/fundamentals/cybersecurity_controls/shield-cybersecurity-controls.applet.html',
                    prerequisites: ['secplus-security-fundamentals']
                },
                {
                    id: 'secplus-design-principles',
                    title: 'Security Design Principles',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'houses/shield/applets/fundamentals/design_principles/shield-cybersecuritydesignprinciples.applet.html',
                    prerequisites: ['secplus-security-controls']
                },
                {
                    id: 'secplus-security-fundamentals-lab',
                    title: 'Security Fundamentals Lab',
                    type: 'lab',
                    difficulty: 'beginner',
                    duration: '30 min',
                    href: 'houses/shield/labs/shield-security-fundamentals.lab.html',
                    prerequisites: ['secplus-design-principles']
                },
                // Domain 2: Threats, Vulnerabilities, and Mitigations
                {
                    id: 'secplus-threat-types',
                    title: 'Threats & Attacks',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'houses/shield/applets/threats/attacks_malware/shield-attacks.applet.html',
                    prerequisites: ['secplus-security-fundamentals-lab']
                },
                {
                    id: 'secplus-social-engineering',
                    title: 'Social Engineering',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'houses/shield/applets/threats/phishing_mystery/shield-phishing.applet.html',
                    prerequisites: ['secplus-threat-types']
                },
                {
                    id: 'secplus-web-attacks',
                    title: 'Web Application Attacks',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'houses/shield/applets/threats/cross_site_scripting/shield-crosssitescripting.applet.html',
                    prerequisites: ['secplus-social-engineering']
                },
                {
                    id: 'secplus-threats-quiz',
                    title: 'Threats & Vulnerabilities Challenge',
                    type: 'quiz',
                    difficulty: 'intermediate',
                    duration: '20 min',
                    href: 'houses/shield/quizzes/shield-threats.quiz.html',
                    prerequisites: ['secplus-web-attacks']
                },
                {
                    id: 'secplus-threats-lab',
                    title: 'Threats Lab',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '35 min',
                    href: 'houses/shield/labs/shield-threats.lab.html',
                    prerequisites: ['secplus-threats-quiz']
                },
                // Domain 3: Security Architecture
                {
                    id: 'secplus-network-security',
                    title: 'Network Security',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'houses/shield/applets/network/firewalls/shield-firewalls.applet.html',
                    prerequisites: ['secplus-threats-lab']
                },
                {
                    id: 'secplus-ids-ips',
                    title: 'IDS/IPS',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'houses/shield/applets/network/ids_ips/shield-ids-ips.applet.html',
                    prerequisites: ['secplus-network-security']
                },
                {
                    id: 'secplus-vpn',
                    title: 'VPN Technologies',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'houses/shield/applets/network/vpn/shield-vpn.applet.html',
                    prerequisites: ['secplus-ids-ips']
                },
                {
                    id: 'secplus-cryptography',
                    title: 'Cryptography Essentials',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '35 min',
                    href: 'houses/shield/applets/crypto/cryptography/shield-cryptography.applet.html',
                    prerequisites: ['secplus-vpn']
                },
                {
                    id: 'secplus-network-security-quiz',
                    title: 'Network Security Challenge',
                    type: 'quiz',
                    difficulty: 'intermediate',
                    duration: '20 min',
                    href: 'houses/shield/quizzes/shield-network-security.quiz.html',
                    prerequisites: ['secplus-cryptography']
                },
                {
                    id: 'secplus-network-security-lab',
                    title: 'Network Security Lab',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '35 min',
                    href: 'houses/shield/labs/shield-network-security.lab.html',
                    prerequisites: ['secplus-network-security-quiz']
                },
                // Domain 4: Security Operations
                {
                    id: 'secplus-access-control',
                    title: 'Access Control',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'houses/shield/applets/access/access_control/shield-access-control.applet.html',
                    prerequisites: ['secplus-network-security-lab']
                },
                {
                    id: 'secplus-biometrics',
                    title: 'Biometrics',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '20 min',
                    href: 'houses/shield/applets/access/biometrics/shield-biometrics.applet.html',
                    prerequisites: ['secplus-access-control']
                },
                {
                    id: 'secplus-kerberos',
                    title: 'Kerberos Authentication',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '20 min',
                    href: 'houses/shield/applets/access/kerberos/shield-kerberos.applet.html',
                    prerequisites: ['secplus-biometrics']
                },
                {
                    id: 'secplus-incident-response',
                    title: 'Incident Response',
                    type: 'tool',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'houses/shield/tools/shield-incident-response.tool.html',
                    prerequisites: ['secplus-kerberos']
                },
                {
                    id: 'secplus-monitoring',
                    title: 'Security Monitoring & Incident Response',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'houses/shield/presentations/shield-cse-06-security-monitoring-incident-response.presentation.html',
                    prerequisites: ['secplus-incident-response']
                },
                {
                    id: 'secplus-access-control-quiz',
                    title: 'Access Control Challenge',
                    type: 'quiz',
                    difficulty: 'intermediate',
                    duration: '15 min',
                    href: 'houses/shield/quizzes/shield-access-control.quiz.html',
                    prerequisites: ['secplus-monitoring']
                },
                {
                    id: 'secplus-access-control-lab',
                    title: 'Access Control Lab',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'houses/shield/labs/shield-access-control.lab.html',
                    prerequisites: ['secplus-access-control-quiz']
                },
                // Domain 5: Security Program Management
                {
                    id: 'secplus-risk-management',
                    title: 'Risk Management',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'houses/shield/applets/risk/risk_management/shield-risk-management.applet.html',
                    prerequisites: ['secplus-access-control-lab']
                },
                {
                    id: 'secplus-risk-analysis',
                    title: 'Risk Analysis',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'houses/shield/applets/risk/risk_analysis/shield-risk-analysis.applet.html',
                    prerequisites: ['secplus-risk-management']
                },
                {
                    id: 'secplus-risk-assessment',
                    title: 'Risk Assessment & Management',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'houses/shield/presentations/shield-cse-07-risk-assessment-management.presentation.html',
                    prerequisites: ['secplus-risk-analysis']
                },
                {
                    id: 'secplus-compliance',
                    title: 'Compliance & Governance',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'houses/shield/presentations/shield-cse-08-compliance-governance.presentation.html',
                    prerequisites: ['secplus-risk-assessment']
                },
                {
                    id: 'secplus-frameworks',
                    title: 'Security Frameworks',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'houses/shield/applets/compliance/shield-framework-selector.applet.html',
                    prerequisites: ['secplus-compliance']
                },
                {
                    id: 'secplus-compliance-lab',
                    title: 'Compliance Lab',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'houses/shield/labs/shield-compliance.lab.html',
                    prerequisites: ['secplus-frameworks']
                },
                // Final Assessment
                {
                    id: 'secplus-final-quiz',
                    title: 'Security+ Comprehensive Challenge',
                    type: 'quiz',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'houses/shield/quizzes/shield-security-fundamentals.quiz.html',
                    prerequisites: ['secplus-compliance-lab']
                }
            ]
        },

        // CompTIA Network+ N10-009 — Web House
        'comptia-network': {
            name: 'CompTIA Network+ (N10-009)',
            description: 'Complete Network+ certification prep covering networking concepts, implementation, operations, security, and troubleshooting',
            icon: '🌐',
            color: '#3b82f6',
            modules: [
                // Domain 1: Networking Concepts
                {
                    id: 'netplus-osi-model',
                    title: 'OSI Model Fundamentals',
                    type: 'presentation',
                    difficulty: 'beginner',
                    duration: '25 min',
                    href: 'houses/web/presentations/web-osi-model.presentation.html',
                    prerequisites: []
                },
                {
                    id: 'netplus-osi-quiz',
                    title: 'OSI Model Challenge',
                    type: 'quiz',
                    difficulty: 'beginner',
                    duration: '15 min',
                    href: 'houses/web/quizzes/web-osi.quiz.html',
                    prerequisites: ['netplus-osi-model']
                },
                {
                    id: 'netplus-tcp',
                    title: 'TCP/IP Fundamentals',
                    type: 'presentation',
                    difficulty: 'beginner',
                    duration: '30 min',
                    href: 'houses/web/presentations/web-tcp.presentation.html',
                    prerequisites: ['netplus-osi-quiz']
                },
                {
                    id: 'netplus-ip-addressing',
                    title: 'IP Addressing',
                    type: 'applet',
                    difficulty: 'beginner',
                    duration: '30 min',
                    href: 'houses/web/applets/ip-addressing/binaryIP/web-binary-ip.applet.html',
                    prerequisites: ['netplus-tcp']
                },
                {
                    id: 'netplus-subnetting',
                    title: 'Subnetting Fundamentals',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '40 min',
                    href: 'houses/web/presentations/web-subnetting.presentation.html',
                    prerequisites: ['netplus-ip-addressing']
                },
                {
                    id: 'netplus-subnetting-quiz',
                    title: 'Subnetting Challenge',
                    type: 'quiz',
                    difficulty: 'intermediate',
                    duration: '20 min',
                    href: 'houses/web/quizzes/web-subnetting.quiz.html',
                    prerequisites: ['netplus-subnetting']
                },
                {
                    id: 'netplus-ipv6',
                    title: 'IPv6 Addressing',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'houses/web/presentations/web-ipv6.presentation.html',
                    prerequisites: ['netplus-subnetting-quiz']
                },
                {
                    id: 'netplus-ports',
                    title: 'Ports & Protocols',
                    type: 'presentation',
                    difficulty: 'beginner',
                    duration: '25 min',
                    href: 'houses/web/presentations/web-ports.presentation.html',
                    prerequisites: ['netplus-ipv6']
                },
                {
                    id: 'netplus-ports-quiz',
                    title: 'Ports & Protocols Challenge',
                    type: 'quiz',
                    difficulty: 'beginner',
                    duration: '15 min',
                    href: 'houses/web/quizzes/web-networking-fundamentals-ports.quiz.html',
                    prerequisites: ['netplus-ports']
                },
                // Domain 2: Network Implementation
                {
                    id: 'netplus-cables',
                    title: 'Network Cabling',
                    type: 'presentation',
                    difficulty: 'beginner',
                    duration: '20 min',
                    href: 'houses/web/presentations/web-cables.presentation.html',
                    prerequisites: ['netplus-ports-quiz']
                },
                {
                    id: 'netplus-devices',
                    title: 'Network Devices',
                    type: 'presentation',
                    difficulty: 'beginner',
                    duration: '25 min',
                    href: 'houses/web/presentations/web-devices.presentation.html',
                    prerequisites: ['netplus-cables']
                },
                {
                    id: 'netplus-switching',
                    title: 'Network Switching',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'houses/web/presentations/web-switch-operations.presentation.html',
                    prerequisites: ['netplus-devices']
                },
                {
                    id: 'netplus-vlan',
                    title: 'VLAN Configuration',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '35 min',
                    href: 'houses/web/presentations/web-vlan.presentation.html',
                    prerequisites: ['netplus-switching']
                },
                {
                    id: 'netplus-stp',
                    title: 'Spanning Tree Protocol',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'houses/web/presentations/web-stp.presentation.html',
                    prerequisites: ['netplus-vlan']
                },
                {
                    id: 'netplus-routing',
                    title: 'Routing Fundamentals',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '35 min',
                    href: 'houses/web/presentations/web-topologies.presentation.html',
                    prerequisites: ['netplus-stp']
                },
                {
                    id: 'netplus-ospf',
                    title: 'OSPF Protocol',
                    type: 'presentation',
                    difficulty: 'advanced',
                    duration: '40 min',
                    href: 'houses/web/presentations/web-ospf.presentation.html',
                    prerequisites: ['netplus-routing']
                },
                {
                    id: 'netplus-wireless',
                    title: 'Wireless Networking',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'houses/web/presentations/web-wireless.presentation.html',
                    prerequisites: ['netplus-ospf']
                },
                {
                    id: 'netplus-wireless-arch',
                    title: 'Wireless Architecture',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'houses/web/presentations/web-wireless-architecture.presentation.html',
                    prerequisites: ['netplus-wireless']
                },
                // Domain 3: Network Operations
                {
                    id: 'netplus-dns',
                    title: 'DNS Services',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'houses/web/presentations/web-dns.presentation.html',
                    prerequisites: ['netplus-wireless-arch']
                },
                {
                    id: 'netplus-dhcp',
                    title: 'DHCP Services',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '20 min',
                    href: 'houses/web/presentations/web-dhcp.presentation.html',
                    prerequisites: ['netplus-dns']
                },
                {
                    id: 'netplus-nat',
                    title: 'NAT & PAT',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'houses/web/presentations/web-nat.presentation.html',
                    prerequisites: ['netplus-dhcp']
                },
                {
                    id: 'netplus-networking-quiz',
                    title: 'Networking Chapters 7-10 Challenge',
                    type: 'quiz',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'houses/web/quizzes/web-networking-ch7-10.quiz.html',
                    prerequisites: ['netplus-nat']
                },
                // Domain 4: Network Security
                {
                    id: 'netplus-security',
                    title: 'Network Security Tools',
                    type: 'tool',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'houses/web/tools/web-security.tool.html',
                    prerequisites: ['netplus-networking-quiz']
                },
                {
                    id: 'netplus-acl',
                    title: 'Access Control Lists',
                    type: 'tool',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'houses/web/tools/web-acl.tool.html',
                    prerequisites: ['netplus-security']
                },
                // Domain 5: Network Troubleshooting
                {
                    id: 'netplus-troubleshooting',
                    title: 'Network Troubleshooting',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '35 min',
                    href: 'houses/web/presentations/web-troubleshooting.presentation.html',
                    prerequisites: ['netplus-acl']
                },
                {
                    id: 'netplus-troubleshooting-tool',
                    title: 'Troubleshooting Toolkit',
                    type: 'tool',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'houses/web/tools/web-troubleshooting.tool.html',
                    prerequisites: ['netplus-troubleshooting']
                },
                {
                    id: 'netplus-static-routes-lab',
                    title: 'Static Routes Lab',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'houses/web/labs/web-static-routes.lab.html',
                    prerequisites: ['netplus-troubleshooting-tool']
                },
                // Hands-on & Final
                {
                    id: 'netplus-network-simulator',
                    title: 'Network Simulator Lab',
                    type: 'lab',
                    difficulty: 'advanced',
                    duration: '60 min',
                    href: 'houses/web/simulators/web-interactive-network-simulatorv2.simulator.html',
                    prerequisites: ['netplus-static-routes-lab']
                },
                {
                    id: 'netplus-final-review',
                    title: 'Network+ Final Review',
                    type: 'quiz',
                    difficulty: 'advanced',
                    duration: '30 min',
                    href: 'houses/web/quizzes/web-networking-final-review.quiz.html',
                    prerequisites: ['netplus-network-simulator']
                }
            ]
        },

        // Cryptography Track — Key House (Primary Learning Path)
        'cryptography-track': {
            name: 'Cryptography Track',
            description: 'Master cryptography from fundamentals through post-quantum: symmetric, asymmetric, hashing, PKI, digital signatures, key management, and beyond',
            icon: '🔐',
            color: '#eab308',
            modules: [
                // Foundation
                {
                    id: 'crypto-encryption-basics',
                    title: 'Encryption Basics',
                    type: 'presentation',
                    difficulty: 'beginner',
                    duration: '25 min',
                    href: 'houses/key/presentations/key-encryption-basics.presentation.html',
                    prerequisites: []
                },
                {
                    id: 'crypto-fundamentals',
                    title: 'Cryptography Fundamentals (CEH)',
                    type: 'presentation',
                    difficulty: 'beginner',
                    duration: '35 min',
                    href: 'houses/key/presentations/key-cryptography-fundamentals.presentation.html',
                    prerequisites: ['crypto-encryption-basics']
                },
                // Symmetric Encryption
                {
                    id: 'crypto-symmetric',
                    title: 'Symmetric Encryption',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'houses/key/presentations/key-advanced-symmetric.presentation.html',
                    prerequisites: ['crypto-fundamentals']
                },
                {
                    id: 'crypto-aes-explorer',
                    title: 'AES Explorer',
                    type: 'tool',
                    difficulty: 'intermediate',
                    duration: '35 min',
                    href: 'houses/key/tools/key-aes.tool.html',
                    prerequisites: ['crypto-symmetric']
                },
                {
                    id: 'crypto-aes-lab',
                    title: 'AES Encryption Lab',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '45 min',
                    href: 'houses/key/labs/key-aes.lab.html',
                    prerequisites: ['crypto-aes-explorer']
                },
                {
                    id: 'crypto-symmetric-quiz',
                    title: 'Symmetric Encryption Quiz',
                    type: 'quiz',
                    difficulty: 'intermediate',
                    duration: '15 min',
                    href: 'houses/key/quizzes/key-symmetric.quiz.html',
                    prerequisites: ['crypto-aes-lab']
                },
                // Hashing & Integrity
                {
                    id: 'crypto-hash-stego-intro',
                    title: 'Hash & Steganography Intro',
                    type: 'presentation',
                    difficulty: 'beginner',
                    duration: '30 min',
                    href: 'houses/key/modules/key-hash-stego-intro.module.html',
                    prerequisites: ['crypto-symmetric-quiz']
                },
                {
                    id: 'crypto-hmac',
                    title: 'Message Authentication (HMAC)',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'houses/key/presentations/key-message-authentication.presentation.html',
                    prerequisites: ['crypto-hash-stego-intro']
                },
                {
                    id: 'crypto-hmac-tool',
                    title: 'HMAC Tool',
                    type: 'tool',
                    difficulty: 'intermediate',
                    duration: '20 min',
                    href: 'houses/key/tools/key-hmac.tool.html',
                    prerequisites: ['crypto-hmac']
                },
                {
                    id: 'crypto-hmac-lab',
                    title: 'HMAC Lab',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '45 min',
                    href: 'houses/key/labs/key-hmac.lab.html',
                    prerequisites: ['crypto-hmac-tool']
                },
                {
                    id: 'crypto-mac-quiz',
                    title: 'Message Authentication Quiz',
                    type: 'quiz',
                    difficulty: 'intermediate',
                    duration: '15 min',
                    href: 'houses/key/quizzes/key-mac.quiz.html',
                    prerequisites: ['crypto-hmac-lab']
                },
                // Asymmetric / ECC
                {
                    id: 'crypto-ecc',
                    title: 'Elliptic Curve Cryptography',
                    type: 'presentation',
                    difficulty: 'advanced',
                    duration: '35 min',
                    href: 'houses/key/presentations/key-elliptic-curve.presentation.html',
                    prerequisites: ['crypto-mac-quiz']
                },
                {
                    id: 'crypto-ecc-visualizer',
                    title: 'ECC Visualizer',
                    type: 'tool',
                    difficulty: 'advanced',
                    duration: '20 min',
                    href: 'houses/key/tools/key-ecc.tool.html',
                    prerequisites: ['crypto-ecc']
                },
                {
                    id: 'crypto-ecc-lab',
                    title: 'Elliptic Curve Lab',
                    type: 'lab',
                    difficulty: 'advanced',
                    duration: '45 min',
                    href: 'houses/key/labs/key-ecc.lab.html',
                    prerequisites: ['crypto-ecc-visualizer']
                },
                {
                    id: 'crypto-ecc-quiz',
                    title: 'ECC Quiz',
                    type: 'quiz',
                    difficulty: 'advanced',
                    duration: '15 min',
                    href: 'houses/key/quizzes/key-ecc.quiz.html',
                    prerequisites: ['crypto-ecc-lab']
                },
                // PKI & Digital Signatures
                {
                    id: 'crypto-certificates',
                    title: 'Digital Certificates & PKI',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'houses/key/presentations/key-certificates.presentation.html',
                    prerequisites: ['crypto-ecc-quiz']
                },
                {
                    id: 'crypto-cert-tool',
                    title: 'Certificate Tool',
                    type: 'tool',
                    difficulty: 'intermediate',
                    duration: '20 min',
                    href: 'houses/key/tools/key-cert.tool.html',
                    prerequisites: ['crypto-certificates']
                },
                {
                    id: 'crypto-cert-lab',
                    title: 'Certificate Lab',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '45 min',
                    href: 'houses/key/labs/key-cert.lab.html',
                    prerequisites: ['crypto-cert-tool']
                },
                {
                    id: 'crypto-cert-quiz',
                    title: 'Certificates Quiz',
                    type: 'quiz',
                    difficulty: 'intermediate',
                    duration: '15 min',
                    href: 'houses/key/quizzes/key-cert.quiz.html',
                    prerequisites: ['crypto-cert-lab']
                },
                // Key Derivation & Management
                {
                    id: 'crypto-kdf',
                    title: 'Key Derivation Functions',
                    type: 'presentation',
                    difficulty: 'advanced',
                    duration: '30 min',
                    href: 'houses/key/presentations/key-derivation.presentation.html',
                    prerequisites: ['crypto-cert-quiz']
                },
                {
                    id: 'crypto-kdf-tool',
                    title: 'KDF Analyzer',
                    type: 'tool',
                    difficulty: 'advanced',
                    duration: '20 min',
                    href: 'houses/key/tools/key-kdf.tool.html',
                    prerequisites: ['crypto-kdf']
                },
                {
                    id: 'crypto-kdf-lab',
                    title: 'Key Derivation Lab',
                    type: 'lab',
                    difficulty: 'advanced',
                    duration: '45 min',
                    href: 'houses/key/labs/key-kdf.lab.html',
                    prerequisites: ['crypto-kdf-tool']
                },
                {
                    id: 'crypto-kdf-quiz',
                    title: 'KDF Quiz',
                    type: 'quiz',
                    difficulty: 'advanced',
                    duration: '15 min',
                    href: 'houses/key/quizzes/key-kdf.quiz.html',
                    prerequisites: ['crypto-kdf-lab']
                },
                {
                    id: 'crypto-key-management',
                    title: 'Key Management',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'houses/key/presentations/key-management.presentation.html',
                    prerequisites: ['crypto-kdf-quiz']
                },
                {
                    id: 'crypto-lifecycle',
                    title: 'Key Lifecycle Manager',
                    type: 'tool',
                    difficulty: 'intermediate',
                    duration: '20 min',
                    href: 'houses/key/tools/key-lifecycle.tool.html',
                    prerequisites: ['crypto-key-management']
                },
                // HSM
                {
                    id: 'crypto-hsm-lab',
                    title: 'Hardware Security Module Lab',
                    type: 'lab',
                    difficulty: 'advanced',
                    duration: '45 min',
                    href: 'houses/key/labs/key-hsm.lab.html',
                    prerequisites: ['crypto-lifecycle']
                },
                {
                    id: 'crypto-hsm-quiz',
                    title: 'HSM Quiz',
                    type: 'quiz',
                    difficulty: 'advanced',
                    duration: '15 min',
                    href: 'houses/key/quizzes/key-hsm.quiz.html',
                    prerequisites: ['crypto-hsm-lab']
                },
                // Cryptanalysis & Attacks
                {
                    id: 'crypto-cryptanalysis',
                    title: 'Cryptanalysis',
                    type: 'presentation',
                    difficulty: 'advanced',
                    duration: '25 min',
                    href: 'houses/key/presentations/key-cryptanalysis.presentation.html',
                    prerequisites: ['crypto-hsm-quiz']
                },
                {
                    id: 'crypto-cryptanalysis-lab',
                    title: 'Cryptanalysis Lab',
                    type: 'lab',
                    difficulty: 'advanced',
                    duration: '45 min',
                    href: 'houses/key/labs/key-cryptanalysis.lab.html',
                    prerequisites: ['crypto-cryptanalysis']
                },
                {
                    id: 'crypto-attack-lab',
                    title: 'Cryptographic Attack Lab',
                    type: 'lab',
                    difficulty: 'advanced',
                    duration: '45 min',
                    href: 'houses/key/labs/key-attack.lab.html',
                    prerequisites: ['crypto-cryptanalysis-lab']
                },
                {
                    id: 'crypto-cryptanalysis-quiz',
                    title: 'Cryptanalysis Quiz',
                    type: 'quiz',
                    difficulty: 'advanced',
                    duration: '15 min',
                    href: 'houses/key/quizzes/key-cryptanalysis.quiz.html',
                    prerequisites: ['crypto-attack-lab']
                },
                // Post-Quantum
                {
                    id: 'crypto-post-quantum',
                    title: 'Post-Quantum Cryptography',
                    type: 'presentation',
                    difficulty: 'advanced',
                    duration: '35 min',
                    href: 'houses/key/presentations/key-post-quantum.presentation.html',
                    prerequisites: ['crypto-cryptanalysis-quiz']
                },
                {
                    id: 'crypto-pqc-explorer',
                    title: 'PQC Explorer',
                    type: 'tool',
                    difficulty: 'advanced',
                    duration: '20 min',
                    href: 'houses/key/tools/key-pqc.tool.html',
                    prerequisites: ['crypto-post-quantum']
                },
                {
                    id: 'crypto-pqc-lab',
                    title: 'Post-Quantum Crypto Lab',
                    type: 'lab',
                    difficulty: 'advanced',
                    duration: '45 min',
                    href: 'houses/key/labs/key-pqc.lab.html',
                    prerequisites: ['crypto-pqc-explorer']
                },
                {
                    id: 'crypto-pqc-quiz',
                    title: 'PQC Quiz',
                    type: 'quiz',
                    difficulty: 'advanced',
                    duration: '15 min',
                    href: 'houses/key/quizzes/key-pqc.quiz.html',
                    prerequisites: ['crypto-pqc-lab']
                }
            ]
        },

        // Security+ Cryptography Domain — Key House
        // Focused subset of Security+ SY0-701 cryptography objectives
        'security-plus-crypto': {
            name: 'Security+ Cryptography Domain',
            description: 'CompTIA Security+ SY0-701 cryptography objectives: symmetric/asymmetric encryption, hashing, PKI, digital signatures, and key exchange',
            icon: '🛡️',
            color: '#eab308',
            modules: [
                // Crypto Foundations (maps to SY0-701 Domain 1.4)
                {
                    id: 'spc-encryption-basics',
                    title: 'Encryption Basics',
                    type: 'presentation',
                    difficulty: 'beginner',
                    duration: '25 min',
                    href: 'houses/key/presentations/key-encryption-basics.presentation.html',
                    prerequisites: []
                },
                // Symmetric Encryption (maps to SY0-701 3.7)
                {
                    id: 'spc-symmetric',
                    title: 'Symmetric Encryption',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'houses/key/presentations/key-advanced-symmetric.presentation.html',
                    prerequisites: ['spc-encryption-basics']
                },
                {
                    id: 'spc-aes-explorer',
                    title: 'AES Explorer',
                    type: 'tool',
                    difficulty: 'intermediate',
                    duration: '35 min',
                    href: 'houses/key/tools/key-aes.tool.html',
                    prerequisites: ['spc-symmetric']
                },
                {
                    id: 'spc-symmetric-quiz',
                    title: 'Symmetric Encryption Quiz',
                    type: 'quiz',
                    difficulty: 'intermediate',
                    duration: '15 min',
                    href: 'houses/key/quizzes/key-symmetric.quiz.html',
                    prerequisites: ['spc-aes-explorer']
                },
                // Hashing (maps to SY0-701 1.4)
                {
                    id: 'spc-hashing',
                    title: 'Hashing & Message Authentication',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'houses/key/presentations/key-message-authentication.presentation.html',
                    prerequisites: ['spc-symmetric-quiz']
                },
                {
                    id: 'spc-hmac-tool',
                    title: 'HMAC Tool',
                    type: 'tool',
                    difficulty: 'intermediate',
                    duration: '20 min',
                    href: 'houses/key/tools/key-hmac.tool.html',
                    prerequisites: ['spc-hashing']
                },
                {
                    id: 'spc-mac-quiz',
                    title: 'Message Authentication Quiz',
                    type: 'quiz',
                    difficulty: 'intermediate',
                    duration: '15 min',
                    href: 'houses/key/quizzes/key-mac.quiz.html',
                    prerequisites: ['spc-hmac-tool']
                },
                // Asymmetric / Key Exchange (maps to SY0-701 3.7)
                {
                    id: 'spc-ecc',
                    title: 'Asymmetric Encryption & ECC',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '35 min',
                    href: 'houses/key/presentations/key-elliptic-curve.presentation.html',
                    prerequisites: ['spc-mac-quiz']
                },
                {
                    id: 'spc-ecc-quiz',
                    title: 'ECC Quiz',
                    type: 'quiz',
                    difficulty: 'intermediate',
                    duration: '15 min',
                    href: 'houses/key/quizzes/key-ecc.quiz.html',
                    prerequisites: ['spc-ecc']
                },
                // PKI & Digital Signatures (maps to SY0-701 1.4, 3.7)
                {
                    id: 'spc-certificates',
                    title: 'PKI & Digital Certificates',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'houses/key/presentations/key-certificates.presentation.html',
                    prerequisites: ['spc-ecc-quiz']
                },
                {
                    id: 'spc-cert-tool',
                    title: 'Certificate Tool',
                    type: 'tool',
                    difficulty: 'intermediate',
                    duration: '20 min',
                    href: 'houses/key/tools/key-cert.tool.html',
                    prerequisites: ['spc-certificates']
                },
                {
                    id: 'spc-cert-quiz',
                    title: 'Certificates Quiz',
                    type: 'quiz',
                    difficulty: 'intermediate',
                    duration: '15 min',
                    href: 'houses/key/quizzes/key-cert.quiz.html',
                    prerequisites: ['spc-cert-tool']
                },
                // Key Management (maps to SY0-701 1.4)
                {
                    id: 'spc-key-management',
                    title: 'Key Management',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'houses/key/presentations/key-management.presentation.html',
                    prerequisites: ['spc-cert-quiz']
                },
                {
                    id: 'spc-lifecycle',
                    title: 'Key Lifecycle Manager',
                    type: 'tool',
                    difficulty: 'intermediate',
                    duration: '20 min',
                    href: 'houses/key/tools/key-lifecycle.tool.html',
                    prerequisites: ['spc-key-management']
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
