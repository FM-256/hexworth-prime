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
                                    content: 'INCIDENT BRIEF -- CRIMSON DAWN WIRE FRAUD (2026-05-18)\n======================================================\nReceived: 2026-05-21 09:00 from IT security manager\nClassification: INTERNAL // INCIDENT-RESPONSE\nSeverity: CRITICAL ($4.2M wire fraud)\n\nRECONSTRUCTED TIMELINE:\n\n2026-05-18 09:12 -- DNS log shows queries to an unrecognized domain\n                    from at least one AP workstation.\n\n2026-05-18 09:14 -- $4.2M wire transfer authorized via a duplicate-invoice\n                    fraud. Wire sent to offshore account ending in -7741.\n\n2026-05-18 09:14 -- Same timestamp: SIEM auth log records a login from\n                    an external IP address.\n\n2026-05-21 06:30 -- Bank flags the transfer; IT notified.\n\n2026-05-21 07:00 -- Network isolated. All AP workstations quarantined.\n\n2026-05-21 09:00 -- You arrive on-site. Webmail for the shared AP inbox\n                    accounts@crimson-dawn.net has been forensically recovered\n                    and is available in the browser (bookmark: Webmail).\n\nSCOPE:\n\nThree employees in Accounts Payable + Vendor Management had access to\nthe wire-approval workflow:\n\n  e.morales   AP clerk (WS-EMORALES-01, 10.0.4.18)\n  r.chen      AP supervisor (WS-RCHEN-01, 10.0.4.6)\n  s.patel     Vendor Management (currently on a London business trip)\n              NOTE: s.patel has an approved travel record -- HR ticket\n              #TR-2026-0418, calendar offsite 2026-05-15 to 2026-05-22.\n              Four prior London sessions on record. Her foreign-IP logins\n              are expected -- see SIEM auth log for inline provenance.\n\nSeven messages in the AP shared inbox from the 48 hours before the wire.\nOpen webmail at https://mail.crimson-dawn.net/inbox\n\nAvailable IR tools (browser bookmarks):\n  Webmail:           https://mail.crimson-dawn.net/inbox\n  CVE Search:        https://cve.crimson-intel.net/search\n  WHOIS Lookup:      https://whois.crimson-intel.net\n  Hash Analyzer:     https://vt-mirror.crimson-intel.net\n  Threat Intel:      https://intel.crimson-intel.net\n  IP Geolocation:    https://ipgeo.crimson-intel.net\n  SIEM-lite:         https://siem.crimson-dawn.net\n  Patch Mgmt:        https://patch.crimson-dawn.net\n  Rapid7 InsightVM:  https://insightvm.crimson-dawn.net\n  Mail Admin:        https://mailadmin.crimson-dawn.net\n\nRun: phase  -- to see current phase status at any time.\n'
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
                                <td style="padding:8px 12px;">it-helpdesk@crimson-dawn.net</td>
                                <td style="padding:8px 12px;"><a href="https://mail.crimson-dawn.net/msg/1" style="color:#dc2626; text-decoration:none; font-weight:600;">MANDATORY: Password rotation TODAY</a></td>
                                <td style="padding:8px 12px; color:#888; font-size:0.77rem;">2026-05-17 14:22</td>
                            </tr>
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:8px 12px; color:#888;">2</td>
                                <td style="padding:8px 12px;">payroll-alerts@adp-secure-portal.com</td>
                                <td style="padding:8px 12px;"><a href="https://mail.crimson-dawn.net/msg/2" style="color:#dc2626; text-decoration:none; font-weight:600;">Direct deposit verification required</a></td>
                                <td style="padding:8px 12px; color:#888; font-size:0.77rem;">2026-05-17 16:08</td>
                            </tr>
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:8px 12px; color:#888;">3</td>
                                <td style="padding:8px 12px;">noreply@fedex-shipping-update.com</td>
                                <td style="padding:8px 12px;"><a href="https://mail.crimson-dawn.net/msg/3" style="color:#dc2626; text-decoration:none; font-weight:600;">Delivery exception #4470029</a></td>
                                <td style="padding:8px 12px; color:#888; font-size:0.77rem;">2026-05-17 18:45</td>
                            </tr>
                            <tr style="border-bottom:1px solid #eee; background:#fff8f8;">
                                <td style="padding:8px 12px; color:#888;">4</td>
                                <td style="padding:8px 12px;">accounts@nakamura-supplies.com</td>
                                <td style="padding:8px 12px;"><a href="https://mail.crimson-dawn.net/msg/4" style="color:#222; text-decoration:none;">Invoice 2026-Q1-114 (corrected version)</a></td>
                                <td style="padding:8px 12px; color:#888; font-size:0.77rem;">2026-05-18 08:54</td>
                            </tr>
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:8px 12px; color:#888;">5</td>
                                <td style="padding:8px 12px;">m.harlowe@crimson-dawn.net</td>
                                <td style="padding:8px 12px;"><a href="https://mail.crimson-dawn.net/msg/5" style="color:#222; text-decoration:none;">Re: Q1 budget review</a></td>
                                <td style="padding:8px 12px; color:#888; font-size:0.77rem;">2026-05-18 09:30</td>
                            </tr>
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:8px 12px; color:#888;">6</td>
                                <td style="padding:8px 12px;">support@calendly.com</td>
                                <td style="padding:8px 12px;"><a href="https://mail.crimson-dawn.net/msg/6" style="color:#222; text-decoration:none;">Meeting confirmation: 2026-05-19 14:00</a></td>
                                <td style="padding:8px 12px; color:#888; font-size:0.77rem;">2026-05-18 10:15</td>
                            </tr>
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:8px 12px; color:#888;">7</td>
                                <td style="padding:8px 12px;">compliance@crimson-dawn.net</td>
                                <td style="padding:8px 12px;"><a href="https://mail.crimson-dawn.net/msg/7" style="color:#222; text-decoration:none;">Quarterly compliance attestation form</a></td>
                                <td style="padding:8px 12px; color:#888; font-size:0.77rem;">2026-05-18 11:00</td>
                            </tr>
                        </tbody>
                    </table>
                    <div style="margin-top:12px; padding:10px; background:#f8f8f8; border:1px solid #ddd; border-radius:4px; font-size:0.72rem; color:#888;">
                        7 messages total &mdash; click any message to view full headers and body
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

                      <button class="pw-submit" data-action="reset-noop">Rotate Password &amp; Sign In</button>
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
                        <div class="pw-ctx-kv"><span class="pw-ctx-k">Password age</span><span class="pw-status-pill warn">132 days</span></div>
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
                <div style="font-family:system-ui,sans-serif; max-width:720px; margin:0 auto; padding:16px;">
                    <div style="border-bottom:2px solid #dc2626; padding-bottom:10px; margin-bottom:16px;">
                        <div style="font-size:0.72rem; color:#888; letter-spacing:0.1em; text-transform:uppercase;">CRIMSON INTEL -- WHOIS</div>
                        <div style="font-size:1rem; font-weight:700; color:#222; margin-top:2px;">Domain / IP Registration Lookup</div>
                    </div>
                    <div style="display:flex; gap:8px; margin-bottom:16px;">
                        <input type="text" data-field="whois_query" placeholder="Domain or IP (e.g. crimson-dawn-finance.net, 185.220.101.45)"
                               style="flex:1; padding:8px 12px; border:1px solid #ccc; border-radius:4px; font-family:inherit; font-size:0.83rem;">
                        <button data-action="lookup" style="padding:8px 18px; background:#dc2626; color:#fff; border:none; border-radius:4px; font-weight:700; cursor:pointer; font-family:inherit;">Lookup</button>
                    </div>
                    <div data-results>
                        <div style="color:#888; font-size:0.78rem; text-align:center; padding:20px;">Enter a domain name or IP address to look up registration info.</div>
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
                <div style="font-family:system-ui,sans-serif; max-width:720px; margin:0 auto; padding:16px;">
                    <div style="border-bottom:2px solid #dc2626; padding-bottom:10px; margin-bottom:16px;">
                        <div style="font-size:0.72rem; color:#888; letter-spacing:0.1em; text-transform:uppercase;">CRIMSON INTEL -- HASH ANALYZER (VT Mirror)</div>
                        <div style="font-size:1rem; font-weight:700; color:#222; margin-top:2px;">File Hash Lookup</div>
                        <div style="font-size:0.72rem; color:#888;">68-engine consensus feed -- synced 2026-05-21</div>
                    </div>
                    <div style="margin-bottom:8px; font-size:0.8rem; color:#555;">Paste a SHA-256 hash to check for known malware:</div>
                    <textarea data-field="hash_input" rows="3" placeholder="SHA-256 hash (64 hex characters)"
                              style="width:100%; padding:8px 12px; border:1px solid #ccc; border-radius:4px; font-family:monospace; font-size:0.82rem; box-sizing:border-box; resize:vertical;"></textarea>
                    <button data-action="analyze" style="margin-top:8px; padding:8px 18px; background:#dc2626; color:#fff; border:none; border-radius:4px; font-weight:700; cursor:pointer; font-family:inherit;">Analyze</button>
                    <div data-results style="margin-top:16px;"></div>
                </div>`,
                formHandler: (data, engine) => PISFinalConfig._handleHashLookup(data.hash_input || '', engine)
            },

            // ─────────────────────────────────────────────────
            // E. THREAT INTEL: intel.crimson-intel.net
            // ─────────────────────────────────────────────────

            '/intel': {
                title: 'Threat Intel Mirror -- intel.crimson-intel.net',
                html: `
                <div style="font-family:system-ui,sans-serif; max-width:720px; margin:0 auto; padding:16px;">
                    <div style="border-bottom:2px solid #dc2626; padding-bottom:10px; margin-bottom:16px;">
                        <div style="font-size:0.72rem; color:#888; letter-spacing:0.1em; text-transform:uppercase;">CRIMSON INTEL -- THREAT INTEL MIRROR (HexIntel Feed)</div>
                        <div style="font-size:1rem; font-weight:700; color:#222; margin-top:2px;">APT / IOC Search</div>
                        <div style="font-size:0.72rem; color:#888;">Search by: domain, hash, CVE, malware family, or APT name</div>
                    </div>
                    <div style="display:flex; gap:8px; margin-bottom:16px;">
                        <input type="text" data-field="intel_query" placeholder="e.g. emberwolf-c2.duckdns.org, CVE-2022-30190, Cobalt Strike"
                               style="flex:1; padding:8px 12px; border:1px solid #ccc; border-radius:4px; font-family:inherit; font-size:0.83rem;">
                        <button data-action="search" style="padding:8px 18px; background:#dc2626; color:#fff; border:none; border-radius:4px; font-weight:700; cursor:pointer; font-family:inherit;">Search</button>
                    </div>
                    <div data-results>
                        <div style="color:#888; font-size:0.78rem; text-align:center; padding:20px;">Enter an IOC, CVE, or malware family to search actor profiles.</div>
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
                <div style="font-family:system-ui,sans-serif; max-width:720px; margin:0 auto; padding:16px;">
                    <div style="border-bottom:2px solid #dc2626; padding-bottom:10px; margin-bottom:16px;">
                        <div style="font-size:0.72rem; color:#888; letter-spacing:0.1em; text-transform:uppercase;">CRIMSON INTEL -- IP GEOLOCATION + ENRICHMENT</div>
                        <div style="font-size:1rem; font-weight:700; color:#222; margin-top:2px;">IP Address Lookup</div>
                    </div>
                    <div style="display:flex; gap:8px; margin-bottom:16px;">
                        <input type="text" data-field="ip_query" placeholder="IP address (e.g. 185.220.101.45)"
                               style="flex:1; padding:8px 12px; border:1px solid #ccc; border-radius:4px; font-family:inherit; font-size:0.83rem;">
                        <button data-action="lookup" style="padding:8px 18px; background:#dc2626; color:#fff; border:none; border-radius:4px; font-weight:700; cursor:pointer; font-family:inherit;">Lookup</button>
                    </div>
                    <div data-results>
                        <div style="color:#888; font-size:0.78rem; text-align:center; padding:20px;">Enter an IP address to look up geolocation and enrichment data.</div>
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
                <div style="font-family:system-ui,sans-serif; max-width:860px; margin:0 auto; padding:16px;">
                    <div style="border-bottom:2px solid #dc2626; padding-bottom:10px; margin-bottom:16px;">
                        <div style="font-size:0.72rem; color:#888; letter-spacing:0.1em; text-transform:uppercase;">CRIMSON DAWN -- SIEM-LITE LOG VIEWER</div>
                        <div style="font-size:1rem; font-weight:700; color:#222; margin-top:2px;">Security Event Search</div>
                        <div style="font-size:0.72rem; color:#888;">Coverage: DNS (14 days), Auth (14 days), Firewall (7 days)</div>
                    </div>
                    <div style="display:flex; gap:8px; margin-bottom:8px;">
                        <select data-field="log_type" style="padding:8px 10px; border:1px solid #ccc; border-radius:4px; font-family:inherit; font-size:0.83rem;">
                            <option value="dns">DNS Queries</option>
                            <option value="auth">Authentication Log</option>
                            <option value="firewall">Firewall Log</option>
                        </select>
                        <input type="text" data-field="log_filter" placeholder="Filter (username, domain, IP, or leave blank for all)"
                               style="flex:1; padding:8px 12px; border:1px solid #ccc; border-radius:4px; font-family:inherit; font-size:0.83rem;">
                        <button data-action="query" style="padding:8px 18px; background:#dc2626; color:#fff; border:none; border-radius:4px; font-weight:700; cursor:pointer; font-family:inherit;">Query</button>
                    </div>
                    <div style="font-size:0.72rem; color:#888; margin-bottom:12px;">
                        Examples: filter=e.morales, filter=crimson-dawn-finance.net, filter=185.220.101.45
                    </div>
                    <div data-results>
                        <div style="color:#888; font-size:0.78rem; text-align:center; padding:20px;">Select a log type and optionally enter a filter, then click Query.</div>
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

    _handleWhois: function(query, engine) {
        if (!query.trim()) return '<div style="color:#888; font-size:0.8rem; padding:16px; text-align:center;">Enter a domain or IP to look up.</div>';
        const q = query.trim().toLowerCase();

        const records = {
            'crimson-dawn-finance.net': `<pre style="font-family:monospace; font-size:0.78rem; line-height:1.6; white-space:pre-wrap; background:#f8f8f8; border:1px solid #ddd; padding:12px; border-radius:4px;">Domain Name: CRIMSON-DAWN-FINANCE.NET
Registrar: NameCheap, Inc.
Registrar URL: https://www.namecheap.com
Updated Date: 2026-05-15
Created Date: <span style="color:#dc2626; font-weight:bold;">2026-05-15</span>  &larr; 3 days BEFORE the wire fraud
Registrant: REDACTED FOR PRIVACY (WhoisGuard, Inc.)
Registrant Email: [REDACTED]
Name Servers: ns1.cloudflare.com, ns2.cloudflare.com
DNSSEC: <span style="color:#dc2626;">unsigned</span>
Status: clientTransferProhibited

<span style="color:#dc2626; font-weight:bold;">ANALYST NOTE: Recently registered (same week as attack), privacy-protected,
unsigned DNSSEC, Cloudflare nameservers. Consistent with phishing infrastructure.</span></pre>`,
            'nakamura-suppliers-corp.com': `<pre style="font-family:monospace; font-size:0.78rem; line-height:1.6; white-space:pre-wrap; background:#f8f8f8; border:1px solid #ddd; padding:12px; border-radius:4px;">Domain Name: NAKAMURA-SUPPLIERS-CORP.COM
Registrar: NameCheap, Inc.
Created Date: <span style="color:#dc2626; font-weight:bold;">2026-05-14</span>  &larr; 4 days before attack
Registrant: REDACTED FOR PRIVACY (WhoisGuard, Inc.)
Name Servers: ns1.cloudflare.com, ns2.cloudflare.com
DNSSEC: unsigned

<span style="color:#dc2626; font-weight:bold;">ANALYST NOTE: Lookalike domain for nakamura-supplies.com (legitimate vendor).
Note the added "-corp" suffix. Recently registered, same registrar and privacy
service as crimson-dawn-finance.net -- same operator infrastructure.</span></pre>`,
            'nakamura-supplies.com': `<pre style="font-family:monospace; font-size:0.78rem; line-height:1.6; white-space:pre-wrap; background:#f8f8f8; border:1px solid #ddd; padding:12px; border-radius:4px;">Domain Name: NAKAMURA-SUPPLIES.COM
Registrar: Network Solutions, LLC
Created Date: <span style="color:#2ecc71; font-weight:bold;">2009-03-18</span>  &larr; 17 years old -- legitimate business
Updated Date: 2025-01-12
Registrant Organization: Nakamura Supplies International, Inc.
Registrant Country: JP
Name Servers: ns1.dnsmadeeasy.com, ns2.dnsmadeeasy.com
DNSSEC: signed

<span style="color:#2ecc71; font-weight:bold;">ANALYST NOTE: Long-established domain (2009), DNSSEC signed, real corporate
registrant. This is the LEGITIMATE vendor domain. Not suspicious.</span></pre>`,
            'emberwolf-c2.duckdns.org': `<pre style="font-family:monospace; font-size:0.78rem; line-height:1.6; white-space:pre-wrap; background:#f8f8f8; border:1px solid #ddd; padding:12px; border-radius:4px;">Domain Name: emberwolf-c2.duckdns.org
Service: DuckDNS (free dynamic DNS -- duckdns.org)
Subdomain operator: [USER-CONTROLLED -- anonymous registration]
Created: [DuckDNS does not expose creation timestamps]
Resolves to: <span style="color:#dc2626; font-weight:bold;">185.220.101.45</span>
TTL: 60 seconds (typical for dynamic DNS C2 -- enables rapid IP rotation)

<span style="color:#dc2626; font-weight:bold;">ANALYST NOTE: DuckDNS is a legitimate dynamic DNS service that is commonly
abused by threat actors (see MITRE T1568). Operator-controlled subdomain names.
The subdomain name "emberwolf-c2" is an actor signature -- explicitly labels this
as the C2 channel. The 60-second TTL enables rapid IP rotation on detection.</span></pre>`,
            '185.220.101.45': `<pre style="font-family:monospace; font-size:0.78rem; line-height:1.6; white-space:pre-wrap; background:#f8f8f8; border:1px solid #ddd; padding:12px; border-radius:4px;">IP: 185.220.101.45
ASN: AS43350 (NForce Entertainment B.V.)
ASN Country (incorporation): NL
Block: 185.220.100.0/22
Abuse contact: abuse@nforce.nl
Tor exit node history: NO (this IP is not a Tor exit node)
First seen as malicious: 2026-04-08 (multiple campaigns)

<span style="color:#dc2626; font-weight:bold;">ANALYST NOTE: NForce Entertainment B.V. (AS43350) is a bulletproof hosting
provider with a significant abuse history. The NL country code is the
PROVIDER'S incorporation jurisdiction, NOT the operator's origin.
Do not use WHOIS ASN country as actor attribution. See IP Geolocation for
actor-origin enrichment.</span></pre>`,
            'crimson-dawn.net': `<pre style="font-family:monospace; font-size:0.78rem; line-height:1.6; white-space:pre-wrap; background:#f8f8f8; border:1px solid #ddd; padding:12px; border-radius:4px;">Domain Name: CRIMSON-DAWN.NET
Registrar: GoDaddy.com, LLC
Created Date: 2018-07-22
Updated Date: 2025-07-22
Registrant Organization: Crimson Dawn Logistics, LLC
Registrant Country: US
Name Servers: ns49.domaincontrol.com, ns50.domaincontrol.com
DNSSEC: signed

<span style="color:#2ecc71; font-weight:bold;">ANALYST NOTE: Legitimate corporate domain. Long history (2018), DNSSEC signed,
real corporate registrant. This is the company's actual domain.</span></pre>`,
            'google.com': `<pre style="font-family:monospace; font-size:0.78rem; line-height:1.6; white-space:pre-wrap; background:#f8f8f8; border:1px solid #ddd; padding:12px; border-radius:4px;">Domain Name: GOOGLE.COM
Registrar: MarkMonitor Inc.
Created Date: 1997-09-15
Registrant Organization: Google LLC
Registrant Country: US
Name Servers: ns1.google.com (and 3 others)
DNSSEC: signed</pre>`,
            '8.8.8.8': `<pre style="font-family:monospace; font-size:0.78rem; line-height:1.6; white-space:pre-wrap; background:#f8f8f8; border:1px solid #ddd; padding:12px; border-radius:4px;">IP: 8.8.8.8
ASN: AS15169 (Google LLC)
Block: 8.8.8.0/24
Organization: Google LLC (Public DNS)
Country: US</pre>`
        };

        const record = records[q];
        if (record) {
            return `<div style="margin-top:8px;"><div style="font-size:0.72rem; color:#888; margin-bottom:6px;">WHOIS result for: <code>${this._escHtml(query)}</code></div>${record}</div>`;
        }

        return `<div style="background:#f8f8f8; border:1px solid #ddd; padding:12px; border-radius:4px; font-family:monospace; font-size:0.78rem; color:#888;">
            No WHOIS record found for: ${this._escHtml(query)}<br>
            The domain or IP may not exist or may not be in the local WHOIS mirror.<br>
            Try: crimson-dawn-finance.net, nakamura-suppliers-corp.com, nakamura-supplies.com, emberwolf-c2.duckdns.org, 185.220.101.45, crimson-dawn.net
        </div>`;
    },

    _handleHashLookup: function(hash, engine) {
        if (!hash.trim()) return '<div style="color:#888; font-size:0.8rem; padding:16px;">Paste a SHA-256 hash and click Analyze.</div>';
        const h = hash.trim().toLowerCase().replace(/\s+/g, '');

        if (h === 'b3a4f8c2d7e91a6e5f8c2b1d9a4f7e3c8b6d2a1f9e7c4b8a6d3f2e1c9b8a7f4d') {
            return `<div style="border:2px solid #dc2626; border-radius:4px; padding:14px; background:#fff0f0; font-size:0.82rem; font-family:system-ui,sans-serif;">
                <div style="font-size:1rem; font-weight:700; color:#dc2626; margin-bottom:10px;">VERDICT: MALICIOUS</div>
                <table style="width:100%; border-collapse:collapse;">
                    <tr style="border-bottom:1px solid #fdd;"><td style="padding:6px 8px; color:#888; width:180px;">Hash</td><td style="padding:6px 8px; font-family:monospace; font-size:0.75rem; color:#dc2626;">${h}</td></tr>
                    <tr style="border-bottom:1px solid #fdd;"><td style="padding:6px 8px; color:#888;">Engine Consensus</td><td style="padding:6px 8px; font-weight:700; color:#dc2626;">47/68 engines MALICIOUS</td></tr>
                    <tr style="border-bottom:1px solid #fdd;"><td style="padding:6px 8px; color:#888;">Family</td><td style="padding:6px 8px; font-weight:700;">Cobalt Strike Beacon (stage-1 loader)</td></tr>
                    <tr style="border-bottom:1px solid #fdd;"><td style="padding:6px 8px; color:#888;">Delivery</td><td style="padding:6px 8px;">MSDT URL-protocol exploit via Word external template reference</td></tr>
                    <tr style="border-bottom:1px solid #fdd;"><td style="padding:6px 8px; color:#888;">Associated CVE</td><td style="padding:6px 8px; font-weight:700;"><a href="https://cve.crimson-intel.net/cve/CVE-2022-30190" style="color:#dc2626;">CVE-2022-30190</a> ("Follina")</td></tr>
                    <tr style="border-bottom:1px solid #fdd;"><td style="padding:6px 8px; color:#888;">First Seen</td><td style="padding:6px 8px;">2026-04-12</td></tr>
                    <tr><td style="padding:6px 8px; color:#888;">Associated Campaigns</td><td style="padding:6px 8px; font-weight:700; color:#dc2626;">EMBERWOLF (financial sector targeting)</td></tr>
                </table>
                <div style="margin-top:10px; padding:8px; background:#fff8f8; border:1px solid #fcc; border-radius:4px; font-size:0.77rem; color:#555;">
                    <b>Submission format note:</b> The "Family" field returns "Cobalt Strike Beacon" -- the flag normalizes this to <code>COBALT_STRIKE</code> (drop the "Beacon" component; Beacon is the loader's name within the Cobalt Strike framework, not a distinct family).
                </div>
            </div>`;
        }

        if (h === '4a1b2c3d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b') {
            return `<div style="border:2px solid #2ecc71; border-radius:4px; padding:14px; background:#f0fff4; font-size:0.82rem; font-family:system-ui,sans-serif;">
                <div style="font-size:1rem; font-weight:700; color:#2ecc71; margin-bottom:8px;">VERDICT: CLEAN</div>
                <table style="width:100%; border-collapse:collapse;">
                    <tr style="border-bottom:1px solid #d0f0dd;"><td style="padding:6px 8px; color:#888; width:180px;">Hash</td><td style="padding:6px 8px; font-family:monospace; font-size:0.75rem;">${h}</td></tr>
                    <tr style="border-bottom:1px solid #d0f0dd;"><td style="padding:6px 8px; color:#888;">Engine Consensus</td><td style="padding:6px 8px; font-weight:700; color:#2ecc71;">0/68 engines MALICIOUS</td></tr>
                    <tr style="border-bottom:1px solid #d0f0dd;"><td style="padding:6px 8px; color:#888;">File Type</td><td style="padding:6px 8px;">Microsoft Excel spreadsheet</td></tr>
                    <tr><td style="padding:6px 8px; color:#888;">IOCs</td><td style="padding:6px 8px; color:#2ecc71;">None detected</td></tr>
                </table>
                <div style="margin-top:8px; font-size:0.77rem; color:#888;">This file is benign. If you submitted a flag derived from this hash, you are working on the wrong attachment. Re-read Phase 1.</div>
            </div>`;
        }

        return `<div style="border:1px solid #ddd; border-radius:4px; padding:14px; background:#f8f8f8; font-size:0.82rem; font-family:system-ui,sans-serif;">
            <div style="color:#888; font-weight:700; margin-bottom:8px;">Hash: <code style="font-size:0.75rem;">${this._escHtml(h.substring(0, 40))}...</code></div>
            <div style="color:#888;">Status: Not found in local hash database.</div>
            <div style="font-size:0.77rem; color:#888; margin-top:8px;">Make sure you are hashing a file from <code>/home/ir-lead/downloads/</code>. Download the phishing attachment from the webmail first (Phase 2, Step 2.1).</div>
        </div>`;
    },

    _handleThreatIntel: function(query, engine) {
        if (!query.trim()) return '<div style="color:#888; font-size:0.8rem; padding:16px; text-align:center;">Enter an IOC, CVE, or malware family name.</div>';
        const q = query.toLowerCase().trim();

        // The intel search returns actors with >= 2/4 TTP overlap
        const isEmberwolfQuery = q.includes('emberwolf') || q.includes('cobalt strike') || q.includes('cobalt_strike') || q.includes('cve-2022-30190') || q.includes('follina') || q.includes('duckdns') || q.includes('185.220.101.45');

        if (!isEmberwolfQuery && q.length < 3) {
            return '<div style="color:#888; font-size:0.8rem; padding:16px;">Enter at least 3 characters or a known IOC.</div>';
        }

        if (!isEmberwolfQuery) {
            return `<div style="color:#888; font-size:0.8rem; padding:16px;">No actor profiles matched "${this._escHtml(query)}".<br><br>Try searching by IOC from previous phases: the C2 domain, the malware family, the CVE, or the X-Originating-IP.</div>`;
        }

        return `<div style="font-family:system-ui,sans-serif; font-size:0.82rem;">
        <div style="color:#888; font-size:0.77rem; margin-bottom:12px;">SEARCH MATCHED: 3 ACTOR PROFILES with at least 2/4 TTP overlap</div>

        <div style="border:2px solid #dc2626; border-radius:4px; padding:14px; margin-bottom:14px; background:#fff0f0;">
            <div style="font-size:0.95rem; font-weight:700; color:#dc2626; margin-bottom:8px;">EMBERWOLF &nbsp;<span style="font-size:0.75rem; font-weight:400; color:#888;">(TTP match: 4/4)</span> &nbsp;<span style="font-size:0.78rem; font-weight:600; color:#dc2626;">RU-aligned</span></div>
            <table style="width:100%; border-collapse:collapse; font-size:0.78rem;">
                <tr style="border-bottom:1px solid #fdd;"><td style="padding:5px 8px; color:#888; width:160px;">First observed</td><td style="padding:5px 8px;">2024-Q2</td></tr>
                <tr style="border-bottom:1px solid #fdd;"><td style="padding:5px 8px; color:#888;">Targeting</td><td style="padding:5px 8px; font-weight:600;">Financial services, accounts payable, vendor systems</td></tr>
                <tr style="border-bottom:1px solid #fdd;"><td style="padding:5px 8px; color:#888;">Initial access</td><td style="padding:5px 8px;">Spear-phishing with invoice lures (T1566.001)</td></tr>
                <tr style="border-bottom:1px solid #fdd;"><td style="padding:5px 8px; color:#888;">Exploit</td><td style="padding:5px 8px; color:#dc2626; font-weight:600;">CVE-2022-30190 (Follina) via Word external template</td></tr>
                <tr style="border-bottom:1px solid #fdd;"><td style="padding:5px 8px; color:#888;">Post-exploit</td><td style="padding:5px 8px; color:#dc2626; font-weight:600;">Cobalt Strike Beacon (stage-1 loader)</td></tr>
                <tr style="border-bottom:1px solid #fdd;"><td style="padding:5px 8px; color:#888;">Infrastructure</td><td style="padding:5px 8px; color:#dc2626; font-weight:600;">Dynamic-DNS C2 (typically DuckDNS, No-IP)</td></tr>
                <tr style="border-bottom:1px solid #fdd;"><td style="padding:5px 8px; color:#888;">Naming convention</td><td style="padding:5px 8px; color:#dc2626; font-weight:600;">"emberwolf-c2.*" / "crimson-*-finance.*"</td></tr>
                <tr style="border-bottom:1px solid #fdd;"><td style="padding:5px 8px; color:#888;">Sector confidence</td><td style="padding:5px 8px; font-weight:600;">HIGH (financial services exclusively)</td></tr>
                <tr><td style="padding:5px 8px; color:#888;">Geo confidence</td><td style="padding:5px 8px; font-weight:600; color:#dc2626;">HIGH (RU)</td></tr>
            </table>
            <div style="margin-top:8px; padding:6px 8px; background:#fff8f8; border:1px solid #fcc; border-radius:4px; font-size:0.75rem; color:#dc2626;">
                <b>Disambiguator:</b> The naming-convention TTP (emberwolf-c2.* + crimson-*-finance.*) is unique to EMBERWOLF. CRIMSONTIDE and BLACKHELIX do not share this pattern.
            </div>
        </div>

        <div style="border:1px solid #ddd; border-radius:4px; padding:12px; margin-bottom:10px; background:#fafafa;">
            <div style="font-size:0.9rem; font-weight:700; color:#555; margin-bottom:6px;">CRIMSONTIDE &nbsp;<span style="font-size:0.73rem; font-weight:400; color:#888;">(TTP match: 2/4)</span> &nbsp;<span style="font-size:0.76rem; color:#888;">criminal, US-based</span></div>
            <div style="font-size:0.78rem; line-height:1.6; color:#555;">
                First observed: 2023-Q4 &nbsp;|&nbsp; Targeting: Cross-sector, opportunistic, ransomware-driven<br>
                Exploit: varied -- observed CVE-2017-11882, CVE-2022-30190, CVE-2024-21412<br>
                Post-exploit: Cobalt Strike Beacon &rarr; ransomware (Black Basta, Royal)<br>
                Infrastructure: rotating VPS, <b>no dynamic-DNS preference</b><br>
                Naming convention: <b>random / non-themed</b><br>
                Sector confidence: LOW (opportunistic) &nbsp;|&nbsp; Geo confidence: MEDIUM (US-based affiliate network)
            </div>
        </div>

        <div style="border:1px solid #ddd; border-radius:4px; padding:12px; margin-bottom:10px; background:#fafafa;">
            <div style="font-size:0.9rem; font-weight:700; color:#555; margin-bottom:6px;">BLACKHELIX &nbsp;<span style="font-size:0.73rem; font-weight:400; color:#888;">(TTP match: 2/4)</span> &nbsp;<span style="font-size:0.76rem; color:#888;">criminal, transient</span></div>
            <div style="font-size:0.78rem; line-height:1.6; color:#555;">
                First observed: 2025-Q1 &nbsp;|&nbsp; Targeting: Banking, fintech<br>
                Exploit: browser zero-days + Word macros (<b>NOT Follina</b>)<br>
                Post-exploit: custom banking malware (Marblegate) -- <b>not Cobalt Strike</b><br>
                Infrastructure: compromised legitimate hosting<br>
                Naming convention: legitimate-corp-lookalike (similar surface appearance, different pattern logic)<br>
                Sector confidence: HIGH (banking) &nbsp;|&nbsp; Geo confidence: LOW (operator unknown)
            </div>
        </div>

        <div style="border:1px solid #ddd; border-radius:4px; padding:12px; margin-bottom:10px; background:#fafafa;">
            <div style="font-size:0.9rem; font-weight:700; color:#555; margin-bottom:6px;">IRONHAVEN &nbsp;<span style="font-size:0.73rem; font-weight:400; color:#888;">(TTP match: 1/4 -- below threshold)</span> &nbsp;<span style="font-size:0.76rem; color:#888;">CN-aligned</span></div>
            <div style="font-size:0.78rem; line-height:1.6; color:#555;">
                First observed: 2022-Q1 &nbsp;|&nbsp; Targeting: Intellectual property theft -- manufacturing, pharma, defense<br>
                No observed use of Follina or Cobalt Strike. Custom implants only. Financial-sector targeting: NONE.
            </div>
        </div>

        <div style="border:1px solid #ddd; border-radius:4px; padding:12px; margin-bottom:10px; background:#fafafa;">
            <div style="font-size:0.9rem; font-weight:700; color:#555; margin-bottom:6px;">NORTHGALE &nbsp;<span style="font-size:0.73rem; font-weight:400; color:#888;">(TTP match: 1/4 -- below threshold)</span> &nbsp;<span style="font-size:0.76rem; color:#888;">KP-aligned</span></div>
            <div style="font-size:0.78rem; line-height:1.6; color:#555;">
                First observed: 2023-Q3 &nbsp;|&nbsp; Targeting: Financial heists (cryptocurrency, SWIFT)<br>
                Exploit: uses different malware families; no Follina or Cobalt Strike on record. Different infrastructure pattern.
            </div>
        </div>

        <div style="border:1px solid #ddd; border-radius:4px; padding:12px; background:#fafafa;">
            <div style="font-size:0.9rem; font-weight:700; color:#555; margin-bottom:6px;">DESERTKITE &nbsp;<span style="font-size:0.73rem; font-weight:400; color:#888;">(TTP match: 0/4)</span> &nbsp;<span style="font-size:0.76rem; color:#888;">IR-aligned</span></div>
            <div style="font-size:0.78rem; line-height:1.6; color:#555;">
                First observed: 2021-Q4 &nbsp;|&nbsp; Targeting: Energy sector, critical infrastructure<br>
                No overlap with this incident's TTPs. Included for completeness.
            </div>
        </div>
        </div>`;
    },

    _handleIpGeo: function(ip, engine) {
        if (!ip.trim()) return '<div style="color:#888; font-size:0.8rem; padding:16px; text-align:center;">Enter an IP address.</div>';
        const q = ip.trim();

        const geoData = {
            '185.220.101.45': `<div style="font-family:system-ui,sans-serif; font-size:0.82rem;">
                <div style="border:2px solid #e67e22; border-radius:4px; padding:12px; background:#fffaf0; margin-bottom:12px;">
                    <table style="width:100%; border-collapse:collapse;">
                        <tr style="border-bottom:1px solid #ffe0b2;"><td style="padding:6px 8px; color:#888; width:200px;">IP</td><td style="padding:6px 8px; font-weight:700;">185.220.101.45</td></tr>
                        <tr style="border-bottom:1px solid #ffe0b2;"><td style="padding:6px 8px; color:#888;">Edge location</td><td style="padding:6px 8px;">Amsterdam, NL (CDN/VPS provider edge node)</td></tr>
                        <tr style="border-bottom:1px solid #ffe0b2;"><td style="padding:6px 8px; color:#888;">ASN owner</td><td style="padding:6px 8px;">NForce Entertainment B.V. (incorporated: NL)</td></tr>
                        <tr style="border-bottom:1px solid #ffe0b2;"><td style="padding:6px 8px; color:#888;">ASN country (incorporation)</td><td style="padding:6px 8px;">NL &nbsp;<span style="color:#e67e22; font-weight:600;">&larr; this is where the VPS provider is incorporated, NOT where the operator lives</span></td></tr>
                    </table>
                </div>
                <div style="border:2px solid #dc2626; border-radius:4px; padding:12px; background:#fff0f0;">
                    <div style="font-weight:700; color:#dc2626; margin-bottom:8px;">CAUTION: VPS edge geolocation &ne; operator origin.</div>
                    <div style="color:#888; font-size:0.77rem; margin-bottom:8px;">Cross-reference with WHOIS, threat-intel enrichment, and behavioral patterns.</div>
                    <div style="font-size:0.8rem; margin-bottom:4px;"><b>WHOIS registrant:</b> REDACTED (commercial privacy proxy)</div>
                    <div style="font-size:0.8rem; font-weight:700; color:#dc2626; margin-bottom:8px;">HexIntel actor-origin enrichment: RU (HIGH confidence)</div>
                    <div style="font-size:0.77rem; color:#555; line-height:1.7;">
                        Sources contributing to enrichment:<br>
                        &nbsp;&nbsp;- Behavioral C2 callback windows align with UTC+3 working hours<br>
                        &nbsp;&nbsp;- Language artifacts in builder strings recovered from prior EMBERWOLF samples<br>
                        &nbsp;&nbsp;- Infrastructure-overlap analysis with prior RU-aligned campaigns (HexIntel feed)<br>
                        &nbsp;&nbsp;- Open-source reporting from prior incidents
                    </div>
                </div>
            </div>`,
            '51.140.83.42': `<div style="font-size:0.82rem; border:1px solid #ddd; padding:12px; border-radius:4px; background:#f8f8f8;">
                <b>51.140.83.42</b><br>
                Location: London, UK<br>
                ASN: AS8075 (Microsoft Corporation -- Azure UK South)<br>
                VPN provider: Known commercial VPN egress (UK region)<br>
                <div style="margin-top:8px; color:#888; font-size:0.77rem;">This IP is consistent with commercial VPN usage from London.</div>
            </div>`,
            '104.21.45.122': `<div style="font-size:0.82rem; border:1px solid #ddd; padding:12px; border-radius:4px; background:#f8f8f8;">
                <b>104.21.45.122</b><br>
                Location: San Jose, CA, US (Cloudflare CDN edge)<br>
                ASN: AS13335 (Cloudflare, Inc.)<br>
                Note: Cloudflare edge IP -- does not indicate origin of hosted content.
            </div>`,
            '8.8.8.8': `<div style="font-size:0.82rem; border:1px solid #ddd; padding:12px; border-radius:4px; background:#f8f8f8;"><b>8.8.8.8</b><br>Location: Mountain View, CA, US<br>ASN: AS15169 (Google LLC)<br>Service: Google Public DNS</div>`,
            '52.86.14.93': `<div style="font-size:0.82rem; border:1px solid #ddd; padding:12px; border-radius:4px; background:#f8f8f8;"><b>52.86.14.93</b><br>Location: Ashburn, VA, US<br>ASN: AS14618 (Amazon Web Services)<br>Service: AWS EC2 us-east-1</div>`,
            '204.111.12.88': `<div style="font-size:0.82rem; border:1px solid #ddd; padding:12px; border-radius:4px; background:#f8f8f8;"><b>204.111.12.88</b><br>Location: Philadelphia, PA, US<br>ASN: AS7922 (Comcast Cable Communications)<br>Note: Residential broadband range</div>`,
            '10.0.4.18': `<div style="font-size:0.82rem; border:1px solid #ddd; padding:12px; border-radius:4px; background:#f8f8f8;"><b>10.0.4.18</b><br>Location: PRIVATE (RFC 1918 -- internal network)<br>No geolocation available for private IP ranges.</div>`
        };

        const result = geoData[q];
        if (result) {
            return `<div style="margin-top:8px;"><div style="font-size:0.72rem; color:#888; margin-bottom:8px;">Geolocation result for: <code>${this._escHtml(q)}</code></div>${result}</div>`;
        }

        // Default for unknown IPs
        const octets = q.split('.');
        if (octets.length === 4 && octets.every(o => !isNaN(parseInt(o)))) {
            return `<div style="font-size:0.82rem; border:1px solid #ddd; padding:12px; border-radius:4px; background:#f8f8f8; color:#888;">
                <b>${this._escHtml(q)}</b><br>
                Geolocation: Not found in local database.<br>
                <div style="font-size:0.77rem; margin-top:6px;">Key IPs in this investigation: 185.220.101.45 (attacker C2), 51.140.83.42 (London VPN), 104.21.45.122 (Cloudflare edge)</div>
            </div>`;
        }

        return `<div style="color:#888; font-size:0.8rem; padding:12px; border:1px solid #ddd; border-radius:4px;">Invalid IP address format. Enter a valid IPv4 address.</div>`;
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
            return `<div style="color:#888; font-size:0.8rem; padding:12px;">No DNS entries matched filter: "${this._escHtml(filter)}"</div>`;
        }

        const rows = entries.map(e => {
            const flagStyle = e.flag ? 'color:#dc2626; font-weight:700;' : 'color:#888;';
            return `<tr style="border-bottom:1px solid #eee;">
                <td style="padding:5px 8px; font-family:monospace; font-size:0.75rem; white-space:nowrap;">${e.ts}</td>
                <td style="padding:5px 8px; font-family:monospace; font-size:0.75rem;">${e.user}</td>
                <td style="padding:5px 8px; font-family:monospace; font-size:0.75rem; ${e.flag ? 'color:#dc2626; font-weight:700;' : ''}">${e.domain}</td>
                <td style="padding:5px 8px; font-family:monospace; font-size:0.75rem;">${e.ip}</td>
                <td style="padding:5px 8px; font-size:0.73rem; ${flagStyle}">${e.flag || '&mdash;'}</td>
            </tr>`;
        }).join('');

        return `<div style="font-size:0.72rem; color:#888; margin-bottom:6px;">DNS Query Log -- ${entries.length} entries${filter ? ` matching "${this._escHtml(filter)}"` : ''}</div>
        <div style="overflow-x:auto;">
        <table style="width:100%; border-collapse:collapse; font-size:0.78rem; min-width:600px;">
            <thead><tr style="background:#f5f5f5;">
                <th style="padding:6px 8px; text-align:left; color:#555; white-space:nowrap;">Timestamp</th>
                <th style="padding:6px 8px; text-align:left; color:#555;">User</th>
                <th style="padding:6px 8px; text-align:left; color:#555;">Query Domain</th>
                <th style="padding:6px 8px; text-align:left; color:#555;">Response IP</th>
                <th style="padding:6px 8px; text-align:left; color:#555;">Note</th>
            </tr></thead>
            <tbody>${rows}</tbody>
        </table></div>
        <div style="margin-top:8px; padding:8px; background:#fff8f0; border:1px solid #e67e22; border-radius:4px; font-size:0.77rem; color:#e67e22;">
            <b>Phase 5 tip:</b> Filter by the lookalike domain to see who queried it. Then check which of those users also queried the C2 domain -- that's the one whose machine executed the payload.
        </div>`;
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
            return `<div style="color:#888; font-size:0.8rem; padding:12px;">No auth entries matched filter: "${this._escHtml(filter)}"</div>`;
        }

        const rows = entries.map(e => {
            let noteStyle = '';
            let notePrefix = '';
            if (e.note.startsWith('UNEXPLAINED')) { noteStyle = 'color:#dc2626; font-weight:700;'; notePrefix = ''; }
            else if (e.note.startsWith('EXPLAINED')) { noteStyle = 'color:#e67e22;'; notePrefix = ''; }
            return `<tr style="border-bottom:1px solid #eee;">
                <td style="padding:5px 8px; font-family:monospace; font-size:0.73rem; white-space:nowrap;">${e.ts}</td>
                <td style="padding:5px 8px; font-family:monospace; font-size:0.75rem;">${e.user}</td>
                <td style="padding:5px 8px; font-family:monospace; font-size:0.75rem;">${e.src}</td>
                <td style="padding:5px 8px; font-family:monospace; font-size:0.75rem;">${e.ws}</td>
                <td style="padding:5px 8px; font-size:0.72rem; ${noteStyle}">${e.note || '&mdash;'}</td>
            </tr>`;
        }).join('');

        return `<div style="font-size:0.72rem; color:#888; margin-bottom:6px;">Authentication Log -- ${entries.length} entries${filter ? ` matching "${this._escHtml(filter)}"` : ''}</div>
        <div style="overflow-x:auto;">
        <table style="width:100%; border-collapse:collapse; font-size:0.78rem; min-width:600px;">
            <thead><tr style="background:#f5f5f5;">
                <th style="padding:6px 8px; text-align:left; color:#555; white-space:nowrap;">Timestamp</th>
                <th style="padding:6px 8px; text-align:left; color:#555;">User</th>
                <th style="padding:6px 8px; text-align:left; color:#555;">Source IP</th>
                <th style="padding:6px 8px; text-align:left; color:#555;">Workstation</th>
                <th style="padding:6px 8px; text-align:left; color:#555;">Provenance</th>
            </tr></thead>
            <tbody>${rows}</tbody>
        </table></div>
        <div style="margin-top:8px; padding:8px; background:#fff0f0; border:1px solid #dc2626; border-radius:4px; font-size:0.77rem; color:#dc2626;">
            <b>W4 lesson:</b> UNEXPLAINED anomalies are threats. EXPLAINED anomalies (calendar + HR ticket + prior session history) are not. Read the provenance line -- the SIEM annotates inline.
        </div>`;
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
            return `<div style="color:#888; font-size:0.8rem; padding:12px;">No firewall entries matched filter: "${this._escHtml(filter)}"</div>`;
        }

        const rows = entries.map(e => {
            const noteStyle = e.note.includes('C2') ? 'color:#dc2626; font-weight:700;' : 'color:#888;';
            return `<tr style="border-bottom:1px solid #eee;">
                <td style="padding:5px 8px; font-family:monospace; font-size:0.72rem; white-space:nowrap;">${e.ts}</td>
                <td style="padding:5px 8px; font-family:monospace; font-size:0.72rem;">${e.src}</td>
                <td style="padding:5px 8px; font-family:monospace; font-size:0.72rem;">${e.dst}</td>
                <td style="padding:5px 8px; font-family:monospace; font-size:0.72rem;">${e.proto}</td>
                <td style="padding:5px 8px; font-family:monospace; font-size:0.72rem;">${e.bytes}</td>
                <td style="padding:5px 8px; font-size:0.72rem; ${noteStyle}">${e.note || '&mdash;'}</td>
            </tr>`;
        }).join('');

        return `<div style="font-size:0.72rem; color:#888; margin-bottom:6px;">Firewall Log -- ${entries.length} entries${filter ? ` matching "${this._escHtml(filter)}"` : ''}</div>
        <div style="overflow-x:auto;">
        <table style="width:100%; border-collapse:collapse; font-size:0.78rem; min-width:600px;">
            <thead><tr style="background:#f5f5f5;">
                <th style="padding:6px 8px; text-align:left; color:#555; white-space:nowrap;">Timestamp</th>
                <th style="padding:6px 8px; text-align:left; color:#555;">Source</th>
                <th style="padding:6px 8px; text-align:left; color:#555;">Destination</th>
                <th style="padding:6px 8px; text-align:left; color:#555;">Proto</th>
                <th style="padding:6px 8px; text-align:left; color:#555;">Bytes</th>
                <th style="padding:6px 8px; text-align:left; color:#555;">Note</th>
            </tr></thead>
            <tbody>${rows}</tbody>
        </table></div>`;
    },

    _renderPatchDashboard: function(engine) {
        const db = PISFinalConfig._db;
        const applied = db.patch_state.applied;

        const cves = [
            { id: 'CVE-2024-21412', title: 'Internet Shortcut Files Security Feature Bypass Vulnerability', severity: 'HIGH', score: '8.1' },
            { id: 'CVE-2022-30190', title: 'Microsoft Windows Support Diagnostic Tool (MSDT) Remote Code Execution Vulnerability ("Follina")', severity: 'HIGH', score: '7.8' },
            { id: 'CVE-2024-26169', title: 'Windows Error Reporting Service Elevation of Privilege Vulnerability', severity: 'MEDIUM (EoP)', score: '7.8' }
        ];

        const outstanding = cves.filter(c => !applied.includes(c.id));
        const appliedList = cves.filter(c => applied.includes(c.id));

        const outRows = outstanding.map(c => `
            <tr style="border-bottom:1px solid #eee;">
                <td style="padding:8px 10px; font-family:monospace; font-size:0.8rem; color:#dc2626;">${c.id}</td>
                <td style="padding:8px 10px; font-size:0.8rem;">${c.title}</td>
                <td style="padding:8px 10px; font-size:0.78rem; color:#e67e22; font-weight:700;">${c.severity}</td>
                <td style="padding:8px 10px;">
                    <button data-action="apply_patch" data-cve="${c.id}"
                            style="padding:5px 12px; background:#dc2626; color:#fff; border:none; border-radius:3px; cursor:pointer; font-size:0.78rem; font-family:inherit; font-weight:600;">Apply Patch</button>
                </td>
            </tr>`).join('');

        const appliedRows = appliedList.map(c => `
            <tr style="border-bottom:1px solid #eee; background:#f0fff4;">
                <td style="padding:8px 10px; font-family:monospace; font-size:0.8rem; color:#2ecc71;">${c.id}</td>
                <td style="padding:8px 10px; font-size:0.8rem;">${c.title}</td>
                <td style="padding:8px 10px; font-size:0.78rem; color:#2ecc71; font-weight:700;">PATCHED</td>
                <td style="padding:8px 10px;">
                    <button data-action="undo_patch" data-cve="${c.id}"
                            style="padding:5px 12px; background:#888; color:#fff; border:none; border-radius:3px; cursor:pointer; font-size:0.78rem; font-family:inherit;">Undo / Re-evaluate</button>
                </td>
            </tr>`).join('');

        // Check Phase 6 completion and reveal composite flag if all 3 actions done.
        // Nancy round 3 BLOCK fix: require EXCLUSIVE presence of CVE-2022-30190.
        // If any wrong patches (CVE-2024-21412 or CVE-2024-26169) remain applied
        // without being Undone, Phase 6 does NOT complete -- the student must
        // Undo wrong patches before the gate releases. This enforces the
        // pedagogical loop the walkthrough specifies (identify the exploited
        // vulnerability, patch ONLY that one, validate, then filter).
        const wrongPatchesStillApplied = applied.some(
            cve => cve !== 'CVE-2022-30190'
        );
        const phaseComplete = applied.includes('CVE-2022-30190') &&
            !wrongPatchesStillApplied &&
            db.rapid7_scan_state.result === 'clean' &&
            db.mail_filter_state.active;

        const compositeBlock = phaseComplete ? `
            <div style="margin-top:16px; padding:14px; background:#f0fff4; border:2px solid #2ecc71; border-radius:4px;">
                <div style="font-size:0.9rem; font-weight:700; color:#2ecc71; margin-bottom:8px;">Containment + Remediation: COMPLETE</div>
                <div style="font-size:0.82rem; color:#555; margin-bottom:6px;">All three Phase 6 actions completed correctly:</div>
                <div style="font-size:0.78rem; color:#555; margin-bottom:10px;">
                    <div style="color:#2ecc71;">&#10003; CVE-2022-30190 patched</div>
                    <div style="color:#2ecc71;">&#10003; Rapid7 InsightVM scan: CLEAN (Scan ID: S7K9P2)</div>
                    <div style="color:#2ecc71;">&#10003; Mail filter rule active</div>
                </div>
                <div style="padding:10px; background:#fff; border:2px solid #2ecc71; border-radius:4px; text-align:center;">
                    <div style="font-size:0.75rem; color:#888; margin-bottom:4px; letter-spacing:0.1em; text-transform:uppercase;">Composite Flag</div>
                    <div style="font-size:1.2rem; font-weight:700; color:#2ecc71; font-family:monospace;">REMED-OK-S7K9P2</div>
                    <div style="font-size:0.72rem; color:#888; margin-top:4px;">Submit this as Flag 6</div>
                </div>
            </div>` : '';

        return `<div style="font-family:system-ui,sans-serif; max-width:860px; margin:0 auto; padding:16px;">
            <div style="border-bottom:2px solid #dc2626; padding-bottom:10px; margin-bottom:16px;">
                <div style="font-size:0.72rem; color:#888; letter-spacing:0.1em; text-transform:uppercase;">CRIMSON DAWN -- PATCH MANAGEMENT</div>
                <div style="font-size:1rem; font-weight:700; color:#222; margin-top:2px;">WS-EMORALES-01 &mdash; Vulnerability Status</div>
                <div style="font-size:0.72rem; color:#888;">Host: WS-EMORALES-01 (10.0.4.18) &nbsp;|&nbsp; User: e.morales &nbsp;|&nbsp; OS: Windows 10 22H2</div>
            </div>

            <div style="margin-bottom:16px;">
                <div style="font-size:0.82rem; font-weight:700; color:#dc2626; margin-bottom:8px;">Outstanding Vulnerabilities (${outstanding.length})</div>
                ${outstanding.length > 0 ? `
                <table style="width:100%; border-collapse:collapse; font-size:0.8rem;">
                    <thead><tr style="background:#f5f5f5;">
                        <th style="padding:8px 10px; text-align:left; color:#555;">CVE ID</th>
                        <th style="padding:8px 10px; text-align:left; color:#555;">Title</th>
                        <th style="padding:8px 10px; text-align:left; color:#555;">Severity</th>
                        <th style="padding:8px 10px; text-align:left; color:#555;">Action</th>
                    </tr></thead>
                    <tbody>${outRows}</tbody>
                </table>
                <div style="margin-top:8px; padding:8px; background:#fff8f0; border:1px solid #e67e22; border-radius:4px; font-size:0.77rem; color:#e67e22;">
                    <b>Instruction:</b> Apply patches one at a time. Identify the exploited vulnerability (from Phase 2) and patch it first.
                </div>` : '<div style="color:#2ecc71; font-size:0.8rem; padding:8px;">No outstanding vulnerabilities. Verify with Rapid7 InsightVM scan.</div>'}
            </div>

            ${appliedList.length > 0 ? `
            <div style="margin-bottom:16px;">
                <div style="font-size:0.82rem; font-weight:700; color:#2ecc71; margin-bottom:8px;">Recently Applied (${appliedList.length})</div>
                <table style="width:100%; border-collapse:collapse; font-size:0.8rem;">
                    <thead><tr style="background:#f5f5f5;">
                        <th style="padding:8px 10px; text-align:left; color:#555;">CVE ID</th>
                        <th style="padding:8px 10px; text-align:left; color:#555;">Title</th>
                        <th style="padding:8px 10px; text-align:left; color:#555;">Status</th>
                        <th style="padding:8px 10px; text-align:left; color:#555;">Action</th>
                    </tr></thead>
                    <tbody>${appliedRows}</tbody>
                </table>
            </div>` : ''}

            <div style="margin-top:8px; font-size:0.73rem; color:#888;">
                Next step after patching: validate with <a href="https://insightvm.crimson-dawn.net" style="color:#dc2626;">Rapid7 InsightVM</a> scan.
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

        let resultBlock = '';
        if (scanResult === 'clean') {
            resultBlock = `<div style="padding:14px; background:#f0fff4; border:2px solid #2ecc71; border-radius:4px; margin-top:14px;">
                <div style="font-size:0.95rem; font-weight:700; color:#2ecc71; margin-bottom:8px;">SCAN RESULT: CLEAN</div>
                <div style="font-size:0.82rem; color:#555; line-height:1.7;">
                    Previously detected: CVE-2022-30190 &mdash; <span style="color:#2ecc71; font-weight:700;">REMEDIATED</span><br>
                    <b>Scan ID: S7K9P2</b><br>
                    Scan completed: ${new Date().toISOString().slice(0, 16).replace('T', ' ')} UTC<br>
                    Target: WS-EMORALES-01 (10.0.4.18)
                </div>
            </div>`;
        } else if (scanResult === 'vulnerable') {
            resultBlock = `<div style="padding:14px; background:#fff0f0; border:2px solid #dc2626; border-radius:4px; margin-top:14px;">
                <div style="font-size:0.95rem; font-weight:700; color:#dc2626; margin-bottom:8px;">SCAN RESULT: VULNERABILITY DETECTED</div>
                <div style="font-size:0.82rem; color:#dc2626; font-weight:700; margin-bottom:4px;">- CVE-2022-30190 (Follina) &mdash; STILL EXPLOITABLE</div>
                <div style="font-size:0.78rem; color:#555;">Patch the correct vulnerability (CVE-2022-30190) and re-scan.</div>
            </div>`;
        } else if (scanResult === 'wrong_patch') {
            resultBlock = `<div style="padding:14px; background:#fff0f0; border:2px solid #dc2626; border-radius:4px; margin-top:14px;">
                <div style="font-size:0.95rem; font-weight:700; color:#dc2626; margin-bottom:8px;">SCAN RESULT: VULNERABILITY DETECTED</div>
                <div style="font-size:0.82rem; color:#dc2626; font-weight:700; margin-bottom:4px;">- CVE-2022-30190 (Follina) &mdash; STILL EXPLOITABLE</div>
                <div style="font-size:0.78rem; color:#555;">Wrong patch detected. Undo the incorrectly-applied patch in the Patch Management console, then apply CVE-2022-30190 and re-scan.</div>
            </div>`;
        }

        return `<div style="font-family:system-ui,sans-serif; max-width:720px; margin:0 auto; padding:16px;">
            <div style="border-bottom:2px solid #dc2626; padding-bottom:10px; margin-bottom:16px;">
                <div style="font-size:0.72rem; color:#888; letter-spacing:0.1em; text-transform:uppercase;">RAPID7 INSIGHTVM &mdash; CRIMSON DAWN</div>
                <div style="font-size:1rem; font-weight:700; color:#222; margin-top:2px;">Vulnerability Scan Console</div>
                <div style="font-size:0.72rem; color:#888;">Rapid7 InsightVM v6.6.218 &middot; Agent registered</div>
            </div>
            <div style="padding:12px; border:1px solid #ddd; border-radius:4px; background:#f8f8f8; margin-bottom:14px;">
                <div style="font-size:0.82rem; font-weight:700; margin-bottom:6px;">WS-EMORALES-01 &mdash; Scan Target</div>
                <table style="font-size:0.78rem; border-collapse:collapse;">
                    <tr><td style="padding:4px 10px; color:#888; width:120px;">Host</td><td style="padding:4px 10px;">WS-EMORALES-01</td></tr>
                    <tr><td style="padding:4px 10px; color:#888;">IP</td><td style="padding:4px 10px;">10.0.4.18</td></tr>
                    <tr><td style="padding:4px 10px; color:#888;">OS</td><td style="padding:4px 10px;">Windows 10 22H2 (19045.4651)</td></tr>
                    <tr><td style="padding:4px 10px; color:#888;">Agent</td><td style="padding:4px 10px; color:#2ecc71;">CONNECTED</td></tr>
                </table>
            </div>
            <button data-action="run_scan" style="padding:10px 24px; background:#dc2626; color:#fff; border:none; border-radius:4px; font-weight:700; cursor:pointer; font-size:0.85rem; font-family:inherit;">Run Vulnerability Scan</button>
            ${resultBlock}
            <div data-results></div>
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

        // Nancy round 3 BLOCK fix: scan returns CLEAN only when correct patch
        // is the ONLY applied patch. Co-applied wrong patches make the host
        // non-compliant -- the IR loop requires identifying the exploited CVE
        // and patching THAT one, not bulk-patching everything.
        if (correctOnly) {
            db.rapid7_scan_state.ran = true;
            db.rapid7_scan_state.result = 'clean';
            db.rapid7_scan_state.scan_id = 'S7K9P2';
            return `<div style="margin-top:14px; padding:14px; background:#f0fff4; border:2px solid #2ecc71; border-radius:4px; font-size:0.85rem;">
                <div style="font-weight:700; color:#2ecc71; margin-bottom:6px;">SCAN RESULT: CLEAN</div>
                <div style="color:#555; font-size:0.78rem; margin-bottom:6px;">Scan ID: <span style="font-family:monospace; color:#222;">S7K9P2</span></div>
                <div style="color:#555; font-size:0.78rem;">Previously detected: CVE-2022-30190 (Follina) &mdash; <strong style="color:#2ecc71;">REMEDIATED</strong></div>
                <div style="color:#888; font-size:0.75rem; margin-top:6px; font-style:italic;">Workstation WS-EMORALES-01 cleared. Proceed to mail filter step.</div>
            </div>`;
        }

        if (mixedCoApplied) {
            // Correct patch is applied but so is a wrong one -- non-compliant.
            db.rapid7_scan_state.ran = true;
            db.rapid7_scan_state.result = 'wrong_patch';
            db.rapid7_scan_state.scan_id = null;
            const wrongPatches = applied.filter(c => c !== 'CVE-2022-30190');
            return `<div style="margin-top:14px; padding:14px; background:#fff5f5; border:2px solid #dc2626; border-radius:4px; font-size:0.85rem;">
                <div style="font-weight:700; color:#dc2626; margin-bottom:6px;">SCAN RESULT: NON-COMPLIANT (extraneous patches applied)</div>
                <div style="color:#555; font-size:0.78rem; margin-bottom:4px;">CVE-2022-30190 (Follina): <strong style="color:#2ecc71;">REMEDIATED</strong></div>
                <div style="color:#555; font-size:0.78rem; margin-bottom:6px;">Extraneous patches applied: <strong style="color:#dc2626;">${wrongPatches.join(', ')}</strong></div>
                <div style="color:#888; font-size:0.75rem; margin-top:6px; font-style:italic;">Crimson Dawn's IR runbook requires patching only the exploited CVE during active incident response, to preserve root-cause evidence and avoid masking other vulnerabilities. Undo the unrelated patches and re-scan.</div>
            </div>`;
        }

        if (wrongOnly) {
            db.rapid7_scan_state.ran = true;
            db.rapid7_scan_state.result = 'wrong_patch';
            db.rapid7_scan_state.scan_id = null;
            return `<div style="margin-top:14px; padding:14px; background:#fff5f5; border:2px solid #dc2626; border-radius:4px; font-size:0.85rem;">
                <div style="font-weight:700; color:#dc2626; margin-bottom:6px;">SCAN RESULT: VULNERABILITY DETECTED</div>
                <div style="color:#555; font-size:0.78rem; margin-bottom:6px;">CVE-2022-30190 (Follina) &mdash; <strong style="color:#dc2626;">STILL EXPLOITABLE</strong></div>
                <div style="color:#888; font-size:0.75rem; margin-top:6px; font-style:italic;">Patch the correct vulnerability and re-scan. Re-identify the exploited CVE from Phase 2.</div>
            </div>`;
        }

        db.rapid7_scan_state.ran = true;
        db.rapid7_scan_state.result = 'vulnerable';
        db.rapid7_scan_state.scan_id = null;
        return `<div style="margin-top:14px; padding:14px; background:#fff5f5; border:2px solid #dc2626; border-radius:4px; font-size:0.85rem;">
            <div style="font-weight:700; color:#dc2626; margin-bottom:6px;">SCAN RESULT: VULNERABILITY DETECTED</div>
            <div style="color:#555; font-size:0.78rem; margin-bottom:6px;">CVE-2022-30190 (Follina) &mdash; <strong style="color:#dc2626;">STILL EXPLOITABLE</strong></div>
            <div style="color:#888; font-size:0.75rem; margin-top:6px; font-style:italic;">No patches applied. Open Patch Management and apply the exploited CVE.</div>
        </div>`;
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
