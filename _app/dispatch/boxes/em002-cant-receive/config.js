/* ============================================================
   DISPATCH LAB — Box EM002: Can't Receive Email
   CompTIA A+ Core 2 — Email Receiving Troubleshooting
   Config: wrong MX, mailbox full, mail flow rule, spam filter,
   distribution list
   5 distinct scenarios
   ============================================================ */

var EM002Config = {

    title: 'Can\'t Receive Email',
    subtitle: 'Where\'s My Email — Inbound Mail Troubleshooting',
    difficulty: 'Beginner',
    accent: '#22c55e',
    storageKey: 'hexworth_lab_em002',
    registryId: 'em002-cant-receive',
    trackerKey: 'lab_em002',
    tutorialMode: true,

    tutorial: {
        steps: [
            { title: 'Open the Help Desk Ticket', tip: 'Read the user complaint about missing emails.', trigger: { event: 'window_open', match: { type: 'ticket' } } },
            { title: 'Check Mail Server Console', tip: 'Review mail flow logs, delivery status, and server health.', trigger: { event: 'window_open', match: { type: 'mail_console' } } },
            { title: 'Investigate with CLI', tip: 'Use nslookup, mail-trace, quota-check, and rule-audit to find the cause.', trigger: { event: 'command', match: { cmd: 'contains:nslookup' }, alt: [{ event: 'command', match: { cmd: 'contains:mail-trace' } }, { event: 'command', match: { cmd: 'contains:quota' } }] } },
            { title: 'Apply the fix', tip: 'Correct the DNS, clear quota, fix the rule, or update membership.', trigger: { event: 'command', match: { cmd: 'contains:mail-fix' } } },
            { title: 'Capture the flag', tip: 'After fixing the receiving issue, the flag appears.', trigger: { event: 'flag_correct', match: { flagId: 'fixed' } } }
        ]
    },

    certObjectives: {
        certPath: 'A+ Core 2',
        mappings: [
            { flagId: 'fixed', objective: '1.6', description: 'Configure email client settings', skill: 'Mail Delivery Configuration' },
            { flagId: 'fixed', objective: '4.6', description: 'Troubleshoot common networking issues', skill: 'DNS and Mail Flow Troubleshooting' }
        ]
    },

    _scenarioFlags: { wrong_mx: null, mailbox_full: null, mail_rule: null, spam_filter: null, dist_list: null },

    _scenarios: [
        {
            id: 'wrong_mx',
            name: 'MX Record Wrong Server',
            ticketSubject: 'No one in the company has received external email for 2 days',
            ticketDetail: 'Starting Tuesday morning, no one at the company has received any email from external senders. Internal email (user to user within the company) works perfectly. External senders report getting bounce-backs saying "host not found" or "connection refused." Our mail server is running fine and shows no errors. This started right after the DNS migration Monday evening.',
            ticketExtra: 'IT Note: DNS was migrated to CloudDNS on Monday night. The A record and NS records were updated but the MX record may be pointing to the old server IP (192.0.2.50 — the old host that was decommissioned). Current mail server is at 198.51.100.10.',
            affectedUser: 'All users',
            fixDescription: 'Correct MX record to point to current mail server',
            stateOverrides: { _wrongMx: true, _oldIp: '192.0.2.50' }
        },
        {
            id: 'mailbox_full',
            name: 'Mailbox Full (Quota Exceeded)',
            ticketSubject: 'User not receiving emails — senders getting "mailbox full" bounce',
            ticketDetail: 'HR Director Patricia Simmons says she stopped receiving emails yesterday. Senders report getting a bounce with "552 5.2.2 Mailbox full — user is over quota." Patricia has been archiving all her email for 8 years and never cleaned her mailbox. Her account has a 5 GB quota. She also has a 2 GB attachment from a video recording of the company all-hands meeting sitting in her inbox.',
            ticketExtra: 'IT Note: Patricia\'s mailbox is at 5.1 GB (102% of quota). Quota enforcement rejects new messages when over 100%. She needs to delete large emails or move them to archive. The all-hands video (2 GB) should be deleted from the mailbox and stored on the file server instead.',
            affectedUser: 'psimmons',
            fixDescription: 'Clear mailbox space by removing large items, restore mail flow',
            stateOverrides: { _quotaExceeded: true, _currentSize: '5.1 GB', _quota: '5 GB' }
        },
        {
            id: 'mail_rule',
            name: 'Mail Flow Rule Blocking',
            ticketSubject: 'Marketing team not receiving emails from external partners — everyone else is fine',
            ticketDetail: 'The Marketing department (5 users) reports they are not receiving any emails from external senders. Internal emails arrive fine. Other departments receive external email without issues. The Marketing team uses a shared mailbox marketing@hexworth.local that distributes to the team. The problem seems to affect only external-to-marketing messages.',
            ticketExtra: 'IT Note: A new mail flow rule "Block External Spam to Marketing" was created last week by a junior admin. The rule was intended to block spam to the marketing shared mailbox but may have been configured too broadly. Check the mail flow rules for any that target the Marketing department or the marketing@ shared mailbox.',
            affectedUser: 'Marketing team',
            fixDescription: 'Fix or remove the overly broad mail flow rule',
            stateOverrides: { _ruleBlocking: true }
        },
        {
            id: 'spam_filter',
            name: 'Spam Filter Quarantining Legitimate Mail',
            ticketSubject: 'Important client emails going to spam — vendor says they sent 5 emails we never got',
            ticketDetail: 'Account manager Robert Kim reports that emails from our biggest client (Pinnacle Corp, domain: pinnacle-corp.com) are not arriving in his inbox. Pinnacle confirms they sent 5 emails this week. Robert checked his Junk folder in Outlook — not there either. The spam filter may be quarantining them server-side before they reach his mailbox.',
            ticketExtra: 'IT Note: The spam filter score threshold was lowered from 5.0 to 3.0 last month to combat an increase in spam. This may be too aggressive and is catching legitimate email. Pinnacle Corp\'s mail server has a slightly misconfigured DKIM that triggers a 1.5 point penalty. Combined with their relatively new domain (registered 2024), their spam score hits 3.2 — just over the threshold.',
            affectedUser: 'rkim',
            fixDescription: 'Release quarantined emails and add sender to allow list',
            stateOverrides: { _spamQuarantined: true, _quarantinedCount: 5 }
        },
        {
            id: 'dist_list',
            name: 'Distribution List Missing',
            ticketSubject: 'New hire not receiving team emails — everyone else on the team gets them',
            ticketDetail: 'New hire Alex Torres (atorres) started Monday. He\'s not receiving any team-wide emails. His coworkers on the Engineering team get emails sent to engineering@hexworth.local but Alex does not. He receives direct emails fine (person-to-person). His coworker confirmed she sent a test to engineering@hexworth.local and everyone got it except Alex.',
            ticketExtra: 'IT Note: Alex\'s account was created by HR on Friday but the distribution list membership may not have been added. The engineering@hexworth.local distribution list needs to have atorres added. Check the DL membership.',
            affectedUser: 'atorres',
            fixDescription: 'Add user to the engineering distribution list',
            stateOverrides: { _dlMissing: true }
        }
    ],

    _defaultHints: [
        { id: 'hint1', text: 'Open the Mail Server Console to review delivery logs.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Use nslookup, mail-trace, quota-check, rule-audit to diagnose.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Each receiving failure has a different root cause.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'Use mail-fix to apply the correction.', cost: 50, penalty: -50 }
    ],

    _scenarioHints: {
        wrong_mx: [
            { id: 'hint1', text: 'Use "nslookup -type=MX hexworth.local" to check where mail is being routed.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'The MX record points to 192.0.2.50 (old decommissioned server). Should be 198.51.100.10.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Fix the MX: "mail-fix --update-mx 198.51.100.10"', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run: mail-fix --update-mx 198.51.100.10 to point MX to the correct server.', cost: 150, penalty: -150 }
        ],
        mailbox_full: [
            { id: 'hint1', text: 'Use "quota-check psimmons" to see mailbox usage.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Mailbox is 5.1 GB / 5 GB (102%). The 2 GB all-hands video is the biggest item.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Remove the large video: "mail-fix --clear-quota psimmons"', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run: mail-fix --clear-quota psimmons to remove the video and restore mail flow.', cost: 150, penalty: -150 }
        ],
        mail_rule: [
            { id: 'hint1', text: 'Use "rule-audit" to list all mail flow rules and find the problematic one.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Rule "Block External Spam to Marketing" blocks ALL external mail to marketing@, not just spam.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Fix the rule: "mail-fix --fix-rule marketing"', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run: mail-fix --fix-rule marketing to change the rule to only block known spam sources.', cost: 150, penalty: -150 }
        ],
        spam_filter: [
            { id: 'hint1', text: 'Use "spam-queue" to check if Pinnacle emails are in the quarantine.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Five Pinnacle emails are quarantined. Their spam score is 3.2 (threshold: 3.0).', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Release and whitelist: "mail-fix --spam-release rkim --whitelist pinnacle-corp.com"', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run: mail-fix --spam-release rkim --whitelist pinnacle-corp.com', cost: 150, penalty: -150 }
        ],
        dist_list: [
            { id: 'hint1', text: 'Use "dl-members engineering" to check if Alex is on the distribution list.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Alex (atorres) is NOT on the engineering@hexworth.local distribution list.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Add him: "mail-fix --add-dl engineering atorres"', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run: mail-fix --add-dl engineering atorres to add Alex to the engineering DL.', cost: 150, penalty: -150 }
        ]
    },

    _ensureScenario(engine) { if (!engine.state._scenarioSelected) return false; if (engine.state._scenarioId != null && !EM002Config._flagRestored) { EM002Config._flagRestored = true; var s = EM002Config._scenarios[engine.state._scenarioId]; if (s) EM002Config.hints = EM002Config._scenarioHints[s.id] || EM002Config._defaultHints; } return true; },
    _applyScenario(engine, idx) {
        engine.state._scenarioId = idx; engine.state._scenarioSelected = true;
        engine.state._wrongMx = false; engine.state._quotaExceeded = false; engine.state._ruleBlocking = false; engine.state._spamQuarantined = false; engine.state._dlMissing = false;
        engine.state._labComplete = false; engine.state._flagRevealed = false;
        var o = EM002Config._scenarios[idx].stateOverrides || {}; for (var k in o) { engine.state[k] = o[k]; }
        EM002Config._flagRestored = true; EM002Config.hints = EM002Config._scenarioHints[EM002Config._scenarios[idx].id] || EM002Config._defaultHints; engine.save();
    },
    _getScenario(engine) { return engine.state._scenarioId == null ? null : EM002Config._scenarios[engine.state._scenarioId]; },
    _requireScenario(engine) { return engine.state._scenarioSelected ? null : '\nERROR: No active ticket.\nOpen the Help Desk Ticket first.'; },
    _escHtml(str) { var d = document.createElement('div'); d.textContent = str; return d.innerHTML; },

    boot: { biosLines: ['American Megatrends UEFI v2.20', 'Initializing helpdesk...', 'Memory: 16384 MB OK', 'Loading Windows...'], grubEntries: ['Windows 10 Pro'], loginUser: 'Technician' },
    desktop: { icons: [
        { id: 'cmd', label: 'Command\nPrompt', icon: '>_', app: 'terminal' },
        { id: 'mail', label: 'Mail Server\nConsole', icon: 'MX', app: 'mail_console' },
        { id: 'ticket', label: 'Help Desk\nTicket', icon: 'HD', app: 'ticket' },
        { id: 'hints', label: 'Hints', icon: '?', app: 'hints' },
        { id: 'reset', label: 'Reset\nLab', icon: 'RST', app: 'reset_lab' }
    ] },
    terminal: { user: 'Technician', hostname: 'HELPDESK01', startDir: 'C:\\Users\\Technician', promptStyle: 'windows', welcome: 'Microsoft Windows [Version 10.0.19045.3803]\n(c) Microsoft Corporation.\n' },
    filesystem: { '/': { type: 'dir', children: {} } },
    flags: [{ id: 'fixed', value: '{{FLAG:scenarioId}}', points: 500 }],
    scoring: { base: 0, maxScore: 600, hintPenalty: true, wrongFlagPenalty: 0, speedBonus: { threshold: 600000, points: 100 }, timeBonusThreshold: 1800 },
    hints: [ { id: 'hint1', text: 'Check the Mail Console for delivery status.', cost: 0, penalty: 0 }, { id: 'hint2', text: 'Use CLI tools to diagnose.', cost: 10, penalty: -10 }, { id: 'hint3', text: 'Each scenario has a different cause.', cost: 25, penalty: -25 }, { id: 'hint4', text: 'Use mail-fix to resolve.', cost: 50, penalty: -50 } ],
    lore: { intro: 'Emails are going missing. Users can\'t receive messages from external senders, distribution lists, or specific contacts. Find out why and fix it.', scenario: 'Each scenario involves a different receiving failure. DNS, quotas, rules, spam filters, and DL membership all need investigation.', outro: 'Inbound mail restored. Your troubleshooting identified the delivery failures and got everyone\'s email flowing again.' },
    phases: [
        { id: 'investigate', name: 'Investigation', description: 'Read the ticket and check mail server.', requiredFlags: [], unlocks: ['diagnose'], locked: false },
        { id: 'diagnose', name: 'Diagnosis', description: 'Find the root cause.', requiredFlags: [], unlocks: ['fix'], locked: true },
        { id: 'fix', name: 'Fix', description: 'Apply the correction.', requiredFlags: [], unlocks: ['verify'], locked: true },
        { id: 'verify', name: 'Verification', description: 'Confirm mail is flowing.', requiredFlags: ['fixed'], unlocks: [], locked: true }
    ],

    commands: {
        nslookup: function(args, term, engine) {
            var gate = EM002Config._requireScenario(engine); if (gate) return gate;
            var scenario = EM002Config._getScenario(engine); var joined = args.join(' ').toLowerCase();
            if (joined.includes('-type=mx') && joined.includes('hexworth')) {
                if (scenario && scenario.id === 'wrong_mx' && engine.state._wrongMx) {
                    return '\nServer: dc01.hexworth.local\nAddress: 10.0.2.10\n\nhexworth.local    MX preference = 10, mail exchanger = mail.hexworth.local\nmail.hexworth.local    internet address = 192.0.2.50\n\n[!] MX resolves to 192.0.2.50 — this is the OLD decommissioned server!\n[!] Should be 198.51.100.10 (current mail server)';
                }
                return '\nServer: dc01.hexworth.local\nAddress: 10.0.2.10\n\nhexworth.local    MX preference = 10, mail exchanger = mail.hexworth.local\nmail.hexworth.local    internet address = 198.51.100.10';
            }
            return '\nUsage: nslookup [-type=MX|TXT|A] <domain>';
        },

        'quota-check': function(args, term, engine) {
            var gate = EM002Config._requireScenario(engine); if (gate) return gate;
            var scenario = EM002Config._getScenario(engine); var target = args[0] || '';
            if (scenario && scenario.id === 'mailbox_full' && target === 'psimmons') {
                return '\nMailbox Quota — psimmons@hexworth.local\n========================================\n  Quota: 5.0 GB\n  Used:  5.1 GB (102%) [!] OVER QUOTA\n  Status: MAIL DELIVERY SUSPENDED\n\n  Largest Items:\n    1. All-Hands-Meeting-Recording.mp4    2,048 MB  (2026-03-15)\n    2. Q4-Sales-Presentation.pptx           187 MB  (2025-12-20)\n    3. Insurance-Benefits-Package.pdf         94 MB  (2025-11-03)\n\n  [!] Deleting the 2 GB video would bring usage to 3.1 GB (62%)';
            }
            return '\nUsage: quota-check <username>';
        },

        'mail-trace': function(args, term, engine) {
            var gate = EM002Config._requireScenario(engine); if (gate) return gate;
            var scenario = EM002Config._getScenario(engine); var joined = args.join(' ').toLowerCase();
            if (scenario && scenario.id === 'mail_rule' && joined.includes('marketing')) {
                return '\nMail Trace — marketing@hexworth.local (last 48 hours)\n=====================================================\n  External messages: 23 received, 23 BLOCKED by rule "Block External Spam to Marketing"\n  Internal messages: 12 received, 12 delivered successfully\n\n  [!] ALL external mail to marketing@ is being blocked by a mail flow rule\n  [!] Rule name: "Block External Spam to Marketing"';
            }
            if (scenario && scenario.id === 'spam_filter' && joined.includes('rkim')) {
                return '\nMail Trace — rkim@hexworth.local from pinnacle-corp.com\n=======================================================\n  5 messages found:\n    2026-03-25  "Q2 Proposal Review"      Score: 3.2  QUARANTINED\n    2026-03-26  "Meeting Follow-up"        Score: 3.1  QUARANTINED\n    2026-03-27  "Contract Amendment"       Score: 3.2  QUARANTINED\n    2026-03-28  "Budget Approval"          Score: 3.3  QUARANTINED\n    2026-03-29  "Urgent: Deadline Change"  Score: 3.1  QUARANTINED\n\n  [!] All 5 messages quarantined (score > 3.0 threshold)\n  [!] Pinnacle-corp.com has DKIM misconfiguration (+1.5 penalty)';
            }
            return '\nUsage: mail-trace --to <address> [--from <domain>]';
        },

        'rule-audit': function(args, term, engine) {
            var gate = EM002Config._requireScenario(engine); if (gate) return gate;
            var scenario = EM002Config._getScenario(engine);
            var rules = '\nMail Flow Rules\n================\n  1. "Disclaimer Footer"          Priority: 1   Status: Enabled   Action: Append disclaimer to all outbound\n  2. "Executive Auto-Forward"      Priority: 2   Status: Enabled   Action: BCC executive-archive@hexworth.local\n  3. "Large Attachment Warning"    Priority: 3   Status: Enabled   Action: Warn if attachment > 20 MB';
            if (scenario && scenario.id === 'mail_rule' && engine.state._ruleBlocking) {
                rules += '\n  4. "Block External Spam to Marketing"  Priority: 4   Status: Enabled   Action: REJECT\n     Condition: Recipient = marketing@hexworth.local AND Sender = External\n     [!] THIS RULE BLOCKS ALL EXTERNAL MAIL, NOT JUST SPAM\n     [!] Created by: jadmin (junior admin) on 2026-03-22';
            }
            return rules;
        },

        'spam-queue': function(args, term, engine) {
            var gate = EM002Config._requireScenario(engine); if (gate) return gate;
            var scenario = EM002Config._getScenario(engine);
            if (scenario && scenario.id === 'spam_filter' && engine.state._spamQuarantined) {
                return '\nSpam Quarantine Queue\n======================\n  5 messages from pinnacle-corp.com quarantined for rkim:\n    SQ-1201  "Q2 Proposal Review"       Score: 3.2  (threshold: 3.0)\n    SQ-1202  "Meeting Follow-up"         Score: 3.1\n    SQ-1203  "Contract Amendment"        Score: 3.2\n    SQ-1204  "Budget Approval"           Score: 3.3\n    SQ-1205  "Urgent: Deadline Change"   Score: 3.1\n\n  [!] All just barely over threshold — likely false positives\n  [!] Pinnacle DKIM misconfiguration adds 1.5 penalty points';
            }
            return '\nSpam Quarantine Queue\n  No messages in quarantine matching your query.';
        },

        'dl-members': function(args, term, engine) {
            var gate = EM002Config._requireScenario(engine); if (gate) return gate;
            var scenario = EM002Config._getScenario(engine); var target = args[0] || '';
            if (target === 'engineering') {
                var members = '\nDistribution List: engineering@hexworth.local\n==============================================\n  Members:\n    1. bsmith (Brian Smith, Lead Engineer)\n    2. jlee (Jennifer Lee, Senior Engineer)\n    3. mchen (Mike Chen, Engineer)\n    4. kwilson (Kevin Wilson, Engineer)';
                if (scenario && scenario.id === 'dist_list' && engine.state._dlMissing) {
                    members += '\n\n  [!] atorres (Alex Torres, new hire) is NOT on this list\n  [!] He was onboarded Monday but not added to the DL';
                } else {
                    members += '\n    5. atorres (Alex Torres, Engineer)';
                }
                return members;
            }
            return '\nUsage: dl-members <list-name>\nExample: dl-members engineering';
        },

        'mail-fix': function(args, term, engine) {
            var gate = EM002Config._requireScenario(engine); if (gate) return gate;
            var scenario = EM002Config._getScenario(engine); var joined = args.join(' ').toLowerCase();

            if (scenario && scenario.id === 'wrong_mx' && joined.includes('--update-mx') && joined.includes('198.51.100.10')) {
                engine.state._wrongMx = false; engine.state._labComplete = true; engine.state._flagRevealed = true; engine.save();
                setTimeout(function() { engine.notify('MX record corrected. External email delivery restored.', 'success'); }, 400);
                return '\nDNS Update — MX Record\n=======================\n  Updating MX for hexworth.local...\n  Old: mail.hexworth.local -> 192.0.2.50 (DECOMMISSIONED)\n  New: mail.hexworth.local -> 198.51.100.10 (CURRENT)\n  TTL: 3600\n  Status: PUBLISHED\n\n  Propagation: 5-30 minutes for most DNS resolvers\n  External mail delivery will resume as DNS propagates.\n\n=== FLAG: EM002{wrong_mx_dns_corrected} ===';
            }
            if (scenario && scenario.id === 'mailbox_full' && joined.includes('--clear-quota') && joined.includes('psimmons')) {
                engine.state._quotaExceeded = false; engine.state._labComplete = true; engine.state._flagRevealed = true; engine.save();
                setTimeout(function() { engine.notify('Mailbox cleared. Patricia can receive email again.', 'success'); }, 400);
                return '\nMailbox Cleanup — psimmons\n===========================\n  Moving All-Hands-Meeting-Recording.mp4 (2 GB) to file server... OK\n  Deleting from mailbox... OK\n  New usage: 3.1 GB / 5.0 GB (62%)\n  Mail delivery: RESUMED\n\n  A link to the video on the file server has been sent to Patricia.\n  Recommendation: Set up auto-archive policy for old emails.\n\n=== FLAG: EM002{mailbox_full_quota_cleared} ===';
            }
            if (scenario && scenario.id === 'mail_rule' && joined.includes('--fix-rule') && joined.includes('marketing')) {
                engine.state._ruleBlocking = false; engine.state._labComplete = true; engine.state._flagRevealed = true; engine.save();
                setTimeout(function() { engine.notify('Mail flow rule corrected. Marketing is receiving external email.', 'success'); }, 400);
                return '\nMail Flow Rule Update\n======================\n  Rule: "Block External Spam to Marketing"\n  Old condition: Recipient=marketing@ AND Sender=External -> REJECT\n  New condition: Recipient=marketing@ AND SpamScore>7.0 -> QUARANTINE\n\n  The rule now only quarantines high-confidence spam instead of blocking all external mail.\n  23 previously blocked messages have been reprocessed and delivered.\n\n=== FLAG: EM002{mail_rule_overly_broad_fixed} ===';
            }
            if (scenario && scenario.id === 'spam_filter' && joined.includes('--spam-release') && joined.includes('rkim')) {
                engine.state._spamQuarantined = false; engine.state._labComplete = true; engine.state._flagRevealed = true; engine.save();
                setTimeout(function() { engine.notify('Pinnacle emails released and domain whitelisted.', 'success'); }, 400);
                return '\nSpam Quarantine Action\n=======================\n  Releasing 5 quarantined messages from pinnacle-corp.com... OK\n  Messages delivered to rkim\'s inbox.\n' + (joined.includes('--whitelist') ? '  Adding pinnacle-corp.com to sender allow list... OK\n  Future emails from this domain will bypass spam scoring.\n' : '') + '\nRobert should now see all 5 Pinnacle emails in his inbox.\n\n=== FLAG: EM002{spam_filter_false_positive_released} ===';
            }
            if (scenario && scenario.id === 'dist_list' && joined.includes('--add-dl') && joined.includes('engineering') && joined.includes('atorres')) {
                engine.state._dlMissing = false; engine.state._labComplete = true; engine.state._flagRevealed = true; engine.save();
                setTimeout(function() { engine.notify('Alex added to engineering DL. He will now receive team emails.', 'success'); }, 400);
                return '\nDistribution List Update\n=========================\n  Adding atorres to engineering@hexworth.local... OK\n  Member count: 4 -> 5\n  Sending test message to engineering@... OK (5/5 delivered)\n\n  Alex Torres will now receive all emails sent to the engineering DL.\n\n=== FLAG: EM002{dist_list_member_added} ===';
            }

            return '\nUsage: mail-fix [action]\n  --update-mx <ip>                 Fix MX record\n  --clear-quota <user>             Clean mailbox quota\n  --fix-rule <target>              Fix mail flow rule\n  --spam-release <user>            Release quarantined email\n  --whitelist <domain>             Add to sender allow list\n  --add-dl <list> <user>           Add user to distribution list';
        },

        whoami: function() { return 'HELPDESK01\\Technician'; },
        hostname: function() { return 'HELPDESK01'; },
        cls: function(args, term) { term.outputEl.innerHTML = ''; return null; },
        ping: function(args) { if (!args.length) return '\nUsage: ping <target>'; return '\nPinging ' + args[0] + '... Reply from ' + args[0] + ': time=1ms TTL=128'; },
        ipconfig: function() { return '\nIPv4: 10.0.2.50\nGateway: 10.0.2.1\nDNS: 10.0.2.10'; },
        ifconfig: function() { return '\'ifconfig\' is not recognized.'; },
        grep: function() { return '\'grep\' is not recognized.'; },
        sudo: function() { return '\'sudo\' is not recognized.'; }
    },

    onAppLaunch(iconDef, engine) {
        if (iconDef.app === 'mail_console' && !engine.state._scenarioSelected) { engine.notify('Open the Help Desk Ticket first.', 'error'); return; }
        switch (iconDef.app) {
            case 'ticket': EM002Config._openTicket(iconDef, engine); break;
            case 'mail_console': EM002Config._openMailConsole(iconDef, engine); break;
            case 'reset_lab': if (confirm('Reset this lab?')) { engine.resetLab(); } break;
        }
    },

    _openTicket(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var c = document.createElement('div'); c.id = 'ticketContainer';
        c.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Help Desk Ticket', 'HD', c);
        EM002Config._ensureScenario(engine);
        if (engine.state._scenarioSelected) { EM002Config._renderTicket(engine, c); } else { EM002Config._renderPicker(engine, c); }
    },

    _renderPicker(engine, container) {
        var p = ['All Users — "Nobody has received external email for 2 days"', 'Patricia Simmons — "Senders getting mailbox full bounces"', 'Marketing Team — "Not receiving external emails, internal works fine"', 'Robert Kim — "Client emails from Pinnacle Corp not arriving"', 'Alex Torres — "New hire not getting team distribution list emails"'];
        var html = '<div style="text-align:center; margin-bottom:20px;"><div style="color:#22c55e; font-weight:bold; font-size:1.1rem; margin-bottom:8px;">EMAIL HELP DESK QUEUE</div><div style="color:#888; font-size:0.75rem;">Select a ticket.</div></div><div style="margin-bottom:16px;">';
        EM002Config._scenarios.forEach(function(s, i) { html += '<button class="em-scenario-btn" data-idx="' + i + '" style="display:block; width:100%; text-align:left; padding:12px 16px; margin-bottom:8px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.12); border-radius:4px; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem; cursor:pointer; transition:border-color 0.2s;"><div style="display:flex; justify-content:space-between;"><span style="color:#22c55e; font-weight:bold;">EM-' + (2000 + i) + '</span><span style="background:#f59e0b; color:#000; padding:1px 8px; border-radius:3px; font-size:0.65rem;">URGENT</span></div><div style="color:#aaa; font-size:0.7rem; margin-top:4px;">' + p[i] + '</div></button>'; });
        html += '</div><div style="text-align:center; border-top:1px solid rgba(255,255,255,0.1); padding-top:16px;"><button id="emRandomBtn" style="padding:10px 28px; background:#22c55e; color:#000; border:none; border-radius:4px; cursor:pointer; font-weight:bold; font-size:0.85rem; font-family:Consolas,monospace;">Random Assignment</button></div>';
        container.innerHTML = html;
        container.querySelectorAll('.em-scenario-btn').forEach(function(btn) { btn.addEventListener('mouseenter', function() { this.style.borderColor = '#22c55e'; }); btn.addEventListener('mouseleave', function() { this.style.borderColor = 'rgba(255,255,255,0.12)'; }); btn.addEventListener('click', function() { EM002Config._applyScenario(engine, parseInt(this.getAttribute('data-idx'))); EM002Config._renderTicket(engine, container); }); });
        document.getElementById('emRandomBtn').addEventListener('click', function() { EM002Config._applyScenario(engine, Math.floor(Math.random() * EM002Config._scenarios.length)); EM002Config._renderTicket(engine, container); });
    },

    _renderTicket(engine, container) {
        var s = EM002Config._getScenario(engine);
        container.innerHTML = '<div style="border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:12px; margin-bottom:16px;"><div style="display:flex; justify-content:space-between;"><span style="color:#22c55e; font-weight:bold; font-size:1rem;">TICKET #EM-' + (2000 + engine.state._scenarioId) + '</span><span style="background:#f59e0b; color:#000; padding:2px 10px; border-radius:3px; font-size:0.7rem; font-weight:bold;">URGENT</span></div></div>'
            + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">REPORTED BY</div><div style="font-weight:bold; color:#22c55e;">' + s.affectedUser + '</div></div>'
            + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">SUBJECT</div><div style="font-weight:bold;">' + EM002Config._escHtml(s.ticketSubject) + '</div></div>'
            + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">DESCRIPTION</div><div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:4px; padding:12px; line-height:1.6;">' + EM002Config._escHtml(s.ticketDetail) + '</div></div>'
            + (s.ticketExtra ? '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">INTERNAL NOTES</div><div style="background:rgba(34,197,94,0.08); border:1px solid rgba(34,197,94,0.2); border-radius:4px; padding:12px; line-height:1.6; color:#86efac;">' + EM002Config._escHtml(s.ticketExtra) + '</div></div>' : '')
            + '<div style="border-top:1px solid rgba(255,255,255,0.1); padding-top:12px;"><div style="color:#888; font-size:0.7rem;">ASSIGNED TO</div><div style="color:#2ecc71; font-weight:bold;">YOU — Desktop Support Technician</div></div>';
    },

    _openMailConsole(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var c = document.createElement('div'); c.id = 'mailContainer';
        c.style.cssText = 'padding:16px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Mail Server Console', 'MX', c);
        var sc = engine.state._labComplete ? '#22c55e' : '#f59e0b'; var st = engine.state._labComplete ? 'ALL NORMAL' : 'DELIVERY ISSUES';
        c.innerHTML = '<div style="color:#22c55e; font-weight:bold; font-size:1rem; margin-bottom:12px;">Mail Server Console</div><div style="padding:12px; background:rgba(' + (engine.state._labComplete ? '34,197,94' : '245,158,11') + ',0.08); border:1px solid rgba(' + (engine.state._labComplete ? '34,197,94' : '245,158,11') + ',0.2); border-radius:4px; text-align:center;"><div style="color:#888; font-size:0.75rem;">Status</div><div style="color:' + sc + '; font-weight:bold; font-size:1.1rem;">' + st + '</div></div><div style="margin-top:16px; color:#888; font-size:0.75rem;">Use: nslookup, mail-trace, quota-check, rule-audit, spam-queue, dl-members, mail-fix</div>';
    }
};
