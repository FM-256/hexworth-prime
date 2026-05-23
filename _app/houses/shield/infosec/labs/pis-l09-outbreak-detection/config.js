/* ============================================================
   PIS-L09: Outbreak Detection
   Principles of Information Security -- CTF Lab
   SIEM triage: 200+ alerts, identify 3 real incidents,
   correlate evidence, file accurate incident reports
   SY0-701: 4.1, 4.2, 4.5
   ============================================================ */

const PISL09Config = {

    // =========================================================
    // BOX METADATA
    // =========================================================

    title: 'Outbreak Detection',
    subtitle: 'Hexworth Containment -- SIEM Triage Operations',
    description: 'The facility SIEM is showing 227 alerts from the last 24 hours. Most are noise. Three are real incidents. Triage the alerts, identify the real threats, correlate evidence across sources, and file accurate incident reports with correct severity and classification.',
    difficulty: 'Intermediate',
    estimatedTime: 45,
    accent: '#ef4444',
    storageKey: 'hexworth_lab_pis_l09',
    registryId: 'pis-l09-outbreak-detection',
    trackerKey: 'lab_pis_l09',

    // =========================================================
    // BOOT SEQUENCE
    // =========================================================

    boot: {
        biosLines: [
            'HEXWORTH CONTAINMENT WORKSTATION v4.2.1',
            'SIEM Analyst Terminal -- BSL-3 Clearance',
            'Splunk Enterprise 9.2 (simulated): LOADED',
            'Alert queue: 227 unacknowledged events',
            'Threat intelligence feed: CONNECTED',
            'Incident tracking system: ONLINE'
        ],
        grubEntries: [
            'Containment Analyst OS 22.04 LTS',
            'Containment Analyst OS (recovery mode)'
        ],
        loginUser: 'analyst'
    },

    // =========================================================
    // LORE
    // =========================================================

    lore: {
        intro: 'It is 06:00. You are the morning analyst. The overnight SIEM queue has 227 unacknowledged alerts. Standard facility traffic generates about 200 false positives per day from routine scans, test traffic, and misconfigured sensors. Buried in the noise are three real incidents that occurred last night. If you do not identify and report them before the morning briefing at 08:00, response will be delayed by 24 hours -- and in containment operations, 24 hours is too long.',
        scenario: 'Use the siem command to see all alerts. Use alert <id> to read full details. Use correlate to link related alerts. Use classify to mark each real incident with its severity and type. Use report to file the formal incident report once all three are identified. Not every alert that looks interesting is real -- read the full details carefully. Focus on indicators: C2 beaconing, data exfiltration volume, unauthorized access patterns, not just anomaly scores.',
        outro: 'All three real incidents identified and reported. The morning briefing will now include the correct threat picture. SOC team dispatched. This is the daily reality of SIEM work: most signals are noise. The analyst who can triage accurately -- separating real threats from misconfigured sensors and false positives -- is the most valuable person in the SOC. Speed matters, but a wrong classification is worse than a late one.',

        goals: [
            "Triage 227 SIEM alerts and find the 3 real incidents buried in ~200 false positives",
            "Read full alert detail -- anomaly score alone is not signal; specific indicators (C2 beacon, exfil volume, unauth access) are",
            "Use correlation to link alerts that describe the same incident from different sensors",
            "Classify each real incident with correct severity and incident type (ransomware, exfil, credential abuse, etc.)",
            "File a formal incident report that downstream responders can act on without re-triaging the whole queue"
        ],

        toolkit: [
            { name: "siem", purpose: "Show the SIEM alert queue with summary status (new / acknowledged / classified)", sample: "siem" },
            { name: "alert", purpose: "Open a specific alert and read its full detail (timestamps, IOCs, raw event)", sample: "alert ALR-1138" },
            { name: "correlate", purpose: "Group alerts that appear to describe the same incident", sample: "correlate ALR-1138 ALR-1142" },
            { name: "classify", purpose: "Mark an alert (or correlated cluster) as a real incident with severity + type", sample: "classify ALR-1138 high ransomware" },
            { name: "report", purpose: "File the formal incident report covering all classified incidents", sample: "report" },
            { name: "help", purpose: "Command reference", sample: "help" }
        ]
    },

    // =========================================================
    // TERMINAL CONFIG
    // =========================================================

    terminal: {
        user: 'analyst',
        hostname: 'siem-ws-01',
        startDir: '/home/analyst',
        welcome: 'Hexworth Containment -- SIEM Analyst Terminal\nBSL-3 Clearance Active\n\n*** ALERT QUEUE: 227 UNACKNOWLEDGED EVENTS ***\n  Time range: 2026-04-08T06:00Z to 2026-04-09T06:00Z\n  Priority breakdown: CRITICAL(2) HIGH(11) MEDIUM(47) LOW(167)\n\nMorning briefing: 08:00Z -- you have 2 hours.\nThree real incidents are in this queue.\n\nCommands:\n  siem                     Show alert summary\n  alert <id>               Read full alert details\n  correlate <id1> <id2>    Link related alerts\n  classify <id> <sev> <type>  Mark alert classification\n  report                   File incident report\n\nType "help" for full reference.\n'
    },

    // =========================================================
    // DESKTOP ICONS
    // =========================================================

    desktop: {
        icons: [
            { id: 'briefing', label: 'Briefing',    icon: '\uD83D\uDCCB',    app: 'briefing' },
            { id: 'terminal', label: 'Terminal',    icon: '\uD83D\uDDA5\uFE0F', app: 'terminal' },
            { id: 'notes',    label: 'Notes',       icon: '\uD83D\uDCDD',    app: 'notes'    },
            { id: 'hints',    label: 'Hints',       icon: '\uD83D\uDCA1',    app: 'hints'    },
            { id: 'flags',    label: 'Submit Flag', icon: '\uD83D\uDEA9',    app: 'flags'    }
        ]
    },

    // Custom desktop-icon dispatch \u2014 invoked by BoxEngine's `default:` extension
    // hook (BoxEngine.js:1110-1115) for any icon whose `app` is not built-in.
    onAppLaunch: function(iconDef, engine) {
        if (iconDef && iconDef.app === 'briefing') {
            // Re-summon \u2014 bypass skip-next-time storage; lab is already running
            // so the launch callback is a no-op.
            BriefingPage.show(this, function() {}, { force: true });
        }
    },

    // =========================================================
    // SIMULATED FILESYSTEM
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
                                'notes.txt': {
                                    type: 'file',
                                    content: 'SIEM TRIAGE NOTES\n==================\n\nINCIDENT CLASSIFICATION GUIDE:\n\nSeverity levels:\n  critical  -- Active breach, data leaving facility, containment failure\n  high      -- Confirmed malicious activity, not yet spreading\n  medium    -- Suspicious but unconfirmed, requires investigation\n  low       -- Anomaly only, likely benign\n\nIncident types:\n  data-exfil         Data exfiltration -- unauthorized data leaving facility\n  lateral-movement   Attacker moving between systems\n  c2-beacon          Command and control communication\n  brute-force        Authentication attack\n  malware            Malware execution or persistence\n  policy-violation   Authorized user violating containment policy\n  false-positive     Not a real incident\n\nKEY TRIAGE FACTORS:\n  1. Volume/pattern of traffic (random vs regular interval = beaconing)\n  2. Destination reputation (internal vs external, known bad IPs)\n  3. Data volume (bytes transferred vs normal baseline)\n  4. User/system context (should this system be doing this?)\n  5. Correlation (does it connect to other alerts?)\n\nNOISE SOURCES (common FP causes):\n  - Vulnerability scanner at 02:00 daily (trips many rules)\n  - Backup jobs at 03:00 (large data transfers, looks like exfil)\n  - NTP sync events (looks like periodic outbound connections)\n  - Antivirus signature updates (spike in outbound traffic)\n  - Lab equipment self-checks (generates unusual protocol traffic)\n'
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'siem\nalert ALT-001\nalert ALT-002\n'
                                }
                            }
                        }
                    }
                }
            }
        }
    },

    // =========================================================
    // INTERNAL STATE
    // =========================================================

    _state: {
        classifications: {},    // alertId -> { severity, type }
        correlations: [],       // [[id1, id2], ...]
        reportFiled: false
    },

    // The three real incidents -- IDs the analyst must find and correctly classify
    _realIncidents: {
        'ALT-023': { severity: 'critical', type: 'data-exfil' },
        'ALT-071': { severity: 'high',     type: 'c2-beacon'  },
        'ALT-158': { severity: 'medium',   type: 'lateral-movement' }
    },

    _flag1Awarded: false,
    _flag2Awarded: false,

    // =========================================================
    // ALERT DATA
    // =========================================================

    // Full alert details indexed by ID
    _alerts: {

        // ---- REAL INCIDENT 1: Data Exfiltration (ALT-023) ----
        'ALT-023': {
            id: 'ALT-023',
            time: '2026-04-08T23:14:37Z',
            source: 'specimen-db-01.hexworth.internal',
            rule: 'OUTBOUND_LARGE_TRANSFER',
            priority: 'CRITICAL',
            score: 94,
            summary: 'Large outbound data transfer to external IP',
            detail: `ALERT DETAIL -- ALT-023
${'='.repeat(55)}
Time:      2026-04-08T23:14:37Z to 23:47:22Z
Source:    specimen-db-01.hexworth.internal (10.0.1.15)
Dest:      91.108.4.123 (AS48166 -- German VPS, Franfurt)
Protocol:  HTTPS (port 443)
Duration:  32 minutes, 45 seconds
Data Out:  4.7 GB (outbound)
Data In:   12 KB (inbound)

CORRELATED EVENTS:
  ALT-024: User 'analyst-07' logged in at 23:09Z from unusual IP
  ALT-025: Database query spike at 23:13Z (148 large SELECT queries)
  ALT-026: DNS lookup for 91.108.4.123 from specimen-db-01 at 23:14Z

ANALYSIS:
  Normal outbound from this host: <50 MB/day
  4.7 GB in 33 minutes = 24 MB/s sustained -- far above baseline
  Destination 91.108.4.123 not in approved outbound list
  TI feed: 91.108.4.123 -- FLAGGED (APT infrastructure, seen in 3 prior campaigns)
  Database queries preceded transfer by 60 seconds (exfil pattern)
  Account 'analyst-07' has BSL-3 access -- can access specimen records

FORENSIC INDICATORS:
  Transfer completed before detection (full exfil likely)
  SSL cert on 91.108.4.123: self-signed, issued 3 days ago
  No business justification on file for this transfer
  Account analyst-07 credentials may be compromised`
        },

        // ---- REAL INCIDENT 2: C2 Beacon (ALT-071) ----
        'ALT-071': {
            id: 'ALT-071',
            time: '2026-04-08T18:00:01Z',
            source: 'lab2-ws-04.hexworth.internal',
            rule: 'PERIODIC_OUTBOUND_BEACON',
            priority: 'HIGH',
            score: 81,
            summary: 'Periodic outbound connection -- possible C2 beacon',
            detail: `ALERT DETAIL -- ALT-071
${'='.repeat(55)}
Time:      First seen 2026-04-08T18:00:01Z
Source:    lab2-ws-04.hexworth.internal (10.0.2.14)
Dest:      185.220.101.47 (TOR exit node, AS205100)
Protocol:  TCP port 4444
Duration:  Ongoing -- 12 hours observed
Beacon interval: Every 60 seconds (+/- 2s jitter)

BEACON ANALYSIS:
  Connections observed: 718 over 12-hour window
  Interval consistency: 99.7% within 60s +/- 2s
  Payload size: 256-512 bytes per beacon (encrypted)
  Direction: Mostly outbound (check-in pattern, not bulk transfer)

CORRELATED EVENTS:
  ALT-072: Process 'svchost32.exe' created in %APPDATA% at 17:58Z
  ALT-073: Email attachment opened on lab2-ws-04 at 17:55Z (invoice_Q1.exe)
  ALT-074: New scheduled task created at 17:59Z (persistence mechanism)

TI FEED:
  185.220.101.47 -- KNOWN BAD (TOR exit, seen in ransomware campaigns)
  Port 4444 -- commonly used by Metasploit, Cobalt Strike payloads
  Beacon pattern matches APT-33 tooling (HEXREC-2026-0401)

ANALYSIS:
  This matches textbook RAT behavior: initial infection via email attachment,
  persistence via scheduled task, regular C2 check-in.
  System has been compromised for approximately 12 hours.
  No bulk data transfer yet -- C2 in command-receive phase.`
        },

        // ---- REAL INCIDENT 3: Lateral Movement (ALT-158) ----
        'ALT-158': {
            id: 'ALT-158',
            time: '2026-04-09T02:33:11Z',
            source: 'lab1-ws-02.hexworth.internal',
            rule: 'INTERNAL_AUTH_SWEEP',
            priority: 'MEDIUM',
            score: 67,
            summary: 'Internal authentication sweep -- possible lateral movement',
            detail: `ALERT DETAIL -- ALT-158
${'='.repeat(55)}
Time:      2026-04-09T02:33:11Z to 02:41:55Z
Source:    lab1-ws-02.hexworth.internal (10.0.1.12)
Targets:   Multiple internal systems (see below)
Protocol:  SMB (TCP 445), WinRM (TCP 5985), RDP (TCP 3389)

AUTHENTICATION ATTEMPTS:
  10.0.1.12 --> 10.0.2.10  SMB  user:HEXWORTH\\analyst-12  FAILED
  10.0.1.12 --> 10.0.2.11  SMB  user:HEXWORTH\\analyst-12  FAILED
  10.0.1.12 --> 10.0.3.10  SMB  user:HEXWORTH\\admin-svc   SUCCESS
  10.0.1.12 --> 10.0.4.15  RDP  user:HEXWORTH\\admin-svc   SUCCESS
  10.0.1.12 --> 10.0.5.12  WinRM user:HEXWORTH\\admin-svc  SUCCESS
  10.0.1.12 --> 10.0.100.10 SMB  user:HEXWORTH\\admin-svc  SUCCESS

TIMELINE:
  02:33 -- First SMB attempt begins
  02:35 -- First success with admin-svc credentials
  02:41 -- 4 systems accessed, interactive session established

CORRELATED EVENTS:
  ALT-071: lab2-ws-04 C2 beacon (active since 18:00)
  ALT-159: admin-svc password accessed from LSASS on lab2-ws-04 at 02:31Z
  ALT-160: lab1-ws-02 received remote command from lab2-ws-04 at 02:32Z

ANALYSIS:
  This is a continuation of the lab2-ws-04 compromise (ALT-071).
  Attacker dumped credentials from lab2-ws-04 LSASS, obtained admin-svc.
  Now using those credentials to authenticate to other lab systems.
  Classic pass-the-hash / credential use lateral movement pattern.
  admin-svc has privileged access across all lab segments.`
        },

        // ---- FALSE POSITIVES (representative sample shown by siem command) ----
        'ALT-001': {
            id: 'ALT-001', time: '2026-04-09T02:00:14Z', source: 'vuln-scanner-01',
            rule: 'PORT_SCAN_INTERNAL', priority: 'LOW', score: 22,
            summary: 'Internal port scan detected',
            detail: 'ALERT DETAIL -- ALT-001\n' + '='.repeat(55) + '\nSource: vuln-scanner-01.hexworth.internal\nTarget: 10.0.0.0/16 (full subnet sweep)\nTime: 02:00:14Z\nPorts: 1-65535\n\nANALYSIS:\nThis is the scheduled nightly vulnerability scan.\nScheduled daily at 02:00 UTC by Nessus Professional.\nNo findings -- routine authorized scan.\nExpected duration: 45-60 minutes.\n\nDISPOSITION: FALSE POSITIVE -- Scheduled scan activity.'
        },
        'ALT-002': {
            id: 'ALT-002', time: '2026-04-09T03:01:22Z', source: 'backup-srv-01',
            rule: 'OUTBOUND_LARGE_TRANSFER', priority: 'LOW', score: 31,
            summary: 'Large outbound transfer -- backup destination',
            detail: 'ALERT DETAIL -- ALT-002\n' + '='.repeat(55) + '\nSource: backup-srv-01 (10.0.100.15)\nDest: backup.hexworth-offsite.internal (10.0.200.5)\nData: 847 GB\nTime: 03:00:00Z - 05:14:22Z\n\nANALYSIS:\nNightly backup to offsite storage.\nScheduled job -- backup-srv-01 to backup.hexworth-offsite.internal.\nDestination is on the approved transfer list (INC-0000-APPROVED).\nThis fires OUTBOUND_LARGE_TRANSFER but destination is internal/approved.\n\nDISPOSITION: FALSE POSITIVE -- Approved backup job.'
        },
        'ALT-045': {
            id: 'ALT-045', time: '2026-04-08T12:00:00Z', source: 'lab5-ws-01',
            rule: 'PERIODIC_OUTBOUND_CONNECTION', priority: 'LOW', score: 18,
            summary: 'Periodic outbound connection to time server',
            detail: 'ALERT DETAIL -- ALT-045\n' + '='.repeat(55) + '\nSource: lab5-ws-01 (10.0.5.10)\nDest: 216.239.35.0 (Google time server, NTP)\nProtocol: UDP 123 (NTP)\nInterval: Every 64 seconds\n\nANALYSIS:\nNTP synchronization traffic. This is expected behavior.\nAll facility systems sync time via NTP per policy.\nInterval of 64 seconds is standard NTP backoff.\nTraffic volume: 48 bytes per sync (NTP packet size).\n\nDISPOSITION: FALSE POSITIVE -- Normal NTP activity.'
        },
        'ALT-099': {
            id: 'ALT-099', time: '2026-04-08T22:00:00Z', source: 'lab3-ws-09',
            rule: 'ANTIVIRUS_SIGNATURE_UPDATE', priority: 'LOW', score: 15,
            summary: 'AV signature update -- elevated outbound traffic',
            detail: 'ALERT DETAIL -- ALT-099\n' + '='.repeat(55) + '\nSource: lab3-ws-09 (10.0.3.19)\nDest: update.av-vendor.com (45.33.32.156)\nData: 2.1 GB\nTime: 22:00:01Z\n\nANALYSIS:\nScheduled antivirus definition update.\nDestination is on the approved AV update server list.\n2.1 GB is consistent with a full definition update package.\nOccurs every Tuesday at 22:00 UTC per policy.\n\nDISPOSITION: FALSE POSITIVE -- Scheduled AV update.'
        },
        'ALT-112': {
            id: 'ALT-112', time: '2026-04-08T14:30:00Z', source: 'lab1-ws-07',
            rule: 'FAILED_AUTH_MULTIPLE', priority: 'MEDIUM', score: 55,
            summary: 'Multiple failed authentication attempts',
            detail: 'ALERT DETAIL -- ALT-112\n' + '='.repeat(55) + '\nSource: lab1-ws-07 (10.0.1.17)\nTarget: ldap.hexworth.internal\nFailed attempts: 6 within 5 minutes\nUser: analyst-03\nTime: 14:30:15Z\n\nANALYSIS:\nanalyst-03 locked out after password change yesterday.\nHelp desk ticket #HD-2026-0408-1142 was filed at 14:32.\nUser confirmed locked out due to cached credentials on mobile device.\nPassword reset completed at 14:45.\nNo indicators of external actor involvement.\n\nDISPOSITION: FALSE POSITIVE -- Self-service lockout from cached creds.'
        }
    },

    // =========================================================
    // TERMINAL COMMANDS
    // =========================================================

    commands: {

        // siem -- show alert summary dashboard
        'siem': function(args, term, engine) {
            return `HEXWORTH CONTAINMENT -- SIEM ALERT QUEUE
${'='.repeat(60)}
Time range: 2026-04-08T06:00Z to 2026-04-09T06:00Z
Total alerts: 227 (showing high-priority sample + notable events)

PRIORITY  ID       TIME              SOURCE                 SCORE  SUMMARY
${'─'.repeat(95)}
CRITICAL  ALT-023  2026-04-08 23:14  specimen-db-01          94    Large outbound transfer to external IP
HIGH      ALT-071  2026-04-08 18:00  lab2-ws-04              81    Periodic outbound -- possible C2 beacon
HIGH      ALT-083  2026-04-08 20:15  fw-perimeter-01         77    Firewall rule triggered -- blocked TOR
HIGH      ALT-091  2026-04-09 00:44  ids-01                  74    Signature: SMB exploit attempt (external)
MEDIUM    ALT-112  2026-04-08 14:30  lab1-ws-07              55    Multiple failed auth attempts
MEDIUM    ALT-133  2026-04-08 16:20  lab4-ws-03              51    Unusual process tree observed
MEDIUM    ALT-158  2026-04-09 02:33  lab1-ws-02              67    Internal auth sweep -- lateral movement?
LOW       ALT-001  2026-04-09 02:00  vuln-scanner-01         22    Port scan (scheduled)
LOW       ALT-002  2026-04-09 03:01  backup-srv-01           31    Large transfer (backup)
LOW       ALT-045  2026-04-08 12:00  lab5-ws-01              18    Periodic connection (NTP)
LOW       ALT-099  2026-04-08 22:00  lab3-ws-09              15    AV update traffic
... 216 more LOW/MEDIUM alerts (routine scanners, NTP, AV updates, lab equipment)

${'─'.repeat(95)}
Classified by you: ${Object.keys(engine.config._state.classifications).length}/3 real incidents identified
Correlations made: ${engine.config._state.correlations.length}

Use "alert <id>" to read full details.
Use "correlate <id1> <id2>" to link related alerts.
Use "classify <id> <severity> <type>" to classify an incident.`;
        },

        // alert <id> -- read full alert details
        'alert': function(args, term, engine) {
            const id = (args[0] || '').toUpperCase();
            if (!id) return 'Usage: alert <alert-id>\nExample: alert ALT-023';

            // Pad the id if needed (alt-23 -> ALT-023)
            const normalizedId = id.replace(/^ALT-(\d+)$/, (m, n) => 'ALT-' + n.padStart(3, '0'));

            const alertData = engine.config._alerts[normalizedId];
            if (!alertData) {
                // Generate a generic low-priority FP for unknown IDs in range
                const num = parseInt(normalizedId.replace('ALT-', ''));
                if (num >= 1 && num <= 227) {
                    return `ALERT DETAIL -- ${normalizedId}\n${'='.repeat(55)}\nTime:      2026-04-08T${String(Math.floor(num/10)).padStart(2,'0')}:${String(num % 60).padStart(2,'0')}:00Z\nSource:    facility-system-${num % 20 + 1}.hexworth.internal\nRule:      ${num % 3 === 0 ? 'NTP_SYNC' : num % 3 === 1 ? 'INTERNAL_SCAN' : 'AV_UPDATE'}\nPriority:  LOW\nScore:     ${10 + (num % 20)}\nSummary:   Routine automated activity\n\nANALYSIS:\nThis is routine facility automation -- ${num % 3 === 0 ? 'NTP time synchronization' : num % 3 === 1 ? 'scheduled vulnerability scan activity' : 'antivirus signature update traffic'}.\nNo indicators of malicious activity. Expected behavior per baseline.\n\nDISPOSITION: FALSE POSITIVE -- Routine automation.`;
                }
                return `Error: Alert ${normalizedId} not found in queue. Valid range: ALT-001 to ALT-227.`;
            }

            return alertData.detail;
        },

        // correlate <id1> <id2> -- link related alerts
        'correlate': function(args, term, engine) {
            const id1 = (args[0] || '').toUpperCase().replace(/^ALT-(\d+)$/, (m, n) => 'ALT-' + n.padStart(3, '0'));
            const id2 = (args[1] || '').toUpperCase().replace(/^ALT-(\d+)$/, (m, n) => 'ALT-' + n.padStart(3, '0'));

            if (!id1 || !id2) {
                return 'Usage: correlate <alert-id1> <alert-id2>\nExample: correlate ALT-071 ALT-158\nThis links two alerts as part of the same incident.';
            }

            if (id1 === id2) return 'Error: Cannot correlate an alert with itself.';

            const alreadyLinked = engine.config._state.correlations.some(pair =>
                (pair[0] === id1 && pair[1] === id2) || (pair[0] === id2 && pair[1] === id1)
            );
            if (alreadyLinked) {
                return `Alerts ${id1} and ${id2} are already correlated.`;
            }

            engine.config._state.correlations.push([id1, id2]);

            // Provide meaningful context for the key real correlations
            if ((id1 === 'ALT-071' && id2 === 'ALT-158') || (id1 === 'ALT-158' && id2 === 'ALT-071')) {
                return `CORRELATION ESTABLISHED: ${id1} <--> ${id2}\n\nThese alerts are related. Analysis:\n  ALT-071: C2 beacon on lab2-ws-04 (active since 18:00)\n  ALT-158: Lateral movement from lab1-ws-02 using admin-svc credentials\n\n  The connection: ALT-159 shows admin-svc credentials were dumped from\n  lab2-ws-04 LSASS at 02:31Z (2 minutes before ALT-158 begins).\n  lab2-ws-04 is the beaconing system. The attacker used the C2 channel\n  to issue credential-dump commands, then pivoted to lab1-ws-02.\n\nThis is a single attack chain: initial access -> C2 -> credential theft -> lateral movement.`;
            }

            if ((id1 === 'ALT-023' && id2 === 'ALT-071') || (id1 === 'ALT-071' && id2 === 'ALT-023')) {
                return `CORRELATION ESTABLISHED: ${id1} <--> ${id2}\n\nPossible connection:\n  ALT-071 (C2 beacon) and ALT-023 (data exfil) share the same threat actor\n  infrastructure in the TI feed. However, they originated from different\n  source systems -- lab2-ws-04 vs specimen-db-01. May be same campaign,\n  different initial access vectors. Both involve APT-33 TOR infrastructure.`;
            }

            return `CORRELATION ESTABLISHED: ${id1} <--> ${id2}\n\nAlerts linked in incident tracking system.\nCorrelations are used to build the incident timeline.\nTotal correlations: ${engine.config._state.correlations.length}`;
        },

        // classify <id> <severity> <type> -- classify an alert as a real incident
        'classify': function(args, term, engine) {
            const id       = (args[0] || '').toUpperCase().replace(/^ALT-(\d+)$/, (m, n) => 'ALT-' + n.padStart(3, '0'));
            const severity = (args[1] || '').toLowerCase();
            const type     = (args[2] || '').toLowerCase();

            const validSeverities = ['critical', 'high', 'medium', 'low'];
            const validTypes = ['data-exfil', 'lateral-movement', 'c2-beacon', 'brute-force', 'malware', 'policy-violation', 'false-positive'];

            if (!id || !severity || !type) {
                return `Usage: classify <alert-id> <severity> <type>\nSeverities: ${validSeverities.join(', ')}\nTypes: ${validTypes.join(', ')}\nExample: classify ALT-023 critical data-exfil`;
            }

            if (!validSeverities.includes(severity)) {
                return `Error: "${severity}" is not a valid severity.\nValid: ${validSeverities.join(', ')}`;
            }

            if (!validTypes.includes(type)) {
                return `Error: "${type}" is not a valid incident type.\nValid: ${validTypes.join(', ')}`;
            }

            const real = engine.config._realIncidents[id];

            if (!real) {
                // Not a real incident -- provide feedback if they classified a known FP
                const knownFps = ['ALT-001', 'ALT-002', 'ALT-045', 'ALT-099', 'ALT-112'];
                if (knownFps.includes(id)) {
                    if (type === 'false-positive') {
                        engine.config._state.classifications[id] = { severity, type, correct: true };
                        return `CLASSIFICATION ACCEPTED -- ${id}\nType: false-positive\nThis alert is a false positive. Good call. It is not one of the 3 real incidents.\nContinue searching -- 3 real incidents are in the queue.`;
                    }
                    return `CLASSIFICATION SUBMITTED -- ${id}\nNote: Review the full alert details again. This alert has documented benign context\n(scheduled automation). Consider: classify ${id} low false-positive`;
                }

                // Unknown/generic alert
                if (type === 'false-positive') {
                    return `CLASSIFICATION ACCEPTED -- ${id}\nType: false-positive\nMarked as noise. Not one of the 3 real incidents.\nContinue investigating the queue.`;
                }

                return `CLASSIFICATION SUBMITTED -- ${id}\nNote: This alert does not match the profile of a real incident.\nVerify with: alert ${id}\nConsider reviewing the indicators more carefully.`;
            }

            // Real incident -- check if correct
            const correctSev  = real.severity;
            const correctType = real.type;

            if (severity !== correctSev || type !== correctType) {
                let feedback = `CLASSIFICATION REQUIRES REVISION -- ${id}\n`;
                if (severity !== correctSev) {
                    feedback += `  Severity mismatch: you said "${severity}" -- review the impact indicators.\n`;
                    feedback += `  Hint: consider data volume, scope of access, and active vs dormant threat.\n`;
                }
                if (type !== correctType) {
                    feedback += `  Type mismatch: you said "${type}" -- review the alert indicators.\n`;
                    feedback += `  Hint: focus on what the system was doing, not just that it was compromised.\n`;
                }
                return feedback;
            }

            engine.config._state.classifications[id] = { severity, type, correct: true };
            const correctCount = Object.values(engine.config._state.classifications).filter(c => c.correct).length;

            let output = `CLASSIFICATION CONFIRMED -- ${id}\n  Severity: ${severity.toUpperCase()}\n  Type:     ${type}\n  Status:   Confirmed real incident -- logged in ITS\n\nReal incidents identified: ${correctCount}/3`;

            if (correctCount >= 3 && !engine.config._flag1Awarded) {
                engine.config._flag1Awarded = true;
                engine.awardFlag('flag1');
                output += '\n\n[DETECTION MILESTONE] All 3 real incidents identified. Flag unlocked.\nNext: file the formal incident report with the "report" command.';
            }

            return output;
        },

        // report -- file the formal incident report
        'report': function(args, term, engine) {
            const correctClassifications = Object.entries(engine.config._state.classifications).filter(([, c]) => c.correct);

            if (correctClassifications.length < 3) {
                return `INCIDENT REPORT -- BLOCKED\nCannot file report until all 3 real incidents are correctly classified.\nCurrent: ${correctClassifications.length}/3 identified.\nUse classify <id> <severity> <type> for each real incident.`;
            }

            if (engine.config._state.reportFiled) {
                return 'Incident report already filed. Check your flags panel.';
            }

            engine.config._state.reportFiled = true;

            const classifications = engine.config._state.classifications;
            const c023 = classifications['ALT-023'];
            const c071 = classifications['ALT-071'];
            const c158 = classifications['ALT-158'];

            let output = `INCIDENT REPORT FILED -- HEXWORTH CONTAINMENT SOC
${'='.repeat(60)}
Report ID:   INC-2026-0409-001
Filed:       2026-04-09T06:00Z
Analyst:     analyst (you)
Reviewed:    227 alerts over 24-hour period

CONFIRMED INCIDENTS:

  INCIDENT 1: ALT-023
  Severity:  ${c023.severity.toUpperCase()}
  Type:      ${c023.type}
  System:    specimen-db-01.hexworth.internal
  Summary:   4.7 GB of specimen data exfiltrated to known APT
             infrastructure (91.108.4.123) over 33 minutes.
             Account analyst-07 credentials appear compromised.
  Action:    Isolate specimen-db-01. Suspend analyst-07.
             Contact Director for breach notification protocol.

  INCIDENT 2: ALT-071
  Severity:  ${c071.severity.toUpperCase()}
  Type:      ${c071.type}
  System:    lab2-ws-04.hexworth.internal
  Summary:   Active RAT with C2 beacon to TOR infrastructure.
             System compromised via email attachment (17:55Z).
             Beacon active for 12+ hours. Credential theft detected.
  Action:    Isolate lab2-ws-04 immediately. Forensic imaging.
             Rotate all credentials accessible from that system.

  INCIDENT 3: ALT-158
  Severity:  ${c158.severity.toUpperCase()}
  Type:      ${c158.type}
  System:    lab1-ws-02.hexworth.internal (pivot from lab2-ws-04)
  Summary:   Attacker used stolen admin-svc credentials to access
             4 systems across lab segments. Active at time of report.
  Action:    Disable admin-svc account immediately. Audit all
             systems accessed. Check for additional persistence.

NOISE SUMMARY:
  224 alerts triaged as false positives
  Primary noise sources: scheduled scanner (02:00), nightly backup (03:00),
  NTP sync events, AV updates, equipment self-checks.

STATUS: Report transmitted to Director, Incident Response Team, and
        legal counsel (data exfil triggers breach notification review).

${'─'.repeat(60)}
`;

            if (!engine.config._flag2Awarded) {
                engine.config._flag2Awarded = true;
                engine.awardFlag('flag2');
                output += '\n[REPORT MILESTONE] Accurate incident report filed with correct severity and classification. Flag unlocked.';
            }

            return output;
        },

        // help -- command reference
        'help': function(args, term, engine) {
            return 'SIEM ANALYST TERMINAL -- COMMAND REFERENCE\n\n  siem                              Show alert queue summary\n  alert <id>                        Read full alert details (e.g. alert ALT-023)\n  correlate <id1> <id2>             Link two related alerts\n  classify <id> <severity> <type>   Classify an alert\n  report                            File formal incident report\n  cat <file>                        Read a file\n  ls <path>                         List directory\n\nSeverities: critical, high, medium, low\nTypes: data-exfil, lateral-movement, c2-beacon, brute-force, malware, policy-violation, false-positive\n\nSee ~/notes.txt for triage guidance.';
        }
    },

    // =========================================================
    // FLAGS
    // =========================================================

    flags: [
        {
            id: 'flag1',
            value: 'FLAG{pis-l09-outbreak-detection_flag1_all_3_real_incidents}',
            label: 'All 3 Real Incidents Identified',
            description: 'Correctly identified all three real incidents from 227 SIEM alerts.',
            points: 250,
            autoCheck: true
        },
        {
            id: 'flag2',
            value: 'FLAG{pis-l09-outbreak-detection_flag2_accurate_incident_re}',
            label: 'Accurate Incident Reports Filed',
            description: 'Filed formal incident report with correct severity and classification for all incidents.',
            points: 250,
            autoCheck: true
        }
    ],

    // =========================================================
    // SCORING
    // =========================================================

    scoring: {
        base: 1000,
        minScore: 0,
        maxScore: 500,
        hintPenalty: true,
        wrongFlagPenalty: -25,
        speedBonus: { threshold: 900000, points: 100 },
        timeBonusThreshold: 2700
    },

    // =========================================================
    // HINTS
    // =========================================================

    hints: [
        {
            id: 'hint1',
            text: 'Run "siem" to see the queue. The real incidents are not hidden -- they appear in the priority summary. CRITICAL and HIGH alerts that are NOT scheduled automation are worth investigating first. Read the full details with "alert <id>" before classifying.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint2',
            text: 'For classification, severity is about impact and urgency. A 4.7 GB data transfer to a known APT server = critical. An active C2 beacon with no data transferred yet = high. An attacker moving laterally with stolen creds = medium (active but contained). Match severity to the real-world damage.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint3',
            text: 'Focus on alerts with external destination IPs, unusual protocols, or repeated connection patterns. Real incidents often involve data leaving the network, beaconing behavior on regular intervals, or credential-based lateral movement between internal systems. Use "correlate" to link related alerts together.',
            cost: 50,
            penalty: -50
        }
    ],

    // =========================================================
    // CERT OBJECTIVES
    // =========================================================

    certObjectives: {
        certPath: 'CompTIA Security+ SY0-701',
        mappings: [
            { flagId: 'flag1', objective: '4.1', description: 'Apply common security techniques to computing resources', skill: 'SIEM alert triage: distinguishing real incidents from false positives using contextual threat indicators' },
            { flagId: 'flag2', objective: '4.2', description: 'Explain the security implications of proper hardware, software, and data asset management', skill: 'Incident classification, severity assessment, and formal incident reporting per SOC procedures' }
        ]
    },

    resetState: function() {
        this._state = {
        classifications: {},    // alertId -> { severity, type }
        correlations: [],       // [[id1, id2], ...]
        reportFiled: false
    };
        this._flag1Awarded = false;
        this._flag2Awarded = false;
    }


};


// Auto-reset state on script load (BOX-006 backfill 2026-05-23)
if (typeof PISL09Config !== 'undefined') PISL09Config.resetState();
