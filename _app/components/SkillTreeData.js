/**
 * SkillTreeData.js - Skill Tree Definitions for Divergent Learners
 *
 * Defines skill branches that unlock based on progress:
 * - Cross-house specializations
 * - Advanced topic unlocks
 * - Career path branches
 */

class SkillTreeData {
    /**
     * Get the default skill tree structure
     */
    static getDefaultTree() {
        return {
            version: 1,
            branches: {
                // === CROSS-HOUSE SPECIALIZATIONS ===
                security_analyst: {
                    id: 'security_analyst',
                    name: 'Security Analyst Path',
                    description: 'Combine monitoring and security fundamentals',
                    icon: '🔍',
                    color: '#8b5cf6',
                    prerequisites: [
                        { type: 'house_progress', houseId: 'shield', value: 50 },
                        { type: 'house_progress', houseId: 'eye', value: 30 }
                    ],
                    unlocks: [
                        'advanced-incident-response',
                        'malware-triage',
                        'forensics-basics'
                    ],
                    bonusXP: 500
                },

                cloud_security: {
                    id: 'cloud_security',
                    name: 'Cloud Security Specialist',
                    description: 'Secure cloud infrastructure',
                    icon: '🔒☁️',
                    color: '#06b6d4',
                    prerequisites: [
                        { type: 'house_progress', houseId: 'cloud', value: 60 },
                        { type: 'house_progress', houseId: 'shield', value: 40 }
                    ],
                    unlocks: [
                        'aws-security-specialty',
                        'azure-security',
                        'cloud-compliance'
                    ],
                    bonusXP: 600
                },

                devops_engineer: {
                    id: 'devops_engineer',
                    name: 'DevOps Engineer Path',
                    description: 'Master CI/CD and infrastructure automation',
                    icon: '🚀',
                    color: '#ec4899',
                    prerequisites: [
                        { type: 'house_progress', houseId: 'code', value: 70 },
                        { type: 'house_progress', houseId: 'script', value: 50 }
                    ],
                    unlocks: [
                        'advanced-kubernetes',
                        'gitops-workflows',
                        'sre-practices'
                    ],
                    bonusXP: 600
                },

                network_engineer: {
                    id: 'network_engineer',
                    name: 'Network Engineer Path',
                    description: 'Advanced networking and architecture',
                    icon: '🌐',
                    color: '#3b82f6',
                    prerequisites: [
                        { type: 'house_progress', houseId: 'web', value: 80 },
                        { type: 'level', value: 8 }
                    ],
                    unlocks: [
                        'ccna-prep',
                        'network-automation',
                        'sd-wan'
                    ],
                    bonusXP: 700
                },

                systems_admin: {
                    id: 'systems_admin',
                    name: 'Systems Administrator Path',
                    description: 'Enterprise systems management',
                    icon: '🖥️',
                    color: '#f97316',
                    prerequisites: [
                        { type: 'house_progress', houseId: 'forge', value: 60 },
                        { type: 'house_progress', houseId: 'script', value: 40 }
                    ],
                    unlocks: [
                        'active-directory-deep',
                        'group-policy-mastery',
                        'server-hardening'
                    ],
                    bonusXP: 500
                },

                cryptographer: {
                    id: 'cryptographer',
                    name: 'Cryptographer Path',
                    description: 'Advanced cryptographic concepts',
                    icon: '🔐',
                    color: '#eab308',
                    prerequisites: [
                        { type: 'house_progress', houseId: 'key', value: 80 },
                        { type: 'level', value: 10 }
                    ],
                    unlocks: [
                        'crypto-implementation',
                        'protocol-analysis',
                        'hardware-security-modules'
                    ],
                    bonusXP: 700
                },

                // === CAREER PATH BRANCHES ===
                pentester: {
                    id: 'pentester',
                    name: 'Penetration Tester Path',
                    description: 'Offensive security and ethical hacking',
                    icon: '🎯',
                    color: '#ef4444',
                    prerequisites: [
                        { type: 'house_progress', houseId: 'shield', value: 70 },
                        { type: 'house_progress', houseId: 'web', value: 50 },
                        { type: 'module', id: 'shield-network-security' }
                    ],
                    unlocks: [
                        'web-app-hacking',
                        'network-pentesting',
                        'social-engineering'
                    ],
                    bonusXP: 800,
                    gatedContent: true // Requires additional verification
                },

                incident_responder: {
                    id: 'incident_responder',
                    name: 'Incident Responder Path',
                    description: 'Handle security incidents like a pro',
                    icon: '🚨',
                    color: '#dc2626',
                    prerequisites: [
                        { type: 'house_progress', houseId: 'eye', value: 70 },
                        { type: 'house_progress', houseId: 'shield', value: 60 },
                        { type: 'level', value: 12 }
                    ],
                    unlocks: [
                        'digital-forensics',
                        'malware-analysis-intro',
                        'incident-playbooks'
                    ],
                    bonusXP: 800
                },

                // === LEVEL-GATED CONTENT ===
                master_class: {
                    id: 'master_class',
                    name: 'Master Class Access',
                    description: 'Advanced topics for dedicated learners',
                    icon: '👑',
                    color: '#fbbf24',
                    prerequisites: [
                        { type: 'level', value: 15 }
                    ],
                    unlocks: [
                        'architecture-design',
                        'security-leadership',
                        'teaching-others'
                    ],
                    bonusXP: 1000
                },

                // === DARK ARTS ACCESS ===
                dark_arts_initiate: {
                    id: 'dark_arts_initiate',
                    name: 'Dark Arts Initiate',
                    description: 'Begin the path to understanding malware',
                    icon: '💀',
                    color: '#1f2937',
                    prerequisites: [
                        { type: 'house_progress', houseId: 'shield', value: 80 },
                        { type: 'house_progress', houseId: 'script', value: 60 },
                        { type: 'level', value: 10 },
                        { type: 'module', id: 'shield-yara-training' }
                    ],
                    unlocks: [
                        'dark-arts-gate-1',
                        'malware-basics',
                        'reverse-engineering-intro'
                    ],
                    bonusXP: 1000,
                    gatedContent: true
                }
            },

            // Skill nodes within branches (for visual tree)
            nodes: {
                // Security Analyst nodes
                'advanced-incident-response': {
                    name: 'Advanced Incident Response',
                    branch: 'security_analyst',
                    tier: 1,
                    xp: 200
                },
                'malware-triage': {
                    name: 'Malware Triage',
                    branch: 'security_analyst',
                    tier: 2,
                    prerequisites: ['advanced-incident-response'],
                    xp: 300
                },
                'forensics-basics': {
                    name: 'Digital Forensics Basics',
                    branch: 'security_analyst',
                    tier: 2,
                    prerequisites: ['advanced-incident-response'],
                    xp: 300
                },

                // Cloud Security nodes
                'aws-security-specialty': {
                    name: 'AWS Security Specialty',
                    branch: 'cloud_security',
                    tier: 1,
                    xp: 250
                },
                'azure-security': {
                    name: 'Azure Security',
                    branch: 'cloud_security',
                    tier: 1,
                    xp: 250
                },
                'cloud-compliance': {
                    name: 'Cloud Compliance',
                    branch: 'cloud_security',
                    tier: 2,
                    prerequisites: ['aws-security-specialty', 'azure-security'],
                    xp: 400
                }
            }
        };
    }

    /**
     * Get branch details by ID
     */
    static getBranch(branchId) {
        const tree = this.getDefaultTree();
        return tree.branches[branchId] || null;
    }

    /**
     * Get all branches
     */
    static getAllBranches() {
        const tree = this.getDefaultTree();
        return Object.values(tree.branches);
    }

    /**
     * Check if branch prerequisites are met
     */
    static checkBranchPrerequisites(branchId, progress) {
        const branch = this.getBranch(branchId);
        if (!branch) return false;

        return branch.prerequisites.every(prereq => {
            switch (prereq.type) {
                case 'module':
                    return progress.completedModules.includes(prereq.id);
                case 'level':
                    return progress.level >= prereq.value;
                case 'house_progress':
                    const house = progress.houses[prereq.houseId];
                    return house && house.progressPercent >= prereq.value;
                default:
                    return false;
            }
        });
    }

    /**
     * Get unlockable branches for current progress
     */
    static getUnlockableBranches(progress) {
        return Object.entries(this.getDefaultTree().branches)
            .filter(([id, branch]) => {
                // Not already unlocked
                if (progress.divergentBranches.includes(id)) return false;
                // Prerequisites met
                return this.checkBranchPrerequisites(id, progress);
            })
            .map(([id, branch]) => branch);
    }

    /**
     * Get visual skill tree data for rendering
     */
    static getVisualTreeData(progress) {
        const tree = this.getDefaultTree();
        const unlockedBranches = new Set(progress.divergentBranches);

        return Object.entries(tree.branches).map(([id, branch]) => ({
            ...branch,
            unlocked: unlockedBranches.has(id),
            available: this.checkBranchPrerequisites(id, progress),
            prerequisiteProgress: branch.prerequisites.map(prereq => {
                let current = 0;
                let required = prereq.value || 1;

                switch (prereq.type) {
                    case 'module':
                        current = progress.completedModules.includes(prereq.id) ? 1 : 0;
                        required = 1;
                        break;
                    case 'level':
                        current = progress.level;
                        break;
                    case 'house_progress':
                        const house = progress.houses[prereq.houseId];
                        current = house ? house.progressPercent : 0;
                        break;
                }

                return {
                    ...prereq,
                    current,
                    required,
                    met: current >= required
                };
            })
        }));
    }
}

// Make globally available
window.SkillTreeData = SkillTreeData;
