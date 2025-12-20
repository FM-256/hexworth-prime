/**
 * Skill Tree - Factionless Content Navigation
 *
 * Replaces house-based navigation with a file-tree interface
 * organized by skill domains. Content can appear in multiple
 * perspectives (Fundamentals, Tools, Skills).
 *
 * Inspired by: Final Fantasy 7 Remake weapon upgrade trees
 */

const SkillTree = {

    // ═══════════════════════════════════════════════════════════════
    // FUNDAMENTALS - Concepts, Theory, "Know"
    // ═══════════════════════════════════════════════════════════════
    fundamentals: {
        id: 'fundamentals',
        name: 'Fundamentals',
        icon: '📚',
        color: '#3b82f6',
        description: 'Concepts, Theory, Know',
        folders: {
            networking: {
                name: 'networking',
                displayName: 'Networking',
                icon: '🌐',
                items: [
                    { file: 'osi_model.md', contentId: 'web-osi-model', title: 'OSI Model' },
                    { file: 'tcp_ip.md', contentId: 'web-tcpip', title: 'TCP/IP Model' },
                    { file: 'ip_addressing.md', contentId: 'web-ip-addressing', title: 'IP Addressing' },
                    { file: 'ipv6.md', contentId: 'web-ipv6', title: 'IPv6 Fundamentals' },
                    { file: 'wireless.md', contentId: 'web-wireless', title: 'Wireless Networking' },
                    { file: 'network_services.md', contentId: 'web-network-services', title: 'Network Services' }
                ]
            },
            security: {
                name: 'security',
                displayName: 'Security',
                icon: '🛡️',
                items: [
                    { file: 'cia_triad.md', contentId: 'shield-cia-triad', title: 'CIA Triad' },
                    { file: 'security_principles.md', contentId: 'shield-security-fundamentals', title: 'Security Fundamentals' },
                    { file: 'threats_attacks.md', contentId: 'shield-threat-types', title: 'Threats & Attacks' },
                    { file: 'social_engineering.md', contentId: 'shield-social-engineering', title: 'Social Engineering' },
                    { file: 'web_attacks.md', contentId: 'shield-web-attacks', title: 'Web Application Attacks' },
                    { file: 'cryptography.md', contentId: 'shield-cryptography', title: 'Cryptography Essentials' },
                    { file: 'encryption.md', contentId: 'key-encryption-basics', title: 'Encryption Fundamentals' }
                ]
            },
            systems: {
                name: 'systems',
                displayName: 'Systems',
                icon: '⚙️',
                items: [
                    { file: 'hardware_basics.md', contentId: 'forge-hardware-fundamentals', title: 'Hardware Fundamentals' },
                    { file: 'storage_raid.md', contentId: 'forge-storage-raid', title: 'Storage & RAID' },
                    { file: 'peripherals.md', contentId: 'forge-peripherals-expansion', title: 'Peripherals & Expansion' },
                    { file: 'windows_editions.md', contentId: 'forge-windows-editions', title: 'Windows Editions' },
                    { file: 'macos_linux.md', contentId: 'forge-macos-linux-basics', title: 'macOS & Linux Basics' },
                    { file: 'linux_filesystem.md', contentId: 'script-linux-filesystem', title: 'Linux File System' },
                    { file: 'linux_permissions.md', contentId: 'script-linux-permissions', title: 'Linux Permissions' }
                ]
            },
            cloud: {
                name: 'cloud',
                displayName: 'Cloud',
                icon: '☁️',
                items: [
                    { file: 'cloud_concepts.md', contentId: 'cloud-concepts', title: 'Cloud Computing Concepts' },
                    { file: 'service_models.md', contentId: 'cloud-models', title: 'Cloud Service Models' },
                    { file: 'aws_infrastructure.md', contentId: 'cloud-aws-regions', title: 'AWS Global Infrastructure' },
                    { file: 'aws_security.md', contentId: 'cloud-aws-security', title: 'AWS IAM & Security' },
                    { file: 'azure_fundamentals.md', contentId: 'cloud-azure-fundamentals', title: 'Azure Fundamentals' }
                ]
            },
            programming: {
                name: 'programming',
                displayName: 'Programming',
                icon: '💻',
                items: [
                    { file: 'python_basics.md', contentId: 'script-python-basics', title: 'Python Basics' },
                    { file: 'python_strings.md', contentId: 'script-python-strings', title: 'Python Strings' },
                    { file: 'flow_control.md', contentId: 'script-python-flow-control', title: 'Flow Control' },
                    { file: 'functions.md', contentId: 'script-python-functions', title: 'Functions' },
                    { file: 'collections.md', contentId: 'script-python-collections', title: 'Collections' },
                    { file: 'dictionaries.md', contentId: 'script-python-dictionaries', title: 'Dictionaries' },
                    { file: 'oop.md', contentId: 'script-python-oop', title: 'Object-Oriented Programming' }
                ]
            }
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // TOOLS - Software, Utilities, "Use"
    // ═══════════════════════════════════════════════════════════════
    tools: {
        id: 'tools',
        name: 'Tools',
        icon: '🔧',
        color: '#f59e0b',
        description: 'Software, Utilities, Use',
        folders: {
            network_analysis: {
                name: 'network_analysis',
                displayName: 'Network Analysis',
                icon: '📡',
                items: [
                    { file: 'packet_tracer.md', contentId: 'web-network-simulator', title: 'Network Simulator Lab' },
                    { file: 'troubleshooting_tools.md', contentId: 'web-troubleshooting', title: 'Network Troubleshooting' },
                    { file: 'visualizers.md', contentId: 'web-switching', title: 'VLAN Visualizer' }
                ]
            },
            windows_admin: {
                name: 'windows_admin',
                displayName: 'Windows Admin',
                icon: '🪟',
                items: [
                    { file: 'settings_app.md', contentId: 'forge-windows-settings', title: 'Windows Settings App' },
                    { file: 'control_panel.md', contentId: 'forge-control-panel', title: 'Control Panel' },
                    { file: 'admin_tools.md', contentId: 'forge-admin-tools', title: 'Administrative Tools' },
                    { file: 'system_tools.md', contentId: 'forge-system-tools', title: 'System Tools & Utilities' },
                    { file: 'registry.md', contentId: 'script-windows-registry', title: 'Windows Registry' },
                    { file: 'troubleshooting.md', contentId: 'script-windows-troubleshooting', title: 'Windows Troubleshooting' }
                ]
            },
            command_line: {
                name: 'command_line',
                displayName: 'Command Line',
                icon: '⌨️',
                items: [
                    { file: 'linux_cli.md', contentId: 'script-linux-basics', title: 'Linux Command Line' },
                    { file: 'powershell.md', contentId: 'script-powershell-basics', title: 'PowerShell Basics' },
                    { file: 'windows_cli.md', contentId: 'script-windows-cli', title: 'Windows CLI Tools' },
                    { file: 'bash_scripting.md', contentId: 'script-bash-scripting', title: 'Bash Scripting' },
                    { file: 'command_translator.md', contentId: 'script-command-translator', title: 'Cross-Platform Commands' }
                ]
            },
            development: {
                name: 'development',
                displayName: 'Development',
                icon: '🔨',
                items: [
                    { file: 'git.md', contentId: 'code-git-basics', title: 'Git Fundamentals' },
                    { file: 'python_files.md', contentId: 'script-python-files', title: 'Python File Handling' }
                ]
            },
            cloud_platforms: {
                name: 'cloud_platforms',
                displayName: 'Cloud Platforms',
                icon: '🌩️',
                items: [
                    { file: 'aws_console.md', contentId: 'cloud-aws-tools', title: 'AWS Management Tools' },
                    { file: 'aws_services.md', contentId: 'cloud-aws-services', title: 'AWS Service Explorer' },
                    { file: 'architecture_designer.md', contentId: 'cloud-architecture', title: 'Cloud Architecture Designer' },
                    { file: 'provider_comparison.md', contentId: 'cloud-providers', title: 'Cloud Provider Comparison' }
                ]
            },
            security_tools: {
                name: 'security_tools',
                displayName: 'Security Tools',
                icon: '🔐',
                items: [
                    { file: 'cipher_playground.md', contentId: 'key-encryption-basics', title: 'Cipher Playground' },
                    { file: 'log_parser.md', contentId: 'eye-log-analysis', title: 'Log Parser' }
                ]
            },
            sysadmin: {
                name: 'sysadmin',
                displayName: 'SysAdmin',
                icon: '🖥️',
                items: [
                    { file: 'process_management.md', contentId: 'script-process-management', title: 'Process Management' },
                    { file: 'log_management.md', contentId: 'script-log-management', title: 'Log Management' },
                    { file: 'package_management.md', contentId: 'script-package-management', title: 'Package Management' }
                ]
            }
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // SKILLS - Applied Abilities, "Do"
    // ═══════════════════════════════════════════════════════════════
    skills: {
        id: 'skills',
        name: 'Skills',
        icon: '⚔️',
        color: '#ef4444',
        description: 'Applied Abilities, Do',
        folders: {
            network_engineering: {
                name: 'network_engineering',
                displayName: 'Network Engineering',
                icon: '🌐',
                items: [
                    { file: 'subnetting.md', contentId: 'web-ip-addressing', title: 'IP Subnetting' },
                    { file: 'vlsm.md', contentId: 'web-vlsm', title: 'VLSM Design' },
                    { file: 'switching_vlans.md', contentId: 'web-switching', title: 'Switching & VLANs' },
                    { file: 'spanning_tree.md', contentId: 'web-stp', title: 'Spanning Tree Protocol' },
                    { file: 'routing.md', contentId: 'web-routing', title: 'Routing Fundamentals' },
                    { file: 'fhrp.md', contentId: 'web-fhrp', title: 'First Hop Redundancy' },
                    { file: 'enterprise_network.md', contentId: 'web-cumulative-labs', title: 'Enterprise Network Design' }
                ]
            },
            system_administration: {
                name: 'system_administration',
                displayName: 'System Administration',
                icon: '🖥️',
                items: [
                    { file: 'windows_admin.md', contentId: 'forge-admin-tools', title: 'Windows Administration' },
                    { file: 'linux_admin.md', contentId: 'script-linux-basics', title: 'Linux Administration' },
                    { file: 'process_control.md', contentId: 'script-process-management', title: 'Process Control' },
                    { file: 'log_analysis.md', contentId: 'script-log-management', title: 'Log Analysis' },
                    { file: 'automation.md', contentId: 'script-automation-concepts', title: 'Automation & IaC' }
                ]
            },
            security_operations: {
                name: 'security_operations',
                displayName: 'Security Operations',
                icon: '🛡️',
                items: [
                    { file: 'access_control.md', contentId: 'shield-access-control', title: 'Access Control' },
                    { file: 'network_security.md', contentId: 'shield-network-security', title: 'Network Security' },
                    { file: 'risk_management.md', contentId: 'shield-risk-management', title: 'Risk Management' },
                    { file: 'security_analysis.md', contentId: 'eye-log-analysis', title: 'Security Log Analysis' }
                ]
            },
            cloud_engineering: {
                name: 'cloud_engineering',
                displayName: 'Cloud Engineering',
                icon: '☁️',
                items: [
                    { file: 'aws_compute.md', contentId: 'cloud-aws-compute', title: 'AWS Compute Services' },
                    { file: 'ec2_instances.md', contentId: 'cloud-aws-ec2', title: 'EC2 Instance Management' },
                    { file: 'aws_storage.md', contentId: 'cloud-aws-storage', title: 'AWS Storage Services' },
                    { file: 'aws_database.md', contentId: 'cloud-aws-database', title: 'AWS Database Services' },
                    { file: 'vpc_networking.md', contentId: 'cloud-aws-networking', title: 'VPC Networking' },
                    { file: 'cloud_automation.md', contentId: 'cloud-aws-automation', title: 'Cloud Automation' },
                    { file: 'solution_design.md', contentId: 'cloud-aws-use-cases', title: 'Solution Architecture' }
                ]
            },
            development: {
                name: 'development',
                displayName: 'Development',
                icon: '💻',
                items: [
                    { file: 'python_scripting.md', contentId: 'script-python-basics', title: 'Python Scripting' },
                    { file: 'bash_automation.md', contentId: 'script-bash-scripting', title: 'Bash Automation' },
                    { file: 'version_control.md', contentId: 'code-git-basics', title: 'Version Control' },
                    { file: 'file_processing.md', contentId: 'script-python-files', title: 'File Processing' }
                ]
            },
            offensive_security: {
                name: 'offensive_security',
                displayName: 'Offensive Security',
                icon: '🗡️',
                locked: true,
                unlockHint: 'Complete the Five Gates to unlock',
                items: [
                    { file: '?.md', contentId: null, title: '?', locked: true },
                    { file: '?.md', contentId: null, title: '?', locked: true },
                    { file: '?.md', contentId: null, title: '?', locked: true }
                ]
            }
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // UTILITY METHODS
    // ═══════════════════════════════════════════════════════════════

    /**
     * Get all perspectives
     */
    getPerspectives() {
        return ['fundamentals', 'tools', 'skills'];
    },

    /**
     * Get a perspective by ID
     */
    getPerspective(id) {
        return this[id] || null;
    },

    /**
     * Get folder state from localStorage
     */
    getFolderState(perspectiveId, folderId) {
        const key = `skilltree_${perspectiveId}_${folderId}`;
        return localStorage.getItem(key) === 'expanded';
    },

    /**
     * Set folder state in localStorage
     */
    setFolderState(perspectiveId, folderId, expanded) {
        const key = `skilltree_${perspectiveId}_${folderId}`;
        localStorage.setItem(key, expanded ? 'expanded' : 'collapsed');
    },

    /**
     * Check if a content item is completed
     */
    isCompleted(contentId) {
        if (!contentId) return false;
        const progress = JSON.parse(localStorage.getItem('hexworth_progress') || '{}');
        // Check across all houses for completion
        for (const house in progress) {
            if (progress[house][contentId]?.completed) return true;
        }
        return false;
    },

    /**
     * Check if an item is locked (prerequisites not met)
     */
    isLocked(contentId) {
        if (!contentId) return true;
        const content = ContentRegistry.content[contentId];
        if (!content) return true;
        if (!content.prerequisites || content.prerequisites.length === 0) return false;

        return !content.prerequisites.every(prereq => this.isCompleted(prereq));
    },

    /**
     * Get completion stats for a perspective
     */
    getPerspectiveStats(perspectiveId) {
        const perspective = this[perspectiveId];
        if (!perspective) return { total: 0, completed: 0, percentage: 0 };

        let total = 0;
        let completed = 0;

        Object.values(perspective.folders).forEach(folder => {
            folder.items.forEach(item => {
                if (item.contentId) {
                    total++;
                    if (this.isCompleted(item.contentId)) completed++;
                }
            });
        });

        return {
            total,
            completed,
            percentage: total > 0 ? Math.round((completed / total) * 100) : 0
        };
    },

    /**
     * Find all occurrences of a content ID across all perspectives
     */
    findContentLocations(contentId) {
        const locations = [];

        this.getPerspectives().forEach(perspectiveId => {
            const perspective = this[perspectiveId];
            Object.entries(perspective.folders).forEach(([folderId, folder]) => {
                folder.items.forEach((item, index) => {
                    if (item.contentId === contentId) {
                        locations.push({
                            perspective: perspectiveId,
                            folder: folderId,
                            index,
                            path: `~/${perspectiveId}/${folderId}/${item.file}`
                        });
                    }
                });
            });
        });

        return locations;
    }
};

// Make it available globally
if (typeof window !== 'undefined') {
    window.SkillTree = SkillTree;
}
