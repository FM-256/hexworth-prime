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
