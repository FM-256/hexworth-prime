/**
 * ProjectsData.js — Hexworth Prime Projects Hub
 *
 * Central data store for all house projects. Each house has one capstone
 * project with difficulty, estimated time, and XP reward.
 *
 * Each project: { id, house, title, description, difficulty, minutes, xp }.
 * Optional enrichment fields (P2, additive — absent on un-backfilled projects):
 *   technologies: string[]   — tech stack shown on the card / used for filtering
 *   skills:       string[]   — competencies the project builds
 *   prerequisites:string[]   — project ids that should be done first (mission-chain graph)
 *   careerRoles:  string[]   — career-role ids this project maps to (vocab finalized in P3)
 *   (unlocks is NOT stored — it is the computed inverse of prerequisites, via getUnlocks)
 *
 * Usage:
 *   ProjectsData.get('script-system-monitor')
 *   ProjectsData.getByHouse('shield')
 *   ProjectsData.getByDifficulty('beginner')
 *   ProjectsData.getByTechnology('Power Automate')
 *   ProjectsData.getPrerequisites('ai-build-your-department')
 *   ProjectsData.getUnlocks('starter-first-workflow')
 */

const ProjectsData = {

    version: '2.0.0',

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
    // Project definitions — 120 total (12 software + 16 hardware + 60 educative + 1 content + 18 "My First" starter + 1 AI capstone + 12 foundations/setup).
    // -------------------------------------------------------------------------
    projects: [
        // ── "My First..." Starter Series (18 projects) ──
        { id: 'starter-first-webpage',   house: 'web',        title: 'My First Web Page',    description: 'Create your very first web page from scratch using HTML and CSS.',                                    difficulty: 'beginner', minutes: 30, xp: 250 },
        { id: 'starter-first-app',       house: 'code',       title: 'My First App',         description: 'Build your first Python application — a personal quiz game that asks questions and keeps score.',     difficulty: 'beginner', minutes: 30, xp: 250 },
        { id: 'starter-first-gui',       house: 'code',       title: 'My First GUI',         description: 'Build your first graphical application using Python and tkinter — a click counter with buttons.',     difficulty: 'beginner', minutes: 45, xp: 250 },
        { id: 'starter-first-api',       house: 'code',       title: 'My First API',         description: 'Build your first web API with Python and Flask — create endpoints that return data and accept input.',difficulty: 'beginner', minutes: 30, xp: 250 },
        { id: 'starter-first-database',  house: 'code',       title: 'My First Database',    description: 'Create your first database, write SQL queries, and build a Python app that stores real data.',         difficulty: 'beginner', minutes: 45, xp: 250 },
        { id: 'starter-first-script',    house: 'script',     title: 'My First Script',      description: 'Write your first Bash script that organizes messy files into folders automatically.',                  difficulty: 'beginner', minutes: 30, xp: 250 },
        { id: 'starter-first-server',    house: 'cloud',      title: 'My First Server',      description: 'Spin up your first virtual machine, connect via SSH, and serve your first web page.',                 difficulty: 'beginner', minutes: 45, xp: 250 },
        { id: 'starter-first-container', house: 'cloud',      title: 'My First Container',   description: 'Run your first Docker container, build your first image, and understand why containers matter.',      difficulty: 'beginner', minutes: 30, xp: 250 },
        { id: 'starter-first-network',   house: 'web',        title: 'My First Network',     description: 'Discover your own network — find your IP, trace a route, and understand how data travels.',           difficulty: 'beginner', minutes: 30, xp: 250 },
        { id: 'starter-first-hack',      house: 'dark-arts',  title: 'My First Hack',        description: 'Complete your first ethical hacking challenge — scan, find, exploit, and capture the flag.',          difficulty: 'beginner', minutes: 45, xp: 250 },
        { id: 'starter-first-firewall',  house: 'shield',     title: 'My First Firewall',    description: 'Configure your first firewall rules — block traffic, allow services, and learn network defense.',     difficulty: 'beginner', minutes: 30, xp: 250 },
        { id: 'starter-first-scan',      house: 'eye',        title: 'My First Scan',        description: 'Use Nmap to scan your own network — discover hosts, identify services, see through a hacker\'s eyes.',difficulty: 'beginner', minutes: 30, xp: 250 },
        { id: 'starter-first-bot',       house: 'divergent',  title: 'My First Bot',         description: 'Build your first Discord bot that responds to commands, tells jokes, and runs in your server.',       difficulty: 'beginner', minutes: 45, xp: 250 },
        { id: 'starter-first-pipeline',  house: 'code',       title: 'My First Pipeline',    description: 'Set up your first CI/CD pipeline with GitHub Actions — every push automatically tests your code.',    difficulty: 'beginner', minutes: 30, xp: 250 },
        { id: 'starter-first-agent',     house: 'ai',         title: 'My First Agent',       description: 'Build your first AI agent in Copilot Studio — an adaptive Level 1-5 path from a talking study assistant to an autonomous operations agent.', difficulty: 'beginner', minutes: 30, xp: 250, technologies: ['Microsoft Copilot Studio'], skills: ['AI agents', 'prompt design', 'tool use', 'grounding'], prerequisites: [], careerRoles: ['ai-engineer', 'automation-specialist'] },
        { id: 'starter-first-workflow',  house: 'ai',         title: 'My First Workflow',    description: 'Build your first automated workflow in Power Automate — grow one Help-Desk Intake flow across an adaptive Level 1-5 path: trigger, branching, AI, approvals, scheduled ops.', difficulty: 'beginner', minutes: 30, xp: 250, technologies: ['Power Automate'], skills: ['workflow automation', 'triggers', 'branching', 'approvals'], prerequisites: [], careerRoles: ['automation-specialist', 'ai-engineer'] },
        { id: 'starter-first-knowledge-base', house: 'ai',    title: 'My First Knowledge Base', description: 'Build your first knowledge base in Copilot Studio — grow one Help-Desk KB across an adaptive Level 1-5 path: ingest, organize, retrieval quality, citations and grounding guardrails, freshness. Learn how RAG grounds an AI in your sources.', difficulty: 'beginner', minutes: 30, xp: 250, technologies: ['Microsoft Copilot Studio'], skills: ['RAG', 'retrieval', 'grounding', 'knowledge management'], prerequisites: [], careerRoles: ['ai-engineer'] },
        { id: 'starter-first-tool',      house: 'ai',         title: 'My First Tool',        description: 'Turn an agent from a talker into a doer — build one tool it can call and grow it across an adaptive Level 1-5 path: call a built-in action, wrap your own flow, input/output schemas, auth and guardrails, errors/retries/observability. The bridge between My First Agent and My First Workflow.', difficulty: 'beginner', minutes: 30, xp: 250, technologies: ['Microsoft Copilot Studio', 'Power Automate'], skills: ['function calling', 'custom connectors', 'API integration', 'auth and secrets'], prerequisites: ['starter-first-workflow'], careerRoles: ['ai-engineer'] },

        // ── AI Series Capstone (advanced — assembles the four "My First" AI rungs into one system) ──
        { id: 'ai-build-your-department', house: 'ai',        title: 'Build Your First Department', description: 'The AI series capstone — assemble the Agent, Workflow, Knowledge Base, and Tool you built into one self-running Help-Desk Department. Learn multi-agent orchestration across a Level 1-5 integration ladder: assemble the team, route the work, hand-offs and shared context, supervision and guardrails, operate and improve.', difficulty: 'advanced', minutes: 60, xp: 1000, technologies: ['Microsoft Copilot Studio', 'Power Automate'], skills: ['multi-agent orchestration', 'routing', 'supervision', 'observability'], prerequisites: ['starter-first-agent', 'starter-first-workflow', 'starter-first-knowledge-base', 'starter-first-tool'], careerRoles: ['ai-engineer', 'ai-solutions-architect'] },

        // ── Foundations & Setup (first VM / cloud / git / lab — registered 2026-06-13; XP preserved from each page, to be reconciled under the unified ladder at P6) ──
        { id: 'cloud-ec2-first-server',  house: 'cloud',      title: 'Launch Your First EC2 Instance', description: 'Launch your first AWS EC2 virtual server, connect over SSH, and serve a web page from the cloud.', difficulty: 'beginner', minutes: 60, xp: 250 },
        { id: 'cloud-oracle-free-vm',    house: 'cloud',      title: 'Spin Up a Free Oracle Cloud VM', description: 'Provision an always-free Oracle Cloud compute VM, connect via SSH, and run your first cloud workload at no cost.', difficulty: 'beginner', minutes: 45, xp: 200 },
        { id: 'cloud-s3-static-site',    house: 'cloud',      title: 'Host a Static Website on AWS S3', description: 'Host a static website on AWS S3 — create a bucket, upload your site, and serve it publicly over the web.', difficulty: 'beginner', minutes: 45, xp: 200 },
        { id: 'darkarts-kali-setup',     house: 'dark-arts',  title: 'Set Up Your Kali Linux Attack VM', description: 'Build your first Kali Linux attack VM — install, configure, and verify the offensive-security toolkit in a safe, isolated lab.', difficulty: 'beginner', minutes: 60, xp: 200 },
        { id: 'forge-home-lab',          house: 'forge',      title: 'Build a 3-VM Home Lab', description: 'Build a 3-VM home lab on an isolated network — router, server, and client — the foundation for hands-on security practice.', difficulty: 'journeyman', minutes: 180, xp: 500 },
        { id: 'forge-virtualbox-first-vm', house: 'forge',    title: 'Create Your First Virtual Machine', description: 'Create your first virtual machine in VirtualBox — install a guest OS, configure resources, and take your first snapshot.', difficulty: 'beginner', minutes: 60, xp: 200 },
        { id: 'forge-vmware-first-vm',   house: 'forge',      title: 'Build a VM with VMware Workstation', description: 'Build your first virtual machine in VMware Workstation — install a guest OS, configure networking, and manage snapshots.', difficulty: 'beginner', minutes: 60, xp: 200 },
        { id: 'shield-firewall-iptables', house: 'shield',    title: 'Build a Firewall with iptables', description: 'Build a working Linux firewall with iptables — write rules to allow services, block traffic, and defend a host.', difficulty: 'beginner', minutes: 60, xp: 250 },
        { id: 'starter-calculator',      house: 'code',       title: 'Build a Calculator App', description: 'Build your first calculator app — handle user input, perform arithmetic, and manage operations and errors.', difficulty: 'beginner', minutes: 60, xp: 200 },
        { id: 'starter-first-repo',      house: 'code',       title: 'Your First Git Repository', description: 'Create your first Git repository — initialize, commit, branch, and push your code to GitHub.', difficulty: 'beginner', minutes: 30, xp: 100 },
        { id: 'starter-github-profile',  house: 'code',       title: 'Create Your GitHub Profile README', description: 'Create a standout GitHub profile README — the special repository that introduces you to the developer world.', difficulty: 'beginner', minutes: 30, xp: 100 },
        { id: 'starter-portfolio-site',  house: 'web',        title: 'Build a Portfolio Website with GitHub Pages', description: 'Build and publish a personal portfolio website for free with GitHub Pages — show your projects to the world.', difficulty: 'beginner', minutes: 120, xp: 300 },

        // ── Featured Projects ──
        {
            id: 'divergent-faceless-youtube',
            house: 'divergent',
            title: 'Build a Faceless YouTube Channel',
            description: 'Design, build, and launch a faceless YouTube channel from scratch — from niche selection and AI-powered content creation to SEO optimization and monetization strategy.',
            difficulty: 'advanced',
            minutes: 180,
            xp: 1000
        },
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
        },

        // ── Hardware Projects: Raspberry Pi ──────────────────────────────────
        {
            id: 'script-pi-automation',
            house: 'script',
            title: 'Build a Pi Automation Hub',
            description: 'Transform a headless Raspberry Pi into an autonomous automation hub with cron jobs, GPIO triggers, health monitoring, and alert notifications.',
            difficulty: 'beginner',
            minutes: 60,
            xp: 250
        },
        {
            id: 'web-pi-network-probe',
            house: 'web',
            title: 'Build a Pi Network Probe',
            description: 'Deploy a Raspberry Pi as a network monitoring station with ping sweeps, port checks, uptime logging, and a live Flask dashboard.',
            difficulty: 'journeyman',
            minutes: 90,
            xp: 500
        },
        {
            id: 'cloud-pi-homelab',
            house: 'cloud',
            title: 'Build a Pi Home Lab Server',
            description: 'Run a Docker-based home lab on a Raspberry Pi with Pi-hole DNS filtering, Portainer management, and Nginx reverse proxy with SSL.',
            difficulty: 'journeyman',
            minutes: 120,
            xp: 500
        },
        {
            id: 'shield-pi-ids',
            house: 'shield',
            title: 'Build a Pi Network IDS',
            description: 'Deploy a Raspberry Pi as a passive intrusion detection system using Suricata with custom alert dashboards and automated iptables blocking.',
            difficulty: 'advanced',
            minutes: 120,
            xp: 1000
        },

        // ── Hardware Projects: ELEGOO Mega R3 Kit ────────────────────────────
        {
            id: 'forge-sensor-dashboard',
            house: 'forge',
            title: 'Build a Sensor Dashboard',
            description: 'Wire DHT11, ultrasonic, and photoresistor sensors to an Arduino Mega with an LCD multi-screen dashboard and LED threshold alerts.',
            difficulty: 'beginner',
            minutes: 60,
            xp: 250
        },
        {
            id: 'code-serial-console',
            house: 'code',
            title: 'Build a Serial Command Console',
            description: 'Build a two-way serial bridge where Python sends text commands to an Arduino that executes hardware actions and returns JSON responses.',
            difficulty: 'beginner',
            minutes: 60,
            xp: 250
        },
        {
            id: 'eye-motion-surveillance',
            house: 'eye',
            title: 'Build a Motion Surveillance Rig',
            description: 'Construct a PIR-triggered surveillance system with servo sweep scanning, ultrasonic distance mapping, IR remote control, and serial event logging.',
            difficulty: 'journeyman',
            minutes: 90,
            xp: 500
        },
        {
            id: 'key-rfid-access',
            house: 'key',
            title: 'Build an RFID Access Controller',
            description: 'Build a two-factor access control system with RFID badge scanning, keypad PIN entry, servo door lock, LCD status, and brute-force lockout.',
            difficulty: 'journeyman',
            minutes: 90,
            xp: 500
        },

        // ── Hardware Projects: ESP32 CYD (Cheap Yellow Display) ──────────────
        {
            id: 'darkarts-wifi-scanner',
            house: 'dark-arts',
            title: 'Build a WiFi Recon Scanner',
            description: 'Scan nearby WiFi networks on an ESP32 touchscreen displaying SSIDs, signal strength bars, channels, and encryption with tap-to-detail navigation.',
            difficulty: 'journeyman',
            minutes: 90,
            xp: 500
        },
        {
            id: 'matrix-traffic-dashboard',
            house: 'matrix',
            title: 'Build a Packet Traffic Dashboard',
            description: 'Capture raw 802.11 frames in promiscuous mode on an ESP32 CYD, classify packet types, and render real-time traffic graphs with channel hopping.',
            difficulty: 'advanced',
            minutes: 120,
            xp: 1000
        },
        {
            id: 'ai-network-anomaly',
            house: 'ai',
            title: 'Build a Network Anomaly Monitor',
            description: 'Monitor WiFi environments on an ESP32 CYD, fingerprint devices, detect anomalies like new devices and deauth floods, and log trends to microSD.',
            difficulty: 'advanced',
            minutes: 120,
            xp: 1000
        },
        {
            id: 'divergent-field-terminal',
            house: 'divergent',
            title: 'Build a Multi-Protocol Field Terminal',
            description: 'Build a portable touchscreen multi-tool on an ESP32 CYD with tabbed WiFi scanner, BLE scanner, network tools, and packet sniffer.',
            difficulty: 'pro',
            minutes: 150,
            xp: 2000
        },

        // ── Hardware Projects: Arduino Simple Builds ─────────────────────────
        {
            id: 'forge-env-monitor',
            house: 'forge',
            title: 'Build an Environmental Monitor',
            description: 'Read temperature and humidity from a DHT11 with LED threshold indicators, buzzer alerts, LCD display, and running average tracking.',
            difficulty: 'beginner',
            minutes: 45,
            xp: 250
        },
        {
            id: 'shield-perimeter-alarm',
            house: 'shield',
            title: 'Build a Perimeter Alarm System',
            description: 'Wire PIR motion and reed switch sensors into an arm/disarm alarm system with distinct buzzer patterns and timestamped serial event logs.',
            difficulty: 'beginner',
            minutes: 60,
            xp: 250
        },
        {
            id: 'script-data-logger',
            house: 'script',
            title: 'Build an Arduino Data Logger',
            description: 'Log timestamped sensor readings to an SD card as CSV with an RTC module, then visualize the data with a Python matplotlib script.',
            difficulty: 'beginner',
            minutes: 60,
            xp: 250
        },
        {
            id: 'code-arduino-pipeline',
            house: 'code',
            title: 'Build an Arduino-Python Pipeline',
            description: 'Stream JSON sensor data from an Arduino over serial to a Python script that stores it in SQLite and renders a live terminal dashboard.',
            difficulty: 'beginner',
            minutes: 45,
            xp: 250
        },

        // ── Wave 2: Educative-Inspired Projects ───────────────────────────────
        {
            id: 'code-typing-speed',
            house: 'code',
            title: 'Build a Typing Speed Test',
            description: 'Create a browser-based typing speed test with WPM calculation, accuracy tracking, DOM manipulation, timers, and responsive design.',
            difficulty: 'beginner',
            minutes: 45,
            xp: 250
        },
        {
            id: 'code-task-manager',
            house: 'code',
            title: 'Build a Task Manager with Local Storage',
            description: 'Build a full CRUD task manager using vanilla JavaScript with priorities, due dates, tags, filtering, and localStorage persistence.',
            difficulty: 'beginner',
            minutes: 90,
            xp: 250
        },
        {
            id: 'cloud-k8s-deploy',
            house: 'cloud',
            title: 'Deploy to Kubernetes',
            description: 'Containerize a Flask app with Docker, write Kubernetes manifests, deploy with kubectl, and manage scaling, health checks, and rolling updates.',
            difficulty: 'advanced',
            minutes: 120,
            xp: 1000
        },
        {
            id: 'cloud-terraform-infra',
            house: 'cloud',
            title: 'Manage Infrastructure with Terraform',
            description: 'Automate cloud infrastructure deployment using Terraform and CLI. Write HCL configs for compute, networking, and storage with state management.',
            difficulty: 'advanced',
            minutes: 120,
            xp: 1000
        },
        {
            id: 'cloud-api-nginx',
            house: 'cloud',
            title: 'Deploy an API Behind Nginx',
            description: 'Deploy a production API with Nginx as reverse proxy. Configure SSL termination, rate limiting, caching, load balancing, and security headers.',
            difficulty: 'journeyman',
            minutes: 90,
            xp: 500
        },
        {
            id: 'ai-rag-chatbot',
            house: 'ai',
            title: 'Build a RAG Chatbot',
            description: 'Build a Retrieval-Augmented Generation chatbot using LangChain and vector databases. Index documents, embed queries, and generate accurate responses.',
            difficulty: 'journeyman',
            minutes: 90,
            xp: 500
        },
        {
            id: 'ai-intrusion-detector',
            house: 'ai',
            title: 'Detect Cyber Intrusions with ML',
            description: 'Train machine learning classifiers on network traffic datasets to detect intrusions. Compare Random Forest, SVM, and neural network approaches.',
            difficulty: 'journeyman',
            minutes: 90,
            xp: 500
        },
        {
            id: 'ai-research-agent',
            house: 'ai',
            title: 'Build an AI Research Agent',
            description: 'Build an autonomous research agent that searches the web, summarizes findings, and generates reports using CrewAI and LangChain orchestration.',
            difficulty: 'advanced',
            minutes: 120,
            xp: 1000
        },
        {
            id: 'darkarts-metasploit',
            house: 'dark-arts',
            title: 'Penetration Testing with Metasploit',
            description: 'Master the Metasploit Framework for penetration testing. Enumerate targets, select exploits, configure payloads, pivot through networks, and document findings.',
            difficulty: 'advanced',
            minutes: 120,
            xp: 1000
        },
        {
            id: 'darkarts-recon-automation',
            house: 'dark-arts',
            title: 'Automate Recon with Python',
            description: 'Build automated reconnaissance scripts that chain subdomain enumeration, DNS resolution, port scanning, and technology fingerprinting into a pipeline.',
            difficulty: 'journeyman',
            minutes: 90,
            xp: 500
        },
        {
            id: 'script-etl-pipeline',
            house: 'script',
            title: 'Build an ETL Data Pipeline',
            description: 'Extract data from APIs and files, transform with Python and pandas, load into SQLite, and schedule with cron. Includes error handling and logging.',
            difficulty: 'journeyman',
            minutes: 90,
            xp: 500
        },
        {
            id: 'script-github-actions',
            house: 'script',
            title: 'Build Custom GitHub Actions',
            description: 'Create custom GitHub Actions in Bash and Python. Automate code scanning, TODO tracking, deployment notifications, and CI/CD workflows.',
            difficulty: 'journeyman',
            minutes: 60,
            xp: 500
        },
        {
            id: 'matrix-data-viz',
            house: 'matrix',
            title: 'Build a Data Visualization Dashboard',
            description: 'Analyze datasets with pandas, create publication-quality visualizations with matplotlib and seaborn, and build interactive charts for data exploration.',
            difficulty: 'beginner',
            minutes: 60,
            xp: 250
        },
        {
            id: 'matrix-time-series',
            house: 'matrix',
            title: 'Predictive Time Series Analysis',
            description: 'Forecast trends using LSTM neural networks. Preprocess time-series data, build sequence models, evaluate predictions, and deploy with Flask.',
            difficulty: 'advanced',
            minutes: 120,
            xp: 1000
        },
        {
            id: 'web-rest-api',
            house: 'web',
            title: 'Build a RESTful API with Express',
            description: 'Design and build a RESTful API with Express.js and MongoDB. Implement authentication, RBAC, file uploads, pagination, and structured error handling.',
            difficulty: 'journeyman',
            minutes: 90,
            xp: 500
        },
        {
            id: 'key-blockchain',
            house: 'key',
            title: 'Build a Blockchain from Scratch',
            description: 'Implement a blockchain in Python with SHA-256 hashing, proof-of-work consensus, transaction validation, wallet generation, and a REST API interface.',
            difficulty: 'advanced',
            minutes: 120,
            xp: 1000
        },
        {
            id: 'shield-ids-ml',
            house: 'shield',
            title: 'Build a ML-Powered Network IDS',
            description: 'Train a machine learning model to classify network traffic as normal or malicious. Build a real-time detection pipeline with alerting and dashboards.',
            difficulty: 'advanced',
            minutes: 120,
            xp: 1000
        },
        {
            id: 'eye-selenium-testing',
            house: 'eye',
            title: 'Automated Web Testing with Selenium',
            description: 'Build an automated testing suite using Python and Selenium. Write page object models, handle dynamic content, capture evidence, and generate reports.',
            difficulty: 'journeyman',
            minutes: 90,
            xp: 500
        },
        {
            id: 'forge-telegram-bot',
            house: 'forge',
            title: 'Build a Telegram Monitoring Bot',
            description: 'Create a Node.js Telegram bot that monitors web pages for changes, sends alerts, tracks uptime, and provides slash-command controls.',
            difficulty: 'beginner',
            minutes: 60,
            xp: 250
        },
        {
            id: 'divergent-discord-bot',
            house: 'divergent',
            title: 'Build a Discord Security Bot',
            description: 'Build a TypeScript Discord bot with moderation commands, user tracking, database integration, and automated security alerting for server events.',
            difficulty: 'journeyman',
            minutes: 90,
            xp: 500
        },

        // ── Wave 3: Educative-Inspired Projects (pages 21-40) ──────────────────
        {
            id: 'code-chat-app',
            house: 'code',
            title: 'Build a Real-Time Chat App',
            description: 'Build a real-time chat application using WebSockets with Node.js, user authentication, chat rooms, message history in SQLite, and a responsive frontend.',
            difficulty: 'journeyman',
            minutes: 90,
            xp: 500
        },
        {
            id: 'code-resume-builder',
            house: 'code',
            title: 'Build a Resume Builder',
            description: 'Create a multi-step form resume builder in vanilla JavaScript with template selection, real-time preview, PDF export, and localStorage draft saving.',
            difficulty: 'beginner',
            minutes: 60,
            xp: 250
        },
        {
            id: 'web-online-portfolio',
            house: 'web',
            title: 'Build a Professional Portfolio',
            description: 'Build a professional portfolio site with HTML5 and CSS3 featuring responsive grid layout, parallax hero, project showcase, contact form, and theme toggle.',
            difficulty: 'beginner',
            minutes: 45,
            xp: 250
        },
        {
            id: 'web-react-router',
            house: 'web',
            title: 'Build a Dynamic Product Site',
            description: 'Build a dynamic product catalog using React Router with nested routes, URL parameters, search/filter, product detail pages, and shopping cart state.',
            difficulty: 'journeyman',
            minutes: 90,
            xp: 500
        },
        {
            id: 'cloud-budget-fern',
            house: 'cloud',
            title: 'Build a Budget App with FERN Stack',
            description: 'Build a real-time budget app using Firebase, Express, React, and Node.js with authentication, transaction CRUD, category budgets, and spending charts.',
            difficulty: 'journeyman',
            minutes: 90,
            xp: 500
        },
        {
            id: 'cloud-django-eks',
            house: 'cloud',
            title: 'Deploy to Amazon EKS',
            description: 'Deploy a Django application on Amazon EKS using Docker, Kubernetes manifests, AWS CLI, EKS cluster management, load balancers, and rolling deployments.',
            difficulty: 'advanced',
            minutes: 120,
            xp: 1000
        },
        {
            id: 'ai-explainable-ml',
            house: 'ai',
            title: 'Explainable AI and Model Interpretation',
            description: 'Use explainable AI to interpret ML models with SHAP values, LIME, and feature importance. Compare Logistic Regression, Random Forest, and Neural Networks.',
            difficulty: 'advanced',
            minutes: 120,
            xp: 1000
        },
        {
            id: 'ai-reinforcement-taxi',
            house: 'ai',
            title: 'Train an Agent with Reinforcement Learning',
            description: 'Train a reinforcement learning agent using Q-learning and SARSA. Implement reward shaping, epsilon-greedy exploration, and convergence analysis.',
            difficulty: 'journeyman',
            minutes: 90,
            xp: 500
        },
        {
            id: 'ai-music-generation',
            house: 'ai',
            title: 'Generate Music with AI',
            description: 'Generate original music using AudioCraft and neural audio synthesis. Customize genre, tempo, and instrumentation through prompt engineering.',
            difficulty: 'beginner',
            minutes: 45,
            xp: 250
        },
        {
            id: 'matrix-sentiment-nlp',
            house: 'matrix',
            title: 'Analyze Sentiment with NLP',
            description: 'Apply NLP for sentiment analysis using VADER and Gensim. Process social media text, build word embeddings, classify polarity, and visualize trends.',
            difficulty: 'journeyman',
            minutes: 90,
            xp: 500
        },
        {
            id: 'matrix-climate-analysis',
            house: 'matrix',
            title: 'Climate Data Analysis and Forecasting',
            description: 'Explore climate change impacts through data analysis and weather forecasting. Apply prediction techniques, time-series decomposition, and interactive visualizations.',
            difficulty: 'journeyman',
            minutes: 60,
            xp: 500
        },
        {
            id: 'matrix-customer-segmentation',
            house: 'matrix',
            title: 'Customer Segmentation with K-Means',
            description: 'Implement k-means clustering for customer segmentation. Analyze purchase patterns, optimize cluster count with elbow method, and visualize segment profiles.',
            difficulty: 'journeyman',
            minutes: 60,
            xp: 500
        },
        {
            id: 'darkarts-web-scraping',
            house: 'dark-arts',
            title: 'Web Scraping and Data Extraction',
            description: 'Master web scraping with Python and Selenium for OSINT. Extract data from dynamic pages, handle pagination, bypass rate limits, and export to CSV.',
            difficulty: 'journeyman',
            minutes: 60,
            xp: 500
        },
        {
            id: 'script-video-summarizer',
            house: 'script',
            title: 'Auto-Summarize Videos with Python',
            description: 'Build a Python pipeline that extracts YouTube transcripts via API, tokenizes text with NLTK, applies extractive summarization, and generates concise summaries.',
            difficulty: 'journeyman',
            minutes: 90,
            xp: 500
        },
        {
            id: 'script-web-crawler',
            house: 'script',
            title: 'Build a Web Crawler',
            description: 'Build a Node.js web crawler using Cheerio for HTML parsing. Implement BFS URL discovery, respect robots.txt, extract structured data, and export results.',
            difficulty: 'beginner',
            minutes: 60,
            xp: 250
        },
        {
            id: 'key-nft-marketplace',
            house: 'key',
            title: 'Build a Smart Contract Marketplace',
            description: 'Develop an Ethereum NFT marketplace using Solidity and Hardhat. Implement ERC-721 minting, listing, trading, and a React frontend with MetaMask integration.',
            difficulty: 'advanced',
            minutes: 120,
            xp: 1000
        },
        {
            id: 'key-secure-doc-storage',
            house: 'key',
            title: 'Secure Document Storage with Blockchain',
            description: 'Build a blockchain-based document storage system with hash verification, on-chain authenticity proofs, access control lists, and tamper-proof audit trails.',
            difficulty: 'advanced',
            minutes: 120,
            xp: 1000
        },
        {
            id: 'shield-fake-news',
            house: 'shield',
            title: 'Detect Fake News with ML',
            description: 'Build a fake news detector with Scikit-learn. Train on labeled datasets, implement TF-IDF features, compare Naive Bayes vs SVM classifiers, and evaluate accuracy.',
            difficulty: 'journeyman',
            minutes: 60,
            xp: 500
        },
        {
            id: 'eye-playwright-testing',
            house: 'eye',
            title: 'Automate Testing with Playwright',
            description: 'Build automated browser tests with Playwright. Write login flow tests, handle dynamic content, capture failure screenshots, and generate HTML reports.',
            difficulty: 'beginner',
            minutes: 60,
            xp: 250
        },
        {
            id: 'forge-crossword-puzzle',
            house: 'forge',
            title: 'Build a Crossword Puzzle Generator',
            description: 'Create a crossword puzzle generator with Vite featuring automated grid layout, clue management, interactive solving, validation logic, and Vitest testing.',
            difficulty: 'beginner',
            minutes: 60,
            xp: 250
        },

        // ── Wave 4: Educative-Inspired Projects (pages 41-51) ──────────────────
        {
            id: 'code-ecommerce-stripe',
            house: 'code',
            title: 'Build an E-Commerce Store with Stripe',
            description: 'Build an e-commerce store with Node.js, Express, and Stripe API. Implement product catalog, shopping cart, checkout flow, and webhook payment handling.',
            difficulty: 'journeyman',
            minutes: 90,
            xp: 500
        },
        {
            id: 'code-memory-game',
            house: 'code',
            title: 'Build a Memory Card Game',
            description: 'Build an interactive memory matching game with React featuring card flip animations, pair matching logic, move counter, timer, and difficulty levels.',
            difficulty: 'beginner',
            minutes: 60,
            xp: 250
        },
        {
            id: 'code-wordle-clone',
            house: 'code',
            title: 'Build a Wordle Clone',
            description: 'Build a Wordle word-guessing game with React. Implement letter-by-letter input, color-coded feedback, virtual keyboard, and streak tracking.',
            difficulty: 'beginner',
            minutes: 60,
            xp: 250
        },
        {
            id: 'web-elearning-flask',
            house: 'web',
            title: 'Build an E-Learning Platform',
            description: 'Build an e-learning website with Flask and SQLAlchemy featuring course catalog, search, user enrollment, progress tracking, and responsive Bootstrap design.',
            difficulty: 'journeyman',
            minutes: 60,
            xp: 500
        },
        {
            id: 'cloud-helm-charts',
            house: 'cloud',
            title: 'Create Custom Helm Charts for K8s',
            description: 'Create and publish Helm charts for Kubernetes. Write templates with values.yaml, implement dependencies, test with helm lint, and publish to Artifact Hub.',
            difficulty: 'advanced',
            minutes: 120,
            xp: 1000
        },
        {
            id: 'cloud-aws-vpc',
            house: 'cloud',
            title: 'AWS Networking and VPC Security',
            description: 'Learn AWS networking by building a VPC with subnets, security groups, NACLs, route tables, internet gateway, and NAT gateway for secure architecture.',
            difficulty: 'journeyman',
            minutes: 60,
            xp: 500
        },
        {
            id: 'cloud-serverless-django',
            house: 'cloud',
            title: 'Deploy Serverless Django on AWS',
            description: 'Deploy serverless Django on AWS using Zappa and SAM. Configure API Gateway, Lambda, RDS, S3 static files, and CloudWatch monitoring.',
            difficulty: 'advanced',
            minutes: 120,
            xp: 1000
        },
        {
            id: 'ai-rasa-chatbot',
            house: 'ai',
            title: 'Build a Conversational AI with Rasa',
            description: 'Build an AI chatbot with Rasa. Create training data, define intents and entities, build conversation flows, train the NLU pipeline, and deploy with Flask.',
            difficulty: 'journeyman',
            minutes: 90,
            xp: 500
        },
        {
            id: 'ai-face-detection',
            house: 'ai',
            title: 'Face Detection with OpenCV',
            description: 'Implement face detection using Dlib and DNN in OpenCV. Build HOG and SSD detectors, benchmark accuracy and speed, and visualize bounding boxes.',
            difficulty: 'beginner',
            minutes: 60,
            xp: 250
        },
        {
            id: 'ai-data-augmentation',
            house: 'ai',
            title: 'Data Augmentation for ML Datasets',
            description: 'Enhance ML model performance with data augmentation using OpenCV, TensorFlow, and imgaug. Apply rotation, flipping, color jitter, noise, and cutout transforms.',
            difficulty: 'journeyman',
            minutes: 60,
            xp: 500
        },
        {
            id: 'matrix-plotly-viz',
            house: 'matrix',
            title: 'Interactive Visualization with Plotly',
            description: 'Build interactive visualizations with Plotly.js featuring histograms, pie charts, scatter plots, 3D surfaces, animated transitions, and drill-down tooltips.',
            difficulty: 'beginner',
            minutes: 60,
            xp: 250
        },
        {
            id: 'matrix-stock-analysis',
            house: 'matrix',
            title: 'Stock Market Data Visualization',
            description: 'Explore stock market trends with Python using candlestick charts, moving averages, volume analysis, correlation heatmaps, and predictive modeling.',
            difficulty: 'journeyman',
            minutes: 60,
            xp: 500
        },
        {
            id: 'matrix-kafka-streaming',
            house: 'matrix',
            title: 'Build a Streaming Data Pipeline',
            description: 'Build a real-time streaming pipeline with Apache Kafka. Implement producers, consumers, topic partitioning, event processing, and live visualization.',
            difficulty: 'journeyman',
            minutes: 90,
            xp: 500
        },
        {
            id: 'key-brownie-contracts',
            house: 'key',
            title: 'Deploy Smart Contracts with Brownie',
            description: 'Develop and deploy Ethereum smart contracts using Brownie with Solidity. Write tests, deployment scripts, and interact via Python console on testnet.',
            difficulty: 'journeyman',
            minutes: 60,
            xp: 500
        },
        {
            id: 'shield-aws-cognito',
            house: 'shield',
            title: 'User Auth with AWS Cognito',
            description: 'Implement user authentication with AWS Cognito. Configure user pools, identity pools, MFA, OAuth flows, JWT validation, and role-based access control.',
            difficulty: 'journeyman',
            minutes: 60,
            xp: 500
        },
        {
            id: 'darkarts-puppeteer',
            house: 'dark-arts',
            title: 'Headless Scraping with Puppeteer',
            description: 'Master headless web scraping with Puppeteer and Node.js. Automate browser interactions, handle dynamic JS content, bypass bot detection, and extract data.',
            difficulty: 'journeyman',
            minutes: 60,
            xp: 500
        },
        {
            id: 'script-data-pipeline',
            house: 'script',
            title: 'Build a Data Pipeline with Dashboard',
            description: 'Create a data pipeline with Python using Kedro and hvPlot. Implement ingestion, transformation nodes, DAG execution, and an interactive dashboard.',
            difficulty: 'journeyman',
            minutes: 60,
            xp: 500
        },
        {
            id: 'eye-pytorch-onnx',
            house: 'eye',
            title: 'Run PyTorch Models in the Browser',
            description: 'Convert PyTorch ResNet-18 to ONNX and run inference in JavaScript with ONNX Runtime Web. Implement preprocessing, classification, and benchmarking.',
            difficulty: 'journeyman',
            minutes: 60,
            xp: 500
        },
        {
            id: 'forge-spring-fullstack',
            house: 'forge',
            title: 'Build a Full-Stack App with Spring Boot',
            description: 'Build a full-stack app with Spring Boot and Thymeleaf. Implement MVC architecture, JPA database config, form handling, and CRUD operations.',
            difficulty: 'journeyman',
            minutes: 90,
            xp: 500
        },
        {
            id: 'divergent-manim',
            house: 'divergent',
            title: 'Create Math Animations with Manim',
            description: 'Create mathematical animations with the Manim Python library. Render geometric transformations, function plots, 3D surfaces, and LaTeX equations.',
            difficulty: 'beginner',
            minutes: 60,
            xp: 250
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

    // ── P2 enrichment queries (optional fields: technologies[], skills[], prerequisites[], careerRoles[]) ──

    /** Get all projects that use a given technology (e.g. 'Power Automate'). */
    getByTechnology(tech) {
        return this.projects.filter(p => (p.technologies || []).includes(tech));
    },

    /** Distinct, sorted list of every technology declared across all projects. */
    getAllTechnologies() {
        return [...new Set(this.projects.flatMap(p => p.technologies || []))].sort();
    },

    /** Get all projects mapped to a given career-role id (controlled vocab finalized in P3). */
    getByCareerRole(role) {
        return this.projects.filter(p => (p.careerRoles || []).includes(role));
    },

    /** Resolve a project's prerequisites to project objects (skips unknown ids). */
    getPrerequisites(id) {
        const p = this.get(id);
        return p ? (p.prerequisites || []).map(pid => this.get(pid)).filter(Boolean) : [];
    },

    /** Computed inverse of prerequisites: projects that this one unlocks (no stored field to drift). */
    getUnlocks(id) {
        return this.projects.filter(p => (p.prerequisites || []).includes(id));
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
