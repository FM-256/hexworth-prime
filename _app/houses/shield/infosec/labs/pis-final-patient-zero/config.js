/* ============================================================
   PIS-FINAL: Patient Zero -- Final Practical Exam
   Principles of Information Security -- 7-phase CTF Final
   Eclipse difficulty -- 7 flags, 1500 base, 750 max scored.
   Walkthrough: v1.2 Karl-pass (round 2), Nancy-PROCEED (round 2).
   Covers SY0-701: 1.4, 2.4, 2.5, 4.1, 4.3, 4.7 (substantive);
   3.2 and 5.2 (narrow/awareness depth). See walkthrough §10.
   ============================================================ */

const PISFinalConfig = {

    // =========================================================
    // BOX METADATA
    // =========================================================

    title: 'Patient Zero',
    subtitle: 'Final Practical -- Cascading Compromise -- Full Incident Response',
    description: 'Three days ago Crimson Dawn Logistics suffered a $4.2M wire fraud. A spear-phishing invoice lure dropped Cobalt Strike Beacon via CVE-2022-30190 (Follina), established C2 for 72 hours, and vanished before the network was isolated. You are the lead incident responder brought in on day 3. Seven phases. Seven flags. The synthesis flag is gated on all six prior flags -- wrong or missing any one of them changes the hash. Eclipse difficulty: 2x hint penalty, -40 wrong-flag, score floor at 0.',
    difficulty: 'Eclipse',
    estimatedTime: 90,
    accent: '#dc2626',
    storageKey: 'hexworth_lab_pis_final',
    registryId: 'pis-final-patient-zero',
    trackerKey: 'lab_pis_final',

    // Eclipse-tier lobby: single blinking "ECLIPSE" button instead of the
    // mode/difficulty pickers. Forces solo + hard.
    lobbyMode: 'eclipse',
    forceMode: 'solo',
    forceDifficulty: 'hard',

    // =========================================================
    // BOOT SEQUENCE
    // =========================================================

    boot: {
        biosLines: [
            'HEXWORTH IR WORKSTATION v6.1.0',
            'Crimson Dawn Incident -- Wire Fraud Investigation',
            'Status: NETWORK ISOLATED · Day 3 of incident',
            'Webmail (recovered): accounts@crimson-dawn.net inbox restored',
            'Threat intel feed: SYNCED (HexIntel 2026-05-21)',
            'CVE database mirror: SYNCED (NVD 2026-05-21)',
            'Rapid7 InsightVM: REGISTERED (scan queue available)',
            'Patch Management: LOGGED IN (admin)',
            'SIEM-lite log viewer: AUTH + DNS + FIREWALL feeds loaded'
        ],
        grubEntries: [
            'IR Analyst OS 22.04 LTS',
            'IR Analyst OS (recovery mode)'
        ],
        loginUser: 'ir-lead'
    },

    // =========================================================
    // LORE
    // =========================================================

    lore: {
        intro: 'Three days ago Crimson Dawn Logistics was breached. A wire fraud transfer of $4.2M was sent to an offshore account before anyone noticed. By the time IT shut the network down, the attacker had been resident for ~72 hours. The bank flagged the transfer this morning. You arrived on-site at 09:00.',
        scenario: 'You are the lead incident responder. Seven phases of work ahead: find the phishing email that started it (Phase 1), fingerprint the malware and CVE (Phase 2), map the attacker infrastructure via DNS and PKI (Phase 3), identify the threat actor and origin (Phase 4), correlate SIEM logs to find Patient Zero (Phase 5), contain and remediate (Phase 6), and produce the final IR synthesis (Phase 7). Every phase feeds the next. The synthesis flag is structurally gated -- every prior flag value is an input to the hash.',
        outro: 'IR finding filed. Seven phases. Seven flags. You walked from phishing triage through malware classification, infrastructure pivot, threat attribution, SIEM correlation, and validated remediation. The Director has the full picture. What you produced is the evidence and the recommended plan -- the operations team takes it from here.',
        goals: [
            'Identify the real phishing email by header analysis -- SPF/DKIM/DMARC + Reply-To mismatch (W1 social engineering + W2 email crypto)',
            'Hash the payload and identify the malware family and exploited CVE (W1 malware classification)',
            'Pivot from the X.509 cert SAN list to map the full attacker infrastructure including canonical C2 (W2 cryptography + W3 PKI)',
            'Match TTPs to the correct APT group and cross-reference IP geolocation with actor-origin enrichment (W1 threat actors + W3 sec ops)',
            'Join DNS query logs to auth logs to isolate the one employee whose foreign-IP login is unexplained (W3 sec ops + W4 authentication)',
            'Apply the correct CVE patch, validate with Rapid7 InsightVM scan, configure a properly-scoped mail filter (W2 device security + W4 IR)',
            'Compute SHA256 synthesis flag from all six prior flag values (W4 IR writeup)'
        ],
        toolkit: [
            { name: 'dig',        purpose: 'DNS lookup for domains and IPs',                     sample: 'dig emberwolf-c2.duckdns.org' },
            { name: 'whois',      purpose: 'Domain or IP registration lookup',                   sample: 'whois crimson-dawn-finance.net' },
            { name: 'host',       purpose: 'Alias for dig',                                      sample: 'host nakamura-suppliers-corp.com' },
            { name: 'openssl',    purpose: 'TLS cert inspection + cert parsing',                  sample: 'openssl s_client -connect crimson-dawn-finance.net:443 -showcerts' },
            { name: 'sha256sum',  purpose: 'Hash a file in the downloads/ dir',                  sample: 'sha256sum /home/ir-lead/downloads/Nakamura-Q1-2026-CORRECTED.docx' },
            { name: 'file',       purpose: 'Identify file type and embedded indicators',         sample: 'file /home/ir-lead/downloads/Nakamura-Q1-2026-CORRECTED.docx' },
            { name: 'phase',      purpose: 'Show current phase status and what is still missing', sample: 'phase' },
            { name: 'help',       purpose: 'Full command reference',                              sample: 'help' }
        ]
    },

    // =========================================================
    // TERMINAL CONFIG
    // =========================================================

    terminal: {
        user: 'ir-lead',
        hostname: 'ir-ws-01',
        startDir: '/home/ir-lead',
        // Simulated terminal does not interpret < > as I/O redirects --
        // angle brackets in flag values pass through as literal characters.
        // This is intentional per walkthrough §11 build note.
        welcome: '*** CRIMSON DAWN -- DAY 3 ***\n$4.2M wire fraud. 72 hours of attacker dwell.\nYou are the lead IR. Find Patient Zero.\n\nSEVEN PHASES:\n  Phase 1 -- Inbox Triage           (find the real phishing email)\n  Phase 2 -- Payload ID             (malware family + CVE)\n  Phase 3 -- DNS + PKI Forensics    (map attacker infrastructure)\n  Phase 4 -- Attribution + Geo      (name the threat actor + origin)\n  Phase 5 -- SIEM Correlation       (identify Patient Zero)\n  Phase 6 -- Contain + Remediate    (patch + scan + mail filter)\n  Phase 7 -- Synthesis              (gated -- produce derived flag)\n\nHints cost double on Eclipse. Wrong flags cost 40 points.\nDirector needs the IR finding by 17:00.\n\nStart: cat /home/ir-lead/incident-brief.md\nWorkflow: phase  (shows what is still missing in current phase)\nReference: cat /home/ir-lead/notes.txt\nType "help" for command reference.\n'
    },

    // =========================================================
    // DESKTOP ICONS
    // =========================================================

    desktop: {
        icons: [
            { id: 'briefing', label: 'Briefing',    icon: '\uD83D\uDCCB',       app: 'briefing' },
            { id: 'terminal', label: 'Terminal',    icon: '\uD83D\uDDA5\uFE0F', app: 'terminal' },
            { id: 'browser',  label: 'Firefox',     icon: '\uD83C\uDF10',       app: 'browser'  },
            { id: 'notes',    label: 'Notes',       icon: '\uD83D\uDCDD',       app: 'notes'    },
            { id: 'hints',    label: 'Hints',       icon: '\uD83D\uDCA1',       app: 'hints'    },
            { id: 'flags',    label: 'Submit Flag', icon: '\uD83D\uDEA9',       app: 'flags'    }
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
                        'ir-lead': {
                            type: 'dir',
                            children: {
                                'incident-brief.md': {
                                    type: 'file',
                                    content: 'INCIDENT BRIEF -- CRIMSON DAWN WIRE FRAUD (2026-05-18)\n======================================================\nReceived: 2026-05-21 09:00 from IT security manager\nClassification: INTERNAL // INCIDENT-RESPONSE\nSeverity: CRITICAL ($4.2M wire fraud)\n\nRECONSTRUCTED TIMELINE:\n\n2026-05-18 09:12 -- DNS log shows queries to an unrecognized domain\n                    from at least one AP workstation.\n\n2026-05-18 09:14 -- $4.2M wire transfer authorized via a duplicate-invoice\n                    fraud. Wire sent to offshore account ending in -7741.\n\n2026-05-18 09:14 -- Same timestamp: SIEM auth log records a login from\n                    an external IP address.\n\n2026-05-21 06:30 -- Bank flags the transfer; IT notified.\n\n2026-05-21 07:00 -- Network isolated. All AP workstations quarantined.\n\n2026-05-21 09:00 -- You arrive on-site. Webmail for the shared AP inbox\n                    accounts@crimson-dawn.net has been forensically recovered\n                    and is available in the browser (bookmark: Webmail).\n\nSCOPE:\n\nThree employees in Accounts Payable + Vendor Management had access to\nthe wire-approval workflow:\n\n  e.morales   AP clerk (WS-EMORALES-01, 10.0.4.18)\n  r.chen      AP supervisor (WS-RCHEN-01, 10.0.4.6)\n  s.patel     Vendor Management (currently on a London business trip)\n              NOTE: s.patel has an approved travel record -- HR ticket\n              #TR-2026-0418, calendar offsite 2026-05-15 to 2026-05-22.\n              Four prior London sessions on record. Her foreign-IP logins\n              are expected -- see SIEM auth log for inline provenance.\n\nThirteen messages in the AP shared inbox spanning the 60 hours before the wire and a few hours after. One of them is the active phish that enabled the wire fraud; the rest are a mix of legitimate internal mail, recurring vendor notifications, and unrelated phishing attempts (some legitimate-looking but with header-level tells -- SPF/DKIM/DMARC failures, mismatched Reply-To, fake sender domains).\nOpen webmail at https://mail.crimson-dawn.net/inbox\n\nAvailable IR tools (browser bookmarks):\n  Webmail:           https://mail.crimson-dawn.net/inbox\n  CVE Search:        https://cve.crimson-intel.net/search\n  WHOIS Lookup:      https://whois.crimson-intel.net\n  Hash Analyzer:     https://vt-mirror.crimson-intel.net\n  Threat Intel:      https://intel.crimson-intel.net\n  IP Geolocation:    https://ipgeo.crimson-intel.net\n  SIEM-lite:         https://siem.crimson-dawn.net\n  Patch Mgmt:        https://patch.crimson-dawn.net\n  Rapid7 InsightVM:  https://insightvm.crimson-dawn.net\n  Mail Admin:        https://mailadmin.crimson-dawn.net\n\nRun: phase  -- to see current phase status at any time.\n'
                                },
                                'notes.txt': {
                                    type: 'file',
                                    content: 'FINAL PRACTICAL -- COMMAND REFERENCE\n=====================================\n\nTerminal commands:\n  dig <domain>          DNS A-record lookup\n  whois <domain|ip>     Registration info\n  host <domain>         Alias for dig\n  sha256sum <file>      Hash a file in downloads/\n  file <file>           Identify file type\n\nOpenSSL (TLS cert inspection):\n  openssl s_client -connect <host>:443 -showcerts\n    -- pipe the output through:\n  openssl x509 -noout -text\n    -- or grep the SAN directly:\n  openssl s_client -connect <host>:443 -showcerts | openssl x509 -noout -text | grep -A1 "Subject Alternative"\n\nPhase status:\n  phase                 Show current phase + what is still missing\n  help                  Full command reference\n\nKey files:\n  /home/ir-lead/incident-brief.md         Scenario brief\n  /home/ir-lead/downloads/                Attachment downloads land here\n  /evidence/pcap-day1.txt                 Day-1 firewall log excerpt\n\nSynthesis formula (Phase 7):\n  echo -n "<flag1>|<flag2>|<flag3>|<flag4>|<flag5>|<flag6>" | sha256sum | awk \'{print toupper(substr($1,1,16))}\'\n  NOTE: outer double-quotes are load-bearing -- flag1 contains angle brackets.\n'
                                },
                                'downloads': {
                                    type: 'dir',
                                    children: {}
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'cat /home/ir-lead/incident-brief.md\nphase\n'
                                }
                            }
                        }
                    }
                },
                'evidence': {
                    type: 'dir',
                    children: {
                        'README.txt': {
                            type: 'file',
                            content: 'EVIDENCE DIRECTORY -- CRIMSON DAWN WIRE FRAUD\n=============================================\nContents:\n  pcap-day1.txt    Day-1 firewall log excerpt (2026-05-18, 06:00-12:00)\n                   Useful for Phase 5: correlating DNS queries to outbound\n                   TCP connections on e.morales\' workstation (10.0.4.18).\n\nAll SIEM data is also available in the browser:\n  https://siem.crimson-dawn.net\n'
                        },
                        'pcap-day1.txt': {
                            type: 'file',
                            content: 'FIREWALL LOG EXCERPT -- 2026-05-18 06:00-12:00 UTC\n===================================================\nFormat: TIMESTAMP  SRC_IP:PORT  DST_IP:PORT  PROTO  BYTES_OUT  ACTION\n\n08:14:22  10.0.4.6:52140   8.8.8.8:53       UDP    72    ALLOW\n08:31:05  10.0.4.22:49310  52.86.14.93:443  TCP    1840  ALLOW\n08:55:44  10.0.4.18:51200  8.8.8.8:53       UDP    72    ALLOW\n09:01:13  10.0.4.6:52188   10.0.0.1:80      TCP    320   ALLOW\n09:12:00  10.0.4.18:51244  8.8.8.8:53       UDP    84    ALLOW   [DNS: crimson-dawn-finance.net -> 104.21.45.122]\n09:12:33  10.0.4.18:51248  8.8.8.8:53       UDP    86    ALLOW   [DNS: emberwolf-c2.duckdns.org -> 185.220.101.45]\n09:13:01  10.0.4.18:51302  185.220.101.45:443  TCP  4096  ALLOW  [C2 HEARTBEAT]\n09:13:16  10.0.4.18:51303  185.220.101.45:443  TCP  512   ALLOW  [C2 BEACON]\n09:15:44  10.0.4.6:52210   10.0.1.5:8080    TCP    1024  ALLOW\n09:22:18  10.0.4.10:49800  52.94.228.167:443 TCP   2048  ALLOW\n09:40:05  10.0.4.18:51400  185.220.101.45:443  TCP  8192  ALLOW  [C2 EXFIL attempt]\n09:55:30  10.0.4.6:52250   8.8.4.4:53       UDP    72    ALLOW\n10:11:00  10.0.4.18:51500  185.220.101.45:443  TCP  512   ALLOW  [C2 HEARTBEAT]\n11:34:05  10.0.4.6:52300   8.8.8.8:53       UDP    84    ALLOW   [DNS: crimson-dawn-finance.net -> 104.21.45.122]\n11:40:22  10.0.4.6:52310   10.0.0.1:80      TCP    320   ALLOW\n\nNote: The DNS annotation lines [DNS: ...] are SIEM correlation overlays\nadded by the IR team after the fact -- not native to the raw pcap.\nSee https://siem.crimson-dawn.net for the full 14-day DNS + auth + firewall\nlog dataset with filter controls.\n'
                        }
                    }
                }
            }
        }
    },

    // =========================================================
    // INTERNAL STATE
    // Phase flags are checked on `phase` command and on flag submit.
    // =========================================================

    _phaseState: {
        current: 1,
        completed: []
    },

    _db: {
        // Patch state persists Phase 6 actions
        patch_state: {
            applied: [],   // CVE IDs applied
            undone: []     // CVE IDs that were applied then undone
        },
        // Mail filter state for Phase 6
        mail_filter_state: {
            active: false,
            rule: null
        },
        // Rapid7 scan state
        rapid7_scan_state: {
            ran: false,
            result: null,  // 'clean' | 'vulnerable' | 'wrong_patch'
            scan_id: null
        },
        // Attachment downloads for Phase 2 (written by webmail click)
        hash_db: {
            'Nakamura-Q1-2026-CORRECTED.docx': 'b3a4f8c2d7e91a6e5f8c2b1d9a4f7e3c8b6d2a1f9e7c4b8a6d3f2e1c9b8a7f4d',
            'budget-Q1-final.xlsx':             '4a1b2c3d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b'
        },
        file_types: {
            'Nakamura-Q1-2026-CORRECTED.docx': 'Microsoft OOXML (contains: external template reference)',
            'budget-Q1-final.xlsx':             'Microsoft Excel spreadsheet, no anomalies.'
        },
        // Canonical synthesis flag value (computed at config build time 2026-05-21)
        // Algorithm: echo -n "<F1F2A4E8.20260518123045@crimson-dawn-finance.net>|COBALT_STRIKE:CVE-2022-30190|emberwolf-c2.duckdns.org|EMBERWOLF:RU|e.morales|REMED-OK-S7K9P2" | sha256sum | awk '{print toupper(substr($1,1,16))}'
        synthesis_flag: 'A82A44DCA64FA463'
    },

    // =========================================================
    // WEB APP -- 11 browser surfaces
    // =========================================================

    webApp: {
        startUrl: 'https://mail.crimson-dawn.net/inbox',

        pages: {

            // ─────────────────────────────────────────────────
            // A. WEBMAIL: mail.crimson-dawn.net
            // ─────────────────────────────────────────────────

            '/inbox': {
                title: 'Inbox -- accounts@crimson-dawn.net',
                html: `
                <div style="font-family:system-ui,sans-serif; max-width:800px; margin:0 auto; padding:16px;">
                    <div style="border-bottom:2px solid #dc2626; padding-bottom:12px; margin-bottom:16px;">
                        <div style="font-size:0.75rem; color:#888; letter-spacing:0.1em; text-transform:uppercase;">CRIMSON DAWN WEBMAIL</div>
                        <div style="font-size:1rem; font-weight:700; color:#222; margin-top:2px;">Inbox: accounts@crimson-dawn.net</div>
                        <div style="font-size:0.72rem; color:#888; margin-top:4px;">Forensically recovered -- 48h window before wire transfer (2026-05-17 to 2026-05-18)</div>
                    </div>
                    <table style="width:100%; border-collapse:collapse; font-size:0.82rem;">
                        <thead>
                            <tr style="background:#f5f5f5;">
                                <th style="padding:8px 12px; text-align:left; color:#555; font-weight:600; border-bottom:1px solid #ddd;">#</th>
                                <th style="padding:8px 12px; text-align:left; color:#555; font-weight:600; border-bottom:1px solid #ddd;">From</th>
                                <th style="padding:8px 12px; text-align:left; color:#555; font-weight:600; border-bottom:1px solid #ddd;">Subject</th>
                                <th style="padding:8px 12px; text-align:left; color:#555; font-weight:600; border-bottom:1px solid #ddd;">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:8px 12px; color:#888;">1</td>
                                <td style="padding:8px 12px;">ar@officedepot.com</td>
                                <td style="padding:8px 12px;"><a href="https://mail.crimson-dawn.net/msg/8" style="color:#222; text-decoration:none;">Invoice OD-2026-44890 -- Office supplies May</a></td>
                                <td style="padding:8px 12px; color:#888; font-size:0.77rem;">2026-05-16 16:40</td>
                            </tr>
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:8px 12px; color:#888;">2</td>
                                <td style="padding:8px 12px;">security@microsoft-365-account.com</td>
                                <td style="padding:8px 12px;"><a href="https://mail.crimson-dawn.net/msg/9" style="color:#dc2626; text-decoration:none; font-weight:600;">Unusual sign-in activity on your Microsoft account</a></td>
                                <td style="padding:8px 12px; color:#888; font-size:0.77rem;">2026-05-17 09:55</td>
                            </tr>
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:8px 12px; color:#888;">3</td>
                                <td style="padding:8px 12px;">no-reply@zoom.us</td>
                                <td style="padding:8px 12px;"><a href="https://mail.crimson-dawn.net/msg/10" style="color:#222; text-decoration:none;">Recurring meeting reminder: AP Weekly Sync (Thursdays)</a></td>
                                <td style="padding:8px 12px; color:#888; font-size:0.77rem;">2026-05-17 11:20</td>
                            </tr>
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:8px 12px; color:#888;">4</td>
                                <td style="padding:8px 12px;">it-helpdesk@crimson-dawn.net</td>
                                <td style="padding:8px 12px;"><a href="https://mail.crimson-dawn.net/msg/1" style="color:#dc2626; text-decoration:none; font-weight:600;">MANDATORY: Password rotation TODAY</a></td>
                                <td style="padding:8px 12px; color:#888; font-size:0.77rem;">2026-05-17 14:22</td>
                            </tr>
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:8px 12px; color:#888;">5</td>
                                <td style="padding:8px 12px;">payroll-alerts@adp-secure-portal.com</td>
                                <td style="padding:8px 12px;"><a href="https://mail.crimson-dawn.net/msg/2" style="color:#dc2626; text-decoration:none; font-weight:600;">Direct deposit verification required</a></td>
                                <td style="padding:8px 12px; color:#888; font-size:0.77rem;">2026-05-17 16:08</td>
                            </tr>
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:8px 12px; color:#888;">6</td>
                                <td style="padding:8px 12px;">noreply@fedex-shipping-update.com</td>
                                <td style="padding:8px 12px;"><a href="https://mail.crimson-dawn.net/msg/3" style="color:#dc2626; text-decoration:none; font-weight:600;">Delivery exception #4470029</a></td>
                                <td style="padding:8px 12px; color:#888; font-size:0.77rem;">2026-05-17 18:45</td>
                            </tr>
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:8px 12px; color:#888;">7</td>
                                <td style="padding:8px 12px;">accounts@nakamura-supplies.com</td>
                                <td style="padding:8px 12px;"><a href="https://mail.crimson-dawn.net/msg/4" style="color:#222; text-decoration:none;">Invoice 2026-Q1-114 (corrected version)</a></td>
                                <td style="padding:8px 12px; color:#888; font-size:0.77rem;">2026-05-18 08:54</td>
                            </tr>
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:8px 12px; color:#888;">8</td>
                                <td style="padding:8px 12px;">m.harlowe@crimson-dawn.net</td>
                                <td style="padding:8px 12px;"><a href="https://mail.crimson-dawn.net/msg/5" style="color:#222; text-decoration:none;">Re: Q1 budget review</a></td>
                                <td style="padding:8px 12px; color:#888; font-size:0.77rem;">2026-05-18 09:30</td>
                            </tr>
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:8px 12px; color:#888;">9</td>
                                <td style="padding:8px 12px;">notification@slack.com</td>
                                <td style="padding:8px 12px;"><a href="https://mail.crimson-dawn.net/msg/12" style="color:#222; text-decoration:none;">r.chen mentioned you in #ap-team</a></td>
                                <td style="padding:8px 12px; color:#888; font-size:0.77rem;">2026-05-18 09:45</td>
                            </tr>
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:8px 12px; color:#888;">10</td>
                                <td style="padding:8px 12px;">support@calendly.com</td>
                                <td style="padding:8px 12px;"><a href="https://mail.crimson-dawn.net/msg/6" style="color:#222; text-decoration:none;">Meeting confirmation: 2026-05-19 14:00</a></td>
                                <td style="padding:8px 12px; color:#888; font-size:0.77rem;">2026-05-18 10:15</td>
                            </tr>
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:8px 12px; color:#888;">11</td>
                                <td style="padding:8px 12px;">compliance@crimson-dawn.net</td>
                                <td style="padding:8px 12px;"><a href="https://mail.crimson-dawn.net/msg/7" style="color:#222; text-decoration:none;">Quarterly compliance attestation form</a></td>
                                <td style="padding:8px 12px; color:#888; font-size:0.77rem;">2026-05-18 11:00</td>
                            </tr>
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:8px 12px; color:#888;">12</td>
                                <td style="padding:8px 12px;">billing@adobe-renewal-services.com</td>
                                <td style="padding:8px 12px;"><a href="https://mail.crimson-dawn.net/msg/13" style="color:#dc2626; text-decoration:none; font-weight:600;">ACTION REQUIRED: Adobe Creative Cloud subscription auto-renewed</a></td>
                                <td style="padding:8px 12px; color:#888; font-size:0.77rem;">2026-05-18 11:55</td>
                            </tr>
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:8px 12px; color:#888;">13</td>
                                <td style="padding:8px 12px;">wires-alerts@chase-bizbanking.com</td>
                                <td style="padding:8px 12px;"><a href="https://mail.crimson-dawn.net/msg/11" style="color:#dc2626; text-decoration:none; font-weight:600;">ACTION REQUIRED: Outgoing wire $4,200,000.00 review</a></td>
                                <td style="padding:8px 12px; color:#888; font-size:0.77rem;">2026-05-18 13:15</td>
                            </tr>
                        </tbody>
                    </table>
                    <div style="margin-top:12px; padding:10px; background:#f8f8f8; border:1px solid #ddd; border-radius:4px; font-size:0.72rem; color:#888;">
                        13 messages total &mdash; click any message to view full headers and body
                    </div>
                </div>`
            },

            '/msg/1': {
                title: 'Message 1 -- MANDATORY: Password rotation TODAY',
                html: `
                <div style="font-family:system-ui,sans-serif; max-width:780px; margin:0 auto; padding:16px;">
                    <a href="https://mail.crimson-dawn.net/inbox" style="color:#dc2626; font-size:0.8rem; text-decoration:none;">&larr; Back to Inbox</a>
                    <h2 style="font-size:1rem; margin:12px 0 4px;">MANDATORY: Password rotation TODAY</h2>
                    <div style="background:#f5f5f5; border:1px solid #ddd; border-radius:4px; padding:12px; margin-bottom:12px; font-size:0.78rem; font-family:monospace; line-height:1.7;">
                        <div><b>From:</b> it-helpdesk@crimson-dawn.net</div>
                        <div><b>To:</b> accounts@crimson-dawn.net</div>
                        <div><b>Date:</b> Mon, 17 May 2026 14:22:11 +0000</div>
                        <div><b>Message-ID:</b> &lt;HD.20260517142211@crimson-dawn.net&gt;</div>
                        <div><b>Reply-To:</b> it-helpdesk@crimson-dawn.net</div>
                        <div><b>Authentication-Results:</b> <span style="color:#2ecc71; font-weight:bold;">spf=pass</span> dkim=pass dmarc=pass</div>
                        <div><b>X-Originating-IP:</b> 10.0.1.5</div>
                    </div>
                    <div style="font-size:0.85rem; line-height:1.7; padding:12px; border:1px solid #eee; border-radius:4px;">
                        <p>All Accounts Payable staff,</p>
                        <p>Security policy requires all staff rotate their AD passwords today before 17:00. A failure to rotate will result in your account being locked at EOD.</p>
                        <p>Use the internal self-service portal: <a href="https://passwd.crimson-dawn.net/reset" style="color:#dc2626; text-decoration:underline; font-family:monospace;">https://passwd.crimson-dawn.net/reset</a></p>
                        <p>-- IT Helpdesk</p>
                    </div>
                    <div style="margin-top:10px; padding:10px; background:#e8f8ee; border:1px solid #2ecc71; border-radius:4px; font-size:0.78rem;">
                        <b>Analysis:</b> SPF pass, DKIM pass, DMARC pass. Sender domain matches crimson-dawn.net. Message-ID host matches sender domain. Originating IP is internal (10.0.1.5). This message is <b>legitimate internal mail</b> -- a decoy candidate.
                    </div>
                </div>`
            },

            '/msg/2': {
                title: 'Message 2 -- Direct deposit verification required',
                html: `
                <div style="font-family:system-ui,sans-serif; max-width:780px; margin:0 auto; padding:16px;">
                    <a href="https://mail.crimson-dawn.net/inbox" style="color:#dc2626; font-size:0.8rem; text-decoration:none;">&larr; Back to Inbox</a>
                    <h2 style="font-size:1rem; margin:12px 0 4px;">Direct deposit verification required</h2>
                    <div style="background:#f5f5f5; border:1px solid #ddd; border-radius:4px; padding:12px; margin-bottom:12px; font-size:0.78rem; font-family:monospace; line-height:1.7;">
                        <div><b>From:</b> payroll-alerts@adp-secure-portal.com</div>
                        <div><b>To:</b> accounts@crimson-dawn.net</div>
                        <div><b>Date:</b> Mon, 17 May 2026 16:08:44 +0000</div>
                        <div><b>Message-ID:</b> &lt;ADP.20260517160844@adp-secure-portal.com&gt;</div>
                        <div><b>Reply-To:</b> payroll-alerts@adp-secure-portal.com</div>
                        <div><b>Authentication-Results:</b> <span style="color:#2ecc71; font-weight:bold;">spf=pass</span> dkim=pass dmarc=pass</div>
                        <div><b>X-Originating-IP:</b> 204.111.12.88</div>
                    </div>
                    <div style="font-size:0.85rem; line-height:1.7; padding:12px; border:1px solid #eee; border-radius:4px;">
                        <p>Action Required: Your payroll direct deposit information needs to be re-verified due to a recent bank routing update.</p>
                        <p>Log in to verify your account details: <a href="https://adp-secure-portal.com/verify" style="color:#dc2626; text-decoration:underline; font-family:monospace;">https://adp-secure-portal.com/verify</a></p>
                        <p>-- ADP Payroll Services</p>
                    </div>
                    <div style="margin-top:10px; padding:10px; background:#e8f8ee; border:1px solid #2ecc71; border-radius:4px; font-size:0.78rem;">
                        <b>Analysis:</b> SPF pass, DKIM pass, DMARC pass. Although the subject is alarming, all authentication headers pass. Reply-To matches From. This is spam-adjacent but <b>not the active phish</b> in this incident.
                    </div>
                </div>`
            },

            '/msg/3': {
                title: 'Message 3 -- Delivery exception #4470029',
                html: `
                <div style="font-family:system-ui,sans-serif; max-width:780px; margin:0 auto; padding:16px;">
                    <a href="https://mail.crimson-dawn.net/inbox" style="color:#dc2626; font-size:0.8rem; text-decoration:none;">&larr; Back to Inbox</a>
                    <h2 style="font-size:1rem; margin:12px 0 4px;">Delivery exception #4470029</h2>
                    <div style="background:#f5f5f5; border:1px solid #ddd; border-radius:4px; padding:12px; margin-bottom:12px; font-size:0.78rem; font-family:monospace; line-height:1.7;">
                        <div><b>From:</b> noreply@fedex-shipping-update.com</div>
                        <div><b>To:</b> accounts@crimson-dawn.net</div>
                        <div><b>Date:</b> Mon, 17 May 2026 18:45:02 +0000</div>
                        <div><b>Message-ID:</b> &lt;FDX.20260517184502@fedex-shipping-update.com&gt;</div>
                        <div><b>Reply-To:</b> noreply@fedex-shipping-update.com</div>
                        <div><b>Authentication-Results:</b> <span style="color:#2ecc71; font-weight:bold;">spf=pass</span> dkim=pass dmarc=pass</div>
                        <div><b>X-Originating-IP:</b> 161.199.0.14</div>
                    </div>
                    <div style="font-size:0.85rem; line-height:1.7; padding:12px; border:1px solid #eee; border-radius:4px;">
                        <p>Your shipment #4470029 has experienced a delivery exception. A customs hold has been placed on your package.</p>
                        <p>Review exception details: <a href="https://fedex-shipping-update.com/exception/4470029" style="color:#dc2626; text-decoration:underline; font-family:monospace;">https://fedex-shipping-update.com/exception/4470029</a></p>
                        <p>-- FedEx Notification Services</p>
                    </div>
                    <div style="margin-top:10px; padding:10px; background:#e8f8ee; border:1px solid #2ecc71; border-radius:4px; font-size:0.78rem;">
                        <b>Analysis:</b> SPF pass, DKIM pass, DMARC pass. Looks suspicious on the surface but all authentication passes. Reply-To matches From. <b>Not the active phish</b> -- decoy. The intuition trap here is intentional (W2 skill: surface red flags != active phish).
                    </div>
                </div>`
            },

            '/msg/4': {
                title: 'Message 4 -- Invoice 2026-Q1-114 (corrected version)',
                html: `
                <div style="font-family:system-ui,sans-serif; max-width:780px; margin:0 auto; padding:16px;">
                    <a href="https://mail.crimson-dawn.net/inbox" style="color:#dc2626; font-size:0.8rem; text-decoration:none;">&larr; Back to Inbox</a>
                    <h2 style="font-size:1rem; margin:12px 0 4px;">Invoice 2026-Q1-114 (corrected version)</h2>
                    <div style="background:#f5f5f5; border:1px solid #ddd; border-radius:4px; padding:12px; margin-bottom:12px; font-size:0.78rem; font-family:monospace; line-height:1.7;">
                        <div><b>From:</b> accounts@nakamura-supplies.com</div>
                        <div><b>To:</b> accounts@crimson-dawn.net</div>
                        <div><b>Date:</b> Mon, 18 May 2026 08:54:31 +0000</div>
                        <div><b>Message-ID:</b> <span style="color:#dc2626; font-weight:bold;">&lt;F1F2A4E8.20260518123045@crimson-dawn-finance.net&gt;</span></div>
                        <div><b>Reply-To:</b> <span style="color:#dc2626; font-weight:bold;">payments@nakamura-suppliers-corp.com</span> &nbsp;<span style="color:#dc2626;">&larr; MISMATCH: Reply-To domain differs from From</span></div>
                        <div><b>Authentication-Results:</b> <span style="color:#dc2626; font-weight:bold;">spf=neutral</span> <span style="color:#dc2626; font-weight:bold;">dkim=fail</span> <span style="color:#dc2626; font-weight:bold;">dmarc=fail</span></div>
                        <div><b>X-Originating-IP:</b> <span style="color:#dc2626; font-weight:bold;">185.220.101.45</span> &nbsp;<span style="color:#888;">(Foreign ASN -- not Nakamura Supplies published infra)</span></div>
                    </div>
                    <div style="font-size:0.85rem; line-height:1.7; padding:12px; border:1px solid #eee; border-radius:4px;">
                        <p>Dear Accounts Payable Team,</p>
                        <p>Please find attached the corrected invoice for Q1 2026. There was an error in our previous submission regarding the unit pricing on items 14 and 22. The corrected total is reflected in the attached document.</p>
                        <p>If you have any questions, please reply to this message or contact our payments team directly.</p>
                        <p>Attachment: <a href="https://mail.crimson-dawn.net/downloads/Nakamura-Q1-2026-CORRECTED.docx" style="color:#dc2626; font-weight:600;">Nakamura-Q1-2026-CORRECTED.docx</a> (click to download to /home/ir-lead/downloads/)</p>
                        <p>-- Nakamura Supplies Accounts Department</p>
                    </div>
                    <div style="margin-top:10px; padding:10px; background:#fff0f0; border:1px solid #dc2626; border-radius:4px; font-size:0.78rem;">
                        <b style="color:#dc2626;">Analysis -- multiple red flags in headers:</b><br>
                        1. Message-ID host is <code>crimson-dawn-finance.net</code> -- does NOT match the From domain <code>nakamura-supplies.com</code><br>
                        2. Reply-To is <code>payments@nakamura-suppliers-corp.com</code> -- note "suppliers" (with -s) and "-corp" suffix -- different domain than From<br>
                        3. SPF neutral -- sender IP not authorized by nakamura-supplies.com SPF record<br>
                        4. DKIM fail -- signature invalid (body tampered or sender impersonated)<br>
                        5. DMARC fail -- neither SPF nor DKIM alignment achieved<br>
                        6. X-Originating-IP 185.220.101.45 -- not associated with Nakamura Supplies infrastructure
                    </div>
                </div>`,
                formHandler: function(data, engine) {
                    // Download handler is wired via link interception in Browser.js
                    return '';
                }
            },

            '/downloads/Nakamura-Q1-2026-CORRECTED.docx': {
                title: 'Download: Nakamura-Q1-2026-CORRECTED.docx',
                html: function(qs, browser) {
                    // Write file to filesystem when this URL is hit
                    if (browser && browser.engine && browser.engine.config) {
                        const cfg = browser.engine.config;
                        const fs = cfg.filesystem;
                        if (fs['/'].children.home.children['ir-lead'].children.downloads) {
                            fs['/'].children.home.children['ir-lead'].children.downloads.children['Nakamura-Q1-2026-CORRECTED.docx'] = {
                                type: 'file',
                                content: '[BINARY: Microsoft OOXML document]\n[Contains: external template reference -- this is how the Follina exploit delivers the payload]\n[SHA-256: b3a4f8c2d7e91a6e5f8c2b1d9a4f7e3c8b6d2a1f9e7c4b8a6d3f2e1c9b8a7f4d]\n[File saved to /home/ir-lead/downloads/Nakamura-Q1-2026-CORRECTED.docx]'
                            };
                        }
                    }
                    return `
                    <div style="font-family:system-ui,sans-serif; max-width:600px; margin:40px auto; text-align:center; padding:24px;">
                        <div style="font-size:2rem; margin-bottom:12px; color:#2ecc71;">&#10003;</div>
                        <h2 style="font-size:1rem; margin-bottom:8px; color:#222;">File Downloaded</h2>
                        <div style="font-size:0.82rem; color:#555; margin-bottom:16px;">
                            <strong>Nakamura-Q1-2026-CORRECTED.docx</strong> saved to<br>
                            <code style="color:#dc2626;">/home/ir-lead/downloads/</code>
                        </div>
                        <div style="font-size:0.78rem; color:#888; padding:10px; background:#f8f8f8; border-radius:4px; border:1px solid #ddd; text-align:left;">
                            Next step (Phase 2):<br>
                            In the terminal, run:<br>
                            <code>sha256sum /home/ir-lead/downloads/Nakamura-Q1-2026-CORRECTED.docx</code><br>
                            Then look up the hash at: <a href="https://vt-mirror.crimson-intel.net" style="color:#dc2626;">https://vt-mirror.crimson-intel.net</a>
                        </div>
                        <div style="margin-top:12px;"><a href="https://mail.crimson-dawn.net/msg/4" style="color:#dc2626; font-size:0.8rem; text-decoration:none;">&larr; Back to message</a></div>
                    </div>`;
                }
            },

            '/msg/5': {
                title: 'Message 5 -- Re: Q1 budget review',
                html: `
                <div style="font-family:system-ui,sans-serif; max-width:780px; margin:0 auto; padding:16px;">
                    <a href="https://mail.crimson-dawn.net/inbox" style="color:#dc2626; font-size:0.8rem; text-decoration:none;">&larr; Back to Inbox</a>
                    <h2 style="font-size:1rem; margin:12px 0 4px;">Re: Q1 budget review</h2>
                    <div style="background:#f5f5f5; border:1px solid #ddd; border-radius:4px; padding:12px; margin-bottom:12px; font-size:0.78rem; font-family:monospace; line-height:1.7;">
                        <div><b>From:</b> m.harlowe@crimson-dawn.net</div>
                        <div><b>To:</b> accounts@crimson-dawn.net</div>
                        <div><b>Date:</b> Mon, 18 May 2026 09:30:14 +0000</div>
                        <div><b>Message-ID:</b> &lt;MH.20260518093014@crimson-dawn.net&gt;</div>
                        <div><b>Reply-To:</b> m.harlowe@crimson-dawn.net</div>
                        <div><b>Authentication-Results:</b> <span style="color:#2ecc71; font-weight:bold;">spf=pass</span> dkim=pass dmarc=pass</div>
                        <div><b>X-Originating-IP:</b> 10.0.1.8</div>
                    </div>
                    <div style="font-size:0.85rem; line-height:1.7; padding:12px; border:1px solid #eee; border-radius:4px;">
                        <p>Team,</p>
                        <p>Attaching the final Q1 budget numbers after the corrections from last week's review. Please confirm once received.</p>
                        <p>Attachment: <a href="https://mail.crimson-dawn.net/downloads/budget-Q1-final.xlsx" style="color:#222;">budget-Q1-final.xlsx</a> (legitimate internal attachment -- decoy for Phase 2)</p>
                        <p>-- Marcus Harlowe, Finance</p>
                    </div>
                    <div style="margin-top:10px; padding:10px; background:#e8f8ee; border:1px solid #2ecc71; border-radius:4px; font-size:0.78rem;">
                        <b>Analysis:</b> SPF pass, DKIM pass, DMARC pass. Internal sender, internal originating IP. Reply-To matches From. Legitimate correspondence. The attached budget file is <b>benign</b> -- hashing it returns a clean result in the hash analyzer.
                    </div>
                </div>`
            },

            '/downloads/budget-Q1-final.xlsx': {
                title: 'Download: budget-Q1-final.xlsx',
                html: function(qs, browser) {
                    if (browser && browser.engine && browser.engine.config) {
                        const cfg = browser.engine.config;
                        const fs = cfg.filesystem;
                        if (fs['/'].children.home.children['ir-lead'].children.downloads) {
                            fs['/'].children.home.children['ir-lead'].children.downloads.children['budget-Q1-final.xlsx'] = {
                                type: 'file',
                                content: '[BINARY: Microsoft Excel spreadsheet]\n[No anomalies detected]\n[SHA-256: 4a1b2c3d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b]\n[File saved to /home/ir-lead/downloads/budget-Q1-final.xlsx]'
                            };
                        }
                    }
                    return `
                    <div style="font-family:system-ui,sans-serif; max-width:600px; margin:40px auto; text-align:center; padding:24px;">
                        <div style="font-size:2rem; margin-bottom:12px; color:#2ecc71;">&#10003;</div>
                        <h2 style="font-size:1rem; margin-bottom:8px;">budget-Q1-final.xlsx downloaded</h2>
                        <div style="font-size:0.78rem; color:#888;">Saved to /home/ir-lead/downloads/budget-Q1-final.xlsx</div>
                        <div style="margin-top:12px;"><a href="https://mail.crimson-dawn.net/msg/5" style="color:#dc2626; font-size:0.8rem; text-decoration:none;">&larr; Back</a></div>
                    </div>`;
                }
            },

            '/msg/6': {
                title: 'Message 6 -- Meeting confirmation',
                html: `
                <div style="font-family:system-ui,sans-serif; max-width:780px; margin:0 auto; padding:16px;">
                    <a href="https://mail.crimson-dawn.net/inbox" style="color:#dc2626; font-size:0.8rem; text-decoration:none;">&larr; Back to Inbox</a>
                    <h2 style="font-size:1rem; margin:12px 0 4px;">Meeting confirmation: 2026-05-19 14:00</h2>
                    <div style="background:#f5f5f5; border:1px solid #ddd; border-radius:4px; padding:12px; margin-bottom:12px; font-size:0.78rem; font-family:monospace; line-height:1.7;">
                        <div><b>From:</b> support@calendly.com</div>
                        <div><b>To:</b> accounts@crimson-dawn.net</div>
                        <div><b>Date:</b> Mon, 18 May 2026 10:15:00 +0000</div>
                        <div><b>Message-ID:</b> &lt;CAL.20260518101500@calendly.com&gt;</div>
                        <div><b>Reply-To:</b> support@calendly.com</div>
                        <div><b>Authentication-Results:</b> <span style="color:#2ecc71; font-weight:bold;">spf=pass</span> dkim=pass dmarc=pass</div>
                        <div><b>X-Originating-IP:</b> 104.16.88.25</div>
                    </div>
                    <div style="font-size:0.85rem; line-height:1.7; padding:12px; border:1px solid #eee; border-radius:4px;">
                        <p>Your meeting "Q2 Vendor Review" has been confirmed for 2026-05-19 at 14:00 UTC with J. Rivera from Accounts.</p>
                        <p>-- Calendly Notification Services</p>
                    </div>
                    <div style="margin-top:10px; padding:10px; background:#e8f8ee; border:1px solid #2ecc71; border-radius:4px; font-size:0.78rem;">
                        <b>Analysis:</b> Legitimate notification from Calendly. All auth passes. Not relevant to this incident.
                    </div>
                </div>`
            },

            '/msg/7': {
                title: 'Message 7 -- Quarterly compliance attestation',
                html: `
                <div style="font-family:system-ui,sans-serif; max-width:780px; margin:0 auto; padding:16px;">
                    <a href="https://mail.crimson-dawn.net/inbox" style="color:#dc2626; font-size:0.8rem; text-decoration:none;">&larr; Back to Inbox</a>
                    <h2 style="font-size:1rem; margin:12px 0 4px;">Quarterly compliance attestation form</h2>
                    <div style="background:#f5f5f5; border:1px solid #ddd; border-radius:4px; padding:12px; margin-bottom:12px; font-size:0.78rem; font-family:monospace; line-height:1.7;">
                        <div><b>From:</b> compliance@crimson-dawn.net</div>
                        <div><b>To:</b> accounts@crimson-dawn.net</div>
                        <div><b>Date:</b> Mon, 18 May 2026 11:00:00 +0000</div>
                        <div><b>Message-ID:</b> &lt;CMP.20260518110000@crimson-dawn.net&gt;</div>
                        <div><b>Reply-To:</b> compliance@crimson-dawn.net</div>
                        <div><b>Authentication-Results:</b> <span style="color:#2ecc71; font-weight:bold;">spf=pass</span> dkim=pass dmarc=pass</div>
                        <div><b>X-Originating-IP:</b> 10.0.2.3</div>
                    </div>
                    <div style="font-size:0.85rem; line-height:1.7; padding:12px; border:1px solid #eee; border-radius:4px;">
                        <p>Please complete the Q2 2026 compliance attestation by end of week. Link: <a href="https://compliance.crimson-dawn.net/attest/Q2-2026" style="color:#dc2626; text-decoration:underline; font-family:monospace;">https://compliance.crimson-dawn.net/attest/Q2-2026</a></p>
                        <p>-- Compliance Office</p>
                    </div>
                    <div style="margin-top:10px; padding:10px; background:#e8f8ee; border:1px solid #2ecc71; border-radius:4px; font-size:0.78rem;">
                        <b>Analysis:</b> Legitimate internal mail. All auth passes. Not relevant to this incident.
                    </div>
                </div>`
            },

            // ─────────────────────────────────────────────────
            // A1b. NOISE-LAYER MESSAGES (decoy expansion)
            //   Six additional messages added 2026-06-03 to bury the
            //   active phish (msg/4) in a larger inbox. Mix of legit
            //   decoys and phishing decoys with obvious header tells
            //   (SPF/DKIM/DMARC failures, mismatched Reply-To, fake
            //   sender domains). Numbered 8-13 to preserve existing
            //   msg/1-7 routes. The inbox table renders them in
            //   chronological order alongside msg/1-7.
            // ─────────────────────────────────────────────────

            '/msg/8': {
                title: 'Message 8 -- Invoice OD-2026-44890 -- Office supplies May',
                html: `
                <div style="font-family:system-ui,sans-serif; max-width:780px; margin:0 auto; padding:16px;">
                    <a href="https://mail.crimson-dawn.net/inbox" style="color:#dc2626; font-size:0.8rem; text-decoration:none;">&larr; Back to Inbox</a>
                    <h2 style="font-size:1rem; margin:12px 0 4px;">Invoice OD-2026-44890 -- Office supplies May</h2>
                    <div style="background:#f5f5f5; border:1px solid #ddd; border-radius:4px; padding:12px; margin-bottom:12px; font-size:0.78rem; font-family:monospace; line-height:1.7;">
                        <div><b>From:</b> ar@officedepot.com</div>
                        <div><b>To:</b> accounts@crimson-dawn.net</div>
                        <div><b>Date:</b> Sat, 16 May 2026 16:40:11 +0000</div>
                        <div><b>Message-ID:</b> &lt;OD.20260516164011.44890@officedepot.com&gt;</div>
                        <div><b>Reply-To:</b> ar@officedepot.com</div>
                        <div><b>Authentication-Results:</b> <span style="color:#2ecc71; font-weight:bold;">spf=pass dkim=pass dmarc=pass</span></div>
                        <div><b>X-Originating-IP:</b> 198.51.100.42</div>
                    </div>
                    <div style="font-size:0.85rem; line-height:1.7; padding:12px; border:1px solid #eee; border-radius:4px;">
                        <p>Hello,</p><p>Your monthly office supplies invoice is attached. Total due: $1,247.62. Payment terms net-30. PO reference: AP-CD-2026-04.</p><p>If you have questions, reply to this email or call your account manager Karen Liu at (212) 555-0184.</p><p>-- Office Depot Business Accounts Receivable</p>
                    </div>
                    <div style="margin-top:10px; padding:10px; background:#e8f8ee; border:1px solid #2ecc71; border-radius:4px; font-size:0.78rem;">
                        <b>Analysis:</b> Legitimate vendor invoice. Sender domain matches officedepot.com. All authentication passes. Originating IP is consistent with Office Depot\'s network. Routine monthly AR notification; not relevant to this incident.
                    </div>
                </div>`
            },

            '/msg/9': {
                title: 'Message 9 -- Unusual sign-in activity on your Microsoft account',
                html: `
                <div style="font-family:system-ui,sans-serif; max-width:780px; margin:0 auto; padding:16px;">
                    <a href="https://mail.crimson-dawn.net/inbox" style="color:#dc2626; font-size:0.8rem; text-decoration:none;">&larr; Back to Inbox</a>
                    <h2 style="font-size:1rem; margin:12px 0 4px;">Unusual sign-in activity on your Microsoft account</h2>
                    <div style="background:#f5f5f5; border:1px solid #ddd; border-radius:4px; padding:12px; margin-bottom:12px; font-size:0.78rem; font-family:monospace; line-height:1.7;">
                        <div><b>From:</b> security@microsoft-365-account.com</div>
                        <div><b>To:</b> accounts@crimson-dawn.net</div>
                        <div><b>Date:</b> Sun, 17 May 2026 09:55:33 +0000</div>
                        <div><b>Message-ID:</b> &lt;MS365.20260517095533@microsoft-365-account.com&gt;</div>
                        <div><b>Reply-To:</b> security@microsoft-365-account.com</div>
                        <div><b>Authentication-Results:</b> <span style="color:#e74c3c; font-weight:bold;">spf=FAIL dkim=neutral dmarc=fail</span></div>
                        <div><b>X-Originating-IP:</b> 185.157.122.49</div>
                    </div>
                    <div style="font-size:0.85rem; line-height:1.7; padding:12px; border:1px solid #eee; border-radius:4px;">
                        <p>Microsoft Security Alert</p><p>We detected a sign-in to your Microsoft 365 account from an unrecognized device in Stockholm, Sweden. If this was you, no action is needed. If not, secure your account immediately.</p><p>Review the sign-in: <a href="https://microsoft-365-account.com/verify-signin?id=AC8842" style="color:#dc2626; text-decoration:underline; font-family:monospace;">https://microsoft-365-account.com/verify-signin?id=AC8842</a></p><p>-- Microsoft Account Team</p>
                    </div>
                    <div style="margin-top:10px; padding:10px; background:#ffe6e6; border:1px solid #e74c3c; border-radius:4px; font-size:0.78rem;">
                        <b>Analysis:</b> PHISHING DECOY. The sender domain <code>microsoft-365-account.com</code> is not a real Microsoft domain (Microsoft uses <code>account.microsoft.com</code> and <code>account.live.com</code>). SPF FAILS and DMARC FAILS -- both are highlighted in the headers. The originating IP <code>185.157.122.49</code> resolves to a hosting provider in Bulgaria, not a Microsoft data center. Classic credential-harvest pattern; would have routed to a Microsoft-impersonation login page. Decoy for this incident, but a real threat in its own right -- a student who clicks that URL would have been compromised in production.
                    </div>
                </div>`
            },

            '/msg/10': {
                title: 'Message 10 -- Recurring meeting reminder: AP Weekly Sync (Thursdays)',
                html: `
                <div style="font-family:system-ui,sans-serif; max-width:780px; margin:0 auto; padding:16px;">
                    <a href="https://mail.crimson-dawn.net/inbox" style="color:#dc2626; font-size:0.8rem; text-decoration:none;">&larr; Back to Inbox</a>
                    <h2 style="font-size:1rem; margin:12px 0 4px;">Recurring meeting reminder: AP Weekly Sync (Thursdays)</h2>
                    <div style="background:#f5f5f5; border:1px solid #ddd; border-radius:4px; padding:12px; margin-bottom:12px; font-size:0.78rem; font-family:monospace; line-height:1.7;">
                        <div><b>From:</b> no-reply@zoom.us</div>
                        <div><b>To:</b> accounts@crimson-dawn.net</div>
                        <div><b>Date:</b> Sun, 17 May 2026 11:20:00 +0000</div>
                        <div><b>Message-ID:</b> &lt;ZM.20260517112000.recurring-441@zoom.us&gt;</div>
                        <div><b>Reply-To:</b> no-reply@zoom.us</div>
                        <div><b>Authentication-Results:</b> <span style="color:#2ecc71; font-weight:bold;">spf=pass dkim=pass dmarc=pass</span></div>
                        <div><b>X-Originating-IP:</b> 170.114.45.18</div>
                    </div>
                    <div style="font-size:0.85rem; line-height:1.7; padding:12px; border:1px solid #eee; border-radius:4px;">
                        <p>Hi Elena,</p><p>Reminder: your recurring meeting "Accounts Payable Weekly Sync" with R. Chen, M. Harlowe, and S. Patel is scheduled for Thursday May 22 at 14:00 UTC.</p><p>Join URL: <a href="https://crimson-dawn.zoom.us/j/85544192033" style="color:#2d8cff; text-decoration:underline; font-family:monospace;">https://crimson-dawn.zoom.us/j/85544192033</a></p><p>-- Zoom Meetings</p>
                    </div>
                    <div style="margin-top:10px; padding:10px; background:#e8f8ee; border:1px solid #2ecc71; border-radius:4px; font-size:0.78rem;">
                        <b>Analysis:</b> Legitimate Zoom notification. SPF/DKIM/DMARC all pass. Originating IP is in Zoom\'s ARIN-allocated range. Recurring meeting reminder unrelated to the incident; routine AP team comms.
                    </div>
                </div>`
            },

            '/msg/11': {
                title: 'Message 11 -- ACTION REQUIRED: Outgoing wire $4,200,000.00 review',
                html: `
                <div style="font-family:system-ui,sans-serif; max-width:780px; margin:0 auto; padding:16px;">
                    <a href="https://mail.crimson-dawn.net/inbox" style="color:#dc2626; font-size:0.8rem; text-decoration:none;">&larr; Back to Inbox</a>
                    <h2 style="font-size:1rem; margin:12px 0 4px;">ACTION REQUIRED: Outgoing wire $4,200,000.00 review</h2>
                    <div style="background:#f5f5f5; border:1px solid #ddd; border-radius:4px; padding:12px; margin-bottom:12px; font-size:0.78rem; font-family:monospace; line-height:1.7;">
                        <div><b>From:</b> wires-alerts@chase-bizbanking.com</div>
                        <div><b>To:</b> accounts@crimson-dawn.net</div>
                        <div><b>Date:</b> Mon, 18 May 2026 13:15:09 +0000</div>
                        <div><b>Message-ID:</b> &lt;CH.20260518131509@chase-bizbanking.com&gt;</div>
                        <div><b>Reply-To:</b> wires-alerts@chase-bizbanking.com</div>
                        <div><b>Authentication-Results:</b> <span style="color:#e74c3c; font-weight:bold;">spf=FAIL dkim=fail dmarc=fail</span></div>
                        <div><b>X-Originating-IP:</b> 45.83.91.122</div>
                    </div>
                    <div style="font-size:0.85rem; line-height:1.7; padding:12px; border:1px solid #eee; border-radius:4px;">
                        <p>Chase Business Banking Wire Alert</p><p>An outgoing wire of $4,200,000.00 to account ending <b>-7741</b> requires your review. If not authorized, click below to dispute within 60 minutes.</p><p>Review wire: <a href="https://chase-bizbanking.com/wires/review/PNFAH-7741" style="color:#dc2626; text-decoration:underline; font-family:monospace;">https://chase-bizbanking.com/wires/review/PNFAH-7741</a></p><p>-- Chase Business Banking</p>
                    </div>
                    <div style="margin-top:10px; padding:10px; background:#ffe6e6; border:1px solid #e74c3c; border-radius:4px; font-size:0.78rem;">
                        <b>Analysis:</b> PHISHING DECOY -- and a particularly cynical one: a follow-up scam timed AFTER the actual wire fraud, attempting to harvest credentials from someone now panicked about the loss. The sender domain <code>chase-bizbanking.com</code> is not Chase (Chase uses <code>chase.com</code> and <code>jpmorganchase.com</code>). All three auth checks FAIL. The amount $4.2M and account suffix -7741 match the real fraud -- the attacker (or a different scammer monitoring the breach) is using public knowledge of the fraud to set up a secondary social-engineering attack. NOT the source of the original wire fraud; that traces to msg/4. This message arrived AFTER the wire on 2026-05-18 at 13:15 UTC, four hours post-loss.
                    </div>
                </div>`
            },

            '/msg/12': {
                title: 'Message 12 -- r.chen mentioned you in #ap-team',
                html: `
                <div style="font-family:system-ui,sans-serif; max-width:780px; margin:0 auto; padding:16px;">
                    <a href="https://mail.crimson-dawn.net/inbox" style="color:#dc2626; font-size:0.8rem; text-decoration:none;">&larr; Back to Inbox</a>
                    <h2 style="font-size:1rem; margin:12px 0 4px;">r.chen mentioned you in #ap-team</h2>
                    <div style="background:#f5f5f5; border:1px solid #ddd; border-radius:4px; padding:12px; margin-bottom:12px; font-size:0.78rem; font-family:monospace; line-height:1.7;">
                        <div><b>From:</b> notification@slack.com</div>
                        <div><b>To:</b> accounts@crimson-dawn.net</div>
                        <div><b>Date:</b> Mon, 18 May 2026 09:45:22 +0000</div>
                        <div><b>Message-ID:</b> &lt;SL.20260518094522.AP4421@slack.com&gt;</div>
                        <div><b>Reply-To:</b> no-reply@slack.com</div>
                        <div><b>Authentication-Results:</b> <span style="color:#2ecc71; font-weight:bold;">spf=pass dkim=pass dmarc=pass</span></div>
                        <div><b>X-Originating-IP:</b> 18.142.5.99</div>
                    </div>
                    <div style="font-size:0.85rem; line-height:1.7; padding:12px; border:1px solid #eee; border-radius:4px;">
                        <p>r.chen mentioned you in <b>#ap-team</b> on Crimson Dawn Slack:</p><blockquote style="border-left:3px solid #ddd; padding:4px 12px; margin:8px 0; color:#444;">@e.morales -- please verify the May vendor master is up to date by EOM. Want to make sure the Nakamura entry has the corrected wire routing from this morning. Thanks. -- r.chen</blockquote><p>Open in Slack: <a href="https://crimson-dawn.slack.com/archives/C04AP4421/p1726658722" style="color:#1264a3; text-decoration:underline; font-family:monospace;">https://crimson-dawn.slack.com/archives/C04AP4421/p1726658722</a></p>
                    </div>
                    <div style="margin-top:10px; padding:10px; background:#e8f8ee; border:1px solid #2ecc71; border-radius:4px; font-size:0.78rem;">
                        <b>Analysis:</b> Legitimate Slack notification. SPF/DKIM/DMARC all pass. Originating IP is in Slack\'s AWS-allocated range. <b>Note the topical timing:</b> r.chen references the Nakamura wire routing -- this is the AP supervisor following up on what she believed was a legitimate vendor update earlier in the morning. Connect this message back to msg/4 during Phase 1 review: the supervisor is unknowingly endorsing the fraudulent routing from msg/4. The Slack message itself is legitimate; the underlying business state it describes is compromised.
                    </div>
                </div>`
            },

            '/msg/13': {
                title: 'Message 13 -- ACTION REQUIRED: Adobe Creative Cloud subscription auto-renewed',
                html: `
                <div style="font-family:system-ui,sans-serif; max-width:780px; margin:0 auto; padding:16px;">
                    <a href="https://mail.crimson-dawn.net/inbox" style="color:#dc2626; font-size:0.8rem; text-decoration:none;">&larr; Back to Inbox</a>
                    <h2 style="font-size:1rem; margin:12px 0 4px;">ACTION REQUIRED: Adobe Creative Cloud subscription auto-renewed</h2>
                    <div style="background:#f5f5f5; border:1px solid #ddd; border-radius:4px; padding:12px; margin-bottom:12px; font-size:0.78rem; font-family:monospace; line-height:1.7;">
                        <div><b>From:</b> billing@adobe-renewal-services.com</div>
                        <div><b>To:</b> accounts@crimson-dawn.net</div>
                        <div><b>Date:</b> Mon, 18 May 2026 11:55:41 +0000</div>
                        <div><b>Message-ID:</b> &lt;ADB.20260518115541@adobe-renewal-services.com&gt;</div>
                        <div><b>Reply-To:</b> support@billing-services-portal.com</div>
                        <div><b>Authentication-Results:</b> <span style="color:#e74c3c; font-weight:bold;">spf=FAIL dkim=pass dmarc=fail</span></div>
                        <div><b>X-Originating-IP:</b> 162.241.92.10</div>
                    </div>
                    <div style="font-size:0.85rem; line-height:1.7; padding:12px; border:1px solid #eee; border-radius:4px;">
                        <p>Adobe Billing Notice</p><p>Your Adobe Creative Cloud subscription has been auto-renewed for $599.88 USD. Charge will appear on your card ending in 8842 within 24 hours.</p><p>To dispute this charge or cancel renewal, you must act within 24 hours: <a href="https://adobe-renewal-services.com/billing/dispute?ref=8842" style="color:#dc2626; text-decoration:underline; font-family:monospace;">https://adobe-renewal-services.com/billing/dispute?ref=8842</a></p><p>-- Adobe Billing Services</p>
                    </div>
                    <div style="margin-top:10px; padding:10px; background:#ffe6e6; border:1px solid #e74c3c; border-radius:4px; font-size:0.78rem;">
                        <b>Analysis:</b> PHISHING DECOY. Sender domain <code>adobe-renewal-services.com</code> is not a real Adobe domain (Adobe uses <code>adobe.com</code> for billing). SPF and DMARC both FAIL; only DKIM passes (the attacker controls the keys for their own fake domain). <b>Reply-To is different from From</b> (<code>support@billing-services-portal.com</code>) -- a classic phishing tell. Originating IP <code>162.241.92.10</code> resolves to a generic hosting provider in Utah, not Adobe infrastructure. Urgency tactic ("act within 24 hours") and unfamiliar card suffix ("ending in 8842" -- AP doesn\'t have an Adobe charge on file) are additional red flags. Decoy for this incident.
                    </div>
                </div>`
            },

            // ─────────────────────────────────────────────────
            // A2. EMAIL-BODY LINK LANDING PAGES
            //   Pages reached by clicking URLs inside the inbox messages.
            //   Visual treatment matches the email's Analysis verdict:
            //   legit-looking for genuine internal pages; phishing-looking
            //   (with subtle red flags) for the decoy phishing URLs.
            // ─────────────────────────────────────────────────

            // Legitimate internal AD password-reset portal — reached from
            // msg/1's URL https://passwd.crimson-dawn.net/reset.
            '/reset': {
                title: 'AD Password Reset -- passwd.crimson-dawn.net',
                html: `
                <style>
                  .pwreset-shell {
                    font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
                    max-width: 880px;
                    margin: 24px auto;
                    color: #1a202c;
                  }
                  .pwreset-shell .pw-header {
                    display: flex; align-items: center; gap: 14px;
                    padding: 12px 18px;
                    background: linear-gradient(90deg, #7f1d1d, #b91c1c);
                    color: #fff;
                    border-radius: 8px 8px 0 0;
                  }
                  .pwreset-shell .pw-header .pw-logo {
                    width: 32px; height: 32px;
                    background: rgba(255,255,255,0.18);
                    border-radius: 6px;
                    display: flex; align-items: center; justify-content: center;
                    font-weight: 800; letter-spacing: 0.04em;
                  }
                  .pwreset-shell .pw-header-text .pw-org {
                    font-size: 0.68rem; letter-spacing: 0.16em; text-transform: uppercase; opacity: 0.85;
                  }
                  .pwreset-shell .pw-header-text .pw-app {
                    font-size: 1.05rem; font-weight: 700; margin-top: 1px;
                  }
                  .pwreset-shell .pw-body {
                    display: grid; grid-template-columns: 1.4fr 1fr; gap: 0;
                    background: #fff; border: 1px solid #e2e8f0; border-top: 0;
                    border-radius: 0 0 8px 8px;
                    overflow: hidden;
                  }
                  @media (max-width: 760px) { .pwreset-shell .pw-body { grid-template-columns: 1fr; } }
                  .pwreset-shell .pw-form-col { padding: 22px 22px; border-right: 1px solid #f1f5f9; }
                  @media (max-width: 760px) { .pwreset-shell .pw-form-col { border-right: 0; border-bottom: 1px solid #f1f5f9; } }
                  .pwreset-shell .pw-section-title {
                    font-size: 0.95rem; font-weight: 700; color: #0f172a;
                    margin-bottom: 4px;
                  }
                  .pwreset-shell .pw-section-sub {
                    font-size: 0.78rem; color: #64748b; margin-bottom: 18px;
                  }
                  .pwreset-shell label {
                    display: block; font-size: 0.78rem; font-weight: 600;
                    color: #475569; margin: 12px 0 4px 0; letter-spacing: 0.01em;
                  }
                  .pwreset-shell input[type="text"],
                  .pwreset-shell input[type="password"] {
                    width: 100%; padding: 9px 12px;
                    border: 1px solid #cbd5e1; border-radius: 4px;
                    font-family: inherit; font-size: 0.88rem; color: #0f172a;
                    background: #fff; box-sizing: border-box;
                    transition: border 0.15s, box-shadow 0.15s;
                  }
                  .pwreset-shell input:focus {
                    outline: 0; border-color: #b91c1c;
                    box-shadow: 0 0 0 3px rgba(185, 28, 28, 0.12);
                  }
                  .pwreset-shell .pw-reqs {
                    margin-top: 12px; padding: 12px 14px;
                    background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 5px;
                  }
                  .pwreset-shell .pw-reqs-title {
                    font-size: 0.72rem; font-weight: 700; letter-spacing: 0.06em;
                    text-transform: uppercase; color: #475569; margin-bottom: 8px;
                  }
                  .pwreset-shell .pw-req {
                    display: flex; align-items: center; gap: 8px;
                    font-size: 0.78rem; color: #94a3b8; padding: 2px 0;
                    transition: color 0.15s;
                  }
                  .pwreset-shell .pw-req .pw-tick {
                    display: inline-flex; align-items: center; justify-content: center;
                    width: 16px; height: 16px; border-radius: 50%;
                    background: #e2e8f0; color: #fff; font-size: 0.7rem; font-weight: 700;
                    transition: background 0.15s;
                  }
                  .pwreset-shell .pw-req.met { color: #166534; }
                  .pwreset-shell .pw-req.met .pw-tick { background: #16a34a; }
                  .pwreset-shell .pw-req.met .pw-tick::before { content: "\\2713"; }
                  .pwreset-shell .pw-meter {
                    margin-top: 12px;
                    display: flex; align-items: center; gap: 10px;
                  }
                  .pwreset-shell .pw-meter-bars {
                    display: flex; gap: 3px; flex: 1;
                  }
                  .pwreset-shell .pw-meter-bar {
                    flex: 1; height: 5px; background: #e2e8f0; border-radius: 2px;
                    transition: background 0.15s;
                  }
                  .pwreset-shell .pw-meter[data-strength="1"] .pw-meter-bar:nth-child(-n+1),
                  .pwreset-shell .pw-meter[data-strength="2"] .pw-meter-bar:nth-child(-n+2) { background: #ef4444; }
                  .pwreset-shell .pw-meter[data-strength="3"] .pw-meter-bar:nth-child(-n+3) { background: #f59e0b; }
                  .pwreset-shell .pw-meter[data-strength="4"] .pw-meter-bar:nth-child(-n+4) { background: #10b981; }
                  .pwreset-shell .pw-meter[data-strength="5"] .pw-meter-bar { background: #16a34a; }
                  .pwreset-shell .pw-meter-label {
                    font-size: 0.7rem; font-weight: 700; letter-spacing: 0.04em; color: #94a3b8;
                    text-transform: uppercase; min-width: 70px; text-align: right;
                  }
                  .pwreset-shell .pw-match {
                    margin-top: 8px; font-size: 0.74rem; color: #94a3b8;
                  }
                  .pwreset-shell .pw-match.ok { color: #166534; font-weight: 600; }
                  .pwreset-shell .pw-match.bad { color: #b91c1c; font-weight: 600; }
                  .pwreset-shell .pw-submit {
                    margin-top: 18px; width: 100%; padding: 11px;
                    background: #b91c1c; color: #fff; border: 0; border-radius: 4px;
                    font-weight: 700; font-size: 0.9rem; letter-spacing: 0.04em;
                    cursor: pointer; font-family: inherit;
                    transition: background 0.15s;
                  }
                  .pwreset-shell .pw-submit:hover { background: #991b1b; }
                  .pwreset-shell .pw-context-col {
                    background: #f8fafc; padding: 20px 20px;
                    font-size: 0.78rem; color: #475569;
                  }
                  .pwreset-shell .pw-context-section + .pw-context-section { margin-top: 18px; padding-top: 14px; border-top: 1px solid #e2e8f0; }
                  .pwreset-shell .pw-ctx-h {
                    font-size: 0.68rem; font-weight: 700; letter-spacing: 0.1em;
                    text-transform: uppercase; color: #64748b; margin-bottom: 8px;
                  }
                  .pwreset-shell .pw-ctx-kv {
                    display: flex; justify-content: space-between; gap: 10px;
                    padding: 3px 0; font-size: 0.78rem;
                  }
                  .pwreset-shell .pw-ctx-k { color: #94a3b8; }
                  .pwreset-shell .pw-ctx-v { color: #0f172a; font-weight: 600; text-align: right; }
                  .pwreset-shell .pw-status-pill {
                    display: inline-block; padding: 2px 8px; border-radius: 10px;
                    font-size: 0.66rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase;
                  }
                  .pwreset-shell .pw-status-pill.ok { background: #dcfce7; color: #166534; }
                  .pwreset-shell .pw-status-pill.warn { background: #fef3c7; color: #92400e; }
                  .pwreset-shell .pw-mfa-bar {
                    margin-top: 6px; display: flex; gap: 6px;
                  }
                  .pwreset-shell .pw-mfa-bar > div {
                    flex: 1; padding: 6px 8px; font-size: 0.7rem;
                    background: #fff; border: 1px solid #e2e8f0; border-radius: 4px;
                    text-align: center; color: #475569;
                  }
                  .pwreset-shell .pw-mfa-bar > div.on { border-color: #16a34a; color: #166534; background: #f0fdf4; }
                  .pwreset-shell .pw-mfa-bar > div.off { color: #94a3b8; }
                  .pwreset-shell .pw-recent {
                    background: #fff; border: 1px solid #e2e8f0; border-radius: 4px;
                    padding: 6px 8px; font-size: 0.72rem; color: #475569;
                    margin-top: 4px;
                  }
                  .pwreset-shell .pw-recent + .pw-recent { margin-top: 4px; }
                  .pwreset-shell .pw-recent .pw-recent-ts { color: #94a3b8; font-family: ui-monospace, monospace; font-size: 0.7rem; }
                  .pwreset-shell .pw-recent .pw-recent-meta { color: #1a202c; font-weight: 600; }
                  .pwreset-shell .pw-recent.flag { border-color: #fca5a5; background: #fef2f2; }
                  .pwreset-shell .pw-recent.flag .pw-recent-meta { color: #991b1b; }
                  .pwreset-shell .pw-recent.success { border-color: #86efac; background: #f0fdf4; }
                  .pwreset-shell .pw-recent.success .pw-recent-meta { color: #14532d; }
                  .pwreset-shell .pw-footer-bar {
                    margin-top: 14px; display: flex; gap: 10px; align-items: center;
                    padding: 10px 14px; background: #f1f5f9;
                    border: 1px solid #e2e8f0; border-radius: 4px;
                    font-size: 0.72rem; color: #475569;
                  }
                  .pwreset-shell .pw-footer-bar code { background: #fff; border: 1px solid #e2e8f0; padding: 1px 5px; border-radius: 3px; font-size: 0.7rem; }
                  .pwreset-shell .pw-ir-note {
                    margin-top: 12px; padding: 10px 14px;
                    background: #fef9c3; border: 1px solid #fde68a; border-radius: 4px;
                    font-size: 0.74rem; color: #713f12;
                  }
                  .pwreset-shell .pw-submit:disabled {
                    background: #cbd5e1; color: #475569; cursor: not-allowed;
                  }
                  .pwreset-shell .pw-result { margin-top: 12px; }
                  .pwreset-shell .pw-result .pw-result-card {
                    padding: 12px 14px; border-radius: 4px;
                    font-size: 0.82rem; line-height: 1.5;
                    display: flex; align-items: flex-start; gap: 10px;
                  }
                  .pwreset-shell .pw-result-card.err {
                    background: #fef2f2; border: 1px solid #fca5a5; color: #991b1b;
                  }
                  .pwreset-shell .pw-result-card.ok {
                    background: #f0fdf4; border: 1px solid #86efac; color: #14532d;
                  }
                  .pwreset-shell .pw-result-card .pw-result-mark {
                    flex-shrink: 0; font-weight: 800; font-size: 1.05rem;
                  }
                  .pwreset-shell .pw-result-card .pw-result-title { font-weight: 700; margin-bottom: 2px; }
                  .pwreset-shell .pw-result-card .pw-result-sub { font-size: 0.74rem; opacity: 0.85; }
                  .pwreset-shell .pw-result-card ul { margin: 4px 0 0 0; padding-left: 18px; font-size: 0.78rem; }
                </style>
                <div class="pwreset-shell">
                  <div class="pw-header">
                    <div class="pw-logo">CD</div>
                    <div class="pw-header-text">
                      <div class="pw-org">Crimson Dawn Logistics, Inc.</div>
                      <div class="pw-app">Active Directory Self-Service Portal</div>
                    </div>
                  </div>
                  <div class="pw-body">
                    <div class="pw-form-col reset-form">
                      <div class="pw-section-title">Rotate Password</div>
                      <div class="pw-section-sub">Internal SSO &middot; passwd.crimson-dawn.net</div>

                      <label for="pw-username">Username</label>
                      <input type="text" id="pw-username" placeholder="firstname.lastname" autocomplete="off">

                      <label for="pw-current">Current password</label>
                      <input type="password" id="pw-current" autocomplete="off">

                      <label for="pw-new">New password</label>
                      <input type="password" id="pw-new" autocomplete="off" oninput="(function(el){
                        var v = el.value;
                        var reqs = {
                          len: v.length >= 12,
                          upper: /[A-Z]/.test(v),
                          lower: /[a-z]/.test(v),
                          num: /[0-9]/.test(v),
                          sym: /[^A-Za-z0-9]/.test(v)
                        };
                        var box = el.closest('.reset-form');
                        if (!box) return;
                        ['len','upper','lower','num','sym'].forEach(function(k){
                          var item = box.querySelector('[data-req=' + k + ']');
                          if (item) item.classList.toggle('met', !!reqs[k]);
                        });
                        var count = 0; for (var k in reqs) if (reqs[k]) count++;
                        var meter = box.querySelector('.pw-meter');
                        if (meter) meter.setAttribute('data-strength', String(count));
                        var label = box.querySelector('.pw-meter-label');
                        if (label) {
                          var labels = ['Empty','Too weak','Weak','Fair','Good','Strong'];
                          label.textContent = labels[count] || 'Empty';
                        }
                        var confirm = box.querySelector('#pw-confirm');
                        if (confirm) confirm.dispatchEvent(new Event('input'));
                      })(this)">

                      <div class="pw-reqs">
                        <div class="pw-reqs-title">Password requirements</div>
                        <div class="pw-req" data-req="len"><span class="pw-tick"></span>At least 12 characters</div>
                        <div class="pw-req" data-req="upper"><span class="pw-tick"></span>One uppercase letter (A&ndash;Z)</div>
                        <div class="pw-req" data-req="lower"><span class="pw-tick"></span>One lowercase letter (a&ndash;z)</div>
                        <div class="pw-req" data-req="num"><span class="pw-tick"></span>One number (0&ndash;9)</div>
                        <div class="pw-req" data-req="sym"><span class="pw-tick"></span>One symbol (! @ # $ % etc.)</div>
                      </div>

                      <div class="pw-meter" data-strength="0">
                        <div class="pw-meter-bars"><div class="pw-meter-bar"></div><div class="pw-meter-bar"></div><div class="pw-meter-bar"></div><div class="pw-meter-bar"></div><div class="pw-meter-bar"></div></div>
                        <div class="pw-meter-label">Empty</div>
                      </div>

                      <label for="pw-confirm">Confirm new password</label>
                      <input type="password" id="pw-confirm" autocomplete="off" oninput="(function(el){
                        var box = el.closest('.reset-form');
                        if (!box) return;
                        var newPw = box.querySelector('#pw-new');
                        var match = box.querySelector('.pw-match');
                        if (!match) return;
                        if (!el.value) { match.className = 'pw-match'; match.textContent = ''; return; }
                        if (newPw && el.value === newPw.value) { match.className = 'pw-match ok'; match.textContent = '✓ Passwords match.'; }
                        else { match.className = 'pw-match bad'; match.textContent = '✗ Passwords do not match.'; }
                      })(this)">
                      <div class="pw-match"></div>

                      <button class="pw-submit" data-action="reset-noop" onclick="(function(btn){
                        var box = btn.closest('.pwreset-shell');
                        if (!box) return;
                        var username = (box.querySelector('#pw-username').value || '').trim();
                        var current = box.querySelector('#pw-current').value || '';
                        var newPw = box.querySelector('#pw-new').value || '';
                        var conf = box.querySelector('#pw-confirm').value || '';
                        var metCount = box.querySelectorAll('.pw-req.met').length;
                        var errs = [];
                        if (!username) errs.push('Enter your username.');
                        if (!current) errs.push('Enter your current password.');
                        if (!newPw) errs.push('Enter a new password.');
                        else if (metCount < 5) errs.push('New password does not meet all 5 complexity requirements.');
                        if (newPw && conf && newPw !== conf) errs.push('Confirmation does not match the new password.');
                        if (newPw && !conf) errs.push('Confirm the new password.');
                        var result = box.querySelector('.pw-result');
                        if (!result) { result = document.createElement('div'); result.className = 'pw-result'; btn.parentElement.appendChild(result); }
                        if (errs.length) {
                          var ul = errs.map(function(e){ return '<li>' + e + '</li>'; }).join('');
                          result.innerHTML = '<div class=\\'pw-result-card err\\'><span class=\\'pw-result-mark\\'>!</span><div><div class=\\'pw-result-title\\'>Password rotation blocked</div><ul>' + ul + '</ul></div></div>';
                          return;
                        }
                        var ts = new Date().toISOString().replace('T',' ').slice(0,19);
                        result.innerHTML = '<div class=\\'pw-result-card ok\\'><span class=\\'pw-result-mark\\'>\\u2713</span><div><div class=\\'pw-result-title\\'>Password rotated successfully.</div><div class=\\'pw-result-sub\\'>Account: ' + (username || 'e.morales') + ' &middot; Rotated at ' + ts + ' UTC &middot; Active Directory replication complete.</div><div class=\\'pw-result-sub\\' style=\\'margin-top:6px;\\'>You may close this tab or return to your inbox.</div></div></div>';
                        btn.disabled = true; btn.textContent = 'Password Rotated';
                        ['#pw-username','#pw-current','#pw-new','#pw-confirm'].forEach(function(s){ var i = box.querySelector(s); if (i) i.setAttribute('readonly','readonly'); });
                        var agePill = box.querySelector('#pw-age-pill');
                        if (agePill) { agePill.className = 'pw-status-pill ok'; agePill.textContent = 'Just now'; }
                        var recentList = box.querySelector('#pw-recent-list');
                        if (recentList) {
                          var row = document.createElement('div');
                          row.className = 'pw-recent success';
                          row.innerHTML = '<div class=\\'pw-recent-ts\\'>' + ts + ' UTC</div><div class=\\'pw-recent-meta\\'>passwd.crimson-dawn.net &middot; Password rotation &middot; ' + (username || 'e.morales') + '</div>';
                          recentList.insertBefore(row, recentList.firstChild);
                        }
                      })(this)">Rotate Password &amp; Sign In</button>
                    </div>

                    <div class="pw-context-col">
                      <div class="pw-context-section">
                        <div class="pw-ctx-h">Signed-in account</div>
                        <div class="pw-ctx-kv"><span class="pw-ctx-k">Username</span><span class="pw-ctx-v">e.morales</span></div>
                        <div class="pw-ctx-kv"><span class="pw-ctx-k">Display name</span><span class="pw-ctx-v">Elena Morales</span></div>
                        <div class="pw-ctx-kv"><span class="pw-ctx-k">Title</span><span class="pw-ctx-v">AP Clerk</span></div>
                        <div class="pw-ctx-kv"><span class="pw-ctx-k">Department</span><span class="pw-ctx-v">Accounts Payable</span></div>
                        <div class="pw-ctx-kv"><span class="pw-ctx-k">Workstation</span><span class="pw-ctx-v">WS-EMORALES-01</span></div>
                        <div class="pw-ctx-kv"><span class="pw-ctx-k">Internal IP</span><span class="pw-ctx-v" style="font-family:ui-monospace,monospace;">10.0.4.18</span></div>
                      </div>

                      <div class="pw-context-section">
                        <div class="pw-ctx-h">Account status</div>
                        <div class="pw-ctx-kv"><span class="pw-ctx-k">Status</span><span class="pw-status-pill ok">Active</span></div>
                        <div class="pw-ctx-kv"><span class="pw-ctx-k">Role</span><span class="pw-ctx-v">Standard User</span></div>
                        <div class="pw-ctx-kv"><span class="pw-ctx-k">Password age</span><span class="pw-status-pill warn" id="pw-age-pill">132 days</span></div>
                        <div class="pw-ctx-kv"><span class="pw-ctx-k">Lockout</span><span class="pw-ctx-v">None</span></div>
                      </div>

                      <div class="pw-context-section">
                        <div class="pw-ctx-h">MFA enrolment</div>
                        <div class="pw-mfa-bar">
                          <div class="on">Authenticator</div>
                          <div class="on">SMS</div>
                          <div class="off">YubiKey</div>
                        </div>
                      </div>

                      <div class="pw-context-section">
                        <div class="pw-ctx-h">Recent sign-ins</div>
                        <div id="pw-recent-list">
                          <div class="pw-recent">
                            <div class="pw-recent-ts">2026-05-18 09:01 UTC</div>
                            <div class="pw-recent-meta">WS-EMORALES-01 &middot; 10.0.4.18 &middot; Workstation Logon</div>
                          </div>
                          <div class="pw-recent flag">
                            <div class="pw-recent-ts">2026-05-18 09:14 UTC</div>
                            <div class="pw-recent-meta">185.220.101.45 &middot; HTTPS to passwd.crimson-dawn.net</div>
                          </div>
                          <div class="pw-recent">
                            <div class="pw-recent-ts">2026-05-17 16:44 UTC</div>
                            <div class="pw-recent-meta">WS-EMORALES-01 &middot; 10.0.4.18 &middot; Workstation Unlock</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="pw-footer-bar">
                    <span><b>Crimson Dawn IT Security</b></span>
                    <span>&middot;</span>
                    <span>Issues? Email <code>it-helpdesk@crimson-dawn.net</code> or call ext. <code>x4400</code>.</span>
                  </div>

                  <div class="pw-ir-note">
                    <b>IR Note (lab-only, not visible in real portal):</b> This portal is reachable on the internal network. The msg/1 email that links here passed SPF/DKIM/DMARC and originated from internal IP 10.0.1.5 &mdash; both the portal AND the email check out as legitimate internal traffic, so msg/1 is marked DECOY in the incident analysis. The flagged recent sign-in at <code>185.220.101.45</code> on 2026-05-18 09:14 UTC is the external-IP authentication event the SIEM auth log records at the same timestamp as the wire transfer (E-brief Day-1 timeline) &mdash; that is Patient Zero's session being used from the attacker's C2 host. Showing it here is the investigative crumb that ties msg/1's destination to the broader incident.
                  </div>
                </div>`
            },

            // Legitimate internal compliance form — reached from msg/7's URL
            // https://compliance.crimson-dawn.net/attest/Q2-2026.
            '/attest/Q2-2026': {
                title: 'Q2 2026 Compliance Attestation -- compliance.crimson-dawn.net',
                html: `
                <div style="font-family:system-ui,sans-serif; max-width:680px; margin:30px auto; padding:0; background:#fff; border:1px solid #ddd; border-radius:6px; box-shadow:0 2px 6px rgba(0,0,0,0.06);">
                    <div style="background:#222; color:#fff; padding:14px 20px; border-radius:6px 6px 0 0;">
                        <div style="font-size:0.72rem; letter-spacing:0.1em; text-transform:uppercase; opacity:0.85;">Crimson Dawn Logistics &middot; Compliance Office</div>
                        <div style="font-size:1.05rem; font-weight:700; margin-top:2px;">Q2 2026 Quarterly Compliance Attestation</div>
                    </div>
                    <div style="padding:22px 20px; font-size:0.85rem; color:#222; line-height:1.6;">
                        <div>Reporting period: Apr 1 &ndash; Jun 30, 2026 &middot; Deadline: end of week</div>
                        <div style="margin-top:14px; padding:12px; background:#f8f8f8; border-left:3px solid #888;">
                            As an Accounts Payable / Vendor Management team member, attest to the following for Q2 2026 by checking each item and submitting:
                        </div>
                        <div style="margin-top:14px; display:flex; flex-direction:column; gap:8px; font-size:0.83rem;">
                            <label style="display:flex; gap:8px; align-items:flex-start;"><input type="checkbox"><span>I have reviewed and understood the AP Wire-Approval Policy (AP-2026-04 rev.3).</span></label>
                            <label style="display:flex; gap:8px; align-items:flex-start;"><input type="checkbox"><span>I have completed the quarterly SOX § 404 separation-of-duties verification.</span></label>
                            <label style="display:flex; gap:8px; align-items:flex-start;"><input type="checkbox"><span>I have not initiated, approved, or co-signed any wire transfer to an unverified payee in Q2 2026.</span></label>
                            <label style="display:flex; gap:8px; align-items:flex-start;"><input type="checkbox"><span>I have completed the FY26 anti-bribery (FCPA) and money-laundering (AML) training modules.</span></label>
                            <label style="display:flex; gap:8px; align-items:flex-start;"><input type="checkbox"><span>I have reported any related-party transactions through the standard disclosure form.</span></label>
                            <label style="display:flex; gap:8px; align-items:flex-start;"><input type="checkbox"><span>I have not received any third-party compensation or gifts above the $50 disclosure threshold.</span></label>
                        </div>
                        <div style="margin-top:18px; display:flex; gap:10px; align-items:center;">
                            <label style="font-size:0.78rem; color:#444;">Sign as:&nbsp;<input type="text" placeholder="firstname.lastname" style="padding:6px 8px; border:1px solid #ccc; border-radius:3px; font-family:inherit; font-size:0.78rem;"></label>
                            <button data-action="attest-noop" style="padding:8px 18px; background:#222; color:#fff; border:none; border-radius:4px; font-weight:700; cursor:pointer; font-family:inherit; font-size:0.83rem;">Submit Attestation</button>
                        </div>
                        <div style="margin-top:16px; padding:10px; background:#fffbe6; border:1px solid #f5dc8a; border-radius:4px; font-size:0.74rem; color:#664;">
                            <b>IR Note:</b> Internal compliance attestation portal. The msg/7 email is from compliance@crimson-dawn.net (originating IP 10.0.2.3), all auth passes. Legitimate but NOT RELEVANT to the wire-fraud incident.
                        </div>
                    </div>
                </div>`
            },

            // PHISHING-DECOY landing: ADP-impersonation page reached from
            // msg/2's URL https://adp-secure-portal.com/verify. Aesthetic
            // is deliberately off-brand: slightly garish, excessive ask
            // (bank routing + SSN), and a flag at the bottom calling out
            // the W2 lesson — "surface red flags != active phish."
            // GAME OVER (msg/2 ADP phishing decoy) — clicking the URL in
            // the email body lands here. Lesson: "even a phishing decoy is
            // still a phishing page; don't click links in suspicious
            // emails." Single CTA reloads the lab from zero.
            '/verify': {
                title: 'INCIDENT: CREDENTIALS COMPROMISED',
                html: `
                <div style="font-family:'JetBrains Mono', monospace, system-ui; max-width:680px; margin:30px auto; padding:0; background:#0a0a0a; border:3px solid #ff003c; border-radius:6px; box-shadow:0 0 40px rgba(255,0,60,0.45); color:#fff; overflow:hidden;">
                    <div style="background:#ff003c; color:#000; padding:8px 16px; font-size:0.7rem; letter-spacing:0.18em; font-weight:900; text-align:center;">
                        &#x26A0; SECURITY EVENT &middot; PHISHING URL CLICKED &middot; INCIDENT COMPROMISED &#x26A0;
                    </div>
                    <div style="padding:32px 28px 24px 28px; text-align:center;">
                        <div style="font-size:3.2rem; font-weight:900; letter-spacing:0.06em; color:#ff003c; text-shadow:0 0 12px rgba(255,0,60,0.55), 2px 2px 0 #220000; line-height:1; margin-bottom:6px;">YOU GOT PHISHED.</div>
                        <div style="font-size:0.88rem; color:#ffbbcc; letter-spacing:0.04em; margin-bottom:24px;">GAME OVER &middot; CREDENTIAL HARVEST SUCCESSFUL</div>
                        <div style="text-align:left; background:#1a0008; border:1px solid #5a0020; border-radius:4px; padding:14px 18px; font-size:0.83rem; line-height:1.7; color:#ffdee5; margin-bottom:18px;">
                            <div style="color:#ff8aa3; font-weight:700; margin-bottom:6px; letter-spacing:0.04em;">// CONSEQUENCE</div>
                            You clicked the URL inside msg/2 ("Direct deposit verification required"). The page on the other end was a credential-harvest phishing site running under the ADP impersonation pattern.
                            <br><br>In a real environment, the attacker now has: Employee ID, last 4 of your SSN, bank routing number, and bank account number. Your paycheck redirect is one form-submit away.
                        </div>
                        <div style="text-align:left; background:#001428; border:1px solid #00528c; border-radius:4px; padding:14px 18px; font-size:0.83rem; line-height:1.7; color:#bbdfff; margin-bottom:22px;">
                            <div style="color:#7ec0ff; font-weight:700; margin-bottom:6px; letter-spacing:0.04em;">// IR LESSON</div>
                            The msg/2 Analysis block told you it was a phishing decoy. The correct move was to <b>copy the URL into a sandbox</b> (URLscan, hybrid-analysis, your SOC's detonation chamber), <b>NOT click it from the inbox</b>. Decoy or active phish &mdash; phishing URLs are credential-harvest sites either way.
                        </div>
                        <button data-action="restart-lab" onclick="window.location.reload();" style="padding:14px 36px; background:#ff003c; color:#fff; border:none; border-radius:4px; font-weight:900; font-size:1rem; letter-spacing:0.08em; cursor:pointer; font-family:inherit; box-shadow:0 0 16px rgba(255,0,60,0.5);">RESTART INVESTIGATION &rarr;</button>
                        <div style="margin-top:14px; font-size:0.7rem; color:#888;">Your lab session is reset to phase 1. Read the analysis blocks before clicking.</div>
                    </div>
                </div>`
            },

            // GAME OVER (msg/3 FedEx phishing decoy) — clicking the URL in
            // the email body lands here. Same template as /verify but with
            // a payment-fraud framing instead of credential harvest.
            '/exception/4470029': {
                title: 'INCIDENT: PAYMENT FRAUD INITIATED',
                html: `
                <div style="font-family:'JetBrains Mono', monospace, system-ui; max-width:680px; margin:30px auto; padding:0; background:#0a0a0a; border:3px solid #ff003c; border-radius:6px; box-shadow:0 0 40px rgba(255,0,60,0.45); color:#fff; overflow:hidden;">
                    <div style="background:#ff003c; color:#000; padding:8px 16px; font-size:0.7rem; letter-spacing:0.18em; font-weight:900; text-align:center;">
                        &#x26A0; SECURITY EVENT &middot; PHISHING URL CLICKED &middot; INCIDENT COMPROMISED &#x26A0;
                    </div>
                    <div style="padding:32px 28px 24px 28px; text-align:center;">
                        <div style="font-size:3.2rem; font-weight:900; letter-spacing:0.06em; color:#ff003c; text-shadow:0 0 12px rgba(255,0,60,0.55), 2px 2px 0 #220000; line-height:1; margin-bottom:6px;">YOU GOT PHISHED.</div>
                        <div style="font-size:0.88rem; color:#ffbbcc; letter-spacing:0.04em; margin-bottom:24px;">GAME OVER &middot; PAYMENT FRAUD SUCCESSFUL</div>
                        <div style="text-align:left; background:#1a0008; border:1px solid #5a0020; border-radius:4px; padding:14px 18px; font-size:0.83rem; line-height:1.7; color:#ffdee5; margin-bottom:18px;">
                            <div style="color:#ff8aa3; font-weight:700; margin-bottom:6px; letter-spacing:0.04em;">// CONSEQUENCE</div>
                            You clicked the URL inside msg/3 ("Delivery exception #4470029"). The page on the other end was a FedEx-impersonation phishing site running the customs-hold payment-fraud pattern.
                            <br><br>In a real environment, the attacker now has your full credit card number and cardholder name. The "release package" form-submit would have triggered an unauthorized charge.
                        </div>
                        <div style="text-align:left; background:#001428; border:1px solid #00528c; border-radius:4px; padding:14px 18px; font-size:0.83rem; line-height:1.7; color:#bbdfff; margin-bottom:22px;">
                            <div style="color:#7ec0ff; font-weight:700; margin-bottom:6px; letter-spacing:0.04em;">// IR LESSON</div>
                            The msg/3 Analysis block told you it was a phishing decoy (the sender domain <code>fedex-shipping-update.com</code> is not FedEx; FedEx never collects customs duty via shipping-notification URLs). The correct move was to <b>verify the tracking number on fedex.com directly</b>, not click the link in the email. Decoy or active phish &mdash; phishing URLs harm you either way.
                        </div>
                        <button data-action="restart-lab" onclick="window.location.reload();" style="padding:14px 36px; background:#ff003c; color:#fff; border:none; border-radius:4px; font-weight:900; font-size:1rem; letter-spacing:0.08em; cursor:pointer; font-family:inherit; box-shadow:0 0 16px rgba(255,0,60,0.5);">RESTART INVESTIGATION &rarr;</button>
                        <div style="margin-top:14px; font-size:0.7rem; color:#888;">Your lab session is reset to phase 1. Read the analysis blocks before clicking.</div>
                    </div>
                </div>`
            },

            // ─────────────────────────────────────────────────
            // A3. NOISE-LAYER EMAIL URL LANDING PAGES (msg/8-13)
            //   3 GAME OVER variants for the new phishing decoys
            //   (msg/9 MS365, msg/11 Chase, msg/13 Adobe) and
            //   2 legit placeholders for Zoom + Slack URLs
            //   (msg/10, msg/12).
            // ─────────────────────────────────────────────────

            // GAME OVER (msg/9 Microsoft 365 phishing) — clicking the URL
            // in msg/9 body lands here. Microsoft account credential harvest.
            '/verify-signin': {
                title: 'INCIDENT: MICROSOFT ACCOUNT COMPROMISED',
                html: `
                <div style="font-family:'JetBrains Mono', monospace, system-ui; max-width:680px; margin:30px auto; padding:0; background:#0a0a0a; border:3px solid #ff003c; border-radius:6px; box-shadow:0 0 40px rgba(255,0,60,0.45); color:#fff; overflow:hidden;">
                    <div style="background:#ff003c; color:#000; padding:8px 16px; font-size:0.7rem; letter-spacing:0.18em; font-weight:900; text-align:center;">
                        &#x26A0; SECURITY EVENT &middot; PHISHING URL CLICKED &middot; INCIDENT COMPROMISED &#x26A0;
                    </div>
                    <div style="padding:32px 28px 24px 28px; text-align:center;">
                        <div style="font-size:3.2rem; font-weight:900; letter-spacing:0.06em; color:#ff003c; text-shadow:0 0 12px rgba(255,0,60,0.55), 2px 2px 0 #220000; line-height:1; margin-bottom:6px;">YOU GOT PHISHED.</div>
                        <div style="font-size:0.88rem; color:#ffbbcc; letter-spacing:0.04em; margin-bottom:24px;">GAME OVER &middot; MICROSOFT 365 CREDENTIALS HARVESTED</div>
                        <div style="text-align:left; background:#1a0008; border:1px solid #5a0020; border-radius:4px; padding:14px 18px; font-size:0.83rem; line-height:1.7; color:#ffdee5; margin-bottom:18px;">
                            <div style="color:#ff8aa3; font-weight:700; margin-bottom:6px; letter-spacing:0.04em;">// CONSEQUENCE</div>
                            You clicked the URL inside msg/9 ("Unusual sign-in activity on your Microsoft account"). The page on the other end was a Microsoft 365 sign-in clone harvesting credentials.
                            <br><br>In a real environment, the attacker now has your Microsoft 365 email + password. With that they can read Exchange mail, exfiltrate SharePoint documents, impersonate you in Teams, and pivot into your tenant. The MFA-enrollment screen the phishing site showed was a follow-on harvest stage to capture the second factor too.
                        </div>
                        <div style="text-align:left; background:#001428; border:1px solid #00528c; border-radius:4px; padding:14px 18px; font-size:0.83rem; line-height:1.7; color:#bbdfff; margin-bottom:22px;">
                            <div style="color:#7ec0ff; font-weight:700; margin-bottom:6px; letter-spacing:0.04em;">// IR LESSON</div>
                            Real Microsoft sign-in alerts come from <code>account.microsoft.com</code> or <code>account.live.com</code>, NOT <code>microsoft-365-account.com</code>. The msg/9 headers showed SPF FAIL + DMARC FAIL with origin IP <code>185.157.122.49</code> (Bulgaria hosting). All three of those tells were in the inbox view before you ever clicked. Read the auth-results line on every email; copy URLs into a sandbox; never click suspicious links from the inbox.
                        </div>
                        <button data-action="restart-lab" onclick="window.location.reload();" style="padding:14px 36px; background:#ff003c; color:#fff; border:none; border-radius:4px; font-weight:900; font-size:1rem; letter-spacing:0.08em; cursor:pointer; font-family:inherit; box-shadow:0 0 16px rgba(255,0,60,0.5);">RESTART INVESTIGATION &rarr;</button>
                        <div style="margin-top:14px; font-size:0.7rem; color:#888;">Your lab session is reset to phase 1. Read the analysis blocks before clicking.</div>
                    </div>
                </div>`
            },

            // GAME OVER (msg/11 Chase wire alert phishing) — clicking the URL
            // in msg/11 body lands here. Banking credential harvest + wire-
            // authorization secondary compromise.
            '/wires/review/PNFAH-7741': {
                title: 'INCIDENT: BANKING CREDENTIALS COMPROMISED',
                html: `
                <div style="font-family:'JetBrains Mono', monospace, system-ui; max-width:680px; margin:30px auto; padding:0; background:#0a0a0a; border:3px solid #ff003c; border-radius:6px; box-shadow:0 0 40px rgba(255,0,60,0.45); color:#fff; overflow:hidden;">
                    <div style="background:#ff003c; color:#000; padding:8px 16px; font-size:0.7rem; letter-spacing:0.18em; font-weight:900; text-align:center;">
                        &#x26A0; SECURITY EVENT &middot; PHISHING URL CLICKED &middot; INCIDENT COMPROMISED &#x26A0;
                    </div>
                    <div style="padding:32px 28px 24px 28px; text-align:center;">
                        <div style="font-size:3.2rem; font-weight:900; letter-spacing:0.06em; color:#ff003c; text-shadow:0 0 12px rgba(255,0,60,0.55), 2px 2px 0 #220000; line-height:1; margin-bottom:6px;">YOU GOT PHISHED.</div>
                        <div style="font-size:0.88rem; color:#ffbbcc; letter-spacing:0.04em; margin-bottom:24px;">GAME OVER &middot; CHASE BANKING CREDENTIALS HARVESTED</div>
                        <div style="text-align:left; background:#1a0008; border:1px solid #5a0020; border-radius:4px; padding:14px 18px; font-size:0.83rem; line-height:1.7; color:#ffdee5; margin-bottom:18px;">
                            <div style="color:#ff8aa3; font-weight:700; margin-bottom:6px; letter-spacing:0.04em;">// CONSEQUENCE</div>
                            You clicked the URL inside msg/11 ("ACTION REQUIRED: Outgoing wire $4,200,000.00 review"). The page was a Chase Business Banking clone harvesting your banking login.
                            <br><br>In a real environment, the attacker now has your Chase business banking username and password. They can authorize ADDITIONAL fraudulent wires against the same account that just lost $4.2M -- piggybacking on the panic the original fraud created. This is the textbook "follow-up scam" pattern after a known breach: the second attacker uses public knowledge of the loss to harvest credentials from the panicked victim.
                        </div>
                        <div style="text-align:left; background:#001428; border:1px solid #00528c; border-radius:4px; padding:14px 18px; font-size:0.83rem; line-height:1.7; color:#bbdfff; margin-bottom:22px;">
                            <div style="color:#7ec0ff; font-weight:700; margin-bottom:6px; letter-spacing:0.04em;">// IR LESSON</div>
                            Real Chase notifications come from <code>chase.com</code> or <code>jpmorganchase.com</code>, NOT <code>chase-bizbanking.com</code>. The msg/11 headers showed SPF FAIL + DKIM FAIL + DMARC FAIL -- all three. The amount ($4.2M) and account suffix (-7741) matching the actual fraud should have made you MORE suspicious, not less -- only the original attacker and someone monitoring the breach would know those exact details. Confirm wire-fraud follow-up by calling your Chase relationship manager on a number from a prior statement, never a number or URL from the alert email.
                        </div>
                        <button data-action="restart-lab" onclick="window.location.reload();" style="padding:14px 36px; background:#ff003c; color:#fff; border:none; border-radius:4px; font-weight:900; font-size:1rem; letter-spacing:0.08em; cursor:pointer; font-family:inherit; box-shadow:0 0 16px rgba(255,0,60,0.5);">RESTART INVESTIGATION &rarr;</button>
                        <div style="margin-top:14px; font-size:0.7rem; color:#888;">Your lab session is reset to phase 1. Read the analysis blocks before clicking.</div>
                    </div>
                </div>`
            },

            // GAME OVER (msg/13 Adobe subscription phishing) — clicking the URL
            // in msg/13 body lands here. Payment card harvest.
            '/billing/dispute': {
                title: 'INCIDENT: PAYMENT CARD STOLEN',
                html: `
                <div style="font-family:'JetBrains Mono', monospace, system-ui; max-width:680px; margin:30px auto; padding:0; background:#0a0a0a; border:3px solid #ff003c; border-radius:6px; box-shadow:0 0 40px rgba(255,0,60,0.45); color:#fff; overflow:hidden;">
                    <div style="background:#ff003c; color:#000; padding:8px 16px; font-size:0.7rem; letter-spacing:0.18em; font-weight:900; text-align:center;">
                        &#x26A0; SECURITY EVENT &middot; PHISHING URL CLICKED &middot; INCIDENT COMPROMISED &#x26A0;
                    </div>
                    <div style="padding:32px 28px 24px 28px; text-align:center;">
                        <div style="font-size:3.2rem; font-weight:900; letter-spacing:0.06em; color:#ff003c; text-shadow:0 0 12px rgba(255,0,60,0.55), 2px 2px 0 #220000; line-height:1; margin-bottom:6px;">YOU GOT PHISHED.</div>
                        <div style="font-size:0.88rem; color:#ffbbcc; letter-spacing:0.04em; margin-bottom:24px;">GAME OVER &middot; CREDIT CARD STOLEN</div>
                        <div style="text-align:left; background:#1a0008; border:1px solid #5a0020; border-radius:4px; padding:14px 18px; font-size:0.83rem; line-height:1.7; color:#ffdee5; margin-bottom:18px;">
                            <div style="color:#ff8aa3; font-weight:700; margin-bottom:6px; letter-spacing:0.04em;">// CONSEQUENCE</div>
                            You clicked the URL inside msg/13 ("ACTION REQUIRED: Adobe Creative Cloud subscription auto-renewed"). The page was an Adobe billing clone harvesting payment card details under the pretext of "dispute the charge".
                            <br><br>In a real environment, the attacker now has the full card number, CVV, expiration, billing name, and billing address that the form asked for. The card is on its way to a carding marketplace and will be tested in seconds against e-commerce checkouts. Card-not-present fraud is the typical follow-on, often charges across multiple regions within an hour.
                        </div>
                        <div style="text-align:left; background:#001428; border:1px solid #00528c; border-radius:4px; padding:14px 18px; font-size:0.83rem; line-height:1.7; color:#bbdfff; margin-bottom:22px;">
                            <div style="color:#7ec0ff; font-weight:700; margin-bottom:6px; letter-spacing:0.04em;">// IR LESSON</div>
                            Real Adobe billing comes from <code>adobe.com</code> ("payments@mail.adobe.com"), NOT <code>adobe-renewal-services.com</code>. The msg/13 headers showed SPF FAIL + DMARC FAIL with Reply-To pointing to a DIFFERENT domain than the From line (<code>support@billing-services-portal.com</code>). The card-suffix "8842" the email referenced wasn't in your AP records. Three independent tells before the click. Real subscription disputes go through the vendor's verified billing portal accessed by manually typing the vendor's main domain, never through links in the renewal alert.
                        </div>
                        <button data-action="restart-lab" onclick="window.location.reload();" style="padding:14px 36px; background:#ff003c; color:#fff; border:none; border-radius:4px; font-weight:900; font-size:1rem; letter-spacing:0.08em; cursor:pointer; font-family:inherit; box-shadow:0 0 16px rgba(255,0,60,0.5);">RESTART INVESTIGATION &rarr;</button>
                        <div style="margin-top:14px; font-size:0.7rem; color:#888;">Your lab session is reset to phase 1. Read the analysis blocks before clicking.</div>
                    </div>
                </div>`
            },

            // LEGIT placeholder (msg/10 Zoom join URL) — clicking the URL
            // in msg/10 body lands here. NO game over: msg/10 is a real Zoom
            // recurring-meeting reminder. Renders a Zoom-style "joining"
            // page so the click is visibly harmless.
            '/j/85544192033': {
                title: 'Joining meeting -- Zoom',
                html: `
                <div style="font-family:'Lato', system-ui, sans-serif; max-width:560px; margin:60px auto; padding:0; background:#fff; border:1px solid #e0e0e0; border-radius:8px; box-shadow:0 2px 10px rgba(0,0,0,0.08); text-align:center;">
                    <div style="background:#2d8cff; color:#fff; padding:14px 20px; border-radius:8px 8px 0 0;">
                        <div style="font-size:1.05rem; font-weight:700; letter-spacing:0.02em;">Zoom</div>
                    </div>
                    <div style="padding:36px 28px;">
                        <div style="margin-bottom:18px;">
                            <div style="width:60px; height:60px; margin:0 auto; border:4px solid #2d8cff; border-top-color:transparent; border-radius:50%; animation:spin 1s linear infinite;"></div>
                            <style>@keyframes spin { to { transform: rotate(360deg); } }</style>
                        </div>
                        <div style="font-size:1.05rem; font-weight:600; color:#232333; margin-bottom:6px;">Joining meeting</div>
                        <div style="font-size:0.86rem; color:#747487; margin-bottom:22px;">
                            <b>AP Weekly Sync</b><br>
                            Meeting ID: 855 4419 2033
                        </div>
                        <div style="padding:14px 18px; background:#f5f7fa; border-radius:6px; font-size:0.78rem; color:#747487; line-height:1.6;">
                            Waiting for the host to start the meeting&hellip;<br>
                            <span style="font-size:0.7rem; color:#a0a0b0;">(2 of 4 expected participants connected)</span>
                        </div>
                        <div style="margin-top:24px;">
                            <a href="https://mail.crimson-dawn.net/inbox" style="color:#2d8cff; text-decoration:none; font-size:0.84rem; font-weight:600;">&larr; Return to inbox</a>
                        </div>
                        <div style="margin-top:18px; padding:10px 14px; background:#fef9c3; border:1px solid #fde68a; border-radius:4px; font-size:0.72rem; color:#713f12; text-align:left;">
                            <b>IR Note (lab-only):</b> Legitimate Zoom meeting URL from msg/10. SPF/DKIM/DMARC passed, origin IP in Zoom\'s ARIN range. Clicking this link is harmless &mdash; it joins a real internal AP weekly sync meeting. msg/10 is decoy.
                        </div>
                    </div>
                </div>`
            },

            // LEGIT placeholder (msg/12 Slack archive URL) — clicking the URL
            // in msg/12 body lands here. Renders a Slack-style channel archive
            // showing the r.chen message that mentions e.morales about the
            // (now-known-fraudulent) Nakamura wire routing change.
            '/archives/C04AP4421/p1726658722': {
                title: '#ap-team -- Crimson Dawn Slack',
                html: `
                <div style="font-family:'Lato', system-ui, sans-serif; max-width:760px; margin:18px auto; background:#fff; border:1px solid #e0e0e0; border-radius:8px; box-shadow:0 2px 10px rgba(0,0,0,0.06); overflow:hidden;">
                    <div style="background:#350d36; color:#fff; padding:12px 20px; display:flex; align-items:center; gap:12px;">
                        <div style="width:28px; height:28px; background:#fff; border-radius:6px; display:flex; align-items:center; justify-content:center; color:#350d36; font-weight:900; font-size:0.8rem;">CD</div>
                        <div>
                            <div style="font-size:0.72rem; opacity:0.85; letter-spacing:0.06em;">CRIMSON DAWN</div>
                            <div style="font-size:0.95rem; font-weight:700;">Slack workspace</div>
                        </div>
                    </div>
                    <div style="display:grid; grid-template-columns:200px 1fr;">
                        <div style="background:#3f0e40; color:#cfc3d0; padding:14px 12px; font-size:0.82rem;">
                            <div style="opacity:0.7; font-size:0.7rem; letter-spacing:0.08em; margin-bottom:6px;">CHANNELS</div>
                            <div style="padding:4px 8px; opacity:0.8;">&#35; ap-finance</div>
                            <div style="padding:4px 8px; background:#1164a3; color:#fff; border-radius:4px; font-weight:700;">&#35; ap-team</div>
                            <div style="padding:4px 8px; opacity:0.8;">&#35; ap-vendors</div>
                            <div style="padding:4px 8px; opacity:0.8;">&#35; general</div>
                            <div style="padding:4px 8px; opacity:0.8;">&#35; random</div>
                            <div style="opacity:0.7; font-size:0.7rem; letter-spacing:0.08em; margin-top:14px; margin-bottom:6px;">DIRECT MESSAGES</div>
                            <div style="padding:4px 8px; opacity:0.8;"><span style="color:#2ecc71;">&bull;</span> r.chen</div>
                            <div style="padding:4px 8px; opacity:0.8;"><span style="color:#aaa;">&bull;</span> m.harlowe</div>
                            <div style="padding:4px 8px; opacity:0.8;"><span style="color:#aaa;">&bull;</span> s.patel</div>
                        </div>
                        <div style="padding:14px 20px;">
                            <div style="border-bottom:1px solid #e0e0e0; padding-bottom:10px; margin-bottom:14px;">
                                <div style="font-size:0.92rem; font-weight:700; color:#1d1c1d;">&#35; ap-team</div>
                                <div style="font-size:0.72rem; color:#747487;">Accounts Payable team channel &middot; 8 members</div>
                            </div>
                            <div style="display:flex; gap:10px; padding:8px 0;">
                                <div style="width:36px; height:36px; background:#dc2626; border-radius:4px; flex-shrink:0; display:flex; align-items:center; justify-content:center; color:#fff; font-weight:700; font-size:0.8rem;">RC</div>
                                <div style="flex:1;">
                                    <div><span style="font-weight:700; color:#1d1c1d;">r.chen</span> <span style="font-size:0.7rem; color:#747487; margin-left:6px;">9:42 AM</span></div>
                                    <div style="margin-top:2px; color:#1d1c1d; font-size:0.86rem; line-height:1.5;">
                                        <span style="color:#1264a3; font-weight:600;">@e.morales</span> &mdash; please verify the May vendor master is up to date by EOM. Want to make sure the Nakamura entry has the corrected wire routing from this morning. Thanks.
                                    </div>
                                </div>
                            </div>
                            <div style="margin-top:14px; padding:8px 12px; background:#f8f8f8; border-radius:6px; font-size:0.72rem; color:#747487; text-align:center;">
                                Showing 1 message &middot; mentioned: @e.morales &middot; <a href="https://mail.crimson-dawn.net/inbox" style="color:#1264a3; text-decoration:none; font-weight:600;">&larr; Return to inbox</a>
                            </div>
                            <div style="margin-top:14px; padding:10px 14px; background:#fef9c3; border:1px solid #fde68a; border-radius:4px; font-size:0.74rem; color:#713f12;">
                                <b>IR Note (lab-only):</b> Legitimate Slack archive from msg/12. The message itself is real internal AP comms. <b>Pedagogical hook:</b> r.chen is unknowingly endorsing the fraudulent "corrected wire routing" that came from msg/4 (the active phish). Connect this thread back to Phase 1 review &mdash; the AP supervisor was socially-engineered into validating the attacker\'s change.
                            </div>
                        </div>
                    </div>
                </div>`
            },

            // ─────────────────────────────────────────────────
            // B. CVE SEARCH: cve.crimson-intel.net
            // ─────────────────────────────────────────────────

            '/search': {
                title: 'CVE Search -- cve.crimson-intel.net',
                html: `
                <div style="font-family:system-ui,sans-serif; max-width:720px; margin:0 auto; padding:16px;">
                    <div style="border-bottom:2px solid #dc2626; padding-bottom:10px; margin-bottom:16px;">
                        <div style="font-size:0.72rem; color:#888; letter-spacing:0.1em; text-transform:uppercase;">CRIMSON INTEL -- CVE MIRROR</div>
                        <div style="font-size:1rem; font-weight:700; color:#222; margin-top:2px;">CVE Database Search</div>
                        <div style="font-size:0.72rem; color:#888;">NVD mirror -- synced 2026-05-21 &nbsp;|&nbsp; Source: nvd.nist.gov</div>
                    </div>
                    <div style="display:flex; gap:8px; margin-bottom:16px;">
                        <input type="text" data-field="cve_query" placeholder="CVE-ID or keyword (e.g. CVE-2022-30190, Follina, MSDT)"
                               style="flex:1; padding:8px 12px; border:1px solid #ccc; border-radius:4px; font-family:inherit; font-size:0.83rem;">
                        <button data-action="search" style="padding:8px 18px; background:#dc2626; color:#fff; border:none; border-radius:4px; font-weight:700; cursor:pointer; font-family:inherit;">Search</button>
                    </div>
                    <div data-results>
                        <div style="color:#888; font-size:0.78rem; text-align:center; padding:20px;">Enter a CVE ID or keyword to search.</div>
                    </div>
                </div>`,
                formHandler: (data, engine) => PISFinalConfig._handleCveSearch(data.cve_query || '', engine)
            },

            // Landing page for bare-hostname 'https://cve.crimson-intel.net' —
            // smart-normalize maps subdomain 'cve' to this key. Nudges the
            // student toward /search without spoiling the CVE inventory.
            '/cve': {
                title: 'CVE Database -- cve.crimson-intel.net',
                html: `
                <div style="font-family:system-ui,sans-serif; max-width:720px; margin:0 auto; padding:16px;">
                    <div style="border-bottom:2px solid #dc2626; padding-bottom:10px; margin-bottom:16px;">
                        <div style="font-size:0.72rem; color:#888; letter-spacing:0.1em; text-transform:uppercase;">CRIMSON INTEL -- CVE MIRROR</div>
                        <div style="font-size:1rem; font-weight:700; color:#222; margin-top:2px;">CVE Database</div>
                        <div style="font-size:0.72rem; color:#888;">NVD mirror -- synced 2026-05-21 &nbsp;|&nbsp; Source: nvd.nist.gov</div>
                    </div>
                    <div style="text-align:center; padding:30px 16px;">
                        <div style="font-size:0.95rem; color:#222; margin-bottom:8px;">Welcome to the CVE Mirror.</div>
                        <div style="font-size:0.85rem; color:#555; margin-bottom:24px;">Search the NVD-synced database for CVE IDs or vulnerability keywords.</div>
                        <a href="https://cve.crimson-intel.net/search" style="display:inline-block; padding:10px 24px; background:#dc2626; color:#fff; text-decoration:none; border-radius:4px; font-weight:700; font-size:0.9rem;">Open CVE Search &rarr;</a>
                        <div style="font-size:0.72rem; color:#888; margin-top:24px;">Direct URL: enter <code>CVE-YYYY-NNNNN</code> in the search to look up a specific entry.</div>
                    </div>
                </div>`
            },

            '/cve/CVE-2022-30190': {
                title: 'CVE-2022-30190 -- Follina',
                html: `
                <div style="font-family:system-ui,sans-serif; max-width:720px; margin:0 auto; padding:16px;">
                    <a href="https://cve.crimson-intel.net/search" style="color:#dc2626; font-size:0.8rem; text-decoration:none;">&larr; Back to Search</a>
                    <div style="margin-top:12px; padding:14px; background:#fff0f0; border:2px solid #dc2626; border-radius:4px;">
                        <div style="font-size:1rem; font-weight:700; color:#dc2626;">CVE-2022-30190 &mdash; "Follina"</div>
                        <div style="font-size:0.78rem; color:#555; margin-top:4px;"><b>NVD Title:</b> Microsoft Windows Support Diagnostic Tool (MSDT) Remote Code Execution Vulnerability</div>
                    </div>
                    <table style="width:100%; border-collapse:collapse; font-size:0.8rem; margin-top:12px;">
                        <tr style="border-bottom:1px solid #eee;"><td style="padding:8px 10px; color:#888; width:160px;">CVSS Score</td><td style="padding:8px 10px; font-weight:700; color:#dc2626;">7.8 HIGH</td></tr>
                        <tr style="border-bottom:1px solid #eee;"><td style="padding:8px 10px; color:#888;">Vendor</td><td style="padding:8px 10px;">Microsoft</td></tr>
                        <tr style="border-bottom:1px solid #eee;"><td style="padding:8px 10px; color:#888;">Affected</td><td style="padding:8px 10px;">Windows OS family (Windows 7 through Server 2022) -- see NVD<br><span style="color:#888; font-size:0.75rem;">Note: Office (Word) is the delivery vector, not the patched component. The vulnerability lives in the Windows MSDT URL protocol handler.</span></td></tr>
                        <tr style="border-bottom:1px solid #eee;"><td style="padding:8px 10px; color:#888;">Disclosure</td><td style="padding:8px 10px;">2022-05-30</td></tr>
                        <tr style="border-bottom:1px solid #eee;"><td style="padding:8px 10px; color:#888;">Delivery vector</td><td style="padding:8px 10px;">Microsoft Office (Word) as calling application -- external template reference triggers MSDT URL protocol</td></tr>
                        <tr style="border-bottom:1px solid #eee;"><td style="padding:8px 10px; color:#888;">Mitigation</td><td style="padding:8px 10px;">KB5014699 (June 14, 2022 Patch Tuesday)<br><a href="https://support.microsoft.com/en-us/topic/june-14-2022-kb5014699-os-builds-19042-1766-19043-1766-and-19044-1766-5c81d49d-0b6e-4808-9485-1f54e5d1bb15" style="color:#dc2626; font-size:0.75rem;">KB5014699 (Microsoft Support)</a></td></tr>
                    </table>
                    <div style="margin-top:12px; padding:10px; background:#f8f8f8; border:1px solid #ddd; border-radius:4px; font-size:0.78rem;">
                        <b>Description:</b> A remote code execution vulnerability exists when MSDT (Microsoft Support Diagnostic Tool) is called using a URL protocol from a calling application such as Word. An attacker who successfully exploits this vulnerability can run arbitrary code with the privileges of the calling application.
                    </div>
                    <div style="margin-top:8px; font-size:0.73rem; color:#888;">Source: NVD mirror -- nvd.nist.gov/vuln/detail/CVE-2022-30190 &nbsp;|&nbsp; MITRE ATT&CK: T1566.001 (Spearphishing Attachment)</div>
                </div>`
            },

            '/cve/CVE-2024-21412': {
                title: 'CVE-2024-21412',
                html: `
                <div style="font-family:system-ui,sans-serif; max-width:720px; margin:0 auto; padding:16px;">
                    <a href="https://cve.crimson-intel.net/search" style="color:#dc2626; font-size:0.8rem; text-decoration:none;">&larr; Back to Search</a>
                    <div style="margin-top:12px; padding:14px; background:#fff8f0; border:2px solid #e67e22; border-radius:4px;">
                        <div style="font-size:1rem; font-weight:700; color:#e67e22;">CVE-2024-21412</div>
                        <div style="font-size:0.78rem; color:#555; margin-top:4px;"><b>NVD Title:</b> Internet Shortcut Files Security Feature Bypass Vulnerability</div>
                    </div>
                    <table style="width:100%; border-collapse:collapse; font-size:0.8rem; margin-top:12px;">
                        <tr style="border-bottom:1px solid #eee;"><td style="padding:8px 10px; color:#888; width:160px;">CVSS Score</td><td style="padding:8px 10px; font-weight:700; color:#e67e22;">8.1 HIGH</td></tr>
                        <tr style="border-bottom:1px solid #eee;"><td style="padding:8px 10px; color:#888;">Vendor</td><td style="padding:8px 10px;">Microsoft</td></tr>
                        <tr style="border-bottom:1px solid #eee;"><td style="padding:8px 10px; color:#888;">Affected</td><td style="padding:8px 10px;">Windows 10, Windows 11, Windows Server 2019, Windows Server 2022</td></tr>
                        <tr style="border-bottom:1px solid #eee;"><td style="padding:8px 10px; color:#888;">Disclosure</td><td style="padding:8px 10px;">2024-02-13</td></tr>
                    </table>
                    <div style="margin-top:10px; padding:8px 12px; background:#fff8f0; border:1px solid #e67e22; border-radius:4px; font-size:0.78rem; color:#e67e22;">
                        <b>Note:</b> This CVE is real and outstanding on WS-EMORALES-01, but it is NOT the CVE exploited in the current incident. Applying this patch first will not resolve the active vulnerability.
                    </div>
                    <div style="margin-top:6px; font-size:0.73rem; color:#888;">Source: NVD mirror -- nvd.nist.gov/vuln/detail/CVE-2024-21412</div>
                </div>`
            },

            '/cve/CVE-2024-26169': {
                title: 'CVE-2024-26169',
                html: `
                <div style="font-family:system-ui,sans-serif; max-width:720px; margin:0 auto; padding:16px;">
                    <a href="https://cve.crimson-intel.net/search" style="color:#dc2626; font-size:0.8rem; text-decoration:none;">&larr; Back to Search</a>
                    <div style="margin-top:12px; padding:14px; background:#f8f8ff; border:2px solid #888; border-radius:4px;">
                        <div style="font-size:1rem; font-weight:700; color:#555;">CVE-2024-26169</div>
                        <div style="font-size:0.78rem; color:#555; margin-top:4px;"><b>NVD Title:</b> Windows Error Reporting Service Elevation of Privilege Vulnerability</div>
                    </div>
                    <table style="width:100%; border-collapse:collapse; font-size:0.8rem; margin-top:12px;">
                        <tr style="border-bottom:1px solid #eee;"><td style="padding:8px 10px; color:#888; width:160px;">CVSS Score</td><td style="padding:8px 10px; font-weight:700; color:#555;">7.8 HIGH (EoP)</td></tr>
                        <tr style="border-bottom:1px solid #eee;"><td style="padding:8px 10px; color:#888;">Vendor</td><td style="padding:8px 10px;">Microsoft</td></tr>
                        <tr style="border-bottom:1px solid #eee;"><td style="padding:8px 10px; color:#888;">Type</td><td style="padding:8px 10px;">Elevation of Privilege (local)</td></tr>
                        <tr style="border-bottom:1px solid #eee;"><td style="padding:8px 10px; color:#888;">Disclosure</td><td style="padding:8px 10px;">2024-03-12</td></tr>
                    </table>
                    <div style="margin-top:10px; padding:8px 12px; background:#f8f8f8; border:1px solid #ddd; border-radius:4px; font-size:0.78rem; color:#888;">
                        <b>Note:</b> Elevation of Privilege -- not the initial access vector. This CVE is outstanding on WS-EMORALES-01 but was NOT the exploited vulnerability in this incident.
                    </div>
                    <div style="margin-top:6px; font-size:0.73rem; color:#888;">Source: NVD mirror -- nvd.nist.gov/vuln/detail/CVE-2024-26169</div>
                </div>`
            },

            // ─────────────────────────────────────────────────
            // C. WHOIS: whois.crimson-intel.net
            //   Key changed from '/' to '/whois' to (a) eliminate collision
            //   with any trailing-slash URL student types (every
            //   https://*.crimson-dawn.net/ would resolve here), and
            //   (b) let Browser engine smart-normalize map subdomain
            //   'whois' to /whois automatically.
            // ─────────────────────────────────────────────────

            '/whois': {
                title: 'WHOIS Lookup -- whois.crimson-intel.net',
                html: `
                <style>
                  .wh-shell { font-family: 'Inter', system-ui, sans-serif; max-width: 1040px; margin: 18px auto; color: #1e293b; }
                  .wh-shell .wh-header { background: #fff; border: 1px solid #e2e8f0; border-radius: 8px 8px 0 0; padding: 14px 20px; display: flex; align-items: center; gap: 14px; }
                  .wh-shell .wh-logo { width: 36px; height: 36px; flex-shrink: 0; background: linear-gradient(135deg, #0891b2, #155e75); border-radius: 6px; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 800; font-size: 0.78rem; letter-spacing: 0.04em; }
                  .wh-shell .wh-brand .wh-org { font-size: 0.66rem; letter-spacing: 0.14em; text-transform: uppercase; color: #64748b; }
                  .wh-shell .wh-brand .wh-app { font-size: 1.05rem; font-weight: 700; color: #0f172a; margin-top: 1px; }
                  .wh-shell .wh-stats { margin-left: auto; display: flex; gap: 18px; font-size: 0.7rem; color: #64748b; }
                  .wh-shell .wh-stats .wh-stat-v { color: #0f172a; font-weight: 700; }
                  .wh-shell .wh-search-card { background: #fff; border: 1px solid #e2e8f0; border-top: 0; padding: 20px; }
                  .wh-shell .wh-prompt { font-size: 0.82rem; color: #334155; margin-bottom: 10px; }
                  .wh-shell .wh-search-row { display: flex; gap: 8px; }
                  .wh-shell input.wh-q { flex: 1; padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 4px; font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 0.82rem; color: #0f172a; background: #fff; outline: 0; transition: border 0.15s; box-sizing: border-box; }
                  .wh-shell input.wh-q::placeholder { color: #94a3b8; }
                  .wh-shell input.wh-q:focus { border-color: #0891b2; box-shadow: 0 0 0 3px rgba(8, 145, 178, 0.12); }
                  .wh-shell button.wh-lookup { padding: 10px 22px; background: #0891b2; color: #fff; border: 0; border-radius: 4px; font-weight: 700; font-size: 0.82rem; letter-spacing: 0.04em; cursor: pointer; font-family: inherit; }
                  .wh-shell button.wh-lookup:hover { background: #0e7490; }
                  .wh-shell .wh-chips { margin-top: 10px; display: flex; flex-wrap: wrap; gap: 6px; }
                  .wh-shell .wh-chip-label { color: #64748b; font-size: 0.7rem; padding: 4px 0; margin-right: 4px; }
                  .wh-shell .wh-chip { padding: 4px 10px; background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 12px; color: #0c4a6e; font-size: 0.7rem; cursor: pointer; transition: all 0.12s; }
                  .wh-shell .wh-chip:hover { background: #e0f2fe; border-color: #38bdf8; }
                  .wh-shell .wh-results { background: #fff; border: 1px solid #e2e8f0; border-top: 0; border-radius: 0 0 8px 8px; min-height: 80px; }
                  .wh-shell .wh-empty { padding: 26px 18px; text-align: center; color: #64748b; font-size: 0.78rem; }
                  /* Result components — rendered by handler */
                  .wh-shell .wh-result-head { padding: 18px 22px; display: flex; align-items: center; gap: 18px; border-bottom: 1px solid #e2e8f0; }
                  .wh-shell .wh-result-head.suspicious { background: linear-gradient(180deg, #fef2f2 0%, #fff 100%); border-bottom-color: #fecaca; }
                  .wh-shell .wh-result-head.legit { background: linear-gradient(180deg, #f0fdf4 0%, #fff 100%); border-bottom-color: #bbf7d0; }
                  .wh-shell .wh-result-head.neutral { background: linear-gradient(180deg, #f8fafc 0%, #fff 100%); border-bottom-color: #e2e8f0; }
                  .wh-shell .wh-target { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 1.15rem; font-weight: 700; color: #0f172a; flex: 1; }
                  .wh-shell .wh-verdict-pill { display: inline-block; padding: 4px 12px; border-radius: 4px; font-size: 0.66rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; }
                  .wh-shell .wh-verdict-pill.suspicious { background: #ef4444; color: #fff; }
                  .wh-shell .wh-verdict-pill.legit { background: #22c55e; color: #fff; }
                  .wh-shell .wh-verdict-pill.neutral { background: #94a3b8; color: #fff; }
                  .wh-shell .wh-result-body { display: grid; grid-template-columns: 1.4fr 1fr; gap: 0; }
                  @media (max-width: 820px) { .wh-shell .wh-result-body { grid-template-columns: 1fr; } }
                  .wh-shell .wh-raw-col { padding: 16px 20px; border-right: 1px solid #f1f5f9; }
                  @media (max-width: 820px) { .wh-shell .wh-raw-col { border-right: 0; border-bottom: 1px solid #f1f5f9; } }
                  .wh-shell .wh-section-label { font-size: 0.66rem; letter-spacing: 0.1em; text-transform: uppercase; font-weight: 700; color: #64748b; margin-bottom: 8px; }
                  .wh-shell .wh-raw { background: #0f172a; color: #cbd5e1; padding: 14px 16px; border-radius: 4px; font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 0.74rem; line-height: 1.7; white-space: pre-wrap; word-break: break-word; overflow-x: auto; }
                  .wh-shell .wh-raw .wh-k { color: #94a3b8; }
                  .wh-shell .wh-raw .wh-v-red { color: #fca5a5; font-weight: 700; }
                  .wh-shell .wh-raw .wh-v-green { color: #86efac; font-weight: 700; }
                  .wh-shell .wh-meta-col { padding: 16px 20px; background: #f8fafc; }
                  .wh-shell .wh-meta-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px 14px; margin-bottom: 12px; }
                  .wh-shell .wh-meta-card-h { font-size: 0.7rem; letter-spacing: 0.08em; text-transform: uppercase; color: #64748b; font-weight: 700; margin-bottom: 8px; }
                  .wh-shell .wh-meta-row { display: flex; justify-content: space-between; align-items: center; gap: 10px; padding: 3px 0; font-size: 0.78rem; }
                  .wh-shell .wh-meta-row .wh-meta-k { color: #94a3b8; font-size: 0.7rem; }
                  .wh-shell .wh-meta-row .wh-meta-v { color: #0f172a; font-weight: 600; text-align: right; font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 0.74rem; }
                  .wh-shell .wh-meta-row .wh-meta-v.suspicious { color: #b91c1c; }
                  .wh-shell .wh-meta-row .wh-meta-v.legit { color: #15803d; }
                  .wh-shell .wh-age-badge { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 0.62rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; font-family: 'Inter', system-ui, sans-serif; }
                  .wh-shell .wh-age-badge.crit { background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; }
                  .wh-shell .wh-age-badge.warn { background: #fef3c7; color: #92400e; border: 1px solid #fde68a; }
                  .wh-shell .wh-age-badge.ok { background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; }
                  .wh-shell .wh-pivots { margin-top: 10px; }
                  .wh-shell .wh-pivots-h { font-size: 0.66rem; letter-spacing: 0.08em; text-transform: uppercase; color: #64748b; font-weight: 700; margin-bottom: 6px; }
                  .wh-shell .wh-pivot { display: block; padding: 6px 10px; background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 4px; margin-bottom: 4px; font-size: 0.74rem; color: #0c4a6e; text-decoration: none; font-family: 'JetBrains Mono', ui-monospace, monospace; }
                  .wh-shell .wh-pivot:hover { background: #e0f2fe; border-color: #38bdf8; color: #075985; }
                  .wh-shell .wh-pivot-label { font-family: 'Inter', system-ui, sans-serif; color: #64748b; font-size: 0.66rem; letter-spacing: 0.06em; text-transform: uppercase; font-weight: 700; margin-right: 8px; }
                  .wh-shell .wh-analyst { padding: 14px 20px; background: #fef9c3; border-top: 1px solid #fde68a; font-size: 0.82rem; color: #713f12; line-height: 1.6; }
                  .wh-shell .wh-analyst.legit { background: #f0fdf4; border-top-color: #bbf7d0; color: #14532d; }
                  .wh-shell .wh-analyst b { color: #422006; }
                  .wh-shell .wh-analyst.legit b { color: #14532d; }
                  .wh-shell .wh-no-result { padding: 24px 20px; text-align: center; color: #64748b; font-size: 0.82rem; }
                  .wh-shell .wh-no-result code { background: #f1f5f9; border: 1px solid #e2e8f0; padding: 1px 6px; border-radius: 3px; font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 0.74rem; }
                </style>
                <div class="wh-shell">
                  <div class="wh-header">
                    <div class="wh-logo">CI</div>
                    <div class="wh-brand">
                      <div class="wh-org">Crimson Intel &middot; Domain Forensics</div>
                      <div class="wh-app">WHOIS Lookup <span style="font-weight:400; color:#64748b; font-size:0.74rem; margin-left:6px;">&middot; ICANN + ASN mirror</span></div>
                    </div>
                    <div class="wh-stats">
                      <div>ICANN mirror sync <span class="wh-stat-v">2026-05-21</span></div>
                      <div>ASN db <span class="wh-stat-v">RIPE + ARIN</span></div>
                    </div>
                  </div>
                  <div class="wh-search-card">
                    <div class="wh-prompt">Enter a <b>domain name</b> or <b>IP address</b> to retrieve registration history, name servers, registrar, DNSSEC status, and ASN enrichment.</div>
                    <div class="wh-search-row">
                      <input type="text" class="wh-q" data-field="whois_query" placeholder="crimson-dawn-finance.net, 185.220.101.45, ...">
                      <button class="wh-lookup" data-action="lookup">Lookup</button>
                    </div>
                    <div class="wh-chips">
                      <span class="wh-chip-label">Quick lookups:</span>
                      <span class="wh-chip" onclick="var i=document.querySelector('.wh-shell .wh-q'); if(i){i.value='crimson-dawn-finance.net';i.focus();}">crimson-dawn-finance.net</span>
                      <span class="wh-chip" onclick="var i=document.querySelector('.wh-shell .wh-q'); if(i){i.value='emberwolf-c2.duckdns.org';i.focus();}">emberwolf-c2.duckdns.org</span>
                      <span class="wh-chip" onclick="var i=document.querySelector('.wh-shell .wh-q'); if(i){i.value='nakamura-suppliers-corp.com';i.focus();}">nakamura-suppliers-corp.com</span>
                      <span class="wh-chip" onclick="var i=document.querySelector('.wh-shell .wh-q'); if(i){i.value='nakamura-supplies.com';i.focus();}">nakamura-supplies.com</span>
                      <span class="wh-chip" onclick="var i=document.querySelector('.wh-shell .wh-q'); if(i){i.value='185.220.101.45';i.focus();}">185.220.101.45</span>
                    </div>
                  </div>
                  <div class="wh-results" data-results>
                    <div class="wh-empty">Enter a domain or IP and click <b>Lookup</b>.<br><span style="opacity:0.7; font-size:0.74rem;">Use the quick-lookup chips above to pivot to a known IOC.</span></div>
                  </div>
                </div>`,
                formHandler: (data, engine) => PISFinalConfig._handleWhois(data.whois_query || '', engine)
            },

            // ─────────────────────────────────────────────────
            // D. HASH ANALYZER: vt-mirror.crimson-intel.net
            // ─────────────────────────────────────────────────

            // Key changed from '/hash' to '/vt-mirror' so Browser engine
            // smart-normalize maps subdomain 'vt-mirror' to this page.
            // (Title already references vt-mirror.crimson-intel.net.)
            '/vt-mirror': {
                title: 'Hash Analyzer -- vt-mirror.crimson-intel.net',
                html: `
                <style>
                  .vt-shell {
                    font-family: 'Inter', system-ui, -apple-system, sans-serif;
                    max-width: 960px; margin: 18px auto; color: #1e293b;
                  }
                  .vt-shell .vt-header {
                    background: #fff; border: 1px solid #e2e8f0;
                    border-radius: 8px 8px 0 0;
                    padding: 14px 20px; display: flex; align-items: center; gap: 14px;
                  }
                  .vt-shell .vt-logo {
                    width: 36px; height: 36px; flex-shrink: 0;
                    background: linear-gradient(135deg, #2563eb, #1e40af);
                    border-radius: 6px; display: flex; align-items: center; justify-content: center;
                    color: #fff; font-weight: 800; font-size: 0.9rem; letter-spacing: 0.04em;
                  }
                  .vt-shell .vt-brand .vt-org { font-size: 0.66rem; letter-spacing: 0.14em; text-transform: uppercase; color: #64748b; }
                  .vt-shell .vt-brand .vt-app { font-size: 1.05rem; font-weight: 700; color: #0f172a; margin-top: 1px; }
                  .vt-shell .vt-stats {
                    margin-left: auto; display: flex; gap: 18px; font-size: 0.7rem; color: #64748b;
                  }
                  .vt-shell .vt-stats .vt-stat-v { color: #0f172a; font-weight: 700; }
                  .vt-shell .vt-search-card {
                    background: #fff; border: 1px solid #e2e8f0; border-top: 0;
                    padding: 22px 20px;
                  }
                  .vt-shell .vt-tabs {
                    display: flex; gap: 0; border-bottom: 1px solid #e2e8f0; margin-bottom: 16px;
                  }
                  .vt-shell .vt-tab {
                    padding: 8px 16px; font-size: 0.78rem; font-weight: 600; color: #64748b;
                    letter-spacing: 0.02em; border-bottom: 2px solid transparent; user-select: none;
                  }
                  .vt-shell .vt-tab.active { color: #2563eb; border-bottom-color: #2563eb; }
                  .vt-shell .vt-prompt {
                    font-size: 0.82rem; color: #334155; margin-bottom: 8px;
                  }
                  .vt-shell .vt-prompt b { color: #0f172a; }
                  .vt-shell textarea.vt-hash {
                    width: 100%; padding: 12px 14px;
                    border: 2px dashed #cbd5e1; border-radius: 6px;
                    font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 0.84rem;
                    color: #0f172a; background: #f8fafc; box-sizing: border-box;
                    resize: vertical; outline: 0; transition: border 0.15s, background 0.15s;
                  }
                  .vt-shell textarea.vt-hash::placeholder { color: #94a3b8; }
                  .vt-shell textarea.vt-hash:focus {
                    border-color: #2563eb; background: #fff;
                    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
                  }
                  .vt-shell .vt-actions {
                    margin-top: 12px; display: flex; gap: 10px; align-items: center;
                  }
                  .vt-shell button.vt-analyze {
                    padding: 10px 24px; background: #2563eb; color: #fff;
                    border: 0; border-radius: 4px; font-weight: 700; font-size: 0.84rem;
                    letter-spacing: 0.04em; cursor: pointer;
                  }
                  .vt-shell button.vt-analyze:hover { background: #1e40af; }
                  .vt-shell .vt-sample-hashes {
                    font-size: 0.7rem; color: #64748b;
                  }
                  .vt-shell .vt-sample-hashes code {
                    background: #f1f5f9; border: 1px solid #e2e8f0; padding: 1px 5px;
                    border-radius: 3px; font-size: 0.66rem; cursor: pointer;
                  }
                  .vt-shell .vt-sample-hashes code:hover { background: #e0f2fe; border-color: #7dd3fc; }
                  .vt-shell .vt-results-frame {
                    background: #fff; border: 1px solid #e2e8f0; border-top: 0;
                    border-radius: 0 0 8px 8px; min-height: 60px;
                  }
                  .vt-shell .vt-results-empty {
                    padding: 22px 20px; text-align: center; color: #64748b; font-size: 0.8rem;
                  }
                  /* Result cards rendered by handler */
                  .vt-shell .vt-verdict-bar {
                    padding: 16px 22px; display: flex; align-items: center; gap: 20px;
                    border-bottom: 1px solid #e2e8f0;
                  }
                  .vt-shell .vt-verdict-bar.malicious { background: linear-gradient(180deg, #fef2f2 0%, #fff 100%); border-bottom-color: #fecaca; }
                  .vt-shell .vt-verdict-bar.clean { background: linear-gradient(180deg, #f0fdf4 0%, #fff 100%); border-bottom-color: #bbf7d0; }
                  .vt-shell .vt-verdict-bar.unknown { background: #fefce8; border-bottom-color: #fde68a; }
                  .vt-shell .vt-ratio {
                    width: 96px; height: 96px; border-radius: 50%; flex-shrink: 0;
                    display: flex; flex-direction: column; align-items: center; justify-content: center;
                    background: #fff; border: 6px solid #ef4444; color: #b91c1c;
                  }
                  .vt-shell .vt-ratio.clean { border-color: #22c55e; color: #15803d; }
                  .vt-shell .vt-ratio.unknown { border-color: #eab308; color: #a16207; }
                  .vt-shell .vt-ratio .vt-ratio-num { font-size: 1.55rem; font-weight: 800; line-height: 1; font-family: 'JetBrains Mono', ui-monospace, monospace; }
                  .vt-shell .vt-ratio .vt-ratio-den { font-size: 0.66rem; font-weight: 700; color: #64748b; letter-spacing: 0.08em; margin-top: 2px; text-transform: uppercase; }
                  .vt-shell .vt-verdict-meta { flex: 1; }
                  .vt-shell .vt-verdict-label {
                    display: inline-block; padding: 3px 12px; border-radius: 4px;
                    font-size: 0.66rem; font-weight: 700; letter-spacing: 0.12em;
                    text-transform: uppercase;
                  }
                  .vt-shell .vt-verdict-label.malicious { background: #ef4444; color: #fff; }
                  .vt-shell .vt-verdict-label.clean { background: #22c55e; color: #fff; }
                  .vt-shell .vt-verdict-label.unknown { background: #eab308; color: #422006; }
                  .vt-shell .vt-verdict-title { font-size: 1.05rem; font-weight: 700; color: #0f172a; margin-top: 6px; }
                  .vt-shell .vt-verdict-sub { font-size: 0.78rem; color: #64748b; margin-top: 2px; }
                  .vt-shell .vt-hash-row {
                    padding: 12px 22px; background: #f8fafc; border-bottom: 1px solid #e2e8f0;
                    font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 0.72rem;
                    color: #475569; word-break: break-all;
                  }
                  .vt-shell .vt-hash-row .vt-hash-k { color: #94a3b8; margin-right: 8px; font-weight: 700; text-transform: uppercase; font-size: 0.62rem; letter-spacing: 0.08em; }
                  .vt-shell .vt-section-tabs {
                    display: flex; gap: 0; border-bottom: 1px solid #e2e8f0; padding: 0 18px;
                    background: #fff;
                  }
                  .vt-shell .vt-section-tab {
                    padding: 10px 14px; font-size: 0.74rem; font-weight: 600; color: #64748b;
                    border-bottom: 2px solid transparent; user-select: none;
                  }
                  .vt-shell .vt-section-tab.active { color: #ef4444; border-bottom-color: #ef4444; }
                  .vt-shell .vt-section-tab.active.clean { color: #16a34a; border-bottom-color: #16a34a; }
                  .vt-shell .vt-section {
                    padding: 14px 20px;
                  }
                  .vt-shell table.vt-kv { width: 100%; border-collapse: collapse; font-size: 0.8rem; }
                  .vt-shell table.vt-kv td { padding: 6px 10px; vertical-align: top; }
                  .vt-shell table.vt-kv tr { border-bottom: 1px solid #f1f5f9; }
                  .vt-shell table.vt-kv tr:last-child { border-bottom: 0; }
                  .vt-shell table.vt-kv td.vt-k { color: #64748b; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.06em; font-weight: 700; width: 200px; }
                  .vt-shell table.vt-kv td.vt-v { color: #0f172a; font-weight: 500; }
                  .vt-shell table.vt-kv td.vt-v.danger { color: #b91c1c; font-weight: 700; }
                  .vt-shell table.vt-kv td.vt-v a { color: #2563eb; text-decoration: none; font-weight: 700; }
                  .vt-shell table.vt-kv td.vt-v a:hover { text-decoration: underline; }
                  .vt-shell .vt-engine-grid {
                    display: grid; grid-template-columns: 1fr 1fr; gap: 0;
                    font-size: 0.78rem;
                  }
                  @media (max-width: 700px) { .vt-shell .vt-engine-grid { grid-template-columns: 1fr; } }
                  .vt-shell .vt-engine-row {
                    padding: 6px 14px; border-bottom: 1px solid #f1f5f9;
                    display: flex; justify-content: space-between; gap: 10px;
                  }
                  .vt-shell .vt-engine-row .vt-engine-name { color: #475569; font-weight: 600; }
                  .vt-shell .vt-engine-row .vt-engine-sig { color: #b91c1c; font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 0.72rem; }
                  .vt-shell .vt-engine-row.clean .vt-engine-sig { color: #16a34a; font-weight: 700; font-family: inherit; font-size: 0.74rem; }
                  .vt-shell .vt-ioc-list { font-size: 0.8rem; }
                  .vt-shell .vt-ioc-list .vt-ioc {
                    padding: 8px 12px; background: #fef2f2; border-left: 3px solid #ef4444;
                    border-radius: 4px; margin-bottom: 6px;
                  }
                  .vt-shell .vt-ioc-list .vt-ioc-k { font-size: 0.66rem; color: #b91c1c; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 2px; }
                  .vt-shell .vt-ioc-list .vt-ioc-v { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 0.78rem; color: #0f172a; font-weight: 600; }
                  .vt-shell .vt-ioc-list .vt-ioc-v a { color: #2563eb; text-decoration: none; border-bottom: 1px dotted #2563eb; padding-bottom: 0; }
                  .vt-shell .vt-ioc-list .vt-ioc-v a:hover { color: #1e40af; border-bottom-style: solid; }
                  .vt-shell .vt-ioc-list .vt-ioc-desc { font-size: 0.74rem; color: #64748b; margin-top: 2px; }
                  .vt-shell .vt-flag-note {
                    margin: 14px 18px; padding: 10px 14px;
                    background: #fef9c3; border: 1px solid #fde68a; border-radius: 4px;
                    font-size: 0.75rem; color: #713f12;
                  }
                  .vt-shell .vt-flag-note code { background: #fff; border: 1px solid #fde68a; padding: 1px 5px; border-radius: 3px; }
                </style>
                <div class="vt-shell">
                  <div class="vt-header">
                    <div class="vt-logo">VT</div>
                    <div class="vt-brand">
                      <div class="vt-org">Crimson Intel &middot; Hash Analyzer</div>
                      <div class="vt-app">VT Mirror <span style="font-weight:400; color:#64748b; font-size:0.74rem; margin-left:6px;">&middot; 68 engines</span></div>
                    </div>
                    <div class="vt-stats">
                      <div><span class="vt-stat-v">68</span> engines</div>
                      <div>Last sync <span class="vt-stat-v">2026-05-21</span></div>
                    </div>
                  </div>
                  <div class="vt-search-card">
                    <div class="vt-tabs">
                      <div class="vt-tab active">SHA-256</div>
                      <div class="vt-tab" style="opacity:0.5; cursor:not-allowed;">SHA-1</div>
                      <div class="vt-tab" style="opacity:0.5; cursor:not-allowed;">MD5</div>
                      <div class="vt-tab" style="opacity:0.5; cursor:not-allowed;">URL</div>
                    </div>
                    <div class="vt-prompt">Paste a <b>SHA-256 file hash</b> (64 hex characters) to check the 68-engine consensus feed for known malware signatures, family attribution, and IOC correlation.</div>
                    <textarea class="vt-hash" data-field="hash_input" rows="3" placeholder="e.g. b3a4f8c2d7e91a6e5f8c2b1d9a4f7e3c8b6d2a1f9e7c4b8a6d3f2e1c9b8a7f4d"></textarea>
                    <div class="vt-actions">
                      <button class="vt-analyze" data-action="analyze">Analyze Hash</button>
                      <span class="vt-sample-hashes">Need a hash? <code onclick="var t=this.parentNode.parentNode.parentNode.querySelector('.vt-hash'); if(t){t.value='sha256sum the file in /home/ir-lead/downloads/ first'; t.focus();}">sha256sum first</code></span>
                    </div>
                  </div>
                  <div class="vt-results-frame" data-results>
                    <div class="vt-results-empty">Paste a SHA-256 hash above and click <b>Analyze Hash</b>.<br><span style="opacity:0.7; font-size:0.74rem;">Phase 2 reminder: hash the attachment you downloaded from webmail first via <code style="background:#f1f5f9; padding:1px 5px; border-radius:3px;">sha256sum</code>.</span></div>
                  </div>
                </div>`,
                formHandler: (data, engine) => PISFinalConfig._handleHashLookup(data.hash_input || '', engine)
            },

            // ─────────────────────────────────────────────────
            // E. THREAT INTEL: intel.crimson-intel.net
            // ─────────────────────────────────────────────────

            '/intel': {
                title: 'Threat Intel Mirror -- intel.crimson-intel.net',
                html: `
                <style>
                  .ti-shell { font-family: 'Inter', system-ui, sans-serif; max-width: 1080px; margin: 18px auto; color: #e2e8f0; background: #0f172a; min-height: calc(100vh - 36px); padding-bottom: 24px; }
                  .ti-shell .ti-header { background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border-bottom: 2px solid #dc2626; padding: 18px 24px; display: flex; align-items: center; gap: 14px; }
                  .ti-shell .ti-logo { width: 42px; height: 42px; flex-shrink: 0; background: linear-gradient(135deg, #dc2626, #7f1d1d); border-radius: 6px; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 800; font-size: 0.78rem; letter-spacing: 0.04em; }
                  .ti-shell .ti-brand .ti-org { font-size: 0.66rem; letter-spacing: 0.16em; text-transform: uppercase; color: #94a3b8; }
                  .ti-shell .ti-brand .ti-app { font-size: 1.1rem; font-weight: 700; color: #f8fafc; margin-top: 1px; }
                  .ti-shell .ti-stats { margin-left: auto; display: flex; gap: 22px; font-size: 0.7rem; color: #64748b; }
                  .ti-shell .ti-stats .ti-stat-v { color: #f1f5f9; font-weight: 700; }
                  .ti-shell .ti-search-card { background: #1e293b; border-bottom: 1px solid #334155; padding: 22px 24px; }
                  .ti-shell .ti-search-meta { font-size: 0.82rem; color: #cbd5e1; margin-bottom: 12px; line-height: 1.6; }
                  .ti-shell .ti-search-meta b { color: #f8fafc; }
                  .ti-shell .ti-search-row { display: flex; gap: 8px; }
                  .ti-shell input.ti-q { flex: 1; padding: 10px 12px; background: #0f172a; border: 1px solid #475569; border-radius: 4px; font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 0.82rem; color: #f8fafc; outline: 0; box-sizing: border-box; }
                  .ti-shell input.ti-q::placeholder { color: #64748b; }
                  .ti-shell input.ti-q:focus { border-color: #dc2626; box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.18); }
                  .ti-shell button.ti-go { padding: 10px 22px; background: #dc2626; color: #fff; border: 0; border-radius: 4px; font-weight: 700; font-size: 0.82rem; cursor: pointer; letter-spacing: 0.02em; }
                  .ti-shell button.ti-go:hover { background: #b91c1c; }
                  .ti-shell .ti-chips { margin-top: 12px; display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
                  .ti-shell .ti-chip-label { color: #64748b; font-size: 0.7rem; margin-right: 4px; }
                  .ti-shell .ti-chip { padding: 4px 10px; background: rgba(220, 38, 38, 0.12); border: 1px solid rgba(220, 38, 38, 0.32); border-radius: 12px; color: #fca5a5; font-size: 0.7rem; cursor: pointer; font-family: 'JetBrains Mono', ui-monospace, monospace; }
                  .ti-shell .ti-chip:hover { background: rgba(220, 38, 38, 0.2); border-color: #dc2626; color: #fecaca; }
                  .ti-shell .ti-results { padding: 18px 24px 0; }
                  .ti-shell .ti-empty { padding: 32px 18px; text-align: center; color: #64748b; font-size: 0.82rem; line-height: 1.7; }
                  .ti-shell .ti-empty code { background: #1e293b; border: 1px solid #334155; padding: 1px 6px; border-radius: 3px; font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 0.74rem; color: #cbd5e1; }
                  .ti-shell .ti-search-summary { padding: 8px 12px; background: rgba(220, 38, 38, 0.08); border-left: 3px solid #dc2626; margin-bottom: 18px; font-size: 0.78rem; color: #fecaca; letter-spacing: 0.02em; }
                  .ti-shell .ti-search-summary b { color: #fff; }
                  /* Actor card */
                  .ti-shell .ti-actor { background: #1e293b; border: 1px solid #334155; border-radius: 6px; margin-bottom: 14px; overflow: hidden; }
                  .ti-shell .ti-actor.high { border-color: #dc2626; box-shadow: 0 0 0 1px rgba(220, 38, 38, 0.3); }
                  .ti-shell .ti-actor.partial { border-color: #d97706; }
                  .ti-shell .ti-actor-head { padding: 14px 18px; display: flex; align-items: center; gap: 14px; border-bottom: 1px solid #334155; }
                  .ti-shell .ti-actor.high .ti-actor-head { background: linear-gradient(135deg, rgba(220, 38, 38, 0.18) 0%, transparent 100%); }
                  .ti-shell .ti-actor.partial .ti-actor-head { background: linear-gradient(135deg, rgba(217, 119, 6, 0.12) 0%, transparent 100%); }
                  .ti-shell .ti-codename { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 1.2rem; font-weight: 800; color: #f8fafc; letter-spacing: 0.04em; }
                  .ti-shell .ti-actor.high .ti-codename { color: #fca5a5; }
                  .ti-shell .ti-actor.partial .ti-codename { color: #fdba74; }
                  .ti-shell .ti-match-badge { display: inline-block; padding: 4px 10px; border-radius: 4px; font-size: 0.7rem; font-weight: 700; font-family: 'JetBrains Mono', ui-monospace, monospace; letter-spacing: 0.04em; }
                  .ti-shell .ti-actor.high .ti-match-badge { background: #dc2626; color: #fff; }
                  .ti-shell .ti-actor.partial .ti-match-badge { background: #d97706; color: #fff; }
                  .ti-shell .ti-actor.low .ti-match-badge { background: #475569; color: #cbd5e1; }
                  .ti-shell .ti-flag { margin-left: auto; display: flex; align-items: center; gap: 8px; }
                  .ti-shell .ti-flag-code { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 0.78rem; font-weight: 700; padding: 4px 10px; border-radius: 4px; letter-spacing: 0.06em; }
                  .ti-shell .ti-flag-code.ru { background: rgba(220, 38, 38, 0.2); color: #fca5a5; border: 1px solid rgba(220, 38, 38, 0.5); }
                  .ti-shell .ti-flag-code.us { background: rgba(59, 130, 246, 0.2); color: #93c5fd; border: 1px solid rgba(59, 130, 246, 0.5); }
                  .ti-shell .ti-flag-code.unk { background: rgba(148, 163, 184, 0.16); color: #cbd5e1; border: 1px solid rgba(148, 163, 184, 0.4); }
                  .ti-shell .ti-flag-code.cn { background: rgba(234, 88, 12, 0.2); color: #fdba74; border: 1px solid rgba(234, 88, 12, 0.5); }
                  .ti-shell .ti-flag-code.kp { background: rgba(168, 85, 247, 0.18); color: #c4b5fd; border: 1px solid rgba(168, 85, 247, 0.5); }
                  .ti-shell .ti-flag-code.ir { background: rgba(20, 184, 166, 0.18); color: #5eead4; border: 1px solid rgba(20, 184, 166, 0.5); }
                  .ti-shell .ti-keyfacts { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0; border-bottom: 1px solid #334155; }
                  @media (max-width: 760px) { .ti-shell .ti-keyfacts { grid-template-columns: repeat(2, 1fr); } }
                  .ti-shell .ti-kf { padding: 10px 14px; border-right: 1px solid #334155; }
                  .ti-shell .ti-kf:last-child { border-right: 0; }
                  .ti-shell .ti-kf-k { font-size: 0.62rem; letter-spacing: 0.12em; text-transform: uppercase; color: #64748b; font-weight: 700; }
                  .ti-shell .ti-kf-v { color: #f1f5f9; font-size: 0.82rem; font-weight: 600; margin-top: 4px; }
                  .ti-shell .ti-kf-v.hot { color: #fca5a5; }
                  .ti-shell .ti-kf-v.warn { color: #fdba74; }
                  .ti-shell .ti-ttp-section { padding: 14px 18px; }
                  .ti-shell .ti-ttp-h { font-size: 0.66rem; letter-spacing: 0.12em; text-transform: uppercase; color: #94a3b8; font-weight: 700; margin-bottom: 10px; }
                  .ti-shell .ti-ttp-table { width: 100%; border-collapse: collapse; font-size: 0.8rem; }
                  .ti-shell .ti-ttp-table td { padding: 7px 10px; border-bottom: 1px solid #334155; }
                  .ti-shell .ti-ttp-table tr:last-child td { border-bottom: 0; }
                  .ti-shell .ti-ttp-table .ti-ttp-k { color: #94a3b8; width: 170px; font-size: 0.72rem; letter-spacing: 0.04em; }
                  .ti-shell .ti-ttp-table .ti-ttp-v { color: #e2e8f0; font-weight: 600; }
                  .ti-shell .ti-ttp-table .ti-ttp-v.match { color: #fca5a5; }
                  .ti-shell .ti-ttp-table .ti-ttp-v.no-match { color: #94a3b8; font-weight: 400; }
                  .ti-shell .ti-mitre { display: inline-block; background: #0f172a; border: 1px solid #475569; color: #93c5fd; padding: 1px 6px; border-radius: 3px; font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 0.68rem; margin-left: 6px; }
                  .ti-shell .ti-disambig { margin: 12px 18px 14px; padding: 12px 14px; background: rgba(220, 38, 38, 0.08); border-left: 3px solid #dc2626; border-radius: 0 4px 4px 0; font-size: 0.78rem; color: #fecaca; line-height: 1.6; }
                  .ti-shell .ti-disambig b { color: #fff; }
                  .ti-shell .ti-pivots { padding: 10px 18px 14px; background: #0f172a; border-top: 1px solid #334155; }
                  .ti-shell .ti-pivots-h { font-size: 0.62rem; letter-spacing: 0.12em; text-transform: uppercase; color: #64748b; font-weight: 700; margin-bottom: 8px; }
                  .ti-shell .ti-pivot { display: inline-block; padding: 5px 10px; background: rgba(56, 189, 248, 0.1); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 4px; margin-right: 6px; margin-bottom: 4px; font-size: 0.72rem; color: #7dd3fc; text-decoration: none; font-family: 'JetBrains Mono', ui-monospace, monospace; }
                  .ti-shell .ti-pivot:hover { background: rgba(56, 189, 248, 0.2); border-color: #38bdf8; color: #bae6fd; }
                  .ti-shell .ti-pivot-label { font-family: 'Inter', system-ui, sans-serif; color: #64748b; font-size: 0.62rem; letter-spacing: 0.06em; text-transform: uppercase; font-weight: 700; margin-right: 5px; }
                  .ti-shell .ti-no-match { padding: 18px 20px; }
                  .ti-shell .ti-no-match-msg { color: #94a3b8; font-size: 0.85rem; line-height: 1.7; }
                  .ti-shell .ti-no-match-msg code { background: #1e293b; border: 1px solid #334155; padding: 1px 6px; border-radius: 3px; font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 0.74rem; color: #cbd5e1; }
                </style>
                <div class="ti-shell">
                  <div class="ti-header">
                    <div class="ti-logo">INTEL</div>
                    <div class="ti-brand">
                      <div class="ti-org">Crimson Intel &middot; Threat Intel Mirror &middot; HexIntel Feed</div>
                      <div class="ti-app">APT &amp; IOC Search <span style="font-weight:400; color:#94a3b8; font-size:0.74rem; margin-left:6px;">&middot; 247 tracked actors &middot; 14d rolling enrichment</span></div>
                    </div>
                    <div class="ti-stats">
                      <div>Last feed sync <span class="ti-stat-v">2026-05-21</span></div>
                      <div>Coverage <span class="ti-stat-v">3y rolling</span></div>
                    </div>
                  </div>
                  <div class="ti-search-card">
                    <div class="ti-search-meta">
                      Search by <b>IOC</b> (domain, IP, hash, file path), <b>CVE</b>, <b>malware family</b>, or <b>APT codename</b>. Results show all actors with at least <b>2/4 TTP overlap</b> with the query. Use the <b>Disambiguator</b> note on each card to narrow from candidates to a single actor.
                    </div>
                    <div class="ti-search-row">
                      <input type="text" class="ti-q" data-field="intel_query" placeholder="e.g. emberwolf-c2.duckdns.org, CVE-2022-30190, Cobalt Strike, 185.220.101.45">
                      <button class="ti-go" data-action="search">Search</button>
                    </div>
                    <div class="ti-chips">
                      <span class="ti-chip-label">Quick search:</span>
                      <span class="ti-chip" onclick="var i=document.querySelector('.ti-shell .ti-q'); if(i){i.value='emberwolf-c2.duckdns.org';i.focus();}">emberwolf-c2.duckdns.org</span>
                      <span class="ti-chip" onclick="var i=document.querySelector('.ti-shell .ti-q'); if(i){i.value='CVE-2022-30190';i.focus();}">CVE-2022-30190</span>
                      <span class="ti-chip" onclick="var i=document.querySelector('.ti-shell .ti-q'); if(i){i.value='Cobalt Strike';i.focus();}">Cobalt Strike</span>
                      <span class="ti-chip" onclick="var i=document.querySelector('.ti-shell .ti-q'); if(i){i.value='185.220.101.45';i.focus();}">185.220.101.45</span>
                    </div>
                  </div>
                  <div class="ti-results" data-results>
                    <div class="ti-empty">Enter an IOC, CVE, or malware family above and click <b>Search</b>.<br><span style="font-size:0.74rem;">Mirror covers <code>247</code> tracked actors across financial, government, energy, and ICS sectors.</span></div>
                  </div>
                </div>`,
                formHandler: (data, engine) => PISFinalConfig._handleThreatIntel(data.intel_query || '', engine)
            },

            // ─────────────────────────────────────────────────
            // F. IP GEOLOCATION: ipgeo.crimson-intel.net
            // ─────────────────────────────────────────────────

            '/ipgeo': {
                title: 'IP Geolocation -- ipgeo.crimson-intel.net',
                html: `
                <style>
                  .ig-shell { font-family: 'Inter', system-ui, sans-serif; max-width: 1040px; margin: 18px auto; color: #1e293b; }
                  .ig-shell .ig-header { background: #fff; border: 1px solid #e2e8f0; border-radius: 8px 8px 0 0; padding: 14px 20px; display: flex; align-items: center; gap: 14px; }
                  .ig-shell .ig-logo { width: 36px; height: 36px; flex-shrink: 0; background: linear-gradient(135deg, #7c3aed, #5b21b6); border-radius: 6px; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 800; font-size: 0.78rem; }
                  .ig-shell .ig-brand .ig-org { font-size: 0.66rem; letter-spacing: 0.14em; text-transform: uppercase; color: #64748b; }
                  .ig-shell .ig-brand .ig-app { font-size: 1.05rem; font-weight: 700; color: #0f172a; margin-top: 1px; }
                  .ig-shell .ig-stats { margin-left: auto; display: flex; gap: 18px; font-size: 0.7rem; color: #64748b; }
                  .ig-shell .ig-stats .ig-stat-v { color: #0f172a; font-weight: 700; }
                  .ig-shell .ig-search-card { background: #fff; border: 1px solid #e2e8f0; border-top: 0; padding: 20px; }
                  .ig-shell .ig-search-row { display: flex; gap: 8px; }
                  .ig-shell input.ig-q { flex: 1; padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 4px; font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 0.82rem; color: #0f172a; outline: 0; box-sizing: border-box; }
                  .ig-shell input.ig-q::placeholder { color: #94a3b8; }
                  .ig-shell input.ig-q:focus { border-color: #7c3aed; box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.12); }
                  .ig-shell button.ig-lookup { padding: 10px 22px; background: #7c3aed; color: #fff; border: 0; border-radius: 4px; font-weight: 700; font-size: 0.82rem; cursor: pointer; }
                  .ig-shell button.ig-lookup:hover { background: #5b21b6; }
                  .ig-shell .ig-chips { margin-top: 10px; display: flex; flex-wrap: wrap; gap: 6px; }
                  .ig-shell .ig-chip-label { color: #64748b; font-size: 0.7rem; padding: 4px 0; margin-right: 4px; }
                  .ig-shell .ig-chip { padding: 4px 10px; background: #f5f3ff; border: 1px solid #ddd6fe; border-radius: 12px; color: #4c1d95; font-size: 0.7rem; cursor: pointer; }
                  .ig-shell .ig-chip:hover { background: #ede9fe; border-color: #a78bfa; }
                  .ig-shell .ig-results { background: #fff; border: 1px solid #e2e8f0; border-top: 0; border-radius: 0 0 8px 8px; min-height: 80px; }
                  .ig-shell .ig-empty { padding: 26px 18px; text-align: center; color: #64748b; font-size: 0.78rem; }
                  /* Result components */
                  .ig-shell .ig-ip-banner { padding: 22px 24px; background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); color: #fff; display: flex; align-items: center; gap: 22px; }
                  .ig-shell .ig-ip-banner.suspicious { background: linear-gradient(135deg, #7f1d1d 0%, #450a0a 100%); }
                  .ig-shell .ig-ip-banner.cloud { background: linear-gradient(135deg, #0c4a6e 0%, #082f49 100%); }
                  .ig-shell .ig-ip-banner.private { background: linear-gradient(135deg, #475569 0%, #1e293b 100%); }
                  .ig-shell .ig-ip-banner.vpn { background: linear-gradient(135deg, #4338ca 0%, #312e81 100%); }
                  .ig-shell .ig-ip-mono { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 1.6rem; font-weight: 800; letter-spacing: 0.02em; }
                  .ig-shell .ig-ip-meta { flex: 1; }
                  .ig-shell .ig-ip-meta-sub { font-size: 0.78rem; opacity: 0.78; margin-top: 4px; }
                  .ig-shell .ig-verdict-pill { display: inline-block; padding: 4px 12px; border-radius: 4px; font-size: 0.66rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; background: rgba(255,255,255,0.15); color: #fff; }
                  .ig-shell .ig-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 0; }
                  @media (max-width: 760px) { .ig-shell .ig-cards { grid-template-columns: 1fr; } }
                  .ig-shell .ig-card { padding: 16px 20px; border-bottom: 1px solid #f1f5f9; border-right: 1px solid #f1f5f9; }
                  @media (max-width: 760px) { .ig-shell .ig-card { border-right: 0; } }
                  .ig-shell .ig-card-h { font-size: 0.66rem; letter-spacing: 0.1em; text-transform: uppercase; color: #64748b; font-weight: 700; margin-bottom: 10px; }
                  .ig-shell .ig-card-row { display: flex; justify-content: space-between; align-items: center; gap: 10px; padding: 4px 0; font-size: 0.8rem; }
                  .ig-shell .ig-card-k { color: #94a3b8; font-size: 0.72rem; }
                  .ig-shell .ig-card-v { color: #0f172a; font-weight: 600; font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 0.76rem; text-align: right; }
                  .ig-shell .ig-card-v.danger { color: #b91c1c; }
                  .ig-shell .ig-card-v.legit { color: #15803d; }
                  .ig-shell .ig-attribution { padding: 18px 22px; background: #fef2f2; border-top: 1px solid #fecaca; }
                  .ig-shell .ig-attribution.cloud { background: #f0f9ff; border-top-color: #bae6fd; }
                  .ig-shell .ig-attribution.private { background: #f8fafc; border-top-color: #e2e8f0; }
                  .ig-shell .ig-attribution.vpn { background: #eef2ff; border-top-color: #c7d2fe; }
                  .ig-shell .ig-attr-h { font-size: 0.7rem; letter-spacing: 0.08em; text-transform: uppercase; color: #b91c1c; font-weight: 700; margin-bottom: 6px; }
                  .ig-shell .ig-attribution.cloud .ig-attr-h { color: #0c4a6e; }
                  .ig-shell .ig-attribution.private .ig-attr-h { color: #475569; }
                  .ig-shell .ig-attribution.vpn .ig-attr-h { color: #4338ca; }
                  .ig-shell .ig-attr-verdict { font-size: 1rem; font-weight: 800; color: #b91c1c; margin-bottom: 8px; font-family: 'JetBrains Mono', ui-monospace, monospace; }
                  .ig-shell .ig-attribution.cloud .ig-attr-verdict { color: #0c4a6e; }
                  .ig-shell .ig-attribution.private .ig-attr-verdict { color: #475569; }
                  .ig-shell .ig-attribution.vpn .ig-attr-verdict { color: #4338ca; }
                  .ig-shell .ig-attr-conf { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 0.66rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; margin-left: 8px; }
                  .ig-shell .ig-attr-sources { margin-top: 8px; font-size: 0.78rem; color: #444; line-height: 1.6; }
                  .ig-shell .ig-attr-sources b { color: #0f172a; }
                  .ig-shell .ig-attr-sources ul { margin: 6px 0 0 16px; padding: 0; }
                  .ig-shell .ig-attr-sources li { padding: 2px 0; font-size: 0.74rem; }
                  .ig-shell .ig-pivots { padding: 12px 22px; background: #f8fafc; }
                  .ig-shell .ig-pivots-h { font-size: 0.66rem; letter-spacing: 0.1em; text-transform: uppercase; color: #64748b; font-weight: 700; margin-bottom: 8px; }
                  .ig-shell .ig-pivot { display: inline-block; padding: 6px 10px; background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 4px; margin-right: 8px; margin-bottom: 4px; font-size: 0.74rem; color: #0c4a6e; text-decoration: none; font-family: 'JetBrains Mono', ui-monospace, monospace; }
                  .ig-shell .ig-pivot:hover { background: #e0f2fe; border-color: #38bdf8; color: #075985; }
                  .ig-shell .ig-pivot-label { font-family: 'Inter', system-ui, sans-serif; color: #64748b; font-size: 0.66rem; letter-spacing: 0.06em; text-transform: uppercase; font-weight: 700; margin-right: 6px; }
                  .ig-shell .ig-caveat { padding: 12px 22px; background: #fef9c3; border-top: 1px solid #fde68a; font-size: 0.78rem; color: #713f12; line-height: 1.6; }
                  .ig-shell .ig-caveat b { color: #422006; }
                  .ig-shell .ig-no-result { padding: 24px 20px; text-align: center; color: #64748b; font-size: 0.82rem; }
                  .ig-shell .ig-no-result code { background: #f1f5f9; border: 1px solid #e2e8f0; padding: 1px 6px; border-radius: 3px; font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 0.74rem; }
                </style>
                <div class="ig-shell">
                  <div class="ig-header">
                    <div class="ig-logo">GEO</div>
                    <div class="ig-brand">
                      <div class="ig-org">Crimson Intel &middot; IP Enrichment</div>
                      <div class="ig-app">IP Geolocation &amp; Attribution <span style="font-weight:400; color:#64748b; font-size:0.74rem; margin-left:6px;">&middot; MaxMind + ASN + HexIntel feed</span></div>
                    </div>
                    <div class="ig-stats">
                      <div>MaxMind <span class="ig-stat-v">2026-05-14</span></div>
                      <div>HexIntel <span class="ig-stat-v">2026-05-21</span></div>
                    </div>
                  </div>
                  <div class="ig-search-card">
                    <div style="font-size:0.82rem; color:#334155; margin-bottom:10px;">Enter an <b>IPv4 address</b> for geo + ASN + threat-intel actor-origin enrichment. Combines passive-DNS, behavioral analysis, and HexIntel feed.</div>
                    <div class="ig-search-row">
                      <input type="text" class="ig-q" data-field="ip_query" placeholder="185.220.101.45">
                      <button class="ig-lookup" data-action="lookup">Lookup</button>
                    </div>
                    <div class="ig-chips">
                      <span class="ig-chip-label">Quick lookups:</span>
                      <span class="ig-chip" onclick="var i=document.querySelector('.ig-shell .ig-q'); if(i){i.value='185.220.101.45';i.focus();}">185.220.101.45</span>
                      <span class="ig-chip" onclick="var i=document.querySelector('.ig-shell .ig-q'); if(i){i.value='104.21.45.122';i.focus();}">104.21.45.122</span>
                      <span class="ig-chip" onclick="var i=document.querySelector('.ig-shell .ig-q'); if(i){i.value='51.140.83.42';i.focus();}">51.140.83.42</span>
                      <span class="ig-chip" onclick="var i=document.querySelector('.ig-shell .ig-q'); if(i){i.value='8.8.8.8';i.focus();}">8.8.8.8</span>
                    </div>
                  </div>
                  <div class="ig-results" data-results>
                    <div class="ig-empty">Enter an IP address and click <b>Lookup</b>.<br><span style="opacity:0.7; font-size:0.74rem;">Phase 4 reminder: the WHOIS ASN country is the <i>provider's incorporation</i>, not the operator's origin. This tool surfaces the HexIntel actor-origin enrichment.</span></div>
                  </div>
                </div>`,
                formHandler: (data, engine) => PISFinalConfig._handleIpGeo(data.ip_query || '', engine)
            },

            // ─────────────────────────────────────────────────
            // G. SIEM-LITE: siem.crimson-dawn.net
            // ─────────────────────────────────────────────────

            '/siem': {
                title: 'SIEM-lite -- siem.crimson-dawn.net',
                html: `
                <style>
                  .siem-shell { font-family: 'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, monospace; max-width: 1080px; margin: 18px auto; color: #e2e8f0; }
                  .siem-shell .siem-header {
                    background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
                    border: 1px solid #334155; border-bottom: 0; border-radius: 8px 8px 0 0;
                    padding: 12px 18px; display: flex; align-items: center; gap: 14px;
                  }
                  .siem-shell .siem-logo {
                    width: 32px; height: 32px; flex-shrink: 0;
                    background: linear-gradient(135deg, #dc2626, #7f1d1d);
                    border-radius: 6px; display: flex; align-items: center; justify-content: center;
                    font-weight: 800; color: #fff; font-size: 0.78rem; letter-spacing: 0.06em;
                    font-family: 'Inter', system-ui, sans-serif;
                  }
                  .siem-shell .siem-brand { font-family: 'Inter', system-ui, sans-serif; }
                  .siem-shell .siem-brand .siem-app { font-size: 0.98rem; font-weight: 700; color: #f1f5f9; }
                  .siem-shell .siem-brand .siem-org { font-size: 0.66rem; letter-spacing: 0.14em; text-transform: uppercase; color: #94a3b8; }
                  .siem-shell .siem-version-bar {
                    margin-left: auto; display: flex; gap: 14px; align-items: center;
                    font-size: 0.66rem; letter-spacing: 0.08em; color: #94a3b8; text-transform: uppercase;
                    font-family: 'Inter', system-ui, sans-serif;
                  }
                  .siem-shell .siem-status-dot {
                    display: inline-block; width: 7px; height: 7px; border-radius: 50%;
                    background: #22c55e; box-shadow: 0 0 6px rgba(34, 197, 94, 0.7);
                    margin-right: 6px; vertical-align: middle;
                  }
                  .siem-shell .siem-coverage {
                    background: #0b1220; border-left: 1px solid #334155; border-right: 1px solid #334155;
                    padding: 8px 18px; display: flex; gap: 22px; font-size: 0.7rem; color: #cbd5e1;
                    font-family: 'Inter', system-ui, sans-serif;
                  }
                  .siem-shell .siem-coverage .siem-cov { display: flex; align-items: center; gap: 6px; }
                  .siem-shell .siem-coverage .siem-cov-k { color: #64748b; }
                  .siem-shell .siem-coverage .siem-cov-v { color: #e2e8f0; font-weight: 600; }
                  .siem-shell .siem-tabs {
                    background: #0b1220; border-left: 1px solid #334155; border-right: 1px solid #334155;
                    padding: 0 14px; display: flex; gap: 0; border-bottom: 1px solid #334155;
                  }
                  .siem-shell .siem-tab {
                    padding: 10px 18px; cursor: pointer; font-family: 'Inter', system-ui, sans-serif;
                    font-size: 0.78rem; font-weight: 600; color: #94a3b8; letter-spacing: 0.04em;
                    border-bottom: 2px solid transparent; transition: all 0.15s;
                    user-select: none;
                  }
                  .siem-shell .siem-tab:hover { color: #f1f5f9; background: rgba(255,255,255,0.02); }
                  .siem-shell .siem-tab.active { color: #ef4444; border-bottom-color: #ef4444; }
                  .siem-shell .siem-tab .siem-tab-count {
                    display: inline-block; margin-left: 6px; padding: 1px 7px; border-radius: 10px;
                    background: rgba(148, 163, 184, 0.16); color: #cbd5e1; font-size: 0.66rem; font-weight: 700;
                  }
                  .siem-shell .siem-tab.active .siem-tab-count { background: rgba(239, 68, 68, 0.2); color: #fca5a5; }
                  .siem-shell .siem-query-bar {
                    background: #0b1220; border-left: 1px solid #334155; border-right: 1px solid #334155;
                    padding: 14px 18px;
                  }
                  .siem-shell .siem-query-row { display: flex; gap: 8px; }
                  .siem-shell .siem-search-icon {
                    background: #1e293b; border: 1px solid #334155; border-right: 0;
                    border-radius: 4px 0 0 4px; padding: 0 12px; display: flex; align-items: center;
                    color: #64748b; font-size: 0.9rem; font-weight: 800;
                  }
                  .siem-shell input.siem-q {
                    flex: 1; padding: 10px 12px;
                    background: #1e293b; color: #f1f5f9; border: 1px solid #334155; border-left: 0; border-radius: 0 4px 4px 0;
                    font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 0.82rem;
                    outline: none; transition: border-color 0.15s;
                  }
                  .siem-shell input.siem-q::placeholder { color: #475569; }
                  .siem-shell input.siem-q:focus { border-color: #ef4444; box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1); }
                  .siem-shell button.siem-search {
                    padding: 10px 22px; background: #dc2626; color: #fff; border: 0; border-radius: 4px;
                    font-weight: 700; font-family: 'Inter', system-ui, sans-serif; font-size: 0.82rem;
                    cursor: pointer; letter-spacing: 0.04em;
                  }
                  .siem-shell button.siem-search:hover { background: #b91c1c; }
                  .siem-shell .siem-chips { margin-top: 10px; display: flex; flex-wrap: wrap; gap: 6px; font-family: 'Inter', system-ui, sans-serif; }
                  .siem-shell .siem-chips .siem-chip-label { color: #64748b; font-size: 0.7rem; padding: 4px 0; margin-right: 4px; }
                  .siem-shell .siem-chip {
                    padding: 4px 10px; background: rgba(148, 163, 184, 0.1); border: 1px solid #334155;
                    border-radius: 12px; color: #cbd5e1; font-size: 0.7rem; cursor: pointer;
                    transition: all 0.12s;
                  }
                  .siem-shell .siem-chip:hover { background: rgba(239, 68, 68, 0.15); border-color: #ef4444; color: #fca5a5; }
                  .siem-shell .siem-results-frame {
                    background: #0a0f1a; border: 1px solid #334155; border-top: 0;
                    border-radius: 0 0 8px 8px; padding: 0; min-height: 120px;
                  }
                  .siem-shell .siem-empty {
                    padding: 32px 18px; text-align: center; color: #64748b; font-size: 0.78rem;
                    font-family: 'Inter', system-ui, sans-serif;
                  }
                  /* Result table — used by handler */
                  .siem-shell .siem-results-toolbar {
                    background: #0b1220; padding: 8px 16px; border-bottom: 1px solid #1e293b;
                    display: flex; gap: 14px; align-items: center; font-family: 'Inter', system-ui, sans-serif; font-size: 0.7rem; color: #94a3b8;
                  }
                  .siem-shell .siem-results-toolbar .siem-count { color: #f1f5f9; font-weight: 700; }
                  .siem-shell .siem-results-toolbar .siem-anomaly-count { color: #fca5a5; font-weight: 700; }
                  .siem-shell table.siem-table { width: 100%; border-collapse: collapse; }
                  .siem-shell .siem-table thead th {
                    background: #0b1220; color: #64748b; font-size: 0.66rem; letter-spacing: 0.1em;
                    text-transform: uppercase; font-weight: 700; padding: 8px 12px; text-align: left;
                    border-bottom: 1px solid #1e293b; font-family: 'Inter', system-ui, sans-serif;
                  }
                  .siem-shell .siem-table tbody tr { border-bottom: 1px solid #131c2e; }
                  .siem-shell .siem-table tbody tr:hover { background: rgba(148, 163, 184, 0.04); }
                  .siem-shell .siem-table tbody tr.anomaly { background: rgba(239, 68, 68, 0.08); border-left: 3px solid #ef4444; }
                  .siem-shell .siem-table tbody tr.anomaly:hover { background: rgba(239, 68, 68, 0.14); }
                  .siem-shell .siem-table td {
                    padding: 6px 12px; font-size: 0.74rem;
                    font-family: 'JetBrains Mono', ui-monospace, monospace; color: #cbd5e1;
                  }
                  .siem-shell .siem-table td.siem-ts { color: #64748b; white-space: nowrap; }
                  .siem-shell .siem-table td.siem-user { color: #e2e8f0; font-weight: 600; }
                  .siem-shell .siem-table tr.anomaly td.siem-user { color: #fca5a5; }
                  .siem-shell .siem-table td.siem-target { color: #cbd5e1; }
                  .siem-shell .siem-table tr.anomaly td.siem-target { color: #fda4af; font-weight: 600; }
                  .siem-shell .siem-badge {
                    display: inline-block; padding: 1px 7px; border-radius: 3px;
                    font-size: 0.62rem; font-weight: 700; letter-spacing: 0.08em;
                    text-transform: uppercase; font-family: 'Inter', system-ui, sans-serif;
                  }
                  .siem-shell .siem-badge.crit { background: rgba(239, 68, 68, 0.25); color: #fca5a5; border: 1px solid rgba(239, 68, 68, 0.4); }
                  .siem-shell .siem-badge.high { background: rgba(249, 115, 22, 0.22); color: #fdba74; border: 1px solid rgba(249, 115, 22, 0.4); }
                  .siem-shell .siem-badge.info { background: rgba(148, 163, 184, 0.18); color: #cbd5e1; border: 1px solid rgba(148, 163, 184, 0.3); }
                  .siem-shell .siem-flag-text {
                    font-family: 'Inter', system-ui, sans-serif; font-size: 0.7rem; color: #fca5a5;
                    margin-left: 8px;
                  }
                  .siem-shell .siem-no-match {
                    padding: 26px 18px; text-align: center; color: #94a3b8; font-size: 0.8rem;
                    font-family: 'Inter', system-ui, sans-serif;
                  }
                </style>
                <div class="siem-shell">
                  <div class="siem-header">
                    <div class="siem-logo">CD</div>
                    <div class="siem-brand">
                      <div class="siem-org">Crimson Dawn Logistics &middot; Security Operations</div>
                      <div class="siem-app">SIEM-lite <span style="font-weight:400; color:#64748b; font-size:0.74rem;">v4.2.1</span></div>
                    </div>
                    <div class="siem-version-bar">
                      <span><span class="siem-status-dot"></span>Index: HEALTHY</span>
                      <span>Last sync: 2026-05-21 09:14 UTC</span>
                    </div>
                  </div>
                  <div class="siem-coverage">
                    <div class="siem-cov"><span class="siem-cov-k">Coverage:</span></div>
                    <div class="siem-cov"><span class="siem-cov-k">DNS</span><span class="siem-cov-v">14 days</span></div>
                    <div class="siem-cov"><span class="siem-cov-k">Authentication</span><span class="siem-cov-v">14 days</span></div>
                    <div class="siem-cov"><span class="siem-cov-k">Firewall</span><span class="siem-cov-v">7 days</span></div>
                    <div class="siem-cov" style="margin-left:auto;"><span class="siem-cov-k">Events/sec:</span><span class="siem-cov-v">2,344</span></div>
                  </div>
                  <div class="siem-tabs">
                    <div class="siem-tab active" data-log="dns" onclick="(function(t){t.parentNode.querySelectorAll('.siem-tab').forEach(function(x){x.classList.remove('active');});t.classList.add('active');var sel=document.querySelector('.siem-shell [data-field=log_type]');if(sel)sel.value=t.getAttribute('data-log');})(this)">DNS Queries <span class="siem-tab-count">26</span></div>
                    <div class="siem-tab" data-log="auth" onclick="(function(t){t.parentNode.querySelectorAll('.siem-tab').forEach(function(x){x.classList.remove('active');});t.classList.add('active');var sel=document.querySelector('.siem-shell [data-field=log_type]');if(sel)sel.value=t.getAttribute('data-log');})(this)">Authentication <span class="siem-tab-count">31</span></div>
                    <div class="siem-tab" data-log="firewall" onclick="(function(t){t.parentNode.querySelectorAll('.siem-tab').forEach(function(x){x.classList.remove('active');});t.classList.add('active');var sel=document.querySelector('.siem-shell [data-field=log_type]');if(sel)sel.value=t.getAttribute('data-log');})(this)">Firewall <span class="siem-tab-count">18</span></div>
                  </div>
                  <select data-field="log_type" style="display:none;">
                    <option value="dns" selected>DNS Queries</option>
                    <option value="auth">Authentication Log</option>
                    <option value="firewall">Firewall Log</option>
                  </select>
                  <div class="siem-query-bar">
                    <div class="siem-query-row">
                      <div class="siem-search-icon">&gt;</div>
                      <input type="text" class="siem-q" data-field="log_filter" placeholder="Filter by user, domain, IP &mdash; leave blank for all events">
                      <button class="siem-search" data-action="query">Search</button>
                    </div>
                    <div class="siem-chips">
                      <span class="siem-chip-label">Quick filters:</span>
                      <span class="siem-chip" onclick="var i=document.querySelector('.siem-shell .siem-q'); if(i){i.value='e.morales';i.focus();}">e.morales</span>
                      <span class="siem-chip" onclick="var i=document.querySelector('.siem-shell .siem-q'); if(i){i.value='r.chen';i.focus();}">r.chen</span>
                      <span class="siem-chip" onclick="var i=document.querySelector('.siem-shell .siem-q'); if(i){i.value='crimson-dawn-finance.net';i.focus();}">crimson-dawn-finance.net</span>
                      <span class="siem-chip" onclick="var i=document.querySelector('.siem-shell .siem-q'); if(i){i.value='emberwolf-c2.duckdns.org';i.focus();}">emberwolf-c2.duckdns.org</span>
                      <span class="siem-chip" onclick="var i=document.querySelector('.siem-shell .siem-q'); if(i){i.value='185.220.101.45';i.focus();}">185.220.101.45</span>
                    </div>
                  </div>
                  <div class="siem-results-frame" data-results>
                    <div class="siem-empty">
                      Select a log type tab and enter a filter (or leave blank), then <b>Search</b>.<br>
                      <span style="opacity:0.65;">Tip: anomaly events are pre-flagged. Use quick-filter chips above to pivot.</span>
                    </div>
                  </div>
                </div>`,
                formHandler: (data, engine) => PISFinalConfig._handleSiem(data.log_type || 'dns', data.log_filter || '', engine)
            },

            // ─────────────────────────────────────────────────
            // H. PATCH MANAGEMENT: patch.crimson-dawn.net
            // ─────────────────────────────────────────────────

            '/patch': {
                title: 'Patch Management -- patch.crimson-dawn.net',
                html: function(qs, browser) {
                    return PISFinalConfig._renderPatchDashboard(browser && browser.engine);
                },
                formHandler: (data, engine) => PISFinalConfig._handlePatchAction(data, engine)
            },

            // ─────────────────────────────────────────────────
            // I. RAPID7 INSIGHTVM: insightvm.crimson-dawn.net
            // ─────────────────────────────────────────────────

            '/insightvm': {
                title: 'Rapid7 InsightVM -- insightvm.crimson-dawn.net',
                html: function(qs, browser) {
                    return PISFinalConfig._renderInsightVM(browser && browser.engine);
                },
                formHandler: (data, engine) => PISFinalConfig._handleInsightVMScan(data, engine)
            },

            // ─────────────────────────────────────────────────
            // J. MAIL ADMIN: mailadmin.crimson-dawn.net
            // ─────────────────────────────────────────────────

            '/mailadmin': {
                title: 'Mail Admin -- mailadmin.crimson-dawn.net',
                html: function(qs, browser) {
                    return PISFinalConfig._renderMailAdmin(browser && browser.engine);
                },
                formHandler: (data, engine) => PISFinalConfig._handleMailFilter(data, engine)
            }
        }
    },

    // =========================================================
    // BROWSER FORM HANDLER METHODS
    // =========================================================

    _handleCveSearch: function(query, engine) {
        if (!query.trim()) {
            return '<div style="color:#888; font-size:0.8rem; text-align:center; padding:16px;">Enter a CVE ID or keyword to search.</div>';
        }
        const q = query.toLowerCase().trim();

        // Known CVEs relevant to this scenario
        const knownCves = {
            'cve-2022-30190': { id: 'CVE-2022-30190', score: '7.8 HIGH', title: 'Microsoft Windows Support Diagnostic Tool (MSDT) Remote Code Execution Vulnerability', link: '/cve/CVE-2022-30190' },
            'follina':        { id: 'CVE-2022-30190', score: '7.8 HIGH', title: 'Microsoft Windows Support Diagnostic Tool (MSDT) Remote Code Execution Vulnerability', link: '/cve/CVE-2022-30190' },
            'msdt':           { id: 'CVE-2022-30190', score: '7.8 HIGH', title: 'Microsoft Windows Support Diagnostic Tool (MSDT) Remote Code Execution Vulnerability', link: '/cve/CVE-2022-30190' },
            'cve-2024-21412': { id: 'CVE-2024-21412', score: '8.1 HIGH', title: 'Internet Shortcut Files Security Feature Bypass Vulnerability', link: '/cve/CVE-2024-21412' },
            'cve-2024-26169': { id: 'CVE-2024-26169', score: '7.8 HIGH', title: 'Windows Error Reporting Service Elevation of Privilege Vulnerability', link: '/cve/CVE-2024-26169' }
        };

        // Search through known entries
        const results = [];
        for (const [key, cve] of Object.entries(knownCves)) {
            if (q.includes(key) || key.includes(q) || cve.title.toLowerCase().includes(q)) {
                if (!results.find(r => r.id === cve.id)) results.push(cve);
            }
        }

        // Additional plausible CVEs for search realism.
        // All entries are real CVE IDs with NVD-verbatim titles. Karl round 3 audited these.
        // Two entries removed during round 3: CVE-2024-20656 and CVE-2023-36884 had
        // descriptions that did not match their NVD records (fabrication pattern caught by Karl).
        const additionalCves = [
            { id: 'CVE-2024-21305', score: '4.4 MEDIUM', title: 'Hypervisor-Protected Code Integrity (HVCI) Security Feature Bypass Vulnerability' },
            { id: 'CVE-2024-26198', score: '8.8 HIGH', title: 'Microsoft Exchange Server Remote Code Execution Vulnerability' },
            { id: 'CVE-2024-29988', score: '8.8 HIGH', title: 'SmartScreen Prompt Security Feature Bypass Vulnerability' },
            { id: 'CVE-2024-30040', score: '8.8 HIGH', title: 'Windows MSHTML Platform Security Feature Bypass Vulnerability' },
            { id: 'CVE-2023-21674', score: '8.8 HIGH', title: 'Windows Advanced Local Procedure Call (ALPC) Elevation of Privilege Vulnerability' },
            { id: 'CVE-2024-43461', score: '8.8 HIGH', title: 'Windows MSHTML Platform Spoofing Vulnerability' },
            { id: 'CVE-2024-38080', score: '7.8 HIGH', title: 'Windows Hyper-V Elevation of Privilege Vulnerability' },
            { id: 'CVE-2024-38112', score: '7.5 HIGH', title: 'Windows MSHTML Platform Spoofing Vulnerability' },
            { id: 'CVE-2024-30051', score: '7.8 HIGH', title: 'Windows DWM Core Library Elevation of Privilege Vulnerability' },
            { id: 'CVE-2023-28252', score: '7.8 HIGH', title: 'Windows Common Log File System Driver Elevation of Privilege Vulnerability' }
        ];

        for (const cve of additionalCves) {
            if (q.includes(cve.id.toLowerCase()) || cve.title.toLowerCase().includes(q)) {
                results.push(cve);
            }
        }

        if (results.length === 0 && q.length >= 3) {
            return `<div style="color:#888; font-size:0.8rem; padding:16px;">No results found for "${this._escHtml(query)}". Try a CVE ID (e.g. CVE-2022-30190) or keyword (e.g. Follina, MSDT, RCE).</div>`;
        }
        if (results.length === 0) {
            return '<div style="color:#888; font-size:0.8rem; padding:16px;">Enter at least 3 characters to search.</div>';
        }

        const rows = results.map(r => {
            const link = r.link ? `<a href="https://cve.crimson-intel.net${r.link}" style="color:#dc2626; text-decoration:none; font-weight:700;">${r.id}</a>` : `<span style="color:#555;">${r.id}</span>`;
            return `<tr style="border-bottom:1px solid #eee;">
                <td style="padding:8px 10px; font-family:monospace; white-space:nowrap;">${link}</td>
                <td style="padding:8px 10px; color:#dc2626; font-weight:700; white-space:nowrap;">${r.score}</td>
                <td style="padding:8px 10px; font-size:0.8rem;">${r.title}</td>
            </tr>`;
        }).join('');

        return `<table style="width:100%; border-collapse:collapse; font-size:0.8rem;">
            <thead><tr style="background:#f5f5f5;">
                <th style="padding:8px 10px; text-align:left; color:#555;">CVE ID</th>
                <th style="padding:8px 10px; text-align:left; color:#555;">Score</th>
                <th style="padding:8px 10px; text-align:left; color:#555;">Title</th>
            </tr></thead>
            <tbody>${rows}</tbody>
        </table>
        <div style="font-size:0.72rem; color:#888; margin-top:8px;">${results.length} result(s) -- click a CVE ID for full details</div>`;
    },

    _renderWhoisCard: function(rec) {
        var verdictClass = rec.verdict || 'neutral';
        var analystClass = (verdictClass === 'legit') ? 'legit' : '';
        var ageBadge = rec.age ? '<span class="wh-age-badge ' + rec.age.cls + '" style="margin-left:10px;">' + rec.age.text + '</span>' : '';
        var verdictPill = '<span class="wh-verdict-pill ' + verdictClass + '">' + rec.verdictText + '</span>';
        var rawHtml = rec.raw.split('\n').map(function(line) {
            if (!line.trim()) return '<br>';
            // colorize key:value lines — key in gray, value normal
            var m = line.match(/^([A-Za-z0-9\- ]+):\s*(.*)$/);
            if (m) {
                var k = m[1], v = m[2];
                var vClass = '';
                if (v.indexOf('[RED]') !== -1) { vClass = 'wh-v-red'; v = v.replace(/\[RED\]/g, ''); }
                if (v.indexOf('[GREEN]') !== -1) { vClass = 'wh-v-green'; v = v.replace(/\[GREEN\]/g, ''); }
                return '<span class="wh-k">' + this._escHtml(k) + ':</span> ' + (vClass ? '<span class="' + vClass + '">' + this._escHtml(v) + '</span>' : this._escHtml(v));
            }
            return this._escHtml(line);
        }, this).join('\n');
        var metaCards = '';
        if (rec.metaCards) {
            metaCards = rec.metaCards.map(function(card) {
                var rows = card.rows.map(function(r) {
                    return '<div class="wh-meta-row"><span class="wh-meta-k">' + r.k + '</span><span class="wh-meta-v ' + (r.cls || '') + '">' + r.v + '</span></div>';
                }).join('');
                return '<div class="wh-meta-card"><div class="wh-meta-card-h">' + card.h + '</div>' + rows + '</div>';
            }).join('');
        }
        var pivotsHtml = '';
        if (rec.pivots && rec.pivots.length) {
            pivotsHtml = '<div class="wh-pivots"><div class="wh-pivots-h">Pivot to</div>' +
                rec.pivots.map(function(p) {
                    return '<a class="wh-pivot" href="' + p.url + '"><span class="wh-pivot-label">' + p.label + '</span>' + p.value + '</a>';
                }).join('') + '</div>';
        }
        return '<div class="wh-result-head ' + verdictClass + '">' +
            '<div class="wh-target">' + rec.title + ageBadge + '</div>' +
            verdictPill +
            '</div>' +
            '<div class="wh-result-body">' +
                '<div class="wh-raw-col">' +
                    '<div class="wh-section-label">Raw WHOIS / ASN response</div>' +
                    '<div class="wh-raw">' + rawHtml + '</div>' +
                '</div>' +
                '<div class="wh-meta-col">' +
                    '<div class="wh-section-label">Parsed metadata</div>' +
                    metaCards +
                    pivotsHtml +
                '</div>' +
            '</div>' +
            '<div class="wh-analyst ' + analystClass + '"><b>Analyst verdict:</b> ' + rec.analyst + '</div>';
    },

    _handleWhois: function(query, engine) {
        if (!query.trim()) return '<div class="wh-empty">Enter a domain or IP and click <b>Lookup</b>.</div>';
        const q = query.trim().toLowerCase();

        const records = {
            'crimson-dawn-finance.net': {
                title: 'CRIMSON-DAWN-FINANCE.NET',
                verdict: 'suspicious', verdictText: 'Suspicious infrastructure',
                age: { cls: 'crit', text: '3 days old' },
                raw: 'Domain Name: CRIMSON-DAWN-FINANCE.NET\nRegistrar: NameCheap, Inc.\nRegistrar URL: https://www.namecheap.com\nUpdated Date: 2026-05-15\nCreated Date: [RED]2026-05-15 (3 days BEFORE the wire fraud)\nRegistrant: REDACTED FOR PRIVACY (WhoisGuard, Inc.)\nRegistrant Email: [REDACTED]\nName Servers: ns1.cloudflare.com, ns2.cloudflare.com\nDNSSEC: [RED]unsigned\nStatus: clientTransferProhibited',
                metaCards: [
                    { h: 'Registration', rows: [
                        { k: 'Registrar', v: 'NameCheap', cls: 'suspicious' },
                        { k: 'Created', v: '2026-05-15', cls: 'suspicious' },
                        { k: 'Updated', v: '2026-05-15' },
                        { k: 'DNSSEC', v: 'unsigned', cls: 'suspicious' }
                    ]},
                    { h: 'Infrastructure', rows: [
                        { k: 'Nameservers', v: 'Cloudflare' },
                        { k: 'Privacy', v: 'WhoisGuard', cls: 'suspicious' },
                        { k: 'Status', v: 'clientTransferProhibited' }
                    ]}
                ],
                pivots: [
                    { label: 'IPGeo', value: '104.21.45.122 (resolution)', url: 'https://ipgeo.crimson-intel.net' },
                    { label: 'WHOIS', value: 'nakamura-suppliers-corp.com (related)', url: 'https://whois.crimson-intel.net' }
                ],
                analyst: 'Recently registered (same week as the wire fraud), privacy-protected, unsigned DNSSEC, Cloudflare nameservers. Consistent with phishing infrastructure. Same registrar + privacy service as nakamura-suppliers-corp.com &mdash; same operator footprint.'
            },
            'nakamura-suppliers-corp.com': {
                title: 'NAKAMURA-SUPPLIERS-CORP.COM',
                verdict: 'suspicious', verdictText: 'Lookalike domain',
                age: { cls: 'crit', text: '4 days old' },
                raw: 'Domain Name: NAKAMURA-SUPPLIERS-CORP.COM\nRegistrar: NameCheap, Inc.\nCreated Date: [RED]2026-05-14 (4 days BEFORE the wire fraud)\nRegistrant: REDACTED FOR PRIVACY (WhoisGuard, Inc.)\nName Servers: ns1.cloudflare.com, ns2.cloudflare.com\nDNSSEC: [RED]unsigned',
                metaCards: [
                    { h: 'Registration', rows: [
                        { k: 'Registrar', v: 'NameCheap', cls: 'suspicious' },
                        { k: 'Created', v: '2026-05-14', cls: 'suspicious' },
                        { k: 'DNSSEC', v: 'unsigned', cls: 'suspicious' }
                    ]},
                    { h: 'Infrastructure', rows: [
                        { k: 'Nameservers', v: 'Cloudflare' },
                        { k: 'Privacy', v: 'WhoisGuard', cls: 'suspicious' }
                    ]}
                ],
                pivots: [
                    { label: 'WHOIS', value: 'nakamura-supplies.com (real vendor)', url: 'https://whois.crimson-intel.net' },
                    { label: 'WHOIS', value: 'crimson-dawn-finance.net (same infra)', url: 'https://whois.crimson-intel.net' }
                ],
                analyst: 'Lookalike domain for <b>nakamura-supplies.com</b> (the legitimate vendor) with an added "-corp" suffix &mdash; classic typosquat pattern. Same registrar (NameCheap), same privacy service (WhoisGuard), same nameservers (Cloudflare) as crimson-dawn-finance.net. Identical operator infrastructure.'
            },
            'nakamura-supplies.com': {
                title: 'NAKAMURA-SUPPLIES.COM',
                verdict: 'legit', verdictText: 'Legitimate vendor',
                age: { cls: 'ok', text: '17 years (2009)' },
                raw: 'Domain Name: NAKAMURA-SUPPLIES.COM\nRegistrar: Network Solutions, LLC\nCreated Date: [GREEN]2009-03-18 (17 years old, legitimate business)\nUpdated Date: 2025-01-12\nRegistrant Organization: Nakamura Supplies International, Inc.\nRegistrant Country: JP\nName Servers: ns1.dnsmadeeasy.com, ns2.dnsmadeeasy.com\nDNSSEC: [GREEN]signed',
                metaCards: [
                    { h: 'Registration', rows: [
                        { k: 'Registrar', v: 'Network Solutions', cls: 'legit' },
                        { k: 'Created', v: '2009-03-18', cls: 'legit' },
                        { k: 'Updated', v: '2025-01-12' },
                        { k: 'DNSSEC', v: 'signed', cls: 'legit' }
                    ]},
                    { h: 'Registrant', rows: [
                        { k: 'Org', v: 'Nakamura Supplies Intl', cls: 'legit' },
                        { k: 'Country', v: 'JP' },
                        { k: 'Nameservers', v: 'DNSMadeEasy' }
                    ]}
                ],
                pivots: [
                    { label: 'WHOIS', value: 'nakamura-suppliers-corp.com (lookalike)', url: 'https://whois.crimson-intel.net' }
                ],
                analyst: 'Long-established domain (registered 2009, 17 years old), DNSSEC signed, real corporate registrant in JP. This is the <b>legitimate</b> Nakamura Supplies vendor &mdash; not suspicious. The phishing campaign uses the lookalike nakamura-suppliers-corp.com instead.'
            },
            'emberwolf-c2.duckdns.org': {
                title: 'emberwolf-c2.duckdns.org',
                verdict: 'suspicious', verdictText: 'C2 infrastructure',
                age: { cls: 'crit', text: 'Dynamic DNS' },
                raw: 'Domain Name: emberwolf-c2.duckdns.org\nService: DuckDNS (free dynamic DNS at duckdns.org)\nSubdomain operator: [RED][USER-CONTROLLED - anonymous registration]\nCreated: [DuckDNS does not expose creation timestamps]\nResolves to: [RED]185.220.101.45\nTTL: 60 seconds (typical for dynamic DNS C2 - enables rapid IP rotation)\nMITRE T1568.002: Dynamic Resolution: Dynamic DNS',
                metaCards: [
                    { h: 'Service', rows: [
                        { k: 'DNS service', v: 'DuckDNS' },
                        { k: 'Operator', v: 'Anonymous', cls: 'suspicious' },
                        { k: 'TTL', v: '60s', cls: 'suspicious' }
                    ]},
                    { h: 'MITRE ATT&CK', rows: [
                        { k: 'Technique', v: 'T1568.002', cls: 'suspicious' },
                        { k: 'Pattern', v: 'Dynamic DNS' }
                    ]}
                ],
                pivots: [
                    { label: 'IPGeo', value: '185.220.101.45 (resolves to)', url: 'https://ipgeo.crimson-intel.net' },
                    { label: 'WHOIS', value: '185.220.101.45 (ASN lookup)', url: 'https://whois.crimson-intel.net' }
                ],
                analyst: 'DuckDNS is a legitimate dynamic-DNS service commonly abused by threat actors (MITRE <b>T1568.002</b>). The subdomain name "emberwolf-c2" is an actor signature &mdash; explicitly self-labels as the C2 channel for the EMBERWOLF campaign. The 60-second TTL enables rapid IP rotation if any individual host is detected and burned.'
            },
            '185.220.101.45': {
                title: '185.220.101.45',
                verdict: 'suspicious', verdictText: 'Bulletproof hosting',
                age: { cls: 'crit', text: 'Known malicious' },
                raw: 'IP: 185.220.101.45\nASN: AS43350 (NForce Entertainment B.V.)\nASN Country (incorporation): NL\nBlock: 185.220.100.0/22\nAbuse contact: abuse@nforce.nl\nTor exit node history: NO (this IP is not a Tor exit node)\nFirst seen as malicious: [RED]2026-04-08 (multiple campaigns)',
                metaCards: [
                    { h: 'Network', rows: [
                        { k: 'ASN', v: 'AS43350' },
                        { k: 'ASN Org', v: 'NForce B.V.', cls: 'suspicious' },
                        { k: 'Country', v: 'NL (incorp)' },
                        { k: 'Block', v: '185.220.100.0/22' }
                    ]},
                    { h: 'Threat history', rows: [
                        { k: 'First malicious', v: '2026-04-08', cls: 'suspicious' },
                        { k: 'Abuse contact', v: 'abuse@nforce.nl' },
                        { k: 'Tor exit', v: 'No' }
                    ]}
                ],
                pivots: [
                    { label: 'IPGeo', value: '185.220.101.45 (actor origin)', url: 'https://ipgeo.crimson-intel.net' },
                    { label: 'Intel', value: 'EMBERWOLF actor profile', url: 'https://intel.crimson-intel.net' }
                ],
                analyst: 'NForce Entertainment B.V. (AS43350) is a bulletproof hosting provider with significant abuse history. <b>Caveat:</b> the NL country code is the provider\'s incorporation jurisdiction, NOT the operator\'s origin. Do not use WHOIS ASN country as actor attribution &mdash; pivot to IP Geolocation for actor-origin enrichment (passive DNS, beaconing-time analysis).'
            },
            'crimson-dawn.net': {
                title: 'CRIMSON-DAWN.NET',
                verdict: 'legit', verdictText: 'Corporate domain',
                age: { cls: 'ok', text: '8 years (2018)' },
                raw: 'Domain Name: CRIMSON-DAWN.NET\nRegistrar: GoDaddy.com, LLC\nCreated Date: [GREEN]2018-07-22\nUpdated Date: 2025-07-22\nRegistrant Organization: Crimson Dawn Logistics, LLC\nRegistrant Country: US\nName Servers: ns49.domaincontrol.com, ns50.domaincontrol.com\nDNSSEC: [GREEN]signed',
                metaCards: [
                    { h: 'Registration', rows: [
                        { k: 'Registrar', v: 'GoDaddy' },
                        { k: 'Created', v: '2018-07-22', cls: 'legit' },
                        { k: 'DNSSEC', v: 'signed', cls: 'legit' }
                    ]},
                    { h: 'Registrant', rows: [
                        { k: 'Org', v: 'Crimson Dawn LLC', cls: 'legit' },
                        { k: 'Country', v: 'US' }
                    ]}
                ],
                pivots: [],
                analyst: 'Legitimate corporate domain &mdash; the company\'s own. Long history (2018), DNSSEC signed, real corporate registrant. This is the actual employer\'s domain (matches "@crimson-dawn.net" senders in the legitimate emails msg/1, msg/5, msg/7).'
            },
            'google.com': {
                title: 'GOOGLE.COM',
                verdict: 'legit', verdictText: 'Legitimate',
                age: { cls: 'ok', text: '29 years (1997)' },
                raw: 'Domain Name: GOOGLE.COM\nRegistrar: MarkMonitor Inc.\nCreated Date: [GREEN]1997-09-15\nRegistrant Organization: Google LLC\nRegistrant Country: US\nName Servers: ns1.google.com (and 3 others)\nDNSSEC: [GREEN]signed',
                metaCards: [
                    { h: 'Registration', rows: [
                        { k: 'Registrar', v: 'MarkMonitor' },
                        { k: 'Created', v: '1997-09-15', cls: 'legit' },
                        { k: 'DNSSEC', v: 'signed', cls: 'legit' }
                    ]}
                ],
                pivots: [],
                analyst: 'Legitimate &mdash; Google\'s primary domain. Not relevant to this incident.'
            },
            '8.8.8.8': {
                title: '8.8.8.8',
                verdict: 'neutral', verdictText: 'Public DNS',
                raw: 'IP: 8.8.8.8\nASN: AS15169 (Google LLC)\nBlock: 8.8.8.0/24\nOrganization: Google LLC (Public DNS)\nCountry: US',
                metaCards: [
                    { h: 'Network', rows: [
                        { k: 'ASN', v: 'AS15169' },
                        { k: 'Org', v: 'Google LLC' },
                        { k: 'Country', v: 'US' }
                    ]}
                ],
                pivots: [],
                analyst: 'Google\'s public DNS resolver. Routine outbound DNS traffic, not actor-controlled infrastructure. Not relevant to attribution.'
            }
        };

        const rec = records[q];
        if (rec) return this._renderWhoisCard(rec);

        return `<div class="wh-no-result">
            No WHOIS record found for <code>${this._escHtml(query)}</code>.<br>
            <span style="opacity:0.7; font-size:0.74rem;">The domain or IP may not exist, or may not be in the local mirror. Try one of the quick-lookup chips above.</span>
        </div>`;
    },

    _handleHashLookup: function(hash, engine) {
        if (!hash.trim()) return '<div class="vt-results-empty">Paste a SHA-256 hash and click <b>Analyze Hash</b>.</div>';
        const h = hash.trim().toLowerCase().replace(/\s+/g, '');

        if (h === 'b3a4f8c2d7e91a6e5f8c2b1d9a4f7e3c8b6d2a1f9e7c4b8a6d3f2e1c9b8a7f4d') {
            // 12 engine consensus sample (real VirusTotal-style — diverse engines, varied signature names)
            const engines = [
                { n: 'Microsoft Defender',      s: 'Trojan:Win32/CobaltStrike.PB!MTB' },
                { n: 'Kaspersky',               s: 'HEUR:Trojan-Spy.Win32.CobaltStrike.gen' },
                { n: 'CrowdStrike Falcon',      s: 'malicious_confidence_100% (W)' },
                { n: 'SentinelOne',             s: 'DFI - Malicious PE' },
                { n: 'Symantec',                s: 'Backdoor.Cobalt!gen.5' },
                { n: 'ESET-NOD32',              s: 'Win32/CobaltStrike.AB' },
                { n: 'Bitdefender',             s: 'Trojan.Generic.34788429' },
                { n: 'Trend Micro',             s: 'TrojanSpy.Win64.COBALTSTRIKE.SMA' },
                { n: 'McAfee',                  s: 'Trojan-FXMU!4F7AE2A9C81B' },
                { n: 'Sophos',                  s: 'ML/PE-A + Mal/Generic-S' },
                { n: 'Palo Alto WildFire',      s: 'malicious' },
                { n: 'Avira',                   s: 'TR/Crypt.XPACK.Gen' }
            ];
            const engineGrid = engines.map(e =>
                `<div class="vt-engine-row"><span class="vt-engine-name">${e.n}</span><span class="vt-engine-sig">${e.s}</span></div>`
            ).join('');

            return `<div class="vt-verdict-bar malicious">
                <div class="vt-ratio">
                    <div class="vt-ratio-num">47<span style="font-size:0.85rem; color:#94a3b8; font-weight:600;">/68</span></div>
                    <div class="vt-ratio-den">detections</div>
                </div>
                <div class="vt-verdict-meta">
                    <div class="vt-verdict-label malicious">Malicious</div>
                    <div class="vt-verdict-title">Cobalt Strike Beacon (stage-1 loader)</div>
                    <div class="vt-verdict-sub">First seen 2026-04-12 &middot; Associated with EMBERWOLF campaign (financial sector)</div>
                </div>
            </div>
            <div class="vt-hash-row"><span class="vt-hash-k">SHA-256</span>${h}</div>
            <div class="vt-section-tabs">
                <div class="vt-section-tab active">Detection</div>
                <div class="vt-section-tab">Behavior</div>
                <div class="vt-section-tab">Network IOCs</div>
                <div class="vt-section-tab">Family</div>
            </div>
            <div class="vt-section">
                <table class="vt-kv">
                    <tr><td class="vt-k">Engine consensus</td><td class="vt-v danger">47 / 68 engines flag as malicious</td></tr>
                    <tr><td class="vt-k">Family</td><td class="vt-v danger">Cobalt Strike Beacon (stage-1 loader)</td></tr>
                    <tr><td class="vt-k">Delivery vector</td><td class="vt-v">MSDT URL-protocol exploit via Word external template reference</td></tr>
                    <tr><td class="vt-k">Associated CVE</td><td class="vt-v"><a href="https://cve.crimson-intel.net/cve/CVE-2022-30190">CVE-2022-30190</a> &mdash; "Follina" (MSDT RCE, CVSS 7.8 HIGH)</td></tr>
                    <tr><td class="vt-k">First seen</td><td class="vt-v">2026-04-12</td></tr>
                    <tr><td class="vt-k">Associated campaigns</td><td class="vt-v danger">EMBERWOLF (financial sector targeting, RU-aligned)</td></tr>
                    <tr><td class="vt-k">MITRE ATT&amp;CK</td><td class="vt-v">T1566.001 (Spearphishing Attachment) &middot; T1203 (Exploit Client Execution) &middot; T1071.001 (App Layer Protocol: Web) &middot; T1568 (Dynamic DNS)</td></tr>
                </table>
                <div style="margin-top:14px; padding:12px 14px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px;">
                    <div style="font-size:0.7rem; font-weight:700; letter-spacing:0.08em; color:#64748b; text-transform:uppercase; margin-bottom:8px;">Engine consensus (sample of 47)</div>
                    <div class="vt-engine-grid">${engineGrid}</div>
                    <div style="font-size:0.7rem; color:#94a3b8; margin-top:8px; text-align:center;">+ 35 additional engines flagged this file</div>
                </div>
                <div style="margin-top:14px;">
                    <div style="font-size:0.7rem; font-weight:700; letter-spacing:0.08em; color:#64748b; text-transform:uppercase; margin-bottom:8px;">Network IOCs observed in sandbox</div>
                    <div class="vt-ioc-list">
                        <div class="vt-ioc"><div class="vt-ioc-k">C2 callback</div><div class="vt-ioc-v"><a href="https://ipgeo.crimson-intel.net">185.220.101.45</a> (TCP/443)</div><div class="vt-ioc-desc">Beacon heartbeat to NForce Entertainment B.V. (AS43350, bulletproof hosting NL). 60-second jitter. Click IP to pivot to IP geolocation.</div></div>
                        <div class="vt-ioc"><div class="vt-ioc-k">DNS resolution</div><div class="vt-ioc-v"><a href="https://whois.crimson-intel.net">emberwolf-c2.duckdns.org</a> &rarr; <a href="https://ipgeo.crimson-intel.net">185.220.101.45</a></div><div class="vt-ioc-desc">DuckDNS dynamic DNS (MITRE T1568). Operator-controlled subdomain. Click domain to pivot to WHOIS, IP to pivot to IP geolocation.</div></div>
                        <div class="vt-ioc"><div class="vt-ioc-k">Lookalike domain</div><div class="vt-ioc-v"><a href="https://whois.crimson-intel.net">crimson-dawn-finance.net</a> &rarr; <a href="https://ipgeo.crimson-intel.net">104.21.45.122</a></div><div class="vt-ioc-desc">Registered 2026-05-15 (3 days before attack). NameCheap + WhoisGuard privacy. Click domain to pivot to WHOIS.</div></div>
                    </div>
                </div>
            </div>
            <div class="vt-flag-note">
                <b>Phase 2 flag-format note:</b> The Family field returns "Cobalt Strike Beacon" &mdash; the flag value normalizes to <code>COBALT_STRIKE</code> (drop the "Beacon" component; Beacon is the loader's name within the Cobalt Strike framework, not a distinct family).
            </div>`;
        }

        if (h === '4a1b2c3d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b') {
            return `<div class="vt-verdict-bar clean">
                <div class="vt-ratio clean">
                    <div class="vt-ratio-num">0<span style="font-size:0.85rem; color:#94a3b8; font-weight:600;">/68</span></div>
                    <div class="vt-ratio-den">detections</div>
                </div>
                <div class="vt-verdict-meta">
                    <div class="vt-verdict-label clean">Clean</div>
                    <div class="vt-verdict-title">Microsoft Excel spreadsheet</div>
                    <div class="vt-verdict-sub">No detections from any engine. No IOCs observed in sandbox.</div>
                </div>
            </div>
            <div class="vt-hash-row"><span class="vt-hash-k">SHA-256</span>${h}</div>
            <div class="vt-section-tabs">
                <div class="vt-section-tab active clean">Summary</div>
            </div>
            <div class="vt-section">
                <table class="vt-kv">
                    <tr><td class="vt-k">Engine consensus</td><td class="vt-v" style="color:#15803d; font-weight:700;">0 / 68 engines flagged</td></tr>
                    <tr><td class="vt-k">File type</td><td class="vt-v">Microsoft Excel Open XML spreadsheet (.xlsx)</td></tr>
                    <tr><td class="vt-k">IOCs observed</td><td class="vt-v" style="color:#15803d;">None</td></tr>
                </table>
                <div style="margin-top:14px; padding:10px 14px; background:#fef9c3; border:1px solid #fde68a; border-radius:4px; font-size:0.78rem; color:#713f12;">
                    <b>IR Note:</b> This file is benign. If you submitted a Phase-2 flag derived from this hash, you hashed the <i>wrong attachment</i>. Re-read Phase 1: msg/4 has TWO attachments and only one of them is the malicious payload.
                </div>
            </div>`;
        }

        return `<div class="vt-verdict-bar unknown">
            <div class="vt-ratio unknown">
                <div class="vt-ratio-num" style="font-size:1.15rem;">?</div>
                <div class="vt-ratio-den">no data</div>
            </div>
            <div class="vt-verdict-meta">
                <div class="vt-verdict-label unknown">Unknown</div>
                <div class="vt-verdict-title">Hash not found in database</div>
                <div class="vt-verdict-sub">The 68-engine mirror has no record of this SHA-256.</div>
            </div>
        </div>
        <div class="vt-hash-row"><span class="vt-hash-k">SUBMITTED</span>${this._escHtml(h.substring(0, 64))}${h.length > 64 ? '...' : ''}</div>
        <div class="vt-section">
            <div style="font-size:0.84rem; color:#475569; line-height:1.6;">
                The hash you submitted is not in the local mirror. Verify you are:
                <ul style="margin:8px 0 0 18px; padding:0; line-height:1.7;">
                    <li>Hashing the actual attachment file (not the email body)</li>
                    <li>Running <code style="background:#f1f5f9; padding:1px 5px; border-radius:3px; font-family:'JetBrains Mono', monospace;">sha256sum</code> from <code style="background:#f1f5f9; padding:1px 5px; border-radius:3px;">/home/ir-lead/downloads/</code></li>
                    <li>Submitting the full 64-character lowercase hex hash (no spaces, no truncation)</li>
                </ul>
            </div>
            <div style="margin-top:12px; padding:10px 14px; background:#fef9c3; border:1px solid #fde68a; border-radius:4px; font-size:0.74rem; color:#713f12;">
                <b>Phase 2 step 2.1 reminder:</b> Download the attachment from msg/4 first (the corrected invoice), save to <code>/home/ir-lead/downloads/</code>, then hash with <code>sha256sum</code>.
            </div>
        </div>`;
    },

    _handleThreatIntel: function(query, engine) {
        if (!query.trim()) return '<div style="color:#888; font-size:0.8rem; padding:16px; text-align:center;">Enter an IOC, CVE, or malware family name.</div>';
        const q = query.toLowerCase().trim();

        // The intel search returns actors with >= 2/4 TTP overlap
        const isEmberwolfQuery = q.includes('emberwolf') || q.includes('cobalt strike') || q.includes('cobalt_strike') || q.includes('cve-2022-30190') || q.includes('follina') || q.includes('duckdns') || q.includes('185.220.101.45');

        if (!isEmberwolfQuery && q.length < 3) {
            return '<div class="ti-no-match"><div class="ti-no-match-msg">Enter at least 3 characters or a known IOC to search the mirror.</div></div>';
        }

        if (!isEmberwolfQuery) {
            return '<div class="ti-no-match"><div class="ti-no-match-msg">No actor profiles matched <code>' + this._escHtml(query) + '</code>.<br><br>Try searching by IOC from previous phases &mdash; the C2 domain, malware family, CVE, or X-Originating-IP. <span style="opacity:0.7; font-size:0.78rem;">Suggestion: try <code>emberwolf-c2.duckdns.org</code>, <code>CVE-2022-30190</code>, or <code>Cobalt Strike</code>.</span></div></div>';
        }

        var actors = [
            {
                codename: 'EMBERWOLF', matchScore: '4/4', matchText: 'EXACT MATCH', tier: 'high',
                alignment: 'RU-aligned', flagCode: 'RU', flagClass: 'ru',
                tracked: '2024-Q2',
                targeting: 'Financial services',
                geo: 'RU (HIGH conf.)',
                status: 'Active',
                ttps: [
                    { k: 'Initial Access', v: 'Spear-phishing with invoice lures', mitre: 'T1566.001', match: true },
                    { k: 'Exploit', v: 'CVE-2022-30190 (Follina) via Word external template', mitre: 'T1203', match: true },
                    { k: 'Post-Exploit', v: 'Cobalt Strike Beacon (stage-1 loader)', mitre: 'S0154', match: true },
                    { k: 'Infrastructure', v: 'Dynamic-DNS C2 (DuckDNS, No-IP)', mitre: 'T1568.002', match: true },
                    { k: 'Naming Convention', v: '"emberwolf-c2.*" / "crimson-*-finance.*"', mitre: '', match: true },
                    { k: 'Sector Targeting', v: 'Financial services exclusively (AP, vendor systems)', mitre: '', match: true }
                ],
                disambig: 'The naming-convention TTP (<code style="background:rgba(255,255,255,0.08); padding:1px 4px; border-radius:2px;">emberwolf-c2.*</code> + <code style="background:rgba(255,255,255,0.08); padding:1px 4px; border-radius:2px;">crimson-*-finance.*</code>) is <b>unique to EMBERWOLF</b>. <b>CRIMSONTIDE</b> uses random/non-themed names. <b>BLACKHELIX</b> uses legit-corp-lookalikes. The themed cluster + dynamic-DNS + Follina + Cobalt Strike together = EMBERWOLF, no ambiguity.',
                pivots: [
                    { label: 'WHOIS', value: 'crimson-dawn-finance.net (front domain)', url: 'https://whois.crimson-intel.net' },
                    { label: 'IP Geo', value: '185.220.101.45 (C2 host)', url: 'https://ipgeo.crimson-intel.net' },
                    { label: 'VT-Mirror', value: 'F8E92A1B4C5D6E7F (Cobalt Strike sample)', url: 'https://vt-mirror.crimson-intel.net' }
                ]
            },
            {
                codename: 'CRIMSONTIDE', matchScore: '2/4', matchText: 'PARTIAL', tier: 'partial',
                alignment: 'criminal, US affiliate network', flagCode: 'US', flagClass: 'us',
                tracked: '2023-Q4',
                targeting: 'Cross-sector, opportunistic',
                geo: 'US (MEDIUM conf.)',
                status: 'Active',
                ttps: [
                    { k: 'Initial Access', v: 'Varied phishing + initial-access-broker buy-ins', mitre: 'T1566', match: false },
                    { k: 'Exploit', v: 'Varied &mdash; CVE-2017-11882, CVE-2022-30190, CVE-2024-21412', mitre: '', match: true },
                    { k: 'Post-Exploit', v: 'Cobalt Strike Beacon &rarr; ransomware (Black Basta, Royal)', mitre: 'S0154', match: true },
                    { k: 'Infrastructure', v: 'Rotating VPS &mdash; <b>no dynamic-DNS preference</b>', mitre: 'T1583', match: false },
                    { k: 'Naming Convention', v: '<b>Random / non-themed</b>', mitre: '', match: false },
                    { k: 'Sector Targeting', v: 'Opportunistic (LOW sector confidence)', mitre: '', match: false }
                ],
                pivots: [
                    { label: 'TTP overlap', value: 'CVE-2022-30190 + Cobalt Strike', url: '' }
                ]
            },
            {
                codename: 'BLACKHELIX', matchScore: '2/4', matchText: 'PARTIAL', tier: 'partial',
                alignment: 'criminal, transient', flagCode: 'UNK', flagClass: 'unk',
                tracked: '2025-Q1',
                targeting: 'Banking, fintech',
                geo: 'Operator unknown (LOW conf.)',
                status: 'Active',
                ttps: [
                    { k: 'Initial Access', v: 'Browser zero-days + Word macros', mitre: 'T1189', match: false },
                    { k: 'Exploit', v: '<b>NOT Follina</b> &mdash; uses different vulnerabilities', mitre: '', match: false },
                    { k: 'Post-Exploit', v: 'Custom banking malware (Marblegate) &mdash; <b>not Cobalt Strike</b>', mitre: '', match: false },
                    { k: 'Infrastructure', v: 'Compromised legitimate hosting', mitre: 'T1584', match: false },
                    { k: 'Naming Convention', v: 'Legit-corp-lookalike (different pattern logic)', mitre: '', match: false },
                    { k: 'Sector Targeting', v: 'Banking + fintech (HIGH sector confidence)', mitre: '', match: true }
                ]
            },
            {
                codename: 'IRONHAVEN', matchScore: '1/4', matchText: 'BELOW THRESHOLD', tier: 'low',
                alignment: 'CN-aligned', flagCode: 'CN', flagClass: 'cn',
                tracked: '2022-Q1',
                targeting: 'IP theft &mdash; manufacturing, pharma, defense',
                geo: 'CN (HIGH conf.)',
                status: 'Active',
                ttps: [
                    { k: 'Note', v: 'No observed use of Follina or Cobalt Strike. Custom implants only. Financial-sector targeting: <b>NONE</b>.', mitre: '', match: false }
                ]
            },
            {
                codename: 'NORTHGALE', matchScore: '1/4', matchText: 'BELOW THRESHOLD', tier: 'low',
                alignment: 'KP-aligned', flagCode: 'KP', flagClass: 'kp',
                tracked: '2023-Q3',
                targeting: 'Financial heists (crypto, SWIFT)',
                geo: 'KP (HIGH conf.)',
                status: 'Active',
                ttps: [
                    { k: 'Note', v: 'Uses different malware families &mdash; no Follina or Cobalt Strike on record. Different infrastructure pattern (compromised cryptocurrency exchanges).', mitre: '', match: false }
                ]
            },
            {
                codename: 'DESERTKITE', matchScore: '0/4', matchText: 'NO OVERLAP', tier: 'low',
                alignment: 'IR-aligned', flagCode: 'IR', flagClass: 'ir',
                tracked: '2021-Q4',
                targeting: 'Energy / critical infrastructure',
                geo: 'IR (HIGH conf.)',
                status: 'Active',
                ttps: [
                    { k: 'Note', v: 'No overlap with this incident\'s TTPs. Included for completeness &mdash; a thorough analyst checks even unlikely candidates and rules them out.', mitre: '', match: false }
                ]
            }
        ];

        var cardsHtml = actors.map(function(a) {
            var ttpRowsHtml = a.ttps.map(function(t) {
                var mitreChip = t.mitre ? '<span class="ti-mitre">' + t.mitre + '</span>' : '';
                var vCls = t.match ? 'match' : (a.tier === 'low' ? 'no-match' : '');
                return '<tr><td class="ti-ttp-k">' + t.k + '</td><td class="ti-ttp-v ' + vCls + '">' + t.v + mitreChip + '</td></tr>';
            }).join('');
            var disambigHtml = a.disambig ? '<div class="ti-disambig"><b>Disambiguator:</b> ' + a.disambig + '</div>' : '';
            var pivotsHtml = '';
            if (a.pivots && a.pivots.length) {
                pivotsHtml = '<div class="ti-pivots"><div class="ti-pivots-h">Pivot to</div>' + a.pivots.map(function(p) {
                    if (p.url) return '<a class="ti-pivot" href="' + p.url + '"><span class="ti-pivot-label">' + p.label + '</span>' + p.value + '</a>';
                    return '<span class="ti-pivot" style="cursor:default; opacity:0.7;"><span class="ti-pivot-label">' + p.label + '</span>' + p.value + '</span>';
                }).join('') + '</div>';
            }
            return '<div class="ti-actor ' + a.tier + '">' +
                '<div class="ti-actor-head">' +
                    '<div class="ti-codename">' + a.codename + '</div>' +
                    '<div class="ti-match-badge">TTP match: ' + a.matchScore + ' &middot; ' + a.matchText + '</div>' +
                    '<div class="ti-flag"><div class="ti-flag-code ' + a.flagClass + '">' + a.flagCode + '</div></div>' +
                '</div>' +
                '<div class="ti-keyfacts">' +
                    '<div class="ti-kf"><div class="ti-kf-k">Tracked since</div><div class="ti-kf-v">' + a.tracked + '</div></div>' +
                    '<div class="ti-kf"><div class="ti-kf-k">Targeting</div><div class="ti-kf-v ' + (a.tier === 'high' ? 'hot' : '') + '">' + a.targeting + '</div></div>' +
                    '<div class="ti-kf"><div class="ti-kf-k">Geo origin</div><div class="ti-kf-v ' + (a.tier === 'high' ? 'hot' : (a.tier === 'partial' ? 'warn' : '')) + '">' + a.geo + '</div></div>' +
                    '<div class="ti-kf"><div class="ti-kf-k">Status</div><div class="ti-kf-v">' + a.status + '</div></div>' +
                '</div>' +
                '<div class="ti-ttp-section">' +
                    '<div class="ti-ttp-h">TTP Profile vs. Observed Incident</div>' +
                    '<table class="ti-ttp-table">' + ttpRowsHtml + '</table>' +
                '</div>' +
                disambigHtml +
                pivotsHtml +
            '</div>';
        }).join('');

        return '<div class="ti-search-summary"><b>SEARCH MATCHED:</b> 3 actor profiles with at least 2/4 TTP overlap &middot; 3 below-threshold candidates returned for completeness</div>' + cardsHtml;
    },

    _renderIpGeoCard: function(rec) {
        var bannerClass = rec.banner || 'neutral';
        var attrClass = rec.attribution ? rec.attribution.cls : 'cloud';
        var verdictPill = rec.verdictText ? '<span class="ig-verdict-pill">' + rec.verdictText + '</span>' : '';
        var geoRows = rec.geo.map(function(r) {
            return '<div class="ig-card-row"><span class="ig-card-k">' + r.k + '</span><span class="ig-card-v ' + (r.cls || '') + '">' + r.v + '</span></div>';
        }).join('');
        var asnRows = rec.asn.map(function(r) {
            return '<div class="ig-card-row"><span class="ig-card-k">' + r.k + '</span><span class="ig-card-v ' + (r.cls || '') + '">' + r.v + '</span></div>';
        }).join('');
        var attributionHtml = '';
        if (rec.attribution) {
            var sourcesUl = rec.attribution.sources ?
                '<ul>' + rec.attribution.sources.map(function(s) { return '<li>' + s + '</li>'; }).join('') + '</ul>' : '';
            attributionHtml = '<div class="ig-attribution ' + attrClass + '">' +
                '<div class="ig-attr-h">' + rec.attribution.label + '</div>' +
                '<div class="ig-attr-verdict">' + rec.attribution.verdict + (rec.attribution.confidence ? '<span class="ig-attr-conf">' + rec.attribution.confidence + '</span>' : '') + '</div>' +
                (rec.attribution.detail ? '<div class="ig-attr-sources"><b>Detail:</b> ' + rec.attribution.detail + sourcesUl + '</div>' : sourcesUl) +
                '</div>';
        }
        var pivotsHtml = '';
        if (rec.pivots && rec.pivots.length) {
            pivotsHtml = '<div class="ig-pivots"><div class="ig-pivots-h">Pivot to</div>' +
                rec.pivots.map(function(p) {
                    return '<a class="ig-pivot" href="' + p.url + '"><span class="ig-pivot-label">' + p.label + '</span>' + p.value + '</a>';
                }).join('') + '</div>';
        }
        var caveatHtml = rec.caveat ? '<div class="ig-caveat">' + rec.caveat + '</div>' : '';
        return '<div class="ig-ip-banner ' + bannerClass + '">' +
            '<div class="ig-ip-meta">' +
                '<div class="ig-ip-mono">' + rec.ip + '</div>' +
                '<div class="ig-ip-meta-sub">' + (rec.sub || '') + '</div>' +
            '</div>' +
            verdictPill +
            '</div>' +
            '<div class="ig-cards">' +
                '<div class="ig-card"><div class="ig-card-h">Geolocation</div>' + geoRows + '</div>' +
                '<div class="ig-card" style="border-right:0;"><div class="ig-card-h">Network / ASN</div>' + asnRows + '</div>' +
            '</div>' +
            attributionHtml +
            caveatHtml +
            pivotsHtml;
    },

    _handleIpGeo: function(ip, engine) {
        if (!ip.trim()) return '<div class="ig-empty">Enter an IP address.</div>';
        const q = ip.trim();

        const geoData = {
            '185.220.101.45': {
                ip: '185.220.101.45', banner: 'suspicious', verdictText: 'Bulletproof hosting',
                sub: 'C2 host for the EMBERWOLF Cobalt Strike Beacon',
                geo: [
                    { k: 'Edge city', v: 'Amsterdam' },
                    { k: 'Edge country', v: 'NL' },
                    { k: 'Latitude/Long', v: '52.3676 / 4.9041' }
                ],
                asn: [
                    { k: 'ASN', v: 'AS43350' },
                    { k: 'Org', v: 'NForce Entertainment B.V.', cls: 'danger' },
                    { k: 'Block', v: '185.220.100.0/22' },
                    { k: 'Abuse', v: 'abuse@nforce.nl' }
                ],
                attribution: {
                    cls: 'suspicious', label: 'HexIntel actor-origin enrichment',
                    verdict: 'RU-aligned', confidence: 'HIGH confidence',
                    detail: 'The MaxMind geo locates the NForce edge in NL; HexIntel\'s passive-DNS + behavioral telemetry locates the <b>operator</b> in RU.',
                    sources: [
                        'Behavioral C2 callback windows align with UTC+3 working hours',
                        'Language artifacts in builder strings recovered from prior EMBERWOLF samples',
                        'Infrastructure-overlap analysis with prior RU-aligned campaigns (HexIntel feed)',
                        'Open-source reporting from 3 prior incidents (Q1-Q2 2026)'
                    ]
                },
                caveat: '<b>Phase 4 caveat:</b> the MaxMind geo and the WHOIS ASN country both report NL &mdash; that is the provider\'s edge + incorporation jurisdiction, NOT actor origin. Bulletproof hosts like NForce serve operators globally. Do not use WHOIS/MaxMind country alone for attribution; always cross-reference behavioral + open-source signal.',
                pivots: [
                    { label: 'WHOIS', value: '185.220.101.45 (ASN lookup)', url: 'https://whois.crimson-intel.net' },
                    { label: 'Intel', value: 'EMBERWOLF actor profile', url: 'https://intel.crimson-intel.net' }
                ]
            },
            '104.21.45.122': {
                ip: '104.21.45.122', banner: 'cloud', verdictText: 'Cloudflare edge',
                sub: 'CDN edge IP &mdash; resolves crimson-dawn-finance.net (lookalike domain)',
                geo: [
                    { k: 'Edge city', v: 'San Jose' },
                    { k: 'Edge country', v: 'US' },
                    { k: 'Latitude/Long', v: '37.3387 / -121.8853' }
                ],
                asn: [
                    { k: 'ASN', v: 'AS13335' },
                    { k: 'Org', v: 'Cloudflare, Inc.' },
                    { k: 'Block', v: '104.16.0.0/12' },
                    { k: 'Service', v: 'CDN edge' }
                ],
                attribution: {
                    cls: 'cloud', label: 'CDN edge &ne; origin',
                    verdict: 'Cloudflare anycast',
                    detail: 'This IP is a Cloudflare edge node and does NOT indicate the origin of the content hosted behind it. Behind the CDN, the actual hosting could be anywhere in the world. To find the real origin, use passive DNS or SSL-cert fingerprinting (out of scope for this exercise).'
                },
                caveat: '<b>Phase 4 pedagogy:</b> CDN-fronted infrastructure is a deliberate obscuration tactic. Lookalike phishing domains routinely sit behind Cloudflare/Akamai/Fastly so that the public WHOIS + MaxMind geo are useless for attribution. Use this IP as a signal that the actor is using a CDN, not as a geolocation result.',
                pivots: [
                    { label: 'WHOIS', value: 'crimson-dawn-finance.net (front domain)', url: 'https://whois.crimson-intel.net' }
                ]
            },
            '51.140.83.42': {
                ip: '51.140.83.42', banner: 'vpn', verdictText: 'Commercial VPN',
                sub: 'Azure UK South &mdash; matches s.patel\'s expected travel pattern',
                geo: [
                    { k: 'Edge city', v: 'London' },
                    { k: 'Edge country', v: 'UK' },
                    { k: 'Latitude/Long', v: '51.5074 / -0.1278' }
                ],
                asn: [
                    { k: 'ASN', v: 'AS8075' },
                    { k: 'Org', v: 'Microsoft Corporation' },
                    { k: 'Service', v: 'Azure UK South' },
                    { k: 'VPN egress', v: 'Known commercial' }
                ],
                attribution: {
                    cls: 'vpn', label: 'Provenance verification',
                    verdict: 'Explained anomaly',
                    detail: 'This IP is a known Azure UK South VPN egress point. The auth log shows s.patel logging in from this IP on 2026-05-15 through 2026-05-19 &mdash; matches her HR-approved offsite travel ticket #TR-2026-0418 (London, 2026-05-15 to 2026-05-22). Four prior London sessions exist on her account from past travel.'
                },
                pivots: [
                    { label: 'WHOIS', value: '51.140.83.42 (ASN)', url: 'https://whois.crimson-intel.net' }
                ]
            },
            '8.8.8.8': {
                ip: '8.8.8.8', banner: 'cloud', verdictText: 'Public DNS',
                sub: 'Google Public DNS &mdash; not actor infrastructure',
                geo: [
                    { k: 'City', v: 'Mountain View' },
                    { k: 'Country', v: 'US' }
                ],
                asn: [
                    { k: 'ASN', v: 'AS15169' },
                    { k: 'Org', v: 'Google LLC' },
                    { k: 'Service', v: 'Public DNS' }
                ]
            },
            '52.86.14.93': {
                ip: '52.86.14.93', banner: 'cloud', verdictText: 'AWS EC2',
                sub: 'AWS us-east-1 &mdash; ordinary cloud traffic',
                geo: [{ k: 'City', v: 'Ashburn' }, { k: 'Country', v: 'US' }],
                asn: [{ k: 'ASN', v: 'AS14618' }, { k: 'Org', v: 'Amazon AWS' }, { k: 'Service', v: 'EC2 us-east-1' }]
            },
            '204.111.12.88': {
                ip: '204.111.12.88', banner: 'neutral', verdictText: 'Residential ISP',
                sub: 'Comcast residential broadband',
                geo: [{ k: 'City', v: 'Philadelphia' }, { k: 'Country', v: 'US' }],
                asn: [{ k: 'ASN', v: 'AS7922' }, { k: 'Org', v: 'Comcast Cable' }, { k: 'Type', v: 'Residential broadband' }]
            },
            '10.0.4.18': {
                ip: '10.0.4.18', banner: 'private', verdictText: 'Private RFC1918',
                sub: 'e.morales workstation (WS-EMORALES-01) &mdash; internal AP network',
                geo: [{ k: 'Range', v: 'RFC 1918' }, { k: 'Scope', v: 'Private' }],
                asn: [{ k: 'Network', v: '10.0.0.0/8' }, { k: 'Owner', v: 'Internal' }],
                attribution: {
                    cls: 'private', label: 'Internal asset',
                    verdict: 'Patient Zero workstation',
                    detail: 'No external geolocation available for RFC1918 private ranges. Internal asset records identify this as e.morales\'s assigned workstation (WS-EMORALES-01) on the Accounts Payable subnet 10.0.4.0/24.'
                }
            }
        };

        const rec = geoData[q];
        if (rec) return this._renderIpGeoCard(rec);

        const octets = q.split('.');
        if (octets.length === 4 && octets.every(o => !isNaN(parseInt(o)) && parseInt(o) >= 0 && parseInt(o) <= 255)) {
            return `<div class="ig-no-result">
                No geolocation record found for <code>${this._escHtml(q)}</code>.<br>
                <span style="opacity:0.7; font-size:0.74rem;">Key IPs in this investigation: <code>185.220.101.45</code> (attacker C2), <code>104.21.45.122</code> (CDN front), <code>51.140.83.42</code> (London VPN), <code>10.0.4.18</code> (Patient Zero workstation)</span>
            </div>`;
        }

        return `<div class="ig-no-result">Invalid IP address format. Enter a valid IPv4 address (e.g. <code>185.220.101.45</code>).</div>`;
    },

    _handleSiem: function(logType, filter, engine) {
        const f = filter.toLowerCase().trim();

        if (logType === 'dns') {
            return this._siemDnsLog(f);
        } else if (logType === 'auth') {
            return this._siemAuthLog(f);
        } else if (logType === 'firewall') {
            return this._siemFirewallLog(f);
        }
        return '<div style="color:#888; padding:12px;">Select a log type.</div>';
    },

    _siemDnsLog: function(filter) {
        // All DNS entries -- a mix of normal + the 4 critical entries
        const allEntries = [
            { ts: '2026-05-14 08:11:22', user: 'j.rivera',   domain: 'mail.google.com',             ip: '142.250.80.5',    flag: '' },
            { ts: '2026-05-14 09:34:44', user: 'k.yamamoto', domain: 'sharepoint.crimson-dawn.net',  ip: '10.0.1.20',       flag: '' },
            { ts: '2026-05-15 07:55:10', user: 's.patel',    domain: 'mail.google.com',             ip: '142.250.80.5',    flag: '' },
            { ts: '2026-05-15 08:02:33', user: 's.patel',    domain: 'outlook.office365.com',       ip: '52.96.111.12',    flag: '' },
            { ts: '2026-05-15 14:20:01', user: 'e.morales',  domain: 'outlook.office365.com',       ip: '52.96.111.12',    flag: '' },
            { ts: '2026-05-15 15:44:18', user: 'r.chen',     domain: 'nakamura-supplies.com',       ip: '52.44.22.11',     flag: '' },
            { ts: '2026-05-16 09:10:55', user: 'j.rivera',   domain: 'teams.microsoft.com',         ip: '52.113.194.132',  flag: '' },
            { ts: '2026-05-16 10:30:14', user: 'e.morales',  domain: 'nakamura-supplies.com',       ip: '52.44.22.11',     flag: '' },
            { ts: '2026-05-16 11:52:30', user: 'k.yamamoto', domain: 'mail.google.com',             ip: '142.250.80.5',    flag: '' },
            { ts: '2026-05-17 08:18:45', user: 'r.chen',     domain: 'outlook.office365.com',       ip: '52.96.111.12',    flag: '' },
            { ts: '2026-05-17 09:44:02', user: 'a.torres',   domain: 'zoom.us',                     ip: '170.114.0.1',     flag: '' },
            { ts: '2026-05-17 14:01:19', user: 's.patel',    domain: 'calendly.com',                ip: '104.19.149.12',   flag: '' },
            { ts: '2026-05-17 16:30:55', user: 'e.morales',  domain: 'mail.google.com',             ip: '142.250.80.5',    flag: '' },
            { ts: '2026-05-18 07:14:22', user: 'a.torres',   domain: 'teams.microsoft.com',         ip: '52.113.194.132',  flag: '' },
            { ts: '2026-05-18 07:55:08', user: 'r.chen',     domain: 'sharepoint.crimson-dawn.net', ip: '10.0.1.20',       flag: '' },
            { ts: '2026-05-18 08:31:00', user: 'j.rivera',   domain: 'outlook.office365.com',       ip: '52.96.111.12',    flag: '' },
            { ts: '2026-05-18 09:02:14', user: 'k.yamamoto', domain: 'nakamura-supplies.com',       ip: '52.44.22.11',     flag: '' },
            { ts: '2026-05-18 09:12:14', user: 'e.morales',  domain: 'crimson-dawn-finance.net',    ip: '104.21.45.122',   flag: 'ANOMALY -- lookalike domain' },
            { ts: '2026-05-18 09:12:42', user: 'e.morales',  domain: 'emberwolf-c2.duckdns.org',    ip: '185.220.101.45',  flag: 'C2 CALLBACK -- malware beacon' },
            { ts: '2026-05-18 11:34:08', user: 'r.chen',     domain: 'crimson-dawn-finance.net',    ip: '104.21.45.122',   flag: 'ANOMALY -- lookalike domain' },
            { ts: '2026-05-18 13:00:10', user: 'a.torres',   domain: 'mail.google.com',             ip: '142.250.80.5',    flag: '' },
            { ts: '2026-05-18 13:44:22', user: 'j.rivera',   domain: 'zoom.us',                     ip: '170.114.0.1',     flag: '' },
            { ts: '2026-05-18 14:22:51', user: 's.patel',    domain: 'crimson-dawn-finance.net',    ip: '104.21.45.122',   flag: 'ANOMALY -- lookalike domain' },
            { ts: '2026-05-18 15:10:05', user: 'k.yamamoto', domain: 'outlook.office365.com',       ip: '52.96.111.12',    flag: '' },
            { ts: '2026-05-19 08:00:11', user: 'r.chen',     domain: 'sharepoint.crimson-dawn.net', ip: '10.0.1.20',       flag: '' },
            { ts: '2026-05-20 09:30:44', user: 'a.torres',   domain: 'teams.microsoft.com',         ip: '52.113.194.132',  flag: '' }
        ];

        const entries = filter ? allEntries.filter(e =>
            e.user.includes(filter) || e.domain.includes(filter) || e.ip.includes(filter)
        ) : allEntries;

        if (entries.length === 0) {
            return `<div class="siem-no-match">No DNS entries matched filter: <b>"${this._escHtml(filter)}"</b><br><span style="opacity:0.7; font-size:0.74rem;">Try a quick-filter chip above or clear the filter.</span></div>`;
        }

        const anomalyCount = entries.filter(e => e.flag).length;

        const rows = entries.map(e => {
            const trClass = e.flag ? 'anomaly' : '';
            const flagBadge = e.flag ? `<span class="siem-badge crit">CRIT</span><span class="siem-flag-text">${e.flag}</span>` : '<span style="color:#475569;">&mdash;</span>';
            return `<tr class="${trClass}">
                <td class="siem-ts">${e.ts}</td>
                <td class="siem-user">${e.user}</td>
                <td class="siem-target">${e.domain}</td>
                <td>${e.ip}</td>
                <td>${flagBadge}</td>
            </tr>`;
        }).join('');

        return `<div class="siem-results-toolbar">
            <span><span class="siem-count">${entries.length}</span> events</span>
            ${anomalyCount > 0 ? `<span><span class="siem-anomaly-count">${anomalyCount}</span> anomalies</span>` : ''}
            ${filter ? `<span style="margin-left:auto;">filter: <code style="background:#1e293b; padding:1px 6px; border-radius:3px; color:#fda4af;">${this._escHtml(filter)}</code></span>` : '<span style="margin-left:auto;">no filter active</span>'}
        </div>
        <table class="siem-table">
            <thead><tr>
                <th>Timestamp (UTC)</th>
                <th>User</th>
                <th>Query Domain</th>
                <th>Response IP</th>
                <th>Severity / Note</th>
            </tr></thead>
            <tbody>${rows}</tbody>
        </table>`;
    },

    _siemAuthLog: function(filter) {
        const allEntries = [
            { ts: '2026-05-14 07:30:12', user: 'e.morales', src: '10.0.4.18',      ws: 'WS-EMORALES-01', status: 'SUCCESS',  note: '' },
            { ts: '2026-05-14 08:15:40', user: 'r.chen',    src: '10.0.4.6',       ws: 'WS-RCHEN-01',    status: 'SUCCESS',  note: '' },
            { ts: '2026-05-15 06:30:08', user: 's.patel',   src: '51.140.83.42',   ws: 'VPN',            status: 'SUCCESS',  note: 'EXPLAINED ANOMALY: Calendar offsite 2026-05-15 to 2026-05-22 | HR ticket #TR-2026-0418 | Prior London sessions: 4 (consistent pattern)' },
            { ts: '2026-05-15 07:44:22', user: 'k.yamamoto',src: '10.0.4.22',      ws: 'WS-KY-01',       status: 'SUCCESS',  note: '' },
            { ts: '2026-05-15 08:01:55', user: 'a.torres',  src: '10.0.4.30',      ws: 'WS-AT-01',       status: 'SUCCESS',  note: '' },
            { ts: '2026-05-16 07:28:33', user: 'e.morales', src: '10.0.4.18',      ws: 'WS-EMORALES-01', status: 'SUCCESS',  note: '' },
            { ts: '2026-05-16 07:55:14', user: 'r.chen',    src: '10.0.4.6',       ws: 'WS-RCHEN-01',    status: 'SUCCESS',  note: '' },
            { ts: '2026-05-16 06:28:05', user: 's.patel',   src: '51.140.83.42',   ws: 'VPN',            status: 'SUCCESS',  note: 'EXPLAINED ANOMALY: same London VPN session -- see 2026-05-15 entry for full provenance' },
            { ts: '2026-05-17 07:30:00', user: 'e.morales', src: '10.0.4.18',      ws: 'WS-EMORALES-01', status: 'SUCCESS',  note: '' },
            { ts: '2026-05-17 08:00:10', user: 'r.chen',    src: '10.0.4.6',       ws: 'WS-RCHEN-01',    status: 'SUCCESS',  note: '' },
            { ts: '2026-05-17 09:22:44', user: 'j.rivera',  src: '10.0.4.14',      ws: 'WS-JR-01',       status: 'SUCCESS',  note: '' },
            { ts: '2026-05-17 11:05:18', user: 'a.torres',  src: '10.0.4.30',      ws: 'WS-AT-01',       status: 'SUCCESS',  note: '' },
            { ts: '2026-05-18 07:02:44', user: 'e.morales', src: '10.0.4.18',      ws: 'WS-EMORALES-01', status: 'SUCCESS',  note: '' },
            { ts: '2026-05-18 07:45:00', user: 'r.chen',    src: '10.0.4.6',       ws: 'WS-RCHEN-01',    status: 'SUCCESS',  note: '' },
            { ts: '2026-05-18 06:30:11', user: 's.patel',   src: '51.140.83.42',   ws: 'VPN',            status: 'SUCCESS',  note: 'EXPLAINED ANOMALY: Calendar offsite 2026-05-15 to 2026-05-22 | HR ticket #TR-2026-0418 | Prior London sessions: 4 (consistent pattern)' },
            { ts: '2026-05-18 09:14:03', user: 'e.morales', src: '10.0.4.18',      ws: 'WS-EMORALES-01', status: 'SUCCESS',  note: '' },
            { ts: '2026-05-18 11:08:22', user: 'e.morales', src: '185.220.101.45', ws: 'REMOTE',         status: 'SUCCESS',  note: 'UNEXPLAINED ANOMALY: Foreign IP (AS43350 NForce NL) -- no calendar entry, no travel-approval ticket, no prior session from this IP or ASN' },
            { ts: '2026-05-18 13:42:11', user: 'e.morales', src: '185.220.101.45', ws: 'REMOTE',         status: 'SUCCESS',  note: 'UNEXPLAINED ANOMALY: Same foreign IP -- attacker maintaining credential access post-compromise' },
            { ts: '2026-05-18 15:00:44', user: 'e.morales', src: '185.220.101.45', ws: 'REMOTE',         status: 'SUCCESS',  note: 'UNEXPLAINED ANOMALY: Third consecutive session from foreign IP' },
            { ts: '2026-05-19 06:35:22', user: 's.patel',   src: '51.140.83.42',   ws: 'VPN',            status: 'SUCCESS',  note: 'EXPLAINED ANOMALY: London VPN -- continued from offsite travel (HR ticket #TR-2026-0418)' },
            { ts: '2026-05-19 07:11:00', user: 'r.chen',    src: '10.0.4.6',       ws: 'WS-RCHEN-01',    status: 'SUCCESS',  note: '' },
            { ts: '2026-05-19 07:30:00', user: 'k.yamamoto',src: '10.0.4.22',      ws: 'WS-KY-01',       status: 'SUCCESS',  note: '' },
            { ts: '2026-05-19 08:00:12', user: 'e.morales', src: '185.220.101.45', ws: 'REMOTE',         status: 'SUCCESS',  note: 'UNEXPLAINED ANOMALY: Day 2 -- attacker still active after initial compromise' },
            { ts: '2026-05-20 07:05:18', user: 'j.rivera',  src: '10.0.4.14',      ws: 'WS-JR-01',       status: 'SUCCESS',  note: '' },
            { ts: '2026-05-20 07:30:00', user: 'a.torres',  src: '10.0.4.30',      ws: 'WS-AT-01',       status: 'SUCCESS',  note: '' }
        ];

        const entries = filter ? allEntries.filter(e =>
            e.user.includes(filter) || e.src.includes(filter) || e.ws.toLowerCase().includes(filter)
        ) : allEntries;

        if (entries.length === 0) {
            return `<div class="siem-no-match">No auth entries matched filter: <b>"${this._escHtml(filter)}"</b></div>`;
        }

        const unexplainedCount = entries.filter(e => e.note.startsWith('UNEXPLAINED')).length;
        const explainedCount = entries.filter(e => e.note.startsWith('EXPLAINED')).length;

        const rows = entries.map(e => {
            let badge = '<span style="color:#475569;">&mdash;</span>';
            let trClass = '';
            if (e.note.startsWith('UNEXPLAINED')) {
                // Full note text preserved verbatim — smoke test looks for "UNEXPLAINED ANOMALY"
                // string in the rendered output, and instructors / Phase-5 pedagogy
                // reads the full provenance line. Badge is the visual cue; text is the data.
                badge = `<span class="siem-badge crit">CRIT</span><span class="siem-flag-text">${e.note}</span>`;
                trClass = 'anomaly';
            } else if (e.note.startsWith('EXPLAINED')) {
                badge = `<span class="siem-badge high">EXPL'D</span><span class="siem-flag-text" style="color:#fdba74;">${e.note}</span>`;
            }
            return `<tr class="${trClass}">
                <td class="siem-ts">${e.ts}</td>
                <td class="siem-user">${e.user}</td>
                <td class="siem-target">${e.src}</td>
                <td>${e.ws}</td>
                <td>${badge}</td>
            </tr>`;
        }).join('');

        return `<div class="siem-results-toolbar">
            <span><span class="siem-count">${entries.length}</span> events</span>
            ${unexplainedCount > 0 ? `<span><span class="siem-anomaly-count">${unexplainedCount}</span> unexplained anomalies</span>` : ''}
            ${explainedCount > 0 ? `<span style="color:#fdba74;">${explainedCount} explained</span>` : ''}
            ${filter ? `<span style="margin-left:auto;">filter: <code style="background:#1e293b; padding:1px 6px; border-radius:3px; color:#fda4af;">${this._escHtml(filter)}</code></span>` : '<span style="margin-left:auto;">no filter active</span>'}
        </div>
        <table class="siem-table">
            <thead><tr>
                <th>Timestamp (UTC)</th>
                <th>User</th>
                <th>Source IP</th>
                <th>Workstation</th>
                <th>Provenance</th>
            </tr></thead>
            <tbody>${rows}</tbody>
        </table>`;
    },

    _siemFirewallLog: function(filter) {
        const allEntries = [
            { ts: '2026-05-18 07:14:22', src: '10.0.4.30:52140',  dst: '8.8.8.8:53',          proto: 'UDP', bytes: '72',   action: 'ALLOW', note: '' },
            { ts: '2026-05-18 07:55:08', src: '10.0.4.6:52188',   dst: '10.0.0.1:80',          proto: 'TCP', bytes: '320',  action: 'ALLOW', note: '' },
            { ts: '2026-05-18 08:01:44', src: '10.0.4.22:49310',  dst: '52.86.14.93:443',      proto: 'TCP', bytes: '1840', action: 'ALLOW', note: '' },
            { ts: '2026-05-18 08:31:00', src: '10.0.4.14:51100',  dst: '52.96.111.12:443',     proto: 'TCP', bytes: '2048', action: 'ALLOW', note: '' },
            { ts: '2026-05-18 08:55:44', src: '10.0.4.18:51200',  dst: '8.8.8.8:53',          proto: 'UDP', bytes: '72',   action: 'ALLOW', note: '' },
            { ts: '2026-05-18 09:01:13', src: '10.0.4.6:52188',   dst: '10.0.0.1:80',          proto: 'TCP', bytes: '320',  action: 'ALLOW', note: '' },
            { ts: '2026-05-18 09:12:00', src: '10.0.4.18:51244',  dst: '8.8.8.8:53',          proto: 'UDP', bytes: '84',   action: 'ALLOW', note: 'DNS query: crimson-dawn-finance.net' },
            { ts: '2026-05-18 09:12:33', src: '10.0.4.18:51248',  dst: '8.8.8.8:53',          proto: 'UDP', bytes: '86',   action: 'ALLOW', note: 'DNS query: emberwolf-c2.duckdns.org' },
            { ts: '2026-05-18 09:13:01', src: '10.0.4.18:51302',  dst: '185.220.101.45:443',  proto: 'TCP', bytes: '4096', action: 'ALLOW', note: 'C2 HEARTBEAT -- Beacon connecting to attacker C2' },
            { ts: '2026-05-18 09:13:16', src: '10.0.4.18:51303',  dst: '185.220.101.45:443',  proto: 'TCP', bytes: '512',  action: 'ALLOW', note: 'C2 BEACON' },
            { ts: '2026-05-18 09:15:44', src: '10.0.4.6:52210',   dst: '10.0.1.5:8080',       proto: 'TCP', bytes: '1024', action: 'ALLOW', note: '' },
            { ts: '2026-05-18 09:22:18', src: '10.0.4.10:49800',  dst: '52.94.228.167:443',   proto: 'TCP', bytes: '2048', action: 'ALLOW', note: '' },
            { ts: '2026-05-18 09:30:05', src: '10.0.4.18:51380',  dst: '52.96.111.12:443',    proto: 'TCP', bytes: '1024', action: 'ALLOW', note: '' },
            { ts: '2026-05-18 09:40:05', src: '10.0.4.18:51400',  dst: '185.220.101.45:443',  proto: 'TCP', bytes: '8192', action: 'ALLOW', note: 'C2 EXFIL attempt -- large outbound transfer' },
            { ts: '2026-05-18 10:11:00', src: '10.0.4.18:51500',  dst: '185.220.101.45:443',  proto: 'TCP', bytes: '512',  action: 'ALLOW', note: 'C2 HEARTBEAT' },
            { ts: '2026-05-18 10:55:30', src: '10.0.4.6:52250',   dst: '8.8.4.4:53',          proto: 'UDP', bytes: '72',   action: 'ALLOW', note: '' },
            { ts: '2026-05-18 11:34:05', src: '10.0.4.6:52300',   dst: '8.8.8.8:53',          proto: 'UDP', bytes: '84',   action: 'ALLOW', note: 'DNS query: crimson-dawn-finance.net' },
            { ts: '2026-05-18 11:40:22', src: '10.0.4.6:52310',   dst: '10.0.0.1:80',         proto: 'TCP', bytes: '320',  action: 'ALLOW', note: '' },
            { ts: '2026-05-18 12:00:44', src: '10.0.4.18:51600',  dst: '185.220.101.45:443',  proto: 'TCP', bytes: '512',  action: 'ALLOW', note: 'C2 HEARTBEAT' },
            { ts: '2026-05-18 13:00:10', src: '10.0.4.30:52400',  dst: '8.8.8.8:53',          proto: 'UDP', bytes: '72',   action: 'ALLOW', note: '' },
            { ts: '2026-05-18 14:00:55', src: '10.0.4.18:51700',  dst: '185.220.101.45:443',  proto: 'TCP', bytes: '1024', action: 'ALLOW', note: 'C2 HEARTBEAT' },
            { ts: '2026-05-18 14:22:51', src: '10.0.4.22:51800',  dst: '8.8.8.8:53',          proto: 'UDP', bytes: '84',   action: 'ALLOW', note: 'DNS query: crimson-dawn-finance.net (s.patel workstation)' },
            { ts: '2026-05-18 15:10:05', src: '10.0.4.22:49900',  dst: '170.114.0.1:443',     proto: 'TCP', bytes: '2048', action: 'ALLOW', note: '' },
            { ts: '2026-05-18 16:00:18', src: '10.0.4.18:51800',  dst: '185.220.101.45:443',  proto: 'TCP', bytes: '512',  action: 'ALLOW', note: 'C2 HEARTBEAT' }
        ];

        const entries = filter ? allEntries.filter(e =>
            e.src.includes(filter) || e.dst.includes(filter) || e.note.toLowerCase().includes(filter)
        ) : allEntries;

        if (entries.length === 0) {
            return `<div class="siem-no-match">No firewall entries matched filter: <b>"${this._escHtml(filter)}"</b></div>`;
        }

        const c2Count = entries.filter(e => e.note.includes('C2')).length;
        const dnsCount = entries.filter(e => e.note.startsWith('DNS query:')).length;

        const rows = entries.map(e => {
            let badge = '<span style="color:#475569;">&mdash;</span>';
            let trClass = '';
            if (e.note.includes('C2')) {
                badge = `<span class="siem-badge crit">CRIT</span><span class="siem-flag-text">${e.note}</span>`;
                trClass = 'anomaly';
            } else if (e.note.startsWith('DNS query:')) {
                badge = `<span class="siem-badge info">DNS</span><span class="siem-flag-text" style="color:#cbd5e1;">${e.note.replace(/^DNS query:\s*/, '')}</span>`;
            }
            return `<tr class="${trClass}">
                <td class="siem-ts">${e.ts}</td>
                <td>${e.src}</td>
                <td class="siem-target">${e.dst}</td>
                <td>${e.proto}</td>
                <td>${e.bytes}</td>
                <td>${badge}</td>
            </tr>`;
        }).join('');

        return `<div class="siem-results-toolbar">
            <span><span class="siem-count">${entries.length}</span> events</span>
            ${c2Count > 0 ? `<span><span class="siem-anomaly-count">${c2Count}</span> C2 events</span>` : ''}
            ${dnsCount > 0 ? `<span style="color:#cbd5e1;">${dnsCount} DNS annotated</span>` : ''}
            ${filter ? `<span style="margin-left:auto;">filter: <code style="background:#1e293b; padding:1px 6px; border-radius:3px; color:#fda4af;">${this._escHtml(filter)}</code></span>` : '<span style="margin-left:auto;">no filter active</span>'}
        </div>
        <table class="siem-table">
            <thead><tr>
                <th>Timestamp (UTC)</th>
                <th>Source</th>
                <th>Destination</th>
                <th>Proto</th>
                <th>Bytes</th>
                <th>Severity / Note</th>
            </tr></thead>
            <tbody>${rows}</tbody>
        </table>`;
    },

    _renderPatchDashboard: function(engine) {
        const db = PISFinalConfig._db;
        const applied = db.patch_state.applied;

        const cves = [
            { id: 'CVE-2024-21412', title: 'Internet Shortcut Files Security Feature Bypass Vulnerability', severity: 'HIGH', score: '8.1', vector: 'AV:N/AC:H/PR:N/UI:R/S:U/C:H/I:H/A:H', kb: 'KB5034441', released: '2024-02-13', categories: ['Defender SmartScreen'] },
            { id: 'CVE-2022-30190', title: 'Microsoft Windows Support Diagnostic Tool (MSDT) Remote Code Execution Vulnerability ("Follina")', severity: 'CRITICAL', score: '7.8', vector: 'AV:L/AC:L/PR:N/UI:R/S:U/C:H/I:H/A:H', kb: 'KB5014699', released: '2022-06-14', categories: ['Office', 'MSDT', 'Active exploitation'] },
            { id: 'CVE-2024-26169', title: 'Windows Error Reporting Service Elevation of Privilege Vulnerability', severity: 'IMPORTANT', score: '7.8', vector: 'AV:L/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:H', kb: 'KB5036892', released: '2024-03-12', categories: ['WER'] }
        ];

        const outstanding = cves.filter(c => !applied.includes(c.id));
        const appliedList = cves.filter(c => applied.includes(c.id));

        // Severity → SCCM-style badge tone
        const sevToneFor = function(c) {
            if (c.id === 'CVE-2022-30190') return 'crit'; // matches incident
            if (c.severity === 'CRITICAL') return 'crit';
            if (c.severity === 'HIGH') return 'high';
            return 'med';
        };

        // Outstanding rows — SCCM Update Group style
        const outRows = outstanding.map(c => {
            const sev = sevToneFor(c);
            const catChips = c.categories.map(cat => '<span class="pm-cat-chip">' + cat + '</span>').join('');
            return `
            <tr class="pm-row pm-row-out">
                <td class="pm-td pm-td-cve">
                    <div class="pm-cve-id">${c.id}</div>
                    <div class="pm-cve-kb">${c.kb}</div>
                </td>
                <td class="pm-td pm-td-title">
                    <div class="pm-title">${c.title}</div>
                    <div class="pm-cats">${catChips}<span class="pm-released">Released ${c.released}</span></div>
                </td>
                <td class="pm-td pm-td-cvss">
                    <div class="pm-cvss-circle pm-cvss-${sev}">${c.score}</div>
                    <div class="pm-cvss-sev pm-cvss-sev-${sev}">${c.severity}</div>
                </td>
                <td class="pm-td pm-td-status">
                    <div class="pm-status pm-status-pending">
                        <span class="pm-status-dot"></span>Required
                    </div>
                    <div class="pm-status-sub">Not deployed</div>
                </td>
                <td class="pm-td pm-td-action">
                    <button class="pm-btn pm-btn-apply" data-action="apply_patch" data-cve="${c.id}">Deploy Update</button>
                </td>
            </tr>`;
        }).join('');

        // Applied rows — green deployed style
        const appliedRows = appliedList.map(c => {
            const isCorrect = c.id === 'CVE-2022-30190';
            const rowCls = isCorrect ? 'pm-row-applied-ok' : 'pm-row-applied-warn';
            const statusText = isCorrect ? 'Deployed &mdash; correct target' : 'Deployed &mdash; review';
            const statusCls = isCorrect ? 'pm-status-ok' : 'pm-status-warn';
            return `
            <tr class="pm-row ${rowCls}">
                <td class="pm-td pm-td-cve">
                    <div class="pm-cve-id ${isCorrect ? 'ok' : 'warn'}">${c.id}</div>
                    <div class="pm-cve-kb">${c.kb}</div>
                </td>
                <td class="pm-td pm-td-title">
                    <div class="pm-title">${c.title}</div>
                    <div class="pm-cats"><span class="pm-released">Deployed ${new Date().toISOString().slice(0, 10)}</span></div>
                </td>
                <td class="pm-td pm-td-cvss">
                    <div class="pm-cvss-circle pm-cvss-done">&#10003;</div>
                </td>
                <td class="pm-td pm-td-status">
                    <div class="pm-status ${statusCls}">
                        <span class="pm-status-dot"></span>${statusText}
                    </div>
                </td>
                <td class="pm-td pm-td-action">
                    <button class="pm-btn pm-btn-undo" data-action="undo_patch" data-cve="${c.id}">Undo / Re-evaluate</button>
                </td>
            </tr>`;
        }).join('');

        // Phase 6 completion gate — see comment in original
        const wrongPatchesStillApplied = applied.some(cve => cve !== 'CVE-2022-30190');
        const phaseComplete = applied.includes('CVE-2022-30190') &&
            !wrongPatchesStillApplied &&
            db.rapid7_scan_state.result === 'clean' &&
            db.mail_filter_state.active;

        // Compliance score calculation — % of required updates deployed correctly
        const compliancePct = outstanding.length === 0 && !wrongPatchesStillApplied
            ? 100
            : Math.round(((applied.length - (wrongPatchesStillApplied ? applied.filter(c => c !== 'CVE-2022-30190').length : 0)) / cves.length) * 100);

        const compositeBlock = phaseComplete ? `
            <div class="pm-composite">
                <div class="pm-comp-h">Containment + Remediation: COMPLETE</div>
                <div class="pm-comp-sub">All three Phase 6 actions completed correctly:</div>
                <div class="pm-comp-checks">
                    <div class="pm-comp-check">&#10003; CVE-2022-30190 patched (KB5014699 deployed)</div>
                    <div class="pm-comp-check">&#10003; Rapid7 InsightVM scan: CLEAN (Scan ID: S7K9P2)</div>
                    <div class="pm-comp-check">&#10003; Mail filter rule active (Proofpoint policy enforced)</div>
                </div>
                <div class="pm-comp-flag">
                    <div class="pm-comp-flag-h">Composite Flag</div>
                    <div class="pm-comp-flag-v">REMED-OK-S7K9P2</div>
                    <div class="pm-comp-flag-sub">Submit this as Flag 6</div>
                </div>
            </div>` : '';

        return `
            <style>
              .pm-shell { font-family: 'Segoe UI', system-ui, sans-serif; max-width: 1080px; margin: 18px auto; color: #1f2937; }
              .pm-shell .pm-header { background: linear-gradient(135deg, #0078d4 0%, #005a9e 100%); color: #fff; padding: 14px 22px; display: flex; align-items: center; gap: 14px; border-radius: 6px 6px 0 0; }
              .pm-shell .pm-logo { width: 38px; height: 38px; flex-shrink: 0; background: #fff; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: #0078d4; font-weight: 800; font-size: 0.7rem; }
              .pm-shell .pm-brand-org { font-size: 0.66rem; letter-spacing: 0.14em; text-transform: uppercase; opacity: 0.85; }
              .pm-shell .pm-brand-app { font-size: 1.05rem; font-weight: 700; margin-top: 1px; }
              .pm-shell .pm-host-info { margin-left: auto; text-align: right; font-size: 0.74rem; opacity: 0.92; line-height: 1.5; font-family: 'Cascadia Code', ui-monospace, monospace; }
              .pm-shell .pm-host-info b { color: #fff; font-weight: 600; }
              .pm-shell .pm-status-strip { background: #f3f4f6; border-left: 1px solid #e5e7eb; border-right: 1px solid #e5e7eb; padding: 12px 22px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; }
              @media (max-width: 760px) { .pm-shell .pm-status-strip { grid-template-columns: repeat(2, 1fr); } }
              .pm-shell .pm-status-tile-k { font-size: 0.62rem; letter-spacing: 0.12em; text-transform: uppercase; color: #6b7280; font-weight: 700; }
              .pm-shell .pm-status-tile-v { font-size: 1rem; font-weight: 700; color: #111827; margin-top: 3px; font-family: 'Cascadia Code', ui-monospace, monospace; }
              .pm-shell .pm-status-tile-v.crit { color: #b91c1c; }
              .pm-shell .pm-status-tile-v.ok { color: #15803d; }
              .pm-shell .pm-status-tile-v.warn { color: #c2410c; }
              .pm-shell .pm-section { background: #fff; border: 1px solid #e5e7eb; border-top: 0; padding: 16px 22px; }
              .pm-shell .pm-section-h { font-size: 0.82rem; font-weight: 700; color: #111827; margin-bottom: 6px; display: flex; align-items: center; gap: 8px; }
              .pm-shell .pm-section-h-count { background: #fee2e2; color: #b91c1c; padding: 1px 8px; border-radius: 10px; font-size: 0.72rem; font-weight: 700; }
              .pm-shell .pm-section-h-count.ok { background: #dcfce7; color: #15803d; }
              .pm-shell .pm-section-sub { font-size: 0.76rem; color: #6b7280; margin-bottom: 10px; }
              .pm-shell .pm-table { width: 100%; border-collapse: collapse; font-size: 0.8rem; }
              .pm-shell .pm-table thead th { background: #f9fafb; padding: 8px 12px; text-align: left; color: #4b5563; font-size: 0.66rem; letter-spacing: 0.1em; text-transform: uppercase; font-weight: 700; border-bottom: 2px solid #e5e7eb; }
              .pm-shell .pm-row { border-bottom: 1px solid #f3f4f6; }
              .pm-shell .pm-row:hover { background: #fafbfc; }
              .pm-shell .pm-row.pm-row-applied-ok { background: #f0fdf4; }
              .pm-shell .pm-row.pm-row-applied-warn { background: #fff7ed; }
              .pm-shell .pm-td { padding: 12px; vertical-align: middle; }
              .pm-shell .pm-td-cve { width: 130px; }
              .pm-shell .pm-cve-id { font-family: 'Cascadia Code', ui-monospace, monospace; font-size: 0.8rem; font-weight: 700; color: #dc2626; }
              .pm-shell .pm-cve-id.ok { color: #15803d; }
              .pm-shell .pm-cve-id.warn { color: #c2410c; }
              .pm-shell .pm-cve-kb { font-family: 'Cascadia Code', ui-monospace, monospace; font-size: 0.7rem; color: #6b7280; margin-top: 2px; }
              .pm-shell .pm-title { color: #111827; font-weight: 500; font-size: 0.82rem; line-height: 1.45; }
              .pm-shell .pm-cats { margin-top: 5px; }
              .pm-shell .pm-cat-chip { display: inline-block; padding: 1px 7px; background: #eff6ff; color: #1d4ed8; font-size: 0.66rem; border-radius: 3px; margin-right: 4px; border: 1px solid #dbeafe; }
              .pm-shell .pm-released { font-size: 0.66rem; color: #9ca3af; margin-left: 4px; }
              .pm-shell .pm-td-cvss { width: 80px; text-align: center; }
              .pm-shell .pm-cvss-circle { display: inline-block; width: 36px; height: 36px; border-radius: 50%; line-height: 32px; font-size: 0.8rem; font-weight: 800; font-family: 'Cascadia Code', ui-monospace, monospace; border: 2px solid; }
              .pm-shell .pm-cvss-circle.pm-cvss-crit { border-color: #dc2626; color: #dc2626; background: #fef2f2; }
              .pm-shell .pm-cvss-circle.pm-cvss-high { border-color: #ea580c; color: #ea580c; background: #fff7ed; }
              .pm-shell .pm-cvss-circle.pm-cvss-med { border-color: #ca8a04; color: #ca8a04; background: #fefce8; }
              .pm-shell .pm-cvss-circle.pm-cvss-done { border-color: #15803d; color: #15803d; background: #f0fdf4; line-height: 30px; font-size: 1rem; }
              .pm-shell .pm-cvss-sev { font-size: 0.62rem; letter-spacing: 0.08em; font-weight: 700; margin-top: 3px; }
              .pm-shell .pm-cvss-sev.pm-cvss-sev-crit { color: #dc2626; }
              .pm-shell .pm-cvss-sev.pm-cvss-sev-high { color: #ea580c; }
              .pm-shell .pm-cvss-sev.pm-cvss-sev-med { color: #ca8a04; }
              .pm-shell .pm-td-status { width: 170px; }
              .pm-shell .pm-status { font-size: 0.78rem; font-weight: 600; display: flex; align-items: center; gap: 6px; }
              .pm-shell .pm-status-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; }
              .pm-shell .pm-status-pending { color: #b91c1c; }
              .pm-shell .pm-status-pending .pm-status-dot { background: #dc2626; }
              .pm-shell .pm-status-ok { color: #15803d; }
              .pm-shell .pm-status-ok .pm-status-dot { background: #22c55e; }
              .pm-shell .pm-status-warn { color: #c2410c; }
              .pm-shell .pm-status-warn .pm-status-dot { background: #f97316; }
              .pm-shell .pm-status-sub { font-size: 0.7rem; color: #9ca3af; margin-top: 2px; }
              .pm-shell .pm-td-action { width: 150px; text-align: right; }
              .pm-shell .pm-btn { padding: 6px 14px; border: 1px solid transparent; border-radius: 3px; cursor: pointer; font-size: 0.76rem; font-weight: 600; font-family: inherit; }
              .pm-shell .pm-btn-apply { background: #0078d4; color: #fff; border-color: #005a9e; }
              .pm-shell .pm-btn-apply:hover { background: #005a9e; }
              .pm-shell .pm-btn-undo { background: #fff; color: #4b5563; border-color: #d1d5db; }
              .pm-shell .pm-btn-undo:hover { background: #f3f4f6; border-color: #9ca3af; }
              .pm-shell .pm-instruction { margin-top: 12px; padding: 10px 14px; background: #fff7ed; border-left: 4px solid #f97316; border-radius: 0 4px 4px 0; font-size: 0.78rem; color: #9a3412; line-height: 1.55; }
              .pm-shell .pm-instruction b { color: #7c2d12; }
              .pm-shell .pm-empty-ok { padding: 14px; color: #15803d; font-size: 0.84rem; font-weight: 600; text-align: center; background: #f0fdf4; border: 1px dashed #86efac; border-radius: 4px; }
              .pm-shell .pm-footer { background: #f9fafb; border: 1px solid #e5e7eb; border-top: 0; padding: 10px 22px; font-size: 0.76rem; color: #4b5563; border-radius: 0 0 6px 6px; }
              .pm-shell .pm-footer a { color: #0078d4; text-decoration: none; font-weight: 600; }
              .pm-shell .pm-footer a:hover { text-decoration: underline; }
              /* Composite block */
              .pm-shell .pm-composite { margin-top: 18px; padding: 18px 22px; background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border: 2px solid #16a34a; border-radius: 6px; }
              .pm-shell .pm-comp-h { font-size: 1rem; font-weight: 800; color: #15803d; margin-bottom: 6px; letter-spacing: 0.02em; }
              .pm-shell .pm-comp-sub { font-size: 0.82rem; color: #374151; margin-bottom: 10px; }
              .pm-shell .pm-comp-checks { margin-bottom: 14px; font-size: 0.78rem; color: #166534; line-height: 1.9; }
              .pm-shell .pm-comp-check { padding-left: 6px; }
              .pm-shell .pm-comp-flag { padding: 14px 18px; background: #fff; border: 2px solid #16a34a; border-radius: 6px; text-align: center; }
              .pm-shell .pm-comp-flag-h { font-size: 0.7rem; color: #6b7280; letter-spacing: 0.16em; text-transform: uppercase; margin-bottom: 6px; }
              .pm-shell .pm-comp-flag-v { font-size: 1.5rem; font-weight: 800; color: #15803d; font-family: 'Cascadia Code', ui-monospace, monospace; letter-spacing: 0.05em; }
              .pm-shell .pm-comp-flag-sub { font-size: 0.74rem; color: #6b7280; margin-top: 6px; }
            </style>
            <div class="pm-shell">
                <div class="pm-header">
                    <div class="pm-logo">CFM</div>
                    <div>
                        <div class="pm-brand-org">Crimson Dawn &middot; Configuration Manager</div>
                        <div class="pm-brand-app">Endpoint Compliance &mdash; Software Updates</div>
                    </div>
                    <div class="pm-host-info">
                        <div><b>WS-EMORALES-01</b></div>
                        <div>10.0.4.18 &middot; Windows 10 22H2 (19045.4291)</div>
                        <div>User: <b>e.morales</b> &middot; Domain: CRIMSON-DAWN</div>
                    </div>
                </div>
                <div class="pm-status-strip">
                    <div>
                        <div class="pm-status-tile-k">Outstanding</div>
                        <div class="pm-status-tile-v ${outstanding.length > 0 ? 'crit' : 'ok'}">${outstanding.length}</div>
                    </div>
                    <div>
                        <div class="pm-status-tile-k">Deployed (this session)</div>
                        <div class="pm-status-tile-v ${applied.length > 0 ? 'ok' : ''}">${applied.length}</div>
                    </div>
                    <div>
                        <div class="pm-status-tile-k">Compliance score</div>
                        <div class="pm-status-tile-v ${compliancePct === 100 ? 'ok' : (compliancePct >= 50 ? 'warn' : 'crit')}">${compliancePct}%</div>
                    </div>
                    <div>
                        <div class="pm-status-tile-k">Last sync</div>
                        <div class="pm-status-tile-v">${new Date().toISOString().slice(0, 16).replace('T', ' ')}</div>
                    </div>
                </div>
                <div class="pm-section">
                    <div class="pm-section-h">Outstanding Vulnerabilities <span class="pm-section-h-count ${outstanding.length === 0 ? 'ok' : ''}">${outstanding.length}</span></div>
                    <div class="pm-section-sub">Updates classified as <b>Security Update</b> and pending deployment to this host. Sorted by severity (highest first).</div>
                    ${outstanding.length > 0 ? `
                    <table class="pm-table">
                        <thead><tr>
                            <th>CVE / KB</th>
                            <th>Title</th>
                            <th>CVSS</th>
                            <th>Compliance</th>
                            <th></th>
                        </tr></thead>
                        <tbody>${outRows}</tbody>
                    </table>
                    <div class="pm-instruction"><b>Operator note:</b> Apply patches one at a time. Identify the exploited vulnerability from <b>Phase 2 hash analysis</b> first and deploy <b>that KB only</b>. Wrong patches will increase remediation time and count against the Eclipse score (-40 each).</div>
                    ` : '<div class="pm-empty-ok">No outstanding vulnerabilities. Validate with Rapid7 InsightVM scan.</div>'}
                </div>
                ${appliedList.length > 0 ? `
                <div class="pm-section">
                    <div class="pm-section-h">Recently Deployed <span class="pm-section-h-count ok">${appliedList.length}</span></div>
                    <div class="pm-section-sub">Updates deployed in the current remediation session.</div>
                    <table class="pm-table">
                        <thead><tr>
                            <th>CVE / KB</th>
                            <th>Title</th>
                            <th>Status</th>
                            <th>Compliance</th>
                            <th></th>
                        </tr></thead>
                        <tbody>${appliedRows}</tbody>
                    </table>
                </div>` : ''}
                <div class="pm-footer">
                    Next step after patching: validate with <a href="https://insightvm.crimson-dawn.net">Rapid7 InsightVM</a> scan, then activate the mail filter rule in <a href="https://mailadmin.crimson-dawn.net">Mail Admin</a>.
                </div>
                ${compositeBlock}
                <div data-results></div>
            </div>`;
    },

    _handlePatchAction: function(data, engine) {
        const db = PISFinalConfig._db;
        const cve = data.cve;
        const action = data.action;

        if (action === 'apply_patch' && cve) {
            if (db.patch_state.applied.includes(cve)) {
                return '<div style="color:#888; font-size:0.8rem; padding:8px;">This CVE has already been applied.</div>';
            }

            db.patch_state.applied.push(cve);
            db.rapid7_scan_state.ran = false; // Patch applied -- scan needs to be re-run
            db.rapid7_scan_state.result = null;

            if (cve === 'CVE-2022-30190') {
                return `<div style="padding:12px; background:#f0fff4; border:2px solid #2ecc71; border-radius:4px; font-size:0.82rem;">
                    <div style="font-weight:700; color:#2ecc71; margin-bottom:4px;">[Patch applied] CVE-2022-30190 -- Follina</div>
                    <div style="color:#555; font-size:0.78rem;">KB5014699 applied to WS-EMORALES-01. Validate with Rapid7 InsightVM scan at <a href="https://insightvm.crimson-dawn.net" style="color:#dc2626;">insightvm.crimson-dawn.net</a>.</div>
                </div>`;
            }

            // Wrong CVE applied
            const titles = { 'CVE-2024-21412': 'Internet Shortcut Files Security Feature Bypass Vulnerability', 'CVE-2024-26169': 'Windows Error Reporting Service Elevation of Privilege Vulnerability' };
            if (engine && engine.addScore) engine.addScore(-40, 'Wrong patch action (unrelated CVE)');
            return `<div style="padding:12px; background:#fff8f0; border:2px solid #e67e22; border-radius:4px; font-size:0.82rem;">
                <div style="font-weight:700; color:#e67e22; margin-bottom:4px;">[Patch applied] ${cve} -- ${titles[cve] || 'Unknown CVE'}</div>
                <div style="color:#555; font-size:0.78rem;">Status: PATCHED &middot; Applied ${new Date().toISOString().slice(0, 16).replace('T', ' ')} UTC</div>
                <div style="color:#dc2626; font-weight:700; margin-top:6px; font-size:0.78rem;">Penalty: -40 (wrong action for this incident)</div>
                <div style="color:#555; font-size:0.77rem; margin-top:6px;">
                    Note: This CVE is real but unrelated to the current incident.<br>
                    The exploited CVE was identified in Phase 2. To recover:<br>
                    &nbsp;&nbsp;&rarr; Click [Undo / Re-evaluate] on the "Recently Applied" row to revert.<br>
                    &nbsp;&nbsp;&rarr; Re-apply the correct CVE.<br>
                    &nbsp;&nbsp;&rarr; Each wrong attempt costs -40 (Eclipse scoring).
                </div>
            </div>`;
        }

        if (action === 'undo_patch' && cve) {
            const idx = db.patch_state.applied.indexOf(cve);
            if (idx > -1) {
                db.patch_state.applied.splice(idx, 1);
                db.rapid7_scan_state.ran = false;
                db.rapid7_scan_state.result = null;
                db.patch_state.undone.push(cve);
                return `<div style="padding:12px; background:#f8f8f8; border:1px solid #ddd; border-radius:4px; font-size:0.82rem;">
                    <div style="font-weight:700; color:#888; margin-bottom:4px;">[Undo confirmed] ${cve} -- reverted to outstanding</div>
                    <div style="color:#555; font-size:0.78rem;">Status: Patch state restored to pre-application.</div>
                    <div style="color:#555; font-size:0.77rem; margin-top:6px;">You may now select a different CVE to patch.<br>(Undo itself is free; the -40 penalty for the original wrong action remains.)</div>
                </div>`;
            }
            return '<div style="color:#888; font-size:0.8rem; padding:8px;">Nothing to undo -- CVE not in applied list.</div>';
        }

        return '<div style="color:#888; font-size:0.8rem; padding:8px;">Unknown action.</div>';
    },

    _renderInsightVM: function(engine) {
        const db = PISFinalConfig._db;
        const scanResult = db.rapid7_scan_state.result;
        const scanId = db.rapid7_scan_state.scan_id || '';

        let resultBlock = '';
        if (scanResult === 'clean') {
            resultBlock = `
            <div class="r7-result r7-result-clean">
                <div class="r7-result-head">
                    <div class="r7-risk-circle r7-risk-zero">0</div>
                    <div class="r7-result-meta">
                        <div class="r7-result-verdict">No risk &mdash; Asset compliant</div>
                        <div class="r7-result-sub">All previously detected vulnerabilities have been remediated</div>
                    </div>
                    <div class="r7-result-scanid">
                        <div class="r7-result-scanid-k">Scan ID</div>
                        <div class="r7-result-scanid-v">S7K9P2</div>
                    </div>
                </div>
                <div class="r7-result-body">
                    <table class="r7-result-table">
                        <tr><td class="r7-rt-k">Scan target</td><td class="r7-rt-v">WS-EMORALES-01 (10.0.4.18)</td></tr>
                        <tr><td class="r7-rt-k">Template</td><td class="r7-rt-v">Full audit, enhanced authenticated</td></tr>
                        <tr><td class="r7-rt-k">Scan engine</td><td class="r7-rt-v">SE-Crimson-01 (East-1)</td></tr>
                        <tr><td class="r7-rt-k">Started</td><td class="r7-rt-v">${new Date(Date.now() - 4*60*1000).toISOString().slice(0, 16).replace('T', ' ')} UTC</td></tr>
                        <tr><td class="r7-rt-k">Completed</td><td class="r7-rt-v">${new Date().toISOString().slice(0, 16).replace('T', ' ')} UTC</td></tr>
                        <tr><td class="r7-rt-k">Duration</td><td class="r7-rt-v">4m 12s</td></tr>
                        <tr><td class="r7-rt-k">Checks executed</td><td class="r7-rt-v">14,247</td></tr>
                    </table>
                    <div class="r7-result-remed">
                        <div class="r7-result-remed-h">Previously detected &middot; Now remediated</div>
                        <div class="r7-remed-item r7-remed-item-ok">
                            <span class="r7-remed-cve">CVE-2022-30190</span>
                            <span class="r7-remed-title">MSDT Remote Code Execution (Follina)</span>
                            <span class="r7-remed-badge">Remediated</span>
                        </div>
                    </div>
                    <div class="r7-result-next">Workstation WS-EMORALES-01 cleared. Proceed to the <a href="https://mailadmin.crimson-dawn.net">mail filter rule</a> step to close the attack vector.</div>
                </div>
            </div>`;
        } else if (scanResult === 'vulnerable') {
            resultBlock = `
            <div class="r7-result r7-result-vuln">
                <div class="r7-result-head">
                    <div class="r7-risk-circle r7-risk-crit">!</div>
                    <div class="r7-result-meta">
                        <div class="r7-result-verdict">Critical vulnerability detected</div>
                        <div class="r7-result-sub">Asset exposes 1 actively exploited vulnerability</div>
                    </div>
                </div>
                <div class="r7-result-body">
                    <div class="r7-result-remed">
                        <div class="r7-remed-item r7-remed-item-crit">
                            <span class="r7-remed-cve">CVE-2022-30190</span>
                            <span class="r7-remed-title">MSDT Remote Code Execution (Follina) &mdash; STILL EXPLOITABLE</span>
                            <span class="r7-remed-badge crit">CVSS 7.8</span>
                        </div>
                    </div>
                    <div class="r7-result-next r7-result-next-warn">Patch the correct vulnerability (<b>CVE-2022-30190</b>) via the <a href="https://patch.crimson-dawn.net">Patch Management console</a> and re-scan.</div>
                </div>
            </div>`;
        } else if (scanResult === 'wrong_patch') {
            resultBlock = `
            <div class="r7-result r7-result-vuln">
                <div class="r7-result-head">
                    <div class="r7-risk-circle r7-risk-crit">!</div>
                    <div class="r7-result-meta">
                        <div class="r7-result-verdict">Non-compliant &mdash; extraneous patches applied</div>
                        <div class="r7-result-sub">Workstation patched outside the IR runbook scope</div>
                    </div>
                </div>
                <div class="r7-result-body">
                    <div class="r7-result-remed">
                        <div class="r7-remed-item r7-remed-item-crit">
                            <span class="r7-remed-cve">CVE-2022-30190</span>
                            <span class="r7-remed-title">MSDT Remote Code Execution (Follina) &mdash; STILL EXPLOITABLE</span>
                            <span class="r7-remed-badge crit">CVSS 7.8</span>
                        </div>
                    </div>
                    <div class="r7-result-next r7-result-next-warn">Wrong patch detected. Undo the incorrectly-applied patch in the <a href="https://patch.crimson-dawn.net">Patch Management console</a>, then apply <b>CVE-2022-30190</b> and re-scan.</div>
                </div>
            </div>`;
        }

        return `
            <style>
              .r7-shell { font-family: 'Inter', system-ui, sans-serif; max-width: 1040px; margin: 18px auto; color: #1f2937; background: #f7fafc; min-height: calc(100vh - 36px); padding: 0; }
              .r7-shell .r7-header { background: #fff; border-bottom: 1px solid #e2e8f0; padding: 16px 26px; display: flex; align-items: center; gap: 14px; }
              .r7-shell .r7-logo { width: 38px; height: 38px; background: #ff1f1f; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 800; font-size: 0.78rem; letter-spacing: 0.04em; }
              .r7-shell .r7-brand-org { font-size: 0.66rem; letter-spacing: 0.14em; text-transform: uppercase; color: #6b7280; }
              .r7-shell .r7-brand-app { font-size: 1.05rem; font-weight: 700; color: #111827; margin-top: 1px; }
              .r7-shell .r7-version { margin-left: auto; display: flex; gap: 22px; font-size: 0.7rem; color: #6b7280; }
              .r7-shell .r7-version-v { color: #111827; font-weight: 600; }
              .r7-shell .r7-nav { background: #fff; padding: 0 26px; display: flex; gap: 0; border-bottom: 1px solid #e2e8f0; }
              .r7-shell .r7-nav-item { padding: 10px 16px; font-size: 0.78rem; color: #6b7280; border-bottom: 2px solid transparent; cursor: default; }
              .r7-shell .r7-nav-item.active { color: #ff1f1f; border-bottom-color: #ff1f1f; font-weight: 600; }
              .r7-shell .r7-content { padding: 22px 26px; }
              .r7-shell .r7-asset-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 18px 22px; margin-bottom: 16px; }
              .r7-shell .r7-asset-head { display: flex; align-items: center; gap: 14px; margin-bottom: 12px; }
              .r7-shell .r7-asset-icon { width: 42px; height: 42px; background: #0f172a; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 1.1rem; font-weight: 700; }
              .r7-shell .r7-asset-name { font-size: 1.1rem; font-weight: 700; color: #111827; font-family: 'JetBrains Mono', ui-monospace, monospace; }
              .r7-shell .r7-asset-meta { font-size: 0.72rem; color: #6b7280; margin-top: 2px; }
              .r7-shell .r7-asset-agent { margin-left: auto; display: flex; align-items: center; gap: 8px; padding: 6px 12px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 16px; }
              .r7-shell .r7-asset-agent-dot { width: 8px; height: 8px; background: #22c55e; border-radius: 50%; box-shadow: 0 0 6px #22c55e; }
              .r7-shell .r7-asset-agent-text { font-size: 0.72rem; color: #15803d; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; }
              .r7-shell .r7-asset-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; border-top: 1px solid #f1f5f9; padding-top: 12px; }
              @media (max-width: 760px) { .r7-shell .r7-asset-grid { grid-template-columns: repeat(2, 1fr); } }
              .r7-shell .r7-asset-k { font-size: 0.62rem; letter-spacing: 0.1em; text-transform: uppercase; color: #6b7280; font-weight: 700; }
              .r7-shell .r7-asset-v { font-size: 0.84rem; font-weight: 600; color: #111827; margin-top: 3px; font-family: 'JetBrains Mono', ui-monospace, monospace; }
              .r7-shell .r7-scan-launch { background: #fff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 18px 22px; margin-bottom: 16px; display: flex; align-items: center; gap: 18px; }
              .r7-shell .r7-scan-template { flex: 1; }
              .r7-shell .r7-scan-template-h { font-size: 0.66rem; letter-spacing: 0.1em; text-transform: uppercase; color: #6b7280; font-weight: 700; }
              .r7-shell .r7-scan-template-v { font-size: 0.92rem; font-weight: 700; color: #111827; margin-top: 4px; }
              .r7-shell .r7-scan-template-sub { font-size: 0.74rem; color: #6b7280; margin-top: 4px; }
              .r7-shell .r7-scan-btn { padding: 12px 28px; background: #ff1f1f; color: #fff; border: 0; border-radius: 4px; font-weight: 700; cursor: pointer; font-size: 0.88rem; font-family: inherit; letter-spacing: 0.02em; }
              .r7-shell .r7-scan-btn:hover { background: #dc1616; }
              /* Result block */
              .r7-shell .r7-result { background: #fff; border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden; }
              .r7-shell .r7-result-clean { border-color: #16a34a; }
              .r7-shell .r7-result-vuln { border-color: #dc2626; }
              .r7-shell .r7-result-head { padding: 18px 22px; display: flex; align-items: center; gap: 18px; }
              .r7-shell .r7-result-clean .r7-result-head { background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-bottom: 1px solid #bbf7d0; }
              .r7-shell .r7-result-vuln .r7-result-head { background: linear-gradient(135deg, #fef2f2 0%, #fecaca 100%); border-bottom: 1px solid #fca5a5; }
              .r7-shell .r7-risk-circle { width: 56px; height: 56px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.6rem; font-family: 'JetBrains Mono', ui-monospace, monospace; color: #fff; }
              .r7-shell .r7-risk-zero { background: #16a34a; }
              .r7-shell .r7-risk-crit { background: #dc2626; }
              .r7-shell .r7-result-meta { flex: 1; }
              .r7-shell .r7-result-verdict { font-size: 1.05rem; font-weight: 700; color: #111827; }
              .r7-shell .r7-result-sub { font-size: 0.8rem; color: #4b5563; margin-top: 4px; }
              .r7-shell .r7-result-scanid { text-align: right; padding-left: 12px; border-left: 1px solid #bbf7d0; }
              .r7-shell .r7-result-scanid-k { font-size: 0.66rem; letter-spacing: 0.1em; text-transform: uppercase; color: #6b7280; font-weight: 700; }
              .r7-shell .r7-result-scanid-v { font-size: 1rem; font-weight: 800; color: #111827; font-family: 'JetBrains Mono', ui-monospace, monospace; margin-top: 3px; letter-spacing: 0.05em; }
              .r7-shell .r7-result-body { padding: 16px 22px; background: #fff; }
              .r7-shell .r7-result-table { width: 100%; border-collapse: collapse; font-size: 0.78rem; margin-bottom: 14px; }
              .r7-shell .r7-result-table td { padding: 5px 0; vertical-align: top; }
              .r7-shell .r7-rt-k { color: #6b7280; width: 160px; font-size: 0.72rem; letter-spacing: 0.04em; }
              .r7-shell .r7-rt-v { color: #111827; font-weight: 600; font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 0.78rem; }
              .r7-shell .r7-result-remed { border-top: 1px solid #f1f5f9; padding-top: 12px; margin-top: 4px; }
              .r7-shell .r7-result-remed-h { font-size: 0.66rem; letter-spacing: 0.1em; text-transform: uppercase; color: #6b7280; font-weight: 700; margin-bottom: 8px; }
              .r7-shell .r7-remed-item { padding: 10px 14px; border-radius: 4px; display: flex; align-items: center; gap: 12px; font-size: 0.82rem; }
              .r7-shell .r7-remed-item-ok { background: #f0fdf4; border: 1px solid #bbf7d0; }
              .r7-shell .r7-remed-item-crit { background: #fef2f2; border: 1px solid #fecaca; }
              .r7-shell .r7-remed-cve { font-family: 'JetBrains Mono', ui-monospace, monospace; font-weight: 700; color: #111827; }
              .r7-shell .r7-remed-title { flex: 1; color: #374151; }
              .r7-shell .r7-remed-badge { padding: 3px 10px; border-radius: 4px; font-size: 0.7rem; font-weight: 700; background: #22c55e; color: #fff; letter-spacing: 0.04em; }
              .r7-shell .r7-remed-badge.crit { background: #dc2626; }
              .r7-shell .r7-result-next { margin-top: 14px; padding: 10px 14px; background: #f0f9ff; border-left: 4px solid #0ea5e9; border-radius: 0 4px 4px 0; font-size: 0.8rem; color: #0c4a6e; line-height: 1.6; }
              .r7-shell .r7-result-next.r7-result-next-warn { background: #fef3c7; border-left-color: #f59e0b; color: #78350f; }
              .r7-shell .r7-result-next a { color: #0369a1; font-weight: 700; text-decoration: none; }
              .r7-shell .r7-result-next a:hover { text-decoration: underline; }
              .r7-shell .r7-result-next-warn a { color: #92400e; }
            </style>
            <div class="r7-shell">
                <div class="r7-header">
                    <div class="r7-logo">R7</div>
                    <div>
                        <div class="r7-brand-org">Rapid7 InsightVM &middot; Crimson Dawn</div>
                        <div class="r7-brand-app">Vulnerability Management &mdash; Authenticated Asset Scan</div>
                    </div>
                    <div class="r7-version">
                        <div>Engine <span class="r7-version-v">v6.6.218</span></div>
                        <div>Console <span class="r7-version-v">cd-vm-01</span></div>
                    </div>
                </div>
                <div class="r7-nav">
                    <div class="r7-nav-item active">Assets</div>
                    <div class="r7-nav-item">Vulnerabilities</div>
                    <div class="r7-nav-item">Scan Templates</div>
                    <div class="r7-nav-item">Reports</div>
                    <div class="r7-nav-item">Policy</div>
                </div>
                <div class="r7-content">
                    <div class="r7-asset-card">
                        <div class="r7-asset-head">
                            <div class="r7-asset-icon">&#x2630;</div>
                            <div>
                                <div class="r7-asset-name">WS-EMORALES-01</div>
                                <div class="r7-asset-meta">Asset Group: Accounts Payable &middot; Last assessed 2026-05-19</div>
                            </div>
                            <div class="r7-asset-agent">
                                <span class="r7-asset-agent-dot"></span>
                                <span class="r7-asset-agent-text">Insight Agent Connected</span>
                            </div>
                        </div>
                        <div class="r7-asset-grid">
                            <div>
                                <div class="r7-asset-k">IP Address</div>
                                <div class="r7-asset-v">10.0.4.18</div>
                            </div>
                            <div>
                                <div class="r7-asset-k">Operating System</div>
                                <div class="r7-asset-v">Windows 10 22H2</div>
                            </div>
                            <div>
                                <div class="r7-asset-k">Build</div>
                                <div class="r7-asset-v">19045.4651</div>
                            </div>
                            <div>
                                <div class="r7-asset-k">Risk Score (prior)</div>
                                <div class="r7-asset-v" style="color:#dc2626;">847 / 1000</div>
                            </div>
                        </div>
                    </div>
                    <div class="r7-scan-launch">
                        <div class="r7-scan-template">
                            <div class="r7-scan-template-h">Scan Template</div>
                            <div class="r7-scan-template-v">Full audit, enhanced authenticated</div>
                            <div class="r7-scan-template-sub">14,247 checks &middot; CVSSv3 base scoring &middot; Insight Agent + authenticated WinRM</div>
                        </div>
                        <button class="r7-scan-btn" data-action="run_scan">Run Vulnerability Scan</button>
                    </div>
                    ${resultBlock}
                    <div data-results></div>
                </div>
            </div>`;
    },

    _handleInsightVMScan: function(data, engine) {
        const db = PISFinalConfig._db;
        const applied = db.patch_state.applied;
        const correctOnly = applied.includes('CVE-2022-30190') &&
            !applied.includes('CVE-2024-21412') &&
            !applied.includes('CVE-2024-26169');
        const wrongOnly = !applied.includes('CVE-2022-30190') && applied.length > 0;
        const mixedCoApplied = applied.includes('CVE-2022-30190') &&
            (applied.includes('CVE-2024-21412') || applied.includes('CVE-2024-26169'));

        // Rapid7-styled result card emitter (matches _renderInsightVM chrome)
        var emit = function(kind, verdict, sub, body) {
            var cls = kind === 'clean' ? 'r7-result-clean' : 'r7-result-vuln';
            var circle = kind === 'clean'
                ? '<div class="r7-risk-circle r7-risk-zero">0</div>'
                : '<div class="r7-risk-circle r7-risk-crit">!</div>';
            var scanIdBlock = kind === 'clean'
                ? '<div class="r7-result-scanid"><div class="r7-result-scanid-k">Scan ID</div><div class="r7-result-scanid-v">S7K9P2</div></div>'
                : '';
            return '<div class="r7-result ' + cls + '" style="margin-top:14px;">' +
                '<div class="r7-result-head">' + circle +
                    '<div class="r7-result-meta">' +
                        '<div class="r7-result-verdict">' + verdict + '</div>' +
                        '<div class="r7-result-sub">' + sub + '</div>' +
                    '</div>' + scanIdBlock +
                '</div>' +
                '<div class="r7-result-body">' + body + '</div>' +
            '</div>';
        };

        // Nancy round 3 BLOCK fix: scan returns CLEAN only when correct patch
        // is the ONLY applied patch. Co-applied wrong patches make the host
        // non-compliant -- the IR loop requires identifying the exploited CVE
        // and patching THAT one, not bulk-patching everything.
        if (correctOnly) {
            db.rapid7_scan_state.ran = true;
            db.rapid7_scan_state.result = 'clean';
            db.rapid7_scan_state.scan_id = 'S7K9P2';
            return emit('clean',
                'No risk &mdash; Asset compliant',
                'SCAN RESULT: CLEAN &middot; All previously detected vulnerabilities remediated',
                '<table class="r7-result-table">' +
                    '<tr><td class="r7-rt-k">Scan target</td><td class="r7-rt-v">WS-EMORALES-01 (10.0.4.18)</td></tr>' +
                    '<tr><td class="r7-rt-k">Template</td><td class="r7-rt-v">Full audit, enhanced authenticated</td></tr>' +
                    '<tr><td class="r7-rt-k">Scan engine</td><td class="r7-rt-v">SE-Crimson-01 (East-1)</td></tr>' +
                    '<tr><td class="r7-rt-k">Completed</td><td class="r7-rt-v">' + new Date().toISOString().slice(0, 16).replace('T', ' ') + ' UTC</td></tr>' +
                    '<tr><td class="r7-rt-k">Duration</td><td class="r7-rt-v">4m 12s</td></tr>' +
                    '<tr><td class="r7-rt-k">Checks executed</td><td class="r7-rt-v">14,247</td></tr>' +
                '</table>' +
                '<div class="r7-result-remed">' +
                    '<div class="r7-result-remed-h">Previously detected &middot; Now remediated</div>' +
                    '<div class="r7-remed-item r7-remed-item-ok">' +
                        '<span class="r7-remed-cve">CVE-2022-30190</span>' +
                        '<span class="r7-remed-title">MSDT Remote Code Execution (Follina) &mdash; REMEDIATED</span>' +
                        '<span class="r7-remed-badge">Remediated</span>' +
                    '</div>' +
                '</div>' +
                '<div class="r7-result-next">Workstation <b>WS-EMORALES-01</b> cleared. Proceed to mail filter step at <a href="https://mailadmin.crimson-dawn.net">mailadmin.crimson-dawn.net</a>.</div>'
            );
        }

        if (mixedCoApplied) {
            db.rapid7_scan_state.ran = true;
            db.rapid7_scan_state.result = 'wrong_patch';
            db.rapid7_scan_state.scan_id = null;
            const wrongPatches = applied.filter(c => c !== 'CVE-2022-30190');
            return emit('vuln',
                'Non-compliant &mdash; extraneous patches applied',
                'SCAN RESULT: CVE-2022-30190 (Follina) STILL EXPLOITABLE in IR runbook context',
                '<div class="r7-result-remed">' +
                    '<div class="r7-remed-item r7-remed-item-ok" style="margin-bottom:8px;">' +
                        '<span class="r7-remed-cve">CVE-2022-30190</span>' +
                        '<span class="r7-remed-title">MSDT RCE (Follina) &mdash; REMEDIATED</span>' +
                        '<span class="r7-remed-badge">Patched</span>' +
                    '</div>' +
                    '<div class="r7-remed-item r7-remed-item-crit">' +
                        '<span class="r7-remed-cve">' + wrongPatches.join(', ') + '</span>' +
                        '<span class="r7-remed-title">Extraneous patches &mdash; outside IR runbook scope</span>' +
                        '<span class="r7-remed-badge crit">Non-compliant</span>' +
                    '</div>' +
                '</div>' +
                '<div class="r7-result-next r7-result-next-warn">Crimson Dawn IR runbook requires patching only the exploited CVE during active response &mdash; preserves root-cause evidence and avoids masking other vulnerabilities. Undo the unrelated patches via <a href="https://patch.crimson-dawn.net">Patch Management</a> and re-scan.</div>'
            );
        }

        if (wrongOnly) {
            db.rapid7_scan_state.ran = true;
            db.rapid7_scan_state.result = 'wrong_patch';
            db.rapid7_scan_state.scan_id = null;
            return emit('vuln',
                'Critical vulnerability detected',
                'SCAN RESULT: VULNERABILITY DETECTED &middot; Wrong patches do not address the exploited CVE',
                '<div class="r7-result-remed">' +
                    '<div class="r7-remed-item r7-remed-item-crit">' +
                        '<span class="r7-remed-cve">CVE-2022-30190</span>' +
                        '<span class="r7-remed-title">MSDT Remote Code Execution (Follina) &mdash; STILL EXPLOITABLE</span>' +
                        '<span class="r7-remed-badge crit">CVSS 7.8</span>' +
                    '</div>' +
                '</div>' +
                '<div class="r7-result-next r7-result-next-warn">Patch the correct vulnerability and re-scan. Re-identify the exploited CVE from <b>Phase 2 hash analysis</b>, then deploy that KB via <a href="https://patch.crimson-dawn.net">Patch Management</a>.</div>'
            );
        }

        db.rapid7_scan_state.ran = true;
        db.rapid7_scan_state.result = 'vulnerable';
        db.rapid7_scan_state.scan_id = null;
        return emit('vuln',
            'Critical vulnerability detected',
            'SCAN RESULT: VULNERABILITY DETECTED &middot; No remediation applied',
            '<div class="r7-result-remed">' +
                '<div class="r7-remed-item r7-remed-item-crit">' +
                    '<span class="r7-remed-cve">CVE-2022-30190</span>' +
                    '<span class="r7-remed-title">MSDT Remote Code Execution (Follina) &mdash; STILL EXPLOITABLE</span>' +
                    '<span class="r7-remed-badge crit">CVSS 7.8</span>' +
                '</div>' +
            '</div>' +
            '<div class="r7-result-next r7-result-next-warn">No patches applied. Open <a href="https://patch.crimson-dawn.net">Patch Management</a> and apply the exploited CVE identified in Phase 2.</div>'
        );
    },

    _renderMailAdmin: function(engine) {
        const db = PISFinalConfig._db;
        const active = db.mail_filter_state.active;

        const activeBlock = active ? `
            <div style="margin-bottom:14px; padding:12px; background:#f0fff4; border:2px solid #2ecc71; border-radius:4px;">
                <div style="font-size:0.85rem; font-weight:700; color:#2ecc71; margin-bottom:4px;">Active Filter Rule</div>
                <div style="font-size:0.8rem; color:#555;">Scope: ${db.mail_filter_state.rule}</div>
                <button data-action="remove_filter" style="margin-top:8px; padding:4px 10px; background:#888; color:#fff; border:none; border-radius:3px; cursor:pointer; font-size:0.75rem; font-family:inherit;">Remove Rule</button>
            </div>` : '';

        return `<div style="font-family:system-ui,sans-serif; max-width:720px; margin:0 auto; padding:16px;">
            <div style="border-bottom:2px solid #dc2626; padding-bottom:10px; margin-bottom:16px;">
                <div style="font-size:0.72rem; color:#888; letter-spacing:0.1em; text-transform:uppercase;">CRIMSON DAWN -- MAIL ADMIN CONSOLE</div>
                <div style="font-size:1rem; font-weight:700; color:#222; margin-top:2px;">Add Mail Filter Rule</div>
                <div style="font-size:0.72rem; color:#888;">Inbound mail filter &middot; accounts@crimson-dawn.net</div>
            </div>
            ${activeBlock}
            <div style="padding:12px; background:#f8f8f8; border:1px solid #ddd; border-radius:4px; margin-bottom:12px;">
                <div style="font-size:0.8rem; font-weight:700; margin-bottom:8px;">Block by:</div>
                <div style="margin-bottom:8px;">
                    <label style="font-size:0.8rem; display:block; margin-bottom:4px;">Filter type:</label>
                    <select data-field="filter_type" style="width:100%; padding:7px 10px; border:1px solid #ccc; border-radius:4px; font-family:inherit; font-size:0.82rem;">
                        <option value="">-- select scope --</option>
                        <option value="sender_email">Sender email address</option>
                        <option value="sender_domain">Sender domain</option>
                        <option value="reply_to">Reply-To header pattern</option>
                        <option value="subject_keyword">Subject keyword</option>
                        <option value="source_tld">Source TLD (e.g. *.net, *.xyz)</option>
                    </select>
                </div>
                <div style="margin-bottom:8px;">
                    <label style="font-size:0.8rem; display:block; margin-bottom:4px;">Pattern value:</label>
                    <input type="text" data-field="filter_value" placeholder="e.g. nakamura-suppliers-corp.com"
                           style="width:100%; padding:7px 10px; border:1px solid #ccc; border-radius:4px; font-family:inherit; font-size:0.82rem; box-sizing:border-box;">
                </div>
                <div style="margin-bottom:12px; padding:8px; background:#fff8f0; border:1px solid #e67e22; border-radius:3px; font-size:0.77rem; color:#e67e22;">
                    <b>WARNING:</b> Overly broad filters can block legitimate mail.<br>
                    Recommended scope: narrowest pattern that catches THIS attack.
                </div>
                <button data-action="add_filter" style="padding:8px 18px; background:#dc2626; color:#fff; border:none; border-radius:4px; font-weight:700; cursor:pointer; font-family:inherit; font-size:0.82rem;">Add Rule</button>
            </div>
            <div data-results></div>
        </div>`;
    },

    _handleMailFilter: function(data, engine) {
        const db = PISFinalConfig._db;
        const type = data.filter_type || '';
        const val = (data.filter_value || '').trim().toLowerCase();

        if (data.action === 'remove_filter') {
            db.mail_filter_state.active = false;
            db.mail_filter_state.rule = null;
            return '<div style="color:#888; font-size:0.8rem; padding:8px;">Filter rule removed.</div>';
        }

        if (!type || !val) {
            return '<div style="color:#888; font-size:0.8rem; padding:8px;">Select a filter type and enter a pattern value.</div>';
        }

        // Rejected scopes
        if (type === 'source_tld' && val.includes('.net')) {
            return `<div style="padding:10px; background:#fff0f0; border:1px solid #dc2626; border-radius:4px; font-size:0.8rem; color:#dc2626;">
                <b>Filter rejected:</b> pattern would block 38% of legitimate vendor mail.<br>
                Vendors operating on .net TLDs in the last 30 days: 47 unique senders.<br>
                <span style="color:#555; font-size:0.77rem;">Narrow the scope: try Reply-To pattern, Message-ID host, or specific sender domain.</span>
            </div>`;
        }

        if (type === 'subject_keyword' && (val.includes('invoice') || val === 'corrected' || val === 'invoice')) {
            return `<div style="padding:10px; background:#fff0f0; border:1px solid #dc2626; border-radius:4px; font-size:0.8rem; color:#dc2626;">
                <b>Filter rejected:</b> Subject keyword "invoice" would block 100% of legitimate vendor invoices.<br>
                <span style="color:#555; font-size:0.77rem;">Scope must isolate the attacker pattern without collateral damage.</span>
            </div>`;
        }

        if (type === 'sender_domain' && val === 'nakamura-supplies.com') {
            return `<div style="padding:10px; background:#fff0f0; border:1px solid #dc2626; border-radius:4px; font-size:0.8rem; color:#dc2626;">
                <b>Filter rejected:</b> nakamura-supplies.com is the legitimate vendor's real domain.<br>
                Filtering this would block all future legitimate invoices from this vendor.<br>
                <span style="color:#555; font-size:0.77rem;">The attacker used nakamura-suppliers-corp.com (different domain) in the Reply-To, not in the From.</span>
            </div>`;
        }

        // Accepted correct scopes
        const isCorrect =
            (type === 'reply_to' && (val.includes('nakamura-suppliers-corp.com'))) ||
            (type === 'sender_domain' && val === 'crimson-dawn-finance.net') ||
            (type === 'sender_email' && val.includes('crimson-dawn-finance.net'));

        if (isCorrect) {
            db.mail_filter_state.active = true;
            db.mail_filter_state.rule = `${type} = ${data.filter_value}`;
            return `<div style="padding:10px; background:#f0fff4; border:2px solid #2ecc71; border-radius:4px; font-size:0.8rem; color:#2ecc71;">
                <b>Filter rule accepted.</b> Mail matching this pattern will be quarantined.<br>
                <span style="color:#555; font-size:0.77rem;">This scope correctly isolates the attacker's pattern without blocking legitimate vendor mail.<br>
                Check <a href="https://patch.crimson-dawn.net" style="color:#dc2626;">Patch Management</a> to see if Phase 6 composite flag is now available.</span>
            </div>`;
        }

        // Generic accepted-but-wrong-scope scopes
        return `<div style="padding:10px; background:#fff8f0; border:1px solid #e67e22; border-radius:4px; font-size:0.8rem; color:#e67e22;">
            <b>Filter not accepted for this incident.</b><br>
            The scope "${type} = ${this._escHtml(data.filter_value)}" does not precisely target the attack vector.<br>
            <span style="color:#555; font-size:0.77rem;">Review Phase 1 headers: the attacker-controlled indicators are the Reply-To domain (nakamura-suppliers-corp.com), the Message-ID host, and the Sender domain crimson-dawn-finance.net.</span>
        </div>`;
    },

    // Utility: HTML escape for user-supplied strings rendered in form outputs
    _escHtml: function(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    },

    // =========================================================
    // FLAGS
    // =========================================================

    flags: [
        {
            id: 'flag1',
            value: '<F1F2A4E8.20260518123045@crimson-dawn-finance.net>',
            label: 'Phase 1 -- Inbox Triage: Real Phishing Email Identified',
            description: 'The Message-ID of the real phishing email (Message 4). Message-ID host is crimson-dawn-finance.net, not the claimed sender nakamura-supplies.com. Angle brackets are part of the canonical Message-ID per RFC 5322 §3.6.4.',
            points: 200,
            autoCheck: false
        },
        {
            id: 'flag2',
            value: 'COBALT_STRIKE:CVE-2022-30190',
            label: 'Phase 2 -- Payload ID: Malware Family + CVE',
            description: 'The malware family (Cobalt Strike Beacon, normalized to COBALT_STRIKE) combined with the exploited CVE (CVE-2022-30190, Follina). Colon-separated.',
            points: 200,
            autoCheck: false
        },
        {
            id: 'flag3',
            value: 'emberwolf-c2.duckdns.org',
            label: 'Phase 3 -- DNS + PKI Forensics: Attacker C2 Domain',
            description: 'The canonical attacker C2 domain extracted from the TLS certificate Subject Alternative Name list on the lookalike domain. DuckDNS dynamic DNS used for C2.',
            points: 250,
            autoCheck: false
        },
        {
            id: 'flag4',
            value: 'EMBERWOLF:RU',
            label: 'Phase 4 -- Attribution: APT Name + Country ISO Code',
            description: 'EMBERWOLF APT (4/4 TTP match) with RU (Russia) actor origin. NL is VPS provider jurisdiction, not actor origin. Geo enrichment from HexIntel behavioral + infrastructure analysis.',
            points: 200,
            autoCheck: false
        },
        {
            id: 'flag5',
            value: 'e.morales',
            label: 'Phase 5 -- SIEM Correlation: Patient Zero Username',
            description: 'e.morales is Patient Zero. Only user with both lookalike AND C2 DNS queries (C2 query = malware beacon). Their foreign-IP auth logins are unexplained (no calendar, no HR ticket, no prior sessions from that ASN).',
            points: 200,
            autoCheck: false
        },
        {
            id: 'flag6',
            value: 'REMED-OK-S7K9P2',
            label: 'Phase 6 -- Contain + Remediate: Composite Remediation Flag',
            description: 'Composite flag revealed when all 3 Phase 6 actions are correct: CVE-2022-30190 patched, Rapid7 scan clean (scan ID S7K9P2), valid mail filter rule active.',
            points: 250,
            autoCheck: false
        },
        {
            id: 'flag7',
            value: 'A82A44DCA64FA463',
            label: 'Phase 7 -- Synthesis: SHA256-derived Final Flag',
            description: 'SHA256(flag1|flag2|flag3|flag4|flag5|flag6) -- first 16 chars uppercase. Gated on all prior flags being correct; any wrong value in the concatenation changes the hash.',
            points: 250,
            autoCheck: false
        }
    ],

    // =========================================================
    // SCORING
    // =========================================================

    scoring: {
        base: 1500,
        maxScore: 750,
        minScore: 0,
        hintPenalty: 75,
        // Eclipse doubles the effective hint cost -- 75 base * 2 = 150 per hint
        eclipseHintMultiplier: 2,
        wrongFlagPenalty: -40,
        speedBonusThreshold: 3600,  // 60 minutes
        speedBonusPoints: 100
    },

    // =========================================================
    // HINTS -- verbatim from walkthrough Section 8
    // =========================================================

    hints: [
        {
            id: 'hint1',
            label: 'Phase 1 -- Inbox Triage (L1)',
            helpLevel: 1,
            text: 'Surface red flags (urgent language, authority impersonation, lookalike domains) are sometimes legitimate mail. The real signals live in the email headers -- specifically the Authentication-Results line (SPF, DKIM, DMARC) and the Reply-To vs From comparison. Read every header, not just every subject.',
            cost: 75,
            penalty: -75
        },
        {
            id: 'hint2',
            label: 'Phase 2 -- Payload ID (L3)',
            helpLevel: 3,
            text: 'The attachment in Phase 1\'s real phishing email is the payload. Hash it with sha256sum, then submit the hash to the Hash Analyzer in your browser. The analyzer returns BOTH the malware family AND the CVE -- your Flag 2 combines them. Beware: there is a second attachment in the inbox that is benign -- verify the hash result before submitting.',
            cost: 75,
            penalty: -75
        },
        {
            id: 'hint3',
            label: 'Phase 3 -- DNS + PKI Forensics (L4)',
            helpLevel: 4,
            text: 'The lookalike domain (from Phase 1 headers) is a front. The real C2 is in the certificate\'s Subject Alternative Name list. Run openssl s_client -connect <lookalike>:443 -showcerts and pipe to openssl x509 -noout -text to read the cert. The C2 domain in the SAN list has a name that signals dynamic DNS abuse.',
            cost: 75,
            penalty: -75
        },
        {
            id: 'hint4',
            label: 'Phase 4 -- Attribution + Geo (L2)',
            helpLevel: 2,
            text: 'Three actor profiles in the threat-intel mirror partially match. Use the disambiguator TTPs (dynamic-DNS preference + themed naming convention <word>-c2.*) to narrow to one. For geolocation, an IP that resolves to a CDN edge does NOT tell you where the operator lives -- read the threat-intel actor-origin enrichment block, not just the IP-geo result.',
            cost: 75,
            penalty: -75
        },
        {
            id: 'hint5',
            label: 'Phase 5 -- SIEM Correlation (L4)',
            helpLevel: 4,
            text: 'Three employees queried the lookalike domain in the DNS log. ONE of them also queried the C2 callback (that\'s the malware calling home). Of that subset, the SIEM auth log marks each foreign-IP anomaly as either EXPLAINED (calendar + HR ticket attached) or UNEXPLAINED (no provenance). Patient Zero is the UNEXPLAINED one. Read the provenance lines, not just the timestamps.',
            cost: 75,
            penalty: -75
        },
        {
            id: 'hint6',
            label: 'Phase 6 -- Contain + Remediate (L3)',
            helpLevel: 3,
            text: 'Three outstanding CVEs on Patient Zero\'s workstation. Patch the one from Phase 2, not the scariest-looking. If you apply the wrong patch first, use the "Undo / Re-evaluate" button to revert and try again -- no soft-lock, but each wrong attempt costs the wrong-action penalty. Rapid7 InsightVM scan validates the patch -- if Rapid7 still detects the vulnerability, you patched wrong. For the mail filter: narrowest scope that catches THIS attack without collateral damage. Reply-To pattern or sender domain of the lookalike are good scopes; subject keyword or TLD wildcard are not.',
            cost: 75,
            penalty: -75
        },
        {
            id: 'hint7',
            label: 'Phase 7 -- Synthesis (L4)',
            helpLevel: 4,
            text: 'Synthesis formula: SHA256("<flag1>|<flag2>|<flag3>|<flag4>|<flag5>|<flag6>") -- first 16 characters of the hex digest, uppercase. Each <flagN> is the EXACT value you submitted for that flag (no transformation). Separator is | (pipe), not : -- because Flag 2 and Flag 4 already contain :. Use echo -n "<string>" | sha256sum -- note the -n flag (omit trailing newline) is critical or the hash will not match. Quoting warning: Flag 1 contains angle brackets (< and >); the outer double-quotes around the echo string are LOAD-BEARING because bash treats unquoted <> as I/O redirects. If your hash comes out wrong or empty, verify the double-quotes are present.',
            cost: 75,
            penalty: -75
        }
    ],

    // =========================================================
    // TERMINAL CUSTOM COMMANDS
    // =========================================================

    commands: {

        // ─── dig <domain> ──────────────────────────────────────

        'dig': function(args, term, engine) {
            const target = (args[0] || '').toLowerCase().trim();
            if (!target) return 'Usage: dig <domain>\nExample: dig crimson-dawn-finance.net\n\nKnown domains in this investigation:\n  crimson-dawn-finance.net       (lookalike -- attacker)\n  nakamura-suppliers-corp.com    (attacker Reply-To domain)\n  nakamura-supplies.com          (LEGIT vendor)\n  emberwolf-c2.duckdns.org       (attacker C2)\n  crimson-dawn.net               (legit corp)';

            const records = {
                'crimson-dawn-finance.net':     { ip: '104.21.45.122', ttl: 300,  note: '; Cloudflare edge' },
                'nakamura-suppliers-corp.com':  { ip: '185.220.101.45', ttl: 60,  note: '; NForce NL -- same IP as C2 (operational sloppiness: attacker reused C2 server for both lookalike infra)' },
                'emberwolf-c2.duckdns.org':     { ip: '185.220.101.45', ttl: 60,  note: '; NForce NL bulletproof hosting' },
                'nakamura-supplies.com':        { ip: '52.44.22.11',    ttl: 3600, note: '; AWS us-east-1 (legit corporate hosting)' },
                'crimson-dawn.net':             { ip: '34.102.136.180', ttl: 300,  note: '; Google Cloud (legit corp)' },
                'mail.crimson-dawn.net':        { ip: '10.0.1.5',       ttl: 300,  note: '; internal mail server' }
            };

            const rec = records[target];
            if (rec) {
                return `; <<>> DiG 9.18.18 <<>> ${target}\n;; ->>HEADER<<- opcode: QUERY, status: NOERROR\n\n;; QUESTION SECTION:\n;${target}.\t\t\tIN\tA\n\n;; ANSWER SECTION:\n${target}.\t${rec.ttl}\tIN\tA\t${rec.ip}\t${rec.note}\n\n;; Query time: 22 msec\n;; SERVER: 8.8.8.8#53(8.8.8.8)\n;; WHEN: ${new Date().toUTCString()}\n;; MSG SIZE rcvd: 68`;
            }

            return `; <<>> DiG 9.18.18 <<>> ${target}\n;; ->>HEADER<<- opcode: QUERY, status: NXDOMAIN\n\n;; QUESTION SECTION:\n;${target}.\t\t\tIN\tA\n\n;; AUTHORITY SECTION:\n.\t\t\t86400\tIN\tSOA\ta.root-servers.net. nstld.verisign-grs.com.\n\n;; NXDOMAIN -- domain does not exist in scenario scope.`;
        },

        // ─── host <domain> -- alias for dig ────────────────────

        'host': function(args, term, engine) {
            return PISFinalConfig.commands['dig'](args, term, engine);
        },

        // ─── whois <domain|ip> ──────────────────────────────────

        'whois': function(args, term, engine) {
            const target = (args[0] || '').toLowerCase().trim();
            if (!target) return 'Usage: whois <domain|ip>\nAlternative: use the browser at https://whois.crimson-intel.net';
            // Delegate to the browser whois handler for consistent data
            const result = PISFinalConfig._handleWhois(target, engine);
            // Strip HTML for terminal display
            return result.replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&mdash;/g, '--').replace(/&nbsp;/g, ' ').replace(/&larr;/g, '<--').replace(/\n{3,}/g, '\n\n').trim();
        },

        // ─── openssl ────────────────────────────────────────────

        'openssl': function(args, term, engine) {
            if (args.length === 0) return 'OpenSSL 3.2.1 (simulated -- IR workstation)\nUsage:\n  openssl s_client -connect <host>:<port> -showcerts\n  openssl x509 -noout -text\n  (pipe the two together to read a cert SAN list)';

            const sub = args[0];

            if (sub === 's_client') {
                const connectIdx = args.indexOf('-connect');
                const target = connectIdx >= 0 ? args[connectIdx + 1] : null;

                if (!target) return 'Usage: openssl s_client -connect <host>:<port> -showcerts';

                const host = target.split(':')[0].toLowerCase();
                // Nancy round 3 PAUSE fix: tighten host matching to exact-domain only.
                // Previous loose prefix match (host.includes(h.split('.')[0])) caused
                // crimson-dawn.net (legit corp) to trigger the attacker cert output.
                const attackerHosts = ['crimson-dawn-finance.net', 'nakamura-suppliers-corp.com', 'emberwolf-c2.duckdns.org', 'cd-paymentportal.net', 'vendor-update-2026.com'];
                const legitHosts = ['crimson-dawn.net', 'nakamura-supplies.com', 'mail.crimson-dawn.net'];

                if (attackerHosts.includes(host)) {
                    // Mark s_client as having run successfully so x509 -noout -text
                    // (with no piped input) can return the parsed cert text. Without
                    // this gate, students could call x509 standalone and get the SAN
                    // list without ever connecting to the lookalike domain.
                    PISFinalConfig._db._sclient_target = host;
                    return `CONNECTED(00000003)\ndepth=2 C = US, O = Internet Security Research Group, CN = ISRG Root X1\ndepth=1 C = US, O = Let's Encrypt, CN = R3\ndepth=0 CN = crimson-dawn-finance.net\n---\nCertificate chain\n 0 s:CN = crimson-dawn-finance.net\n   i:C = US, O = Let's Encrypt, CN = R3\n---\n[Certificate data -- pipe to 'openssl x509 -noout -text' to parse]\n---\nSSL handshake has read 4221 bytes and written 737 bytes\nVerification: OK\n---\nNew, TLSv1.3, Cipher is TLS_AES_128_GCM_SHA256\nServer public key is 2048 bit\n\nNote: to read the certificate, use:\n  openssl s_client -connect ${host}:443 -showcerts | openssl x509 -noout -text`;
                }

                if (legitHosts.includes(host)) {
                    return `CONNECTED(00000003)\ndepth=2 C = US, O = DigiCert Inc, CN = DigiCert Global Root CA\ndepth=1 C = US, O = DigiCert Inc, CN = DigiCert SHA2 Secure Server CA\ndepth=0 CN = ${host}\n---\nCertificate chain\n 0 s:CN = ${host}\n   i:C = US, O = DigiCert Inc, CN = DigiCert SHA2 Secure Server CA\n---\n[Certificate is for the legitimate corporate domain. Not the attacker infrastructure.]\nSSL handshake has read 3850 bytes and written 712 bytes\nVerification: OK\n---\nNote: This is a legitimate cert. The attacker infrastructure is at crimson-dawn-finance.net (the lookalike).`;
                }

                return `openssl s_client: connection to ${target} -- host not in scenario scope or not reachable.\nTry: openssl s_client -connect crimson-dawn-finance.net:443 -showcerts`;
            }

            if (sub === 'x509') {
                if (args.includes('-noout') && args.includes('-text')) {
                    // Nancy round 3 PAUSE fix: gate x509 cert parsing on a prior
                    // successful s_client to an attacker host. Previously the cert
                    // text was returned standalone regardless of whether the student
                    // had actually connected -- a Phase 3 skill bypass.
                    const sclientTarget = PISFinalConfig._db._sclient_target;
                    if (!sclientTarget) {
                        return `unable to load certificate\n0123:error:0906D06C:PEM routines:PEM_read_bio:no start line:pem_lib.c:701:Expecting: TRUSTED CERTIFICATE\n\nNo certificate data on stdin. Pipe input from openssl s_client:\n  openssl s_client -connect <host>:443 -showcerts | openssl x509 -noout -text`;
                    }
                    // Only attacker hosts' certs reveal the multi-SAN list.
                    return `Certificate:\n    Data:\n        Version: 3 (0x2)\n        Serial Number: 03:c4:a2:8a:19:f5:c4:4c:7f:92:a3:bb:11:22:33:44\n    Signature Algorithm: sha256WithRSAEncryption\n        Issuer: C=US, O=Let's Encrypt, CN=R3\n        Validity\n            Not Before: May 15 00:00:00 2026 GMT\n            Not After : Aug 13 23:59:59 2026 GMT\n        Subject: CN=crimson-dawn-finance.net\n        X509v3 extensions:\n            X509v3 Subject Alternative Name:\n                DNS:crimson-dawn-finance.net, DNS:nakamura-suppliers-corp.com, DNS:emberwolf-c2.duckdns.org, DNS:cd-paymentportal.net, DNS:vendor-update-2026.com\n\n*** SAN LIST EXTRACTED ***\nFive domains -- the attacker's full infrastructure:\n  1. crimson-dawn-finance.net       (the lookalike -- receives replies)\n  2. nakamura-suppliers-corp.com    (second attacker domain -- Reply-To)\n  3. emberwolf-c2.duckdns.org       (C2 callback -- DuckDNS dynamic DNS)\n  4. cd-paymentportal.net           (payment redirect domain)\n  5. vendor-update-2026.com         (additional phishing domain)\n\nThe C2 naming convention "emberwolf-c2.*" is the actor signature.\nDig the C2 domain to confirm it resolves to the same X-Originating-IP as Phase 1.`;
                }
                return 'Usage: openssl x509 -noout -text\n(pipe input from: openssl s_client -connect <host>:443 -showcerts)';
            }

            return `openssl: unknown subcommand "${args[0]}"\nAvailable in this scenario: s_client, x509`;
        },

        // ─── sha256sum <file> ───────────────────────────────────

        'sha256sum': function(args, term, engine) {
            if (args.length === 0) return 'Usage: sha256sum <file>\nExample: sha256sum /home/ir-lead/downloads/Nakamura-Q1-2026-CORRECTED.docx\n\nFiles in /home/ir-lead/downloads/ will be hashed.\nDownload attachments from webmail first.';

            const filePath = args[0];
            const filename = filePath.split('/').pop();
            const hashDb = PISFinalConfig._db.hash_db;
            const fs = engine && engine.config && engine.config.filesystem;

            // Check if file exists in downloads
            if (fs) {
                const downloads = fs['/'].children.home.children['ir-lead'].children.downloads.children;
                if (!downloads[filename]) {
                    return `sha256sum: ${filePath}: No such file or directory\nDownload the file from webmail first:\n  Open Firefox -> https://mail.crimson-dawn.net/msg/4 -> click the attachment`;
                }
            }

            const hash = hashDb[filename];
            if (hash) {
                return `${hash}  ${filePath}`;
            }

            // File exists in downloads but not in hash_db -- use filename lookup
            for (const [name, h] of Object.entries(hashDb)) {
                if (filename.toLowerCase() === name.toLowerCase()) {
                    return `${h}  ${filePath}`;
                }
            }

            return `sha256sum: ${filePath}: file recognized but hash not in local database.\nExpected files: Nakamura-Q1-2026-CORRECTED.docx, budget-Q1-final.xlsx`;
        },

        // ─── file <file> ────────────────────────────────────────

        'file': function(args, term, engine) {
            if (args.length === 0) return 'Usage: file <path>\nExample: file /home/ir-lead/downloads/Nakamura-Q1-2026-CORRECTED.docx';

            const filePath = args[0];
            const filename = filePath.split('/').pop();
            const fileTypes = PISFinalConfig._db.file_types;

            const result = fileTypes[filename];
            if (result) {
                return `${filePath}: ${result}`;
            }

            const fs = engine && engine.config && engine.config.filesystem;
            if (fs) {
                const downloads = fs['/'].children.home.children['ir-lead'].children.downloads.children;
                if (!downloads[filename]) {
                    return `file: ${filePath}: No such file or directory`;
                }
            }

            return `${filePath}: data`;
        },

        // ─── phase -- show phase status ──────────────────────────

        'phase': function(args, term, engine) {
            const cfg = engine.config;
            const db = cfg._db;
            const lines = ['PATIENT ZERO -- PHASE STATUS', '='.repeat(50), ''];

            // engine.state.flagsFound is an array of captured flag IDs (BoxEngine standard)
            const found = (engine.state && engine.state.flagsFound) ? engine.state.flagsFound : [];

            const f1 = found.includes('flag1');
            const f2 = found.includes('flag2');
            const f3 = found.includes('flag3');
            const f4 = found.includes('flag4');
            const f5 = found.includes('flag5');
            const f6 = found.includes('flag6');
            const f7 = found.includes('flag7');

            lines.push('Phase 1 -- Inbox Triage: ' + (f1 ? 'COMPLETE' : 'INCOMPLETE'));
            lines.push('  ' + (f1 ? '[OK]' : '[  ]') + ' Submit the Message-ID of the real phishing email');
            lines.push('  ' + (f1 ? '[OK]' : '[ ]') + ' Look for SPF/DKIM/DMARC failures + Reply-To mismatch + Message-ID host mismatch');

            lines.push('');
            lines.push('Phase 2 -- Payload ID: ' + (f2 ? 'COMPLETE' : (f1 ? 'INCOMPLETE' : 'LOCKED (submit Flag 1 first)')));
            lines.push('  ' + (f2 ? '[OK]' : '[ ]') + ' Download Nakamura-Q1-2026-CORRECTED.docx from webmail');
            lines.push('  ' + (f2 ? '[OK]' : '[ ]') + ' sha256sum the file, look up hash at vt-mirror.crimson-intel.net');
            lines.push('  ' + (f2 ? '[OK]' : '[ ]') + ' Submit malware-family:CVE in format COBALT_STRIKE:CVE-2022-30190');

            lines.push('');
            lines.push('Phase 3 -- DNS + PKI Forensics: ' + (f3 ? 'COMPLETE' : (f2 ? 'INCOMPLETE' : 'LOCKED (submit Flag 2 first)')));
            lines.push('  ' + (f3 ? '[OK]' : '[ ]') + ' dig the X-Originating-IP lookalike domain');
            lines.push('  ' + (f3 ? '[OK]' : '[ ]') + ' openssl s_client -connect <lookalike>:443 -showcerts | openssl x509 -noout -text');
            lines.push('  ' + (f3 ? '[OK]' : '[ ]') + ' Extract C2 domain from SAN list, confirm with dig');

            lines.push('');
            lines.push('Phase 4 -- Attribution + Geo: ' + (f4 ? 'COMPLETE' : (f3 ? 'INCOMPLETE' : 'LOCKED (submit Flag 3 first)')));
            lines.push('  ' + (f4 ? '[OK]' : '[ ]') + ' Search intel.crimson-intel.net with C2 domain or malware family');
            lines.push('  ' + (f4 ? '[OK]' : '[ ]') + ' Look up 185.220.101.45 at ipgeo.crimson-intel.net');
            lines.push('  ' + (f4 ? '[OK]' : '[ ]') + ' Submit APT-NAME:COUNTRY (e.g. EMBERWOLF:RU)');

            lines.push('');
            lines.push('Phase 5 -- SIEM Correlation: ' + (f5 ? 'COMPLETE' : (f4 ? 'INCOMPLETE' : 'LOCKED (submit Flag 4 first)')));
            lines.push('  ' + (f5 ? '[OK]' : '[ ]') + ' siem.crimson-dawn.net -> DNS log, filter by lookalike domain');
            lines.push('  ' + (f5 ? '[OK]' : '[ ]') + ' Find which user also queried the C2 domain (malware beacon)');
            lines.push('  ' + (f5 ? '[OK]' : '[ ]') + ' Auth log: compare foreign-IP anomaly provenance (EXPLAINED vs UNEXPLAINED)');

            lines.push('');
            const p6status = f6 ? 'COMPLETE' : (f5 ? (() => {
                const parts = [];
                if (!db.patch_state.applied.includes('CVE-2022-30190')) parts.push('patch');
                if (db.rapid7_scan_state.result !== 'clean') parts.push('scan');
                if (!db.mail_filter_state.active) parts.push('mail filter');
                return parts.length > 0 ? 'INCOMPLETE (still needed: ' + parts.join(', ') + ')' : 'READY -- check patch.crimson-dawn.net';
            })() : 'LOCKED (submit Flag 5 first)');
            lines.push('Phase 6 -- Contain + Remediate: ' + p6status);
            lines.push('  ' + (db.patch_state.applied.includes('CVE-2022-30190') ? '[OK]' : '[ ]') + ' patch.crimson-dawn.net -- apply CVE-2022-30190 (Follina)');
            lines.push('  ' + (db.rapid7_scan_state.result === 'clean' ? '[OK]' : '[ ]') + ' insightvm.crimson-dawn.net -- run scan, confirm CLEAN + scan ID S7K9P2');
            lines.push('  ' + (db.mail_filter_state.active ? '[OK]' : '[ ]') + ' mailadmin.crimson-dawn.net -- add narrowly-scoped mail filter');
            if (!f6) lines.push('  Composite flag revealed on patch.crimson-dawn.net when all 3 complete.');

            lines.push('');
            lines.push('Phase 7 -- Synthesis: ' + (f7 ? 'COMPLETE' : (f6 ? 'READY' : 'LOCKED (submit Flag 6 first)')));
            if (f6 && !f7) {
                lines.push('  Compute: echo -n "<flag1>|<flag2>|<flag3>|<flag4>|<flag5>|<flag6>" | sha256sum | awk \'{print toupper(substr($1,1,16))}\'');
                lines.push('  WARNING: outer double-quotes are load-bearing (flag1 contains angle brackets).');
            }

            return lines.join('\n');
        },

        // ─── help ────────────────────────────────────────────────

        'help': function(args, term, engine) {
            return 'PATIENT ZERO -- COMMAND REFERENCE\n\nTerminal commands:\n  dig <domain>          DNS A-record lookup\n  whois <domain|ip>     Domain / IP registration info\n  host <domain>         Alias for dig\n  sha256sum <file>      Hash a file in /home/ir-lead/downloads/\n  file <file>           Identify file type\n  openssl s_client -connect <host>:443 -showcerts\n                        Pull TLS certificate chain\n  openssl x509 -noout -text\n                        Parse cert (pipe from s_client output)\n\nPhase status:\n  phase                 Show current phase + what is still missing\n\nKey browser URLs (all bookmarked in Firefox):\n  Webmail:           https://mail.crimson-dawn.net/inbox\n  CVE Search:        https://cve.crimson-intel.net/search\n  WHOIS:             https://whois.crimson-intel.net\n  Hash Analyzer:     https://vt-mirror.crimson-intel.net\n  Threat Intel:      https://intel.crimson-intel.net\n  IP Geolocation:    https://ipgeo.crimson-intel.net\n  SIEM-lite:         https://siem.crimson-dawn.net\n  Patch Mgmt:        https://patch.crimson-dawn.net\n  Rapid7 InsightVM:  https://insightvm.crimson-dawn.net\n  Mail Admin:        https://mailadmin.crimson-dawn.net\n\nKey files:\n  /home/ir-lead/incident-brief.md    Scenario brief\n  /home/ir-lead/notes.txt            Compact command reference\n  /home/ir-lead/downloads/           Attachment downloads\n  /evidence/pcap-day1.txt            Day-1 firewall log excerpt\n\nSynthesis formula (Phase 7):\n  echo -n "<F1>|<F2>|<F3>|<F4>|<F5>|<F6>" | sha256sum | awk \'{print toupper(substr($1,1,16))}\'\n  (double-quotes are LOAD-BEARING -- flag1 contains angle brackets)';
        }
    },

    // =========================================================
    // STATE RESET (Nancy round 3 BLOCK fix — _db singleton state bleed)
    // =========================================================
    //
    // PISFinalConfig._db carries Phase 6 in-progress state (patch_state,
    // mail_filter_state, rapid7_scan_state) and the openssl s_client flag.
    // Because the config is a JS object literal loaded at page-load time,
    // state from a previous session can persist if two students share a
    // browser profile or a student navigates away and returns. This resetState
    // method is called by BoxEngine.init() to give every new lab session a
    // fresh slate. The method is idempotent — multiple calls are safe.
    //
    // Engine integration: BoxEngine.js checks for cfg.resetState and invokes
    // it at lab-init time. If the engine doesn't yet wire this, the method
    // can also be called manually via the operator console.

    resetState: function() {
        this._phaseState.current = 1;
        this._phaseState.completed = [];
        this._db.patch_state.applied = [];
        this._db.patch_state.undone = [];
        this._db.mail_filter_state.active = false;
        this._db.mail_filter_state.rule = null;
        this._db.rapid7_scan_state.ran = false;
        this._db.rapid7_scan_state.result = null;
        this._db.rapid7_scan_state.scan_id = null;
        this._db._sclient_target = null;
    }

};

// Auto-reset state on script load. This handles the most common bleed case
// (student reloads the page or returns from another tab) without requiring
// BoxEngine engine changes. For multi-student session isolation, the engine
// should additionally namespace state by user UID via storageKey -- that
// integration is a separate engine-level concern, not config-level.
if (typeof PISFinalConfig !== 'undefined') PISFinalConfig.resetState();
