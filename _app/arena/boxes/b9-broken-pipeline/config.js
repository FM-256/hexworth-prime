/* ============================================================
   CTF ARENA — Box B9: The Broken Pipeline
   CI/CD Troubleshooting | Crimson Dawn Confederacy
   Config: Jenkins, build failures, dependency issues, pipeline config
   ============================================================ */

const B9Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'The Broken Pipeline',
    subtitle: 'CI/CD Troubleshooting — Crimson Dawn Confederacy',
    difficulty: 'Intermediate-Advanced',
    accent: '#10b981',
    storageKey: 'hexworth_ctf_b9',
    registryId: 'b9-broken-pipeline',
    trackerKey: 'ctf_b9',

    // ═══════════════════════════════════════════════════════
    // PHASE SYSTEM (Multi-layer troubleshooting chain)
    // ═══════════════════════════════════════════════════════

    phases: [
        {
            id: 'recon',
            name: 'Build Assessment',
            icon: '\uD83D\uDD0D',
            description: 'SSH into BUILD-DEFENSE-01 and review the CI/CD pipeline status. Examine recent build logs.',
            requiredFlags: [],
            mitre: ['T1046', 'T1082'],
            unlocks: ['diagnosis'],
            locked: false
        },
        {
            id: 'diagnosis',
            name: 'Pipeline Diagnosis',
            icon: '\uD83D\uDD29',
            description: 'Analyze build scripts, dependency configs, and environment variables. Find the root cause of build failures.',
            requiredFlags: [],
            mitre: ['T1190', 'T1592.004'],
            unlocks: ['remediation'],
            locked: true
        },
        {
            id: 'remediation',
            name: 'Remediation',
            icon: '\uD83D\uDD27',
            description: 'Fix the pipeline configuration, resolve dependency issues, and trigger a successful build.',
            requiredFlags: ['user'],
            mitre: ['T1059.004', 'T1098'],
            unlocks: ['verification'],
            locked: true
        },
        {
            id: 'verification',
            name: 'Verification',
            icon: '\u2705',
            description: 'Confirm the build pipeline runs green and retrieve the successful build verification token.',
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
                title: 'Check the build server',
                tip: 'Open the Terminal and explore the project: ls /opt/defense-compiler/ and check the CI config.',
                trigger: { event: 'command', match: { cmd: 'contains:ls' } }
            },
            {
                title: 'Review build logs',
                tip: 'Check the latest build output: cat /var/lib/jenkins/jobs/defense-compiler/builds/47/log',
                trigger: { event: 'command', match: { cmd: 'contains:cat' } }
            },
            {
                title: 'Analyze the pipeline config',
                tip: 'Read the Jenkinsfile and package.json for misconfigurations: cat /opt/defense-compiler/Jenkinsfile',
                trigger: { event: 'command', match: { cmd: 'contains:Jenkinsfile' } }
            },
            {
                title: 'Identify the failure',
                tip: 'The JAVA_HOME is wrong and a dependency is missing from the private registry. Check environment variables with printenv.',
                trigger: { event: 'flag_correct', match: { flagId: 'user' } }
            },
            {
                title: 'Fix and rebuild',
                tip: 'Correct JAVA_HOME, fix the dependency, and trigger a new build to get the verification token.',
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
            { flagId: 'user', objective: '4.1', description: 'Given a scenario, apply common security techniques to computing resources — Secure SDLC', skill: 'CI/CD Pipeline Analysis' },
            { flagId: 'user', objective: '4.5', description: 'Given a scenario, modify enterprise capabilities to enhance security — Build automation', skill: 'Build Configuration Troubleshooting' },
            { flagId: 'root', objective: '2.3', description: 'Given a scenario, apply mitigation techniques or controls to secure an environment — Patching', skill: 'Pipeline Restoration' },
            { flagId: 'root', objective: '4.4', description: 'Given a scenario, implement and maintain security processes — Change management', skill: 'Build Verification' }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // BOOT SEQUENCE
    // ═══════════════════════════════════════════════════════

    boot: {
        biosLines: [
            'BUILD-DEFENSE-01 BIOS v3.2.4',
            'Initializing hardware...',
            'Memory Test: 16384 MB OK',
            'Detecting drives... /dev/sda1 (512GB SSD)',
            'NIC: Intel I350 Gigabit — Link Up',
            'Boot device: /dev/sda1',
            'Loading GRUB...'
        ],
        grubEntries: [
            'Ubuntu 22.04.3 LTS (Build Server)',
            'Ubuntu 22.04.3 LTS (recovery mode)',
            'Advanced options for Ubuntu'
        ],
        loginUser: 'build_admin'
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
        user: 'build_admin',
        hostname: 'BUILD-DEFENSE-01',
        startDir: '/home/build_admin',
        welcome: 'Ubuntu 22.04.3 LTS — BUILD-DEFENSE-01 (CI/CD Build Server)\nLast login: Tue Mar 13 22:14:08 2026\n\n*** ALERT: BUILD-DEFENSE-01 pipeline — 12 consecutive failures ***\n*** Security patches are BLOCKED from deployment ***\n\nType \'help\' for available commands.\n'
    },

    // ═══════════════════════════════════════════════════════
    // SIMULATED DATA
    // ═══════════════════════════════════════════════════════

    _db: {
        jenkinsfile: `pipeline {
    agent any

    environment {
        JAVA_HOME = '/usr/lib/jvm/java-17-openjdk'
        MAVEN_HOME = '/usr/share/maven'
        DEPLOY_ENV = 'production'
        NEXUS_URL = 'https://nexus.crimson-dawn.internal:8443'
        NPM_TOKEN = credentials('npm-registry-token')
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://git.crimson-dawn.internal/defense-compiler.git'
            }
        }
        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }
        stage('Compile') {
            steps {
                sh 'npm run build'
            }
        }
        stage('Test') {
            steps {
                sh 'npm test'
            }
        }
        stage('Security Scan') {
            steps {
                sh 'npm audit --audit-level=critical'
            }
        }
        stage('Package') {
            steps {
                sh 'npm run package'
            }
        }
        stage('Deploy') {
            when {
                branch 'main'
            }
            steps {
                sh './scripts/deploy.sh \${DEPLOY_ENV}'
            }
        }
    }

    post {
        failure {
            echo 'Build failed! Check logs for details.'
        }
        success {
            echo 'Build #\${BUILD_NUMBER} completed successfully.'
        }
    }
}`,
        packageJson: `{
  "name": "@crimson-dawn/defense-compiler",
  "version": "4.7.2",
  "description": "Automated Defense Countermeasure Compiler",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc && webpack --mode production",
    "test": "jest --coverage --forceExit",
    "package": "tar -czf dist/defense-compiler-4.7.2.tar.gz -C dist .",
    "deploy": "node scripts/deploy.js",
    "lint": "eslint src/"
  },
  "dependencies": {
    "express": "^4.18.2",
    "winston": "^3.11.0",
    "axios": "^1.6.2",
    "@crimson-dawn/core-lib": "^2.1.0",
    "@crimson-dawn/crypto-utils": "^1.4.3",
    "pg": "^8.11.3",
    "jsonwebtoken": "^9.0.2"
  },
  "devDependencies": {
    "typescript": "^5.3.3",
    "webpack": "^5.89.0",
    "webpack-cli": "^5.1.4",
    "jest": "^29.7.0",
    "ts-jest": "^29.1.1",
    "eslint": "^8.55.0",
    "@types/node": "^20.10.0",
    "@types/express": "^4.17.21"
  },
  "repository": {
    "type": "git",
    "url": "https://git.crimson-dawn.internal/defense-compiler.git"
  }
}`,
        buildLog: `Started by user build_admin
Running in /var/lib/jenkins/workspace/defense-compiler
[Pipeline] stage (Checkout)
[Pipeline] git
Cloning repository https://git.crimson-dawn.internal/defense-compiler.git
Checking out branch main at commit a4f8c21
[Pipeline] stage (Install Dependencies)
[Pipeline] sh
+ npm ci
npm WARN config This environment has JAVA_HOME set to /usr/lib/jvm/java-17-openjdk
npm WARN config but /usr/lib/jvm/java-17-openjdk does not exist on this system.
npm WARN config The correct JAVA_HOME on this system is /usr/lib/jvm/java-11-openjdk-amd64
npm ERR! code E404
npm ERR! 404 Not Found - GET https://nexus.crimson-dawn.internal:8443/repository/npm-private/@crimson-dawn/core-lib/-/core-lib-2.1.0.tgz
npm ERR! 404 '@crimson-dawn/core-lib@^2.1.0' is not in this registry.
npm ERR! 404
npm ERR! 404 Note: The package was moved to the new registry at:
npm ERR! 404   https://nexus2.crimson-dawn.internal:8443/repository/npm-releases/
npm ERR! 404 The old Nexus server (nexus.crimson-dawn.internal) was decommissioned on 2026-02-28.

npm ERR! A complete log of this run can be found in:
npm ERR!     /var/lib/jenkins/.npm/_logs/2026-03-13T22_14_08_123Z-debug.log

Build FAILED at stage: Install Dependencies
Build #47 — FAILURE
Duration: 34 seconds`,
        npmDebugLog: `0 verbose cli /usr/bin/node /usr/bin/npm
1 info using npm@10.2.4
2 info using node@v18.19.0
3 verbose config JAVA_HOME=/usr/lib/jvm/java-17-openjdk (does not exist)
4 verbose config correct path: /usr/lib/jvm/java-11-openjdk-amd64
5 http fetch GET 200 https://registry.npmjs.org/express/-/express-4.18.2.tgz
6 http fetch GET 200 https://registry.npmjs.org/winston/-/winston-3.11.0.tgz
7 http fetch GET 404 https://nexus.crimson-dawn.internal:8443/repository/npm-private/@crimson-dawn/core-lib/-/core-lib-2.1.0.tgz
8 verbose error 404 Not Found: @crimson-dawn/core-lib@^2.1.0
9 error note: Package moved to nexus2.crimson-dawn.internal:8443
10 http fetch GET 404 https://nexus.crimson-dawn.internal:8443/repository/npm-private/@crimson-dawn/crypto-utils/-/crypto-utils-1.4.3.tgz
11 verbose error 404 Not Found: @crimson-dawn/crypto-utils@^1.4.3
12 error Both @crimson-dawn packages are on the NEW Nexus server
13 timing npm:ci Completed in 34123ms
14 verbose exit 1`,
        npmrc: `# npm configuration for defense-compiler
registry=https://registry.npmjs.org/
@crimson-dawn:registry=https://nexus.crimson-dawn.internal:8443/repository/npm-private/
//nexus.crimson-dawn.internal:8443/repository/npm-private/:_authToken=\${NPM_TOKEN}
always-auth=true`,
        envVars: {
            JAVA_HOME: '/usr/lib/jvm/java-17-openjdk',
            MAVEN_HOME: '/usr/share/maven',
            NODE_VERSION: 'v18.19.0',
            NPM_VERSION: '10.2.4',
            PATH: '/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/lib/jvm/java-17-openjdk/bin',
            JENKINS_HOME: '/var/lib/jenkins',
            WORKSPACE: '/var/lib/jenkins/workspace/defense-compiler',
            BUILD_NUMBER: '47',
            DEPLOY_ENV: 'production',
            NEXUS_URL: 'https://nexus.crimson-dawn.internal:8443'
        }
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
            text: 'Start by reading the build log: cat /var/lib/jenkins/jobs/defense-compiler/builds/47/log. The error message tells you exactly which stage failed and why.',
            cost: 10,
            penalty: -10
        },
        {
            id: 'hint2',
            text: 'The build fails at "Install Dependencies" with a 404 error for @crimson-dawn/core-lib. The package is not found at the configured Nexus URL. Check the .npmrc file and the npm debug log.',
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint3',
            text: 'Two issues: (1) The .npmrc points to nexus.crimson-dawn.internal which was decommissioned. The new server is nexus2.crimson-dawn.internal. (2) JAVA_HOME is set to a non-existent path. Check printenv and ls /usr/lib/jvm/.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint4',
            text: 'The user flag is the misconfigured .npmrc registry URL: @crimson-dawn:registry=https://nexus.crimson-dawn.internal:8443/... (wrong server). Fix it to nexus2 and also fix JAVA_HOME to /usr/lib/jvm/java-11-openjdk-amd64. After fixing, trigger a build to get the root flag.',
            cost: 75,
            penalty: -75
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'The Automated Defense Compiler, a critical CI/CD pipeline responsible for building and deploying the Confederacy\'s defensive countermeasures, has ground to a halt. All recent builds are failing during the Install Dependencies stage. Developers cannot push security patches, and critical vulnerabilities are accumulating. The error messages are cryptic, and the build team is desperate.',
        scenario: 'The Confederacy\'s internal Nexus repository server was migrated from nexus.crimson-dawn.internal to nexus2.crimson-dawn.internal on 2026-02-28. However, the CI/CD pipeline\'s .npmrc configuration was never updated to point to the new server. Additionally, a system upgrade changed the available Java version from OpenJDK 17 to OpenJDK 11, but the Jenkinsfile still references the old JAVA_HOME path. These two misconfigurations have caused 12 consecutive build failures.',
        outro: 'The Broken Pipeline flows once more. With the Nexus registry URL corrected and JAVA_HOME properly configured, Build #48 completes successfully. The Confederacy\'s defensive countermeasures can once again be compiled, tested, and deployed. The backlog of security patches begins to clear.',
        ecer: {
            executive: 'Infrastructure migration (Nexus) had no downstream impact assessment; no notification to dependent teams',
            culture: 'No configuration-as-code review process; manual config changes not tracked in version control',
            employee: 'Operations team decommissioned old Nexus without verifying all consumers were migrated',
            regulatory: 'No change management board review for infrastructure migrations affecting build pipelines'
        }
    },

    // ═══════════════════════════════════════════════════════
    // WEB APP — Jenkins Dashboard
    // ═══════════════════════════════════════════════════════

    webApp: {
        startUrl: 'http://10.10.14.5:8080/jenkins/',

        pages: {
            '/jenkins/': {
                title: 'Jenkins — BUILD-DEFENSE-01',
                html: `
                    <div style="text-align:center; margin-bottom:30px; padding-bottom:20px; border-bottom:1px solid #ddd;">
                        <h1 style="color:#10b981; font-size:1.6rem; font-family:Georgia,serif; margin-bottom:4px;">Jenkins CI/CD Dashboard</h1>
                        <div style="color:#888; font-size:0.8rem;">BUILD-DEFENSE-01 &mdash; Automated Defense Compiler</div>
                    </div>

                    <div style="max-width:700px; margin:0 auto;">
                        <div style="background:#fef2f2; border:1px solid #fca5a5; border-radius:6px; padding:16px; margin-bottom:20px;">
                            <div style="color:#dc2626; font-weight:700; margin-bottom:8px;">PIPELINE STATUS: FAILED</div>
                            <div style="font-size:0.8rem; color:#7f1d1d; line-height:1.6;">
                                <div>Job: defense-compiler &mdash; Build #47 FAILED</div>
                                <div>Stage: Install Dependencies</div>
                                <div>Error: npm ERR! 404 '@crimson-dawn/core-lib@^2.1.0' is not in this registry</div>
                                <div>Last Success: Build #35 (2026-02-27)</div>
                                <div style="margin-top:4px; color:#dc2626; font-weight:700;">12 consecutive failures since 2026-02-28</div>
                            </div>
                        </div>

                        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:14px; margin-bottom:12px;">
                            <div style="color:#64748b; font-size:0.7rem; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:8px;">Build History</div>
                            <div style="font-family:monospace; font-size:0.7rem; color:#334155; line-height:1.8;">
                                <div style="color:#dc2626;">#47  FAILURE  Install Dependencies  34s    Mar 13 22:14</div>
                                <div style="color:#dc2626;">#46  FAILURE  Install Dependencies  31s    Mar 13 18:00</div>
                                <div style="color:#dc2626;">#45  FAILURE  Install Dependencies  33s    Mar 12 22:00</div>
                                <div style="color:#dc2626;">#44  FAILURE  Install Dependencies  30s    Mar 12 14:00</div>
                                <div>...</div>
                                <div style="color:#16a34a;">#35  SUCCESS  Deploy               4m12s  Feb 27 16:30</div>
                            </div>
                        </div>
                    </div>
                `,
                formHandler: null
            },
            '/jenkins/build/48': {
                title: 'Build #48 — SUCCESS',
                html: `
                    <div style="text-align:center; padding:40px;">
                        <h1 style="color:#16a34a; font-size:1.4rem;">Build #48 — SUCCESS</h1>
                        <div style="color:#888; font-size:0.8rem; margin-top:8px;">All stages completed successfully</div>
                        <div style="margin-top:20px; padding:16px; background:#f0fdf4; border:1px solid #86efac; border-radius:6px;">
                            <div style="font-family:monospace; font-size:0.7rem; color:#334155; line-height:1.8; text-align:left;">
                                <div style="color:#16a34a;">Checkout ........... PASS (2s)</div>
                                <div style="color:#16a34a;">Install Dependencies PASS (45s)</div>
                                <div style="color:#16a34a;">Compile ........... PASS (28s)</div>
                                <div style="color:#16a34a;">Test .............. PASS (1m12s)</div>
                                <div style="color:#16a34a;">Security Scan ..... PASS (18s)</div>
                                <div style="color:#16a34a;">Package ........... PASS (8s)</div>
                                <div style="color:#16a34a;">Deploy ............ PASS (34s)</div>
                            </div>
                            <div style="margin-top:16px; font-family:monospace; color:#16a34a; font-size:0.85rem; font-weight:700;">{{FLAG:root}}</div>
                            <div style="color:#64748b; font-size:0.7rem; margin-top:4px;">Build verification token — pipeline restored</div>
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
                        'build_admin': {
                            type: 'dir',
                            children: {
                                'notes.txt': {
                                    type: 'file',
                                    content: '=== MISSION BRIEFING ===\nTarget: BUILD-DEFENSE-01 (localhost)\nSystem: Jenkins CI/CD Build Server\nObjective: Diagnose and fix the failing build pipeline\n\nReported symptoms:\n1. 12 consecutive build failures since 2026-02-28\n2. Fails at "Install Dependencies" stage\n3. npm packages not found\n4. Security patches cannot be deployed\n\nProject location: /opt/defense-compiler/\nJenkins home: /var/lib/jenkins/\n\nGood luck, operator.'
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'ssh build_admin@BUILD-DEFENSE-01\ncd /opt/defense-compiler\ncat Jenkinsfile\nnpm ci\nprintenv | grep JAVA\ncat /var/lib/jenkins/jobs/defense-compiler/builds/47/log'
                                }
                            }
                        }
                    }
                },
                'opt': {
                    type: 'dir',
                    children: {
                        'defense-compiler': {
                            type: 'dir',
                            children: {
                                'Jenkinsfile': {
                                    type: 'file',
                                    content: null  // From _db
                                },
                                'package.json': {
                                    type: 'file',
                                    content: null  // From _db
                                },
                                '.npmrc': {
                                    type: 'file',
                                    content: null  // From _db
                                },
                                'src': {
                                    type: 'dir',
                                    children: {
                                        'index.ts': {
                                            type: 'file',
                                            content: 'import express from \'express\';\nimport { CoreLib } from \'@crimson-dawn/core-lib\';\nimport { CryptoUtils } from \'@crimson-dawn/crypto-utils\';\n\nconst app = express();\nconst core = new CoreLib();\nconst crypto = new CryptoUtils();\n\napp.get(\'/status\', (req, res) => {\n  res.json({ status: \'operational\', version: \'4.7.2\' });\n});\n\nexport default app;\n'
                                        },
                                        'compiler.ts': {
                                            type: 'file',
                                            content: '// Defense Countermeasure Compiler\n// Processes threat signatures and generates defense rules\n\nimport { CoreLib } from \'@crimson-dawn/core-lib\';\n\nexport class DefenseCompiler {\n  private core: CoreLib;\n\n  constructor() {\n    this.core = new CoreLib();\n  }\n\n  compile(signatures: string[]): string[] {\n    return signatures.map(sig => this.core.processSignature(sig));\n  }\n}\n'
                                        }
                                    }
                                },
                                'scripts': {
                                    type: 'dir',
                                    children: {
                                        'deploy.sh': {
                                            type: 'file',
                                            content: '#!/bin/bash\n# Deploy to production\nENV=$1\necho "Deploying defense-compiler v4.7.2 to $ENV..."\necho "Uploading artifacts to deployment server..."\necho "Running smoke tests..."\necho "Deployment complete."'
                                        }
                                    }
                                },
                                'tsconfig.json': {
                                    type: 'file',
                                    content: '{\n  "compilerOptions": {\n    "target": "ES2020",\n    "module": "commonjs",\n    "outDir": "./dist",\n    "rootDir": "./src",\n    "strict": true,\n    "esModuleInterop": true\n  },\n  "include": ["src/**/*"]\n}'
                                }
                            }
                        }
                    }
                },
                'var': {
                    type: 'dir',
                    children: {
                        'lib': {
                            type: 'dir',
                            children: {
                                'jenkins': {
                                    type: 'dir',
                                    children: {
                                        'jobs': {
                                            type: 'dir',
                                            children: {
                                                'defense-compiler': {
                                                    type: 'dir',
                                                    children: {
                                                        'builds': {
                                                            type: 'dir',
                                                            children: {
                                                                '47': {
                                                                    type: 'dir',
                                                                    children: {
                                                                        'log': {
                                                                            type: 'file',
                                                                            content: null  // From _db.buildLog
                                                                        }
                                                                    }
                                                                },
                                                                '35': {
                                                                    type: 'dir',
                                                                    children: {
                                                                        'log': {
                                                                            type: 'file',
                                                                            content: 'Started by user build_admin\n[Pipeline] stage (Checkout)\nCheckout completed.\n[Pipeline] stage (Install Dependencies)\nnpm ci completed in 42s.\n[Pipeline] stage (Compile)\nCompilation successful.\n[Pipeline] stage (Test)\n47 tests passed, 0 failed.\n[Pipeline] stage (Security Scan)\nnpm audit: 0 vulnerabilities found.\n[Pipeline] stage (Package)\nPackage created: defense-compiler-4.7.1.tar.gz\n[Pipeline] stage (Deploy)\nDeployed to production successfully.\nBuild #35 — SUCCESS\nDuration: 4m12s'
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        },
                                        '.npm': {
                                            type: 'dir',
                                            children: {
                                                '_logs': {
                                                    type: 'dir',
                                                    children: {
                                                        '2026-03-13T22_14_08_123Z-debug.log': {
                                                            type: 'file',
                                                            content: null  // From _db.npmDebugLog
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        'log': {
                            type: 'dir',
                            children: {
                                'jenkins': {
                                    type: 'dir',
                                    children: {
                                        'jenkins.log': {
                                            type: 'file',
                                            content: '2026-03-13 22:14:00 [INFO] Jenkins started.\n2026-03-13 22:14:02 [INFO] Job defense-compiler triggered (Build #47)\n2026-03-13 22:14:08 [ERROR] Build #47 FAILED: npm ci returned exit code 1\n2026-03-13 22:14:08 [INFO] Post-build: failure notification sent\n2026-03-13 22:14:09 [WARN] 12 consecutive failures for defense-compiler since Build #36'
                                        }
                                    }
                                },
                                'syslog': {
                                    type: 'file',
                                    content: 'Mar 13 22:14:00 BUILD-DEFENSE-01 jenkins[1847]: Build #47 started\nMar 13 22:14:08 BUILD-DEFENSE-01 jenkins[1847]: Build #47 FAILED\nMar 13 22:14:08 BUILD-DEFENSE-01 jenkins[1847]: Stage: Install Dependencies\nMar 13 22:14:09 BUILD-DEFENSE-01 systemd[1]: DNS resolution: nexus.crimson-dawn.internal -> NXDOMAIN'
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
                            content: 'BUILD-DEFENSE-01'
                        },
                        'passwd': {
                            type: 'file',
                            content: 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\njenkins:x:998:998:Jenkins CI:/var/lib/jenkins:/bin/false\nbuild_admin:x:1000:1000:Build Admin,,,:/home/build_admin:/bin/bash'
                        },
                        'environment': {
                            type: 'file',
                            content: 'PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"\nJAVA_HOME="/usr/lib/jvm/java-17-openjdk"\n# NOTE: java-17-openjdk was removed during system upgrade on 2026-03-01\n# The correct path is now /usr/lib/jvm/java-11-openjdk-amd64'
                        }
                    }
                },
                'usr': {
                    type: 'dir',
                    children: {
                        'lib': {
                            type: 'dir',
                            children: {
                                'jvm': {
                                    type: 'dir',
                                    children: {
                                        'java-11-openjdk-amd64': {
                                            type: 'dir',
                                            children: {
                                                'bin': {
                                                    type: 'dir',
                                                    children: {
                                                        'java': { type: 'file', content: '[BINARY: OpenJDK Runtime Environment 11.0.21]' },
                                                        'javac': { type: 'file', content: '[BINARY: OpenJDK Compiler 11.0.21]' }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        'share': {
                            type: 'dir',
                            children: {}
                        }
                    }
                },
                'tmp': {
                    type: 'dir',
                    children: {
                        'migration-notes.txt': {
                            type: 'file',
                            content: 'Nexus Repository Migration — 2026-02-28\n\nOLD: nexus.crimson-dawn.internal:8443\nNEW: nexus2.crimson-dawn.internal:8443\n\nMigration steps completed:\n1. Data migrated to nexus2 .... DONE\n2. DNS cutover ............... DONE (old DNS removed)\n3. Update CI/CD configs ...... PENDING\n4. Notify development teams .. PENDING\n5. Decommission old server ... DONE\n\nWhoops — steps 3 and 4 were never completed.\nThe old Nexus server no longer resolves.\n\n— ops_team'
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
  Network:    ping, netstat, ss, ip, curl, nmap
  Build:      npm, npx, node, java, javac, mvn, git, make
  Jenkins:    jenkins-cli
  Files:      find, head, tail, less, wc, file
  Services:   systemctl, journalctl
  Other:      sudo, man, echo, export, printenv

Type 'man <command>' for usage details.`;
        },

        'npm': function(args, term, engine) {
            const sub = args[0] || '';

            if (sub === 'ci' || sub === 'install') {
                return `npm WARN config JAVA_HOME=/usr/lib/jvm/java-17-openjdk does not exist
npm ERR! code E404
npm ERR! 404 Not Found - GET https://nexus.crimson-dawn.internal:8443/repository/npm-private/@crimson-dawn/core-lib/-/core-lib-2.1.0.tgz
npm ERR! 404 '@crimson-dawn/core-lib@^2.1.0' is not in this registry.
npm ERR! 404
npm ERR! 404 Note: The package was moved to the new registry at:
npm ERR! 404   https://nexus2.crimson-dawn.internal:8443/repository/npm-releases/
npm ERR! 404 The old Nexus server (nexus.crimson-dawn.internal) was decommissioned on 2026-02-28.

npm ERR! A complete log of this run can be found in:
npm ERR!     /var/lib/jenkins/.npm/_logs/2026-03-13T22_14_08_123Z-debug.log`;
            }

            if (sub === 'test') {
                return 'npm ERR! Cannot run tests — dependencies not installed. Run npm ci first.';
            }

            if (sub === 'run') {
                return 'npm ERR! Cannot run script — dependencies not installed. Run npm ci first.';
            }

            if (sub === 'audit') {
                return 'npm ERR! Cannot audit — dependencies not installed.';
            }

            if (sub === 'config' && args.includes('list')) {
                return `; "user" config from /home/build_admin/.npmrc\nregistry = "https://registry.npmjs.org/"\n@crimson-dawn:registry = "https://nexus.crimson-dawn.internal:8443/repository/npm-private/"\n\n; node bin location = /usr/bin/node\n; node version = v18.19.0\n; npm local prefix = /opt/defense-compiler\n; npm version = 10.2.4`;
            }

            return 'Usage: npm [ci|install|test|run|audit|config] [options]';
        },

        'node': function(args) {
            if (args.includes('--version') || args.includes('-v')) return 'v18.19.0';
            return 'Welcome to Node.js v18.19.0.\nType ".help" for more information.';
        },

        'java': function(args) {
            if (args.includes('-version') || args.includes('--version')) {
                return 'openjdk version "11.0.21" 2023-10-17\nOpenJDK Runtime Environment (build 11.0.21+9-Ubuntu-0ubuntu122.04)\nOpenJDK 64-Bit Server VM (build 11.0.21+9-Ubuntu-0ubuntu122.04, mixed mode, sharing)';
            }
            return 'Usage: java [options] <mainclass> [args...]';
        },

        'javac': function(args) {
            if (args.includes('-version')) return 'javac 11.0.21';
            return 'Usage: javac <options> <source files>';
        },

        'git': function(args) {
            const sub = args[0] || '';
            if (sub === 'log') {
                return `commit a4f8c21 (HEAD -> main, origin/main)
Author: dev_team <dev@crimson-dawn.internal>
Date:   Wed Mar 13 18:00:00 2026

    chore: bump version to 4.7.2

commit b5e9d32
Author: dev_team <dev@crimson-dawn.internal>
Date:   Mon Mar 11 14:30:00 2026

    fix: patch critical auth bypass vulnerability

commit c6f0e43
Author: dev_team <dev@crimson-dawn.internal>
Date:   Fri Feb 28 16:00:00 2026

    feat: add new threat signature processor`;
            }
            if (sub === 'status') return 'On branch main\nYour branch is up to date with \'origin/main\'.\n\nnothing to commit, working tree clean';
            if (sub === 'diff') return '';
            return 'Usage: git [log|status|diff|branch]';
        },

        'printenv': function(args) {
            const db = B9Config._db;
            if (args.length > 0) {
                const key = args[0];
                return db.envVars[key] || '';
            }
            let output = '';
            for (const [k, v] of Object.entries(db.envVars)) {
                output += `${k}=${v}\n`;
            }
            return output.trim();
        },

        'jenkins-cli': function(args) {
            const sub = args[0] || '';
            if (sub === 'build' || sub === 'trigger') {
                return `Build #48 triggered for defense-compiler.
Waiting for build to complete...

[Pipeline] stage (Checkout) ......... PASS
[Pipeline] stage (Install Deps) ..... PASS
[Pipeline] stage (Compile) .......... PASS
[Pipeline] stage (Test) ............. PASS (47/47 tests passed)
[Pipeline] stage (Security Scan) .... PASS (0 vulnerabilities)
[Pipeline] stage (Package) .......... PASS
[Pipeline] stage (Deploy) ........... PASS

Build #48 — SUCCESS
Duration: 3m48s

Verification Token: {{FLAG:root}}`;
            }
            if (sub === 'list-jobs') return 'defense-compiler\ninfra-monitor\nlog-aggregator';
            if (sub === 'status') return 'defense-compiler: FAILED (Build #47)\nLast success: Build #35 (2026-02-27)';
            return 'Usage: jenkins-cli [build|trigger|list-jobs|status] [job-name]';
        },

        'make': function(args) { return 'make: *** No targets specified and no makefile found.  Stop.'; },
        'mvn': function(args) { return 'mvn: command not found (Maven not installed — this project uses npm)'; },

        'htop': function(args) {
            return `  CPU[||||||||               22.1%]   Tasks: 68, 184 thr; 1 running
  Mem[|||||||||||||     8.4G/16.0G]   Load average: 0.54 0.42 0.38
  Swp[                   0.0K/4.0G]   Uptime: 03:22:14

    PID USER      PRI  NI  VIRT   RES   SHR S CPU%  MEM%   TIME+  Command
   1847 jenkins    20   0  2.4G  1.8G  42M  S 12.4  11.2  42:18 java -jar /usr/share/java/jenkins.war
   2102 root       20   0  412M  38M  4200 S  0.4   0.2    1:22 /usr/sbin/sshd
    892 root       20   0  168M  12M  8400 S  0.1   0.1    0:42 /lib/systemd/systemd`;
        },

        'top': function(args) {
            return `top - 22:36:22 up  3:22,  1 user,  load average: 0.54, 0.42, 0.38
Tasks:  68 total,   1 running,  67 sleeping
%Cpu(s): 22.1 us,  3.2 sy,  0.0 ni, 74.2 id,  0.3 wa
MiB Mem :  16384.0 total,   7600.0 free,   8400.0 used,    384.0 buff/cache

    PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM COMMAND
   1847 jenkins   20   0    2.4g   1.8g  42.0m S  12.4  11.2 java
   2102 root      20   0  412.0m  38.0m   4.2m S   0.4   0.2 sshd`;
        },

        'df': function(args) {
            if (args.includes('-h') || args.includes('-H')) {
                return `Filesystem      Size  Used Avail Use% Mounted on
/dev/sda1       500G  142G  358G  28% /
tmpfs           8.0G  412K  8.0G   1% /tmp`;
            }
            return 'Use: df -h';
        },

        'free': function(args) {
            return `               total        used        free      shared  buff/cache   available
Mem:            16Gi       8.2Gi       7.4Gi       128Mi       384Mi       7.2Gi
Swap:          4.0Gi          0B       4.0Gi`;
        },

        'ps': function(args) {
            if (args.includes('aux') || args.includes('-ef')) {
                return `USER         PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root           1  0.0  0.1 168000 12000 ?        Ss   22:14   0:42 /lib/systemd/systemd
jenkins     1847 12.4 11.2 2516582 1887436 ?     Sl   22:14  42:18 java -jar /usr/share/java/jenkins.war
root        2102  0.4  0.2 421888 38000 ?        Ss   22:14   1:22 /usr/sbin/sshd
build_adm   3401  0.0  0.0  22528  4800 pts/0    Ss   22:35   0:00 -bash`;
            }
            return 'Usage: ps [aux|-ef]';
        },

        'netstat': function(args) {
            return `Active Internet connections (servers and established)
Proto Recv-Q Send-Q Local Address           Foreign Address         State
tcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN
tcp        0      0 0.0.0.0:8080            0.0.0.0:*               LISTEN
tcp6       0      0 :::8080                 :::*                    LISTEN`;
        },

        'ss': function(args) {
            return `Netid  State   Recv-Q  Send-Q  Local Address:Port   Peer Address:Port
tcp    LISTEN  0       128     0.0.0.0:22            0.0.0.0:*
tcp    LISTEN  0       128     0.0.0.0:8080          0.0.0.0:*`;
        },

        'ping': function(args) {
            const target = args.find(a => !a.startsWith('-')) || '';
            if (!target) return 'Usage: ping [-c count] destination';
            if (target === 'nexus.crimson-dawn.internal') {
                return `ping: nexus.crimson-dawn.internal: Name or service not known\n(DNS: NXDOMAIN — server decommissioned on 2026-02-28)`;
            }
            if (target === 'nexus2.crimson-dawn.internal') {
                return `PING nexus2.crimson-dawn.internal (10.10.14.100) 56(84) bytes of data.\n64 bytes from 10.10.14.100: icmp_seq=1 ttl=64 time=1.234 ms\n--- nexus2.crimson-dawn.internal ping statistics ---\n1 packets transmitted, 1 received, 0% packet loss`;
            }
            if (target === 'localhost' || target === '127.0.0.1') {
                return `PING ${target} 56(84) bytes of data.\n64 bytes from 127.0.0.1: icmp_seq=1 ttl=64 time=0.012 ms\n1 packets transmitted, 1 received, 0% packet loss`;
            }
            return `ping: ${target}: Name or service not known`;
        },

        'nmap': function(args) {
            if (args.length === 0) return 'Usage: nmap [options] <target>';
            return `Starting Nmap 7.94\nNmap scan report for 10.10.14.5\nHost is up.\n\nPORT     STATE SERVICE\n22/tcp   open  ssh\n8080/tcp open  http-proxy (Jenkins)\n\nNmap done: 1 IP address (1 host up)`;
        },

        'curl': function(args) {
            const url = args.find(a => /^https?:\/\//.test(a)) || args.filter(a => !a.startsWith('-')).pop() || '';
            if (!url) return 'curl: try \'curl --help\' for more information';
            if (url.includes('nexus.crimson-dawn.internal')) {
                return 'curl: (6) Could not resolve host: nexus.crimson-dawn.internal\n(DNS: NXDOMAIN — old Nexus server decommissioned)';
            }
            if (url.includes('nexus2.crimson-dawn.internal')) {
                return '{"status":"online","server":"Nexus Repository Manager 3.64.0","repositories":["npm-releases","npm-private","maven-central"]}';
            }
            if (url.includes('localhost:8080') || url.includes('10.10.14.5:8080')) {
                return '<html><head><title>Jenkins</title></head><body><h1>Jenkins CI/CD Dashboard</h1><p>defense-compiler: FAILED (Build #47)</p></body></html>';
            }
            return `curl: (7) Failed to connect: Connection refused`;
        },

        'ip': function(args) {
            if (args[0] === 'a' || args[0] === 'addr') {
                return `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536\n    inet 127.0.0.1/8 scope host lo\n2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500\n    inet 10.10.14.5/24 brd 10.10.14.255 scope global eth0`;
            }
            return 'Usage: ip [addr|route|link]';
        },

        'systemctl': function(args) {
            if (args.includes('jenkins')) {
                return `jenkins.service - Jenkins Continuous Integration Server
     Loaded: loaded (/lib/systemd/system/jenkins.service; enabled)
     Active: active (running) since Wed 2026-03-13 22:14:00 UTC
   Main PID: 1847 (java)
     Memory: 1.8G
     CGroup: /system.slice/jenkins.service
             \u2514 1847 java -jar /usr/share/java/jenkins.war --httpPort=8080`;
            }
            return 'Unit not found.';
        },

        'journalctl': function(args) {
            const argStr = args.join(' ');
            if (argStr.includes('jenkins')) {
                return `Mar 13 22:14:00 BUILD-DEFENSE-01 jenkins[1847]: Jenkins started\nMar 13 22:14:02 BUILD-DEFENSE-01 jenkins[1847]: Build #47 triggered\nMar 13 22:14:08 BUILD-DEFENSE-01 jenkins[1847]: Build #47 FAILED: npm ERR! 404`;
            }
            return 'No journal entries matching criteria.';
        },

        'whoami': function() { return 'build_admin'; },
        'id': function() { return 'uid=1000(build_admin) gid=1000(build_admin) groups=1000(build_admin),27(sudo),998(jenkins)'; },
        'hostname': function() { return 'BUILD-DEFENSE-01'; },
        'uname': function(args) {
            if (args.includes('-a')) return 'Linux BUILD-DEFENSE-01 5.15.0-91-generic #101-Ubuntu SMP x86_64 GNU/Linux';
            return 'Linux';
        },
        'uptime': function() { return ' 22:36:22 up  3:22,  1 user,  load average: 0.54, 0.42, 0.38'; },
        'history': function() {
            return `    1  cd /opt/defense-compiler\n    2  cat Jenkinsfile\n    3  npm ci\n    4  printenv | grep JAVA\n    5  cat /var/lib/jenkins/jobs/defense-compiler/builds/47/log`;
        },
        'man': function(args) {
            if (!args[0]) return 'What manual page do you want?';
            return `${args[0].toUpperCase()}(1) — Use '${args[0]} --help' for quick usage.`;
        },
        'find': function(args) {
            const argStr = args.join(' ');
            if (argStr.includes('npmrc') || argStr.includes('.npmrc')) return '/opt/defense-compiler/.npmrc\n/home/build_admin/.npmrc';
            if (argStr.includes('jenkins') || argStr.includes('Jenkinsfile')) return '/opt/defense-compiler/Jenkinsfile\n/var/lib/jenkins/jobs/defense-compiler/';
            if (argStr.includes('jvm') || argStr.includes('java')) return '/usr/lib/jvm/java-11-openjdk-amd64/';
            return 'find: specify search path and criteria';
        },
        'head': function(args) { return 'Use cat to view file contents.'; },
        'tail': function(args) { return 'Use cat to view file contents.'; },
        'less': function(args) { return 'Use cat to view file contents.'; },
        'wc': function(args) { return '  48 /opt/defense-compiler/Jenkinsfile'; },
        'file': function(args) { return (args[0] || 'file') + ': ASCII text'; },
        'echo': function(args) { return args.join(' '); },
        'export': function(args) { return ''; },
        'sudo': function(args, term, engine) {
            const cmd = args[0];
            if (cmd && B9Config.commands[cmd]) {
                return B9Config.commands[cmd](args.slice(1), term, engine);
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
