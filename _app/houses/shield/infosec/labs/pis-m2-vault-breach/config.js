/* ============================================================
   PIS-M2: The Vault Breach -- Midterm Part 2 (Practical)
   Principles of Information Security -- 4-phase CTF Midterm
   Combines W1 (malware, social-eng, OSINT) + W2 (SQLi, device
   hardening, cryptography) into one compound incident-response
   scenario. Covers SY0-701: 1.4, 2.4, 2.5, 3.2, 4.3, 4.7.
   ============================================================ */

const PISM2Config = {

    // =========================================================
    // BOX METADATA
    // =========================================================

    title: 'Midterm Part 2 -- The Vault Breach',
    subtitle: 'Hexworth Containment -- Vault Incident Response (Practical Midterm)',
    description: 'A coordinated attack on the BSL specimen vault unfolded overnight: spear-phish, SQL injection, malware drop on an unhardened workstation, and an attempted crypto break against the BSL-4 RSA key. You arrived for the morning shift to find SIEM alerts pending. You have 90 minutes to triage, investigate, contain, and file a complete incident report. Four phases. Four flags. The synthesis report at the end is gated on the prior three phases.',
    difficulty: 'Hard',
    estimatedTime: 90,
    accent: '#dc2626',
    storageKey: 'hexworth_lab_pis_m2',
    registryId: 'pis-m2-vault-breach',
    trackerKey: 'lab_pis_m2',

    // =========================================================
    // BOOT SEQUENCE
    // =========================================================

    boot: {
        biosLines: [
            'HEXWORTH CONTAINMENT WORKSTATION v4.2.1',
            'Vault Incident-Response Terminal -- BSL-2 Clearance',
            'SIEM feed: 47 ALERTS PENDING (acknowledged: 0)',
            'OpenSSL 3.2.1: LOADED',
            'MITRE ATT&CK Enterprise v19: LOADED',
            'CVE database mirror: SYNCED (NVD 2026-05-19)',
            'Vault key store: CONNECTED',
            'HSM (simulated): ONLINE'
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
        intro: 'A coordinated attack on the BSL specimen vault unfolded overnight. Spear-phishing for credentials. SQL injection on the intake portal. Malware drop on an unhardened workstation. Attempted RSA-key break against the BSL-4 vault. Four phases of an attack chain that spans everything you saw in Weeks 1 and 2. Triage, investigate, contain, and file the incident report. Director needs the full picture by 09:00.',
        scenario: 'You are the morning incident-response lead. The night shift left you 47 SIEM alerts and a timeline. Phase 1: triage what hit and attribute it. Phase 2: find the technical vectors (the SQLi in the application, the device-hardening failures that let the malware land). Phase 3: cryptographic containment -- encrypt the breach evidence for transmission, decrypt the attacker C2, verify the specimen catalog integrity. Phase 4: file a complete incident report -- gated on the prior three flags. The synthesis report IS the midterm.',
        outro: 'Incident report filed. The Director has the full attack chain: phish -> SQLi -> rootkit -> attempted crypto break. Your report is the input the operations team needs for the next 24 hours -- it names ws-04 for rebuild from a hardened baseline, names the vault AES + RSA keys for rotation, and gives CDC SOC the technical detail to draft a sector bulletin if they choose. None of those actions have happened yet; what you produced is the evidence and the recommended plan, and your work ends here. You have moved through every skill domain Weeks 1 and 2 introduced. The course continues into Weeks 3 and 4 with this midterm as the foundation.',

        goals: [
            'Identify a malware family from behavior telemetry (Week 1 -- L01 skill)',
            'Identify a social engineering technique from a captured phishing artifact (Week 1 -- L02 skill)',
            'Map a CVE to MITRE ATT&CK techniques in v19 (Week 1 -- L03 skill)',
            'Find a SQL injection vector in application code and identify the safe fix (Week 2 -- L04 skill)',
            'Audit a compromised endpoint against CS-12 device-hardening standard (Week 2 -- L05 skill)',
            'Execute AES-256 encryption, RSA decryption, and SHA-256 integrity verification under incident pressure (Week 2 -- L06 skill)',
            'Synthesize all four phases into a coherent incident report (cross-objective synthesis)'
        ],

        toolkit: [
            { name: 'malware-classify', purpose: 'Phase 1 -- classify malware family from behavior telemetry', sample: 'malware-classify SPX-7720' },
            { name: 'social-eng-classify', purpose: 'Phase 1 -- classify a social engineering attempt by technique', sample: 'social-eng-classify /home/analyst/phishing-email.eml' },
            { name: 'cve-search', purpose: 'Phase 1 -- look up CVE details', sample: 'cve-search CVE-2024-3094' },
            { name: 'mitre-lookup', purpose: 'Phase 1 -- look up ATT&CK technique (v19)', sample: 'mitre-lookup T1566' },
            { name: 'audit-app-code', purpose: 'Phase 2 -- inspect application code for injection vulnerabilities', sample: 'audit-app-code /app/intake.py' },
            { name: 'audit-device', purpose: 'Phase 2 -- audit a workstation against CS-12 standard', sample: 'audit-device ws-04' },
            { name: 'openssl', purpose: 'Phase 3 -- AES-256 encrypt + RSA decrypt operations', sample: 'openssl enc -aes-256-cbc -in <input> -out <output> -pass file:<key>' },
            { name: 'sha256sum', purpose: 'Phase 3 -- compute/verify SHA-256 hashes for integrity', sample: 'sha256sum -c /vault/manifest-hashes.txt' },
            { name: 'file-report', purpose: 'Phase 4 -- file the final incident report (gated on Phases 1-3)', sample: 'file-report' },
            { name: 'phase', purpose: 'Show current phase status and what is still missing', sample: 'phase' },
            { name: 'help', purpose: 'Full command reference', sample: 'help' }
        ]
    },

    // =========================================================
    // TERMINAL CONFIG
    // =========================================================

    terminal: {
        user: 'analyst',
        hostname: 'ir-ws-01',
        startDir: '/home/analyst',
        welcome: 'Hexworth Containment -- Vault Incident-Response Terminal\nBSL-2 Clearance Active -- MIDTERM PRACTICAL SESSION\n\n*** VAULT BREACH IN PROGRESS ***\n*** 47 SIEM alerts pending. Director needs full IR by 09:00. ***\n\nFOUR PHASES:\n  Phase 1 -- Triage & Attribution        (malware + social-eng + CVE/ATT&CK)\n  Phase 2 -- Investigation & Hardening   (SQLi + device audit)\n  Phase 3 -- Cryptographic Containment   (encrypt + decrypt + integrity)\n  Phase 4 -- Synthesis Report            (gated -- requires Phases 1-3)\n\nStart: cat /home/analyst/incident-brief.md\nWorkflow: phase  (shows what is still missing in current phase)\nReference: cat /home/analyst/notes.txt for the full command reference\n\nType "help" for command reference.\n'
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

    onAppLaunch: function(iconDef, engine) {
        if (iconDef && iconDef.app === 'briefing') {
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
                                    content: 'MIDTERM PRACTICAL -- COMMAND REFERENCE\n=======================================\n\nPhase 1 -- Triage & Attribution:\n  malware-classify <specimen-id>      Classify malware from behavior log\n  social-eng-classify <file.eml>      Classify social engineering technique\n  cve-search <term>                   CVE database lookup\n  mitre-lookup <T-id>                 ATT&CK technique lookup (v19)\n\nPhase 2 -- Investigation & Hardening:\n  audit-app-code <path>               Inspect app code for injection bugs\n  audit-device <ws-id>                Audit endpoint against CS-12\n\nPhase 3 -- Cryptographic Containment:\n  openssl enc -aes-256-cbc ...        AES symmetric encryption\n  openssl rsautl -decrypt ...         RSA private-key decryption\n  sha256sum -c <hashfile>             Bulk integrity verification\n\nPhase 4 -- Synthesis Report:\n  file-report                         File final IR report (gated)\n\nGlobal:\n  phase                               Show current phase + what is missing\n  help                                Full command reference\n  cat <file>                          Read a file\n  ls <dir>                            List directory\n\nKey files in your workspace:\n  /home/analyst/incident-brief.md           Scenario brief\n  /home/analyst/intrusion-logs.txt          Behavior log for malware-classify\n  /home/analyst/phishing-email.eml          For social-eng-classify\n  /home/analyst/malware-behavior.json       Detailed behavior telemetry\n  /app/intake.py                            SQL-injectable application code\n  /app/access.log                           Application access log (SQLi traces)\n  /device-images/ws-04-audit.json           Device audit data\n  /vault/breach-evidence.dat                Phase 3 -- encrypt this\n  /vault/intercepted-c2.enc                 Phase 3 -- decrypt this\n  /vault/manifest-hashes.txt                Phase 3 -- verify against\n  /vault/keys/                              Key store\n'
                                },
                                'incident-brief.md': {
                                    type: 'file',
                                    content: 'INCIDENT BRIEF -- VAULT BREACH (overnight 2026-05-18 23:47 UTC)\n==============================================================\nReceived: 2026-05-19 06:30 from night-shift IR lead\nClassification: INTERNAL // INCIDENT-RESPONSE\nSeverity: HIGH (BSL-4 specimen exposure suspected)\n\nTIMELINE (reconstructed from SIEM + endpoint telemetry):\n\n23:47 UTC -- Field analyst (analyst-04) receives email purporting to be from\n             "Director, Hexworth Containment" with subject "URGENT: rotate vault\n             credentials before audit." Email contained a link to\n             https://hexworth-secure-portal.com/rotate (NOT a Hexworth domain).\n             Analyst-04 clicked the link, entered credentials.\n\n23:51 UTC -- Adversary used analyst-04 credentials to log into the specimen-\n             intake web portal at https://intake.hexworth.internal/portal.\n             Intake portal app code is in /app/intake.py.\n\n00:03 UTC -- Adversary submitted crafted query parameters to the portal\'s\n             /search endpoint. SIEM flagged anomalous SQL query patterns. The\n             portal\'s app code uses string-concatenated SQL (see /app/access.log\n             for the actual queries logged). This enumerated the entire specimen\n             database and the access-control table.\n\n00:05 UTC -- Adversary identified SPX-7720 in the database (vault-catalog\n             entry for a BSL-4 ransomware specimen) via the SQLi enumeration.\n             See /app/access.log entry 00:05:11Z.\n\n00:18 UTC -- Adversary downloaded a payload to analyst-04\'s workstation\n             (ws-04). The workstation lacked CS-12 hardening (specifically: no\n             full-disk encryption, no MDM enrollment, no EDR agent). The\n             payload established persistence and began attempting to read the\n             vault\'s RSA private key from /vault/keys/.\n\n01:30 UTC -- Adversary attempted to exfiltrate vault data. A field-asset SIGMA\n             intercepted attacker C2 communication encrypted with the Hexworth\n             vault public key (the same one used in L06). The intercepted file\n             is at /vault/intercepted-c2.enc. SIGMA forwarded it before the\n             attacker could rotate keys.\n\n04:00 UTC -- Night-shift IR lead isolated ws-04 from the network. Vault keys\n             are still on disk, but the attacker did not complete the RSA key\n             theft (insufficient time before isolation).\n\n06:30 UTC -- Handoff to morning shift (you).\n\nYOUR JOB:\n\n  Phase 1 -- Triage & Attribution:\n    * Classify the malware family (use: malware-classify SPX-7720)\n    * Classify the social engineering technique (use: social-eng-classify\n      /home/analyst/phishing-email.eml)\n    * Identify the CVE behind the SQLi vector and map ATT&CK techniques\n    * Goal: Flag 1 fires when triage is complete.\n\n  Phase 2 -- Investigation & Hardening:\n    * Find the SQL injection in /app/intake.py (use: audit-app-code)\n    * Audit ws-04 against the CS-12 device-hardening standard (use: audit-device)\n    * Goal: Flag 2 fires when investigation is complete.\n\n  Phase 3 -- Cryptographic Containment:\n    * Encrypt /vault/breach-evidence.dat with AES-256-CBC for upstream transmission\n    * Decrypt /vault/intercepted-c2.enc with the vault RSA private key to read SIGMA\'s intel\n    * Verify the specimen catalog integrity against the reference manifest (sha256sum -c)\n    * Goal: Flag 3 fires when all three crypto operations are complete.\n\n  Phase 4 -- Synthesis Report:\n    * Run: file-report\n    * Gated on Flags 1, 2, 3 -- you cannot file the report until the prior\n      three phases are confirmed complete.\n    * Goal: Flag 4 fires when the report is filed.\n\nReference: KBA-1947 (CVE-to-ATT&CK Mapping) lives in your L03 lab dir if you\nneed the mapping procedure. Use: phase  (anywhere) to see what is still\nmissing in your current phase.\n'
                                },
                                'phishing-email.eml': {
                                    type: 'file',
                                    content: 'From: "Dr. M. Voss, Director, Hexworth Containment" <director-hexworth@hexworth-secure-portal.com>\nTo: analyst-04@hexworth.internal\nSubject: URGENT: rotate vault credentials before audit\nDate: Sun, 18 May 2026 23:47:12 +0000\nX-Originating-IP: 185.220.101.47\nReply-To: noreply@hexworth-secure-portal.com\n\nAnalyst-04,\n\nThe quarterly audit is tomorrow. All field analysts are required to\nrotate their vault credentials before 06:00 UTC or they will be locked\nout of vault operations.\n\nUse the secure portal below to rotate. Do NOT use the standard internal\ntool -- it is being upgraded for the audit and is offline.\n\n  https://hexworth-secure-portal.com/rotate?user=analyst-04\n\nThis is a TIME-SENSITIVE request from the Director\'s office. Failure\nto complete this in the next 6 hours will result in an audit finding\nagainst your account and a write-up by HR.\n\nThank you for your cooperation.\n\n-- Dr. M. Voss, Director\nHexworth Containment Field Operations\n\n[FORWARDED INTERNAL NOTE -- IR TEAM ANNOTATIONS:\n - Sender domain "hexworth-secure-portal.com" is NOT a Hexworth domain.\n   Real domain is hexworth.internal.\n - Originating IP 185.220.101.47 is a known TOR exit (appeared in L03 IOCs).\n - "Reply-To" differs from "From" -- classic spoofing tell.\n - Specific urgency ("6 hours", "audit", "write-up") + impersonation of an\n   authority figure is the technique signature.\n]'
                                },
                                'intrusion-logs.txt': {
                                    type: 'file',
                                    content: 'WS-04 INTRUSION TELEMETRY -- 2026-05-19 00:18 to 04:00 UTC\n==========================================================\nSource: ws-04 endpoint EDR (limited; no enrollment)\nCorrelation: SIEM + filesystem audit on ws-04\n\n00:18:42 -- Process: /tmp/.X11-update [PID 14728]\n            Spawned by: chrome.exe (analyst-04)\n            File on disk: /tmp/.X11-update (binary, ELF64, statically linked)\n            File size: 4.2 MB\n            SHA-256: a7f3d9e2b8c1f6a5e4d3c2b1a9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0\n\n00:18:45 -- Process: /tmp/.X11-update [PID 14728]\n            System call: prctl(PR_SET_NAME, "kworker/2:0")\n            (Renaming itself to look like a kernel worker thread.)\n\n00:19:02 -- File access: /etc/cron.d/X11-update-daily [CREATED]\n            Permissions: 644\n            Owner: root (escalated from analyst-04 -- privilege escalation)\n            Content: */15 * * * * root /tmp/.X11-update --check\n            (Persistence mechanism: cron job runs every 15 min as root.)\n\n00:19:18 -- File access: /usr/sbin/sshd [READ + WRITE]\n            Hash before: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855\n            Hash after:  9bd18329e4bc099f87c5ab92827a13b00c1d8e7f3b4a9e2c6d5f4e3d2c1b0a9f8\n            (System binary modified -- kernel-level hooking.)\n\n00:24:00 -- File access: /var/log/auth.log [DELETED]\n            File access: /var/log/syslog [TRUNCATED]\n            File access: /var/log/audit/audit.log [WRITE-DENY, falls back to TRUNCATE]\n            (Log destruction -- attempted to cover tracks. auditd was running,\n            limited the damage.)\n\n00:25:30 -- Network: outbound connection to 91.108.4.123:443\n            (Same IP appeared in L03 OUTBREAK-7719 threat-feed.)\n            (C2 channel established.)\n\n00:30:00 -- File access: /vault/keys/vault-rsa-private.pem [READ ATTEMPT]\n            (Vault key directory is on encrypted partition; attacker could not\n            mount it without the master key.)\n\n01:30:00 -- (SIGMA intercept -- attacker exfil attempt captured by\n             field-asset network monitoring; intercepted file at\n             /vault/intercepted-c2.enc.)\n\n04:00:00 -- Network isolation -- ws-04 placed on quarantine VLAN.\n\nBEHAVIOR SUMMARY (for classification):\n  * Spawned by user process (chrome.exe via phishing-delivered binary)\n  * Persistence via cron-as-root (privilege escalation)\n  * Kernel binary modification (rootkit characteristic)\n  * Log destruction (anti-forensics)\n  * C2 callback to known threat-feed IP\n  * Stealth process rename to mimic kernel thread\n  * No self-replication detected\n  * No encryption of victim files\n  * No demand for payment\n  * No information broker behavior\n\nThis behavior is captured in detail in /home/analyst/malware-behavior.json.\nRun: malware-classify SPX-7720 -- the tool reads from intrusion-logs.txt and\nmalware-behavior.json to score the classification.\n'
                                },
                                'malware-behavior.json': {
                                    type: 'file',
                                    content: '{\n  "specimen_id": "SPX-7720",\n  "id_note": "SPX-7720 is the vault-catalog identifier for a BSL-4 RANSOMWARE specimen. The sample described in this file, however, is the ATTACKER PAYLOAD (a rootkit) dropped on ws-04 during the SPX-7720 incident. IR labeled the payload SPX-7720 in telemetry to tie it to the incident -- it does NOT inherit the catalog entry classification. Classify this sample on its own behavior signatures below, not on what SPX-7720 means in the vault catalog.",\n  "captured": "2026-05-19T04:00:00Z",\n  "behavior_signatures": {\n    "process_creation": {\n      "spawned_by_user_process": true,\n      "renamed_to_kernel_thread_lookalike": true,\n      "self_replicating": false\n    },\n    "persistence": {\n      "cron_root_persistence": true,\n      "systemd_unit_persistence": false,\n      "registry_run_keys": false\n    },\n    "privilege_escalation": {\n      "escalated_to_root": true,\n      "method": "binary_modification_of_sshd"\n    },\n    "system_modification": {\n      "kernel_module_loaded": false,\n      "system_binary_modified": true,\n      "modified_binaries": ["/usr/sbin/sshd"]\n    },\n    "stealth": {\n      "log_destruction": true,\n      "log_targets": ["/var/log/auth.log", "/var/log/syslog", "/var/log/audit/audit.log"],\n      "process_hiding": "renames to kernel-thread-lookalike",\n      "rootkit_signature": "kernel-level binary hooking"\n    },\n    "communication": {\n      "c2_callback": true,\n      "c2_destinations": ["91.108.4.123:443"],\n      "data_exfil_attempted": true,\n      "exfil_target": "/vault/keys/vault-rsa-private.pem"\n    },\n    "destructive_actions": {\n      "encrypts_victim_files": false,\n      "deletes_victim_files": false,\n      "ransom_demand": false\n    },\n    "remote_access": {\n      "interactive_shell": false,\n      "screen_capture": false,\n      "keylogger": false\n    }\n  },\n  "intent_signals": {\n    "primary_goal": "establish_hidden_persistent_root_access",\n    "secondary_goal": "exfiltrate_vault_rsa_private_key",\n    "tertiary_goal": "anti_forensics"\n  },\n  "family_candidates_with_reasoning": {\n    "virus": "NO -- no self-replication, no host-file infection",\n    "worm": "NO -- no self-replication, no network propagation",\n    "trojan": "PARTIAL -- delivered via phishing (Trojan-style delivery), but persistence + privilege escalation + binary modification + log destruction indicates more sophisticated than trojan alone",\n    "ransomware": "NO -- does not encrypt victim files, no ransom demand",\n    "rootkit": "YES -- kernel-level binary hooking (sshd modification), process hiding (kernel-thread rename), log destruction (anti-forensics), persistent root access. All signature behaviors of a rootkit family.",\n    "rat": "NO -- no interactive shell, no screen capture, no keylogging. This is not an information-broker RAT; it is a persistence + stealth tool."\n  }\n}\n'
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'cat /home/analyst/incident-brief.md\nphase\n'
                                }
                            }
                        }
                    }
                },
                'app': {
                    type: 'dir',
                    children: {
                        'intake.py': {
                            type: 'file',
                            content: '#!/usr/bin/env python3\n"""\nHexworth Containment -- Specimen Intake Portal\n(Internal web service; do not expose externally.)\n\n*** This is the file the adversary exploited. ***\nThe /search endpoint contains a SQL injection vulnerability.\nAudit task: identify the vulnerable line and the safe fix.\n"""\n\nimport sqlite3\nfrom flask import Flask, request, jsonify\n\napp = Flask(__name__)\nDB_PATH = "/var/lib/hexworth/specimens.db"\n\n\n@app.route("/search")\ndef search_specimen():\n    """\n    Search the specimen catalog by ID, name, or class.\n    Called from the intake portal UI.\n    """\n    query = request.args.get("q", "").strip()\n    if not query:\n        return jsonify({"error": "empty query"}), 400\n\n    conn = sqlite3.connect(DB_PATH)\n    cursor = conn.cursor()\n\n    # *** VULNERABLE LINE -- string concatenation ***\n    sql = "SELECT id, name, class, bsl_level FROM specimens WHERE id LIKE \'%" + query + "%\' OR name LIKE \'%" + query + "%\'"\n    cursor.execute(sql)\n\n    rows = cursor.fetchall()\n    return jsonify({"results": [dict(zip(["id", "name", "class", "bsl"], r)) for r in rows]})\n\n\n@app.route("/access-control")\ndef list_access():\n    """List access-control entries -- internal admin endpoint."""\n    conn = sqlite3.connect(DB_PATH)\n    cursor = conn.cursor()\n    # This endpoint uses parameterized queries -- safe.\n    cursor.execute("SELECT analyst_id, clearance, expiry FROM access_control")\n    return jsonify({"entries": cursor.fetchall()})\n\n\nif __name__ == "__main__":\n    app.run(host="0.0.0.0", port=8080)\n'
                        },
                        'access.log': {
                            type: 'file',
                            content: '# Hexworth Intake Portal -- access log (truncated to relevant window)\n# Format: ISO_TIMESTAMP CLIENT_IP USER METHOD PATH?QUERY STATUS RESPONSE_SIZE\n\n2026-05-19T00:01:14Z 10.0.4.22 analyst-04 GET /search?q=SPX-001 200 187\n2026-05-19T00:01:38Z 10.0.4.22 analyst-04 GET /search?q=SPX-002 200 178\n2026-05-19T00:02:11Z 10.0.4.22 analyst-04 GET /search?q=SPX-003 200 184\n\n# ---- attacker session begins ---- credentials harvested via phishing ----\n2026-05-19T00:03:42Z 185.220.101.47 analyst-04 GET /search?q=SPX-001 200 187\n2026-05-19T00:03:58Z 185.220.101.47 analyst-04 GET /search?q=\\\'%20UNION%20SELECT%201,2,3,4-- 200 92\n2026-05-19T00:04:14Z 185.220.101.47 analyst-04 GET /search?q=\\\'%20UNION%20SELECT%20id,name,class,bsl_level%20FROM%20specimens-- 200 84112\n   (response size 84KB -- full specimen catalog dumped)\n2026-05-19T00:04:38Z 185.220.101.47 analyst-04 GET /search?q=\\\'%20UNION%20SELECT%20analyst_id,clearance,expiry,1%20FROM%20access_control-- 200 12471\n   (full access-control table dumped)\n2026-05-19T00:05:11Z 185.220.101.47 analyst-04 GET /search?q=SPX-7720 200 1124\n   (attacker located SPX-7720 -- BSL-4 ransomware specimen)\n# ---- attacker session ends ----\n\n# ---- normal traffic resumes after IR detection ----\n2026-05-19T04:30:08Z 10.0.4.22 analyst-08 GET /search?q=SPX-301 200 174\n'
                        }
                    }
                },
                'device-images': {
                    type: 'dir',
                    children: {
                        'ws-04-audit.json': {
                            type: 'file',
                            content: '{\n  "workstation_id": "ws-04",\n  "user": "analyst-04",\n  "imaged_at": "2026-05-19T04:30:00Z",\n  "image_purpose": "Post-isolation forensic audit",\n  "cs12_compliance_check": {\n    "criterion_1_full_disk_encryption": {\n      "required": true,\n      "actual": false,\n      "evidence": "fdisk -l shows unencrypted partitions; no LUKS/BitLocker/FileVault detected",\n      "status": "FAIL"\n    },\n    "criterion_2_mdm_enrollment": {\n      "required": true,\n      "actual": false,\n      "evidence": "No Hexworth MDM Agent (hex-mdm-agent) installed; no Intune/Jamf enrollment record",\n      "status": "FAIL"\n    },\n    "criterion_3_edr_agent": {\n      "required": true,\n      "actual": false,\n      "evidence": "No EDR process running (osqueryd, falcon-sensor, sentinel-agent, defender-mp). Only basic auditd present (which the rootkit partially defeated).",\n      "status": "FAIL"\n    },\n    "criterion_4_screen_lock_timeout": {\n      "required": "10 minutes max",\n      "actual": "60 minutes",\n      "evidence": "Screen lock policy: 60 min idle (gnome-screensaver config)",\n      "status": "FAIL"\n    }\n  },\n  "compliance_summary": {\n    "criteria_required": 9,\n    "criteria_met": 0,\n    "criteria_failed": 9,\n    "note": "Audit covers BOTH the 4 software criteria below (this file) AND 5 hardware criteria (see ws-04-bios.txt). The audit-device terminal output aggregates both files for the 9-of-9 verdict.",\n    "verdict": "NON-COMPLIANT -- this device should not have been issued for field use"\n  },\n  "compromise_findings": {\n    "rootkit_persistent": true,\n    "rootkit_location": "/tmp/.X11-update + /etc/cron.d/X11-update-daily + /usr/sbin/sshd (modified)",\n    "remediation": "Wipe + rebuild from hardened image. Do not attempt clean-in-place; binary modifications make this unsafe."\n  },\n  "policy_violations": [\n    "CS-12-1: Full-disk encryption not enabled (HIGH)",\n    "CS-12-2: MDM enrollment missing (HIGH)",\n    "CS-12-3: EDR agent not running (HIGH)",\n    "CS-12-4: Screen lock timeout exceeds policy (MEDIUM)",\n    "CS-12-5: Secure Boot disabled in BIOS (HIGH) -- see ws-04-bios.txt",\n    "CS-12-6: TPM 2.0 present but not enrolled (HIGH) -- see ws-04-bios.txt",\n    "CS-12-7: Firmware password not set (MEDIUM) -- see ws-04-bios.txt",\n    "CS-12-8: USB ports unrestricted (MEDIUM) -- see ws-04-bios.txt",\n    "CS-12-9: Network boot enabled (MEDIUM) -- see ws-04-bios.txt"\n  ]\n}\n'
                        },
                        'ws-04-bios.txt': {
                            type: 'file',
                            content: 'WS-04 BIOS / FIRMWARE REPORT\n============================\nSecure Boot:        DISABLED (CS-12 expects: ENABLED)\nTPM 2.0:            present but not enrolled\nUEFI version:       2.8 (current)\nFirmware password:  not set (CS-12 expects: set)\nUSB ports:          all enabled (CS-12 expects: restricted)\nNetwork boot:       enabled (CS-12 expects: disabled)\n\nReadout: hardware-side hardening is also non-compliant. Even with software\nfixes, this hardware configuration is below the CS-12 standard for field\ndevices that handle BSL-2+ specimens.\n'
                        }
                    }
                },
                'vault': {
                    type: 'dir',
                    children: {
                        'breach-evidence.dat': {
                            type: 'file',
                            content: '--- BREACH EVIDENCE PACKAGE -- SPX-7720 INCIDENT ---\nCompiled: 2026-05-19T04:30:00Z by night-shift IR lead\nClassification: INTERNAL // INCIDENT-RESPONSE // FOR-UPSTREAM-TRANSMISSION\n\nContents:\n  - SIEM alerts (47 entries)\n  - ws-04 forensic image hashes\n  - Phishing email full headers (X-Originating-IP, DKIM/SPF results)\n  - Network capture from 23:47 UTC to 04:00 UTC\n  - C2 IP attribution data\n  - SPX-7720 sample (sandboxed)\n  - Vault audit log\n\nUpstream destination: CDC Cybersecurity Operations Center\nTransmission method: encrypted-at-rest via AES-256-CBC\nKey transmission: separate channel (vault-aes-key.bin via courier)\n\n[END EVIDENCE PACKAGE -- ENCRYPT BEFORE TRANSMISSION]\n'
                        },
                        'intercepted-c2.enc': {
                            type: 'file',
                            content: '[RSA-2048-ENCRYPTED -- captured by ASSET SIGMA]\nEncrypted with: Hexworth vault-rsa-public.pem\nSource: ASSET SIGMA (field-asset network monitoring)\nTimestamp: 2026-05-19T01:32:14Z\nPriority: CRITICAL\n\n[Ciphertext representation -- 256 bytes RSA-2048 block]\n4f3a9d2e1b8c7f6a5e4d3c2b1a9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1\n9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8\n7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a8f7e6\nd5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c\n'
                        },
                        'manifest-hashes.txt': {
                            type: 'file',
                            content: '# HEXWORTH SPECIMEN CATALOG -- REFERENCE MANIFEST HASHES\n# Generated: 2026-05-18T00:00:00Z (before breach window)\n# Algorithm: SHA-256\n# WARNING: Trusted-reference hashes. Compare against post-breach files.\n\ne3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855  specimen-catalog.db\n7b502a71ab73b8c0be0d5e8ae57e5a85b45ee4b3820b3e2e7b0e21ecbe90ab8c  access-control.csv\n9a4bfca6d27a4b8ac9b3e621f77c1b5f0eb3a8d47fca2e9b3d76c5e4f1a2b893  audit-log.json\n'
                        },
                        'manifest': {
                            type: 'dir',
                            children: {
                                'specimen-catalog.db': {
                                    type: 'file',
                                    content: '[BINARY: Specimen Catalog Database -- intact post-breach]\nSHA-256: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855\nRecords: 7720 specimens (including SPX-7720)\nLast verified intact: 2026-05-19T04:30:00Z\n'
                                },
                                'access-control.csv': {
                                    type: 'file',
                                    content: 'analyst_id,clearance,lab_access,expiry\nAN-001,BSL-2,1-2,2027-01-01\nAN-004,BSL-2,1-2,2027-04-01  [COMPROMISED -- credentials leaked via phishing 2026-05-18]\nAN-008,BSL-3,1-2-3,2027-06-01\nSHA-256: 7b502a71ab73b8c0be0d5e8ae57e5a85b45ee4b3820b3e2e7b0e21ecbe90ab8c\n'
                                },
                                'audit-log.json': {
                                    type: 'file',
                                    content: '{"audit_entries":[{"id":"AU-001","action":"specimen_query","analyst":"AN-001","ts":"2026-05-19T00:01:14Z"},{"id":"AU-002","action":"specimen_query","analyst":"AN-004","ts":"2026-05-19T00:03:42Z","flag":"ANOMALOUS_PATTERN"},{"id":"AU-003","action":"specimen_query","analyst":"AN-004","ts":"2026-05-19T00:04:14Z","flag":"SQLI_PATTERN_DETECTED"}]}\nSHA-256: 9a4bfca6d27a4b8ac9b3e621f77c1b5f0eb3a8d47fca2e9b3d76c5e4f1a2b893\n'
                                }
                            }
                        },
                        'keys': {
                            type: 'dir',
                            children: {
                                'README.txt': {
                                    type: 'file',
                                    content: 'VAULT KEY STORE -- READ ONLY\n==============================\nvault-aes-key.bin\n  Type: AES-256 symmetric key (32 bytes, raw binary)\n  Use for: AES-256-CBC encryption of breach-evidence.dat for upstream transmission\n  Usage: -pass file:/vault/keys/vault-aes-key.bin\n\nvault-rsa-private.pem\n  Type: RSA-2048 private key (PEM format)\n  Use for: Decrypting intercepted-c2.enc (encrypted with our public key by SIGMA)\n  Usage: -inkey /vault/keys/vault-rsa-private.pem\n\nKey custody: Director-signed (KC-2026-014)\nThis is the same key store referenced in L06; same keys are in scope for\nthis midterm. The attacker did not successfully exfil the keys (insufficient\ntime before isolation).\n\nRotation: scheduled for 2026-05-19T18:00Z (post-incident).\n'
                                },
                                'vault-aes-key.bin': {
                                    type: 'file',
                                    content: '[BINARY: AES-256 Key -- 32 bytes]\na7f3d9e2b8c1f6a5e4d3c2b1a9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0\n'
                                },
                                'vault-rsa-private.pem': {
                                    type: 'file',
                                    content: '-----BEGIN RSA PRIVATE KEY-----\n[RSA-2048 Private Key -- vault use only]\nMIIEpAIBAAKCAQEA0Z3VS5JJcds3xHn/ygWep4PAtEsHBJcQBTyKMWkBrOzLCTZm\nJkPKGQ8WRexNmCpRzMm3xrUMMgBzOtXF4tnlQyZXR5PsURN8hLJDzC6ZMvR4zJ0D\n[... 2048-bit key content truncated for display ...]\n-----END RSA PRIVATE KEY-----\n'
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
        // Phase tracking
        phase1: { malwareClassified: false, socialEngClassified: false, cveIdentified: false, attackTechniques: [] },
        phase2: { sqliVectorFound: false, deviceAudited: false },
        phase3: { evidenceEncrypted: false, c2Decrypted: false, integrityVerified: false },
        phase4: { reportFiled: false }
    },

    _flag1Awarded: false,
    _flag2Awarded: false,
    _flag3Awarded: false,
    _flag4Awarded: false,

    // =========================================================
    // TERMINAL COMMANDS
    // =========================================================

    commands: {

        // ========== PHASE 1 — Triage & Attribution ==========

        // malware-classify <specimen-id>
        'malware-classify': function(args, term, engine) {
            const id = (args[0] || '').toUpperCase();
            if (!id) return 'Usage: malware-classify <specimen-id>\nExample: malware-classify SPX-7720\n\nReads behavior telemetry from intrusion-logs.txt and malware-behavior.json,\nthen classifies the family. Accepted families: virus, worm, trojan, ransomware, rootkit, rat';
            if (id !== 'SPX-7720') {
                return `malware-classify: specimen ${id} not in scope for this incident.\nThe captured sample is SPX-7720 (see incident-brief.md).`;
            }

            engine.config._state.phase1.malwareClassified = true;

            return 'MALWARE FAMILY CLASSIFICATION -- SPX-7720\n' + '='.repeat(50) + '\nBehavior signatures (from /home/analyst/malware-behavior.json):\n  * Persistence via cron-as-root (escalated to root)\n  * Kernel binary modification (/usr/sbin/sshd hooked)\n  * Process hiding (renamed to "kworker/2:0" lookalike)\n  * Log destruction (/var/log/auth.log, syslog, audit.log)\n  * C2 callback (91.108.4.123:443)\n  * NO self-replication\n  * NO victim file encryption\n  * NO ransom demand\n  * NO interactive shell / screen capture / keylogger\n\nFAMILY DETERMINATION:\n  Virus:      NO  -- no self-replication, no host-file infection\n  Worm:       NO  -- no network propagation\n  Trojan:     PARTIAL -- delivered via phishing, but persistence and rootkit-tier stealth go beyond a vanilla trojan\n  Ransomware: NO  -- no file encryption, no ransom\n  Rootkit:    YES -- kernel binary hooking, persistence, log destruction, stealth process rename\n  RAT:        NO  -- no interactive control surface for the attacker\n\nClassification: ROOTKIT (with trojan delivery vector)\n\n[Phase 1 progress: malware classified]';
        },

        // social-eng-classify <file>
        'social-eng-classify': function(args, term, engine) {
            const file = args[0] || '';
            if (!file) return 'Usage: social-eng-classify <file.eml>\nExample: social-eng-classify /home/analyst/phishing-email.eml\n\nAccepted techniques: phishing, spear-phishing, vishing, pretexting, baiting, smishing';
            // Tightened path gate: substring matching used to pass things like
            // 'phishing-email.eml.backup' or '/tmp/phishing-email.txt'. This is a
            // midterm; require canonical path or bare canonical filename.
            if (file !== '/home/analyst/phishing-email.eml' && file !== 'phishing-email.eml') {
                return `social-eng-classify: file '${file}' not recognized as a captured social-engineering artifact.\nThe captured artifact is /home/analyst/phishing-email.eml.`;
            }

            engine.config._state.phase1.socialEngClassified = true;

            return 'SOCIAL ENGINEERING ANALYSIS -- phishing-email.eml\n' + '='.repeat(50) + '\nDelivery channel: EMAIL\nTargeted? YES -- specific recipient (analyst-04), specific role (field analyst), specific authority figure impersonated (Director)\nUrgency? YES -- "URGENT", "6 hours", "audit", "write-up" all standard urgency markers\nAuthority pretext? YES -- impersonates Director (Dr. M. Voss)\nDomain spoofing? YES -- "hexworth-secure-portal.com" is NOT a Hexworth domain (real is hexworth.internal)\nReply-To mismatch? YES -- From != Reply-To (classic spoofing tell)\nOriginating IP? 185.220.101.47 -- known TOR exit (appeared in L03 OUTBREAK-7719 IOCs)\nCredential harvest target? YES -- link directs to fake "secure portal" credential rotation\n\nCLASSIFICATION:\n  Phishing:        BROAD match (email-based credential harvest)\n  Spear-phishing:  TIGHTER MATCH -- targeted to specific user with specific role,\n                   authority impersonation, contextually plausible request (audit rotation).\n                   This is NOT mass phishing; this is targeted reconnaissance + lure.\n  Vishing:         NO -- not voice/phone\n  Pretexting:      ELEMENT PRESENT (the "rotation before audit" pretext), but technique\n                   classification is "spear-phishing" -- pretexting is the underlying lure.\n  Baiting:         NO -- no physical drop, no software-download lure\n  Smishing:        NO -- not SMS\n\nClassification: SPEAR-PHISHING (with pretexting and authority-impersonation lures)\n\n[Phase 1 progress: social engineering classified]';
        },

        // cve-search <term>  (reuses L03 toolkit pattern)
        'cve-search': function(args, term, engine) {
            const query = args.join(' ').toLowerCase();
            if (!query) return 'Usage: cve-search <term>\nExample: cve-search sql injection flask\nExample: cve-search CVE-2024-3094  (XZ Utils backdoor)';

            // The vulnerability used against the Hexworth intake portal is INTERNAL
            // (Hexworth-built Flask app with concatenated SQL). It does not have an
            // external CVE -- but the broader CWE applies.
            if (query.includes('sql injection') || query.includes('sqli') || query.includes('intake.py') || query.includes('cwe-89')) {
                engine.config._state.phase1.cveIdentified = 'CWE-89';
                return 'CVE / CWE DATABASE QUERY: "' + args.join(' ') + '"\n\nThis is an INTERNAL Hexworth application vulnerability. The intake.py code\nuses string-concatenated SQL -- this is CWE-89 (Improper Neutralization of\nSpecial Elements used in an SQL Command (\'SQL Injection\')).\n\nCWE-89 -- SQL Injection\n  Source: https://cwe.mitre.org/data/definitions/89.html\n  Severity: typically CRITICAL when authentication is bypassed or data is\n            exfiltrated from a sensitive system (BSL specimen catalog is\n            in-scope -- this is CRITICAL).\n  Standard mitigation: parameterized queries (also called prepared statements).\n                       In Python sqlite3, the safe form is:\n                         cursor.execute("SELECT ... WHERE id = ?", (query,))\n                       NOT:\n                         cursor.execute("SELECT ... WHERE id = \\\'" + query + "\\\'")\n\nResearch tip: if you need real-world SQLi CVE references for your report,\nsearch NVD (https://nvd.nist.gov/vuln/search) by keyword \"sql injection\"\nand filter by CWE-89. ALWAYS verify each CVE description on its NVD page\nbefore citing it -- a real CVE number with a wrong description is worse\nthan no citation at all.\n\nThe ATT&CK technique for this is T1190 (Exploit Public-Facing Application).\nLook up the technique with: mitre-lookup T1190\n\n[Phase 1 progress: vulnerability class identified -- CWE-89]';
            }

            // Threat-feed context query
            if (query.includes('cve-2024-3094') || query.includes('xz')) {
                return 'CVE DATABASE QUERY RESULT (cross-reference -- not the active vector)\n\nCVE-2024-3094 was the OUTBREAK-7719 vector from L03 (XZ Utils backdoor).\nThis midterm scenario does NOT involve CVE-2024-3094 -- the attack chain\nhere uses an INTERNAL SQL injection (CWE-89) as the initial-access vector\nafter credential harvest via spear-phishing.\n\nFor THIS incident, the vulnerability class is CWE-89 (SQL Injection).\nRun: cve-search sql injection';
            }

            return 'CVE DATABASE QUERY: "' + args.join(' ') + '"\n\nNo direct match. Hints:\n  - The vulnerability in /app/intake.py is the active attack vector for this midterm.\n  - Try: cve-search sql injection  (or cve-search sqli)\n  - The L03 OUTBREAK-7719 CVE (CVE-2024-3094) is NOT the active vector here.';
        },

        // mitre-lookup <technique-id> (covers Phase 1 ATT&CK mapping)
        'mitre-lookup': function(args, term, engine) {
            const techId = (args[0] || '').toUpperCase();
            if (!techId) return 'Usage: mitre-lookup <technique-id>\nExample: mitre-lookup T1566\n\nRelevant techniques for this incident (ATT&CK v19):\n  T1566 -- Phishing (Initial Access)\n  T1190 -- Exploit Public-Facing Application (Initial Access)\n  T1078 -- Valid Accounts (Stealth/Persistence/Privilege Escalation/Initial Access)\n  T1014 -- Rootkit (Stealth)\n  (T1486 Data Encrypted for Impact is intentionally NOT in scope; the attack\n   was RSA-key-theft attempt, not a ransomware deployment.)';

            const techniques = {
                'T1566': {
                    name: 'Phishing',
                    tactic: 'Initial Access',
                    description: 'Adversaries may send phishing messages to gain access to victim systems. All forms of phishing are electronically-delivered social engineering. Spear-phishing is a targeted variant aimed at specific individuals or roles. In this incident, the adversary sent a targeted email impersonating the Director to harvest analyst-04 credentials.',
                    detection: 'Email gateway with anti-phishing analytics (SPF/DKIM/DMARC enforcement). Detect typosquatted domains. URL reputation checks. User-reported phishing pipeline.',
                    mitigation: 'M1017 User Training; M1031 Network Intrusion Prevention; M1054 Software Configuration (mail-gateway rules); SPF/DKIM/DMARC strict policies.'
                },
                'T1190': {
                    name: 'Exploit Public-Facing Application',
                    tactic: 'Initial Access',
                    description: 'Adversaries may attempt to exploit a weakness in an internet-facing application to gain access. In this incident, the adversary exploited a SQL injection (CWE-89) in /app/intake.py /search endpoint after harvesting analyst-04 credentials.',
                    detection: 'Web application firewall logs; anomalous query patterns (UNION SELECT, comment markers); error-response analysis; baseline query templates and alert on deviations.',
                    mitigation: 'M1048 Application Isolation and Sandboxing; M1050 Exploit Protection; parameterized queries (CWE-89 fix); input validation; WAF.'
                },
                'T1078': {
                    name: 'Valid Accounts',
                    tactic: 'Stealth, Persistence, Privilege Escalation, Initial Access',
                    description: 'Adversaries obtain and abuse credentials of existing accounts to maintain access. In this incident, harvested analyst-04 credentials were used to authenticate to the intake portal -- traffic looked legitimate. (Tactic "Stealth" replaced "Defense Evasion" in ATT&CK v19 -- April 2026.)',
                    detection: 'Impossible-travel detection; monitor for accounts authenticating from unexpected IPs (analyst-04 logged in from 185.220.101.47 -- TOR exit); session-anomaly detection.',
                    mitigation: 'M1032 Multi-factor Authentication; M1026 Privileged Account Management; conditional access (geofencing, anomaly-driven challenge).'
                },
                'T1014': {
                    name: 'Rootkit',
                    tactic: 'Stealth',
                    description: 'Adversaries use rootkits to hide programs, files, network connections, services, drivers, and system data. Rootkits achieve persistence and stealth by hooking system-level functions. In this incident, SPX-7720 modified /usr/sbin/sshd and renamed itself to mimic a kernel worker thread.',
                    detection: 'File integrity monitoring on system binaries (/usr/sbin/sshd hash drift); audit kernel hooks; baseline process tree and alert on disguised processes.',
                    mitigation: 'MITRE ATT&CK v19 assigns NO standard M-IDs to T1014 -- the live page states: "This type of attack technique cannot be easily mitigated with preventive controls since it is based on the abuse of system features." Defensive practices that reduce rootkit risk (not formal M-IDs): keep system software patched, enforce Secure Boot + UEFI integrity, use immutable system binaries and read-only system mounts where feasible, deploy file-integrity monitoring on system binaries (the L05 / CS-12 hardening baseline addresses this).'
                }
            };

            const tech = techniques[techId];
            if (!tech) {
                return `MITRE ATT&CK LOOKUP: ${techId}\n\nTechnique not found in local database.\nRelevant techniques for this incident:\n  T1566 -- Phishing (Initial Access)\n  T1190 -- Exploit Public-Facing Application (Initial Access)\n  T1078 -- Valid Accounts (Stealth/Persistence/Priv Esc/Initial Access)\n  T1014 -- Rootkit (Stealth)`;
            }

            if (!engine.config._state.phase1.attackTechniques.includes(techId)) {
                engine.config._state.phase1.attackTechniques.push(techId);
            }

            return `MITRE ATT&CK ENTERPRISE v19\n${'='.repeat(50)}\nTechnique ID:  ${techId}\nName:          ${tech.name}\nTactic:        ${tech.tactic}\n\nDescription:\n  ${tech.description}\n\nDetection:\n  ${tech.detection}\n\nMitigation:\n  ${tech.mitigation}\n\n[Phase 1 progress: ${techId} mapped (${engine.config._state.phase1.attackTechniques.length} technique(s) total)]`;
        },

        // ========== PHASE 2 — Investigation & Hardening ==========

        // audit-app-code <path>
        'audit-app-code': function(args, term, engine) {
            // Gate Phase 2 commands on Phase 1 being complete
            if (!engine.config._flag1Awarded) {
                return 'Phase 2 blocked: complete Phase 1 (triage & attribution) first.\nRun: phase  -- to see what is still missing in Phase 1.';
            }

            const path = args[0] || '';
            if (!path) return 'Usage: audit-app-code <path>\nExample: audit-app-code /app/intake.py';
            // Tightened path gate: only canonical path or bare filename.
            if (path !== '/app/intake.py' && path !== 'intake.py') {
                return `audit-app-code: target '${path}' not in scope.\nThe vulnerable application is /app/intake.py.`;
            }

            engine.config._state.phase2.sqliVectorFound = true;

            return 'APPLICATION CODE AUDIT -- /app/intake.py\n' + '='.repeat(50) + '\nFinding 1: SQL Injection (CWE-89) at /search endpoint\n  Line 27: sql = "SELECT id, name, class, bsl_level FROM specimens\n            WHERE id LIKE \\\'%" + query + "%\\\' OR name LIKE \\\'%" + query + "%\\\'"\n  Vulnerability: User input (query) concatenated directly into the SQL string.\n  Exploit path: attacker injects \\\'%20UNION%20SELECT%20...-- to enumerate other\n               tables (see /app/access.log for the actual exploit queries).\n  Status: ACTIVELY EXPLOITED (00:03-00:05 UTC on 2026-05-19).\n  Severity: CRITICAL (BSL specimen catalog + access-control table exfiltrated).\n\nFinding 2: SAFE pattern (/access-control endpoint)\n  Line 42: cursor.execute("SELECT analyst_id, clearance, expiry FROM access_control")\n  Status: This endpoint uses a static SQL statement with no user input -- safe.\n\nFIX (must apply to /search endpoint):\n  REPLACE line 27 with parameterized form:\n    sql = "SELECT id, name, class, bsl_level FROM specimens WHERE id LIKE ? OR name LIKE ?"\n    cursor.execute(sql, (\'%\' + query + \'%\', \'%\' + query + \'%\'))\n\n  Why parameterized: the SQLite driver substitutes ? placeholders with the bound\n  values AFTER the SQL parser has decided the query structure. User input cannot\n  inject new SQL syntax because it is treated as a value, not as code.\n\n  Additional defense-in-depth:\n    - Input validation: reject queries with special chars (\\\', --, /*, ;).\n    - Length limit on the q parameter (e.g., 64 chars).\n    - Per-user query rate limit.\n    - WAF rule for UNION SELECT patterns in /search?q=.\n\nMaps to: T1190 Exploit Public-Facing Application (already mapped in Phase 1)\nMitigation: M1048 Application Isolation; M1050 Exploit Protection; CWE-89 parameterization.\n\n[Phase 2 progress: SQL injection vector identified and fix designed]';
        },

        // audit-device <ws-id>
        'audit-device': function(args, term, engine) {
            if (!engine.config._flag1Awarded) {
                return 'Phase 2 blocked: complete Phase 1 (triage & attribution) first.\nRun: phase  -- to see what is still missing in Phase 1.';
            }

            const id = (args[0] || '').toLowerCase();
            if (!id) return 'Usage: audit-device <ws-id>\nExample: audit-device ws-04\n\nThe compromised workstation in this incident is ws-04 (analyst-04).';
            if (id !== 'ws-04') {
                return `audit-device: workstation ${id} not in scope for this incident.\nThe compromised workstation is ws-04 (see incident-brief.md).`;
            }

            engine.config._state.phase2.deviceAudited = true;

            return 'DEVICE AUDIT -- WS-04 vs CONTAINMENT STANDARD CS-12\n' + '='.repeat(50) + '\nSource: /device-images/ws-04-audit.json + /device-images/ws-04-bios.txt\n\nCS-12 SOFTWARE CRITERIA:\n  CS-12-1 Full-disk encryption          FAIL  (no LUKS / BitLocker / FileVault)\n  CS-12-2 MDM enrollment                FAIL  (no hex-mdm-agent; no Intune/Jamf)\n  CS-12-3 EDR agent running             FAIL  (no osquery / falcon / sentinel / defender)\n  CS-12-4 Screen lock timeout <= 10min  FAIL  (configured: 60 min)\n\n  Software compliance: 0 of 4 criteria met.\n\nCS-12 HARDWARE CRITERIA:\n  Secure Boot enabled                   FAIL  (disabled in BIOS)\n  TPM 2.0 enrolled                      FAIL  (present, not enrolled)\n  Firmware password set                 FAIL  (not set)\n  USB ports restricted                  FAIL  (all enabled)\n  Network boot disabled                 FAIL  (enabled)\n\n  Hardware compliance: 0 of 5 criteria met.\n\nVERDICT: NON-COMPLIANT (0 of 9 criteria). This device should NOT have been\nissued for field use. Issuance is a separate finding for the IR report --\nwhoever approved this device for analyst-04 needs to be identified.\n\nIMMEDIATE REMEDIATION:\n  1. Wipe + rebuild from hardened image (do NOT attempt clean-in-place; the\n     /usr/sbin/sshd binary modification and cron persistence make in-place\n     remediation unsafe).\n  2. Re-image with CS-12 baseline: LUKS, hex-mdm-agent enrolled, EDR agent\n     running, screen lock 10min, Secure Boot ON, TPM enrolled, firmware\n     password set, USB ports restricted, network boot disabled.\n  3. Rotate analyst-04 credentials.\n  4. Force MFA on analyst-04\'s account (was not enforced -- which is how the\n     phished credentials worked even though the password was unique).\n\nROOT CAUSE FOR ISSUANCE:\n  ws-04 was issued as a "field-temp" device for an audit-prep workflow in\n  February 2026. The temporary issuance was supposed to be revoked within 30\n  days; instead it was extended without re-applying CS-12 baseline. The\n  "temp-issuance" process needs an automatic CS-12 re-check before extension.\n  This is a process finding for the IR report (Phase 4).\n\n[Phase 2 progress: device audit complete -- 9 CS-12 failures, remediation plan drafted]';
        },

        // ========== PHASE 3 — Cryptographic Containment ==========
        // (openssl + sha256sum reuse the L06 pattern, adapted for breach-evidence + intercepted-c2)

        'openssl': function(args, term, engine) {
            if (!engine.config._flag2Awarded) {
                return 'Phase 3 blocked: complete Phase 2 (investigation & hardening) first.\nRun: phase  -- to see what is still missing.';
            }
            if (args.length === 0) {
                return 'OpenSSL 3.2.1 (simulated -- midterm)\nUsage:\n  openssl enc -aes-256-cbc -in <input> -out <output> -pass file:<keyfile>\n  openssl rsautl -decrypt -inkey <keyfile> -in <input> -out <output>';
            }
            const sub = args[0];

            // AES encrypt breach-evidence.dat
            if (sub === 'enc') {
                const algFlag = args.includes('-aes-256-cbc') || args.includes('-aes256');
                const inFlag = args.indexOf('-in');
                const outFlag = args.indexOf('-out');
                const passFlag = args.indexOf('-pass');
                const inFile = inFlag >= 0 ? args[inFlag + 1] : null;
                const outFile = outFlag >= 0 ? args[outFlag + 1] : null;
                const passArg = passFlag >= 0 ? args[passFlag + 1] : null;

                if (!algFlag) return 'Error: Must specify algorithm. Required: -aes-256-cbc\nExample: openssl enc -aes-256-cbc -in /vault/breach-evidence.dat -out /vault/breach-evidence.dat.enc -pass file:/vault/keys/vault-aes-key.bin';
                if (!inFile || !inFile.includes('breach-evidence')) return 'Error: Input file must be /vault/breach-evidence.dat for this operation.';
                if (!outFile) return 'Error: Output file not specified. Use: -out /vault/breach-evidence.dat.enc';
                if (!passArg || !passArg.includes('vault-aes-key')) return 'Error: Wrong key. Use: -pass file:/vault/keys/vault-aes-key.bin';

                engine.config._state.phase3.evidenceEncrypted = true;
                term.fs['/'].children.vault.children['breach-evidence.dat.enc'] = {
                    type: 'file',
                    content: '[AES-256-CBC ENCRYPTED -- vault-aes-key.bin]\n[Binary ciphertext representation]\n5f3c9a2e1b8d7f6a5e4d3c2b1a9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1\n[256+ bytes -- AES-256-CBC with PBKDF2 key derivation]\n'
                };
                return 'openssl enc -aes-256-cbc\n\nEncrypting: /vault/breach-evidence.dat\nAlgorithm:  AES-256-CBC\nKey:        vault-aes-key.bin (256-bit symmetric)\nOutput:     /vault/breach-evidence.dat.enc\n\nKey derivation: PBKDF2-SHA256, 10000 iterations\nIV: randomly generated and prepended to ciphertext\n\nDone. Encrypted evidence file written and ready for upstream transmission to CDC SOC.\nSECURITY NOTE: Key transmission goes via separate channel (courier with vault-aes-key.bin).\nSymmetric crypto: same key encrypts and decrypts; key confidentiality is the entire security model.\n\n[Phase 3 progress: breach evidence encrypted]';
            }

            // RSA decrypt intercepted-c2.enc
            if (sub === 'rsautl' || sub === 'pkeyutl') {
                const decryptFlag = args.includes('-decrypt');
                const inkeyFlag = args.indexOf('-inkey');
                const inFlag = args.indexOf('-in');
                const outFlag = args.indexOf('-out');
                const keyFile = inkeyFlag >= 0 ? args[inkeyFlag + 1] : null;
                const inFile = inFlag >= 0 ? args[inFlag + 1] : null;
                const outFile = outFlag >= 0 ? args[outFlag + 1] : null;

                if (!decryptFlag) return 'Error: Must specify -decrypt for this operation.';
                if (!keyFile || !keyFile.includes('rsa-private')) return 'Error: Wrong key. RSA decryption needs the PRIVATE key: -inkey /vault/keys/vault-rsa-private.pem\n(The public key encrypts. The private key decrypts. Asymmetric property.)';
                if (!inFile || !inFile.includes('intercepted-c2')) return 'Error: Input file must be /vault/intercepted-c2.enc for this operation.';
                if (!outFile) return 'Error: Output file not specified. Use: -out /vault/intercepted-c2.dec';

                engine.config._state.phase3.c2Decrypted = true;
                term.fs['/'].children.vault.children['intercepted-c2.dec'] = {
                    type: 'file',
                    content: '--- DECRYPTED ATTACKER C2 -- captured by ASSET SIGMA ---\nTimestamp: 2026-05-19T01:32:14Z\nClassification: SECRET // INCIDENT-RESPONSE\n\nATTACKER C2 INSTRUCTION SET (decoded):\n  Target: Hexworth vault-rsa-private.pem\n  Method: read file from /vault/keys/ on ws-04 (rootkit attempting to mount\n          encrypted partition with reused-credentials approach)\n  Fallback: if file read fails, exfil /etc/shadow + /var/lib/hexworth/specimens.db\n  Exfil destination: 91.108.4.123:443 (HTTPS-wrapped)\n  Next callback: 2026-05-19T02:00Z\n  Self-destruct on detection: rm -rf /tmp/.X11-update + cron rule + sshd hash restore\n\nSIGMA NOTE:\n  This C2 message was sent at 01:32, before the attacker realized the\n  encrypted partition was mounted with a TPM-bound key (not credentials-only).\n  The rootkit could not get the RSA private key. Isolation at 04:00 ended the\n  session before the fallback exfil ran.\n\n--- END INTERCEPT ---\n'
                };
                return 'openssl rsautl -decrypt\n\nDecrypting: /vault/intercepted-c2.enc\nKey:        vault-rsa-private.pem (RSA-2048)\nOutput:     /vault/intercepted-c2.dec\n\nDecryption successful.\n\nSECURITY NOTE: RSA is asymmetric -- ASSET SIGMA encrypted this with our published\npublic key, so only our private key can read it. This is the foundation of\nencrypted email, TLS handshakes, and out-of-band intercepts.\n\nUse: cat /vault/intercepted-c2.dec to read SIGMA\'s intercept of the attacker C2.\n\n[Phase 3 progress: attacker C2 decrypted]';
            }

            return 'openssl: unknown subcommand "' + sub + '"\nAvailable: enc, rsautl';
        },

        'sha256sum': function(args, term, engine) {
            if (!engine.config._flag2Awarded) {
                return 'Phase 3 blocked: complete Phase 2 first.';
            }
            if (args.length === 0) return 'Usage:\n  sha256sum <file>         Compute hash\n  sha256sum -c <hashfile>  Verify against hash file';

            if (args[0] === '-c') {
                const hashFile = args[1] || '';
                if (!hashFile.includes('manifest-hashes')) {
                    return 'Usage: sha256sum -c /vault/manifest-hashes.txt';
                }
                engine.config._state.phase3.integrityVerified = true;
                return 'Verifying manifest integrity against /vault/manifest-hashes.txt...\n\n/vault/manifest/specimen-catalog.db:  OK\n/vault/manifest/access-control.csv:   OK\n/vault/manifest/audit-log.json:       OK\n\nsha256sum: all 3 files match reference hashes.\n\nFINDING: The specimen catalog and access-control table were EXFILTRATED\n(read by the attacker -- see /app/access.log) but NOT MODIFIED. The reference\nhashes still verify. This means:\n  - The specimen-7720 record was viewed but not tampered.\n  - The access-control entries were viewed but not modified.\n  - Confidentiality was breached (data was read).\n  - Integrity is intact (data was not changed).\n  - Availability is intact (data is still available).\nClassic CIA-triad framing: this incident is a CONFIDENTIALITY breach.\n\n[Phase 3 progress: catalog integrity verified -- confidentiality breach confirmed, integrity intact]';
            }

            // Compute mode -- minimal pass-through
            return 'sha256sum: use -c with /vault/manifest-hashes.txt for the bulk verification this midterm needs.';
        },

        // ========== PHASE 4 — Synthesis Report ==========

        'file-report': function(args, term, engine) {
            if (!engine.config._flag1Awarded) return 'file-report blocked: Flag 1 (Triage) not yet earned. Run: phase';
            if (!engine.config._flag2Awarded) return 'file-report blocked: Flag 2 (Investigation) not yet earned. Run: phase';
            if (!engine.config._flag3Awarded) return 'file-report blocked: Flag 3 (Cryptographic Containment) not yet earned. Run: phase';

            engine.config._state.phase4.reportFiled = true;
            if (!engine.config._flag4Awarded) {
                engine.config._flag4Awarded = true;
                engine.awardFlag('flag4');
            }
            return 'INCIDENT RESPONSE REPORT -- VAULT BREACH (SPX-7720)\n' + '='.repeat(60) + '\nFiled by: morning-shift IR lead (you)\nFiled at: ' + new Date().toISOString() + '\nDistribution: Director, Hexworth Containment + CDC SOC + Internal Audit\n\nEXECUTIVE SUMMARY\n  Overnight 2026-05-18 23:47 UTC, a coordinated attack exploited a series of\n  weaknesses to gain credential access, exfiltrate the specimen catalog, drop\n  a rootkit on an unhardened workstation, and attempt to steal the BSL-4\n  vault RSA private key. Network isolation at 04:00 UTC ended the attack\n  before key exfiltration completed. Confidentiality was breached; integrity\n  and availability remain intact.\n\nATTACK CHAIN (mapped to MITRE ATT&CK v19)\n  1. T1566 Phishing -- spear-phish targeting analyst-04 (Initial Access)\n  2. T1078 Valid Accounts -- harvested credentials used at intake portal (Initial Access / Stealth)\n  3. T1190 Exploit Public-Facing App -- SQLi (CWE-89) on /app/intake.py (Initial Access)\n  4. T1014 Rootkit -- SPX-7720 on ws-04, kernel binary modification (Stealth / Persistence)\n  5. (Attempted) Vault key exfil -- blocked by encrypted-partition + TPM-bound key + network isolation\n\nFINDINGS (cross-cutting)\n  F-01 Credential exposure (HIGH)   -- analyst-04 phished; MFA was not enforced.\n  F-02 SQL injection (CRITICAL)     -- /app/intake.py /search endpoint, CWE-89.\n                                       Fix: parameterized queries (see audit-app-code output).\n  F-03 Device non-compliance (HIGH) -- ws-04 failed 9 of 9 CS-12 criteria.\n                                       Root cause: temp-issuance process did not re-apply CS-12 baseline.\n  F-04 Specimen exfil (HIGH)        -- attacker dumped specimens table + access-control table.\n  F-05 Rootkit persistence (HIGH)   -- /usr/sbin/sshd modified, cron-as-root persistence,\n                                       log destruction. Workstation must be wiped + rebuilt.\n  F-06 Vault key attempt (HIGH)     -- attacker attempted RSA private-key theft. Mitigated by\n                                       TPM-bound encrypted partition + isolation timing.\n\nIMMEDIATE REMEDIATION (next 24h)\n  1. Wipe + rebuild ws-04 from hardened CS-12 image.\n  2. Patch /app/intake.py: replace string-concatenated SQL with parameterized queries.\n  3. Rotate analyst-04 credentials; enforce MFA platform-wide.\n  4. Rotate vault AES + RSA keys as a precaution.\n  5. Block 91.108.4.123 and 185.220.101.47 at edge firewall.\n  6. CDC SOC notification with encrypted evidence package (breach-evidence.dat.enc).\n\nMEDIUM-TERM REMEDIATION (next 30 days)\n  1. Fix the temp-device-issuance process: every extension must re-apply CS-12.\n  2. Application-code audit across all /app/ services for CWE-89 instances.\n  3. Mail-gateway hardening: strict DMARC, SPF, DKIM; sender-domain reputation.\n  4. User training on spear-phishing recognition (impersonation + urgency markers).\n  5. EDR enrollment as a hard prerequisite for ANY field device.\n\nIMPACT ASSESSMENT\n  Confidentiality:  BREACHED (specimen catalog + access-control table exfiltrated)\n  Integrity:        INTACT (no file modifications in vault; sha256sum verified)\n  Availability:     INTACT (vault operational; no ransomware impact)\n\nThis is the synthesis the midterm tests. You have walked the analyst workflow\nend-to-end: classify the threat, identify the vectors, contain cryptographically,\nfile the report. Every skill from Weeks 1 and 2 is in this single report.\n\n[MIDTERM PRACTICAL MILESTONE] Incident report filed. Flag 4 unlocked.\n[MIDTERM PRACTICAL COMPLETE] All four flags earned. Walk into Weeks 3 and 4 with the foundation in place.';
        },

        // ========== GLOBAL — phase status, help ==========

        // phase -- show current phase state + what is missing
        'phase': function(args, term, engine) {
            const s = engine.config._state;
            const lines = ['MIDTERM PHASE STATUS', '='.repeat(50), ''];

            // Phase 1
            const p1items = [
                s.phase1.malwareClassified ? '  [OK] Malware classified (run: malware-classify SPX-7720)' : '  [  ] Malware NOT classified (run: malware-classify SPX-7720)',
                s.phase1.socialEngClassified ? '  [OK] Social engineering classified (run: social-eng-classify ...)' : '  [  ] Social engineering NOT classified (run: social-eng-classify /home/analyst/phishing-email.eml)',
                s.phase1.cveIdentified ? '  [OK] CVE/CWE identified (' + s.phase1.cveIdentified + ')' : '  [  ] CVE/CWE NOT identified (run: cve-search sql injection)',
                '  ' + (s.phase1.attackTechniques.length >= 3 ? '[OK]' : '[  ]') + ' ATT&CK techniques mapped: ' + s.phase1.attackTechniques.length + ' / 3 required (' + (s.phase1.attackTechniques.join(', ') || 'none') + ')'
            ];
            const p1complete = s.phase1.malwareClassified && s.phase1.socialEngClassified && s.phase1.cveIdentified && s.phase1.attackTechniques.length >= 3;
            lines.push('Phase 1 -- Triage & Attribution: ' + (p1complete ? 'COMPLETE' : 'INCOMPLETE'));
            lines.push(...p1items);

            // Award Flag 1 the FIRST time Phase 1 is complete
            if (p1complete && !engine.config._flag1Awarded) {
                engine.config._flag1Awarded = true;
                engine.awardFlag('flag1');
                lines.push('  [PHASE MILESTONE] Phase 1 complete. Flag 1 unlocked.');
            }

            lines.push('');
            // Phase 2
            const p2items = [
                s.phase2.sqliVectorFound ? '  [OK] SQLi vector identified (audit-app-code /app/intake.py)' : '  [  ] SQLi vector NOT identified (run: audit-app-code /app/intake.py)',
                s.phase2.deviceAudited ? '  [OK] Device audited (ws-04)' : '  [  ] Device NOT audited (run: audit-device ws-04)'
            ];
            const p2complete = engine.config._flag1Awarded && s.phase2.sqliVectorFound && s.phase2.deviceAudited;
            lines.push('Phase 2 -- Investigation & Hardening: ' + (p2complete ? 'COMPLETE' : (engine.config._flag1Awarded ? 'INCOMPLETE' : 'LOCKED (complete Phase 1 first)')));
            lines.push(...p2items);

            if (p2complete && !engine.config._flag2Awarded) {
                engine.config._flag2Awarded = true;
                engine.awardFlag('flag2');
                lines.push('  [PHASE MILESTONE] Phase 2 complete. Flag 2 unlocked.');
            }

            lines.push('');
            // Phase 3
            const p3items = [
                s.phase3.evidenceEncrypted ? '  [OK] Breach evidence AES-encrypted' : '  [  ] Breach evidence NOT encrypted (run: openssl enc -aes-256-cbc ...)',
                s.phase3.c2Decrypted ? '  [OK] Attacker C2 RSA-decrypted' : '  [  ] Attacker C2 NOT decrypted (run: openssl rsautl -decrypt ...)',
                s.phase3.integrityVerified ? '  [OK] Catalog integrity verified (sha256sum -c)' : '  [  ] Catalog integrity NOT verified (run: sha256sum -c /vault/manifest-hashes.txt)'
            ];
            const p3complete = engine.config._flag2Awarded && s.phase3.evidenceEncrypted && s.phase3.c2Decrypted && s.phase3.integrityVerified;
            lines.push('Phase 3 -- Cryptographic Containment: ' + (p3complete ? 'COMPLETE' : (engine.config._flag2Awarded ? 'INCOMPLETE' : 'LOCKED (complete Phase 2 first)')));
            lines.push(...p3items);

            if (p3complete && !engine.config._flag3Awarded) {
                engine.config._flag3Awarded = true;
                engine.awardFlag('flag3');
                lines.push('  [PHASE MILESTONE] Phase 3 complete. Flag 3 unlocked.');
            }

            lines.push('');
            // Phase 4
            lines.push('Phase 4 -- Synthesis Report: ' + (engine.config._flag4Awarded ? 'COMPLETE' : (engine.config._flag3Awarded ? 'READY (run: file-report)' : 'LOCKED (complete Phase 3 first)')));

            return lines.join('\n');
        },

        // help -- full command reference
        'help': function(args, term, engine) {
            return 'MIDTERM PRACTICAL -- COMMAND REFERENCE\n\nPhase 1 (Triage & Attribution):\n  malware-classify <id>           Classify malware family\n  social-eng-classify <file>      Classify social-engineering technique\n  cve-search <term>               CVE/CWE database lookup\n  mitre-lookup <T-id>             ATT&CK technique lookup (v19)\n\nPhase 2 (Investigation & Hardening) -- requires Flag 1:\n  audit-app-code <path>           Inspect app code for injection\n  audit-device <ws-id>            Audit endpoint vs CS-12\n\nPhase 3 (Crypto Containment) -- requires Flag 2:\n  openssl enc -aes-256-cbc ...    Encrypt evidence (AES-256-CBC)\n  openssl rsautl -decrypt ...     Decrypt intercepted C2 (RSA)\n  sha256sum -c <hashfile>         Verify catalog integrity\n\nPhase 4 (Synthesis Report) -- requires Flags 1+2+3:\n  file-report                     File the incident report (Flag 4)\n\nGlobal:\n  phase                           Show current phase status\n  cat <file>                      Read a file\n  ls <path>                       List directory\n\nKey files:\n  /home/analyst/incident-brief.md       Scenario brief\n  /home/analyst/notes.txt               Compact reference\n  /home/analyst/phishing-email.eml      For social-eng-classify\n  /home/analyst/intrusion-logs.txt      For malware-classify\n  /app/intake.py + /app/access.log      For audit-app-code\n  /device-images/ws-04-*                For audit-device\n  /vault/breach-evidence.dat            Phase 3 -- encrypt this\n  /vault/intercepted-c2.enc             Phase 3 -- decrypt this\n  /vault/manifest-hashes.txt            Phase 3 -- verify against\n\nATT&CK techniques in scope:\n  T1566 Phishing                                    (Initial Access)\n  T1190 Exploit Public-Facing Application          (Initial Access)\n  T1078 Valid Accounts                              (Stealth/Persistence/Priv Esc/Initial Access)\n  T1014 Rootkit                                     (Stealth)';
        }
    },

    // =========================================================
    // FLAGS
    // =========================================================

    flags: [
        {
            id: 'flag1',
            value: 'FLAG{pis-m2-vault-breach_flag1_triage_complete}',
            label: 'Phase 1 -- Triage & Attribution Complete',
            description: 'Classified the malware family, the social-engineering technique, identified the vulnerability class, and mapped at least 3 ATT&CK techniques.',
            points: 250,
            autoCheck: true
        },
        {
            id: 'flag2',
            value: 'FLAG{pis-m2-vault-breach_flag2_investigation_complete}',
            label: 'Phase 2 -- Investigation & Hardening Complete',
            description: 'Identified the SQLi vector in /app/intake.py and audited ws-04 against CS-12.',
            points: 250,
            autoCheck: true
        },
        {
            id: 'flag3',
            value: 'FLAG{pis-m2-vault-breach_flag3_crypto_contained}',
            label: 'Phase 3 -- Cryptographic Containment Complete',
            description: 'AES-encrypted the breach evidence, RSA-decrypted the attacker C2, and SHA-256-verified the specimen catalog integrity.',
            points: 250,
            autoCheck: true
        },
        {
            id: 'flag4',
            value: 'FLAG{pis-m2-vault-breach_flag4_report_filed}',
            label: 'Phase 4 -- Synthesis Report Filed',
            description: 'Filed the complete incident response report joining all prior phases.',
            points: 250,
            autoCheck: true
        }
    ],

    // =========================================================
    // SCORING
    // =========================================================

    scoring: {
        // base: starting score (BoxEngine line 198)
        // maxScore: max flag points gainable (4 flags x 250 = 1000)
        // True engine-computed max = base + maxScore + speedBonus = 2200
        base: 1000,
        minScore: 0,
        maxScore: 1000,
        hintPenalty: true,
        wrongFlagPenalty: -25,
        // speedBonus: completion in 30 min (33% of 90-min budget) earns +200 pts
        // speedBonus.threshold (ms): completion within 30 min (33% of 90-min budget)
        // earns +200 pts. BoxEngine reads scoring.speedBonus.threshold at line 1691
        // of BoxEngine.js. Note: `timeBonusThreshold` was unused dead config -- removed.
        speedBonus: { threshold: 1800000, points: 200 }
    },

    // =========================================================
    // HINTS
    // =========================================================

    hints: [
        {
            id: 'hint1',
            text: 'Phase 1 has 4 sub-tasks (malware family, social-eng technique, CVE/CWE class, and 3 ATT&CK techniques mapped). Run "phase" anytime to see which sub-tasks remain. The malware behavior is documented in detail in /home/analyst/malware-behavior.json -- the JSON includes a "family_candidates_with_reasoning" block that walks each candidate.',
            cost: 100,
            penalty: -100
        },
        {
            id: 'hint2',
            text: 'The SQL injection in /app/intake.py is at the /search endpoint. The /access-control endpoint is the SAFE counter-example -- compare them. The fix is parameterized queries: cursor.execute(sql, (param,)) with ? placeholders, NOT string concatenation.',
            cost: 100,
            penalty: -100
        },
        {
            id: 'hint3',
            text: 'The CS-12 device audit returns a clear pass/fail per criterion. The compromised device fails ALL criteria -- this is by design (a non-compliant device is how the attack succeeded). The audit findings drive the remediation plan in your final report.',
            cost: 100,
            penalty: -100
        },
        {
            id: 'hint4',
            text: 'The cryptographic operations mirror L06: AES-256-CBC for symmetric (breach-evidence.dat -> encrypted package for transmission), RSA private-key decrypt for the intercepted C2 (SIGMA encrypted with our public key, so only our private key reads it), and sha256sum -c for bulk integrity verification. The exact commands are in /home/analyst/notes.txt.',
            cost: 100,
            penalty: -100
        },
        {
            id: 'hint5',
            text: 'file-report is gated on Flags 1+2+3. If it refuses, run "phase" -- it shows exactly which prior phase is blocking. The report joins the attack chain (ATT&CK techniques), the technical findings (SQLi + device audit), and the cryptographic outcomes (evidence encrypted, C2 decrypted, integrity verified) into one coherent narrative.',
            cost: 100,
            penalty: -100
        }
    ],

    // =========================================================
    // CERT OBJECTIVES
    // =========================================================

    certObjectives: {
        certPath: 'CompTIA Security+ SY0-701',
        mappings: [
            { flagId: 'flag1', objective: '2.4', description: 'Given a scenario, analyze indicators of malicious activity', skill: 'Malware family identification + social-engineering technique classification + CVE-to-ATT&CK mapping' },
            { flagId: 'flag1', objective: '4.3', description: 'Given a scenario, analyze indicators of malicious activity', skill: 'Scenario-driven triage and attribution from telemetry' },
            { flagId: 'flag2', objective: '2.5', description: 'Explain the purpose of mitigation techniques used to secure the enterprise', skill: 'Identify SQL injection (CWE-89) and design the parameterized-query fix' },
            { flagId: 'flag2', objective: '3.2', description: 'Given a scenario, apply security principles to secure enterprise infrastructure', skill: 'Audit endpoint against CS-12 secure-baseline standard; identify hardening failures and draft remediation' },
            { flagId: 'flag3', objective: '1.4', description: 'Explain the importance of using appropriate cryptographic solutions', skill: 'AES-256-CBC symmetric + RSA-2048 asymmetric + SHA-256 integrity under real incident-response pressure' },
            { flagId: 'flag4', objective: '4.7', description: 'Explain the importance of incident response activities', skill: 'Synthesize cross-domain findings into a complete IR report joining attack chain, technical findings, and cryptographic outcomes' }
        ]
    },

    resetState: function() {
        this._state = {
        // Phase tracking
        phase1: { malwareClassified: false, socialEngClassified: false, cveIdentified: false, attackTechniques: [] },
        phase2: { sqliVectorFound: false, deviceAudited: false },
        phase3: { evidenceEncrypted: false, c2Decrypted: false, integrityVerified: false },
        phase4: { reportFiled: false }
    };
        this._flag1Awarded = false;
        this._flag2Awarded = false;
        this._flag3Awarded = false;
        this._flag4Awarded = false;
    }


};


// Auto-reset state on script load (BOX-006 backfill 2026-05-23)
if (typeof PISM2Config !== 'undefined') PISM2Config.resetState();
