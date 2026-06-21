/* ============================================================
   Security+ Cert Prep -- SIEM Alert Triage: Veridian Financial SOC
   Blue-team SIEM investigation | find-and-submit flags
   Students triage a live alert storm: separate real C2 beaconing
   + data exfiltration from false positives (authorized vuln scan,
   scheduled backup, high-volume internal transfer) and submit IOCs
   they discover via monitoring dashboard, IDS, log viewer, terminal.
   SY0-701: 4.2, 4.4, 4.8
   ============================================================ */

// window assignment (not const) so the second <script> block in index.html
// can reference VFSTConfig after this script has loaded.
window.VFSTConfig = {

    // =========================================================
    // BOX METADATA
    // =========================================================

    id:          'shield-sp-blueteam-siem-triage',
    title:       'SIEM Alert Triage',
    subtitle:    'Veridian Financial SOC -- Alert Storm',
    description: 'An alert storm is flooding the SOC. Multiple SIEM alerts are firing simultaneously. Three are false positives (authorized vuln scan, scheduled backup, benign internal transfer). One is a live incident: an external threat actor has established C2 beaconing from an internal host and is exfiltrating data. Investigate the monitoring dashboard, IDS, log viewer, and terminal to separate signal from noise -- then submit the IOCs you discover.',
    difficulty:  'Intermediate',
    estimatedTime: 45,
    accent:      '#2563eb',
    storageKey:  'hexworth_lab_sp_blueteam_siem_triage',
    registryId:  'shield-sp-blueteam-siem-triage',
    trackerKey:  'lab_sp_blueteam_siem_triage',

    // Blue-team mode tells BoxEngine to accept BlueTeam device types
    blueTeamMode: true,

    // =========================================================
    // BOOT SEQUENCE
    // =========================================================

    boot: {
        biosLines: [
            'VERIDIAN FINANCIAL SOC WORKSTATION v4.0.1',
            'SOC Analyst Terminal -- Tier-2 Access',
            'Ubuntu 22.04.4 LTS: LOADING',
            'SIEM feeds: Splunk forward -- CONNECTED',
            'Evidence timestamp: 2026-04-22 14:00 UTC',
            'Incident ticket: INC-2026-0422-031 -- ACTIVE'
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
        intro: 'It is 14:00 UTC. The SIEM just fired seven alerts in a four-minute window. Your shift supervisor dropped a ticket on your queue -- INC-2026-0422-031: "Multiple simultaneous alerts -- possible alert fatigue scenario. Triage and identify any true positives." Your job is to work through every alert, separate the real from the noise, and pull the exact IOCs from the device data. Submit what you find -- not what the briefing says.',

        scenario: 'Three of the alerts are benign: Nessus vuln scan from the registered scanner, an overnight backup job finishing late, and a high-volume internal wire-transfer process. Buried in the noise is a live C2 campaign: an external actor at a documentation-range IP established a persistent beacon from internal host APP-INT-09 (a subnet IP you have to discover), then exfiltrated a measurable data volume. Correlate the monitoring dashboard, IDS panel, firewall data, and raw logs to build the IOC picture.',

        outro: 'Alert triage complete. Three false positives correctly identified and closed. Real incident confirmed: C2 beaconing from APP-INT-09 to an external actor, followed by data exfiltration over port 443 with BYTES matching an IDS-detected flow. All five IOCs recovered. Incident escalated to IR team.',

        goals: [
            'Identify the external C2 IP address from IDS beacon alerts and firewall outbound flows',
            'Determine the internal host beaconing out by correlating monitoring events, IDS source IPs, and syslog',
            'Read the exact IDS signature name for the C2 beacon from the IDS alert detail',
            'Identify the false-positive source -- the authorized vulnerability scanner IP from the CMDB note in the case file',
            'Find the exact exfiltration byte count logged in the firewall flow record and IDS exfil alert'
        ],

        toolkit: [
            { name: 'cat',  purpose: 'Display a full log file',           sample: 'cat /var/log/syslog' },
            { name: 'grep', purpose: 'Search for a pattern in a file',    sample: 'grep "ERROR" /var/log/syslog' },
            { name: 'head', purpose: 'Show first N lines of a file',      sample: 'head -n 30 /var/log/ids/alerts.log' },
            { name: 'tail', purpose: 'Show last N lines of a file',       sample: 'tail -n 20 /var/log/firewall.log' },
            { name: 'find', purpose: 'Locate files in a directory tree',  sample: 'find /var/log -name "*.log"' },
            { name: 'ls',   purpose: 'List directory contents',           sample: 'ls /var/log/ids/' },
            { name: 'help', purpose: 'Show available commands',           sample: 'help' }
        ]
    },

    // =========================================================
    // TERMINAL CONFIG
    // =========================================================

    terminal: {
        user:     'analyst',
        hostname: 'soc-ws-02',
        startDir: '/home/analyst',
        welcome:  'Veridian Financial -- SOC Analyst Terminal\nTier-2 Access | INC-2026-0422-031 Active\n\nEvidence logs:\n  /var/log/syslog           Host and service events (SIEM forward)\n  /var/log/firewall.log     Perimeter firewall flow log\n  /var/log/ids/alerts.log   IDS signature match log (Suricata)\n  /var/log/netflow.log      NetFlow summary records\n\nCase file: /home/analyst/case.txt\n\nInvestigate the logs. Every IOC is a flag you must discover.\nSubmit discovered values via the Submit Flag panel.\n\nType "help" for available commands.\n'
    },

    // =========================================================
    // DESKTOP ICONS
    // =========================================================

    desktop: {
        icons: [
            { id: 'monitoring', label: 'Monitoring',   icon: 'M', app: 'monitoring' },
            { id: 'ids',        label: 'IDS Panel',    icon: 'I', app: 'ids'        },
            { id: 'logviewer',  label: 'Log Viewer',   icon: 'L', app: 'logviewer'  },
            { id: 'terminal',   label: 'Terminal',     icon: 'T', app: 'terminal'   },
            { id: 'notes',      label: 'Notes',        icon: 'N', app: 'notes'      },
            { id: 'hints',      label: 'Hints',        icon: 'H', app: 'hints'      },
            { id: 'flags',      label: 'Submit Flag',  icon: 'F', app: 'flags'      }
        ]
    },

    // =========================================================
    // SIMULATED FILESYSTEM
    //
    // /home/analyst/          -- analyst home (case file, notes, CMDB)
    // /var/log/               -- SIEM evidence snapshot
    //   syslog                -- host and service events (C2 beacon timer + false-pos backup)
    //   firewall.log          -- perimeter flows (attacker outbound + exfil BYTES)
    //   ids/
    //     alerts.log          -- Suricata signature match log (beacon sig + exfil sig)
    //   netflow.log           -- NetFlow summaries (corroborate beacon interval + exfil volume)
    //
    // FLAG DISCOVERY MAP:
    //   c2_ip            -> ids/alerts.log | firewall.log | netflow.log (DST = 203.0.113.88)
    //   beaconing_host   -> syslog | ids/alerts.log | firewall.log (SRC = 10.10.20.31 / APP-INT-09)
    //   attack_signature -> ids/alerts.log (signature field, exact string)
    //   fp_source_ip     -> /home/analyst/cmdb.txt (registered scanner) -- NOT pre-named as scanner in lore
    //   exfil_bytes      -> firewall.log | ids/alerts.log (BYTES=5242880)
    //
    // FALSE POSITIVES that generate alerts (noise students must recognize):
    //   - Nessus scan from 10.10.5.77  (appears in syslog + firewall as high-volume SYN sweep)
    //   - Backup agent on BACKUP-SRV-01 (10.10.1.200) hitting large BYTES on port 9090 (backup port)
    //   - Internal wire-transfer batch job APP-PAY-02 (10.10.3.44) -> INT-CORE-01 (10.10.1.10) high-volume TCP 443
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

                                // Case file -- directs the student to investigate logs.
                                // IOC labels listed but NO values given; student must discover.
                                'case.txt': {
                                    type: 'file',
                                    content: [
                                        'INCIDENT: INC-2026-0422-031',
                                        'Date: 2026-04-22',
                                        'Analyst: (you)',
                                        '',
                                        'ALERT STORM SUMMARY (14:00-14:04 UTC)',
                                        '  Seven SIEM alerts fired in a four-minute window.',
                                        '  Three are expected benign activity -- identify which ones.',
                                        '  At least one indicates a live threat -- confirm and extract IOCs.',
                                        '',
                                        'AFFECTED ASSETS (from asset inventory)',
                                        '  APP-INT-09    (IP unknown -- determine from log investigation)',
                                        '  BACKUP-SRV-01 10.10.1.200  backup infrastructure server',
                                        '  APP-PAY-02    10.10.3.44   payment processing application server',
                                        '  INT-CORE-01   10.10.1.10   internal core switch / router',
                                        '',
                                        'NOTE: Authorized vulnerability scanner is registered in CMDB.',
                                        '      See: /home/analyst/cmdb.txt',
                                        '',
                                        'EVIDENCE LOCATION',
                                        '  /var/log/syslog           Host and service events',
                                        '  /var/log/firewall.log     Perimeter firewall flow log',
                                        '  /var/log/ids/alerts.log   IDS signature match log',
                                        '  /var/log/netflow.log      NetFlow summaries',
                                        '',
                                        'IOCs TO RECOVER (submit each as a flag)',
                                        '  c2_ip            -- the external C2 / attacker IP',
                                        '  beaconing_host   -- internal host IP that is beaconing out',
                                        '  attack_signature -- exact IDS signature name for the C2 beacon',
                                        '  fp_source_ip     -- source IP of the authorized vuln scan (false positive)',
                                        '  exfil_bytes      -- bytes transferred in the exfiltration flow (firewall BYTES field)',
                                        '',
                                        'INVESTIGATION STARTING POINTS',
                                        '  Review the IDS Panel and /var/log/ids/alerts.log for critical-severity signatures.',
                                        '  Identify the external destination of any C2/beacon alerts in the firewall log.',
                                        '  Determine which internal host is the source of the suspicious outbound flows.',
                                        '  Cross-reference suspected scanner traffic source against /home/analyst/cmdb.txt.'
                                    ].join('\n')
                                },

                                // CMDB excerpt -- the only place fp_source_ip can be confirmed as the
                                // authorized scanner. The student must read this file to recognize the
                                // vuln-scan alert (from 10.10.5.77) as benign.
                                'cmdb.txt': {
                                    type: 'file',
                                    content: [
                                        'VERIDIAN FINANCIAL -- CMDB EXCERPT (Authorized Security Tools)',
                                        '================================================================',
                                        '',
                                        'Asset: Nessus Professional Scanner',
                                        '  Hostname:  SEC-SCAN-01',
                                        '  IP:        10.10.5.77',
                                        '  Purpose:   Weekly vulnerability assessment (authorized)',
                                        '  Owner:     Information Security -- Vulnerability Mgmt Team',
                                        '  Schedule:  Wednesdays 13:00-16:00 UTC',
                                        '  Note:      Generates high-volume SYN traffic; alerts expected.',
                                        '             Do NOT block. Confirm against this CMDB entry.',
                                        '',
                                        'Asset: Backup Agent (Veeam)',
                                        '  Hostname:  BACKUP-SRV-01',
                                        '  IP:        10.10.1.200',
                                        '  Purpose:   Nightly incremental + Tuesday full backup',
                                        '  Owner:     IT Operations',
                                        '  Schedule:  Daily 02:00-06:00 UTC; full backup Tue 02:00-14:00 UTC',
                                        '  Note:      Tuesday full backup frequently overruns into business hours.',
                                        '             Large BYTES on port 9090 (Veeam data mover) is expected.',
                                        '',
                                        'Asset: Payment Batch Processor',
                                        '  Hostname:  APP-PAY-02',
                                        '  IP:        10.10.3.44',
                                        '  Purpose:   End-of-day ACH wire-transfer settlement batch',
                                        '  Owner:     Finance Engineering',
                                        '  Schedule:  Weekdays 13:45-14:30 UTC',
                                        '  Note:      Transfers large encrypted payloads to INT-CORE-01 (10.10.1.10)',
                                        '             over port 443. Volume can exceed 50 MB. Expected behavior.',
                                        '',
                                        '================================================================',
                                        'Last updated: 2026-04-01 | Contact: security-ops@veridian.internal'
                                    ].join('\n')
                                },

                                // Analyst scratch notes
                                'notes.txt': {
                                    type: 'file',
                                    content: [
                                        'SOC INVESTIGATION SCRATCH PAD',
                                        '================================',
                                        '',
                                        'Key question: which alerts are REAL vs FALSE POSITIVE?',
                                        '',
                                        'grep tips:',
                                        '  grep PATTERN /path/to/file      -- search a file for pattern',
                                        '  grep -i PATTERN /path/to/file   -- case-insensitive',
                                        '  grep -v PATTERN /path/to/file   -- lines NOT matching (exclude noise)',
                                        '  grep -c PATTERN /path/to/file   -- count matching lines',
                                        '  grep -n PATTERN /path/to/file   -- show line numbers',
                                        '',
                                        'IDS log fields (Suricata fast.log style):',
                                        '  TIMESTAMP [**] [SID] SIGNATURE [**] [Class: TYPE] [Priority: N]',
                                        '  {PROTO} SRC_IP:SRC_PORT -> DST_IP:DST_PORT',
                                        '',
                                        'Firewall log BYTES field:',
                                        '  Total bytes in the flow (not per-packet)',
                                        '  Large BYTES on external DST = potential exfil',
                                        '',
                                        'False positive recognition checklist:',
                                        '  - Is the source IP in the CMDB? (/home/analyst/cmdb.txt)',
                                        '  - Does the traffic pattern match a scheduled process?',
                                        '  - Is the destination internal or external?',
                                        '',
                                        'IOC notes:',
                                        '  External C2 IP:       ',
                                        '  Internal beacon host: ',
                                        '  IDS signature:        ',
                                        '  Vuln scanner IP:      ',
                                        '  Exfil bytes:          '
                                    ].join('\n')
                                },

                                '.bash_history': {
                                    type: 'file',
                                    content: 'ls /var/log/\ncat /home/analyst/case.txt\nls /var/log/ids/\n'
                                }
                            }
                        }
                    }
                },

                // ─── EVIDENCE SNAPSHOT ────────────────────────────────────
                'var': {
                    type: 'dir',
                    children: {
                        'log': {
                            type: 'dir',
                            children: {

                                // ── SYSLOG ───────────────────────────────────────────
                                // Contains:
                                //   - Normal cron, service starts, internal traffic events
                                //   - Veeam backup running late (normal on Tuesdays, high BYTES on 9090)
                                //   - APP-PAY-02 batch wire-transfer starting at 13:45 UTC (normal)
                                //   - C2 BEACON: APP-INT-09 (10.10.20.31) opening periodic outbound conn
                                //     to 203.0.113.88 -- intervals approximately every 60s starting 13:58
                                //   - Nessus scan traffic from 10.10.5.77 (expected)
                                //
                                // FLAG DISCOVERY:
                                //   beaconing_host -> grep "10.10.20.31" /var/log/syslog
                                //   c2_ip          -> grep "203.0.113" /var/log/syslog
                                'syslog': {
                                    type: 'file',
                                    content: [
                                        // Normal morning background
                                        'Apr 22 12:00:01 soc-fw-01 CRON[4401]: pam_unix(cron:session): session opened for user root',
                                        'Apr 22 12:00:01 soc-fw-01 CRON[4401]: pam_unix(cron:session): session closed for user root',
                                        'Apr 22 12:05:14 soc-fw-01 kernel: IPv4: eth0: martian source 169.254.169.254 from 10.10.1.10',
                                        'Apr 22 12:10:03 app-int-01 systemd[1]: app-monitor.service: active (running)',
                                        'Apr 22 12:15:01 soc-fw-01 CRON[4521]: pam_unix(cron:session): session opened for user root',
                                        'Apr 22 12:15:01 soc-fw-01 CRON[4521]: pam_unix(cron:session): session closed for user root',
                                        'Apr 22 12:22:44 app-int-02 kernel: TCP: drop open request from 10.10.1.5:58801 on port 8080',
                                        'Apr 22 12:30:01 soc-fw-01 CRON[4701]: pam_unix(cron:session): session opened for user root',
                                        'Apr 22 12:30:01 soc-fw-01 CRON[4701]: pam_unix(cron:session): session closed for user root',
                                        // Veeam backup (false positive): backup running late from 02:00, still active
                                        'Apr 22 12:35:18 backup-srv-01 veeam[3201]: VeeamAgent: Full backup job VERIDIAN-FULL-20260422 -- transferring data to backup-repo-01 port 9090',
                                        'Apr 22 12:35:19 backup-srv-01 veeam[3201]: VeeamAgent: session BYTES transferred so far: 38218924800',
                                        'Apr 22 12:40:22 backup-srv-01 veeam[3201]: VeeamAgent: Full backup job VERIDIAN-FULL-20260422 -- still running, ETA 14:20 UTC',
                                        'Apr 22 12:45:01 soc-fw-01 CRON[4801]: pam_unix(cron:session): session opened for user root',
                                        'Apr 22 12:45:01 soc-fw-01 CRON[4801]: pam_unix(cron:session): session closed for user root',
                                        'Apr 22 13:00:01 soc-fw-01 CRON[4901]: pam_unix(cron:session): session opened for user root',
                                        'Apr 22 13:00:01 soc-fw-01 CRON[4901]: pam_unix(cron:session): session closed for user root',
                                        // Nessus scan begins at 13:00 (false positive)
                                        'Apr 22 13:00:12 sec-scan-01 nessus[5100]: Nessus scan job SCAN-20260422-VF-WEEKLY started: target range 10.10.0.0/16',
                                        'Apr 22 13:00:14 soc-fw-01 kernel: TCP SYN flood detected from 10.10.5.77: 1402 SYNs/sec across port range 1-65535',
                                        'Apr 22 13:00:15 app-int-01 kernel: Connection limit exceeded: src=10.10.5.77 dst=10.10.0.0/16',
                                        'Apr 22 13:15:01 soc-fw-01 CRON[5201]: pam_unix(cron:session): session opened for user root',
                                        'Apr 22 13:15:01 soc-fw-01 CRON[5201]: pam_unix(cron:session): session closed for user root',
                                        'Apr 22 13:22:08 sec-scan-01 nessus[5100]: scan progress: 4821 hosts checked, 1028 findings queued',
                                        // Payment batch starts (false positive)
                                        'Apr 22 13:45:01 app-pay-02 batch[6100]: ACH wire-transfer settlement batch JOB-20260422-EOD started',
                                        'Apr 22 13:45:03 app-pay-02 batch[6100]: Connecting to INT-CORE-01 (10.10.1.10) port 443 for encrypted payload transfer',
                                        'Apr 22 13:45:04 app-pay-02 kernel: TCP established: 10.10.3.44:52201 -> 10.10.1.10:443 BYTES=0',
                                        'Apr 22 13:46:11 app-pay-02 batch[6100]: batch transfer in progress: 12.4 MB sent',
                                        'Apr 22 13:50:01 soc-fw-01 CRON[6301]: pam_unix(cron:session): session opened for user root',
                                        'Apr 22 13:50:01 soc-fw-01 CRON[6301]: pam_unix(cron:session): session closed for user root',
                                        'Apr 22 13:55:44 app-pay-02 batch[6100]: batch transfer in progress: 38.7 MB sent',
                                        // *** C2 BEACONING BEGINS: APP-INT-09 (10.10.20.31) -> 203.0.113.88 ***
                                        // First beacon: outbound TCP 443 connection attempt from APP-INT-09
                                        'Apr 22 13:58:02 app-int-09 kernel: TCP SYN sent: src=10.10.20.31:49201 dst=203.0.113.88:443',
                                        'Apr 22 13:58:02 app-int-09 kernel: TCP established: 10.10.20.31:49201 -> 203.0.113.88:443',
                                        'Apr 22 13:58:04 app-int-09 kernel: TCP FIN: 10.10.20.31:49201 -> 203.0.113.88:443 BYTES=842',
                                        // Second beacon (60s interval)
                                        'Apr 22 13:59:02 app-int-09 kernel: TCP SYN sent: src=10.10.20.31:49214 dst=203.0.113.88:443',
                                        'Apr 22 13:59:02 app-int-09 kernel: TCP established: 10.10.20.31:49214 -> 203.0.113.88:443',
                                        'Apr 22 13:59:04 app-int-09 kernel: TCP FIN: 10.10.20.31:49214 -> 203.0.113.88:443 BYTES=842',
                                        // Third beacon
                                        'Apr 22 14:00:02 app-int-09 kernel: TCP SYN sent: src=10.10.20.31:49228 dst=203.0.113.88:443',
                                        'Apr 22 14:00:02 app-int-09 kernel: TCP established: 10.10.20.31:49228 -> 203.0.113.88:443',
                                        'Apr 22 14:00:04 app-int-09 kernel: TCP FIN: 10.10.20.31:49228 -> 203.0.113.88:443 BYTES=842',
                                        // Normal background during alert storm
                                        'Apr 22 14:00:01 soc-fw-01 CRON[6501]: pam_unix(cron:session): session opened for user root',
                                        'Apr 22 14:00:01 soc-fw-01 CRON[6501]: pam_unix(cron:session): session closed for user root',
                                        // Fourth beacon
                                        'Apr 22 14:01:02 app-int-09 kernel: TCP SYN sent: src=10.10.20.31:49241 dst=203.0.113.88:443',
                                        'Apr 22 14:01:02 app-int-09 kernel: TCP established: 10.10.20.31:49241 -> 203.0.113.88:443',
                                        'Apr 22 14:01:04 app-int-09 kernel: TCP FIN: 10.10.20.31:49241 -> 203.0.113.88:443 BYTES=842',
                                        'Apr 22 14:01:30 backup-srv-01 veeam[3201]: VeeamAgent: Full backup job VERIDIAN-FULL-20260422 -- 91% complete',
                                        // Fifth beacon
                                        'Apr 22 14:02:02 app-int-09 kernel: TCP SYN sent: src=10.10.20.31:49255 dst=203.0.113.88:443',
                                        'Apr 22 14:02:02 app-int-09 kernel: TCP established: 10.10.20.31:49255 -> 203.0.113.88:443',
                                        'Apr 22 14:02:04 app-int-09 kernel: TCP FIN: 10.10.20.31:49255 -> 203.0.113.88:443 BYTES=842',
                                        // *** EXFILTRATION: APP-INT-09 (10.10.20.31) -> 203.0.113.88 large transfer ***
                                        'Apr 22 14:03:18 app-int-09 kernel: TCP SYN sent: src=10.10.20.31:49270 dst=203.0.113.88:443',
                                        'Apr 22 14:03:18 app-int-09 kernel: TCP established: 10.10.20.31:49270 -> 203.0.113.88:443',
                                        'Apr 22 14:03:44 app-int-09 kernel: TCP FIN: 10.10.20.31:49270 -> 203.0.113.88:443 BYTES=5242880',
                                        // Payment batch completes (normal)
                                        'Apr 22 14:04:01 app-pay-02 batch[6100]: ACH wire-transfer settlement batch JOB-20260422-EOD completed: 52.1 MB transferred',
                                        'Apr 22 14:04:02 app-pay-02 kernel: TCP FIN: 10.10.3.44:52201 -> 10.10.1.10:443',
                                        // Nessus scan still running
                                        'Apr 22 14:05:22 sec-scan-01 nessus[5100]: scan progress: 12804 hosts checked, 3418 findings queued',
                                        'Apr 22 14:15:01 soc-fw-01 CRON[6801]: pam_unix(cron:session): session opened for user root',
                                        'Apr 22 14:15:01 soc-fw-01 CRON[6801]: pam_unix(cron:session): session closed for user root'
                                    ].join('\n')
                                },

                                // ── FIREWALL LOG ─────────────────────────────────────
                                // Contains:
                                //   - Normal internal traffic (web, DNS, NTP, backup on port 9090)
                                //   - Nessus scan: high-rate ALLOW IN from 10.10.5.77 across many DPTs (false pos)
                                //   - Backup ALLOW: 10.10.1.200 -> 10.10.10.50 DPT=9090 BYTES=large (false pos)
                                //   - Payment batch: 10.10.3.44 -> 10.10.1.10 DPT=443 BYTES=large internal (false pos)
                                //   - C2 BEACONS: 10.10.20.31 -> 203.0.113.88 DPT=443 BYTES=842 (repeating ~60s)
                                //   - EXFIL: 10.10.20.31 -> 203.0.113.88 DPT=443 BYTES=5242880  *** FLAG VALUE ***
                                //
                                // FLAG DISCOVERY:
                                //   c2_ip          -> grep "203.0.113.88" /var/log/firewall.log
                                //   beaconing_host -> grep "203.0.113.88" /var/log/firewall.log  (SRC=10.10.20.31)
                                //   exfil_bytes    -> grep "BYTES=" /var/log/firewall.log | grep "203.0.113.88"
                                //                     or: grep "5242880" /var/log/firewall.log
                                'firewall.log': {
                                    type: 'file',
                                    content: [
                                        // Normal background
                                        'Apr 22 12:00:05 soc-fw-01 kernel: IPTABLES ALLOW IN: SRC=10.10.1.100 DST=10.10.10.20 PROTO=TCP SPT=54201 DPT=80',
                                        'Apr 22 12:00:11 soc-fw-01 kernel: IPTABLES ALLOW OUT: SRC=10.10.0.1 DST=8.8.8.8 PROTO=UDP SPT=1024 DPT=53 BYTES=72',
                                        'Apr 22 12:01:00 soc-fw-01 kernel: IPTABLES ALLOW IN: SRC=10.10.1.101 DST=10.10.10.20 PROTO=TCP SPT=54401 DPT=443',
                                        'Apr 22 12:05:00 soc-fw-01 kernel: IPTABLES ALLOW OUT: SRC=10.10.0.1 DST=216.239.35.4 PROTO=UDP SPT=1024 DPT=123 BYTES=76',
                                        // Veeam backup (false positive): large internal BYTES on port 9090
                                        'Apr 22 12:35:20 soc-fw-01 kernel: IPTABLES ALLOW FORWARD: SRC=10.10.1.200 DST=10.10.10.50 PROTO=TCP SPT=9090 DPT=9090 BYTES=38218924800',
                                        'Apr 22 12:40:25 soc-fw-01 kernel: IPTABLES ALLOW FORWARD: SRC=10.10.1.200 DST=10.10.10.50 PROTO=TCP SPT=9090 DPT=9090 BYTES=42000000000',
                                        // Nessus scan (false positive): high-rate SYN sweep from 10.10.5.77
                                        'Apr 22 13:00:14 soc-fw-01 kernel: IPTABLES ALLOW IN: SRC=10.10.5.77 DST=10.10.0.0/16 PROTO=TCP SPT=45100 DPT=22 WINDOW=65535 SYN',
                                        'Apr 22 13:00:14 soc-fw-01 kernel: IPTABLES ALLOW IN: SRC=10.10.5.77 DST=10.10.0.0/16 PROTO=TCP SPT=45101 DPT=80 WINDOW=65535 SYN',
                                        'Apr 22 13:00:14 soc-fw-01 kernel: IPTABLES ALLOW IN: SRC=10.10.5.77 DST=10.10.0.0/16 PROTO=TCP SPT=45102 DPT=443 WINDOW=65535 SYN',
                                        'Apr 22 13:00:14 soc-fw-01 kernel: IPTABLES ALLOW IN: SRC=10.10.5.77 DST=10.10.0.0/16 PROTO=TCP SPT=45103 DPT=3389 WINDOW=65535 SYN',
                                        'Apr 22 13:00:15 soc-fw-01 kernel: IPTABLES ALLOW IN: SRC=10.10.5.77 DST=10.10.0.0/16 PROTO=TCP SPT=45200 DPT=8080 WINDOW=65535 SYN',
                                        'Apr 22 13:00:15 soc-fw-01 kernel: IPTABLES ALLOW IN: SRC=10.10.5.77 DST=10.10.0.0/16 PROTO=TCP SPT=45201 DPT=8443 WINDOW=65535 SYN',
                                        // Payment batch (false positive): large internal transfer on port 443
                                        'Apr 22 13:45:05 soc-fw-01 kernel: IPTABLES ALLOW FORWARD: SRC=10.10.3.44 DST=10.10.1.10 PROTO=TCP SPT=52201 DPT=443 BYTES=52428800',
                                        // C2 BEACON 1: APP-INT-09 (10.10.20.31) -> 203.0.113.88 beacon check-in
                                        // Logged at flow close (ACK PSH FIN), consistent with syslog TCP FIN entries
                                        'Apr 22 13:58:04 soc-fw-01 kernel: IPTABLES ALLOW OUT: IN= OUT=eth0 SRC=10.10.20.31 DST=203.0.113.88 PROTO=TCP SPT=49201 DPT=443 WINDOW=502 ACK PSH FIN URGP=0 BYTES=842',
                                        // C2 BEACON 2
                                        'Apr 22 13:59:04 soc-fw-01 kernel: IPTABLES ALLOW OUT: IN= OUT=eth0 SRC=10.10.20.31 DST=203.0.113.88 PROTO=TCP SPT=49214 DPT=443 WINDOW=502 ACK PSH FIN URGP=0 BYTES=842',
                                        // C2 BEACON 3
                                        'Apr 22 14:00:04 soc-fw-01 kernel: IPTABLES ALLOW OUT: IN= OUT=eth0 SRC=10.10.20.31 DST=203.0.113.88 PROTO=TCP SPT=49228 DPT=443 WINDOW=502 ACK PSH FIN URGP=0 BYTES=842',
                                        // C2 BEACON 4
                                        'Apr 22 14:01:04 soc-fw-01 kernel: IPTABLES ALLOW OUT: IN= OUT=eth0 SRC=10.10.20.31 DST=203.0.113.88 PROTO=TCP SPT=49241 DPT=443 WINDOW=502 ACK PSH FIN URGP=0 BYTES=842',
                                        // C2 BEACON 5
                                        'Apr 22 14:02:04 soc-fw-01 kernel: IPTABLES ALLOW OUT: IN= OUT=eth0 SRC=10.10.20.31 DST=203.0.113.88 PROTO=TCP SPT=49255 DPT=443 WINDOW=502 ACK PSH FIN URGP=0 BYTES=842',
                                        // *** EXFILTRATION LINE -- FLAG VALUE: BYTES=5242880 ***
                                        // Distinct from beacons: single large flow on same port to same DST
                                        'Apr 22 14:03:18 soc-fw-01 kernel: IPTABLES ALLOW OUT: IN= OUT=eth0 SRC=10.10.20.31 DST=203.0.113.88 LEN=1500 TOS=0x00 PREC=0x00 TTL=64 ID=38801 DF PROTO=TCP SPT=49270 DPT=443 WINDOW=502 RES=0x00 ACK PSH URGP=0 BYTES=5242880',
                                        // Normal background after incident
                                        'Apr 22 14:04:10 soc-fw-01 kernel: IPTABLES ALLOW IN: SRC=10.10.1.102 DST=10.10.10.20 PROTO=TCP SPT=54701 DPT=443',
                                        'Apr 22 14:05:00 soc-fw-01 kernel: IPTABLES ALLOW OUT: SRC=10.10.0.1 DST=8.8.8.8 PROTO=UDP SPT=1024 DPT=53 BYTES=72',
                                        'Apr 22 14:15:02 soc-fw-01 kernel: IPTABLES ALLOW IN: SRC=10.10.1.103 DST=10.10.10.20 PROTO=TCP SPT=54901 DPT=80'
                                    ].join('\n')
                                },

                                // ── IDS DIRECTORY ────────────────────────────────────
                                'ids': {
                                    type: 'dir',
                                    children: {

                                        // ── IDS ALERTS LOG ───────────────────────────
                                        // Suricata fast.log format.
                                        // Contains:
                                        //   - SCAN alerts for Nessus from 10.10.5.77 (false pos)
                                        //   - BACKUP alert for large BYTES from 10.10.1.200 on port 9090 (false pos)
                                        //   - TRANSFER alert for 10.10.3.44 -> 10.10.1.10 large internal (false pos)
                                        //   - C2 BEACON alerts: 10.10.20.31 -> 203.0.113.88 with SIG name
                                        //   - EXFIL alert: 10.10.20.31 -> 203.0.113.88 with BYTES=5242880
                                        //
                                        // FLAG DISCOVERY:
                                        //   c2_ip            -> grep "203.0.113.88" /var/log/ids/alerts.log
                                        //   beaconing_host   -> grep "203.0.113.88" /var/log/ids/alerts.log
                                        //   attack_signature -> grep -i "beacon" /var/log/ids/alerts.log
                                        //                      OR grep "ET MALWARE" /var/log/ids/alerts.log
                                        //   exfil_bytes      -> grep "5242880" /var/log/ids/alerts.log
                                        'alerts.log': {
                                            type: 'file',
                                            content: [
                                                // Nessus scan alerts (false positive -- high volume SYN from 10.10.5.77)
                                                '04/22/2026-13:00:14.002211 [**] [1:2010935:3] ET SCAN Potential SSH Scan [**] [Classification: Attempted Information Leak] [Priority: 2] {TCP} 10.10.5.77:45100 -> 10.10.20.14:22',
                                                '04/22/2026-13:00:14.004411 [**] [1:2010936:3] ET SCAN Potential HTTP Scan [**] [Classification: Attempted Information Leak] [Priority: 2] {TCP} 10.10.5.77:45101 -> 10.10.20.14:80',
                                                '04/22/2026-13:00:14.006801 [**] [1:2010940:4] ET SCAN Potential RDP Scan [**] [Classification: Attempted Information Leak] [Priority: 2] {TCP} 10.10.5.77:45103 -> 10.10.20.14:3389',
                                                '04/22/2026-13:00:15.008201 [**] [1:2010944:2] ET SCAN Nmap Scripting Engine User-Agent Detected [**] [Classification: Web Application Attack] [Priority: 1] {TCP} 10.10.5.77:45200 -> 10.10.10.20:8080',
                                                '04/22/2026-13:00:16.009100 [**] [1:2010935:3] ET SCAN Potential SSH Scan [**] [Classification: Attempted Information Leak] [Priority: 2] {TCP} 10.10.5.77:45301 -> 10.10.20.22:22',
                                                // Backup alert (false positive)
                                                '04/22/2026-12:35:22.100004 [**] [1:2030001:1] ET POLICY Large Data Transfer on Non-Standard Port [**] [Classification: Potentially Bad Traffic] [Priority: 3] {TCP} 10.10.1.200:9090 -> 10.10.10.50:9090 BYTES=38218924800',
                                                // Payment batch alert (false positive -- large but internal destination)
                                                '04/22/2026-13:45:06.200014 [**] [1:2030002:1] ET POLICY Anomalous Large Internal Transfer [**] [Classification: Potentially Bad Traffic] [Priority: 3] {TCP} 10.10.3.44:52201 -> 10.10.1.10:443 BYTES=52428800',
                                                // *** C2 BEACON ALERTS -- FLAG VALUES EMBEDDED ***
                                                // attack_signature = 'ET MALWARE Cobalt Strike Beacon'
                                                '04/22/2026-13:58:02.441204 [**] [1:2019401:8] ET MALWARE Cobalt Strike Beacon [**] [Classification: A Network Trojan was Detected] [Priority: 1] {TCP} 10.10.20.31:49201 -> 203.0.113.88:443',
                                                '04/22/2026-13:59:02.441814 [**] [1:2019401:8] ET MALWARE Cobalt Strike Beacon [**] [Classification: A Network Trojan was Detected] [Priority: 1] {TCP} 10.10.20.31:49214 -> 203.0.113.88:443',
                                                '04/22/2026-14:00:02.442014 [**] [1:2019401:8] ET MALWARE Cobalt Strike Beacon [**] [Classification: A Network Trojan was Detected] [Priority: 1] {TCP} 10.10.20.31:49228 -> 203.0.113.88:443',
                                                '04/22/2026-14:01:02.442204 [**] [1:2019401:8] ET MALWARE Cobalt Strike Beacon [**] [Classification: A Network Trojan was Detected] [Priority: 1] {TCP} 10.10.20.31:49241 -> 203.0.113.88:443',
                                                '04/22/2026-14:02:02.442801 [**] [1:2019401:8] ET MALWARE Cobalt Strike Beacon [**] [Classification: A Network Trojan was Detected] [Priority: 1] {TCP} 10.10.20.31:49255 -> 203.0.113.88:443',
                                                // *** EXFIL ALERT -- BYTES=5242880 FLAG VALUE EMBEDDED ***
                                                '04/22/2026-14:03:18.881044 [**] [1:2019402:6] ET MALWARE Cobalt Strike Exfiltration via HTTPS [**] [Classification: Data Theft Detected] [Priority: 1] {TCP} 10.10.20.31:49270 -> 203.0.113.88:443 BYTES=5242880'
                                            ].join('\n')
                                        }
                                    }
                                },

                                // ── NETFLOW LOG ──────────────────────────────────────
                                // NetFlow summaries confirming the beacon interval pattern
                                // and the exfil flow volume. Corroborates firewall.log data.
                                //
                                // FLAG DISCOVERY:
                                //   c2_ip          -> grep "203.0.113.88" /var/log/netflow.log
                                //   beaconing_host -> grep "203.0.113.88" /var/log/netflow.log
                                //   exfil_bytes    -> grep "5242880" /var/log/netflow.log
                                'netflow.log': {
                                    type: 'file',
                                    content: [
                                        '# NetFlow v9 Summary -- Veridian Financial Perimeter -- 2026-04-22',
                                        '# Format: TIMESTAMP | SRC_IP:SRC_PORT | DST_IP:DST_PORT | PROTO | BYTES | PKTS | DURATION',
                                        '#',
                                        '# Normal baseline flows',
                                        '2026-04-22T12:00:01Z | 10.10.1.100:54201   | 10.10.10.20:80       | TCP  |      4312 |   6 |  0.8s',
                                        '2026-04-22T12:01:00Z | 10.10.1.101:54401   | 10.10.10.20:443      | TCP  |      8841 |  14 |  1.2s',
                                        '2026-04-22T12:05:00Z | 10.10.0.1:1024      | 8.8.8.8:53           | UDP  |        72 |   1 |  0.0s',
                                        '2026-04-22T12:05:00Z | 10.10.0.1:1025      | 216.239.35.4:123     | UDP  |        76 |   1 |  0.0s',
                                        '#',
                                        '# Veeam backup (internal -- large BYTES, port 9090)',
                                        '2026-04-22T12:35:20Z | 10.10.1.200:9090    | 10.10.10.50:9090     | TCP  | 38218924800 | 25481424 | 5040.0s',
                                        '#',
                                        '# Nessus scan (internal source, wide port sweep)',
                                        '2026-04-22T13:00:14Z | 10.10.5.77:45100    | 10.10.0.0/16:*       | TCP  |    842000 | 14200 |  120.0s',
                                        '#',
                                        '# Payment batch (internal src -> internal dst)',
                                        '2026-04-22T13:45:05Z | 10.10.3.44:52201    | 10.10.1.10:443       | TCP  |  52428800 |  35001 |  1136.0s',
                                        '#',
                                        '# C2 beacon flows (external DST 203.0.113.88 -- anomalous)',
                                        '2026-04-22T13:58:02Z | 10.10.20.31:49201   | 203.0.113.88:443     | TCP  |       842 |   4 |  2.1s',
                                        '2026-04-22T13:59:02Z | 10.10.20.31:49214   | 203.0.113.88:443     | TCP  |       842 |   4 |  2.0s',
                                        '2026-04-22T14:00:02Z | 10.10.20.31:49228   | 203.0.113.88:443     | TCP  |       842 |   4 |  2.1s',
                                        '2026-04-22T14:01:02Z | 10.10.20.31:49241   | 203.0.113.88:443     | TCP  |       842 |   4 |  2.0s',
                                        '2026-04-22T14:02:02Z | 10.10.20.31:49255   | 203.0.113.88:443     | TCP  |       842 |   4 |  2.1s',
                                        '#',
                                        '# Exfiltration flow (same DST -- anomalous volume)',
                                        '2026-04-22T14:03:18Z | 10.10.20.31:49270   | 203.0.113.88:443     | TCP  |   5242880 |   3503 |  26.2s'
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
                        'hostname': { type: 'file', content: 'soc-ws-02' },
                        'hosts': {
                            type: 'file',
                            content: [
                                '127.0.0.1   localhost',
                                '10.10.20.31 APP-INT-09',
                                '10.10.1.200 BACKUP-SRV-01',
                                '10.10.3.44  APP-PAY-02',
                                '10.10.1.10  INT-CORE-01',
                                '10.10.5.77  SEC-SCAN-01'
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
    // =========================================================

    commands: {

        // ── grep: file-based AND pipe-aware ────────────────────
        // Handles: grep PATTERN FILE           (direct file search)
        //          cat FILE | grep PATTERN     (piped stdin via term._pipedStdin)
        //          grep -i PATTERN FILE        (case-insensitive)
        //          grep -v PATTERN FILE        (invert match)
        //          grep -c PATTERN FILE        (count matches)
        //          grep -n PATTERN FILE        (show line numbers)
        //
        // Terminal.js sets term._pipedStdin = <previous stdout> before
        // calling any custom command handler in a pipeline segment.
        // When a file arg is absent but _pipedStdin is non-empty, filter
        // those lines by the pattern instead of erroring.
        'grep': function(args, term, engine) {
            if (!args.length) {
                return 'Usage: grep [OPTIONS] PATTERN FILE\n  -i  case-insensitive\n  -v  invert match (lines NOT matching)\n  -c  count matching lines\n  -n  show line numbers\n  -A N  print N lines after each match\n  -B N  print N lines before each match\n  -C N  print N lines before and after each match\n\nExample: grep PATTERN /var/log/syslog\nExample: grep -A 3 "PATTERN" /var/log/syslog\nExample: cat /var/log/firewall.log | grep PATTERN';
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

        // ── help override (supplements built-in with case context) ──
        'help': function(args, term) {
            return [
                'SIEM ALERT TRIAGE -- COMMAND REFERENCE',
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
                '  /var/log/syslog            Host and service events',
                '  /var/log/firewall.log      Perimeter firewall flow log',
                '  /var/log/ids/alerts.log    IDS signature match log',
                '  /var/log/netflow.log       NetFlow summaries',
                '  /home/analyst/case.txt     Case file and investigation guide',
                '  /home/analyst/cmdb.txt     CMDB -- authorized tool registry',
                '',
                'Key investigation patterns:',
                '  grep the IDS alerts log for malware signatures (critical severity)',
                '  Check the firewall log for unrecognized outbound destinations',
                '  Cross-reference suspect source IPs against /home/analyst/cmdb.txt',
                '  Identify which internal host appears as SRC in suspicious outbound flows',
                '  Look for repeated fixed-interval flows vs. a single large-volume flow'
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
    //
    // False positives appear as warning severity (not suspicious)
    // so the student must reason about them, not just filter them out.
    // =========================================================

    logViewer: {
        entries: [
            // ── Normal background ──────────────────────────────────
            { timestamp: '2026-04-22 12:00:05', severity: 'info',    source: 'firewall',       message: 'ALLOW IN: SRC=10.10.1.100 DST=10.10.10.20 PROTO=TCP DPT=80' },
            { timestamp: '2026-04-22 12:30:01', severity: 'info',    source: 'cron',           message: 'pam_unix(cron:session): session opened for user root' },
            // ── False positive: Veeam backup (warning, not suspicious) ──
            { timestamp: '2026-04-22 12:35:18', severity: 'warning', source: 'veeam/backup',   message: 'VeeamAgent: Full backup job VERIDIAN-FULL-20260422 transferring -- BYTES=38218924800 on port 9090' },
            { timestamp: '2026-04-22 12:35:22', severity: 'warning', source: 'ids',            message: 'ET POLICY Large Data Transfer on Non-Standard Port: SRC=10.10.1.200 DST=10.10.10.50 DPT=9090 BYTES=38218924800' },
            // ── False positive: Nessus scan (warning, not suspicious) ──
            { timestamp: '2026-04-22 13:00:12', severity: 'info',    source: 'nessus',         message: 'Nessus scan SCAN-20260422-VF-WEEKLY started: target 10.10.0.0/16 from 10.10.5.77' },
            { timestamp: '2026-04-22 13:00:14', severity: 'warning', source: 'ids',            message: 'ET SCAN Potential SSH Scan: SRC=10.10.5.77 -> 10.10.20.14:22' },
            { timestamp: '2026-04-22 13:00:14', severity: 'warning', source: 'ids',            message: 'ET SCAN Potential HTTP Scan: SRC=10.10.5.77 -> 10.10.20.14:80' },
            { timestamp: '2026-04-22 13:00:15', severity: 'warning', source: 'ids',            message: 'ET SCAN Nmap Scripting Engine User-Agent: SRC=10.10.5.77 -> 10.10.10.20:8080' },
            // ── False positive: Payment batch (warning, not suspicious) ──
            { timestamp: '2026-04-22 13:45:01', severity: 'info',    source: 'batch',          message: 'ACH wire-transfer settlement batch JOB-20260422-EOD started on APP-PAY-02' },
            { timestamp: '2026-04-22 13:45:06', severity: 'warning', source: 'ids',            message: 'ET POLICY Anomalous Large Internal Transfer: SRC=10.10.3.44 DST=10.10.1.10 DPT=443 BYTES=52428800' },
            // ── C2 BEACON 1 (suspicious) ──────────────────────────
            { timestamp: '2026-04-22 13:58:02', severity: 'crit',    source: 'ids',            message: 'ET MALWARE Cobalt Strike Beacon: SRC=10.10.20.31:49201 -> DST=203.0.113.88:443', suspicious: true },
            { timestamp: '2026-04-22 13:58:02', severity: 'crit',    source: 'firewall',       message: 'ALLOW OUT: SRC=10.10.20.31 DST=203.0.113.88 DPT=443 BYTES=842', suspicious: true },
            // ── C2 BEACON 2 ──────────────────────────────────────
            { timestamp: '2026-04-22 13:59:02', severity: 'crit',    source: 'ids',            message: 'ET MALWARE Cobalt Strike Beacon: SRC=10.10.20.31:49214 -> DST=203.0.113.88:443', suspicious: true },
            { timestamp: '2026-04-22 13:59:02', severity: 'crit',    source: 'firewall',       message: 'ALLOW OUT: SRC=10.10.20.31 DST=203.0.113.88 DPT=443 BYTES=842', suspicious: true },
            // ── C2 BEACON 3 (alert storm starts here) ─────────────
            { timestamp: '2026-04-22 14:00:02', severity: 'crit',    source: 'ids',            message: 'ET MALWARE Cobalt Strike Beacon: SRC=10.10.20.31:49228 -> DST=203.0.113.88:443', suspicious: true },
            { timestamp: '2026-04-22 14:00:02', severity: 'syslog',  source: 'syslog',         message: 'app-int-09: TCP established: 10.10.20.31:49228 -> 203.0.113.88:443', suspicious: true },
            // ── C2 BEACON 4 ──────────────────────────────────────
            { timestamp: '2026-04-22 14:01:02', severity: 'crit',    source: 'ids',            message: 'ET MALWARE Cobalt Strike Beacon: SRC=10.10.20.31:49241 -> DST=203.0.113.88:443', suspicious: true },
            // ── C2 BEACON 5 ──────────────────────────────────────
            { timestamp: '2026-04-22 14:02:02', severity: 'crit',    source: 'ids',            message: 'ET MALWARE Cobalt Strike Beacon: SRC=10.10.20.31:49255 -> DST=203.0.113.88:443', suspicious: true },
            // ── EXFILTRATION ──────────────────────────────────────
            { timestamp: '2026-04-22 14:03:18', severity: 'crit',    source: 'ids',            message: 'ET MALWARE Cobalt Strike Exfiltration via HTTPS: SRC=10.10.20.31:49270 -> DST=203.0.113.88:443 BYTES=5242880', suspicious: true },
            { timestamp: '2026-04-22 14:03:18', severity: 'crit',    source: 'firewall',       message: 'ALLOW OUT: SRC=10.10.20.31 DST=203.0.113.88 DPT=443 BYTES=5242880', suspicious: true },
            // ── Normal after incident ─────────────────────────────
            { timestamp: '2026-04-22 14:04:01', severity: 'info',    source: 'batch',          message: 'ACH wire-transfer settlement batch JOB-20260422-EOD completed: 52.1 MB transferred' },
            { timestamp: '2026-04-22 14:05:22', severity: 'info',    source: 'nessus',         message: 'Nessus scan progress: 12804 hosts checked, 3418 findings queued' }
        ]
    },

    // =========================================================
    // MONITORING DASHBOARD DATA (BlueTeam.js MonitoringDashboard)
    //
    // Traffic values are relative request/event counts per 5-min window.
    // Spikes at 13:55-14:05 represent the alert storm window.
    // =========================================================

    monitoring: {

        // Network traffic histogram -- spikes mark alert storm window
        traffic: [
            { value: 14,  label: '12:00' },
            { value: 11,  label: '12:05' },
            { value: 16,  label: '12:10' },
            { value: 12,  label: '12:15' },
            { value: 9,   label: '12:20' },
            { value: 13,  label: '12:25' },
            { value: 48,  label: '12:30', threshold: 40 },  // backup traffic
            { value: 51,  label: '12:35', threshold: 40 },
            { value: 44,  label: '12:40', threshold: 40 },
            { value: 18,  label: '12:45' },
            { value: 22,  label: '12:50' },
            { value: 19,  label: '12:55' },
            { value: 112, label: '13:00', threshold: 40 },  // Nessus scan spike
            { value: 134, label: '13:05', threshold: 40 },
            { value: 108, label: '13:10', threshold: 40 },
            { value: 89,  label: '13:15', threshold: 40 },
            { value: 72,  label: '13:20', threshold: 40 },
            { value: 31,  label: '13:25' },
            { value: 27,  label: '13:30' },
            { value: 24,  label: '13:35' },
            { value: 19,  label: '13:40' },
            { value: 58,  label: '13:45', threshold: 40 },  // payment batch
            { value: 62,  label: '13:50', threshold: 40 },
            { value: 67,  label: '13:55', threshold: 40 },  // C2 + batch overlap
            { value: 119, label: '14:00', threshold: 40 },  // alert storm peak
            { value: 97,  label: '14:05', threshold: 40 },  // exfil + cleanup
            { value: 28,  label: '14:10' },
            { value: 18,  label: '14:15' }
        ],

        // Event feed -- chronological incident timeline mixed with false-positive events
        events: [
            { timestamp: '12:35:18', source: 'ids',           message: 'POLICY alert: Large transfer from BACKUP-SRV-01 (10.10.1.200) on port 9090 -- 36+ GB backup traffic' },
            { timestamp: '13:00:12', source: 'nessus-agent',  message: 'Authorized scan SCAN-20260422-VF-WEEKLY started from SEC-SCAN-01 (10.10.5.77) against 10.10.0.0/16' },
            { timestamp: '13:00:14', source: 'ids',           message: 'SCAN alerts firing: ET SCAN SSH/HTTP/RDP from 10.10.5.77 -- high volume SYN sweep' },
            { timestamp: '13:45:01', source: 'batch-agent',   message: 'ACH wire-transfer batch JOB-20260422-EOD started from APP-PAY-02 (10.10.3.44) to INT-CORE-01 (10.10.1.10)' },
            { timestamp: '13:45:06', source: 'ids',           message: 'POLICY alert: Anomalous large transfer 10.10.3.44 -> 10.10.1.10 DPT=443 BYTES=52428800' },
            { timestamp: '13:58:02', source: 'ids',           message: 'CRITICAL: ET MALWARE Cobalt Strike Beacon -- 10.10.20.31:49201 -> 203.0.113.88:443' },
            { timestamp: '13:58:02', source: 'firewall',      message: 'Outbound TCP 443: SRC=10.10.20.31 DST=203.0.113.88 BYTES=842 (external, non-approved dest)' },
            { timestamp: '13:59:02', source: 'ids',           message: 'CRITICAL: ET MALWARE Cobalt Strike Beacon -- 10.10.20.31:49214 -> 203.0.113.88:443' },
            { timestamp: '14:00:02', source: 'ids',           message: 'CRITICAL: ET MALWARE Cobalt Strike Beacon -- 10.10.20.31:49228 -> 203.0.113.88:443' },
            { timestamp: '14:01:02', source: 'ids',           message: 'CRITICAL: ET MALWARE Cobalt Strike Beacon -- 10.10.20.31:49241 -> 203.0.113.88:443' },
            { timestamp: '14:01:30', source: 'veeam',         message: 'Full backup VERIDIAN-FULL-20260422: 91% complete -- expected completion 14:20 UTC' },
            { timestamp: '14:02:02', source: 'ids',           message: 'CRITICAL: ET MALWARE Cobalt Strike Beacon -- 10.10.20.31:49255 -> 203.0.113.88:443' },
            { timestamp: '14:03:18', source: 'ids',           message: 'CRITICAL: ET MALWARE Cobalt Strike Exfiltration via HTTPS -- 10.10.20.31:49270 -> 203.0.113.88:443 BYTES=5242880' },
            { timestamp: '14:03:18', source: 'firewall',      message: 'Outbound TCP 443: SRC=10.10.20.31 DST=203.0.113.88 BYTES=5242880 (exfil volume -- 5 MB)' },
            { timestamp: '14:04:01', source: 'batch-agent',   message: 'ACH batch JOB-20260422-EOD completed normally: 52.1 MB transferred to INT-CORE-01' }
        ],

        // Alerts -- all seven SIEM alerts active at peak of alert storm.
        // Three are false positives; one is the real incident (multiple correlated alerts).
        alerts: [
            { name: 'BACKUP-LARGE-TRANSFER',      severity: 'low',      sourceIP: '10.10.1.200', description: 'POLICY: Large data transfer on port 9090 from BACKUP-SRV-01. 38+ GB. Consistent with scheduled Veeam full backup job. Check CMDB for schedule.' },
            { name: 'VULN-SCAN-SWEEP',            severity: 'medium',   sourceIP: '10.10.5.77',  description: 'ET SCAN: High-volume SYN sweep across 10.10.0.0/16 from 10.10.5.77. Port range 1-65535. Consistent with vulnerability scanner pattern. Verify against CMDB.' },
            { name: 'PAYMENT-BATCH-TRANSFER',     severity: 'low',      sourceIP: '10.10.3.44',  description: 'POLICY: Anomalous large internal transfer from APP-PAY-02 to INT-CORE-01 on port 443. 50+ MB. Consistent with scheduled ACH wire-transfer settlement batch.' },
            { name: 'C2-BEACON-DETECTED',         severity: 'critical', sourceIP: '10.10.20.31', description: 'ET MALWARE: Cobalt Strike Beacon signature matched. Internal host 10.10.20.31 sending periodic 842-byte outbound connections to 203.0.113.88:443 at ~60-second intervals. 5 occurrences in 5 minutes. NOT in CMDB.' },
            { name: 'EXFIL-HTTPS-DETECTED',       severity: 'critical', sourceIP: '10.10.20.31', description: 'ET MALWARE: Cobalt Strike Exfiltration via HTTPS. Single large outbound flow from 10.10.20.31 to 203.0.113.88:443 with BYTES=5242880 (5 MB). Same destination as C2 beacon. Data loss likely.' },
            { name: 'EXTERNAL-DST-UNRECOGNIZED',  severity: 'high',     sourceIP: '10.10.20.31', description: 'Outbound connection to 203.0.113.88 -- not in approved egress allowlist. Not a CDN, cloud provider, or known-good IP range. Investigate.' },
            { name: 'APP-INT-09-ANOMALOUS-EGRESS', severity: 'high',    sourceIP: '10.10.20.31', description: 'APP-INT-09 (10.10.20.31) has no documented need for external internet access. Application server in Finance tier. Any external outbound from this host is anomalous.' }
        ]
    },

    // =========================================================
    // IDS PANEL DATA (BlueTeam.js IDSPanel device)
    //
    // Mix of true positives, false positives (vuln scan, backup,
    // payment batch), and the real C2/exfil campaign.
    // The attack_signature flag value is embedded in the C2 alerts.
    // =========================================================

    ids: {
        alerts: [
            {
                sid:                   'VF-IDS-5101',
                signature:             'ET POLICY Large Data Transfer on Non-Standard Port',
                severity:              'low',
                timestamp:             '2026-04-22 12:35:22',
                srcIP:                 '10.10.1.200',
                dstIP:                 '10.10.10.50',
                dstPort:               9090,
                detail:                'Large byte-count flow on port 9090 from BACKUP-SRV-01 to backup-repo-01. BYTES=38218924800. Port 9090 is the Veeam data mover port. This matches the scheduled Tuesday full backup window (02:00-14:00 UTC). Check CMDB to confirm BACKUP-SRV-01 authorization.',
                correctClassification: 'fp',
                mitre:                 null
            },
            {
                sid:                   'VF-IDS-5102',
                signature:             'ET SCAN Potential SSH Scan',
                severity:              'medium',
                timestamp:             '2026-04-22 13:00:14',
                srcIP:                 '10.10.5.77',
                dstIP:                 '10.10.20.14',
                dstPort:               22,
                detail:                'High-rate SYN packets from 10.10.5.77 across a broad port range against the 10.10.0.0/16 subnet. Pattern matches Nessus professional scanner behavior. Source IP 10.10.5.77 -- check CMDB for registration status before escalating.',
                correctClassification: 'fp',
                mitre:                 null
            },
            {
                sid:                   'VF-IDS-5103',
                signature:             'ET POLICY Anomalous Large Internal Transfer',
                severity:              'low',
                timestamp:             '2026-04-22 13:45:06',
                srcIP:                 '10.10.3.44',
                dstIP:                 '10.10.1.10',
                dstPort:               443,
                detail:                'Large TLS-encrypted transfer from APP-PAY-02 (10.10.3.44) to INT-CORE-01 (10.10.1.10). BYTES=52428800. Both source and destination are internal RFC1918 addresses. Pattern consistent with end-of-day payment settlement batch. Check CMDB for confirmation.',
                correctClassification: 'fp',
                mitre:                 null
            },
            {
                // *** attack_signature FLAG VALUE is in this alert's signature field ***
                sid:                   'VF-IDS-5104',
                signature:             'ET MALWARE Cobalt Strike Beacon',
                severity:              'critical',
                timestamp:             '2026-04-22 13:58:02',
                srcIP:                 '10.10.20.31',
                dstIP:                 '203.0.113.88',
                dstPort:               443,
                detail:                'Suricata SID 2019401 matched: known Cobalt Strike default beacon traffic pattern. Small fixed-size payload (842 bytes), connection initiates every ~60 seconds, destination IP 203.0.113.88 has no approved egress entry. Source is APP-INT-09 (10.10.20.31) -- a Finance-tier application server with no documented need for external access.',
                correctClassification: 'tp',
                mitre:                 'T1071.001'
            },
            {
                sid:                   'VF-IDS-5108',
                signature:             'ET MALWARE Cobalt Strike Exfiltration via HTTPS',
                severity:              'critical',
                timestamp:             '2026-04-22 14:03:18',
                srcIP:                 '10.10.20.31',
                dstIP:                 '203.0.113.88',
                dstPort:               443,
                detail:                'Suricata SID 2019402 matched: data exfiltration pattern following Cobalt Strike C2 beacon channel. Single large HTTPS flow from same internal source (10.10.20.31) to same external destination (203.0.113.88). BYTES=5242880. Volume is 5 MB in a 26-second window -- consistent with automated staging and exfiltration.',
                correctClassification: 'tp',
                mitre:                 'T1041'
            }
        ]
    },

    // =========================================================
    // FIREWALL MANAGER DATA (BlueTeam.js FirewallManager device)
    //
    // Overly permissive rules: no explicit block on 203.0.113.88.
    // No explicit egress restriction on Finance-tier hosts.
    // Students can inspect current rules to see the gap.
    // =========================================================

    firewall: {
        rules: [
            { chain: 'INPUT',   src: '0.0.0.0/0',       dst: '10.10.0.0/16', port: '80',   protocol: 'tcp', action: 'ACCEPT' },
            { chain: 'INPUT',   src: '0.0.0.0/0',       dst: '10.10.0.0/16', port: '443',  protocol: 'tcp', action: 'ACCEPT' },
            { chain: 'INPUT',   src: '0.0.0.0/0',       dst: '10.10.0.0/16', port: '22',   protocol: 'tcp', action: 'ACCEPT' },
            { chain: 'OUTPUT',  src: '10.10.0.0/16',    dst: '0.0.0.0/0',    port: 'any',  protocol: 'any', action: 'ACCEPT' },
            { chain: 'FORWARD', src: '10.10.0.0/16',    dst: '0.0.0.0/0',    port: 'any',  protocol: 'any', action: 'ACCEPT' },
            { chain: 'INPUT',   src: '10.10.5.77/32',   dst: '10.10.0.0/16', port: 'any',  protocol: 'any', action: 'ACCEPT' }
        ]
    },

    // =========================================================
    // FLAGS
    //
    // All five flags are find-and-submit: the student discovers
    // the exact value from device data and types it into the Submit
    // Flag panel. BoxEngine validates against Firestore
    // flag_registry/{boxId}/flags/{flagId}.
    //
    // FIRESTORE SEEDING (flag_registry/shield-sp-blueteam-siem-triage):
    //   c2_ip            -> 203.0.113.88
    //   beaconing_host   -> 10.10.20.31
    //   attack_signature -> ET MALWARE Cobalt Strike Beacon
    //   fp_source_ip     -> 10.10.5.77
    //   exfil_bytes      -> 5242880
    // =========================================================

    flags: [
        {
            id:          'c2_ip',
            points:      100,
            label:       'External C2 IP Address',
            description: 'The external IP address the internal host is beaconing to and exfiltrating data through. Submit the raw IP (no port).'
        },
        {
            id:          'beaconing_host',
            points:      150,
            label:       'Internal Beaconing Host IP',
            description: 'The internal RFC1918 IP address of the compromised host that is initiating the C2 beacon. You must discover this from the device data -- it is not named in the briefing.'
        },
        {
            id:          'attack_signature',
            points:      150,
            label:       'IDS C2 Beacon Signature',
            description: 'The exact IDS signature name that triggered on the C2 beacon traffic. Read it from the IDS alert. Submit the exact string including all punctuation and spacing.'
        },
        {
            id:          'fp_source_ip',
            points:      100,
            label:       'False Positive Source IP',
            description: 'The IP address of the authorized vulnerability scanner whose traffic generated false-positive IDS alerts. Confirm it is authorized by checking the CMDB file in the case.'
        },
        {
            id:          'exfil_bytes',
            points:      200,
            label:       'Exfiltration Byte Count',
            description: 'The exact BYTES field value in the firewall log and IDS exfil alert for the outbound exfiltration flow. Submit the raw integer -- no commas, no units.'
        }
    ],

    // =========================================================
    // SCORING
    // =========================================================

    scoring: {
        base:              1000,
        minScore:          0,
        maxScore:          700,
        hintPenalty:       true,
        wrongFlagPenalty:  -25,
        speedBonus:        { threshold: 1800000, points: 100 },
        timeBonusThreshold: 2400
    },

    // =========================================================
    // HINTS
    //
    // Progressive: first two hints give strategy, third gives an
    // exact command. Only the LAST hint per flag may reveal via
    // {{FLAG:id}} (largest penalty -- confirms the answer).
    // =========================================================

    hints: [

        // ── c2_ip ─────────────────────────────────────────────
        {
            id:      'hint_c2_ip_1',
            flagId:  'c2_ip',
            text:    'The C2 IP is an external address -- RFC5737 documentation range. Start with the IDS panel: look for CRITICAL alerts with an external destination IP. Then cross-reference in the firewall log. The same IP appears as DST in every C2-related entry.',
            cost:    25,
            penalty: -25
        },
        {
            id:      'hint_c2_ip_2',
            flagId:  'c2_ip',
            text:    'Run: grep "ET MALWARE" /var/log/ids/alerts.log\n\nEvery matching line shows the flow as "SRC=<internal> -> DST=<external>". The external IP listed as DST in those beacon alert lines is the C2 server. Cross-reference that same IP as DST in the firewall log to confirm.',
            cost:    50,
            penalty: -50
        },
        {
            id:      'hint_c2_ip_3',
            flagId:  'c2_ip',
            text:    'The external C2 address is in the 203.0.113.0/24 documentation block (RFC5737). It appears as DST in every beacon and exfil IDS alert, and as DST in the corresponding firewall ALLOW OUT lines.\n\nThe value to submit: {{FLAG:c2_ip}}',
            cost:    75,
            penalty: -75
        },

        // ── beaconing_host ────────────────────────────────────
        {
            id:      'hint_beacon_host_1',
            flagId:  'beaconing_host',
            text:    'The internal host beaconing out is NOT named in any briefing, lore, or notes section. You must find it by examining which internal IP is the SRC in the C2 beacon IDS alerts and firewall flows. Look for a 10.10.x.x address repeatedly connecting to the same external IP at regular intervals.',
            cost:    25,
            penalty: -25
        },
        {
            id:      'hint_beacon_host_2',
            flagId:  'beaconing_host',
            text:    'Run: grep "Beacon" /var/log/ids/alerts.log\n\nEvery matching beacon alert has a SRC= field. The internal address that appears as SRC on the five identical-interval beacon alerts is the compromised host.',
            cost:    50,
            penalty: -50
        },
        {
            id:      'hint_beacon_host_3',
            flagId:  'beaconing_host',
            text:    'The beaconing host is on the 10.10.20.0/24 subnet (Finance application tier). Run: grep "Beacon" /var/log/ids/alerts.log and read the internal SRC host on the repeating beacon alerts.\n\nThe value to submit: {{FLAG:beaconing_host}}',
            cost:    75,
            penalty: -75
        },

        // ── attack_signature ──────────────────────────────────
        {
            id:      'hint_sig_1',
            flagId:  'attack_signature',
            text:    'The IDS signature name is the exact string that appears in the signature field of the C2 beacon alert. Open the IDS Panel and read the critical-severity alert about the C2 channel. The signature is the full human-readable name of the Suricata rule that fired.',
            cost:    25,
            penalty: -25
        },
        {
            id:      'hint_sig_2',
            flagId:  'attack_signature',
            text:    'Run: grep "beacon" /var/log/ids/alerts.log\n\nEach matching line contains the signature in the [**] brackets after the SID. Copy the exact text between the first and second [**] pairs. Spacing and punctuation must be exact.',
            cost:    50,
            penalty: -50
        },
        {
            id:      'hint_sig_3',
            flagId:  'attack_signature',
            text:    'The Suricata rule name in the alerts.log is formatted as: ET MALWARE [tool name] [behavior]. Copy it exactly as shown in the IDS alert for SID 2019401.\n\nThe value to submit: {{FLAG:attack_signature}}',
            cost:    75,
            penalty: -75
        },

        // ── fp_source_ip ──────────────────────────────────────
        {
            id:      'hint_fp_1',
            flagId:  'fp_source_ip',
            text:    'One of the seven SIEM alerts is from an authorized vulnerability scanner. The way to confirm it is authorized is to look up its source IP in the CMDB. The CMDB is a file on this analyst workstation. Read it and find the registered scanner entry.',
            cost:    25,
            penalty: -25
        },
        {
            id:      'hint_fp_2',
            flagId:  'fp_source_ip',
            text:    'Run: cat /home/analyst/cmdb.txt\n\nLook for the "Authorized Security Tools" section. One entry is the vulnerability scanner with a specific IP address. That IP is also the source in the ET SCAN alerts in the IDS log. Matching CMDB IP to IDS source IP confirms it is a false positive.',
            cost:    50,
            penalty: -50
        },
        {
            id:      'hint_fp_3',
            flagId:  'fp_source_ip',
            text:    'The authorized scanner is a Nessus Professional instance. Its IP appears in the CMDB under the "Nessus Professional Scanner" asset entry and matches the SRC IP in the ET SCAN IDS alerts.\n\nThe value to submit: {{FLAG:fp_source_ip}}',
            cost:    75,
            penalty: -75
        },

        // ── exfil_bytes ───────────────────────────────────────
        {
            id:      'hint_exfil_1',
            flagId:  'exfil_bytes',
            text:    'The exfiltration byte count is in two places: the firewall ALLOW OUT log line for the large single flow, and the IDS exfil alert. Look for the flow from the beaconing host to the C2 IP that is significantly larger than the 842-byte beacon flows. That larger BYTES value is the flag.',
            cost:    25,
            penalty: -25
        },
        {
            id:      'hint_exfil_2',
            flagId:  'exfil_bytes',
            text:    'Run: grep "Exfiltration" /var/log/ids/alerts.log\n\nThe Cobalt Strike Exfiltration alert shows the BYTES value of the single large outbound flow -- that is the exfiltration total. It is also the largest BYTES= value in /var/log/firewall.log.',
            cost:    50,
            penalty: -50
        },
        {
            id:      'hint_exfil_3',
            flagId:  'exfil_bytes',
            text:    'The exfil flow BYTES value is a raw integer. Read it directly from the firewall log exfil line or the IDS exfil alert -- do not convert or round. Submit the exact integer (no commas, no units, no "bytes" suffix).\n\nThe value to submit: {{FLAG:exfil_bytes}}',
            cost:    75,
            penalty: -75
        }
    ],

    // =========================================================
    // CERT OBJECTIVES (assessment mode compatibility)
    //
    // certObjectives.mappings is the live format (flat array under
    // certObjectives) -- NOT a standalone objectiveMappings block.
    // =========================================================

    certObjectives: {
        certPath: 'CompTIA Security+ SY0-701',
        mappings: [
            { flagId: 'c2_ip',            objective: '4.2', description: 'Explain threat intelligence and threat hunting concepts -- analyzing network indicators of compromise', skill: 'C2 IP identification from IDS and firewall log correlation' },
            { flagId: 'beaconing_host',   objective: '4.4', description: 'Explain security alerting and monitoring concepts -- anomaly detection', skill: 'Identifying internal compromised host via beacon interval pattern analysis' },
            { flagId: 'attack_signature', objective: '4.4', description: 'Explain security alerting and monitoring concepts -- IDS/IPS rule sets', skill: 'Reading and interpreting IDS signature names from Suricata alert output' },
            { flagId: 'fp_source_ip',     objective: '4.8', description: 'Explain appropriate incident response activities -- alert triage and false positive identification', skill: 'False positive confirmation using CMDB cross-reference against IDS source IP' },
            { flagId: 'exfil_bytes',      objective: '4.8', description: 'Explain appropriate incident response activities -- data loss scoping', skill: 'Firewall flow log analysis to quantify data exfiltration volume' }
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
// Use window.VFSTConfig -- the bare name is not in scope after the window= assignment.
if (window.VFSTConfig) window.VFSTConfig.resetState();
