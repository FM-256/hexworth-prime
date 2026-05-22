/* ============================================================
   CTF ARENA — Box B7: The Stalled Ship
   Container Troubleshooting | Crimson Dawn Confederacy
   Config: Docker misconfigs, networking, volumes, compose
   ============================================================ */

const B7Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'The Stalled Ship',
    subtitle: 'Container Troubleshooting — Crimson Dawn Confederacy',
    difficulty: 'Intermediate-Advanced',
    accent: '#0ea5e9',
    storageKey: 'hexworth_ctf_b7',
    registryId: 'b7-stalled-ship',
    trackerKey: 'ctf_b7',

    // ═══════════════════════════════════════════════════════
    // PHASE SYSTEM (Multi-layer troubleshooting chain)
    // ═══════════════════════════════════════════════════════

    phases: [
        {
            id: 'recon',
            name: 'Host Assessment',
            icon: '\uD83D\uDD0D',
            description: 'SSH into ASV-CARGO-01 and assess Docker daemon health. Check container status and logs.',
            requiredFlags: [],
            mitre: ['T1046', 'T1082'],
            unlocks: ['diagnosis'],
            locked: false
        },
        {
            id: 'diagnosis',
            name: 'Container Diagnosis',
            icon: '\uD83D\uDC33',
            description: 'Inspect Docker Compose config, Dockerfile, networking, and resource limits. Identify misconfigurations.',
            requiredFlags: [],
            mitre: ['T1190', 'T1592.004'],
            unlocks: ['remediation'],
            locked: true
        },
        {
            id: 'remediation',
            name: 'Remediation',
            icon: '\uD83D\uDD27',
            description: 'Fix the Docker Compose configuration, rebuild, and restart the application stack.',
            requiredFlags: ['user'],
            mitre: ['T1059.004', 'T1098'],
            unlocks: ['verification'],
            locked: true
        },
        {
            id: 'verification',
            name: 'Verification',
            icon: '\u2705',
            description: 'Confirm the cargo management application is running reliably and retrieve the service restoration token.',
            requiredFlags: ['root'],
            mitre: ['T1530', 'T1005'],
            unlocks: [],
            locked: true
        }
    ],

    // ═══════════════════════════════════════════════════════
    // TUTORIAL MODE (Sprint AR-12)
    // ═══════════════════════════════════════════════════════

    tutorialMode: true,

    tutorial: {
        steps: [
            {
                title: 'Check Docker container status',
                tip: 'Open the Terminal and run: docker ps -a to see all containers and their states.',
                trigger: { event: 'command', match: { cmd: 'contains:docker' } }
            },
            {
                title: 'Inspect container logs',
                tip: 'Run: docker logs cargo-app or docker-compose logs to see error messages.',
                trigger: { event: 'command', match: { cmd: 'contains:logs' } }
            },
            {
                title: 'Review Docker Compose configuration',
                tip: 'Read the docker-compose.yml file: cat /opt/cargo-app/docker-compose.yml. Look for port mapping and networking issues.',
                trigger: { event: 'command', match: { cmd: 'contains:cat' } }
            },
            {
                title: 'Identify the misconfiguration',
                tip: 'Compare the EXPOSE directive in the Dockerfile with the ports mapping in docker-compose.yml. Also check network configuration.',
                trigger: { event: 'flag_correct', match: { flagId: 'user' } }
            },
            {
                title: 'Fix and verify',
                tip: 'After fixing docker-compose.yml, run docker-compose up -d and check the application responds correctly.',
                trigger: { event: 'flag_correct', match: { flagId: 'root' } }
            }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // CERT OBJECTIVES (Assessment Mode — AR-7)
    // ═══════════════════════════════════════════════════════

    certObjectives: {
        certPath: 'SY0-701',
        mappings: [
            { flagId: 'user', objective: '4.1', description: 'Given a scenario, apply common security techniques to computing resources — Container security', skill: 'Docker Configuration Analysis' },
            { flagId: 'user', objective: '4.5', description: 'Given a scenario, modify enterprise capabilities to enhance security — Configuration management', skill: 'Docker Compose Troubleshooting' },
            { flagId: 'root', objective: '3.1', description: 'Compare and contrast security implications of different architecture models — Containerization', skill: 'Container Networking' },
            { flagId: 'root', objective: '4.4', description: 'Given a scenario, implement and maintain security processes — Service restoration', skill: 'Container Orchestration Recovery' }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // BOOT SEQUENCE
    // ═══════════════════════════════════════════════════════

    boot: {
        biosLines: [
            'ASV-CARGO-01 BIOS v2.4.7',
            'Initializing hardware...',
            'Memory Test: 8192 MB OK',
            'Detecting drives... /dev/sda1 (256GB SSD)',
            'NIC: Intel I350 Gigabit — Link Up',
            'Boot device: /dev/sda1',
            'Loading GRUB...'
        ],
        grubEntries: [
            'Ubuntu 22.04.3 LTS',
            'Ubuntu 22.04.3 LTS (recovery mode)',
            'Advanced options for Ubuntu'
        ],
        loginUser: 'cargo_ops'
    },

    // ═══════════════════════════════════════════════════════
    // DESKTOP ICONS
    // ═══════════════════════════════════════════════════════

    desktop: {
        icons: [
            { id: 'terminal', label: 'Terminal', icon: '\uD83D\uDDA5\uFE0F', app: 'terminal' },
            { id: 'browser',  label: 'Firefox',  icon: '\uD83C\uDF10', app: 'browser' },
            { id: 'notes',    label: 'Notes',    icon: '\uD83D\uDCDD', app: 'notes' },
            { id: 'hints',    label: 'Hints',    icon: '\uD83D\uDCA1', app: 'hints' },
            { id: 'flags',    label: 'Submit Flag', icon: '\uD83D\uDEA9', app: 'flags' }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // TERMINAL CONFIG
    // ═══════════════════════════════════════════════════════

    terminal: {
        user: 'cargo_ops',
        hostname: 'ASV-CARGO-01',
        startDir: '/home/cargo_ops',
        welcome: 'Ubuntu 22.04.3 LTS — ASV-CARGO-01\nLast login: Wed Mar 13 18:44:02 2026\n\n*** ALERT: Cargo management application is DOWN ***\n*** Container restarts detected — supply chain disrupted ***\n\nType \'help\' for available commands.\n'
    },

    // ═══════════════════════════════════════════════════════
    // SIMULATED DATA
    // ═══════════════════════════════════════════════════════

    _db: {
        containers: [
            { id: 'a1b2c3d4e5f6', names: 'cargo-app', image: 'cargo-mgmt:v2.3.1', status: 'Restarting (1) 8 seconds ago', ports: '0.0.0.0:80->80/tcp', state: 'restarting' },
            { id: 'f6e5d4c3b2a1', names: 'inventory-db', image: 'postgres:14-alpine', status: 'Up 2 hours', ports: '5432/tcp', state: 'running' },
            { id: 'b3c4d5e6f7a8', names: 'redis-cache', image: 'redis:7-alpine', status: 'Up 2 hours', ports: '6379/tcp', state: 'running' }
        ],
        dockerComposeYml: `version: '3.8'

services:
  cargo-app:
    build: ./app
    container_name: cargo-app
    ports:
      - "80:80"
    environment:
      - DATABASE_URL=postgresql://cargo_user:s3cur3_p4ss@inventory-db:5432/cargo_db
      - REDIS_URL=redis://redis-cache:6379
      - NODE_ENV=production
    depends_on:
      - inventory-db
      - redis-cache
    networks:
      - frontend
    deploy:
      resources:
        limits:
          memory: 64M
          cpus: '0.25'
    restart: always

  inventory-db:
    image: postgres:14-alpine
    container_name: inventory-db
    environment:
      - POSTGRES_USER=cargo_user
      - POSTGRES_PASSWORD=s3cur3_p4ss
      - POSTGRES_DB=cargo_db
    volumes:
      - db-data:/var/lib/postgresql/data
    networks:
      - backend

  redis-cache:
    image: redis:7-alpine
    container_name: redis-cache
    networks:
      - backend

networks:
  frontend:
    driver: bridge
  backend:
    driver: bridge

volumes:
  db-data:`,
        dockerfile: `FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 8080
CMD ["node", "server.js"]`,
        cargoAppLogs: `[2026-03-13T18:44:02.123Z] Starting Cargo Management System v2.3.1...
[2026-03-13T18:44:02.456Z] Connecting to PostgreSQL at inventory-db:5432...
[2026-03-13T18:44:05.789Z] ERROR: getaddrinfo ENOTFOUND inventory-db
[2026-03-13T18:44:05.790Z]   at GetAddrInfoReqWrap.onlookup [as oncomplete] (dns.js:71:26)
[2026-03-13T18:44:05.791Z] ERROR: Could not connect to database. Retrying in 5s...
[2026-03-13T18:44:10.792Z] ERROR: getaddrinfo ENOTFOUND inventory-db
[2026-03-13T18:44:15.793Z] ERROR: getaddrinfo ENOTFOUND inventory-db
[2026-03-13T18:44:15.794Z] FATAL: Max connection retries exceeded. Exiting with code 1.
[2026-03-13T18:44:15.795Z] Node.js process used 58MB of 64MB memory limit before exit.`,
        inventoryDbLogs: `PostgreSQL Database directory appears to contain a database; Skipping initialization
2026-03-13 18:42:00.123 UTC [1] LOG:  starting PostgreSQL 14.10 on x86_64-pc-linux-musl
2026-03-13 18:42:00.456 UTC [1] LOG:  listening on IPv4 address "0.0.0.0", port 5432
2026-03-13 18:42:00.789 UTC [1] LOG:  database system is ready to accept connections
2026-03-13 18:42:01.012 UTC [1] LOG:  no connections received from cargo-app network`,
        dockerInspectNetwork: `[
    {
        "Name": "cargo-app_frontend",
        "Driver": "bridge",
        "Containers": {
            "a1b2c3d4e5f6": {
                "Name": "cargo-app",
                "IPv4Address": "172.18.0.2/16"
            }
        }
    },
    {
        "Name": "cargo-app_backend",
        "Driver": "bridge",
        "Containers": {
            "f6e5d4c3b2a1": {
                "Name": "inventory-db",
                "IPv4Address": "172.19.0.2/16"
            },
            "b3c4d5e6f7a8": {
                "Name": "redis-cache",
                "IPv4Address": "172.19.0.3/16"
            }
        }
    }
]`
    },

    // ═══════════════════════════════════════════════════════
    // FLAGS
    // ═══════════════════════════════════════════════════════

    flags: [
        { id: 'user', points: 100 },
        { id: 'root', points: 200 }
    ],

    // ═══════════════════════════════════════════════════════
    // SCORING
    // ═══════════════════════════════════════════════════════

    scoring: {
        base: 1000,
        minScore: 0,
        maxScore: 500,
        hintPenalty: true,
        wrongFlagPenalty: -25,
        speedBonus: { threshold: 900000, points: 100 },
        timeBonusThreshold: 1800
    },

    // ═══════════════════════════════════════════════════════
    // HINTS
    // ═══════════════════════════════════════════════════════

    hints: [
        {
            id: 'hint1',
            text: 'Start with docker ps -a and docker logs cargo-app. The app is in a restart loop. Look at the error messages carefully — DNS resolution is failing.',
            cost: 10,
            penalty: -10
        },
        {
            id: 'hint2',
            text: 'Read docker-compose.yml carefully. The cargo-app is on the "frontend" network, but inventory-db and redis-cache are on the "backend" network. Containers on different Docker networks cannot resolve each other by hostname.',
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint3',
            text: 'Three issues: (1) Network isolation — cargo-app needs to be on both frontend AND backend networks. (2) Port mismatch — Dockerfile EXPOSEs 8080 but compose maps 80:80. (3) Memory limit 64M is too low for a Node.js app.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint4',
            text: 'The user flag is the primary issue: cargo-app is only on the "frontend" network but needs "backend" too. Fix: add "- backend" under cargo-app networks. Also fix ports to "80:8080" and increase memory to 256M. After docker-compose up -d, curl localhost to get the root flag.',
            cost: 75,
            penalty: -75
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'The Automated Supply Vessel ASV-CARGO-01, a critical component of the Confederacy\'s logistics network, runs its core cargo management application within Docker containers. The application has become notoriously unreliable: it starts, crashes, restarts, and crashes again in an endless loop. Engineers claim the Docker image hasn\'t changed. Supply chains are grinding to a halt.',
        scenario: 'A DevOps engineer recently restructured the Docker Compose configuration to separate frontend and backend networks for "improved security." In doing so, they isolated the application container from its database and cache containers. Additionally, a port mapping mismatch and insufficient memory limits compound the instability. The engineer left for vacation before testing the changes in production.',
        outro: 'The Stalled Ship sails once more. With proper network configuration restored, correct port mappings, and adequate resource limits, the cargo management application connects to its database and cache reliably. The Confederacy\'s supply chains resume their vital flow across the orbital habitats.',
        ecer: {
            executive: 'No change management process for infrastructure modifications; no staging environment',
            culture: 'DevOps engineer deployed directly to production without peer review or testing',
            employee: 'Network segmentation applied without understanding container DNS resolution requirements',
            regulatory: 'No deployment verification checklist; no rollback procedure documented'
        }
    },

    // ═══════════════════════════════════════════════════════
    // WEB APP — Cargo Management System
    // ═══════════════════════════════════════════════════════

    webApp: {
        startUrl: 'http://10.10.14.5/',

        pages: {
            '/': {
                title: 'Cargo Management System — ASV-CARGO-01',
                html: `
                    <div style="text-align:center; margin-bottom:30px; padding-bottom:20px; border-bottom:1px solid #ddd;">
                        <h1 style="color:#0ea5e9; font-size:1.6rem; font-family:Georgia,serif; margin-bottom:4px;">Cargo Management System</h1>
                        <div style="color:#888; font-size:0.8rem;">ASV-CARGO-01 &mdash; Crimson Dawn Logistics Division</div>
                    </div>

                    <div style="max-width:600px; margin:0 auto;">
                        <div style="background:#fef2f2; border:1px solid #fca5a5; border-radius:6px; padding:16px; margin-bottom:20px;">
                            <div style="color:#dc2626; font-weight:700; margin-bottom:8px;">SERVICE UNAVAILABLE</div>
                            <div style="font-size:0.8rem; color:#7f1d1d; line-height:1.6;">
                                <div>502 Bad Gateway</div>
                                <div>The cargo management application is not responding.</div>
                                <div style="margin-top:8px; color:#9ca3af;">nginx/1.24.0 &mdash; upstream server unreachable</div>
                            </div>
                        </div>

                        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:14px; margin-bottom:12px;">
                            <div style="font-family:monospace; font-size:0.75rem; color:#64748b;">
                                <div>Container: cargo-app — Status: Restarting</div>
                                <div>Container: inventory-db — Status: Running</div>
                                <div>Container: redis-cache — Status: Running</div>
                            </div>
                        </div>
                    </div>
                `,
                formHandler: null
            },
            '/status': {
                title: 'System Status — Cargo Management',
                html: `
                    <div style="text-align:center; padding:40px;">
                        <h1 style="color:#16a34a; font-size:1.4rem;">Service Restored</h1>
                        <div style="color:#888; font-size:0.8rem; margin-top:8px;">All containers operational</div>
                        <div style="margin-top:20px; padding:16px; background:#f0fdf4; border:1px solid #86efac; border-radius:6px;">
                            <div style="font-family:monospace; color:#16a34a; font-size:0.85rem; font-weight:700;">{{FLAG:root}}</div>
                            <div style="color:#64748b; font-size:0.7rem; margin-top:4px;">Service restoration verification token</div>
                        </div>
                    </div>
                `,
                formHandler: null
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // FILESYSTEM (target machine)
    // ═══════════════════════════════════════════════════════

    filesystem: {
        '/': {
            type: 'dir',
            children: {
                'home': {
                    type: 'dir',
                    children: {
                        'cargo_ops': {
                            type: 'dir',
                            children: {
                                'notes.txt': {
                                    type: 'file',
                                    content: '=== MISSION BRIEFING ===\nTarget: ASV-CARGO-01 (localhost)\nApplication: Cargo Management System (Docker)\nObjective: Diagnose and fix container issues\n\nReported symptoms:\n1. cargo-app container in restart loop\n2. Cannot connect to database\n3. Application unreachable on port 80\n4. Memory-related crashes reported\n\nDocker project location: /opt/cargo-app/\n\nGood luck, operator.'
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'ssh cargo_ops@ASV-CARGO-01\nsudo docker ps -a\nsudo docker logs cargo-app\ncd /opt/cargo-app\ncat docker-compose.yml'
                                }
                            }
                        }
                    }
                },
                'opt': {
                    type: 'dir',
                    children: {
                        'cargo-app': {
                            type: 'dir',
                            children: {
                                'docker-compose.yml': {
                                    type: 'file',
                                    content: null  // Populated dynamically from _db
                                },
                                'app': {
                                    type: 'dir',
                                    children: {
                                        'Dockerfile': {
                                            type: 'file',
                                            content: null  // Populated dynamically from _db
                                        },
                                        'package.json': {
                                            type: 'file',
                                            content: '{\n  "name": "cargo-mgmt",\n  "version": "2.3.1",\n  "description": "Cargo Management System for ASV fleet",\n  "main": "server.js",\n  "scripts": {\n    "start": "node server.js",\n    "test": "jest"\n  },\n  "dependencies": {\n    "express": "^4.18.2",\n    "pg": "^8.11.3",\n    "redis": "^4.6.10",\n    "cors": "^2.8.5"\n  }\n}'
                                        },
                                        'server.js': {
                                            type: 'file',
                                            content: 'const express = require(\'express\');\nconst { Pool } = require(\'pg\');\nconst redis = require(\'redis\');\n\nconst app = express();\nconst PORT = process.env.PORT || 8080;\n\n// Database connection\nconst pool = new Pool({\n  connectionString: process.env.DATABASE_URL\n});\n\n// Redis connection\nconst redisClient = redis.createClient({\n  url: process.env.REDIS_URL\n});\n\napp.get(\'/\', (req, res) => {\n  res.json({ status: \'operational\', service: \'Cargo Management System v2.3.1\' });\n});\n\napp.get(\'/status\', async (req, res) => {\n  const dbOk = await pool.query(\'SELECT 1\').then(() => true).catch(() => false);\n  const redisOk = await redisClient.ping().then(() => true).catch(() => false);\n  res.json({ database: dbOk, cache: redisOk, uptime: process.uptime() });\n});\n\napp.listen(PORT, () => {\n  console.log(`Cargo Management System listening on port ${PORT}`);\n});\n'
                                        }
                                    }
                                },
                                '.env': {
                                    type: 'file',
                                    content: '# Production environment\nCOMPOSE_PROJECT_NAME=cargo-app\nNODE_ENV=production'
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
                            content: 'ASV-CARGO-01'
                        },
                        'passwd': {
                            type: 'file',
                            content: 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\ncargo_ops:x:1000:1000:Cargo Ops,,,:/home/cargo_ops:/bin/bash'
                        }
                    }
                },
                'var': {
                    type: 'dir',
                    children: {
                        'log': {
                            type: 'dir',
                            children: {
                                'syslog': {
                                    type: 'file',
                                    content: 'Mar 13 18:42:00 ASV-CARGO-01 dockerd[891]: Starting Docker daemon\nMar 13 18:42:01 ASV-CARGO-01 dockerd[891]: Docker daemon started successfully\nMar 13 18:44:02 ASV-CARGO-01 dockerd[891]: Container cargo-app started\nMar 13 18:44:15 ASV-CARGO-01 dockerd[891]: Container cargo-app exited with code 1\nMar 13 18:44:16 ASV-CARGO-01 dockerd[891]: Container cargo-app restarting\nMar 13 18:44:31 ASV-CARGO-01 dockerd[891]: Container cargo-app exited with code 1\nMar 13 18:44:32 ASV-CARGO-01 dockerd[891]: Container cargo-app: OOMKilled=false, ExitCode=1'
                                }
                            }
                        }
                    }
                },
                'tmp': {
                    type: 'dir',
                    children: {
                        'docker-debug.txt': {
                            type: 'file',
                            content: 'Notes from the DevOps lead (on vacation):\n- Separated networks for security improvement\n- cargo-app on frontend, db+redis on backend\n- "Should work fine, DNS resolves across Docker networks"\n  ^^ THIS IS WRONG. Docker DNS only resolves within the same network.\n- Port mapping looks right... wait, does the app listen on 80 or 8080?\n- Memory limit might be tight. Need to test.\n\nTODO: Test before deploying. Oops, already deployed.'
                        }
                    }
                },
                'usr': {
                    type: 'dir',
                    children: {
                        'share': {
                            type: 'dir',
                            children: {}
                        }
                    }
                }
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // TERMINAL COMMANDS (box-specific tools)
    // ═══════════════════════════════════════════════════════

    commands: {
        'help': function(args) {
            return `Available commands:
  System:     ls, cd, pwd, cat, grep, ps, top, htop, df, free, whoami, id, uname, clear, history
  Network:    ping, netstat, ss, ip, curl
  Docker:     docker, docker-compose
  Files:      find, head, tail, less, wc, file
  Services:   systemctl, journalctl
  Other:      sudo, man, echo, export

Type 'man <command>' for usage details.`;
        },

        'docker': function(args, term, engine) {
            const sub = args[0] || '';
            const rest = args.slice(1);
            const argStr = args.join(' ');

            // docker ps
            if (sub === 'ps') {
                const db = B7Config._db;
                if (rest.includes('-a') || rest.includes('--all')) {
                    let output = 'CONTAINER ID   IMAGE                   COMMAND                  CREATED        STATUS                          PORTS                   NAMES\n';
                    db.containers.forEach(c => {
                        output += `${c.id.substring(0, 12)}   ${c.image.padEnd(23)} ${'"docker-entrypoint..."'.padEnd(24)} 2 hours ago    ${c.status.padEnd(31)} ${(c.ports || '').padEnd(23)} ${c.names}\n`;
                    });
                    return output;
                }
                let output = 'CONTAINER ID   IMAGE                   COMMAND                  CREATED        STATUS         PORTS          NAMES\n';
                db.containers.filter(c => c.state === 'running').forEach(c => {
                    output += `${c.id.substring(0, 12)}   ${c.image.padEnd(23)} ${'"docker-entrypoint..."'.padEnd(24)} 2 hours ago    ${c.status.padEnd(14)} ${(c.ports || '').padEnd(14)} ${c.names}\n`;
                });
                return output;
            }

            // docker logs
            if (sub === 'logs') {
                const target = rest.find(a => !a.startsWith('-')) || '';
                if (target === 'cargo-app') return B7Config._db.cargoAppLogs;
                if (target === 'inventory-db') return B7Config._db.inventoryDbLogs;
                if (target === 'redis-cache') return '1:C 13 Mar 2026 18:42:01.123 * oO0OoO0OoO0Oo Redis is starting oO0OoO0OoO0Oo\n1:C 13 Mar 2026 18:42:01.124 * Redis version=7.2.3\n1:M 13 Mar 2026 18:42:01.125 * Ready to accept connections';
                return 'Error: No such container: ' + (target || '<name>');
            }

            // docker inspect
            if (sub === 'inspect') {
                const target = rest.find(a => !a.startsWith('-')) || '';
                if (target === 'cargo-app') {
                    return `[{
    "Id": "a1b2c3d4e5f6...",
    "Name": "/cargo-app",
    "State": {
        "Status": "restarting",
        "Running": false,
        "Paused": false,
        "Restarting": true,
        "OOMKilled": false,
        "ExitCode": 1,
        "Error": ""
    },
    "HostConfig": {
        "Memory": 67108864,
        "NanoCpus": 250000000,
        "PortBindings": {
            "80/tcp": [{"HostPort": "80"}]
        },
        "NetworkMode": "cargo-app_frontend"
    },
    "NetworkSettings": {
        "Networks": {
            "cargo-app_frontend": {
                "IPAddress": "172.18.0.2",
                "Gateway": "172.18.0.1"
            }
        }
    },
    "Config": {
        "ExposedPorts": { "8080/tcp": {} },
        "Env": [
            "DATABASE_URL=postgresql://cargo_user:s3cur3_p4ss@inventory-db:5432/cargo_db",
            "REDIS_URL=redis://redis-cache:6379",
            "NODE_ENV=production"
        ],
        "Cmd": ["node", "server.js"]
    }
}]`;
                }
                if (target === 'inventory-db') {
                    return `[{
    "Id": "f6e5d4c3b2a1...",
    "Name": "/inventory-db",
    "State": { "Status": "running", "Running": true },
    "NetworkSettings": {
        "Networks": {
            "cargo-app_backend": {
                "IPAddress": "172.19.0.2",
                "Gateway": "172.19.0.1"
            }
        }
    }
}]`;
                }
                return 'Error: No such object: ' + target;
            }

            // docker network ls / inspect
            if (sub === 'network') {
                if (rest[0] === 'ls') {
                    return `NETWORK ID     NAME                  DRIVER    SCOPE
1a2b3c4d5e6f   bridge                bridge    local
7a8b9c0d1e2f   cargo-app_frontend    bridge    local
3a4b5c6d7e8f   cargo-app_backend     bridge    local
9a0b1c2d3e4f   host                  host      local
5a6b7c8d9e0f   none                  null      local`;
                }
                if (rest[0] === 'inspect') {
                    return B7Config._db.dockerInspectNetwork;
                }
                return 'Usage: docker network [ls|inspect <name>]';
            }

            // docker stats
            if (sub === 'stats') {
                return `CONTAINER ID   NAME           CPU %     MEM USAGE / LIMIT     MEM %     NET I/O           BLOCK I/O
a1b2c3d4e5f6   cargo-app      0.00%     0B / 64MiB            0.00%     0B / 0B           0B / 0B
f6e5d4c3b2a1   inventory-db   0.42%     45.2MiB / 8GiB        0.55%     12.4kB / 8.1kB    4.1MB / 2.3MB
b3c4d5e6f7a8   redis-cache    0.18%     8.1MiB / 8GiB         0.10%     2.1kB / 1.2kB     0B / 0B

Note: cargo-app shows 0% — container is in restart loop.`;
            }

            // docker exec
            if (sub === 'exec') {
                const container = rest.find(a => !a.startsWith('-'));
                if (container === 'cargo-app') return 'Error: Container is restarting, wait until the container is running';
                if (container === 'inventory-db') {
                    const cmd = rest.slice(rest.indexOf(container) + 1).join(' ');
                    if (cmd.includes('ping') && cmd.includes('cargo-app')) {
                        return 'ping: bad address \'cargo-app\' — Name resolution failure\n(inventory-db is on backend network; cargo-app is on frontend network)';
                    }
                    if (cmd.includes('psql') || cmd.includes('pg_isready')) {
                        return '/var/run/postgresql:5432 - accepting connections';
                    }
                    return 'Command executed in inventory-db container.';
                }
                return 'Error: No such container: ' + (container || '<name>');
            }

            // docker system df
            if (sub === 'system' && rest[0] === 'df') {
                return `TYPE            TOTAL     ACTIVE    SIZE      RECLAIMABLE
Images          4         3         892.1MB   245.3MB (27%)
Containers      3         3         12.4kB    0B (0%)
Local Volumes   1         1         156.2MB   0B (0%)
Build Cache     12        0         234.5MB   234.5MB`;
            }

            // docker images
            if (sub === 'images') {
                return `REPOSITORY        TAG            IMAGE ID       CREATED        SIZE
cargo-mgmt        v2.3.1         abc123def456   2 weeks ago    245MB
postgres          14-alpine      def456abc789   3 weeks ago    412MB
redis             7-alpine       789abc123def   3 weeks ago    38MB
node              18-alpine      456def789abc   1 month ago    178MB`;
            }

            if (sub === '' || !sub) {
                return 'Usage: docker [ps|logs|inspect|network|stats|exec|system|images] [options]';
            }

            return `docker: '${sub}' is not a docker command.`;
        },

        'docker-compose': function(args, term, engine) {
            const sub = args[0] || '';
            const argStr = args.join(' ');

            if (sub === 'ps') {
                return `     Name                   Command               State              Ports
---------------------------------------------------------------------------
cargo-app          docker-entrypoint.sh node ...   Restarting   0.0.0.0:80->80/tcp
inventory-db       docker-entrypoint.sh postgres   Up           5432/tcp
redis-cache        docker-entrypoint.sh redis ...  Up           6379/tcp`;
            }

            if (sub === 'logs') {
                const target = args[1] || '';
                if (target === 'cargo-app') return B7Config._db.cargoAppLogs;
                if (target === 'inventory-db') return B7Config._db.inventoryDbLogs;
                return B7Config._db.cargoAppLogs + '\n\n' + B7Config._db.inventoryDbLogs;
            }

            if (sub === 'config') {
                return B7Config._db.dockerComposeYml;
            }

            if (sub === 'up') {
                return `Creating network "cargo-app_frontend" with driver "bridge"
Creating network "cargo-app_backend" with driver "bridge"
Creating inventory-db  ... done
Creating redis-cache   ... done
Creating cargo-app     ... done

NOTE: cargo-app exited with code 1 — check docker logs cargo-app`;
            }

            if (sub === 'down') {
                return `Stopping cargo-app    ... done
Stopping redis-cache  ... done
Stopping inventory-db ... done
Removing cargo-app    ... done
Removing redis-cache  ... done
Removing inventory-db ... done
Removing network cargo-app_frontend
Removing network cargo-app_backend`;
            }

            return 'Usage: docker-compose [ps|logs|config|up|down] [service]';
        },

        'htop': function(args) {
            return `  CPU[||||||||               22.4%]   Tasks: 38, 112 thr; 1 running
  Mem[||||||||||||||     4.2G/8.0G]   Load average: 0.82 0.64 0.48
  Swp[                   0.0K/2.0G]   Uptime: 02:14:33

    PID USER      PRI  NI  VIRT   RES   SHR S CPU%  MEM%   TIME+  Command
    891 root       20   0  1.2G  142M  28M  S  2.1   1.7    8:42 /usr/bin/dockerd
   1204 999        20   0  412M   45M  12M  S  0.4   0.5    1:22 postgres: PostgreSQL
   1318 999        20   0   38M  8.1M  2.4M S  0.2   0.1    0:14 redis-server *:6379
   1102 root       20   0  812M   58M  18M  S  0.0   0.7    0:08 containerd`;
        },

        'top': function(args) {
            return `top - 18:56:33 up  2:14,  1 user,  load average: 0.82, 0.64, 0.48
Tasks:  38 total,   1 running,  37 sleeping,   0 stopped,   0 zombie
%Cpu(s): 22.4 us,  4.1 sy,  0.0 ni, 72.8 id,  0.5 wa,  0.0 hi,  0.2 si
MiB Mem :   8192.0 total,   3788.0 free,   4200.0 used,    204.0 buff/cache

    PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND
    891 root      20   0    1.2g  142.0m  28.0m S   2.1   1.7   8:42.14 dockerd
   1204 999       20   0  412.0m  45.0m   12.0m S   0.4   0.5   1:22.88 postgres
   1318 999       20   0   38.0m   8.1m    2.4m S   0.2   0.1   0:14.12 redis-server`;
        },

        'df': function(args) {
            if (args.includes('-h') || args.includes('-H')) {
                return `Filesystem      Size  Used Avail Use% Mounted on
/dev/sda1       250G   82G  168G  33% /
tmpfs           4.0G  412K  4.0G   1% /tmp
/dev/sda2        50G   12G   38G  24% /var/lib/docker`;
            }
            return 'Use: df -h';
        },

        'free': function(args) {
            if (args.includes('-h')) {
                return `               total        used        free      shared  buff/cache   available
Mem:           8.0Gi       4.1Gi       3.7Gi       128Mi       204Mi       3.5Gi
Swap:          2.0Gi          0B       2.0Gi`;
            }
            return 'Use: free -h';
        },

        'ps': function(args) {
            if (args.includes('aux') || args.includes('-ef')) {
                return `USER         PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root           1  0.0  0.1 168000 12000 ?        Ss   18:42   0:02 /lib/systemd/systemd
root         891  2.1  1.7 1258291 142000 ?      Sl   18:42   8:42 /usr/bin/dockerd
root        1102  0.0  0.7 831488 58000 ?        Sl   18:42   0:08 containerd
999         1204  0.4  0.5 421888 45000 ?        Ssl  18:42   1:22 postgres
999         1318  0.2  0.1  38912  8100 ?        Ssl  18:42   0:14 redis-server *:6379
cargo_ops   2001  0.0  0.0  22528  4800 pts/0    Ss   18:55   0:00 -bash`;
            }
            return 'Usage: ps [aux|-ef]';
        },

        'netstat': function(args) {
            return `Active Internet connections (servers and established)
Proto Recv-Q Send-Q Local Address           Foreign Address         State
tcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN
tcp        0      0 0.0.0.0:80              0.0.0.0:*               LISTEN
tcp        0      0 172.19.0.2:5432         0.0.0.0:*               LISTEN
tcp        0      0 172.19.0.3:6379         0.0.0.0:*               LISTEN`;
        },

        'ss': function(args) {
            return `Netid  State   Recv-Q  Send-Q  Local Address:Port   Peer Address:Port
tcp    LISTEN  0       128     0.0.0.0:22            0.0.0.0:*
tcp    LISTEN  0       128     0.0.0.0:80            0.0.0.0:*
tcp    LISTEN  0       244     172.19.0.2:5432       0.0.0.0:*
tcp    LISTEN  0       511     172.19.0.3:6379       0.0.0.0:*`;
        },

        'ping': function(args) {
            const target = args.find(a => !a.startsWith('-')) || '';
            if (!target) return 'Usage: ping [-c count] destination';
            if (target === 'localhost' || target === '127.0.0.1' || target === '10.10.14.5') {
                return `PING ${target} 56(84) bytes of data.\n64 bytes from ${target}: icmp_seq=1 ttl=64 time=0.028 ms\n--- ${target} ping statistics ---\n1 packets transmitted, 1 received, 0% packet loss`;
            }
            return `ping: ${target}: Name or service not known`;
        },

        'ip': function(args) {
            if (args[0] === 'a' || args[0] === 'addr') {
                return `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536\n    inet 127.0.0.1/8 scope host lo\n2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500\n    inet 10.10.14.5/24 brd 10.10.14.255 scope global eth0\n3: docker0: <NO-CARRIER,BROADCAST,MULTICAST,UP> mtu 1500\n    inet 172.17.0.1/16 scope global docker0\n4: br-7a8b9c0d1e2f: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500\n    inet 172.18.0.1/16 scope global br-7a8b9c0d1e2f\n5: br-3a4b5c6d7e8f: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500\n    inet 172.19.0.1/16 scope global br-3a4b5c6d7e8f`;
            }
            return 'Usage: ip [addr|route|link]';
        },

        'curl': function(args) {
            const url = args.find(a => /^https?:\/\//.test(a)) || args.filter(a => !a.startsWith('-')).pop() || '';
            if (!url) return 'curl: try \'curl --help\' for more information';
            if (url.includes('localhost') || url.includes('10.10.14.5') || url.includes('127.0.0.1')) {
                if (url.includes('/status')) {
                    return '{"status":"operational","database":true,"cache":true,"uptime":142,"verification":"{{FLAG:root}}"}';
                }
                return '<html><body><h1>502 Bad Gateway</h1><p>The cargo management application is not responding.</p><p>nginx/1.24.0</p></body></html>';
            }
            return `curl: (7) Failed to connect: Connection refused`;
        },

        'nmap': function(args) {
            if (args.length === 0) return 'Usage: nmap [options] <target>';
            return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 10.10.14.5
Host is up (0.00028s latency).

PORT     STATE SERVICE
22/tcp   open  ssh
80/tcp   open  http

Nmap done: 1 IP address (1 host up) scanned in 0.82 seconds`;
        },

        'systemctl': function(args) {
            if (args.includes('docker')) {
                return `docker.service - Docker Application Container Engine
     Loaded: loaded (/lib/systemd/system/docker.service; enabled)
     Active: active (running) since Wed 2026-03-13 18:42:00 UTC
   Main PID: 891 (dockerd)
     Tasks: 48
     Memory: 142.0M
     CGroup: /system.slice/docker.service
             \u2514 891 /usr/bin/dockerd -H fd:// --containerd=/run/containerd/containerd.sock`;
            }
            return 'Unit not found.';
        },

        'journalctl': function(args) {
            const argStr = args.join(' ');
            if (argStr.includes('docker')) {
                return `-- Journal begins at Wed 2026-03-13 18:42:00 UTC --
Mar 13 18:42:00 ASV-CARGO-01 dockerd[891]: Starting Docker daemon
Mar 13 18:42:01 ASV-CARGO-01 dockerd[891]: Docker daemon started
Mar 13 18:44:02 ASV-CARGO-01 dockerd[891]: Container cargo-app started
Mar 13 18:44:15 ASV-CARGO-01 dockerd[891]: Container cargo-app exited with code 1
Mar 13 18:44:16 ASV-CARGO-01 dockerd[891]: Container cargo-app restarting (restart policy: always)`;
            }
            return 'No journal entries matching criteria.';
        },

        'whoami': function() { return 'cargo_ops'; },
        'id': function() { return 'uid=1000(cargo_ops) gid=1000(cargo_ops) groups=1000(cargo_ops),27(sudo),999(docker)'; },
        'hostname': function() { return 'ASV-CARGO-01'; },
        'uname': function(args) {
            if (args.includes('-a')) return 'Linux ASV-CARGO-01 5.15.0-91-generic #101-Ubuntu SMP x86_64 GNU/Linux';
            return 'Linux';
        },
        'uptime': function() { return ' 18:56:33 up  2:14,  1 user,  load average: 0.82, 0.64, 0.48'; },
        'history': function() {
            return `    1  sudo docker ps -a\n    2  sudo docker logs cargo-app\n    3  cat /opt/cargo-app/docker-compose.yml\n    4  sudo docker network ls\n    5  sudo docker inspect cargo-app`;
        },
        'man': function(args) {
            if (!args[0]) return 'What manual page do you want?';
            return `${args[0].toUpperCase()}(1) — Use '${args[0]} --help' for quick usage.`;
        },
        'find': function(args) {
            const argStr = args.join(' ');
            if (argStr.includes('docker-compose') || argStr.includes('Dockerfile')) {
                return '/opt/cargo-app/docker-compose.yml\n/opt/cargo-app/app/Dockerfile';
            }
            return 'find: specify search path and criteria';
        },
        'head': function(args) { return 'Use cat to view file contents.'; },
        'tail': function(args) { return 'Use cat to view file contents.'; },
        'less': function(args) { return 'Use cat to view file contents.'; },
        'wc': function(args) { return '  42 /opt/cargo-app/docker-compose.yml'; },
        'file': function(args) { return (args[0] || 'file') + ': ASCII text'; },
        'echo': function(args) { return args.join(' '); },
        'export': function(args) { return ''; },
        'sudo': function(args, term, engine) {
            const cmd = args[0];
            if (cmd && B7Config.commands[cmd]) {
                return B7Config.commands[cmd](args.slice(1), term, engine);
            }
            return `sudo: ${cmd || 'command'}: command not found`;
        }
    },

    // ═══════════════════════════════════════════════════════
    // HTML HELPERS
    // ═══════════════════════════════════════════════════════

    _escHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    _stripHtml(html) {
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        return tmp.textContent.trim();
    }
};
