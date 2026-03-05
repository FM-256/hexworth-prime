/**
 * ProjectsData.js — Hexworth Prime Projects Hub
 *
 * Central data store for all house projects. Each house has one capstone
 * project with difficulty, estimated time, and XP reward.
 *
 * Usage:
 *   ProjectsData.get('script-system-monitor')
 *   ProjectsData.getByHouse('shield')
 *   ProjectsData.getByDifficulty('beginner')
 */

const ProjectsData = {

    version: '1.0.0',

    // -------------------------------------------------------------------------
    // Difficulty tiers — color, label, and XP reward per tier.
    // -------------------------------------------------------------------------
    difficulties: {
        beginner:   { label: 'Beginner',   color: '#4ade80', xp: 250  },
        journeyman: { label: 'Journeyman', color: '#facc15', xp: 500  },
        advanced:   { label: 'Advanced',   color: '#f87171', xp: 1000 },
        pro:        { label: 'Pro',        color: '#c084fc', xp: 2000 }
    },

    // -------------------------------------------------------------------------
    // House metadata — name, icon, colors, and domain label.
    // Colors pulled from house-palette.js (single source of truth).
    // -------------------------------------------------------------------------
    houses: {
        script: {
            name: 'Script House',
            icon: '/assets/images/icons/icon-scroll.webp',
            primary: '#a78bfa',
            glow: 'rgba(167, 139, 250, 0.3)',
            domain: 'Scripting & Automation'
        },
        shield: {
            name: 'Shield House',
            icon: '/assets/images/icons/icon-shield.webp',
            primary: '#f87171',
            glow: 'rgba(248, 113, 113, 0.3)',
            domain: 'Defensive Security'
        },
        'dark-arts': {
            name: 'Dark Arts',
            icon: '/assets/images/icons/icon-skull.webp',
            primary: '#9333ea',
            glow: 'rgba(147, 51, 234, 0.3)',
            domain: 'Offensive Security'
        },
        eye: {
            name: 'Eye House',
            icon: '/assets/images/icons/icon-detective.webp',
            primary: '#c084fc',
            glow: 'rgba(192, 132, 252, 0.3)',
            domain: 'Intelligence & Recon'
        },
        code: {
            name: 'Code House',
            icon: '/assets/images/icons/icon-laptop.webp',
            primary: '#4ade80',
            glow: 'rgba(74, 222, 128, 0.3)',
            domain: 'Software Development'
        },
        forge: {
            name: 'Forge House',
            icon: '/assets/images/icons/icon-tools.webp',
            primary: '#fbbf24',
            glow: 'rgba(251, 191, 36, 0.3)',
            domain: 'Hardware & Engineering'
        },
        web: {
            name: 'Web House',
            icon: '/assets/images/icons/icon-spiderweb.webp',
            primary: '#60a5fa',
            glow: 'rgba(96, 165, 250, 0.3)',
            domain: 'Networking'
        },
        cloud: {
            name: 'Cloud House',
            icon: '/assets/images/icons/icon-globe.webp',
            primary: '#38bdf8',
            glow: 'rgba(56, 189, 248, 0.3)',
            domain: 'Cloud & Infrastructure'
        },
        key: {
            name: 'Key House',
            icon: '/assets/images/icons/icon-key.webp',
            primary: '#f472b6',
            glow: 'rgba(244, 114, 182, 0.3)',
            domain: 'Cryptography'
        },
        ai: {
            name: 'AI House',
            icon: '/assets/images/icons/icon-robot.webp',
            primary: '#8b5cf6',
            glow: 'rgba(139, 92, 246, 0.3)',
            domain: 'Artificial Intelligence'
        },
        matrix: {
            name: 'Matrix House',
            icon: '/assets/images/icons/icon-matrix.webp',
            primary: '#00ff41',
            glow: 'rgba(0, 255, 65, 0.3)',
            domain: 'Data & Analysis'
        },
        divergent: {
            name: 'Divergent House',
            icon: '/assets/images/icons/icon-lightning.webp',
            primary: '#ff00ff',
            glow: 'rgba(255, 0, 255, 0.4)',
            domain: 'Cross-Domain'
        }
    },

    // -------------------------------------------------------------------------
    // Project definitions — one per house, 12 total.
    // -------------------------------------------------------------------------
    projects: [
        {
            id: 'script-system-monitor',
            house: 'script',
            title: 'Build a System Monitor Dashboard in Bash',
            description: 'Create a live-updating terminal dashboard that displays CPU, memory, disk, and process stats using pure Bash scripting.',
            difficulty: 'beginner',
            minutes: 60,
            xp: 250
        },
        {
            id: 'shield-log-analyzer',
            house: 'shield',
            title: 'Build a Log Analyzer',
            description: 'Parse and correlate security logs from multiple sources to detect suspicious patterns and generate incident summaries.',
            difficulty: 'journeyman',
            minutes: 90,
            xp: 500
        },
        {
            id: 'darkarts-port-scanner',
            house: 'dark-arts',
            title: 'Build a Port Scanner in Python',
            description: 'Write a multi-threaded port scanner that identifies open services, grabs banners, and outputs structured results.',
            difficulty: 'beginner',
            minutes: 60,
            xp: 250
        },
        {
            id: 'eye-osint-dashboard',
            house: 'eye',
            title: 'Build an OSINT Recon Dashboard',
            description: 'Aggregate open-source intelligence from multiple APIs into a unified dashboard for target reconnaissance.',
            difficulty: 'journeyman',
            minutes: 90,
            xp: 500
        },
        {
            id: 'code-cli-task-manager',
            house: 'code',
            title: 'Build a CLI Task Manager',
            description: 'Design a command-line task tracker with priorities, due dates, tags, and persistent JSON storage.',
            difficulty: 'beginner',
            minutes: 45,
            xp: 250
        },
        {
            id: 'forge-flashcard-engine',
            house: 'forge',
            title: 'Build a Flashcard Study Engine',
            description: 'Implement a spaced-repetition flashcard system with deck management, scoring, and progress tracking.',
            difficulty: 'beginner',
            minutes: 60,
            xp: 250
        },
        {
            id: 'web-topology-visualizer',
            house: 'web',
            title: 'Build a Network Topology Visualizer',
            description: 'Render interactive network maps from device data, showing connections, traffic flow, and node status in real time.',
            difficulty: 'journeyman',
            minutes: 120,
            xp: 500
        },
        {
            id: 'cloud-container-checker',
            house: 'cloud',
            title: 'Build a Container Health Checker',
            description: 'Monitor Docker containers for health status, resource usage, and restart policies with alerting and dashboards.',
            difficulty: 'journeyman',
            minutes: 90,
            xp: 500
        },
        {
            id: 'key-password-vault',
            house: 'key',
            title: 'Build a Password Vault',
            description: 'Create an encrypted password manager with AES-256 encryption, master key derivation, and secure clipboard integration.',
            difficulty: 'advanced',
            minutes: 120,
            xp: 1000
        },
        {
            id: 'ai-threat-classifier',
            house: 'ai',
            title: 'Build a Threat Classification Bot',
            description: 'Train a classifier that categorizes security alerts by severity, type, and recommended response using ML techniques.',
            difficulty: 'journeyman',
            minutes: 90,
            xp: 500
        },
        {
            id: 'matrix-packet-visualizer',
            house: 'matrix',
            title: 'Build a Packet Visualizer',
            description: 'Capture and visualize network packets in real time, decoding headers and displaying protocol hierarchies.',
            difficulty: 'advanced',
            minutes: 120,
            xp: 1000
        },
        {
            id: 'divergent-multi-tool',
            house: 'divergent',
            title: 'Build a Multi-Tool Swiss Army CLI',
            description: 'Engineer a modular CLI framework with pluggable subcommands spanning networking, crypto, forensics, and automation.',
            difficulty: 'pro',
            minutes: 150,
            xp: 2000
        }
    ],

    // -------------------------------------------------------------------------
    // Helper methods
    // -------------------------------------------------------------------------

    /** Get a project by ID. */
    get(id) {
        return this.projects.find(p => p.id === id) || null;
    },

    /** Get all projects for a house. */
    getByHouse(houseId) {
        return this.projects.filter(p => p.house === houseId);
    },

    /** Get all projects at a difficulty tier. */
    getByDifficulty(diff) {
        return this.projects.filter(p => p.difficulty === diff);
    },

    /** Get house metadata. */
    getHouse(id) {
        return this.houses[id] || null;
    },

    /** Get difficulty metadata. */
    getDifficulty(id) {
        return this.difficulties[id] || null;
    },

    /** Get all projects. */
    getAll() {
        return this.projects;
    },

    /** Get all house IDs in display order. */
    getHouseIds() {
        return Object.keys(this.houses);
    },

    /** Sum of all project XP. */
    getTotalXP() {
        return this.projects.reduce((sum, p) => sum + p.xp, 0);
    },

    /** Total project count. */
    getCount() {
        return this.projects.length;
    }
};
