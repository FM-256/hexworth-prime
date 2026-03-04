/**
 * ForgeData.js — Hexworth Prime DevOps Content Hub ("The Forge")
 *
 * Defines all tracks, sections, and module mappings for the DevOps hub.
 * Module hrefs are relative from the section page depth:
 *   _app/houses/code/devops/sections/{name}/index.html
 * So content paths start with ../../../../houses/code/...
 *
 * Progress is tracked in localStorage as: hexworth_forge_progress
 */

const ForgeData = {

    version: '1.0.0',

    // -------------------------------------------------------------------------
    // Track definitions — logical groupings shown as tabs on the hub page.
    // Foundation is always unlocked. Others unlock sequentially or freely.
    // -------------------------------------------------------------------------
    tracks: [
        {
            id: 'core',
            name: 'Core Pipeline',
            tagline: 'Build the foundation.',
            description: 'Environment setup, data formats, IDE mastery, and Git — the essential toolkit every DevOps engineer needs before touching infrastructure.',
            icon: '../../../assets/images/icons/icon-gear.webp',
            color: '#10b981',
            colorDim: 'rgba(16, 185, 129, 0.15)',
            sections: ['foundation', 'workbench', 'ide', 'git']
        },
        {
            id: 'infrastructure',
            name: 'Infrastructure',
            tagline: 'Containerize and orchestrate.',
            description: 'Docker, Kubernetes, CI/CD pipelines, and Infrastructure as Code — the systems that run production.',
            icon: '../../../assets/images/icons/icon-network.webp',
            color: '#3b82f6',
            colorDim: 'rgba(59, 130, 246, 0.15)',
            sections: ['docker', 'kubernetes', 'cicd', 'iac']
        },
        {
            id: 'automation',
            name: 'Automation',
            tagline: 'Automate everything.',
            description: 'Configuration management at scale — Ansible track with Chef, Puppet, and Salt on the horizon.',
            icon: '../../../assets/images/icons/icon-lightning.webp',
            color: '#f59e0b',
            colorDim: 'rgba(245, 158, 11, 0.15)',
            sections: ['ansible']
        },
        {
            id: 'mastery',
            name: 'Mastery',
            tagline: 'Prove your skills.',
            description: 'Culture, assessments, review games, and certification preparation.',
            icon: '../../../assets/images/icons/icon-trophy.webp',
            color: '#8b5cf6',
            colorDim: 'rgba(139, 92, 246, 0.15)',
            sections: ['culture', 'assessments', 'certprep']
        }
    ],

    // -------------------------------------------------------------------------
    // Section definitions — each section is a navigable page with modules.
    // type: 'module' | 'lab' | 'quiz' | 'presentation' | 'game' | 'review' | 'applet'
    // status: 'ready' | 'coming-soon'
    // -------------------------------------------------------------------------
    sections: [

        // =================================================================
        // CORE PIPELINE — Foundation
        // =================================================================
        {
            id: 'foundation',
            name: 'Foundation',
            track: 'core',
            icon: '../../../assets/images/icons/icon-books.webp',
            description: 'What is DevOps, the culture shift, and the toolchain landscape.',
            color: '#10b981',
            modules: [
                { id: 'do-1', title: 'What is DevOps?', type: 'module', status: 'coming-soon', sprint: 'DO-1' },
                { id: 'do-2', title: 'The DevOps Toolchain', type: 'module', status: 'coming-soon', sprint: 'DO-2' },
                { id: 'do-3', title: 'DevOps in Practice — Real-World Pipelines', type: 'module', status: 'coming-soon', sprint: 'DO-3' },
                { id: 'do-68', title: 'Data Formats — YAML, JSON, TOML', type: 'module', status: 'coming-soon', sprint: 'DO-68' },
                { id: 'do-69', title: 'Config Formats — XML, INI, ENV, HCL', type: 'module', status: 'coming-soon', sprint: 'DO-69' }
            ]
        },

        // =================================================================
        // CORE PIPELINE — The Workbench
        // =================================================================
        {
            id: 'workbench',
            name: 'The Workbench',
            track: 'core',
            icon: '../../../assets/images/icons/icon-wrench.webp',
            description: 'Set up your environment like a professional — OS, shell, SSH, runtimes, secrets, containers, networking.',
            color: '#10b981',
            modules: [
                { id: 'do-30', title: 'OS & Shell Setup', type: 'module', status: 'coming-soon', sprint: 'DO-30' },
                { id: 'do-31', title: 'SSH, GPG & Dotfiles', type: 'module', status: 'coming-soon', sprint: 'DO-31' },
                { id: 'do-32', title: 'Runtime Management — nvm, pyenv, rbenv', type: 'module', status: 'coming-soon', sprint: 'DO-32' },
                { id: 'do-33', title: 'Environment Variables & Secrets', type: 'module', status: 'coming-soon', sprint: 'DO-33' },
                { id: 'do-34', title: 'Dev Containers & Reproducible Environments', type: 'module', status: 'coming-soon', sprint: 'DO-34' },
                { id: 'do-35', title: 'Networking Basics for DevOps', type: 'module', status: 'coming-soon', sprint: 'DO-35' }
            ]
        },

        // =================================================================
        // CORE PIPELINE — IDE & VS Code
        // =================================================================
        {
            id: 'ide',
            name: 'IDE & VS Code',
            track: 'core',
            icon: '../../../assets/images/icons/icon-terminal.webp',
            description: 'Master your editor — VS Code deep dive, extensions, remote development, and terminal integration.',
            color: '#10b981',
            modules: [
                { id: 'do-4', title: 'VS Code — Interface & Core Features', type: 'module', status: 'coming-soon', sprint: 'DO-4' },
                { id: 'do-5', title: 'VS Code — Git Integration', type: 'module', status: 'coming-soon', sprint: 'DO-5' },
                { id: 'do-6', title: 'VS Code — Debugging & Tasks', type: 'module', status: 'coming-soon', sprint: 'DO-6' },
                { id: 'do-43', title: 'File Management & Project Structure', type: 'module', status: 'coming-soon', sprint: 'DO-43' },
                { id: 'do-44', title: 'File Types, Extensions & Language Support', type: 'module', status: 'coming-soon', sprint: 'DO-44' },
                { id: 'do-45', title: 'Remote Development — SSH, WSL, Containers', type: 'module', status: 'coming-soon', sprint: 'DO-45' },
                { id: 'do-46', title: 'DevOps Extensions Toolkit', type: 'module', status: 'coming-soon', sprint: 'DO-46' },
                { id: 'do-47', title: 'VS Code Tips, Tricks & Shortcuts', type: 'module', status: 'coming-soon', sprint: 'DO-47' }
            ]
        },

        // =================================================================
        // CORE PIPELINE — Git
        // =================================================================
        {
            id: 'git',
            name: 'Git',
            track: 'core',
            icon: '../../../assets/images/icons/icon-branch.webp',
            description: 'Version control mastery — from first commit to advanced workflows, rebasing, and internals.',
            color: '#10b981',
            modules: [
                { id: 'do-7', title: 'Git Fundamentals — Init, Add, Commit', type: 'module', status: 'ready', sprint: 'DO-7', href: 'do-7-git-fundamentals.html' },
                { id: 'do-8', title: 'Branches — Create, Switch, Merge', type: 'module', status: 'ready', sprint: 'DO-8', href: 'do-8-branches.html' },
                { id: 'do-9', title: 'Remote Repos — Push, Pull, Fetch', type: 'module', status: 'coming-soon', sprint: 'DO-9' },
                { id: 'do-10', title: 'Branching Strategies & Workflows', type: 'module', status: 'coming-soon', sprint: 'DO-10' },
                { id: 'do-11', title: 'Merge Conflicts — Detect, Resolve, Prevent', type: 'module', status: 'coming-soon', sprint: 'DO-11' },
                { id: 'do-12', title: 'Rebasing & Interactive Rebase', type: 'module', status: 'coming-soon', sprint: 'DO-12' },
                { id: 'do-13', title: 'Stashing, Tagging & Cherry-Picking', type: 'module', status: 'coming-soon', sprint: 'DO-13' },
                { id: 'do-14', title: 'Git Hooks & Automation', type: 'module', status: 'coming-soon', sprint: 'DO-14' },
                { id: 'do-15', title: 'Git Internals — Objects, Refs, the DAG', type: 'module', status: 'coming-soon', sprint: 'DO-15' },
                { id: 'do-16', title: 'Git Lab — Real-World Scenarios', type: 'lab', status: 'coming-soon', sprint: 'DO-16' },
                { id: 'do-36', title: 'Repository Anatomy — Inside .git/', type: 'module', status: 'coming-soon', sprint: 'DO-36' },
                { id: 'do-37', title: 'Forks, Upstream & Open-Source Workflows', type: 'module', status: 'coming-soon', sprint: 'DO-37' },
                { id: 'do-38', title: 'GitHub Features — Issues, PRs, Actions, Projects', type: 'module', status: 'coming-soon', sprint: 'DO-38' },
                { id: 'do-39', title: '.gitignore, README & LICENSE Conventions', type: 'module', status: 'coming-soon', sprint: 'DO-39' },
                { id: 'do-40', title: 'Diff & Comparing Changes', type: 'module', status: 'coming-soon', sprint: 'DO-40' },
                { id: 'do-41', title: 'Undoing Things — Reset, Revert, Restore', type: 'module', status: 'coming-soon', sprint: 'DO-41' },
                { id: 'do-42', title: 'Git Tips, Tricks & Dark Arts', type: 'module', status: 'coming-soon', sprint: 'DO-42' }
            ]
        },

        // =================================================================
        // INFRASTRUCTURE — Docker
        // =================================================================
        {
            id: 'docker',
            name: 'Docker',
            track: 'infrastructure',
            icon: '../../../assets/images/icons/icon-docker.webp',
            description: 'Containerization from first pull to production — images, Compose, networking, volumes, and security.',
            color: '#3b82f6',
            modules: [
                { id: 'do-17', title: 'Docker Fundamentals — Containers & Images', type: 'module', status: 'coming-soon', sprint: 'DO-17' },
                { id: 'do-48', title: 'Dockerfile Deep Dive', type: 'module', status: 'coming-soon', sprint: 'DO-48' },
                { id: 'do-49', title: 'Docker CLI Mastery', type: 'module', status: 'coming-soon', sprint: 'DO-49' },
                { id: 'do-50', title: 'Images & Registries', type: 'module', status: 'coming-soon', sprint: 'DO-50' },
                { id: 'do-51', title: 'Docker Compose — Multi-Container Apps', type: 'module', status: 'coming-soon', sprint: 'DO-51' },
                { id: 'do-52', title: 'Docker Networking', type: 'module', status: 'coming-soon', sprint: 'DO-52' },
                { id: 'do-53', title: 'Docker Volumes & Storage', type: 'module', status: 'coming-soon', sprint: 'DO-53' },
                { id: 'do-54', title: 'Docker Security & Best Practices', type: 'module', status: 'coming-soon', sprint: 'DO-54' },
                { id: 'do-55', title: 'Real-World Docker Patterns', type: 'module', status: 'coming-soon', sprint: 'DO-55' },
                { id: 'do-18', title: 'Docker Lab — Build & Deploy', type: 'lab', status: 'coming-soon', sprint: 'DO-18' },
                { id: 'do-56', title: 'Docker Tips, Tricks & Dark Arts', type: 'module', status: 'coming-soon', sprint: 'DO-56' }
            ]
        },

        // =================================================================
        // INFRASTRUCTURE — Kubernetes
        // =================================================================
        {
            id: 'kubernetes',
            name: 'Kubernetes',
            track: 'infrastructure',
            icon: '../../../assets/images/icons/icon-kubernetes.webp',
            description: 'Container orchestration — pods, deployments, services, scaling, Helm, and production operations.',
            color: '#3b82f6',
            modules: [
                { id: 'do-19', title: 'Why Kubernetes? — Orchestration Fundamentals', type: 'module', status: 'coming-soon', sprint: 'DO-19' },
                { id: 'do-57', title: 'Pods & Deployments', type: 'module', status: 'coming-soon', sprint: 'DO-57' },
                { id: 'do-58', title: 'kubectl Mastery', type: 'module', status: 'coming-soon', sprint: 'DO-58' },
                { id: 'do-59', title: 'Services & Networking', type: 'module', status: 'coming-soon', sprint: 'DO-59' },
                { id: 'do-60', title: 'ConfigMaps & Secrets', type: 'module', status: 'coming-soon', sprint: 'DO-60' },
                { id: 'do-61', title: 'Scaling & Self-Healing', type: 'module', status: 'coming-soon', sprint: 'DO-61' },
                { id: 'do-62', title: 'Persistent Storage', type: 'module', status: 'coming-soon', sprint: 'DO-62' },
                { id: 'do-63', title: 'RBAC & Security', type: 'module', status: 'coming-soon', sprint: 'DO-63' },
                { id: 'do-64', title: 'Helm — Package Management', type: 'module', status: 'coming-soon', sprint: 'DO-64' },
                { id: 'do-65', title: 'Monitoring & Observability', type: 'module', status: 'coming-soon', sprint: 'DO-65' },
                { id: 'do-66', title: 'Real-World K8s Patterns', type: 'module', status: 'coming-soon', sprint: 'DO-66' },
                { id: 'do-20', title: 'Kubernetes Lab — Deploy a Cluster', type: 'lab', status: 'coming-soon', sprint: 'DO-20' },
                { id: 'do-67', title: 'K8s Tips, Tricks & Dark Arts', type: 'module', status: 'coming-soon', sprint: 'DO-67' }
            ]
        },

        // =================================================================
        // INFRASTRUCTURE — CI/CD
        // =================================================================
        {
            id: 'cicd',
            name: 'CI/CD Pipelines',
            track: 'infrastructure',
            icon: '../../../assets/images/icons/icon-controls.webp',
            description: 'Continuous Integration and Deployment — GitHub Actions, testing, deployment strategies, and monitoring.',
            color: '#3b82f6',
            modules: [
                { id: 'do-70', title: 'CI/CD Fundamentals — Why Automate Everything', type: 'module', status: 'coming-soon', sprint: 'DO-70' },
                { id: 'do-71', title: 'Pipeline Architecture — Stages, Jobs & Dependencies', type: 'module', status: 'coming-soon', sprint: 'DO-71' },
                { id: 'do-72', title: 'Testing in Pipelines — Quality Gates & Coverage', type: 'module', status: 'coming-soon', sprint: 'DO-72' },
                { id: 'do-73', title: 'Build & Artifact Management', type: 'module', status: 'coming-soon', sprint: 'DO-73' },
                { id: 'do-74', title: 'Deployment Strategies — Zero-Downtime Releases', type: 'module', status: 'coming-soon', sprint: 'DO-74' },
                { id: 'do-75', title: 'Secrets & Environment Management', type: 'module', status: 'coming-soon', sprint: 'DO-75' },
                { id: 'do-76', title: 'CI/CD Platforms — GitLab CI, Jenkins & Beyond', type: 'module', status: 'coming-soon', sprint: 'DO-76' },
                { id: 'do-21', title: 'GitHub Actions Deep Dive', type: 'module', status: 'coming-soon', sprint: 'DO-21' },
                { id: 'do-22', title: 'CI/CD Capstone Lab', type: 'lab', status: 'coming-soon', sprint: 'DO-22' },
                { id: 'do-77', title: 'Pipeline Monitoring & Observability', type: 'module', status: 'coming-soon', sprint: 'DO-77' },
                { id: 'do-78', title: 'CI/CD Tips, Tricks & Battle Scars', type: 'module', status: 'coming-soon', sprint: 'DO-78' }
            ]
        },

        // =================================================================
        // INFRASTRUCTURE — Infrastructure as Code
        // =================================================================
        {
            id: 'iac',
            name: 'Infrastructure as Code',
            track: 'infrastructure',
            icon: '../../../assets/images/icons/icon-construction.webp',
            description: 'Terraform, Ansible provisioning, state management, modules, testing, and GitOps workflows.',
            color: '#3b82f6',
            modules: [
                { id: 'do-79', title: 'IaC Fundamentals — Why Code Your Cloud', type: 'module', status: 'coming-soon', sprint: 'DO-79' },
                { id: 'do-23', title: 'Terraform Deep Dive — HCL & Resources', type: 'module', status: 'coming-soon', sprint: 'DO-23' },
                { id: 'do-80', title: 'Terraform State — The Source of Truth', type: 'module', status: 'coming-soon', sprint: 'DO-80' },
                { id: 'do-81', title: 'Terraform Modules — Reusable Infrastructure', type: 'module', status: 'coming-soon', sprint: 'DO-81' },
                { id: 'do-84', title: 'IaC Platforms — CloudFormation, Pulumi & CDK', type: 'module', status: 'coming-soon', sprint: 'DO-84' },
                { id: 'do-85', title: 'IaC Testing & Policy — Validate Before You Apply', type: 'module', status: 'coming-soon', sprint: 'DO-85' },
                { id: 'do-86', title: 'GitOps for Infrastructure', type: 'module', status: 'coming-soon', sprint: 'DO-86' },
                { id: 'do-24', title: 'IaC Capstone Lab — Provision & Configure', type: 'lab', status: 'coming-soon', sprint: 'DO-24' },
                { id: 'do-87', title: 'IaC Tips, Tricks & War Stories', type: 'module', status: 'coming-soon', sprint: 'DO-87' }
            ]
        },

        // =================================================================
        // AUTOMATION — Ansible Track
        // =================================================================
        {
            id: 'ansible',
            name: 'Ansible Track',
            track: 'automation',
            icon: '../../../assets/images/icons/icon-robot.webp',
            description: 'Agentless automation mastery — inventory, playbooks, roles, vault, AWX, and real-world patterns.',
            color: '#f59e0b',
            modules: [
                { id: 'do-83', title: 'Automation Landscape — Ansible, Chef, Puppet & Salt', type: 'module', status: 'coming-soon', sprint: 'DO-83' },
                { id: 'do-82', title: 'Ansible Fundamentals — Agentless Automation', type: 'module', status: 'coming-soon', sprint: 'DO-82' },
                { id: 'do-88', title: 'Ansible Inventory — Know Your Fleet', type: 'module', status: 'coming-soon', sprint: 'DO-88' },
                { id: 'do-89', title: 'Ansible Playbooks — Automating Everything', type: 'module', status: 'coming-soon', sprint: 'DO-89' },
                { id: 'do-90', title: 'Ansible Modules & Collections', type: 'module', status: 'coming-soon', sprint: 'DO-90' },
                { id: 'do-91', title: 'Ansible Roles — Reusable Automation', type: 'module', status: 'coming-soon', sprint: 'DO-91' },
                { id: 'do-92', title: 'Variables & Facts — Data-Driven Automation', type: 'module', status: 'coming-soon', sprint: 'DO-92' },
                { id: 'do-93', title: 'Templates & Jinja2', type: 'module', status: 'coming-soon', sprint: 'DO-93' },
                { id: 'do-94', title: 'Ansible Vault — Secrets Management', type: 'module', status: 'coming-soon', sprint: 'DO-94' },
                { id: 'do-95', title: 'AWX & Automation Platform', type: 'module', status: 'coming-soon', sprint: 'DO-95' },
                { id: 'do-96', title: 'Ansible for Cloud & Networking', type: 'module', status: 'coming-soon', sprint: 'DO-96' },
                { id: 'do-97', title: 'Testing & CI Integration', type: 'module', status: 'coming-soon', sprint: 'DO-97' },
                { id: 'do-98', title: 'Real-World Patterns & Lab', type: 'lab', status: 'coming-soon', sprint: 'DO-98' },
                { id: 'do-99', title: 'Ansible Tips, Tricks & Dark Arts', type: 'module', status: 'coming-soon', sprint: 'DO-99' }
            ]
        },

        // =================================================================
        // MASTERY — Culture & Practice
        // =================================================================
        {
            id: 'culture',
            name: 'Culture & Practice',
            track: 'mastery',
            icon: '../../../assets/images/icons/icon-users.webp',
            description: 'The human side of DevOps — collaboration, post-mortems, SRE, and organizational transformation.',
            color: '#8b5cf6',
            modules: [
                { id: 'do-25', title: 'DevOps Culture — Teams, Communication & Blameless Post-Mortems', type: 'module', status: 'coming-soon', sprint: 'DO-25' }
            ]
        },

        // =================================================================
        // MASTERY — Assessments
        // =================================================================
        {
            id: 'assessments',
            name: 'Assessments',
            track: 'mastery',
            icon: '../../../assets/images/icons/icon-clipboard.webp',
            description: 'Quizzes, review games, and knowledge checks across all DevOps domains.',
            color: '#8b5cf6',
            modules: [
                { id: 'do-26', title: 'DevOps Fundamentals Quiz', type: 'quiz', status: 'coming-soon', sprint: 'DO-26' },
                { id: 'do-27', title: 'CI/CD & IaC Quiz', type: 'quiz', status: 'coming-soon', sprint: 'DO-27' },
                { id: 'do-28', title: 'DevOps Jeopardy Review', type: 'game', status: 'coming-soon', sprint: 'DO-28' }
            ]
        },

        // =================================================================
        // MASTERY — Cert Prep
        // =================================================================
        {
            id: 'certprep',
            name: 'Certification Prep',
            track: 'mastery',
            icon: '../../../assets/images/icons/icon-graduation.webp',
            description: 'Certification alignment — map your progress to industry certifications.',
            color: '#8b5cf6',
            modules: [
                { id: 'do-29', title: 'Cert Alignment — AWS, Azure, CKA, Terraform', type: 'module', status: 'coming-soon', sprint: 'DO-29' }
            ]
        }
    ],

    // -------------------------------------------------------------------------
    // Helper methods
    // -------------------------------------------------------------------------

    /** Get all sections belonging to a track. */
    getTrackSections(trackId) {
        const track = this.tracks.find(t => t.id === trackId);
        if (!track) return [];
        return this.sections.filter(s => track.sections.includes(s.id));
    },

    /** Get a section by its id. */
    getSection(sectionId) {
        return this.sections.find(s => s.id === sectionId) || null;
    },

    /** Get total module count across all sections. */
    getTotalModules() {
        return this.sections.reduce((sum, s) => sum + s.modules.length, 0);
    },

    /** Get completed count from a progress object. */
    getCompletedCount(progress) {
        return Object.keys(progress).filter(k => progress[k]).length;
    },

    /** Get section completion stats. */
    getSectionStats(sectionId, progress) {
        const section = this.getSection(sectionId);
        if (!section) return { total: 0, completed: 0, pct: 0 };
        const total = section.modules.length;
        const completed = section.modules.filter(m => progress[m.id]).length;
        return { total, completed, pct: total > 0 ? Math.round((completed / total) * 100) : 0 };
    },

    /** Get track completion stats. */
    getTrackStats(trackId, progress) {
        const sections = this.getTrackSections(trackId);
        const allModules = sections.flatMap(s => s.modules);
        const total = allModules.length;
        const completed = allModules.filter(m => progress[m.id]).length;
        return { total, completed, pct: total > 0 ? Math.round((completed / total) * 100) : 0 };
    }
};
