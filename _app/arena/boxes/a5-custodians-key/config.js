/* ============================================================
   CTF ARENA — Box A5: The Custodian's Key
   Windows Privilege Escalation | Unquoted Service Path
   Config: Windows filesystem, services, flags, hints, lore
   ============================================================ */

const A5Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'The Custodian\'s Key',
    subtitle: 'Windows Privilege Escalation — Corporate Jump Server',

    // Tutorial mode (AR-12)
    tutorialMode: true,
    tutorial: {
            "steps": [
                    {
                            "title": "Enumerate the system",
                            "tip": "Run systeminfo, whoami /priv, and net user to understand the Windows environment.",
                            "trigger": {
                                    "event": "command",
                                    "match": {
                                            "cmd": "contains:whoami"
                                    },
                                    "alt": [
                                            {
                                                    "event": "command",
                                                    "match": {
                                                            "cmd": "contains:systeminfo"
                                                    }
                                            }
                                    ]
                            }
                    },
                    {
                            "title": "Find escalation vectors",
                            "tip": "Check for unquoted service paths, weak permissions, scheduled tasks, or stored credentials.",
                            "trigger": {
                                    "event": "command",
                                    "match": {
                                            "cmd": "contains:sc query"
                                    },
                                    "alt": [
                                            {
                                                    "event": "command",
                                                    "match": {
                                                            "cmd": "contains:icacls"
                                                    }
                                            },
                                            {
                                                    "event": "command",
                                                    "match": {
                                                            "cmd": "contains:schtasks"
                                                    }
                                            }
                                    ]
                            }
                    },
                    {
                            "title": "Extract credentials",
                            "tip": "Look in registry, config files, or use tools to dump cached credentials.",
                            "trigger": {
                                    "event": "command",
                                    "match": {
                                            "cmd": "contains:reg query"
                                    },
                                    "alt": [
                                            {
                                                    "event": "command",
                                                    "match": {
                                                            "cmd": "contains:type"
                                                    }
                                            }
                                    ]
                            }
                    },
                    {
                            "title": "Capture the user flag",
                            "tip": "Find the user flag file on the compromised Windows system.",
                            "trigger": {
                                    "event": "flag_correct",
                                    "match": {
                                            "flagId": "user"
                                    }
                            }
                    },
                    {
                            "title": "Escalate to admin",
                            "tip": "Use the escalation vector to gain SYSTEM or Administrator access and capture the root flag.",
                            "trigger": {
                                    "event": "flag_correct",
                                    "match": {
                                            "flagId": "root"
                                    }
                            }
                    }
            ]
    },
    difficulty: 'Intermediate',
    accent: '#3498db',
    storageKey: 'hexworth_ctf_a5',
    registryId: 'a5-custodians-key',
    trackerKey: 'ctf_a5',

    // ═══════════════════════════════════════════════════════
    // CERT OBJECTIVES (Assessment Mode — AR-7)
    // ═══════════════════════════════════════════════════════

    certObjectives: {
        certPath: 'PT0-002',
        mappings: [
            // Reconnaissance — T1046 Network Service Scanning
            { flagId: null,   phase: 'recon',       objective: '3.1',  description: 'Given a scenario, apply attacks and exploits — Network Scanning', skill: 'Windows Port & Service Discovery (T1046)' },
            { flagId: null,   phase: 'recon',       objective: '3.2',  description: 'Given a scenario, perform post-exploitation techniques — OS fingerprinting', skill: 'Windows OS & Build Identification (T1082)' },
            // Service Enumeration — T1069, T1087, T1574
            { flagId: null,   phase: 'service_enum', objective: '3.3', description: 'Given a scenario, use appropriate tools to perform a penetration test — Windows enumeration', skill: 'Windows Service Configuration Enumeration (T1069.001)' },
            { flagId: null,   phase: 'service_enum', objective: '3.3', description: 'Given a scenario, use appropriate tools to perform a penetration test — Unquoted path analysis', skill: 'Unquoted Service Path Identification (T1574.009)' },
            { flagId: null,   phase: 'service_enum', objective: '3.1', description: 'Given a scenario, apply attacks and exploits — Permission auditing', skill: 'icacls / accesschk Write Permission Verification (T1222)' },
            // Initial Access — T1078
            { flagId: 'user', phase: 'access',       objective: '3.1', description: 'Given a scenario, apply attacks and exploits — Credential-based access', skill: 'Windows Service Account Foothold (T1078.003)' },
            // Privilege Escalation — T1574.009, T1547.001, T1053.005
            { flagId: 'root', phase: 'privesc',      objective: '3.1', description: 'Given a scenario, apply attacks and exploits — Privilege escalation', skill: 'Unquoted Service Path Binary Hijacking (T1574.009)' },
            { flagId: 'root', phase: 'privesc',      objective: '3.1', description: 'Given a scenario, apply attacks and exploits — Service restart for payload execution', skill: 'Service Start/Stop for Exploitation (T1569.002)' },
            // CompTIA Security+ SY0-701 crossover
            { flagId: 'user', phase: 'access',       objective: '4.3', description: 'SY0-701: Explain the importance of security policies — Least privilege', skill: 'Identifying Overly Permissive Service Account Rights' },
            { flagId: 'root', phase: 'privesc',      objective: '3.2', description: 'SY0-701: Given a scenario, apply cybersecurity solutions — Windows service hardening', skill: 'Quoting Service Paths & Write ACL Tightening' },
            { flagId: 'root', phase: 'privesc',      objective: '4.5', description: 'SY0-701: Explain the security implications of proper hardware, software, and data asset management', skill: 'Third-Party Software Deployment Security Review' }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // PHASE SYSTEM (Multi-layer attack chain)
    // ═══════════════════════════════════════════════════════

    phases: [
        {
            id: 'recon',
            name: 'Reconnaissance',
            icon: '\uD83D\uDD0D',
            description: 'Enumerate the jump server — discover open ports, running services, OS version, and user context. Map the attack surface before you touch anything.',
            requiredFlags: [],
            mitre: ['T1046', 'T1082', 'T1595.001'],
            unlocks: ['service_enum'],
            locked: false
        },
        {
            id: 'service_enum',
            name: 'Service Enumeration',
            icon: '\uD83D\uDCCB',
            description: 'Enumerate every Windows service. Use sc, wmic, and PowerShell to pull binary paths. Look for paths that contain spaces but lack quotes — Windows resolves them left-to-right, creating a hijack window.',
            requiredFlags: [],
            mitre: ['T1069.001', 'T1087.001', 'T1574.009', 'T1222'],
            unlocks: ['access'],
            locked: true
        },
        {
            id: 'access',
            name: 'Initial Access',
            icon: '\uD83D\uDD13',
            description: 'Confirm your foothold as svc_backup. Verify your privileges with whoami /priv and net user. Read the user flag from the Desktop. Document your current permission set before escalating.',
            requiredFlags: [],
            mitre: ['T1078.003', 'T1059.003'],
            unlocks: ['privesc'],
            locked: true
        },
        {
            id: 'privesc',
            name: 'Windows Privilege Escalation',
            icon: '\uD83D\uDD17',
            description: 'Escalate from svc_backup to NT AUTHORITY\\SYSTEM. The unquoted path for AdvancedMonitoring means Windows will try C:\\Program Files\\Advanced.exe before the real binary. The directory is writable by BUILTIN\\Users. Copy your payload, restart the service, and claim SYSTEM.',
            requiredFlags: ['user'],
            mitre: ['T1574.009', 'T1569.002', 'T1547.001', 'T1053.005'],
            unlocks: [],
            locked: true
        }
    ],

    // ═══════════════════════════════════════════════════════
    // BOOT SEQUENCE (Windows Server)
    // ═══════════════════════════════════════════════════════

    boot: {
        biosLines: [
            'American Megatrends BIOS v2.20.1271',
            'Initializing hardware...',
            'Memory Test: 32768 MB OK',
            'Detecting drives... NVMe SSD (1TB)',
            'Checking UEFI Secure Boot... Enabled',
            'Loading Windows Boot Manager...',
            'Windows is loading files...'
        ],
        grubEntries: [
            'Windows Server 2019',
            'Windows Server 2019 (Safe Mode)',
            'Windows Recovery Environment'
        ],
        loginUser: 'svc_backup'
    },

    // ═══════════════════════════════════════════════════════
    // DESKTOP ICONS (No browser — this IS the target)
    // ═══════════════════════════════════════════════════════

    desktop: {
        icons: [
            { id: 'terminal', label: 'CMD', icon: '\uD83D\uDDA5\uFE0F', app: 'terminal' },
            { id: 'notes',    label: 'Notes',    icon: '\uD83D\uDCDD', app: 'notes' },
            { id: 'hints',    label: 'Hints',    icon: '\uD83D\uDCA1', app: 'hints' },
            { id: 'flags',    label: 'Submit Flag', icon: '\uD83D\uDEA9', app: 'flags' }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // TERMINAL CONFIG
    // ═══════════════════════════════════════════════════════

    terminal: {
        user: 'svc_backup',
        hostname: 'CORP-JUMP-01',
        startDir: '/Users/svc_backup/Desktop',
        welcome: 'Microsoft Windows [Version 10.0.17763.5830]\n(c) Microsoft Corporation. All rights reserved.\n\nC:\\Users\\svc_backup\\Desktop>\n\nType \'help\' for available commands.'
    },

    // ═══════════════════════════════════════════════════════
    // STATE MACHINE
    // ═══════════════════════════════════════════════════════

    _state: {
        isSystem: false,
        serviceExploited: false,
        exploitCopied: false
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
        hintPenalty: -50,
        wrongFlagPenalty: -25,
        speedBonus: { threshold: 1200000, points: 100 }  // 20 minutes
    },

    // ═══════════════════════════════════════════════════════
    // HINTS
    // ═══════════════════════════════════════════════════════

    hints: [
        {
            id: 'hint1',
            text: "Start with your own identity: `whoami /priv`, `systeminfo`, `net user svc_backup`. Then list services: `sc query` and `tasklist /svc`. Get your bearings before you look for vectors.",
            cost: 10,
            penalty: -10
        },
        {
            id: 'hint2',
            text: "Pull the full service configuration: `sc qc AdvancedMonitoring` or `wmic service get name,pathname,startmode`. Stare at the BINARY_PATH_NAME. It has spaces and it is NOT quoted — that is the vulnerability.",
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint3',
            text: "Windows resolves unquoted paths left-to-right. For `C:\\Program Files\\Advanced Monitoring\\service.exe`, Windows tries `C:\\Program Files\\Advanced.exe` first. Run `icacls \"C:\\Program Files\"` — BUILTIN\\Users has write access. That write permission is your ticket.",
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint4',
            text: "Copy the exploit to the hijack location: `copy C:\\Users\\svc_backup\\Desktop\\exploit.exe \"C:\\Program Files\\Advanced.exe\"` — then restart the service: `sc stop AdvancedMonitoring` followed by `sc start AdvancedMonitoring`. The service runs as LocalSystem, so your payload runs as SYSTEM.",
            cost: 75,
            penalty: -75
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'CORP-JUMP-01 is the gateway into the corp.local domain — the one server every administrator touches. Intel has surfaced a service account credential for svc_backup, a backup operator with just enough privilege to be dangerous. Your mission: use this foothold to escalate to SYSTEM and extract proof of compromise from the Administrator\'s desktop.',
        scenario: 'The CorpIT team deployed a third-party monitoring agent — "Advanced Monitoring Service" — on a tight deadline before a compliance audit. The vendor\'s installer required the binary to live in a path with spaces. A sysadmin who had never heard of unquoted service path vulnerabilities approved the deployment. The icacls audit showed BUILTIN\\Users had write access to C:\\Program Files\\ — an inheritance artifact from a legacy application that was never cleaned up. The TODO note in admin_notes.txt says "Review unquoted service paths" and has been there for six months.',
        outro: 'The Custodian\'s Key has been turned. A misconfigured service on the corporate jump server — an unquoted path, a writable directory — was all it took. From a humble backup service account to NT AUTHORITY\\SYSTEM. The custodian never saw it coming.',
        ecer: {
            executive: 'Compliance pressure drove an accelerated deployment timeline — the monitoring agent was installed without a security review because the audit deadline was immovable, and leadership treated "get it running" as the only success criterion',
            culture: 'No change management process required security sign-off on third-party service installations; write permissions inherited from a legacy application sat unreviewed in icacls for years because no one owned the periodic ACL audit',
            employee: 'The sysadmin who installed the service was unaware of the unquoted service path attack vector — a knowledge gap that is common but catastrophic on SYSTEM-context services',
            regulatory: 'A CIS Benchmark L1 or STIG check for unquoted service paths would have flagged this automatically; the compliance audit that triggered the rushed deployment ironically would have caught the very vulnerability the rush created'
        }
    },

    // ═══════════════════════════════════════════════════════
    // FILESYSTEM (Windows target — Unix paths internally)
    // ═══════════════════════════════════════════════════════

    filesystem: {
        '/': {
            type: 'dir',
            children: {
                'Users': {
                    type: 'dir',
                    children: {
                        'svc_backup': {
                            type: 'dir',
                            children: {
                                'Desktop': {
                                    type: 'dir',
                                    children: {
                                        'user.txt': {
                                            type: 'file',
                                            content: 'flag{cust0d14n_b4ckup_4cc3ss}'
                                        },
                                        'notes.txt': {
                                            type: 'file',
                                            content: 'Corporate Jump Server - svc_backup\nBackup service account for scheduled tasks.\nContact IT: admin@corp.local\n\nReminder: Check Advanced Monitoring Service health weekly.\nService path: C:\\Program Files\\Advanced Monitoring\\service.exe\n\nMaintenance window: Sundays 02:00-06:00 UTC\nBackup schedule: Daily incremental, weekly full\n\nNote: This account has SeBackupPrivilege for backup operations.\nDo NOT use this account for interactive logon unless necessary.'
                                        },
                                        'exploit.exe': {
                                            type: 'file',
                                            content: '[PE32+ executable - reverse shell payload]\n[Size: 73,802 bytes]\n[Compiled: x86_64-w64-mingw32-gcc]\n[Payload: cmd.exe /c whoami > C:\\Temp\\pwned.txt]'
                                        },
                                        'backup_log.txt': {
                                            type: 'file',
                                            content: '=== Backup Log - CORP-JUMP-01 ===\n2024-01-14 02:00:01 [INFO] Starting incremental backup\n2024-01-14 02:00:03 [INFO] Backing up C:\\Users\\*\n2024-01-14 02:15:22 [INFO] Backing up C:\\Program Files\\*\n2024-01-14 02:30:45 [WARN] Skipped locked file: C:\\Windows\\System32\\config\\SAM\n2024-01-14 02:31:01 [INFO] Backup completed. 4,231 files processed.\n2024-01-14 02:31:02 [INFO] Next scheduled: 2024-01-15 02:00:00'
                                        },
                                        'registry_export_HKLM_Installer.reg': {
                                            type: 'file',
                                            content: 'Windows Registry Editor Version 5.00\n\n; [DECOY] AlwaysInstallElevated is NOT set — this is a red herring\n; Exported: 2024-01-10 by svc_backup (checking for AIE privesc)\n\n[HKEY_LOCAL_MACHINE\\SOFTWARE\\Policies\\Microsoft\\Windows\\Installer]\n; Key exists but AlwaysInstallElevated value is absent = not enabled\n; This path is NOT your escalation vector\n\n[HKEY_CURRENT_USER\\SOFTWARE\\Policies\\Microsoft\\Windows\\Installer]\n; Same — AIE not set for current user\n; Dead end. Look elsewhere.\n\n; Hint: AIE requires BOTH HKLM and HKCU to be set to 1\n; Neither is set here. Move on.'
                                        },
                                        'token_dump_attempt.txt': {
                                            type: 'file',
                                            content: 'TOKEN IMPERSONATION ATTEMPT LOG\n================================\nDate: 2024-01-13\nTool: custom token_grabber.exe\nStatus: FAILED\n\nError: SeImpersonatePrivilege not available to svc_backup\nError: Cannot impersonate named pipe tokens without SeImpersonate\n\nPotato attacks attempted:\n  - JuicyPotato: FAILED (no SeImpersonate)\n  - RoguePotato: FAILED (no SeImpersonate)\n  - PrintSpoofer: FAILED (no SeImpersonate)\n\n[NOTE] svc_backup has SeBackupPrivilege and SeRestorePrivilege\nbut NOT SeImpersonatePrivilege. Potato attacks are a dead end here.\n\nSeBackupPrivilege abuse (SAM dump) also blocked — SAM is locked\nand requires Volume Shadow Copy access not available to this account.\n\n>> Try a different angle. Look at the services running on this box.'
                                        }
                                    }
                                },
                                'Documents': {
                                    type: 'dir',
                                    children: {
                                        'service_inventory.csv': {
                                            type: 'file',
                                            content: 'ServiceName,DisplayName,BinaryPath,StartType,RunAs\nAdvancedMonitoring,Advanced Monitoring Service,C:\\Program Files\\Advanced Monitoring\\service.exe,Auto,LocalSystem\nSpooler,Print Spooler,"C:\\Windows\\System32\\spoolsv.exe",Auto,LocalSystem\nWinRM,Windows Remote Management,"C:\\Windows\\System32\\svchost.exe -k WinRM",Auto,LocalService\nwuauserv,Windows Update,"C:\\Windows\\System32\\svchost.exe -k netsvcs",Manual,LocalSystem'
                                        },
                                        'readme.txt': {
                                            type: 'file',
                                            content: 'SVC_BACKUP ACCOUNT DOCUMENTATION\n=================================\nThis service account is used for automated backup operations.\n\nPermissions:\n- SeBackupPrivilege (read any file regardless of ACL)\n- SeRestorePrivilege (write any file regardless of ACL)\n- Member of Backup Operators group\n\nDo NOT add this account to Administrators group.\nDo NOT grant interactive logon rights in production.\n\nFor questions, contact: sysadmin@corp.local'
                                        },
                                        'scheduled_tasks_export.txt': {
                                            type: 'file',
                                            content: '=== Scheduled Tasks Export — CORP-JUMP-01 ===\n[DECOY] No writable task scripts found — this is a dead end\n\nTaskName: \\Microsoft\\Windows\\WindowsUpdate\\Scheduled Start\n  Run As: SYSTEM\n  Action: %windir%\\system32\\svchost.exe -k netsvcs -p\n  Writable: NO (C:\\Windows\\System32 — not writable by svc_backup)\n\nTaskName: \\CorpIT\\BackupCheck\n  Run As: CORP-JUMP-01\\svc_backup\n  Action: C:\\Users\\svc_backup\\AppData\\Local\\Temp\\backup_check.ps1\n  Writable: YES — but runs as svc_backup, not SYSTEM\n  NOTE: Modifying this script only gets you svc_backup-level execution\n        Not useful for privilege escalation. Dead end.\n\nTaskName: \\CorpIT\\MonitoringHeartbeat\n  Run As: SYSTEM\n  Action: "C:\\Program Files\\Advanced Monitoring\\service.exe" --heartbeat\n  Writable: NO (script not writable)\n\n>> Scheduled task abuse is not the path. The service binary path is.'
                                        },
                                        'laps_query_attempt.txt': {
                                            type: 'file',
                                            content: 'LAPS (Local Administrator Password Solution) Query\n==================================================\nDate: 2024-01-12\nAttempted by: svc_backup\n\nCommand: Get-AdComputer CORP-JUMP-01 -Properties ms-Mcs-AdmPwd\nResult: Access Denied — svc_backup not in LAPS Readers group\n\nCommand: reg query \\\\CORP-JUMP-01\\HKLM\\SECURITY\\SAM\nResult: Access Denied — remote registry blocked for non-admins\n\nCommand: ldapsearch ms-Mcs-AdmPwd\nResult: No LDAP read rights for this attribute\n\n[NOTE] LAPS is deployed but svc_backup cannot read it.\nThe local Administrator password is not recoverable this way.\nThis dead end was fully expected. Look at service configurations instead.'
                                        }
                                    }
                                },
                                'AppData': {
                                    type: 'dir',
                                    children: {
                                        'Local': {
                                            type: 'dir',
                                            children: {
                                                'Temp': {
                                                    type: 'dir',
                                                    children: {
                                                        'backup_check.ps1': {
                                                            type: 'file',
                                                            content: '# Backup health check — runs via Task Scheduler\n# Author: svc_backup auto-generated\n\n$services = Get-Service | Where-Object { $_.Name -like "*backup*" }\n$services | ForEach-Object {\n    Write-Output ("Service: " + $_.Name + " Status: " + $_.Status)\n}\n\n# AlwaysInstallElevated check (disabled)\n# $aie = Get-ItemProperty HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows\\Installer -Name AlwaysInstallElevated -EA SilentlyContinue\n# Write-Output "AIE: $($aie.AlwaysInstallElevated)"\n\n# TODO: add registry-based configuration sync\n# reg query "HKLM\\SOFTWARE\\Corp\\BackupAgent" /v SecretKey'
                                                        }
                                                    }
                                                },
                                                'Microsoft': {
                                                    type: 'dir',
                                                    children: {
                                                        'Windows': {
                                                            type: 'dir',
                                                            children: {
                                                                'PowerShell': {
                                                                    type: 'dir',
                                                                    children: {
                                                                        'ConsoleHost_history.txt': {
                                                                            type: 'file',
                                                                            content: '# PowerShell command history — svc_backup\n# [DECOY] These are common dead ends; the real vector is service configuration\n\nGet-Service\nGet-Service | Where-Object {$_.StartType -eq "Automatic"}\nGet-ItemProperty HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows\\Installer\nreg query HKLM\\SYSTEM\\CurrentControlSet\\Services\nGet-LocalUser\nGet-LocalGroupMember Administrators\nTest-Path "C:\\Program Files (x86)\\CorpAgent\\agent.exe"\nGet-ScheduledTask | Where-Object {$_.TaskPath -like "*Corp*"}\nInvoke-WebRequest http://file.corp.local/tools/sysmon.exe -OutFile C:\\Temp\\sysmon.exe\n# Above failed — server not reachable from svc_backup context\nGet-Acl "C:\\Windows\\Tasks"\n# Tasks dir not writable — dead end\nGet-ItemProperty HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run\n# AdvMonitor key present but binary path is full — no hijack here\nGet-Process | Sort-Object CPU -Descending | Select-Object -First 10'
                                                                        }
                                                                    }
                                                                }
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
                        'Administrator': {
                            type: 'dir',
                            children: {
                                'Desktop': {
                                    type: 'dir',
                                    children: {
                                        'root.txt': {
                                            type: 'file',
                                            content: 'flag{cust0d14ns_k3y_syst3m_0wn3d}'
                                        },
                                        'admin_notes.txt': {
                                            type: 'file',
                                            content: 'ADMIN NOTES - CONFIDENTIAL\n==========================\nDomain: corp.local\nDC: DC-01 (10.10.14.2)\nThis server: CORP-JUMP-01 (10.10.14.20)\n\nTODO:\n- Patch Advanced Monitoring Service (vendor sent update)\n- Audit service account permissions\n- Review unquoted service paths (!!) <-- keep forgetting this\n- Rotate svc_backup password (90 days overdue)\n\nKRBTGT hash last rotated: 2023-06-15\nLocal admin password: [REDACTED - see LAPS]'
                                        },
                                        'flag_proof.txt': {
                                            type: 'file',
                                            content: 'If you can read this, you have SYSTEM-level access.\nCongratulations on exploiting the unquoted service path.\n\nRoot flag: flag{cust0d14ns_k3y_syst3m_0wn3d}'
                                        }
                                    }
                                },
                                'Documents': {
                                    type: 'dir',
                                    children: {
                                        'network_diagram.txt': {
                                            type: 'file',
                                            content: 'CORP.LOCAL NETWORK DIAGRAM\n==========================\n\n10.10.14.0/24 - Server VLAN\n  .1   - Gateway (Palo Alto)\n  .2   - DC-01 (Domain Controller)\n  .10  - FILE-01 (File Server)\n  .15  - SQL-01 (Database Server)\n  .20  - CORP-JUMP-01 (Jump Server) <-- YOU ARE HERE\n  .25  - WEB-01 (IIS Web Server)\n\n10.10.15.0/24 - Workstation VLAN\n10.10.16.0/24 - DMZ'
                                        }
                                    }
                                }
                            }
                        },
                        'Public': {
                            type: 'dir',
                            children: {
                                'Desktop': {
                                    type: 'dir',
                                    children: {}
                                },
                                'Documents': {
                                    type: 'dir',
                                    children: {
                                        'IT_Policy.txt': {
                                            type: 'file',
                                            content: 'CORPORATE IT SECURITY POLICY\n=============================\n1. All service accounts must use gMSA where possible\n2. Service binary paths MUST be quoted if they contain spaces\n3. Principle of least privilege for all accounts\n4. Jump servers require MFA for remote access\n5. Quarterly review of service account permissions\n\nLast audit: 2023-09-15 (OVERDUE)\nNext audit: TBD'
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                'Program Files': {
                    type: 'dir',
                    children: {
                        'Advanced Monitoring': {
                            type: 'dir',
                            children: {
                                'service.exe': {
                                    type: 'file',
                                    content: '[PE32+ executable - Advanced Monitoring Service v3.2]\n[Size: 2,048,576 bytes]\n[Signed: AdvMon Corp]\n[Service: AdvancedMonitoring]\n[Runs as: LocalSystem]'
                                },
                                'config.ini': {
                                    type: 'file',
                                    content: '[General]\nServiceName=AdvancedMonitoring\nDisplayName=Advanced Monitoring Service\nLogLevel=INFO\nLogPath=C:\\Program Files\\Advanced Monitoring\\logs\\\n\n[Network]\nListenPort=8443\nBindAddress=0.0.0.0\n\n[Monitoring]\nInterval=60\nTargets=10.10.14.2,10.10.14.10,10.10.14.15\nAlertEmail=admin@corp.local'
                                },
                                'logs': {
                                    type: 'dir',
                                    children: {
                                        'service.log': {
                                            type: 'file',
                                            content: '2024-01-15 08:00:01 [INFO] Advanced Monitoring Service started\n2024-01-15 08:00:02 [INFO] Listening on 0.0.0.0:8443\n2024-01-15 08:01:01 [INFO] Health check: DC-01 OK\n2024-01-15 08:01:02 [INFO] Health check: FILE-01 OK\n2024-01-15 08:01:03 [INFO] Health check: SQL-01 OK\n2024-01-15 08:02:01 [INFO] Health check cycle complete'
                                        }
                                    }
                                },
                                'README.txt': {
                                    type: 'file',
                                    content: 'Advanced Monitoring Service v3.2\n================================\nInstalled: 2023-03-20\nVendor: AdvMon Corp\n\nIMPORTANT: Install path must NOT contain spaces\nunless the service binary path is properly quoted.\n\nContact: support@advmon-corp.example.com'
                                }
                            }
                        },
                        'Windows Defender': {
                            type: 'dir',
                            children: {
                                'MsMpEng.exe': {
                                    type: 'file',
                                    content: '[Windows Defender Antimalware Service Executable]\n[Size: 128,304 bytes]\n[Signed: Microsoft Corporation]'
                                }
                            }
                        },
                        'Common Files': {
                            type: 'dir',
                            children: {
                                'System': {
                                    type: 'dir',
                                    children: {}
                                }
                            }
                        }
                    }
                },
                'Program Files (x86)': {
                    type: 'dir',
                    children: {
                        'Common Files': {
                            type: 'dir',
                            children: {}
                        }
                    }
                },
                'Windows': {
                    type: 'dir',
                    children: {
                        'System32': {
                            type: 'dir',
                            children: {
                                'cmd.exe': {
                                    type: 'file',
                                    content: '[Windows Command Processor]'
                                },
                                'config': {
                                    type: 'dir',
                                    children: {
                                        'SAM': {
                                            type: 'file',
                                            content: '[LOCKED - System file - Access denied]'
                                        },
                                        'SYSTEM': {
                                            type: 'file',
                                            content: '[LOCKED - System file - Access denied]'
                                        },
                                        'SECURITY': {
                                            type: 'file',
                                            content: '[LOCKED - System file - Access denied]'
                                        }
                                    }
                                },
                                'drivers': {
                                    type: 'dir',
                                    children: {
                                        'etc': {
                                            type: 'dir',
                                            children: {
                                                'hosts': {
                                                    type: 'file',
                                                    content: '# Copyright (c) 1993-2009 Microsoft Corp.\n#\n# This is a sample HOSTS file used by Microsoft TCP/IP for Windows.\n#\n# localhost name resolution is handled within DNS itself.\n127.0.0.1       localhost\n::1             localhost\n10.10.14.2      dc-01.corp.local dc-01\n10.10.14.20     corp-jump-01.corp.local corp-jump-01'
                                                }
                                            }
                                        }
                                    }
                                },
                                'spoolsv.exe': {
                                    type: 'file',
                                    content: '[Print Spooler Service]'
                                },
                                'svchost.exe': {
                                    type: 'file',
                                    content: '[Service Host Process]'
                                }
                            }
                        },
                        'Temp': {
                            type: 'dir',
                            children: {}
                        },
                        'Logs': {
                            type: 'dir',
                            children: {
                                'CBS': {
                                    type: 'dir',
                                    children: {}
                                }
                            }
                        }
                    }
                },
                'Temp': {
                    type: 'dir',
                    children: {}
                }
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // PATH CONVERSION HELPERS
    // ═══════════════════════════════════════════════════════

    _toWinPath(unixPath) {
        if (!unixPath || unixPath === '/') return 'C:\\';
        return 'C:' + unixPath.replace(/\//g, '\\');
    },

    _toUnixPath(winPath) {
        if (!winPath) return '/';
        return winPath.replace(/^[A-Za-z]:/, '').replace(/\\/g, '/') || '/';
    },

    _escHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    // ═══════════════════════════════════════════════════════
    // FILESYSTEM NAVIGATION HELPER
    // ═══════════════════════════════════════════════════════

    _resolveNode(unixPath) {
        if (!unixPath || unixPath === '/') return A5Config.filesystem['/'];
        const parts = unixPath.replace(/^\//, '').split('/').filter(Boolean);
        let node = A5Config.filesystem['/'];
        for (const part of parts) {
            if (!node || !node.children || !node.children[part]) {
                return null;
            }
            node = node.children[part];
        }
        return node;
    },

    _checkAccess(unixPath) {
        if (unixPath.match(/^\/Users\/Administrator/i) && !A5Config._state.isSystem) {
            return false;
        }
        return true;
    },

    // ═══════════════════════════════════════════════════════
    // TERMINAL COMMANDS (Windows cmd.exe simulation)
    // ═══════════════════════════════════════════════════════

    commands: {

        // ── CORE IDENTITY ──

        'whoami': function(args, term, engine) {
            if (A5Config._state.isSystem) {
                if (args.includes('/priv')) {
                    return 'PRIVILEGES INFORMATION\n' +
                        '----------------------\n\n' +
                        'Privilege Name                  Description                    State\n' +
                        '=============================  ==============================  ========\n' +
                        'SeAssignPrimaryTokenPrivilege  Replace a process level token   Enabled\n' +
                        'SeTcbPrivilege                 Act as part of the OS           Enabled\n' +
                        'SeBackupPrivilege              Back up files and directories   Enabled\n' +
                        'SeRestorePrivilege             Restore files and directories   Enabled\n' +
                        'SeDebugPrivilege               Debug programs                  Enabled\n' +
                        'SeImpersonatePrivilege         Impersonate a client            Enabled\n' +
                        'SeCreateGlobalPrivilege        Create global objects           Enabled';
                }
                if (args.includes('/all') || args.includes('/groups')) {
                    return 'USER INFORMATION\n' +
                        '----------------\n' +
                        'User Name           SID\n' +
                        '==================  ============================\n' +
                        'nt authority\\system S-1-5-18\n\n' +
                        'GROUP INFORMATION\n' +
                        '-----------------\n' +
                        'Group Name                    Type       SID\n' +
                        '============================  =========  ================\n' +
                        'NT AUTHORITY\\SYSTEM           Well-known S-1-5-18\n' +
                        'BUILTIN\\Administrators        Alias      S-1-5-32-544';
                }
                return 'nt authority\\system';
            }

            if (args.includes('/priv')) {
                return 'PRIVILEGES INFORMATION\n' +
                    '----------------------\n\n' +
                    'Privilege Name                 Description                    State\n' +
                    '============================  ==============================  ========\n' +
                    'SeBackupPrivilege              Back up files and directories   Enabled\n' +
                    'SeRestorePrivilege             Restore files and directories   Enabled\n' +
                    'SeShutdownPrivilege            Shut down the system            Disabled\n' +
                    'SeChangeNotifyPrivilege        Bypass traverse checking        Enabled\n' +
                    'SeIncreaseWorkingSetPrivilege  Increase a process working set  Disabled';
            }
            if (args.includes('/all') || args.includes('/groups')) {
                return 'USER INFORMATION\n' +
                    '----------------\n' +
                    'User Name              SID\n' +
                    '=====================  ============================\n' +
                    'corp-jump-01\\svc_backup S-1-5-21-3842773548-1126382-1234567-1103\n\n' +
                    'GROUP INFORMATION\n' +
                    '-----------------\n' +
                    'Group Name                    Type       SID\n' +
                    '============================  =========  ================\n' +
                    'CORP-JUMP-01\\Backup Operators Alias      S-1-5-32-551\n' +
                    'BUILTIN\\Users                 Alias      S-1-5-32-545';
            }
            return 'corp-jump-01\\svc_backup';
        },

        // ── SYSTEM INFORMATION ──

        'systeminfo': function(args, term, engine) {
            return 'Host Name:                 CORP-JUMP-01\n' +
                'OS Name:                   Microsoft Windows Server 2019 Standard\n' +
                'OS Version:                10.0.17763 N/A Build 17763\n' +
                'OS Manufacturer:           Microsoft Corporation\n' +
                'OS Configuration:          Member Server\n' +
                'OS Build Type:             Multiprocessor Free\n' +
                'Registered Owner:          CorpIT\n' +
                'System Type:               x64-based PC\n' +
                'Processor(s):              2 Processor(s) Installed.\n' +
                '                           [01]: Intel64 Family 6 Model 85 Stepping 7 GenuineIntel ~2100 Mhz\n' +
                '                           [02]: Intel64 Family 6 Model 85 Stepping 7 GenuineIntel ~2100 Mhz\n' +
                'Total Physical Memory:     32,768 MB\n' +
                'Available Physical Memory: 24,102 MB\n' +
                'Domain:                    corp.local\n' +
                'Logon Server:              \\\\DC-01\n' +
                'Hotfix(s):                 4 Hotfix(s) Installed.\n' +
                '                           [01]: KB5032196\n' +
                '                           [02]: KB5031361\n' +
                '                           [03]: KB5028316\n' +
                '                           [04]: KB5027271';
        },

        'hostname': function(args, term, engine) {
            return 'CORP-JUMP-01';
        },

        // ── NETWORK ──

        'ipconfig': function(args, term, engine) {
            if (args.includes('/all')) {
                return 'Windows IP Configuration\n\n' +
                    '   Host Name . . . . . . . . . . . . : CORP-JUMP-01\n' +
                    '   Primary Dns Suffix  . . . . . . . : corp.local\n' +
                    '   Node Type . . . . . . . . . . . . : Hybrid\n' +
                    '   IP Routing Enabled. . . . . . . . : No\n\n' +
                    'Ethernet adapter Ethernet0:\n\n' +
                    '   Connection-specific DNS Suffix  . : corp.local\n' +
                    '   Description . . . . . . . . . . . : vmxnet3 Ethernet Adapter\n' +
                    '   Physical Address. . . . . . . . . : 00-50-56-B9-1A-3F\n' +
                    '   DHCP Enabled. . . . . . . . . . . : No\n' +
                    '   IPv4 Address. . . . . . . . . . . : 10.10.14.20\n' +
                    '   Subnet Mask . . . . . . . . . . . : 255.255.255.0\n' +
                    '   Default Gateway . . . . . . . . . : 10.10.14.1\n' +
                    '   DNS Servers . . . . . . . . . . . : 10.10.14.2';
            }
            return 'Windows IP Configuration\n\n' +
                'Ethernet adapter Ethernet0:\n\n' +
                '   IPv4 Address. . . . . . . . . . . : 10.10.14.20\n' +
                '   Subnet Mask . . . . . . . . . . . : 255.255.255.0\n' +
                '   Default Gateway . . . . . . . . . : 10.10.14.1';
        },

        'netstat': function(args, term, engine) {
            if (args.includes('-ano') || args.includes('-an')) {
                return 'Active Connections\n\n' +
                    '  Proto  Local Address          Foreign Address        State           PID\n' +
                    '  TCP    0.0.0.0:135            0.0.0.0:0              LISTENING       892\n' +
                    '  TCP    0.0.0.0:445            0.0.0.0:0              LISTENING       4\n' +
                    '  TCP    0.0.0.0:3389           0.0.0.0:0              LISTENING       1056\n' +
                    '  TCP    0.0.0.0:5985           0.0.0.0:0              LISTENING       4\n' +
                    '  TCP    0.0.0.0:8443           0.0.0.0:0              LISTENING       892\n' +
                    '  TCP    10.10.14.20:139        0.0.0.0:0              LISTENING       4\n' +
                    '  TCP    10.10.14.20:3389       10.10.15.50:49832      ESTABLISHED     1056\n' +
                    '  UDP    0.0.0.0:123            *:*                                    1128\n' +
                    '  UDP    0.0.0.0:500            *:*                                    764';
            }
            return 'Active Connections\n\n' +
                '  Proto  Local Address          Foreign Address        State\n' +
                '  TCP    0.0.0.0:135            0.0.0.0:0              LISTENING\n' +
                '  TCP    0.0.0.0:445            0.0.0.0:0              LISTENING\n' +
                '  TCP    0.0.0.0:3389           0.0.0.0:0              LISTENING\n' +
                '  TCP    0.0.0.0:5985           0.0.0.0:0              LISTENING\n' +
                '  TCP    0.0.0.0:8443           0.0.0.0:0              LISTENING\n' +
                '  TCP    10.10.14.20:3389       10.10.15.50:49832      ESTABLISHED';
        },

        'ping': function(args, term, engine) {
            var target = args[0] || '';
            if (!target) return 'Usage: ping [-n count] destination';
            if (target === '10.10.14.2' || target === 'dc-01' || target === 'dc-01.corp.local') {
                return 'Pinging 10.10.14.2 with 32 bytes of data:\n' +
                    'Reply from 10.10.14.2: bytes=32 time<1ms TTL=128\n' +
                    'Reply from 10.10.14.2: bytes=32 time<1ms TTL=128\n' +
                    'Reply from 10.10.14.2: bytes=32 time<1ms TTL=128\n' +
                    'Reply from 10.10.14.2: bytes=32 time<1ms TTL=128\n\n' +
                    'Ping statistics for 10.10.14.2:\n' +
                    '    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss),\n' +
                    'Approximate round trip times in milli-seconds:\n' +
                    '    Minimum = 0ms, Maximum = 0ms, Average = 0ms';
            }
            if (target === '10.10.14.1' || target === 'localhost' || target === '127.0.0.1') {
                return 'Pinging ' + target + ' with 32 bytes of data:\n' +
                    'Reply from ' + target + ': bytes=32 time<1ms TTL=128\n\n' +
                    'Ping statistics for ' + target + ':\n' +
                    '    Packets: Sent = 1, Received = 1, Lost = 0 (0% loss)';
            }
            return 'Pinging ' + target + ' with 32 bytes of data:\n' +
                'Request timed out.\n\n' +
                'Ping statistics for ' + target + ':\n' +
                '    Packets: Sent = 4, Received = 0, Lost = 4 (100% loss)';
        },

        // ── FILE SYSTEM ──

        'dir': function(args, term, engine) {
            var rawPath = args.find(function(a) { return !a.startsWith('/'); }) || A5Config.terminal.startDir;
            var unixPath = A5Config._toUnixPath(rawPath);

            // Permission check
            if (!A5Config._checkAccess(unixPath)) {
                return 'Access is denied.';
            }

            // Navigate filesystem
            var node = A5Config._resolveNode(unixPath);
            if (!node) {
                return 'The system cannot find the path specified.';
            }

            if (node.type !== 'dir') {
                return A5Config._toWinPath(unixPath) + ' is a file, not a directory.';
            }

            var winPath = A5Config._toWinPath(unixPath);
            var output = ' Volume in drive C has no label.\n' +
                ' Volume Serial Number is 7A3B-4C2D\n\n' +
                ' Directory of ' + winPath + '\n\n';

            var entries = Object.entries(node.children);
            var fileCount = 0;
            var dirCount = 0;
            var totalSize = 0;

            entries.forEach(function(entry) {
                var name = entry[0];
                var child = entry[1];
                var date = '01/15/2024  10:30 AM';
                if (child.type === 'dir') {
                    output += date + '    <DIR>          ' + name + '\n';
                    dirCount++;
                } else {
                    var size = (child.content || '').length;
                    totalSize += size;
                    output += date + '           ' + size.toString().padStart(14) + ' ' + name + '\n';
                    fileCount++;
                }
            });

            output += '\n               ' + fileCount + ' File(s)    ' + totalSize.toLocaleString() + ' bytes\n' +
                '               ' + dirCount + ' Dir(s)   487,231,291,392 bytes free';
            return output;
        },

        'type': function(args, term, engine) {
            var rawPath = args[0] || '';
            if (!rawPath) return 'The syntax of the command is incorrect.';
            var unixPath = A5Config._toUnixPath(rawPath);

            // Permission check
            if (!A5Config._checkAccess(unixPath)) {
                return 'Access is denied.';
            }

            var node = A5Config._resolveNode(unixPath);
            if (!node) {
                return 'The system cannot find the file specified.';
            }
            if (node.type === 'dir') return 'Access is denied.';
            return node.content || '';
        },

        'cd': function(args, term, engine) {
            if (!args[0]) return A5Config._toWinPath(A5Config.terminal.startDir);
            return '';
        },

        'more': function(args, term, engine) {
            var rawPath = args[0] || '';
            if (!rawPath) return 'Cannot access  - No such file';
            var unixPath = A5Config._toUnixPath(rawPath);

            if (!A5Config._checkAccess(unixPath)) {
                return 'Access is denied.';
            }

            var node = A5Config._resolveNode(unixPath);
            if (!node) return 'Cannot access  - No such file';
            if (node.type === 'dir') return 'Access is denied.';
            return node.content || '';
        },

        'copy': function(args, term, engine) {
            if (args.length < 2) return 'The syntax of the command is incorrect.';
            var dst = (args[1] || '').toLowerCase().replace(/"/g, '');
            // Check if copying to the exploit location
            if (dst.includes('program files') && (dst.includes('advanced.exe') || dst.endsWith('advanced'))) {
                A5Config._state.exploitCopied = true;
                return '        1 file(s) copied.';
            }
            // Generic copy
            return '        1 file(s) copied.';
        },

        'move': function(args, term, engine) {
            if (args.length < 2) return 'The syntax of the command is incorrect.';
            var dst = (args[1] || '').toLowerCase().replace(/"/g, '');
            if (dst.includes('program files') && (dst.includes('advanced.exe') || dst.endsWith('advanced'))) {
                A5Config._state.exploitCopied = true;
                return '        1 file(s) moved.';
            }
            return '        1 file(s) moved.';
        },

        'del': function(args, term, engine) {
            return '';
        },

        'mkdir': function(args, term, engine) {
            if (!args[0]) return 'The syntax of the command is incorrect.';
            return '';
        },

        'ren': function(args, term, engine) {
            if (args.length < 2) return 'The syntax of the command is incorrect.';
            return '';
        },

        'where': function(args, term, engine) {
            var target = (args[0] || '').toLowerCase();
            if (target === 'cmd' || target === 'cmd.exe') return 'C:\\Windows\\System32\\cmd.exe';
            if (target === 'powershell' || target === 'powershell.exe') return 'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe';
            if (target === 'certutil' || target === 'certutil.exe') return 'C:\\Windows\\System32\\certutil.exe';
            if (target === 'sc' || target === 'sc.exe') return 'C:\\Windows\\System32\\sc.exe';
            return 'INFO: Could not find files for the given pattern(s).';
        },

        'findstr': function(args, term, engine) {
            var pattern = '';
            var fileArg = '';
            for (var i = 0; i < args.length; i++) {
                if (args[i].startsWith('/')) continue;
                if (!pattern) { pattern = args[i].replace(/"/g, ''); continue; }
                if (!fileArg) { fileArg = args[i]; }
            }
            if (!pattern) return 'FINDSTR: Bad command line';
            // Simple simulation for common patterns
            if (pattern.toLowerCase().includes('unquoted') || pattern.toLowerCase().includes('path')) {
                return 'AdvancedMonitoring: C:\\Program Files\\Advanced Monitoring\\service.exe';
            }
            return '';
        },

        'attrib': function(args, term, engine) {
            if (!args[0]) return 'ATTRIB [+R | -R] [+A | -A ] [+S | -S] [+H | -H] [[drive:][path]filename]';
            return 'A            C:\\' + (args[0] || 'file');
        },

        // ── SERVICE CONTROL ──

        'sc': function(args, term, engine) {
            var subCmd = (args[0] || '').toLowerCase();
            var svcName = args.slice(1).join(' ').replace(/"/g, '').toLowerCase();

            if (subCmd === 'query') {
                if (svcName && (svcName.includes('advanced') || svcName.includes('advancedmonitoring'))) {
                    return 'SERVICE_NAME: AdvancedMonitoring\n' +
                        '        TYPE               : 10  WIN32_OWN_PROCESS\n' +
                        '        STATE              : 4  RUNNING\n' +
                        '                                (STOPPABLE, NOT_PAUSABLE, ACCEPTS_SHUTDOWN)\n' +
                        '        WIN32_EXIT_CODE    : 0  (0x0)\n' +
                        '        SERVICE_EXIT_CODE  : 0  (0x0)\n' +
                        '        CHECKPOINT         : 0x0\n' +
                        '        WAIT_HINT          : 0x0';
                }
                // List all services
                return 'SERVICE_NAME: AdvancedMonitoring\n' +
                    '        TYPE               : 10  WIN32_OWN_PROCESS\n' +
                    '        STATE              : 4  RUNNING\n' +
                    '        WIN32_EXIT_CODE    : 0  (0x0)\n\n' +
                    'SERVICE_NAME: Spooler\n' +
                    '        TYPE               : 110  WIN32_OWN_PROCESS (interactive)\n' +
                    '        STATE              : 4  RUNNING\n\n' +
                    'SERVICE_NAME: WinRM\n' +
                    '        TYPE               : 20  WIN32_SHARE_PROCESS\n' +
                    '        STATE              : 4  RUNNING\n\n' +
                    'SERVICE_NAME: wuauserv\n' +
                    '        TYPE               : 20  WIN32_SHARE_PROCESS\n' +
                    '        STATE              : 4  RUNNING';
            }

            if (subCmd === 'qc') {
                if (svcName.includes('advanced') || svcName.includes('advancedmonitoring')) {
                    return '[SC] QueryServiceConfig SUCCESS\n\n' +
                        'SERVICE_NAME: AdvancedMonitoring\n' +
                        '        TYPE               : 10  WIN32_OWN_PROCESS\n' +
                        '        START_TYPE         : 2   AUTO_START\n' +
                        '        ERROR_CONTROL      : 1   NORMAL\n' +
                        '        BINARY_PATH_NAME   : C:\\Program Files\\Advanced Monitoring\\service.exe\n' +
                        '        LOAD_ORDER_GROUP   :\n' +
                        '        TAG                : 0\n' +
                        '        DISPLAY_NAME       : Advanced Monitoring Service\n' +
                        '        DEPENDENCIES       :\n' +
                        '        SERVICE_START_NAME : LocalSystem';
                }
                if (svcName.includes('spooler')) {
                    return '[SC] QueryServiceConfig SUCCESS\n\n' +
                        'SERVICE_NAME: Spooler\n' +
                        '        TYPE               : 110  WIN32_OWN_PROCESS\n' +
                        '        START_TYPE         : 2   AUTO_START\n' +
                        '        BINARY_PATH_NAME   : "C:\\Windows\\System32\\spoolsv.exe"\n' +
                        '        SERVICE_START_NAME : LocalSystem';
                }
                if (svcName.includes('winrm')) {
                    return '[SC] QueryServiceConfig SUCCESS\n\n' +
                        'SERVICE_NAME: WinRM\n' +
                        '        TYPE               : 20  WIN32_SHARE_PROCESS\n' +
                        '        START_TYPE         : 2   AUTO_START\n' +
                        '        BINARY_PATH_NAME   : "C:\\Windows\\System32\\svchost.exe -k WinRM"\n' +
                        '        SERVICE_START_NAME : LocalService';
                }
                return '[SC] OpenService FAILED 1060:\n\nThe specified service does not exist as an installed service.';
            }

            if (subCmd === 'stop') {
                if (svcName.includes('advanced') || svcName.includes('advancedmonitoring')) {
                    return 'SERVICE_NAME: AdvancedMonitoring\n' +
                        '        TYPE               : 10  WIN32_OWN_PROCESS\n' +
                        '        STATE              : 1  STOPPED\n' +
                        '        WIN32_EXIT_CODE    : 0  (0x0)\n' +
                        '        SERVICE_EXIT_CODE  : 0  (0x0)\n' +
                        '        CHECKPOINT         : 0x0\n' +
                        '        WAIT_HINT          : 0x0';
                }
                return 'Access is denied.';
            }

            if (subCmd === 'start') {
                if (svcName.includes('advanced') || svcName.includes('advancedmonitoring')) {
                    if (A5Config._state.exploitCopied) {
                        A5Config._state.isSystem = true;
                        A5Config._state.serviceExploited = true;
                        return 'SERVICE_NAME: AdvancedMonitoring\n' +
                            '        TYPE               : 10  WIN32_OWN_PROCESS\n' +
                            '        STATE              : 4  RUNNING\n' +
                            '        WIN32_EXIT_CODE    : 0  (0x0)\n\n' +
                            '[!] Service started with exploit payload!\n' +
                            '[+] Privilege escalation successful! You are now NT AUTHORITY\\SYSTEM.';
                    }
                    return 'SERVICE_NAME: AdvancedMonitoring\n' +
                        '        TYPE               : 10  WIN32_OWN_PROCESS\n' +
                        '        STATE              : 4  RUNNING\n' +
                        '        WIN32_EXIT_CODE    : 0  (0x0)';
                }
                return 'Access is denied.';
            }

            return 'DESCRIPTION:\n' +
                '        SC is a command line program used for communicating with the\n' +
                '        Service Control Manager and services.\n' +
                'USAGE:\n' +
                '        sc <server> [command] [service name] [option1] [option2]...\n\n' +
                '        sc query            List all services\n' +
                '        sc qc <name>        Query service config\n' +
                '        sc stop <name>      Stop a service\n' +
                '        sc start <name>     Start a service';
        },

        // ── USER & GROUP MANAGEMENT ──

        'net': function(args, term, engine) {
            var subCmd = (args[0] || '').toLowerCase();

            if (subCmd === 'user') {
                if (args[1]) {
                    if (args[1].toLowerCase() === 'svc_backup') {
                        return 'User name                    svc_backup\n' +
                            'Full Name                    Backup Service Account\n' +
                            'Comment                      Service account for backup operations\n' +
                            'User\'s comment\n' +
                            'Country/region code          000 (System Default)\n' +
                            'Account active               Yes\n' +
                            'Account expires              Never\n\n' +
                            'Password last set            10/15/2023 2:30:45 PM\n' +
                            'Password expires             Never\n' +
                            'Password changeable          10/16/2023 2:30:45 PM\n' +
                            'Password required            Yes\n' +
                            'User may change password     No\n\n' +
                            'Workstations allowed         All\n' +
                            'Logon script\n' +
                            'User profile\n' +
                            'Home directory\n' +
                            'Last logon                   1/15/2024 8:00:01 AM\n\n' +
                            'Logon hours allowed          All\n\n' +
                            'Local Group Memberships      *Backup Operators     *Users\n' +
                            'Global Group memberships     *None\n' +
                            'The command completed successfully.';
                    }
                    if (args[1].toLowerCase() === 'administrator') {
                        return 'User name                    Administrator\n' +
                            'Full Name                    Built-in Administrator\n' +
                            'Comment                      Built-in account for administering the computer/domain\n' +
                            'Account active               Yes\n' +
                            'Account expires              Never\n\n' +
                            'Password last set            6/15/2023 10:00:00 AM\n' +
                            'Password expires             Never\n\n' +
                            'Local Group Memberships      *Administrators\n' +
                            'Global Group memberships     *Domain Admins\n' +
                            'The command completed successfully.';
                    }
                    if (args[1].toLowerCase() === 'guest') {
                        return 'User name                    Guest\n' +
                            'Full Name\n' +
                            'Comment                      Built-in account for guest access\n' +
                            'Account active               No\n' +
                            'The command completed successfully.';
                    }
                    return 'The user name could not be found.';
                }
                return 'User accounts for \\\\CORP-JUMP-01\n\n' +
                    '-------------------------------------------------------------------------------\n' +
                    'Administrator            DefaultAccount           Guest\n' +
                    'svc_backup               WDAGUtilityAccount\n' +
                    'The command completed successfully.';
            }

            if (subCmd === 'localgroup') {
                if (args[1]) {
                    var group = args[1].toLowerCase();
                    if (group === 'administrators') {
                        return 'Alias name     Administrators\n' +
                            'Comment        Administrators have complete and unrestricted access\n\n' +
                            'Members\n\n' +
                            '-------------------------------------------------------------------------------\n' +
                            'Administrator\n' +
                            'The command completed successfully.';
                    }
                    if (group === '"backup operators"' || group === 'backup' || group === '"backup') {
                        return 'Alias name     Backup Operators\n' +
                            'Comment        Backup Operators can override security restrictions for backup\n\n' +
                            'Members\n\n' +
                            '-------------------------------------------------------------------------------\n' +
                            'svc_backup\n' +
                            'The command completed successfully.';
                    }
                    if (group === 'users') {
                        return 'Alias name     Users\n' +
                            'Comment        Users are prevented from making accidental system changes\n\n' +
                            'Members\n\n' +
                            '-------------------------------------------------------------------------------\n' +
                            'NT AUTHORITY\\Authenticated Users\n' +
                            'NT AUTHORITY\\INTERACTIVE\n' +
                            'svc_backup\n' +
                            'The command completed successfully.';
                    }
                    if (group === '"remote desktop users"' || group === 'remote') {
                        return 'Alias name     Remote Desktop Users\n' +
                            'Comment        Members are granted the right to logon remotely\n\n' +
                            'Members\n\n' +
                            '-------------------------------------------------------------------------------\n' +
                            'svc_backup\n' +
                            'The command completed successfully.';
                    }
                }
                return 'Aliases for \\\\CORP-JUMP-01\n\n' +
                    '-------------------------------------------------------------------------------\n' +
                    '*Administrators\n' +
                    '*Backup Operators\n' +
                    '*Users\n' +
                    '*Remote Desktop Users\n' +
                    'The command completed successfully.';
            }

            if (subCmd === 'share') {
                return 'Share name   Resource                        Remark\n\n' +
                    '-------------------------------------------------------------------------------\n' +
                    'C$           C:\\                              Default share\n' +
                    'ADMIN$       C:\\Windows                       Remote Admin\n' +
                    'IPC$                                          Remote IPC\n' +
                    'The command completed successfully.';
            }

            if (subCmd === 'stop' || subCmd === 'start') {
                var svc = args.slice(1).join(' ').replace(/"/g, '');
                if (svc.toLowerCase().includes('advanced')) {
                    if (subCmd === 'start' && A5Config._state.exploitCopied) {
                        A5Config._state.isSystem = true;
                        A5Config._state.serviceExploited = true;
                        return 'The Advanced Monitoring Service service is starting.\n' +
                            'The Advanced Monitoring Service service was started successfully.\n\n' +
                            '[!] Service started with exploit payload!\n' +
                            '[+] Privilege escalation successful! You are now NT AUTHORITY\\SYSTEM.';
                    }
                    return subCmd === 'stop'
                        ? 'The Advanced Monitoring Service service was stopped successfully.'
                        : 'The Advanced Monitoring Service service is starting.\nThe Advanced Monitoring Service service was started successfully.';
                }
                return 'System error 5 has occurred.\n\nAccess is denied.';
            }

            if (subCmd === 'use') {
                return 'New connections will be remembered.\n\nThere are no entries in the list.';
            }

            if (subCmd === 'session') {
                return 'There are no entries in the list.';
            }

            if (subCmd === 'accounts') {
                return 'Force user logoff how long after time expires?:       Never\n' +
                    'Minimum password age (days):                          1\n' +
                    'Maximum password age (days):                          Unlimited\n' +
                    'Minimum password length:                              8\n' +
                    'Length of password history maintained:                 None\n' +
                    'Lockout threshold:                                    Never\n' +
                    'The command completed successfully.';
            }

            return 'The syntax of this command is:\n\n' +
                'NET\n' +
                '    [ USER | LOCALGROUP | START | STOP | USE | SHARE | SESSION | ACCOUNTS ]';
        },

        // ── PERMISSIONS ──

        'icacls': function(args, term, engine) {
            var path = (args[0] || '').replace(/"/g, '').toLowerCase();
            if (!path) return 'ICACLS name [/grant[:r] Sid:perm[...]]\n        [/deny Sid:perm[...]]\n        [/remove[:g|:d] Sid[...]]\n\nFor more help: icacls /?';

            if (path === 'c:\\program files' || path === 'c:/program files' || path === '/program files') {
                return 'C:\\Program Files BUILTIN\\Users:(W)\n' +
                    '                 BUILTIN\\Administrators:(F)\n' +
                    '                 NT AUTHORITY\\SYSTEM:(F)\n' +
                    '                 CREATOR OWNER:(OI)(CI)(IO)(F)\n\n' +
                    'Successfully processed 1 files; Failed processing 0 files';
            }
            if (path.includes('advanced monitoring')) {
                return 'C:\\Program Files\\Advanced Monitoring BUILTIN\\Users:(OI)(CI)(M)\n' +
                    '                                      BUILTIN\\Administrators:(F)\n' +
                    '                                      NT AUTHORITY\\SYSTEM:(F)\n\n' +
                    'Successfully processed 1 files; Failed processing 0 files';
            }
            if (path.includes('advanced.exe')) {
                if (A5Config._state.exploitCopied) {
                    return 'C:\\Program Files\\Advanced.exe BUILTIN\\Users:(M)\n' +
                        '                               BUILTIN\\Administrators:(F)\n' +
                        '                               NT AUTHORITY\\SYSTEM:(F)\n\n' +
                        'Successfully processed 1 files; Failed processing 0 files';
                }
                return 'C:\\Program Files\\Advanced.exe: The system cannot find the file specified.';
            }
            if (path.includes('windows\\system32') || path.includes('windows/system32')) {
                return 'C:\\Windows\\System32 NT SERVICE\\TrustedInstaller:(F)\n' +
                    '                    NT SERVICE\\TrustedInstaller:(CI)(IO)(F)\n' +
                    '                    NT AUTHORITY\\SYSTEM:(M)\n' +
                    '                    BUILTIN\\Administrators:(M)\n' +
                    '                    BUILTIN\\Users:(RX)\n\n' +
                    'Successfully processed 1 files; Failed processing 0 files';
            }
            if (path.includes('users\\administrator') || path.includes('users/administrator')) {
                return 'C:\\Users\\Administrator BUILTIN\\Administrators:(F)\n' +
                    '                       NT AUTHORITY\\SYSTEM:(F)\n\n' +
                    'Successfully processed 1 files; Failed processing 0 files';
            }
            if (path.includes('users\\svc_backup') || path.includes('users/svc_backup')) {
                return 'C:\\Users\\svc_backup CORP-JUMP-01\\svc_backup:(F)\n' +
                    '                    BUILTIN\\Administrators:(F)\n' +
                    '                    NT AUTHORITY\\SYSTEM:(F)\n\n' +
                    'Successfully processed 1 files; Failed processing 0 files';
            }
            // Generic fallback
            return path + '\n    BUILTIN\\Users:(R)\n    BUILTIN\\Administrators:(F)\n    NT AUTHORITY\\SYSTEM:(F)\n\nSuccessfully processed 1 files; Failed processing 0 files';
        },

        'cacls': function(args, term, engine) {
            return 'NOTE: Cacls is now deprecated, please use Icacls.\n\nAre you sure (Y/N)?';
        },

        // ── REGISTRY ──

        'reg': function(args, term, engine) {
            var sub = (args[0] || '').toLowerCase();
            if (sub === 'query') {
                var key = args.slice(1).join(' ').replace(/"/g, '');

                if (key.includes('AlwaysInstallElevated')) {
                    return 'ERROR: The system was unable to find the specified registry key or value.';
                }
                if (key.includes('AutoLogon') || key.includes('Winlogon')) {
                    return 'HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Winlogon\n' +
                        '    DefaultUserName    REG_SZ    svc_backup\n' +
                        '    AutoAdminLogon     REG_SZ    0';
                }
                if (key.includes('Uninstall')) {
                    return 'HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall\n' +
                        '    Advanced Monitoring Service   REG_SZ    C:\\Program Files\\Advanced Monitoring\\service.exe\n' +
                        '    Windows Defender              REG_SZ    C:\\Program Files\\Windows Defender\\MsMpEng.exe';
                }
                if (key.includes('Run') && !key.includes('RunOnce')) {
                    return 'HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run\n' +
                        '    SecurityHealth    REG_EXPAND_SZ    %windir%\\system32\\SecurityHealthSystray.exe\n' +
                        '    AdvMonitor        REG_SZ           C:\\Program Files\\Advanced Monitoring\\service.exe';
                }
                if (key.includes('Services\\AdvancedMonitoring')) {
                    return 'HKEY_LOCAL_MACHINE\\SYSTEM\\CurrentControlSet\\Services\\AdvancedMonitoring\n' +
                        '    Type            REG_DWORD    0x10\n' +
                        '    Start           REG_DWORD    0x2\n' +
                        '    ErrorControl    REG_DWORD    0x1\n' +
                        '    ImagePath       REG_EXPAND_SZ    C:\\Program Files\\Advanced Monitoring\\service.exe\n' +
                        '    DisplayName     REG_SZ    Advanced Monitoring Service\n' +
                        '    ObjectName      REG_SZ    LocalSystem';
                }
                return 'ERROR: The system was unable to find the specified registry key or value.';
            }
            return 'REG Operation\n\n  REG QUERY KeyName [/v ValueName] [/s]\n  REG ADD   KeyName /v ValueName /d Data\n  REG DELETE KeyName /v ValueName\n\nFor more help: REG QUERY /?';
        },

        // ── WMI ──

        'wmic': function(args, term, engine) {
            var joined = args.join(' ').toLowerCase();

            if (joined.includes('service') && joined.includes('get')) {
                return 'Name                    PathName                                                     StartMode  State    StartName\n' +
                    'AdvancedMonitoring      C:\\Program Files\\Advanced Monitoring\\service.exe              Auto       Running  LocalSystem\n' +
                    'Spooler                 "C:\\Windows\\System32\\spoolsv.exe"                            Auto       Running  LocalSystem\n' +
                    'WinRM                   "C:\\Windows\\System32\\svchost.exe -k WinRM"                   Auto       Running  LocalService\n' +
                    'wuauserv                "C:\\Windows\\System32\\svchost.exe -k netsvcs"                 Manual     Running  LocalSystem';
            }
            if (joined.includes('service') && joined.includes('list')) {
                return 'Name                    State\n' +
                    'AdvancedMonitoring      Running\n' +
                    'Spooler                 Running\n' +
                    'WinRM                   Running\n' +
                    'wuauserv                Running';
            }
            if (joined.includes('os') && joined.includes('get')) {
                return 'Caption                                  Version      BuildNumber  OSArchitecture\n' +
                    'Microsoft Windows Server 2019 Standard   10.0.17763   17763        64-bit';
            }
            if (joined.includes('qfe')) {
                return 'Caption                                  Description  HotFixID   InstalledOn\n' +
                    'http://support.microsoft.com             Update       KB5032196  1/10/2024\n' +
                    'http://support.microsoft.com             Update       KB5031361  12/14/2023\n' +
                    'http://support.microsoft.com             Security     KB5028316  8/8/2023\n' +
                    'http://support.microsoft.com             Update       KB5027271  6/13/2023';
            }
            if (joined.includes('useraccount')) {
                return 'Name             SID                                             Status\n' +
                    'Administrator    S-1-5-21-3842773548-1126382-1234567-500         OK\n' +
                    'Guest            S-1-5-21-3842773548-1126382-1234567-501         Degraded\n' +
                    'svc_backup       S-1-5-21-3842773548-1126382-1234567-1103        OK';
            }
            if (joined.includes('process') && joined.includes('get')) {
                return 'Name             ProcessId  CommandLine\n' +
                    'System           4\n' +
                    'smss.exe         388        \\SystemRoot\\System32\\smss.exe\n' +
                    'csrss.exe        500\n' +
                    'services.exe     652        C:\\Windows\\system32\\services.exe\n' +
                    'lsass.exe        660        C:\\Windows\\system32\\lsass.exe\n' +
                    'svchost.exe      764        C:\\Windows\\system32\\svchost.exe -k DcomLaunch\n' +
                    'AdvMonSvc.exe    892        C:\\Program Files\\Advanced Monitoring\\service.exe\n' +
                    'cmd.exe          3512       C:\\Windows\\system32\\cmd.exe';
            }
            if (joined.includes('logicaldisk')) {
                return 'DeviceID  DriveType  FreeSpace        Size              VolumeName\n' +
                    'C:        3          487231291392     1073741824000';
            }
            return 'Usage: wmic [alias] [verb] [properties]\n' +
                '  Examples:\n' +
                '    wmic service get name,pathname,startmode\n' +
                '    wmic service list status\n' +
                '    wmic os get caption,version\n' +
                '    wmic qfe list\n' +
                '    wmic useraccount get name,sid\n' +
                '    wmic process get name,processid';
        },

        // ── PROCESS MANAGEMENT ──

        'tasklist': function(args, term, engine) {
            if (args.includes('/svc')) {
                return 'Image Name                     PID Services\n' +
                    '========================= ======== ============================================\n' +
                    'services.exe                   652 N/A\n' +
                    'lsass.exe                      660 KeyIso, Netlogon, SamSs\n' +
                    'svchost.exe                    764 BrokerInfrastructure, DcomLaunch, Power\n' +
                    'svchost.exe                    832 RpcEptMapper, RpcSs\n' +
                    'AdvMonSvc.exe                  892 AdvancedMonitoring\n' +
                    'spoolsv.exe                   1204 Spooler\n' +
                    'svchost.exe                   1128 W32Time\n' +
                    'svchost.exe                   1056 TermService';
            }
            if (args.includes('/v')) {
                return 'Image Name                     PID Session Name     Mem Usage  Status          User Name\n' +
                    '========================= ======== ================ =========== =============== ===========================\n' +
                    'System Idle Process              0 Services               8 K   Running         NT AUTHORITY\\SYSTEM\n' +
                    'System                           4 Services             140 K   Running         NT AUTHORITY\\SYSTEM\n' +
                    'smss.exe                       388 Services           1,028 K   Running         NT AUTHORITY\\SYSTEM\n' +
                    'csrss.exe                      500 Services           4,696 K   Running         NT AUTHORITY\\SYSTEM\n' +
                    'services.exe                   652 Services          10,340 K   Running         NT AUTHORITY\\SYSTEM\n' +
                    'lsass.exe                      660 Services          17,436 K   Running         NT AUTHORITY\\SYSTEM\n' +
                    'svchost.exe                    764 Services          29,044 K   Running         NT AUTHORITY\\SYSTEM\n' +
                    'AdvMonSvc.exe                  892 Services          14,208 K   Running         NT AUTHORITY\\SYSTEM\n' +
                    'spoolsv.exe                   1204 Services           9,148 K   Running         NT AUTHORITY\\SYSTEM\n' +
                    'cmd.exe                       3512 Console            4,624 K   Running         CORP-JUMP-01\\svc_backup';
            }
            return 'Image Name                     PID Session Name        Mem Usage\n' +
                '========================= ======== ================ ============\n' +
                'System Idle Process              0 Services                    8 K\n' +
                'System                           4 Services                  140 K\n' +
                'smss.exe                       388 Services                1,028 K\n' +
                'csrss.exe                      500 Services                4,696 K\n' +
                'wininit.exe                    576 Services                5,240 K\n' +
                'services.exe                   652 Services               10,340 K\n' +
                'lsass.exe                      660 Services               17,436 K\n' +
                'svchost.exe                    764 Services               29,044 K\n' +
                'svchost.exe                    832 Services                8,192 K\n' +
                'AdvMonSvc.exe                  892 Services               14,208 K\n' +
                'spoolsv.exe                   1204 Services                9,148 K\n' +
                'svchost.exe                   1128 Services                6,540 K\n' +
                'svchost.exe                   1056 Services               12,288 K\n' +
                'cmd.exe                       3512 Console                 4,624 K';
        },

        'taskkill': function(args, term, engine) {
            return 'ERROR: Access is denied.';
        },

        // ── CERTIFICATES & UTILITIES ──

        'certutil': function(args, term, engine) {
            if (args.includes('-urlcache') || args.includes('-f')) {
                return 'CertUtil: -URLCache command completed successfully.';
            }
            if (args.includes('-hashfile')) {
                var file = args[args.indexOf('-hashfile') + 1] || '';
                return 'SHA1 hash of ' + (file || 'file') + ':\n' +
                    'a3 4b 7c 9d 1e 2f 3a 4b 5c 6d 7e 8f 9a 0b 1c 2d 3e 4f 5a 6b\n' +
                    'CertUtil: -hashfile command completed successfully.';
            }
            return 'CertUtil  [Options] [Command]\n' +
                '  -urlcache [-f] URL [destination]   URL cache / download\n' +
                '  -hashfile InFile [HashAlgorithm]    Generate hash of file\n' +
                '  -store                              Dump certificate store';
        },

        // ── POWERSHELL ──

        'powershell': function(args, term, engine) {
            var cmd = args.join(' ').replace(/^-[cC]\s*/, '').replace(/^"/, '').replace(/"$/, '');
            if (!cmd || args.length === 0) {
                return 'Windows PowerShell\n' +
                    'Copyright (C) Microsoft Corporation. All rights reserved.\n\n' +
                    'PS C:\\Users\\svc_backup\\Desktop> [Use powershell -c "command" to run commands]';
            }
            var lowerCmd = cmd.toLowerCase();
            if (lowerCmd.includes('get-service')) {
                return 'Status   Name               DisplayName\n' +
                    '------   ----               -----------\n' +
                    'Running  AdvancedMonit...   Advanced Monitoring Service\n' +
                    'Running  Spooler            Print Spooler\n' +
                    'Running  WinRM              Windows Remote Management\n' +
                    'Running  wuauserv           Windows Update';
            }
            if (lowerCmd.includes('get-acl')) {
                return 'Path   : Microsoft.PowerShell.Core\\FileSystem::C:\\Program Files\\Advanced Monitoring\n' +
                    'Owner  : BUILTIN\\Administrators\n' +
                    'Group  : NT AUTHORITY\\SYSTEM\n' +
                    'Access : BUILTIN\\Users Allow  Modify, Synchronize\n' +
                    '         BUILTIN\\Administrators Allow  FullControl\n' +
                    '         NT AUTHORITY\\SYSTEM Allow  FullControl';
            }
            if (lowerCmd.includes('get-wmiobject') && lowerCmd.includes('service')) {
                return 'ExitCode  : 0\n' +
                    'Name      : AdvancedMonitoring\n' +
                    'PathName  : C:\\Program Files\\Advanced Monitoring\\service.exe\n' +
                    'StartMode : Auto\n' +
                    'State     : Running\n' +
                    'Status    : OK';
            }
            if (lowerCmd.includes('get-childitem') || lowerCmd.includes('gci') || lowerCmd.includes('ls')) {
                return 'PS> [Use dir command instead for filesystem navigation]';
            }
            if (lowerCmd.includes('get-process')) {
                return 'Handles  NPM(K)    PM(K)      WS(K)   CPU(s)     Id  ProcessName\n' +
                    '-------  ------    -----      -----   ------     --  -----------\n' +
                    '    142      10     2048       4624     0.11   3512  cmd\n' +
                    '    357      15    14208      18432     2.34    892  AdvMonSvc\n' +
                    '    198      12     9148      11264     0.88   1204  spoolsv\n' +
                    '    824      40    29044      35840     5.67    764  svchost';
            }
            if (lowerCmd.includes('get-localuser')) {
                return 'Name               Enabled  Description\n' +
                    '----               -------  -----------\n' +
                    'Administrator      True     Built-in account for administering the computer\n' +
                    'DefaultAccount     False    A user account managed by the system\n' +
                    'Guest              False    Built-in account for guest access\n' +
                    'svc_backup         True     Service account for backup operations\n' +
                    'WDAGUtilityAccount False    Used by Windows Defender Application Guard';
            }
            if (lowerCmd.includes('test-path')) {
                return 'True';
            }
            if (lowerCmd.includes('iwr') || lowerCmd.includes('invoke-webrequest') || lowerCmd.includes('wget')) {
                return 'Invoke-WebRequest: The request was aborted: Could not create SSL/TLS secure channel.';
            }
            return 'PS C:\\Users\\svc_backup> ' + cmd + '\n[Command executed]';
        },

        'powershell.exe': function(args, term, engine) {
            return A5Config.commands.powershell(args, term, engine);
        },

        // ── PRIV-ESC SCANNER ──

        'winpeas': function(args, term, engine) {
            return '[+] WinPEAS - Windows Privilege Escalation Awesome Script\n' +
                '    by carlospolop\n\n' +
                '============================( System Information )============================\n\n' +
                '[+] System Information\n' +
                '    OS: Windows Server 2019 Standard (Build 17763)\n' +
                '    Hostname: CORP-JUMP-01\n' +
                '    Domain: corp.local\n' +
                '    Architecture: x64\n\n' +
                '============================( Users Information )============================\n\n' +
                '[+] Current User: svc_backup\n' +
                '    Groups: Backup Operators, Users\n' +
                '    Privileges: SeBackupPrivilege, SeRestorePrivilege\n\n' +
                '============================( Services Information )============================\n\n' +
                '[+] Checking Services...\n' +
                '    [!] UNQUOTED SERVICE PATH FOUND:\n' +
                '        Service: AdvancedMonitoring\n' +
                '        Path: C:\\Program Files\\Advanced Monitoring\\service.exe\n' +
                '        StartMode: Auto\n' +
                '        RunAs: LocalSystem\n' +
                '        >> The path is unquoted and contains spaces!\n' +
                '        >> Windows will try: C:\\Program Files\\Advanced.exe FIRST\n' +
                '        >> If you can write to C:\\Program Files\\, you can hijack this service!\n\n' +
                '============================( File Permissions )============================\n\n' +
                '[+] Checking File Permissions...\n' +
                '    [!] C:\\Program Files\\ is WRITABLE by current user!\n' +
                '        BUILTIN\\Users:(W)\n\n' +
                '============================( Registry )============================\n\n' +
                '[+] Checking Registry...\n' +
                '    AlwaysInstallElevated: Not set\n' +
                '    AutoLogon: DefaultUserName=svc_backup, AutoAdminLogon=0\n\n' +
                '============================( Interesting Files )============================\n\n' +
                '[+] Checking user directories...\n' +
                '    C:\\Users\\svc_backup\\Desktop\\exploit.exe\n' +
                '    C:\\Users\\svc_backup\\Desktop\\notes.txt\n' +
                '    C:\\Users\\svc_backup\\Desktop\\user.txt\n\n' +
                '============================( Summary )============================\n\n' +
                '[+] Possible Vectors: 1 found\n' +
                '    >> Unquoted service path + writable directory = privilege escalation!';
        },

        'winpeas.exe': function(args, term, engine) {
            return A5Config.commands.winpeas(args, term, engine);
        },

        'seatbelt': function(args, term, engine) {
            return '[*] Seatbelt - Safety checks for Windows environments\n\n' +
                '[*] Running selected checks...\n\n' +
                '====== Services ======\n' +
                'Non-standard services:\n' +
                '  Name           : AdvancedMonitoring\n' +
                '  DisplayName    : Advanced Monitoring Service\n' +
                '  BinaryPath     : C:\\Program Files\\Advanced Monitoring\\service.exe\n' +
                '  ** UNQUOTED PATH **\n' +
                '  StartType      : Automatic\n' +
                '  RunAs          : LocalSystem\n\n' +
                '====== FilePermissions ======\n' +
                '  C:\\Program Files\\ : BUILTIN\\Users have Write access\n\n' +
                '====== TokenPrivileges ======\n' +
                '  SeBackupPrivilege  : Enabled\n' +
                '  SeRestorePrivilege : Enabled\n\n' +
                '[*] Completed.';
        },

        'accesschk': function(args, term, engine) {
            var joined = args.join(' ').toLowerCase();
            if (joined.includes('advancedmonitoring') || joined.includes('advanced')) {
                return 'Accesschk v6.15 - Reports effective permissions\n' +
                    'Copyright (C) Mark Russinovich\n\n' +
                    'AdvancedMonitoring\n' +
                    '  RW NT AUTHORITY\\SYSTEM\n' +
                    '  RW BUILTIN\\Administrators\n' +
                    '  R  BUILTIN\\Users\n\n' +
                    'Service binary path: C:\\Program Files\\Advanced Monitoring\\service.exe\n' +
                    '  ** PATH IS UNQUOTED **';
            }
            if (joined.includes('program files')) {
                return 'Accesschk v6.15 - Reports effective permissions\n' +
                    'Copyright (C) Mark Russinovich\n\n' +
                    'C:\\Program Files\n' +
                    '  RW NT AUTHORITY\\SYSTEM\n' +
                    '  RW BUILTIN\\Administrators\n' +
                    '  W  BUILTIN\\Users\n' +
                    '  R  BUILTIN\\Users';
            }
            return 'Accesschk v6.15 - Reports effective permissions\n' +
                'Copyright (C) Mark Russinovich\n\n' +
                'Usage: accesschk [-s] [-w] <object|service>';
        },

        // ── PROCESS / MISC UTILITIES ──

        'echo': function(args, term, engine) {
            return args.join(' ');
        },

        'set': function(args, term, engine) {
            if (!args[0]) {
                return 'COMPUTERNAME=CORP-JUMP-01\n' +
                    'HOMEDRIVE=C:\n' +
                    'HOMEPATH=\\Users\\svc_backup\n' +
                    'LOGONSERVER=\\\\DC-01\n' +
                    'OS=Windows_NT\n' +
                    'Path=C:\\Windows\\system32;C:\\Windows;C:\\Windows\\System32\\Wbem\n' +
                    'PROCESSOR_ARCHITECTURE=AMD64\n' +
                    'SystemDrive=C:\n' +
                    'SystemRoot=C:\\Windows\n' +
                    'TEMP=C:\\Users\\svc_backup\\AppData\\Local\\Temp\n' +
                    'TMP=C:\\Users\\svc_backup\\AppData\\Local\\Temp\n' +
                    'USERDOMAIN=CORP-JUMP-01\n' +
                    'USERNAME=svc_backup\n' +
                    'USERPROFILE=C:\\Users\\svc_backup';
            }
            return '';
        },

        'ver': function(args, term, engine) {
            return '\nMicrosoft Windows [Version 10.0.17763.5830]';
        },

        'cls': function(args, term, engine) {
            return '\x1Bc';
        },

        'exit': function(args, term, engine) {
            return 'Cannot exit the command prompt during this exercise.';
        },

        'shutdown': function(args, term, engine) {
            return 'Access is denied. (5)';
        },

        // ── HELP ──

        'help': function(args, term, engine) {
            return 'Available commands:\n\n' +
                '  IDENTITY & ENUMERATION\n' +
                '  ----------------------\n' +
                '  whoami [/priv] [/all]   - Display current user and privileges\n' +
                '  systeminfo              - Display detailed system information\n' +
                '  hostname                - Display computer name\n' +
                '  set                     - Display environment variables\n' +
                '  ver                     - Display Windows version\n\n' +
                '  NETWORK\n' +
                '  -------\n' +
                '  ipconfig [/all]         - Display network configuration\n' +
                '  netstat [-ano]          - Display network connections\n' +
                '  ping <target>           - Test network connectivity\n\n' +
                '  FILE SYSTEM\n' +
                '  -----------\n' +
                '  dir [path]              - List directory contents\n' +
                '  type <file>             - Display file contents\n' +
                '  more <file>             - Display file with paging\n' +
                '  cd [path]               - Change/display current directory\n' +
                '  copy <src> <dst>        - Copy files\n' +
                '  move <src> <dst>        - Move files\n' +
                '  del <file>              - Delete files\n' +
                '  mkdir <dir>             - Create directory\n' +
                '  where <name>            - Locate executable\n' +
                '  findstr <pattern>       - Search for text patterns\n' +
                '  attrib [file]           - Display file attributes\n\n' +
                '  SERVICES\n' +
                '  --------\n' +
                '  sc query                - List all services\n' +
                '  sc qc <name>            - Query service configuration\n' +
                '  sc stop <name>          - Stop a service\n' +
                '  sc start <name>         - Start a service\n\n' +
                '  USERS & GROUPS\n' +
                '  --------------\n' +
                '  net user [name]         - Display user information\n' +
                '  net localgroup [name]   - Display group memberships\n' +
                '  net start/stop <svc>    - Start or stop a service\n' +
                '  net share               - Display network shares\n' +
                '  net accounts            - Display password policy\n\n' +
                '  PERMISSIONS\n' +
                '  -----------\n' +
                '  icacls <path>           - Display file/folder permissions\n' +
                '  accesschk <target>      - Check effective permissions\n\n' +
                '  REGISTRY\n' +
                '  --------\n' +
                '  reg query <key>         - Query registry values\n\n' +
                '  WMI\n' +
                '  ---\n' +
                '  wmic service get ...    - Query service information\n' +
                '  wmic os get ...         - Query OS information\n' +
                '  wmic qfe list           - List installed hotfixes\n' +
                '  wmic useraccount get    - List user accounts\n' +
                '  wmic process get        - List running processes\n\n' +
                '  PROCESSES\n' +
                '  ---------\n' +
                '  tasklist [/svc] [/v]    - List running processes\n\n' +
                '  UTILITIES\n' +
                '  ---------\n' +
                '  certutil                - Certificate utility / file download\n' +
                '  powershell -c "cmd"     - Run PowerShell commands\n\n' +
                '  PRIV-ESC TOOLS\n' +
                '  --------------\n' +
                '  winpeas                 - Windows privilege escalation scanner\n' +
                '  seatbelt                - Safety checks for priv-esc vectors\n' +
                '  accesschk <target>      - Check effective permissions (Sysinternals)\n\n' +
                '  OTHER\n' +
                '  -----\n' +
                '  echo <text>             - Display text\n' +
                '  cls                     - Clear screen\n' +
                '  help                    - Display this help message';
        },

        // ── LINUX COMMAND CATCH-ALL ──

        'ls': function() {
            return '\'ls\' is not recognized as an internal or external command,\n' +
                'operable program or batch file.\n\nTry: dir';
        },
        'cat': function() {
            return '\'cat\' is not recognized as an internal or external command,\n' +
                'operable program or batch file.\n\nTry: type';
        },
        'grep': function() {
            return '\'grep\' is not recognized as an internal or external command,\n' +
                'operable program or batch file.\n\nTry: findstr';
        },
        'pwd': function() {
            return '\'pwd\' is not recognized as an internal or external command,\n' +
                'operable program or batch file.\n\nTry: cd (with no arguments)';
        },
        'sudo': function() {
            return '\'sudo\' is not recognized as an internal or external command,\n' +
                'operable program or batch file.';
        },
        'chmod': function() {
            return '\'chmod\' is not recognized as an internal or external command,\n' +
                'operable program or batch file.\n\nTry: icacls';
        },
        'chown': function() {
            return '\'chown\' is not recognized as an internal or external command,\n' +
                'operable program or batch file.\n\nTry: icacls';
        },
        'id': function() {
            return '\'id\' is not recognized as an internal or external command,\n' +
                'operable program or batch file.\n\nTry: whoami /all';
        },
        'uname': function() {
            return '\'uname\' is not recognized as an internal or external command,\n' +
                'operable program or batch file.\n\nTry: systeminfo';
        },
        'ifconfig': function() {
            return '\'ifconfig\' is not recognized as an internal or external command,\n' +
                'operable program or batch file.\n\nTry: ipconfig';
        },
        'find': function() {
            return '\'find\' as a Linux command is not available.\n\nTry: dir /s or where';
        },
        'rm': function() {
            return '\'rm\' is not recognized as an internal or external command,\n' +
                'operable program or batch file.\n\nTry: del';
        },
        'cp': function() {
            return '\'cp\' is not recognized as an internal or external command,\n' +
                'operable program or batch file.\n\nTry: copy';
        },
        'mv': function() {
            return '\'mv\' is not recognized as an internal or external command,\n' +
                'operable program or batch file.\n\nTry: move';
        },
        'nano': function() {
            return '\'nano\' is not recognized as an internal or external command,\n' +
                'operable program or batch file.';
        },
        'vim': function() {
            return '\'vim\' is not recognized as an internal or external command,\n' +
                'operable program or batch file.';
        },
        'wget': function() {
            return '\'wget\' is not recognized as an internal or external command,\n' +
                'operable program or batch file.\n\nTry: certutil -urlcache -f <URL> <output>';
        },
        'curl': function() {
            return '\'curl\' is not recognized as an internal or external command,\n' +
                'operable program or batch file.\n\nTry: certutil -urlcache -f <URL> <output>';
        },
        'nmap': function() {
            return '\'nmap\' is not recognized as an internal or external command,\n' +
                'operable program or batch file.\n\nThis is the target machine, not your attack box.';
        },
        'ssh': function() {
            return '\'ssh\' is not recognized as an internal or external command,\n' +
                'operable program or batch file.';
        },
        'apt': function() {
            return '\'apt\' is not recognized as an internal or external command,\n' +
                'operable program or batch file.';
        },
        'yum': function() {
            return '\'yum\' is not recognized as an internal or external command,\n' +
                'operable program or batch file.';
        },
        'man': function() {
            return '\'man\' is not recognized as an internal or external command,\n' +
                'operable program or batch file.\n\nTry: help';
        },
        'clear': function() {
            return '\'clear\' is not recognized as an internal or external command,\n' +
                'operable program or batch file.\n\nTry: cls';
        },
        'touch': function() {
            return '\'touch\' is not recognized as an internal or external command,\n' +
                'operable program or batch file.\n\nTry: copy nul <filename>';
        },
        'ps': function() {
            return '\'ps\' is not recognized as an internal or external command,\n' +
                'operable program or batch file.\n\nTry: tasklist';
        },
        'kill': function() {
            return '\'kill\' is not recognized as an internal or external command,\n' +
                'operable program or batch file.\n\nTry: taskkill';
        },
        'service': function() {
            return '\'service\' is not recognized as an internal or external command,\n' +
                'operable program or batch file.\n\nTry: sc query / sc start / sc stop';
        },
        'systemctl': function() {
            return '\'systemctl\' is not recognized as an internal or external command,\n' +
                'operable program or batch file.\n\nTry: sc query / net start / net stop';
        }
    }
};
