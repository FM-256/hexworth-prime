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
                { id: 'do-1', title: 'What is DevOps?', type: 'module', status: 'ready', sprint: 'DO-1', href: 'do-1-what-is-devops.html' },
                { id: 'do-2', title: 'The DevOps Toolchain', type: 'module', status: 'ready', sprint: 'DO-2', href: 'do-2-devops-toolchain.html' },
                { id: 'do-3', title: 'DevOps in Practice — Real-World Pipelines', type: 'module', status: 'ready', sprint: 'DO-3', href: 'do-3-real-world-pipelines.html' },
                { id: 'do-68', title: 'Data Formats — YAML, JSON, TOML', type: 'module', status: 'ready', sprint: 'DO-68', href: 'do-68-data-formats.html' },
                { id: 'do-69', title: 'Config Formats — XML, INI, ENV, HCL', type: 'module', status: 'ready', sprint: 'DO-69', href: 'do-69-config-formats.html' }
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
                { id: 'do-30', title: 'OS & Shell Setup', type: 'module', status: 'ready', sprint: 'DO-30', href: 'do-30-os-shell-setup.html' },
                { id: 'do-31', title: 'SSH, GPG & Dotfiles', type: 'module', status: 'ready', sprint: 'DO-31', href: 'do-31-ssh-gpg-dotfiles.html' },
                { id: 'do-32', title: 'Runtime Management — nvm, pyenv, rbenv', type: 'module', status: 'ready', sprint: 'DO-32', href: 'do-32-runtime-management.html' },
                { id: 'do-33', title: 'Environment Variables & Secrets', type: 'module', status: 'ready', sprint: 'DO-33', href: 'do-33-env-vars-secrets.html' },
                { id: 'do-34', title: 'Dev Containers & Reproducible Environments', type: 'module', status: 'ready', sprint: 'DO-34', href: 'do-34-dev-containers.html' },
                { id: 'do-35', title: 'Networking Basics for DevOps', type: 'module', status: 'ready', sprint: 'DO-35', href: 'do-35-networking-basics.html' }
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
                { id: 'do-4', title: 'VS Code — Interface & Core Features', type: 'module', status: 'ready', sprint: 'DO-4', href: 'do-4-vscode-interface.html' },
                { id: 'do-5', title: 'VS Code — Git Integration', type: 'module', status: 'ready', sprint: 'DO-5', href: 'do-5-vscode-git.html' },
                { id: 'do-6', title: 'VS Code — Debugging & Tasks', type: 'module', status: 'ready', sprint: 'DO-6', href: 'do-6-vscode-debugging.html' },
                { id: 'do-43', title: 'File Management & Project Structure', type: 'module', status: 'ready', sprint: 'DO-43', href: 'do-43-file-management.html' },
                { id: 'do-44', title: 'File Types, Extensions & Language Support', type: 'module', status: 'ready', sprint: 'DO-44', href: 'do-44-file-types.html' },
                { id: 'do-45', title: 'Remote Development — SSH, WSL, Containers', type: 'module', status: 'ready', sprint: 'DO-45', href: 'do-45-remote-dev.html' },
                { id: 'do-46', title: 'DevOps Extensions Toolkit', type: 'module', status: 'ready', sprint: 'DO-46', href: 'do-46-devops-extensions.html' },
                { id: 'do-47', title: 'VS Code Tips, Tricks & Shortcuts', type: 'module', status: 'ready', sprint: 'DO-47', href: 'do-47-vscode-tips.html' }
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
                { id: 'do-9', title: 'Remote Repos — Push, Pull, Fetch', type: 'module', status: 'ready', sprint: 'DO-9', href: 'do-9-remote-repos.html' },
                { id: 'do-10', title: 'Branching Strategies & Workflows', type: 'module', status: 'ready', sprint: 'DO-10', href: 'do-10-branching-strategies.html' },
                { id: 'do-11', title: 'Merge Conflicts — Detect, Resolve, Prevent', type: 'module', status: 'ready', sprint: 'DO-11', href: 'do-11-merge-conflicts.html' },
                { id: 'do-12', title: 'Rebasing & Interactive Rebase', type: 'module', status: 'ready', sprint: 'DO-12', href: 'do-12-rebasing.html' },
                { id: 'do-13', title: 'Stashing, Tagging & Cherry-Picking', type: 'module', status: 'ready', sprint: 'DO-13', href: 'do-13-stashing-tagging.html' },
                { id: 'do-14', title: 'Git Hooks & Automation', type: 'module', status: 'ready', sprint: 'DO-14', href: 'do-14-git-hooks.html' },
                { id: 'do-15', title: 'Git Internals — Objects, Refs, the DAG', type: 'module', status: 'ready', sprint: 'DO-15', href: 'do-15-git-internals.html' },
                { id: 'do-16', title: 'Git Lab — Real-World Scenarios', type: 'lab', status: 'ready', sprint: 'DO-16', href: 'do-16-git-lab.html' },
                { id: 'do-36', title: 'Repository Anatomy — Inside .git/', type: 'module', status: 'ready', sprint: 'DO-36', href: 'do-36-repo-anatomy.html' },
                { id: 'do-37', title: 'Forks, Upstream & Open-Source Workflows', type: 'module', status: 'ready', sprint: 'DO-37', href: 'do-37-forks-upstream.html' },
                { id: 'do-38', title: 'GitHub Features — Issues, PRs, Actions, Projects', type: 'module', status: 'ready', sprint: 'DO-38', href: 'do-38-github-features.html' },
                { id: 'do-39', title: '.gitignore, README & LICENSE Conventions', type: 'module', status: 'ready', sprint: 'DO-39', href: 'do-39-gitignore-readme.html' },
                { id: 'do-40', title: 'Diff & Comparing Changes', type: 'module', status: 'ready', sprint: 'DO-40', href: 'do-40-diff-comparing.html' },
                { id: 'do-41', title: 'Undoing Things — Reset, Revert, Restore', type: 'module', status: 'ready', sprint: 'DO-41', href: 'do-41-undoing-things.html' },
                { id: 'do-42', title: 'Git Tips, Tricks & Dark Arts', type: 'module', status: 'ready', sprint: 'DO-42', href: 'do-42-git-tips-tricks.html' }
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
                { id: 'do-17', title: 'Docker Fundamentals — Containers & Images', type: 'module', status: 'ready', sprint: 'DO-17', href: 'do-17-docker-fundamentals.html' },
                { id: 'do-48', title: 'Dockerfile Deep Dive', type: 'module', status: 'ready', sprint: 'DO-48', href: 'do-48-dockerfile.html' },
                { id: 'do-49', title: 'Docker CLI Mastery', type: 'module', status: 'ready', sprint: 'DO-49', href: 'do-49-docker-cli.html' },
                { id: 'do-50', title: 'Images & Registries', type: 'module', status: 'ready', sprint: 'DO-50', href: 'do-50-images-registries.html' },
                { id: 'do-51', title: 'Docker Compose — Multi-Container Apps', type: 'module', status: 'ready', sprint: 'DO-51', href: 'do-51-docker-compose.html' },
                { id: 'do-52', title: 'Docker Networking', type: 'module', status: 'ready', sprint: 'DO-52', href: 'do-52-docker-networking.html' },
                { id: 'do-53', title: 'Docker Volumes & Storage', type: 'module', status: 'ready', sprint: 'DO-53', href: 'do-53-docker-volumes.html' },
                { id: 'do-54', title: 'Docker Security & Best Practices', type: 'module', status: 'ready', sprint: 'DO-54', href: 'do-54-docker-security.html' },
                { id: 'do-55', title: 'Real-World Docker Patterns', type: 'module', status: 'ready', sprint: 'DO-55', href: 'do-55-docker-patterns.html' },
                { id: 'do-18', title: 'Docker Lab — Build & Deploy', type: 'lab', status: 'ready', sprint: 'DO-18', href: 'do-18-docker-lab.html' },
                { id: 'do-56', title: 'Docker Tips, Tricks & Dark Arts', type: 'module', status: 'ready', sprint: 'DO-56', href: 'do-56-docker-tips.html' }
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
                { id: 'do-19', title: 'Why Kubernetes? — Orchestration Fundamentals', type: 'module', status: 'ready', sprint: 'DO-19', href: 'do-19-k8s-fundamentals.html' },
                { id: 'do-57', title: 'Pods & Deployments', type: 'module', status: 'ready', sprint: 'DO-57', href: 'do-57-pods-deployments.html' },
                { id: 'do-58', title: 'kubectl Mastery', type: 'module', status: 'ready', sprint: 'DO-58', href: 'do-58-kubectl.html' },
                { id: 'do-59', title: 'Services & Networking', type: 'module', status: 'ready', sprint: 'DO-59', href: 'do-59-services-networking.html' },
                { id: 'do-60', title: 'ConfigMaps & Secrets', type: 'module', status: 'ready', sprint: 'DO-60', href: 'do-60-configmaps-secrets.html' },
                { id: 'do-61', title: 'Scaling & Self-Healing', type: 'module', status: 'ready', sprint: 'DO-61', href: 'do-61-scaling.html' },
                { id: 'do-62', title: 'Persistent Storage', type: 'module', status: 'ready', sprint: 'DO-62', href: 'do-62-storage.html' },
                { id: 'do-63', title: 'RBAC & Security', type: 'module', status: 'ready', sprint: 'DO-63', href: 'do-63-rbac-security.html' },
                { id: 'do-64', title: 'Helm — Package Management', type: 'module', status: 'ready', sprint: 'DO-64', href: 'do-64-helm.html' },
                { id: 'do-65', title: 'Monitoring & Observability', type: 'module', status: 'ready', sprint: 'DO-65', href: 'do-65-monitoring.html' },
                { id: 'do-66', title: 'Real-World K8s Patterns', type: 'module', status: 'ready', sprint: 'DO-66', href: 'do-66-k8s-patterns.html' },
                { id: 'do-20', title: 'Kubernetes Lab — Deploy a Cluster', type: 'lab', status: 'ready', sprint: 'DO-20', href: 'do-20-k8s-lab.html' },
                { id: 'do-67', title: 'K8s Tips, Tricks & Dark Arts', type: 'module', status: 'ready', sprint: 'DO-67', href: 'do-67-k8s-tips.html' }
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
                { id: 'do-70', title: 'CI/CD Fundamentals — Why Automate Everything', type: 'module', status: 'ready', sprint: 'DO-70', href: 'do-70-cicd-fundamentals.html' },
                { id: 'do-71', title: 'Pipeline Architecture — Stages, Jobs & Dependencies', type: 'module', status: 'ready', sprint: 'DO-71', href: 'do-71-pipeline-architecture.html' },
                { id: 'do-72', title: 'Testing in Pipelines — Quality Gates & Coverage', type: 'module', status: 'ready', sprint: 'DO-72', href: 'do-72-testing-pipelines.html' },
                { id: 'do-73', title: 'Build & Artifact Management', type: 'module', status: 'ready', sprint: 'DO-73', href: 'do-73-build-artifacts.html' },
                { id: 'do-74', title: 'Deployment Strategies — Zero-Downtime Releases', type: 'module', status: 'ready', sprint: 'DO-74', href: 'do-74-deployment-strategies.html' },
                { id: 'do-75', title: 'Secrets & Environment Management', type: 'module', status: 'ready', sprint: 'DO-75', href: 'do-75-secrets-environments.html' },
                { id: 'do-76', title: 'CI/CD Platforms — GitLab CI, Jenkins & Beyond', type: 'module', status: 'ready', sprint: 'DO-76', href: 'do-76-cicd-platforms.html' },
                { id: 'do-21', title: 'GitHub Actions Deep Dive', type: 'module', status: 'ready', sprint: 'DO-21', href: 'do-21-github-actions.html' },
                { id: 'do-22', title: 'CI/CD Capstone Lab', type: 'lab', status: 'ready', sprint: 'DO-22', href: 'do-22-cicd-lab.html' },
                { id: 'do-77', title: 'Pipeline Monitoring & Observability', type: 'module', status: 'ready', sprint: 'DO-77', href: 'do-77-pipeline-monitoring.html' },
                { id: 'do-78', title: 'CI/CD Tips, Tricks & Battle Scars', type: 'module', status: 'ready', sprint: 'DO-78', href: 'do-78-cicd-tips.html' }
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
                { id: 'do-79', title: 'IaC Fundamentals — Why Code Your Cloud', type: 'module', status: 'ready', sprint: 'DO-79', href: 'do-79-iac-fundamentals.html' },
                { id: 'do-23', title: 'Terraform Deep Dive — HCL & Resources', type: 'module', status: 'ready', sprint: 'DO-23', href: 'do-23-terraform.html' },
                { id: 'do-80', title: 'Terraform State — The Source of Truth', type: 'module', status: 'ready', sprint: 'DO-80', href: 'do-80-terraform-state.html' },
                { id: 'do-81', title: 'Terraform Modules — Reusable Infrastructure', type: 'module', status: 'ready', sprint: 'DO-81', href: 'do-81-terraform-modules.html' },
                { id: 'do-84', title: 'IaC Platforms — CloudFormation, Pulumi & CDK', type: 'module', status: 'ready', sprint: 'DO-84', href: 'do-84-iac-platforms.html' },
                { id: 'do-85', title: 'IaC Testing & Policy — Validate Before You Apply', type: 'module', status: 'ready', sprint: 'DO-85', href: 'do-85-iac-testing.html' },
                { id: 'do-86', title: 'GitOps for Infrastructure', type: 'module', status: 'ready', sprint: 'DO-86', href: 'do-86-gitops-infrastructure.html' },
                { id: 'do-24', title: 'IaC Capstone Lab — Provision & Configure', type: 'lab', status: 'ready', sprint: 'DO-24', href: 'do-24-iac-lab.html' },
                { id: 'do-87', title: 'IaC Tips, Tricks & War Stories', type: 'module', status: 'ready', sprint: 'DO-87', href: 'do-87-iac-tips.html' }
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
