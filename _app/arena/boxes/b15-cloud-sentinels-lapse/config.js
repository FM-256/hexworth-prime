/* ============================================================
   CTF ARENA — Box B15: The Cloud Sentinel's Lapse
   CloudSecOps Troubleshooting — Automation & Compliance
   Config: AWS/Azure, IAM, Lambda, IaC, flags, hints, lore
   ============================================================ */

const B15Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: "The Cloud Sentinel's Lapse",
    subtitle: 'CloudSecOps Troubleshooting — Automation & Compliance',
    difficulty: 'Advanced',
    accent: '#8b5cf6',
    storageKey: 'hexworth_ctf_b15',
    registryId: 'b15-cloud-sentinels-lapse',
    trackerKey: 'ctf_b15',

    // ═══════════════════════════════════════════════════════
    // PHASE SYSTEM (Multi-layer troubleshooting chain)
    // ═══════════════════════════════════════════════════════

    phases: [
        {
            id: 'recon',
            name: 'Cloud Assessment',
            icon: '\uD83D\uDD0D',
            description: 'Connect to the Aether Guard console. Assess the state of cloud compliance and identify non-compliant resources.',
            requiredFlags: [],
            mitre: ['T1580', 'T1082'],
            unlocks: ['iam-analysis'],
            locked: false
        },
        {
            id: 'iam-analysis',
            name: 'IAM & Automation Analysis',
            icon: '\uD83D\uDD11',
            description: 'Inspect IAM roles, Lambda functions, and event routing for the Aether Guard remediation system.',
            requiredFlags: [],
            mitre: ['T1087.004', 'T1078.004'],
            unlocks: ['root-cause'],
            locked: true
        },
        {
            id: 'root-cause',
            name: 'Root Cause Identification',
            icon: '\u26A0\uFE0F',
            description: 'Identify why the automated remediation Lambda is failing silently.',
            requiredFlags: ['user'],
            mitre: ['T1562.008', 'T1059.009'],
            unlocks: ['remediation'],
            locked: true
        },
        {
            id: 'remediation',
            name: 'Remediation & Verification',
            icon: '\u2705',
            description: 'Fix the IAM permissions and Lambda code. Verify automated remediation works.',
            requiredFlags: ['root'],
            mitre: ['T1562.001'],
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
                title: 'Verify non-compliant cloud resources',
                tip: 'Run: aws s3api get-bucket-policy-status --bucket S3-PUBLIC-01 and az network nsg rule list to check compliance.',
                trigger: { event: 'command', match: { cmd: 'contains:aws' } }
            },
            {
                title: 'Inspect the remediation Lambda function',
                tip: 'Run: aws lambda get-function-configuration --function-name aether-guard-remediate to see its IAM role.',
                trigger: { event: 'command', match: { cmd: 'contains:lambda' } }
            },
            {
                title: 'Find the IAM permission gap',
                tip: 'Check the Lambda role policy. Look for missing s3:PutBucketPublicAccessBlock and ec2:RevokeSecurityGroupIngress permissions.',
                trigger: { event: 'flag_correct', match: { flagId: 'user' } }
            },
            {
                title: 'Inspect the Lambda code for bugs',
                tip: 'Download and review the Lambda function code. Look for the event parsing bug in the handler.',
                trigger: { event: 'command', match: { cmd: 'contains:get-function' } }
            },
            {
                title: 'Fix the IAM policy and verify remediation',
                tip: 'Update the IAM policy with the missing permissions and fix the code bug. Run verify-remediation.sh for the root flag.',
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
            { flagId: 'user', objective: '2.3', description: 'Summarize vulnerabilities associated with cloud infrastructure -- IAM misconfigurations', skill: 'Cloud IAM Analysis' },
            { flagId: 'user', objective: '3.1', description: 'Compare and contrast security implications of different architecture models -- Serverless', skill: 'Lambda Security Assessment' },
            { flagId: 'root', objective: '4.1', description: 'Given a scenario, apply common security techniques to computing resources -- Cloud automation', skill: 'Cloud Remediation Automation' },
            { flagId: 'root', objective: '4.5', description: 'Given a scenario, modify enterprise capabilities to enhance security -- Cloud compliance', skill: 'Cloud Compliance Enforcement' }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // BOOT SEQUENCE
    // ═══════════════════════════════════════════════════════

    boot: {
        biosLines: [
            'Aether Guard Management VM BIOS v4.0.1',
            'Initializing hardware...',
            'Memory Test: 16384 MB OK',
            'Detecting drives... /dev/nvme0n1 (500GB NVMe)',
            'Network: AWS VPC ENI detected (10.0.1.100)',
            'Cloud CLI: aws v2.15.0, az v2.56.0',
            'Boot device: /dev/nvme0n1p1',
            'Loading GRUB...'
        ],
        grubEntries: [
            'Ubuntu 22.04 LTS (Aether Guard Mgmt)',
            'Ubuntu 22.04 LTS (Recovery Mode)',
            'Memory Diagnostics'
        ],
        loginUser: 'aether_admin'
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
        user: 'aether_admin',
        hostname: 'aether-mgmt',
        startDir: '/home/aether_admin',
        welcome: 'Aether Guard Management VM — Multi-Cloud Security Console\nAWS Account: 123456789012 | Azure Sub: aether-prod-sub\nALERT: 2 non-compliant resources detected — automated remediation FAILING\n\nType \'help\' for available commands.\n'
    },

    // ═══════════════════════════════════════════════════════
    // SIMULATED CLOUD DATA
    // ═══════════════════════════════════════════════════════

    _cloudData: {
        aws: {
            accountId: '123456789012',
            region: 'us-east-1',
            s3Bucket: {
                name: 'S3-PUBLIC-01',
                isPublic: true,
                policy: '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":"*","Action":"s3:GetObject","Resource":"arn:aws:s3:::S3-PUBLIC-01/*"}]}',
                publicAccessBlock: 'NOT CONFIGURED'
            },
            lambda: {
                name: 'aether-guard-remediate',
                runtime: 'python3.11',
                role: 'arn:aws:iam::123456789012:role/aether-guard-remediate-role',
                handler: 'index.handler',
                lastError: 'KeyError: detail-type',
                codeUrl: '/opt/aether-guard/lambda/index.py'
            },
            iamRole: {
                name: 'aether-guard-remediate-role',
                arn: 'arn:aws:iam::123456789012:role/aether-guard-remediate-role',
                missingPermissions: ['s3:PutBucketPublicAccessBlock', 'ec2:RevokeSecurityGroupIngress']
            },
            cloudwatchRule: {
                name: 'aether-guard-s3-public',
                status: 'ENABLED',
                eventPattern: '{"source":["aws.s3"],"detail-type":["AWS API Call via CloudTrail"]}'
            }
        },
        azure: {
            subscriptionId: 'aether-prod-sub',
            vm: {
                name: 'VM-SHADOW-01',
                resourceGroup: 'rg-citadel-prod',
                nsg: 'nsg-shadow-01',
                nsgRules: [
                    { name: 'AllowSSHFromAnywhere', priority: 100, direction: 'Inbound', access: 'Allow', protocol: 'Tcp', sourcePrefix: '*', destPort: '22' },
                    { name: 'AllowRDPFromAnywhere', priority: 110, direction: 'Inbound', access: 'Allow', protocol: 'Tcp', sourcePrefix: '*', destPort: '3389' }
                ]
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
            text: 'Start by verifying the non-compliant resources: "aws s3api get-bucket-policy-status --bucket S3-PUBLIC-01" (public bucket) and "az network nsg rule list --nsg-name nsg-shadow-01 -g rg-citadel-prod" (overly permissive NSG).',
            cost: 10,
            penalty: -10
        },
        {
            id: 'hint2',
            text: 'Check why the remediation Lambda is failing: "aws lambda get-function-configuration --function-name aether-guard-remediate" to get its IAM role ARN. Then inspect the role policy for missing permissions.',
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint3',
            text: 'The user flag is the IAM role ARN: "arn:aws:iam::123456789012:role/aether-guard-remediate-role". It is missing s3:PutBucketPublicAccessBlock and ec2:RevokeSecurityGroupIngress permissions. The Lambda code also has a bug.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint4',
            text: 'The Lambda code in /opt/aether-guard/lambda/index.py has a KeyError: it uses event["detail-type"] (hyphenated) but CloudWatch delivers it as event["detail-type"]. The fix requires adding the missing IAM permissions AND fixing the key name to use event.get("detail-type"). Run /opt/aether-guard/verify-remediation.sh for the root flag.',
            cost: 75,
            penalty: -75
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'The Aether Guard, a fully automated cloud security posture management system, is failing to enforce compliance across the Confederacy\'s multi-cloud infrastructure. Non-compliant resources are appearing with public access and permissive firewall rules, completely bypassing automated remediation. The Aether Guard\'s automated enforcement has gone silent.',
        scenario: 'The Aether Guard system was built by a senior cloud architect who left the Confederacy six months ago. A recent IAM policy update removed two critical permissions from the remediation Lambda\'s role during a "least privilege" audit. The auditor did not understand that s3:PutBucketPublicAccessBlock and ec2:RevokeSecurityGroupIngress were required for remediation. Additionally, a Lambda code update introduced a subtle bug: the event handler references event["detail-type"] but the CloudWatch event schema delivers the field with a hyphen, causing a silent KeyError that is caught by a broad exception handler and logged only to CloudWatch Logs.',
        outro: 'The Aether Guard\'s automated enforcement is restored. The Lambda IAM role now has the correct permissions, and the event parsing bug has been fixed. S3-PUBLIC-01 has been secured and VM-SHADOW-01\'s NSG rules have been tightened. The Confederacy\'s cloud infrastructure is compliant once more.',
        ecer: {
            executive: 'No documentation or ownership transfer when the cloud architect departed',
            culture: 'IAM "least privilege" audit performed without understanding automation dependencies',
            employee: 'Auditor removed permissions without testing remediation workflow end-to-end',
            regulatory: 'No automated testing of security automation pipelines after IAM policy changes'
        }
    },

    // ═══════════════════════════════════════════════════════
    // WEB APP — Aether Guard Dashboard
    // ═══════════════════════════════════════════════════════

    webApp: {
        startUrl: 'http://localhost:9000/aether-guard/',

        pages: {
            '/aether-guard/': {
                title: 'Aether Guard Cloud Security Dashboard',
                html: `
                    <div style="text-align:center; margin-bottom:30px; padding-bottom:20px; border-bottom:1px solid #333;">
                        <h1 style="color:#8b5cf6; font-size:1.6rem; font-family:monospace; margin-bottom:4px;">Aether Guard CSPM</h1>
                        <div style="color:#888; font-size:0.8rem;">Cloud Security Posture Management &mdash; Multi-Cloud Dashboard</div>
                    </div>

                    <div style="max-width:700px; margin:0 auto;">
                        <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px; margin-bottom:20px;">
                            <div style="background:#1a1a2e; border:1px solid #333; border-radius:6px; padding:14px; text-align:center;">
                                <div style="color:#e74c3c; font-size:1.8rem; font-weight:bold;">2</div>
                                <div style="color:#888; font-size:0.75rem;">Non-Compliant Resources</div>
                            </div>
                            <div style="background:#1a1a2e; border:1px solid #333; border-radius:6px; padding:14px; text-align:center;">
                                <div style="color:#e74c3c; font-size:1.8rem; font-weight:bold;">FAILING</div>
                                <div style="color:#888; font-size:0.75rem;">Auto-Remediation</div>
                            </div>
                            <div style="background:#1a1a2e; border:1px solid #333; border-radius:6px; padding:14px; text-align:center;">
                                <div style="color:#f59e0b; font-size:1.8rem; font-weight:bold;">12</div>
                                <div style="color:#888; font-size:0.75rem;">Suppressed Alerts</div>
                            </div>
                        </div>

                        <div style="background:#1a1a2e; border:1px solid #333; border-radius:6px; padding:16px; margin-bottom:16px;">
                            <div style="color:#8b5cf6; font-weight:bold; font-size:0.9rem; margin-bottom:10px;">Non-Compliant Resources</div>
                            <table style="width:100%; border-collapse:collapse; font-size:0.8rem;">
                                <thead>
                                    <tr style="border-bottom:1px solid #333;">
                                        <th style="padding:6px; text-align:left; color:#8b5cf6;">Resource</th>
                                        <th style="padding:6px; text-align:left; color:#8b5cf6;">Cloud</th>
                                        <th style="padding:6px; text-align:left; color:#8b5cf6;">Finding</th>
                                        <th style="padding:6px; text-align:left; color:#8b5cf6;">Remediation</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr><td style="padding:5px 6px; color:#ccc;">S3-PUBLIC-01</td><td style="color:#f59e0b;">AWS</td><td style="color:#e74c3c;">Public read access</td><td style="color:#e74c3c;">FAILED</td></tr>
                                    <tr><td style="padding:5px 6px; color:#ccc;">VM-SHADOW-01</td><td style="color:#3b82f6;">Azure</td><td style="color:#e74c3c;">NSG: SSH/RDP from *</td><td style="color:#e74c3c;">FAILED</td></tr>
                                </tbody>
                            </table>
                        </div>

                        <div style="background:#1a1a2e; border:1px solid #333; border-radius:6px; padding:16px; margin-bottom:16px;">
                            <div style="color:#8b5cf6; font-weight:bold; font-size:0.9rem; margin-bottom:10px;">Automation Status</div>
                            <table style="width:100%; border-collapse:collapse; font-size:0.8rem;">
                                <thead>
                                    <tr style="border-bottom:1px solid #333;">
                                        <th style="padding:6px; text-align:left; color:#8b5cf6;">Component</th>
                                        <th style="padding:6px; text-align:left; color:#8b5cf6;">Status</th>
                                        <th style="padding:6px; text-align:left; color:#8b5cf6;">Last Error</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr><td style="padding:5px 6px; color:#ccc;">aether-guard-remediate (Lambda)</td><td style="color:#e74c3c;">ERROR</td><td style="color:#e74c3c;">KeyError: detail-type</td></tr>
                                    <tr><td style="padding:5px 6px; color:#ccc;">aether-guard-alert (Lambda)</td><td style="color:#2ecc71;">OK</td><td style="color:#888;">--</td></tr>
                                    <tr><td style="padding:5px 6px; color:#ccc;">CloudWatch Event Rule</td><td style="color:#2ecc71;">ENABLED</td><td style="color:#888;">--</td></tr>
                                    <tr><td style="padding:5px 6px; color:#ccc;">IAM Role Permissions</td><td style="color:#e74c3c;">INSUFFICIENT</td><td style="color:#e74c3c;">Missing 2 actions</td></tr>
                                </tbody>
                            </table>
                        </div>

                        <div style="background:#2d1b1b; border:1px solid #e74c3c33; border-radius:6px; padding:12px; margin-top:16px; color:#e74c3c; font-size:0.8rem;">
                            COMPLIANCE FAILURE: Automated remediation is non-functional. 2 resources with public/permissive access. 12 alerts suppressed due to Lambda errors.
                        </div>
                    </div>
                `,
                formHandler: null
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // FILESYSTEM (management VM)
    // ═══════════════════════════════════════════════════════

    filesystem: {
        '/': {
            type: 'dir',
            children: {
                'home': {
                    type: 'dir',
                    children: {
                        'aether_admin': {
                            type: 'dir',
                            children: {
                                'notes.txt': {
                                    type: 'file',
                                    content: '=== MISSION BRIEFING ===\nTarget: Aether Guard CSPM System (Multi-Cloud)\nObjective: Fix automated remediation for cloud compliance\n\nNon-compliant resources:\n- AWS: S3-PUBLIC-01 (public read access)\n- Azure: VM-SHADOW-01 (NSG allows SSH/RDP from anywhere)\n\nAutomation issues:\n- Lambda aether-guard-remediate is failing silently\n- IAM role may be missing required permissions\n- Lambda code may have a bug in event parsing\n\nSteps:\n1. Verify non-compliant resources with aws/az CLI\n2. Inspect Lambda configuration and IAM role\n3. Check Lambda code for bugs\n4. Fix IAM permissions and code\n5. Verify remediation works\n\nGood luck, operator.'
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'aws s3api get-bucket-policy-status --bucket S3-PUBLIC-01\naws lambda get-function-configuration --function-name aether-guard-remediate\naws iam get-role-policy --role-name aether-guard-remediate-role --policy-name remediate-policy\naz network nsg rule list --nsg-name nsg-shadow-01 -g rg-citadel-prod -o table\ncat /opt/aether-guard/lambda/index.py'
                                },
                                '.aws': {
                                    type: 'dir',
                                    children: {
                                        'credentials': {
                                            type: 'file',
                                            content: '[default]\naws_access_key_id = AKIA...AETHER\naws_secret_access_key = [REDACTED]\nregion = us-east-1'
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
                'opt': {
                    type: 'dir',
                    children: {
                        'aether-guard': {
                            type: 'dir',
                            children: {
                                'lambda': {
                                    type: 'dir',
                                    children: {
                                        'index.py': {
                                            type: 'file',
                                            content: '"""\nAether Guard Remediation Lambda\nTriggered by CloudWatch Events for non-compliant resources.\n\nKnown Issues:\n1. Line 24: event["detail-type"] causes KeyError\n   - CloudWatch delivers the field as "detail-type" (with hyphen)\n   - Python dict access with hyphenated key works, but the field\n     was renamed to "detailType" in a refactor and never updated\n   - Should use: event.get("detail-type", "")\n\n2. IAM role missing permissions:\n   - s3:PutBucketPublicAccessBlock (needed to block public S3)\n   - ec2:RevokeSecurityGroupIngress (needed to fix NSG rules)\n"""\nimport json\nimport boto3\n\ndef handler(event, context):\n    try:\n        # BUG: This line causes KeyError for "detail-type"\n        # The field name has a hyphen which works as a dict key,\n        # but the code was refactored to use "detailType" (camelCase)\n        # which doesn\'t exist in the CloudWatch event schema\n        event_type = event["detailType"]  # <-- BUG: should be event.get("detail-type", "")\n\n        if event_type == "AWS API Call via CloudTrail":\n            detail = event.get("detail", {})\n            event_name = detail.get("eventName", "")\n\n            if event_name == "PutBucketPolicy":\n                bucket = detail.get("requestParameters", {}).get("bucketName", "")\n                remediate_s3(bucket)\n            elif event_name == "AuthorizeSecurityGroupIngress":\n                sg_id = detail.get("requestParameters", {}).get("groupId", "")\n                remediate_nsg(sg_id)\n\n    except Exception as e:\n        # Silent failure -- error only visible in CloudWatch Logs\n        print(f"ERROR: {str(e)}")\n        return {"statusCode": 500, "body": str(e)}\n\n    return {"statusCode": 200, "body": "Remediation complete"}\n\ndef remediate_s3(bucket_name):\n    s3 = boto3.client("s3")\n    # Will fail with AccessDenied -- IAM role missing s3:PutBucketPublicAccessBlock\n    s3.put_public_access_block(\n        Bucket=bucket_name,\n        PublicAccessBlockConfiguration={\n            "BlockPublicAcls": True,\n            "IgnorePublicAcls": True,\n            "BlockPublicPolicy": True,\n            "RestrictPublicBuckets": True\n        }\n    )\n\ndef remediate_nsg(security_group_id):\n    ec2 = boto3.client("ec2")\n    # Will fail with UnauthorizedOperation -- IAM role missing ec2:RevokeSecurityGroupIngress\n    ec2.revoke_security_group_ingress(\n        GroupId=security_group_id,\n        IpPermissions=[{\n            "IpProtocol": "tcp",\n            "FromPort": 22,\n            "ToPort": 22,\n            "IpRanges": [{"CidrIp": "0.0.0.0/0"}]\n        }]\n    )'
                                        }
                                    }
                                },
                                'iac': {
                                    type: 'dir',
                                    children: {
                                        'main.tf': {
                                            type: 'file',
                                            content: '# Terraform — Aether Guard Infrastructure\n\nresource "aws_s3_bucket" "public_test" {\n  bucket = "S3-PUBLIC-01"\n  # NOTE: This bucket was intentionally made public for a demo\n  # but the remediation system should have caught and fixed it\n}\n\nresource "aws_s3_bucket_policy" "public_read" {\n  bucket = aws_s3_bucket.public_test.id\n  policy = jsonencode({\n    Version = "2012-10-17"\n    Statement = [{\n      Effect    = "Allow"\n      Principal = "*"\n      Action    = "s3:GetObject"\n      Resource  = "${aws_s3_bucket.public_test.arn}/*"\n    }]\n  })\n}\n\nresource "aws_iam_role" "remediate_role" {\n  name = "aether-guard-remediate-role"\n  # PROBLEM: Policy was trimmed during "least privilege" audit\n  # Missing: s3:PutBucketPublicAccessBlock, ec2:RevokeSecurityGroupIngress\n}'
                                        },
                                        'iam-policy.json': {
                                            type: 'file',
                                            content: '{\n  "Version": "2012-10-17",\n  "Statement": [\n    {\n      "Effect": "Allow",\n      "Action": [\n        "s3:GetBucketPolicy",\n        "s3:GetBucketPolicyStatus",\n        "s3:ListBucket",\n        "ec2:DescribeSecurityGroups",\n        "ec2:DescribeSecurityGroupRules",\n        "logs:CreateLogGroup",\n        "logs:CreateLogStream",\n        "logs:PutLogEvents"\n      ],\n      "Resource": "*"\n    }\n  ]\n}\n\n// MISSING PERMISSIONS (removed during IAM audit):\n// "s3:PutBucketPublicAccessBlock"   -- needed to block public S3 access\n// "ec2:RevokeSecurityGroupIngress"  -- needed to revoke permissive NSG rules\n\n{{FLAG:user}}'
                                        }
                                    }
                                },
                                'verify-remediation.sh': {
                                    type: 'file',
                                    content: '#!/bin/bash\n# Aether Guard Remediation Verification Script\n# Tests end-to-end automated remediation\n\necho "=== Aether Guard Remediation Verification ==="\necho ""\n\n# Check 1: IAM permissions\necho "[CHECK 1] IAM Role Permissions..."\necho "  Checking s3:PutBucketPublicAccessBlock... PRESENT"\necho "  Checking ec2:RevokeSecurityGroupIngress... PRESENT"\necho "  Result: PASS"\necho ""\n\n# Check 2: Lambda function\necho "[CHECK 2] Lambda Function Code..."\necho "  Checking event handler... event.get(\'detail-type\') used correctly"\necho "  Result: PASS"\necho ""\n\n# Check 3: S3 remediation\necho "[CHECK 3] S3-PUBLIC-01 Remediation..."\necho "  Triggering test... Public access blocked successfully"\necho "  Result: PASS"\necho ""\n\n# Check 4: NSG remediation\necho "[CHECK 4] VM-SHADOW-01 NSG Remediation..."\necho "  Triggering test... Permissive rules revoked successfully"\necho "  Result: PASS"\necho ""\n\necho "All checks passed. Aether Guard remediation is FUNCTIONAL."\necho ""\necho "{{FLAG:root}}"\necho ""\necho "Cloud compliance restored across all environments."'
                                },
                                'cloudwatch-logs.txt': {
                                    type: 'file',
                                    content: '/aws/lambda/aether-guard-remediate\n\n2026-03-19T02:00:00.000Z START RequestId: abc-123\n2026-03-19T02:00:00.100Z ERROR: KeyError: \'detailType\'\n2026-03-19T02:00:00.200Z END RequestId: abc-123\n2026-03-19T02:00:00.201Z REPORT Duration: 200ms Billed: 200ms Memory: 128MB\n\n2026-03-19T02:05:00.000Z START RequestId: def-456\n2026-03-19T02:05:00.100Z ERROR: KeyError: \'detailType\'\n2026-03-19T02:05:00.200Z END RequestId: def-456\n\n2026-03-19T02:10:00.000Z START RequestId: ghi-789\n2026-03-19T02:10:00.100Z ERROR: KeyError: \'detailType\'\n2026-03-19T02:10:00.200Z END RequestId: ghi-789\n\nNOTE: Lambda invoked 12 times in last 24h, all failed with same KeyError.\nThe function references event["detailType"] but CloudWatch sends "detail-type".'
                                }
                            }
                        }
                    }
                },
                'etc': {
                    type: 'dir',
                    children: {
                        'hostname': { type: 'file', content: 'aether-mgmt' },
                        'passwd': {
                            type: 'file',
                            content: 'root:x:0:0:root:/root:/bin/bash\naether_admin:x:1000:1000:Aether Admin:/home/aether_admin:/bin/bash\nubuntu:x:1001:1001:Ubuntu:/home/ubuntu:/bin/bash'
                        }
                    }
                },
                'var': {
                    type: 'dir',
                    children: {
                        'log': {
                            type: 'dir',
                            children: {
                                'aether-guard.log': {
                                    type: 'file',
                                    content: '[2026-03-19 02:00:00] Aether Guard CSPM started\n[2026-03-19 02:00:01] Scanning AWS account 123456789012...\n[2026-03-19 02:00:02] FINDING: S3-PUBLIC-01 has public read access\n[2026-03-19 02:00:03] Triggering remediation Lambda...\n[2026-03-19 02:00:04] REMEDIATION FAILED: Lambda returned error 500\n[2026-03-19 02:00:05] Scanning Azure subscription aether-prod-sub...\n[2026-03-19 02:00:06] FINDING: VM-SHADOW-01 NSG allows SSH/RDP from 0.0.0.0/0\n[2026-03-19 02:00:07] REMEDIATION FAILED: Lambda returned error 500\n[2026-03-19 02:00:08] 12 remediation attempts failed in 24 hours\n[2026-03-19 02:00:09] ALERT: Automated remediation is NON-FUNCTIONAL'
                                },
                                'syslog': {
                                    type: 'file',
                                    content: 'Mar 19 02:00:00 aether-mgmt systemd[1]: Aether Guard CSPM monitor started\nMar 19 02:00:05 aether-mgmt aether-guard: 2 non-compliant resources detected\nMar 19 02:00:10 aether-mgmt aether-guard: Remediation Lambda failing -- see CloudWatch Logs\nMar 19 02:00:15 aether-mgmt aether-guard: ALERT: Compliance enforcement degraded'
                                }
                            }
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
        'aws': function(args, term, engine) {
            if (args.length === 0) return 'Usage: aws <service> <command> [options]\n\nAvailable services: s3api, lambda, iam, cloudwatch, cloudtrail, sts';

            const service = args[0];
            const command = args[1] || '';

            // STS
            if (service === 'sts' && command === 'get-caller-identity') {
                return `{
    "UserId": "AIDA...AETHER",
    "Account": "123456789012",
    "Arn": "arn:aws:iam::123456789012:user/aether_admin"
}`;
            }

            // S3
            if (service === 's3api') {
                if (command === 'get-bucket-policy-status') {
                    return `{
    "PolicyStatus": {
        "IsPublic": true
    }
}

WARNING: Bucket S3-PUBLIC-01 has a public access policy.
The remediation Lambda should have blocked this automatically.`;
                }
                if (command === 'get-bucket-policy') {
                    return `{
    "Policy": "{\\\"Version\\\":\\\"2012-10-17\\\",\\\"Statement\\\":[{\\\"Effect\\\":\\\"Allow\\\",\\\"Principal\\\":\\\"*\\\",\\\"Action\\\":\\\"s3:GetObject\\\",\\\"Resource\\\":\\\"arn:aws:s3:::S3-PUBLIC-01/*\\\"}]}"
}`;
                }
                if (command === 'get-public-access-block') {
                    return `An error occurred (NoSuchPublicAccessBlockConfiguration): The public access block configuration was not found.

NOTE: PublicAccessBlock is NOT configured for S3-PUBLIC-01.
The remediation Lambda should set this, but it lacks the s3:PutBucketPublicAccessBlock permission.`;
                }
                return `aws s3api: available commands: get-bucket-policy, get-bucket-policy-status, get-public-access-block, list-buckets`;
            }

            // Lambda
            if (service === 'lambda') {
                if (command === 'get-function-configuration') {
                    return `{
    "FunctionName": "aether-guard-remediate",
    "Runtime": "python3.11",
    "Role": "arn:aws:iam::123456789012:role/aether-guard-remediate-role",
    "Handler": "index.handler",
    "CodeSize": 2048,
    "Timeout": 30,
    "MemorySize": 128,
    "LastModified": "2025-12-01T10:00:00.000+0000",
    "State": "Active",
    "LastUpdateStatus": "Successful",
    "Environment": {
        "Variables": {
            "LOG_LEVEL": "INFO",
            "REGION": "us-east-1"
        }
    }
}`;
                }
                if (command === 'get-function') {
                    return `{
    "Configuration": {
        "FunctionName": "aether-guard-remediate",
        "Role": "arn:aws:iam::123456789012:role/aether-guard-remediate-role"
    },
    "Code": {
        "Location": "file:///opt/aether-guard/lambda/index.py"
    }
}

Lambda code is available locally at: /opt/aether-guard/lambda/index.py`;
                }
                if (command === 'list-functions') {
                    return `{
    "Functions": [
        {"FunctionName": "aether-guard-remediate", "Runtime": "python3.11", "State": "Active"},
        {"FunctionName": "aether-guard-alert", "Runtime": "python3.11", "State": "Active"}
    ]
}`;
                }
                return `aws lambda: available commands: get-function, get-function-configuration, list-functions, invoke`;
            }

            // IAM
            if (service === 'iam') {
                if (command === 'get-role') {
                    return `{
    "Role": {
        "RoleName": "aether-guard-remediate-role",
        "Arn": "arn:aws:iam::123456789012:role/aether-guard-remediate-role",
        "CreateDate": "2025-06-15T08:00:00Z",
        "Description": "Role for Aether Guard remediation Lambda"
    }
}`;
                }
                if (command === 'get-role-policy') {
                    return `{
    "RoleName": "aether-guard-remediate-role",
    "PolicyName": "remediate-policy",
    "PolicyDocument": {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Action": [
                    "s3:GetBucketPolicy",
                    "s3:GetBucketPolicyStatus",
                    "s3:ListBucket",
                    "ec2:DescribeSecurityGroups",
                    "ec2:DescribeSecurityGroupRules",
                    "logs:CreateLogGroup",
                    "logs:CreateLogStream",
                    "logs:PutLogEvents"
                ],
                "Resource": "*"
            }
        ]
    }
}

MISSING PERMISSIONS:
- s3:PutBucketPublicAccessBlock  (required to block public S3 access)
- ec2:RevokeSecurityGroupIngress (required to revoke permissive NSG rules)

These were removed during the IAM "least privilege" audit on 2025-12-01.`;
                }
                if (command === 'list-attached-role-policies' || command === 'list-role-policies') {
                    return `{
    "PolicyNames": ["remediate-policy"],
    "AttachedPolicies": []
}

NOTE: Only one inline policy "remediate-policy" is attached.
Check with: aws iam get-role-policy --role-name aether-guard-remediate-role --policy-name remediate-policy`;
                }
                return `aws iam: available commands: get-role, get-role-policy, list-role-policies, list-attached-role-policies, put-role-policy`;
            }

            // CloudWatch
            if (service === 'cloudwatch' || service === 'events') {
                if (command === 'list-rules' || command === 'describe-rule') {
                    return `{
    "Rules": [
        {
            "Name": "aether-guard-s3-public",
            "State": "ENABLED",
            "EventPattern": "{\\"source\\":[\\"aws.s3\\"],\\"detail-type\\":[\\"AWS API Call via CloudTrail\\"]}",
            "Targets": [
                {
                    "Id": "remediate-lambda",
                    "Arn": "arn:aws:lambda:us-east-1:123456789012:function:aether-guard-remediate"
                }
            ]
        }
    ]
}

Event routing is correctly configured. Events ARE reaching the Lambda.
The problem is in the Lambda code and/or IAM permissions.`;
                }
                return `aws cloudwatch: available commands: list-rules, describe-rule, get-metric-data`;
            }

            // CloudTrail
            if (service === 'cloudtrail') {
                if (command === 'lookup-events') {
                    return `{
    "Events": [
        {
            "EventTime": "2026-03-19T02:00:00Z",
            "EventName": "PutBucketPolicy",
            "EventSource": "s3.amazonaws.com",
            "Resources": [{"ResourceName": "S3-PUBLIC-01"}]
        },
        {
            "EventTime": "2026-03-19T02:00:05Z",
            "EventName": "Invoke",
            "EventSource": "lambda.amazonaws.com",
            "Resources": [{"ResourceName": "aether-guard-remediate"}],
            "ErrorCode": "Lambda.FunctionError"
        }
    ]
}`;
                }
                return `aws cloudtrail: available commands: lookup-events, get-trail-status`;
            }

            return `aws: unknown service '${service}'. Available: s3api, lambda, iam, cloudwatch, cloudtrail, sts`;
        },

        'az': function(args) {
            if (args.length === 0) return 'Usage: az <group> <command> [options]\n\nAvailable groups: vm, network, functionapp, policy, account';

            const group = args[0];
            const command = args[1] || '';

            if (group === 'account' && command === 'show') {
                return `{
    "id": "/subscriptions/aether-prod-sub",
    "name": "Aether Production",
    "state": "Enabled"
}`;
            }

            if (group === 'vm' && command === 'show') {
                return `{
    "name": "VM-SHADOW-01",
    "resourceGroup": "rg-citadel-prod",
    "location": "eastus",
    "provisioningState": "Succeeded",
    "networkProfile": {
        "networkInterfaces": [
            {
                "id": "/subscriptions/aether-prod-sub/resourceGroups/rg-citadel-prod/providers/Microsoft.Network/networkInterfaces/nic-shadow-01",
                "networkSecurityGroup": {
                    "id": "/subscriptions/aether-prod-sub/resourceGroups/rg-citadel-prod/providers/Microsoft.Network/networkSecurityGroups/nsg-shadow-01"
                }
            }
        ]
    }
}`;
            }

            if (group === 'network') {
                if (command === 'nsg' && args[2] === 'rule' && args[3] === 'list') {
                    return `Name                   Priority  Direction  Access  Protocol  SourcePrefix  DestPort
---------------------  --------  ---------  ------  --------  ------------  --------
AllowSSHFromAnywhere   100       Inbound    Allow   Tcp       *             22
AllowRDPFromAnywhere   110       Inbound    Allow   Tcp       *             3389

WARNING: Both rules allow inbound access from ANY source (*).
SSH and RDP should be restricted to trusted IP ranges only.`;
                }
                if (command === 'nsg' && args[2] === 'show') {
                    return `{
    "name": "nsg-shadow-01",
    "resourceGroup": "rg-citadel-prod",
    "securityRules": [
        {"name": "AllowSSHFromAnywhere", "sourceAddressPrefix": "*", "destinationPortRange": "22"},
        {"name": "AllowRDPFromAnywhere", "sourceAddressPrefix": "*", "destinationPortRange": "3389"}
    ]
}`;
                }
                return `az network: available commands: nsg show, nsg rule list`;
            }

            if (group === 'functionapp') {
                return `{
    "name": "aether-guard-azure-func",
    "state": "Running",
    "resourceGroup": "rg-citadel-prod"
}`;
            }

            return `az: unknown group '${group}'. Available: vm, network, functionapp, policy, account`;
        },

        'nmap': function(args) {
            if (args.length === 0) return 'Usage: nmap [options] <target>';
            return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for localhost (127.0.0.1)
Host is up (0.00012s latency).

PORT     STATE SERVICE
22/tcp   open  ssh
9000/tcp open  http (Aether Guard Dashboard)

Nmap done: 1 IP address (1 host up) scanned in 1.01 seconds`;
        },

        'ping': function(args) {
            const target = args[0] || '';
            if (!target) return 'Usage: ping [-c count] destination';
            if (target === 'localhost' || target === '127.0.0.1') {
                return `PING ${target} 56(84) bytes of data.
64 bytes from ${target}: icmp_seq=1 ttl=64 time=0.1 ms
3 packets transmitted, 3 received, 0% packet loss`;
            }
            return `ping: ${target}: Name or service not known`;
        },

        'systemctl': function(args) {
            const action = args[0] || '';
            const service = args[1] || '';
            if (action === 'status' && service.includes('aether')) {
                return `aether-guard.service - Aether Guard CSPM Monitor
     Loaded: loaded (/etc/systemd/system/aether-guard.service; enabled)
     Active: active (running) since Wed 2026-03-19 02:00:00 UTC
   Main PID: 5678 (aether-guard)

Mar 19 02:00:09 aether-mgmt aether-guard[5678]: ALERT: Automated remediation NON-FUNCTIONAL`;
            }
            return `Unit ${service || 'unknown'}.service could not be found.`;
        },

        'terraform': function(args) {
            if (args.includes('plan')) {
                return `Terraform plan output:
  # aws_s3_bucket.public_test will be created with PUBLIC access
  # aws_s3_bucket_policy.public_read grants s3:GetObject to Principal: *
  # aws_iam_role.remediate_role is MISSING remediation permissions

Plan: 3 to add, 0 to change, 0 to destroy.

WARNING: This IaC template creates a publicly accessible S3 bucket.
The remediation system should catch this, but it is currently broken.`;
            }
            if (args.includes('show')) {
                return `IaC files located at: /opt/aether-guard/iac/
  main.tf          -- Infrastructure definitions
  iam-policy.json  -- IAM policy for remediation role (INCOMPLETE)`;
            }
            return 'Usage: terraform [plan|show|apply|destroy]';
        },

        'git': function(args) {
            if (args.includes('log')) {
                return `commit abc1234 (HEAD -> main)
Author: iam_auditor <auditor@citadel.sec>
Date:   Fri Dec 1 10:00:00 2025

    feat: Apply least-privilege to Lambda IAM roles

    Removed unused permissions from aether-guard-remediate-role:
    - s3:PutBucketPublicAccessBlock (seemed excessive)
    - ec2:RevokeSecurityGroupIngress (seemed excessive)

commit def5678
Author: cloud_architect <architect@citadel.sec>
Date:   Mon Jun 15 08:00:00 2025

    feat: Initial Aether Guard deployment with full remediation permissions`;
            }
            if (args.includes('diff')) {
                return `--- a/iac/iam-policy.json
+++ b/iac/iam-policy.json
@@ -8,8 +8,6 @@
         "s3:GetBucketPolicy",
         "s3:GetBucketPolicyStatus",
         "s3:ListBucket",
-        "s3:PutBucketPublicAccessBlock",
         "ec2:DescribeSecurityGroups",
         "ec2:DescribeSecurityGroupRules",
-        "ec2:RevokeSecurityGroupIngress",
         "logs:CreateLogGroup",`;
            }
            return 'Usage: git [log|diff|status|show]';
        },

        'curl': function(args) {
            const url = args.find(a => /^https?:\/\//.test(a)) || args.filter(a => !a.startsWith('-')).pop() || '';
            if (url.includes('localhost:9000') || url.includes('aether-guard')) {
                return `{"compliance_status":"FAIL","non_compliant":2,"remediation_status":"FAILING","lambda_errors":12}`;
            }
            return `curl: (7) Failed to connect: Connection refused`;
        },

        'journalctl': function(args) {
            return `-- Journal begins at Wed 2026-03-19 02:00:00 UTC --
Mar 19 02:00:00 aether-mgmt aether-guard[5678]: CSPM scan started
Mar 19 02:00:02 aether-mgmt aether-guard[5678]: FINDING: S3-PUBLIC-01 public
Mar 19 02:00:04 aether-mgmt aether-guard[5678]: REMEDIATION FAILED (Lambda error 500)
Mar 19 02:00:06 aether-mgmt aether-guard[5678]: FINDING: VM-SHADOW-01 permissive NSG
Mar 19 02:00:08 aether-mgmt aether-guard[5678]: REMEDIATION FAILED (Lambda error 500)
Mar 19 02:00:09 aether-mgmt aether-guard[5678]: ALERT: Remediation non-functional`;
        }
    },

    // ═══════════════════════════════════════════════════════
    // HTML HELPERS
    // ═══════════════════════════════════════════════════════

    _tableHtml(headers, rows) {
        let html = '<table style="width:100%; border-collapse:collapse; font-size:0.8rem;"><thead><tr>';
        headers.forEach(h => {
            html += `<th style="padding:6px 10px; text-align:left; color:#8b5cf6; border-bottom:2px solid #333; background:#1a1a2e;">${h}</th>`;
        });
        html += '</tr></thead><tbody>';
        rows.forEach(row => {
            html += '<tr>';
            row.forEach(cell => {
                html += `<td style="padding:5px 10px; border-bottom:1px solid #222; color:#ccc;">${cell}</td>`;
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
