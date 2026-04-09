/* ============================================================
   DISPATCH LAB — Box EM001: Can't Send Email
   CompTIA A+ Core 2 — Email Sending Troubleshooting
   Config: SMTP relay denied, port 25 blocked, SPF missing,
   attachment limit, DLP quarantine
   5 distinct scenarios
   ============================================================ */

var EM001Config = {

    title: 'Can\'t Send Email',
    subtitle: 'Return to Sender — Email Delivery Troubleshooting',
    difficulty: 'Beginner',
    accent: '#22c55e',
    storageKey: 'hexworth_lab_em001',
    registryId: 'em001-cant-send',
    trackerKey: 'lab_em001',

    tutorialMode: true,

    tutorial: {
        steps: [
            { title: 'Open the Help Desk Ticket', tip: 'Double-click the Help Desk Ticket to read the user\'s email complaint.', trigger: { event: 'window_open', match: { type: 'ticket' } } },
            { title: 'Check the Mail Console', tip: 'Open the Mail Server Console to review mail queues, NDRs, and server status.', trigger: { event: 'window_open', match: { type: 'mail_console' } } },
            { title: 'Investigate with CLI', tip: 'Use terminal tools to check SMTP settings, DNS records, port connectivity, and mail flow.', trigger: { event: 'command', match: { cmd: 'contains:smtp' }, alt: [{ event: 'command', match: { cmd: 'contains:nslookup' } }, { event: 'command', match: { cmd: 'contains:telnet' } }] } },
            { title: 'Apply the fix', tip: 'Correct the mail configuration, DNS record, relay setting, or DLP policy.', trigger: { event: 'command', match: { cmd: 'contains:fix' }, alt: [{ event: 'command', match: { cmd: 'contains:mail-fix' } }] } },
            { title: 'Capture the flag', tip: 'After fixing the email issue, the flag will appear.', trigger: { event: 'flag_correct', match: { flagId: 'fixed' } } }
        ]
    },

    certObjectives: {
        certPath: 'A+ Core 2',
        mappings: [
            { flagId: 'fixed', objective: '1.6', description: 'Configure email client settings', skill: 'SMTP/IMAP Configuration' },
            { flagId: 'fixed', objective: '4.6', description: 'Troubleshoot common networking issues', skill: 'Email Delivery Troubleshooting' }
        ]
    },

    _scenarioFlags: { smtp_relay: null, port_blocked: null, spf_missing: null, attachment_size: null, dlp_quarantine: null },

    _scenarios: [
        {
            id: 'smtp_relay',
            name: 'SMTP Relay Denied',
            ticketSubject: 'All outgoing emails bouncing with "550 5.7.1 Relay access denied"',
            ticketDetail: 'User Tom Harris in Sales is getting bounce-backs on every outgoing email with error "550 5.7.1 Relay access denied." He can receive emails fine but nothing he sends goes through. This started after he was moved to the new remote office at the branch location. His Outlook settings haven\'t changed. Other users at the main office are sending fine.',
            ticketExtra: 'IT Note: The branch office has a different public IP (203.0.113.50) than the main office. The mail server\'s relay restrictions may not include the branch IP range. Check the SMTP relay connector settings.',
            affectedUser: 'tharris',
            fixDescription: 'Add branch office IP to SMTP relay allowed list',
            stateOverrides: { _relayDenied: true, _branchIp: '203.0.113.50' }
        },
        {
            id: 'port_blocked',
            name: 'Port 25 Blocked by ISP',
            ticketSubject: 'Remote worker can\'t send email — connection times out to mail server',
            ticketDetail: 'Remote employee Sarah Patel is working from home and cannot send emails. Outlook shows "Sending" for several minutes then fails with a timeout error. She can receive emails via IMAP without any issues. She\'s connected to her home ISP (Comcast). This was working fine when she was in the office last week.',
            ticketExtra: 'IT Note: Many residential ISPs block outbound port 25 (SMTP) to prevent spam. The mail server also listens on port 587 (submission port) with STARTTLS. The user\'s Outlook may be configured for port 25 direct SMTP instead of port 587 with authentication.',
            affectedUser: 'spatel',
            fixDescription: 'Change outgoing port from 25 to 587 with STARTTLS',
            stateOverrides: { _portBlocked: true }
        },
        {
            id: 'spf_missing',
            name: 'SPF Record Missing',
            ticketSubject: 'Emails to Gmail and Yahoo recipients being rejected — "SPF validation failed"',
            ticketDetail: 'Multiple users report that emails sent to external recipients at Gmail, Yahoo, and Outlook.com are being rejected with NDRs containing "550 5.7.23 SPF validation failed." Internal emails work fine. Emails to some other business domains also work. This seems to affect only major email providers with strict SPF enforcement. The problem started 3 days ago.',
            ticketExtra: 'IT Note: The DNS hosting was migrated to a new provider last Thursday. The SPF record for hexworth.local may not have been migrated. Major providers (Google, Microsoft, Yahoo) enforce SPF/DMARC strictly and will reject mail without valid SPF. Check DNS for the SPF TXT record.',
            affectedUser: 'Multiple users',
            fixDescription: 'Recreate the SPF TXT record in DNS',
            stateOverrides: { _spfMissing: true }
        },
        {
            id: 'attachment_size',
            name: 'Attachment Over 25MB Limit',
            ticketSubject: 'User can\'t email a 38MB presentation file — keeps getting rejected',
            ticketDetail: 'Marketing manager Lisa Park needs to send a 38MB PowerPoint presentation to a client. Every time she tries, she gets an NDR: "552 5.3.4 Message size exceeds fixed maximum message size (26214400)." She says the file cannot be compressed further and the client specifically asked for it via email. She needs this sent before her 3 PM meeting.',
            ticketExtra: 'IT Note: The mail server has a 25 MB attachment limit. Most external mail servers also enforce 25 MB limits. Options: (1) Use the corporate file sharing portal, (2) Upload to OneDrive and send a sharing link, (3) Compress/split the file. The user should not request a mail server limit increase.',
            affectedUser: 'lpark',
            fixDescription: 'Guide user to use file sharing instead of email for large files',
            stateOverrides: { _oversizeFile: true, _fileSize: '38 MB' }
        },
        {
            id: 'dlp_quarantine',
            name: 'DLP Quarantine',
            ticketSubject: 'Email stuck in outbox — "Message quarantined by DLP policy" notification',
            ticketDetail: 'Legal assistant James Wong is trying to send a contract to opposing counsel. The email sits in his outbox for a minute then he receives a notification: "Your message has been quarantined for review by a Data Loss Prevention policy." The contract contains standard legal terms but also includes financial figures and account numbers in the appendix. James says he sends contracts externally all the time and this never happened before.',
            ticketExtra: 'IT Note: A new DLP policy was deployed yesterday that flags emails containing patterns matching bank account numbers (routing + account number format). The policy is set to "quarantine and notify" rather than "block." The admin can review and release quarantined messages. James\'s contract legitimately contains client bank account numbers in the payment terms section.',
            affectedUser: 'jwong',
            fixDescription: 'Review DLP quarantine, release legitimate email, adjust policy exception',
            stateOverrides: { _dlpQuarantined: true }
        }
    ],

    _defaultHints: [
        { id: 'hint1', text: 'Open the Mail Server Console to check mail flow status and error logs.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Use smtp-test, nslookup, and telnet to diagnose connectivity and DNS issues.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Each sending failure has a different root cause: relay, port, DNS, size, or policy.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'Use mail-fix to apply the appropriate correction.', cost: 50, penalty: -50 }
    ],

    _scenarioHints: {
        smtp_relay: [
            { id: 'hint1', text: 'The error is "Relay access denied." The branch office IP isn\'t authorized to relay.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Use "smtp-test --relay" to see which IPs are authorized for relay.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Add the branch IP: "mail-fix --add-relay 203.0.113.50"', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run: mail-fix --add-relay 203.0.113.50 to add the branch office to the allowed relay list.', cost: 150, penalty: -150 }
        ],
        port_blocked: [
            { id: 'hint1', text: 'Use "telnet mail.hexworth.local 25" and "telnet mail.hexworth.local 587" to test port connectivity.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Port 25 is blocked by the ISP. Port 587 (submission) is open and supports STARTTLS.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Update the user\'s mail config: "mail-fix --set-port 587 --user spatel"', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run: mail-fix --set-port 587 --user spatel --starttls to switch to the submission port.', cost: 150, penalty: -150 }
        ],
        spf_missing: [
            { id: 'hint1', text: 'Use "nslookup -type=TXT hexworth.local" to check if the SPF record exists.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'The SPF record is missing from DNS. It was lost during the DNS migration.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Recreate the SPF record: "mail-fix --add-spf"', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run: mail-fix --add-spf to add "v=spf1 ip4:198.51.100.10 include:_spf.google.com -all" to DNS.', cost: 150, penalty: -150 }
        ],
        attachment_size: [
            { id: 'hint1', text: 'The 25 MB limit is standard. The 38 MB file cannot be sent via email.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Use file sharing instead: "mail-fix --share-link --file presentation.pptx"', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Generate a OneDrive sharing link and send that instead of the file.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run: mail-fix --share-link --user lpark to generate a sharing link.', cost: 150, penalty: -150 }
        ],
        dlp_quarantine: [
            { id: 'hint1', text: 'The email was quarantined by DLP, not blocked. Check "dlp-queue" for quarantined messages.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'The contract contains legitimate bank account numbers that triggered the new DLP policy.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Release the email and add an exception: "mail-fix --dlp-release --user jwong"', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run: mail-fix --dlp-release --user jwong --add-exception legal to release and whitelist legal dept.', cost: 150, penalty: -150 }
        ]
    },

    _ensureScenario(engine) {
        if (!engine.state._scenarioSelected) return false;
        if (engine.state._scenarioId != null && !EM001Config._flagRestored) {
            EM001Config._flagRestored = true;
            var scenario = EM001Config._scenarios[engine.state._scenarioId];
            if (scenario) EM001Config.hints = EM001Config._scenarioHints[scenario.id] || EM001Config._defaultHints;
        }
        return true;
    },

    _applyScenario(engine, idx) {
        engine.state._scenarioId = idx;
        engine.state._scenarioSelected = true;
        engine.state._relayDenied = false; engine.state._portBlocked = false;
        engine.state._spfMissing = false; engine.state._oversizeFile = false;
        engine.state._dlpQuarantined = false;
        engine.state._labComplete = false; engine.state._flagRevealed = false;

        var overrides = EM001Config._scenarios[idx].stateOverrides || {};
        for (var key in overrides) { engine.state[key] = overrides[key]; }
        EM001Config._flagRestored = true;
        EM001Config.hints = EM001Config._scenarioHints[EM001Config._scenarios[idx].id] || EM001Config._defaultHints;
        engine.save();
    },

    _getScenario(engine) { return engine.state._scenarioId == null ? null : EM001Config._scenarios[engine.state._scenarioId]; },
    _requireScenario(engine) { return engine.state._scenarioSelected ? null : '\nERROR: No active ticket.\nOpen the Help Desk Ticket first.'; },
    _escHtml(str) { var d = document.createElement('div'); d.textContent = str; return d.innerHTML; },

    boot: {
        biosLines: ['American Megatrends UEFI v2.20', 'Initializing helpdesk workstation...', 'Memory: 16384 MB OK', 'NVMe: WD SN750 (512GB)', 'Loading Windows...'],
        grubEntries: ['Windows 10 Pro'], loginUser: 'Technician'
    },

    desktop: {
        icons: [
            { id: 'cmd',    label: 'Command\nPrompt',  icon: '>_',  app: 'terminal' },
            { id: 'mail',   label: 'Mail Server\nConsole', icon: 'MX',  app: 'mail_console' },
            { id: 'ticket', label: 'Help Desk\nTicket', icon: 'HD',  app: 'ticket' },
            { id: 'hints',  label: 'Hints',             icon: '?',   app: 'hints' },
            { id: 'reset',  label: 'Reset\nLab',        icon: 'RST', app: 'reset_lab' }
        ]
    },

    terminal: { user: 'Technician', hostname: 'HELPDESK01', startDir: 'C:\\Users\\Technician', promptStyle: 'windows', welcome: 'Microsoft Windows [Version 10.0.19045.3803]\n(c) Microsoft Corporation.\n' },
    filesystem: { '/': { type: 'dir', children: {} } },
    flags: [{ id: 'fixed', value: '{{FLAG:scenarioId}}', points: 500 }],
    scoring: { base: 0, maxScore: 600, hintPenalty: true, wrongFlagPenalty: 0, speedBonus: { threshold: 600000, points: 100 }, timeBonusThreshold: 1800 },
    hints: [
        { id: 'hint1', text: 'Open the Mail Server Console to check delivery status.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Use smtp-test, nslookup, telnet to diagnose.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Each scenario has a different cause: relay, port, DNS, size, or policy.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'Use mail-fix to apply the correction.', cost: 50, penalty: -50 }
    ],
    lore: {
        intro: 'Help desk tickets are piling up — users can\'t send email. As the desktop support tech, diagnose each sending failure and get mail flowing again.',
        scenario: 'Each scenario has a different root cause for email delivery failure. Use the right diagnostic tools for each problem.',
        outro: 'Email is flowing again. Your systematic troubleshooting identified and resolved the delivery failures.'
    },
    phases: [
        { id: 'investigate', name: 'Investigation', description: 'Read the ticket and check the mail server status.', requiredFlags: [], unlocks: ['diagnose'], locked: false },
        { id: 'diagnose', name: 'Diagnosis', description: 'Identify the root cause using CLI tools.', requiredFlags: [], unlocks: ['fix'], locked: true },
        { id: 'fix', name: 'Fix', description: 'Apply the correction to restore mail flow.', requiredFlags: [], unlocks: ['verify'], locked: true },
        { id: 'verify', name: 'Verification', description: 'Confirm email is sending and capture the flag.', requiredFlags: ['fixed'], unlocks: [], locked: true }
    ],

    commands: {

        'smtp-test': function(args, term, engine) {
            var gate = EM001Config._requireScenario(engine);
            if (gate) return gate;
            var scenario = EM001Config._getScenario(engine);
            var joined = args.join(' ').toLowerCase();

            if (joined.includes('--relay')) {
                var relayList = '  Authorized relay IPs:\n    198.51.100.0/24   (Main office)\n    10.0.0.0/8        (Internal network)';
                if (scenario && scenario.id === 'smtp_relay' && engine.state._relayDenied) {
                    relayList += '\n\n  [!] Branch office IP 203.0.113.50 is NOT in the relay list\n  [!] This explains the "Relay access denied" errors';
                }
                return '\nSMTP Relay Configuration — mail.hexworth.local\n==============================================\n' + relayList;
            }

            if (joined.includes('--send')) {
                if (scenario && scenario.id === 'smtp_relay' && engine.state._relayDenied) {
                    return '\nSMTP Test Send:\n  Connecting to mail.hexworth.local:25... OK\n  EHLO HELPDESK01... 250 OK\n  MAIL FROM:<test@hexworth.local>... 250 OK\n  RCPT TO:<external@gmail.com>... 550 5.7.1 Relay access denied\n\n  [!] FAILURE: Server refuses to relay for source IP 203.0.113.50';
                }
                return '\nSMTP Test Send:\n  Connecting to mail.hexworth.local:25... OK\n  Send test... OK\n  Message queued for delivery.';
            }

            return '\nUsage: smtp-test --relay          Show relay configuration\n       smtp-test --send           Send test message\n       smtp-test --port <num>     Test specific port';
        },

        nslookup: function(args, term, engine) {
            var gate = EM001Config._requireScenario(engine);
            if (gate) return gate;
            var scenario = EM001Config._getScenario(engine);
            var joined = args.join(' ').toLowerCase();

            if (joined.includes('-type=txt') && joined.includes('hexworth')) {
                if (scenario && scenario.id === 'spf_missing' && engine.state._spfMissing) {
                    return '\nServer:  dc01.hexworth.local\nAddress:  10.0.2.10\n\nhexworth.local\n  primary name server = ns1.newdns.com\n  responsible mail addr = admin.hexworth.local\n\n  [!] No TXT (SPF) record found for hexworth.local\n  [!] SPF record was not migrated during DNS provider change';
                }
                return '\nServer:  dc01.hexworth.local\nAddress:  10.0.2.10\n\nhexworth.local    text = "v=spf1 ip4:198.51.100.10 include:_spf.google.com -all"';
            }

            if (joined.includes('-type=mx') && joined.includes('hexworth')) {
                return '\nServer:  dc01.hexworth.local\nAddress:  10.0.2.10\n\nhexworth.local    MX preference = 10, mail exchanger = mail.hexworth.local\nmail.hexworth.local    internet address = 198.51.100.10';
            }

            return '\nUsage: nslookup [-type=MX|TXT|A] <domain>\n\nExamples:\n  nslookup -type=MX hexworth.local\n  nslookup -type=TXT hexworth.local';
        },

        telnet: function(args, term, engine) {
            var gate = EM001Config._requireScenario(engine);
            if (gate) return gate;
            var scenario = EM001Config._getScenario(engine);
            var joined = args.join(' ').toLowerCase();

            if (joined.includes('25')) {
                if (scenario && scenario.id === 'port_blocked') {
                    return '\nConnecting To mail.hexworth.local:25...\n\nConnection timed out. Could not open connection to the host.\n\n[!] Port 25 appears to be blocked (ISP filtering)';
                }
                return '\nConnecting To mail.hexworth.local:25...\n220 mail.hexworth.local ESMTP Postfix\n\nConnection successful. Type QUIT to exit.';
            }

            if (joined.includes('587')) {
                return '\nConnecting To mail.hexworth.local:587...\n220 mail.hexworth.local ESMTP Postfix\n\nConnection successful. Port 587 (submission) is open.\nUse STARTTLS for encrypted submission.';
            }

            if (joined.includes('993') || joined.includes('143')) {
                return '\nConnecting To mail.hexworth.local:' + (joined.includes('993') ? '993' : '143') + '...\n* OK IMAP server ready\n\nConnection successful. IMAP is working.';
            }

            return '\nUsage: telnet <hostname> <port>\n\nCommon mail ports:\n  25    SMTP (may be blocked by ISP)\n  587   SMTP Submission (with STARTTLS)\n  143   IMAP\n  993   IMAPS (IMAP over SSL)\n  110   POP3\n  995   POP3S';
        },

        'dlp-queue': function(args, term, engine) {
            var gate = EM001Config._requireScenario(engine);
            if (gate) return gate;
            var scenario = EM001Config._getScenario(engine);

            if (scenario && scenario.id === 'dlp_quarantine') {
                return '\nDLP Quarantine Queue\n=====================\n  ID        Sender          Recipient                  Policy Rule              Time\n  DLP-0847  jwong           opposing.counsel@lawfirm.com  Bank-Account-Pattern   2026-03-29 11:45:22\n\n  Details for DLP-0847:\n    Triggered Rule: "Outbound Financial Data"\n    Pattern Match: Bank routing number (071000013) + account number format\n    Location: Attachment — Contract_v3_Final.pdf, page 12, Appendix B\n    Risk: Medium (legitimate business communication likely)\n    Action: Quarantine and Notify\n\n  1 message in quarantine. Use "mail-fix --dlp-release --user jwong" to release.';
            }
            return '\nDLP Quarantine Queue\n=====================\n  No messages in quarantine.';
        },

        'mail-fix': function(args, term, engine) {
            var gate = EM001Config._requireScenario(engine);
            if (gate) return gate;
            var scenario = EM001Config._getScenario(engine);
            var joined = args.join(' ').toLowerCase();

            if (scenario && scenario.id === 'smtp_relay' && joined.includes('--add-relay') && joined.includes('203.0.113')) {
                engine.state._relayDenied = false;
                engine.state._labComplete = true;
                engine.state._flagRevealed = true;
                engine.save();
                setTimeout(function() { engine.notify('Branch office IP added to relay list. Email sending restored.', 'success'); }, 400);
                return '\nSMTP Relay Configuration Updated\n=================================\n  Adding 203.0.113.50 to authorized relay list... OK\n  Reloading Postfix configuration... OK\n  Testing relay from 203.0.113.50... SUCCESS\n\nBranch office can now relay through the mail server.\nTom Harris should retry sending — it will work now.\n\n=== FLAG: EM001{smtp_relay_branch_authorized} ===';
            }

            if (scenario && scenario.id === 'port_blocked' && joined.includes('--set-port') && joined.includes('587')) {
                engine.state._portBlocked = false;
                engine.state._labComplete = true;
                engine.state._flagRevealed = true;
                engine.save();
                setTimeout(function() { engine.notify('Outlook reconfigured to use port 587. Email sending restored.', 'success'); }, 400);
                return '\nOutlook Configuration Update — spatel\n=======================================\n  Changing SMTP port: 25 -> 587... OK\n  Enabling STARTTLS... OK\n  Enabling SMTP authentication... OK\n  Testing send on port 587... SUCCESS\n\nSarah\'s Outlook will now use port 587 (submission) with STARTTLS.\nPort 587 bypasses the ISP\'s port 25 block.\n\n=== FLAG: EM001{port_blocked_587_submission} ===';
            }

            if (scenario && scenario.id === 'spf_missing' && joined.includes('--add-spf')) {
                engine.state._spfMissing = false;
                engine.state._labComplete = true;
                engine.state._flagRevealed = true;
                engine.save();
                setTimeout(function() { engine.notify('SPF record added to DNS. External email delivery restored.', 'success'); }, 400);
                return '\nDNS Record Update\n==================\n  Adding TXT record to hexworth.local...\n  Record: "v=spf1 ip4:198.51.100.10 include:_spf.google.com -all"\n  TTL: 3600\n  Status: PUBLISHED\n\n  Verifying propagation... OK (visible on public DNS within 5 minutes)\n  Testing send to Gmail... SUCCESS (SPF: PASS)\n  Testing send to Yahoo... SUCCESS (SPF: PASS)\n\nSPF record restored. External providers will now accept our email.\n\n=== FLAG: EM001{spf_missing_dns_restored} ===';
            }

            if (scenario && scenario.id === 'attachment_size' && joined.includes('--share-link')) {
                engine.state._oversizeFile = false;
                engine.state._labComplete = true;
                engine.state._flagRevealed = true;
                engine.save();
                setTimeout(function() { engine.notify('Sharing link generated. User can send the link instead of the file.', 'success'); }, 400);
                return '\nFile Sharing Setup — lpark\n===========================\n  Uploading presentation.pptx (38 MB) to OneDrive... OK\n  Setting permissions: Anyone with link can view... OK\n  Generating sharing link...\n\n  Share URL: https://hexworth-my.sharepoint.com/:p:/g/personal/lpark/Ef7kQ2mN\n\n  This link has been copied to Lisa\'s clipboard.\n  She can paste it into her email instead of attaching the file.\n  The recipient can view/download the 38 MB file via the link.\n\n  Tip: Files over 25 MB should always use file sharing, not email.\n\n=== FLAG: EM001{attachment_size_share_link} ===';
            }

            if (scenario && scenario.id === 'dlp_quarantine' && joined.includes('--dlp-release') && joined.includes('jwong')) {
                engine.state._dlpQuarantined = false;
                engine.state._labComplete = true;
                engine.state._flagRevealed = true;
                engine.save();
                setTimeout(function() { engine.notify('Quarantined email released. DLP exception added for Legal.', 'success'); }, 400);
                return '\nDLP Quarantine Action\n======================\n  Reviewing quarantined message DLP-0847...\n  Sender: jwong (Legal Department)\n  Content: Contract with bank account numbers in payment terms\n  Classification: Legitimate business communication\n\n  Releasing message... OK (delivered to opposing.counsel@lawfirm.com)\n' + (joined.includes('--add-exception') ? '  Adding DLP exception for Legal department... OK\n  Legal dept emails with bank account patterns will now be scanned but not quarantined.\n' : '') +
                '\nJames\'s contract has been delivered to opposing counsel.\n\n=== FLAG: EM001{dlp_quarantine_released_exception} ===';
            }

            return '\nUsage: mail-fix [action]\n  --add-relay <ip>              Add IP to SMTP relay list\n  --set-port <port> --user <u>  Change user\'s SMTP port\n  --add-spf                     Add SPF record to DNS\n  --share-link --user <u>       Generate file sharing link\n  --dlp-release --user <u>      Release DLP quarantined message\n  --add-exception <dept>        Add DLP exception for department';
        },

        ping: function(args, term, engine) {
            var gate = EM001Config._requireScenario(engine);
            if (gate) return gate;
            if (!args.length) return '\nUsage: ping <target>';
            return '\nPinging ' + args[0] + ' with 32 bytes of data:\nReply from ' + args[0] + ': bytes=32 time=1ms TTL=128\nReply from ' + args[0] + ': bytes=32 time<1ms TTL=128';
        },

        whoami: function() { return 'HELPDESK01\\Technician'; },
        hostname: function() { return 'HELPDESK01'; },
        cls: function(args, term) { term.outputEl.innerHTML = ''; return null; },
        ipconfig: function() { return '\nIPv4 Address: 10.0.2.50\nSubnet Mask: 255.255.255.0\nDefault Gateway: 10.0.2.1\nDNS Server: 10.0.2.10'; },
        ifconfig: function() { return '\'ifconfig\' is not recognized.'; },
        grep: function() { return '\'grep\' is not recognized.'; },
        sudo: function() { return '\'sudo\' is not recognized.'; }
    },

    onAppLaunch(iconDef, engine) {
        if (iconDef.app === 'mail_console' && !engine.state._scenarioSelected) { engine.notify('Open the Help Desk Ticket first.', 'error'); return; }
        switch (iconDef.app) {
            case 'ticket':       EM001Config._openTicket(iconDef, engine); break;
            case 'mail_console': EM001Config._openMailConsole(iconDef, engine); break;
            case 'reset_lab':    EM001Config._confirmReset(engine); break;
        }
    },

    _openTicket(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var container = document.createElement('div');
        container.id = 'ticketContainer';
        container.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Help Desk Ticket', 'HD', container);
        EM001Config._ensureScenario(engine);
        if (engine.state._scenarioSelected) { EM001Config._renderTicket(engine, container); }
        else { EM001Config._renderScenarioPicker(engine, container); }
    },

    _renderScenarioPicker(engine, container) {
        var previews = [
            'Tom Harris — "All my outgoing emails bounce with relay access denied"',
            'Sarah Patel — "Can\'t send from home — Outlook times out"',
            'Multiple Users — "Emails to Gmail/Yahoo rejected — SPF validation failed"',
            'Lisa Park — "Can\'t email a 38MB PowerPoint to a client"',
            'James Wong — "Email stuck in outbox — DLP quarantine notification"'
        ];
        var html = '<div style="text-align:center; margin-bottom:20px;"><div style="color:#22c55e; font-weight:bold; font-size:1.1rem; margin-bottom:8px;">EMAIL HELP DESK QUEUE</div><div style="color:#888; font-size:0.75rem;">Select a ticket to begin troubleshooting.</div></div><div style="margin-bottom:16px;">';
        EM001Config._scenarios.forEach(function(s, i) {
            html += '<button class="em-scenario-btn" data-idx="' + i + '" style="display:block; width:100%; text-align:left; padding:12px 16px; margin-bottom:8px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.12); border-radius:4px; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem; cursor:pointer; transition:border-color 0.2s;"><div style="display:flex; justify-content:space-between; align-items:center;"><span style="color:#22c55e; font-weight:bold;">EM-' + (1000 + i) + '</span><span style="background:#f59e0b; color:#000; padding:1px 8px; border-radius:3px; font-size:0.65rem;">URGENT</span></div><div style="color:#aaa; font-size:0.7rem; margin-top:4px;">' + previews[i] + '</div></button>';
        });
        html += '</div><div style="text-align:center; border-top:1px solid rgba(255,255,255,0.1); padding-top:16px;"><button id="emRandomBtn" style="padding:10px 28px; background:#22c55e; color:#000; border:none; border-radius:4px; cursor:pointer; font-weight:bold; font-size:0.85rem; font-family:Consolas,monospace;">Random Assignment</button></div>';
        container.innerHTML = html;
        container.querySelectorAll('.em-scenario-btn').forEach(function(btn) {
            btn.addEventListener('mouseenter', function() { this.style.borderColor = '#22c55e'; });
            btn.addEventListener('mouseleave', function() { this.style.borderColor = 'rgba(255,255,255,0.12)'; });
            btn.addEventListener('click', function() { EM001Config._applyScenario(engine, parseInt(this.getAttribute('data-idx'))); EM001Config._renderTicket(engine, container); });
        });
        document.getElementById('emRandomBtn').addEventListener('click', function() { EM001Config._applyScenario(engine, Math.floor(Math.random() * EM001Config._scenarios.length)); EM001Config._renderTicket(engine, container); });
    },

    _renderTicket(engine, container) {
        var scenario = EM001Config._getScenario(engine);
        container.innerHTML = '<div style="border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:12px; margin-bottom:16px;"><div style="display:flex; justify-content:space-between; align-items:center;"><span style="color:#22c55e; font-weight:bold; font-size:1rem;">TICKET #EM-' + (1000 + engine.state._scenarioId) + '</span><span style="background:#f59e0b; color:#000; padding:2px 10px; border-radius:3px; font-size:0.7rem; font-weight:bold;">PRIORITY: URGENT</span></div></div>'
            + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem; margin-bottom:4px;">REPORTED BY</div><div style="font-weight:bold; color:#22c55e;">' + scenario.affectedUser + '</div></div>'
            + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem; margin-bottom:4px;">SUBJECT</div><div style="font-weight:bold;">' + EM001Config._escHtml(scenario.ticketSubject) + '</div></div>'
            + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem; margin-bottom:4px;">DESCRIPTION</div><div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:4px; padding:12px; line-height:1.6;">' + EM001Config._escHtml(scenario.ticketDetail) + '</div></div>'
            + (scenario.ticketExtra ? '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem; margin-bottom:4px;">INTERNAL NOTES</div><div style="background:rgba(34,197,94,0.08); border:1px solid rgba(34,197,94,0.2); border-radius:4px; padding:12px; line-height:1.6; color:#86efac;">' + EM001Config._escHtml(scenario.ticketExtra) + '</div></div>' : '')
            + '<div style="border-top:1px solid rgba(255,255,255,0.1); padding-top:12px;"><div style="color:#888; font-size:0.7rem; margin-bottom:4px;">ASSIGNED TO</div><div style="color:#2ecc71; font-weight:bold;">YOU — Desktop Support Technician</div></div>';
    },

    _openMailConsole(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var container = document.createElement('div');
        container.id = 'mailContainer';
        container.style.cssText = 'padding:16px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Mail Server Console', 'MX', container);

        var scenario = EM001Config._getScenario(engine);
        var html = '<div style="color:#22c55e; font-weight:bold; font-size:1rem; margin-bottom:12px;">Mail Server Console — mail.hexworth.local</div>';
        html += '<div style="color:#888; font-size:0.75rem; margin-bottom:12px;">Server: Postfix 3.7.2 | Status: Running</div>';

        var statusColor = engine.state._labComplete ? '#22c55e' : '#f59e0b';
        var statusText = engine.state._labComplete ? 'ALL SYSTEMS NORMAL' : 'DELIVERY ISSUES DETECTED';
        html += '<div style="padding:12px; background:rgba(' + (engine.state._labComplete ? '34,197,94' : '245,158,11') + ',0.08); border:1px solid rgba(' + (engine.state._labComplete ? '34,197,94' : '245,158,11') + ',0.2); border-radius:4px; text-align:center;"><div style="font-size:0.75rem; color:#888;">Mail Flow Status</div><div style="color:' + statusColor + '; font-weight:bold; font-size:1.1rem;">' + statusText + '</div></div>';
        html += '<div style="margin-top:16px; color:#888; font-size:0.75rem;">Use terminal tools: smtp-test, nslookup, telnet, dlp-queue, mail-fix</div>';
        container.innerHTML = html;
    },

    _confirmReset(engine) { if (confirm('Reset this lab?')) { engine.resetLab(); } }
};
