/* ============================================================
   DISPATCH LAB — Box MAIL002: SPF/DKIM/DMARC Failure
   CompTIA Network+ — Email Authentication Troubleshooting (N10-009)
   Config: DNS TXT records, email headers, DKIM selectors, DMARC policy
   5 distinct scenarios: SPF hard fail, DKIM invalid, DMARC reject,
   third-party SPF, alignment failure
   ============================================================ */

var MAIL002Config = {

    // ==========================================================
    // BOX METADATA
    // ==========================================================

    title: 'SPF/DKIM/DMARC Failure',
    subtitle: 'Authentication Breakdown — Email Security Troubleshooting',
    difficulty: 'Intermediate',
    accent: '#10b981',
    storageKey: 'hexworth_lab_mail002',
    registryId: 'mail002-email-auth',
    trackerKey: 'lab_mail002',

    // ==========================================================
    // TUTORIAL MODE
    // ==========================================================

    tutorialMode: true,

    tutorial: {
        steps: [
            {
                title: 'Open the Help Desk Ticket',
                tip: 'Double-click the Help Desk Ticket icon to read the email authentication complaint.',
                trigger: { event: 'window_open', match: { type: 'ticket' } }
            },
            {
                title: 'Check email headers',
                tip: 'Open the Email Headers Analyzer to see SPF, DKIM, and DMARC results for the affected message.',
                trigger: { event: 'window_open', match: { type: 'header_analyzer' } }
            },
            {
                title: 'Query DNS records',
                tip: 'Use nslookup or dig to check SPF (TXT), DKIM (selector._domainkey.domain), and DMARC (_dmarc.domain) records.',
                trigger: {
                    event: 'command',
                    match: { cmd: 'contains:nslookup' },
                    alt: [
                        { event: 'command', match: { cmd: 'contains:dig' } }
                    ]
                }
            },
            {
                title: 'Apply the fix',
                tip: 'Update the appropriate DNS record to fix SPF includes, DKIM selectors, DMARC policy, or alignment settings.',
                trigger: {
                    event: 'command',
                    match: { cmd: 'contains:nsupdate' },
                    alt: [
                        { event: 'command', match: { cmd: 'contains:dns-update' } }
                    ]
                }
            },
            {
                title: 'Capture the flag',
                tip: 'After fixing the DNS record, verify with nslookup and check the Email Headers Analyzer for the recovery token.',
                trigger: { event: 'flag_correct', match: { flagId: 'fixed' } }
            }
        ]
    },

    // ==========================================================
    // CERT OBJECTIVES
    // ==========================================================

    certObjectives: {
        certPath: 'Network+',
        mappings: [
            { flagId: 'fixed', objective: '4.1', description: 'Explain common security concepts — email security (SPF, DKIM, DMARC)', skill: 'Email Authentication Configuration' },
            { flagId: 'fixed', objective: '1.6', description: 'Explain the use and purpose of network services — DNS record types', skill: 'DNS TXT Record Management' }
        ]
    },

    // ==========================================================
    // DOMAIN DATA
    // ==========================================================

    _domain: 'ourcompany.com',
    _relayIp: '203.0.113.50',
    _dkimSelector: 'selector1',

    // ==========================================================
    // SCENARIOS
    // ==========================================================

    _scenarios: [
        {
            id: 'spf_hard_fail',
            name: 'SPF Hard Fail',
            ticketSubject: 'External recipients say our emails land in spam — SPF failure',
            ticketDetail: 'Multiple clients report our emails going to spam or being rejected. The bounce messages mention "SPF fail" and reference our new cloud server at 198.51.100.75. We moved our CRM email sending to this server last week but apparently nobody updated the SPF record. All emails from the CRM are failing SPF checks.',
            ticketExtra: 'IT Note: New CRM cloud server (198.51.100.75) was deployed last week for automated email. The SPF record for ourcompany.com only includes the old relay IP (203.0.113.50). The new IP was never added.',
            affectedDns: 'SPF TXT record',
            fixDescription: 'Add 198.51.100.75 to the SPF record as ip4:198.51.100.75',
            stateOverrides: { _spfMissing: true, _newSendIp: '198.51.100.75' }
        },
        {
            id: 'dkim_invalid',
            name: 'DKIM Signature Invalid',
            ticketSubject: 'DKIM failures on all outbound mail — selector rotated but DNS not updated',
            ticketDetail: 'All outbound email is failing DKIM verification. Recipients see "dkim=fail" in headers. The security team rotated our DKIM keys last Friday as part of a quarterly rotation but the new public key was never published in DNS. The old selector "selector1" still has the previous key.',
            ticketExtra: 'IT Note: DKIM key rotation was performed Friday. New private key installed on MAIL-GW01. The corresponding public key needs to be published at selector2._domainkey.ourcompany.com. The old selector1 record is stale.',
            affectedDns: 'DKIM TXT record',
            fixDescription: 'Publish new DKIM public key at selector2._domainkey.ourcompany.com',
            stateOverrides: { _dkimStale: true, _newSelector: 'selector2' }
        },
        {
            id: 'dmarc_reject',
            name: 'DMARC Policy Rejecting Legitimate Mail',
            ticketSubject: 'DMARC policy is quarantining our own legitimate emails',
            ticketDetail: 'After the security team tightened our DMARC policy from p=none to p=reject, legitimate emails from our marketing platform are being rejected by recipient servers. The DMARC report shows our MailChimp-sent emails fail both SPF and DKIM alignment. We need to fix this without weakening DMARC.',
            ticketExtra: 'IT Note: DMARC was changed to p=reject last Monday. Marketing uses MailChimp which sends from their IPs. SPF covers MailChimp via include, but DKIM signing uses MailChimp\'s domain. DMARC requires at least one of SPF or DKIM to align with the From domain.',
            affectedDns: 'DMARC TXT record',
            fixDescription: 'Configure DKIM signing for MailChimp to sign with ourcompany.com d= domain, ensuring DKIM alignment',
            stateOverrides: { _dmarcStrict: true }
        },
        {
            id: 'third_party_spf',
            name: 'Third-Party Not in SPF',
            ticketSubject: 'MailChimp campaign emails all failing SPF — not in our SPF record',
            ticketDetail: 'Marketing launched a MailChimp campaign yesterday and every single email is failing SPF. The SPF record for ourcompany.com does not include MailChimp\'s servers. Recipients are seeing "spf=fail" in headers and the emails are landing in spam. Marketing needs this fixed immediately for the Q1 campaign.',
            ticketExtra: 'IT Note: MailChimp sends from their own IP ranges. Their SPF include mechanism is "include:servers.mcsv.net". This was never added to our SPF record when marketing onboarded MailChimp 6 months ago.',
            affectedDns: 'SPF TXT record',
            fixDescription: 'Add include:servers.mcsv.net to the SPF record',
            stateOverrides: { _spfMissingInclude: true, _thirdParty: 'servers.mcsv.net' }
        },
        {
            id: 'alignment_failure',
            name: 'Alignment Failure (Envelope vs Header)',
            ticketSubject: 'DMARC failing despite SPF and DKIM passing — alignment issue',
            ticketDetail: 'This is confusing — noreply emails from our ticketing system pass both SPF and DKIM individually, but DMARC still fails. The DMARC aggregate reports show "aligned: no" for both. The ticketing system sends with envelope-from noreply@tickets.ourcompany.com but the header From is noreply@ourcompany.com.',
            ticketExtra: 'IT Note: The ticketing system uses a subdomain (tickets.ourcompany.com) for the envelope sender but the visible From address is ourcompany.com. DMARC in strict alignment mode requires exact domain match. Current DMARC has aspf=s (strict SPF alignment) which is causing failures.',
            affectedDns: 'DMARC TXT record',
            fixDescription: 'Change DMARC alignment to relaxed (aspf=r) to allow subdomain alignment, or fix the envelope sender',
            stateOverrides: { _alignmentStrict: true }
        }
    ],

    // ==========================================================
    // HINTS
    // ==========================================================

    _defaultHints: [
        { id: 'hint1', text: 'Open the Email Headers Analyzer to see which authentication check is failing.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Use nslookup -type=txt to query SPF, DKIM, and DMARC DNS records.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'SPF is in the TXT record of the domain. DKIM is at selector._domainkey.domain. DMARC is at _dmarc.domain.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'After identifying the issue, use dns-update to fix the record and verify with nslookup.', cost: 50, penalty: -50 }
    ],

    _scenarioHints: {
        spf_hard_fail: [
            { id: 'hint1', text: 'SPF fail means the sending IP is not authorized. Query the SPF record to see what IPs are included.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Run: nslookup -type=txt ourcompany.com — look for the v=spf1 record and check if 198.51.100.75 is listed.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'The new CRM server IP (198.51.100.75) is not in the SPF record. Add it with ip4:198.51.100.75.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run: dns-update spf add ip4:198.51.100.75 — then verify with nslookup.', cost: 150, penalty: -150 }
        ],
        dkim_invalid: [
            { id: 'hint1', text: 'DKIM fail means the signature cannot be verified. The public key in DNS may be wrong or missing.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Query the current selector: nslookup -type=txt selector1._domainkey.ourcompany.com', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'The server is signing with selector2 but only selector1 is in DNS. Publish the new key at selector2._domainkey.ourcompany.com.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run: dns-update dkim publish selector2 — this publishes the new public key and fixes DKIM verification.', cost: 150, penalty: -150 }
        ],
        dmarc_reject: [
            { id: 'hint1', text: 'DMARC requires either SPF or DKIM to pass AND align with the From domain.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'MailChimp passes SPF (via include) but signs DKIM with their own domain, not ours. Neither aligns with ourcompany.com.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Configure MailChimp DKIM to sign with d=ourcompany.com so DKIM alignment passes under DMARC.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run: dns-update dkim publish mailchimp — this adds the MailChimp DKIM key for ourcompany.com, enabling alignment.', cost: 150, penalty: -150 }
        ],
        third_party_spf: [
            { id: 'hint1', text: 'MailChimp sends from their own IPs. If those IPs are not in our SPF, the emails fail SPF.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Query our SPF record — does it include servers.mcsv.net? Run: nslookup -type=txt ourcompany.com', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'The SPF record is missing include:servers.mcsv.net. Add it to authorize MailChimp\'s servers.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run: dns-update spf add include:servers.mcsv.net — then verify the updated SPF record.', cost: 150, penalty: -150 }
        ],
        alignment_failure: [
            { id: 'hint1', text: 'DMARC alignment checks if the SPF/DKIM domain matches the From header domain.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'The envelope From is tickets.ourcompany.com but the header From is ourcompany.com. Strict alignment requires exact match.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Query DMARC: nslookup -type=txt _dmarc.ourcompany.com — look for aspf=s (strict). Change to aspf=r (relaxed).', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run: dns-update dmarc set aspf=r — relaxed alignment allows subdomain match. Verify with nslookup.', cost: 150, penalty: -150 }
        ]
    },

    // ==========================================================
    // HELPERS
    // ==========================================================

    _ensureScenario(engine) {
        if (!engine.state._scenarioSelected) return false;
        if (engine.state._scenarioId != null && !MAIL002Config._flagRestored) {
            MAIL002Config._flagRestored = true;
            var scenario = MAIL002Config._scenarios[engine.state._scenarioId];
            if (scenario) {
                MAIL002Config.hints = MAIL002Config._scenarioHints[scenario.id] || MAIL002Config._defaultHints;
            }
        }
        return true;
    },

    _applyScenario(engine, idx) {
        engine.state._scenarioId = idx;
        engine.state._scenarioSelected = true;
        engine.state._spfMissing = false;
        engine.state._dkimStale = false;
        engine.state._dmarcStrict = false;
        engine.state._spfMissingInclude = false;
        engine.state._alignmentStrict = false;
        engine.state._labComplete = false;
        engine.state._flagRevealed = false;
        engine.state._fixApplied = false;

        var overrides = MAIL002Config._scenarios[idx].stateOverrides || {};
        for (var key in overrides) { engine.state[key] = overrides[key]; }

        var scenario = MAIL002Config._scenarios[idx];
        MAIL002Config._flagRestored = true;
        MAIL002Config.hints = MAIL002Config._scenarioHints[scenario.id] || MAIL002Config._defaultHints;
        engine.save();
    },

    _getScenario(engine) {
        if (engine.state._scenarioId == null) return null;
        return MAIL002Config._scenarios[engine.state._scenarioId];
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
    // BOOT SEQUENCE
    // ==========================================================

    boot: {
        biosLines: [
            'Dell PowerEdge R640 UEFI BIOS v2.14.1',
            'Initializing hardware...',
            'Memory Test: 65536 MB OK',
            'Detecting drives... RAID1: PERC H730P (1.2TB)',
            'Network: Broadcom BCM5720 (4x1GbE)',
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
    // DESKTOP
    // ==========================================================

    desktop: {
        icons: [
            { id: 'terminal',         label: 'Terminal',              icon: '>_',  app: 'terminal' },
            { id: 'header_analyzer',  label: 'Email Header\nAnalyzer', icon: 'HDR', app: 'header_analyzer' },
            { id: 'dns_records',      label: 'DNS\nRecords',          icon: 'DNS', app: 'dns_records' },
            { id: 'dmarc_report',     label: 'DMARC\nReport',         icon: 'DMR', app: 'dmarc_report' },
            { id: 'server_info',      label: 'Server\nInfo',          icon: 'SRV', app: 'server_info' },
            { id: 'ticket',           label: 'Help Desk\nTicket',     icon: 'HD',  app: 'ticket' },
            { id: 'hints',            label: 'Hints',                 icon: '?',   app: 'hints' },
            { id: 'reset',            label: 'Reset\nLab',            icon: 'RST', app: 'reset_lab' }
        ]
    },

    terminal: {
        user: 'mailadmin',
        hostname: 'MAIL-GW01',
        startDir: '/home/mailadmin',
        promptStyle: 'linux',
        welcome: 'Ubuntu 22.04.3 LTS\n\nWelcome to MAIL-GW01 — Email Authentication Lab\nLast login: Mon Mar 30 07:00:00 2026\n'
    },

    filesystem: { '/': { type: 'dir', children: {} } },

    flags: [
        { id: 'fixed', value: '{{FLAG:scenarioId}}', points: 500 }
    ],

    scoring: {
        base: 0, maxScore: 600, hintPenalty: true, wrongFlagPenalty: 0,
        speedBonus: { threshold: 600000, points: 100 }, timeBonusThreshold: 1800
    },

    hints: [
        { id: 'hint1', text: 'Open the Email Headers Analyzer to see which check is failing.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Use nslookup -type=txt to query SPF, DKIM, and DMARC records.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'SPF: domain TXT. DKIM: selector._domainkey.domain. DMARC: _dmarc.domain.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'Use dns-update to fix the record, then verify.', cost: 50, penalty: -50 }
    ],

    lore: {
        intro: 'Email authentication is failing. SPF, DKIM, or DMARC checks are causing legitimate mail to be rejected or quarantined. Diagnose the specific failure and fix the DNS records.',
        scenario: 'Each scenario targets a different email authentication mechanism. Use header analysis, DNS queries, and DMARC reports to identify the exact failure point.',
        outro: 'Email authentication restored. SPF, DKIM, and DMARC are all passing. Your understanding of email security protocols resolved the delivery failures.'
    },

    phases: [
        { id: 'investigate', name: 'Investigation', description: 'Read the ticket and examine email headers for authentication failures.', requiredFlags: [], unlocks: ['diagnose'], locked: false },
        { id: 'diagnose', name: 'Diagnosis', description: 'Query DNS records to identify the misconfiguration.', requiredFlags: [], unlocks: ['repair'], locked: true },
        { id: 'repair', name: 'Repair', description: 'Update the DNS record to fix authentication.', requiredFlags: [], unlocks: ['verify'], locked: true },
        { id: 'verify', name: 'Verification', description: 'Verify the fix and capture the flag.', requiredFlags: ['fixed'], unlocks: [], locked: true }
    ],

    // ==========================================================
    // COMMANDS
    // ==========================================================

    commands: {

        nslookup: function(args, term, engine) {
            var gate = MAIL002Config._requireScenario(engine);
            if (gate) return gate;
            var scenario = MAIL002Config._getScenario(engine);
            var joined = args.join(' ').toLowerCase();

            // SPF record
            if ((joined.includes('-type=txt') || joined.includes('-q=txt')) && joined.includes('ourcompany.com') && !joined.includes('_domainkey') && !joined.includes('_dmarc')) {
                if (engine.state._spfMissing && !engine.state._fixApplied) {
                    return '\nServer:  10.0.1.2\nAddress: 10.0.1.2#53\n\nourcompany.com  text = "v=spf1 ip4:203.0.113.50 -all"\n\n(Note: Only 203.0.113.50 is authorized. New CRM server 198.51.100.75 is NOT included.)\n';
                }
                if (engine.state._spfMissingInclude && !engine.state._fixApplied) {
                    return '\nServer:  10.0.1.2\nAddress: 10.0.1.2#53\n\nourcompany.com  text = "v=spf1 ip4:203.0.113.50 -all"\n\n(Note: No include for third-party senders like MailChimp. servers.mcsv.net is NOT included.)\n';
                }
                if (engine.state._fixApplied && scenario.id === 'spf_hard_fail') {
                    return '\nServer:  10.0.1.2\nAddress: 10.0.1.2#53\n\nourcompany.com  text = "v=spf1 ip4:203.0.113.50 ip4:198.51.100.75 -all"\n';
                }
                if (engine.state._fixApplied && scenario.id === 'third_party_spf') {
                    return '\nServer:  10.0.1.2\nAddress: 10.0.1.2#53\n\nourcompany.com  text = "v=spf1 ip4:203.0.113.50 include:servers.mcsv.net -all"\n';
                }
                return '\nServer:  10.0.1.2\nAddress: 10.0.1.2#53\n\nourcompany.com  text = "v=spf1 ip4:203.0.113.50 include:servers.mcsv.net -all"\n';
            }

            // DKIM record
            if (joined.includes('_domainkey')) {
                var selectorMatch = joined.match(/(\w+)\._domainkey/);
                var selector = selectorMatch ? selectorMatch[1] : 'selector1';

                if (selector === 'selector1') {
                    if (engine.state._dkimStale) {
                        return '\nServer:  10.0.1.2\nAddress: 10.0.1.2#53\n\nselector1._domainkey.ourcompany.com  text = "v=DKIM1; k=rsa; p=MIIBIjANBgkq...OLD_KEY_2025Q3"\n\n(WARNING: This key is from Q3 2025. Server is signing with selector2 — key rotation was performed but DNS not updated.)\n';
                    }
                    return '\nServer:  10.0.1.2\nAddress: 10.0.1.2#53\n\nselector1._domainkey.ourcompany.com  text = "v=DKIM1; k=rsa; p=MIIBIjANBgkq...VALID_KEY"\n';
                }
                if (selector === 'selector2') {
                    if (engine.state._dkimStale && !engine.state._fixApplied) {
                        return '\nServer:  10.0.1.2\nAddress: 10.0.1.2#53\n\n** server can\'t find selector2._domainkey.ourcompany.com: NXDOMAIN\n\n(selector2 does not exist in DNS — new DKIM public key was never published)\n';
                    }
                    if (engine.state._fixApplied && scenario.id === 'dkim_invalid') {
                        return '\nServer:  10.0.1.2\nAddress: 10.0.1.2#53\n\nselector2._domainkey.ourcompany.com  text = "v=DKIM1; k=rsa; p=MIIBIjANBgkq...NEW_KEY_2026Q1"\n';
                    }
                    return '\nServer:  10.0.1.2\nAddress: 10.0.1.2#53\n\n** server can\'t find selector2._domainkey.ourcompany.com: NXDOMAIN\n';
                }
                if (selector === 'mailchimp' || selector === 'mc') {
                    if (engine.state._fixApplied && scenario.id === 'dmarc_reject') {
                        return '\nServer:  10.0.1.2\nAddress: 10.0.1.2#53\n\nmailchimp._domainkey.ourcompany.com  text = "v=DKIM1; k=rsa; p=MIIBIjANBgkq...MAILCHIMP_KEY"\n';
                    }
                    return '\nServer:  10.0.1.2\nAddress: 10.0.1.2#53\n\n** server can\'t find ' + selector + '._domainkey.ourcompany.com: NXDOMAIN\n';
                }
                return '\nServer:  10.0.1.2\nAddress: 10.0.1.2#53\n\n** server can\'t find ' + selector + '._domainkey.ourcompany.com: NXDOMAIN\n';
            }

            // DMARC record
            if (joined.includes('_dmarc')) {
                if (engine.state._alignmentStrict && !engine.state._fixApplied) {
                    return '\nServer:  10.0.1.2\nAddress: 10.0.1.2#53\n\n_dmarc.ourcompany.com  text = "v=DMARC1; p=reject; aspf=s; adkim=s; rua=mailto:dmarc@ourcompany.com"\n\n(aspf=s = strict SPF alignment — subdomain envelope-from will NOT align with header From)\n';
                }
                if (engine.state._fixApplied && scenario.id === 'alignment_failure') {
                    return '\nServer:  10.0.1.2\nAddress: 10.0.1.2#53\n\n_dmarc.ourcompany.com  text = "v=DMARC1; p=reject; aspf=r; adkim=r; rua=mailto:dmarc@ourcompany.com"\n';
                }
                return '\nServer:  10.0.1.2\nAddress: 10.0.1.2#53\n\n_dmarc.ourcompany.com  text = "v=DMARC1; p=reject; aspf=r; adkim=r; rua=mailto:dmarc@ourcompany.com"\n';
            }

            if (!args.length) {
                return '\nUsage: nslookup [-type=txt] domain\nExamples:\n  nslookup -type=txt ourcompany.com           (SPF)\n  nslookup -type=txt selector1._domainkey.ourcompany.com  (DKIM)\n  nslookup -type=txt _dmarc.ourcompany.com    (DMARC)\n';
            }

            return '\nServer:  10.0.1.2\nAddress: 10.0.1.2#53\n\nName:    ' + args[args.length - 1] + '\nAddress: 198.51.100.1\n';
        },

        dig: function(args, term, engine) {
            return MAIL002Config.commands.nslookup(args, term, engine);
        },

        'dns-update': function(args, term, engine) {
            var gate = MAIL002Config._requireScenario(engine);
            if (gate) return gate;
            var scenario = MAIL002Config._getScenario(engine);
            var joined = args.join(' ').toLowerCase();

            if (joined.includes('spf') && joined.includes('add')) {
                if (scenario.id === 'spf_hard_fail' && (joined.includes('198.51.100.75') || joined.includes('ip4'))) {
                    engine.state._fixApplied = true;
                    engine.state._spfMissing = false;
                    engine.state._flagRevealed = true;
                    engine.state._labComplete = true;
                    engine.save();
                    setTimeout(function() { engine.notify('SPF record updated. New CRM server IP authorized. Check Email Headers Analyzer for the recovery token.', 'success'); }, 400);
                    return '\n[DNS UPDATE] SPF record for ourcompany.com updated:\n  v=spf1 ip4:203.0.113.50 ip4:198.51.100.75 -all\nDNS propagation: immediate (internal zone)\n';
                }
                if (scenario.id === 'third_party_spf' && (joined.includes('mcsv.net') || joined.includes('mailchimp'))) {
                    engine.state._fixApplied = true;
                    engine.state._spfMissingInclude = false;
                    engine.state._flagRevealed = true;
                    engine.state._labComplete = true;
                    engine.save();
                    setTimeout(function() { engine.notify('SPF record updated with MailChimp include. Check Email Headers Analyzer for the recovery token.', 'success'); }, 400);
                    return '\n[DNS UPDATE] SPF record for ourcompany.com updated:\n  v=spf1 ip4:203.0.113.50 include:servers.mcsv.net -all\nDNS propagation: immediate (internal zone)\n';
                }
                return '\n[DNS UPDATE] SPF record updated (no effect on current scenario).\n';
            }

            if (joined.includes('dkim') && joined.includes('publish')) {
                if (scenario.id === 'dkim_invalid' && joined.includes('selector2')) {
                    engine.state._fixApplied = true;
                    engine.state._dkimStale = false;
                    engine.state._flagRevealed = true;
                    engine.state._labComplete = true;
                    engine.save();
                    setTimeout(function() { engine.notify('DKIM public key published at selector2._domainkey.ourcompany.com. Check Email Headers Analyzer for the recovery token.', 'success'); }, 400);
                    return '\n[DNS UPDATE] DKIM record published:\n  selector2._domainkey.ourcompany.com TXT "v=DKIM1; k=rsa; p=MIIBIjANBgkq...NEW_KEY_2026Q1"\nDNS propagation: immediate\n';
                }
                if (scenario.id === 'dmarc_reject' && joined.includes('mailchimp')) {
                    engine.state._fixApplied = true;
                    engine.state._dmarcStrict = false;
                    engine.state._flagRevealed = true;
                    engine.state._labComplete = true;
                    engine.save();
                    setTimeout(function() { engine.notify('MailChimp DKIM key published for ourcompany.com. DKIM alignment will now pass. Check Email Headers Analyzer for the recovery token.', 'success'); }, 400);
                    return '\n[DNS UPDATE] DKIM record published:\n  mailchimp._domainkey.ourcompany.com TXT "v=DKIM1; k=rsa; p=MIIBIjANBgkq...MAILCHIMP_KEY"\nMailChimp can now sign with d=ourcompany.com for DMARC alignment.\n';
                }
                return '\n[DNS UPDATE] DKIM record published (no effect on current scenario).\n';
            }

            if (joined.includes('dmarc') && (joined.includes('aspf=r') || joined.includes('relaxed'))) {
                if (scenario.id === 'alignment_failure') {
                    engine.state._fixApplied = true;
                    engine.state._alignmentStrict = false;
                    engine.state._flagRevealed = true;
                    engine.state._labComplete = true;
                    engine.save();
                    setTimeout(function() { engine.notify('DMARC alignment changed to relaxed. Subdomain alignment now accepted. Check Email Headers Analyzer for the recovery token.', 'success'); }, 400);
                    return '\n[DNS UPDATE] DMARC record updated:\n  _dmarc.ourcompany.com TXT "v=DMARC1; p=reject; aspf=r; adkim=r; rua=mailto:dmarc@ourcompany.com"\nRelaxed alignment will allow tickets.ourcompany.com envelope-from.\n';
                }
                return '\n[DNS UPDATE] DMARC record updated (no effect on current scenario).\n';
            }

            return '\nUsage: dns-update <record-type> <action> [params]\n\nExamples:\n  dns-update spf add ip4:198.51.100.75\n  dns-update spf add include:servers.mcsv.net\n  dns-update dkim publish selector2\n  dns-update dkim publish mailchimp\n  dns-update dmarc set aspf=r\n';
        },

        nsupdate: function(args, term, engine) {
            return MAIL002Config.commands['dns-update'](args, term, engine);
        },

        ping: function(args, term, engine) {
            var gate = MAIL002Config._requireScenario(engine);
            if (gate) return gate;
            if (!args.length) return '\nUsage: ping [-c count] target\n';
            var target = args[args.length - 1];
            return '\nPING ' + target + ' (' + target + ') 56(84) bytes of data.\n64 bytes from ' + target + ': icmp_seq=1 ttl=64 time=1.2 ms\n64 bytes from ' + target + ': icmp_seq=2 ttl=64 time=1.1 ms\n\n--- ' + target + ' ping statistics ---\n2 packets transmitted, 2 received, 0% packet loss\n';
        },

        whoami: function() { return 'mailadmin'; },
        hostname: function() { return 'MAIL-GW01'; },
        clear: function(args, term) { term.outputEl.innerHTML = ''; return null; },
        ls: function() { return '\nDesktop  Documents  Downloads\n'; },

        ipconfig: function() { return 'bash: ipconfig: command not found'; },
        dir: function() { return 'bash: dir: command not found'; },
        cls: function() { return 'bash: cls: command not found'; }
    },

    // ==========================================================
    // WINDOW HANDLERS
    // ==========================================================

    onAppLaunch(iconDef, engine) {
        var requireTicket = ['header_analyzer', 'dns_records', 'dmarc_report', 'server_info'];
        if (requireTicket.includes(iconDef.app) && !engine.state._scenarioSelected) {
            engine.notify('Open the Help Desk Ticket first to receive your assignment.', 'error');
            return;
        }
        switch (iconDef.app) {
            case 'ticket':          MAIL002Config._openTicket(iconDef, engine); break;
            case 'header_analyzer': MAIL002Config._openHeaderAnalyzer(iconDef, engine); break;
            case 'dns_records':     MAIL002Config._openDnsRecords(iconDef, engine); break;
            case 'dmarc_report':    MAIL002Config._openDmarcReport(iconDef, engine); break;
            case 'server_info':     MAIL002Config._openServerInfo(iconDef, engine); break;
            case 'reset_lab':       MAIL002Config._confirmReset(engine); break;
        }
    },

    _openTicket(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var container = document.createElement('div');
        container.id = 'ticketContainer';
        container.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Help Desk Ticket', 'HD', container);
        MAIL002Config._ensureScenario(engine);
        if (engine.state._scenarioSelected) {
            MAIL002Config._renderTicket(engine, container);
        } else {
            MAIL002Config._renderScenarioPicker(engine, container);
        }
    },

    _renderScenarioPicker(engine, container) {
        var previews = [
            'Carlos Mendez — "Emails going to spam — SPF failure on new CRM server"',
            'Angela Kim — "DKIM failing on all outbound mail after key rotation"',
            'Robert Glass — "DMARC rejecting our MailChimp marketing emails"',
            'Jessica Wu — "MailChimp campaign failing SPF — not in our record"',
            'Tom Harding — "DMARC fails despite SPF and DKIM passing — alignment issue"'
        ];
        var html = '<div style="text-align:center; margin-bottom:20px;">'
            + '<div style="color:#10b981; font-weight:bold; font-size:1.1rem; margin-bottom:8px;">EMAIL AUTH QUEUE</div>'
            + '<div style="color:#888; font-size:0.75rem;">Select a ticket or get a random assignment.</div></div><div style="margin-bottom:16px;">';
        MAIL002Config._scenarios.forEach(function(s, i) {
            html += '<button class="mail002-scenario-btn" data-idx="' + i + '" style="display:block; width:100%; text-align:left; padding:12px 16px; margin-bottom:8px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.12); border-radius:4px; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem; cursor:pointer;">'
                + '<div style="display:flex; justify-content:space-between;"><span style="color:#10b981; font-weight:bold;">AUTH-' + (1000 + i) + '</span><span style="background:#e74c3c; color:#fff; padding:1px 8px; border-radius:3px; font-size:0.65rem;">URGENT</span></div>'
                + '<div style="color:#aaa; font-size:0.7rem; margin-top:4px;">' + previews[i] + '</div></button>';
        });
        html += '</div><div style="text-align:center; border-top:1px solid rgba(255,255,255,0.1); padding-top:16px;">'
            + '<button id="mail002RandomBtn" style="padding:10px 28px; background:#10b981; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold; font-size:0.85rem; font-family:Consolas,monospace;">Random Assignment</button></div>';
        container.innerHTML = html;
        container.querySelectorAll('.mail002-scenario-btn').forEach(function(btn) {
            btn.addEventListener('mouseenter', function() { this.style.borderColor = '#10b981'; });
            btn.addEventListener('mouseleave', function() { this.style.borderColor = 'rgba(255,255,255,0.12)'; });
            btn.addEventListener('click', function() {
                MAIL002Config._applyScenario(engine, parseInt(this.getAttribute('data-idx')));
                MAIL002Config._renderTicket(engine, container);
            });
        });
        document.getElementById('mail002RandomBtn').addEventListener('click', function() {
            MAIL002Config._applyScenario(engine, Math.floor(Math.random() * MAIL002Config._scenarios.length));
            MAIL002Config._renderTicket(engine, container);
        });
    },

    _renderTicket(engine, container) {
        var scenario = MAIL002Config._getScenario(engine);
        var submitters = ['Carlos Mendez — CRM Admin', 'Angela Kim — Security Engineer', 'Robert Glass — VP Marketing', 'Jessica Wu — Marketing Ops', 'Tom Harding — Ticketing System Admin'];
        var submitter = submitters[engine.state._scenarioId] || 'Employee';
        container.innerHTML = '<div style="border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:12px; margin-bottom:16px;"><div style="display:flex; justify-content:space-between;"><span style="color:#10b981; font-weight:bold; font-size:1rem;">AUTH TICKET #AUTH-' + (1000 + engine.state._scenarioId) + '</span><span style="background:#e74c3c; color:#fff; padding:2px 10px; border-radius:3px; font-size:0.7rem; font-weight:bold;">PRIORITY: URGENT</span></div></div>'
            + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem; margin-bottom:4px;">SUBMITTED BY</div><div>' + submitter + '</div></div>'
            + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem; margin-bottom:4px;">DATE</div><div>March 30, 2026 — 8:30 AM</div></div>'
            + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem; margin-bottom:4px;">AFFECTED</div><div style="font-weight:bold; color:#10b981;">' + scenario.affectedDns + '</div></div>'
            + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem; margin-bottom:4px;">SUBJECT</div><div style="font-weight:bold;">' + MAIL002Config._escHtml(scenario.ticketSubject) + '</div></div>'
            + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem; margin-bottom:4px;">DESCRIPTION</div><div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:4px; padding:12px; line-height:1.6;">' + MAIL002Config._escHtml(scenario.ticketDetail) + '</div></div>'
            + (scenario.ticketExtra ? '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem; margin-bottom:4px;">INTERNAL NOTES</div><div style="background:rgba(16,185,129,0.08); border:1px solid rgba(16,185,129,0.2); border-radius:4px; padding:12px; line-height:1.6; color:#a7f3d0;">' + MAIL002Config._escHtml(scenario.ticketExtra) + '</div></div>' : '')
            + '<div style="border-top:1px solid rgba(255,255,255,0.1); padding-top:12px;"><div style="color:#888; font-size:0.7rem; margin-bottom:4px;">ASSIGNED TO</div><div style="color:#10b981; font-weight:bold;">YOU — Mail Server Administrator</div></div>';
    },

    _openHeaderAnalyzer(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); MAIL002Config._renderHeaderAnalyzer(engine); return; }
        var container = document.createElement('div');
        container.id = 'haContainer';
        container.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Email Header Analyzer', 'HDR', container);
        MAIL002Config._renderHeaderAnalyzer(engine);
    },

    _renderHeaderAnalyzer(engine) {
        var container = document.getElementById('haContainer');
        if (!container) return;
        var scenario = MAIL002Config._getScenario(engine);
        var html = '<div style="font-size:1rem; font-weight:bold; color:#10b981; margin-bottom:16px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:8px;">Email Header Analyzer</div>';

        var results = MAIL002Config._getAuthResults(scenario, engine);
        html += '<div style="margin-bottom:16px;">';
        results.forEach(function(r) {
            var color = r.result === 'pass' ? '#2ecc71' : r.result === 'fail' ? '#e74c3c' : '#f59e0b';
            html += '<div style="display:flex; justify-content:space-between; padding:10px 12px; margin-bottom:6px; background:rgba(255,255,255,0.04); border:1px solid ' + (r.result === 'fail' ? 'rgba(231,76,60,0.3)' : 'rgba(255,255,255,0.08)') + '; border-radius:4px;">'
                + '<span style="font-weight:bold;">' + r.check + '</span>'
                + '<span style="color:' + color + '; font-weight:bold;">' + r.result.toUpperCase() + '</span></div>'
                + '<div style="padding:0 12px 8px; font-size:0.75rem; color:#888;">' + r.detail + '</div>';
        });
        html += '</div>';

        if (engine.state._flagRevealed) {
            html += '<div style="margin-top:16px; background:rgba(16,185,129,0.1); border:1px solid rgba(16,185,129,0.3); border-radius:4px; padding:12px;">'
                + '<div style="color:#10b981; font-weight:bold; margin-bottom:4px;">Authentication Fixed:</div>'
                + '<div id="mail002-flag-ha" style="color:#c8e6c9;">Recovery token: loading...</div></div>';
        }
        container.innerHTML = html;

        if (engine.state._flagRevealed) {
            BoxEngine.requestFlagText(scenario.id).then(function(flagText) {
                var el = document.getElementById('mail002-flag-ha');
                if (el) el.textContent = 'Recovery token: ' + (flagText || 'Flag unavailable');
            });
        }
    },

    _getAuthResults(scenario, engine) {
        if (engine.state._fixApplied) {
            return [
                { check: 'SPF', result: 'pass', detail: 'Sending IP authorized in SPF record.' },
                { check: 'DKIM', result: 'pass', detail: 'DKIM signature verified with published key.' },
                { check: 'DMARC', result: 'pass', detail: 'DMARC policy satisfied — SPF and/or DKIM aligned.' }
            ];
        }
        var map = {
            spf_hard_fail: [
                { check: 'SPF', result: 'fail', detail: 'softfail/hardfail: 198.51.100.75 not authorized by v=spf1 ip4:203.0.113.50 -all' },
                { check: 'DKIM', result: 'pass', detail: 'Signature verified (selector1._domainkey.ourcompany.com)' },
                { check: 'DMARC', result: 'fail', detail: 'SPF failed alignment. DKIM passes but overall DMARC: fail due to SPF hard fail action.' }
            ],
            dkim_invalid: [
                { check: 'SPF', result: 'pass', detail: '203.0.113.50 authorized in SPF record.' },
                { check: 'DKIM', result: 'fail', detail: 'dkim=fail: selector2._domainkey.ourcompany.com DNS record not found (NXDOMAIN). Server signing with selector2 but only selector1 published.' },
                { check: 'DMARC', result: 'fail', detail: 'DKIM failed. SPF passes but DMARC requires at least one aligned mechanism.' }
            ],
            dmarc_reject: [
                { check: 'SPF', result: 'pass', detail: 'MailChimp IP authorized via include:servers.mcsv.net' },
                { check: 'DKIM', result: 'pass', detail: 'DKIM signed by d=servers.mcsv.net (MailChimp domain, NOT ourcompany.com)' },
                { check: 'DMARC', result: 'fail', detail: 'SPF aligned: NO (envelope return-path bnc.mcsv.net != From ourcompany.com). DKIM aligned: NO (d=servers.mcsv.net != ourcompany.com). Policy action: reject.' }
            ],
            third_party_spf: [
                { check: 'SPF', result: 'fail', detail: 'MailChimp IP 198.2.128.x not authorized. SPF record missing include:servers.mcsv.net' },
                { check: 'DKIM', result: 'pass', detail: 'DKIM signed by d=servers.mcsv.net' },
                { check: 'DMARC', result: 'fail', detail: 'SPF failed. DKIM domain does not align with From header. DMARC: fail.' }
            ],
            alignment_failure: [
                { check: 'SPF', result: 'pass', detail: 'tickets.ourcompany.com authorized (subdomain covered).' },
                { check: 'DKIM', result: 'pass', detail: 'DKIM signature valid for tickets.ourcompany.com' },
                { check: 'DMARC', result: 'fail', detail: 'SPF aligned: NO (aspf=s strict: tickets.ourcompany.com != ourcompany.com). DKIM aligned: NO (adkim=s strict). Both pass individually but neither aligns in strict mode.' }
            ]
        };
        return map[scenario.id] || [];
    },

    _openDnsRecords(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var container = document.createElement('div');
        container.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'DNS Records', 'DNS', container);
        var scenario = MAIL002Config._getScenario(engine);
        container.innerHTML = '<div style="font-size:1rem; font-weight:bold; color:#10b981; margin-bottom:16px;">DNS Records — ourcompany.com</div>'
            + '<div style="font-size:0.75rem; color:#888; margin-bottom:12px;">Use nslookup -type=txt in the terminal for live queries. These are cached snapshots.</div>'
            + '<div style="background:rgba(0,0,0,0.2); border:1px solid rgba(255,255,255,0.08); border-radius:4px; padding:12px; margin-bottom:12px;"><div style="font-weight:bold; color:#f59e0b; margin-bottom:4px;">SPF Record</div><div style="font-size:0.75rem;">ourcompany.com TXT "v=spf1 ip4:203.0.113.50 -all"</div></div>'
            + '<div style="background:rgba(0,0,0,0.2); border:1px solid rgba(255,255,255,0.08); border-radius:4px; padding:12px; margin-bottom:12px;"><div style="font-weight:bold; color:#f59e0b; margin-bottom:4px;">DKIM Record (selector1)</div><div style="font-size:0.75rem;">selector1._domainkey.ourcompany.com TXT "v=DKIM1; k=rsa; p=..."</div></div>'
            + '<div style="background:rgba(0,0,0,0.2); border:1px solid rgba(255,255,255,0.08); border-radius:4px; padding:12px; margin-bottom:12px;"><div style="font-weight:bold; color:#f59e0b; margin-bottom:4px;">DMARC Record</div><div style="font-size:0.75rem;">_dmarc.ourcompany.com TXT "v=DMARC1; p=reject; rua=mailto:dmarc@ourcompany.com"</div></div>'
            + '<div style="background:rgba(0,0,0,0.2); border:1px solid rgba(255,255,255,0.08); border-radius:4px; padding:12px;"><div style="font-weight:bold; color:#f59e0b; margin-bottom:4px;">MX Records</div><div style="font-size:0.75rem;">ourcompany.com MX 10 mx1.ourcompany.com (203.0.113.50)</div></div>';
    },

    _openDmarcReport(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var container = document.createElement('div');
        container.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'DMARC Aggregate Report', 'DMR', container);
        var scenario = MAIL002Config._getScenario(engine);
        var reportData = {
            spf_hard_fail: { total: 150, pass: 0, fail: 150, source: '198.51.100.75 (CRM Server)', reason: 'SPF: fail (IP not in record). DKIM: pass. Disposition: reject.' },
            dkim_invalid: { total: 340, pass: 0, fail: 340, source: '203.0.113.50 (Our Relay)', reason: 'SPF: pass. DKIM: fail (selector2 NXDOMAIN). Disposition: reject.' },
            dmarc_reject: { total: 5200, pass: 0, fail: 5200, source: '198.2.128.x (MailChimp)', reason: 'SPF: pass (not aligned). DKIM: pass (not aligned). Disposition: reject.' },
            third_party_spf: { total: 5200, pass: 0, fail: 5200, source: '198.2.128.x (MailChimp)', reason: 'SPF: fail (IP not in record). DKIM: pass (not aligned). Disposition: reject.' },
            alignment_failure: { total: 85, pass: 0, fail: 85, source: '203.0.113.50 (tickets.ourcompany.com)', reason: 'SPF: pass (not aligned, strict mode). DKIM: pass (not aligned, strict mode). Disposition: reject.' }
        };
        var d = reportData[scenario.id] || { total: 0, pass: 0, fail: 0, source: 'N/A', reason: 'N/A' };
        container.innerHTML = '<div style="font-size:1rem; font-weight:bold; color:#10b981; margin-bottom:16px;">DMARC Aggregate Report — Last 24h</div>'
            + '<div style="display:flex; gap:16px; margin-bottom:16px;"><div style="flex:1; background:rgba(231,76,60,0.08); border:1px solid rgba(231,76,60,0.2); border-radius:4px; padding:12px; text-align:center;"><div style="color:#e74c3c; font-size:1.5rem; font-weight:bold;">' + d.fail + '</div><div style="color:#888; font-size:0.7rem;">Failed</div></div>'
            + '<div style="flex:1; background:rgba(46,204,113,0.08); border:1px solid rgba(46,204,113,0.2); border-radius:4px; padding:12px; text-align:center;"><div style="color:#2ecc71; font-size:1.5rem; font-weight:bold;">' + d.pass + '</div><div style="color:#888; font-size:0.7rem;">Passed</div></div></div>'
            + '<div style="background:rgba(0,0,0,0.2); border:1px solid rgba(255,255,255,0.08); border-radius:4px; padding:12px; margin-bottom:12px;"><div style="font-weight:bold; margin-bottom:4px;">Source IP</div><div style="font-size:0.75rem; color:#aaa;">' + d.source + '</div></div>'
            + '<div style="background:rgba(0,0,0,0.2); border:1px solid rgba(255,255,255,0.08); border-radius:4px; padding:12px;"><div style="font-weight:bold; margin-bottom:4px;">Failure Reason</div><div style="font-size:0.75rem; color:#e74c3c;">' + d.reason + '</div></div>';
    },

    _openServerInfo(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var container = document.createElement('div');
        container.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Server Info', 'SRV', container);
        container.innerHTML = '<div style="font-size:1rem; font-weight:bold; color:#10b981; margin-bottom:16px;">Mail Infrastructure</div>'
            + '<div style="font-size:0.75rem; color:#aaa; line-height:1.8;">'
            + '<div>Relay: MAIL-GW01 (203.0.113.50) — Postfix 3.7.2</div>'
            + '<div>CRM Server: 198.51.100.75 — Sends automated CRM emails</div>'
            + '<div>MailChimp: 198.2.128.x — Marketing campaigns</div>'
            + '<div>Ticketing: tickets.ourcompany.com — via 203.0.113.50</div>'
            + '<div>DKIM Selectors: selector1 (active in DNS), selector2 (new, not published)</div>'
            + '<div>DNS: 10.0.1.2 (internal BIND 9.18)</div></div>';
    },

    _confirmReset(engine) {
        var overlay = document.createElement('div');
        overlay.style.cssText = 'position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); display:flex; align-items:center; justify-content:center; z-index:9999;';
        overlay.innerHTML = '<div style="background:#1a1a2e; border:1px solid rgba(255,255,255,0.2); border-radius:8px; padding:24px 32px; text-align:center; font-family:Consolas,monospace; color:#c8e6c9; max-width:360px;">'
            + '<div style="font-size:1rem; font-weight:bold; margin-bottom:12px; color:#e74c3c;">Reset Lab?</div>'
            + '<div style="font-size:0.8rem; color:#aaa; margin-bottom:20px;">This will clear all progress and restart.</div>'
            + '<div style="display:flex; gap:12px; justify-content:center;">'
            + '<button id="mail002ResetConfirm" style="padding:8px 24px; background:#e74c3c; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold;">Reset</button>'
            + '<button id="mail002ResetCancel" style="padding:8px 24px; background:rgba(255,255,255,0.1); color:#ccc; border:1px solid rgba(255,255,255,0.2); border-radius:4px; cursor:pointer;">Cancel</button></div></div>';
        document.getElementById('arena').appendChild(overlay);
        document.getElementById('mail002ResetConfirm').addEventListener('click', function() { MAIL002Config._flagRestored = false; MAIL002Config.hints = MAIL002Config._defaultHints; engine.reset(); });
        document.getElementById('mail002ResetCancel').addEventListener('click', function() { overlay.remove(); });
        overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
    }
};
