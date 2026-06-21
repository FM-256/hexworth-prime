/* ============================================================
   Security+ Cert Prep -- Vulnerability Scan Triage: Veridian Financial
   Blue-team vulnerability management | find-and-submit flags
   Students analyze a monthly authenticated scan report, correlate
   findings against an asset inventory, and apply risk-based
   prioritization to determine remediation order.
   Key lesson: raw CVSS score alone does NOT determine priority --
   internet exposure, active exploitation, and asset criticality
   all factor into true risk.
   SY0-701: 4.3 (vulnerability assessment and remediation)
   ============================================================ */

// window assignment (not const) so the second <script> block in index.html
// can reference VFVTConfig after this script has loaded.
window.VFVTConfig = {

    // =========================================================
    // BOX METADATA
    // =========================================================

    id:            'shield-sp-blueteam-vuln-triage',
    title:         'Vulnerability Scan Triage',
    subtitle:      'Veridian Financial -- Monthly Scan Report',
    description:   'The monthly authenticated vulnerability scan finished at 02:00 UTC. You are the vulnerability management analyst. Review the scan report and asset inventory to triage findings: identify what to remediate first using risk-based prioritization (not raw CVSS), spot the false positive, and quantify exposure.',
    difficulty:    'Intermediate',
    estimatedTime: 40,
    accent:        '#2563eb',
    storageKey:    'hexworth_lab_sp_blueteam_vuln_triage',
    registryId:    'shield-sp-blueteam-vuln-triage',
    trackerKey:    'lab_sp_blueteam_vuln_triage',

    // Blue-team mode tells BoxEngine to accept BlueTeam device types
    blueTeamMode: true,

    // =========================================================
    // BOOT SEQUENCE
    // =========================================================

    boot: {
        biosLines: [
            'VERIDIAN FINANCIAL VULN MGMT WORKSTATION v2.4.1',
            'Vulnerability Management Analyst -- Tier-2 Access',
            'Ubuntu 22.04.4 LTS: LOADING',
            'Scan report mount: /home/analyst -- READY',
            'Scan completed: 2026-06-01 02:00 UTC',
            'Ticket: VM-2026-0601-004 -- AWAITING TRIAGE'
        ],
        grubEntries: [
            'Ubuntu 22.04.4 LTS (Vuln Mgmt Analyst)',
            'Ubuntu 22.04.4 LTS (recovery mode)'
        ],
        loginUser: 'analyst'
    },

    // =========================================================
    // LORE
    // =========================================================

    lore: {
        intro: 'It is 09:00 UTC. VM-2026-0601-004 landed in your queue: "Monthly authenticated scan completed -- 11 findings across 7 hosts. Triage required before remediation sprint planning." The scanner ran with domain credentials against the full internal and DMZ scope. Your job is to work through every finding, apply risk-based prioritization, identify the false positive, and submit your triage conclusions as flags.',

        scenario: 'Veridian Financial runs a heterogeneous environment: two internet-facing hosts in the DMZ and five internal hosts across the application and infrastructure tiers. The scanner reported 11 findings with raw CVSS v3.1 scores. But raw CVSS is not priority. The single highest CVSS in the report (10.0) belongs to an internal-only host -- it is NOT the top priority. A different finding scores 9.8 on an internet-facing host and is actively exploited in the wild -- that combination makes it the unambiguous remediation target. One finding is a false positive: the scanner flagged a CVE based on an OpenSSL version banner, but the distro changelog confirms the patch was backported. Read the scan report, cross-reference the asset inventory, and submit what you find.',

        outro: 'Triage complete. The Spring Framework RCE (FINDING 001, CVE-2022-22965) on the public web application server was correctly identified as top priority: CVSS 9.8, internet-facing, actively exploited, unauthenticated RCE. Key lesson: Zerologon (FINDING 002) scores 10.0 -- higher than the top priority -- but it sits on an internal-only domain controller. Internet exposure plus active exploitation outweigh the raw CVSS advantage. The OpenSSL memory disclosure finding on the mail server was correctly identified as a false positive -- the distro backported the patch without changing the version banner. The Windows RDP wormable RCE (FINDING 007) on an internal server was correctly identified as the other actively-exploited CVE in the report. This is the core skill SY0-701 Domain 4.3 tests: given a scanner report, combine CVSS, exploitability, and exposure to produce a defensible priority order.',

        goals: [
            'Identify the CVE to remediate first using risk-based triage (CVSS + internet exposure + active exploitation)',
            'Find the single highest CVSS v3.1 base score value in the scan report',
            'Identify the false positive finding and its CVE (distro-backported fix flagged by version banner)',
            'Identify the internet-facing hostname carrying the top-priority vulnerability',
            'Identify a second CVE flagged as actively exploited (distinct from the top-priority CVE)'
        ],

        toolkit: [
            { name: 'cat',  purpose: 'Display a full file',              sample: 'cat /home/analyst/scan_report.txt'     },
            { name: 'grep', purpose: 'Search for a pattern in a file',   sample: 'grep "CRITICAL" /home/analyst/scan_report.txt' },
            { name: 'head', purpose: 'Show first N lines of a file',     sample: 'head -n 40 /home/analyst/scan_report.txt' },
            { name: 'tail', purpose: 'Show last N lines of a file',      sample: 'tail -n 20 /home/analyst/scan_report.txt' },
            { name: 'find', purpose: 'Locate files in a directory',      sample: 'find /home/analyst -name "*.txt"'      },
            { name: 'ls',   purpose: 'List directory contents',          sample: 'ls /home/analyst/'                    },
            { name: 'help', purpose: 'Show available commands',          sample: 'help'                                  }
        ]
    },

    // =========================================================
    // TERMINAL CONFIG
    // =========================================================

    terminal: {
        user:     'analyst',
        hostname: 'vuln-ws-01',
        startDir: '/home/analyst',
        welcome:  'Veridian Financial -- Vulnerability Management Analyst Terminal\nTier-2 Access | VM-2026-0601-004 Active\n\nMonthly scan report and supporting files:\n  /home/analyst/scan_report.txt    Authenticated scan output (11 findings)\n  /home/analyst/asset_inventory.txt  Asset register with exposure + criticality\n  /home/analyst/triage_task.txt    Task brief -- what you need to determine\n\nRead the scan report and asset inventory.\nCorrelate findings using risk-based criteria, not raw CVSS alone.\nSubmit triage conclusions via the Submit Flag panel.\n\nType "help" for available commands.\n'
    },

    // =========================================================
    // DESKTOP ICONS
    // =========================================================

    desktop: {
        icons: [
            { id: 'terminal',  label: 'Terminal',    icon: 'T', app: 'terminal'  },
            { id: 'logviewer', label: 'Log Viewer',  icon: 'L', app: 'logviewer' },
            { id: 'notes',     label: 'Notes',       icon: 'N', app: 'notes'     },
            { id: 'hints',     label: 'Hints',       icon: 'H', app: 'hints'     },
            { id: 'flags',     label: 'Submit Flag', icon: 'F', app: 'flags'     }
        ]
    },

    // =========================================================
    // SIMULATED FILESYSTEM
    //
    // /home/analyst/
    //   scan_report.txt      -- 11 findings; CVEs, CVSS, affected host,
    //                           port/service, and per-finding notes
    //   asset_inventory.txt  -- 7 hosts: exposure (internet/internal),
    //                           business criticality, services
    //   triage_task.txt      -- task brief (labels IOCs, no values)
    //   notes.txt            -- analyst scratch pad
    //
    // FLAG DISCOVERY MAP:
    //   top_priority_cve    -> scan_report.txt (CVE-2022-22965) correlated
    //                          with asset_inventory.txt (WEB-DMZ-01 = internet-facing)
    //   highest_cvss        -> scan_report.txt (10.0 -- CVE-2020-1472 Zerologon only)
    //   false_positive_cve  -> scan_report.txt (CVE-2014-0160 NOTE field)
    //   internet_facing_host-> asset_inventory.txt (WEB-DMZ-01)
    //   exploited_cve       -> scan_report.txt (CVE-2019-0708 NOTE field)
    //
    // REAL CVEs WITH NVD-ACCURATE CVSS v3.1 BASE SCORES:
    //   CVE-2022-22965  Spring4Shell           CVSS 9.8   (NVD: 9.8 CRITICAL) -- TOP PRIORITY
    //   CVE-2020-1472   Zerologon              CVSS 10.0  (NVD: 10.0 CRITICAL) -- highest CVSS foil
    //   CVE-2021-21985  vCenter RCE            CVSS 9.8   (NVD: 9.8 CRITICAL)
    //   CVE-2022-22963  Spring Cloud Fn SpEL   CVSS 9.8   (NVD: 9.8 CRITICAL)
    //   CVE-2021-26084  Confluence OGNL        CVSS 9.8   (NVD: 9.8 CRITICAL)
    //   CVE-2014-6271   Shellshock             CVSS 9.8   (NVD: 9.8 CRITICAL)
    //   CVE-2019-0708   BlueKeep               CVSS 9.8   (NVD: 9.8 CRITICAL)
    //   CVE-2021-34527  PrintNightmare         CVSS 8.8   (NVD: 8.8 HIGH)
    //   CVE-2017-0144   EternalBlue/MS17-010   CVSS 8.8   (NVD: 8.8 HIGH)
    //   CVE-2021-3156   Baron Samedit (sudo)   CVSS 7.8   (NVD: 7.8 HIGH)
    //   CVE-2014-0160   Heartbleed             CVSS 7.5   (NVD: 7.5 HIGH) -- FALSE POSITIVE
    // =========================================================

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

                                // ── SCAN REPORT ──────────────────────────────────────
                                // Nessus/OpenVAS-style output. 11 findings, 7 hosts.
                                // Each finding: Plugin/CVE ID, CVSS v3.1 base score,
                                // affected host, port/service, and a NOTE.
                                // The NOTE on CVE-2014-0160 explicitly calls out the
                                // false positive condition (backported patch, version banner).
                                // The NOTE on CVE-2019-0708 and CVE-2022-22965 call out
                                // active exploitation.
                                //
                                // FLAG DISCOVERY:
                                //   top_priority_cve   -- CVE-2022-22965 (CVSS 9.8 + internet-facing
                                //                         WEB-DMZ-01 + exploit available + active)
                                //   highest_cvss       -- 10.0 (CVE-2020-1472 Zerologon only; the
                                //                         teaching foil: highest CVSS != top priority
                                //                         because Zerologon is internal-only)
                                //   false_positive_cve -- CVE-2014-0160 (NOTE: backported fix)
                                //   exploited_cve      -- CVE-2019-0708 (NOTE: exploit available / actively exploited)
                                //   internet_facing_host -- WEB-DMZ-01 (correlate via asset_inventory.txt)
                                'scan_report.txt': {
                                    type: 'file',
                                    content: [
                                        'VERIDIAN FINANCIAL -- AUTHENTICATED VULNERABILITY SCAN REPORT',
                                        '================================================================',
                                        'Scan Engine  : OpenVAS 22.4 (with Nessus plugin compatibility layer)',
                                        'Scan Profile : Authenticated Full Scope',
                                        'Credentials  : Domain service account (read-only)',
                                        'Scan Start   : 2026-06-01 00:10 UTC',
                                        'Scan End     : 2026-06-01 02:00 UTC',
                                        'Scope        : 10.10.10.0/24 (DMZ), 10.10.20.0/24 (Internal)',
                                        'Total Hosts  : 7',
                                        'Total Findings: 11',
                                        '',
                                        '----------------------------------------------------------------',
                                        'SEVERITY SUMMARY',
                                        '  CRITICAL : 7',
                                        '  HIGH     : 4',
                                        '  MEDIUM   : 0',
                                        '  LOW      : 0',
                                        '  INFO     : 0',
                                        '----------------------------------------------------------------',
                                        '',
                                        '================================================================',
                                        'FINDING 001',
                                        '================================================================',
                                        'CVE          : CVE-2022-22965',
                                        'Plugin       : 159715',
                                        'Name         : Spring Framework RCE via Data Binding (Spring4Shell)',
                                        'CVSS v3.1    : 9.8 (CRITICAL)',
                                        'CVSS Vector  : CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H',
                                        'Host         : WEB-DMZ-01 (10.10.10.20)',
                                        'Port/Service : 443/tcp (Spring Boot application / Nginx reverse proxy)',
                                        'NOTE         : Exploit available. Actively exploited in the wild.',
                                        '               Unauthenticated RCE via class attribute manipulation in',
                                        '               Spring MVC request data binding. Requires JDK 9+ and',
                                        '               deployment as a WAR on Apache Tomcat. Both conditions',
                                        '               are met on this host. Installed: Spring Framework 5.3.17.',
                                        '               Patch to 5.3.18 / 5.2.20 or upgrade to Spring Boot 2.6.6.',
                                        '',
                                        '================================================================',
                                        'FINDING 002',
                                        '================================================================',
                                        'CVE          : CVE-2020-1472',
                                        'Plugin       : 141027',
                                        'Name         : Zerologon -- Netlogon Privilege Escalation',
                                        'CVSS v3.1    : 10.0 (CRITICAL)',
                                        'CVSS Vector  : CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H',
                                        'Host         : INT-DC-01 (10.10.20.6)',
                                        'Port/Service : 445/tcp (MS-RPC/Netlogon)',
                                        'NOTE         : Allows unauthenticated attacker with network access to',
                                        '               DC to completely compromise the domain. INTERNAL host',
                                        '               (not internet-facing). High priority for internal',
                                        '               network isolation. Patch: KB4571694 or later.',
                                        '',
                                        '================================================================',
                                        'FINDING 003',
                                        '================================================================',
                                        'CVE          : CVE-2021-21985',
                                        'Plugin       : 149448',
                                        'Name         : VMware vCenter Server RCE (vSphere Client)',
                                        'CVSS v3.1    : 9.8 (CRITICAL)',
                                        'CVSS Vector  : CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H',
                                        'Host         : INT-VCENTER-01 (10.10.20.10)',
                                        'Port/Service : 443/tcp (vSphere Client)',
                                        'NOTE         : Unauthenticated RCE via the Virtual SAN Health Check',
                                        '               plugin. INTERNAL host (management network only).',
                                        '               Installed version: vCenter 6.7 U3l. Patch to 7.0 U2c.',
                                        '',
                                        '================================================================',
                                        'FINDING 004',
                                        '================================================================',
                                        'CVE          : CVE-2022-22963',
                                        'Plugin       : 159714',
                                        'Name         : Spring Cloud Function SpEL Expression Injection RCE',
                                        'CVSS v3.1    : 9.8 (CRITICAL)',
                                        'CVSS Vector  : CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H',
                                        'Host         : INT-APP-01 (10.10.20.30)',
                                        'Port/Service : 8080/tcp (Spring Boot application)',
                                        'NOTE         : Unauthenticated RCE via SpEL expression injection in',
                                        '               the Spring-supplied routing function header. Public PoC',
                                        '               available; not yet confirmed actively exploited.',
                                        '               INTERNAL host only.',
                                        '               Installed: Spring Cloud Function 3.1.6. Patch to 3.2.3.',
                                        '',
                                        '================================================================',
                                        'FINDING 005',
                                        '================================================================',
                                        'CVE          : CVE-2021-26084',
                                        'Plugin       : 153086',
                                        'Name         : Atlassian Confluence Server OGNL Injection RCE',
                                        'CVSS v3.1    : 9.8 (CRITICAL)',
                                        'CVSS Vector  : CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H',
                                        'Host         : INT-WIKI-01 (10.10.20.40)',
                                        'Port/Service : 8090/tcp (Confluence Server)',
                                        'NOTE         : Pre-auth OGNL injection in Confluence setup wizard',
                                        '               endpoint allows RCE without authentication.',
                                        '               INTERNAL host. Installed: 7.12.4. Patch to 7.13.0.',
                                        '',
                                        '================================================================',
                                        'FINDING 006',
                                        '================================================================',
                                        'CVE          : CVE-2014-6271',
                                        'Plugin       : 77823',
                                        'Name         : Shellshock -- GNU Bash Remote Code Execution',
                                        'CVSS v3.1    : 9.8 (CRITICAL)',
                                        'CVSS Vector  : CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H',
                                        'Host         : INT-APP-01 (10.10.20.30)',
                                        'Port/Service : 80/tcp (CGI scripts via Apache)',
                                        'NOTE         : Bash processes trailing strings after function definitions',
                                        '               in environment variables. CGI scripts on this host pass',
                                        '               HTTP headers to bash. INTERNAL host.',
                                        '               Installed bash: 4.1.2. Patch: update bash package.',
                                        '',
                                        '================================================================',
                                        'FINDING 007',
                                        '================================================================',
                                        'CVE          : CVE-2019-0708',
                                        'Plugin       : 125313',
                                        'Name         : BlueKeep -- Windows Remote Desktop RCE (Wormable)',
                                        'CVSS v3.1    : 9.8 (CRITICAL)',
                                        'CVSS Vector  : CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H',
                                        'Host         : INT-APP-02 (10.10.20.32)',
                                        'Port/Service : 3389/tcp (RDP)',
                                        'NOTE         : Exploit available. Actively exploited in the wild.',
                                        '               Pre-authentication wormable RCE in Windows RDP.',
                                        '               INTERNAL host -- RDP not exposed to internet.',
                                        '               OS: Windows Server 2008 R2 SP1. Patch: KB4499175.',
                                        '',
                                        '================================================================',
                                        'FINDING 008',
                                        '================================================================',
                                        'CVE          : CVE-2021-34527',
                                        'Plugin       : 151571',
                                        'Name         : PrintNightmare -- Windows Print Spooler RCE',
                                        'CVSS v3.1    : 8.8 (HIGH)',
                                        'CVSS Vector  : CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:H',
                                        'Host         : INT-DC-01 (10.10.20.6)',
                                        'Port/Service : 135/tcp (RPC / Print Spooler)',
                                        'NOTE         : Authenticated (low-priv) RCE via Windows Print Spooler.',
                                        '               Requires a domain user account (achievable post-phish).',
                                        '               INTERNAL host. Patch: KB5004945 or later.',
                                        '',
                                        '================================================================',
                                        'FINDING 009',
                                        '================================================================',
                                        'CVE          : CVE-2017-0144',
                                        'Plugin       : 97833',
                                        'Name         : EternalBlue -- SMBv1 Remote Code Execution (MS17-010)',
                                        'CVSS v3.1    : 8.8 (HIGH)',
                                        'CVSS Vector  : CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:H',
                                        'Host         : INT-APP-02 (10.10.20.32)',
                                        'Port/Service : 445/tcp (SMBv1)',
                                        'NOTE         : SMBv1 remote code execution used by WannaCry and',
                                        '               NotPetya ransomware. INTERNAL host.',
                                        '               Disable SMBv1 and apply MS17-010.',
                                        '',
                                        '================================================================',
                                        'FINDING 010',
                                        '================================================================',
                                        'CVE          : CVE-2021-3156',
                                        'Plugin       : 148592',
                                        'Name         : Baron Samedit -- sudo Heap-Based Buffer Overflow',
                                        'CVSS v3.1    : 7.8 (HIGH)',
                                        'CVSS Vector  : CVSS:3.1/AV:L/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:H',
                                        'Host         : INT-APP-01 (10.10.20.30)',
                                        'Port/Service : n/a (local privilege escalation)',
                                        'NOTE         : Local privilege escalation via heap overflow in sudo',
                                        '               sudoedit. Requires local user account. INTERNAL host.',
                                        '               Installed: sudo 1.8.27. Patch: sudo 1.9.5p2.',
                                        '',
                                        '================================================================',
                                        'FINDING 011',
                                        '================================================================',
                                        'CVE          : CVE-2014-0160',
                                        'Plugin       : 73412',
                                        'Name         : Heartbleed -- OpenSSL Memory Disclosure',
                                        'CVSS v3.1    : 7.5 (HIGH)',
                                        'CVSS Vector  : CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N',
                                        'Host         : MAIL-DMZ-01 (10.10.10.26)',
                                        'Port/Service : 443/tcp (Postfix/SMTPS + Dovecot IMAPS)',
                                        'NOTE         : *** POSSIBLE FALSE POSITIVE ***',
                                        '               Scanner flagged CVE-2014-0160 because the TLS banner',
                                        '               reports OpenSSL 1.0.1e -- a version in the 1.0.1 series',
                                        '               (1.0.1 through 1.0.1f) that is genuinely affected by',
                                        '               Heartbleed. HOWEVER: this host runs CentOS 6 (RHEL-family).',
                                        '               Red Hat backported the Heartbleed fix into their 1.0.1e',
                                        '               package (openssl-1.0.1e-60.el6_10) without changing the',
                                        '               version string. The banner still reads 1.0.1e even though',
                                        '               the patch is applied.',
                                        '               Verify: rpm -q --changelog openssl | grep -i CVE-2014-0160',
                                        '               Expected result: changelog entry confirms patch applied.',
                                        '               Recommendation: validate manually before scheduling',
                                        '               remediation -- likely NOT a true vulnerability.',
                                        '',
                                        '================================================================',
                                        'END OF REPORT',
                                        '================================================================'
                                    ].join('\n')
                                },

                                // ── ASSET INVENTORY ──────────────────────────────────
                                // Maps 7 hosts to exposure (internet-facing vs internal)
                                // and business criticality.
                                // KEY LESSON: WEB-DMZ-01 carries CVE-2022-22965 (CVSS 9.8,
                                // internet-facing, actively exploited). CVE-2020-1472
                                // (Zerologon) scores 10.0 but is on INT-DC-01 (internal
                                // only). Internet exposure + active exploitation makes the
                                // 9.8 finding the unambiguous top priority over the 10.0.
                                //
                                // FLAG DISCOVERY:
                                //   internet_facing_host -> hostname for FINDING 001 host
                                'asset_inventory.txt': {
                                    type: 'file',
                                    content: [
                                        'VERIDIAN FINANCIAL -- ASSET INVENTORY (CMDB EXCERPT)',
                                        '======================================================',
                                        'Last Updated : 2026-05-15',
                                        'Scope        : Hosts in authenticated scan scope (VM-2026-0601-004)',
                                        '',
                                        '------------------------------------------------------',
                                        'HOST         : WEB-DMZ-01',
                                        'IP           : 10.10.10.20',
                                        'Zone         : DMZ',
                                        'Exposure     : INTERNET-FACING',
                                        'Criticality  : HIGH',
                                        'Owner        : Web Engineering',
                                        'Services     : Apache Tomcat 9.0 (port 443/8443 via Nginx), Nginx',
                                        '               reverse proxy (port 80/443), Spring Boot 2.6 WAR',
                                        '               deployment, JDK 11',
                                        'Description  : Public-facing web application server. Handles',
                                        '               customer-facing financial portal. Direct internet',
                                        '               ingress on ports 80, 443. No WAF in path.',
                                        'Last Patched : 2026-03-14',
                                        '',
                                        '------------------------------------------------------',
                                        'HOST         : MAIL-DMZ-01',
                                        'IP           : 10.10.10.26',
                                        'Zone         : DMZ',
                                        'Exposure     : INTERNET-FACING',
                                        'Criticality  : MEDIUM',
                                        'Owner        : IT Operations',
                                        'Services     : Postfix 3.5 (SMTP/SMTPS), Dovecot 2.3 (IMAP/IMAPS)',
                                        '               OpenSSL 1.0.1e (CentOS 6 RHEL-family package)',
                                        'Description  : Corporate mail gateway. Handles inbound/outbound email.',
                                        '               RHEL-derived OS: OpenSSL package has distro-applied',
                                        '               security patches not reflected in upstream version string.',
                                        'Last Patched : 2026-04-02',
                                        '',
                                        '------------------------------------------------------',
                                        'HOST         : INT-DC-01',
                                        'IP           : 10.10.20.6',
                                        'Zone         : Internal -- Infrastructure Tier',
                                        'Exposure     : INTERNAL ONLY',
                                        'Criticality  : CRITICAL',
                                        'Owner        : IT Infrastructure',
                                        'Services     : Windows Server 2019 (AD DS, DNS, Netlogon, Print Spooler)',
                                        'Description  : Primary Active Directory Domain Controller.',
                                        '               Not reachable from internet. Internal network only.',
                                        'Last Patched : 2025-12-10',
                                        '',
                                        '------------------------------------------------------',
                                        'HOST         : INT-VCENTER-01',
                                        'IP           : 10.10.20.10',
                                        'Zone         : Internal -- Management Network',
                                        'Exposure     : INTERNAL ONLY',
                                        'Criticality  : HIGH',
                                        'Owner        : IT Infrastructure',
                                        'Services     : VMware vCenter Server 6.7 U3l (vSphere Client port 443)',
                                        'Description  : VMware vCenter management host. Controls ESXi hypervisor',
                                        '               cluster. Management network only -- no internet path.',
                                        'Last Patched : 2025-11-20',
                                        '',
                                        '------------------------------------------------------',
                                        'HOST         : INT-APP-01',
                                        'IP           : 10.10.20.30',
                                        'Zone         : Internal -- Application Tier',
                                        'Exposure     : INTERNAL ONLY',
                                        'Criticality  : HIGH',
                                        'Owner        : Application Engineering',
                                        'Services     : Spring Boot 2.6 (port 8080), Apache 2.4 with CGI',
                                        '               (port 80), bash 4.1.2, sudo 1.8.27',
                                        'Description  : Internal application server handling loan processing',
                                        '               and back-office integrations. Internal network only.',
                                        'Last Patched : 2025-10-05',
                                        '',
                                        '------------------------------------------------------',
                                        'HOST         : INT-WIKI-01',
                                        'IP           : 10.10.20.40',
                                        'Zone         : Internal -- Application Tier',
                                        'Exposure     : INTERNAL ONLY',
                                        'Criticality  : HIGH',
                                        'Owner        : Application Engineering',
                                        'Services     : Atlassian Confluence Server 7.12.4 (port 8090)',
                                        'Description  : Internal team wiki and knowledge base. Used by',
                                        '               engineering and operations. Internal network only.',
                                        'Last Patched : 2025-09-10',
                                        '',
                                        '------------------------------------------------------',
                                        'HOST         : INT-APP-02',
                                        'IP           : 10.10.20.32',
                                        'Zone         : Internal -- Application Tier',
                                        'Exposure     : INTERNAL ONLY',
                                        'Criticality  : HIGH',
                                        'Owner        : Application Engineering',
                                        'Services     : Windows Server 2008 R2 SP1, RDP (port 3389),',
                                        '               SMBv1 (port 445)',
                                        'Description  : Legacy Windows application server. RDP enabled for',
                                        '               admin access. SMBv1 left enabled for legacy app compat.',
                                        '               Internal network only -- RDP not exposed to internet.',
                                        'Last Patched : 2024-06-01',
                                        '',
                                        '======================================================',
                                        'EXPOSURE SUMMARY',
                                        '  Internet-facing hosts: WEB-DMZ-01, MAIL-DMZ-01',
                                        '  Internal-only hosts  : INT-DC-01, INT-VCENTER-01, INT-APP-01, INT-WIKI-01, INT-APP-02',
                                        '======================================================'
                                    ].join('\n')
                                },

                                // ── TRIAGE TASK ───────────────────────────────────────
                                // Task brief: names the questions (flags to determine),
                                // NOT the answers. Directs student to the evidence files.
                                'triage_task.txt': {
                                    type: 'file',
                                    content: [
                                        'VULNERABILITY TRIAGE TASK -- VM-2026-0601-004',
                                        '=============================================',
                                        'Assigned: 2026-06-01 09:00 UTC',
                                        'Analyst: (you)',
                                        '',
                                        'The monthly authenticated scan produced 11 findings across 7 hosts.',
                                        'Before scheduling the remediation sprint, complete the following',
                                        'triage tasks and submit your conclusions as flags.',
                                        '',
                                        'EVIDENCE FILES',
                                        '  /home/analyst/scan_report.txt    -- All 11 findings with CVE,',
                                        '                                       CVSS v3.1, host, and notes',
                                        '  /home/analyst/asset_inventory.txt -- Host register: exposure',
                                        '                                       (internet-facing vs internal),',
                                        '                                       criticality, services',
                                        '',
                                        'TRIAGE QUESTIONS (submit each answer as a flag)',
                                        '',
                                        '1. TOP PRIORITY CVE',
                                        '   Which single CVE should be remediated FIRST?',
                                        '   Use risk-based criteria: CVSS score AND internet exposure',
                                        '   AND active exploitation status. Raw CVSS alone is not enough.',
                                        '   Submit the CVE identifier (e.g. CVE-YYYY-NNNNN).',
                                        '',
                                        '2. HIGHEST CVSS SCORE',
                                        '   What is the highest CVSS v3.1 base score in the report?',
                                        '   (More than one finding may share this score.)',
                                        '   Submit the numeric value (e.g. 10.0).',
                                        '',
                                        '3. FALSE POSITIVE',
                                        '   One finding is likely a false positive. The scanner flagged it',
                                        '   based on a version banner, but the NOTE in the scan report',
                                        '   explains why it may not be a true vulnerability.',
                                        '   Submit the CVE identifier of the false positive.',
                                        '',
                                        '4. INTERNET-FACING HOST',
                                        '   What is the hostname of the internet-facing host that carries',
                                        '   the top-priority vulnerability?',
                                        '   Check the asset inventory for exposure classification.',
                                        '   Submit the hostname exactly as it appears in the inventory.',
                                        '',
                                        '5. ACTIVELY EXPLOITED CVE (distinct from top priority if possible)',
                                        '   The scan report flags more than one CVE as having an exploit',
                                        '   available or being actively exploited. One of them is your',
                                        '   top priority (already submitted as flag 1). Name a DIFFERENT',
                                        '   CVE from the report that is also marked as actively exploited.',
                                        '   Submit the CVE identifier.',
                                        '',
                                        'INVESTIGATION COMMANDS',
                                        '  cat /home/analyst/scan_report.txt',
                                        '  cat /home/analyst/asset_inventory.txt',
                                        '  grep "CVSS v3.1" /home/analyst/scan_report.txt',
                                        '  grep "Exploit available" /home/analyst/scan_report.txt',
                                        '  grep -i "actively exploited" /home/analyst/scan_report.txt',
                                        '  grep "INTERNET-FACING" /home/analyst/asset_inventory.txt',
                                        '  grep -i "false positive" /home/analyst/scan_report.txt',
                                        '  grep -i "backported" /home/analyst/scan_report.txt',
                                        '  grep "Host" /home/analyst/scan_report.txt'
                                    ].join('\n')
                                },

                                // Analyst scratch notes (pre-populated with triage framework)
                                'notes.txt': {
                                    type: 'file',
                                    content: [
                                        'VULNERABILITY TRIAGE SCRATCH PAD',
                                        '==================================',
                                        '',
                                        'Risk-based prioritization framework:',
                                        '  Priority = f(CVSS, Exposure, Exploitability, Criticality)',
                                        '',
                                        '  Step 1: Identify all CRITICAL CVSS findings (>= 9.0)',
                                        '  Step 2: Of those, filter for internet-facing hosts',
                                        '  Step 3: Of those, check for "exploit available" or "actively exploited"',
                                        '  Step 4: Highest CVSS + internet-facing + actively exploited = remediate first',
                                        '',
                                        'CVSS v3.1 severity bands:',
                                        '  10.0       = CRITICAL (maximum)',
                                        '  9.0 - 9.9  = CRITICAL',
                                        '  7.0 - 8.9  = HIGH',
                                        '  4.0 - 6.9  = MEDIUM',
                                        '  0.1 - 3.9  = LOW',
                                        '',
                                        'False positive indicators to look for:',
                                        '  - "version banner" without confirming actual patch state',
                                        '  - "backported" patch (RHEL/CentOS/Debian often backport fixes)',
                                        '  - NOTE field says "POSSIBLE FALSE POSITIVE"',
                                        '  - Scan NOTE recommends manual validation before remediating',
                                        '',
                                        'Key grep commands:',
                                        '  grep "CVSS v3.1" /home/analyst/scan_report.txt',
                                        '  grep "10.0" /home/analyst/scan_report.txt',
                                        '  grep -i "exploit" /home/analyst/scan_report.txt',
                                        '  grep "INTERNET-FACING" /home/analyst/asset_inventory.txt',
                                        '  grep -i "false positive" /home/analyst/scan_report.txt',
                                        '',
                                        'Triage notes:',
                                        '  Top priority CVE  : ',
                                        '  Highest CVSS      : ',
                                        '  False positive CVE: ',
                                        '  Internet-facing host: ',
                                        '  Other exploited CVE: '
                                    ].join('\n')
                                },

                                '.bash_history': {
                                    type: 'file',
                                    content: 'ls /home/analyst/\ncat /home/analyst/triage_task.txt\n'
                                }

                            } // end /home/analyst children
                        }
                    }
                },

                // /etc and /tmp so paths resolve cleanly
                'etc': {
                    type: 'dir',
                    children: {
                        'hostname': { type: 'file', content: 'vuln-ws-01' },
                        'hosts': {
                            type: 'file',
                            content: [
                                '127.0.0.1     localhost',
                                '10.10.10.20   WEB-DMZ-01',
                                '10.10.10.26   MAIL-DMZ-01',
                                '10.10.20.6    INT-DC-01',
                                '10.10.20.10   INT-VCENTER-01',
                                '10.10.20.30   INT-APP-01',
                                '10.10.20.40   INT-WIKI-01',
                                '10.10.20.32   INT-APP-02'
                            ].join('\n')
                        }
                    }
                },
                'tmp': { type: 'dir', children: {} }

            } // end / children
        }
    },

    // =========================================================
    // TERMINAL COMMANDS (custom additions)
    //
    // grep is PIPE-only in Terminal.js built-ins.
    // We add it as a standalone file-search command here so
    // `grep PATTERN /path/file` works directly, which is the
    // natural investigation pattern students will use.
    //
    // Terminal.js sets term._pipedStdin = <previous stdout> before
    // calling any custom command handler in a pipeline segment.
    // When a file arg is absent but _pipedStdin is non-empty,
    // we filter those lines instead of erroring.
    // =========================================================

    commands: {

        // ── grep: file-based AND pipe-aware ────────────────────
        // Handles: grep PATTERN FILE           (direct file search)
        //          cat FILE | grep PATTERN     (piped stdin via term._pipedStdin)
        //          grep -i PATTERN FILE        (case-insensitive)
        //          grep -v PATTERN FILE        (invert match)
        //          grep -c PATTERN FILE        (count matches)
        //          grep -n PATTERN FILE        (show line numbers)
        'grep': function(args, term, engine) {
            if (!args.length) {
                return 'Usage: grep [OPTIONS] PATTERN FILE\n  -i  case-insensitive\n  -v  invert match (lines NOT matching)\n  -c  count matching lines\n  -n  show line numbers\n\nExample: grep "CVSS v3.1" /home/analyst/scan_report.txt\nExample: grep -i "exploit" /home/analyst/scan_report.txt\nExample: cat /home/analyst/scan_report.txt | grep "CRITICAL"';
            }

            // Parse flags and positional args
            var flags    = args.filter(function(a) { return a.startsWith('-'); });
            var nonFlag  = args.filter(function(a) { return !a.startsWith('-'); });
            var pattern  = nonFlag[0] || '';
            var filePath = nonFlag[1] || '';

            var caseInsensitive = flags.some(function(f) { return f.includes('i'); });
            var invertMatch     = flags.some(function(f) { return f.includes('v'); });
            var countOnly       = flags.some(function(f) { return f.includes('c'); });
            var showLineNums    = flags.some(function(f) { return f.includes('n'); });

            if (!pattern) return 'grep: missing pattern\nUsage: grep PATTERN FILE';

            // Determine the content to search: piped stdin OR a named file.
            // Terminal.js populates term._pipedStdin when this command runs
            // as a pipeline segment (e.g. cat file | grep pattern).
            var content;
            if (filePath) {
                var node = term._getNode(filePath);
                if (!node) return 'grep: ' + filePath + ': No such file or directory';
                if (node.type === 'dir') return 'grep: ' + filePath + ': Is a directory';
                content = node.content || '';
            } else if (term._pipedStdin) {
                content = term._pipedStdin;
            } else {
                return 'grep: missing file argument\nUsage: grep PATTERN FILE\n       cat FILE | grep PATTERN';
            }

            var lines = content.split('\n');

            var re;
            try {
                re = new RegExp(pattern, caseInsensitive ? 'i' : '');
            } catch (e) {
                return 'grep: invalid regular expression: ' + pattern;
            }

            var matched = [];
            lines.forEach(function(line, idx) {
                var hits = re.test(line);
                var keep = invertMatch ? !hits : hits;
                if (keep) matched.push({ num: idx + 1, text: line });
            });

            if (countOnly) return String(matched.length);
            if (!matched.length) return '';

            if (showLineNums) {
                return matched.map(function(m) { return m.num + ':' + m.text; }).join('\n');
            }
            return matched.map(function(m) { return m.text; }).join('\n');
        },

        // ── wc -l shorthand ───────────────────────────────────
        // Lets students count findings: wc -l /home/analyst/scan_report.txt
        'wc': function(args, term) {
            var lineMode  = args.includes('-l');
            var wordMode  = args.includes('-w');
            var filePaths = args.filter(function(a) { return !a.startsWith('-'); });

            if (!filePaths.length) {
                // Piped input (e.g. grep PATTERN FILE | wc -l): no file arg, count term._pipedStdin
                if (term && term._pipedStdin) {
                    var _s = term._pipedStdin;
                    var _sl = _s === '' ? 0 : _s.replace(/\n+$/, '').split('\n').length;
                    var _sw = _s.split(/\s+/).filter(Boolean).length;
                    if (lineMode) return '  ' + _sl;
                    if (wordMode) return '  ' + _sw;
                    return '  ' + _sl + '  ' + _sw + '  ' + _s.length;
                }
                return 'Usage: wc [-l] [-w] FILE\nExample: wc -l /var/log/auth.log';
            }

            var results = [];
            filePaths.forEach(function(fp) {
                var node = term._getNode(fp);
                if (!node) { results.push('wc: ' + fp + ': No such file or directory'); return; }
                if (node.type === 'dir') { results.push('wc: ' + fp + ': Is a directory'); return; }
                var c = node.content || '';
                var lineCount = c.split('\n').length;
                var wordCount = c.split(/\s+/).filter(Boolean).length;
                if (lineMode)       results.push('  ' + lineCount + ' ' + fp);
                else if (wordMode)  results.push('  ' + wordCount + ' ' + fp);
                else                results.push('  ' + lineCount + '  ' + wordCount + '  ' + c.length + ' ' + fp);
            });
            return results.join('\n');
        },

        // ── help override (supplements built-in with case context) ──
        'help': function(args, term) {
            return [
                'VULNERABILITY SCAN TRIAGE -- COMMAND REFERENCE',
                '',
                'File inspection:',
                '  ls [PATH]               List directory contents',
                '  cat FILE                Display full file contents',
                '  head [-n N] FILE        First N lines (default 10)',
                '  tail [-n N] FILE        Last N lines (default 10)',
                '  find PATH [-name PAT]   Search for files',
                '',
                'Search and filter:',
                '  grep [-ivnc] PAT FILE   Search for pattern in file',
                '    -i  case-insensitive  -v  invert  -n  line nums  -c  count',
                '  wc -l FILE              Count lines in a file',
                '',
                'Navigation:',
                '  cd PATH                 Change directory',
                '  pwd                     Print working directory',
                '  clear                   Clear screen',
                '',
                'Key evidence locations:',
                '  /home/analyst/scan_report.txt      11 vulnerability findings',
                '  /home/analyst/asset_inventory.txt  Host exposure and criticality',
                '  /home/analyst/triage_task.txt      Task brief and investigation guide',
                '  /home/analyst/notes.txt            Analyst scratch pad',
                '',
                'Key investigation commands:',
                '  grep "CVSS v3.1" /home/analyst/scan_report.txt',
                '  grep -i "exploit" /home/analyst/scan_report.txt',
                '  grep -i "actively exploited" /home/analyst/scan_report.txt',
                '  grep "INTERNET-FACING" /home/analyst/asset_inventory.txt',
                '  grep -i "false positive" /home/analyst/scan_report.txt',
                '  grep -i "backported" /home/analyst/scan_report.txt'
            ].join('\n');
        }

    },

    // =========================================================
    // LOG VIEWER DATA (BlueTeam.js LogViewer device)
    //
    // Presents the most forensically relevant scan findings and
    // inventory facts as structured log entries.
    // Severity reflects risk-based assessment (not raw CVSS alone):
    //   - crit: internet-facing + CVSS 9.8 + actively exploited
    //   - err:  CVSS 10.0 but internal-only, or 9.8 CRITICAL
    //   - warning: HIGH severity, internal
    //   - info:  false positive / low risk
    //
    // suspicious:true highlights the top-priority finding and the
    // false positive so students recognize them quickly.
    // =========================================================

    logViewer: {
        entries: [
            // ── Top-priority finding (CVSS 9.8, internet-facing, actively exploited) ──
            { timestamp: '2026-06-01 02:00:01', severity: 'crit',    source: 'scan/WEB-DMZ-01',       message: 'CVE-2022-22965 Spring4Shell -- CVSS 9.8 -- WEB-DMZ-01:443 (INTERNET-FACING) -- Exploit available, actively exploited', suspicious: true },
            // ── CVSS 10.0 internal (highest raw CVSS, but NOT top priority -- internal-only foil) ──
            { timestamp: '2026-06-01 02:00:02', severity: 'err',     source: 'scan/INT-DC-01',         message: 'CVE-2020-1472 Zerologon -- CVSS 10.0 -- INT-DC-01:445 (INTERNAL ONLY) -- Domain compromise risk' },
            // ── CVSS 9.8 CRITICAL findings (internal) ────────────────────────────
            { timestamp: '2026-06-01 02:00:03', severity: 'err',     source: 'scan/INT-VCENTER-01',    message: 'CVE-2021-21985 vCenter RCE -- CVSS 9.8 -- INT-VCENTER-01:443 (INTERNAL ONLY)' },
            { timestamp: '2026-06-01 02:00:04', severity: 'err',     source: 'scan/INT-APP-01',        message: 'CVE-2022-22963 Spring Cloud Fn SpEL RCE -- CVSS 9.8 -- INT-APP-01:8080 (INTERNAL ONLY)' },
            { timestamp: '2026-06-01 02:00:05', severity: 'err',     source: 'scan/INT-WIKI-01',       message: 'CVE-2021-26084 Confluence OGNL -- CVSS 9.8 -- INT-WIKI-01:8090 (INTERNAL ONLY)' },
            { timestamp: '2026-06-01 02:00:06', severity: 'err',     source: 'scan/INT-APP-01',        message: 'CVE-2014-6271 Shellshock -- CVSS 9.8 -- INT-APP-01:80 (INTERNAL ONLY)' },
            // ── Actively exploited CVSS 9.8 (internal) -- exploited_cve target ──
            { timestamp: '2026-06-01 02:00:07', severity: 'err',     source: 'scan/INT-APP-02',        message: 'CVE-2019-0708 BlueKeep -- CVSS 9.8 -- INT-APP-02:3389 (INTERNAL ONLY) -- Exploit available, actively exploited', suspicious: true },
            // ── HIGH severity findings ────────────────────────────────────────────
            { timestamp: '2026-06-01 02:00:08', severity: 'warning', source: 'scan/INT-DC-01',         message: 'CVE-2021-34527 PrintNightmare -- CVSS 8.8 -- INT-DC-01:135 (INTERNAL ONLY)' },
            { timestamp: '2026-06-01 02:00:09', severity: 'warning', source: 'scan/INT-APP-02',        message: 'CVE-2017-0144 EternalBlue/MS17-010 -- CVSS 8.8 -- INT-APP-02:445 (INTERNAL ONLY)' },
            { timestamp: '2026-06-01 02:00:10', severity: 'warning', source: 'scan/INT-APP-01',        message: 'CVE-2021-3156 Baron Samedit (sudo) -- CVSS 7.8 -- INT-APP-01 local priv-esc (INTERNAL ONLY)' },
            // ── False positive (flagged by banner, distro patch applied) ──────────
            { timestamp: '2026-06-01 02:00:11', severity: 'info',    source: 'scan/MAIL-DMZ-01',       message: 'CVE-2014-0160 Heartbleed -- CVSS 7.5 -- MAIL-DMZ-01:443 -- NOTE: POSSIBLE FALSE POSITIVE (CentOS 6 distro-backported patch into openssl-1.0.1e; version banner does not reflect patch state)', suspicious: true },
            // ── Asset inventory context ───────────────────────────────────────────
            { timestamp: '2026-06-01 02:00:12', severity: 'info',    source: 'asset-inventory',        message: 'INTERNET-FACING hosts in scope: WEB-DMZ-01 (10.10.10.20), MAIL-DMZ-01 (10.10.10.26)' },
            { timestamp: '2026-06-01 02:00:13', severity: 'info',    source: 'asset-inventory',        message: 'INTERNAL-ONLY hosts in scope: INT-DC-01, INT-VCENTER-01, INT-APP-01, INT-WIKI-01, INT-APP-02' }
        ]
    },

    // =========================================================
    // FLAGS
    //
    // All five flags are find-and-submit: the student discovers
    // the exact value from scan_report.txt and asset_inventory.txt.
    // BoxEngine validates against Firestore
    // flag_registry/{boxId}/flags/{flagId}.
    //
    // FIRESTORE SEEDING (flag_registry/shield-sp-blueteam-vuln-triage):
    //   top_priority_cve    -> CVE-2022-22965
    //   highest_cvss        -> 10.0
    //   false_positive_cve  -> CVE-2014-0160
    //   internet_facing_host -> WEB-DMZ-01
    //   exploited_cve       -> CVE-2019-0708
    // =========================================================

    flags: [
        {
            id:          'top_priority_cve',
            points:      200,
            label:       'Top Priority CVE (Risk-Based)',
            description: 'The CVE to remediate first. Use risk-based criteria: CVSS score combined with internet exposure and active exploitation status. Submit the CVE identifier exactly as written in the scan report (e.g. CVE-YYYY-NNNNN).'
        },
        {
            id:          'highest_cvss',
            points:      100,
            label:       'Highest CVSS v3.1 Base Score',
            description: 'The single highest CVSS v3.1 base score value present in the scan report. Submit the numeric value with one decimal place (e.g. 10.0). Note: the finding with this score is NOT the top-priority CVE -- check the exposure classification to understand why.'
        },
        {
            id:          'false_positive_cve',
            points:      150,
            label:       'False Positive CVE',
            description: 'One finding in the scan report is likely a false positive: the scanner detected the CVE based on a version banner, but the NOTE field explains why the finding may not represent a true vulnerability (distro-backported patch). Submit the CVE identifier.'
        },
        {
            id:          'internet_facing_host',
            points:      100,
            label:       'Internet-Facing Host (Top Priority)',
            description: 'The hostname of the internet-facing host that carries the top-priority vulnerability. Check the asset inventory for the exposure classification. Submit the hostname exactly as it appears in the inventory (uppercase, as shown).'
        },
        {
            id:          'exploited_cve',
            points:      150,
            label:       'Actively Exploited CVE (Distinct from Top Priority)',
            description: 'A second CVE in the scan report that is also flagged as having an exploit available or being actively exploited -- different from the top-priority CVE you already identified. Submit the CVE identifier.'
        }
    ],

    // =========================================================
    // SCORING
    // =========================================================

    scoring: {
        base:               1000,
        minScore:           0,
        maxScore:           700,
        hintPenalty:        true,
        wrongFlagPenalty:   -25,
        speedBonus:         { threshold: 1800000, points: 100 },
        timeBonusThreshold: 2400
    },

    // =========================================================
    // HINTS
    //
    // Progressive: first two hints give strategy, third gives an
    // exact command. ONLY the final hint per flag may reveal the
    // answer via {{FLAG:id}} (incurs the largest penalty).
    //
    // No flag value appears in any lore, scenario, intro,
    // triage_task.txt, notes.txt, help text, or non-final hint.
    // Values are discoverable ONLY from scan_report.txt /
    // asset_inventory.txt.
    // =========================================================

    hints: [

        // ── top_priority_cve ─────────────────────────────────
        {
            id:      'hint_top_1',
            flagId:  'top_priority_cve',
            text:    'Risk-based prioritization is a three-step filter: (1) Find all CRITICAL findings (CVSS >= 9.0). (2) Of those, identify which ones affect internet-facing hosts -- cross-reference the CVE host against the asset inventory. (3) Of the internet-facing ones, check the NOTE field for "exploit available" or "actively exploited." The intersection of all three criteria is the top priority.',
            cost:    25,
            penalty: -25
        },
        {
            id:      'hint_top_2',
            flagId:  'top_priority_cve',
            text:    'Run: grep -i "actively exploited" /home/analyst/scan_report.txt\n\nThis gives you the subset of findings with active exploitation confirmed. Note the host in each matching finding, then run:\n  grep "INTERNET-FACING" /home/analyst/asset_inventory.txt\nto see which hosts are internet-facing. The finding where both conditions are true -- highest CVSS AND internet-facing AND actively exploited -- is the top priority.',
            cost:    50,
            penalty: -50
        },
        {
            id:      'hint_top_3',
            flagId:  'top_priority_cve',
            text:    'The finding with the highest raw CVSS (10.0) is on an internal-only host -- it is NOT the top priority. The top priority is FINDING 001: CVSS 9.8, on the internet-facing DMZ web server, marked as actively exploited. Read FINDING 001 and cross-reference its host against the asset inventory EXPOSURE field.\n\nThe value to submit: {{FLAG:top_priority_cve}}',
            cost:    75,
            penalty: -75
        },

        // ── highest_cvss ──────────────────────────────────────
        {
            id:      'hint_cvss_1',
            flagId:  'highest_cvss',
            text:    'The CVSS v3.1 score for each finding is on the "CVSS v3.1" line in the scan report. Scan all 11 findings and note the scores. The CVSS v3.1 base score scale goes up to a maximum value -- look for findings at or near the top of that scale.',
            cost:    25,
            penalty: -25
        },
        {
            id:      'hint_cvss_2',
            flagId:  'highest_cvss',
            text:    'Run: grep "CVSS v3.1" /home/analyst/scan_report.txt\n\nThis prints every CVSS line in order. Scan the list for the largest value. The score is listed after the colon followed by the severity label in parentheses.',
            cost:    50,
            penalty: -50
        },
        {
            id:      'hint_cvss_3',
            flagId:  'highest_cvss',
            text:    'One finding in the report holds the maximum possible CVSS v3.1 base score. It is NOT the top-priority CVE -- it is on an internal-only host. Submit the score as a decimal number.\n\nThe value to submit: {{FLAG:highest_cvss}}',
            cost:    75,
            penalty: -75
        },

        // ── false_positive_cve ────────────────────────────────
        {
            id:      'hint_fp_1',
            flagId:  'false_positive_cve',
            text:    'One finding in the scan report has a NOTE field that explicitly flags it as a possible false positive. Look for the phrase "POSSIBLE FALSE POSITIVE" in the NOTE text. The reason is always the same pattern: the scanner read a version string (the "banner") and matched it to a CVE, but the actual package has a backported patch that the version string does not reflect.',
            cost:    25,
            penalty: -25
        },
        {
            id:      'hint_fp_2',
            flagId:  'false_positive_cve',
            text:    'Run: grep -i "false positive" /home/analyst/scan_report.txt\n\nThen run: grep -i "backported" /home/analyst/scan_report.txt\n\nBoth searches point to the same finding. The NOTE on that finding explains that the OS (CentOS/RHEL family) ships backported security patches -- the version string shown by the scanner matches a vulnerable version, but the patch was applied by the distribution without changing the version number.',
            cost:    50,
            penalty: -50
        },
        {
            id:      'hint_fp_3',
            flagId:  'false_positive_cve',
            text:    'The false positive is on MAIL-DMZ-01. Read FINDING 011 in full. The CVE listed there was detected via a TLS version banner, but the NOTE explains why the detection is likely wrong for a RHEL-derived distribution.\n\nThe value to submit: {{FLAG:false_positive_cve}}',
            cost:    75,
            penalty: -75
        },

        // ── internet_facing_host ──────────────────────────────
        {
            id:      'hint_host_1',
            flagId:  'internet_facing_host',
            text:    'The asset inventory classifies every host by exposure: "INTERNET-FACING" or "INTERNAL ONLY." The top-priority CVE (the one you identified as flag 1) is on a specific host listed in that finding. Look up that host in the asset inventory to confirm its exposure classification.',
            cost:    25,
            penalty: -25
        },
        {
            id:      'hint_host_2',
            flagId:  'internet_facing_host',
            text:    'Run: grep "INTERNET-FACING" /home/analyst/asset_inventory.txt\n\nTwo hosts are internet-facing. The top-priority vulnerability is on one of them -- the one running a Spring Boot WAR deployment behind Nginx. Read FINDING 001 for the host name, then confirm via the asset inventory.',
            cost:    50,
            penalty: -50
        },
        {
            id:      'hint_host_3',
            flagId:  'internet_facing_host',
            text:    'The internet-facing host carrying the top-priority vulnerability is listed in FINDING 001 of the scan report. Cross-reference that hostname against the EXPOSURE field in the asset inventory. Submit the hostname exactly as it appears in the "HOST" field of the inventory (uppercase, no IP).\n\nThe value to submit: {{FLAG:internet_facing_host}}',
            cost:    75,
            penalty: -75
        },

        // ── exploited_cve ─────────────────────────────────────
        {
            id:      'hint_exploited_1',
            flagId:  'exploited_cve',
            text:    'The scan report marks some findings with "Exploit available. Actively exploited in the wild." in the NOTE field. You already identified one of these as the top priority. Find a second CVE in the report that also carries this NOTE but is on a different host -- an internal-only Windows server.',
            cost:    25,
            penalty: -25
        },
        {
            id:      'hint_exploited_2',
            flagId:  'exploited_cve',
            text:    'Run: grep -i "actively exploited" /home/analyst/scan_report.txt\n\nMore than one finding matches. One is on a DMZ host (the top priority you already submitted). The other is on an internal Windows host -- read the CVE and port/service fields for that second finding. That CVE identifier is the answer.',
            cost:    50,
            penalty: -50
        },
        {
            id:      'hint_exploited_3',
            flagId:  'exploited_cve',
            text:    'The second actively-exploited CVE in the report is a wormable pre-auth RCE in Windows Remote Desktop (RDP). It appears in FINDING 007 and affects an internal application server. Submit that CVE identifier.\n\nThe value to submit: {{FLAG:exploited_cve}}',
            cost:    75,
            penalty: -75
        }

    ],

    // =========================================================
    // CERT OBJECTIVES (assessment mode compatibility)
    //
    // certObjectives.mappings is the live format (flat array
    // under certObjectives) -- NOT a standalone objectiveMappings.
    // All five flags map to SY0-701 Domain 4.3 (vulnerability
    // assessment and remediation) with distinct skill callouts
    // to reinforce the risk-based prioritization lesson.
    // =========================================================

    certObjectives: {
        certPath: 'CompTIA Security+ SY0-701',
        mappings: [
            {
                flagId:      'top_priority_cve',
                objective:   '4.3',
                description: 'Explain the importance of vulnerability management activities -- risk-based prioritization',
                skill:       'Combining CVSS score, internet exposure, and active exploitation status to determine remediation order'
            },
            {
                flagId:      'highest_cvss',
                objective:   '4.3',
                description: 'Explain the importance of vulnerability management activities -- CVSS scoring',
                skill:       'Reading and interpreting CVSS v3.1 base scores from authenticated scanner output'
            },
            {
                flagId:      'false_positive_cve',
                objective:   '4.3',
                description: 'Explain the importance of vulnerability management activities -- false positive identification',
                skill:       'Identifying scanner false positives caused by version-banner detection without patch-state verification on RHEL-family distributions'
            },
            {
                flagId:      'internet_facing_host',
                objective:   '4.3',
                description: 'Explain the importance of vulnerability management activities -- asset exposure classification',
                skill:       'Correlating scan findings with asset inventory exposure classification to assess internet attack surface'
            },
            {
                flagId:      'exploited_cve',
                objective:   '4.3',
                description: 'Explain the importance of vulnerability management activities -- exploitation status analysis',
                skill:       'Identifying CVEs with confirmed active exploitation from scanner NOTE fields to inform urgency'
            }
        ]
    },

    // =========================================================
    // STATE RESET (BOX-006 pattern -- idempotent on script load)
    // =========================================================

    resetState: function() {
        // No internal _state needed for a pure find-and-submit box.
        // BoxEngine manages flag submission state in Firestore.
    }

};

// Auto-reset on load (BOX-006 backfill 2026-05-23)
// Use window.VFVTConfig -- the bare name is not in scope after the window= assignment.
if (window.VFVTConfig) window.VFVTConfig.resetState();
