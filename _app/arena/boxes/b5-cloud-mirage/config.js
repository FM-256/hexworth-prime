/* ============================================================
   CTF ARENA — Box B5: The Cloud Mirage
   Cloud Troubleshooting | AWS IAM & S3 Misconfigurations
   Config: simulated AWS CLI, IAM policies, S3, flags, hints, lore
   ============================================================ */

const B5Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'The Cloud Mirage',
    subtitle: 'Cloud Troubleshooting — AWS Misconfigurations',
    difficulty: 'Intermediate-Advanced',
    accent: '#f97316',
    storageKey: 'hexworth_ctf_b5',
    registryId: 'b5-cloud-mirage',
    trackerKey: 'ctf_b5',

    // ═══════════════════════════════════════════════════════
    // PHASE SYSTEM (Cloud troubleshooting chain)
    // ═══════════════════════════════════════════════════════

    phases: [
        {
            id: 'recon',
            name: 'Cloud Assessment',
            icon: '\uD83D\uDD0D',
            description: 'Verify EC2 instance status and review CloudWatch logs for S3 access errors.',
            requiredFlags: [],
            mitre: ['T1580', 'T1538'],
            unlocks: ['diagnosis'],
            locked: false
        },
        {
            id: 'diagnosis',
            name: 'IAM & Bucket Analysis',
            icon: '\uD83D\uDCCB',
            description: 'Inspect the IAM role attached to EC2-AGENT-01 and the S3-DATA-LAKE bucket policy.',
            requiredFlags: [],
            mitre: ['T1087.004', 'T1069.003'],
            unlocks: ['remediation'],
            locked: true
        },
        {
            id: 'remediation',
            name: 'Policy Identification',
            icon: '\uD83D\uDD27',
            description: 'Identify the exact missing permission and the policy JSON that would fix it.',
            requiredFlags: ['user'],
            mitre: ['T1098', 'T1078.004'],
            unlocks: ['verification'],
            locked: true
        },
        {
            id: 'verification',
            name: 'Verification',
            icon: '\u2705',
            description: 'Submit the corrected IAM policy JSON as the root flag.',
            requiredFlags: ['root'],
            mitre: ['T1497', 'T1082'],
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
                title: 'Check EC2 instance status',
                tip: 'Run: aws ec2 describe-instances to verify EC2-AGENT-01 is running and find its IAM role.',
                trigger: { event: 'command', match: { cmd: 'contains:ec2 describe' } }
            },
            {
                title: 'Review CloudWatch logs',
                tip: 'Run: aws logs get-log-events to see the S3 access denied errors from the agent.',
                trigger: { event: 'command', match: { cmd: 'contains:logs' } }
            },
            {
                title: 'Inspect the IAM role policies',
                tip: 'Run: aws iam list-attached-role-policies and aws iam get-policy-version to see what permissions exist.',
                trigger: {
                    event: 'command',
                    match: { cmd: 'contains:iam' },
                    alt: [
                        { event: 'command', match: { cmd: 'contains:get-policy' } }
                    ]
                }
            },
            {
                title: 'Identify the missing permission',
                tip: 'The IAM policy has s3:GetObject and s3:ListBucket but is missing s3:PutObject for the data lake bucket.',
                trigger: { event: 'flag_correct', match: { flagId: 'user' } }
            },
            {
                title: 'Submit the corrected policy JSON',
                tip: 'The root flag is the corrected JSON policy statement that adds s3:PutObject.',
                trigger: { event: 'flag_correct', match: { flagId: 'root' } }
            }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // CERT OBJECTIVES
    // ═══════════════════════════════════════════════════════

    certObjectives: {
        certPath: 'SY0-701',
        mappings: [
            { flagId: 'user', objective: '2.3', description: 'Given a scenario, summarize various types of vulnerabilities — Cloud-specific', skill: 'IAM Policy Analysis' },
            { flagId: 'user', objective: '3.3', description: 'Given a scenario, implement secure network designs — Cloud security', skill: 'S3 Bucket Policy Review' },
            { flagId: 'root', objective: '4.1', description: 'Given a scenario, apply common security techniques to computing resources — Cloud IAM', skill: 'Least Privilege Remediation' },
            { flagId: 'root', objective: '4.5', description: 'Given a scenario, modify enterprise capabilities to enhance security — Cloud config', skill: 'IAM Policy Authoring' }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // BOOT SEQUENCE
    // ═══════════════════════════════════════════════════════

    boot: {
        biosLines: [
            'AWS Cloud Shell v2.4.0',
            'Initializing session...',
            'Authenticating cloud_ops credentials...',
            'Region: us-east-1',
            'Account: 847209341526',
            'Session ready.'
        ],
        grubEntries: [
            'AWS CloudShell (Amazon Linux 2)',
            'Local Terminal'
        ],
        loginUser: 'cloud_ops'
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
        user: 'cloud_ops',
        hostname: 'cloudshell',
        startDir: '/home/cloud_ops',
        welcome: 'AWS CloudShell\nAmazon Linux 2 (Karoo)\n\nAuthenticated as: cloud_ops\nAccount: 847209341526\nRegion: us-east-1\n\n*** ALERT: Sky-Watch Initiative data pipeline is DOWN ***\n*** EC2-AGENT-01 cannot upload to S3-DATA-LAKE ***\n*** CloudWatch shows AccessDenied errors ***\n\nType \'help\' for available commands.\n'
    },

    // ═══════════════════════════════════════════════════════
    // SIMULATED FILESYSTEM
    // ═══════════════════════════════════════════════════════

    filesystem: {
        '/': {
            type: 'dir',
            children: {
                'home': {
                    type: 'dir',
                    children: {
                        'cloud_ops': {
                            type: 'dir',
                            children: {
                                'notes.txt': {
                                    type: 'file',
                                    content: '=== MISSION BRIEFING ===\nTarget: Sky-Watch Initiative AWS Infrastructure\n\nComponents:\n  EC2-AGENT-01  — Collects atmospheric data\n  S3-DATA-LAKE  — Central data storage bucket\n  SkyWatchAgentRole — IAM role attached to EC2\n  CloudWatch — Logging\n\nProblem: EC2-AGENT-01 cannot upload to S3-DATA-LAKE\n         CloudWatch shows AccessDenied errors\n         Suspected: IAM role misconfiguration\n\nYour Permissions (cloud_ops):\n  - ec2:DescribeInstances\n  - s3:ListBucket, s3:GetBucketPolicy\n  - iam:GetRole, iam:ListRolePolicies, iam:GetRolePolicy\n  - iam:ListAttachedRolePolicies, iam:GetPolicyVersion\n  - cloudwatch:DescribeLogStreams, cloudwatch:GetLogEvents\n  - NOTE: You cannot modify policies directly'
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'aws ec2 describe-instances --filters "Name=tag:Name,Values=EC2-AGENT-01"\naws logs describe-log-streams --log-group-name /aws/ec2/sky-watch-agent\naws iam list-attached-role-policies --role-name SkyWatchAgentRole'
                                },
                                '.aws': {
                                    type: 'dir',
                                    children: {
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
                'etc': {
                    type: 'dir',
                    children: {
                        'hostname': {
                            type: 'file',
                            content: 'cloudshell'
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
            text: 'Start with aws ec2 describe-instances to confirm EC2-AGENT-01 is running. Look for the IamInstanceProfile to find the attached role.',
            cost: 10,
            penalty: -10
        },
        {
            id: 'hint2',
            text: 'Check CloudWatch logs: aws logs get-log-events --log-group-name /aws/ec2/sky-watch-agent --log-stream-name agent-01. Look for AccessDenied on s3:PutObject.',
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint3',
            text: 'The SkyWatchAgentRole has s3:GetObject and s3:ListBucket but is MISSING s3:PutObject. The user flag is: {{FLAG:user}}',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint4',
            text: 'The root flag is the corrected policy JSON: {{FLAG:user}}',
            cost: 75,
            penalty: -75
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'The Sky-Watch Initiative, a cloud-based surveillance system, has stopped reporting data. EC2-AGENT-01 instances collect atmospheric anomaly data and upload it to the S3-DATA-LAKE bucket, but no new data has arrived. The instances are running healthy, yet CloudWatch logs show AccessDenied errors. A disgruntled former engineer\'s undocumented IAM changes are suspected.',
        scenario: 'Before leaving the organization, a disgruntled cloud engineer modified the SkyWatchAgentRole\'s IAM policy. They removed the s3:PutObject permission while leaving s3:GetObject and s3:ListBucket intact — a subtle sabotage designed to look like a routine policy tightening. The EC2 agents can read from S3 but can no longer write to it. CloudWatch captures the AccessDenied errors, but the operations team hasn\'t connected the dots.',
        outro: 'The Cloud Mirage is dispelled. The missing s3:PutObject permission has been identified, and the correct policy statement documented. The Sky-Watch Initiative can resume uploading atmospheric data to S3-DATA-LAKE. The saboteur\'s subtle IAM modification has been caught and cataloged for incident response.',
        ecer: {
            executive: 'No IAM policy change alerts or automated compliance checks on critical roles',
            culture: 'Departing engineer retained write access to IAM policies until after credential revocation',
            employee: 'Former engineer removed s3:PutObject permission as deliberate sabotage',
            regulatory: 'No least-privilege audit process detected the permission reduction on a critical service role'
        }
    },

    // ═══════════════════════════════════════════════════════
    // WEB SIMULATION (AWS Console Mock)
    // ═══════════════════════════════════════════════════════

    webApp: {
        startUrl: 'http://console.aws.skywatch.local/',

        pages: {
            '/': {
                title: 'Sky-Watch Initiative — AWS Dashboard',
                html: `
                    <div style="text-align:center; margin-bottom:30px; padding-bottom:20px; border-bottom:1px solid #444;">
                        <h1 style="color:#f97316; font-size:1.6rem; margin-bottom:4px;">Sky-Watch Initiative</h1>
                        <div style="color:#888; font-size:0.8rem;">AWS Cloud Infrastructure Dashboard</div>
                    </div>

                    <div style="max-width:600px; margin:0 auto;">
                        <div style="background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.3); border-radius:8px; padding:20px; margin-bottom:20px;">
                            <div style="color:#ef4444; font-size:1.1rem; font-weight:bold; margin-bottom:8px;">DATA PIPELINE FAILURE</div>
                            <div style="color:#888; font-size:0.85rem;">EC2-AGENT-01: Running (healthy)</div>
                            <div style="color:#888; font-size:0.85rem;">S3-DATA-LAKE: Accessible (no new objects since 18h ago)</div>
                            <div style="color:#888; font-size:0.85rem;">CloudWatch: 47 AccessDenied errors in last 6 hours</div>
                        </div>

                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:20px;">
                            <div style="background:rgba(255,255,255,0.05); border:1px solid #333; border-radius:8px; padding:16px;">
                                <div style="color:#aaa; font-size:0.75rem; letter-spacing:0.1em; margin-bottom:6px;">EC2 INSTANCES</div>
                                <div style="color:#22c55e; font-size:1.4rem; font-weight:bold;">1 Running</div>
                                <div style="color:#888; font-size:0.75rem;">i-0a1b2c3d4e5f6g7h8</div>
                            </div>
                            <div style="background:rgba(255,255,255,0.05); border:1px solid #333; border-radius:8px; padding:16px;">
                                <div style="color:#aaa; font-size:0.75rem; letter-spacing:0.1em; margin-bottom:6px;">S3 OBJECTS</div>
                                <div style="color:#f59e0b; font-size:1.4rem; font-weight:bold;">0 New</div>
                                <div style="color:#888; font-size:0.75rem;">Last upload: 18 hours ago</div>
                            </div>
                            <div style="background:rgba(255,255,255,0.05); border:1px solid #333; border-radius:8px; padding:16px;">
                                <div style="color:#aaa; font-size:0.75rem; letter-spacing:0.1em; margin-bottom:6px;">IAM ROLE</div>
                                <div style="color:#ccc; font-size:0.9rem; font-weight:bold;">SkyWatchAgentRole</div>
                                <div style="color:#888; font-size:0.75rem;">1 policy attached</div>
                            </div>
                            <div style="background:rgba(255,255,255,0.05); border:1px solid #333; border-radius:8px; padding:16px;">
                                <div style="color:#aaa; font-size:0.75rem; letter-spacing:0.1em; margin-bottom:6px;">CLOUDWATCH</div>
                                <div style="color:#ef4444; font-size:1.4rem; font-weight:bold;">47 Errors</div>
                                <div style="color:#888; font-size:0.75rem;">AccessDenied: s3:PutObject</div>
                            </div>
                        </div>
                    </div>
                `
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // TERMINAL COMMANDS
    // ═══════════════════════════════════════════════════════

    commands: {
        'aws': function(args, term, engine) {
            if (args.length === 0) return 'usage: aws [options] <command> <subcommand> [<subcommand> ...] [parameters]\n\naws ec2, aws s3, aws s3api, aws iam, aws logs, aws sts';

            const service = args[0];
            const subcmd = args[1] || '';
            const fullCmd = args.join(' ');

            // ── EC2 ──
            if (service === 'ec2') {
                if (subcmd === 'describe-instances') {
                    return JSON.stringify({
                        "Reservations": [{
                            "Instances": [{
                                "InstanceId": "i-0a1b2c3d4e5f6g7h8",
                                "InstanceType": "t3.medium",
                                "State": { "Name": "running", "Code": 16 },
                                "PublicIpAddress": "54.210.145.67",
                                "PrivateIpAddress": "172.31.22.10",
                                "IamInstanceProfile": {
                                    "Arn": "arn:aws:iam::847209341526:instance-profile/SkyWatchAgentProfile",
                                    "Id": "AIPA3XFRBF34QEXAMPLE"
                                },
                                "Tags": [
                                    { "Key": "Name", "Value": "EC2-AGENT-01" },
                                    { "Key": "Project", "Value": "Sky-Watch Initiative" },
                                    { "Key": "Environment", "Value": "production" }
                                ],
                                "LaunchTime": "2026-03-01T08:00:00.000Z",
                                "SubnetId": "subnet-0a1b2c3d",
                                "VpcId": "vpc-0e1f2g3h",
                                "SecurityGroups": [
                                    { "GroupId": "sg-0a1b2c3d4e5f", "GroupName": "sky-watch-agent-sg" }
                                ]
                            }]
                        }]
                    }, null, 2);
                }

                if (subcmd === 'describe-instance-status') {
                    return JSON.stringify({
                        "InstanceStatuses": [{
                            "InstanceId": "i-0a1b2c3d4e5f6g7h8",
                            "InstanceState": { "Name": "running" },
                            "SystemStatus": { "Status": "ok" },
                            "InstanceStatus": { "Status": "ok" }
                        }]
                    }, null, 2);
                }
            }

            // ── S3 / S3API ──
            if (service === 's3' || service === 's3api') {
                if (subcmd === 'ls' || subcmd === 'list-buckets') {
                    return `2026-01-15 08:00:00 s3-data-lake-skywatch
2026-01-15 08:00:01 s3-config-skywatch
2026-02-10 12:30:00 s3-logs-skywatch`;
                }

                if (fullCmd.includes('list-objects') || (subcmd === 'ls' && fullCmd.includes('s3-data-lake'))) {
                    return `2026-03-17 10:15:22    4096 atmospheric/scan-20260317-101522.json
2026-03-17 10:30:45    4096 atmospheric/scan-20260317-103045.json
2026-03-17 10:45:18    4096 atmospheric/scan-20260317-104518.json
2026-03-17 11:00:02    4096 atmospheric/scan-20260317-110002.json

NOTE: No objects newer than 2026-03-17 11:00:02 (18 hours ago)`;
                }

                if (subcmd === 'get-bucket-policy' || fullCmd.includes('get-bucket-policy')) {
                    return JSON.stringify({
                        "Policy": JSON.stringify({
                            "Version": "2012-10-17",
                            "Statement": [
                                {
                                    "Sid": "AllowAgentAccess",
                                    "Effect": "Allow",
                                    "Principal": {
                                        "AWS": "arn:aws:iam::847209341526:role/SkyWatchAgentRole"
                                    },
                                    "Action": [
                                        "s3:GetObject",
                                        "s3:PutObject",
                                        "s3:ListBucket"
                                    ],
                                    "Resource": [
                                        "arn:aws:s3:::s3-data-lake-skywatch",
                                        "arn:aws:s3:::s3-data-lake-skywatch/*"
                                    ]
                                }
                            ]
                        })
                    }, null, 2);
                }

                if (subcmd === 'get-bucket-logging') {
                    return JSON.stringify({
                        "LoggingEnabled": {
                            "TargetBucket": "s3-logs-skywatch",
                            "TargetPrefix": "data-lake-access/"
                        }
                    }, null, 2);
                }
            }

            // ── IAM ──
            if (service === 'iam') {
                if (subcmd === 'get-role' || fullCmd.includes('get-role')) {
                    return JSON.stringify({
                        "Role": {
                            "RoleName": "SkyWatchAgentRole",
                            "RoleId": "AROA3XFRBF34QEXAMPLE",
                            "Arn": "arn:aws:iam::847209341526:role/SkyWatchAgentRole",
                            "CreateDate": "2026-01-15T08:00:00Z",
                            "AssumeRolePolicyDocument": {
                                "Version": "2012-10-17",
                                "Statement": [{
                                    "Effect": "Allow",
                                    "Principal": { "Service": "ec2.amazonaws.com" },
                                    "Action": "sts:AssumeRole"
                                }]
                            },
                            "Description": "Role for Sky-Watch EC2 agents to access S3 data lake",
                            "MaxSessionDuration": 3600
                        }
                    }, null, 2);
                }

                if (subcmd === 'get-instance-profile' || fullCmd.includes('get-instance-profile')) {
                    return JSON.stringify({
                        "InstanceProfile": {
                            "InstanceProfileName": "SkyWatchAgentProfile",
                            "Roles": [{
                                "RoleName": "SkyWatchAgentRole",
                                "Arn": "arn:aws:iam::847209341526:role/SkyWatchAgentRole"
                            }]
                        }
                    }, null, 2);
                }

                if (subcmd === 'list-attached-role-policies' || fullCmd.includes('list-attached-role-policies')) {
                    return JSON.stringify({
                        "AttachedPolicies": [{
                            "PolicyName": "SkyWatchAgentPolicy",
                            "PolicyArn": "arn:aws:iam::847209341526:policy/SkyWatchAgentPolicy"
                        }]
                    }, null, 2);
                }

                if (subcmd === 'list-role-policies' || fullCmd.includes('list-role-policies')) {
                    return JSON.stringify({
                        "PolicyNames": []
                    }, null, 2);
                }

                if (subcmd === 'get-policy' || fullCmd.includes('get-policy')) {
                    return JSON.stringify({
                        "Policy": {
                            "PolicyName": "SkyWatchAgentPolicy",
                            "PolicyId": "ANPA3XFRBF34QEXAMPLE",
                            "Arn": "arn:aws:iam::847209341526:policy/SkyWatchAgentPolicy",
                            "DefaultVersionId": "v2",
                            "AttachmentCount": 1,
                            "CreateDate": "2026-01-15T08:00:00Z",
                            "UpdateDate": "2026-03-17T04:15:00Z",
                            "Description": "Policy for Sky-Watch agent S3 access"
                        }
                    }, null, 2);
                }

                if (subcmd === 'get-policy-version' || fullCmd.includes('get-policy-version')) {
                    // Check if they're asking for v1 or v2
                    if (fullCmd.includes('v1')) {
                        return JSON.stringify({
                            "PolicyVersion": {
                                "VersionId": "v1",
                                "IsDefaultVersion": false,
                                "CreateDate": "2026-01-15T08:00:00Z",
                                "Document": {
                                    "Version": "2012-10-17",
                                    "Statement": [{
                                        "Sid": "SkyWatchAgentS3Access",
                                        "Effect": "Allow",
                                        "Action": [
                                            "s3:GetObject",
                                            "s3:PutObject",
                                            "s3:ListBucket"
                                        ],
                                        "Resource": [
                                            "arn:aws:s3:::s3-data-lake-skywatch",
                                            "arn:aws:s3:::s3-data-lake-skywatch/*"
                                        ]
                                    }]
                                }
                            }
                        }, null, 2);
                    }

                    // Default / v2 — the sabotaged version (missing PutObject)
                    return JSON.stringify({
                        "PolicyVersion": {
                            "VersionId": "v2",
                            "IsDefaultVersion": true,
                            "CreateDate": "2026-03-17T04:15:00Z",
                            "Document": {
                                "Version": "2012-10-17",
                                "Statement": [{
                                    "Sid": "SkyWatchAgentS3Access",
                                    "Effect": "Allow",
                                    "Action": [
                                        "s3:GetObject",
                                        "s3:ListBucket"
                                    ],
                                    "Resource": [
                                        "arn:aws:s3:::s3-data-lake-skywatch",
                                        "arn:aws:s3:::s3-data-lake-skywatch/*"
                                    ]
                                }]
                            }
                        }
                    }, null, 2);
                }

                if (subcmd === 'list-policy-versions' || fullCmd.includes('list-policy-versions')) {
                    return JSON.stringify({
                        "Versions": [
                            { "VersionId": "v2", "IsDefaultVersion": true, "CreateDate": "2026-03-17T04:15:00Z" },
                            { "VersionId": "v1", "IsDefaultVersion": false, "CreateDate": "2026-01-15T08:00:00Z" }
                        ]
                    }, null, 2);
                }

                if (fullCmd.includes('put-role-policy') || fullCmd.includes('create-policy-version')) {
                    return 'An error occurred (AccessDenied) when calling the PutRolePolicy operation: User: arn:aws:iam::847209341526:user/cloud_ops is not authorized to perform: iam:PutRolePolicy on resource: arn:aws:iam::847209341526:role/SkyWatchAgentRole';
                }
            }

            // ── CloudWatch Logs ──
            if (service === 'logs') {
                if (subcmd === 'describe-log-groups') {
                    return JSON.stringify({
                        "logGroups": [
                            {
                                "logGroupName": "/aws/ec2/sky-watch-agent",
                                "creationTime": 1709280000000,
                                "retentionInDays": 30,
                                "storedBytes": 1048576
                            }
                        ]
                    }, null, 2);
                }

                if (subcmd === 'describe-log-streams' || fullCmd.includes('describe-log-streams')) {
                    return JSON.stringify({
                        "logStreams": [
                            {
                                "logStreamName": "agent-01",
                                "creationTime": 1709280000000,
                                "lastEventTimestamp": 1710763200000,
                                "lastIngestionTime": 1710763200000
                            }
                        ]
                    }, null, 2);
                }

                if (subcmd === 'get-log-events' || fullCmd.includes('get-log-events')) {
                    return JSON.stringify({
                        "events": [
                            {
                                "timestamp": 1710759600000,
                                "message": "2026-03-18T02:00:00Z INFO  Agent starting data collection cycle",
                                "ingestionTime": 1710759600000
                            },
                            {
                                "timestamp": 1710759601000,
                                "message": "2026-03-18T02:00:01Z INFO  Atmospheric scan complete: 4096 bytes collected",
                                "ingestionTime": 1710759601000
                            },
                            {
                                "timestamp": 1710759602000,
                                "message": "2026-03-18T02:00:02Z ERROR An error occurred (AccessDenied) when calling the PutObject operation: Access Denied. Bucket: s3-data-lake-skywatch, Key: atmospheric/scan-20260318-020000.json",
                                "ingestionTime": 1710759602000
                            },
                            {
                                "timestamp": 1710759603000,
                                "message": "2026-03-18T02:00:03Z ERROR Failed to upload scan data. IAM role SkyWatchAgentRole does not have s3:PutObject permission for arn:aws:s3:::s3-data-lake-skywatch/*",
                                "ingestionTime": 1710759603000
                            },
                            {
                                "timestamp": 1710763200000,
                                "message": "2026-03-18T03:00:00Z ERROR Retry attempt 47 failed: AccessDenied on s3:PutObject. Data accumulating locally at /tmp/pending-uploads/",
                                "ingestionTime": 1710763200000
                            },
                            {
                                "timestamp": 1710763201000,
                                "message": "2026-03-18T03:00:01Z WARN  Local storage at 78% capacity. Data loss imminent if upload issue not resolved.",
                                "ingestionTime": 1710763201000
                            }
                        ]
                    }, null, 2);
                }
            }

            // ── STS ──
            if (service === 'sts') {
                if (subcmd === 'get-caller-identity') {
                    return JSON.stringify({
                        "UserId": "AIDA3XFRBF34QEXAMPLE",
                        "Account": "847209341526",
                        "Arn": "arn:aws:iam::847209341526:user/cloud_ops"
                    }, null, 2);
                }
            }

            return `usage: aws ${service} <subcommand>\n\nAvailable subcommands: ${service === 'ec2' ? 'describe-instances, describe-instance-status' : service === 'iam' ? 'get-role, list-attached-role-policies, get-policy, get-policy-version, list-policy-versions' : service === 's3api' ? 'list-buckets, get-bucket-policy, list-objects-v2' : 'describe-log-groups, describe-log-streams, get-log-events'}`;
        },

        'nmap': function(args) {
            if (args.length === 0) return 'Usage: nmap [options] <target>';
            const target = args.find(a => !a.startsWith('-')) || '';
            if (target === '54.210.145.67') {
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for ec2-54-210-145-67.compute-1.amazonaws.com (54.210.145.67)
Host is up (0.015s latency).
Not shown: 998 filtered tcp ports

PORT    STATE SERVICE
22/tcp  open  ssh
443/tcp open  https

Nmap done: 1 IP address (1 host up) scanned in 6.44 seconds`;
            }
            return `Starting Nmap 7.94\nNote: Host seems down.\nNmap done: 0 hosts up.`;
        },

        'ssh': function(args) {
            const target = args[args.length - 1] || '';
            if (target.includes('54.210') || target.includes('ec2') || target.includes('172.31')) {
                return `Warning: Permanently added '54.210.145.67' (ED25519) to the list of known hosts.

       __|  __|_  )
       _|  (     /   Amazon Linux 2 AMI
      ___|\___|___|

EC2-AGENT-01 — Sky-Watch Initiative
Instance: i-0a1b2c3d4e5f6g7h8

[ec2-user@ec2-agent-01 ~]$ cat /tmp/pending-uploads/status.txt
Pending uploads: 47 files (192 KB total)
Oldest pending: 2026-03-17T11:00:00Z (18 hours ago)
Error: AccessDenied on s3:PutObject for each attempt
Agent data collection: RUNNING (local buffer mode)

[ec2-user@ec2-agent-01 ~]$ cat /var/log/sky-watch-agent.log | tail -5
2026-03-18T02:00:02Z ERROR s3:PutObject AccessDenied for arn:aws:s3:::s3-data-lake-skywatch/atmospheric/scan-20260318-020000.json
2026-03-18T02:00:02Z ERROR IAM role policy missing s3:PutObject — was this removed?
2026-03-18T02:30:00Z ERROR Retry failed: same AccessDenied
2026-03-18T03:00:00Z ERROR Retry 47: AccessDenied persists
2026-03-18T03:00:01Z WARN  /tmp/pending-uploads/ at 78% capacity`;
            }
            return `ssh: connect to host ${target} port 22: Connection refused`;
        },

        'curl': function(args) {
            const url = args.find(a => !a.startsWith('-')) || '';
            if (url.includes('169.254.169.254')) {
                if (url.includes('iam')) {
                    return 'SkyWatchAgentProfile';
                }
                return '{\n  "instanceId": "i-0a1b2c3d4e5f6g7h8",\n  "region": "us-east-1",\n  "accountId": "847209341526"\n}';
            }
            return `curl: (7) Failed to connect to ${url}: Connection refused`;
        },

        'ping': function(args) {
            const target = args.find(a => !a.startsWith('-')) || '';
            if (!target) return 'Usage: ping [-c count] destination';
            if (target === '54.210.145.67') {
                return `PING 54.210.145.67 56(84) bytes of data.\n64 bytes from 54.210.145.67: icmp_seq=1 ttl=64 time=15.2 ms\n\n--- 54.210.145.67 ping statistics ---\n1 packets transmitted, 1 received, 0% packet loss`;
            }
            return `ping: ${target}: Name or service not known`;
        },

        'traceroute': function(args) {
            const target = args[0] || '';
            if (!target) return 'Usage: traceroute destination';
            return `traceroute to ${target}, 30 hops max\n 1  10.0.0.1  1.2 ms\n 2  * * *`;
        },

        'sudo': function(args) {
            if (args.length === 0) return 'usage: sudo command';
            return 'cloud_ops is not in the sudoers file. This environment uses AWS IAM, not sudo.';
        },

        'systemctl': function() { return 'systemctl: command not found (this is an AWS CloudShell, not a managed instance)'; },
        'journalctl': function() { return 'journalctl: command not found (use aws logs for CloudWatch)'; },

        'netstat': function() {
            return `Active Internet connections
Proto Recv-Q Send-Q Local Address           Foreign Address         State
tcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN`;
        },

        'ss': function() {
            return `Netid  State   Local Address:Port    Peer Address:Port
tcp    LISTEN  0.0.0.0:22             0.0.0.0:*`;
        },

        'df': function() {
            return `Filesystem     1K-blocks    Used Available Use% Mounted on
/dev/xvda1      20971520  4194304  16777216  20% /`;
        },

        'free': function() {
            return `               total        used        free      shared  buff/cache   available
Mem:         4096000     1024000     2048000        8192     1024000     2816000`;
        },

        'ps': function(args) {
            if (args.includes('aux') || args.includes('-ef')) {
                return `USER       PID %CPU %MEM COMMAND
cloud_o+     1  0.0  0.1 /bin/bash
cloud_o+   123  0.0  0.0 ps aux`;
            }
            return 'Usage: ps [options]';
        },

        'ip': function(args) {
            if (args.length === 0 || args[0] === 'a') return '1: lo inet 127.0.0.1/8\n2: eth0 inet 10.0.0.5/24';
            if (args[0] === 'route') return 'default via 10.0.0.1 dev eth0';
            return 'Usage: ip [addr|route]';
        },

        'grep': function(args) {
            if (args.length < 2) return 'Usage: grep [options] PATTERN [FILE...]';
            return 'grep: No matches found';
        },

        'chmod': function() { return 'chmod: operation not supported in CloudShell'; },
        'chown': function() { return 'chown: operation not supported in CloudShell'; },

        'whoami': function() { return 'cloud_ops'; },
        'hostname': function() { return 'cloudshell'; },
        'id': function() { return 'uid=1000(cloud_ops) gid=1000(cloud_ops) groups=1000(cloud_ops)'; },
        'uname': function(args) {
            if (args.includes('-a')) return 'Linux cloudshell 5.10.186-179.751.amzn2.x86_64 #1 SMP x86_64 GNU/Linux';
            return 'Linux';
        },
        'uptime': function() { return ' 03:15:22 up 0:45,  1 user,  load average: 0.01, 0.02, 0.01'; },
        'date': function() { return 'Tue Mar 18 03:15:22 UTC 2026'; },
        'pwd': function(args, term) { return term ? term.cwd : '/home/cloud_ops'; },

        'pip3': function() { return 'pip3: command not found'; },
        'pip': function() { return 'pip: command not found'; },
        'apt': function() { return 'apt: command not found (Amazon Linux uses yum)'; },

        'clear': function() { return '\x1Bclear'; },
        'exit': function() { return 'logout\nCloudShell session closed.'; },
        'less': function() { return 'less: interactive pager not supported. Use cat instead.'; },
        'vim': function() { return 'vim: interactive editor not supported. Use cat to view files.'; },
        'nano': function() { return 'nano: interactive editor not supported. Use cat to view files.'; },
        'man': function(args) { return args[0] ? `No manual entry for ${args[0]}` : 'What manual page do you want?'; }
    }
};
