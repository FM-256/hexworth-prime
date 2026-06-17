/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * PSTerminal.js - PowerShell Terminal Simulator for Windows Server Administration
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Hexworth Prime - House of Cloud
 * Course: WSA (Windows Server Administration)
 * Certification Alignment: Microsoft AZ-800
 *
 * A comprehensive, realistic PowerShell terminal simulator for Windows Server
 * education. This component provides an interactive learning environment where
 * students can practice PowerShell commands without needing actual server access.
 *
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ INSIGHT: Why Simulate PowerShell?                                           │
 * ├─────────────────────────────────────────────────────────────────────────────┤
 * │ In enterprise environments, PowerShell is the primary automation and        │
 * │ administration tool for Windows Server. Unlike the GUI, PowerShell:         │
 * │                                                                             │
 * │ • Scales - One command can affect 1000 servers                              │
 * │ • Documents - Scripts serve as runbooks                                     │
 * │ • Automates - Scheduled tasks, CI/CD pipelines                              │
 * │ • Remotes - Manage servers without RDP                                      │
 * │                                                                             │
 * │ The AZ-800 exam expects candidates to know both GUI and PowerShell          │
 * │ approaches. This simulator teaches the "muscle memory" of cmdlet syntax.    │
 * └─────────────────────────────────────────────────────────────────────────────┘
 *
 * Architecture:
 * - IIFE (Immediately Invoked Function Expression) for encapsulation
 * - Simulated Windows filesystem with NTFS-like permissions
 * - Tab completion for commands and paths
 * - Command history with arrow key navigation
 * - Pipeline simulation (Where-Object, Select-Object, etc.)
 * - Module-specific filesystem overlays for different labs
 *
 * Usage:
 *   // Initialize with module ID and container
 *   PSTerminal.init('WSA-M02', '#terminal-container');
 *
 *   // Or with custom configuration
 *   PSTerminal.init('WSA-M03', '#container', {
 *       user: 'Administrator',
 *       hostname: 'FS01',
 *       startDir: 'C:\\Shares'
 *   });
 *
 * Version: 1.0.0
 * Created: January 30, 2026
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const PSTerminal = (function() {
    'use strict';

    // ═══════════════════════════════════════════════════════════════════════════
    // CONFIGURATION & STATE MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════════
    //
    // The terminal maintains several state objects that track the current
    // session. This mirrors how a real PowerShell session works - it has
    // a current location, environment variables, command history, etc.
    //
    // ┌─────────────────────────────────────────────────────────────────────────┐
    // │ INSIGHT: PowerShell Session State                                       │
    // ├─────────────────────────────────────────────────────────────────────────┤
    // │ When you open PowerShell, it creates a "runspace" - an isolated         │
    // │ environment with its own:                                               │
    // │                                                                         │
    // │ • Current location (Get-Location / $PWD)                                │
    // │ • Variables ($var = "value")                                            │
    // │ • Environment variables ($env:PATH)                                     │
    // │ • Command history (Get-History)                                         │
    // │ • Loaded modules (Get-Module)                                           │
    // │                                                                         │
    // │ Our simulator replicates this concept with JavaScript objects.          │
    // └─────────────────────────────────────────────────────────────────────────┘

    /**
     * Terminal configuration - set during init()
     *
     * ┌─────────────────────────────────────────────────────────────────────────┐
     * │ INSIGHT: Callback-Based Integration                                     │
     * ├─────────────────────────────────────────────────────────────────────────┤
     * │ Lab modules can hook into terminal events using callbacks:              │
     * │                                                                         │
     * │ • onCommand - Called after each command execution                       │
     * │   Params: (command, args, params, output)                               │
     * │                                                                         │
     * │ This pattern allows labs to validate objectives without coupling        │
     * │ the terminal to specific lab logic.                                     │
     * └─────────────────────────────────────────────────────────────────────────┘
     */
    let config = {
        moduleId: null,           // e.g., 'WSA-M02', 'WSA-M03'
        container: null,          // DOM container element
        user: 'Administrator',    // Current user context
        hostname: 'DC01',         // Server hostname
        domain: 'hexworth.local', // Domain name
        startDir: 'C:\\Users\\Administrator',  // Initial working directory
        prompt: null,             // Custom prompt (auto-generated if null)

        // Callbacks for lab integration
        onCommand: null,          // Called after command execution: (cmd, args, params, output)
        onObjectiveComplete: null, // Called when an objective is completed: (objectiveId)
    };

    /**
     * Runtime state - changes during session
     *
     * ┌─────────────────────────────────────────────────────────────────────────┐
     * │ INSIGHT: Why Track All This State?                                      │
     * ├─────────────────────────────────────────────────────────────────────────┤
     * │ Real Windows Server administration involves managing state across:      │
     * │                                                                         │
     * │ • Active Directory (users, groups, computers)                           │
     * │ • Storage (disks, volumes, shares)                                      │
     * │ • Virtualization (VMs, switches, checkpoints)                           │
     * │ • Services (running, stopped, disabled)                                 │
     * │                                                                         │
     * │ Our simulated state allows students to see immediate feedback when      │
     * │ they run commands like New-ADUser or Start-VM without affecting         │
     * │ real systems.                                                           │
     * └─────────────────────────────────────────────────────────────────────────┘
     */
    let state = {
        // Session state
        currentDir: 'C:\\Users\\Administrator',
        commandHistory: [],
        historyIndex: -1,

        // Environment variables (like $env:PATH)
        env: {
            'COMPUTERNAME': 'DC01',
            'USERNAME': 'Administrator',
            'USERDOMAIN': 'HEXWORTH',
            'USERPROFILE': 'C:\\Users\\Administrator',
            'HOMEDRIVE': 'C:',
            'HOMEPATH': '\\Users\\Administrator',
            'SYSTEMROOT': 'C:\\Windows',
            'WINDIR': 'C:\\Windows',
            'TEMP': 'C:\\Users\\Administrator\\AppData\\Local\\Temp',
            'PATH': 'C:\\Windows\\System32;C:\\Windows;C:\\Windows\\System32\\WindowsPowerShell\\v1.0',
            'PSModulePath': 'C:\\Program Files\\WindowsPowerShell\\Modules;C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\Modules',
        },

        // PowerShell variables ($variableName)
        variables: {},

        // Filesystem state
        fs: {},

        // Simulated server state
        services: {},      // Windows services (Get-Service)
        processes: {},     // Running processes (Get-Process)
        adUsers: {},       // AD user objects
        adGroups: {},      // AD group objects
        adComputers: {},   // AD computer objects
        adOUs: {},         // AD organizational units
        disks: {},         // Physical disks
        partitions: {},    // Disk partitions
        volumes: {},       // Volumes/drives
        shares: {},        // SMB shares
        vms: {},           // Hyper-V VMs
        vmSwitches: {},    // Virtual switches
        clusterNodes: {},  // Failover cluster nodes
        containers: {},    // Docker containers

        // DNS Server state
        dnsZones: {},      // DNS zones
        dnsForwarders: [], // DNS forwarders

        // DHCP Server state
        dhcpScopes: [],    // DHCP scopes

        // Group Policy state
        gpos: [],          // Group Policy Objects
        gpLinks: [],       // GPO links

        // IIS/Web Server state
        iisSites: [],      // IIS websites
        iisAppPools: [],   // Application pools

        // Remote Desktop Services state
        rdsCollections: [],  // Session collections
        rdsSessions: [],     // Active sessions
        rdsLicensing: {},    // Licensing config

        // Certificate Services state
        caTemplates: [],     // CA templates
        localCerts: [],      // Local certificate store

        // AD Replication state
        adSites: [],         // AD sites
        adSubnets: [],       // AD subnets
        adSiteLinks: [],     // AD site links

        // Windows Backup state
        backupPolicy: null,  // Current backup policy
        backupTarget: null,  // Backup target
        backups: [],         // Backup history

        // Windows Firewall state
        firewallRules: [],     // Firewall rules
        firewallProfiles: {},  // Firewall profiles

        // Lab/objective tracking
        objectives: [],
        objectivesCompleted: {},

        // Terminal state
        isInitialized: false,
        lastExitCode: 0,   // $LASTEXITCODE equivalent
        lastOutput: null,  // For piping

        // Tab completion state
        _lastTabTime: 0,
        _lastTabWord: '',
    };

    /**
     * DOM element references
     */
    let elements = {
        container: null,
        output: null,
        inputLine: null,
        promptSpan: null,
        input: null,
        objectivesPanel: null,
    };

    // ═══════════════════════════════════════════════════════════════════════════
    // WINDOWS FILESYSTEM SIMULATION
    // ═══════════════════════════════════════════════════════════════════════════
    //
    // A realistic Windows Server filesystem structure. This base filesystem
    // is always present; modules can add overlays for specific lab scenarios.
    //
    // ┌─────────────────────────────────────────────────────────────────────────┐
    // │ INSIGHT: Windows Server Directory Structure                             │
    // ├─────────────────────────────────────────────────────────────────────────┤
    // │ Unlike Linux (single root /), Windows uses drive letters:               │
    // │                                                                         │
    // │ C:\ - System drive (Windows, Program Files, Users)                      │
    // │ D:\ - Often data/applications                                           │
    // │ E:\ - CD/DVD or additional storage                                      │
    // │                                                                         │
    // │ Key Windows Server paths:                                               │
    // │ • C:\Windows\System32     - Core OS files, many admin tools             │
    // │ • C:\Windows\NTDS         - Active Directory database (on DCs)          │
    // │ • C:\Windows\SYSVOL       - Group Policy, logon scripts                 │
    // │ • C:\inetpub              - IIS web server content                      │
    // │ • C:\ClusterStorage       - Cluster Shared Volumes (CSV)                │
    // │                                                                         │
    // │ Path format uses backslashes: C:\Users\Administrator\Documents          │
    // └─────────────────────────────────────────────────────────────────────────┘

    const BASE_FILESYSTEM = {
        // Root drives
        'C:': {
            type: 'drive',
            label: 'System',
            children: ['Windows', 'Users', 'Program Files', 'Program Files (x86)', 'inetpub', 'Shares']
        },
        'D:': {
            type: 'drive',
            label: 'Data',
            children: ['Backups', 'VMs', 'Archives', 'Projects']
        },
        'E:': {
            type: 'drive',
            label: 'CLASSIFIED_USB',
            hidden: true,
            children: ['COSMIC_CLEARANCE', 'FIRST_CONTACT', 'FUTURE_INTEL', '.system_recovery']
        },

        // ─────────────────────────────────────────────────────────────────────
        // C:\Windows - Operating System
        // ─────────────────────────────────────────────────────────────────────
        'C:\\Windows': {
            type: 'dir',
            system: true,
            children: ['System32', 'NTDS', 'SYSVOL', 'Logs', 'Temp', 'PolicyDefinitions']
        },
        'C:\\Windows\\System32': {
            type: 'dir',
            system: true,
            children: ['config', 'drivers', 'WindowsPowerShell', 'GroupPolicy', 'dns']
        },
        'C:\\Windows\\System32\\WindowsPowerShell': {
            type: 'dir',
            system: true,
            children: ['v1.0']
        },
        'C:\\Windows\\System32\\WindowsPowerShell\\v1.0': {
            type: 'dir',
            system: true,
            children: ['Modules', 'powershell.exe']
        },
        'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe': {
            type: 'file',
            system: true,
            size: 452608,
        },

        /**
         * ┌─────────────────────────────────────────────────────────────────────┐
         * │ INSIGHT: NTDS Directory                                             │
         * ├─────────────────────────────────────────────────────────────────────┤
         * │ C:\Windows\NTDS contains the Active Directory database:             │
         * │                                                                     │
         * │ • ntds.dit    - The AD database (users, groups, everything)         │
         * │ • edb.log     - Transaction log                                     │
         * │ • edb.chk     - Checkpoint file                                     │
         * │                                                                     │
         * │ This folder only exists on Domain Controllers. Protecting ntds.dit  │
         * │ is critical - it contains password hashes for all domain accounts.  │
         * │                                                                     │
         * │ AZ-800 Relevance: Understanding AD database location is essential   │
         * │ for backup/recovery and disaster recovery scenarios.                │
         * └─────────────────────────────────────────────────────────────────────┘
         */
        'C:\\Windows\\NTDS': {
            type: 'dir',
            system: true,
            children: ['ntds.dit', 'edb.log', 'edb.chk', 'temp.edb']
        },
        'C:\\Windows\\NTDS\\ntds.dit': {
            type: 'file',
            system: true,
            size: 67108864, // 64 MB
            description: 'Active Directory database',
        },

        /**
         * ┌─────────────────────────────────────────────────────────────────────┐
         * │ INSIGHT: SYSVOL                                                     │
         * ├─────────────────────────────────────────────────────────────────────┤
         * │ SYSVOL is replicated between all Domain Controllers and contains:   │
         * │                                                                     │
         * │ • Group Policy templates (GPOs)                                     │
         * │ • Logon scripts                                                     │
         * │ • Policies folder                                                   │
         * │                                                                     │
         * │ When you create a GPO, it's stored here and replicated via DFS-R    │
         * │ (Distributed File System Replication) to all DCs.                   │
         * └─────────────────────────────────────────────────────────────────────┘
         */
        'C:\\Windows\\SYSVOL': {
            type: 'dir',
            children: ['domain', 'staging', 'sysvol']
        },
        'C:\\Windows\\SYSVOL\\domain': {
            type: 'dir',
            children: ['Policies', 'scripts']
        },
        'C:\\Windows\\SYSVOL\\domain\\Policies': {
            type: 'dir',
            children: ['{31B2F340-016D-11D2-945F-00C04FB984F9}', '{6AC1786C-016F-11D2-945F-00C04fB984F9}']
        },
        'C:\\Windows\\SYSVOL\\domain\\scripts': {
            type: 'dir',
            children: ['logon.bat', 'mapdrives.ps1']
        },
        'C:\\Windows\\SYSVOL\\domain\\scripts\\logon.bat': {
            type: 'file',
            size: 256,
            content: '@echo off\nREM Domain logon script\nnet use H: \\\\fs01\\home$\\%USERNAME%\n',
        },
        'C:\\Windows\\SYSVOL\\domain\\scripts\\mapdrives.ps1': {
            type: 'file',
            size: 512,
            content: '# Drive mapping script\n$drives = @{\n    "H:" = "\\\\fs01\\home$\\$env:USERNAME"\n    "S:" = "\\\\fs01\\shared"\n}\nforeach ($d in $drives.Keys) {\n    New-PSDrive -Name $d.TrimEnd(":") -PSProvider FileSystem -Root $drives[$d] -Persist\n}\n',
        },
        'C:\\Windows\\Logs': {
            type: 'dir',
            children: ['CBS', 'DISM', 'DPX', '.covert']
        },
        'C:\\Windows\\Logs\\.covert': {
            type: 'dir',
            hidden: true,
            children: ['keylogger.dat', 'screen_captures', 'network_intercepts.pcap', 'README_AGENT.txt']
        },
        'C:\\Windows\\Logs\\.covert\\README_AGENT.txt': {
            type: 'file',
            hidden: true,
            size: 768,
            content: `COVERT COLLECTION POINT - OPERATIONAL NOTICE
============================================
Classification: TOP SECRET // ORCON

This directory contains data collected from target systems.
Exfiltration window: Every Sunday 0300-0400 UTC

CURRENT TARGETS ON THIS NETWORK:
- CFO workstation (financial data)
- R&D file server (proprietary research)
- Executive email archive

STATUS: Collection proceeding normally. Cover intact.

EMERGENCY PROTOCOL:
If discovered, execute: C:\\Windows\\Temp\\.destroy.bat
This will securely wipe all evidence and trigger hardware failure.

Your next dead drop is CHARLIE. Pickup window: 2026-02-08.

Remember: We don't exist. You don't exist. This file doesn't exist.
- CONTROL
`,
        },
        'C:\\Windows\\Temp': {
            type: 'dir',
            system: true,
            children: ['wct1234.tmp', 'perfmon.dat', '.destroy.bat']
        },
        'C:\\Windows\\Temp\\.destroy.bat': {
            type: 'file',
            hidden: true,
            system: true,
            size: 256,
            content: '@echo off\nREM Emergency cleanup - execute only if compromised\ncipher /w:C:\ndel /s /q C:\\Windows\\Logs\\.covert\\*\nreg add HKLM\\SYSTEM\\CurrentControlSet\\Control\\CrashControl /v AutoReboot /t REG_DWORD /d 1 /f\nshutdown /r /t 0 /f\n',
        },

        // ─────────────────────────────────────────────────────────────────────
        // C:\Users - User Profiles
        // ─────────────────────────────────────────────────────────────────────
        'C:\\Users': {
            type: 'dir',
            children: ['Administrator', 'Public', 'Default']
        },
        'C:\\Users\\Administrator': {
            type: 'dir',
            owner: 'Administrator',
            children: ['Desktop', 'Documents', 'Downloads', 'AppData']
        },
        'C:\\Users\\Administrator\\Desktop': {
            type: 'dir',
            owner: 'Administrator',
            children: ['Server Manager.lnk', 'PowerShell.lnk', 'notes.txt', '.secure_comms.lnk']
        },
        'C:\\Users\\Administrator\\Desktop\\notes.txt': {
            type: 'file',
            size: 384,
            content: `Server Maintenance Notes
========================
- Backup schedule: Daily at 2 AM
- Patch window: Sundays 4-6 AM
- Emergency contact: x4747

TODO:
- Check disk space on D:
- Review security logs
- Follow up on that weird traffic from last week

Remember: The password to the vault share is NOT "admin123"
          (IT made me change it after the audit)
`,
        },
        'C:\\Users\\Administrator\\Desktop\\.secure_comms.lnk': {
            type: 'file',
            hidden: true,
            size: 128,
            content: 'LINK: C:\\Shares\\.vault\\BLACK_PROJECTS\\secure_terminal.exe\n',
        },
        'C:\\Users\\Administrator\\Documents': {
            type: 'dir',
            owner: 'Administrator',
            children: ['WindowsPowerShell', 'Reports', 'Personal', '.handler_instructions']
        },
        'C:\\Users\\Administrator\\Documents\\Reports': {
            type: 'dir',
            children: ['Q4_2025_Summary.docx', 'Incident_Response_Template.docx', 'Network_Audit_2026.xlsx']
        },
        'C:\\Users\\Administrator\\Documents\\Reports\\Q4_2025_Summary.docx': {
            type: 'file',
            size: 45056,
            content: `QUARTERLY SUMMARY REPORT - Q4 2025
===================================
Department: IT Infrastructure
Prepared by: Administrator
Classification: INTERNAL USE ONLY

EXECUTIVE SUMMARY
-----------------
Q4 2025 saw significant improvements in system uptime and security posture.
Key achievements include:
- 99.97% uptime across all production servers
- Zero security breaches reported
- Successful migration to Windows Server 2025 completed
- AD forest consolidation from 3 domains to 1

BUDGET UTILIZATION
------------------
Allocated: $2,450,000
Spent:     $2,312,847
Variance:  $137,153 under budget (5.6%)

INCIDENTS
---------
Total tickets: 1,247
P1 Critical:   3 (all resolved within SLA)
P2 High:       27
P3 Medium:     412
P4 Low:        805

NOTE: See Appendix C for details on the "unusual network traffic"
incident on 2025-11-15. Investigation ongoing. Reference: INC-2025-1847
`,
        },
        'C:\\Users\\Administrator\\Documents\\Reports\\Incident_Response_Template.docx': {
            type: 'file',
            size: 38912,
            content: `INCIDENT RESPONSE TEMPLATE
==========================
Version: 3.2
Last Updated: 2025-12-01
Classification: OFFICIAL - SENSITIVE

SECTION 1: INCIDENT IDENTIFICATION
-----------------------------------
Incident ID:     [AUTO-GENERATED]
Date/Time:       [YYYY-MM-DD HH:MM UTC]
Reporter:        [NAME / SYSTEM]
Severity:        [ ] P1-Critical  [ ] P2-High  [ ] P3-Medium  [ ] P4-Low

SECTION 2: INITIAL ASSESSMENT
------------------------------
Affected Systems:
Impact Scope:     [ ] Single User  [ ] Department  [ ] Organization-wide
Data Involved:    [ ] PII  [ ] Financial  [ ] Classified  [ ] None

SECTION 3: CONTAINMENT
-----------------------
[ ] Network isolation applied
[ ] Accounts disabled
[ ] Systems powered down
[ ] Backup verification initiated

SECTION 4: CHAIN OF CUSTODY
----------------------------
Evidence Item    | Collected By | Date/Time | Storage Location
-----------------|--------------|-----------|------------------
                 |              |           |

EMERGENCY CONTACTS:
- CISO: ext. 7700
- Legal: ext. 7701
- FBI Cyber: [REDACTED] - Use only for APT/Nation-state
- Insurance: Policy #CYB-2025-8847-A

*** DO NOT DISCUSS INCIDENTS ON UNSECURED CHANNELS ***
`,
        },
        'C:\\Users\\Administrator\\Documents\\Reports\\Network_Audit_2026.xlsx': {
            type: 'file',
            size: 124928,
            content: `NETWORK INFRASTRUCTURE AUDIT - 2026
====================================
Audit Period: 2026-01-01 to 2026-01-30
Auditor: External - CyberSecure Partners LLC

FINDINGS SUMMARY
----------------
Critical:  2
High:      7
Medium:    23
Low:       45
Info:      112

CRITICAL FINDINGS:
------------------
[C-01] Legacy SMBv1 enabled on 3 file servers
       Risk: Remote code execution, ransomware propagation
       Remediation: Disable SMBv1, upgrade to SMBv3

[C-02] Domain Admin account used for service authentication
       Risk: Credential theft, lateral movement
       Remediation: Create dedicated service accounts with minimal privileges

HIGH FINDINGS:
--------------
[H-01] 147 systems missing critical patches (>30 days)
[H-02] Firewall rules allow any-to-any on VLAN 45
[H-03] No network segmentation between IT and OT networks
[H-04] Default credentials on 12 network devices
[H-05] Unencrypted backup traffic crossing WAN links
[H-06] No MFA on VPN gateway
[H-07] SNMP v1/v2c in use (cleartext community strings)

RECOMMENDED PRIORITY:
1. Address C-01 and C-02 within 7 days
2. Implement MFA on VPN (H-06) within 14 days
3. Patch critical systems (H-01) within 30 days
`,
        },
        'C:\\Users\\Administrator\\Documents\\Personal': {
            type: 'dir',
            children: ['vacation_photos', 'recipes.txt', '.not_personal']
        },
        'C:\\Users\\Administrator\\Documents\\Personal\\vacation_photos': {
            type: 'dir',
            children: ['hawaii_2024.jpg', 'iceland_aurora.jpg', 'notes.txt']
        },
        'C:\\Users\\Administrator\\Documents\\Personal\\vacation_photos\\notes.txt': {
            type: 'file',
            size: 847,
            content: `TRAVEL NOTES
=============

HAWAII 2024 (April 15-22):
- Stayed at Four Seasons Maui
- Snorkeling at Molokini Crater - incredible!
- Luau was overrated, food was mediocre
- Total cost: $12,400 (worth it)

ICELAND (September 2024):
- Northern Lights tour - AMAZING
- Blue Lagoon was too crowded
- Rental car handled the snow well
- Interesting conversation with "Erik" from the embassy
- He mentioned the fishing industry is "changing" - weird

TO DO:
- Book Switzerland trip for Q2 2026
- Renew passport (expires 2027-03)
- Remember to bring the "diplomatic pouch" to Geneva
`,
        },
        'C:\\Users\\Administrator\\Documents\\Personal\\recipes.txt': {
            type: 'file',
            size: 2048,
            content: `FAVORITE RECIPES
================

GRANDMA'S SECRET CHILI
----------------------
- 2 lbs ground beef
- 1 can kidney beans
- 1 can black beans
- 2 cans diced tomatoes
- 1 onion, diced
- 3 cloves garlic
- 2 tbsp chili powder
- 1 tsp cumin
- THE SECRET: 1 square dark chocolate
- Simmer 4 hours minimum

MOM'S CHOCOLATE CHIP COOKIES
-----------------------------
- Standard Toll House recipe
- BUT use brown butter
- AND refrigerate dough 24 hours
- 375F for exactly 11 minutes

UNCLE MIKE'S "SPECIAL" BBQ RUB
------------------------------
Note: He was always weird about this recipe.
Found this in his things after he passed.
- 2 parts paprika
- 1 part brown sugar
- 1 part garlic powder
- 1/2 part cayenne
- "Add the package from the shed"

I still don't know what "the package from the shed" means.
That shed burned down in the 90s. Weird coincidence timing
with his "business trip" to Nicaragua.
`,
        },
        'C:\\Users\\Administrator\\Documents\\Personal\\.not_personal': {
            type: 'dir',
            hidden: true,
            children: ['crypto_wallet_seeds.txt', 'offshore_accounts.xlsx', 'insurance_policy.pdf']
        },
        'C:\\Users\\Administrator\\Documents\\Personal\\.not_personal\\crypto_wallet_seeds.txt': {
            type: 'file',
            hidden: true,
            size: 512,
            content: `CRYPTOCURRENCY WALLET SEED PHRASES
==================================
DO NOT SHARE THESE WITH ANYONE

Bitcoin (Main): witch collapse practice feed shame open despair creek road again
Ethereum: armed cliff mother nature december ready love still number same abandon
Monero (Anonymous): [ENCRYPTED - see keepass database]

Total Holdings (as of 2026-01-15):
BTC: 14.7823 (~$2.1M at current prices)
ETH: 892.44 (~$1.4M)
XMR: 4,200 (~$840K)

NOTE: These funds are from legitimate consulting work.
The timing of the Hexworth stock trades was coincidental.
`,
        },
        'C:\\Users\\Administrator\\Documents\\.handler_instructions': {
            type: 'dir',
            hidden: true,
            children: ['contact_protocol.txt', 'emergency_exfil.pdf', 'mission_parameters.enc']
        },
        'C:\\Users\\Administrator\\Documents\\.handler_instructions\\contact_protocol.txt': {
            type: 'file',
            hidden: true,
            size: 1024,
            content: `AGENT CONTACT PROTOCOL - MEMORIZE AND DELETE
============================================

Primary Contact: Thursdays, 1400 local
Method: Signal app, disposable number (changes monthly)
Current number: +1 (202) 555-0173

Secondary Contact: If primary fails, leave chalk mark at Site DELTA
Response window: 48 hours

Emergency (blown cover):
1. Text "WRONG NUMBER" to primary
2. Proceed immediately to exfil point BRAVO
3. Do NOT return home or contact family
4. We will handle your "disappearance"

Monthly dead drop: First Monday, location ALPHA
Contents: USB with intelligence package, encrypted with standard key

REMEMBER:
- You are a loyal Hexworth employee
- You have never traveled to [REDACTED] or [REDACTED]
- Your "photography hobby" explains the camera equipment
- The money comes from "cryptocurrency investments"

Good luck. Your country (the real one) thanks you.
- SPHINX
`,
        },
        'C:\\Users\\Administrator\\Downloads': {
            type: 'dir',
            children: ['WindowsUpdate_KB5034441.msu', 'RSAT_Tools.exe', '.darkweb_browser', 'totally_legit.zip']
        },
        'C:\\Users\\Administrator\\Downloads\\.darkweb_browser': {
            type: 'dir',
            hidden: true,
            children: ['tor.exe', 'config.ini', 'bookmarks.html']
        },
        'C:\\Users\\Administrator\\Downloads\\.darkweb_browser\\bookmarks.html': {
            type: 'file',
            hidden: true,
            size: 768,
            content: `<!DOCTYPE html>
<html>
<head><title>Bookmarks</title></head>
<body>
<!-- Dark Web Bookmarks - DELETE THIS FILE -->
<h3>Research (legitimate):</h3>
<ul>
<li>HackerOne - Bug Bounty Research</li>
<li>SANS Reading Room</li>
<li>CVE Database Mirror</li>
</ul>

<h3>Operational (DO NOT VISIT FROM WORK):</h3>
<ul>
<li>[REDACTED].onion - Dead drop communications</li>
<li>[REDACTED].onion - Document verification service</li>
<li>[REDACTED].onion - Emergency extraction requests</li>
</ul>

<h3>Personal Interest (plausible deniability):</h3>
<ul>
<li>Archive.org - Wayback Machine</li>
<li>Wikipedia alternative mirrors</li>
</ul>
</body>
</html>
`,
        },
        'C:\\Users\\Administrator\\Documents\\WindowsPowerShell': {
            type: 'dir',
            owner: 'Administrator',
            children: ['Microsoft.PowerShell_profile.ps1']
        },
        'C:\\Users\\Administrator\\Documents\\WindowsPowerShell\\Microsoft.PowerShell_profile.ps1': {
            type: 'file',
            owner: 'Administrator',
            size: 512,
            content: '# PowerShell Profile\n# Loaded on every session\n\n$Host.UI.RawUI.WindowTitle = "Administrator: PowerShell"\n\n# Import AD module by default on DCs\nif (Get-WindowsFeature AD-Domain-Services -ErrorAction SilentlyContinue) {\n    Import-Module ActiveDirectory\n}\n',
        },

        // ─────────────────────────────────────────────────────────────────────
        // C:\Program Files - Installed Applications
        // ─────────────────────────────────────────────────────────────────────
        'C:\\Program Files': {
            type: 'dir',
            children: ['Windows Server', 'WindowsPowerShell', 'Microsoft']
        },
        'C:\\Program Files\\WindowsPowerShell': {
            type: 'dir',
            children: ['Modules']
        },
        'C:\\Program Files\\WindowsPowerShell\\Modules': {
            type: 'dir',
            children: ['ActiveDirectory', 'DnsServer', 'Hyper-V', 'FailoverClusters', 'Storage']
        },
        'C:\\Program Files (x86)': {
            type: 'dir',
            children: []
        },

        // ─────────────────────────────────────────────────────────────────────
        // C:\inetpub - IIS Web Server
        // ─────────────────────────────────────────────────────────────────────
        /**
         * ┌─────────────────────────────────────────────────────────────────────┐
         * │ INSIGHT: IIS (Internet Information Services)                        │
         * ├─────────────────────────────────────────────────────────────────────┤
         * │ IIS is Microsoft's web server, competing with Apache/Nginx.         │
         * │                                                                     │
         * │ C:\inetpub\wwwroot is the default website root.                     │
         * │                                                                     │
         * │ While not directly on AZ-800, web servers often run on Windows      │
         * │ Server, and admins need to understand the directory structure.      │
         * └─────────────────────────────────────────────────────────────────────┘
         */
        'C:\\inetpub': {
            type: 'dir',
            children: ['wwwroot', 'logs']
        },
        'C:\\inetpub\\wwwroot': {
            type: 'dir',
            children: ['index.html', 'web.config']
        },

        // ─────────────────────────────────────────────────────────────────────
        // C:\Shares - File Server Shares (common setup)
        // ─────────────────────────────────────────────────────────────────────
        /**
         * ┌─────────────────────────────────────────────────────────────────────┐
         * │ INSIGHT: File Shares                                                │
         * ├─────────────────────────────────────────────────────────────────────┤
         * │ Best practice: Keep shared folders on a dedicated path like         │
         * │ C:\Shares or D:\Shares, not scattered throughout the system.        │
         * │                                                                     │
         * │ Common share types:                                                 │
         * │ • Department shares (\\server\Finance$, \\server\HR$)               │
         * │ • Home folders (\\server\Home$\username)                            │
         * │ • Software distribution (\\server\Software$)                        │
         * │                                                                     │
         * │ The $ suffix makes shares "hidden" (not visible in Network browse). │
         * │                                                                     │
         * │ AZ-800 Relevance: SMB shares are 15-20% of the exam (Storage).      │
         * └─────────────────────────────────────────────────────────────────────┘
         */
        'C:\\Shares': {
            type: 'dir',
            children: ['IT', 'Finance', 'HR', 'Public']
        },
        'C:\\Shares\\IT': {
            type: 'dir',
            children: ['Scripts', 'Software', 'Documentation']
        },
        'C:\\Shares\\IT\\Scripts': {
            type: 'dir',
            children: ['backup.ps1', 'cleanup.ps1']
        },

        // ─────────────────────────────────────────────────────────────────────
        // D: Drive - Data
        // ─────────────────────────────────────────────────────────────────────
        'D:\\Backups': {
            type: 'dir',
            children: ['SystemState', 'SQL']
        },
        'D:\\VMs': {
            type: 'dir',
            children: ['WEB01', 'SQL01']
        },
        'D:\\VMs\\WEB01': {
            type: 'dir',
            children: ['WEB01.vhdx', 'WEB01.vmcx']
        },

        // ═══════════════════════════════════════════════════════════════════════════
        // EXPANDED FILESYSTEM - DISCOVERABLE CONTENT
        // ═══════════════════════════════════════════════════════════════════════════
        // Hidden files and directories for exploration. Use Get-ChildItem -Force
        // to discover hidden content. Content increases in complexity per module.

        // ─────────────────────────────────────────────────────────────────────
        // C:\Users\Administrator - Hidden directories and files
        // ─────────────────────────────────────────────────────────────────────
        'C:\\Users\\Administrator\\AppData': {
            type: 'dir',
            hidden: true,
            children: ['Local', 'Roaming', '.classified']
        },
        'C:\\Users\\Administrator\\AppData\\.classified': {
            type: 'dir',
            hidden: true,
            children: ['OPERATION_NIGHTFALL.enc', 'asset_list.pgp', 'dead_drops.txt', '.keyring']
        },
        'C:\\Users\\Administrator\\AppData\\.classified\\dead_drops.txt': {
            type: 'file',
            hidden: true,
            size: 892,
            content: `DEAD DROP LOCATIONS - OPERATION NIGHTFALL
==========================================
Classification: TOP SECRET // NOFORN

ALPHA: Lincoln Memorial, 3rd step from bottom, magnetic container
       Signal: Chalk mark on Jefferson statue base (X = pickup ready)

BRAVO: Union Station, locker 1847, combination: 34-17-42
       Signal: Newspaper in trash bin with red circle on front page

CHARLIE: Rock Creek Park, oak tree at 38.9482° N, 77.0528° W
         Signal: White ribbon tied to park bench

DELTA: Georgetown Library, Mythology section, inside "Odyssey"
       Signal: Dog-eared page 247

Emergency extraction: Call (202) 555-0147, say "The weather in Prague is lovely"
Abort code: "BLACKBIRD GROUNDED"

- Handler SPHINX
`,
        },
        'C:\\Users\\Administrator\\AppData\\.classified\\.keyring': {
            type: 'dir',
            hidden: true,
            children: ['nuke_auth.key', 'sat_uplink.key', 'embassy_access.key']
        },
        'C:\\Users\\Administrator\\AppData\\.classified\\.keyring\\nuke_auth.key': {
            type: 'file',
            hidden: true,
            readonly: true,
            size: 256,
            content: `NUCLEAR AUTHORIZATION CODES - EYES ONLY
========================================
Site: LOOKING GLASS ALTERNATE
Date: 2026-01-30
Valid: 0600Z - 1800Z

PRIMARY:   7-7-4-1-9-3-ALPHA-FOXTROT-DELTA
SECONDARY: WHISKEY-3-3-ROMEO-8-5-2-NOVEMBER
TERTIARY:  OSCAR-1-4-TANGO-6-UNIFORM-9-1

Two-person rule applies. Confirm with SIOP binder.
Destroy after use.
`,
        },

        // ─────────────────────────────────────────────────────────────────────
        // C:\Shares - File shares with hidden content
        // ─────────────────────────────────────────────────────────────────────
        'C:\\Shares': {
            type: 'dir',
            children: ['Public', 'IT', 'Finance', 'HR', '.vault']
        },
        'C:\\Shares\\Public': {
            type: 'dir',
            children: ['Welcome.txt', 'Policies', 'Templates']
        },
        'C:\\Shares\\Public\\Welcome.txt': {
            type: 'file',
            size: 256,
            content: 'Welcome to Hexworth Industries file shares.\nFor IT support, contact helpdesk@hexworth.local',
        },
        'C:\\Shares\\IT': {
            type: 'dir',
            children: ['Scripts', 'Documentation', 'Tools', '.admin_only']
        },
        'C:\\Shares\\IT\\Scripts': {
            type: 'dir',
            children: ['backup.ps1', 'deploy.ps1', 'audit.ps1', '.cleanup_traces.ps1']
        },
        'C:\\Shares\\IT\\Scripts\\.cleanup_traces.ps1': {
            type: 'file',
            hidden: true,
            size: 1024,
            content: `# CLEANUP SCRIPT - DESTROY AFTER READING
# This script removes all traces of Operation Blacksite

$LogsToDelete = @(
    "C:\\Windows\\Logs\\BLACKSITE\\*",
    "C:\\Shares\\.vault\\*.log",
    "\\\\DC02\\Logs$\\intercept_*"
)

foreach ($path in $LogsToDelete) {
    Remove-Item $path -Force -ErrorAction SilentlyContinue
}

# Clear security event logs
wevtutil cl Security

# Remove this script
Remove-Item $MyInvocation.MyCommand.Path -Force
`,
        },
        'C:\\Shares\\IT\\.admin_only': {
            type: 'dir',
            hidden: true,
            children: ['master_passwords.xlsx', 'network_diagram_classified.vsd', 'intercepted_comms']
        },
        'C:\\Shares\\IT\\.admin_only\\intercepted_comms': {
            type: 'dir',
            hidden: true,
            children: ['2026-01-15_suspect_alpha.wav', '2026-01-22_asset_report.txt', 'SIGINT_summary.pdf']
        },
        'C:\\Shares\\IT\\.admin_only\\intercepted_comms\\2026-01-22_asset_report.txt': {
            type: 'file',
            hidden: true,
            size: 2048,
            content: `INTELLIGENCE ASSET REPORT
=========================
Classification: SECRET // ORCON

Asset Codename: CARDINAL
Real Identity: [REDACTED - EYES ONLY]
Position: Deputy Director, Foreign Ministry
Handler: SPHINX
Recruitment Date: 2019-03-14
Motivation: Ideological (anti-regime)

Recent Intelligence:
- Confirmed location of hidden research facility (coords attached)
- Obtained internal memo re: accelerated enrichment timeline
- Reports increased security around "Project THUNDERBIRD"
- Warns of suspected mole in our Station (unconfirmed)

Assessment: Asset remains reliable. Intelligence grade: A-2 (reliable source, probably true)

Next contact: 2026-02-15, dead drop CHARLIE
Payment: 50,000 transferred to Zurich account ending -7742

HANDLER NOTES:
Asset appears nervous. Requesting exfil contingency plan.
`,
        },
        'C:\\Shares\\.vault': {
            type: 'dir',
            hidden: true,
            children: ['BLACK_PROJECTS', 'HISTORICAL_ARCHIVES', 'ANOMALY_REPORTS', '.deep_archive']
        },
        'C:\\Shares\\.vault\\BLACK_PROJECTS': {
            type: 'dir',
            hidden: true,
            children: ['MK_ULTRA_SUCCESSOR.pdf', 'STARGATE_REVIVAL.doc', 'PROJECT_AURORA.txt', 'HAARP_MODIFICATIONS.xlsx']
        },
        'C:\\Shares\\.vault\\BLACK_PROJECTS\\PROJECT_AURORA.txt': {
            type: 'file',
            hidden: true,
            size: 4096,
            content: `PROJECT AURORA - EXECUTIVE SUMMARY
===================================
Classification: TOP SECRET // SAP

Overview:
Project Aurora represents the next generation of hypersonic reconnaissance
and strike capability. The vehicle uses a pulse detonation wave engine
capable of sustained Mach 6+ flight at 100,000 feet.

Current Status: IOC achieved 2024
Deployment: Classified facilities in [REDACTED] and [REDACTED]

Recent developments:
- Successful test of plasma stealth system (radar cross-section < 0.0001 m²)
- Integration with LOOKING GLASS satellite network complete
- First operational mission over [REDACTED] in November 2025

Known issues:
- Sonic boom detectable from 200+ miles (cover story: "meteorological phenomena")
- Pilot physiological limits during acceleration phases
- Fuel synthesis requires rare isotopes (supply chain vulnerability)

The "Aurora" phenomenon reported by civilians near Area 51 and RAF Machrihanish
are from early test flights. Continue to attribute to natural causes.

Next milestone: Full operational squadron by Q3 2026
`,
        },
        'C:\\Shares\\.vault\\HISTORICAL_ARCHIVES': {
            type: 'dir',
            hidden: true,
            children: ['JFK_FILES', 'ROSWELL_COMPLETE', 'OAK_ISLAND_SURVEY', 'TEMPLAR_TREASURE']
        },
        'C:\\Shares\\.vault\\HISTORICAL_ARCHIVES\\TEMPLAR_TREASURE': {
            type: 'dir',
            hidden: true,
            children: ['1307_escape_routes.jpg', 'la_rochelle_manifest.txt', 'scotland_sites.kml', 'cipher_key.txt']
        },
        'C:\\Shares\\.vault\\HISTORICAL_ARCHIVES\\TEMPLAR_TREASURE\\la_rochelle_manifest.txt': {
            type: 'file',
            hidden: true,
            size: 1536,
            content: `MANIFEST OF THE TEMPLAR FLEET - LA ROCHELLE
October 13, 1307

Translated from Medieval Latin by Dr. H. Mercer, 1987

Ship 1 - "La Rose de Jérusalem"
- 18 chests of gold coinage (estimated 2,400 kg)
- Sacred relics from Temple of Solomon
- The Copper Scroll (original, Dead Sea document)

Ship 2 - "L'Étoile du Matin"
- Banking records and debtor accounts
- 47 brothers of the Order
- Ark fragments [NOTE: meaning unclear]

Ship 3 - "Le Cygne Noir"
- Destination: Scotland (Rosslyn?)
- Cargo: "That which must be hidden from the profane"
- Manifest sealed by Grand Master Jacques de Molay

Landing Sites (confirmed by 1987 survey):
- Argyll coast, Scotland - Primary
- Galway, Ireland - Secondary
- Nova Scotia (later) - Tertiary

See OAK_ISLAND_SURVEY folder for Money Pit connection.

Current Assessment: Majority of treasure believed to remain in Scotland,
possibly beneath Rosslyn Chapel or in the Kilwinning abbey vaults.
`,
        },
        'C:\\Shares\\.vault\\HISTORICAL_ARCHIVES\\OAK_ISLAND_SURVEY': {
            type: 'dir',
            hidden: true,
            children: ['ground_penetrating_radar_2019.pdf', 'carbon_dating_results.xlsx', 'shaft_mapping.dwg', 'theory_assessment.txt']
        },
        'C:\\Shares\\.vault\\HISTORICAL_ARCHIVES\\OAK_ISLAND_SURVEY\\theory_assessment.txt': {
            type: 'file',
            hidden: true,
            size: 2048,
            content: `OAK ISLAND MONEY PIT - CLASSIFIED ASSESSMENT
=============================================
Prepared by: Historical Anomalies Division
Date: 2023-11-30

Based on our comprehensive survey using classified sensing technology:

CONFIRMED FINDINGS:
- Multiple void spaces detected at 90ft, 130ft, and 200ft depths
- Flood tunnel system is real and deliberately constructed
- Construction methodology consistent with 14th-15th century European techniques
- Trace gold and silver detected in soil samples (not naturally occurring)

MOST LIKELY SCENARIO (72% confidence):
The Money Pit is a Templar construction, built by Brothers who fled to
Nova Scotia via the Atlantic route. The flooding mechanism was designed
to protect contents until the Order could retrieve them.

CONTENTS (speculative based on anomaly analysis):
- Level 90ft: Coins and precious metals (decoy cache)
- Level 130ft: Documents/manuscripts (climate-controlled chamber detected)
- Level 200ft: Primary vault (large metallic anomaly, approx 8m x 4m x 3m)

RECOMMENDATION:
Continue to support civilian treasure hunting as cover. Our assets within
the Lagina expedition should discourage approaches to the 200ft level.
Any breakthrough must be intercepted.

The contents, if confirmed as Templar archive, would rewrite medieval history.
`,
        },
        'C:\\Shares\\.vault\\ANOMALY_REPORTS': {
            type: 'dir',
            hidden: true,
            children: ['UAP_ENCOUNTERS', 'CRYPTID_SIGHTINGS', 'TEMPORAL_ANOMALIES', 'UNEXPLAINED_SIGNALS']
        },
        'C:\\Shares\\.vault\\ANOMALY_REPORTS\\UAP_ENCOUNTERS': {
            type: 'dir',
            hidden: true,
            children: ['nimitz_2004_full.pdf', 'gimbal_analysis.doc', 'tic_tac_reverse_engineering.txt', 'recovered_materials.xlsx']
        },
        'C:\\Shares\\.vault\\ANOMALY_REPORTS\\UAP_ENCOUNTERS\\tic_tac_reverse_engineering.txt': {
            type: 'file',
            hidden: true,
            size: 3072,
            content: `TIC TAC UAP - REVERSE ENGINEERING PROGRESS REPORT
=================================================
Classification: TOP SECRET // COSMIC // NOFORN

Program: AAWSAP/AATIP Successor (Codename: GLASS SLIPPER)
Facility: S4, Nevada Test and Training Range
Date: 2025-09-15

PROPULSION SYSTEM:
After 17 years of analysis on recovered materials, we have confirmed:
- No visible propulsion mechanism (no exhaust, no wings, no rotors)
- Craft generates its own gravitational field
- Material exhibits room-temperature superconductivity
- Meta-material structure suggests manufacturing precision beyond current capability

CURRENT UNDERSTANDING:
The craft appears to manipulate spacetime locally, creating a "bubble"
that moves through space while the craft remains stationary relative
to the bubble interior. This explains:
- Right-angle turns at hypersonic speeds (no inertial effects inside bubble)
- Trans-medium travel (air to water seamlessly)
- Absence of sonic boom at high velocity

REPLICATION ATTEMPTS:
Limited success. We have achieved 3-second gravitational field generation
at 1/10000th the apparent efficiency of the original craft. Power requirements
for sustained operation exceed our current nuclear reactor capacity.

ORIGIN ASSESSMENT:
Not of terrestrial manufacture. Material isotope ratios do not match
any known solar system body. Craft age estimated at 40-50 years based
on recovered biological material (pilot?).

NEXT STEPS:
- Continue metamaterial synthesis attempts
- Expand quantum computing resources for propulsion modeling
- Maintain public denial posture per 1954 agreement
`,
        },
        'C:\\Shares\\.vault\\ANOMALY_REPORTS\\CRYPTID_SIGHTINGS': {
            type: 'dir',
            hidden: true,
            children: ['pacific_northwest_sasquatch.pdf', 'loch_ness_sonar_2024.jpg', 'mothman_correlation_analysis.xlsx']
        },
        'C:\\Shares\\.vault\\.deep_archive': {
            type: 'dir',
            hidden: true,
            children: ['MAJESTIC_12', 'UMBRELLA_PROTOCOLS', 'HOLLOW_EARTH_EXPEDITION', 'SIMULATION_THEORY']
        },
        'C:\\Shares\\.vault\\.deep_archive\\MAJESTIC_12': {
            type: 'dir',
            hidden: true,
            children: ['founding_charter_1947.pdf', 'member_list_current.enc', 'roswell_autopsy_real.avi', 'technology_transfer_log.xlsx']
        },
        'C:\\Shares\\.vault\\.deep_archive\\SIMULATION_THEORY': {
            type: 'dir',
            hidden: true,
            children: ['CERN_anomaly_2025.doc', 'glitch_catalog.xlsx', 'mandela_effects_verified.txt', 'reality_patch_notes.log']
        },
        'C:\\Shares\\.vault\\.deep_archive\\SIMULATION_THEORY\\mandela_effects_verified.txt': {
            type: 'file',
            hidden: true,
            size: 1792,
            content: `VERIFIED REALITY INCONSISTENCIES (MANDELA EFFECTS)
=================================================
Classification: BEYOND TOP SECRET

These documented cases have been verified through archival research
as genuine discontinuities, not mass misremembering:

CATEGORY A - CONFIRMED TIMELINE SHIFTS:
1. Berenstain/Berenstein Bears - Original prints from 1983 show "Berenstein"
   Reality shift documented: 2011

2. Sinbad Genie Movie "Shazaam" - Studio archives contain production documents
   No corresponding film exists in current timeline
   Shift date: Approximately 2009

3. New Zealand location - Pre-1998 maps place it northeast of Australia
   Current position: Southeast

4. South American continent - Significant westward shift (approx 500 miles)
   Historical maps inconclusive; possible gradual change

CATEGORY B - SUSPECTED ACTIVE PATCHES:
- Kennedy assassination: Number of people in car varies in footage
- 9/11 tower collapse sequence: Temporal markers inconsistent
- Moon landing footage: Frame rate anomalies detected

THEORY:
We may be observing "patch updates" to a simulated reality.
The 2012 CERN particle collision may have shifted us to
an adjacent timeline. Continue monitoring for additional
discontinuities.

See: CERN_anomaly_2025.doc for recent portal event.
`,
        },

        // ─────────────────────────────────────────────────────────────────────
        // D: Drive - Additional discoverable content
        // ─────────────────────────────────────────────────────────────────────
        'D:\\Archives': {
            type: 'dir',
            children: ['2024', '2025', '2026', '.legacy']
        },
        'D:\\Archives\\.legacy': {
            type: 'dir',
            hidden: true,
            children: ['cold_war_comms', 'operation_paperclip', 'project_monarch_files']
        },
        'D:\\Archives\\.legacy\\cold_war_comms': {
            type: 'dir',
            hidden: true,
            children: ['venona_decrypts.txt', 'cuban_missile_sitrep.pdf', 'reagan_star_wars_real.doc']
        },
        'D:\\Archives\\.legacy\\cold_war_comms\\venona_decrypts.txt': {
            type: 'file',
            hidden: true,
            size: 2048,
            content: `VENONA PROJECT - ADDITIONAL DECRYPTIONS
=======================================
Classification: SENSITIVE COMPARTMENTED INFORMATION

Recently discovered intercepts, decoded 2019 using quantum computing:

MESSAGE 1847 (July 1945 - New Mexico):
"ENORMOUS project successful. Device detonated at TRINITY site.
ANTENNA confirms Soviet assets have secured design documents.
LIBERAL and FOGEL scheduled for extraction window next month."

MESSAGE 2341 (September 1945 - Washington):
"New asset recruited. Codename: GHOST.
Position: Junior congressman, Texas delegation.
Motivation: Ideological. Predicted rise to significant power.
[REDACTED - still living individual]"

MESSAGE 3892 (March 1947 - New Mexico):
"Recovery teams dispatched to crash site near CORONA.
Debris secured. Biological specimens [NOTE: word unknown - possibly 'survivors'?]
transferred to NEVADA facility. ENORMOZ network alerted."

ANALYST NOTES:
The reference to biological specimens in relation to the Corona, NM crash
(later attributed to Project Mogul balloon) suggests Soviet intelligence
was aware of the Roswell incident before the coverup was complete.
`,
        },
        'D:\\Projects': {
            type: 'dir',
            children: ['Active', 'Completed', 'Proposals', '.classified_contracts']
        },
        'D:\\Projects\\.classified_contracts': {
            type: 'dir',
            hidden: true,
            children: ['DARPA_quantum_net.pdf', 'NSA_backdoor_spec.doc', 'IARPA_precog_study.xlsx']
        },
        'D:\\Backups\\SystemState': {
            type: 'dir',
            children: ['2026-01-01', '2026-01-15', '2026-01-29', '.pre_breach']
        },
        'D:\\Backups\\SystemState\\.pre_breach': {
            type: 'dir',
            hidden: true,
            children: ['ntds_pre_compromise.dit', 'investigation_notes.txt', 'timeline.xlsx']
        },
        'D:\\Backups\\SystemState\\.pre_breach\\investigation_notes.txt': {
            type: 'file',
            hidden: true,
            size: 2560,
            content: `INCIDENT RESPONSE - INTERNAL BREACH INVESTIGATION
================================================
Classification: INTERNAL ONLY - NEED TO KNOW

Date Discovered: 2025-12-03
Incident ID: IR-2025-1847

SUMMARY:
Anomalous data exfiltration detected from Shares\\.vault directory.
Approximately 847 GB transferred to external IP over 3-week period.
Internal actor suspected (timing correlates with VPN sessions).

SUSPECTS:
1. J. Morrison (IT Admin) - Access to all systems, worked late nights
2. Dr. S. Patel (Research Lead) - Accessed vault day before exfil began
3. M. Chen (Security Analyst) - Ironically, was investigating similar breach

KEY EVIDENCE:
- USB device connected to ADMIN-WS03 on 2025-11-15 (no logs of file copy)
- Encrypted tunnel to 185.243.x.x (Russian federation ASN)
- Search queries for "whistleblower protection" on Chen's workstation

CURRENT STATUS:
Investigation ongoing. Chen has been placed on administrative leave.
However, evidence may be planted. The real mole could still be active.

RECOMMENDATION:
Deploy honeypot documents in vault. Monitor all admin access.
Notify FBI Counterintelligence if foreign actor confirmed.

NOTE: If you're reading this, you may have found the mole's trail.
Or you ARE the mole. Either way, you're being watched.
`,
        },

        // ─────────────────────────────────────────────────────────────────────
        // E: Drive - External/Removable with sci-fi content
        // ─────────────────────────────────────────────────────────────────────
        'E:': {
            type: 'drive',
            label: 'CLASSIFIED_USB',
            children: ['COSMIC_CLEARANCE', 'FIRST_CONTACT', 'FUTURE_INTEL', '.system_recovery']
        },
        'E:\\COSMIC_CLEARANCE': {
            type: 'dir',
            children: ['briefing_level_5.pdf', 'need_to_know.txt', 'omega_protocols.enc']
        },
        'E:\\COSMIC_CLEARANCE\\need_to_know.txt': {
            type: 'file',
            size: 1024,
            content: `COSMIC TOP SECRET - EYES ONLY
==============================

If you have accessed this file, you have been read into
a compartmented program beyond normal classification levels.

You now have knowledge of:
- Non-terrestrial intelligence contact (ongoing since 1947)
- Reverse-engineered technology programs
- The true purpose of the International Space Station
- What really happened to the Mars missions

You cannot unknow this. You cannot share this.
Welcome to the truth.

Your handler will contact you within 48 hours.
Memorize the recognition phrase: "The stars are not what they seem."
Response: "They never were."

Destroy this document after reading.
`,
        },
        'E:\\FIRST_CONTACT': {
            type: 'dir',
            children: ['wow_signal_decoded.wav', 'response_draft.txt', 'galactic_map.png', 'translation_key.xlsx']
        },
        'E:\\FIRST_CONTACT\\response_draft.txt': {
            type: 'file',
            size: 1536,
            content: `DRAFT: HUMANITY'S RESPONSE TO WOW SIGNAL ORIGIN
==============================================
Classification: PRESIDENTIAL EYES ONLY

To the beings at origin point of signal 6EQUJ5:

We have received your communication dated [Earth date: August 15, 1977].
We apologize for the delay in response. It took us 35 years to decode
your message and another 12 years to draft this reply.

We understand you are offering:
- Membership in a galactic federation of 147 civilizations
- Technology sharing under controlled terms
- Protection from aggressive species (the "Harvesters"?)

We wish to accept, but request clarification on:
1. What is required of member civilizations?
2. How do we explain your existence to our population?
3. Is the technology compatible with our biology?

We have prepared a delegation. Please advise on transport arrangements.

NOTE: This message was never sent. The decision was made in 1989 to
decline contact and maintain isolation until we achieve Level 1
civilization status. Target date: 2150.
`,
        },
        'E:\\FUTURE_INTEL': {
            type: 'dir',
            hidden: true,
            children: ['chrononauts_report.pdf', 'timeline_preservation.txt', 'bootstrap_paradoxes.xlsx', 'project_rainbow.doc']
        },
        'E:\\FUTURE_INTEL\\timeline_preservation.txt': {
            type: 'file',
            hidden: true,
            size: 2048,
            content: `CHRONONAUTS PROGRAM - TIMELINE PRESERVATION GUIDELINES
=====================================================
Classification: TEMPORAL SECURITY CLEARANCE REQUIRED

As a certified Temporal Operations Agent, you are bound by these rules:

RULE 1: The Prime Timeline Must Be Preserved
No action may be taken that would prevent the founding of the Agency
in 2089. All other events are negotiable.

RULE 2: Avoid Temporal Narcissism
You may NOT meet yourself. The psychological damage is irreversible.
We've lost 23 agents this way.

RULE 3: Do Not Invest Based on Future Knowledge
This creates financial anomalies that our auditors can detect.
Your cover will be blown.

RULE 4: Hitler Rules Apply
Yes, everyone wants to. No, it doesn't work. We've tried 847 times.
Each attempt makes things worse. This timeline is the best one.

RULE 5: Report All Bootstrap Paradoxes
If you find an item or information that has no origin point
(e.g., you brought it from the future, which exists because you
brought it from the future), report immediately for paradox resolution.

CURRENT MISSION: You are stationed in 2026 to ensure the survival
of K. Webb, who will invent the temporal displacement engine in 2067.
Maintain surveillance. Do not engage.

Return window: 2027-03-15 to 2027-03-17, Longitude 77.0365° W
`,
        },
        'E:\\.system_recovery': {
            type: 'dir',
            hidden: true,
            children: ['reality_backup.img', 'consciousness_export.dat', 'simulation_config.json']
        },
        'E:\\.system_recovery\\simulation_config.json': {
            type: 'file',
            hidden: true,
            size: 512,
            content: `{
    "simulation_id": "EARTH-7192847",
    "version": "3.14159",
    "start_date": "-13800000000",
    "physics_engine": "QUANTUM_STANDARD_v4",
    "consciousness_instances": 8000000000,
    "cpu_cores_allocated": 10E42,
    "purpose": "DETERMINATION_OF_OPTIMAL_TIMELINE",
    "creator": "UNKNOWN_EXTERNAL_PROCESS",
    "notes": "Subjects unaware of simulated nature. Do not reveal.",
    "last_patch": "2012-12-21",
    "scheduled_termination": "UNDEFINED"
}
`,
        },

        // ─────────────────────────────────────────────────────────────────────
        // Urban Legends & Mysteries
        // ─────────────────────────────────────────────────────────────────────
        'C:\\Shares\\HR': {
            type: 'dir',
            children: ['Policies', 'Forms', 'Training', '.personnel_files']
        },
        'C:\\Shares\\HR\\.personnel_files': {
            type: 'dir',
            hidden: true,
            children: ['former_employees', 'security_concerns', 'anomalous_hires']
        },
        'C:\\Shares\\HR\\.personnel_files\\anomalous_hires': {
            type: 'dir',
            hidden: true,
            children: ['SMITH_JOHN_no_records.pdf', 'AGENT_UNKNOWN.txt', 'MIB_encounter_2024.doc']
        },
        'C:\\Shares\\HR\\.personnel_files\\anomalous_hires\\AGENT_UNKNOWN.txt': {
            type: 'file',
            hidden: true,
            size: 1280,
            content: `PERSONNEL ANOMALY REPORT
========================
Date: 2024-07-15
Reporting Officer: HR Director Reynolds (since resigned)

Subject: Unidentified Employee "Mr. Gray"

OBSERVATIONS:
- No hire paperwork exists, yet payroll has record since 2019
- ID badge system shows no entries/exits, yet security cameras show him daily
- No employee remembers interviewing or onboarding him
- Desk on 4th floor, but 4th floor has been sealed since 2010 asbestos issue
- Colleagues report conversations they can't remember having

PHYSICAL DESCRIPTION:
Height: Average. Weight: Average. Age: Indeterminate.
Eye color: Can't recall. Hair: Was there hair?
Distinguishing features: Absolutely none.

INVESTIGATION OUTCOME:
When approached for interview, subject smiled and said,
"Some things are better left uninvestigated, Ms. Reynolds."

Ms. Reynolds submitted resignation next day. Cannot be located for follow-up.
Subject "Mr. Gray" has not been seen since.

His desk is still there. Coffee mug still warm every morning.

RECOMMENDATION: Do not investigate further.
`,
        },

        // ─────────────────────────────────────────────────────────────────────
        // Pirate Treasure & Historical Mysteries
        // ─────────────────────────────────────────────────────────────────────
        'C:\\Shares\\Finance': {
            type: 'dir',
            children: ['Reports', 'Budgets', 'Audits', '.offshore']
        },
        'C:\\Shares\\Finance\\.offshore': {
            type: 'dir',
            hidden: true,
            children: ['BLACKBEARD_INHERITANCE', 'nazi_gold_transfers.xlsx', 'yamashita_locations.kml']
        },
        'C:\\Shares\\Finance\\.offshore\\BLACKBEARD_INHERITANCE': {
            type: 'dir',
            hidden: true,
            children: ['teach_family_tree.pdf', 'ocracoke_survey.jpg', 'decoded_map.txt', 'treasure_manifest.xlsx']
        },
        'C:\\Shares\\Finance\\.offshore\\BLACKBEARD_INHERITANCE\\decoded_map.txt': {
            type: 'file',
            hidden: true,
            size: 1792,
            content: `BLACKBEARD'S TREASURE - DECODED COORDINATES
============================================
Original cipher solved by Dr. M. Hendricks, 1978
Verified by ground-penetrating radar, 2015

SITE 1: Ocracoke Island, NC
Coordinates: 35.1146° N, 75.9821° W
Depth: 12 feet below mean tide
Contents: Silver bullion, Spanish reales (est. $4.2 million)
Status: RECOVERED 1998 (black budget operation)

SITE 2: Bath Creek, NC (Teach's residence)
Coordinates: 35.4742° N, 76.8108° W
Depth: 8 feet, under foundation stones
Contents: Ship logs, personal effects, encrypted journal
Status: ACTIVE EXCAVATION (cover story: "historical renovation")

SITE 3: UNKNOWN CARIBBEAN LOCATION
Referred to as "Devil's Triangle Cache"
Cipher incomplete. Remaining pages lost in 1942 U-boat attack
Estimated contents: Queen Anne's Revenge main cargo
Value: INCALCULABLE (includes "Aztec Gifts" mentioned in manifest)

NOTE: Any items recovered are property of the U.S. Government
under the Antiquities Act. Do not attempt independent recovery.
`,
        },
        'C:\\Shares\\Finance\\.offshore\\yamashita_locations.kml': {
            type: 'file',
            hidden: true,
            size: 2560,
            content: `<?xml version="1.0" encoding="UTF-8"?>
<!--
YAMASHITA'S GOLD - RECOVERY STATUS
==================================
Classification: ECONOMIC SECURITY

Total estimated value: $100-250 billion (1945 dollars)
Source: Looted Asian treasure consolidated by Imperial Japan

SITE ALPHA: Philippines, Luzon (PARTIALLY RECOVERED)
- Gold bars: 2,847 metric tons
- Recovery operations: 1975-1988
- Used to fund: [REDACTED]

SITE BRAVO: Philippines, Mindanao (ACTIVE)
- Estimated: 4,000 metric tons
- Booby traps: Yes (Japanese WW2 ordnance)
- Cover operation: "Mining Survey"

SITE CHARLIE: Indonesia, Java (UNRECOVERED)
- Local legend: "Golden Buddha" temple
- Status: Too politically sensitive to excavate
- Waiting for regime change

NOTE: Recovery proceeds fund special operations globally.
This is why we never run out of black budget money.
-->
`,
        },
    };

    // ═══════════════════════════════════════════════════════════════════════════
    // SIMULATED WINDOWS SERVICES
    // ═══════════════════════════════════════════════════════════════════════════
    //
    // Windows Services are background processes managed by the Service Control
    // Manager (SCM). This is what you see in services.msc.
    //
    // ┌─────────────────────────────────────────────────────────────────────────┐
    // │ INSIGHT: Windows Services                                               │
    // ├─────────────────────────────────────────────────────────────────────────┤
    // │ Services have states: Running, Stopped, Paused, Starting, Stopping      │
    // │ Services have startup types: Automatic, Manual, Disabled                │
    // │                                                                         │
    // │ Critical Windows Server services:                                       │
    // │ • NTDS (AD DS) - Only on Domain Controllers                             │
    // │ • DNS - Name resolution                                                 │
    // │ • DHCP - IP address assignment                                          │
    // │ • W32Time - Time synchronization (critical for Kerberos)                │
    // │                                                                         │
    // │ Key cmdlets: Get-Service, Start-Service, Stop-Service, Restart-Service  │
    // └─────────────────────────────────────────────────────────────────────────┘

    const BASE_SERVICES = {
        'NTDS': {
            Name: 'NTDS',
            DisplayName: 'Active Directory Domain Services',
            Status: 'Running',
            StartType: 'Automatic',
            Description: 'Provides Active Directory services including authentication and directory services.',
        },
        'DNS': {
            Name: 'DNS',
            DisplayName: 'DNS Server',
            Status: 'Running',
            StartType: 'Automatic',
            Description: 'Enables DNS clients to resolve DNS names.',
        },
        'DFSR': {
            Name: 'DFSR',
            DisplayName: 'DFS Replication',
            Status: 'Running',
            StartType: 'Automatic',
            Description: 'Replicates files across multiple servers.',
        },
        'Netlogon': {
            Name: 'Netlogon',
            DisplayName: 'Netlogon',
            Status: 'Running',
            StartType: 'Automatic',
            Description: 'Maintains secure channel between DC and domain members.',
        },
        'W32Time': {
            Name: 'W32Time',
            DisplayName: 'Windows Time',
            Status: 'Running',
            StartType: 'Automatic',
            Description: 'Maintains date and time synchronization.',
        },
        'WinRM': {
            Name: 'WinRM',
            DisplayName: 'Windows Remote Management (WS-Management)',
            Status: 'Running',
            StartType: 'Automatic',
            Description: 'Enables remote PowerShell and management.',
        },
        'LanmanServer': {
            Name: 'LanmanServer',
            DisplayName: 'Server',
            Status: 'Running',
            StartType: 'Automatic',
            Description: 'Supports file, print, and named-pipe sharing (SMB).',
        },
        'LanmanWorkstation': {
            Name: 'LanmanWorkstation',
            DisplayName: 'Workstation',
            Status: 'Running',
            StartType: 'Automatic',
            Description: 'Creates connections to remote SMB servers.',
        },
        'vmms': {
            Name: 'vmms',
            DisplayName: 'Hyper-V Virtual Machine Management',
            Status: 'Running',
            StartType: 'Automatic',
            Description: 'Provides Hyper-V management services.',
        },
        'ClusSvc': {
            Name: 'ClusSvc',
            DisplayName: 'Cluster Service',
            Status: 'Stopped',
            StartType: 'Manual',
            Description: 'Controls failover cluster operations.',
        },
        'Spooler': {
            Name: 'Spooler',
            DisplayName: 'Print Spooler',
            Status: 'Running',
            StartType: 'Automatic',
            Description: 'Manages print jobs.',
        },
        'wuauserv': {
            Name: 'wuauserv',
            DisplayName: 'Windows Update',
            Status: 'Running',
            StartType: 'Manual',
            Description: 'Enables detection, download, and installation of updates.',
        },
        'EventLog': {
            Name: 'EventLog',
            DisplayName: 'Windows Event Log',
            Status: 'Running',
            StartType: 'Automatic',
            Description: 'Manages events and event logs.',
        },
    };

    // ═══════════════════════════════════════════════════════════════════════════
    // BASE ACTIVE DIRECTORY OBJECTS
    // ═══════════════════════════════════════════════════════════════════════════
    //
    // ┌─────────────────────────────────────────────────────────────────────────┐
    // │ INSIGHT: AD Object Structure                                            │
    // ├─────────────────────────────────────────────────────────────────────────┤
    // │ Every AD object has a Distinguished Name (DN) that uniquely identifies  │
    // │ it in the directory:                                                    │
    // │                                                                         │
    // │ CN=John Smith,OU=Employees,DC=hexworth,DC=local                         │
    // │ ├── CN = Common Name (the object itself)                                │
    // │ ├── OU = Organizational Unit (container)                                │
    // │ └── DC = Domain Component (domain name split by dots)                   │
    // │                                                                         │
    // │ Read DN right-to-left: hexworth.local → Employees OU → John Smith       │
    // │                                                                         │
    // │ AZ-800 Relevance: AD DS is 30-35% of the exam - the largest domain!     │
    // └─────────────────────────────────────────────────────────────────────────┘

    const BASE_AD_USERS = {
        'Administrator': {
            SamAccountName: 'Administrator',
            Name: 'Administrator',
            GivenName: '',
            Surname: '',
            UserPrincipalName: 'Administrator@hexworth.local',
            DistinguishedName: 'CN=Administrator,CN=Users,DC=hexworth,DC=local',
            Enabled: true,
            LockedOut: false,
            PasswordExpired: false,
            PasswordLastSet: '2026-01-01T12:00:00',
            LastLogonDate: '2026-01-30T08:00:00',
            MemberOf: ['Domain Admins', 'Enterprise Admins', 'Schema Admins', 'Administrators'],
            Department: 'IT',
            Title: 'Domain Administrator',
            Description: 'Built-in account for administering the computer/domain',
        },
        'krbtgt': {
            SamAccountName: 'krbtgt',
            Name: 'krbtgt',
            UserPrincipalName: '',
            DistinguishedName: 'CN=krbtgt,CN=Users,DC=hexworth,DC=local',
            Enabled: false,
            Description: 'Key Distribution Center Service Account',
            MemberOf: ['Domain Users'],
        },
        'jsmith': {
            SamAccountName: 'jsmith',
            Name: 'John Smith',
            GivenName: 'John',
            Surname: 'Smith',
            UserPrincipalName: 'jsmith@hexworth.local',
            DistinguishedName: 'CN=John Smith,OU=Employees,OU=Users,DC=hexworth,DC=local',
            Enabled: true,
            LockedOut: false,
            Department: 'Engineering',
            Title: 'Senior Engineer',
            Office: 'Building A',
            EmailAddress: 'jsmith@hexworth.local',
            MemberOf: ['Domain Users', 'IT Staff'],
        },
        'agarcia': {
            SamAccountName: 'agarcia',
            Name: 'Ana Garcia',
            GivenName: 'Ana',
            Surname: 'Garcia',
            UserPrincipalName: 'agarcia@hexworth.local',
            DistinguishedName: 'CN=Ana Garcia,OU=Employees,OU=Users,DC=hexworth,DC=local',
            Enabled: true,
            LockedOut: false,
            Department: 'HR',
            Title: 'HR Manager',
            MemberOf: ['Domain Users', 'HR Team'],
        },
        'bwilson': {
            SamAccountName: 'bwilson',
            Name: 'Bob Wilson',
            GivenName: 'Bob',
            Surname: 'Wilson',
            UserPrincipalName: 'bwilson@hexworth.local',
            DistinguishedName: 'CN=Bob Wilson,OU=Employees,OU=Users,DC=hexworth,DC=local',
            Enabled: false,  // Disabled account for lab scenarios
            LockedOut: false,
            Department: 'Finance',
            Title: 'Accountant',
            Description: 'On extended leave',
            MemberOf: ['Domain Users'],
        },
        'jlocked': {
            SamAccountName: 'jlocked',
            Name: 'John Locked',
            GivenName: 'John',
            Surname: 'Locked',
            UserPrincipalName: 'jlocked@hexworth.local',
            DistinguishedName: 'CN=John Locked,OU=Employees,OU=Users,DC=hexworth,DC=local',
            Enabled: true,
            LockedOut: true,  // Locked account for lab scenarios
            Department: 'Sales',
            Title: 'Sales Rep',
            MemberOf: ['Domain Users'],
        },
    };

    /**
     * ┌─────────────────────────────────────────────────────────────────────────┐
     * │ INSIGHT: AD Group Types and Scopes                                      │
     * ├─────────────────────────────────────────────────────────────────────────┤
     * │ Group Types:                                                            │
     * │ • Security - Can be assigned permissions (most common)                  │
     * │ • Distribution - Email distribution only (Exchange/M365)                │
     * │                                                                         │
     * │ Group Scopes:                                                           │
     * │ • Domain Local - Permissions in THIS domain only                        │
     * │ • Global - Members from THIS domain, permissions anywhere               │
     * │ • Universal - Members from anywhere, permissions anywhere               │
     * │                                                                         │
     * │ AGDLP Strategy (Microsoft best practice):                               │
     * │ Accounts → Global groups → Domain Local groups → Permissions            │
     * │                                                                         │
     * │ Example: Put jsmith in "IT Staff" (Global), put "IT Staff" in           │
     * │ "Server Admins" (Domain Local), assign "Server Admins" permissions.     │
     * └─────────────────────────────────────────────────────────────────────────┘
     */
    const BASE_AD_GROUPS = {
        'Domain Admins': {
            Name: 'Domain Admins',
            SamAccountName: 'Domain Admins',
            DistinguishedName: 'CN=Domain Admins,CN=Users,DC=hexworth,DC=local',
            GroupScope: 'Global',
            GroupCategory: 'Security',
            Description: 'Designated administrators of the domain',
            Members: ['Administrator'],
        },
        'Domain Users': {
            Name: 'Domain Users',
            SamAccountName: 'Domain Users',
            DistinguishedName: 'CN=Domain Users,CN=Users,DC=hexworth,DC=local',
            GroupScope: 'Global',
            GroupCategory: 'Security',
            Description: 'All domain users',
            Members: ['Administrator', 'jsmith', 'agarcia', 'bwilson', 'jlocked'],
        },
        'Domain Computers': {
            Name: 'Domain Computers',
            SamAccountName: 'Domain Computers',
            DistinguishedName: 'CN=Domain Computers,CN=Users,DC=hexworth,DC=local',
            GroupScope: 'Global',
            GroupCategory: 'Security',
            Description: 'All domain-joined computers',
            Members: [],
        },
        'Enterprise Admins': {
            Name: 'Enterprise Admins',
            SamAccountName: 'Enterprise Admins',
            DistinguishedName: 'CN=Enterprise Admins,CN=Users,DC=hexworth,DC=local',
            GroupScope: 'Universal',
            GroupCategory: 'Security',
            Description: 'Enterprise administrators (forest-wide)',
            Members: ['Administrator'],
        },
        'IT Staff': {
            Name: 'IT Staff',
            SamAccountName: 'IT Staff',
            DistinguishedName: 'CN=IT Staff,OU=Groups,DC=hexworth,DC=local',
            GroupScope: 'Global',
            GroupCategory: 'Security',
            Description: 'IT department members',
            Members: ['jsmith'],
        },
        'HR Team': {
            Name: 'HR Team',
            SamAccountName: 'HR Team',
            DistinguishedName: 'CN=HR Team,OU=Groups,DC=hexworth,DC=local',
            GroupScope: 'Global',
            GroupCategory: 'Security',
            Description: 'Human Resources team',
            Members: ['agarcia'],
        },
    };

    const BASE_AD_COMPUTERS = {
        'DC01': {
            Name: 'DC01',
            DNSHostName: 'DC01.hexworth.local',
            DistinguishedName: 'CN=DC01,OU=Domain Controllers,DC=hexworth,DC=local',
            Enabled: true,
            OperatingSystem: 'Windows Server 2022 Datacenter',
            OperatingSystemVersion: '10.0 (20348)',
            IPv4Address: '192.168.1.10',
        },
        'FS01': {
            Name: 'FS01',
            DNSHostName: 'FS01.hexworth.local',
            DistinguishedName: 'CN=FS01,OU=Servers,DC=hexworth,DC=local',
            Enabled: true,
            OperatingSystem: 'Windows Server 2022 Standard',
            OperatingSystemVersion: '10.0 (20348)',
            IPv4Address: '192.168.1.20',
        },
        'WEB01': {
            Name: 'WEB01',
            DNSHostName: 'WEB01.hexworth.local',
            DistinguishedName: 'CN=WEB01,OU=Servers,DC=hexworth,DC=local',
            Enabled: true,
            OperatingSystem: 'Windows Server 2022 Standard',
            IPv4Address: '192.168.1.30',
        },
        'WKS-001': {
            Name: 'WKS-001',
            DNSHostName: 'WKS-001.hexworth.local',
            DistinguishedName: 'CN=WKS-001,OU=Workstations,DC=hexworth,DC=local',
            Enabled: true,
            OperatingSystem: 'Windows 11 Enterprise',
            IPv4Address: '192.168.1.100',
        },
    };

    const BASE_AD_OUS = {
        'Domain Controllers': {
            Name: 'Domain Controllers',
            DistinguishedName: 'OU=Domain Controllers,DC=hexworth,DC=local',
            Description: 'Default container for domain controllers',
        },
        'Servers': {
            Name: 'Servers',
            DistinguishedName: 'OU=Servers,DC=hexworth,DC=local',
            Description: 'Member servers',
        },
        'Workstations': {
            Name: 'Workstations',
            DistinguishedName: 'OU=Workstations,DC=hexworth,DC=local',
            Description: 'Client workstations',
        },
        'Users': {
            Name: 'Users',
            DistinguishedName: 'OU=Users,DC=hexworth,DC=local',
            Description: 'User accounts container',
        },
        'Employees': {
            Name: 'Employees',
            DistinguishedName: 'OU=Employees,OU=Users,DC=hexworth,DC=local',
            Description: 'Employee user accounts',
        },
        'Groups': {
            Name: 'Groups',
            DistinguishedName: 'OU=Groups,DC=hexworth,DC=local',
            Description: 'Security and distribution groups',
        },
    };

    // ═══════════════════════════════════════════════════════════════════════════
    // BASE STORAGE CONFIGURATION
    // ═══════════════════════════════════════════════════════════════════════════
    //
    // ┌─────────────────────────────────────────────────────────────────────────┐
    // │ INSIGHT: Windows Storage Architecture                                   │
    // ├─────────────────────────────────────────────────────────────────────────┤
    // │ Physical Disk → Partitions → Volumes → Filesystem                       │
    // │                                                                         │
    // │ • Disk: Physical hardware (SSD, HDD, SAN LUN)                           │
    // │ • Partition: Division of a disk (MBR or GPT)                            │
    // │ • Volume: Logical storage unit with a filesystem                        │
    // │ • Drive Letter: Mount point for a volume (C:, D:, etc.)                 │
    // │                                                                         │
    // │ Key concepts:                                                           │
    // │ • Basic Disks: Traditional partitioning (most common)                   │
    // │ • Dynamic Disks: Spanned, striped, mirrored volumes                     │
    // │ • Storage Spaces: Software-defined storage pools                        │
    // │                                                                         │
    // │ AZ-800 Relevance: Storage is 15-20% of the exam (Module 03).            │
    // └─────────────────────────────────────────────────────────────────────────┘

    const BASE_DISKS = {
        0: {
            Number: 0,
            FriendlyName: 'SAMSUNG MZVL2512',
            SerialNumber: 'S123456789',
            Size: 512110190592,  // 512 GB
            PartitionStyle: 'GPT',
            OperationalStatus: 'Online',
            HealthStatus: 'Healthy',
            BusType: 'NVMe',
            MediaType: 'SSD',
            IsSystem: true,
            IsBoot: true,
        },
        1: {
            Number: 1,
            FriendlyName: 'WDC WD10EZEX',
            SerialNumber: 'WD-1234567890',
            Size: 1000204886016,  // 1 TB
            PartitionStyle: 'GPT',
            OperationalStatus: 'Online',
            HealthStatus: 'Healthy',
            BusType: 'SATA',
            MediaType: 'HDD',
            IsSystem: false,
            IsBoot: false,
        },
        2: {
            Number: 2,
            FriendlyName: 'Seagate ST2000DM',
            SerialNumber: 'ZA123456',
            Size: 2000398934016,  // 2 TB
            PartitionStyle: 'RAW',  // Uninitialized for lab scenarios
            OperationalStatus: 'Offline',
            HealthStatus: 'Healthy',
            BusType: 'SATA',
            MediaType: 'HDD',
            IsSystem: false,
            IsBoot: false,
        },
    };

    const BASE_VOLUMES = {
        'C': {
            DriveLetter: 'C',
            FileSystemLabel: 'System',
            FileSystem: 'NTFS',
            Size: 511060213760,
            SizeRemaining: 412316860416,
            HealthStatus: 'Healthy',
            DriveType: 'Fixed',
        },
        'D': {
            DriveLetter: 'D',
            FileSystemLabel: 'Data',
            FileSystem: 'NTFS',
            Size: 999653638144,
            SizeRemaining: 856721817600,
            HealthStatus: 'Healthy',
            DriveType: 'Fixed',
        },
    };

    /**
     * ┌─────────────────────────────────────────────────────────────────────────┐
     * │ INSIGHT: SMB Shares and Permissions                                     │
     * ├─────────────────────────────────────────────────────────────────────────┤
     * │ SMB (Server Message Block) shares provide network file access.          │
     * │                                                                         │
     * │ Two permission layers:                                                  │
     * │ 1. Share Permissions - Who can connect over the network                 │
     * │ 2. NTFS Permissions - Who can access the files on disk                  │
     * │                                                                         │
     * │ Best practice: Set Share to "Everyone: Full Control" and control        │
     * │ access entirely via NTFS permissions. Simpler to manage.                │
     * │                                                                         │
     * │ Hidden shares end with $: Admin$, C$, IPC$ are automatic.               │
     * │ User-created hidden shares: \\server\Finance$ ($ at end)                │
     * └─────────────────────────────────────────────────────────────────────────┘
     */
    const BASE_SHARES = {
        'ADMIN$': {
            Name: 'ADMIN$',
            Path: 'C:\\Windows',
            Description: 'Remote Admin',
            ShareType: 'Special',
        },
        'C$': {
            Name: 'C$',
            Path: 'C:\\',
            Description: 'Default share',
            ShareType: 'Special',
        },
        'IPC$': {
            Name: 'IPC$',
            Path: '',
            Description: 'Remote IPC',
            ShareType: 'Special',
        },
        'NETLOGON': {
            Name: 'NETLOGON',
            Path: 'C:\\Windows\\SYSVOL\\sysvol\\hexworth.local\\SCRIPTS',
            Description: 'Logon server share',
            ShareType: 'Standard',
        },
        'SYSVOL': {
            Name: 'SYSVOL',
            Path: 'C:\\Windows\\SYSVOL\\sysvol',
            Description: 'Logon server share',
            ShareType: 'Standard',
        },
        'IT': {
            Name: 'IT',
            Path: 'C:\\Shares\\IT',
            Description: 'IT Department Share',
            ShareType: 'Standard',
        },
    };

    // ═══════════════════════════════════════════════════════════════════════════
    // BASE HYPER-V CONFIGURATION
    // ═══════════════════════════════════════════════════════════════════════════
    //
    // ┌─────────────────────────────────────────────────────────────────────────┐
    // │ INSIGHT: Hyper-V Virtualization                                         │
    // ├─────────────────────────────────────────────────────────────────────────┤
    // │ Hyper-V is Microsoft's Type 1 (bare-metal) hypervisor.                  │
    // │                                                                         │
    // │ Type 1 vs Type 2:                                                       │
    // │ • Type 1: Runs directly on hardware (Hyper-V, VMware ESXi)              │
    // │ • Type 2: Runs on top of OS (VirtualBox, VMware Workstation)            │
    // │                                                                         │
    // │ VM Generations:                                                         │
    // │ • Gen 1: Legacy BIOS, IDE boot, older OS support                        │
    // │ • Gen 2: UEFI, Secure Boot, faster, modern OS only                      │
    // │                                                                         │
    // │ Virtual Switch Types:                                                   │
    // │ • External: Bridge to physical network                                  │
    // │ • Internal: Host + VMs only (no physical network)                       │
    // │ • Private: VMs only (isolated)                                          │
    // │                                                                         │
    // │ AZ-800 Relevance: VMs/Containers are 15-20% of the exam (M04-M05).      │
    // └─────────────────────────────────────────────────────────────────────────┘

    const BASE_VMS = {
        'WEB01': {
            Name: 'WEB01',
            State: 'Running',
            CPUUsage: 5,
            MemoryAssigned: 2147483648,  // 2 GB
            MemoryDemand: 1073741824,
            MemoryStatus: 'OK',
            Uptime: '5.03:24:15',
            Status: 'Operating normally',
            Generation: 2,
            Version: '9.0',
            Path: 'D:\\VMs\\WEB01',
            CheckpointFileLocation: 'D:\\VMs\\WEB01',
            SmartPagingFilePath: 'D:\\VMs\\WEB01',
        },
        'SQL01': {
            Name: 'SQL01',
            State: 'Off',
            CPUUsage: 0,
            MemoryAssigned: 4294967296,  // 4 GB
            MemoryDemand: 0,
            MemoryStatus: 'OK',
            Uptime: '0.00:00:00',
            Status: 'Operating normally',
            Generation: 2,
            Version: '9.0',
            Path: 'D:\\VMs\\SQL01',
        },
    };

    const BASE_VM_SWITCHES = {
        'External Network': {
            Name: 'External Network',
            SwitchType: 'External',
            NetAdapterInterfaceDescription: 'Intel(R) Ethernet Controller',
            AllowManagementOS: true,
        },
        'Internal Network': {
            Name: 'Internal Network',
            SwitchType: 'Internal',
            AllowManagementOS: true,
        },
        'Private Network': {
            Name: 'Private Network',
            SwitchType: 'Private',
            AllowManagementOS: false,
        },
    };

    // ═══════════════════════════════════════════════════════════════════════════
    // INITIALIZATION
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Initialize the PSTerminal
     *
     * @param {string} moduleId - Module identifier (e.g., 'WSA-M02')
     * @param {string} containerSelector - CSS selector for container element
     * @param {Object} options - Optional configuration overrides
     */
    function init(moduleId, containerSelector, options = {}) {
        // Store configuration
        config.moduleId = moduleId;
        config.container = containerSelector;

        // Apply options
        if (options.user) config.user = options.user;
        if (options.hostname) config.hostname = options.hostname;
        if (options.domain) config.domain = options.domain;
        if (options.startDir) config.startDir = options.startDir;
        if (options.prompt) config.prompt = options.prompt;
        if (options.onCommand) config.onCommand = options.onCommand;
        if (options.onObjectiveComplete) config.onObjectiveComplete = options.onObjectiveComplete;

        // Update environment to match config
        state.env.COMPUTERNAME = config.hostname;
        state.env.USERNAME = config.user;
        state.env.USERDOMAIN = config.domain.split('.')[0].toUpperCase();
        state.env.USERPROFILE = `C:\\Users\\${config.user}`;
        state.env.HOMEPATH = `\\Users\\${config.user}`;

        // Initialize state
        state.currentDir = config.startDir;
        state.commandHistory = [];
        state.historyIndex = -1;
        state.isInitialized = true;

        // Record content start time for time-on-task analytics
        try {
            const startKey = 'hexworth_start_times';
            const starts = JSON.parse(localStorage.getItem(startKey) || '{}');
            const contentKey = moduleId.toLowerCase();
            if (!starts[contentKey]) {
                starts[contentKey] = Date.now();
                localStorage.setItem(startKey, JSON.stringify(starts));
            }
        } catch(e) { /* non-critical */ }

        // Load base data
        state.fs = JSON.parse(JSON.stringify(BASE_FILESYSTEM));
        state.services = JSON.parse(JSON.stringify(BASE_SERVICES));
        state.adUsers = JSON.parse(JSON.stringify(BASE_AD_USERS));
        state.adGroups = JSON.parse(JSON.stringify(BASE_AD_GROUPS));
        state.adComputers = JSON.parse(JSON.stringify(BASE_AD_COMPUTERS));
        state.adOUs = JSON.parse(JSON.stringify(BASE_AD_OUS));
        state.disks = JSON.parse(JSON.stringify(BASE_DISKS));
        state.volumes = JSON.parse(JSON.stringify(BASE_VOLUMES));
        state.shares = JSON.parse(JSON.stringify(BASE_SHARES));
        state.vms = JSON.parse(JSON.stringify(BASE_VMS));
        state.vmSwitches = JSON.parse(JSON.stringify(BASE_VM_SWITCHES));

        // Reset domain-specific state
        state.dnsZones = {};
        state.dnsForwarders = [];
        state.dhcpScopes = [];
        state.gpos = [];
        state.gpLinks = [];
        state.iisSites = [];
        state.iisAppPools = [];
        state.rdsCollections = [];
        state.rdsSessions = [];
        state.rdsLicensing = {};
        state.caTemplates = [];
        state.localCerts = [];
        state.adSites = [];
        state.adSubnets = [];
        state.adSiteLinks = [];
        state.backupPolicy = null;
        state.backupTarget = null;
        state.backups = [];
        state.firewallRules = [];
        state.firewallProfiles = {};

        // Apply module-specific overlays if available
        _applyModuleOverlay(moduleId);

        // Apply options-based overrides (takes precedence over MODULE_OVERLAYS)
        if (options.objectives) {
            state.objectives = options.objectives;
            state.objectivesCompleted = {};
        }
        if (options.initialState) {
            for (const [key, value] of Object.entries(options.initialState)) {
                if (state.hasOwnProperty(key)) {
                    if (Array.isArray(value)) {
                        state[key] = JSON.parse(JSON.stringify(value));
                    } else if (typeof value === 'object' && value !== null) {
                        Object.assign(state[key], JSON.parse(JSON.stringify(value)));
                    } else {
                        state[key] = value;
                    }
                }
            }
        }

        // Normalize AD state arrays: convert PascalCase keys to lowercase
        // (consumers may pass PowerShell-style PascalCase property names)
        ['adSites', 'adSubnets', 'adSiteLinks'].forEach(arrayKey => {
            if (Array.isArray(state[arrayKey])) {
                state[arrayKey] = state[arrayKey].map(obj => {
                    const normalized = {};
                    for (const [k, v] of Object.entries(obj)) {
                        const lowerKey = k.charAt(0).toLowerCase() + k.slice(1);
                        // Map known PascalCase aliases to internal property names
                        const keyMap = {
                            sitesIncluded: 'sites',
                            replicationFrequencyInMinutes: 'frequency',
                        };
                        const finalKey = keyMap[lowerKey] || lowerKey;
                        normalized[finalKey] = v;
                    }
                    return normalized;
                });
            }
        });

        // Initialize WSAState if available (for GUISimulator integration)
        _initWSAState();

        // Build UI
        _buildUI();

        // Focus input
        if (elements.input) {
            elements.input.focus();
        }

        // Print welcome message
        _printWelcome();

        return PSTerminal;
    }

    /**
     * Apply module-specific filesystem and state overlays
     */
    function _applyModuleOverlay(moduleId) {
        // Module overlays will be defined per-module
        // This allows each lab to have specific files, users, etc.

        const overlays = MODULE_OVERLAYS[moduleId];
        if (!overlays) return;

        // Merge filesystem
        if (overlays.fs) {
            Object.assign(state.fs, overlays.fs);
        }

        // Merge AD objects
        if (overlays.adUsers) {
            Object.assign(state.adUsers, overlays.adUsers);
        }
        if (overlays.adGroups) {
            Object.assign(state.adGroups, overlays.adGroups);
        }

        // Merge other state
        if (overlays.services) {
            Object.assign(state.services, overlays.services);
        }
        if (overlays.disks) {
            Object.assign(state.disks, overlays.disks);
        }
        if (overlays.shares) {
            Object.assign(state.shares, overlays.shares);
        }
        if (overlays.vms) {
            Object.assign(state.vms, overlays.vms);
        }

        // Set objectives
        if (overlays.objectives) {
            state.objectives = overlays.objectives;
            state.objectivesCompleted = {};
        }
    }

    /**
     * Module-specific overlays
     * Each module can add/override files, users, services, etc.
     */
    const MODULE_OVERLAYS = {
        'WSA-M02': {
            // Module 02: Active Directory
            // No additional overlays needed - base AD is sufficient
            objectives: [
                { id: 'get-users', desc: 'Query AD users with Get-ADUser' },
                { id: 'create-user', desc: 'Create a new user with New-ADUser' },
                { id: 'create-group', desc: 'Create a security group with New-ADGroup' },
                { id: 'add-member', desc: 'Add user to group with Add-ADGroupMember' },
            ],
        },
        'WSA-M03': {
            // Module 03: Storage & File Services
            // Add uninitialized disk for lab
            objectives: [
                { id: 'get-disk', desc: 'View disks with Get-Disk' },
                { id: 'init-disk', desc: 'Initialize disk with Initialize-Disk' },
                { id: 'new-partition', desc: 'Create partition with New-Partition' },
                { id: 'format-volume', desc: 'Format volume with Format-Volume' },
                { id: 'new-share', desc: 'Create SMB share with New-SmbShare' },
            ],
        },
        'WSA-M04': {
            // Module 04: Hyper-V
            objectives: [
                { id: 'get-vm', desc: 'List VMs with Get-VM' },
                { id: 'start-vm', desc: 'Start a VM with Start-VM' },
                { id: 'checkpoint', desc: 'Create checkpoint with Checkpoint-VM' },
            ],
        },
        'WSA-M08': {
            // Module 08: DNS
            objectives: [
                { id: 'get-dnsserverzone', desc: 'List DNS zones with Get-DnsServerZone' },
                { id: 'get-dnsserverresourcerecord', desc: 'View zone records with Get-DnsServerResourceRecord' },
                { id: 'add-dnsserverrecord', desc: 'Create A record with Add-DnsServerResourceRecordA' },
                { id: 'resolve-dnsname', desc: 'Test DNS with Resolve-DnsName' },
                { id: 'set-dnsserverforwarder', desc: 'Configure forwarder with Set-DnsServerForwarder' },
            ],
        },
        'WSA-M09': {
            // Module 09: DHCP
            objectives: [
                { id: 'get-dhcpserverv4scope', desc: 'View DHCP scopes' },
                { id: 'add-dhcpserverv4scope', desc: 'Create new DHCP scope' },
                { id: 'add-dhcpserverv4reservation', desc: 'Add DHCP reservation' },
                { id: 'get-dhcpserverv4lease', desc: 'View active leases' },
                { id: 'set-dhcpserverv4optionvalue', desc: 'Configure scope options' },
            ],
        },
        'WSA-M10': {
            // Module 10: Group Policy
            objectives: [
                { id: 'get-gpo', desc: 'List GPOs with Get-GPO -All' },
                { id: 'new-gpo', desc: 'Create GPO with New-GPO' },
                { id: 'new-gplink', desc: 'Link GPO with New-GPLink' },
                { id: 'get-gporeport', desc: 'Generate report with Get-GPOReport' },
                { id: 'backup-gpo', desc: 'Backup GPO with Backup-GPO' },
            ],
        },
        'WSA-M11': {
            // Module 11: IIS
            objectives: [
                { id: 'get-website', desc: 'List websites with Get-Website' },
                { id: 'new-website', desc: 'Create website with New-Website' },
                { id: 'new-webapppool', desc: 'Create app pool with New-WebAppPool' },
                { id: 'new-webbinding-https', desc: 'Add HTTPS binding with New-WebBinding' },
                { id: 'set-webconfigurationproperty', desc: 'Configure authentication' },
            ],
        },
        'WSA-M12': {
            // Module 12: Remote Desktop Services
            objectives: [
                { id: 'get-rdsessioncollection', desc: 'List session collections' },
                { id: 'new-rdsessioncollection', desc: 'Create session collection' },
                { id: 'new-rdremoteapp', desc: 'Publish RemoteApp' },
                { id: 'get-rdusersession', desc: 'View active sessions' },
                { id: 'set-rdlicenseconfiguration', desc: 'Configure RD licensing' },
            ],
        },
        'WSA-M13': {
            // Module 13: Certificate Services
            objectives: [
                { id: 'get-catemplate', desc: 'List CA templates' },
                { id: 'get-certificate', desc: 'Request certificate' },
                { id: 'get-childitem-cert', desc: 'View local certificates' },
                { id: 'publish-crl', desc: 'Publish CRL' },
                { id: 'backup-caroleservice', desc: 'Backup CA' },
            ],
        },
        'WSA-M14': {
            // Module 14: Advanced Networking
            objectives: [
                { id: 'get-netadapter', desc: 'List network adapters' },
                { id: 'new-netlbfoteam', desc: 'Create NIC team' },
                { id: 'new-netfirewallrule', desc: 'Add firewall rule' },
                { id: 'test-netconnection', desc: 'Test connectivity' },
                { id: 'new-netnat', desc: 'Create NAT configuration' },
            ],
        },
        'WSA-M15': {
            // Module 15: AD Sites & Replication
            objectives: [
                { id: 'get-adreplicationsite', desc: 'List AD sites' },
                { id: 'new-adreplicationsite', desc: 'Create AD site' },
                { id: 'new-adreplicationsubnet', desc: 'Add subnet' },
                { id: 'configure-sitelink', desc: 'Configure site link' },
                { id: 'check-replication', desc: 'Check replication status' },
            ],
        },
        'WSA-M16': {
            // Module 16: Backup & Recovery
            objectives: [
                { id: 'new-wbpolicy', desc: 'Create backup policy' },
                { id: 'add-wbbackuptarget', desc: 'Add backup target' },
                { id: 'start-wbbackup', desc: 'Execute backup' },
                { id: 'get-wbbackupset', desc: 'View backup history' },
                { id: 'vssadmin-list-writers', desc: 'List VSS writers' },
            ],
        },
        'WSA-M17': {
            // Module 17: Firewall & Security
            objectives: [
                { id: 'get-netfirewallprofile', desc: 'View firewall profiles' },
                { id: 'create-firewallrule', desc: 'Create firewall rule' },
                { id: 'get-netfirewallrule', desc: 'List firewall rules' },
                { id: 'configure-logging', desc: 'Configure firewall logging' },
                { id: 'test-netconnection', desc: 'Test connectivity' },
            ],
        },
    };

    // ═══════════════════════════════════════════════════════════════════════════
    // WSASTATE INTEGRATION
    // ═══════════════════════════════════════════════════════════════════════════
    //
    // ┌─────────────────────────────────────────────────────────────────────────┐
    // │ INSIGHT: Bidirectional State Sync                                       │
    // ├─────────────────────────────────────────────────────────────────────────┤
    // │ When WSAState is available, PSTerminal syncs its state bidirectionally: │
    // │                                                                         │
    // │ PSTerminal → WSAState: Dispatch actions when commands modify state      │
    // │ WSAState → PSTerminal: Subscribe to receive GUI-initiated changes       │
    // │                                                                         │
    // │ This mirrors real Windows Server behavior where GUI (ADUC) and          │
    // │ PowerShell affect the same underlying system.                           │
    // └─────────────────────────────────────────────────────────────────────────┘

    let wsaStateUnsubscribe = null;

    /**
     * Initialize WSAState integration if available
     */
    function _initWSAState() {
        if (typeof WSAState === 'undefined') {
            return; // WSAState not loaded, continue without sync
        }

        // Initialize WSAState with current PSTerminal state
        WSAState.init({
            adUsers: state.adUsers,
            adGroups: state.adGroups,
            adComputers: state.adComputers,
            adOUs: state.adOUs,
            disks: state.disks,
            volumes: state.volumes,
            shares: state.shares,
            vms: state.vms,
            vmSwitches: state.vmSwitches,
            services: state.services,
            moduleId: config.moduleId,
            domain: config.domain,
            hostname: config.hostname,
            objectives: state.objectives,
        });

        // Subscribe to state changes from GUI
        wsaStateUnsubscribe = WSAState.subscribe(_handleWSAStateChange);
    }

    /**
     * Handle state changes from WSAState (GUI-initiated changes)
     */
    function _handleWSAStateChange(newState, prevState, action) {
        // Skip if action came from terminal (prevent infinite loop)
        if (action.source === 'terminal') {
            return;
        }

        // Sync changed state slices from WSAState to PSTerminal
        // Only sync slices that are different to avoid unnecessary updates

        if (JSON.stringify(newState.adUsers) !== JSON.stringify(state.adUsers)) {
            state.adUsers = JSON.parse(JSON.stringify(newState.adUsers));
        }
        if (JSON.stringify(newState.adGroups) !== JSON.stringify(state.adGroups)) {
            state.adGroups = JSON.parse(JSON.stringify(newState.adGroups));
        }
        if (JSON.stringify(newState.adComputers) !== JSON.stringify(state.adComputers)) {
            state.adComputers = JSON.parse(JSON.stringify(newState.adComputers));
        }
        if (JSON.stringify(newState.adOUs) !== JSON.stringify(state.adOUs)) {
            state.adOUs = JSON.parse(JSON.stringify(newState.adOUs));
        }
        if (JSON.stringify(newState.disks) !== JSON.stringify(state.disks)) {
            state.disks = JSON.parse(JSON.stringify(newState.disks));
        }
        if (JSON.stringify(newState.volumes) !== JSON.stringify(state.volumes)) {
            state.volumes = JSON.parse(JSON.stringify(newState.volumes));
        }
        if (JSON.stringify(newState.shares) !== JSON.stringify(state.shares)) {
            state.shares = JSON.parse(JSON.stringify(newState.shares));
        }
        if (JSON.stringify(newState.vms) !== JSON.stringify(state.vms)) {
            state.vms = JSON.parse(JSON.stringify(newState.vms));
        }
        if (JSON.stringify(newState.vmSwitches) !== JSON.stringify(state.vmSwitches)) {
            state.vmSwitches = JSON.parse(JSON.stringify(newState.vmSwitches));
        }
        if (JSON.stringify(newState.services) !== JSON.stringify(state.services)) {
            state.services = JSON.parse(JSON.stringify(newState.services));
        }

        // Sync objectives completed from WSAState
        if (newState.objectivesCompleted) {
            for (const [id, completed] of Object.entries(newState.objectivesCompleted)) {
                if (completed && !state.objectivesCompleted[id]) {
                    state.objectivesCompleted[id] = true;
                }
            }
        }
    }

    /**
     * Dispatch action to WSAState (for terminal-initiated changes)
     */
    function _dispatchToWSAState(type, payload) {
        if (typeof WSAState !== 'undefined') {
            WSAState.dispatch({ type, payload, source: 'terminal' });
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // UI CONSTRUCTION
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Build the terminal UI
     */
    function _buildUI() {
        const container = document.querySelector(config.container);
        if (!container) {
            console.error(`PSTerminal: Container not found: ${config.container}`);
            return;
        }

        elements.container = container;

        // Build terminal HTML
        container.innerHTML = `
            <div class="ps-terminal">
                <div class="ps-terminal-header">
                    <div class="ps-terminal-title">
                        <span class="ps-terminal-icon"><img src="/assets/images/icons/icon-lightning.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle"></span>
                        Administrator: Windows PowerShell
                    </div>
                    <div class="ps-terminal-badges">
                        <span class="ps-badge">${config.hostname}</span>
                        <span class="ps-badge">${config.domain}</span>
                    </div>
                </div>
                <div class="ps-terminal-body">
                    <div class="ps-output" id="ps-output"></div>
                    <div class="ps-input-line">
                        <span class="ps-prompt" id="ps-prompt">${_getPrompt()}</span>
                        <input type="text"
                               class="ps-input"
                               id="ps-input"
                               autocomplete="off"
                               autocorrect="off"
                               autocapitalize="off"
                               spellcheck="false">
                    </div>
                </div>
            </div>
        `;

        // Store element references
        elements.output = container.querySelector('#ps-output');
        elements.input = container.querySelector('#ps-input');
        elements.promptSpan = container.querySelector('#ps-prompt');

        // Attach event listeners
        _attachEventListeners();

        // Add styles if not already present
        _injectStyles();
    }

    /**
     * Generate the PowerShell prompt
     *
     * ┌─────────────────────────────────────────────────────────────────────────┐
     * │ INSIGHT: PowerShell Prompt                                              │
     * ├─────────────────────────────────────────────────────────────────────────┤
     * │ The default PowerShell prompt shows the current path:                   │
     * │                                                                         │
     * │ PS C:\Users\Administrator>                                              │
     * │                                                                         │
     * │ The prompt function can be customized in your PowerShell profile:       │
     * │ function prompt { "PS $($PWD.Path)> " }                                 │
     * │                                                                         │
     * │ Some admins add computer name, time, or git branch to their prompt.     │
     * └─────────────────────────────────────────────────────────────────────────┘
     */
    function _getPrompt() {
        if (config.prompt) return config.prompt;
        return `PS ${state.currentDir}&gt; `;
    }

    /**
     * Print the welcome message
     */
    function _printWelcome() {
        const welcome = `Windows PowerShell
Copyright (C) Microsoft Corporation. All rights reserved.

Install the latest PowerShell for new features and improvements! https://aka.ms/PSWindows

Loading modules: ActiveDirectory, Storage, Hyper-V, FailoverClusters...
<span class="ps-success">Modules loaded successfully.</span>

Connected to: <span class="ps-highlight">${config.hostname}.${config.domain}</span>
Module: <span class="ps-highlight">${config.moduleId}</span>

Type <span class="ps-cmd">Get-Help</span> for available commands, or <span class="ps-cmd">help</span> for quick reference.
`;
        _printOutput(welcome);
    }

    /**
     * Inject terminal styles
     */
    function _injectStyles() {
        if (document.getElementById('ps-terminal-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'ps-terminal-styles';
        styles.textContent = `
            /* ═══════════════════════════════════════════════════════════════
               PSTerminal Styles - Windows PowerShell Theme
               ═══════════════════════════════════════════════════════════════ */

            .ps-terminal {
                background: #012456;
                border-radius: 8px;
                overflow: hidden;
                font-family: 'Cascadia Code', 'Consolas', 'Lucida Console', monospace;
                font-size: 14px;
                height: 100%;
                display: flex;
                flex-direction: column;
            }

            .ps-terminal-header {
                background: rgba(255, 255, 255, 0.1);
                padding: 8px 15px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }

            .ps-terminal-title {
                color: #fff;
                font-size: 13px;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .ps-terminal-icon {
                font-size: 16px;
            }

            .ps-terminal-badges {
                display: flex;
                gap: 8px;
            }

            .ps-badge {
                background: rgba(255, 255, 255, 0.15);
                padding: 3px 10px;
                border-radius: 4px;
                font-size: 11px;
                color: #ccc;
            }

            .ps-terminal-body {
                flex: 1;
                display: flex;
                flex-direction: column;
                padding: 15px;
                overflow: hidden;
            }

            .ps-output {
                flex: 1;
                overflow-y: auto;
                color: #eee;
                line-height: 1.5;
                white-space: pre-wrap;
                word-wrap: break-word;
            }

            .ps-output::-webkit-scrollbar {
                width: 8px;
            }

            .ps-output::-webkit-scrollbar-track {
                background: rgba(255, 255, 255, 0.05);
            }

            .ps-output::-webkit-scrollbar-thumb {
                background: rgba(255, 255, 255, 0.2);
                border-radius: 4px;
            }

            .ps-input-line {
                display: flex;
                align-items: center;
                padding-top: 5px;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
                margin-top: 10px;
            }

            .ps-prompt {
                color: #eee;
                margin-right: 0;
                flex-shrink: 0;
            }

            .ps-input {
                flex: 1;
                background: transparent;
                border: none;
                color: #fff;
                font-family: inherit;
                font-size: inherit;
                outline: none;
                caret-color: #fff;
            }

            /* Output formatting */
            .ps-cmd-line {
                color: #eee;
                margin-bottom: 2px;
            }

            .ps-cmd {
                color: #ffff00;
            }

            .ps-param {
                color: #87ceeb;
            }

            .ps-string {
                color: #ce9178;
            }

            .ps-number {
                color: #b5cea8;
            }

            .ps-success {
                color: #4ec9b0;
            }

            .ps-error {
                color: #f14c4c;
            }

            .ps-warning {
                color: #cca700;
            }

            .ps-highlight {
                color: #569cd6;
            }

            .ps-dim {
                color: #808080;
            }

            /* Table formatting */
            .ps-table {
                border-collapse: collapse;
                margin: 5px 0;
                font-size: 13px;
            }

            .ps-table th {
                color: #fff;
                text-align: left;
                padding: 2px 15px 2px 0;
                border-bottom: 1px solid #444;
            }

            .ps-table td {
                color: #ccc;
                padding: 2px 15px 2px 0;
            }

            .ps-table tr:nth-child(even) {
                background: rgba(255, 255, 255, 0.02);
            }
        `;
        document.head.appendChild(styles);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // EVENT HANDLING
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Attach keyboard and click event listeners
     */
    function _attachEventListeners() {
        // Input keydown handler
        elements.input.addEventListener('keydown', _handleKeyDown);

        // Click to focus
        elements.container.addEventListener('click', () => {
            elements.input.focus();
        });
    }

    /**
     * Handle keyboard input
     *
     * ┌─────────────────────────────────────────────────────────────────────────┐
     * │ INSIGHT: PowerShell Keyboard Shortcuts                                  │
     * ├─────────────────────────────────────────────────────────────────────────┤
     * │ • Tab         - Auto-complete command/path                              │
     * │ • Up/Down     - Navigate command history                                │
     * │ • Ctrl+C      - Cancel current command                                  │
     * │ • Ctrl+L      - Clear screen (same as Clear-Host)                       │
     * │ • Ctrl+R      - Search command history (reverse-i-search)               │
     * │ • Home/End    - Jump to start/end of line                               │
     * │ • Ctrl+A      - Select all                                              │
     * │                                                                         │
     * │ PSReadLine (included in PS 5.1+) adds even more shortcuts.              │
     * └─────────────────────────────────────────────────────────────────────────┘
     */
    function _handleKeyDown(e) {
        switch (e.key) {
            case 'Enter':
                e.preventDefault();
                _executeCommand();
                break;

            case 'Tab':
                e.preventDefault();
                _handleTabCompletion();
                break;

            case 'ArrowUp':
                e.preventDefault();
                _navigateHistory(-1);
                break;

            case 'ArrowDown':
                e.preventDefault();
                _navigateHistory(1);
                break;

            case 'c':
                if (e.ctrlKey) {
                    e.preventDefault();
                    _cancelCommand();
                }
                break;

            case 'l':
                if (e.ctrlKey) {
                    e.preventDefault();
                    _clearScreen();
                }
                break;
        }
    }

    /**
     * Navigate command history with arrow keys
     */
    function _navigateHistory(direction) {
        if (state.commandHistory.length === 0) return;

        state.historyIndex += direction;

        // Bounds checking
        if (state.historyIndex < 0) {
            state.historyIndex = 0;
        } else if (state.historyIndex >= state.commandHistory.length) {
            state.historyIndex = state.commandHistory.length;
            elements.input.value = '';
            return;
        }

        elements.input.value = state.commandHistory[state.historyIndex];
        // Move cursor to end
        setTimeout(() => {
            elements.input.selectionStart = elements.input.selectionEnd = elements.input.value.length;
        }, 0);
    }

    /**
     * Cancel current command (Ctrl+C)
     */
    function _cancelCommand() {
        _printOutput(`\n<span class="ps-warning">^C</span>`);
        elements.input.value = '';
        _updatePrompt();
    }

    /**
     * Clear screen (Ctrl+L)
     */
    function _clearScreen() {
        elements.output.innerHTML = '';
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // COMMAND EXECUTION
    // ═══════════════════════════════════════════════════════════════════════════
    //
    // ┌─────────────────────────────────────────────────────────────────────────┐
    // │ INSIGHT: PowerShell Command Structure                                   │
    // ├─────────────────────────────────────────────────────────────────────────┤
    // │ PowerShell uses Verb-Noun naming convention:                            │
    // │                                                                         │
    // │ Get-Service -Name "DNS" -ComputerName "DC01"                            │
    // │ │   │        │          │                                               │
    // │ │   │        │          └── Named parameter with value                  │
    // │ │   │        └── Named parameter with value                             │
    // │ │   └── Noun (what you're working with)                                 │
    // │ └── Verb (action: Get, Set, New, Remove, Start, Stop, etc.)             │
    // │                                                                         │
    // │ Common verbs: Get, Set, New, Remove, Start, Stop, Restart, Add,         │
    // │              Enable, Disable, Import, Export, Invoke, Test              │
    // │                                                                         │
    // │ This consistency makes PowerShell discoverable - if you know one        │
    // │ cmdlet, you can guess others (Get-Process → Stop-Process).              │
    // └─────────────────────────────────────────────────────────────────────────┘

    /**
     * Execute the current command
     */
    function _executeCommand() {
        const input = elements.input.value.trim();

        // Print command to output
        _printCommand(input);

        // Add to history (if not empty)
        if (input) {
            state.commandHistory.push(input);
            state.historyIndex = state.commandHistory.length;
        }

        // Clear input
        elements.input.value = '';

        // Parse and execute
        let result = null;
        let parsedCmd = { command: '', args: [], params: {} };

        if (input) {
            // ── M18 Script Block Objective Detection ──────────────────────────
            // These objectives require detecting script block patterns in raw
            // input rather than simple command names. Safe to call on any lab;
            // _checkObjective no-ops if the ID doesn't exist.

            // create-function: function FunctionName { ... }
            if (/^function\s+\w+/i.test(input)) {
                _checkObjective('create-function');
            }

            // param-validation: [Parameter()], [ValidateSet()], etc.
            if (/\[(Parameter|ValidateSet|ValidateRange|ValidatePattern|ValidateLength|ValidateScript|ValidateNotNull)\s*\(/i.test(input)) {
                _checkObjective('param-validation');
            }

            // advanced-function: [CmdletBinding()] attribute
            if (/\[CmdletBinding\s*\(/i.test(input)) {
                _checkObjective('advanced-function');
            }

            // try-catch: try { } catch { } block
            if (/\btry\b/i.test(input) && /\bcatch\b/i.test(input)) {
                _checkObjective('try-catch');
            }

            // error-action: -ErrorAction parameter OR $ErrorActionPreference assignment
            if (/-ErrorAction\b/i.test(input) || /\$ErrorActionPreference\s*=/i.test(input)) {
                _checkObjective('error-action');
            }
            // ── End M18 Script Block Detection ────────────────────────────────

            // ── Full-Input Objective Detection ───────────────────────────────
            // Some objectives need to see the full raw input because the
            // relevant keywords span pipe segments or live inside @{} blocks
            // that the param parser doesn't expose to rawArgs.
            // _checkObjective no-ops if the ID doesn't exist in the current lab.

            // get-service-stopped: Get-Service | Where-Object ... Stopped
            //   OR: Get-Service -Status Stopped (handled in handler too)
            if (/get-service\b.*stopped/i.test(input)) {
                _checkObjective('get-service-stopped');
            }

            // get-winevent-security: any Get-WinEvent mentioning Security log
            if (/get-winevent\b.*security/i.test(input)) {
                _checkObjective('get-winevent-security');
            }
            // ── End Full-Input Detection ─────────────────────────────────────

            // Parse the command for callback
            // For pipelines, parse just the first command so onCommand always gets a command name
            if (input.includes('|')) {
                parsedCmd = _parseCommand(input.split('|')[0].trim());
            } else {
                parsedCmd = _parseCommand(input);
            }

            result = _parseAndExecute(input);
            if (result) {
                _printOutput(result);
            }
        }

        // Call onCommand callback if registered (for lab integration)
        // 5th parameter is the raw input text (useful for pipe-aware validation)
        if (config.onCommand && input) {
            try {
                config.onCommand(parsedCmd.command, parsedCmd.args, parsedCmd.params, result, input);
            } catch (e) {
                console.error('PSTerminal onCommand callback error:', e);
            }
        }

        // Update prompt (in case directory changed)
        _updatePrompt();

        // Scroll to bottom
        elements.output.scrollTop = elements.output.scrollHeight;
    }

    /**
     * Parse command line and execute
     */
    function _parseAndExecute(cmdLine) {
        // Handle pipeline (simplified)
        if (cmdLine.includes('|')) {
            return _executePipeline(cmdLine);
        }

        // ── PowerShell Language Constructs ─────────────────────────────────
        // Handle keywords and variable assignments that are NOT cmdlets.
        // Without this, the tokenizer treats "function", "try", "$Var"
        // as command names and the dispatch falls through to "not recognized".

        // function <Name> { ... }
        const funcMatch = cmdLine.match(/^function\s+([A-Za-z][\w-]*)/i);
        if (funcMatch) {
            return `<span class="ps-dim">Function ${funcMatch[1]} defined.</span>`;
        }

        // try { ... } catch { ... } (with optional finally)
        if (/^\s*try\s*\{/i.test(cmdLine)) {
            if (/catch\s*\{/i.test(cmdLine)) {
                return `<span class="ps-dim">Try/Catch block executed.</span>`;
            }
            return `<span class="ps-dim">Try block executed.</span>`;
        }

        // Variable assignment: $Variable = value
        // If the RHS looks like a cmdlet (Verb-Noun pattern), execute it so
        // objectives like new-pssession still fire from "$session = New-PSSession ...".
        const varAssignMatch = cmdLine.match(/^\$([A-Za-z_][\w]*)\s*=\s*(.+)/);
        if (varAssignMatch) {
            if (!state.userVariables) state.userVariables = {};
            const rhs = varAssignMatch[2].trim();
            // Check if RHS is a cmdlet call (Verb-Noun pattern) or pipeline
            if (/^[A-Za-z][\w]*-[A-Za-z][\w]*/i.test(rhs) || rhs.includes('|')) {
                // Execute the RHS as a command (triggers objectives + handlers)
                const rhsResult = _parseAndExecute(rhs);
                state.userVariables[varAssignMatch[1]] = '[command output]';
                return '';  // Variable assignment is silent even when RHS is a command
            }
            state.userVariables[varAssignMatch[1]] = rhs.replace(/^["']|["']$/g, '');
            return '';  // PowerShell is silent on variable assignment
        }

        // Parse command and arguments
        const { command, args, params } = _parseCommand(cmdLine);

        // Find and execute command handler
        return _dispatchCommand(command.toLowerCase(), args, params, cmdLine);
    }

    /**
     * Parse a command line into command, positional args, and named parameters
     *
     * Example: Get-ADUser -Identity "jsmith" -Properties *
     * Returns: { command: "Get-ADUser", args: [], params: { Identity: "jsmith", Properties: "*" } }
     */
    function _parseCommand(cmdLine) {
        const tokens = _tokenize(cmdLine);

        if (tokens.length === 0) {
            return { command: '', args: [], params: {} };
        }

        const command = tokens[0];
        const args = [];
        const params = {};

        let i = 1;
        while (i < tokens.length) {
            const token = tokens[i];

            if (token.startsWith('-')) {
                // Named parameter — strip leading dashes and store under the LOWERCASED name.
                // PowerShell parameter names are case-insensitive; handlers read canonical
                // PascalCase (params.StartRange) and we resolve that case-insensitively when
                // params is returned (see the proxy below). Previously this upper-cased only
                // the first letter, so a multi-word parameter typed in lower case (e.g.
                // -startrange) was keyed as 'Startrange' != 'StartRange' and silently dropped.
                const paramName = token.replace(/^-+/, '').toLowerCase();

                // Check if next token is a value or another parameter
                if (i + 1 < tokens.length && !tokens[i + 1].startsWith('-')) {
                    params[paramName] = tokens[i + 1];
                    i += 2;
                } else {
                    // Switch parameter (boolean true)
                    params[paramName] = true;
                    i++;
                }
            } else {
                // Positional argument
                args.push(token);
                i++;
            }
        }

        // Case-insensitive view over params: handlers read canonical PascalCase
        // (params.StartRange, params.Identity, params.Force, ...) while params are stored
        // lowercased above. PowerShell parameter names are case-insensitive, so this lets a
        // student type -startrange, -StartRange, or -STARTRANGE and have the handler resolve
        // it identically. get/has cover direct access and the `in` operator; ownKeys/
        // getOwnPropertyDescriptor keep Object.keys()/spread working over the stored keys.
        const ciParams = new Proxy(params, {
            get(target, prop) {
                if (typeof prop === 'string' && !(prop in target)) {
                    const lp = prop.toLowerCase();
                    if (lp in target) return target[lp];
                }
                return target[prop];
            },
            has(target, prop) {
                if (typeof prop === 'string' && !(prop in target)) {
                    return prop.toLowerCase() in target;
                }
                return prop in target;
            }
        });

        return { command, args, params: ciParams };
    }

    /**
     * Tokenize command line (respecting quotes)
     */
    function _tokenize(cmdLine) {
        const tokens = [];
        let current = '';
        let inQuote = null;

        for (let i = 0; i < cmdLine.length; i++) {
            const char = cmdLine[i];

            if ((char === '"' || char === "'") && !inQuote) {
                inQuote = char;
            } else if (char === inQuote) {
                inQuote = null;
            } else if (char === ' ' && !inQuote) {
                if (current) {
                    tokens.push(current);
                    current = '';
                }
            } else {
                current += char;
            }
        }

        if (current) {
            tokens.push(current);
        }

        return tokens;
    }

    /**
     * Execute a pipeline of commands
     */
    function _executePipeline(cmdLine) {
        const commands = cmdLine.split('|').map(c => c.trim());
        let pipeInput = null;

        for (const cmd of commands) {
            const { command, args, params } = _parseCommand(cmd);
            pipeInput = _dispatchCommand(command.toLowerCase(), args, params, cmd, pipeInput);
        }

        return pipeInput;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // COMMAND DISPATCH
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Dispatch command to appropriate handler
     */
    function _dispatchCommand(command, args, params, cmdLine, pipeInput = null) {
        // Normalize command (lowercase for matching)
        const cmd = command.toLowerCase();

        // Command handlers will be added in subsequent tasks
        // For now, return placeholder
        switch (cmd) {
            // ─────────────────────────────────────────────────────────────────
            // Session / Utility Commands
            // ─────────────────────────────────────────────────────────────────
            case 'clear-host':
            case 'cls':
            case 'clear':
                _clearScreen();
                return '';

            case 'exit':
                return '<span class="ps-dim">Session ended. Refresh to restart.</span>';

            case 'help':
                return _cmdQuickHelp();

            case 'get-help':
                return _cmdGetHelp(args, params);

            case 'get-command':
                return _cmdGetCommand(args, params);

            // ─────────────────────────────────────────────────────────────────
            // Navigation Commands
            // ─────────────────────────────────────────────────────────────────
            case 'get-location':
            case 'gl':
            case 'pwd':
                return _cmdGetLocation();

            case 'set-location':
            case 'sl':
            case 'cd':
                return _cmdSetLocation(args, params);

            case 'get-childitem':
            case 'gci':
            case 'ls':
            case 'dir':
                return _cmdGetChildItem(args, params);

            case 'get-item':
            case 'gi':
                return _cmdGetItem(args, params);

            case 'get-content':
            case 'gc':
            case 'cat':
            case 'type':
                return _cmdGetContent(args, params);

            case 'test-path':
                return _cmdTestPath(args, params);

            case 'new-item':
            case 'ni':
            case 'mkdir':
                return _cmdNewItem(args, params);

            case 'remove-item':
            case 'ri':
            case 'rm':
            case 'del':
            case 'rmdir':
                return _cmdRemoveItem(args, params);

            case 'get-psdrive':
                return _cmdGetPSDrive(args, params);

            // ─────────────────────────────────────────────────────────────────
            // System Commands
            // ─────────────────────────────────────────────────────────────────
            case 'get-computerinfo':
                return _cmdGetComputerInfo();

            case 'get-date':
                return _cmdGetDate(params);

            case 'get-host':
                return _cmdGetHost();

            case 'hostname':
                return config.hostname || state.env.COMPUTERNAME || 'WIN-SRVR2022';

            case '$psversiontable':
                return _cmdPSVersionTable();

            case 'get-process':
            case 'gps':
            case 'ps':
                return _cmdGetProcess(args, params);

            case 'stop-process':
            case 'kill':
                return _cmdStopProcess(args, params);

            case 'get-service':
            case 'gsv':
                return _cmdGetService(args, params);

            case 'start-service':
            case 'sasv':
                return _cmdStartService(args, params);

            case 'stop-service':
            case 'spsv':
                return _cmdStopService(args, params);

            case 'restart-service':
                return _cmdRestartService(args, params);

            case 'get-eventlog':
                return _cmdGetEventLog(args, params);

            case 'get-windowsfeature':
                return _cmdGetWindowsFeature(args, params);

            case 'install-windowsfeature':
            case 'add-windowsfeature':
                return _cmdInstallWindowsFeature(args, params);

            case 'rename-computer':
                return _cmdRenameComputer(args, params);

            // ─────────────────────────────────────────────────────────────────
            // Active Directory Commands
            // ─────────────────────────────────────────────────────────────────
            case 'get-aduser':
                return _cmdGetADUser(args, params);

            case 'new-aduser':
                return _cmdNewADUser(args, params);

            case 'set-aduser':
                return _cmdSetADUser(args, params);

            case 'remove-aduser':
                return _cmdRemoveADUser(args, params);

            case 'unlock-adaccount':
                return _cmdUnlockADAccount(args, params);

            case 'get-adgroup':
                return _cmdGetADGroup(args, params);

            case 'new-adgroup':
                return _cmdNewADGroup(args, params);

            case 'get-adgroupmember':
                return _cmdGetADGroupMember(args, params);

            case 'add-adgroupmember':
                return _cmdAddADGroupMember(args, params);

            case 'remove-adgroupmember':
                return _cmdRemoveADGroupMember(args, params);

            case 'get-adcomputer':
                return _cmdGetADComputer(args, params);

            case 'get-adorganizationalunit':
            case 'get-adou':
                return _cmdGetADOrganizationalUnit(args, params);

            case 'search-adaccount':
                return _cmdSearchADAccount(args, params);

            case 'get-addomain':
                return _cmdGetADDomain();

            case 'get-addomaincontroller':
                return _cmdGetADDomainController(args, params);

            // ─────────────────────────────────────────────────────────────────
            // Storage Commands
            // ─────────────────────────────────────────────────────────────────
            case 'get-disk':
                return _cmdGetDisk(args, params);

            case 'initialize-disk':
                return _cmdInitializeDisk(args, params, pipeInput);

            case 'get-partition':
                return _cmdGetPartition(args, params);

            case 'new-partition':
                return _cmdNewPartition(args, params);

            case 'get-volume':
                return _cmdGetVolume(args, params);

            case 'format-volume':
                return _cmdFormatVolume(args, params);

            case 'get-smbshare':
                return _cmdGetSmbShare(args, params);

            case 'new-smbshare':
                return _cmdNewSmbShare(args, params);

            case 'remove-smbshare':
                return _cmdRemoveSmbShare(args, params);

            case 'get-smbsession':
                return _cmdGetSmbSession();

            // ─────────────────────────────────────────────────────────────────
            // Hyper-V Commands
            // ─────────────────────────────────────────────────────────────────
            case 'get-vm':
                return _cmdGetVM(args, params);

            case 'new-vm':
                return _cmdNewVM(args, params);

            case 'start-vm':
                return _cmdStartVM(args, params);

            case 'stop-vm':
                return _cmdStopVM(args, params);

            case 'restart-vm':
                return _cmdRestartVM(args, params);

            case 'remove-vm':
                return _cmdRemoveVM(args, params);

            case 'get-vmswitch':
                return _cmdGetVMSwitch(args, params);

            case 'new-vmswitch':
                return _cmdNewVMSwitch(args, params);

            case 'checkpoint-vm':
                return _cmdCheckpointVM(args, params);

            case 'get-vmcheckpoint':
            case 'get-vmsnapshot':
                return _cmdGetVMCheckpoint(args, params);

            case 'restore-vmcheckpoint':
            case 'restore-vmsnapshot':
                return _cmdRestoreVMCheckpoint(args, params);

            case 'get-vmhost':
                return _cmdGetVMHost();

            case 'measure-vm':
                return _cmdMeasureVM(args, params);

            case 'set-vm':
                return _cmdSetVM(args, params);

            case 'set-vmmemory':
                return _cmdSetVMMemory(args, params);

            case 'new-vhd':
                return _cmdNewVHD(args, params);

            case 'add-vmharddiskdrive':
                return _cmdAddVMHardDiskDrive(args, params);

            case 'set-vmnetworkadapter':
                return _cmdSetVMNetworkAdapter(args, params);

            case 'export-vm':
                return _cmdExportVM(args, params);

            // ─────────────────────────────────────────────────────────────────
            // Failover Cluster Commands
            // ─────────────────────────────────────────────────────────────────
            case 'get-cluster':
                return _cmdGetCluster(args, params);

            case 'get-clusternode':
                return _cmdGetClusterNode(args, params);

            case 'get-clustergroup':
                return _cmdGetClusterGroup(args, params);

            case 'move-clustergroup':
                return _cmdMoveClusterGroup(args, params);

            case 'start-clustergroup':
                return _cmdStartClusterGroup(args, params);

            case 'stop-clustergroup':
                return _cmdStopClusterGroup(args, params);

            case 'get-clusterquorum':
                return _cmdGetClusterQuorum();

            case 'get-clusterresource':
                return _cmdGetClusterResource(args, params);

            case 'test-cluster':
                return _cmdTestCluster(args, params);

            case 'new-cluster':
                return _cmdNewCluster(args, params);

            case 'add-clusternode':
                return _cmdAddClusterNode(args, params);

            case 'set-clusterquorum':
                return _cmdSetClusterQuorum(args, params);

            case 'get-clustersharedvolume':
                return _cmdGetClusterSharedVolume(args, params);

            case 'suspend-clusternode':
                return _cmdSuspendClusterNode(args, params);

            case 'resume-clusternode':
                return _cmdResumeClusterNode(args, params);

            // ─────────────────────────────────────────────────────────────────
            // Network Commands
            // ─────────────────────────────────────────────────────────────────
            case 'test-connection':
            case 'ping':
                return _cmdTestConnection(args, params);

            case 'test-netconnection':
                return _cmdTestNetConnection(args, params);

            case 'get-netadapter':
                return _cmdGetNetAdapter(args, params);

            case 'get-netipaddress':
                return _cmdGetNetIPAddress(args, params);

            case 'get-netipconfiguration':
                return _cmdGetNetIPConfiguration(args, params);

            case 'resolve-dnsname':
            case 'nslookup':
                return _cmdResolveDnsName(args, params);

            case 'new-netipaddress':
                return _cmdNewNetIPAddress(args, params);

            case 'set-netipaddress':
                return _cmdSetNetIPAddress(args, params);

            case 'set-dnsclientserveraddress':
                return _cmdSetDnsClientServerAddress(args, params);

            case 'get-nettcpconnection':
                return _cmdGetNetTCPConnection(args, params);

            // ─────────────────────────────────────────────────────────────────
            // Monitoring & Diagnostics Commands
            // ─────────────────────────────────────────────────────────────────
            case 'get-winevent':
                return _cmdGetWinEvent(args, params);

            case 'get-counter':
                return _cmdGetCounter(args, params);

            case 'get-wmiobject':
            case 'gwmi':
                return _cmdGetWmiObject(args, params);

            case 'start-transcript':
                return _cmdStartTranscript(args, params);

            case 'measure-command':
                return _cmdMeasureCommand(args, params);

            // ─────────────────────────────────────────────────────────────────
            // Automation & Remoting Commands
            // ─────────────────────────────────────────────────────────────────
            case 'export-csv':
                return _cmdExportCsv(args, params, pipeInput);

            case 'import-csv':
                return _cmdImportCsv(args, params);

            case 'register-scheduledtask':
                return _cmdRegisterScheduledTask(args, params);

            case 'get-scheduledtask':
                return _cmdGetScheduledTask(args, params);

            case 'invoke-command':
                return _cmdInvokeCommand(args, params);

            case 'new-pssession':
                return _cmdNewPSSession(args, params);

            case 'foreach-object':
            case '%':
                return _cmdForEachObject(args, params, pipeInput);

            // ─────────────────────────────────────────────────────────────────
            // System Diagnostic Utilities
            // ─────────────────────────────────────────────────────────────────
            case 'dcdiag':
                return _cmdDcdiag(args, params);

            case 'repadmin':
                return _cmdRepadmin(args, params);

            case 'sfc':
                return _cmdSfc(args, params);

            case 'dism':
                return _cmdDism(args, params);

            case 'export-windowsdriver':
                return _cmdExportWindowsDriver(args, params);

            case 'wbadmin':
                return _cmdWbadmin(args, params);

            // ─────────────────────────────────────────────────────────────────
            // DNS Server Commands
            // ─────────────────────────────────────────────────────────────────
            case 'get-dnsserverzone':
                return _cmdGetDnsServerZone(args, params);

            case 'get-dnsserverresourcerecord':
                return _cmdGetDnsServerResourceRecord(args, params);

            case 'add-dnsserverresourcerecorda':
                return _cmdAddDnsServerResourceRecordA(args, params);

            case 'set-dnsserverforwarder':
                return _cmdSetDnsServerForwarder(args, params);

            case 'get-dnsserverforwarder':
                return _cmdGetDnsServerForwarder(args, params);

            case 'clear-dnsservercache':
                return _cmdClearDnsServerCache(args, params);

            // ─────────────────────────────────────────────────────────────────
            // DHCP Server Commands
            // ─────────────────────────────────────────────────────────────────
            case 'get-dhcpserverv4scope':
                return _cmdGetDhcpServerv4Scope(args, params);

            case 'add-dhcpserverv4scope':
                return _cmdAddDhcpServerv4Scope(args, params);

            case 'get-dhcpserverv4lease':
                return _cmdGetDhcpServerv4Lease(args, params);

            case 'add-dhcpserverv4reservation':
                return _cmdAddDhcpServerv4Reservation(args, params);

            case 'get-dhcpserverv4reservation':
                return _cmdGetDhcpServerv4Reservation(args, params);

            case 'set-dhcpserverv4optionvalue':
                return _cmdSetDhcpServerv4OptionValue(args, params);

            case 'get-dhcpserverv4optionvalue':
                return _cmdGetDhcpServerv4OptionValue(args, params);

            case 'get-dhcpserverv4scopestatistics':
                return _cmdGetDhcpServerv4ScopeStatistics(args, params);

            // ─────────────────────────────────────────────────────────────────
            // Group Policy Commands
            // ─────────────────────────────────────────────────────────────────
            case 'get-gpo':
                return _cmdGetGPO(args, params);

            case 'new-gpo':
                return _cmdNewGPO(args, params);

            case 'new-gplink':
                return _cmdNewGPLink(args, params);

            case 'get-gporeport':
                return _cmdGetGPOReport(args, params);

            case 'backup-gpo':
                return _cmdBackupGPO(args, params);

            case 'gpupdate':
                return _cmdGpupdate(args, params);

            case 'gpresult':
                return _cmdGpresult(args, params);

            // ─────────────────────────────────────────────────────────────────
            // IIS / Web Server Commands
            // ─────────────────────────────────────────────────────────────────
            case 'get-website':
                return _cmdGetWebsite(args, params);

            case 'new-website':
                return _cmdNewWebsite(args, params);

            case 'get-webapppool':
                return _cmdGetWebAppPool(args, params);

            case 'new-webapppool':
                return _cmdNewWebAppPool(args, params);

            case 'get-webbinding':
                return _cmdGetWebBinding(args, params);

            case 'new-webbinding':
                return _cmdNewWebBinding(args, params);

            case 'set-webconfigurationproperty':
                return _cmdSetWebConfigurationProperty(args, params);

            case 'start-website':
                return _cmdStartWebsite(args, params);

            case 'stop-website':
                return _cmdStopWebsite(args, params);

            case 'remove-website':
                return _cmdRemoveWebsite(args, params);

            case 'import-module':
                return _cmdImportModule(args, params);

            // ─────────────────────────────────────────────────────────────────
            // Remote Desktop Services Commands
            // ─────────────────────────────────────────────────────────────────
            case 'get-rdsessioncollection':
                return _cmdGetRDSessionCollection(args, params);

            case 'new-rdsessioncollection':
                return _cmdNewRDSessionCollection(args, params);

            case 'get-rdremoteapp':
                return _cmdGetRDRemoteApp(args, params);

            case 'new-rdremoteapp':
                return _cmdNewRDRemoteApp(args, params);

            case 'get-rdusersession':
                return _cmdGetRDUserSession(args, params);

            case 'get-rdsessionhost':
                return _cmdGetRDSessionHost(args, params);

            case 'set-rdlicenseconfiguration':
                return _cmdSetRDLicenseConfiguration(args, params);

            case 'get-rdlicenseconfiguration':
                return _cmdGetRDLicenseConfiguration(args, params);

            case 'disconnect-rdusersession':
                return _cmdDisconnectRDUserSession(args, params);

            case 'invoke-rdusersessionlogoff':
                return _cmdInvokeRDUserSessionLogoff(args, params);

            // ─────────────────────────────────────────────────────────────────
            // Certificate Services Commands
            // ─────────────────────────────────────────────────────────────────
            case 'get-catemplate':
                return _cmdGetCATemplate(args, params);

            case 'get-certificate':
                return _cmdGetCertificate(args, params);

            case 'publish-crl':
                return _cmdPublishCRL(args, params);

            case 'backup-caroleservice':
                return _cmdBackupCARoleService(args, params);

            case 'certutil':
                return _cmdCertutil(args, params);

            // ─────────────────────────────────────────────────────────────────
            // AD Replication / Sites Commands
            // ─────────────────────────────────────────────────────────────────
            case 'get-adreplicationsite':
                return _cmdGetADReplicationSite(args, params);

            case 'new-adreplicationsite':
                return _cmdNewADReplicationSite(args, params);

            case 'get-adreplicationsubnet':
                return _cmdGetADReplicationSubnet(args, params);

            case 'new-adreplicationsubnet':
                return _cmdNewADReplicationSubnet(args, params);

            case 'get-adreplicationsitelink':
                return _cmdGetADReplicationSiteLink(args, params);

            case 'new-adreplicationsitelink':
                return _cmdNewADReplicationSiteLink(args, params);

            case 'set-adreplicationsitelink':
                return _cmdSetADReplicationSiteLink(args, params);

            case 'get-adreplicationfailure':
                return _cmdGetADReplicationFailure(args, params);

            // ─────────────────────────────────────────────────────────────────
            // Windows Backup Commands
            // ─────────────────────────────────────────────────────────────────
            case 'new-wbpolicy':
                return _cmdNewWBPolicy(args, params);

            case 'new-wbbackuptarget':
                return _cmdNewWBBackupTarget(args, params);

            case 'add-wbbackuptarget':
                return _cmdAddWBBackupTarget(args, params);

            case 'add-wbbaremetalrecovery':
                return _cmdAddWBBareMetalRecovery(args, params);

            case 'add-wbsystemstate':
                return _cmdAddWBSystemState(args, params);

            case 'start-wbbackup':
                return _cmdStartWBBackup(args, params);

            case 'get-wbbackupset':
                return _cmdGetWBBackupSet(args, params);

            case 'get-wbsummary':
                return _cmdGetWBSummary(args, params);

            case 'vssadmin':
                return _cmdVssadmin(args, params);

            // ─────────────────────────────────────────────────────────────────
            // Windows Firewall Commands
            // ─────────────────────────────────────────────────────────────────
            case 'get-netfirewallprofile':
                return _cmdGetNetFirewallProfile(args, params);

            case 'set-netfirewallprofile':
                return _cmdSetNetFirewallProfile(args, params);

            case 'new-netfirewallrule':
                return _cmdNewNetFirewallRule(args, params);

            case 'get-netfirewallrule':
                return _cmdGetNetFirewallRule(args, params);

            case 'enable-netfirewallrule':
                return _cmdEnableNetFirewallRule(args, params);

            case 'disable-netfirewallrule':
                return _cmdDisableNetFirewallRule(args, params);

            case 'remove-netfirewallrule':
                return _cmdRemoveNetFirewallRule(args, params);

            // ─────────────────────────────────────────────────────────────────
            // Advanced Networking Commands
            // ─────────────────────────────────────────────────────────────────
            case 'new-netlbfoteam':
                return _cmdNewNetLbfoTeam(args, params);

            case 'get-netlbfoteam':
                return _cmdGetNetLbfoTeam(args, params);

            case 'new-netnat':
                return _cmdNewNetNat(args, params);

            case 'get-netnat':
                return _cmdGetNetNat(args, params);

            case 'get-netroute':
                return _cmdGetNetRoute(args, params);

            // ─────────────────────────────────────────────────────────────────
            // Pipeline / Formatting Commands
            // ─────────────────────────────────────────────────────────────────
            case 'where-object':
            case 'where':
            case '?':
                return _cmdWhereObject(args, params, pipeInput);

            case 'select-object':
            case 'select':
                return _cmdSelectObject(args, params, pipeInput);

            case 'sort-object':
            case 'sort':
                return _cmdSortObject(args, params, pipeInput);

            case 'format-table':
            case 'ft':
                return _cmdFormatTable(args, params, pipeInput);

            case 'format-list':
            case 'fl':
                return _cmdFormatList(args, params, pipeInput);

            case 'measure-object':
            case 'measure':
                return _cmdMeasureObject(args, params, pipeInput);

            case 'out-null':
                return '';

            // ─────────────────────────────────────────────────────────────────
            // Docker Commands
            // ─────────────────────────────────────────────────────────────────
            case 'docker':
                return _cmdDocker(args);

            case 'docker-compose':
                return _cmdDockerCompose(args);

            // ─────────────────────────────────────────────────────────────────
            // Unrecognized Command
            // ─────────────────────────────────────────────────────────────────
            default:
                return `<span class="ps-error">${command} : The term '${command}' is not recognized as the name of a cmdlet, function, script file, or operable program.
Check the spelling of the name, or if a path was included, verify that the path is correct and try again.
At line:1 char:1
+ ${command}
+ ${'~'.repeat(command.length)}
    + CategoryInfo          : ObjectNotFound: (${command}:String) [], CommandNotFoundException
    + FullyQualifiedErrorId : CommandNotFoundException</span>

<span class="ps-dim">Tip: Type 'help' for available commands, or 'Get-Command *keyword*' to search.</span>`;
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // CORE COMMAND IMPLEMENTATIONS
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Get-Location (pwd) - Show current directory
     */
    function _cmdGetLocation() {
        return `
Path
----
${state.currentDir}`;
    }

    /**
     * Set-Location (cd) - Change directory
     */
    function _cmdSetLocation(args, params) {
        const target = params.Path || params.LiteralPath || args[0];

        if (!target) {
            // No argument - go to home
            state.currentDir = state.env.USERPROFILE;
            return '';
        }

        // Resolve path
        const resolved = _resolvePath(target);

        // Check if path exists
        if (!state.fs[resolved]) {
            return `<span class="ps-error">Set-Location : Cannot find path '${target}' because it does not exist.
At line:1 char:1
+ Set-Location ${target}
+ ${'~'.repeat(13 + target.length)}
    + CategoryInfo          : ObjectNotFound: (${target}:String) [], ItemNotFoundException
    + FullyQualifiedErrorId : PathNotFound</span>`;
        }

        // Check if it's a directory
        const item = state.fs[resolved];
        if (item.type !== 'dir' && item.type !== 'drive') {
            return `<span class="ps-error">Set-Location : Cannot process path '${target}' because it is not a container (directory).
    + CategoryInfo          : InvalidArgument: (${target}:String) [], PSInvalidOperationException</span>`;
        }

        state.currentDir = resolved;
        return '';
    }

    /**
     * Get-ChildItem (ls, dir) - List directory contents
     *
     * ┌─────────────────────────────────────────────────────────────────────────┐
     * │ INSIGHT: Get-ChildItem vs dir/ls                                        │
     * ├─────────────────────────────────────────────────────────────────────────┤
     * │ Get-ChildItem returns OBJECTS, not text. This is PowerShell's power:    │
     * │                                                                         │
     * │ Get-ChildItem | Where-Object { $_.Length -gt 1MB }                      │
     * │                                                                         │
     * │ Each file object has properties: Name, Length, LastWriteTime, etc.      │
     * │ You can filter, sort, and manipulate these objects in the pipeline.     │
     * │                                                                         │
     * │ Common parameters:                                                      │
     * │ -Recurse    Search subdirectories                                       │
     * │ -Filter     Filter by name pattern (faster than Where-Object)           │
     * │ -Force      Show hidden and system files                                │
     * └─────────────────────────────────────────────────────────────────────────┘
     */
    function _cmdGetChildItem(args, params) {
        const targetPath = params.Path || args[0] || state.currentDir;

        // Handle cert:\ paths for certificate store browsing
        if (targetPath.toLowerCase().startsWith('cert:')) {
            _checkObjective('get-childitem-cert');
            if (state.localCerts && state.localCerts.length > 0) {
                let output = `\n    Directory: ${targetPath}\n\nThumbprint                               Subject\n----------                               -------\n`;
                state.localCerts.forEach(c => {
                    output += `${(c.thumbprint || '').padEnd(41)}${c.subject || ''}\n`;
                });
                return output;
            }
            return `\n    Directory: ${targetPath}\n\n(empty)`;
        }

        const resolved = _resolvePath(targetPath);
        const showHidden = params.Force || params.Hidden;

        const item = state.fs[resolved];
        if (!item) {
            return `<span class="ps-error">Get-ChildItem : Cannot find path '${targetPath}' because it does not exist.</span>`;
        }

        if (item.type !== 'dir' && item.type !== 'drive') {
            // It's a file - just show it
            return _formatFileItem(resolved, item);
        }

        // Get children
        let children = item.children || [];
        if (children.length === 0) {
            return ''; // Empty directory
        }

        // Filter hidden files unless -Force or -Hidden specified
        if (!showHidden) {
            children = children.filter(childName => {
                const childPath = resolved === 'C:' || resolved === 'D:'
                    ? `${resolved}\\${childName}`
                    : `${resolved}\\${childName}`;
                const child = state.fs[childPath];
                return !(child && (child.hidden || child.system));
            });
        }

        if (children.length === 0) {
            return ''; // All files were hidden
        }

        // Build output
        let output = `\n    Directory: ${resolved}\n\n`;
        output += 'Mode                 LastWriteTime         Length Name\n';
        output += '----                 -------------         ------ ----\n';

        for (const childName of children.sort()) {
            const childPath = resolved === 'C:' || resolved === 'D:'
                ? `${resolved}\\${childName}`
                : `${resolved}\\${childName}`;
            const child = state.fs[childPath];

            if (child) {
                // Build mode string: d=directory, a=archive, r=readonly, h=hidden, s=system
                let mode = child.type === 'dir' ? 'd' : '-';
                mode += 'a'; // archive (always set for files)
                mode += child.readonly ? 'r' : '-';
                mode += child.hidden ? 'h' : '-';
                mode += child.system ? 's' : '-';
                const time = child.modified || '1/30/2026  10:00 AM';
                const size = child.size ? child.size.toString().padStart(14) : '              ';
                output += `${mode}          ${time} ${size} ${childName}\n`;
            } else {
                // Child referenced but not defined - show as file
                output += `-a---          1/30/2026  10:00 AM               ${childName}\n`;
            }
        }

        return output;
    }

    function _formatFileItem(path, item) {
        const name = path.split('\\').pop();
        const mode = item.type === 'dir' ? 'd----' : '-a---';
        const size = item.size || 0;
        return `
    Directory: ${path.substring(0, path.lastIndexOf('\\'))}

Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
${mode}          1/30/2026  10:00 AM ${size.toString().padStart(14)} ${name}`;
    }

    /**
     * Quick help command
     */
    function _cmdQuickHelp() {
        return `
<span class="ps-highlight">═══════════════════════════════════════════════════════════════════════════════</span>
<span class="ps-highlight">PSTerminal Quick Reference - Windows Server Administration</span>
<span class="ps-highlight">═══════════════════════════════════════════════════════════════════════════════</span>

<span class="ps-warning">Navigation:</span>
  Get-Location (pwd)              Show current directory
  Set-Location (cd) <path>        Change directory
  Get-ChildItem (ls, dir)         List directory contents

<span class="ps-warning">Help:</span>
  Get-Help <cmdlet>               Detailed help for a command
  Get-Command *keyword*           Find commands by name
  Get-Member                      Show object properties

<span class="ps-warning">System Info:</span>
  Get-ComputerInfo                Server details and OS info
  hostname                        Show computer name
  Rename-Computer -NewName        Rename the computer
  Get-Date                        Show current date/time
  Get-Host                        Show PowerShell host info

<span class="ps-warning">Server Roles:</span>
  Get-WindowsFeature              List roles and features
  Install-WindowsFeature -Name    Install a role or feature

<span class="ps-warning">Services:</span>
  Get-Service                     List Windows services
  Start-Service <name>            Start a service
  Stop-Service <name>             Stop a service
  Restart-Service <name>          Restart a service

<span class="ps-warning">Active Directory:</span>
  Get-ADUser -Filter *            List all AD users
  Get-ADUser -Identity <user>     Get specific user
  New-ADUser -Name <name>         Create new user
  Get-ADGroup                     List AD groups
  Add-ADGroupMember               Add user to group

<span class="ps-warning">Storage:</span>
  Get-Disk                        List physical disks
  Get-Volume                      List volumes
  Get-SmbShare                    List SMB shares
  New-SmbShare                    Create new share

<span class="ps-warning">Network:</span>
  Get-NetIPConfiguration          View IP config summary
  Get-NetAdapter                  List network adapters
  New-NetIPAddress                Set a static IP address
  Set-DnsClientServerAddress      Set DNS servers
  Test-Connection (ping)          Test network connectivity
  Resolve-DnsName (nslookup)      DNS lookup

<span class="ps-warning">Hyper-V:</span>
  Get-VM                          List virtual machines
  Start-VM / Stop-VM              Start/stop VMs
  Checkpoint-VM                   Create VM checkpoint

<span class="ps-dim">Tab = autocomplete | Up/Down = history | Ctrl+L = clear | Ctrl+C = cancel</span>
`;
    }

    /**
     * Get-Help - Detailed command help
     */
    function _cmdGetHelp(args, params) {
        const topic = params.Name || args[0];

        if (!topic) {
            return _cmdQuickHelp();
        }

        // Command-specific help will be added per command
        return `<span class="ps-dim">Get-Help: Help for '${topic}' not yet implemented.
Type 'help' for quick reference.</span>`;
    }

    /**
     * Get-Command - List available commands
     */
    function _cmdGetCommand(args, params) {
        const filter = params.Name || args[0] || '*';

        // List of implemented commands (will grow)
        const commands = [
            { Name: 'Clear-Host', Type: 'Cmdlet' },
            { Name: 'Get-ChildItem', Type: 'Cmdlet' },
            { Name: 'Get-Command', Type: 'Cmdlet' },
            { Name: 'Get-Help', Type: 'Cmdlet' },
            { Name: 'Get-Location', Type: 'Cmdlet' },
            { Name: 'Set-Location', Type: 'Cmdlet' },
        ];

        let output = '\nCommandType     Name                                               Version    Source\n';
        output += '-----------     ----                                               -------    ------\n';

        for (const cmd of commands) {
            if (filter === '*' || cmd.Name.toLowerCase().includes(filter.toLowerCase().replace('*', ''))) {
                output += `${cmd.Type.padEnd(16)}${cmd.Name.padEnd(50)} 1.0.0      PSTerminal\n`;
            }
        }

        return output;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // FILESYSTEM COMMANDS
    // ═══════════════════════════════════════════════════════════════════════════
    //
    // ┌─────────────────────────────────────────────────────────────────────────┐
    // │ INSIGHT: PowerShell Providers                                           │
    // ├─────────────────────────────────────────────────────────────────────────┤
    // │ PowerShell uses "providers" to access different data stores as if       │
    // │ they were filesystems. The same cmdlets work across all providers:      │
    // │                                                                         │
    // │ • FileSystem: C:\, D:\ - actual files                                   │
    // │ • Registry: HKLM:\, HKCU:\ - Windows registry                           │
    // │ • Certificate: Cert:\ - certificate store                               │
    // │ • Environment: Env:\ - environment variables                            │
    // │ • Variable: Variable:\ - PowerShell variables                           │
    // │ • Function: Function:\ - PowerShell functions                           │
    // │                                                                         │
    // │ Example: Get-ChildItem HKLM:\SOFTWARE works just like dir C:\           │
    // └─────────────────────────────────────────────────────────────────────────┘

    /**
     * Get-Item - Get a specific item
     */
    function _cmdGetItem(args, params) {
        const path = params.Path || params.LiteralPath || args[0];
        if (!path) {
            return `<span class="ps-error">Get-Item : Cannot bind argument to parameter 'Path' because it is null.</span>`;
        }

        const resolved = _resolvePath(path);
        const item = state.fs[resolved];

        if (!item) {
            return `<span class="ps-error">Get-Item : Cannot find path '${path}' because it does not exist.</span>`;
        }

        const name = resolved.split('\\').pop() || resolved;
        const mode = item.type === 'dir' || item.type === 'drive' ? 'd----' : '-a---';

        return `
    Directory: ${resolved.substring(0, resolved.lastIndexOf('\\')) || resolved}

Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
${mode}          1/30/2026  10:00 AM ${(item.size || '').toString().padStart(14)} ${name}`;
    }

    /**
     * Get-Content - Read file contents
     */
    function _cmdGetContent(args, params) {
        const path = params.Path || params.LiteralPath || args[0];
        if (!path) {
            return `<span class="ps-error">Get-Content : Cannot bind argument to parameter 'Path' because it is null.</span>`;
        }

        const resolved = _resolvePath(path);
        const item = state.fs[resolved];

        if (!item) {
            return `<span class="ps-error">Get-Content : Cannot find path '${path}' because it does not exist.</span>`;
        }

        if (item.type === 'dir' || item.type === 'drive') {
            return `<span class="ps-error">Get-Content : Access to the path '${path}' is denied (it's a directory).</span>`;
        }

        return item.content || `<span class="ps-dim">[Binary file or no content available]</span>`;
    }

    /**
     * Test-Path - Check if path exists
     */
    function _cmdTestPath(args, params) {
        const path = params.Path || params.LiteralPath || args[0];
        if (!path) {
            return `<span class="ps-error">Test-Path : Cannot bind argument to parameter 'Path' because it is null.</span>`;
        }

        const resolved = _resolvePath(path);
        return state.fs[resolved] ? 'True' : 'False';
    }

    /**
     * New-Item - Create new file or directory
     */
    function _cmdNewItem(args, params) {
        const path = params.Path || args[0];
        const itemType = params.ItemType || params.Type || 'File';
        const name = params.Name;

        if (!path && !name) {
            return `<span class="ps-error">New-Item : Cannot bind argument to parameter 'Path' because it is null.</span>`;
        }

        const targetPath = name ? `${state.currentDir}\\${name}` : path;
        const resolved = _resolvePath(targetPath);

        if (state.fs[resolved]) {
            return `<span class="ps-error">New-Item : The file '${targetPath}' already exists.</span>`;
        }

        // Create the item
        if (itemType.toLowerCase() === 'directory') {
            state.fs[resolved] = { type: 'dir', children: [] };
        } else {
            state.fs[resolved] = { type: 'file', size: 0, content: '' };
        }

        // Add to parent's children
        const parentPath = resolved.substring(0, resolved.lastIndexOf('\\'));
        if (state.fs[parentPath] && state.fs[parentPath].children) {
            const itemName = resolved.split('\\').pop();
            if (!state.fs[parentPath].children.includes(itemName)) {
                state.fs[parentPath].children.push(itemName);
            }
        }

        return `<span class="ps-success">
    Directory: ${parentPath}

Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
${itemType.toLowerCase() === 'directory' ? 'd----' : '-a---'}          ${new Date().toLocaleDateString()}  ${new Date().toLocaleTimeString()}              0 ${resolved.split('\\').pop()}</span>`;
    }

    /**
     * Remove-Item - Delete file or directory
     */
    function _cmdRemoveItem(args, params) {
        const path = params.Path || params.LiteralPath || args[0];
        if (!path) {
            return `<span class="ps-error">Remove-Item : Cannot bind argument to parameter 'Path' because it is null.</span>`;
        }

        const resolved = _resolvePath(path);
        const item = state.fs[resolved];

        if (!item) {
            return `<span class="ps-error">Remove-Item : Cannot find path '${path}' because it does not exist.</span>`;
        }

        if (item.system) {
            return `<span class="ps-error">Remove-Item : Access to the path '${path}' is denied (system file).</span>`;
        }

        // Remove from parent's children
        const parentPath = resolved.substring(0, resolved.lastIndexOf('\\'));
        if (state.fs[parentPath] && state.fs[parentPath].children) {
            const itemName = resolved.split('\\').pop();
            const idx = state.fs[parentPath].children.indexOf(itemName);
            if (idx > -1) {
                state.fs[parentPath].children.splice(idx, 1);
            }
        }

        delete state.fs[resolved];
        return '';
    }

    /**
     * Get-PSDrive - List PowerShell drives
     */
    function _cmdGetPSDrive(args, params) {
        const name = params.Name || args[0];

        const drives = [
            { Name: 'C',        Used: '42.17 GB', Free: '57.83 GB', Provider: 'FileSystem',   Root: 'C:\\',                              Description: 'OS' },
            { Name: 'D',        Used: '12.50 GB', Free: '87.50 GB', Provider: 'FileSystem',   Root: 'D:\\',                              Description: 'Data' },
            { Name: 'Env',      Used: '',          Free: '',          Provider: 'Environment',  Root: '',                                  Description: '' },
            { Name: 'Function', Used: '',          Free: '',          Provider: 'Function',     Root: '',                                  Description: '' },
            { Name: 'HKCU',     Used: '',          Free: '',          Provider: 'Registry',     Root: 'HKEY_CURRENT_USER',                 Description: '' },
            { Name: 'HKLM',     Used: '',          Free: '',          Provider: 'Registry',     Root: 'HKEY_LOCAL_MACHINE',                Description: '' },
            { Name: 'Variable', Used: '',          Free: '',          Provider: 'Variable',     Root: '',                                  Description: '' },
            { Name: 'WSMan',    Used: '',          Free: '',          Provider: 'WSMan',        Root: '',                                  Description: '' },
            { Name: 'Alias',    Used: '',          Free: '',          Provider: 'Alias',        Root: '',                                  Description: '' },
            { Name: 'Cert',     Used: '',          Free: '',          Provider: 'Certificate',  Root: '\\CurrentUser\\My',                 Description: '' },
        ];

        let filtered = drives;
        if (name) {
            filtered = drives.filter(d => d.Name.toLowerCase() === name.toLowerCase());
            if (filtered.length === 0) {
                return `<span class="ps-error">Get-PSDrive : Cannot find drive. A drive with the name '${name}' does not exist.</span>`;
            }
        }

        const header = `Name           Used (GB)     Free (GB) Provider      Root                                                                              CurrentLocation\n----           ---------     --------- --------      ----                                                                              ---------------`;
        const rows = filtered.map(d => {
            const n = d.Name.padEnd(15);
            const u = d.Used.padStart(9).padEnd(14);
            const f = d.Free.padStart(9).padEnd(10);
            const p = d.Provider.padEnd(14);
            const r = d.Root.padEnd(82);
            const loc = d.Name === 'C' ? state.currentDir.replace('C:\\', '') : '';
            return `${n}${u}${f}${p}${r}${loc}`;
        }).join('\n');

        return header + '\n' + rows;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // SYSTEM COMMANDS
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Get-ComputerInfo - Get computer system information
     */
    function _cmdGetComputerInfo() {
        return `
WindowsBuildLabEx                                       : 20348.1.amd64fre.fe_release.210507-1500
WindowsCurrentVersion                                   : 6.3
WindowsEditionId                                        : ServerDatacenter
WindowsInstallationType                                 : Server
WindowsProductName                                      : Windows Server 2022 Datacenter
WindowsRegisteredOrganization                           : ${config.domain}
WindowsRegisteredOwner                                  : Windows User
WindowsSystemRoot                                       : C:\\Windows
WindowsVersion                                          : 2009
BiosCharacteristics                                     : {7, 11, 12, 15...}
BiosBIOSVersion                                         : {VRTUAL - 1, VRTUAL - 1}
BiosCaption                                             : Hyper-V UEFI Release v4.1
BiosManufacturer                                        : Microsoft Corporation
CsCaption                                               : ${config.hostname}
CsDNSHostName                                           : ${config.hostname}
CsDomain                                                : ${config.domain}
CsDomainRole                                            : PrimaryDomainController
CsManufacturer                                          : Microsoft Corporation
CsModel                                                 : Virtual Machine
CsName                                                  : ${config.hostname}
CsNetworkAdapters                                       : {Ethernet}
CsNumberOfLogicalProcessors                             : 4
CsNumberOfProcessors                                    : 1
CsProcessors                                            : {Intel(R) Xeon(R) Platinum 8370C CPU @ 2.80GHz}
CsTotalPhysicalMemory                                   : 17179869184
OsName                                                  : Microsoft Windows Server 2022 Datacenter
OsType                                                  : WINNT
OsVersion                                               : 10.0.20348
OsBuildNumber                                           : 20348
OsHotFixes                                              : {KB5022842, KB5022505}
OsInstallDate                                           : 1/1/2026 12:00:00 AM
OsLastBootUpTime                                        : 1/25/2026 6:00:00 AM
OsUptime                                                : 5.04:30:00
TimeZone                                                : (UTC-05:00) Eastern Time (US & Canada)`;
    }

    /**
     * Get-Date - Get current date/time
     */
    function _cmdGetDate(params) {
        const now = new Date();
        if (params.Format) {
            return now.toLocaleString();
        }
        return `
${now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} ${now.toLocaleTimeString()}`;
    }

    /**
     * Get-Host - Get PowerShell host information
     */
    function _cmdPSVersionTable() {
        return `
Name                           Value
----                           -----
PSVersion                      5.1.20348.2849
PSEdition                      Desktop
PSCompatibleVersions           {1.0, 2.0, 3.0, 4.0...}
BuildVersion                   10.0.20348.2849
CLRVersion                     4.0.30319.42000
WSManStackVersion              3.0
PSRemotingProtocolVersion      2.3
SerializationVersion           1.1.0.1`;
    }

    function _cmdGetHost() {
        return `
Name             : ConsoleHost
Version          : 5.1.20348.1
InstanceId       : ${Math.random().toString(36).substr(2, 9)}
UI               : System.Management.Automation.Internal.Host.InternalHostUserInterface
CurrentCulture   : en-US
CurrentUICulture : en-US
PrivateData      : Microsoft.PowerShell.ConsoleHost+ConsoleColorProxy
DebuggerEnabled  : True
IsRunspacePushed : False
Runspace         : System.Management.Automation.Runspaces.LocalRunspace`;
    }

    /**
     * Get-Process - List running processes
     *
     * ┌─────────────────────────────────────────────────────────────────────────┐
     * │ INSIGHT: Process Management                                             │
     * ├─────────────────────────────────────────────────────────────────────────┤
     * │ Windows processes are identified by:                                    │
     * │ • PID (Process ID) - Unique number                                      │
     * │ • Name - Executable name without .exe                                   │
     * │                                                                         │
     * │ Key columns in Get-Process output:                                      │
     * │ • Handles - Open file/registry handles                                  │
     * │ • NPM(K) - Non-paged memory in KB                                       │
     * │ • PM(K) - Paged memory (physical) in KB                                 │
     * │ • WS(K) - Working set (physical RAM) in KB                              │
     * │ • CPU(s) - Total CPU time used                                          │
     * │                                                                         │
     * │ High memory or handle counts can indicate resource issues.              │
     * └─────────────────────────────────────────────────────────────────────────┘
     */
    function _cmdGetProcess(args, params) {
        const nameFilter = params.Name || args[0];

        const processes = [
            { Name: 'System', PID: 4, CPU: 0.5, Memory: 1024 },
            { Name: 'smss', PID: 316, CPU: 0.0, Memory: 512 },
            { Name: 'csrss', PID: 464, CPU: 0.2, Memory: 2048 },
            { Name: 'wininit', PID: 548, CPU: 0.0, Memory: 1024 },
            { Name: 'services', PID: 632, CPU: 0.1, Memory: 4096 },
            { Name: 'lsass', PID: 648, CPU: 1.2, Memory: 8192 },
            { Name: 'svchost', PID: 784, CPU: 0.5, Memory: 16384 },
            { Name: 'svchost', PID: 856, CPU: 0.3, Memory: 8192 },
            { Name: 'svchost', PID: 924, CPU: 2.1, Memory: 32768 },
            { Name: 'dns', PID: 1124, CPU: 0.4, Memory: 24576 },
            { Name: 'ntds', PID: 1248, CPU: 3.2, Memory: 131072 },
            { Name: 'dfsr', PID: 1356, CPU: 0.8, Memory: 65536 },
            { Name: 'vmms', PID: 1844, CPU: 1.5, Memory: 49152 },
            { Name: 'powershell', PID: 4328, CPU: 2.5, Memory: 98304 },
        ];

        let filtered = processes;
        if (nameFilter) {
            const pattern = nameFilter.toLowerCase().replace('*', '');
            filtered = processes.filter(p => p.Name.toLowerCase().includes(pattern));
        }

        let output = `
Handles  NPM(K)    PM(K)      WS(K)     CPU(s)     Id  SI ProcessName
-------  ------    -----      -----     ------     --  -- -----------
`;
        for (const p of filtered) {
            const handles = Math.floor(Math.random() * 500) + 100;
            const npm = Math.floor(Math.random() * 50) + 5;
            output += `${handles.toString().padStart(7)}  ${npm.toString().padStart(6)}    ${p.Memory.toString().padStart(5)}      ${p.Memory.toString().padStart(5)}     ${p.CPU.toFixed(2).padStart(6)}   ${p.PID.toString().padStart(4)}   0 ${p.Name}\n`;
        }

        _checkObjective('get-process');
        return output;
    }

    /**
     * Stop-Process - Stop a running process
     */
    function _cmdStopProcess(args, params) {
        const name = params.Name || args[0];
        const id = params.Id;

        if (!name && !id) {
            return `<span class="ps-error">Stop-Process : Cannot bind argument because it is null.</span>`;
        }

        if (name && ['system', 'csrss', 'smss', 'wininit', 'services', 'lsass'].includes(name.toLowerCase())) {
            return `<span class="ps-error">Stop-Process : Cannot stop process '${name}' - Access denied (critical system process).</span>`;
        }

        return `<span class="ps-success">Process '${name || `PID ${id}`}' stopped successfully.</span>`;
    }

    /**
     * Get-Service - List Windows services
     */
    function _cmdGetService(args, params) {
        const nameFilter = params.Name || params.DisplayName || args[0];

        let services = Object.values(state.services);
        if (nameFilter) {
            const pattern = nameFilter.toLowerCase().replace('*', '');
            services = services.filter(s =>
                s.Name.toLowerCase().includes(pattern) ||
                s.DisplayName.toLowerCase().includes(pattern)
            );
        }

        if (services.length === 0) {
            return `<span class="ps-error">Get-Service : Cannot find any service with name '${nameFilter}'.</span>`;
        }

        let output = `
Status   Name               DisplayName
------   ----               -----------
`;
        for (const svc of services) {
            output += `${svc.Status.padEnd(9)}${svc.Name.padEnd(19)}${svc.DisplayName}\n`;
        }

        const rawServiceArgs = args.join(' ').toLowerCase();
        if (params.Status && params.Status.toLowerCase() === 'stopped' || rawServiceArgs.includes('stopped')) {
            _checkObjective('get-service-stopped');
        }
        return output;
    }

    /**
     * Start-Service - Start a Windows service
     */
    function _cmdStartService(args, params) {
        const name = params.Name || params.InputObject || args[0];
        if (!name) {
            return `<span class="ps-error">Start-Service : Cannot bind argument to parameter 'Name'.</span>`;
        }

        const svc = state.services[name];
        if (!svc) {
            return `<span class="ps-error">Start-Service : Cannot find any service with name '${name}'.</span>`;
        }

        if (svc.Status === 'Running') {
            return `<span class="ps-warning">WARNING: Service '${name}' is already running.</span>`;
        }

        state.services[name].Status = 'Running';
        _checkObjective('start-service');

        return `<span class="ps-success">Service '${name}' started successfully.</span>`;
    }

    /**
     * Stop-Service - Stop a Windows service
     */
    function _cmdStopService(args, params) {
        const name = params.Name || params.InputObject || args[0];
        if (!name) {
            return `<span class="ps-error">Stop-Service : Cannot bind argument to parameter 'Name'.</span>`;
        }

        const svc = state.services[name];
        if (!svc) {
            return `<span class="ps-error">Stop-Service : Cannot find any service with name '${name}'.</span>`;
        }

        if (['NTDS', 'Netlogon', 'DNS'].includes(name) && !params.Force) {
            return `<span class="ps-error">Stop-Service : Cannot stop critical service '${name}' without -Force parameter.</span>`;
        }

        if (svc.Status === 'Stopped') {
            return `<span class="ps-warning">WARNING: Service '${name}' is already stopped.</span>`;
        }

        state.services[name].Status = 'Stopped';
        return `<span class="ps-success">Service '${name}' stopped successfully.</span>`;
    }

    /**
     * Restart-Service - Restart a Windows service
     */
    function _cmdRestartService(args, params) {
        const name = params.Name || params.InputObject || args[0];
        if (!name) {
            return `<span class="ps-error">Restart-Service : Cannot bind argument to parameter 'Name'.</span>`;
        }

        const svc = state.services[name];
        if (!svc) {
            return `<span class="ps-error">Restart-Service : Cannot find any service with name '${name}'.</span>`;
        }

        state.services[name].Status = 'Running';
        return `<span class="ps-success">Service '${name}' restarted successfully.</span>`;
    }

    /**
     * Get-EventLog - View Windows event logs
     */
    function _cmdGetEventLog(args, params) {
        const logName = params.LogName || args[0] || 'System';
        const newest = params.Newest || 5;

        const events = [
            { Index: 15432, Time: '1/30/2026 10:15:00', EntryType: 'Information', Source: 'Service Control Manager', Message: 'The DNS Server service entered the running state.' },
            { Index: 15431, Time: '1/30/2026 10:14:55', EntryType: 'Information', Source: 'NTDS', Message: 'Active Directory Domain Services startup complete.' },
            { Index: 15430, Time: '1/30/2026 10:14:30', EntryType: 'Warning', Source: 'DFSR', Message: 'DFS Replication service detected a configuration change.' },
            { Index: 15429, Time: '1/30/2026 10:14:00', EntryType: 'Information', Source: 'EventLog', Message: 'The Event log service was started.' },
            { Index: 15428, Time: '1/30/2026 10:13:45', EntryType: 'Information', Source: 'Kernel-General', Message: 'The operating system started.' },
        ];

        let output = `
   Index Time          EntryType   Source                    Message
   ----- ----          ---------   ------                    -------
`;
        for (let i = 0; i < Math.min(newest, events.length); i++) {
            const e = events[i];
            output += `   ${e.Index} ${e.Time} ${e.EntryType.padEnd(12)}${e.Source.padEnd(26)}${e.Message.substring(0, 40)}...\n`;
        }

        _checkObjective('get-eventlog');
        return output;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // SERVER MANAGER / ROLE COMMANDS
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Get-WindowsFeature - List Windows Server roles and features
     */
    function _cmdGetWindowsFeature(args, params) {
        const nameFilter = params.Name || args[0];

        const features = [
            { Name: 'AD-Domain-Services', DisplayName: 'Active Directory Domain Services', Installed: true, FeatureType: 'Role' },
            { Name: 'ADCS-Cert-Authority', DisplayName: 'Certification Authority', Installed: false, FeatureType: 'Role Service' },
            { Name: 'ADCS-Web-Enrollment', DisplayName: 'Certification Authority Web Enrollment', Installed: false, FeatureType: 'Role Service' },
            { Name: 'DHCP', DisplayName: 'DHCP Server', Installed: false, FeatureType: 'Role' },
            { Name: 'DNS', DisplayName: 'DNS Server', Installed: true, FeatureType: 'Role' },
            { Name: 'FS-FileServer', DisplayName: 'File Server', Installed: true, FeatureType: 'Role Service' },
            { Name: 'FS-DFS-Namespace', DisplayName: 'DFS Namespaces', Installed: false, FeatureType: 'Role Service' },
            { Name: 'FS-DFS-Replication', DisplayName: 'DFS Replication', Installed: true, FeatureType: 'Role Service' },
            { Name: 'Hyper-V', DisplayName: 'Hyper-V', Installed: true, FeatureType: 'Role' },
            { Name: 'NET-Framework-45-Core', DisplayName: '.NET Framework 4.8', Installed: true, FeatureType: 'Feature' },
            { Name: 'Print-Server', DisplayName: 'Print Server', Installed: false, FeatureType: 'Role Service' },
            { Name: 'RSAT-AD-PowerShell', DisplayName: 'Active Directory module for PowerShell', Installed: true, FeatureType: 'Feature' },
            { Name: 'RSAT-AD-Tools', DisplayName: 'AD DS and AD LDS Tools', Installed: true, FeatureType: 'Feature' },
            { Name: 'RSAT-DNS-Server', DisplayName: 'DNS Server Tools', Installed: true, FeatureType: 'Feature' },
            { Name: 'RSAT-DHCP', DisplayName: 'DHCP Server Tools', Installed: false, FeatureType: 'Feature' },
            { Name: 'Web-Server', DisplayName: 'Web Server (IIS)', Installed: false, FeatureType: 'Role' },
            { Name: 'WDS', DisplayName: 'Windows Deployment Services', Installed: false, FeatureType: 'Role' },
            { Name: 'Windows-Server-Backup', DisplayName: 'Windows Server Backup', Installed: false, FeatureType: 'Feature' },
            { Name: 'WSUS', DisplayName: 'Windows Server Update Services', Installed: false, FeatureType: 'Role' },
        ];

        let filtered = features;
        if (nameFilter) {
            const pattern = nameFilter.toLowerCase().replace(/\*/g, '');
            filtered = features.filter(f =>
                f.Name.toLowerCase().includes(pattern) ||
                f.DisplayName.toLowerCase().includes(pattern)
            );
        }

        let output = `\nDisplay Name                                            Name                       Install State\n------------                                            ----                       -------------\n`;
        for (const f of filtered) {
            const marker = f.Installed ? '[X]' : '[ ]';
            const installState = f.Installed ? 'Installed' : 'Available';
            output += `${marker} ${f.DisplayName.padEnd(52)}${f.Name.padEnd(27)}${installState}\n`;
        }

        _checkObjective('get-windowsfeature');
        return output;
    }

    /**
     * Install-WindowsFeature - Install a Windows Server role or feature
     */
    function _cmdInstallWindowsFeature(args, params) {
        const name = params.Name || args[0];

        if (!name) {
            return `<span class="ps-error">Install-WindowsFeature : The 'Name' parameter is required.</span>`;
        }

        const knownFeatures = {
            'dhcp': 'DHCP Server',
            'dns': 'DNS Server',
            'ad-domain-services': 'Active Directory Domain Services',
            'hyper-v': 'Hyper-V',
            'web-server': 'Web Server (IIS)',
            'rsat-ad-powershell': 'Active Directory module for PowerShell',
            'rsat-ad-tools': 'AD DS and AD LDS Tools',
            'rsat-dhcp': 'DHCP Server Tools',
            'windows-server-backup': 'Windows Server Backup',
            'fs-fileserver': 'File Server',
            'wds': 'Windows Deployment Services',
            'wsus': 'Windows Server Update Services',
            'print-server': 'Print Server',
            'failover-clustering': 'Failover Clustering',
            'migration': 'Windows Server Migration Tools',
        };

        const displayName = knownFeatures[name.toLowerCase()];
        if (!displayName) {
            return `<span class="ps-error">Install-WindowsFeature : The role, role service, or feature named '${name}' was not found.</span>`;
        }

        const nameLower = name.toLowerCase();
        if (nameLower === 'failover-clustering') {
            _checkObjective('install-clustering');
        }
        if (nameLower === 'migration') {
            _checkObjective('install-migration');
        }

        return `\nSuccess Restart Needed Exit Code      Feature Result\n------- -------------- ---------      --------------\nTrue    No             Success        {${displayName}}`;
    }

    /**
     * Rename-Computer - Rename the computer
     */
    function _cmdRenameComputer(args, params) {
        const newName = params.NewName || args[0];

        if (!newName) {
            return `<span class="ps-error">Rename-Computer : The 'NewName' parameter is required.</span>`;
        }

        if (newName.length > 15) {
            return `<span class="ps-error">Rename-Computer : The new computer name '${newName}' exceeds the maximum length of 15 characters.</span>`;
        }

        const oldName = config.hostname || state.env.COMPUTERNAME || 'WIN-SRVR2022';

        return `<span class="ps-warning">WARNING: The changes will take effect after you restart the computer ${oldName}.</span>`;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // ACTIVE DIRECTORY COMMANDS
    // ═══════════════════════════════════════════════════════════════════════════
    //
    // ┌─────────────────────────────────────────────────────────────────────────┐
    // │ INSIGHT: AD Cmdlet Patterns                                             │
    // ├─────────────────────────────────────────────────────────────────────────┤
    // │ AD cmdlets follow consistent patterns:                                  │
    // │                                                                         │
    // │ • -Identity: Specify object by name, DN, GUID, or SID                   │
    // │ • -Filter: PowerShell filter syntax {Property -eq "Value"}              │
    // │ • -SearchBase: DN of container to search                                │
    // │ • -Properties: Request additional attributes                            │
    // │                                                                         │
    // │ By default, only a subset of properties are returned.                   │
    // │ Use -Properties * to get all, or specify specific ones.                 │
    // │                                                                         │
    // │ Performance tip: -Filter is processed server-side (fast).               │
    // │ Where-Object is processed client-side (slow on large directories).      │
    // └─────────────────────────────────────────────────────────────────────────┘

    /**
     * Get-ADUser - Query AD user accounts
     */
    function _cmdGetADUser(args, params) {
        const identity = params.Identity || args[0];
        const filter = params.Filter;
        const properties = params.Properties;

        // Single user lookup
        if (identity) {
            const user = state.adUsers[identity] || Object.values(state.adUsers).find(u => u.SamAccountName.toLowerCase() === identity.toLowerCase());
            if (!user) {
                return `<span class="ps-error">Get-ADUser : Cannot find an object with identity: '${identity}'.</span>`;
            }

            _checkObjective('get-users');

            if (properties === '*') {
                // Return all properties
                let output = '\n';
                for (const [key, value] of Object.entries(user)) {
                    const val = Array.isArray(value) ? `{${value.join(', ')}}` : value;
                    output += `${key.padEnd(25)}: ${val}\n`;
                }
                return output;
            }

            return `
DistinguishedName : ${user.DistinguishedName}
Enabled           : ${user.Enabled}
GivenName         : ${user.GivenName || ''}
Name              : ${user.Name}
ObjectClass       : user
ObjectGUID        : ${Math.random().toString(36).substr(2, 9)}
SamAccountName    : ${user.SamAccountName}
SID               : S-1-5-21-${Math.floor(Math.random() * 1000000000)}
Surname           : ${user.Surname || ''}
UserPrincipalName : ${user.UserPrincipalName}`;
        }

        // Filter query
        if (filter === '*' || !filter) {
            _checkObjective('get-users');
            let output = '\n';
            for (const user of Object.values(state.adUsers)) {
                output += `DistinguishedName : ${user.DistinguishedName}
Enabled           : ${user.Enabled}
Name              : ${user.Name}
SamAccountName    : ${user.SamAccountName}
UserPrincipalName : ${user.UserPrincipalName}

`;
            }
            return output;
        }

        return `<span class="ps-dim">Get-ADUser requires -Identity or -Filter parameter.</span>`;
    }

    /**
     * New-ADUser - Create a new AD user
     */
    function _cmdNewADUser(args, params) {
        const name = params.Name || args[0];
        const samAccountName = params.SamAccountName || name?.toLowerCase().replace(' ', '');

        if (!name) {
            return `<span class="ps-error">New-ADUser : Cannot bind argument to parameter 'Name' because it is null.</span>`;
        }

        if (state.adUsers[samAccountName]) {
            return `<span class="ps-error">New-ADUser : The specified account already exists.</span>`;
        }

        // Create the user
        const newUser = {
            SamAccountName: samAccountName,
            Name: name,
            GivenName: params.GivenName || name.split(' ')[0] || '',
            Surname: params.Surname || name.split(' ')[1] || '',
            UserPrincipalName: `${samAccountName}@${config.domain}`,
            DistinguishedName: `CN=${name},OU=Employees,OU=Users,DC=hexworth,DC=local`,
            Enabled: params.Enabled === true || params.Enabled === '$true',
            LockedOut: false,
            Department: params.Department || '',
            Title: params.Title || '',
            MemberOf: ['Domain Users'],
        };

        state.adUsers[samAccountName] = newUser;

        // Dispatch to WSAState for GUI sync
        _dispatchToWSAState('AD_CREATE_USER', newUser);

        _checkObjective('create-user');

        return `<span class="ps-success">User '${name}' (${samAccountName}) created successfully.</span>`;
    }

    /**
     * Set-ADUser - Modify AD user attributes
     */
    function _cmdSetADUser(args, params) {
        const identity = params.Identity || args[0];
        if (!identity) {
            return `<span class="ps-error">Set-ADUser : Cannot bind argument to parameter 'Identity'.</span>`;
        }

        const user = state.adUsers[identity] || Object.values(state.adUsers).find(u => u.SamAccountName.toLowerCase() === identity.toLowerCase());
        if (!user) {
            return `<span class="ps-error">Set-ADUser : Cannot find an object with identity: '${identity}'.</span>`;
        }

        // Update properties
        if (params.Department) user.Department = params.Department;
        if (params.Title) user.Title = params.Title;
        if (params.Office) user.Office = params.Office;
        if (params.EmailAddress) user.EmailAddress = params.EmailAddress;
        if (params.Description) user.Description = params.Description;
        if (params.Manager) user.Manager = params.Manager;
        if (params.Enabled !== undefined) user.Enabled = params.Enabled === true || params.Enabled === '$true';

        return `<span class="ps-success">User '${identity}' updated successfully.</span>`;
    }

    /**
     * Remove-ADUser - Delete AD user
     */
    function _cmdRemoveADUser(args, params) {
        const identity = params.Identity || args[0];
        if (!identity) {
            return `<span class="ps-error">Remove-ADUser : Cannot bind argument to parameter 'Identity'.</span>`;
        }

        const resolvedKey = state.adUsers[identity] ? identity : Object.keys(state.adUsers).find(k => k.toLowerCase() === identity.toLowerCase());
        if (!resolvedKey) {
            return `<span class="ps-error">Remove-ADUser : Cannot find an object with identity: '${identity}'.</span>`;
        }

        if (['Administrator', 'krbtgt'].includes(resolvedKey)) {
            return `<span class="ps-error">Remove-ADUser : Cannot remove built-in account '${resolvedKey}'.</span>`;
        }

        delete state.adUsers[resolvedKey];

        // Dispatch to WSAState for GUI sync
        _dispatchToWSAState('AD_DELETE_USER', identity);

        return `<span class="ps-success">User '${identity}' removed successfully.</span>`;
    }

    /**
     * Unlock-ADAccount - Unlock a locked AD account
     */
    function _cmdUnlockADAccount(args, params) {
        const identity = params.Identity || args[0];
        if (!identity) {
            return `<span class="ps-error">Unlock-ADAccount : Cannot bind argument to parameter 'Identity'.</span>`;
        }

        const resolvedKey = state.adUsers[identity] ? identity : Object.keys(state.adUsers).find(k => k.toLowerCase() === identity.toLowerCase());
        const user = resolvedKey ? state.adUsers[resolvedKey] : null;
        if (!user) {
            return `<span class="ps-error">Unlock-ADAccount : Cannot find an object with identity: '${identity}'.</span>`;
        }

        if (!user.LockedOut) {
            return `<span class="ps-warning">WARNING: Account '${identity}' is not locked.</span>`;
        }

        state.adUsers[resolvedKey].LockedOut = false;

        // Dispatch to WSAState for GUI sync
        _dispatchToWSAState('AD_UNLOCK_USER', identity);

        _checkObjective('unlock-account');

        return `<span class="ps-success">Account '${identity}' unlocked successfully.</span>`;
    }

    /**
     * Get-ADGroup - Query AD groups
     */
    function _cmdGetADGroup(args, params) {
        const identity = params.Identity || args[0];
        const filter = params.Filter;

        if (identity) {
            const group = state.adGroups[identity] || Object.values(state.adGroups).find(g => g.Name.toLowerCase() === identity.toLowerCase());
            if (!group) {
                return `<span class="ps-error">Get-ADGroup : Cannot find an object with identity: '${identity}'.</span>`;
            }

            return `
DistinguishedName : ${group.DistinguishedName}
GroupCategory     : ${group.GroupCategory}
GroupScope        : ${group.GroupScope}
Name              : ${group.Name}
ObjectClass       : group
SamAccountName    : ${group.SamAccountName}`;
        }

        if (filter === '*' || !filter) {
            let output = '\n';
            for (const group of Object.values(state.adGroups)) {
                output += `DistinguishedName : ${group.DistinguishedName}
GroupScope        : ${group.GroupScope}
Name              : ${group.Name}
SamAccountName    : ${group.SamAccountName}

`;
            }
            return output;
        }

        return `<span class="ps-dim">Get-ADGroup requires -Identity or -Filter parameter.</span>`;
    }

    /**
     * New-ADGroup - Create new AD group
     */
    function _cmdNewADGroup(args, params) {
        const name = params.Name || args[0];
        if (!name) {
            return `<span class="ps-error">New-ADGroup : Cannot bind argument to parameter 'Name'.</span>`;
        }

        const existingKey = state.adGroups[name] ? name : Object.keys(state.adGroups).find(k => k.toLowerCase() === name.toLowerCase());
        if (existingKey) {
            return `<span class="ps-error">New-ADGroup : The specified group already exists.</span>`;
        }

        const groupScope = params.GroupScope || 'Global';
        const groupCategory = params.GroupCategory || 'Security';

        const newGroup = {
            Name: name,
            SamAccountName: name,
            DistinguishedName: `CN=${name},OU=Groups,DC=hexworth,DC=local`,
            GroupScope: groupScope,
            GroupCategory: groupCategory,
            Description: params.Description || '',
            Members: [],
        };

        state.adGroups[name] = newGroup;

        // Dispatch to WSAState for GUI sync
        _dispatchToWSAState('AD_CREATE_GROUP', newGroup);

        _checkObjective('create-group');

        return `<span class="ps-success">Group '${name}' created successfully (${groupScope}, ${groupCategory}).</span>`;
    }

    /**
     * Get-ADGroupMember - List members of a group
     */
    function _cmdGetADGroupMember(args, params) {
        const identity = params.Identity || args[0];
        if (!identity) {
            return `<span class="ps-error">Get-ADGroupMember : Cannot bind argument to parameter 'Identity'.</span>`;
        }

        const group = state.adGroups[identity] || Object.values(state.adGroups).find(g => g.Name.toLowerCase() === identity.toLowerCase());
        if (!group) {
            return `<span class="ps-error">Get-ADGroupMember : Cannot find an object with identity: '${identity}'.</span>`;
        }

        if (group.Members.length === 0) {
            return `<span class="ps-dim">Group '${identity}' has no members.</span>`;
        }

        let output = '\n';
        for (const memberName of group.Members) {
            const user = state.adUsers[memberName] || Object.values(state.adUsers).find(u => u.SamAccountName.toLowerCase() === memberName.toLowerCase());
            if (user) {
                output += `distinguishedName : ${user.DistinguishedName}
name              : ${user.Name}
objectClass       : user
SamAccountName    : ${user.SamAccountName}

`;
            }
        }

        return output;
    }

    /**
     * Add-ADGroupMember - Add member to group
     */
    function _cmdAddADGroupMember(args, params) {
        const identity = params.Identity || args[0];
        const members = params.Members || args[1];

        if (!identity || !members) {
            return `<span class="ps-error">Add-ADGroupMember : Cannot bind argument to required parameters.</span>`;
        }

        const group = state.adGroups[identity] || Object.values(state.adGroups).find(g => g.Name.toLowerCase() === identity.toLowerCase());
        if (!group) {
            return `<span class="ps-error">Add-ADGroupMember : Cannot find an object with identity: '${identity}'.</span>`;
        }

        const memberList = Array.isArray(members) ? members : [members];
        for (const member of memberList) {
            const resolvedUserKey = state.adUsers[member] ? member : Object.keys(state.adUsers).find(k => k.toLowerCase() === member.toLowerCase());
            if (!resolvedUserKey) {
                return `<span class="ps-error">Add-ADGroupMember : Cannot find user '${member}'.</span>`;
            }
            if (!group.Members.includes(resolvedUserKey)) {
                group.Members.push(resolvedUserKey);
            }
        }

        // Dispatch to WSAState for GUI sync
        _dispatchToWSAState('AD_ADD_MEMBER', { GroupName: identity, Members: memberList });

        _checkObjective('add-member');

        return `<span class="ps-success">Member(s) added to group '${identity}'.</span>`;
    }

    /**
     * Remove-ADGroupMember - Remove member from group
     */
    function _cmdRemoveADGroupMember(args, params) {
        const identity = params.Identity || args[0];
        const members = params.Members || args[1];

        if (!identity || !members) {
            return `<span class="ps-error">Remove-ADGroupMember : Cannot bind argument to required parameters.</span>`;
        }

        const group = state.adGroups[identity] || Object.values(state.adGroups).find(g => g.Name.toLowerCase() === identity.toLowerCase());
        if (!group) {
            return `<span class="ps-error">Remove-ADGroupMember : Cannot find an object with identity: '${identity}'.</span>`;
        }

        const memberList = Array.isArray(members) ? members : [members];
        for (const member of memberList) {
            const idx = group.Members.findIndex(m => m.toLowerCase() === member.toLowerCase());
            if (idx > -1) {
                group.Members.splice(idx, 1);
            }
        }

        return `<span class="ps-success">Member(s) removed from group '${identity}'.</span>`;
    }

    /**
     * Get-ADComputer - Query AD computer accounts
     */
    function _cmdGetADComputer(args, params) {
        const identity = params.Identity || args[0];
        const filter = params.Filter;

        if (identity) {
            const computer = state.adComputers[identity] || Object.values(state.adComputers).find(c => c.Name.toLowerCase() === identity.toLowerCase());
            if (!computer) {
                return `<span class="ps-error">Get-ADComputer : Cannot find an object with identity: '${identity}'.</span>`;
            }

            return `
DistinguishedName : ${computer.DistinguishedName}
DNSHostName       : ${computer.DNSHostName}
Enabled           : ${computer.Enabled}
Name              : ${computer.Name}
ObjectClass       : computer
OperatingSystem   : ${computer.OperatingSystem}`;
        }

        if (filter === '*' || !filter) {
            let output = '\n';
            for (const computer of Object.values(state.adComputers)) {
                output += `DistinguishedName : ${computer.DistinguishedName}
DNSHostName       : ${computer.DNSHostName}
Enabled           : ${computer.Enabled}
Name              : ${computer.Name}

`;
            }
            return output;
        }

        return `<span class="ps-dim">Get-ADComputer requires -Identity or -Filter parameter.</span>`;
    }

    /**
     * Get-ADOrganizationalUnit - Query OUs
     */
    function _cmdGetADOrganizationalUnit(args, params) {
        const filter = params.Filter;

        let output = '\n';
        for (const ou of Object.values(state.adOUs)) {
            output += `DistinguishedName : ${ou.DistinguishedName}
Name              : ${ou.Name}

`;
        }
        return output;
    }

    /**
     * Search-ADAccount - Search for accounts by state
     */
    function _cmdSearchADAccount(args, params) {
        let results = [];

        if (params.LockedOut) {
            results = Object.values(state.adUsers).filter(u => u.LockedOut);
        } else if (params.AccountDisabled) {
            results = Object.values(state.adUsers).filter(u => !u.Enabled);
        } else if (params.PasswordExpired) {
            results = Object.values(state.adUsers).filter(u => u.PasswordExpired);
        } else {
            return `<span class="ps-dim">Search-ADAccount requires a search parameter: -LockedOut, -AccountDisabled, or -PasswordExpired</span>`;
        }

        if (results.length === 0) {
            return `<span class="ps-dim">No matching accounts found.</span>`;
        }

        let output = '\n';
        for (const user of results) {
            output += `DistinguishedName : ${user.DistinguishedName}
Enabled           : ${user.Enabled}
LockedOut         : ${user.LockedOut}
Name              : ${user.Name}
SamAccountName    : ${user.SamAccountName}

`;
        }
        return output;
    }

    /**
     * Get-ADDomain - Get domain information
     */
    function _cmdGetADDomain() {
        return `
AllowedDNSSuffixes                 : {}
ComputersContainer                 : CN=Computers,DC=hexworth,DC=local
DeletedObjectsContainer            : CN=Deleted Objects,DC=hexworth,DC=local
DistinguishedName                  : DC=hexworth,DC=local
DNSRoot                            : hexworth.local
DomainControllersContainer         : OU=Domain Controllers,DC=hexworth,DC=local
DomainMode                         : Windows2016Domain
DomainSID                          : S-1-5-21-${Math.floor(Math.random() * 1000000000)}
Forest                             : hexworth.local
InfrastructureMaster               : DC01.hexworth.local
Name                               : hexworth
NetBIOSName                        : HEXWORTH
PDCEmulator                        : DC01.hexworth.local
RIDMaster                          : DC01.hexworth.local
UsersContainer                     : CN=Users,DC=hexworth,DC=local`;
    }

    /**
     * Get-ADDomainController - Get DC information
     */
    function _cmdGetADDomainController(args, params) {
        return `
ComputerObjectDN           : CN=DC01,OU=Domain Controllers,DC=hexworth,DC=local
DefaultPartition           : DC=hexworth,DC=local
Domain                     : hexworth.local
Enabled                    : True
Forest                     : hexworth.local
HostName                   : DC01.hexworth.local
InvocationId               : ${Math.random().toString(36).substr(2, 9)}
IPv4Address                : 192.168.1.10
IsGlobalCatalog            : True
IsReadOnly                 : False
Name                       : DC01
OperatingSystem            : Windows Server 2022 Datacenter
OperationMasterRoles       : {SchemaMaster, DomainNamingMaster, PDCEmulator, RIDMaster, InfrastructureMaster}
Site                       : Default-First-Site-Name`;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // STORAGE COMMANDS
    // ═══════════════════════════════════════════════════════════════════════════
    //
    // ┌─────────────────────────────────────────────────────────────────────────┐
    // │ INSIGHT: Storage Cmdlet Workflow                                        │
    // ├─────────────────────────────────────────────────────────────────────────┤
    // │ Typical workflow for setting up a new disk:                             │
    // │                                                                         │
    // │ 1. Get-Disk - See available disks                                       │
    // │ 2. Initialize-Disk -Number 2 -PartitionStyle GPT                        │
    // │ 3. New-Partition -DiskNumber 2 -UseMaximumSize -AssignDriveLetter       │
    // │ 4. Format-Volume -DriveLetter E -FileSystem NTFS -NewFileSystemLabel X  │
    // │ 5. New-SmbShare -Name "Data" -Path "E:\Data" -FullAccess "Everyone"     │
    // │                                                                         │
    // │ Or use pipeline:                                                        │
    // │ Get-Disk 2 | Initialize-Disk -PartitionStyle GPT -PassThru |            │
    // │   New-Partition -UseMaximumSize -AssignDriveLetter |                    │
    // │   Format-Volume -FileSystem NTFS -NewFileSystemLabel "Data"             │
    // └─────────────────────────────────────────────────────────────────────────┘

    /**
     * Get-Disk - List physical disks
     */
    function _cmdGetDisk(args, params) {
        const number = params.Number ?? args[0];

        if (number !== undefined) {
            const disk = state.disks[number];
            if (!disk) {
                return `<span class="ps-error">Get-Disk : No disk found with number ${number}.</span>`;
            }

            _checkObjective('get-disk');

            return `
Number         : ${disk.Number}
FriendlyName   : ${disk.FriendlyName}
SerialNumber   : ${disk.SerialNumber}
HealthStatus   : ${disk.HealthStatus}
OperationalStatus : ${disk.OperationalStatus}
Size           : ${_formatBytes(disk.Size)}
PartitionStyle : ${disk.PartitionStyle}
IsSystem       : ${disk.IsSystem}
IsBoot         : ${disk.IsBoot}`;
        }

        _checkObjective('get-disk');

        let output = `
Number Friendly Name              Serial Number        HealthStatus OperationalStatus Total Size Partition Style
------ -------------              -------------        ------------ ----------------- ---------- ---------------
`;
        for (const disk of Object.values(state.disks)) {
            output += `${disk.Number.toString().padStart(6)} ${disk.FriendlyName.padEnd(27)}${disk.SerialNumber.padEnd(21)}${disk.HealthStatus.padEnd(13)}${disk.OperationalStatus.padEnd(18)}${_formatBytes(disk.Size).padEnd(11)}${disk.PartitionStyle}\n`;
        }

        return output;
    }

    /**
     * Initialize-Disk - Initialize a new disk
     */
    function _cmdInitializeDisk(args, params, pipeInput) {
        // Accept disk number from -Number param, positional arg, or pipeline input
        let number = params.Number ?? args[0];
        if (number === undefined && pipeInput) {
            // Extract disk number from piped Get-Disk output
            const match = pipeInput.match(/^(\d+)\s/m);
            if (match) number = match[1];
        }
        const partitionStyle = params.PartitionStyle || 'GPT';

        if (number === undefined) {
            return `<span class="ps-error">Initialize-Disk : Cannot bind argument to parameter 'Number'.</span>`;
        }

        const disk = state.disks[number];
        if (!disk) {
            return `<span class="ps-error">Initialize-Disk : No disk found with number ${number}.</span>`;
        }

        if (disk.PartitionStyle !== 'RAW') {
            return `<span class="ps-error">Initialize-Disk : Disk ${number} is already initialized.</span>`;
        }

        state.disks[number].PartitionStyle = partitionStyle;
        state.disks[number].OperationalStatus = 'Online';
        _checkObjective('init-disk');

        return `<span class="ps-success">Disk ${number} initialized with ${partitionStyle} partition style.</span>`;
    }

    /**
     * Get-Partition - List partitions
     */
    function _cmdGetPartition(args, params) {
        const diskNumber = params.DiskNumber ?? args[0];

        // Simulated partitions
        const partitions = [
            { DiskNumber: 0, PartitionNumber: 1, DriveLetter: '', Size: 524288000, Type: 'System' },
            { DiskNumber: 0, PartitionNumber: 2, DriveLetter: '', Size: 134217728, Type: 'Reserved' },
            { DiskNumber: 0, PartitionNumber: 3, DriveLetter: 'C', Size: 511060213760, Type: 'Basic' },
            { DiskNumber: 1, PartitionNumber: 1, DriveLetter: 'D', Size: 999653638144, Type: 'Basic' },
        ];

        let filtered = partitions;
        if (diskNumber !== undefined) {
            filtered = partitions.filter(p => p.DiskNumber === parseInt(diskNumber));
        }

        let output = `
   DiskNumber PartitionNumber DriveLetter Size         Type
   ---------- --------------- ----------- ----         ----
`;
        for (const p of filtered) {
            output += `   ${p.DiskNumber.toString().padEnd(11)}${p.PartitionNumber.toString().padEnd(16)}${(p.DriveLetter || '').padEnd(12)}${_formatBytes(p.Size).padEnd(13)}${p.Type}\n`;
        }

        return output;
    }

    /**
     * New-Partition - Create a new partition
     */
    function _cmdNewPartition(args, params) {
        const diskNumber = params.DiskNumber ?? args[0];
        const useMax = params.UseMaximumSize;
        const driveLetter = params.DriveLetter || params.AssignDriveLetter;

        if (diskNumber === undefined) {
            return `<span class="ps-error">New-Partition : Cannot bind argument to parameter 'DiskNumber'.</span>`;
        }

        const disk = state.disks[diskNumber];
        if (!disk) {
            return `<span class="ps-error">New-Partition : Disk ${diskNumber} not found.</span>`;
        }

        if (disk.PartitionStyle === 'RAW') {
            return `<span class="ps-error">New-Partition : Disk ${diskNumber} is not initialized. Use Initialize-Disk first.</span>`;
        }

        // Assign a drive letter
        const assignedLetter = typeof driveLetter === 'string' ? driveLetter : 'E';

        // Create volume
        state.volumes[assignedLetter] = {
            DriveLetter: assignedLetter,
            FileSystemLabel: '',
            FileSystem: '',
            Size: disk.Size,
            SizeRemaining: disk.Size,
            HealthStatus: 'Healthy',
            DriveType: 'Fixed',
        };

        _checkObjective('new-partition');

        return `<span class="ps-success">
   DiskNumber PartitionNumber DriveLetter Size         Type
   ---------- --------------- ----------- ----         ----
   ${diskNumber}           1               ${assignedLetter}           ${_formatBytes(disk.Size).padEnd(13)}Basic

Partition created successfully on disk ${diskNumber}.</span>`;
    }

    /**
     * Get-Volume - List volumes
     */
    function _cmdGetVolume(args, params) {
        const driveLetter = params.DriveLetter || args[0];

        if (driveLetter) {
            const volume = state.volumes[driveLetter.replace(':', '')];
            if (!volume) {
                return `<span class="ps-error">Get-Volume : No volume found with drive letter '${driveLetter}'.</span>`;
            }

            _checkObjective('get-volume');
            return `
DriveLetter      : ${volume.DriveLetter}
DriveType        : ${volume.DriveType}
FileSystem       : ${volume.FileSystem}
FileSystemLabel  : ${volume.FileSystemLabel}
HealthStatus     : ${volume.HealthStatus}
Size             : ${_formatBytes(volume.Size)}
SizeRemaining    : ${_formatBytes(volume.SizeRemaining)}`;
        }

        let output = `
DriveLetter FriendlyName FileSystemType DriveType HealthStatus SizeRemaining     Size
----------- ------------ -------------- --------- ------------ -------------     ----
`;
        for (const vol of Object.values(state.volumes)) {
            output += `${(vol.DriveLetter || '').padEnd(12)}${(vol.FileSystemLabel || '').padEnd(13)}${(vol.FileSystem || 'Unknown').padEnd(15)}${(vol.DriveType || 'Fixed').padEnd(10)}${vol.HealthStatus.padEnd(13)}${_formatBytes(vol.SizeRemaining).padEnd(18)}${_formatBytes(vol.Size)}\n`;
        }

        _checkObjective('get-volume');
        return output;
    }

    /**
     * Format-Volume - Format a volume with a filesystem
     */
    function _cmdFormatVolume(args, params) {
        const driveLetter = params.DriveLetter || args[0];
        const fileSystem = params.FileSystem || 'NTFS';
        const label = params.NewFileSystemLabel || '';

        if (!driveLetter) {
            return `<span class="ps-error">Format-Volume : Cannot bind argument to parameter 'DriveLetter'.</span>`;
        }

        const letter = driveLetter.replace(':', '');
        const volume = state.volumes[letter];

        if (!volume) {
            return `<span class="ps-error">Format-Volume : No volume found with drive letter '${driveLetter}'.</span>`;
        }

        state.volumes[letter].FileSystem = fileSystem;
        state.volumes[letter].FileSystemLabel = label;

        // Create filesystem entry
        state.fs[`${letter}:`] = {
            type: 'drive',
            label: label || 'New Volume',
            children: [],
        };

        _checkObjective('format-volume');

        return `<span class="ps-success">Volume ${letter}: formatted with ${fileSystem}${label ? ` and label '${label}'` : ''}.</span>`;
    }

    /**
     * Get-SmbShare - List SMB shares
     */
    function _cmdGetSmbShare(args, params) {
        const name = params.Name || args[0];

        if (name) {
            const share = state.shares[name];
            if (!share) {
                return `<span class="ps-error">Get-SmbShare : No share found with name '${name}'.</span>`;
            }

            return `
Name        : ${share.Name}
Path        : ${share.Path}
Description : ${share.Description}
ShareType   : ${share.ShareType}`;
        }

        let output = `
Name                          Path                          Description
----                          ----                          -----------
`;
        for (const share of Object.values(state.shares)) {
            output += `${share.Name.padEnd(30)}${(share.Path || '').padEnd(30)}${share.Description || ''}\n`;
        }

        return output;
    }

    /**
     * New-SmbShare - Create new SMB share
     */
    function _cmdNewSmbShare(args, params) {
        const name = params.Name || args[0];
        const path = params.Path || args[1];

        if (!name || !path) {
            return `<span class="ps-error">New-SmbShare : Parameters 'Name' and 'Path' are required.</span>`;
        }

        if (state.shares[name]) {
            return `<span class="ps-error">New-SmbShare : Share '${name}' already exists.</span>`;
        }

        state.shares[name] = {
            Name: name,
            Path: path,
            Description: params.Description || '',
            ShareType: 'Standard',
        };

        _checkObjective('new-share');

        return `<span class="ps-success">Share '${name}' created at path '${path}'.
UNC path: \\\\${config.hostname}\\${name}</span>`;
    }

    /**
     * Remove-SmbShare - Remove an SMB share
     */
    function _cmdRemoveSmbShare(args, params) {
        const name = params.Name || args[0];

        if (!name) {
            return `<span class="ps-error">Remove-SmbShare : Cannot bind argument to parameter 'Name'.</span>`;
        }

        if (!state.shares[name]) {
            return `<span class="ps-error">Remove-SmbShare : Share '${name}' not found.</span>`;
        }

        if (['ADMIN$', 'C$', 'IPC$'].includes(name)) {
            return `<span class="ps-error">Remove-SmbShare : Cannot remove built-in share '${name}'.</span>`;
        }

        delete state.shares[name];
        return `<span class="ps-success">Share '${name}' removed.</span>`;
    }

    /**
     * Get-SmbSession - List SMB sessions
     */
    function _cmdGetSmbSession() {
        return `
SessionId    ClientComputerName ClientUserName NumOpens
---------    ------------------ -------------- --------
154618822657 192.168.1.100      HEXWORTH\\jsmith      3
154618822658 192.168.1.101      HEXWORTH\\agarcia     1`;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // HYPER-V COMMANDS
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Get-VM - List virtual machines
     */
    function _cmdGetVM(args, params) {
        const name = params.Name || args[0];

        if (name) {
            const vm = state.vms[name];
            if (!vm) {
                return `<span class="ps-error">Get-VM : Cannot find virtual machine '${name}'.</span>`;
            }

            _checkObjective('get-vm');

            return `
Name        : ${vm.Name}
State       : ${vm.State}
CPUUsage    : ${vm.CPUUsage}
MemoryAssigned : ${_formatBytes(vm.MemoryAssigned)}
MemoryDemand : ${_formatBytes(vm.MemoryDemand)}
MemoryStatus : ${vm.MemoryStatus}
Uptime       : ${vm.Uptime}
Status       : ${vm.Status}
Generation   : ${vm.Generation}
Version      : ${vm.Version}`;
        }

        _checkObjective('get-vm');

        let output = `
Name        State   CPUUsage(%) MemoryAssigned(M) Uptime           Status             Version
----        -----   ----------- ----------------- ------           ------             -------
`;
        for (const vm of Object.values(state.vms)) {
            const memMB = Math.round(vm.MemoryAssigned / 1024 / 1024);
            output += `${vm.Name.padEnd(12)}${vm.State.padEnd(8)}${vm.CPUUsage.toString().padEnd(12)}${memMB.toString().padEnd(18)}${vm.Uptime.padEnd(17)}${vm.Status.padEnd(19)}${vm.Version}\n`;
        }

        return output;
    }

    /**
     * New-VM - Create new virtual machine
     */
    function _cmdNewVM(args, params) {
        const name = params.Name || args[0];
        if (!name) {
            return `<span class="ps-error">New-VM : Cannot bind argument to parameter 'Name'.</span>`;
        }

        if (state.vms[name]) {
            return `<span class="ps-error">New-VM : Virtual machine '${name}' already exists.</span>`;
        }

        const memoryBytes = params.MemoryStartupBytes || 2147483648; // 2GB default
        const generation = params.Generation || 2;

        state.vms[name] = {
            Name: name,
            State: 'Off',
            CPUUsage: 0,
            MemoryAssigned: memoryBytes,
            MemoryDemand: 0,
            MemoryStatus: 'OK',
            Uptime: '0.00:00:00',
            Status: 'Operating normally',
            Generation: generation,
            Version: '9.0',
            Path: `D:\\VMs\\${name}`,
            Checkpoints: [],
        };

        _checkObjective('new-vm');

        return `<span class="ps-success">Virtual machine '${name}' created.
Generation: ${generation}
Memory: ${_formatBytes(memoryBytes)}</span>`;
    }

    /**
     * Start-VM - Start a virtual machine
     */
    function _cmdStartVM(args, params) {
        const name = params.Name || params.VM || args[0];
        if (!name) {
            return `<span class="ps-error">Start-VM : Cannot bind argument to parameter 'Name'.</span>`;
        }

        const vm = state.vms[name];
        if (!vm) {
            return `<span class="ps-error">Start-VM : Cannot find virtual machine '${name}'.</span>`;
        }

        if (vm.State === 'Running') {
            return `<span class="ps-warning">WARNING: Virtual machine '${name}' is already running.</span>`;
        }

        state.vms[name].State = 'Running';
        state.vms[name].CPUUsage = Math.floor(Math.random() * 10);
        state.vms[name].MemoryDemand = Math.floor(vm.MemoryAssigned * 0.6);
        state.vms[name].Uptime = '0.00:00:01';

        _checkObjective('start-vm');

        return `<span class="ps-success">Virtual machine '${name}' started.</span>`;
    }

    /**
     * Stop-VM - Stop a virtual machine
     */
    function _cmdStopVM(args, params) {
        const name = params.Name || params.VM || args[0];
        const force = params.Force || params.TurnOff;

        if (!name) {
            return `<span class="ps-error">Stop-VM : Cannot bind argument to parameter 'Name'.</span>`;
        }

        const vm = state.vms[name];
        if (!vm) {
            return `<span class="ps-error">Stop-VM : Cannot find virtual machine '${name}'.</span>`;
        }

        if (vm.State === 'Off') {
            return `<span class="ps-warning">WARNING: Virtual machine '${name}' is already stopped.</span>`;
        }

        state.vms[name].State = 'Off';
        state.vms[name].CPUUsage = 0;
        state.vms[name].MemoryDemand = 0;
        state.vms[name].Uptime = '0.00:00:00';

        return `<span class="ps-success">Virtual machine '${name}' stopped.</span>`;
    }

    /**
     * Restart-VM - Restart a virtual machine
     */
    function _cmdRestartVM(args, params) {
        const name = params.Name || params.VM || args[0];
        if (!name) {
            return `<span class="ps-error">Restart-VM : Cannot bind argument to parameter 'Name'.</span>`;
        }

        const vm = state.vms[name];
        if (!vm) {
            return `<span class="ps-error">Restart-VM : Cannot find virtual machine '${name}'.</span>`;
        }

        state.vms[name].State = 'Running';
        state.vms[name].CPUUsage = Math.floor(Math.random() * 10);
        state.vms[name].Uptime = '0.00:00:01';

        return `<span class="ps-success">Virtual machine '${name}' restarted.</span>`;
    }

    /**
     * Remove-VM - Delete a virtual machine
     */
    function _cmdRemoveVM(args, params) {
        const name = params.Name || args[0];
        if (!name) {
            return `<span class="ps-error">Remove-VM : Cannot bind argument to parameter 'Name'.</span>`;
        }

        if (!state.vms[name]) {
            return `<span class="ps-error">Remove-VM : Cannot find virtual machine '${name}'.</span>`;
        }

        delete state.vms[name];
        return `<span class="ps-success">Virtual machine '${name}' removed.</span>`;
    }

    /**
     * Get-VMSwitch - List virtual switches
     */
    function _cmdGetVMSwitch(args, params) {
        const name = params.Name || args[0];

        if (name) {
            const sw = state.vmSwitches[name];
            if (!sw) {
                return `<span class="ps-error">Get-VMSwitch : Cannot find virtual switch '${name}'.</span>`;
            }

            _checkObjective('get-vmswitch');
            return `
Name            : ${sw.Name}
SwitchType      : ${sw.SwitchType}
AllowManagementOS : ${sw.AllowManagementOS}`;
        }

        let output = `
Name                           SwitchType NetAdapterInterfaceDescription
----                           ---------- ------------------------------
`;
        for (const sw of Object.values(state.vmSwitches)) {
            output += `${sw.Name.padEnd(31)}${sw.SwitchType.padEnd(11)}${sw.NetAdapterInterfaceDescription || ''}\n`;
        }

        _checkObjective('get-vmswitch');
        return output;
    }

    /**
     * New-VMSwitch - Create virtual switch
     */
    function _cmdNewVMSwitch(args, params) {
        const name = params.Name || args[0];
        const switchType = params.SwitchType || 'Private';

        if (!name) {
            return `<span class="ps-error">New-VMSwitch : Cannot bind argument to parameter 'Name'.</span>`;
        }

        if (state.vmSwitches[name]) {
            return `<span class="ps-error">New-VMSwitch : Virtual switch '${name}' already exists.</span>`;
        }

        state.vmSwitches[name] = {
            Name: name,
            SwitchType: switchType,
            AllowManagementOS: switchType !== 'Private',
            NetAdapterInterfaceDescription: switchType === 'External' ? 'Intel(R) Ethernet' : '',
        };

        _checkObjective('new-vmswitch');
        return `<span class="ps-success">Virtual switch '${name}' created (${switchType}).</span>`;
    }

    /**
     * Checkpoint-VM - Create VM checkpoint (snapshot)
     */
    function _cmdCheckpointVM(args, params) {
        const name = params.Name || params.VM || args[0];
        const snapshotName = params.SnapshotName || `Checkpoint - ${new Date().toISOString()}`;

        if (!name) {
            return `<span class="ps-error">Checkpoint-VM : Cannot bind argument to parameter 'Name'.</span>`;
        }

        const vm = state.vms[name];
        if (!vm) {
            return `<span class="ps-error">Checkpoint-VM : Cannot find virtual machine '${name}'.</span>`;
        }

        if (!vm.Checkpoints) {
            vm.Checkpoints = [];
        }

        vm.Checkpoints.push({
            Name: snapshotName,
            CreationTime: new Date().toISOString(),
            VMName: name,
        });

        _checkObjective('checkpoint');

        return `<span class="ps-success">Checkpoint '${snapshotName}' created for VM '${name}'.</span>`;
    }

    /**
     * Get-VMCheckpoint - List VM checkpoints
     */
    function _cmdGetVMCheckpoint(args, params) {
        const name = params.VMName || args[0];

        if (name) {
            const vm = state.vms[name];
            if (!vm) {
                return `<span class="ps-error">Get-VMCheckpoint : Cannot find virtual machine '${name}'.</span>`;
            }

            if (!vm.Checkpoints || vm.Checkpoints.length === 0) {
                return `<span class="ps-dim">No checkpoints found for VM '${name}'.</span>`;
            }

            let output = `\n`;
            for (const cp of vm.Checkpoints) {
                output += `VMName      : ${cp.VMName}
Name        : ${cp.Name}
CreationTime: ${cp.CreationTime}

`;
            }
            return output;
        }

        // List all checkpoints
        let output = `\nVMName       Name                                     CreationTime\n`;
        output += `------       ----                                     ------------\n`;

        for (const vm of Object.values(state.vms)) {
            if (vm.Checkpoints) {
                for (const cp of vm.Checkpoints) {
                    output += `${cp.VMName.padEnd(13)}${cp.Name.substring(0, 40).padEnd(41)}${cp.CreationTime}\n`;
                }
            }
        }

        return output;
    }

    /**
     * Restore-VMCheckpoint - Restore from checkpoint
     */
    function _cmdRestoreVMCheckpoint(args, params) {
        const vmName = params.VMName || args[0];
        const checkpointName = params.Name || args[1];

        if (!vmName) {
            return `<span class="ps-error">Restore-VMCheckpoint : VMName parameter required.</span>`;
        }

        const vm = state.vms[vmName];
        if (!vm) {
            return `<span class="ps-error">Restore-VMCheckpoint : Cannot find virtual machine '${vmName}'.</span>`;
        }

        return `<span class="ps-success">VM '${vmName}' restored to checkpoint.</span>`;
    }

    /**
     * Get-VMHost - Get Hyper-V host information
     */
    function _cmdGetVMHost() {
        _checkObjective('get-vmhost');
        return `
ComputerName                        : ${config.hostname}
LogicalProcessorCount               : 4
MemoryCapacity                      : 17179869184
VirtualMachinePath                  : D:\\VMs
VirtualHardDiskPath                 : D:\\VMs
EnableEnhancedSessionMode           : True
MacAddressMaximum                   : 00155D7FFFFF
MacAddressMinimum                   : 00155D000000
NumaSpanningEnabled                 : True`;
    }

    /**
     * Measure-VM - Measure VM resource usage
     */
    function _cmdMeasureVM(args, params) {
        const name = params.Name || args[0];
        if (!name) {
            return `<span class="ps-error">Measure-VM : Cannot bind argument to parameter 'Name'.</span>`;
        }
        const vm = state.vms[name];
        if (!vm) {
            return `<span class="ps-error">Measure-VM : Cannot find virtual machine '${name}'.</span>`;
        }
        _checkObjective('measure-vm');
        return `
VMName               : ${name}
AvgCPU(%)            : 12
AvgRAM(M)            : 1842
MaxRAM(M)            : 2048
MinRAM(M)            : 1024
TotalDisk(M)         : 40960
AggregatedDiskDataRead  : 245 MB
AggregatedDiskDataWritten: 128 MB
NetworkInbound(M)    : 52
NetworkOutbound(M)   : 38
MeteringDuration     : 1.02:15:30`;
    }

    /**
     * Set-VM - Configure VM settings
     */
    function _cmdSetVM(args, params) {
        const name = params.Name || params.VMName || args[0];
        if (!name) {
            return `<span class="ps-error">Set-VM : Cannot bind argument to parameter 'Name'.</span>`;
        }
        const vm = state.vms[name];
        if (!vm) {
            return `<span class="ps-error">Set-VM : Cannot find virtual machine '${name}'.</span>`;
        }
        if (params.ProcessorCount) vm.ProcessorCount = parseInt(params.ProcessorCount);
        if (params.DynamicMemoryEnabled) vm.DynamicMemoryEnabled = params.DynamicMemoryEnabled;
        if (params.Notes) vm.Notes = params.Notes;
        _checkObjective('set-vm');
        return '';
    }

    /**
     * Set-VMMemory - Configure VM memory settings
     */
    function _cmdSetVMMemory(args, params) {
        const name = params.VMName || args[0];
        if (!name) {
            return `<span class="ps-error">Set-VMMemory : Cannot bind argument to parameter 'VMName'.</span>`;
        }
        const vm = state.vms[name];
        if (!vm) {
            return `<span class="ps-error">Set-VMMemory : Cannot find virtual machine '${name}'.</span>`;
        }
        _checkObjective('set-vmmemory');
        return '';
    }

    /**
     * New-VHD - Create a virtual hard disk
     */
    function _cmdNewVHD(args, params) {
        const path = params.Path || args[0];
        const size = params.SizeBytes || params.Size || '60GB';
        if (!path) {
            return `<span class="ps-error">New-VHD : Cannot bind argument to parameter 'Path'.</span>`;
        }
        const isDynamic = args.some(a => a.toLowerCase() === '-dynamic') || params.Dynamic;
        _checkObjective('new-vhd');
        return `
VhdFormat             : VHDX
VhdType               : ${isDynamic ? 'Dynamic' : 'Fixed'}
FileSize              : 4194304
Path                  : ${path}
MinimumSize           :
ParentPath            :
Size                  : ${size}`;
    }

    /**
     * Add-VMHardDiskDrive - Attach VHD to VM
     */
    function _cmdAddVMHardDiskDrive(args, params) {
        const vmName = params.VMName || args[0];
        const path = params.Path;
        if (!vmName) {
            return `<span class="ps-error">Add-VMHardDiskDrive : Cannot bind argument to parameter 'VMName'.</span>`;
        }
        const vm = state.vms[vmName];
        if (!vm) {
            return `<span class="ps-error">Add-VMHardDiskDrive : Cannot find virtual machine '${vmName}'.</span>`;
        }
        _checkObjective('add-vmharddiskdrive');
        return '';
    }

    /**
     * Set-VMNetworkAdapter - Configure VM network adapter
     */
    function _cmdSetVMNetworkAdapter(args, params) {
        const vmName = params.VMName || args[0];
        const switchName = params.SwitchName;
        if (!vmName) {
            return `<span class="ps-error">Set-VMNetworkAdapter : Cannot bind argument to parameter 'VMName'.</span>`;
        }
        const vm = state.vms[vmName];
        if (!vm) {
            return `<span class="ps-error">Set-VMNetworkAdapter : Cannot find virtual machine '${vmName}'.</span>`;
        }
        if (switchName) vm.SwitchName = switchName;
        _checkObjective('set-vmnetworkadapter');
        return '';
    }

    /**
     * Export-VM - Export a virtual machine
     */
    function _cmdExportVM(args, params) {
        const name = params.Name || args[0];
        const path = params.Path || 'D:\\Backups';
        if (!name) {
            return `<span class="ps-error">Export-VM : Cannot bind argument to parameter 'Name'.</span>`;
        }
        const vm = state.vms[name];
        if (!vm) {
            return `<span class="ps-error">Export-VM : Cannot find virtual machine '${name}'.</span>`;
        }
        _checkObjective('export-vm');
        return `<span class="ps-success">Virtual machine '${name}' exported to '${path}'.</span>`;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // FAILOVER CLUSTER COMMANDS
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Simulated cluster state
     */
    const clusterState = {
        name: 'HX-CLUSTER',
        nodes: [
            { Name: 'NODE01', State: 'Up', Cluster: 'HX-CLUSTER' },
            { Name: 'NODE02', State: 'Up', Cluster: 'HX-CLUSTER' },
        ],
        groups: [
            { Name: 'Cluster Group', OwnerNode: 'NODE01', State: 'Online' },
            { Name: 'SQL-AG', OwnerNode: 'NODE01', State: 'Online' },
            { Name: 'File Share', OwnerNode: 'NODE02', State: 'Online' },
        ],
        quorum: 'NodeAndFileShareMajority',
    };

    /**
     * Get-Cluster - Get cluster information
     */
    function _cmdGetCluster(args, params) {
        _checkObjective('get-cluster');
        return `
Name                        : ${clusterState.name}
AddEvictDelay               : 60
BackupInProgress            : 0
ClusSvcHangTimeout          : 60
ClusterEnforcedAntiAffinity : 0
ClusterFunctionalLevel      : 10
ClusterGroupWaitDelay       : 120
ClusterLogLevel             : 3
ClusterLogSize              : 300
Domain                      : ${config.domain}
SharedVolumesRoot           : C:\\ClusterStorage`;
    }

    /**
     * Get-ClusterNode - List cluster nodes
     */
    function _cmdGetClusterNode(args, params) {
        const name = params.Name || args[0];

        if (name) {
            const node = clusterState.nodes.find(n => n.Name === name);
            if (!node) {
                return `<span class="ps-error">Get-ClusterNode : Cannot find node '${name}'.</span>`;
            }

            _checkObjective('get-clusternode');
            return `
Cluster : ${node.Cluster}
Name    : ${node.Name}
State   : ${node.State}`;
        }

        let output = `
Name                State
----                -----
`;
        for (const node of clusterState.nodes) {
            output += `${node.Name.padEnd(20)}${node.State}\n`;
        }

        _checkObjective('get-clusternode');
        return output;
    }

    /**
     * Get-ClusterGroup - List cluster resource groups
     */
    function _cmdGetClusterGroup(args, params) {
        const name = params.Name || args[0];

        if (name) {
            const group = clusterState.groups.find(g => g.Name === name);
            if (!group) {
                return `<span class="ps-error">Get-ClusterGroup : Cannot find group '${name}'.</span>`;
            }

            _checkObjective('get-clustergroup');
            return `
Name      : ${group.Name}
OwnerNode : ${group.OwnerNode}
State     : ${group.State}`;
        }

        let output = `
Name                 OwnerNode   State
----                 ---------   -----
`;
        for (const group of clusterState.groups) {
            output += `${group.Name.padEnd(21)}${group.OwnerNode.padEnd(12)}${group.State}\n`;
        }

        _checkObjective('get-clustergroup');
        return output;
    }

    /**
     * Move-ClusterGroup - Move group to another node
     */
    function _cmdMoveClusterGroup(args, params) {
        const name = params.Name || args[0];
        const node = params.Node || args[1];

        if (!name) {
            return `<span class="ps-error">Move-ClusterGroup : Group name required.</span>`;
        }

        const group = clusterState.groups.find(g => g.Name === name);
        if (!group) {
            return `<span class="ps-error">Move-ClusterGroup : Cannot find group '${name}'.</span>`;
        }

        const targetNode = node || (group.OwnerNode === 'NODE01' ? 'NODE02' : 'NODE01');
        group.OwnerNode = targetNode;

        _checkObjective('move-clustergroup');
        return `<span class="ps-success">Group '${name}' moved to node '${targetNode}'.</span>`;
    }

    /**
     * Start-ClusterGroup - Bring a cluster group online
     */
    function _cmdStartClusterGroup(args, params) {
        const name = params.Name || args[0];

        if (!name) {
            return `<span class="ps-error">Start-ClusterGroup : Group name required.</span>`;
        }

        const group = clusterState.groups.find(g => g.Name === name);
        if (!group) {
            return `<span class="ps-error">Start-ClusterGroup : Cannot find group '${name}'.</span>`;
        }

        group.State = 'Online';
        return `<span class="ps-success">Group '${name}' is now Online.</span>`;
    }

    /**
     * Stop-ClusterGroup - Take a cluster group offline
     */
    function _cmdStopClusterGroup(args, params) {
        const name = params.Name || args[0];

        if (!name) {
            return `<span class="ps-error">Stop-ClusterGroup : Group name required.</span>`;
        }

        const group = clusterState.groups.find(g => g.Name === name);
        if (!group) {
            return `<span class="ps-error">Stop-ClusterGroup : Cannot find group '${name}'.</span>`;
        }

        group.State = 'Offline';
        return `<span class="ps-success">Group '${name}' is now Offline.</span>`;
    }

    /**
     * Get-ClusterQuorum - Get quorum configuration
     */
    function _cmdGetClusterQuorum() {
        _checkObjective('get-clusterquorum');
        return `
Cluster         : ${clusterState.name}
QuorumResource  : File Share Witness
QuorumType      : ${clusterState.quorum}`;
    }

    /**
     * Get-ClusterResource - List cluster resources
     */
    function _cmdGetClusterResource(args, params) {
        _checkObjective('get-clusterresource');
        return `
Name                          State   OwnerGroup           ResourceType
----                          -----   ----------           ------------
Cluster IP Address            Online  Cluster Group        IP Address
Cluster Name                  Online  Cluster Group        Network Name
File Share Witness            Online  Cluster Group        File Share Witness
SQL Server (MSSQLSERVER)      Online  SQL-AG               SQL Server
File Server                   Online  File Share           File Server`;
    }

    /**
     * Test-Cluster - Validate cluster configuration
     */
    function _cmdTestCluster(args, params) {
        const nodes = params.Node || args.join(',');
        _checkObjective('test-cluster');
        return `<span class="ps-success">Validating cluster configuration...

Test                       Result  Description
----                       ------  -----------
Network                    Pass    Validate network communication
Storage                    Pass    Validate disks
System Configuration       Pass    Validate system configuration
Hyper-V Configuration      Pass    Validate Hyper-V requirements
Inventory                  Pass    Validate hardware and software inventory

Validation report saved to: C:\\Windows\\Cluster\\Reports\\Validation Report ${new Date().toISOString().split('T')[0]}.htm

All tests passed. The cluster is ready to be created.</span>`;
    }

    /**
     * New-Cluster - Create a new failover cluster
     */
    function _cmdNewCluster(args, params) {
        const name = params.Name || args[0];
        const staticAddr = params.StaticAddress;
        if (!name) {
            return `<span class="ps-error">New-Cluster : Cannot bind argument to parameter 'Name'.</span>`;
        }
        clusterState.name = name;
        _checkObjective('new-cluster');
        return `<span class="ps-success">
Name                        : ${name}
Domain                      : ${config.domain}
StaticAddress               : ${staticAddr || '10.0.1.100'}

Cluster '${name}' created successfully.</span>`;
    }

    /**
     * Add-ClusterNode - Add a node to the cluster
     */
    function _cmdAddClusterNode(args, params) {
        const name = params.Name || args[0];
        if (!name) {
            return `<span class="ps-error">Add-ClusterNode : Cannot bind argument to parameter 'Name'.</span>`;
        }
        clusterState.nodes.push({ Name: name, State: 'Up', Cluster: clusterState.name });
        _checkObjective('add-clusternode');
        return `<span class="ps-success">Node '${name}' added to cluster '${clusterState.name}'.</span>`;
    }

    /**
     * Set-ClusterQuorum - Configure cluster quorum
     */
    function _cmdSetClusterQuorum(args, params) {
        const witness = params.FileShareWitness || params.DiskWitness;
        if (params.FileShareWitness) {
            clusterState.quorum = 'NodeAndFileShareMajority';
            _checkObjective('set-clusterquorum');
            return `<span class="ps-success">Quorum configured: NodeAndFileShareMajority
File Share Witness: ${witness}</span>`;
        }
        if (params.DiskWitness) {
            clusterState.quorum = 'NodeAndDiskMajority';
            _checkObjective('set-clusterquorum');
            return `<span class="ps-success">Quorum configured: NodeAndDiskMajority
Disk Witness: ${witness}</span>`;
        }
        _checkObjective('set-clusterquorum');
        return `<span class="ps-success">Quorum configuration updated.</span>`;
    }

    /**
     * Get-ClusterSharedVolume - List cluster shared volumes
     */
    function _cmdGetClusterSharedVolume(args, params) {
        _checkObjective('get-clustersharedvolume');
        return `
Name                 State    Node
----                 -----    ----
Cluster Disk 1       Online   NODE01
Cluster Disk 2       Online   NODE02

SharedVolumeInfo:
  FriendlyVolumeName : C:\\ClusterStorage\\Volume1
  Maintenance        : False
  FaultState         : NoFaults
  RedirectedAccess   : False`;
    }

    /**
     * Suspend-ClusterNode - Pause a cluster node for maintenance
     */
    function _cmdSuspendClusterNode(args, params) {
        const name = params.Name || args[0];
        if (!name) {
            return `<span class="ps-error">Suspend-ClusterNode : Cannot bind argument to parameter 'Name'.</span>`;
        }
        const node = clusterState.nodes.find(n => n.Name === name);
        if (node) node.State = 'Paused';
        const drain = args.some(a => a.toLowerCase() === '-drain') || params.Drain;
        _checkObjective('suspend-clusternode');
        return `<span class="ps-success">Node '${name}' paused.${drain ? ' Draining roles to other nodes...\nAll roles drained successfully.' : ''}</span>`;
    }

    /**
     * Resume-ClusterNode - Resume a paused cluster node
     */
    function _cmdResumeClusterNode(args, params) {
        const name = params.Name || args[0];
        if (!name) {
            return `<span class="ps-error">Resume-ClusterNode : Cannot bind argument to parameter 'Name'.</span>`;
        }
        const node = clusterState.nodes.find(n => n.Name === name);
        if (node) node.State = 'Up';
        _checkObjective('resume-clusternode');
        return `<span class="ps-success">Node '${name}' resumed.</span>`;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // NETWORK COMMANDS
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Test-Connection - Ping a host
     */
    function _cmdTestConnection(args, params) {
        const target = params.TargetName || params.ComputerName || args[0];
        const count = params.Count || 4;

        if (!target) {
            return `<span class="ps-error">Test-Connection : Cannot bind argument to parameter 'TargetName'.</span>`;
        }

        let output = `\nPinging ${target}:\n\n`;

        for (let i = 0; i < Math.min(count, 4); i++) {
            const time = Math.floor(Math.random() * 10) + 1;
            output += `Reply from ${target}: bytes=32 time=${time}ms TTL=128\n`;
        }

        output += `\n<span class="ps-success">Ping to ${target} successful.</span>`;

        _checkObjective('test-connection');
        return output;
    }

    /**
     * Test-NetConnection - Advanced network connectivity test
     */
    function _cmdTestNetConnection(args, params) {
        const computer = params.ComputerName || args[0] || 'internetbeacon.msedge.net';
        const port = params.Port;
        _checkObjective('test-netconnection');

        let output = `
ComputerName           : ${computer}
RemoteAddress          : ${computer.includes('.') ? computer : '13.107.4.52'}
`;

        if (port) {
            output += `RemotePort             : ${port}
TcpTestSucceeded       : True
`;
        } else {
            output += `InterfaceAlias         : Ethernet
SourceAddress          : 192.168.1.10
PingSucceeded          : True
PingReplyDetails (RTT) : 5 ms
`;
        }

        return output;
    }

    /**
     * Get-NetAdapter - List network adapters
     */
    function _cmdGetNetAdapter(args, params) {
        _checkObjective('get-netadapter');
        return `
Name                      InterfaceDescription                    ifIndex Status       MacAddress             LinkSpeed
----                      --------------------                    ------- ------       ----------             ---------
Ethernet                  Intel(R) 82579LM Gigabit Network             12 Up           00-15-5D-01-02-03         1 Gbps
vEthernet (External)      Hyper-V Virtual Ethernet Adapter             15 Up           00-15-5D-01-02-04         1 Gbps`;
    }

    /**
     * Get-NetIPAddress - List IP addresses
     */
    function _cmdGetNetIPAddress(args, params) {
        return `
IPAddress         : 192.168.1.10
InterfaceIndex    : 12
InterfaceAlias    : Ethernet
AddressFamily     : IPv4
Type              : Unicast
PrefixLength      : 24
PrefixOrigin      : Manual
SuffixOrigin      : Manual
AddressState      : Preferred

IPAddress         : fe80::1234:5678:90ab:cdef%12
InterfaceIndex    : 12
InterfaceAlias    : Ethernet
AddressFamily     : IPv6
Type              : Unicast
PrefixLength      : 64`;
    }

    /**
     * Get-NetIPConfiguration - Get network configuration
     */
    function _cmdGetNetIPConfiguration(args, params) {
        return `
InterfaceAlias       : Ethernet
InterfaceIndex       : 12
InterfaceDescription : Intel(R) 82579LM Gigabit Network Connection
NetProfile.Name      : hexworth.local
IPv4Address          : 192.168.1.10
IPv4DefaultGateway   : 192.168.1.1
DNSServer            : 192.168.1.10, 192.168.1.11`;
    }

    /**
     * Resolve-DnsName - DNS lookup
     */
    function _cmdResolveDnsName(args, params) {
        const name = params.Name || args[0];

        if (!name) {
            return `<span class="ps-error">Resolve-DnsName : Cannot bind argument to parameter 'Name'.</span>`;
        }

        _checkObjective('resolve-dnsname');

        // Simulate DNS response - check DNS zones first
        if (state.dnsZones) {
            for (const [zoneName, zone] of Object.entries(state.dnsZones)) {
                const records = zone.records || [];
                const match = records.find(r => {
                    const fqdn = r.name === '@' ? zoneName : `${r.name}.${zoneName}`;
                    return fqdn.toLowerCase() === name.toLowerCase();
                });
                if (match) {
                    return `
Name                           Type   TTL   Section    IPAddress
----                           ----   ---   -------    ---------
${name.padEnd(31)}${(match.type || 'A').padEnd(7)}300   Answer     ${match.data}`;
                }
            }
        }

        // Fallback to hardcoded records
        const records = {
            'dc01.hexworth.local': '192.168.1.10',
            'hexworth.local': '192.168.1.10',
            'google.com': '142.250.80.46',
        };

        const ip = records[name.toLowerCase()] || '93.184.216.34';

        return `
Name                           Type   TTL   Section    IPAddress
----                           ----   ---   -------    ---------
${name.padEnd(31)}A      300   Answer     ${ip}`;
    }

    /**
     * New-NetIPAddress - Assign a new static IP address
     */
    function _cmdNewNetIPAddress(args, params) {
        const ifAlias = params.InterfaceAlias || params.InterfaceIndex || args[0];
        const ipAddr = params.IPAddress;
        const prefixLen = params.PrefixLength || '24';
        const gateway = params.DefaultGateway;

        if (!ipAddr) {
            return `<span class="ps-error">New-NetIPAddress : The 'IPAddress' parameter is required.</span>`;
        }

        let output = `
IPAddress         : ${ipAddr}
InterfaceIndex    : ${ifAlias ? '12' : '12'}
InterfaceAlias    : ${ifAlias || 'Ethernet'}
AddressFamily     : IPv4
Type              : Unicast
PrefixLength      : ${prefixLen}
PrefixOrigin      : Manual
SuffixOrigin      : Manual
AddressState      : Preferred
PolicyStore       : ActiveStore`;

        if (gateway) {
            output += `\nDefaultGateway    : ${gateway}`;
        }

        return output;
    }

    /**
     * Set-NetIPAddress - Modify an existing IP address configuration
     */
    function _cmdSetNetIPAddress(args, params) {
        const ipAddr = params.IPAddress;
        const ifAlias = params.InterfaceAlias || args[0];
        const prefixLen = params.PrefixLength;

        if (!ipAddr && !ifAlias) {
            return `<span class="ps-error">Set-NetIPAddress : Either 'IPAddress' or 'InterfaceAlias' parameter is required.</span>`;
        }

        // PowerShell Set- cmdlets typically return nothing on success
        return '';
    }

    /**
     * Set-DnsClientServerAddress - Set DNS server addresses for an interface
     */
    function _cmdSetDnsClientServerAddress(args, params) {
        const ifAlias = params.InterfaceAlias || args[0];
        const addresses = params.ServerAddresses;

        if (!ifAlias) {
            return `<span class="ps-error">Set-DnsClientServerAddress : The 'InterfaceAlias' parameter is required.</span>`;
        }

        // PowerShell Set- cmdlets typically return nothing on success
        return '';
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // PIPELINE / FORMATTING COMMANDS
    // ═══════════════════════════════════════════════════════════════════════════
    //
    // ┌─────────────────────────────────────────────────────────────────────────┐
    // │ INSIGHT: PowerShell Pipeline Architecture                               │
    // ├─────────────────────────────────────────────────────────────────────────┤
    // │ PowerShell passes OBJECTS through the pipeline, not text.               │
    // │                                                                         │
    // │ This enables powerful filtering and manipulation:                       │
    // │                                                                         │
    // │ Get-Service | Where-Object Status -eq Running | Select-Object Name      │
    // │                                                                         │
    // │ Each object has properties that you can filter and select.              │
    // │ The pipeline is processed LAZILY - one object at a time.                │
    // │                                                                         │
    // │ This is fundamentally different from bash pipes which pass text.        │
    // └─────────────────────────────────────────────────────────────────────────┘

    /**
     * Where-Object - Filter objects
     * Note: Simplified implementation
     */
    function _cmdWhereObject(args, params, pipeInput) {
        if (!pipeInput) {
            return `<span class="ps-dim">Where-Object requires pipeline input.</span>`;
        }
        // In a real implementation, this would parse the filter script
        // For now, pass through
        _checkObjective('where-object');
        return pipeInput;
    }

    /**
     * Select-Object - Select properties
     */
    function _cmdSelectObject(args, params, pipeInput) {
        if (!pipeInput) {
            return `<span class="ps-dim">Select-Object requires pipeline input.</span>`;
        }
        _checkObjective('select-object');
        return pipeInput;
    }

    /**
     * Sort-Object - Sort objects
     */
    function _cmdSortObject(args, params, pipeInput) {
        if (!pipeInput) {
            return `<span class="ps-dim">Sort-Object requires pipeline input.</span>`;
        }
        return pipeInput;
    }

    /**
     * Format-Table - Format as table
     */
    function _cmdFormatTable(args, params, pipeInput) {
        if (!pipeInput) {
            return `<span class="ps-dim">Format-Table requires pipeline input.</span>`;
        }
        return pipeInput;
    }

    /**
     * Format-List - Format as list
     */
    function _cmdFormatList(args, params, pipeInput) {
        if (!pipeInput) {
            return `<span class="ps-dim">Format-List requires pipeline input.</span>`;
        }
        return pipeInput;
    }

    /**
     * Measure-Object - Count/sum objects
     */
    function _cmdMeasureObject(args, params, pipeInput) {
        return `Count    : 5
Average  :
Sum      :
Maximum  :
Minimum  :
Property :`;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // DOCKER COMMANDS
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Docker - Container commands
     */
    function _cmdDocker(args) {
        const subcommand = args[0];

        switch (subcommand) {
            case 'ps':
                const showAll = args.includes('-a');
                let output = `CONTAINER ID   IMAGE                    COMMAND                  CREATED        STATUS          PORTS     NAMES\n`;
                output += `a1b2c3d4e5f6   mcr.microsoft.com/iis    "powershell -Command…"   2 hours ago    Up 2 hours      80/tcp    web01\n`;
                if (showAll) {
                    output += `b2c3d4e5f6a7   mcr.microsoft.com/sql    "sqlservr"               1 day ago      Exited (0)                sql01\n`;
                }
                _checkObjective('docker-ps');
                return output;

            case 'images':
                _checkObjective('docker-images');
                return `REPOSITORY                     TAG       IMAGE ID       CREATED         SIZE
mcr.microsoft.com/iis          latest    3b8b57c3e8a1   2 weeks ago     5.2GB
mcr.microsoft.com/windows      ltsc2022  f7c8d9e0a1b2   3 weeks ago     4.8GB
mcr.microsoft.com/dotnet/sdk   6.0       c3d4e5f6a7b8   1 month ago     1.2GB`;

            case 'pull':
                const image = args[1] || 'nginx';
                _checkObjective('docker-pull');
                return `<span class="ps-success">Using default tag: latest
latest: Pulling from library/${image}
Digest: sha256:${Math.random().toString(36).substr(2, 64)}
Status: Downloaded newer image for ${image}:latest</span>`;

            case 'run':
                _checkObjective('docker-run');
                return `<span class="ps-success">Container started: ${Math.random().toString(36).substr(2, 12)}</span>`;

            case 'stop':
                _checkObjective('docker-stop');
                return `<span class="ps-success">Container stopped.</span>`;

            case 'rm':
                _checkObjective('docker-rm');
                return `<span class="ps-success">Container removed.</span>`;

            case 'logs':
                _checkObjective('docker-logs');
                return `[2026-01-30T10:00:00Z] Container started
[2026-01-30T10:00:01Z] Service initialized
[2026-01-30T10:00:02Z] Listening on port 80`;

            case 'version':
                _checkObjective('docker-version');
                return `Client: Docker Engine - Enterprise
 Version:           20.10.21
 API version:       1.41
 OS/Arch:           windows/amd64

Server: Docker Engine - Enterprise
 Version:           20.10.21
 API version:       1.41
 OS/Arch:           windows/amd64`;

            case 'info':
                _checkObjective('docker-info');
                return `Client:
 Context:    default
 Debug Mode: false

Server:
 Containers: 3
  Running: 1
  Paused: 0
  Stopped: 2
 Images: 5
 Server Version: 20.10.21
 Storage Driver: windowsfilter
 Kernel Version: 10.0 20348 (20348.1.amd64fre.fe_release.210507-1500)
 Operating System: Windows Server 2022 Standard
 OSType: windows
 Architecture: x86_64
 CPUs: 4
 Total Memory: 16GiB`;

            case 'build': {
                const tagIdx = args.indexOf('-t');
                const tag = tagIdx !== -1 && args[tagIdx + 1] ? args[tagIdx + 1] : 'myapp:latest';
                _checkObjective('docker-build');
                return `<span class="ps-success">Sending build context to Docker daemon  2.048kB
Step 1/4 : FROM mcr.microsoft.com/windows/servercore:ltsc2022
 ---> f7c8d9e0a1b2
Step 2/4 : COPY . /app
 ---> Using cache
 ---> a1b2c3d4e5f6
Step 3/4 : WORKDIR /app
 ---> Running in 7b8c9d0e1f2a
 ---> b2c3d4e5f6a7
Step 4/4 : CMD ["powershell", "Start-Process"]
 ---> Running in 8c9d0e1f2a3b
 ---> c3d4e5f6a7b8
Successfully built c3d4e5f6a7b8
Successfully tagged ${tag}</span>`;
            }

            case 'inspect': {
                const container = args[1] || 'web01';
                _checkObjective('docker-inspect');
                return `[
    {
        "Id": "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6",
        "Created": "2026-02-08T08:00:00.000Z",
        "State": { "Status": "running", "Running": true, "Pid": 4128 },
        "Name": "/${container}",
        "Image": "mcr.microsoft.com/iis:latest",
        "NetworkSettings": {
            "IPAddress": "172.17.0.2",
            "Ports": { "80/tcp": [{ "HostPort": "8080" }] }
        }
    }
]`;
            }

            case 'network': {
                const netSub = args[1];
                if (netSub === 'create') {
                    const netName = args[args.length - 1] || 'app-network';
                    _checkObjective('docker-network-create');
                    return `<span class="ps-success">${Math.random().toString(36).substr(2, 64)}
Network '${netName}' created.</span>`;
                }
                if (netSub === 'ls') {
                    return `NETWORK ID     NAME           DRIVER    SCOPE
a1b2c3d4e5f6   nat            nat       local
b2c3d4e5f6a7   none           null      local
c3d4e5f6a7b8   app-network    nat       local`;
                }
                return `Usage: docker network [create|ls|rm|inspect]`;
            }

            case 'volume': {
                const volSub = args[1];
                if (volSub === 'create') {
                    const volName = args[2] || 'data-volume';
                    _checkObjective('docker-volume-create');
                    return `<span class="ps-success">${volName}</span>`;
                }
                if (volSub === 'ls') {
                    return `DRIVER    VOLUME NAME
local     sql-data
local     app-config`;
                }
                return `Usage: docker volume [create|ls|rm|inspect]`;
            }

            default:
                return `Usage:  docker [OPTIONS] COMMAND

Commands:
  build       Build an image from a Dockerfile
  images      List images
  info        Display system information
  inspect     Return container details
  logs        Fetch container logs
  network     Manage networks
  ps          List containers
  pull        Pull an image
  rm          Remove a container
  run         Run a container
  stop        Stop a container
  version     Show version info
  volume      Manage volumes`;
        }
    }

    /**
     * docker-compose - Docker Compose commands
     */
    function _cmdDockerCompose(args) {
        const sub = args[0];
        if (sub === 'up') {
            _checkObjective('docker-compose-up');
            return `<span class="ps-success">Creating network "app_default" with the default driver
Creating app_web_1   ... done
Creating app_db_1    ... done
Creating app_cache_1 ... done</span>`;
        }
        if (sub === 'down') {
            return `<span class="ps-success">Stopping app_web_1   ... done
Stopping app_db_1    ... done
Stopping app_cache_1 ... done
Removing app_web_1   ... done
Removing app_db_1    ... done
Removing app_cache_1 ... done
Removing network app_default</span>`;
        }
        if (sub === 'ps') {
            return `     Name                   Command               State           Ports
------------------------------------------------------------------------
app_web_1     powershell -Command ...   Up      0.0.0.0:8080->80/tcp
app_db_1      sqlservr                  Up      1433/tcp
app_cache_1   redis-server              Up      6379/tcp`;
        }
        return `Usage: docker-compose [up|down|ps|logs|build]`;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // NETWORK ADDITIONS
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Get-NetTCPConnection - View active TCP connections
     */
    function _cmdGetNetTCPConnection(args, params) {
        const stateFilter = params.State;
        const rows = [
            { LocalAddress: '192.168.1.10', LocalPort: '445', RemoteAddress: '192.168.1.20', RemotePort: '52341', State: 'Established', OwningProcess: '4' },
            { LocalAddress: '192.168.1.10', LocalPort: '3389', RemoteAddress: '192.168.1.50', RemotePort: '49821', State: 'Established', OwningProcess: '1032' },
            { LocalAddress: '192.168.1.10', LocalPort: '5985', RemoteAddress: '192.168.1.20', RemotePort: '50123', State: 'Established', OwningProcess: '4' },
            { LocalAddress: '0.0.0.0', LocalPort: '80', RemoteAddress: '0.0.0.0', RemotePort: '0', State: 'Listen', OwningProcess: '2548' },
            { LocalAddress: '0.0.0.0', LocalPort: '135', RemoteAddress: '0.0.0.0', RemotePort: '0', State: 'Listen', OwningProcess: '876' },
            { LocalAddress: '192.168.1.10', LocalPort: '389', RemoteAddress: '192.168.1.11', RemotePort: '53124', State: 'Established', OwningProcess: '612' },
            { LocalAddress: '192.168.1.10', LocalPort: '52400', RemoteAddress: '10.0.0.1', RemotePort: '443', State: 'TimeWait', OwningProcess: '0' },
        ];
        const filtered = stateFilter ? rows.filter(r => r.State.toLowerCase() === stateFilter.toLowerCase()) : rows;
        let output = `\nLocalAddress    LocalPort  RemoteAddress   RemotePort  State         OwningProcess\n`;
        output += `------------    ---------  -------------   ----------  -----         -------------\n`;
        for (const r of filtered) {
            output += `${r.LocalAddress.padEnd(16)}${r.LocalPort.padEnd(11)}${r.RemoteAddress.padEnd(16)}${r.RemotePort.padEnd(12)}${r.State.padEnd(14)}${r.OwningProcess}\n`;
        }
        _checkObjective('get-nettcpconnection');
        return output;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // MONITORING & DIAGNOSTICS COMMANDS
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Get-WinEvent - Modern event log query
     */
    function _cmdGetWinEvent(args, params) {
        const logName = params.LogName || 'System';
        const maxEvents = parseInt(params.MaxEvents) || 20;
        const filterHash = params.FilterHashtable;

        const events = [
            { TimeCreated: '2/8/2026 10:15:32 AM', Id: 7036, Level: 'Information', LevelDisplayName: 'Information', ProviderName: 'Service Control Manager', Message: 'The Windows Time service entered the running state.' },
            { TimeCreated: '2/8/2026 10:12:01 AM', Id: 263, Level: 'Warning', LevelDisplayName: 'Warning', ProviderName: 'Win32k', Message: 'Display driver stopped responding and has recovered.' },
            { TimeCreated: '2/8/2026 09:58:44 AM', Id: 6013, Level: 'Information', LevelDisplayName: 'Information', ProviderName: 'EventLog', Message: 'The system uptime is 259200 seconds.' },
            { TimeCreated: '2/8/2026 08:30:15 AM', Id: 5719, Level: 'Error', LevelDisplayName: 'Error', ProviderName: 'NETLOGON', Message: 'No Windows NT Domain Controller is available for domain.' },
            { TimeCreated: '2/7/2026 22:10:03 PM', Id: 11, Level: 'Error', LevelDisplayName: 'Error', ProviderName: 'Disk', Message: 'The driver detected a controller error on \\Device\\Harddisk1.' },
            { TimeCreated: '2/7/2026 20:00:00 PM', Id: 4625, Level: 'Information', LevelDisplayName: 'Information', ProviderName: 'Microsoft-Windows-Security-Auditing', Message: 'An account failed to log on.' },
            { TimeCreated: '2/7/2026 19:45:00 PM', Id: 4625, Level: 'Information', LevelDisplayName: 'Information', ProviderName: 'Microsoft-Windows-Security-Auditing', Message: 'An account failed to log on.' },
            { TimeCreated: '2/7/2026 18:30:00 PM', Id: 1014, Level: 'Warning', LevelDisplayName: 'Warning', ProviderName: 'DNS Client Events', Message: 'Name resolution timed out after none of the DNS servers responded.' },
        ];

        let filtered = events;
        // Simple filtering for -FilterHashtable or pipe patterns
        const rawArgs = args.join(' ').toLowerCase();
        const filterHashStr = (filterHash || '').toLowerCase();
        if (rawArgs.includes('level=2') || rawArgs.includes("'error'") || rawArgs.includes('"error"') ||
            filterHashStr.includes('level=2') || filterHashStr.includes("'error'") || filterHashStr.includes('"error"')) {
            filtered = events.filter(e => e.LevelDisplayName === 'Error');
        }
        if (rawArgs.includes('4625') || filterHashStr.includes('4625')) {
            filtered = events.filter(e => e.Id === 4625);
        }
        if (rawArgs.includes('security') || filterHashStr.includes('security')) {
            filtered = events.filter(e => e.ProviderName.includes('Security'));
        }

        const limited = filtered.slice(0, maxEvents);
        let output = `\nTimeCreated                  Id  LevelDisplayName  ProviderName                              Message\n`;
        output += `-----------                  --  ----------------  ------------                              -------\n`;
        for (const e of limited) {
            output += `${e.TimeCreated.padEnd(29)}${String(e.Id).padEnd(4)}${e.LevelDisplayName.padEnd(18)}${e.ProviderName.substring(0, 42).padEnd(42)}${e.Message.substring(0, 50)}\n`;
        }

        _checkObjective('get-winevent');
        if (rawArgs.includes('level=2') || rawArgs.includes("'error'") || rawArgs.includes('"error"') ||
            filterHashStr.includes('level=2') || filterHashStr.includes("'error'") ||
            filtered.some(e => e.LevelDisplayName === 'Error')) {
            _checkObjective('get-winevent-error');
        }
        if (logName.toLowerCase() === 'security' || rawArgs.includes('security') || filterHashStr.includes('security')) {
            _checkObjective('get-winevent-security');
        }

        return output;
    }

    /**
     * Get-Counter - Performance counter monitoring
     */
    function _cmdGetCounter(args, params) {
        const counter = args[0] || params.Counter || '';
        const counterLower = counter.toLowerCase().replace(/['"]/g, '');

        if (counterLower.includes('processor')) {
            _checkObjective('get-counter-cpu');
            return `
Timestamp                 CounterSamples
---------                 --------------
2/8/2026 10:15:32 AM      \\\\${config.hostname}\\Processor(_Total)\\% Processor Time :
                          23.4521`;
        }
        if (counterLower.includes('memory')) {
            _checkObjective('get-counter-memory');
            return `
Timestamp                 CounterSamples
---------                 --------------
2/8/2026 10:15:32 AM      \\\\${config.hostname}\\Memory\\Available MBytes :
                          6842`;
        }
        if (counterLower.includes('disk')) {
            _checkObjective('get-counter-disk');
            return `
Timestamp                 CounterSamples
---------                 --------------
2/8/2026 10:15:32 AM      \\\\${config.hostname}\\PhysicalDisk(_Total)\\Current Disk Queue Length :
                          0`;
        }

        return `
Timestamp                 CounterSamples
---------                 --------------
2/8/2026 10:15:32 AM      \\\\${config.hostname}\\${counter} :
                          42.17`;
    }

    /**
     * Get-WmiObject - WMI queries
     */
    function _cmdGetWmiObject(args, params) {
        const className = params.Class || args[0] || '';
        const classLower = className.toLowerCase();

        if (classLower === 'win32_operatingsystem') {
            _checkObjective('get-wmiobject-os');
            return `
Caption                  : Microsoft Windows Server 2022 Standard
Version                  : 10.0.20348
FreePhysicalMemory       : 6842368
TotalVisibleMemorySize   : 16777216
LastBootUpTime           : 20260205081532.500000-480
SystemDirectory          : C:\\Windows\\system32`;
        }
        if (classLower === 'win32_logicaldisk') {
            _checkObjective('get-wmiobject-disk');
            return `
DeviceID     Size            FreeSpace
--------     ----            ---------
C:           107374182400    64424509440
D:           214748364800    171798691840
E:           53687091200     48318382080`;
        }
        if (classLower === 'win32_computersystem') {
            return `
Domain              : ${config.domain}
Manufacturer        : Dell Inc.
Model               : PowerEdge R740
Name                : ${config.hostname}
NumberOfProcessors  : 2
TotalPhysicalMemory : 17179869184`;
        }

        return `<span class="ps-error">Get-WmiObject : Invalid class "${className}"</span>`;
    }

    /**
     * Start-Transcript - Begin recording session
     */
    function _cmdStartTranscript(args, params) {
        const path = params.Path || 'C:\\Users\\Administrator\\Documents\\PowerShell_transcript.txt';
        _checkObjective('start-transcript');
        return `<span class="ps-success">Transcript started, output file is ${path}</span>`;
    }

    /**
     * Measure-Command - Benchmark command execution time
     */
    function _cmdMeasureCommand(args, params) {
        const ms = Math.floor(Math.random() * 500) + 50;
        _checkObjective('measure-command');
        return `
Days              : 0
Hours             : 0
Minutes           : 0
Seconds           : 0
Milliseconds      : ${ms}
Ticks             : ${ms * 10000}
TotalDays         : ${(ms / 86400000).toFixed(10)}
TotalHours        : ${(ms / 3600000).toFixed(8)}
TotalMinutes      : ${(ms / 60000).toFixed(6)}
TotalSeconds      : ${(ms / 1000).toFixed(4)}
TotalMilliseconds : ${ms}`;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // AUTOMATION & REMOTING COMMANDS
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Export-Csv - Export pipeline data to CSV
     */
    function _cmdExportCsv(args, params, pipeInput) {
        const path = params.Path || args[0] || 'output.csv';
        _checkObjective('export-csv');
        return `<span class="ps-success">Data exported to ${path}</span>`;
    }

    /**
     * Import-Csv - Import data from CSV
     */
    function _cmdImportCsv(args, params) {
        const path = params.Path || args[0] || 'data.csv';
        _checkObjective('import-csv');
        return `
Name          Id    CPU(s)    WorkingSet
----          --    ------    ----------
svchost       4012  184.33    301244
ServerManager 2548  72.08     93180
lsass         876   31.55     58432
csrss         512   12.20     15360`;
    }

    /**
     * Register-ScheduledTask - Create a scheduled task
     */
    function _cmdRegisterScheduledTask(args, params) {
        const taskName = params.TaskName || 'NewTask';
        _checkObjective('register-scheduledtask');
        return `<span class="ps-success">
TaskPath    TaskName                          State
--------    --------                          -----
\\           ${taskName.padEnd(34)}Ready</span>`;
    }

    /**
     * Get-ScheduledTask - List scheduled tasks
     */
    function _cmdGetScheduledTask(args, params) {
        const taskName = params.TaskName;
        if (taskName) {
            _checkObjective('get-scheduledtask');
            return `
TaskPath    TaskName                          State
--------    --------                          -----
\\           ${taskName.padEnd(34)}Ready`;
        }
        _checkObjective('get-scheduledtask');
        return `
TaskPath    TaskName                          State
--------    --------                          -----
\\           DailyBackup                       Ready
\\           WeeklyMaintenance                 Ready
\\           SecurityScan                      Running
\\Microsoft  .NET Framework NGEN v4.0.30319    Ready
\\Microsoft  Consolidator                      Ready`;
    }

    /**
     * Invoke-Command - Execute command on remote computer
     */
    function _cmdInvokeCommand(args, params) {
        const computer = params.ComputerName || 'localhost';
        _checkObjective('invoke-command');
        return `
Status   Name               DisplayName                    PSComputerName
------   ----               -----------                    --------------
Running  W32Time            Windows Time                   ${computer}
Running  DNS                DNS Server                     ${computer}
Running  Spooler            Print Spooler                  ${computer}
Running  WinRM              Windows Remote Management      ${computer}`;
    }

    /**
     * New-PSSession - Create persistent remote session
     */
    function _cmdNewPSSession(args, params) {
        const computer = params.ComputerName || args[0] || 'SERVER01';
        const computers = computer.split(',').map(c => c.trim());
        let output = `\n Id  Name            ComputerName    ComputerType  State    ConfigurationName\n`;
        output += ` --  ----            ------------    ------------  -----    -----------------\n`;
        computers.forEach((c, i) => {
            output += `  ${i + 1}  WinRM${i + 1}          ${c.padEnd(16)}RemoteMachine Running  Microsoft.PowerShell\n`;
        });
        _checkObjective('new-pssession');
        return output;
    }

    /**
     * ForEach-Object - Process each pipeline object
     */
    function _cmdForEachObject(args, params, pipeInput) {
        if (pipeInput) {
            _checkObjective('foreach-object');
            return pipeInput;
        }
        return '';
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // SYSTEM DIAGNOSTIC UTILITIES
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * dcdiag - Domain Controller diagnostics
     */
    function _cmdDcdiag(args, params) {
        const verbose = args.some(a => a.toLowerCase() === '/v');
        let output = `Directory Server Diagnosis

Performing initial setup:
   Trying to find home server...
   Home Server = ${config.hostname}
   * Identified AD Forest.
   Done gathering initial info.

Doing initial required tests

   Testing server: Default-First-Site-Name\\${config.hostname}
      Starting test: Connectivity
         ......................... ${config.hostname} passed test Connectivity
      Starting test: Advertising
         ......................... ${config.hostname} passed test Advertising
      Starting test: FrsEvent
         ......................... ${config.hostname} passed test FrsEvent
      Starting test: DFSREvent
         ......................... ${config.hostname} passed test DFSREvent
      Starting test: SysVolCheck
         ......................... ${config.hostname} passed test SysVolCheck
      Starting test: KccEvent
         ......................... ${config.hostname} passed test KccEvent
      Starting test: KnowsOfRoleHolders
         ......................... ${config.hostname} passed test KnowsOfRoleHolders
      Starting test: MachineAccount
         ......................... ${config.hostname} passed test MachineAccount
      Starting test: NCSecDesc
         ......................... ${config.hostname} passed test NCSecDesc
      Starting test: NetLogons
         ......................... ${config.hostname} passed test NetLogons
      Starting test: ObjectsReplicated
         ......................... ${config.hostname} passed test ObjectsReplicated
      Starting test: Replications
         ......................... ${config.hostname} passed test Replications
      Starting test: RidManager
         ......................... ${config.hostname} passed test RidManager
      Starting test: Services
         ......................... ${config.hostname} passed test Services`;
        _checkObjective('dcdiag');
        return output;
    }

    /**
     * repadmin - AD replication administration
     */
    function _cmdRepadmin(args, params) {
        const sub = (args[0] || '').toLowerCase().replace('/', '');

        if (sub === 'replsummary') {
            _checkObjective('repadmin');
            _checkObjective('check-replication');
            return `
Replication Summary Start Time: ${new Date().toISOString()}

Beginning data collection for replication summary, this may take awhile:
  Source DSA          largest delta    fails/total %%   error
  ${config.hostname}        15m:12s          0 /   5    0
  DC02                22m:45s          0 /   5    0

Destination DSA     largest delta    fails/total %%   error
  ${config.hostname}        15m:12s          0 /   5    0
  DC02                22m:45s          0 /   5    0`;
        }
        if (sub === 'showrepl') {
            _checkObjective('repadmin');
            _checkObjective('check-replication');
            return `
Repadmin: running command /showrepl against full DC localhost
Default-First-Site-Name\\${config.hostname}
DSA Options: IS_GC
Site Options: (none)
DSA object GUID: a1b2c3d4-e5f6-7890-abcd-ef1234567890
DSA invocationID: b2c3d4e5-f6a7-8901-bcde-f12345678901

==== INBOUND NEIGHBORS ====================================

DC=hexworth,DC=local
    Default-First-Site-Name\\DC02 via RPC
        DSA object GUID: c3d4e5f6-a7b8-9012-cdef-123456789012
        Last attempt @ ${new Date().toISOString()} was successful.`;
        }
        if (sub === 'syncall') {
            _checkObjective('repadmin');
            _checkObjective('check-replication');
            return `<span class="ps-success">Syncing all NC's held on ${config.hostname}.
Syncing partition: DC=hexworth,DC=local
CALLBACK MESSAGE: The following replication completed successfully:
From: DC02
To  : ${config.hostname}

SyncAll terminated with no errors.</span>`;
        }
        if (sub === 'kcc') {
            _checkObjective('repadmin');
            _checkObjective('check-replication');
            return `<span class="ps-success">Consistency check on ${config.hostname} successful.
KCC has verified and if necessary updated the replication topology.</span>`;
        }

        return `Usage: repadmin /replsummary | /showrepl | /syncall | /kcc`;
    }

    /**
     * sfc - System File Checker
     */
    function _cmdSfc(args, params) {
        const sub = (args[0] || '').toLowerCase().replace('/', '');
        if (sub === 'scannow') {
            _checkObjective('sfc-scannow');
            return `<span class="ps-success">
Beginning system scan.  This process will take some time.

Beginning verification phase of system scan.
Verification 100% complete.

Windows Resource Protection did not find any integrity violations.</span>`;
        }
        if (sub === 'verifyonly') {
            return `<span class="ps-success">
Beginning system scan.  This process will take some time.

Verification 100% complete.

Windows Resource Protection did not find any integrity violations.</span>`;
        }
        return `Usage: sfc /scannow | /verifyonly`;
    }

    /**
     * DISM - Deployment Image Servicing and Management
     */
    function _cmdDism(args, params) {
        const rawArgs = args.join(' ').toLowerCase();
        if (rawArgs.includes('checkhealth')) {
            _checkObjective('dism-checkhealth');
            return `<span class="ps-success">
Deployment Image Servicing and Management tool
Version: 10.0.20348.1

Image Version: 10.0.20348.2849

The component store is repairable.
The operation completed successfully.</span>`;
        }
        if (rawArgs.includes('restorehealth')) {
            _checkObjective('dism-restorehealth');
            return `<span class="ps-success">
Deployment Image Servicing and Management tool
Version: 10.0.20348.1

Image Version: 10.0.20348.2849

[==========================100.0%==========================]
The restore operation completed successfully.
The operation completed successfully.</span>`;
        }
        if (rawArgs.includes('scanhealth')) {
            return `<span class="ps-success">
Deployment Image Servicing and Management tool
Version: 10.0.20348.1

Image Version: 10.0.20348.2849

No component store corruption detected.
The operation completed successfully.</span>`;
        }
        return `Usage: DISM /Online /Cleanup-Image /CheckHealth | /ScanHealth | /RestoreHealth`;
    }

    /**
     * Export-WindowsDriver - Export installed drivers
     */
    function _cmdExportWindowsDriver(args, params) {
        const destination = params.Destination || args.find(a => !a.startsWith('-')) || 'D:\\DriverBackup';
        const online = args.some(a => a.toLowerCase() === '-online') || params.Online;
        _checkObjective('export-windowsdriver');
        return `<span class="ps-success">
Exporting drivers from ${online ? 'running OS' : 'image'}...

Driver: oem0.inf
Original File Name: oem0.inf
Provider Name: Intel Corporation
Class Name: Net
Date and Version: 02/01/2026

Driver: oem1.inf
Original File Name: oem1.inf
Provider Name: Microsoft
Class Name: Display
Date and Version: 01/15/2026

Driver: oem2.inf
Original File Name: oem2.inf
Provider Name: Realtek
Class Name: Media
Date and Version: 12/20/2025

Exported 14 driver packages to: ${destination}</span>`;
    }

    /**
     * wbadmin - Windows Server Backup command-line tool
     */
    function _cmdWbadmin(args, params) {
        const rawArgs = args.join(' ').toLowerCase();
        if (rawArgs.includes('start systemstatebackup')) {
            const target = rawArgs.match(/-backuptarget:(\S+)/)?.[1] || 'D:';
            _checkObjective('wbadmin-backup');
            return `<span class="ps-success">wbadmin 1.0 - Backup command-line tool
(C) Copyright Microsoft Corporation.

Starting system state backup...
Creating VSS snapshot...
Identifying component information...
Starting backup of System State to ${target} ...
Backup of system state completed successfully [${new Date().toISOString()}]</span>`;
        }
        if (rawArgs.includes('get versions')) {
            return `
wbadmin 1.0 - Backup command-line tool
(C) Copyright Microsoft Corporation.

Backup time: 2/8/2026 2:00 AM
Backup location: D:
Version identifier: 02/08/2026-10:00
Can recover: Application(s), System State

Backup time: 2/7/2026 2:00 AM
Backup location: D:
Version identifier: 02/07/2026-10:00
Can recover: Application(s), System State`;
        }
        if (rawArgs.includes('get status')) {
            return `
wbadmin 1.0 - Backup command-line tool
(C) Copyright Microsoft Corporation.

No backup is currently running.
Last backup: 2/8/2026 2:00 AM (Successful)`;
        }
        return `Usage: wbadmin start systemstatebackup -backupTarget:<volume> | get versions | get status`;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // DNS SERVER COMMANDS
    // ═══════════════════════════════════════════════════════════════════════════

    function _cmdGetDnsServerZone(args, params) {
        const zones = Object.entries(state.dnsZones);
        if (zones.length === 0) {
            return `<span class="ps-warning">No DNS zones configured.</span>`;
        }
        _checkObjective('get-dnsserverzone');
        let output = `\nZoneName                      ZoneType      IsAutoCreated  IsDsIntegrated  IsReverseLookupZone\n--------                      --------      -------------  --------------  -------------------\n`;
        zones.forEach(([name, zone]) => {
            output += `${name.padEnd(30)}${(zone.type || 'Primary').padEnd(14)}${(zone.autoCreated ? 'True' : 'False').padEnd(15)}${(zone.dsIntegrated ? 'True' : 'False').padEnd(16)}${zone.reverse ? 'True' : 'False'}\n`;
        });
        return output;
    }

    function _cmdGetDnsServerResourceRecord(args, params) {
        const zoneName = params.ZoneName || args[0];
        if (!zoneName) {
            return `<span class="ps-error">Get-DnsServerResourceRecord : -ZoneName parameter is required.</span>`;
        }
        const zone = state.dnsZones[zoneName];
        if (!zone) {
            return `<span class="ps-error">Get-DnsServerResourceRecord : Zone '${zoneName}' not found.</span>`;
        }
        _checkObjective('get-dnsserverresourcerecord');
        const records = zone.records || [];
        if (records.length === 0) {
            return `No records found in zone '${zoneName}'.`;
        }
        let output = `\nHostName                  RecordType  RecordData\n--------                  ----------  ----------\n`;
        records.forEach(r => {
            output += `${(r.name || '@').padEnd(26)}${(r.type || 'A').padEnd(12)}${r.data || ''}\n`;
        });
        return output;
    }

    function _cmdAddDnsServerResourceRecordA(args, params) {
        const zoneName = params.ZoneName || '';
        const name = params.Name || '';
        const ip = params.IPv4Address || '';
        if (!zoneName || !name || !ip) {
            return `<span class="ps-error">Add-DnsServerResourceRecordA : -ZoneName, -Name, and -IPv4Address parameters are required.</span>`;
        }
        if (!state.dnsZones[zoneName]) {
            return `<span class="ps-error">Add-DnsServerResourceRecordA : Zone '${zoneName}' not found.</span>`;
        }
        if (!state.dnsZones[zoneName].records) {
            state.dnsZones[zoneName].records = [];
        }
        state.dnsZones[zoneName].records.push({ name: name, type: 'A', data: ip });
        _checkObjective('add-dnsserverrecord');
        return `<span class="ps-success">DNS A record created: ${name}.${zoneName} -> ${ip}</span>`;
    }

    function _cmdSetDnsServerForwarder(args, params) {
        const ip = params.IPAddress || args[0];
        if (!ip) {
            return `<span class="ps-error">Set-DnsServerForwarder : -IPAddress parameter is required.</span>`;
        }
        state.dnsForwarders = [ip];
        _checkObjective('set-dnsserverforwarder');
        return `<span class="ps-success">DNS forwarder configured: ${ip}</span>`;
    }

    function _cmdGetDnsServerForwarder(args, params) {
        if (state.dnsForwarders.length === 0) {
            return `No forwarders configured.`;
        }
        let output = `\nIPAddress        UseRootHint\n---------        -----------\n`;
        state.dnsForwarders.forEach(ip => {
            output += `${ip.padEnd(17)}True\n`;
        });
        return output;
    }

    function _cmdClearDnsServerCache(args, params) {
        _checkObjective('clear-dnsservercache');
        return `<span class="ps-success">DNS server cache cleared successfully.</span>`;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // DHCP SERVER COMMANDS
    // ═══════════════════════════════════════════════════════════════════════════

    function _cmdGetDhcpServerv4Scope(args, params) {
        if (state.dhcpScopes.length === 0) {
            return `<span class="ps-warning">No DHCP scopes configured.</span>`;
        }
        _checkObjective('get-dhcpserverv4scope');
        let output = `\nScopeId          SubnetMask        Name                          State    StartRange        EndRange          LeaseDuration\n-------          ----------        ----                          -----    ----------        --------          -------------\n`;
        state.dhcpScopes.forEach(s => {
            output += `${(s.scopeId || '').padEnd(17)}${(s.subnetMask || '255.255.255.0').padEnd(18)}${(s.name || '').padEnd(30)}${(s.state || 'Active').padEnd(9)}${(s.startRange || '').padEnd(18)}${(s.endRange || '').padEnd(18)}${s.leaseDuration || '8.00:00:00'}\n`;
        });
        return output;
    }

    function _cmdAddDhcpServerv4Scope(args, params) {
        const name = params.Name || '';
        const startRange = params.StartRange || '';
        const endRange = params.EndRange || '';
        const subnetMask = params.SubnetMask || '255.255.255.0';
        if (!name || !startRange || !endRange) {
            return `<span class="ps-error">Add-DhcpServerv4Scope : -Name, -StartRange, and -EndRange parameters are required.</span>`;
        }
        const scopeId = startRange.split('.').slice(0, 3).join('.') + '.0';
        const existing = state.dhcpScopes.find(s => s.scopeId === scopeId);
        if (existing) {
            return `<span class="ps-error">Add-DhcpServerv4Scope : Scope '${scopeId}' already exists.</span>`;
        }
        state.dhcpScopes.push({
            scopeId, subnetMask, name, state: 'Active', startRange, endRange,
            leaseDuration: '8.00:00:00', options: {}, leases: [], reservations: []
        });
        _checkObjective('add-dhcpserverv4scope');
        return `<span class="ps-success">DHCP scope '${name}' (${scopeId}) created successfully.</span>`;
    }

    function _cmdGetDhcpServerv4Lease(args, params) {
        const scopeId = params.ScopeId || '';
        _checkObjective('get-dhcpserverv4lease');
        const scopes = scopeId ? state.dhcpScopes.filter(s => s.scopeId === scopeId) : state.dhcpScopes;
        let allLeases = [];
        scopes.forEach(s => { if (s.leases) allLeases = allLeases.concat(s.leases); });
        if (allLeases.length === 0) {
            return `No active leases found.`;
        }
        let output = `\nIPAddress          ClientId               HostName            LeaseExpiryTime\n---------          --------               --------            ---------------\n`;
        allLeases.forEach(l => {
            output += `${(l.ip || '').padEnd(19)}${(l.clientId || '').padEnd(23)}${(l.hostname || '').padEnd(20)}${l.expiry || ''}\n`;
        });
        return output;
    }

    function _cmdAddDhcpServerv4Reservation(args, params) {
        const scopeId = params.ScopeId || '';
        const ip = params.IPAddress || '';
        const clientId = params.ClientId || '';
        const name = params.Name || params.Description || '';
        if (!scopeId || !ip || !clientId) {
            return `<span class="ps-error">Add-DhcpServerv4Reservation : -ScopeId, -IPAddress, and -ClientId parameters are required.</span>`;
        }
        const scope = state.dhcpScopes.find(s => s.scopeId === scopeId);
        if (!scope) {
            return `<span class="ps-error">Add-DhcpServerv4Reservation : Scope '${scopeId}' not found.</span>`;
        }
        if (!scope.reservations) scope.reservations = [];
        scope.reservations.push({ ip, clientId, name, scopeId });
        _checkObjective('add-dhcpserverv4reservation');
        return `<span class="ps-success">DHCP reservation created: ${ip} -> ${clientId} (${name || 'N/A'})</span>`;
    }

    function _cmdGetDhcpServerv4Reservation(args, params) {
        const scopeId = params.ScopeId || '';
        const scopes = scopeId ? state.dhcpScopes.filter(s => s.scopeId === scopeId) : state.dhcpScopes;
        let allRes = [];
        scopes.forEach(s => { if (s.reservations) allRes = allRes.concat(s.reservations); });
        if (allRes.length === 0) {
            return `No reservations found.`;
        }
        let output = `\nIPAddress          ClientId               Name                ScopeId\n---------          --------               ----                -------\n`;
        allRes.forEach(r => {
            output += `${(r.ip || '').padEnd(19)}${(r.clientId || '').padEnd(23)}${(r.name || '').padEnd(20)}${r.scopeId || ''}\n`;
        });
        return output;
    }

    function _cmdSetDhcpServerv4OptionValue(args, params) {
        const scopeId = params.ScopeId || '';
        if (!scopeId) {
            return `<span class="ps-error">Set-DhcpServerv4OptionValue : -ScopeId parameter is required.</span>`;
        }
        const scope = state.dhcpScopes.find(s => s.scopeId === scopeId);
        if (!scope) {
            return `<span class="ps-error">Set-DhcpServerv4OptionValue : Scope '${scopeId}' not found.</span>`;
        }
        if (!scope.options) scope.options = {};
        let changes = [];
        if (params.Router) { scope.options.router = params.Router; changes.push(`Router: ${params.Router}`); }
        if (params.DnsServer) { scope.options.dnsServer = params.DnsServer; changes.push(`DNS Server: ${params.DnsServer}`); }
        if (params.DnsDomain) { scope.options.dnsDomain = params.DnsDomain; changes.push(`DNS Domain: ${params.DnsDomain}`); }
        if (changes.length === 0) {
            return `<span class="ps-error">Set-DhcpServerv4OptionValue : Specify -Router, -DnsServer, or -DnsDomain.</span>`;
        }
        _checkObjective('set-dhcpserverv4optionvalue');
        return `<span class="ps-success">DHCP scope options updated for ${scopeId}:\n${changes.join('\n')}</span>`;
    }

    function _cmdGetDhcpServerv4OptionValue(args, params) {
        const scopeId = params.ScopeId || '';
        if (!scopeId) {
            return `<span class="ps-error">Get-DhcpServerv4OptionValue : -ScopeId parameter is required.</span>`;
        }
        const scope = state.dhcpScopes.find(s => s.scopeId === scopeId);
        if (!scope) {
            return `<span class="ps-error">Get-DhcpServerv4OptionValue : Scope '${scopeId}' not found.</span>`;
        }
        const opts = scope.options || {};
        let output = `\nOptionId  Name                Value                  VendorClass\n--------  ----                -----                  -----------\n`;
        if (opts.router) output += `003       Router              {${opts.router}}          Standard\n`;
        if (opts.dnsServer) output += `006       DNS Servers         {${opts.dnsServer}}     Standard\n`;
        if (opts.dnsDomain) output += `015       DNS Domain Name     ${opts.dnsDomain}        Standard\n`;
        if (!opts.router && !opts.dnsServer && !opts.dnsDomain) {
            return `No options configured for scope '${scopeId}'.`;
        }
        return output;
    }

    function _cmdGetDhcpServerv4ScopeStatistics(args, params) {
        const scopeId = params.ScopeId || '';
        const scopes = scopeId ? state.dhcpScopes.filter(s => s.scopeId === scopeId) : state.dhcpScopes;
        if (scopes.length === 0) {
            return `No DHCP scopes found.`;
        }
        let output = `\nScopeId          AddressesFree  AddressesInUse  PercentageInUse\n-------          -------------  --------------  ---------------\n`;
        scopes.forEach(s => {
            const inUse = (s.leases || []).length;
            const total = 254;
            const free = total - inUse;
            const pct = ((inUse / total) * 100).toFixed(1);
            output += `${(s.scopeId || '').padEnd(17)}${String(free).padEnd(15)}${String(inUse).padEnd(16)}${pct}%\n`;
        });
        return output;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // GROUP POLICY COMMANDS
    // ═══════════════════════════════════════════════════════════════════════════

    function _cmdGetGPO(args, params) {
        const all = params.All !== undefined || args.includes('-all');
        const name = params.Name || '';
        if (!all && !name) {
            return `Usage: Get-GPO -All  or  Get-GPO -Name "<name>"`;
        }
        if (all) {
            _checkObjective('get-gpo');
            if (state.gpos.length === 0) {
                return `No GPOs found in domain.`;
            }
            let output = `\nDisplayName                              DomainName          Owner                         Id\n-----------                              ----------          -----                         --\n`;
            state.gpos.forEach(g => {
                output += `${(g.name || '').padEnd(41)}${(config.domain).padEnd(20)}${('HEXWORTH\\Domain Admins').padEnd(30)}${g.id || ''}\n`;
            });
            return output;
        }
        const gpo = state.gpos.find(g => g.name.toLowerCase() === name.toLowerCase());
        if (!gpo) {
            return `<span class="ps-error">Get-GPO : A GPO with the name '${name}' was not found.</span>`;
        }
        return `\nDisplayName      : ${gpo.name}\nDomainName       : ${config.domain}\nOwner            : HEXWORTH\\Domain Admins\nId               : ${gpo.id}\nGpoStatus        : ${gpo.status || 'AllSettingsEnabled'}\nCreationTime     : ${gpo.created || new Date().toISOString()}\nModificationTime : ${gpo.modified || new Date().toISOString()}`;
    }

    function _cmdNewGPO(args, params) {
        const name = params.Name || '';
        if (!name) {
            return `<span class="ps-error">New-GPO : -Name parameter is required.</span>`;
        }
        const existing = state.gpos.find(g => g.name.toLowerCase() === name.toLowerCase());
        if (existing) {
            return `<span class="ps-error">New-GPO : A GPO with the name '${name}' already exists.</span>`;
        }
        const id = _generateGUID();
        const now = new Date().toISOString();
        state.gpos.push({ name, id, status: 'AllSettingsEnabled', created: now, modified: now, links: [] });
        _checkObjective('new-gpo');
        return `<span class="ps-success">\nDisplayName      : ${name}\nDomainName       : ${config.domain}\nOwner            : HEXWORTH\\Domain Admins\nId               : ${id}\nGpoStatus        : AllSettingsEnabled\nCreationTime     : ${now}\nModificationTime : ${now}</span>`;
    }

    function _cmdNewGPLink(args, params) {
        const name = params.Name || '';
        const target = params.Target || '';
        if (!name || !target) {
            return `<span class="ps-error">New-GPLink : -Name and -Target parameters are required.</span>`;
        }
        const gpo = state.gpos.find(g => g.name.toLowerCase() === name.toLowerCase());
        if (!gpo) {
            return `<span class="ps-error">New-GPLink : GPO '${name}' not found.</span>`;
        }
        if (!gpo.links) gpo.links = [];
        gpo.links.push(target);
        _checkObjective('new-gplink');
        return `<span class="ps-success">\nGpoId       : ${gpo.id}\nDisplayName : ${gpo.name}\nEnabled     : True\nEnforced    : False\nTarget      : ${target}</span>`;
    }

    function _cmdGetGPOReport(args, params) {
        const name = params.Name || '';
        if (!name) {
            return `<span class="ps-error">Get-GPOReport : -Name parameter is required.</span>`;
        }
        const gpo = state.gpos.find(g => g.name.toLowerCase() === name.toLowerCase());
        if (!gpo) {
            return `<span class="ps-error">Get-GPOReport : GPO '${name}' not found.</span>`;
        }
        _checkObjective('get-gporeport');
        return `
═══════════════════════════════════════════════
GPO Report: ${gpo.name}
═══════════════════════════════════════════════
Created     : ${gpo.created || new Date().toISOString()}
Modified    : ${gpo.modified || new Date().toISOString()}
Owner       : HEXWORTH\\Domain Admins
Status      : ${gpo.status || 'AllSettingsEnabled'}
Links       : ${(gpo.links || []).join(', ') || 'None'}

── COMPUTER CONFIGURATION ──────────────────────
  Policies
    Administrative Templates
      System > Group Policy
        Configure Group Policy Caching .... Enabled
      Windows Components > Windows Update
        Configure Automatic Updates ....... Enabled (4 - Auto download and schedule)

── USER CONFIGURATION ──────────────────────────
  Policies
    Administrative Templates
      Desktop
        Remove Recycle Bin icon ........... Not configured
      Start Menu and Taskbar
        Remove Run menu .................. Not configured`;
    }

    function _cmdBackupGPO(args, params) {
        const name = params.Name || '';
        const path = params.Path || 'C:\\GPOBackups';
        if (!name) {
            return `<span class="ps-error">Backup-GPO : -Name parameter is required.</span>`;
        }
        const gpo = state.gpos.find(g => g.name.toLowerCase() === name.toLowerCase());
        if (!gpo) {
            return `<span class="ps-error">Backup-GPO : GPO '${name}' not found.</span>`;
        }
        _checkObjective('backup-gpo');
        const backupId = _generateGUID();
        return `<span class="ps-success">\nDisplayName     : ${gpo.name}\nGpoId           : ${gpo.id}\nId              : ${backupId}\nBackupDirectory : ${path}\nCreationTime    : ${new Date().toISOString()}\nDomainName      : ${config.domain}

GPO '${gpo.name}' backed up successfully.</span>`;
    }

    function _cmdGpupdate(args, params) {
        _checkObjective('gpupdate');
        return `<span class="ps-success">Updating policy...

Computer Policy update has completed successfully.
User Policy update has completed successfully.</span>`;
    }

    function _cmdGpresult(args, params) {
        _checkObjective('gpresult');
        return `
Microsoft (R) Windows (R) Operating System Group Policy Result tool v2.0
(C) Microsoft Corporation.

Created on ${new Date().toISOString()} for ${config.hostname}

RSOP data for HEXWORTH\\Administrator on ${config.hostname}:

── COMPUTER SETTINGS ───────────────────────────
  Last time Group Policy was applied: ${new Date().toISOString()}
  Applied Group Policy Objects:
    ${state.gpos.map(g => g.name).join('\n    ') || 'Default Domain Policy'}
    Default Domain Controllers Policy

── USER SETTINGS ───────────────────────────────
  Last time Group Policy was applied: ${new Date().toISOString()}
  Applied Group Policy Objects:
    Default Domain Policy`;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // IIS / WEB SERVER COMMANDS
    // ═══════════════════════════════════════════════════════════════════════════

    function _cmdGetWebsite(args, params) {
        _checkObjective('get-website');
        if (state.iisSites.length === 0) {
            return `<span class="ps-warning">No websites configured.</span>`;
        }
        let output = `\nName                      ID   State     Physical Path                              Bindings\n----                      --   -----     -------------                              --------\n`;
        state.iisSites.forEach(s => {
            const bindings = (s.bindings || []).map(b => `${b.protocol}/*:${b.port}:${b.hostHeader || ''}`).join(', ');
            output += `${(s.name || '').padEnd(26)}${String(s.id || 1).padEnd(5)}${(s.state || 'Started').padEnd(10)}${(s.physicalPath || '').padEnd(43)}${bindings}\n`;
        });
        return output;
    }

    function _cmdNewWebsite(args, params) {
        const name = params.Name || '';
        if (!name) {
            return `<span class="ps-error">New-Website : -Name parameter is required.</span>`;
        }
        const existing = state.iisSites.find(s => s.name.toLowerCase() === name.toLowerCase());
        if (existing) {
            return `<span class="ps-error">New-Website : Website '${name}' already exists.</span>`;
        }
        const port = parseInt(params.Port) || 80;
        const physicalPath = params.PhysicalPath || `C:\\inetpub\\${name}`;
        const hostHeader = params.HostHeader || '';
        const id = state.iisSites.length + 1;
        state.iisSites.push({
            name, id, state: 'Started', physicalPath, bindings: [{ protocol: 'http', port, hostHeader }]
        });
        _checkObjective('new-website');
        return `<span class="ps-success">\nName            : ${name}\nID              : ${id}\nState           : Started\nPhysical Path   : ${physicalPath}\nBindings        : http/*:${port}:${hostHeader}</span>`;
    }

    function _cmdGetWebAppPool(args, params) {
        if (state.iisAppPools.length === 0) {
            return `<span class="ps-warning">No application pools configured.</span>`;
        }
        let output = `\nName                        State     ManagedRuntimeVersion\n----                        -----     ---------------------\n`;
        state.iisAppPools.forEach(p => {
            output += `${(p.name || '').padEnd(28)}${(p.state || 'Started').padEnd(10)}${p.runtime || 'v4.0'}\n`;
        });
        return output;
    }

    function _cmdNewWebAppPool(args, params) {
        const name = params.Name || '';
        if (!name) {
            return `<span class="ps-error">New-WebAppPool : -Name parameter is required.</span>`;
        }
        const existing = state.iisAppPools.find(p => p.name.toLowerCase() === name.toLowerCase());
        if (existing) {
            return `<span class="ps-error">New-WebAppPool : Application pool '${name}' already exists.</span>`;
        }
        state.iisAppPools.push({ name, state: 'Started', runtime: 'v4.0' });
        _checkObjective('new-webapppool');
        return `<span class="ps-success">\nName                    : ${name}\nState                   : Started\nManagedRuntimeVersion   : v4.0</span>`;
    }

    function _cmdGetWebBinding(args, params) {
        const siteName = params.Name || '';
        const sites = siteName ? state.iisSites.filter(s => s.name.toLowerCase() === siteName.toLowerCase()) : state.iisSites;
        let allBindings = [];
        sites.forEach(s => {
            (s.bindings || []).forEach(b => allBindings.push({ ...b, site: s.name }));
        });
        if (allBindings.length === 0) {
            return `No bindings found.`;
        }
        let output = `\nprotocol  bindingInformation        sslFlags\n--------  ------------------        --------\n`;
        allBindings.forEach(b => {
            output += `${(b.protocol || 'http').padEnd(10)}${(`*:${b.port}:${b.hostHeader || ''}`).padEnd(26)}${b.sslFlags || '0'}\n`;
        });
        return output;
    }

    function _cmdNewWebBinding(args, params) {
        const name = params.Name || '';
        if (!name) {
            return `<span class="ps-error">New-WebBinding : -Name parameter is required.</span>`;
        }
        const site = state.iisSites.find(s => s.name.toLowerCase() === name.toLowerCase());
        if (!site) {
            return `<span class="ps-error">New-WebBinding : Website '${name}' not found.</span>`;
        }
        const protocol = params.Protocol || 'http';
        const port = parseInt(params.Port) || (protocol === 'https' ? 443 : 80);
        const hostHeader = params.HostHeader || '';
        if (!site.bindings) site.bindings = [];
        site.bindings.push({ protocol, port, hostHeader, sslFlags: protocol === 'https' ? '1' : '0' });
        if (protocol.toLowerCase() === 'https') {
            _checkObjective('new-webbinding-https');
        }
        _checkObjective('new-webbinding');
        return `<span class="ps-success">Binding added: ${protocol}/*:${port}:${hostHeader}</span>`;
    }

    function _cmdSetWebConfigurationProperty(args, params) {
        const value = params.Value || '';
        const rawArgs = (args || []).join(' ').toLowerCase();
        if (rawArgs.includes('windowsauthentication') || rawArgs.includes('authentication')) {
            if (value.toLowerCase() === 'true') {
                _checkObjective('set-webconfigurationproperty');
                return `<span class="ps-success">Windows Authentication enabled successfully.</span>`;
            } else {
                return `Windows Authentication disabled.`;
            }
        }
        _checkObjective('set-webconfigurationproperty');
        return `<span class="ps-success">Web configuration property updated.</span>`;
    }

    function _cmdStartWebsite(args, params) {
        const name = params.Name || args[0];
        if (!name) {
            return `<span class="ps-error">Start-Website : -Name parameter is required.</span>`;
        }
        const site = state.iisSites.find(s => s.name.toLowerCase() === name.toLowerCase());
        if (!site) {
            return `<span class="ps-error">Start-Website : Website '${name}' not found.</span>`;
        }
        site.state = 'Started';
        return `<span class="ps-success">Website '${name}' started successfully.</span>`;
    }

    function _cmdStopWebsite(args, params) {
        const name = params.Name || args[0];
        if (!name) {
            return `<span class="ps-error">Stop-Website : -Name parameter is required.</span>`;
        }
        const site = state.iisSites.find(s => s.name.toLowerCase() === name.toLowerCase());
        if (!site) {
            return `<span class="ps-error">Stop-Website : Website '${name}' not found.</span>`;
        }
        site.state = 'Stopped';
        return `<span class="ps-success">Website '${name}' stopped successfully.</span>`;
    }

    function _cmdRemoveWebsite(args, params) {
        const name = params.Name || args[0];
        if (!name) {
            return `<span class="ps-error">Remove-Website : -Name parameter is required.</span>`;
        }
        const idx = state.iisSites.findIndex(s => s.name.toLowerCase() === name.toLowerCase());
        if (idx === -1) {
            return `<span class="ps-error">Remove-Website : Website '${name}' not found.</span>`;
        }
        state.iisSites.splice(idx, 1);
        return `<span class="ps-success">Website '${name}' removed successfully.</span>`;
    }

    function _cmdImportModule(args, params) {
        const moduleName = params.Name || args[0] || '';
        return `<span class="ps-success">${moduleName || 'Module'} loaded successfully.</span>`;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // REMOTE DESKTOP SERVICES COMMANDS
    // ═══════════════════════════════════════════════════════════════════════════

    function _cmdGetRDSessionCollection(args, params) {
        _checkObjective('get-rdsessioncollection');
        if (state.rdsCollections.length === 0) {
            return `<span class="ps-warning">No session collections configured.</span>`;
        }
        let output = `\nCollectionName                ResourceType         CollectionType\n--------------                ------------         --------------\n`;
        state.rdsCollections.forEach(c => {
            output += `${(c.name || '').padEnd(30)}${(c.resourceType || 'RemoteDesktop').padEnd(21)}${c.type || 'PooledUnmanaged'}\n`;
        });
        return output;
    }

    function _cmdNewRDSessionCollection(args, params) {
        const name = params.CollectionName || '';
        const host = params.SessionHost || config.hostname;
        if (!name) {
            return `<span class="ps-error">New-RDSessionCollection : -CollectionName parameter is required.</span>`;
        }
        state.rdsCollections.push({
            name, sessionHost: host, resourceType: 'RemoteDesktop', type: 'PooledUnmanaged', remoteApps: []
        });
        _checkObjective('new-rdsessioncollection');
        return `<span class="ps-success">\nCollectionName : ${name}\nSessionHost    : ${host}\nResourceType   : RemoteDesktop\nCollectionType : PooledUnmanaged\n\nSession collection '${name}' created successfully.</span>`;
    }

    function _cmdGetRDRemoteApp(args, params) {
        const collName = params.CollectionName || '';
        let apps = [];
        const collections = collName ? state.rdsCollections.filter(c => c.name.toLowerCase() === collName.toLowerCase()) : state.rdsCollections;
        collections.forEach(c => { if (c.remoteApps) apps = apps.concat(c.remoteApps); });
        if (apps.length === 0) {
            return `No RemoteApp programs found.`;
        }
        let output = `\nAlias             DisplayName                CollectionName\n-----             -----------                --------------\n`;
        apps.forEach(a => {
            output += `${(a.alias || '').padEnd(18)}${(a.displayName || '').padEnd(27)}${a.collection || ''}\n`;
        });
        return output;
    }

    function _cmdNewRDRemoteApp(args, params) {
        const collName = params.CollectionName || '';
        const displayName = params.DisplayName || '';
        const alias = params.Alias || displayName.replace(/\s+/g, '');
        const filePath = params.FilePath || '';
        if (!collName || !displayName) {
            return `<span class="ps-error">New-RDRemoteApp : -CollectionName and -DisplayName parameters are required.</span>`;
        }
        const coll = state.rdsCollections.find(c => c.name.toLowerCase() === collName.toLowerCase());
        if (!coll) {
            return `<span class="ps-error">New-RDRemoteApp : Collection '${collName}' not found.</span>`;
        }
        if (!coll.remoteApps) coll.remoteApps = [];
        coll.remoteApps.push({ alias, displayName, collection: collName, filePath });
        _checkObjective('new-rdremoteapp');
        return `<span class="ps-success">\nAlias          : ${alias}\nDisplayName    : ${displayName}\nCollectionName : ${collName}\nFilePath       : ${filePath || 'N/A'}\n\nRemoteApp '${displayName}' published successfully.</span>`;
    }

    function _cmdGetRDUserSession(args, params) {
        _checkObjective('get-rdusersession');
        if (state.rdsSessions.length === 0) {
            return `No active RD sessions found.`;
        }
        let output = `\nUserName              HostServer       SessionId  SessionState   IdleTime\n--------              ----------       ---------  ------------   --------\n`;
        state.rdsSessions.forEach(s => {
            output += `${(s.userName || '').padEnd(22)}${(s.hostServer || config.hostname).padEnd(17)}${String(s.sessionId || 1).padEnd(11)}${(s.state || 'Active').padEnd(15)}${s.idleTime || '00:00:00'}\n`;
        });
        return output;
    }

    function _cmdGetRDSessionHost(args, params) {
        let output = `\nSessionHost          SessionsCount  NewConnectionsAllowed\n-----------          -------------  ---------------------\n`;
        output += `${config.hostname.padEnd(21)}${String(state.rdsSessions.length).padEnd(15)}Yes\n`;
        return output;
    }

    function _cmdSetRDLicenseConfiguration(args, params) {
        const server = params.LicenseServer || '';
        const mode = params.Mode || 'PerUser';
        if (!server) {
            return `<span class="ps-error">Set-RDLicenseConfiguration : -LicenseServer parameter is required.</span>`;
        }
        state.rdsLicensing = { server, mode };
        _checkObjective('set-rdlicenseconfiguration');
        return `<span class="ps-success">\nLicenseServer : ${server}\nMode          : ${mode}\n\nRD Licensing configuration updated successfully.</span>`;
    }

    function _cmdGetRDLicenseConfiguration(args, params) {
        if (!state.rdsLicensing.server) {
            return `LicenseServer : Not configured\nMode          : Not configured`;
        }
        return `\nLicenseServer : ${state.rdsLicensing.server}\nMode          : ${state.rdsLicensing.mode || 'PerUser'}`;
    }

    function _cmdDisconnectRDUserSession(args, params) {
        const sessionId = parseInt(params.UnifiedSessionId || args[0]);
        if (isNaN(sessionId)) {
            return `<span class="ps-error">Disconnect-RDUserSession : -UnifiedSessionId parameter is required.</span>`;
        }
        const session = state.rdsSessions.find(s => s.sessionId === sessionId);
        if (!session) {
            return `<span class="ps-error">Disconnect-RDUserSession : Session ${sessionId} not found.</span>`;
        }
        session.state = 'Disconnected';
        return `<span class="ps-success">Session ${sessionId} disconnected.</span>`;
    }

    function _cmdInvokeRDUserSessionLogoff(args, params) {
        const sessionId = parseInt(params.UnifiedSessionId || args[0]);
        if (isNaN(sessionId)) {
            return `<span class="ps-error">Invoke-RDUserSessionLogoff : -UnifiedSessionId parameter is required.</span>`;
        }
        const idx = state.rdsSessions.findIndex(s => s.sessionId === sessionId);
        if (idx === -1) {
            return `<span class="ps-error">Invoke-RDUserSessionLogoff : Session ${sessionId} not found.</span>`;
        }
        state.rdsSessions.splice(idx, 1);
        return `<span class="ps-success">Session ${sessionId} logged off.</span>`;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // CERTIFICATE SERVICES COMMANDS
    // ═══════════════════════════════════════════════════════════════════════════

    function _cmdGetCATemplate(args, params) {
        _checkObjective('get-catemplate');
        if (state.caTemplates.length === 0) {
            return `<span class="ps-warning">No CA templates available.</span>`;
        }
        let output = `\nName                   Oid\n----                   ---\n`;
        state.caTemplates.forEach(t => {
            output += `${(t.name || '').padEnd(23)}${t.oid || ''}\n`;
        });
        return output;
    }

    function _cmdGetCertificate(args, params) {
        const template = params.Template || '';
        const subject = params.SubjectName || params.DnsName || 'CN=hexworth.local';
        if (!template) {
            // List local certs
            if (state.localCerts.length === 0) {
                return `No certificates found in local store.`;
            }
            let output = `\nThumbprint                               Subject\n----------                               -------\n`;
            state.localCerts.forEach(c => {
                output += `${(c.thumbprint || '').padEnd(41)}${c.subject || ''}\n`;
            });
            return output;
        }
        const thumbprint = _generateHexString(40);
        const now = new Date();
        const expiry = new Date(now.getTime() + 730 * 24 * 60 * 60 * 1000);
        state.localCerts.push({
            thumbprint, subject, template, notBefore: now.toISOString(),
            notAfter: expiry.toISOString()
        });
        _checkObjective('get-certificate');
        return `<span class="ps-success">\nStatus       : Issued\nThumbprint   : ${thumbprint}\nSubject      : ${subject}\nTemplate     : ${template}\nNotBefore    : ${now.toISOString()}\nNotAfter     : ${expiry.toISOString()}\n\nCertificate request completed successfully.</span>`;
    }

    function _cmdPublishCRL(args, params) {
        _checkObjective('publish-crl');
        const now = new Date();
        const next = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        return `<span class="ps-success">\nCRL Information:\n  CA Name          : hexworth-${config.hostname}-CA\n  Publication Time  : ${now.toISOString()}\n  Next Update       : ${next.toISOString()}\n  CRL Number        : 42\n\nCRL published successfully.</span>`;
    }

    function _cmdBackupCARoleService(args, params) {
        const path = params.Path || args.find(a => !a.startsWith('-')) || 'C:\\CABackup';
        _checkObjective('backup-caroleservice');
        return `<span class="ps-success">\nBacking up CA role service to: ${path}\n  CA private key .......... Done\n  CA database ............. Done\n  CA database logs ........ Done\n\nCA backup completed successfully.\nBackup location: ${path}</span>`;
    }

    function _cmdCertutil(args, params) {
        const rawArgs = (args || []).join(' ').toLowerCase();
        if (rawArgs.includes('-crl')) {
            _checkObjective('publish-crl');
            return `<span class="ps-success">CertUtil: -CRL command completed successfully.</span>`;
        }
        if (rawArgs.includes('-backup')) {
            const path = rawArgs.match(/-backup\s+(\S+)/)?.[1] || 'C:\\CABackup';
            _checkObjective('backup-caroleservice');
            return `<span class="ps-success">CertUtil: -backup command completed successfully.\nBackup to: ${path}</span>`;
        }
        if (rawArgs.includes('-ca')) {
            return `\nCA Name              : hexworth-${config.hostname}-CA\nCA Type              : Enterprise Subordinate\nServer               : ${config.hostname}.${config.domain}\nKey Length           : 4096\nHash Algorithm       : sha256\nStatus               : Running`;
        }
        if (rawArgs.includes('-view')) {
            let output = `\nRow 1:\n  Serial Number: "6100000002"\n  Common Name: "${config.hostname}.${config.domain}"\n  Certificate Expiration Date: 2/8/2028 12:00 AM\n  Certificate Template: "DomainController"\n`;
            output += `\nRow 2:\n  Serial Number: "6100000003"\n  Common Name: "hexworth.local"\n  Certificate Expiration Date: 2/8/2028 12:00 AM\n  Certificate Template: "WebServer"\n`;
            return output;
        }
        return `Usage: certutil -CRL | -backup <path> | -CA | -view`;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // AD REPLICATION / SITES COMMANDS
    // ═══════════════════════════════════════════════════════════════════════════

    function _cmdGetADReplicationSite(args, params) {
        _checkObjective('get-adreplicationsite');
        if (state.adSites.length === 0) {
            return `<span class="ps-warning">No AD sites found.</span>`;
        }
        let output = `\nName                                Description\n----                                -----------\n`;
        state.adSites.forEach(s => {
            output += `${(s.name || '').padEnd(36)}${s.description || ''}\n`;
        });
        return output;
    }

    function _cmdNewADReplicationSite(args, params) {
        const name = params.Name || args[0];
        if (!name) {
            return `<span class="ps-error">New-ADReplicationSite : -Name parameter is required.</span>`;
        }
        const existing = state.adSites.find(s => s.name.toLowerCase() === name.toLowerCase());
        if (existing) {
            return `<span class="ps-error">New-ADReplicationSite : Site '${name}' already exists.</span>`;
        }
        state.adSites.push({ name, description: '', location: '', created: new Date().toISOString() });
        _checkObjective('new-adreplicationsite');
        return `<span class="ps-success">AD site '${name}' created successfully.</span>`;
    }

    function _cmdGetADReplicationSubnet(args, params) {
        if (state.adSubnets.length === 0) {
            return `No AD subnets found.`;
        }
        let output = `\nName                    Site                         Location\n----                    ----                         --------\n`;
        state.adSubnets.forEach(s => {
            output += `${(s.name || '').padEnd(24)}${(s.site || '').padEnd(29)}${s.location || ''}\n`;
        });
        return output;
    }

    function _cmdNewADReplicationSubnet(args, params) {
        const name = params.Name || '';
        const site = params.Site || '';
        if (!name || !site) {
            return `<span class="ps-error">New-ADReplicationSubnet : -Name and -Site parameters are required.</span>`;
        }
        const siteExists = state.adSites.find(s => s.name.toLowerCase() === site.toLowerCase());
        if (!siteExists) {
            return `<span class="ps-error">New-ADReplicationSubnet : Site '${site}' not found.</span>`;
        }
        state.adSubnets.push({ name, site, location: '' });
        _checkObjective('new-adreplicationsubnet');
        return `<span class="ps-success">AD subnet '${name}' created and associated with site '${site}'.</span>`;
    }

    function _cmdGetADReplicationSiteLink(args, params) {
        if (state.adSiteLinks.length === 0) {
            return `No AD site links found.`;
        }
        let output = `\nName                    Cost   ReplicationFrequencyInMinutes   SitesIncluded\n----                    ----   ----------------------------   -------------\n`;
        state.adSiteLinks.forEach(l => {
            output += `${(l.name || '').padEnd(24)}${String(l.cost || 100).padEnd(7)}${String(l.frequency || 180).padEnd(31)}${(l.sites || []).join(', ')}\n`;
        });
        return output;
    }

    function _cmdNewADReplicationSiteLink(args, params) {
        const name = params.Name || '';
        const sitesStr = params.SitesIncluded || '';
        const cost = parseInt(params.Cost) || 100;
        const frequency = parseInt(params.ReplicationFrequencyInMinutes) || 180;
        if (!name || !sitesStr) {
            return `<span class="ps-error">New-ADReplicationSiteLink : -Name and -SitesIncluded parameters are required.</span>`;
        }
        const sites = sitesStr.split(',').map(s => s.trim());
        state.adSiteLinks.push({ name, sites, cost, frequency });
        _checkObjective('new-adreplicationsitelink');
        _checkObjective('configure-sitelink');
        return `<span class="ps-success">\nName                         : ${name}\nCost                         : ${cost}\nReplicationFrequencyInMinutes: ${frequency}\nSitesIncluded                : ${sites.join(', ')}\n\nSite link '${name}' created successfully.</span>`;
    }

    function _cmdSetADReplicationSiteLink(args, params) {
        const identity = params.Identity || args[0] || '';
        if (!identity) {
            return `<span class="ps-error">Set-ADReplicationSiteLink : -Identity parameter is required.</span>`;
        }
        const link = state.adSiteLinks.find(l => l.name.toLowerCase() === identity.toLowerCase());
        if (!link) {
            return `<span class="ps-error">Set-ADReplicationSiteLink : Site link '${identity}' not found.</span>`;
        }
        if (params.Cost) link.cost = parseInt(params.Cost);
        if (params.ReplicationFrequencyInMinutes) link.frequency = parseInt(params.ReplicationFrequencyInMinutes);
        _checkObjective('configure-sitelink');
        _checkObjective('set-adreplicationsitelink');
        return `<span class="ps-success">Site link '${identity}' updated successfully.</span>`;
    }

    function _cmdGetADReplicationFailure(args, params) {
        _checkObjective('check-replication');
        _checkObjective('get-adreplicationfailure');
        return `
Server          : ${config.hostname}
FailureCount    : 0
FailureType     : None
FirstFailureTime: N/A
LastError        : 0 (operation completed successfully)

<span class="ps-success">No replication failures detected.</span>`;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // WINDOWS BACKUP COMMANDS
    // ═══════════════════════════════════════════════════════════════════════════

    function _cmdNewWBPolicy(args, params) {
        state.backupPolicy = { created: new Date().toISOString(), bmr: false, systemState: false, target: null };
        _checkObjective('new-wbpolicy');
        return `<span class="ps-success">New Windows Backup policy created.</span>`;
    }

    function _cmdNewWBBackupTarget(args, params) {
        const volumePath = params.VolumePath || params.NetworkPath || 'E:';
        const type = params.NetworkPath ? 'Network' : 'Local';
        state.backupTarget = { path: volumePath, type };
        _checkObjective('new-wbbackuptarget');
        return `<span class="ps-success">\nTarget Path : ${volumePath}\nTarget Type : ${type} Disk</span>`;
    }

    function _cmdAddWBBackupTarget(args, params) {
        if (!state.backupPolicy) {
            return `<span class="ps-error">Add-WBBackupTarget : No backup policy exists. Run New-WBPolicy first.</span>`;
        }
        if (!state.backupTarget) {
            return `<span class="ps-error">Add-WBBackupTarget : No backup target exists. Run New-WBBackupTarget first.</span>`;
        }
        state.backupPolicy.target = state.backupTarget;
        _checkObjective('add-wbbackuptarget');
        return `<span class="ps-success">Backup target added to policy: ${state.backupTarget.path}</span>`;
    }

    function _cmdAddWBBareMetalRecovery(args, params) {
        if (!state.backupPolicy) {
            return `<span class="ps-error">Add-WBBareMetalRecovery : No backup policy exists. Run New-WBPolicy first.</span>`;
        }
        state.backupPolicy.bmr = true;
        return `<span class="ps-success">Bare Metal Recovery option enabled.</span>`;
    }

    function _cmdAddWBSystemState(args, params) {
        if (!state.backupPolicy) {
            return `<span class="ps-error">Add-WBSystemState : No backup policy exists. Run New-WBPolicy first.</span>`;
        }
        state.backupPolicy.systemState = true;
        return `<span class="ps-success">System State backup option enabled.</span>`;
    }

    function _cmdStartWBBackup(args, params) {
        _checkObjective('start-wbbackup');
        const version = `02/08/2026-${String(10 + state.backups.length).padStart(2, '0')}:00`;
        state.backups.unshift({
            version, time: new Date().toISOString(), type: 'Full Server', size: '12.5 GB'
        });
        return `<span class="ps-success">Starting backup...
Creating VSS snapshot...
Backing up volume C: (System)...
Backing up system state...
Verifying backup integrity...

Backup of volume C: completed successfully.
Backup completed [${new Date().toISOString()}]</span>`;
    }

    function _cmdGetWBBackupSet(args, params) {
        _checkObjective('get-wbbackupset');
        if (state.backups.length === 0) {
            return `No backups found.`;
        }
        let output = `\nVersion Id              Backup Time                 Type\n----------              -----------                 ----\n`;
        state.backups.forEach(b => {
            output += `${(b.version || '').padEnd(24)}${(b.time || '').padEnd(28)}${b.type || 'Full Server'}\n`;
        });
        return output;
    }

    function _cmdGetWBSummary(args, params) {
        _checkObjective('get-wbsummary');
        const lastBackup = state.backups[0];
        return `
Last Backup Time    : ${lastBackup ? lastBackup.time : 'Never'}
Backup Target       : ${state.backupPolicy?.target?.path || 'Not configured'}
Last Backup Status  : ${lastBackup ? 'Successful' : 'No backups'}
Next Backup Time    : Scheduled (2:00 AM daily)
Policy Status       : ${state.backupPolicy ? 'Configured' : 'Not configured'}`;
    }

    function _cmdVssadmin(args, params) {
        const rawArgs = (args || []).join(' ').toLowerCase();
        if (rawArgs.includes('list writers')) {
            _checkObjective('vssadmin-list-writers');
            return `
vssadmin 1.1 - Volume Shadow Copy Service administrative command-line tool

Writer name: 'System Writer'
   Writer Id:   {${_generateGUID()}}
   Writer Instance Id: {${_generateGUID()}}
   State: [1] Stable
   Last error: No error

Writer name: 'Registry Writer'
   Writer Id:   {${_generateGUID()}}
   Writer Instance Id: {${_generateGUID()}}
   State: [1] Stable
   Last error: No error

Writer name: 'NTDS'
   Writer Id:   {${_generateGUID()}}
   Writer Instance Id: {${_generateGUID()}}
   State: [1] Stable
   Last error: No error

Writer name: 'DFS Replication service writer'
   Writer Id:   {${_generateGUID()}}
   Writer Instance Id: {${_generateGUID()}}
   State: [1] Stable
   Last error: No error`;
        }
        if (rawArgs.includes('list shadows')) {
            return `
vssadmin 1.1 - Volume Shadow Copy Service administrative command-line tool

Contents of shadow copy set ID: {${_generateGUID()}}
   Contained 1 shadow copies at creation time: ${new Date().toISOString()}
      Shadow Copy ID: {${_generateGUID()}}
         Original Volume: (C:)\\\\?\\Volume{${_generateGUID()}}\\
         Shadow Copy Volume: \\\\?\\GLOBALROOT\\Device\\HarddiskVolumeShadowCopy1
         Originating Machine: ${config.hostname}.${config.domain}
         Service Machine: ${config.hostname}.${config.domain}
         Provider: 'Microsoft Software Shadow Copy provider 1.0'`;
        }
        return `Usage: vssadmin list writers | list shadows`;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // WINDOWS FIREWALL COMMANDS
    // ═══════════════════════════════════════════════════════════════════════════

    function _cmdGetNetFirewallProfile(args, params) {
        _checkObjective('get-netfirewallprofile');
        const profiles = state.firewallProfiles;
        const names = ['Domain', 'Private', 'Public'];
        let output = '';
        names.forEach(name => {
            const p = profiles[name] || { enabled: true, defaultInbound: 'Block', defaultOutbound: 'Allow', logBlocked: false, logAllowed: false };
            output += `\nName                  : ${name}\nEnabled               : ${p.enabled !== false ? 'True' : 'False'}\nDefaultInboundAction  : ${p.defaultInbound || 'Block'}\nDefaultOutboundAction : ${p.defaultOutbound || 'Allow'}\nLogBlocked            : ${p.logBlocked ? 'True' : 'False'}\nLogAllowed            : ${p.logAllowed ? 'True' : 'False'}\n`;
        });
        return output;
    }

    function _cmdSetNetFirewallProfile(args, params) {
        const profileStr = params.Profile || '';
        if (!profileStr) {
            return `<span class="ps-error">Set-NetFirewallProfile : -Profile parameter is required.</span>`;
        }
        const profiles = profileStr.split(',').map(p => p.trim());
        let hasLogging = false;
        profiles.forEach(name => {
            if (!state.firewallProfiles[name]) {
                state.firewallProfiles[name] = { enabled: true, defaultInbound: 'Block', defaultOutbound: 'Allow', logBlocked: false, logAllowed: false };
            }
            if (params.LogBlocked !== undefined) {
                state.firewallProfiles[name].logBlocked = params.LogBlocked.toLowerCase() === 'true';
                hasLogging = true;
            }
            if (params.LogAllowed !== undefined) {
                state.firewallProfiles[name].logAllowed = params.LogAllowed.toLowerCase() === 'true';
                hasLogging = true;
            }
            if (params.Enabled !== undefined) {
                state.firewallProfiles[name].enabled = params.Enabled.toLowerCase() === 'true';
            }
        });
        if (hasLogging) {
            _checkObjective('configure-logging');
            _checkObjective('set-netfirewallprofile');
        }
        return `<span class="ps-success">Firewall profile(s) '${profiles.join(', ')}' updated successfully.</span>`;
    }

    function _cmdNewNetFirewallRule(args, params) {
        const displayName = params.DisplayName || '';
        if (!displayName) {
            return `<span class="ps-error">New-NetFirewallRule : -DisplayName parameter is required.</span>`;
        }
        const rule = {
            name: displayName.replace(/\s+/g, '-'),
            displayName,
            direction: params.Direction || 'Inbound',
            action: params.Action || 'Allow',
            protocol: params.Protocol || 'Any',
            localPort: params.LocalPort || 'Any',
            profile: params.Profile || 'Any',
            enabled: 'True'
        };
        state.firewallRules.unshift(rule);
        _checkObjective('new-netfirewallrule');
        _checkObjective('create-firewallrule');
        return `<span class="ps-success">\nName          : ${rule.name}\nDisplayName   : ${rule.displayName}\nDirection     : ${rule.direction}\nAction        : ${rule.action}\nProtocol      : ${rule.protocol}\nLocalPort     : ${rule.localPort}\nProfile       : ${rule.profile}\nEnabled       : True\n\nFirewall rule created successfully.</span>`;
    }

    function _cmdGetNetFirewallRule(args, params) {
        _checkObjective('get-netfirewallrule');
        let rules = [...state.firewallRules];
        if (params.Direction) {
            rules = rules.filter(r => r.direction.toLowerCase() === params.Direction.toLowerCase());
        }
        if (params.Enabled) {
            rules = rules.filter(r => r.enabled === params.Enabled);
        }
        if (params.DisplayName) {
            const search = params.DisplayName.toLowerCase();
            rules = rules.filter(r => (r.displayName || '').toLowerCase().includes(search));
        }
        if (rules.length === 0) {
            return `No matching firewall rules found.`;
        }
        let output = `\nDisplayName                        Direction  Action   Enabled\n-----------                        ---------  ------   -------\n`;
        rules.forEach(r => {
            output += `${(r.displayName || '').padEnd(35)}${(r.direction || '').padEnd(11)}${(r.action || '').padEnd(9)}${r.enabled || 'True'}\n`;
        });
        return output;
    }

    function _cmdEnableNetFirewallRule(args, params) {
        const displayName = params.DisplayName || '';
        if (!displayName) {
            return `<span class="ps-error">Enable-NetFirewallRule : -DisplayName parameter is required.</span>`;
        }
        const rule = state.firewallRules.find(r => (r.displayName || '').toLowerCase() === displayName.toLowerCase());
        if (!rule) {
            return `<span class="ps-error">Enable-NetFirewallRule : Rule '${displayName}' not found.</span>`;
        }
        rule.enabled = 'True';
        return `<span class="ps-success">Firewall rule '${displayName}' enabled.</span>`;
    }

    function _cmdDisableNetFirewallRule(args, params) {
        const displayName = params.DisplayName || '';
        if (!displayName) {
            return `<span class="ps-error">Disable-NetFirewallRule : -DisplayName parameter is required.</span>`;
        }
        const rule = state.firewallRules.find(r => (r.displayName || '').toLowerCase() === displayName.toLowerCase());
        if (!rule) {
            return `<span class="ps-error">Disable-NetFirewallRule : Rule '${displayName}' not found.</span>`;
        }
        rule.enabled = 'False';
        return `<span class="ps-success">Firewall rule '${displayName}' disabled.</span>`;
    }

    function _cmdRemoveNetFirewallRule(args, params) {
        const displayName = params.DisplayName || '';
        if (!displayName) {
            return `<span class="ps-error">Remove-NetFirewallRule : -DisplayName parameter is required.</span>`;
        }
        const idx = state.firewallRules.findIndex(r => (r.displayName || '').toLowerCase() === displayName.toLowerCase());
        if (idx === -1) {
            return `<span class="ps-error">Remove-NetFirewallRule : Rule '${displayName}' not found.</span>`;
        }
        state.firewallRules.splice(idx, 1);
        return `<span class="ps-success">Firewall rule '${displayName}' removed.</span>`;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // ADVANCED NETWORKING COMMANDS
    // ═══════════════════════════════════════════════════════════════════════════

    function _cmdNewNetLbfoTeam(args, params) {
        const name = params.Name || '';
        const members = params.TeamMembers || '';
        if (!name) {
            return `<span class="ps-error">New-NetLbfoTeam : -Name parameter is required.</span>`;
        }
        if (!state.nicTeams) state.nicTeams = [];
        const memberList = members ? members.split(',').map(m => m.trim()) : ['Ethernet1', 'Ethernet2'];
        state.nicTeams.push({ name, members: memberList, status: 'Up' });
        _checkObjective('new-netlbfoteam');
        return `<span class="ps-success">\nName         : ${name}\nTeamMembers  : {${memberList.join(', ')}}\nStatus       : Up\n\nNIC team '${name}' created successfully.</span>`;
    }

    function _cmdGetNetLbfoTeam(args, params) {
        if (!state.nicTeams || state.nicTeams.length === 0) {
            return `No NIC teams configured.`;
        }
        let output = `\nName                    TeamMembers              Status\n----                    -----------              ------\n`;
        state.nicTeams.forEach(t => {
            output += `${(t.name || '').padEnd(24)}${('{' + t.members.join(', ') + '}').padEnd(25)}${t.status || 'Up'}\n`;
        });
        return output;
    }

    function _cmdNewNetNat(args, params) {
        const name = params.Name || '';
        const prefix = params.InternalIPInterfaceAddressPrefix || '';
        if (!name || !prefix) {
            return `<span class="ps-error">New-NetNat : -Name and -InternalIPInterfaceAddressPrefix parameters are required.</span>`;
        }
        if (!state.natConfigs) state.natConfigs = [];
        state.natConfigs.push({ name, prefix });
        _checkObjective('new-netnat');
        return `<span class="ps-success">\nName                             : ${name}\nInternalIPInterfaceAddressPrefix : ${prefix}\nIcmpQueryTimeout                 : 30\nTcpEstablishedConnectionTimeout  : 1800\n\nNAT '${name}' created successfully.</span>`;
    }

    function _cmdGetNetNat(args, params) {
        if (!state.natConfigs || state.natConfigs.length === 0) {
            return `No NAT configurations found.`;
        }
        let output = `\nName                             InternalIPInterfaceAddressPrefix\n----                             --------------------------------\n`;
        state.natConfigs.forEach(n => {
            output += `${(n.name || '').padEnd(33)}${n.prefix || ''}\n`;
        });
        return output;
    }

    function _cmdGetNetRoute(args, params) {
        return `
ifIndex  DestinationPrefix    NextHop          RouteMetric
-------  -----------------    -------          -----------
4        0.0.0.0/0            10.0.1.1         256
4        10.0.1.0/24          0.0.0.0          256
1        127.0.0.0/8          0.0.0.0          256
4        10.0.1.255/32        0.0.0.0          256
1        255.255.255.255/32   0.0.0.0          256`;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // HELPER: GUID / HEX generation
    // ═══════════════════════════════════════════════════════════════════════════

    function _generateGUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
            const r = Math.random() * 16 | 0;
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
    }

    function _generateHexString(length) {
        let result = '';
        for (let i = 0; i < length; i++) {
            result += Math.floor(Math.random() * 16).toString(16).toUpperCase();
        }
        return result;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // UTILITY FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Format bytes to human readable
     */
    function _formatBytes(bytes) {
        if (!bytes || bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * Check and complete objective
     */
    function _checkObjective(id) {
        if (state.objectives.find(o => o.id === id) && !state.objectivesCompleted[id]) {
            state.objectivesCompleted[id] = true;
            const obj = state.objectives.find(o => o.id === id);
            _printOutput(`\n<span class="ps-success">✓ Objective: ${obj.desc}</span>`);

            // Notify lab via callback
            if (config.onObjectiveComplete) {
                config.onObjectiveComplete(id);
            }

            // Check if all complete
            const allComplete = state.objectives.every(o => state.objectivesCompleted[o.id]);
            if (allComplete && state.objectives.length > 0) {
                _printOutput(`\n<span class="ps-success"><img src="/assets/images/icons/icon-star.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain"> All objectives complete!</span>`);
            }
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // PATH UTILITIES
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Resolve a path (handle ., .., relative paths)
     */
    function _resolvePath(path) {
        if (!path) return state.currentDir;

        // Handle drive-only paths
        if (/^[A-Za-z]:$/.test(path)) {
            return path.toUpperCase();
        }

        // Handle absolute paths
        if (/^[A-Za-z]:\\/.test(path)) {
            return _normalizePath(path);
        }

        // Handle relative paths
        let resolved;
        if (path === '..') {
            // Go up one directory
            const parts = state.currentDir.split('\\');
            if (parts.length > 1) {
                parts.pop();
                resolved = parts.join('\\') || parts[0];
            } else {
                resolved = state.currentDir;
            }
        } else if (path === '.') {
            resolved = state.currentDir;
        } else if (path.startsWith('..\\')) {
            // Relative path starting with ..
            const parts = state.currentDir.split('\\');
            parts.pop();
            resolved = (parts.join('\\') || parts[0]) + '\\' + path.substring(3);
        } else if (path.startsWith('.\\')) {
            // Relative path starting with .
            resolved = state.currentDir + '\\' + path.substring(2);
        } else {
            // Simple relative path
            resolved = state.currentDir + '\\' + path;
        }

        return _normalizePath(resolved);
    }

    /**
     * Normalize path (remove double backslashes, handle case)
     */
    function _normalizePath(path) {
        // Replace forward slashes with backslashes
        path = path.replace(/\//g, '\\');

        // Remove trailing backslash (except for drive root)
        if (path.length > 3 && path.endsWith('\\')) {
            path = path.slice(0, -1);
        }

        // Normalize drive letter to uppercase
        if (/^[a-z]:/.test(path)) {
            path = path[0].toUpperCase() + path.substring(1);
        }

        // Handle multiple backslashes
        path = path.replace(/\\\\+/g, '\\');

        return path;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // TAB COMPLETION SYSTEM
    // ═══════════════════════════════════════════════════════════════════════════
    //
    // PowerShell's tab completion is one of its most powerful features for
    // discoverability. Users can tab-complete commands, paths, and parameters.
    //
    // ┌─────────────────────────────────────────────────────────────────────────┐
    // │ INSIGHT: PowerShell Tab Completion                                      │
    // ├─────────────────────────────────────────────────────────────────────────┤
    // │ Tab completion in PowerShell is context-aware:                          │
    // │                                                                         │
    // │ • Commands: Get-<Tab> cycles through Get-* cmdlets                      │
    // │ • Paths: C:\Win<Tab> completes to C:\Windows\                           │
    // │ • Parameters: Get-Service -<Tab> shows -Name, -DisplayName, etc.        │
    // │ • Values: Get-Service -Status <Tab> shows Running, Stopped, etc.        │
    // │                                                                         │
    // │ PSReadLine (default in PS 5.1+) enhances this with:                     │
    // │ • Ctrl+Space: Show all completions in a menu                            │
    // │ • Predictive IntelliSense: Ghost text showing predictions               │
    // │                                                                         │
    // │ Our simulator implements the core tab completion behavior.              │
    // └─────────────────────────────────────────────────────────────────────────┘

    /**
     * Complete list of available PowerShell cmdlets
     * Organized by module for clarity and maintenance
     */
    const AVAILABLE_COMMANDS = {
        // ─────────────────────────────────────────────────────────────────────
        // Core / Utility Commands
        // ─────────────────────────────────────────────────────────────────────
        core: [
            'Clear-Host',
            'Get-Command',
            'Get-Help',
            'Get-History',
            'Get-Member',
            'Write-Host',
            'Write-Output',
        ],

        // ─────────────────────────────────────────────────────────────────────
        // Navigation / Filesystem Commands
        // ─────────────────────────────────────────────────────────────────────
        filesystem: [
            'Get-Location',
            'Set-Location',
            'Push-Location',
            'Pop-Location',
            'Get-ChildItem',
            'Get-Item',
            'Get-Content',
            'Set-Content',
            'Add-Content',
            'New-Item',
            'Copy-Item',
            'Move-Item',
            'Remove-Item',
            'Rename-Item',
            'Test-Path',
            'Resolve-Path',
        ],

        // ─────────────────────────────────────────────────────────────────────
        // System / Computer Management
        // ─────────────────────────────────────────────────────────────────────
        system: [
            'Get-ComputerInfo',
            'Get-Date',
            'Get-Host',
            'Get-Process',
            'Stop-Process',
            'Get-Service',
            'Start-Service',
            'Stop-Service',
            'Restart-Service',
            'Set-Service',
            'Get-EventLog',
            'Get-WinEvent',
            'Get-Counter',
            'Get-WmiObject',
            'Start-Transcript',
            'Stop-Transcript',
            'Measure-Command',
            'Rename-Computer',
            'Restart-Computer',
            'Stop-Computer',
        ],

        // ─────────────────────────────────────────────────────────────────────
        // Server Manager Commands (Module: ServerManager)
        // ─────────────────────────────────────────────────────────────────────
        serverManager: [
            'Get-WindowsFeature',
            'Install-WindowsFeature',
            'Add-WindowsFeature',
            'Uninstall-WindowsFeature',
            'Remove-WindowsFeature',
        ],

        // ─────────────────────────────────────────────────────────────────────
        // Active Directory Commands (Module: ActiveDirectory)
        // ─────────────────────────────────────────────────────────────────────
        /**
         * ┌─────────────────────────────────────────────────────────────────────┐
         * │ INSIGHT: ActiveDirectory Module                                     │
         * ├─────────────────────────────────────────────────────────────────────┤
         * │ The ActiveDirectory module is NOT installed by default. It comes    │
         * │ with RSAT (Remote Server Administration Tools) or automatically     │
         * │ on Domain Controllers.                                              │
         * │                                                                     │
         * │ To install on Windows Server:                                       │
         * │   Install-WindowsFeature RSAT-AD-PowerShell                         │
         * │                                                                     │
         * │ To install on Windows 10/11:                                        │
         * │   Add-WindowsCapability -Name Rsat.ActiveDirectory* -Online         │
         * │                                                                     │
         * │ Once installed, it auto-loads when you use any Get-AD* cmdlet.      │
         * └─────────────────────────────────────────────────────────────────────┘
         */
        activeDirectory: [
            'Get-ADUser',
            'New-ADUser',
            'Set-ADUser',
            'Remove-ADUser',
            'Enable-ADAccount',
            'Disable-ADAccount',
            'Unlock-ADAccount',
            'Set-ADAccountPassword',
            'Get-ADGroup',
            'New-ADGroup',
            'Set-ADGroup',
            'Remove-ADGroup',
            'Get-ADGroupMember',
            'Add-ADGroupMember',
            'Remove-ADGroupMember',
            'Get-ADComputer',
            'New-ADComputer',
            'Set-ADComputer',
            'Remove-ADComputer',
            'Get-ADOrganizationalUnit',
            'New-ADOrganizationalUnit',
            'Get-ADDomain',
            'Get-ADDomainController',
            'Get-ADForest',
            'Get-ADObject',
            'Move-ADObject',
            'Search-ADAccount',
        ],

        // ─────────────────────────────────────────────────────────────────────
        // Storage Commands (Module: Storage)
        // ─────────────────────────────────────────────────────────────────────
        /**
         * ┌─────────────────────────────────────────────────────────────────────┐
         * │ INSIGHT: Storage Module                                             │
         * ├─────────────────────────────────────────────────────────────────────┤
         * │ The Storage module is built into Windows Server and Windows 10/11.  │
         * │                                                                     │
         * │ Storage hierarchy in Windows:                                       │
         * │ Physical Disk → Partition → Volume (with drive letter)              │
         * │                                                                     │
         * │ Key cmdlets:                                                        │
         * │ • Get-Disk: Physical disks (what you'd see in Device Manager)       │
         * │ • Get-Partition: Partitions on a disk                               │
         * │ • Get-Volume: Volumes (what you'd see in Disk Management)           │
         * │                                                                     │
         * │ For Storage Spaces:                                                 │
         * │ • Get-StoragePool, New-StoragePool                                  │
         * │ • Get-VirtualDisk, New-VirtualDisk                                  │
         * └─────────────────────────────────────────────────────────────────────┘
         */
        storage: [
            'Get-Disk',
            'Initialize-Disk',
            'Set-Disk',
            'Clear-Disk',
            'Get-Partition',
            'New-Partition',
            'Remove-Partition',
            'Resize-Partition',
            'Set-Partition',
            'Get-Volume',
            'New-Volume',
            'Format-Volume',
            'Optimize-Volume',
            'Repair-Volume',
            'Set-Volume',
            'Get-StoragePool',
            'New-StoragePool',
            'Get-VirtualDisk',
            'New-VirtualDisk',
            'Get-PhysicalDisk',
        ],

        // ─────────────────────────────────────────────────────────────────────
        // SMB (File Sharing) Commands
        // ─────────────────────────────────────────────────────────────────────
        smb: [
            'Get-SmbShare',
            'New-SmbShare',
            'Set-SmbShare',
            'Remove-SmbShare',
            'Get-SmbSession',
            'Close-SmbSession',
            'Get-SmbOpenFile',
            'Close-SmbOpenFile',
            'Get-SmbShareAccess',
            'Grant-SmbShareAccess',
            'Revoke-SmbShareAccess',
        ],

        // ─────────────────────────────────────────────────────────────────────
        // Hyper-V Commands (Module: Hyper-V)
        // ─────────────────────────────────────────────────────────────────────
        /**
         * ┌─────────────────────────────────────────────────────────────────────┐
         * │ INSIGHT: Hyper-V Module                                             │
         * ├─────────────────────────────────────────────────────────────────────┤
         * │ The Hyper-V PowerShell module requires the Hyper-V role installed.  │
         * │                                                                     │
         * │ Install Hyper-V role:                                               │
         * │   Install-WindowsFeature -Name Hyper-V -IncludeManagementTools      │
         * │                                                                     │
         * │ Common VM states:                                                   │
         * │ • Running - VM is on and operating                                  │
         * │ • Off - VM is powered off                                           │
         * │ • Saved - VM state saved to disk (like hibernate)                   │
         * │ • Paused - VM frozen in memory                                      │
         * │                                                                     │
         * │ Checkpoints (snapshots) capture VM state for rollback.              │
         * └─────────────────────────────────────────────────────────────────────┘
         */
        hyperv: [
            'Get-VM',
            'New-VM',
            'Set-VM',
            'Remove-VM',
            'Start-VM',
            'Stop-VM',
            'Restart-VM',
            'Suspend-VM',
            'Resume-VM',
            'Save-VM',
            'Measure-VM',
            'Get-VMHost',
            'Set-VMHost',
            'Get-VMSwitch',
            'New-VMSwitch',
            'Remove-VMSwitch',
            'Set-VMSwitch',
            'Get-VMNetworkAdapter',
            'Set-VMNetworkAdapter',
            'Add-VMNetworkAdapter',
            'Set-VMMemory',
            'Get-VHD',
            'New-VHD',
            'Resize-VHD',
            'Mount-VHD',
            'Dismount-VHD',
            'Add-VMHardDiskDrive',
            'Checkpoint-VM',
            'Get-VMCheckpoint',
            'Restore-VMCheckpoint',
            'Remove-VMCheckpoint',
            'Export-VM',
            'Import-VM',
        ],

        // ─────────────────────────────────────────────────────────────────────
        // Failover Clustering Commands (Module: FailoverClusters)
        // ─────────────────────────────────────────────────────────────────────
        /**
         * ┌─────────────────────────────────────────────────────────────────────┐
         * │ INSIGHT: Failover Clustering                                        │
         * ├─────────────────────────────────────────────────────────────────────┤
         * │ Failover clusters provide high availability by grouping servers.    │
         * │                                                                     │
         * │ Key concepts:                                                       │
         * │ • Cluster: The overall group of servers                             │
         * │ • Node: Individual server in the cluster                            │
         * │ • Resource: Something the cluster manages (VM, file share, IP)      │
         * │ • Group: Collection of resources that fail over together            │
         * │ • Quorum: Voting mechanism to prevent "split-brain"                 │
         * │                                                                     │
         * │ Quorum witnesses: File share witness, Cloud witness, Disk witness   │
         * └─────────────────────────────────────────────────────────────────────┘
         */
        failoverClusters: [
            'Get-Cluster',
            'New-Cluster',
            'Remove-Cluster',
            'Set-Cluster',
            'Get-ClusterNode',
            'Add-ClusterNode',
            'Remove-ClusterNode',
            'Get-ClusterGroup',
            'Move-ClusterGroup',
            'Start-ClusterGroup',
            'Stop-ClusterGroup',
            'Get-ClusterResource',
            'Add-ClusterResource',
            'Remove-ClusterResource',
            'Get-ClusterQuorum',
            'Set-ClusterQuorum',
            'Get-ClusterSharedVolume',
            'Test-Cluster',
            'Suspend-ClusterNode',
            'Resume-ClusterNode',
        ],

        // ─────────────────────────────────────────────────────────────────────
        // Network Commands
        // ─────────────────────────────────────────────────────────────────────
        network: [
            'Test-Connection',
            'Test-NetConnection',
            'Get-NetAdapter',
            'Get-NetIPAddress',
            'Get-NetIPConfiguration',
            'Get-NetRoute',
            'Get-NetTCPConnection',
            'New-NetIPAddress',
            'Remove-NetIPAddress',
            'Set-NetIPAddress',
            'Get-DnsClientServerAddress',
            'Set-DnsClientServerAddress',
            'Resolve-DnsName',
            'Clear-DnsClientCache',
            'New-NetFirewallRule',
            'Get-NetFirewallRule',
            'Get-NetFirewallProfile',
            'Set-NetFirewallProfile',
            'New-NetLbfoTeam',
            'New-NetNat',
        ],

        // ─────────────────────────────────────────────────────────────────────
        // Pipeline / Formatting Commands
        // ─────────────────────────────────────────────────────────────────────
        /**
         * ┌─────────────────────────────────────────────────────────────────────┐
         * │ INSIGHT: PowerShell Pipeline                                        │
         * ├─────────────────────────────────────────────────────────────────────┤
         * │ Unlike Unix pipes that pass TEXT, PowerShell pipes pass OBJECTS.    │
         * │                                                                     │
         * │ Get-Service | Where-Object { $_.Status -eq 'Running' }              │
         * │                                                                     │
         * │ Each service object has properties: Name, Status, DisplayName       │
         * │ You can filter, select, sort, and format these objects.             │
         * │                                                                     │
         * │ Common pipeline cmdlets:                                            │
         * │ • Where-Object: Filter objects (alias: ?)                           │
         * │ • Select-Object: Choose properties or first/last N (alias: select)  │
         * │ • Sort-Object: Sort by property (alias: sort)                       │
         * │ • ForEach-Object: Run code on each object (alias: %)                │
         * │ • Format-Table/List: Control output display                         │
         * └─────────────────────────────────────────────────────────────────────┘
         */
        pipeline: [
            'Where-Object',
            'Select-Object',
            'Sort-Object',
            'Group-Object',
            'Measure-Object',
            'ForEach-Object',
            'Format-Table',
            'Format-List',
            'Format-Wide',
            'Out-Host',
            'Out-File',
            'Out-String',
            'Out-Null',
            'Out-GridView',
            'Tee-Object',
            'Compare-Object',
        ],

        // ─────────────────────────────────────────────────────────────────────
        // Automation & Remoting Commands
        // ─────────────────────────────────────────────────────────────────────
        automation: [
            'Export-Csv',
            'Import-Csv',
            'ConvertTo-Csv',
            'Register-ScheduledTask',
            'Get-ScheduledTask',
            'Unregister-ScheduledTask',
            'Invoke-Command',
            'New-PSSession',
            'Enter-PSSession',
            'Exit-PSSession',
            'Remove-PSSession',
        ],

        // ─────────────────────────────────────────────────────────────────────
        // System Diagnostics & Migration
        // ─────────────────────────────────────────────────────────────────────
        diagnostics: [
            'dcdiag',
            'repadmin',
            'sfc',
            'DISM',
            'Export-WindowsDriver',
        ],

        // ─────────────────────────────────────────────────────────────────────
        // AD Replication Commands
        // ─────────────────────────────────────────────────────────────────────
        adReplication: [
            'Get-ADReplicationSite',
            'New-ADReplicationSite',
            'Get-ADReplicationSubnet',
            'New-ADReplicationSubnet',
            'Get-ADReplicationSiteLink',
            'New-ADReplicationSiteLink',
            'Set-ADReplicationSiteLink',
            'Get-ADReplicationConnection',
            'Get-ADReplicationFailure',
        ],

        // ─────────────────────────────────────────────────────────────────────
        // DNS Server Commands
        // ─────────────────────────────────────────────────────────────────────
        dnsServer: [
            'Get-DnsServerZone',
            'Add-DnsServerResourceRecordA',
            'Get-DnsServerResourceRecord',
            'Set-DnsServerForwarder',
            'Get-DnsServerForwarder',
            'Clear-DnsServerCache',
            'Add-DnsServerPrimaryZone',
            'Remove-DnsServerZone',
        ],

        // ─────────────────────────────────────────────────────────────────────
        // DHCP Server Commands
        // ─────────────────────────────────────────────────────────────────────
        dhcpServer: [
            'Get-DhcpServerv4Scope',
            'Add-DhcpServerv4Scope',
            'Set-DhcpServerv4Scope',
            'Remove-DhcpServerv4Scope',
            'Get-DhcpServerv4Lease',
            'Add-DhcpServerv4Reservation',
            'Get-DhcpServerv4Reservation',
            'Remove-DhcpServerv4Reservation',
            'Set-DhcpServerv4OptionValue',
            'Get-DhcpServerv4OptionValue',
            'Get-DhcpServerv4ScopeStatistics',
        ],

        // ─────────────────────────────────────────────────────────────────────
        // Group Policy Commands
        // ─────────────────────────────────────────────────────────────────────
        groupPolicy: [
            'Get-GPO',
            'New-GPO',
            'Remove-GPO',
            'Backup-GPO',
            'Restore-GPO',
            'New-GPLink',
            'Remove-GPLink',
            'Set-GPLink',
            'Get-GPOReport',
            'Get-GPPermission',
            'gpupdate',
            'gpresult',
        ],

        // ─────────────────────────────────────────────────────────────────────
        // IIS / Web Server Commands
        // ─────────────────────────────────────────────────────────────────────
        webServer: [
            'Get-Website',
            'New-Website',
            'Remove-Website',
            'Start-Website',
            'Stop-Website',
            'Get-WebAppPool',
            'New-WebAppPool',
            'Remove-WebAppPool',
            'Start-WebAppPool',
            'Stop-WebAppPool',
            'Get-WebBinding',
            'New-WebBinding',
            'Remove-WebBinding',
            'Set-WebConfigurationProperty',
            'Get-WebConfigurationProperty',
            'Import-Module',
        ],

        // ─────────────────────────────────────────────────────────────────────
        // Remote Desktop Services Commands
        // ─────────────────────────────────────────────────────────────────────
        remoteDesktop: [
            'Get-RDSessionCollection',
            'New-RDSessionCollection',
            'Get-RDRemoteApp',
            'New-RDRemoteApp',
            'Get-RDUserSession',
            'Get-RDSessionHost',
            'Set-RDLicenseConfiguration',
            'Get-RDLicenseConfiguration',
            'Disconnect-RDUserSession',
            'Invoke-RDUserSessionLogoff',
        ],

        // ─────────────────────────────────────────────────────────────────────
        // Certificate Services Commands
        // ─────────────────────────────────────────────────────────────────────
        certificateServices: [
            'Get-CATemplate',
            'Get-Certificate',
            'Publish-CRL',
            'Backup-CARoleService',
            'certutil',
        ],

        // ─────────────────────────────────────────────────────────────────────
        // Windows Backup Commands
        // ─────────────────────────────────────────────────────────────────────
        backup: [
            'New-WBPolicy',
            'Get-WBPolicy',
            'Set-WBPolicy',
            'New-WBBackupTarget',
            'Add-WBBackupTarget',
            'Add-WBBareMetalRecovery',
            'Add-WBSystemState',
            'Start-WBBackup',
            'Get-WBBackupSet',
            'Get-WBSummary',
            'vssadmin',
        ],

        // ─────────────────────────────────────────────────────────────────────
        // Windows Firewall Commands
        // ─────────────────────────────────────────────────────────────────────
        firewall: [
            'Get-NetFirewallProfile',
            'Set-NetFirewallProfile',
            'New-NetFirewallRule',
            'Get-NetFirewallRule',
            'Enable-NetFirewallRule',
            'Disable-NetFirewallRule',
            'Remove-NetFirewallRule',
            'Set-NetFirewallRule',
        ],

        // ─────────────────────────────────────────────────────────────────────
        // Advanced Networking Commands
        // ─────────────────────────────────────────────────────────────────────
        advancedNetworking: [
            'New-NetLbfoTeam',
            'Get-NetLbfoTeam',
            'New-NetNat',
            'Get-NetNat',
            'Get-NetRoute',
        ],

        // ─────────────────────────────────────────────────────────────────────
        // Docker Commands (not PowerShell native, but commonly used)
        // ─────────────────────────────────────────────────────────────────────
        docker: [
            'docker',
            'docker-compose',
        ],
    };

    /**
     * Parameter definitions for common cmdlets
     * Used for parameter tab completion
     */
    const CMDLET_PARAMETERS = {
        // Common parameters available on all cmdlets
        _common: [
            'Verbose', 'Debug', 'ErrorAction', 'WarningAction', 'InformationAction',
            'ErrorVariable', 'WarningVariable', 'InformationVariable', 'OutVariable',
            'OutBuffer', 'PipelineVariable', 'WhatIf', 'Confirm',
        ],

        // AD cmdlets
        'Get-ADUser': ['Identity', 'Filter', 'SearchBase', 'SearchScope', 'Properties', 'Server', 'Credential'],
        'New-ADUser': ['Name', 'SamAccountName', 'UserPrincipalName', 'GivenName', 'Surname', 'DisplayName', 'Path', 'AccountPassword', 'Enabled', 'ChangePasswordAtLogon'],
        'Set-ADUser': ['Identity', 'Department', 'Title', 'Office', 'EmailAddress', 'Manager', 'Description', 'Enabled'],
        'Get-ADGroup': ['Identity', 'Filter', 'SearchBase', 'Properties', 'Server'],
        'New-ADGroup': ['Name', 'SamAccountName', 'GroupScope', 'GroupCategory', 'Path', 'Description'],
        'Add-ADGroupMember': ['Identity', 'Members'],
        'Remove-ADGroupMember': ['Identity', 'Members'],
        'Get-ADGroupMember': ['Identity', 'Recursive'],
        'Unlock-ADAccount': ['Identity', 'Server', 'Credential'],
        'Search-ADAccount': ['LockedOut', 'PasswordExpired', 'PasswordNeverExpires', 'AccountDisabled', 'AccountExpired', 'AccountInactive'],

        // Storage cmdlets
        'Get-Disk': ['Number', 'FriendlyName', 'SerialNumber'],
        'Initialize-Disk': ['Number', 'PartitionStyle', 'PassThru'],
        'New-Partition': ['DiskNumber', 'Size', 'UseMaximumSize', 'DriveLetter', 'AssignDriveLetter'],
        'Format-Volume': ['DriveLetter', 'FileSystem', 'NewFileSystemLabel', 'AllocationUnitSize', 'Full', 'Force'],
        'Get-Volume': ['DriveLetter', 'FileSystemLabel'],
        'New-SmbShare': ['Name', 'Path', 'Description', 'FullAccess', 'ChangeAccess', 'ReadAccess', 'NoAccess', 'EncryptData'],
        'Get-SmbShare': ['Name', 'ScopeName', 'Special'],

        // Hyper-V cmdlets
        'Get-VM': ['Name', 'Id', 'ComputerName'],
        'New-VM': ['Name', 'MemoryStartupBytes', 'Generation', 'VHDPath', 'NewVHDPath', 'NewVHDSizeBytes', 'SwitchName', 'Path'],
        'Start-VM': ['Name', 'VM', 'PassThru'],
        'Stop-VM': ['Name', 'VM', 'Force', 'Save', 'TurnOff'],
        'Checkpoint-VM': ['Name', 'VM', 'SnapshotName'],
        'Restore-VMCheckpoint': ['VMCheckpoint', 'Confirm'],
        'Get-VMSwitch': ['Name', 'SwitchType'],
        'New-VMSwitch': ['Name', 'SwitchType', 'NetAdapterName', 'AllowManagementOS'],

        // Cluster cmdlets
        'Get-Cluster': ['Name', 'Domain'],
        'Get-ClusterNode': ['Name', 'Cluster'],
        'Get-ClusterGroup': ['Name', 'Cluster'],
        'Move-ClusterGroup': ['Name', 'Node', 'Cluster'],
        'Get-ClusterQuorum': ['Cluster'],
        'Set-ClusterQuorum': ['NodeMajority', 'NodeAndDiskMajority', 'NodeAndFileShareMajority', 'CloudWitness', 'DiskWitness', 'FileShareWitness'],

        // Service cmdlets
        'Get-Service': ['Name', 'DisplayName', 'DependentServices', 'RequiredServices', 'Status'],
        'Start-Service': ['Name', 'DisplayName', 'InputObject', 'PassThru'],
        'Stop-Service': ['Name', 'DisplayName', 'InputObject', 'Force', 'NoWait', 'PassThru'],
        'Restart-Service': ['Name', 'DisplayName', 'InputObject', 'Force', 'PassThru'],

        // Filesystem cmdlets
        'Get-ChildItem': ['Path', 'LiteralPath', 'Filter', 'Include', 'Exclude', 'Recurse', 'Depth', 'Force', 'Name', 'Directory', 'File', 'Hidden'],
        'Set-Location': ['Path', 'LiteralPath', 'PassThru'],
        'Get-Content': ['Path', 'LiteralPath', 'ReadCount', 'TotalCount', 'Tail', 'Encoding', 'Raw'],
        'New-Item': ['Path', 'Name', 'ItemType', 'Value', 'Force'],
        'Remove-Item': ['Path', 'LiteralPath', 'Filter', 'Include', 'Exclude', 'Recurse', 'Force'],
        'Copy-Item': ['Path', 'Destination', 'Container', 'Force', 'Filter', 'Include', 'Exclude', 'Recurse', 'PassThru'],
        'Move-Item': ['Path', 'Destination', 'Force', 'Filter', 'Include', 'Exclude', 'PassThru'],

        // Network cmdlets
        'Test-Connection': ['TargetName', 'ComputerName', 'Count', 'Delay', 'BufferSize', 'DontFragment', 'IPv4', 'IPv6', 'Quiet'],
        'Test-NetConnection': ['ComputerName', 'Port', 'CommonTCPPort', 'InformationLevel', 'TraceRoute'],

        // Pipeline cmdlets
        'Where-Object': ['FilterScript', 'Property', 'Value', 'EQ', 'NE', 'GT', 'GE', 'LT', 'LE', 'Like', 'NotLike', 'Match', 'NotMatch', 'Contains', 'NotContains', 'In', 'NotIn'],
        'Select-Object': ['Property', 'ExcludeProperty', 'ExpandProperty', 'First', 'Last', 'Skip', 'Unique', 'Wait', 'Index'],
        'Sort-Object': ['Property', 'Descending', 'Unique', 'CaseSensitive', 'Culture'],
        'Format-Table': ['Property', 'AutoSize', 'HideTableHeaders', 'Wrap', 'GroupBy'],
        'Format-List': ['Property', 'GroupBy'],
    };

    /**
     * Get flattened list of all commands
     */
    function _getAllCommands() {
        const all = [];
        for (const category of Object.values(AVAILABLE_COMMANDS)) {
            all.push(...category);
        }
        return all.sort();
    }

    /**
     * Handle tab key press for completion
     */
    function _handleTabCompletion() {
        const input = elements.input.value;
        const cursorPos = elements.input.selectionStart;
        const now = Date.now();

        // Get completion context
        const context = _getCompletionContext(input, cursorPos);
        const { word, wordStart, completionType, cmdContext } = context;

        // Get completions based on type
        let completions = [];
        switch (completionType) {
            case 'command':
                completions = _getCommandCompletions(word);
                break;
            case 'path':
                completions = _getPathCompletions(word);
                break;
            case 'parameter':
                completions = _getParameterCompletions(word, cmdContext);
                break;
            case 'value':
                completions = _getValueCompletions(word, cmdContext);
                break;
        }

        if (completions.length === 0) {
            // No completions - visual feedback
            elements.input.style.backgroundColor = '#300';
            setTimeout(() => elements.input.style.backgroundColor = '', 100);
            return;
        }

        // Double-tab detection
        const isDoubleTab = (now - state._lastTabTime < 500) && (state._lastTabWord === word);
        state._lastTabTime = now;
        state._lastTabWord = word;

        if (completions.length === 1) {
            // Single match - complete fully
            _applyCompletion(input, cursorPos, wordStart, word, completions[0], completionType);
        } else {
            // Multiple matches
            const commonPrefix = _findCommonPrefix(completions);

            if (commonPrefix.length > word.length) {
                // Complete to common prefix
                _applyCompletion(input, cursorPos, wordStart, word, commonPrefix, completionType, true);
            } else if (isDoubleTab) {
                // Double-tab: show all completions
                _showCompletions(completions, completionType);
            }
            // Single tab with no common prefix: wait for double-tab
        }
    }

    /**
     * Determine what type of completion we're doing based on context
     */
    function _getCompletionContext(input, cursorPos) {
        const beforeCursor = input.substring(0, cursorPos);

        // Find start of current word (respecting quotes)
        let wordStart = cursorPos;
        let inQuote = null;

        for (let i = cursorPos - 1; i >= 0; i--) {
            const char = beforeCursor[i];
            if (char === '"' || char === "'") {
                if (inQuote === char) inQuote = null;
                else if (!inQuote) inQuote = char;
            }
            if (char === ' ' && !inQuote) {
                wordStart = i + 1;
                break;
            }
            if (i === 0) wordStart = 0;
        }

        const word = beforeCursor.substring(wordStart);
        const textBeforeWord = beforeCursor.substring(0, wordStart).trim();

        // Determine completion type
        let completionType = 'command';
        let cmdContext = '';

        // Is this a parameter? (starts with -)
        if (word.startsWith('-')) {
            completionType = 'parameter';
            // Get the command for context
            const parts = textBeforeWord.split(/\s+/);
            cmdContext = parts[0] || '';
        }
        // Is this after a command? (there's text before)
        else if (textBeforeWord.length > 0) {
            // Get the command
            const parts = textBeforeWord.split(/\s+/);
            cmdContext = parts[0];

            // Check if previous token is a parameter that expects a path
            const lastToken = parts[parts.length - 1];
            if (lastToken && lastToken.startsWith('-')) {
                const paramName = lastToken.substring(1).toLowerCase();
                if (['path', 'literalpath', 'destination', 'newvhdpath', 'vhdpath'].includes(paramName)) {
                    completionType = 'path';
                } else {
                    completionType = 'value';
                }
            }
            // Check if it looks like a path
            else if (word.includes('\\') || word.includes(':') || word.startsWith('.')) {
                completionType = 'path';
            } else {
                // Could be a positional argument - often a path
                completionType = 'path';
            }
        }
        // Is this right after a pipe or command separator?
        else if (/\|\s*$/.test(textBeforeWord) || /[;&]\s*$/.test(textBeforeWord)) {
            completionType = 'command';
        }

        return { word, wordStart, completionType, cmdContext };
    }

    /**
     * Get command completions matching prefix
     */
    function _getCommandCompletions(prefix) {
        const allCommands = _getAllCommands();
        const lowerPrefix = prefix.toLowerCase();

        if (!prefix) return allCommands;

        return allCommands.filter(cmd =>
            cmd.toLowerCase().startsWith(lowerPrefix)
        );
    }

    /**
     * Get path completions for Windows paths
     *
     * ┌─────────────────────────────────────────────────────────────────────────┐
     * │ INSIGHT: Windows Path Tab Completion                                    │
     * ├─────────────────────────────────────────────────────────────────────────┤
     * │ Windows paths use backslashes and drive letters:                        │
     * │                                                                         │
     * │ C:\Users\Admin<Tab> → C:\Users\Administrator\                           │
     * │                                                                         │
     * │ PowerShell also supports:                                               │
     * │ • Forward slashes: C:/Users (works, but not canonical)                  │
     * │ • UNC paths: \\server\share                                             │
     * │ • Relative paths: .\subfolder, ..\parent                                │
     * │ • Home shortcut: ~ expands to $HOME                                     │
     * │                                                                         │
     * │ Tab completion adds trailing backslash for directories.                 │
     * └─────────────────────────────────────────────────────────────────────────┘
     */
    function _getPathCompletions(partial) {
        // Handle empty - complete from current directory
        if (!partial) {
            const entry = state.fs[state.currentDir];
            if (entry && (entry.type === 'dir' || entry.type === 'drive') && entry.children) {
                return entry.children.sort();
            }
            return [];
        }

        // Handle ~ (home directory)
        if (partial === '~') {
            return ['~\\'];
        }

        let searchDir, filePrefix, returnPrefix;

        if (partial.startsWith('~\\')) {
            // Home-relative path
            const relativePath = partial.substring(2);
            const lastSlash = relativePath.lastIndexOf('\\');
            if (lastSlash >= 0) {
                searchDir = state.env.USERPROFILE + '\\' + relativePath.substring(0, lastSlash);
                filePrefix = relativePath.substring(lastSlash + 1);
                returnPrefix = '~\\' + relativePath.substring(0, lastSlash + 1);
            } else {
                searchDir = state.env.USERPROFILE;
                filePrefix = relativePath;
                returnPrefix = '~\\';
            }
        } else if (/^[A-Za-z]:$/.test(partial)) {
            // Just a drive letter
            return [partial.toUpperCase() + '\\'];
        } else if (/^[A-Za-z]:\\/.test(partial)) {
            // Absolute path
            const lastSlash = partial.lastIndexOf('\\');
            searchDir = partial.substring(0, lastSlash) || partial.substring(0, 2);
            filePrefix = partial.substring(lastSlash + 1);
            returnPrefix = searchDir + (searchDir.endsWith(':') ? '\\' : '\\');
        } else if (partial.startsWith('..\\') || partial === '..') {
            // Parent-relative path
            if (partial === '..') {
                return ['..\\'];
            }
            const relativePath = partial.substring(3);
            const lastSlash = relativePath.lastIndexOf('\\');
            const parentDir = _resolvePath('..');
            if (lastSlash >= 0) {
                searchDir = parentDir + '\\' + relativePath.substring(0, lastSlash);
                filePrefix = relativePath.substring(lastSlash + 1);
                returnPrefix = '..\\' + relativePath.substring(0, lastSlash + 1);
            } else {
                searchDir = parentDir;
                filePrefix = relativePath;
                returnPrefix = '..\\';
            }
        } else if (partial.startsWith('.\\') || partial === '.') {
            // Current-relative path
            if (partial === '.') {
                return ['.\\'];
            }
            const relativePath = partial.substring(2);
            const lastSlash = relativePath.lastIndexOf('\\');
            if (lastSlash >= 0) {
                searchDir = state.currentDir + '\\' + relativePath.substring(0, lastSlash);
                filePrefix = relativePath.substring(lastSlash + 1);
                returnPrefix = '.\\' + relativePath.substring(0, lastSlash + 1);
            } else {
                searchDir = state.currentDir;
                filePrefix = relativePath;
                returnPrefix = '.\\';
            }
        } else {
            // Relative path without prefix
            const lastSlash = partial.lastIndexOf('\\');
            if (lastSlash >= 0) {
                searchDir = _resolvePath(partial.substring(0, lastSlash));
                filePrefix = partial.substring(lastSlash + 1);
                returnPrefix = partial.substring(0, lastSlash + 1);
            } else {
                searchDir = state.currentDir;
                filePrefix = partial;
                returnPrefix = '';
            }
        }

        // Normalize search directory
        searchDir = _normalizePath(searchDir);
        const dirEntry = state.fs[searchDir];

        if (!dirEntry || (dirEntry.type !== 'dir' && dirEntry.type !== 'drive')) {
            return [];
        }

        const children = dirEntry.children || [];
        const lowerPrefix = filePrefix.toLowerCase();

        const matches = children.filter(name => {
            // Match if prefix matches or if empty prefix and not hidden
            if (lowerPrefix === '') {
                return !name.startsWith('.');
            }
            return name.toLowerCase().startsWith(lowerPrefix);
        });

        // Return with appropriate prefix
        return matches.map(name => returnPrefix + name).sort();
    }

    /**
     * Get parameter completions for a cmdlet
     */
    function _getParameterCompletions(prefix, cmdContext) {
        // Remove leading dash for matching
        const paramPrefix = prefix.startsWith('-') ? prefix.substring(1).toLowerCase() : prefix.toLowerCase();

        // Get parameters for this cmdlet
        let params = [];

        // Add cmdlet-specific parameters
        const cmdLower = cmdContext.toLowerCase();
        for (const [cmdName, cmdParams] of Object.entries(CMDLET_PARAMETERS)) {
            if (cmdName.toLowerCase() === cmdLower) {
                params = [...cmdParams];
                break;
            }
        }

        // Add common parameters
        params.push(...CMDLET_PARAMETERS._common);

        // Remove duplicates
        params = [...new Set(params)];

        // Filter by prefix
        if (paramPrefix) {
            params = params.filter(p => p.toLowerCase().startsWith(paramPrefix));
        }

        // Return with dash prefix
        return params.map(p => '-' + p).sort();
    }

    /**
     * Get value completions for specific parameters
     */
    function _getValueCompletions(word, cmdContext) {
        // This is a placeholder for parameter value completion
        // Could complete things like:
        // - Service names for Get-Service
        // - VM names for Get-VM
        // - Group scopes: Global, DomainLocal, Universal
        // - etc.

        // For now, try path completion as fallback
        return _getPathCompletions(word);
    }

    /**
     * Find common prefix among completions
     */
    function _findCommonPrefix(strings) {
        if (strings.length === 0) return '';
        if (strings.length === 1) return strings[0];

        let prefix = strings[0];
        for (let i = 1; i < strings.length; i++) {
            while (!strings[i].toLowerCase().startsWith(prefix.toLowerCase())) {
                prefix = prefix.substring(0, prefix.length - 1);
                if (prefix === '') return '';
            }
            // Use the case from the first match for consistency
        }
        return prefix;
    }

    /**
     * Apply a completion to the input
     */
    function _applyCompletion(input, cursorPos, wordStart, oldWord, newWord, completionType, isPartial = false) {
        const before = input.substring(0, wordStart);
        const after = input.substring(cursorPos);

        // Determine suffix
        let suffix = '';
        if (!isPartial) {
            if (completionType === 'command') {
                suffix = ' ';
            } else if (completionType === 'path') {
                // Check if it's a directory
                const resolved = _resolvePath(newWord);
                const entry = state.fs[resolved];
                if (entry && (entry.type === 'dir' || entry.type === 'drive')) {
                    suffix = newWord.endsWith('\\') ? '' : '\\';
                } else if (entry) {
                    suffix = ' ';
                }
            } else if (completionType === 'parameter') {
                suffix = ' ';
            }
        }

        elements.input.value = before + newWord + suffix + after;
        const newPos = before.length + newWord.length + suffix.length;
        elements.input.selectionStart = elements.input.selectionEnd = newPos;
    }

    /**
     * Show multiple completions (on double-tab)
     */
    function _showCompletions(completions, completionType) {
        // Format completions in columns like PowerShell
        const maxLen = Math.max(...completions.map(c => c.length)) + 2;
        const cols = Math.max(1, Math.floor(80 / maxLen));

        let output = '\n';
        for (let i = 0; i < completions.length; i++) {
            let item = completions[i];

            // Add trailing backslash indicator for directories
            if (completionType === 'path') {
                const resolved = _resolvePath(item);
                const entry = state.fs[resolved];
                if (entry && (entry.type === 'dir' || entry.type === 'drive') && !item.endsWith('\\')) {
                    item += '\\';
                }
            }

            output += item.padEnd(maxLen);
            if ((i + 1) % cols === 0) output += '\n';
        }

        _printOutput(output.trimEnd());
        _printCommand(elements.input.value);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // OUTPUT UTILITIES
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Print command line to output (shows what user typed)
     */
    function _printCommand(cmd) {
        const promptHtml = _getPrompt();
        elements.output.innerHTML += `<div class="ps-cmd-line">${promptHtml}<span class="ps-cmd">${_escapeHtml(cmd)}</span></div>`;
    }

    /**
     * Print output to terminal
     */
    function _printOutput(text) {
        elements.output.innerHTML += text + '\n';
        elements.output.scrollTop = elements.output.scrollHeight;
    }

    /**
     * Update the prompt display
     */
    function _updatePrompt() {
        elements.promptSpan.innerHTML = _getPrompt();
    }

    /**
     * Escape HTML special characters
     */
    function _escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // PUBLIC API
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Destroy the terminal instance
     */
    function destroy() {
        if (elements.input) {
            elements.input.removeEventListener('keydown', _handleKeyDown);
        }
        if (elements.container) {
            elements.container.innerHTML = '';
        }

        // Unsubscribe from WSAState
        if (wsaStateUnsubscribe) {
            wsaStateUnsubscribe();
            wsaStateUnsubscribe = null;
        }

        state.isInitialized = false;
    }

    /**
     * Execute a command programmatically
     */
    function execute(cmdLine) {
        if (!state.isInitialized) {
            console.error('PSTerminal: Not initialized');
            return;
        }
        elements.input.value = cmdLine;
        _executeCommand();
    }

    /**
     * Get current state (for debugging/testing)
     */
    function getState() {
        return { ...state };
    }

    /**
     * Complete an objective
     */
    function completeObjective(id) {
        if (state.objectives.find(o => o.id === id)) {
            state.objectivesCompleted[id] = true;
            _printOutput(`<span class="ps-success">✓ Objective completed: ${state.objectives.find(o => o.id === id).desc}</span>`);

            // Check if all objectives complete
            const allComplete = state.objectives.every(o => state.objectivesCompleted[o.id]);
            if (allComplete) {
                _printOutput(`\n<span class="ps-success"><img src="/assets/images/icons/icon-star.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain"> All objectives complete! Great work!</span>`);
            }
        }
    }

    // Return public API
    return {
        init,
        destroy,
        execute,
        getState,
        completeObjective,

        // Expose for module overlays
        addFilesystem: (overlay) => Object.assign(state.fs, overlay),
        addUsers: (users) => Object.assign(state.adUsers, users),
        addGroups: (groups) => Object.assign(state.adGroups, groups),
        addServices: (services) => Object.assign(state.services, services),
    };

})();

// ═══════════════════════════════════════════════════════════════════════════════
// END OF PSTerminal.js
// ═══════════════════════════════════════════════════════════════════════════════
//
// Implementation Complete (v1.0.0):
// ✓ Core architecture with IIFE encapsulation
// ✓ Tab completion with 150+ cmdlets and path completion
// ✓ Windows filesystem simulation (C:\, D:\ drives)
// ✓ All command categories: Filesystem, System, AD, Storage, Hyper-V, Cluster,
//   Network, Pipeline/Formatting, Docker
// ✓ Lab integration with onCommand callback and objective tracking
// ✓ Module overlay system for per-lab customization
//
// ═══════════════════════════════════════════════════════════════════════════════
