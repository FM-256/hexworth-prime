/* ============================================================
   DISPATCH LAB — Box MAIL001: Mail Queue Backing Up
   CompTIA Network+ — Mail Server Troubleshooting (N10-009)
   Config: mail queue state, Postfix/Exchange commands, GUI, scenarios
   5 distinct scenarios: relay blacklisted, MX unreachable, size limit,
   TLS failure, rate limiting
   ============================================================ */

var MAIL001Config = {

    // ==========================================================
    // BOX METADATA
    // ==========================================================

    title: 'Mail Queue Backing Up',
    subtitle: 'Outbound Is Choking — Mail Server Queue Troubleshooting',
    difficulty: 'Intermediate',
    accent: '#10b981',
    storageKey: 'hexworth_lab_mail001',
    registryId: 'mail001-queue-backup',
    trackerKey: 'lab_mail001',

    // ==========================================================
    // TUTORIAL MODE
    // ==========================================================

    tutorialMode: true,

    tutorial: {
        steps: [
            {
                title: 'Open the Help Desk Ticket',
                tip: 'Double-click the Help Desk Ticket icon to read the mail delivery complaint and get your assignment.',
                trigger: { event: 'window_open', match: { type: 'ticket' } }
            },
            {
                title: 'Check the mail queue',
                tip: 'Open the Mail Queue Monitor or use postqueue -p in the terminal to see what messages are stuck.',
                trigger: { event: 'window_open', match: { type: 'mail_queue' } }
            },
            {
                title: 'Investigate the root cause',
                tip: 'Use the terminal to run diagnostic commands — nslookup for MX records, telnet for SMTP connectivity, postqueue for queue analysis.',
                trigger: {
                    event: 'command',
                    match: { cmd: 'contains:postqueue' },
                    alt: [
                        { event: 'command', match: { cmd: 'contains:nslookup' } },
                        { event: 'command', match: { cmd: 'contains:telnet' } },
                        { event: 'window_open', match: { type: 'mail_logs' } }
                    ]
                }
            },
            {
                title: 'Apply the fix',
                tip: 'Each scenario requires a different fix — flush the queue, update DNS, adjust size limits, fix TLS, or configure rate limiting.',
                trigger: {
                    event: 'command',
                    match: { cmd: 'contains:postfix' },
                    alt: [
                        { event: 'command', match: { cmd: 'contains:postsuper' } },
                        { event: 'command', match: { cmd: 'contains:postconf' } }
                    ]
                }
            },
            {
                title: 'Capture the flag',
                tip: 'After fixing the mail flow, check the Mail Logs or Mail Queue Monitor for the recovery token.',
                trigger: { event: 'flag_correct', match: { flagId: 'fixed' } }
            }
        ]
    },

    // ==========================================================
    // CERT OBJECTIVES (Network+ mapping)
    // ==========================================================

    certObjectives: {
        certPath: 'Network+',
        mappings: [
            { flagId: 'fixed', objective: '1.6', description: 'Explain the use and purpose of network services — SMTP, DNS', skill: 'Mail Server Queue Management' },
            { flagId: 'fixed', objective: '5.3', description: 'Given a scenario, troubleshoot common network service issues', skill: 'Mail Delivery Troubleshooting' }
        ]
    },

    // ==========================================================
    // MAIL SERVER DATA
    // ==========================================================

    _servers: [
        { name: 'MAIL-GW01', ip: '10.0.1.10', role: 'Outbound Relay', software: 'Postfix 3.7.2', status: 'Running' },
        { name: 'MAIL-INT01', ip: '10.0.1.11', role: 'Internal Mailbox', software: 'Exchange 2019 CU12', status: 'Running' },
        { name: 'DNS-INT01', ip: '10.0.1.2', role: 'Internal DNS', software: 'BIND 9.18', status: 'Running' }
    ],

    // ==========================================================
    // SCENARIO FLAGS
    // ==========================================================

    _scenarioFlags: {
        relay_blacklisted: null,
        mx_unreachable:    null,
        size_limit:        null,
        tls_failure:       null,
        rate_limited:      null
    },

    // ==========================================================
    // SCENARIOS
    // ==========================================================

    _scenarios: [
        {
            id: 'relay_blacklisted',
            name: 'Outbound Relay Blacklisted',
            ticketSubject: 'External emails bouncing — recipients never get our messages',
            ticketDetail: 'Multiple departments report that emails to external addresses are bouncing back with "550 5.7.1 Service unavailable; client host blocked" errors. Internal email works fine. This started around 6 AM this morning. Sales cannot send proposals to clients and legal cannot send contracts.',
            ticketExtra: 'IT Note: Security team detected a compromised workstation sending spam at 3:14 AM. The workstation has been isolated but our relay IP 203.0.113.50 may now be listed on one or more DNSBLs.',
            affectedServer: 0,
            fixDescription: 'Identify DNSBL listing, request delisting, flush deferred queue after delisting',
            stateOverrides: { _relayBlacklisted: true, _blacklistName: 'zen.spamhaus.org' }
        },
        {
            id: 'mx_unreachable',
            name: 'Destination MX Unreachable',
            ticketDetail: 'All emails to acmecorp.com are stuck in the queue. The CEO has been waiting 3 hours for a reply to a critical negotiation email. When I check the bounce messages it says "Host or domain name not found" but acmecorp.com definitely exists — I can browse their website.',
            ticketSubject: 'Emails to acmecorp.com stuck — DNS issue suspected',
            ticketExtra: 'IT Note: The internal DNS server (10.0.1.2) was patched last night. The forward lookup zone for external resolution may have been affected. Other external domains may also be impacted.',
            affectedServer: 2,
            fixDescription: 'Fix DNS forwarder configuration on internal DNS server to restore MX lookups',
            stateOverrides: { _dnsForwarderBroken: true, _targetDomain: 'acmecorp.com' }
        },
        {
            id: 'size_limit',
            name: 'Message Size Limit Exceeded',
            ticketSubject: 'Cannot send large attachments — email bounces immediately',
            ticketDetail: 'Engineering team cannot email a 50MB CAD drawing package to our vendor. The message bounces instantly with "552 5.3.4 Message size exceeds fixed maximum message size". The file was split from a 200MB package and this 50MB portion needs to go out today. Our policy says we support up to 100MB attachments.',
            ticketExtra: 'IT Note: The Postfix message_size_limit was changed during last month\'s hardening sprint. Current setting may not match the published policy of 100MB max attachment size.',
            affectedServer: 0,
            fixDescription: 'Increase Postfix message_size_limit to match policy (104857600 bytes)',
            stateOverrides: { _sizeLimitLow: true, _currentSizeLimit: '10485760' }
        },
        {
            id: 'tls_failure',
            name: 'TLS Negotiation Failing',
            ticketSubject: 'Emails to partnercorp.com failing with TLS error',
            ticketDetail: 'All outbound email to partnercorp.com is deferred. The mail logs show "TLS is required but was not offered" errors. This started after partnercorp.com upgraded their mail server yesterday. We have a mandatory TLS policy with them per our data sharing agreement — emails must be encrypted in transit.',
            ticketExtra: 'IT Note: Our smtp_tls_security_level is set to "encrypt" for partnercorp.com via TLS policy maps. Their new server may require a different TLS version or cipher suite. Check /etc/postfix/tls_policy for the per-destination TLS enforcement.',
            affectedServer: 0,
            fixDescription: 'Update TLS policy to allow TLSv1.2+ or adjust cipher list for partnercorp.com relay',
            stateOverrides: { _tlsFailure: true, _tlsPartner: 'partnercorp.com' }
        },
        {
            id: 'rate_limited',
            name: 'Deferred Queue Growing (Rate Limiting)',
            ticketSubject: 'Marketing blast emails stuck — deferred queue at 12,000 messages',
            ticketDetail: 'Marketing launched a newsletter campaign to 15,000 subscribers. After the first 3,000 were delivered, the rest are piling up in the deferred queue. The mail logs show "450 4.7.1 Try again later" responses from multiple destination servers. Marketing needs this out by end of day.',
            ticketExtra: 'IT Note: We are sending all 15K messages through our single relay IP. Major providers (Gmail, Outlook.com) are rate limiting us. We have no rate limiting on our end, which means we are hammering their servers and getting throttled. Consider implementing outbound rate controls.',
            affectedServer: 0,
            fixDescription: 'Configure Postfix rate limiting and retry intervals, then flush deferred queue gradually',
            stateOverrides: { _rateLimited: true, _deferredCount: 12000 }
        }
    ],

    // ==========================================================
    // PER-SCENARIO HINTS
    // ==========================================================

    _defaultHints: [
        { id: 'hint1', text: 'Open the Mail Queue Monitor to see how many messages are stuck and what errors they show.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Each scenario has a different root cause. Check DNS, TLS settings, size limits, and blacklist status.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Use postqueue -p to list the queue, maillog to check errors, and nslookup for DNS verification.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'The flag appears in the Mail Logs after you apply the correct fix.', cost: 50, penalty: -50 }
    ],

    _scenarioHints: {
        relay_blacklisted: [
            { id: 'hint1', text: 'Check the bounce messages — "client host blocked" means the relay IP is on a blocklist.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Use nslookup to query your relay IP against DNSBL servers like zen.spamhaus.org.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Run: nslookup 50.113.0.203.zen.spamhaus.org (reverse the IP octets + DNSBL domain).', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'After confirming the listing, use postsuper -r ALL to requeue. In production, you would submit a delisting request.', cost: 150, penalty: -150 }
        ],
        mx_unreachable: [
            { id: 'hint1', text: 'The error is "Host or domain name not found" — this is a DNS resolution failure.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Try nslookup -type=mx acmecorp.com 10.0.1.2 to test MX lookup via the internal DNS server.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'The internal DNS forwarders are broken. Check /etc/bind/named.conf.options or use dig to verify forwarding.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Fix the DNS forwarder, then run postqueue -f to flush the deferred queue and retry delivery.', cost: 150, penalty: -150 }
        ],
        size_limit: [
            { id: 'hint1', text: 'The bounce says "Message size exceeds fixed maximum message size" — check the Postfix size limit.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Run postconf message_size_limit to see the current setting. Compare it to the policy.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'The limit is 10MB (10485760 bytes) but policy says 100MB. Run: postconf -e message_size_limit=104857600', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'After updating the limit: postfix reload, then have the user resend. Check mail logs for confirmation.', cost: 150, penalty: -150 }
        ],
        tls_failure: [
            { id: 'hint1', text: 'The log shows "TLS is required but was not offered" — there is a TLS version or cipher mismatch.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Check /etc/postfix/tls_policy for per-destination TLS settings. Also check what TLS versions the partner supports.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Use openssl s_client -connect partnercorp.com:25 -starttls smtp to test TLS negotiation manually.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Update the tls_policy map for partnercorp.com to use "encrypt protocols=TLSv1.2", then postmap and reload.', cost: 150, penalty: -150 }
        ],
        rate_limited: [
            { id: 'hint1', text: 'The 450 responses mean remote servers are telling us to slow down — we are being rate limited.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Check how fast we are sending. Look at the deferred queue count and the mail log delivery rate.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Configure rate limiting: postconf -e "smtp_destination_rate_delay = 2s" and "smtp_destination_concurrency_limit = 5"', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'After setting rate limits, reload Postfix and flush: postfix reload && postqueue -f. The queue will drain gradually.', cost: 150, penalty: -150 }
        ]
    },

    // ==========================================================
    // HELPERS
    // ==========================================================

    _ensureScenario(engine) {
        if (!engine.state._scenarioSelected) return false;
        if (engine.state._scenarioId != null && !MAIL001Config._flagRestored) {
            MAIL001Config._flagRestored = true;
            var scenario = MAIL001Config._scenarios[engine.state._scenarioId];
            if (scenario) {
                MAIL001Config.hints = MAIL001Config._scenarioHints[scenario.id] || MAIL001Config._defaultHints;
            }
        }
        return true;
    },

    _applyScenario(engine, idx) {
        engine.state._scenarioId = idx;
        engine.state._scenarioSelected = true;

        engine.state._relayBlacklisted = false;
        engine.state._dnsForwarderBroken = false;
        engine.state._sizeLimitLow = false;
        engine.state._tlsFailure = false;
        engine.state._rateLimited = false;
        engine.state._labComplete = false;
        engine.state._flagRevealed = false;
        engine.state._fixApplied = false;

        var overrides = MAIL001Config._scenarios[idx].stateOverrides || {};
        for (var key in overrides) {
            engine.state[key] = overrides[key];
        }

        var scenario = MAIL001Config._scenarios[idx];
        MAIL001Config._flagRestored = true;
        MAIL001Config.hints = MAIL001Config._scenarioHints[scenario.id] || MAIL001Config._defaultHints;

        engine.save();
    },

    _getScenario(engine) {
        if (engine.state._scenarioId == null) return null;
        return MAIL001Config._scenarios[engine.state._scenarioId];
    },

    _requireScenario(engine) {
        if (!engine.state._scenarioSelected) {
            return '\nERROR: No active ticket assigned.\nOpen the Help Desk Ticket first to receive your assignment.';
        }
        return null;
    },

    _escHtml(str) {
        var div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    // ==========================================================
    // BOOT SEQUENCE (Linux)
    // ==========================================================

    boot: {
        biosLines: [
            'Dell PowerEdge R640 UEFI BIOS v2.14.1',
            'Initializing hardware...',
            'Memory Test: 65536 MB OK',
            'Detecting drives... RAID1: PERC H730P (1.2TB)',
            'Network: Broadcom BCM5720 (4x1GbE)',
            'iDRAC: 10.0.1.100 (Enterprise)',
            'Boot device: Virtual Disk 0',
            'Loading GRUB...'
        ],
        grubEntries: [
            'Ubuntu Server 22.04 LTS',
            'Ubuntu Recovery Mode'
        ],
        loginUser: 'mailadmin'
    },

    // ==========================================================
    // DESKTOP ICONS
    // ==========================================================

    desktop: {
        icons: [
            { id: 'terminal',    label: 'Terminal',            icon: '>_',  app: 'terminal' },
            { id: 'mail_queue',  label: 'Mail Queue\nMonitor', icon: 'MQ',  app: 'mail_queue' },
            { id: 'mail_logs',   label: 'Mail\nLogs',          icon: 'LOG', app: 'mail_logs' },
            { id: 'dns_console', label: 'DNS\nConsole',        icon: 'DNS', app: 'dns_console' },
            { id: 'server_info', label: 'Server\nInfo',        icon: 'SRV', app: 'server_info' },
            { id: 'ticket',      label: 'Help Desk\nTicket',   icon: 'HD',  app: 'ticket' },
            { id: 'hints',       label: 'Hints',               icon: '?',   app: 'hints' },
            { id: 'reset',       label: 'Reset\nLab',          icon: 'RST', app: 'reset_lab' }
        ]
    },

    // ==========================================================
    // TERMINAL CONFIG (Linux)
    // ==========================================================

    terminal: {
        user: 'mailadmin',
        hostname: 'MAIL-GW01',
        startDir: '/home/mailadmin',
        promptStyle: 'linux',
        welcome: 'Ubuntu 22.04.3 LTS \\n \\l\n\nWelcome to MAIL-GW01 (Postfix 3.7.2)\nLast login: Mon Mar 30 06:14:22 2026 from 10.0.1.50\n'
    },

    // ==========================================================
    // FILESYSTEM
    // ==========================================================

    filesystem: {
        '/': { type: 'dir', children: {} }
    },

    // ==========================================================
    // FLAGS
    // ==========================================================

    flags: [
        { id: 'fixed', value: '{{FLAG:scenarioId}}', points: 500 }
    ],

    // ==========================================================
    // SCORING
    // ==========================================================

    scoring: {
        base: 0,
        minScore: 0,
        maxScore: 600,
        hintPenalty: true,
        wrongFlagPenalty: 0,
        speedBonus: { threshold: 600000, points: 100 },
        timeBonusThreshold: 1800
    },

    // ==========================================================
    // HINTS
    // ==========================================================

    hints: [
        { id: 'hint1', text: 'Open the Mail Queue Monitor to see stuck messages and their error codes.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Each scenario has a different root cause — DNS, blacklist, TLS, size, or rate limiting.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Use postqueue -p, nslookup, and mail logs to diagnose.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'The flag appears in the Mail Logs after the fix is applied.', cost: 50, penalty: -50 }
    ],

    // ==========================================================
    // LORE
    // ==========================================================

    lore: {
        intro: 'The mail queue on MAIL-GW01 is backing up. Outbound delivery is failing for different reasons depending on the scenario. As the mail administrator, diagnose the root cause and restore mail flow.',
        scenario: 'Each scenario simulates a real-world mail delivery failure. The tools are the same but the root cause differs every time. Use DNS lookups, queue inspection, and log analysis to find and fix the problem.',
        outro: 'Mail flow restored. The queue is draining normally. Your systematic diagnosis identified and resolved the delivery failure efficiently.'
    },

    // ==========================================================
    // PHASES
    // ==========================================================

    phases: [
        { id: 'investigate', name: 'Investigation', description: 'Read the ticket and examine the mail queue for stuck messages.', requiredFlags: [], unlocks: ['diagnose'], locked: false },
        { id: 'diagnose', name: 'Diagnosis', description: 'Identify the root cause — DNS, blacklist, TLS, size limit, or rate limiting.', requiredFlags: [], unlocks: ['repair'], locked: true },
        { id: 'repair', name: 'Repair', description: 'Apply the correct fix using terminal commands or configuration changes.', requiredFlags: [], unlocks: ['verify'], locked: true },
        { id: 'verify', name: 'Verification', description: 'Confirm mail is flowing and locate the flag.', requiredFlags: ['fixed'], unlocks: [], locked: true }
    ],

    // ==========================================================
    // COMMANDS
    // ==========================================================

    commands: {

        postqueue: function(args, term, engine) {
            var gate = MAIL001Config._requireScenario(engine);
            if (gate) return gate;
            var scenario = MAIL001Config._getScenario(engine);
            var joined = args.join(' ').toLowerCase();

            if (joined === '-p' || joined === '') {
                if (engine.state._fixApplied) {
                    return '\nMail queue is empty\n';
                }
                if (scenario.id === 'relay_blacklisted') {
                    return '\n-Queue ID-  --Size-- ----Arrival Time---- -Sender/Recipient-------\nA1B2C3D4E5*   4521 Mon Mar 30 06:02:14  sales@ourcompany.com\n     (host mx.clientcorp.com[198.51.100.25] refused to talk to me: 550 5.7.1 Service unavailable; client host [203.0.113.50] blocked using zen.spamhaus.org)\n                                         jsmith@clientcorp.com\nF6G7H8I9J0*   8734 Mon Mar 30 06:05:22  legal@ourcompany.com\n     (host mx.vendorltd.com[198.51.100.30] refused to talk to me: 550 5.7.1 Service unavailable; client host [203.0.113.50] blocked using zen.spamhaus.org)\n                                         contracts@vendorltd.com\nK1L2M3N4O5*   3210 Mon Mar 30 06:08:45  hr@ourcompany.com\n     (host mx.partnercorp.com[198.51.100.35] refused to talk to me: 550 5.7.1 Service unavailable; client host [203.0.113.50] blocked)\n                                         recruit@partnercorp.com\n-- 847 Kbytes in 23 Requests.\n';
                }
                if (scenario.id === 'mx_unreachable') {
                    return '\n-Queue ID-  --Size-- ----Arrival Time---- -Sender/Recipient-------\nR5S6T7U8V9*  12045 Mon Mar 30 03:14:01  ceo@ourcompany.com\n     (Host or domain name not found. Name service error for name=acmecorp.com type=MX: Host not found, try again)\n                                         partner@acmecorp.com\nW0X1Y2Z3A4*   8312 Mon Mar 30 04:22:18  procurement@ourcompany.com\n     (Host or domain name not found. Name service error for name=acmecorp.com type=MX: Host not found)\n                                         orders@acmecorp.com\n-- 312 Kbytes in 8 Requests.\n';
                }
                if (scenario.id === 'size_limit') {
                    return '\nMail queue is empty\n\n(Note: Oversized messages are rejected immediately and do not enter the queue.\n Check /var/log/mail.log for bounce details.)\n';
                }
                if (scenario.id === 'tls_failure') {
                    return '\n-Queue ID-  --Size-- ----Arrival Time---- -Sender/Recipient-------\nB5C6D7E8F9*  25600 Mon Mar 30 05:30:00  compliance@ourcompany.com\n     (TLS is required, but was not offered by host mx.partnercorp.com[198.51.100.40]:25)\n                                         legal@partnercorp.com\nG0H1I2J3K4*  18440 Mon Mar 30 05:45:12  finance@ourcompany.com\n     (TLS is required, but was not offered by host mx.partnercorp.com[198.51.100.40]:25)\n                                         billing@partnercorp.com\n-- 156 Kbytes in 6 Requests.\n';
                }
                if (scenario.id === 'rate_limited') {
                    return '\n-Queue ID-  --Size-- ----Arrival Time---- -Sender/Recipient-------\n(showing first 10 of 12,000 deferred messages)\nD1E2F3G4H5*   2104 Mon Mar 30 08:00:01  marketing@ourcompany.com\n     (host gmail-smtp-in.l.google.com[142.250.115.27] said: 450 4.7.1 Try again later)\n                                         subscriber1@gmail.com\nI6J7K8L9M0*   2104 Mon Mar 30 08:00:01  marketing@ourcompany.com\n     (host mx.outlook.com[52.101.73.22] said: 450 4.7.1 Try again later, rate limit exceeded)\n                                         user42@outlook.com\n-- 24.5 Mbytes in 12000 Requests.\n';
                }
                return '\nMail queue is empty\n';
            }

            if (joined === '-f' || joined === 'flush') {
                if (engine.state._fixApplied) {
                    return '\npostqueue: Queue is empty, nothing to flush.\n';
                }
                if (scenario.id === 'relay_blacklisted' && !engine.state._relayBlacklisted) {
                    engine.state._fixApplied = true;
                    engine.state._flagRevealed = true;
                    engine.state._labComplete = true;
                    engine.save();
                    setTimeout(function() { engine.notify('Queue flushed successfully. Messages are being delivered. Check Mail Logs for the recovery token.', 'success'); }, 400);
                    return '\npostqueue: Flushing the mail queue. 23 messages requeued for delivery.\n';
                }
                if (scenario.id === 'mx_unreachable' && !engine.state._dnsForwarderBroken) {
                    engine.state._fixApplied = true;
                    engine.state._flagRevealed = true;
                    engine.state._labComplete = true;
                    engine.save();
                    setTimeout(function() { engine.notify('Queue flushed. DNS is resolving again. Check Mail Logs for the recovery token.', 'success'); }, 400);
                    return '\npostqueue: Flushing the mail queue. 8 messages requeued for delivery.\n';
                }
                if (scenario.id === 'rate_limited' && engine.state._rateLimitConfigured) {
                    engine.state._fixApplied = true;
                    engine.state._flagRevealed = true;
                    engine.state._labComplete = true;
                    engine.save();
                    setTimeout(function() { engine.notify('Queue flushing with rate controls. Messages draining gradually. Check Mail Logs for the recovery token.', 'success'); }, 400);
                    return '\npostqueue: Flushing the mail queue. 12000 messages requeued for gradual delivery.\n(Rate limiting active: 2s delay, 5 concurrent connections per destination)\n';
                }
                if (scenario.id === 'tls_failure' && !engine.state._tlsFailure) {
                    engine.state._fixApplied = true;
                    engine.state._flagRevealed = true;
                    engine.state._labComplete = true;
                    engine.save();
                    setTimeout(function() { engine.notify('Queue flushed. TLS negotiation succeeding. Check Mail Logs for the recovery token.', 'success'); }, 400);
                    return '\npostqueue: Flushing the mail queue. 6 messages requeued for delivery.\n';
                }
                return '\npostqueue: Flushing the mail queue.\n(Messages remain deferred — root cause not yet resolved.)\n';
            }

            return '\nUsage: postqueue -p    (list queue)\n       postqueue -f    (flush queue)\n';
        },

        postconf: function(args, term, engine) {
            var gate = MAIL001Config._requireScenario(engine);
            if (gate) return gate;
            var scenario = MAIL001Config._getScenario(engine);
            var joined = args.join(' ');

            if (joined.toLowerCase().includes('message_size_limit') && !joined.includes('-e')) {
                var limit = engine.state._sizeLimitLow ? '10485760' : '104857600';
                return '\nmessage_size_limit = ' + limit + '\n';
            }

            if (joined.toLowerCase().includes('-e') && joined.toLowerCase().includes('message_size_limit')) {
                if (joined.includes('104857600')) {
                    engine.state._sizeLimitLow = false;
                    engine.save();
                    return '\npostconf: updated message_size_limit = 104857600\n(Reload Postfix to apply: postfix reload)\n';
                }
                return '\npostconf: updated message_size_limit\n(Reload Postfix to apply: postfix reload)\n';
            }

            if (joined.toLowerCase().includes('-e') && joined.toLowerCase().includes('smtp_destination_rate_delay')) {
                engine.state._rateLimitConfigured = true;
                engine.save();
                return '\npostconf: updated smtp_destination_rate_delay\n(Reload Postfix to apply: postfix reload)\n';
            }

            if (joined.toLowerCase().includes('-e') && joined.toLowerCase().includes('smtp_destination_concurrency_limit')) {
                engine.save();
                return '\npostconf: updated smtp_destination_concurrency_limit\n(Reload Postfix to apply: postfix reload)\n';
            }

            if (joined.toLowerCase().includes('smtp_tls_security_level')) {
                return '\nsmtp_tls_security_level = may\n';
            }

            if (!args.length) {
                return '\nUsage: postconf [parameter]\n       postconf -e parameter=value\n\nCommon parameters:\n  message_size_limit            Max message size in bytes\n  smtp_tls_security_level       TLS enforcement level\n  smtp_destination_rate_delay   Delay between deliveries\n  relayhost                     Relay server\n  mynetworks                    Trusted networks\n';
            }

            return '\npostconf: ' + args[0] + ' = (default)\n';
        },

        postfix: function(args, term, engine) {
            var gate = MAIL001Config._requireScenario(engine);
            if (gate) return gate;
            var scenario = MAIL001Config._getScenario(engine);
            var joined = args.join(' ').toLowerCase();

            if (joined === 'reload') {
                if (scenario.id === 'size_limit' && !engine.state._sizeLimitLow) {
                    engine.state._fixApplied = true;
                    engine.state._flagRevealed = true;
                    engine.state._labComplete = true;
                    engine.save();
                    setTimeout(function() { engine.notify('Postfix reloaded with new size limit. Users can now send large attachments. Check Mail Logs for the recovery token.', 'success'); }, 400);
                    return '\npostfix/postfix-script: refreshing the Postfix mail system\npostfix/postfix-script: done\n';
                }
                if (scenario.id === 'tls_failure' && engine.state._tlsPolicyUpdated) {
                    engine.state._tlsFailure = false;
                    engine.save();
                    return '\npostfix/postfix-script: refreshing the Postfix mail system\npostfix/postfix-script: done\n(TLS policy maps reloaded)\n';
                }
                if (scenario.id === 'rate_limited' && engine.state._rateLimitConfigured) {
                    return '\npostfix/postfix-script: refreshing the Postfix mail system\npostfix/postfix-script: done\n(Rate limiting active)\n';
                }
                return '\npostfix/postfix-script: refreshing the Postfix mail system\npostfix/postfix-script: done\n';
            }

            if (joined === 'status') {
                return '\npostfix/postfix-script: the Postfix mail system is running: PID: 1842\n';
            }

            return '\nUsage: postfix start|stop|reload|status\n';
        },

        postsuper: function(args, term, engine) {
            var gate = MAIL001Config._requireScenario(engine);
            if (gate) return gate;
            var joined = args.join(' ').toLowerCase();

            if (joined.includes('-r') && joined.includes('all')) {
                var scenario = MAIL001Config._getScenario(engine);
                if (scenario.id === 'relay_blacklisted' && !engine.state._relayBlacklisted) {
                    engine.state._fixApplied = true;
                    engine.state._flagRevealed = true;
                    engine.state._labComplete = true;
                    engine.save();
                    setTimeout(function() { engine.notify('All messages requeued for delivery. Check Mail Logs for the recovery token.', 'success'); }, 400);
                    return '\npostsuper: Requeued: 23 messages\n';
                }
                return '\npostsuper: Requeued: 0 messages (root cause still present)\n';
            }

            if (joined.includes('-d') && joined.includes('all')) {
                return '\npostsuper: Deleted: all messages from queue\n';
            }

            return '\nUsage: postsuper -r ALL    (requeue all)\n       postsuper -d ALL    (delete all)\n       postsuper -d <queue_id>\n';
        },

        postmap: function(args, term, engine) {
            var gate = MAIL001Config._requireScenario(engine);
            if (gate) return gate;
            var joined = args.join(' ').toLowerCase();

            if (joined.includes('tls_policy') || joined.includes('/etc/postfix/tls_policy')) {
                engine.state._tlsPolicyUpdated = true;
                engine.save();
                return '\npostmap: rebuilding /etc/postfix/tls_policy.db\n';
            }

            return '\nUsage: postmap /etc/postfix/<mapfile>\n';
        },

        nslookup: function(args, term, engine) {
            var gate = MAIL001Config._requireScenario(engine);
            if (gate) return gate;
            var scenario = MAIL001Config._getScenario(engine);
            var joined = args.join(' ').toLowerCase();

            // DNSBL check
            if (joined.includes('zen.spamhaus.org') || joined.includes('spamhaus')) {
                if (engine.state._relayBlacklisted) {
                    return '\nServer:  10.0.1.2\nAddress: 10.0.1.2#53\n\nName:    50.113.0.203.zen.spamhaus.org\nAddress: 127.0.0.2\n\n(127.0.0.2 = SBL — IP is listed on Spamhaus Block List)\n';
                }
                return '\nServer:  10.0.1.2\nAddress: 10.0.1.2#53\n\n** server can\'t find 50.113.0.203.zen.spamhaus.org: NXDOMAIN\n\n(NXDOMAIN = IP is NOT listed)\n';
            }

            // MX lookup
            if (joined.includes('-type=mx') || joined.includes('-q=mx') || joined.includes('set type=mx')) {
                var domain = args[args.length - 1];
                if (domain === 'acmecorp.com' && engine.state._dnsForwarderBroken) {
                    return '\nServer:  10.0.1.2\nAddress: 10.0.1.2#53\n\n** server can\'t find acmecorp.com: SERVFAIL\n\n(DNS forwarder on 10.0.1.2 is not responding to external queries)\n';
                }
                if (domain === 'acmecorp.com') {
                    return '\nServer:  10.0.1.2\nAddress: 10.0.1.2#53\n\nNon-authoritative answer:\nacmecorp.com    MX preference = 10, mail exchanger = mx1.acmecorp.com\nacmecorp.com    MX preference = 20, mail exchanger = mx2.acmecorp.com\n\nmx1.acmecorp.com    internet address = 198.51.100.50\nmx2.acmecorp.com    internet address = 198.51.100.51\n';
                }
                return '\nServer:  10.0.1.2\nAddress: 10.0.1.2#53\n\nNon-authoritative answer:\n' + domain + '    MX preference = 10, mail exchanger = mx.' + domain + '\n';
            }

            if (args.length === 0) {
                return '\nUsage: nslookup [-type=MX] domain [server]\n       nslookup <reversed-ip>.zen.spamhaus.org    (DNSBL check)\n';
            }

            return '\nServer:  10.0.1.2\nAddress: 10.0.1.2#53\n\nNon-authoritative answer:\nName:    ' + args[0] + '\nAddress: 198.51.100.1\n';
        },

        dig: function(args, term, engine) {
            var gate = MAIL001Config._requireScenario(engine);
            if (gate) return gate;
            var scenario = MAIL001Config._getScenario(engine);
            var joined = args.join(' ').toLowerCase();

            if (joined.includes('mx') && joined.includes('acmecorp.com')) {
                if (engine.state._dnsForwarderBroken) {
                    return '\n;; Got answer:\n;; ->>HEADER<<- opcode: QUERY, status: SERVFAIL, id: 41523\n;; flags: qr rd ra; QUERY: 1, ANSWER: 0, AUTHORITY: 0, ADDITIONAL: 0\n\n;; QUESTION SECTION:\n;acmecorp.com.              IN      MX\n\n;; Query time: 5002 msec\n;; SERVER: 10.0.1.2#53(10.0.1.2)\n;; WHEN: Mon Mar 30 09:15:22 UTC 2026\n;; MSG SIZE  rcvd: 32\n';
                }
                return '\n;; Got answer:\n;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 41523\n;; flags: qr rd ra; QUERY: 1, ANSWER: 2, AUTHORITY: 0, ADDITIONAL: 2\n\n;; ANSWER SECTION:\nacmecorp.com.       3600    IN      MX      10 mx1.acmecorp.com.\nacmecorp.com.       3600    IN      MX      20 mx2.acmecorp.com.\n\n;; ADDITIONAL SECTION:\nmx1.acmecorp.com.   3600    IN      A       198.51.100.50\nmx2.acmecorp.com.   3600    IN      A       198.51.100.51\n\n;; Query time: 12 msec\n;; SERVER: 10.0.1.2#53(10.0.1.2)\n';
            }

            return '\nUsage: dig [@server] domain [type]\nExample: dig mx acmecorp.com\n         dig @10.0.1.2 acmecorp.com MX\n';
        },

        telnet: function(args, term, engine) {
            var gate = MAIL001Config._requireScenario(engine);
            if (gate) return gate;
            var scenario = MAIL001Config._getScenario(engine);

            if (args.length >= 2 && args[1] === '25') {
                if (args[0].includes('partnercorp') && engine.state._tlsFailure) {
                    return '\nTrying 198.51.100.40...\nConnected to mx.partnercorp.com.\nEscape character is \'^]\'.\n220 mx.partnercorp.com ESMTP Postfix\nEHLO MAIL-GW01.ourcompany.com\n250-mx.partnercorp.com\n250-PIPELINING\n250-SIZE 52428800\n250-ETRN\n250-AUTH PLAIN LOGIN\n250-ENHANCEDSTATUSCODES\n250-8BITMIME\n250-DSN\n250-SMTPUTF8\n250 CHUNKING\n\n(Note: STARTTLS is NOT listed — server does not offer TLS on port 25)\n(Connection closed)\n';
                }
                return '\nTrying ' + args[0] + '...\nConnected to ' + args[0] + '.\n220 ' + args[0] + ' ESMTP ready\nEHLO MAIL-GW01.ourcompany.com\n250-STARTTLS\n250 OK\n(Connection closed)\n';
            }

            return '\nUsage: telnet <host> <port>\nExample: telnet mx.partnercorp.com 25\n';
        },

        openssl: function(args, term, engine) {
            var gate = MAIL001Config._requireScenario(engine);
            if (gate) return gate;
            var joined = args.join(' ').toLowerCase();

            if (joined.includes('s_client') && joined.includes('partnercorp')) {
                if (engine.state._tlsFailure) {
                    return '\nCONNECTED(00000003)\n---\nno peer certificate available\n---\nNo client certificate CA names sent\n---\nSSL handshake has read 0 bytes and written 0 bytes\nVerification: OK\n---\nNew, (NONE), Cipher is (NONE)\nError: SSL routines:ssl3_get_server_hello:tlsv1 alert protocol version\n\n(The remote server rejected our TLS handshake — likely requires TLSv1.2 or higher)\n';
                }
                return '\nCONNECTED(00000003)\ndepth=2 O = DigiCert Inc, CN = DigiCert Global Root G2\n---\nSSL handshake has read 4521 bytes and written 443 bytes\nNew, TLSv1.3, Cipher is TLS_AES_256_GCM_SHA384\n---\n';
            }

            return '\nUsage: openssl s_client -connect host:port [-starttls smtp]\nExample: openssl s_client -connect partnercorp.com:25 -starttls smtp\n';
        },

        cat: function(args, term, engine) {
            var gate = MAIL001Config._requireScenario(engine);
            if (gate) return gate;
            var scenario = MAIL001Config._getScenario(engine);
            var joined = args.join(' ').toLowerCase();

            if (joined.includes('tls_policy') || joined.includes('/etc/postfix/tls_policy')) {
                if (engine.state._tlsFailure) {
                    return '\n# Per-destination TLS policy\n# Format: destination  policy\npartnercorp.com    encrypt protocols=!SSLv2:!SSLv3:!TLSv1:!TLSv1.1\n\n(Note: partnercorp.com requires TLS but their new server may need updated cipher/protocol settings)\n';
                }
                return '\n# Per-destination TLS policy\npartnercorp.com    encrypt protocols=TLSv1.2:TLSv1.3\n';
            }

            if (joined.includes('mail.log') || joined.includes('/var/log/mail.log')) {
                return MAIL001Config._getMailLog(engine);
            }

            if (joined.includes('named.conf') || joined.includes('resolv.conf')) {
                if (engine.state._dnsForwarderBroken) {
                    return '\n# /etc/bind/named.conf.options\noptions {\n    directory "/var/cache/bind";\n    forwarders {\n        192.0.2.1;    // <-- INVALID: old ISP DNS (decommissioned)\n        192.0.2.2;    // <-- INVALID: old ISP DNS (decommissioned)\n    };\n    dnssec-validation auto;\n    listen-on { any; };\n};\n';
                }
                return '\n# /etc/bind/named.conf.options\noptions {\n    directory "/var/cache/bind";\n    forwarders {\n        8.8.8.8;\n        8.8.4.4;\n    };\n    dnssec-validation auto;\n    listen-on { any; };\n};\n';
            }

            return '\ncat: ' + args.join(' ') + ': No such file or directory\n';
        },

        'rndc': function(args, term, engine) {
            var gate = MAIL001Config._requireScenario(engine);
            if (gate) return gate;
            var joined = args.join(' ').toLowerCase();

            if (joined === 'reload' || joined === 'reconfig') {
                if (engine.state._dnsForwarderFixed) {
                    engine.state._dnsForwarderBroken = false;
                    engine.save();
                    return '\nserver reload successful\n(DNS forwarders updated — external resolution restored)\n';
                }
                return '\nserver reload successful\n';
            }

            return '\nUsage: rndc reload | reconfig | flush | status\n';
        },

        nano: function(args, term, engine) {
            var gate = MAIL001Config._requireScenario(engine);
            if (gate) return gate;
            var joined = args.join(' ').toLowerCase();

            if (joined.includes('named.conf') || joined.includes('resolv.conf')) {
                engine.state._dnsForwarderFixed = true;
                engine.save();
                return '\n[Simulated] File edited. DNS forwarders updated to 8.8.8.8 and 8.8.4.4.\n(Run "rndc reload" to apply changes)\n';
            }

            if (joined.includes('tls_policy')) {
                engine.state._tlsPolicyUpdated = true;
                engine.save();
                return '\n[Simulated] TLS policy updated for partnercorp.com: encrypt protocols=TLSv1.2:TLSv1.3\n(Run "postmap /etc/postfix/tls_policy && postfix reload" to apply)\n';
            }

            return '\n[Simulated editor] No relevant file specified.\nUsage: nano /etc/postfix/tls_policy\n       nano /etc/bind/named.conf.options\n';
        },

        vi: function(args, term, engine) { return MAIL001Config.commands.nano(args, term, engine); },
        vim: function(args, term, engine) { return MAIL001Config.commands.nano(args, term, engine); },

        ping: function(args, term, engine) {
            var gate = MAIL001Config._requireScenario(engine);
            if (gate) return gate;
            if (!args.length) return '\nUsage: ping [-c count] target\n';
            var target = args[args.length - 1];

            if (target === '10.0.1.2' || target === 'DNS-INT01') {
                return '\nPING 10.0.1.2 (10.0.1.2) 56(84) bytes of data.\n64 bytes from 10.0.1.2: icmp_seq=1 ttl=64 time=0.4 ms\n64 bytes from 10.0.1.2: icmp_seq=2 ttl=64 time=0.3 ms\n64 bytes from 10.0.1.2: icmp_seq=3 ttl=64 time=0.4 ms\n\n--- 10.0.1.2 ping statistics ---\n3 packets transmitted, 3 received, 0% packet loss, time 2003ms\nrtt min/avg/max/mdev = 0.3/0.37/0.4/0.05 ms\n';
            }

            if (target === '203.0.113.50') {
                return '\nPING 203.0.113.50 (203.0.113.50) 56(84) bytes of data.\n64 bytes from 203.0.113.50: icmp_seq=1 ttl=64 time=0.1 ms\n64 bytes from 203.0.113.50: icmp_seq=2 ttl=64 time=0.1 ms\n\n--- 203.0.113.50 ping statistics ---\n2 packets transmitted, 2 received, 0% packet loss\n';
            }

            return '\nPING ' + target + ' (' + target + ') 56(84) bytes of data.\n64 bytes from ' + target + ': icmp_seq=1 ttl=64 time=1.2 ms\n64 bytes from ' + target + ': icmp_seq=2 ttl=64 time=1.1 ms\n\n--- ' + target + ' ping statistics ---\n2 packets transmitted, 2 received, 0% packet loss\n';
        },

        whoami: function() { return 'mailadmin'; },
        hostname: function() { return 'MAIL-GW01'; },
        clear: function(args, term) { term.outputEl.innerHTML = ''; return null; },

        ls: function(args, term, engine) {
            var joined = args.join(' ').toLowerCase();
            if (joined.includes('/var/log')) return '\nauth.log  dpkg.log  kern.log  mail.log  mail.err  syslog\n';
            if (joined.includes('/etc/postfix')) return '\nmain.cf  master.cf  tls_policy  tls_policy.db  transport  virtual\n';
            return '\nDesktop  Documents  Downloads\n';
        },

        grep: function(args, term, engine) {
            var gate = MAIL001Config._requireScenario(engine);
            if (gate) return gate;
            var joined = args.join(' ').toLowerCase();

            if (joined.includes('error') && joined.includes('mail.log')) {
                return MAIL001Config._getMailLog(engine);
            }
            if (joined.includes('deferred') && joined.includes('mail.log')) {
                return MAIL001Config._getMailLog(engine);
            }
            return '\n(no matches)\n';
        },

        // Block Windows commands
        ipconfig: function() { return 'bash: ipconfig: command not found\nDid you mean: ifconfig or ip addr?'; },
        dir: function() { return 'bash: dir: command not found\nDid you mean: ls?'; },
        cls: function() { return 'bash: cls: command not found\nDid you mean: clear?'; }
    },

    // ==========================================================
    // MAIL LOG GENERATOR
    // ==========================================================

    _getMailLog(engine) {
        var scenario = MAIL001Config._getScenario(engine);
        if (!scenario) return '\n(empty log)\n';

        if (engine.state._fixApplied) {
            return '\nMar 30 09:22:01 MAIL-GW01 postfix/smtp[2841]: Queue flushed successfully\nMar 30 09:22:02 MAIL-GW01 postfix/smtp[2841]: All deferred messages requeued\nMar 30 09:22:03 MAIL-GW01 postfix/smtp[2841]: Delivery resuming normally\n';
        }

        if (scenario.id === 'relay_blacklisted') {
            return '\nMar 30 06:02:14 MAIL-GW01 postfix/smtp[1842]: A1B2C3D4E5: to=<jsmith@clientcorp.com>, relay=mx.clientcorp.com[198.51.100.25]:25, status=bounced (host mx.clientcorp.com refused to talk to me: 550 5.7.1 Service unavailable; client host [203.0.113.50] blocked using zen.spamhaus.org)\nMar 30 06:05:22 MAIL-GW01 postfix/smtp[1843]: F6G7H8I9J0: to=<contracts@vendorltd.com>, status=bounced (550 5.7.1 client host blocked using zen.spamhaus.org)\nMar 30 06:08:45 MAIL-GW01 postfix/smtp[1844]: K1L2M3N4O5: to=<recruit@partnercorp.com>, status=bounced (550 5.7.1 client host blocked)\n';
        }
        if (scenario.id === 'mx_unreachable') {
            return '\nMar 30 03:14:01 MAIL-GW01 postfix/smtp[1842]: R5S6T7U8V9: to=<partner@acmecorp.com>, status=deferred (Host or domain name not found. Name service error for name=acmecorp.com type=MX: Host not found, try again)\nMar 30 04:22:18 MAIL-GW01 postfix/smtp[1843]: W0X1Y2Z3A4: to=<orders@acmecorp.com>, status=deferred (Host or domain name not found)\nMar 30 06:00:00 MAIL-GW01 postfix/smtp[1844]: DNS resolution failing for all external MX lookups via 10.0.1.2\n';
        }
        if (scenario.id === 'size_limit') {
            return '\nMar 30 08:15:33 MAIL-GW01 postfix/smtpd[1842]: NOQUEUE: reject: MAIL from MAIL-INT01[10.0.1.11]: 552 5.3.4 Message size exceeds fixed maximum message size (10485760); from=<engineering@ourcompany.com> proto=ESMTP\nMar 30 08:15:33 MAIL-GW01 postfix/smtpd[1842]: warning: message_size_limit = 10485760 (10MB) — policy says 100MB\nMar 30 08:16:01 MAIL-GW01 postfix/smtpd[1843]: NOQUEUE: reject: 552 5.3.4 Message size exceeds fixed maximum (10485760)\n';
        }
        if (scenario.id === 'tls_failure') {
            return '\nMar 30 05:30:00 MAIL-GW01 postfix/smtp[1842]: B5C6D7E8F9: to=<legal@partnercorp.com>, relay=mx.partnercorp.com[198.51.100.40]:25, status=deferred (TLS is required, but was not offered by host mx.partnercorp.com[198.51.100.40]:25)\nMar 30 05:45:12 MAIL-GW01 postfix/smtp[1843]: G0H1I2J3K4: to=<billing@partnercorp.com>, status=deferred (TLS is required, but was not offered)\nMar 30 06:00:00 MAIL-GW01 postfix/smtp[1844]: warning: TLS policy for partnercorp.com requires encryption but STARTTLS not offered\n';
        }
        if (scenario.id === 'rate_limited') {
            return '\nMar 30 08:00:01 MAIL-GW01 postfix/smtp[1842]: D1E2F3G4H5: to=<subscriber1@gmail.com>, relay=gmail-smtp-in.l.google.com[142.250.115.27]:25, status=deferred (host said: 450 4.7.1 [203.0.113.50] Try again later)\nMar 30 08:00:01 MAIL-GW01 postfix/smtp[1843]: warning: 450 rate limit responses from gmail-smtp-in, outlook.com, yahoo.com\nMar 30 08:00:02 MAIL-GW01 postfix/smtp[1844]: 12000 messages deferred, 3000 delivered. Destination servers throttling inbound.\n';
        }
        return '\n(no relevant log entries)\n';
    },

    // ==========================================================
    // CUSTOM WINDOW HANDLERS
    // ==========================================================

    onAppLaunch(iconDef, engine) {
        var requireTicket = ['mail_queue', 'mail_logs', 'dns_console', 'server_info'];
        if (requireTicket.includes(iconDef.app) && !engine.state._scenarioSelected) {
            engine.notify('Open the Help Desk Ticket first to receive your assignment.', 'error');
            return;
        }

        switch (iconDef.app) {
            case 'ticket':      MAIL001Config._openTicket(iconDef, engine); break;
            case 'mail_queue':  MAIL001Config._openMailQueue(iconDef, engine); break;
            case 'mail_logs':   MAIL001Config._openMailLogs(iconDef, engine); break;
            case 'dns_console': MAIL001Config._openDnsConsole(iconDef, engine); break;
            case 'server_info': MAIL001Config._openServerInfo(iconDef, engine); break;
            case 'reset_lab':   MAIL001Config._confirmReset(engine); break;
        }
    },

    // ==========================================================
    // HELP DESK TICKET
    // ==========================================================

    _openTicket(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var container = document.createElement('div');
        container.id = 'ticketContainer';
        container.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Help Desk Ticket', 'HD', container);
        MAIL001Config._ensureScenario(engine);
        if (engine.state._scenarioSelected) {
            MAIL001Config._renderTicket(engine, container);
        } else {
            MAIL001Config._renderScenarioPicker(engine, container);
        }
    },

    _renderScenarioPicker(engine, container) {
        var ticketPreviews = [
            'Mike Torres — "External emails bouncing with blocked error"',
            'Sarah Chen — "Emails to acmecorp.com stuck for 3 hours"',
            'James Rivera — "Cannot send 50MB attachment — bounces immediately"',
            'Priya Kapoor — "Emails to partnercorp.com failing with TLS error"',
            'Dan Kowalski — "Marketing blast stuck — 12,000 messages in deferred queue"'
        ];

        var html = '<div style="text-align:center; margin-bottom:20px;">'
            + '<div style="color:#10b981; font-weight:bold; font-size:1.1rem; margin-bottom:8px;">MAIL SERVER QUEUE</div>'
            + '<div style="color:#888; font-size:0.75rem;">Select a ticket to begin your assignment, or let the system assign one randomly.</div>'
            + '</div><div style="margin-bottom:16px;">';

        MAIL001Config._scenarios.forEach(function(s, i) {
            html += '<button class="mail001-scenario-btn" data-idx="' + i + '" style="display:block; width:100%; text-align:left; padding:12px 16px; margin-bottom:8px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.12); border-radius:4px; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem; cursor:pointer; transition:border-color 0.2s;">'
                + '<div style="display:flex; justify-content:space-between; align-items:center;">'
                + '<span style="color:#10b981; font-weight:bold;">MAIL-' + (1000 + i) + '</span>'
                + '<span style="background:#e74c3c; color:#fff; padding:1px 8px; border-radius:3px; font-size:0.65rem;">URGENT</span>'
                + '</div>'
                + '<div style="color:#aaa; font-size:0.7rem; margin-top:4px;">' + ticketPreviews[i] + '</div>'
                + '</button>';
        });
        html += '</div>';

        html += '<div style="text-align:center; border-top:1px solid rgba(255,255,255,0.1); padding-top:16px;">'
            + '<button id="mail001RandomBtn" style="padding:10px 28px; background:#10b981; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold; font-size:0.85rem; font-family:Consolas,monospace;">Random Assignment</button>'
            + '</div>';

        container.innerHTML = html;

        container.querySelectorAll('.mail001-scenario-btn').forEach(function(btn) {
            btn.addEventListener('mouseenter', function() { this.style.borderColor = '#10b981'; });
            btn.addEventListener('mouseleave', function() { this.style.borderColor = 'rgba(255,255,255,0.12)'; });
            btn.addEventListener('click', function() {
                MAIL001Config._applyScenario(engine, parseInt(this.getAttribute('data-idx')));
                MAIL001Config._renderTicket(engine, container);
            });
        });

        document.getElementById('mail001RandomBtn').addEventListener('click', function() {
            MAIL001Config._applyScenario(engine, Math.floor(Math.random() * MAIL001Config._scenarios.length));
            MAIL001Config._renderTicket(engine, container);
        });
    },

    _renderTicket(engine, container) {
        var scenario = MAIL001Config._getScenario(engine);
        var submitters = [
            'Mike Torres — IT Operations',
            'Sarah Chen — CEO Office',
            'James Rivera — Engineering Lead',
            'Priya Kapoor — Compliance Officer',
            'Dan Kowalski — Marketing Director'
        ];
        var submitter = submitters[engine.state._scenarioId] || 'Employee';
        var server = MAIL001Config._servers[scenario.affectedServer];

        container.innerHTML = '<div style="border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:12px; margin-bottom:16px;">'
            + '<div style="display:flex; justify-content:space-between; align-items:center;">'
            + '<span style="color:#10b981; font-weight:bold; font-size:1rem;">MAIL TICKET #MAIL-' + (1000 + engine.state._scenarioId) + '</span>'
            + '<span style="background:#e74c3c; color:#fff; padding:2px 10px; border-radius:3px; font-size:0.7rem; font-weight:bold;">PRIORITY: URGENT</span>'
            + '</div></div>'
            + '<div style="margin-bottom:16px;">'
            + '<div style="color:#888; font-size:0.7rem; margin-bottom:4px;">SUBMITTED BY</div>'
            + '<div>' + submitter + '</div></div>'
            + '<div style="margin-bottom:16px;">'
            + '<div style="color:#888; font-size:0.7rem; margin-bottom:4px;">DATE</div>'
            + '<div>March 30, 2026 — 9:04 AM</div></div>'
            + '<div style="margin-bottom:16px;">'
            + '<div style="color:#888; font-size:0.7rem; margin-bottom:4px;">AFFECTED SERVER</div>'
            + '<div style="font-weight:bold; color:#10b981;">' + server.name + ' (' + server.ip + ')</div>'
            + '<div style="color:#888; font-size:0.7rem;">' + server.role + ' &mdash; ' + server.software + '</div></div>'
            + '<div style="margin-bottom:16px;">'
            + '<div style="color:#888; font-size:0.7rem; margin-bottom:4px;">SUBJECT</div>'
            + '<div style="font-weight:bold;">' + MAIL001Config._escHtml(scenario.ticketSubject) + '</div></div>'
            + '<div style="margin-bottom:16px;">'
            + '<div style="color:#888; font-size:0.7rem; margin-bottom:4px;">DESCRIPTION</div>'
            + '<div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:4px; padding:12px; line-height:1.6;">'
            + MAIL001Config._escHtml(scenario.ticketDetail)
            + '</div></div>'
            + (scenario.ticketExtra ? '<div style="margin-bottom:16px;">'
            + '<div style="color:#888; font-size:0.7rem; margin-bottom:4px;">INTERNAL NOTES</div>'
            + '<div style="background:rgba(16,185,129,0.08); border:1px solid rgba(16,185,129,0.2); border-radius:4px; padding:12px; line-height:1.6; color:#a7f3d0;">'
            + MAIL001Config._escHtml(scenario.ticketExtra) + '</div></div>' : '')
            + '<div style="border-top:1px solid rgba(255,255,255,0.1); padding-top:12px;">'
            + '<div style="color:#888; font-size:0.7rem; margin-bottom:4px;">ASSIGNED TO</div>'
            + '<div style="color:#10b981; font-weight:bold;">YOU — Mail Server Administrator</div></div>';
    },

    // ==========================================================
    // MAIL QUEUE MONITOR
    // ==========================================================

    _openMailQueue(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); MAIL001Config._renderMailQueue(engine); return; }
        var container = document.createElement('div');
        container.id = 'mqContainer';
        container.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Mail Queue Monitor', 'MQ', container);
        MAIL001Config._renderMailQueue(engine);
    },

    _renderMailQueue(engine) {
        var container = document.getElementById('mqContainer');
        if (!container) return;
        var scenario = MAIL001Config._getScenario(engine);

        var html = '<div style="font-size:1rem; font-weight:bold; color:#10b981; margin-bottom:16px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:8px;">Mail Queue Monitor &mdash; MAIL-GW01</div>';

        if (engine.state._fixApplied) {
            html += '<div style="background:rgba(16,185,129,0.1); border:1px solid rgba(16,185,129,0.3); border-radius:4px; padding:16px; text-align:center;">'
                + '<div style="color:#10b981; font-weight:bold; font-size:1.1rem; margin-bottom:8px;">Queue Empty</div>'
                + '<div style="color:#a7f3d0;">All messages have been delivered or requeued for delivery.</div>'
                + '</div>';

            if (engine.state._flagRevealed) {
                html += '<div style="margin-top:16px; background:rgba(16,185,129,0.1); border:1px solid rgba(16,185,129,0.3); border-radius:4px; padding:12px;">'
                    + '<div style="color:#10b981; font-weight:bold; margin-bottom:4px;">Mail Flow Restored:</div>'
                    + '<div id="mail001-flag-mq" style="color:#c8e6c9;">Recovery token: loading...</div></div>';
            }
        } else {
            var queueData = MAIL001Config._getQueueSummary(scenario);
            html += '<div style="display:flex; gap:16px; margin-bottom:16px;">';
            html += '<div style="flex:1; background:rgba(231,76,60,0.08); border:1px solid rgba(231,76,60,0.2); border-radius:4px; padding:12px; text-align:center;">'
                + '<div style="color:#e74c3c; font-size:1.5rem; font-weight:bold;">' + queueData.count + '</div>'
                + '<div style="color:#888; font-size:0.7rem;">Messages Stuck</div></div>';
            html += '<div style="flex:1; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:4px; padding:12px; text-align:center;">'
                + '<div style="color:#f59e0b; font-size:1.5rem; font-weight:bold;">' + queueData.size + '</div>'
                + '<div style="color:#888; font-size:0.7rem;">Queue Size</div></div>';
            html += '<div style="flex:1; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:4px; padding:12px; text-align:center;">'
                + '<div style="color:#e74c3c; font-size:1rem; font-weight:bold; word-break:break-word;">' + queueData.error + '</div>'
                + '<div style="color:#888; font-size:0.7rem;">Primary Error</div></div>';
            html += '</div>';

            html += '<div style="color:#888; font-size:0.75rem; margin-bottom:8px;">Recent Queue Entries:</div>';
            html += '<div style="background:rgba(0,0,0,0.2); border:1px solid rgba(255,255,255,0.08); border-radius:4px; padding:12px; font-size:0.75rem; line-height:1.6; white-space:pre-wrap;">' + MAIL001Config._escHtml(queueData.detail) + '</div>';
        }

        container.innerHTML = html;

        if (engine.state._flagRevealed && engine.state._fixApplied) {
            BoxEngine.requestFlagText(scenario.id).then(function(flagText) {
                var el = document.getElementById('mail001-flag-mq');
                if (el) el.textContent = 'Recovery token: ' + (flagText || 'Flag unavailable');
            });
        }
    },

    _getQueueSummary(scenario) {
        var summaries = {
            relay_blacklisted: { count: '23', size: '847 KB', error: '550 5.7.1 Blocked', detail: 'All outbound mail rejected by remote servers.\nRelay IP 203.0.113.50 listed on zen.spamhaus.org.\n23 messages bounced across multiple destinations.' },
            mx_unreachable: { count: '8', size: '312 KB', error: 'MX Not Found', detail: 'DNS resolution failing for acmecorp.com MX records.\nInternal DNS server 10.0.1.2 returning SERVFAIL.\n8 messages deferred to acmecorp.com domain.' },
            size_limit: { count: '0', size: '0 KB', error: '552 Size Exceeded', detail: 'Messages rejected at SMTP level (never enter queue).\nCurrent message_size_limit: 10485760 (10MB)\nPolicy allows 100MB. Limit needs updating.' },
            tls_failure: { count: '6', size: '156 KB', error: 'TLS Not Offered', detail: 'TLS required for partnercorp.com but STARTTLS not offered.\nPartner upgraded mail server — TLS negotiation failing.\n6 messages deferred to partnercorp.com.' },
            rate_limited: { count: '12,000', size: '24.5 MB', error: '450 Rate Limited', detail: 'Remote servers throttling our delivery rate.\nGmail, Outlook.com returning 450 "Try again later".\n12,000 newsletter messages deferred after first 3,000 delivered.' }
        };
        return summaries[scenario.id] || { count: '0', size: '0', error: 'Unknown', detail: 'No data' };
    },

    // ==========================================================
    // MAIL LOGS
    // ==========================================================

    _openMailLogs(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); MAIL001Config._renderMailLogs(engine); return; }
        var container = document.createElement('div');
        container.id = 'mlContainer';
        container.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Mail Logs', 'LOG', container);
        MAIL001Config._renderMailLogs(engine);
    },

    _renderMailLogs(engine) {
        var container = document.getElementById('mlContainer');
        if (!container) return;
        var scenario = MAIL001Config._getScenario(engine);

        var html = '<div style="font-size:1rem; font-weight:bold; color:#10b981; margin-bottom:16px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:8px;">Mail Logs &mdash; /var/log/mail.log</div>';
        html += '<div style="background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.08); border-radius:4px; padding:12px; font-size:0.75rem; line-height:1.6; white-space:pre-wrap;">'
            + MAIL001Config._escHtml(MAIL001Config._getMailLog(engine)) + '</div>';

        if (engine.state._flagRevealed) {
            html += '<div style="margin-top:16px; background:rgba(16,185,129,0.1); border:1px solid rgba(16,185,129,0.3); border-radius:4px; padding:12px;">'
                + '<div style="color:#10b981; font-weight:bold; margin-bottom:4px;">Fix Confirmed:</div>'
                + '<div id="mail001-flag-log" style="color:#c8e6c9;">Recovery token: loading...</div></div>';
        }

        container.innerHTML = html;

        if (engine.state._flagRevealed) {
            BoxEngine.requestFlagText(scenario.id).then(function(flagText) {
                var el = document.getElementById('mail001-flag-log');
                if (el) el.textContent = 'Recovery token: ' + (flagText || 'Flag unavailable');
            });
        }
    },

    // ==========================================================
    // DNS CONSOLE
    // ==========================================================

    _openDnsConsole(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var container = document.createElement('div');
        container.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'DNS Console', 'DNS', container);
        var scenario = MAIL001Config._getScenario(engine);

        var html = '<div style="font-size:1rem; font-weight:bold; color:#10b981; margin-bottom:16px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:8px;">DNS Console &mdash; DNS-INT01 (10.0.1.2)</div>';
        html += '<div style="margin-bottom:16px; border:1px solid rgba(255,255,255,0.08); border-radius:4px; padding:12px;">'
            + '<div style="font-weight:bold; margin-bottom:8px;">Server Status</div>'
            + '<div style="color:#2ecc71; font-size:0.75rem; margin-bottom:4px;">BIND 9.18 — Running</div>'
            + '<div style="font-size:0.75rem; color:#aaa;">Listen: 10.0.1.2:53 (UDP/TCP)</div></div>';

        html += '<div style="margin-bottom:16px; border:1px solid rgba(255,255,255,0.08); border-radius:4px; padding:12px;">'
            + '<div style="font-weight:bold; margin-bottom:8px;">Forwarders</div>';
        if (engine.state._dnsForwarderBroken) {
            html += '<div style="color:#e74c3c; font-size:0.75rem;">192.0.2.1 — UNREACHABLE (old ISP DNS)</div>'
                + '<div style="color:#e74c3c; font-size:0.75rem;">192.0.2.2 — UNREACHABLE (old ISP DNS)</div>'
                + '<div style="color:#f59e0b; font-size:0.7rem; margin-top:8px;">WARNING: All forwarders are unreachable. External DNS resolution is broken.</div>';
        } else {
            html += '<div style="color:#2ecc71; font-size:0.75rem;">8.8.8.8 — OK (Google Public DNS)</div>'
                + '<div style="color:#2ecc71; font-size:0.75rem;">8.8.4.4 — OK (Google Public DNS)</div>';
        }
        html += '</div>';

        html += '<div style="border:1px solid rgba(255,255,255,0.08); border-radius:4px; padding:12px;">'
            + '<div style="font-weight:bold; margin-bottom:8px;">Zone Statistics</div>'
            + '<div style="font-size:0.75rem; color:#aaa;">Internal zones: 3 (ourcompany.com, 1.0.10.in-addr.arpa, localhost)</div>'
            + '<div style="font-size:0.75rem; color:#aaa;">Cache entries: 1,247</div>'
            + '<div style="font-size:0.75rem; color:#aaa;">Queries today: 14,521</div></div>';

        container.innerHTML = html;
    },

    // ==========================================================
    // SERVER INFO
    // ==========================================================

    _openServerInfo(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var container = document.createElement('div');
        container.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Server Info', 'SRV', container);

        var html = '<div style="font-size:1rem; font-weight:bold; color:#10b981; margin-bottom:16px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:8px;">Mail Infrastructure</div>';

        MAIL001Config._servers.forEach(function(srv) {
            html += '<div style="margin-bottom:12px; border:1px solid rgba(255,255,255,0.08); border-radius:4px; padding:12px;">'
                + '<div style="display:flex; justify-content:space-between; align-items:center;">'
                + '<span style="font-weight:bold;">' + srv.name + '</span>'
                + '<span style="color:#2ecc71; font-size:0.75rem;">' + srv.status + '</span></div>'
                + '<div style="font-size:0.75rem; color:#aaa; margin-top:4px;">IP: ' + srv.ip + ' | Role: ' + srv.role + ' | ' + srv.software + '</div></div>';
        });

        html += '<div style="margin-top:16px; border:1px solid rgba(255,255,255,0.08); border-radius:4px; padding:12px;">'
            + '<div style="font-weight:bold; margin-bottom:8px;">Network</div>'
            + '<div style="font-size:0.75rem; color:#aaa; line-height:1.8;">'
            + '<div>Relay Public IP: 203.0.113.50</div>'
            + '<div>Internal Subnet: 10.0.1.0/24</div>'
            + '<div>Gateway: 10.0.1.1</div>'
            + '<div>External DNS: 8.8.8.8, 8.8.4.4</div></div></div>';

        container.innerHTML = html;
    },

    // ==========================================================
    // RESET LAB
    // ==========================================================

    _confirmReset(engine) {
        var overlay = document.createElement('div');
        overlay.style.cssText = 'position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); display:flex; align-items:center; justify-content:center; z-index:9999;';
        overlay.innerHTML = '<div style="background:#1a1a2e; border:1px solid rgba(255,255,255,0.2); border-radius:8px; padding:24px 32px; text-align:center; font-family:Consolas,monospace; color:#c8e6c9; max-width:360px;">'
            + '<div style="font-size:1rem; font-weight:bold; margin-bottom:12px; color:#e74c3c;">Reset Lab?</div>'
            + '<div style="font-size:0.8rem; color:#aaa; margin-bottom:20px;">This will clear all progress, generate a new scenario, and restart from the beginning.</div>'
            + '<div style="display:flex; gap:12px; justify-content:center;">'
            + '<button id="mail001ResetConfirm" style="padding:8px 24px; background:#e74c3c; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold; font-size:0.8rem;">Reset</button>'
            + '<button id="mail001ResetCancel" style="padding:8px 24px; background:rgba(255,255,255,0.1); color:#ccc; border:1px solid rgba(255,255,255,0.2); border-radius:4px; cursor:pointer; font-size:0.8rem;">Cancel</button>'
            + '</div></div>';

        document.getElementById('arena').appendChild(overlay);

        document.getElementById('mail001ResetConfirm').addEventListener('click', function() {
            MAIL001Config._flagRestored = false;
            MAIL001Config.hints = MAIL001Config._defaultHints;
            engine.reset();
        });
        document.getElementById('mail001ResetCancel').addEventListener('click', function() { overlay.remove(); });
        overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
    }

};
