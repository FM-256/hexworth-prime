/* ============================================================
   Security+ Cert Prep — Intrusion Hunt: Veridian Financial SOC
   Blue-team log investigation | find-and-submit flags
   Students investigate real log files in a virtual filesystem,
   discover IOCs by grepping/catting, and submit FLAG values.
   SY0-701: 4.3, 4.4, 4.5, 4.8
   ============================================================ */

// window assignment (not const) so the second <script> block in index.html
// can reference VFIHConfig after this script has loaded.
window.VFIHConfig = {

    // =========================================================
    // BOX METADATA
    // =========================================================

    id: 'shield-sp-blueteam-log-intrusion-hunt',
    title: 'Intrusion Hunt',
    subtitle: 'Veridian Financial SOC -- Web Server Compromise',
    description: 'An overnight intrusion hit Veridian Financial\'s web server. You are the on-call analyst. Investigate auth logs, Apache access logs, and firewall logs to reconstruct the kill chain and recover each indicator of compromise.',
    difficulty: 'Intermediate',
    estimatedTime: 40,
    accent: '#2563eb',
    storageKey: 'hexworth_lab_sp_blueteam_intrusion',
    registryId: 'shield-sp-blueteam-log-intrusion-hunt',
    trackerKey: 'lab_sp_blueteam_intrusion',

    // Blue-team mode tells BoxEngine to accept BlueTeam device types
    blueTeamMode: true,

    // =========================================================
    // BOOT SEQUENCE
    // =========================================================

    boot: {
        biosLines: [
            'VERIDIAN FINANCIAL SOC WORKSTATION v3.1.0',
            'SOC Analyst Terminal -- Tier-2 Access',
            'Ubuntu 22.04.4 LTS: LOADING',
            'Log collection mount: /var/log -- READY',
            'Evidence timestamp: 2026-03-14 03:00 UTC',
            'Incident ticket: INC-2026-0314-007 -- ACTIVE'
        ],
        grubEntries: [
            'Ubuntu 22.04.4 LTS (SOC Analyst)',
            'Ubuntu 22.04.4 LTS (recovery mode)'
        ],
        loginUser: 'analyst'
    },

    // =========================================================
    // LORE
    // =========================================================

    lore: {
        intro: 'It is 03:00 UTC. Pagerduty woke you up. INC-2026-0314-007: "Anomalous outbound connection from WEB-DMZ-01 (10.10.10.20) to unknown external IP over non-standard port." The web server should never initiate outbound connections to the internet. Something got in. Your job is to find out how, what they touched, and what left the building.',
        scenario: 'Evidence snapshot is mounted at /var/log on this analyst workstation. The logs cover the attack window. Start with auth.log to find the initial access vector, move to apache2/access.log for web activity, then correlate in firewall.log. Each IOC you find is a flag -- discover it from the logs, then submit it via the Submit Flag panel.',
        outro: 'Kill chain fully reconstructed. Attacker entered via SSH brute-force against account jgarcia, deployed a web shell, pivoted internally to APP-INT-05, and exfiltrated 1 MB over port 4444. Incident response team now has every IOC needed to scope and contain. This is the core skill SY0-701 Domain 4 tests: given raw logs, build the picture.',

        goals: [
            'Find the attacker\'s external IP address in auth.log (SSH brute-force source)',
            'Identify the compromised user account that was brute-forced and successfully logged in',
            'Locate the web shell path in the Apache access log',
            'Identify the internal host the attacker pivoted to via lateral SSH',
            'Find the exact byte count of the outbound exfiltration in the firewall log'
        ],

        toolkit: [
            { name: 'cat',   purpose: 'Display a full log file',                   sample: 'cat /var/log/auth.log' },
            { name: 'grep',  purpose: 'Search for a pattern in a file',            sample: 'grep "198.51.100.47" /var/log/auth.log' },
            { name: 'head',  purpose: 'Show first N lines of a file',              sample: 'head -n 30 /var/log/apache2/access.log' },
            { name: 'tail',  purpose: 'Show last N lines of a file',               sample: 'tail -n 20 /var/log/firewall.log' },
            { name: 'find',  purpose: 'Locate files in a directory tree',          sample: 'find /var/log -name "*.log"' },
            { name: 'ls',    purpose: 'List directory contents',                    sample: 'ls /var/log/apache2/' },
            { name: 'help',  purpose: 'Show available commands',                    sample: 'help' }
        ]
    },

    // =========================================================
    // TERMINAL CONFIG
    // =========================================================

    terminal: {
        user: 'analyst',
        hostname: 'soc-ws-01',
        startDir: '/home/analyst',
        welcome: 'Veridian Financial -- SOC Analyst Terminal\nTier-2 Access | INC-2026-0314-007 Active\n\nEvidence snapshot: /var/log/\n  auth.log            SSH and authentication events\n  apache2/access.log  Apache web server access log\n  firewall.log        Perimeter firewall flow log\n\nCase file: /home/analyst/case.txt\n\nInvestigate the logs. Every IOC you find is a flag.\nSubmit discovered values via the Submit Flag panel.\n\nType "help" for available commands.\n'
    },

    // =========================================================
    // DESKTOP ICONS
    // =========================================================

    desktop: {
        icons: [
            { id: 'terminal',  label: 'Terminal',    icon: '🖥️', app: 'terminal'   },
            { id: 'logviewer', label: 'Log Viewer',  icon: '📋',       app: 'logviewer'  },
            { id: 'notes',     label: 'Notes',       icon: '📝',       app: 'notes'      },
            { id: 'hints',     label: 'Hints',       icon: '💡',       app: 'hints'      },
            { id: 'flags',     label: 'Submit Flag', icon: '🚩',       app: 'flags'      }
        ]
    },

    // =========================================================
    // SIMULATED FILESYSTEM
    //
    // /home/analyst/   -- analyst home (case notes)
    // /var/log/        -- evidence snapshot
    //   auth.log       -- FLAG: attacker_ip, compromised_account
    //   apache2/
    //     access.log   -- FLAG: webshell_path, lateral_target (via shell cmds)
    //   firewall.log   -- FLAG: exfil_bytes, lateral_target (firewall entry)
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

                                // Case file: tells the student what to look for
                                'case.txt': {
                                    type: 'file',
                                    content: [
                                        'INCIDENT: INC-2026-0314-007',
                                        'Date: 2026-03-14',
                                        'Analyst: (you)',
                                        '',
                                        'AFFECTED ASSETS',
                                        '  WEB-DMZ-01   10.10.10.20   web-facing server (Ubuntu 22.04)',
                                        '  APP-INT-05   (IP unknown)  internal application server',
                                        '',
                                        'ALERT TRIGGER',
                                        '  PagerDuty: Anomalous outbound connection from 10.10.10.20',
                                        '  Direction: OUTBOUND from DMZ to unknown external IP, non-standard port',
                                        '  Timestamp: 2026-03-14 03:19:22 UTC',
                                        '',
                                        'EVIDENCE LOCATION',
                                        '  /var/log/auth.log           (SSH / PAM events)',
                                        '  /var/log/apache2/access.log (web server requests)',
                                        '  /var/log/firewall.log       (perimeter flow records)',
                                        '',
                                        'IOCs TO RECOVER (submit each as a flag)',
                                        '  attacker_ip       -- external source IP used for brute-force and C2',
                                        '  compromised_account -- local account that was brute-forced and accessed',
                                        '  webshell_path     -- path of the uploaded web shell found in Apache log',
                                        '  lateral_target    -- internal host the attacker pivoted to via SSH',
                                        '  exfil_bytes       -- total bytes sent outbound in the exfil flow (firewall.log BYTES field)',
                                        '',
                                        'INVESTIGATION COMMANDS',
                                        '  grep "Failed password" /var/log/auth.log | head -5',
                                        '  grep "Accepted password" /var/log/auth.log',
                                        '  grep "shell.php" /var/log/apache2/access.log',
                                        '  grep "4444" /var/log/firewall.log',
                                        '  cat /var/log/firewall.log | grep "BYTES="'
                                    ].join('\n')
                                },

                                // Analyst scratch notes (editable reminder)
                                'notes.txt': {
                                    type: 'file',
                                    content: [
                                        'SOC INVESTIGATION SCRATCH PAD',
                                        '================================',
                                        '',
                                        'grep tips:',
                                        '  grep PATTERN /path/to/file      -- search a file for pattern',
                                        '  grep -i PATTERN /path/to/file   -- case-insensitive',
                                        '  grep -v PATTERN /path/to/file   -- lines NOT matching (exclude noise)',
                                        '  grep -c PATTERN /path/to/file   -- count matching lines',
                                        '',
                                        'Useful patterns for SSH log analysis:',
                                        '  "Failed password"    -- brute-force attempts',
                                        '  "Accepted password"  -- successful auth (the one that matters)',
                                        '  "Invalid user"       -- attempts on non-existent accounts (noise)',
                                        '',
                                        'Apache combined log format:',
                                        '  IP - - [timestamp] "METHOD path HTTP/1.1" status bytes "referer" "UA"',
                                        '',
                                        'Firewall log BYTES field = total bytes in the flow (not per packet).',
                                        '',
                                        'IOC notes:',
                                        '  Attacker IP:    ',
                                        '  Account:        ',
                                        '  Web shell:      ',
                                        '  Lateral target: ',
                                        '  Exfil bytes:    '
                                    ].join('\n')
                                },

                                '.bash_history': {
                                    type: 'file',
                                    content: 'ls /var/log/\ncat /home/analyst/case.txt\n'
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
                                //   - Normal background noise (other service auths, cron, su)
                                //   - 17 "Failed password for jgarcia" from 198.51.100.47
                                //   - "Invalid user" lines for nonexistent accounts (additional noise)
                                //   - THE successful login: "Accepted password for jgarcia from 198.51.100.47 at 03:17:04"
                                //   - sudo lines after compromise
                                //   - Lateral SSH from WEB-DMZ-01 to APP-INT-05
                                //
                                // FLAG DISCOVERY:
                                //   attacker_ip        -> grep "Failed password" /var/log/auth.log
                                //   compromised_account -> grep "Accepted password" /var/log/auth.log
                                'auth.log': {
                                    type: 'file',
                                    content: [
                                        // Normal background: cron, monitoring, legitimate logins
                                        'Mar 14 02:30:01 WEB-DMZ-01 CRON[14821]: pam_unix(cron:session): session opened for user root by (uid=0)',
                                        'Mar 14 02:30:01 WEB-DMZ-01 CRON[14821]: pam_unix(cron:session): session closed for user root',
                                        'Mar 14 02:31:14 WEB-DMZ-01 sshd[14830]: Accepted publickey for deploy from 10.10.1.5 port 52201 ssh2: RSA SHA256:xK7mN2pQrY',
                                        'Mar 14 02:31:15 WEB-DMZ-01 sshd[14830]: pam_unix(sshd:session): session opened for user deploy by (uid=0)',
                                        'Mar 14 02:31:58 WEB-DMZ-01 sshd[14830]: pam_unix(sshd:session): session closed for user deploy',
                                        'Mar 14 02:35:07 WEB-DMZ-01 sudo:   www-data : command not allowed ; TTY=unknown ; PWD=/var/www/html ; USER=root ; COMMAND=/usr/bin/apt',
                                        'Mar 14 02:40:22 WEB-DMZ-01 sshd[14912]: Accepted publickey for deploy from 10.10.1.5 port 52388 ssh2: RSA SHA256:xK7mN2pQrY',
                                        'Mar 14 02:40:23 WEB-DMZ-01 sshd[14912]: pam_unix(sshd:session): session opened for user deploy by (uid=0)',
                                        'Mar 14 02:41:04 WEB-DMZ-01 sshd[14912]: pam_unix(sshd:session): session closed for user deploy',
                                        // Brute-force begins -- invalid users first (noise / pattern of scanner)
                                        'Mar 14 03:02:11 WEB-DMZ-01 sshd[15100]: Invalid user admin from 198.51.100.47 port 49200',
                                        'Mar 14 03:02:11 WEB-DMZ-01 sshd[15100]: pam_unix(sshd:auth): authentication failure; logname= uid=0 euid=0 tty=ssh ruser= rhost=198.51.100.47',
                                        'Mar 14 03:02:12 WEB-DMZ-01 sshd[15100]: Failed password for invalid user admin from 198.51.100.47 port 49200 ssh2',
                                        'Mar 14 03:02:18 WEB-DMZ-01 sshd[15103]: Invalid user test from 198.51.100.47 port 49204',
                                        'Mar 14 03:02:18 WEB-DMZ-01 sshd[15103]: Failed password for invalid user test from 198.51.100.47 port 49204 ssh2',
                                        'Mar 14 03:02:24 WEB-DMZ-01 sshd[15106]: Invalid user webadmin from 198.51.100.47 port 49208',
                                        'Mar 14 03:02:24 WEB-DMZ-01 sshd[15106]: Failed password for invalid user webadmin from 198.51.100.47 port 49208 ssh2',
                                        'Mar 14 03:02:31 WEB-DMZ-01 sshd[15109]: Invalid user ubuntu from 198.51.100.47 port 49214',
                                        'Mar 14 03:02:31 WEB-DMZ-01 sshd[15109]: Failed password for invalid user ubuntu from 198.51.100.47 port 49214 ssh2',
                                        // Brute-force shifts to real account jgarcia
                                        'Mar 14 03:03:15 WEB-DMZ-01 sshd[15118]: pam_unix(sshd:auth): authentication failure; logname= uid=0 euid=0 tty=ssh ruser= rhost=198.51.100.47 user=jgarcia',
                                        'Mar 14 03:03:15 WEB-DMZ-01 sshd[15118]: Failed password for jgarcia from 198.51.100.47 port 49301 ssh2',
                                        'Mar 14 03:03:22 WEB-DMZ-01 sshd[15121]: Failed password for jgarcia from 198.51.100.47 port 49307 ssh2',
                                        'Mar 14 03:03:29 WEB-DMZ-01 sshd[15124]: Failed password for jgarcia from 198.51.100.47 port 49314 ssh2',
                                        'Mar 14 03:03:36 WEB-DMZ-01 sshd[15127]: Failed password for jgarcia from 198.51.100.47 port 49320 ssh2',
                                        'Mar 14 03:03:43 WEB-DMZ-01 sshd[15130]: Failed password for jgarcia from 198.51.100.47 port 49326 ssh2',
                                        'Mar 14 03:03:50 WEB-DMZ-01 sshd[15133]: Failed password for jgarcia from 198.51.100.47 port 49333 ssh2',
                                        'Mar 14 03:04:01 WEB-DMZ-01 sshd[15136]: Failed password for jgarcia from 198.51.100.47 port 49340 ssh2',
                                        'Mar 14 03:04:08 WEB-DMZ-01 sshd[15139]: Failed password for jgarcia from 198.51.100.47 port 49347 ssh2',
                                        'Mar 14 03:04:15 WEB-DMZ-01 sshd[15142]: Failed password for jgarcia from 198.51.100.47 port 49353 ssh2',
                                        'Mar 14 03:04:22 WEB-DMZ-01 sshd[15145]: Failed password for jgarcia from 198.51.100.47 port 49360 ssh2',
                                        'Mar 14 03:04:29 WEB-DMZ-01 sshd[15148]: Failed password for jgarcia from 198.51.100.47 port 49367 ssh2',
                                        'Mar 14 03:04:36 WEB-DMZ-01 sshd[15151]: Failed password for jgarcia from 198.51.100.47 port 49373 ssh2',
                                        'Mar 14 03:04:43 WEB-DMZ-01 sshd[15154]: Failed password for jgarcia from 198.51.100.47 port 49380 ssh2',
                                        'Mar 14 03:04:50 WEB-DMZ-01 sshd[15157]: Failed password for jgarcia from 198.51.100.47 port 49387 ssh2',
                                        'Mar 14 03:04:57 WEB-DMZ-01 sshd[15160]: Failed password for jgarcia from 198.51.100.47 port 49394 ssh2',
                                        // Normal background continues during brute-force (noise)
                                        'Mar 14 03:05:01 WEB-DMZ-01 CRON[15200]: pam_unix(cron:session): session opened for user root by (uid=0)',
                                        'Mar 14 03:05:01 WEB-DMZ-01 CRON[15200]: pam_unix(cron:session): session closed for user root',
                                        // More brute-force
                                        'Mar 14 03:05:11 WEB-DMZ-01 sshd[15163]: Failed password for jgarcia from 198.51.100.47 port 49401 ssh2',
                                        'Mar 14 03:05:18 WEB-DMZ-01 sshd[15166]: Failed password for jgarcia from 198.51.100.47 port 49408 ssh2',
                                        // *** THE SUCCESSFUL LOGIN -- FLAG VALUE EMBEDDED HERE ***
                                        'Mar 14 03:17:04 WEB-DMZ-01 sshd[15200]: Accepted password for jgarcia from 198.51.100.47 port 49500 ssh2',
                                        'Mar 14 03:17:04 WEB-DMZ-01 sshd[15200]: pam_unix(sshd:session): session opened for user jgarcia by (uid=0)',
                                        'Mar 14 03:17:05 WEB-DMZ-01 sshd[15200]: Starting session: shell on pts/1 for jgarcia from 198.51.100.47 port 49500 id 0',
                                        // Post-compromise: jgarcia activity
                                        'Mar 14 03:17:12 WEB-DMZ-01 sudo: jgarcia : TTY=pts/1 ; PWD=/home/jgarcia ; USER=www-data ; COMMAND=/bin/bash',
                                        'Mar 14 03:17:30 WEB-DMZ-01 sudo: pam_unix(sudo:session): session opened for user www-data by jgarcia(uid=1003)',
                                        // Lateral movement: SSH from WEB-DMZ-01 (10.10.10.20) to APP-INT-05
                                        // APP-INT-05's sshd accepts the inbound connection from WEB-DMZ-01's IP
                                        'Mar 14 03:18:42 APP-INT-05 sshd[15280]: Accepted password for jgarcia from 10.10.10.20 port 41892 ssh2',
                                        'Mar 14 03:18:42 APP-INT-05 sshd[2841]: pam_unix(sshd:session): session opened for user jgarcia by (uid=0)',
                                        'Mar 14 03:18:43 APP-INT-05 sshd[2841]: Starting session: shell on pts/0 for jgarcia from 10.10.10.20 port 41892 id 0',
                                        // Background noise after incident
                                        'Mar 14 03:30:01 WEB-DMZ-01 CRON[15490]: pam_unix(cron:session): session opened for user root by (uid=0)',
                                        'Mar 14 03:30:01 WEB-DMZ-01 CRON[15490]: pam_unix(cron:session): session closed for user root',
                                        'Mar 14 03:45:11 WEB-DMZ-01 sshd[15600]: Accepted publickey for deploy from 10.10.1.5 port 52701 ssh2: RSA SHA256:xK7mN2pQrY'
                                    ].join('\n')
                                },

                                // ── APACHE2 DIRECTORY ────────────────────────────────
                                'apache2': {
                                    type: 'dir',
                                    children: {

                                        // ── APACHE ACCESS LOG ────────────────────────────
                                        // Contains:
                                        //   - Normal background traffic (Mozilla/Chrome UAs, 200s/304s)
                                        //   - Nikto/scanner UA doing recon (GET /robots.txt, dirs, etc.)
                                        //   - Web shell upload: POST /upload.php (status 200)
                                        //   - Web shell execution: GET /uploads/shell.php?cmd=... (status 200)
                                        //   - Shell reading /etc/passwd, /proc/version, lateral pivot commands
                                        //
                                        // FLAG DISCOVERY:
                                        //   webshell_path  -> grep "shell.php" /var/log/apache2/access.log
                                        //   lateral_target -> grep "APP-INT-05\|10.10.20" /var/log/apache2/access.log
                                        //                     (cmd=ssh+jgarcia@10.10.20.15 in the shell request)
                                        'access.log': {
                                            type: 'file',
                                            content: [
                                                // Normal background traffic
                                                '10.10.1.100 - - [14/Mar/2026:02:30:14 +0000] "GET / HTTP/1.1" 200 4312 "-" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"',
                                                '10.10.1.101 - - [14/Mar/2026:02:30:45 +0000] "GET /assets/css/main.css HTTP/1.1" 304 0 "http://10.10.10.20/" "Mozilla/5.0"',
                                                '10.10.1.100 - - [14/Mar/2026:02:31:02 +0000] "GET /dashboard HTTP/1.1" 302 0 "-" "Mozilla/5.0"',
                                                '10.10.1.102 - - [14/Mar/2026:02:35:17 +0000] "GET /login HTTP/1.1" 200 3841 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"',
                                                '10.10.1.102 - - [14/Mar/2026:02:35:44 +0000] "POST /login HTTP/1.1" 302 0 "http://10.10.10.20/login" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"',
                                                '10.10.1.103 - - [14/Mar/2026:02:40:08 +0000] "GET /api/health HTTP/1.1" 200 47 "-" "python-requests/2.28.1"',
                                                '10.10.1.100 - - [14/Mar/2026:02:42:31 +0000] "GET /reports HTTP/1.1" 200 12540 "-" "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"',
                                                // Nikto/scanner recon from attacker IP
                                                '198.51.100.47 - - [14/Mar/2026:02:58:01 +0000] "GET / HTTP/1.1" 200 4312 "-" "Mozilla/5.0 (compatible; Nikto/2.1.6; +http://www.cirt.net/nikto2)"',
                                                '198.51.100.47 - - [14/Mar/2026:02:58:02 +0000] "GET /robots.txt HTTP/1.1" 404 196 "-" "Mozilla/5.0 (compatible; Nikto/2.1.6; +http://www.cirt.net/nikto2)"',
                                                '198.51.100.47 - - [14/Mar/2026:02:58:03 +0000] "GET /.git/config HTTP/1.1" 403 199 "-" "Mozilla/5.0 (compatible; Nikto/2.1.6; +http://www.cirt.net/nikto2)"',
                                                '198.51.100.47 - - [14/Mar/2026:02:58:04 +0000] "GET /phpinfo.php HTTP/1.1" 404 196 "-" "Mozilla/5.0 (compatible; Nikto/2.1.6; +http://www.cirt.net/nikto2)"',
                                                '198.51.100.47 - - [14/Mar/2026:02:58:05 +0000] "GET /admin/ HTTP/1.1" 403 199 "-" "Mozilla/5.0 (compatible; Nikto/2.1.6; +http://www.cirt.net/nikto2)"',
                                                '198.51.100.47 - - [14/Mar/2026:02:58:06 +0000] "GET /upload.php HTTP/1.1" 200 1843 "-" "Mozilla/5.0 (compatible; Nikto/2.1.6; +http://www.cirt.net/nikto2)"',
                                                '198.51.100.47 - - [14/Mar/2026:02:58:07 +0000] "GET /wp-login.php HTTP/1.1" 404 196 "-" "Mozilla/5.0 (compatible; Nikto/2.1.6; +http://www.cirt.net/nikto2)"',
                                                '198.51.100.47 - - [14/Mar/2026:02:58:08 +0000] "GET /backup.zip HTTP/1.1" 404 196 "-" "Mozilla/5.0 (compatible; Nikto/2.1.6; +http://www.cirt.net/nikto2)"',
                                                '198.51.100.47 - - [14/Mar/2026:02:58:09 +0000] "GET /uploads/ HTTP/1.1" 200 892 "-" "Mozilla/5.0 (compatible; Nikto/2.1.6; +http://www.cirt.net/nikto2)"',
                                                // Normal traffic continues
                                                '10.10.1.104 - - [14/Mar/2026:03:00:00 +0000] "GET /api/health HTTP/1.1" 200 47 "-" "python-requests/2.28.1"',
                                                '10.10.1.100 - - [14/Mar/2026:03:01:11 +0000] "GET /reports HTTP/1.1" 200 12540 "-" "Mozilla/5.0"',
                                                // Web shell uploaded via upload form (post-SSH-login jgarcia pivoted to www-data)
                                                '198.51.100.47 - - [14/Mar/2026:03:17:18 +0000] "POST /upload.php HTTP/1.1" 200 247 "http://10.10.10.20/upload.php" "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36"',
                                                // Web shell first executed -- command: id
                                                '198.51.100.47 - - [14/Mar/2026:03:17:22 +0000] "GET /uploads/shell.php?cmd=id HTTP/1.1" 200 38 "-" "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36"',
                                                // Web shell: reads system info
                                                '198.51.100.47 - - [14/Mar/2026:03:17:25 +0000] "GET /uploads/shell.php?cmd=cat+/etc/passwd HTTP/1.1" 200 1842 "-" "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36"',
                                                '198.51.100.47 - - [14/Mar/2026:03:17:29 +0000] "GET /uploads/shell.php?cmd=cat+/proc/version HTTP/1.1" 200 141 "-" "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36"',
                                                '198.51.100.47 - - [14/Mar/2026:03:17:34 +0000] "GET /uploads/shell.php?cmd=uname+-a HTTP/1.1" 200 98 "-" "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36"',
                                                '198.51.100.47 - - [14/Mar/2026:03:17:38 +0000] "GET /uploads/shell.php?cmd=ifconfig HTTP/1.1" 200 512 "-" "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36"',
                                                '198.51.100.47 - - [14/Mar/2026:03:17:44 +0000] "GET /uploads/shell.php?cmd=ip+route HTTP/1.1" 200 289 "-" "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36"',
                                                // Web shell: reads /etc/hosts -- reveals internal hosts
                                                '198.51.100.47 - - [14/Mar/2026:03:17:50 +0000] "GET /uploads/shell.php?cmd=cat+/etc/hosts HTTP/1.1" 200 218 "-" "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36"',
                                                // Web shell: pivot -- connects to APP-INT-05 (10.10.20.15)
                                                '198.51.100.47 - - [14/Mar/2026:03:18:39 +0000] "GET /uploads/shell.php?cmd=ssh+jgarcia@10.10.20.15 HTTP/1.1" 200 64 "-" "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36"',
                                                // Normal background continues
                                                '10.10.1.100 - - [14/Mar/2026:03:20:08 +0000] "GET / HTTP/1.1" 200 4312 "-" "Mozilla/5.0"',
                                                '10.10.1.101 - - [14/Mar/2026:03:22:44 +0000] "GET /assets/js/app.js HTTP/1.1" 304 0 "http://10.10.10.20/" "Mozilla/5.0"',
                                                '10.10.1.105 - - [14/Mar/2026:03:25:01 +0000] "GET /api/status HTTP/1.1" 200 83 "-" "python-requests/2.28.1"',
                                                '10.10.1.100 - - [14/Mar/2026:03:30:15 +0000] "GET /dashboard HTTP/1.1" 302 0 "-" "Mozilla/5.0"',
                                                '10.10.1.102 - - [14/Mar/2026:03:35:22 +0000] "GET /login HTTP/1.1" 200 3841 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"'
                                            ].join('\n')
                                        },

                                        // Error log (readable but flags are not here -- good noise)
                                        'error.log': {
                                            type: 'file',
                                            content: [
                                                '[Fri Mar 14 02:30:00.000124 2026] [mpm_event:notice] [pid 1:tid 140] AH00489: Apache/2.4.57 (Ubuntu) configured -- resuming normal operations',
                                                '[Fri Mar 14 02:30:00.000201 2026] [core:notice] [pid 1:tid 140] AH00094: Command line: \'/usr/sbin/apache2\'',
                                                '[Fri Mar 14 02:58:06.113420 2026] [php:notice] [pid 884:tid 140] [client 198.51.100.47:49100] PHP Notice: upload.php: file type check passed',
                                                '[Fri Mar 14 03:17:18.441203 2026] [php:notice] [pid 891:tid 140] [client 198.51.100.47:49500] PHP Notice: upload.php: file stored as /var/www/html/uploads/shell.php',
                                                '[Fri Mar 14 03:17:22.881044 2026] [php:warn] [pid 892:tid 140] [client 198.51.100.47:49500] PHP Warning: shell_exec(): system() called from outside script -- unexpected execution context'
                                            ].join('\n')
                                        }
                                    }
                                },

                                // ── FIREWALL LOG ─────────────────────────────────────
                                // Contains:
                                //   - Normal background: ALLOW lines for 80/443, internal traffic
                                //   - The SSH brute-force: ALLOW IN from 198.51.100.47 port 22 (rapid lines)
                                //   - The successful SSH IN: ALLOW IN 198.51.100.47 -> 10.10.10.20 DPT=22
                                //   - Lateral SSH: ALLOW IN 10.10.10.20 -> 10.10.20.15 DPT=22
                                //   - THE EXFIL: ALLOW OUT 10.10.10.20 -> 198.51.100.47 DPT=4444 BYTES=1048576
                                //
                                // FLAG DISCOVERY:
                                //   lateral_target -> grep "4444\|10.10.20.15\|APP-INT" /var/log/firewall.log
                                //   exfil_bytes    -> grep "BYTES=" /var/log/firewall.log  (look for 1048576)
                                'firewall.log': {
                                    type: 'file',
                                    content: [
                                        // Normal background web traffic
                                        'Mar 14 02:30:02 WEB-DMZ-01 kernel: IPTABLES ALLOW IN: IN=eth0 OUT= MAC=00:0c:29:a1:b2:c3:00:50:56:c0:00:08:08:00 SRC=10.10.1.100 DST=10.10.10.20 LEN=60 TOS=0x00 PREC=0x00 TTL=63 ID=12345 DF PROTO=TCP SPT=54201 DPT=80 WINDOW=29200 RES=0x00 SYN URGP=0',
                                        'Mar 14 02:30:15 WEB-DMZ-01 kernel: IPTABLES ALLOW IN: IN=eth0 OUT= SRC=10.10.1.101 DST=10.10.10.20 LEN=52 PROTO=TCP SPT=54302 DPT=80 WINDOW=502 RES=0x00 ACK URGP=0',
                                        'Mar 14 02:31:14 WEB-DMZ-01 kernel: IPTABLES ALLOW IN: IN=eth0 OUT= SRC=10.10.1.5 DST=10.10.10.20 LEN=60 PROTO=TCP SPT=52201 DPT=22 WINDOW=29200 RES=0x00 SYN URGP=0',
                                        'Mar 14 02:35:17 WEB-DMZ-01 kernel: IPTABLES ALLOW IN: IN=eth0 OUT= SRC=10.10.1.102 DST=10.10.10.20 LEN=52 PROTO=TCP SPT=58021 DPT=80 WINDOW=29200 RES=0x00 SYN URGP=0',
                                        'Mar 14 02:40:22 WEB-DMZ-01 kernel: IPTABLES ALLOW IN: IN=eth0 OUT= SRC=10.10.1.5 DST=10.10.10.20 LEN=60 PROTO=TCP SPT=52388 DPT=22 WINDOW=29200 RES=0x00 SYN URGP=0',
                                        // Brute-force SSH attempts (rapid, same source)
                                        'Mar 14 03:02:11 WEB-DMZ-01 kernel: IPTABLES ALLOW IN: IN=eth0 OUT= SRC=198.51.100.47 DST=10.10.10.20 LEN=60 PROTO=TCP SPT=49200 DPT=22 WINDOW=65535 RES=0x00 SYN URGP=0',
                                        'Mar 14 03:02:18 WEB-DMZ-01 kernel: IPTABLES ALLOW IN: IN=eth0 OUT= SRC=198.51.100.47 DST=10.10.10.20 LEN=60 PROTO=TCP SPT=49204 DPT=22 WINDOW=65535 RES=0x00 SYN URGP=0',
                                        'Mar 14 03:02:24 WEB-DMZ-01 kernel: IPTABLES ALLOW IN: IN=eth0 OUT= SRC=198.51.100.47 DST=10.10.10.20 LEN=60 PROTO=TCP SPT=49208 DPT=22 WINDOW=65535 RES=0x00 SYN URGP=0',
                                        'Mar 14 03:02:31 WEB-DMZ-01 kernel: IPTABLES ALLOW IN: IN=eth0 OUT= SRC=198.51.100.47 DST=10.10.10.20 LEN=60 PROTO=TCP SPT=49214 DPT=22 WINDOW=65535 RES=0x00 SYN URGP=0',
                                        'Mar 14 03:03:15 WEB-DMZ-01 kernel: IPTABLES ALLOW IN: IN=eth0 OUT= SRC=198.51.100.47 DST=10.10.10.20 LEN=60 PROTO=TCP SPT=49301 DPT=22 WINDOW=65535 RES=0x00 SYN URGP=0',
                                        'Mar 14 03:03:22 WEB-DMZ-01 kernel: IPTABLES ALLOW IN: IN=eth0 OUT= SRC=198.51.100.47 DST=10.10.10.20 LEN=60 PROTO=TCP SPT=49307 DPT=22 WINDOW=65535 RES=0x00 SYN URGP=0',
                                        'Mar 14 03:03:29 WEB-DMZ-01 kernel: IPTABLES ALLOW IN: IN=eth0 OUT= SRC=198.51.100.47 DST=10.10.10.20 LEN=60 PROTO=TCP SPT=49314 DPT=22 WINDOW=65535 RES=0x00 SYN URGP=0',
                                        'Mar 14 03:03:36 WEB-DMZ-01 kernel: IPTABLES ALLOW IN: IN=eth0 OUT= SRC=198.51.100.47 DST=10.10.10.20 LEN=60 PROTO=TCP SPT=49320 DPT=22 WINDOW=65535 RES=0x00 SYN URGP=0',
                                        'Mar 14 03:03:43 WEB-DMZ-01 kernel: IPTABLES ALLOW IN: IN=eth0 OUT= SRC=198.51.100.47 DST=10.10.10.20 LEN=60 PROTO=TCP SPT=49326 DPT=22 WINDOW=65535 RES=0x00 SYN URGP=0',
                                        'Mar 14 03:03:50 WEB-DMZ-01 kernel: IPTABLES ALLOW IN: IN=eth0 OUT= SRC=198.51.100.47 DST=10.10.10.20 LEN=60 PROTO=TCP SPT=49333 DPT=22 WINDOW=65535 RES=0x00 SYN URGP=0',
                                        'Mar 14 03:04:01 WEB-DMZ-01 kernel: IPTABLES ALLOW IN: IN=eth0 OUT= SRC=198.51.100.47 DST=10.10.10.20 LEN=60 PROTO=TCP SPT=49340 DPT=22 WINDOW=65535 RES=0x00 SYN URGP=0',
                                        'Mar 14 03:04:08 WEB-DMZ-01 kernel: IPTABLES ALLOW IN: IN=eth0 OUT= SRC=198.51.100.47 DST=10.10.10.20 LEN=60 PROTO=TCP SPT=49347 DPT=22 WINDOW=65535 RES=0x00 SYN URGP=0',
                                        'Mar 14 03:04:15 WEB-DMZ-01 kernel: IPTABLES ALLOW IN: IN=eth0 OUT= SRC=198.51.100.47 DST=10.10.10.20 LEN=60 PROTO=TCP SPT=49353 DPT=22 WINDOW=65535 RES=0x00 SYN URGP=0',
                                        'Mar 14 03:04:22 WEB-DMZ-01 kernel: IPTABLES ALLOW IN: IN=eth0 OUT= SRC=198.51.100.47 DST=10.10.10.20 LEN=60 PROTO=TCP SPT=49360 DPT=22 WINDOW=65535 RES=0x00 SYN URGP=0',
                                        'Mar 14 03:04:29 WEB-DMZ-01 kernel: IPTABLES ALLOW IN: IN=eth0 OUT= SRC=198.51.100.47 DST=10.10.10.20 LEN=60 PROTO=TCP SPT=49367 DPT=22 WINDOW=65535 RES=0x00 SYN URGP=0',
                                        'Mar 14 03:04:36 WEB-DMZ-01 kernel: IPTABLES ALLOW IN: IN=eth0 OUT= SRC=198.51.100.47 DST=10.10.10.20 LEN=60 PROTO=TCP SPT=49373 DPT=22 WINDOW=65535 RES=0x00 SYN URGP=0',
                                        'Mar 14 03:04:43 WEB-DMZ-01 kernel: IPTABLES ALLOW IN: IN=eth0 OUT= SRC=198.51.100.47 DST=10.10.10.20 LEN=60 PROTO=TCP SPT=49380 DPT=22 WINDOW=65535 RES=0x00 SYN URGP=0',
                                        'Mar 14 03:04:50 WEB-DMZ-01 kernel: IPTABLES ALLOW IN: IN=eth0 OUT= SRC=198.51.100.47 DST=10.10.10.20 LEN=60 PROTO=TCP SPT=49387 DPT=22 WINDOW=65535 RES=0x00 SYN URGP=0',
                                        'Mar 14 03:04:57 WEB-DMZ-01 kernel: IPTABLES ALLOW IN: IN=eth0 OUT= SRC=198.51.100.47 DST=10.10.10.20 LEN=60 PROTO=TCP SPT=49394 DPT=22 WINDOW=65535 RES=0x00 SYN URGP=0',
                                        'Mar 14 03:05:11 WEB-DMZ-01 kernel: IPTABLES ALLOW IN: IN=eth0 OUT= SRC=198.51.100.47 DST=10.10.10.20 LEN=60 PROTO=TCP SPT=49401 DPT=22 WINDOW=65535 RES=0x00 SYN URGP=0',
                                        'Mar 14 03:05:18 WEB-DMZ-01 kernel: IPTABLES ALLOW IN: IN=eth0 OUT= SRC=198.51.100.47 DST=10.10.10.20 LEN=60 PROTO=TCP SPT=49408 DPT=22 WINDOW=65535 RES=0x00 SYN URGP=0',
                                        // Successful SSH login session established
                                        'Mar 14 03:17:04 WEB-DMZ-01 kernel: IPTABLES ALLOW IN: IN=eth0 OUT= SRC=198.51.100.47 DST=10.10.10.20 LEN=60 PROTO=TCP SPT=49500 DPT=22 WINDOW=65535 RES=0x00 SYN URGP=0 STATE=NEW',
                                        // Web shell POST
                                        'Mar 14 03:17:18 WEB-DMZ-01 kernel: IPTABLES ALLOW IN: IN=eth0 OUT= SRC=198.51.100.47 DST=10.10.10.20 LEN=1500 PROTO=TCP SPT=49500 DPT=80 WINDOW=502 RES=0x00 ACK PSH URGP=0',
                                        // Lateral SSH: WEB-DMZ-01 -> APP-INT-05 (internal)
                                        'Mar 14 03:18:42 WEB-DMZ-01 kernel: IPTABLES ALLOW FORWARD: IN=eth0 OUT=eth1 SRC=10.10.10.20 DST=10.10.20.15 LEN=60 PROTO=TCP SPT=41892 DPT=22 WINDOW=29200 RES=0x00 SYN URGP=0',
                                        'Mar 14 03:18:42 WEB-DMZ-01 kernel: IPTABLES ALLOW FORWARD: IN=eth0 OUT=eth1 SRC=10.10.20.15 DST=10.10.10.20 LEN=60 PROTO=TCP SPT=22 DPT=41892 WINDOW=65535 RES=0x00 SYN ACK URGP=0',
                                        // Normal HTTPS outbound (background noise around the exfil time)
                                        'Mar 14 03:18:55 WEB-DMZ-01 kernel: IPTABLES ALLOW OUT: IN= OUT=eth0 SRC=10.10.10.20 DST=185.125.190.58 LEN=52 PROTO=TCP SPT=44012 DPT=443 WINDOW=502 RES=0x00 ACK URGP=0 BYTES=2840',
                                        // *** THE EXFIL LINE -- FLAG VALUE EMBEDDED HERE ***
                                        // BYTES=1048576 is the full flow total (1 MB)
                                        // LEN=1500 is per-packet (realistic MTU)
                                        'Mar 14 03:19:22 WEB-DMZ-01 kernel: IPTABLES ALLOW OUT: IN= OUT=eth0 SRC=10.10.10.20 DST=198.51.100.47 LEN=1500 TOS=0x00 PREC=0x00 TTL=64 ID=24801 DF PROTO=TCP SPT=41021 DPT=4444 WINDOW=502 RES=0x00 ACK PSH URGP=0 BYTES=1048576',
                                        // Background continues
                                        'Mar 14 03:20:08 WEB-DMZ-01 kernel: IPTABLES ALLOW IN: IN=eth0 OUT= SRC=10.10.1.100 DST=10.10.10.20 LEN=52 PROTO=TCP SPT=54810 DPT=80 WINDOW=29200 RES=0x00 SYN URGP=0',
                                        'Mar 14 03:25:01 WEB-DMZ-01 kernel: IPTABLES ALLOW IN: IN=eth0 OUT= SRC=10.10.1.105 DST=10.10.10.20 LEN=52 PROTO=TCP SPT=55100 DPT=80 WINDOW=29200 RES=0x00 SYN URGP=0',
                                        'Mar 14 03:30:02 WEB-DMZ-01 kernel: IPTABLES ALLOW IN: IN=eth0 OUT= SRC=10.10.1.100 DST=10.10.10.20 LEN=60 PROTO=TCP SPT=55204 DPT=80 WINDOW=29200 RES=0x00 SYN URGP=0',
                                        'Mar 14 03:45:11 WEB-DMZ-01 kernel: IPTABLES ALLOW IN: IN=eth0 OUT= SRC=10.10.1.5 DST=10.10.10.20 LEN=60 PROTO=TCP SPT=52701 DPT=22 WINDOW=29200 RES=0x00 SYN URGP=0'
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
                        'hostname': { type: 'file', content: 'soc-ws-01' },
                        'hosts':    { type: 'file', content: '127.0.0.1 localhost\n10.10.10.20 WEB-DMZ-01\n10.10.20.15 APP-INT-05\n10.10.1.5   deploy-jump' }
                    }
                },
                'tmp': { type: 'dir', children: {} }

            } // end /root children
        }
    },

    // =========================================================
    // TERMINAL COMMANDS (custom additions)
    //
    // grep is PIPE-only in Terminal.js built-ins.
    // We add it as a standalone file-search command here so
    // `grep PATTERN /path/file` works directly, which is the
    // natural investigation pattern students will use.
    // =========================================================

    commands: {

        // ── grep: file-based AND pipe-aware ────────────────────
        // Handles: grep PATTERN FILE          (direct file search)
        //          cat FILE | grep PATTERN    (piped stdin via term._pipedStdin)
        //          grep -i PATTERN FILE       (case-insensitive)
        //          grep -v PATTERN FILE       (invert match)
        //          grep -c PATTERN FILE       (count matches)
        //          grep -n PATTERN FILE       (show line numbers)
        //
        // Terminal.js sets term._pipedStdin = <previous stdout> before
        // calling any custom command handler in a pipeline segment.
        // When a file arg is absent but _pipedStdin is non-empty, filter
        // those lines by the pattern instead of erroring.
        'grep': function(args, term, engine) {
            if (!args.length) {
                return 'Usage: grep [OPTIONS] PATTERN FILE\n  -i  case-insensitive\n  -v  invert match (lines NOT matching)\n  -c  count matching lines\n  -n  show line numbers\n  -A N  print N lines after each match\n  -B N  print N lines before each match\n  -C N  print N lines before and after each match\n\nExample: grep "Failed password" /var/log/auth.log\nExample: grep -A 2 "Accepted password" /var/log/auth.log\nExample: cat /var/log/firewall.log | grep "BYTES="';
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

            // Determine the content to search: piped stdin OR a named file.
            // Terminal.js populates term._pipedStdin when this command runs
            // as a pipeline segment (e.g. cat file | grep pattern).
            var content;
            if (filePath) {
                // Named file argument: resolve it in the virtual filesystem
                var node = term._getNode(filePath);
                if (!node) return 'grep: ' + filePath + ': No such file or directory';
                if (node.type === 'dir') return 'grep: ' + filePath + ': Is a directory';
                content = node.content || '';
            } else if (term._pipedStdin) {
                // No file arg, but piped input is available -- filter stdin
                content = term._pipedStdin;
            } else {
                // Neither a file arg nor piped input: real grep error
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
        // Lets students count lines: wc -l /var/log/auth.log
        'wc': function(args, term) {
            const lineMode  = args.includes('-l');
            const wordMode  = args.includes('-w');
            const filePaths = args.filter(function(a) { return !a.startsWith('-'); });

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

            const results = [];
            filePaths.forEach(function(fp) {
                const node = term._getNode(fp);
                if (!node) { results.push('wc: ' + fp + ': No such file or directory'); return; }
                if (node.type === 'dir') { results.push('wc: ' + fp + ': Is a directory'); return; }
                const content = node.content || '';
                const lineCount = content.split('\n').length;
                const wordCount = content.split(/\s+/).filter(Boolean).length;
                if (lineMode) results.push('  ' + lineCount + ' ' + fp);
                else if (wordMode) results.push('  ' + wordCount + ' ' + fp);
                else results.push('  ' + lineCount + '  ' + wordCount + '  ' + content.length + ' ' + fp);
            });
            return results.join('\n');
        },

        // ── help override (supplements built-in with case context) ──
        'help': function(args, term) {
            return [
                'INTRUSION HUNT -- COMMAND REFERENCE',
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
                '  /var/log/auth.log              SSH / PAM events',
                '  /var/log/apache2/access.log    Apache web requests',
                '  /var/log/firewall.log          Perimeter flow log',
                '  /home/analyst/case.txt         Case file and commands',
                '',
                'Investigation starting points:',
                '  grep "Failed password" /var/log/auth.log',
                '  grep "Accepted password" /var/log/auth.log',
                '  grep "shell.php" /var/log/apache2/access.log',
                '  grep "4444" /var/log/firewall.log',
                '  grep "BYTES=" /var/log/firewall.log'
            ].join('\n');
        }

    },

    // =========================================================
    // LOG VIEWER DATA (BlueTeam.js LogViewer device)
    //
    // Presents the most forensically relevant log events with
    // severity classification and the suspicious:true marker
    // so they render highlighted in the LogViewer panel.
    // The student can search by IP, keyword, or severity.
    // =========================================================

    logViewer: {
        entries: [
            // ── Normal background (info) ──────────────────────────
            { timestamp: '2026-03-14 02:30:01', severity: 'info',    source: 'cron',           message: 'pam_unix(cron:session): session opened for user root by (uid=0)' },
            { timestamp: '2026-03-14 02:31:14', severity: 'info',    source: 'sshd',           message: 'Accepted publickey for deploy from 10.10.1.5 port 52201 ssh2: RSA SHA256:xK7mN2pQrY' },
            { timestamp: '2026-03-14 02:40:22', severity: 'info',    source: 'sshd',           message: 'Accepted publickey for deploy from 10.10.1.5 port 52388 ssh2: RSA SHA256:xK7mN2pQrY' },
            // ── Recon / scanner ──────────────────────────────────
            { timestamp: '2026-03-14 02:58:01', severity: 'warning', source: 'apache/access',  message: '198.51.100.47 - - "GET / HTTP/1.1" 200 4312 "-" "Nikto/2.1.6"', suspicious: true },
            { timestamp: '2026-03-14 02:58:06', severity: 'warning', source: 'apache/access',  message: '198.51.100.47 - - "GET /upload.php HTTP/1.1" 200 1843 "-" "Nikto/2.1.6"', suspicious: true },
            { timestamp: '2026-03-14 02:58:09', severity: 'warning', source: 'apache/access',  message: '198.51.100.47 - - "GET /uploads/ HTTP/1.1" 200 892 "-" "Nikto/2.1.6"', suspicious: true },
            // ── SSH brute-force (invalid users) ──────────────────
            { timestamp: '2026-03-14 03:02:11', severity: 'warning', source: 'sshd',           message: 'Invalid user admin from 198.51.100.47 port 49200', suspicious: true },
            { timestamp: '2026-03-14 03:02:11', severity: 'warning', source: 'sshd',           message: 'Failed password for invalid user admin from 198.51.100.47 port 49200 ssh2', suspicious: true },
            { timestamp: '2026-03-14 03:02:18', severity: 'warning', source: 'sshd',           message: 'Failed password for invalid user test from 198.51.100.47 port 49204 ssh2', suspicious: true },
            // ── SSH brute-force (jgarcia) ────────────────────────
            { timestamp: '2026-03-14 03:03:15', severity: 'err',     source: 'sshd',           message: 'Failed password for jgarcia from 198.51.100.47 port 49301 ssh2', suspicious: true },
            { timestamp: '2026-03-14 03:03:22', severity: 'err',     source: 'sshd',           message: 'Failed password for jgarcia from 198.51.100.47 port 49307 ssh2', suspicious: true },
            { timestamp: '2026-03-14 03:03:29', severity: 'err',     source: 'sshd',           message: 'Failed password for jgarcia from 198.51.100.47 port 49314 ssh2', suspicious: true },
            { timestamp: '2026-03-14 03:03:36', severity: 'err',     source: 'sshd',           message: 'Failed password for jgarcia from 198.51.100.47 port 49320 ssh2', suspicious: true },
            { timestamp: '2026-03-14 03:03:43', severity: 'err',     source: 'sshd',           message: 'Failed password for jgarcia from 198.51.100.47 port 49326 ssh2', suspicious: true },
            { timestamp: '2026-03-14 03:03:50', severity: 'err',     source: 'sshd',           message: 'Failed password for jgarcia from 198.51.100.47 port 49333 ssh2', suspicious: true },
            { timestamp: '2026-03-14 03:04:01', severity: 'err',     source: 'sshd',           message: 'Failed password for jgarcia from 198.51.100.47 port 49340 ssh2', suspicious: true },
            { timestamp: '2026-03-14 03:04:08', severity: 'err',     source: 'sshd',           message: 'Failed password for jgarcia from 198.51.100.47 port 49347 ssh2', suspicious: true },
            { timestamp: '2026-03-14 03:04:15', severity: 'err',     source: 'sshd',           message: 'Failed password for jgarcia from 198.51.100.47 port 49353 ssh2', suspicious: true },
            { timestamp: '2026-03-14 03:04:22', severity: 'err',     source: 'sshd',           message: 'Failed password for jgarcia from 198.51.100.47 port 49360 ssh2', suspicious: true },
            { timestamp: '2026-03-14 03:04:29', severity: 'err',     source: 'sshd',           message: 'Failed password for jgarcia from 198.51.100.47 port 49367 ssh2', suspicious: true },
            { timestamp: '2026-03-14 03:04:36', severity: 'err',     source: 'sshd',           message: 'Failed password for jgarcia from 198.51.100.47 port 49373 ssh2', suspicious: true },
            { timestamp: '2026-03-14 03:04:43', severity: 'err',     source: 'sshd',           message: 'Failed password for jgarcia from 198.51.100.47 port 49380 ssh2', suspicious: true },
            { timestamp: '2026-03-14 03:04:50', severity: 'err',     source: 'sshd',           message: 'Failed password for jgarcia from 198.51.100.47 port 49387 ssh2', suspicious: true },
            { timestamp: '2026-03-14 03:04:57', severity: 'err',     source: 'sshd',           message: 'Failed password for jgarcia from 198.51.100.47 port 49394 ssh2', suspicious: true },
            { timestamp: '2026-03-14 03:05:11', severity: 'err',     source: 'sshd',           message: 'Failed password for jgarcia from 198.51.100.47 port 49401 ssh2', suspicious: true },
            { timestamp: '2026-03-14 03:05:18', severity: 'err',     source: 'sshd',           message: 'Failed password for jgarcia from 198.51.100.47 port 49408 ssh2', suspicious: true },
            // ── Successful SSH ────────────────────────────────────
            { timestamp: '2026-03-14 03:17:04', severity: 'crit',    source: 'sshd',           message: 'Accepted password for jgarcia from 198.51.100.47 port 49500 ssh2', suspicious: true },
            { timestamp: '2026-03-14 03:17:12', severity: 'crit',    source: 'sudo',           message: 'jgarcia : TTY=pts/1 ; PWD=/home/jgarcia ; USER=www-data ; COMMAND=/bin/bash', suspicious: true },
            // ── Web shell deployed and executed ───────────────────
            { timestamp: '2026-03-14 03:17:18', severity: 'crit',    source: 'apache/access',  message: '198.51.100.47 - - "POST /upload.php HTTP/1.1" 200 247', suspicious: true },
            { timestamp: '2026-03-14 03:17:22', severity: 'crit',    source: 'apache/access',  message: '198.51.100.47 - - "GET /uploads/shell.php?cmd=id HTTP/1.1" 200 38', suspicious: true },
            { timestamp: '2026-03-14 03:17:25', severity: 'crit',    source: 'apache/access',  message: '198.51.100.47 - - "GET /uploads/shell.php?cmd=cat+/etc/passwd HTTP/1.1" 200 1842', suspicious: true },
            { timestamp: '2026-03-14 03:17:50', severity: 'crit',    source: 'apache/access',  message: '198.51.100.47 - - "GET /uploads/shell.php?cmd=cat+/etc/hosts HTTP/1.1" 200 218', suspicious: true },
            // ── Lateral movement ──────────────────────────────────
            { timestamp: '2026-03-14 03:18:39', severity: 'crit',    source: 'apache/access',  message: '198.51.100.47 - - "GET /uploads/shell.php?cmd=ssh+jgarcia@10.10.20.15 HTTP/1.1" 200 64', suspicious: true },
            { timestamp: '2026-03-14 03:18:42', severity: 'crit',    source: 'sshd',           message: 'APP-INT-05 sshd: Accepted password for jgarcia from 10.10.10.20 port 41892 ssh2', suspicious: true },
            { timestamp: '2026-03-14 03:18:42', severity: 'crit',    source: 'firewall',       message: 'IPTABLES ALLOW FORWARD: SRC=10.10.10.20 DST=10.10.20.15 DPT=22 (lateral SSH)', suspicious: true },
            // ── Exfiltration ──────────────────────────────────────
            { timestamp: '2026-03-14 03:19:22', severity: 'crit',    source: 'firewall',       message: 'IPTABLES ALLOW OUT: SRC=10.10.10.20 DST=198.51.100.47 DPT=4444 BYTES=1048576', suspicious: true }
        ]
    },

    // =========================================================
    // FLAGS
    //
    // All five flags are find-and-submit: the student discovers
    // the exact value from the logs and types it into the Submit
    // Flag panel. BoxEngine validates against Firestore
    // flag_registry/{boxId}/flags/{flagId}.
    //
    // FIRESTORE SEEDING (flag_registry/shield-sp-blueteam-log-intrusion-hunt):
    //   attacker_ip         -> 198.51.100.47
    //   compromised_account -> jgarcia
    //   webshell_path       -> /var/www/html/uploads/shell.php
    //   lateral_target      -> 10.10.20.15
    //   exfil_bytes         -> 1048576
    // =========================================================

    flags: [
        {
            id: 'attacker_ip',
            points: 100,
            label: 'Attacker External IP',
            description: 'The external IP address that conducted the SSH brute-force and subsequent activity.'
        },
        {
            id: 'compromised_account',
            points: 100,
            label: 'Compromised User Account',
            description: 'The local account that was brute-forced and used for initial access.'
        },
        {
            id: 'webshell_path',
            points: 150,
            label: 'Web Shell Path',
            description: 'The full on-disk server path where the web shell was stored, as recorded in the Apache error log. Note: the access log shows the URL path the attacker used (/uploads/shell.php); the error log records the actual filesystem path where PHP stored the file.'
        },
        {
            id: 'lateral_target',
            points: 150,
            label: 'Lateral Movement Target IP',
            description: 'The internal host the attacker pivoted to via SSH after gaining initial access.'
        },
        {
            id: 'exfil_bytes',
            points: 200,
            label: 'Exfiltration Byte Count',
            description: 'The exact BYTES field value in the firewall log for the outbound exfiltration flow on port 4444.'
        }
    ],

    // =========================================================
    // SCORING
    // =========================================================

    scoring: {
        base: 1000,
        minScore: 0,
        maxScore: 700,
        hintPenalty: true,
        wrongFlagPenalty: -25,
        speedBonus: { threshold: 1800000, points: 100 },
        timeBonusThreshold: 2400
    },

    // =========================================================
    // HINTS
    //
    // Progressive: first two hints give strategy, third gives the
    // exact command, last hint per flag reveals the {{FLAG:id}}
    // token (incurs the largest penalty -- confirms the answer).
    // =========================================================

    hints: [
        // ── attacker_ip ──────────────────────────────────────
        {
            id: 'hint_ip_1',
            flagId: 'attacker_ip',
            text: 'Start with the SSH log. Brute-force attacks generate many "Failed password" lines from the same source IP in rapid succession. Filter auth.log for that pattern to find the attacker.',
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint_ip_2',
            flagId: 'attacker_ip',
            text: 'Run: grep "Failed password" /var/log/auth.log | head -5\n\nEvery failing attempt includes the source IP. Look at the "from X.X.X.X" field -- the same external IP appears across all brute-force lines.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint_ip_3',
            flagId: 'attacker_ip',
            text: 'The attacker IP is in RFC 5737 documentation space (192.0.2.0/24, 198.51.100.0/24, 203.0.113.0/24). Run: grep "198.51.100" /var/log/auth.log\n\nThe value to submit: {{FLAG:attacker_ip}}',
            cost: 75,
            penalty: -75
        },

        // ── compromised_account ───────────────────────────────
        {
            id: 'hint_acct_1',
            flagId: 'compromised_account',
            text: 'The brute-force tries many accounts but only one eventually succeeds. Search auth.log for the line that shows a successful login -- "Accepted password" -- from the external attacker IP.',
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint_acct_2',
            flagId: 'compromised_account',
            text: 'Run: grep "Accepted password" /var/log/auth.log\n\nYou should see exactly one line where the source is the external attacker IP (not an internal 10.x address). The username appears between "for" and "from".',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint_acct_3',
            flagId: 'compromised_account',
            text: 'The compromised account is a short lowercase username. Submit only the username, not the full sshd line.\n\nThe value to submit: {{FLAG:compromised_account}}',
            cost: 75,
            penalty: -75
        },

        // ── webshell_path ─────────────────────────────────────
        {
            id: 'hint_shell_1',
            flagId: 'webshell_path',
            text: 'Apache keeps two separate logs: access.log records every HTTP request (what URL the attacker hit), and error.log records what the server did internally (where PHP actually stored the file). The flag is the on-disk filesystem path -- that distinction only appears in the error log.',
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint_shell_2',
            flagId: 'webshell_path',
            text: 'The access log shows the attacker hit the URL path /uploads/shell.php -- that is NOT the flag. The actual stored filesystem path is logged by PHP in the error log:\n\n  grep "shell" /var/log/apache2/error.log\n\nLook for the PHP Notice line containing "file stored as". The full path on that line is the flag value.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint_shell_3',
            flagId: 'webshell_path',
            text: 'The Apache error log (/var/log/apache2/error.log) also logged where the file was stored. Run: cat /var/log/apache2/error.log\n\nThe full path to submit is the server-side path, not the URL path.\n\nThe value to submit: {{FLAG:webshell_path}}',
            cost: 75,
            penalty: -75
        },

        // ── lateral_target ────────────────────────────────────
        {
            id: 'hint_lat_1',
            flagId: 'lateral_target',
            text: 'After gaining web shell access, the attacker used it to connect to an internal host. Check the Apache access log for web shell requests where the cmd= parameter contains an SSH command.',
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint_lat_2',
            flagId: 'lateral_target',
            text: 'Run: grep "10.10.20" /var/log/apache2/access.log\n\nYou should find a GET request to the web shell where the cmd parameter contains an SSH connection to an internal address. That IP is the lateral target.\n\nAlso check: grep "10.10.20" /var/log/firewall.log',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint_lat_3',
            flagId: 'lateral_target',
            text: 'The internal pivot target is on the 10.10.20.0/24 subnet. The firewall FORWARD rule shows the exact DST= address.\n\nThe value to submit: {{FLAG:lateral_target}}',
            cost: 75,
            penalty: -75
        },

        // ── exfil_bytes ───────────────────────────────────────
        {
            id: 'hint_exfil_1',
            flagId: 'exfil_bytes',
            text: 'The firewall log records BYTES= for each flow entry -- this is the total bytes transferred in the flow, not per-packet. Find the outbound connection to the attacker IP on a non-standard port.',
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint_exfil_2',
            flagId: 'exfil_bytes',
            text: 'Run: grep "4444" /var/log/firewall.log\n\nPort 4444 is a common C2/reverse shell port. The matching line shows BYTES= at the end. That number is the total bytes exfiltrated in this flow.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint_exfil_3',
            flagId: 'exfil_bytes',
            text: 'The BYTES value is exactly 1 MB in bytes. Submit the raw integer -- no commas, no units, no "bytes" suffix.\n\nThe value to submit: {{FLAG:exfil_bytes}}',
            cost: 75,
            penalty: -75
        }
    ],

    // =========================================================
    // CERT OBJECTIVES (assessment mode compatibility)
    // =========================================================

    certObjectives: {
        certPath: 'CompTIA Security+ SY0-701',
        mappings: [
            { flagId: 'attacker_ip',         objective: '4.3', description: 'Vulnerability management and threat analysis', skill: 'SSH brute-force identification in auth.log' },
            { flagId: 'compromised_account',  objective: '4.3', description: 'Vulnerability management and threat analysis', skill: 'Successful authentication event correlation' },
            { flagId: 'webshell_path',        objective: '4.5', description: 'Analyze indicators of malicious web activity', skill: 'Web shell detection via Apache access log' },
            { flagId: 'lateral_target',       objective: '4.4', description: 'Security alerting and monitoring -- lateral movement', skill: 'Lateral movement pivot identification across log sources' },
            { flagId: 'exfil_bytes',          objective: '4.8', description: 'Incident response -- data exfiltration scoping', skill: 'Firewall flow log analysis for exfiltration quantification' }
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
// Use window.VFIHConfig — the bare name is not in scope after the window= assignment.
if (window.VFIHConfig) window.VFIHConfig.resetState();
