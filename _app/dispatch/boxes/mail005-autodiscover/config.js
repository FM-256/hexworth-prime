/* ============================================================
   DISPATCH LAB — Box MAIL005: Auto-Discover Not Working
   CompTIA Network+ — Autodiscover Troubleshooting (N10-009)
   5 scenarios: SCP wrong URL, CNAME missing, cert SAN missing,
   HTTP redirect not configured, XML parse error
   ============================================================ */

var MAIL005Config = {

    title: 'Auto-Discover Not Working',
    subtitle: 'Outlook Cannot Connect — Autodiscover Troubleshooting',
    difficulty: 'Intermediate',
    accent: '#10b981',
    storageKey: 'hexworth_lab_mail005',
    registryId: 'mail005-autodiscover',
    trackerKey: 'lab_mail005',

    tutorialMode: true,
    tutorial: {
        steps: [
            { title: 'Open the Help Desk Ticket', tip: 'Read the Outlook connectivity complaint.', trigger: { event: 'window_open', match: { type: 'ticket' } } },
            { title: 'Check Autodiscover status', tip: 'Open the Autodiscover Tester or run Test-OutlookConnectivity to see where Autodiscover is failing.', trigger: { event: 'window_open', match: { type: 'autodiscover_test' } } },
            { title: 'Investigate DNS and certificates', tip: 'Use nslookup, openssl, or curl to check DNS records, certificate SANs, and HTTP redirects.', trigger: { event: 'command', match: { cmd: 'contains:nslookup' }, alt: [{ event: 'command', match: { cmd: 'contains:curl' } }, { event: 'command', match: { cmd: 'contains:openssl' } }] } },
            { title: 'Apply the fix', tip: 'Update DNS records, certificate SANs, SCP configuration, or HTTP redirect settings.', trigger: { event: 'command', match: { cmd: 'contains:fix-' }, alt: [{ event: 'command', match: { cmd: 'contains:dns-update' } }, { event: 'command', match: { cmd: 'contains:set-' } }] } },
            { title: 'Capture the flag', tip: 'After fixing Autodiscover, check the Autodiscover Tester for the recovery token.', trigger: { event: 'flag_correct', match: { flagId: 'fixed' } } }
        ]
    },

    certObjectives: {
        certPath: 'Network+',
        mappings: [
            { flagId: 'fixed', objective: '1.6', description: 'Explain network services — DNS, HTTPS, certificates', skill: 'Autodiscover Configuration' },
            { flagId: 'fixed', objective: '5.3', description: 'Troubleshoot common network service issues', skill: 'Outlook Connectivity Troubleshooting' }
        ]
    },

    _scenarios: [
        {
            id: 'scp_wrong_url',
            name: 'SCP Returning Wrong URL',
            ticketSubject: 'Outlook keeps prompting for credentials — internal users only',
            ticketDetail: 'Internal domain-joined workstations are getting repeated credential prompts in Outlook. Outlook tries to connect but then asks for a password again immediately. This only affects users on the corporate network. Remote/VPN users work fine. The issue started after the AD team made changes to Service Connection Point objects.',
            ticketExtra: 'IT Note: The Active Directory Service Connection Point (SCP) for Autodiscover was modified during an AD cleanup. The SCP URL may be pointing to the wrong server or using an incorrect URL format. Check: Get-ClientAccessServer | fl AutoDiscoverServiceInternalUri',
            fixDescription: 'Fix the SCP Autodiscover URL in Active Directory to point to the correct CAS server',
            stateOverrides: { _scpWrongUrl: true, _wrongUrl: 'https://oldserver.ourcompany.com/Autodiscover/Autodiscover.xml', _correctUrl: 'https://mail.ourcompany.com/Autodiscover/Autodiscover.xml' }
        },
        {
            id: 'cname_missing',
            name: 'Autodiscover CNAME Missing',
            ticketSubject: 'External Outlook users cannot auto-configure email accounts',
            ticketDetail: 'New hires working remotely cannot set up Outlook. When they enter their email address, Outlook says "An encrypted connection to your mail server is not available." The autodiscover.ourcompany.com DNS record seems to be missing. Internal users on the corporate network are fine.',
            ticketExtra: 'IT Note: External Autodiscover relies on a DNS CNAME record: autodiscover.ourcompany.com -> autodiscover.outlook.com (for hybrid) or to the on-prem server. This record was not migrated when we moved DNS providers last month.',
            fixDescription: 'Add the autodiscover CNAME record to external DNS',
            stateOverrides: { _cnameMissing: true }
        },
        {
            id: 'cert_san_missing',
            name: 'Certificate SAN Missing',
            ticketSubject: 'Outlook shows certificate warning — autodiscover.ourcompany.com not in cert',
            ticketDetail: 'Users connecting externally get a certificate security warning: "The name on the security certificate is invalid or does not match the name of the site." They can click through it but many users are rightfully refusing. The wildcard cert was replaced with a SAN cert that is missing the autodiscover hostname.',
            ticketExtra: 'IT Note: The wildcard cert *.ourcompany.com was replaced with a SAN cert listing only mail.ourcompany.com and owa.ourcompany.com. The SAN list needs to include autodiscover.ourcompany.com as well.',
            fixDescription: 'Reissue the certificate with autodiscover.ourcompany.com in the SAN list',
            stateOverrides: { _certSanMissing: true }
        },
        {
            id: 'http_redirect_missing',
            name: 'HTTP Redirect Not Configured',
            ticketSubject: 'Outlook autodiscover fails for domain root — no HTTP redirect',
            ticketDetail: 'Some Outlook clients try to reach http://ourcompany.com/Autodiscover/Autodiscover.xml as a fallback method and get a 404 error. Outlook\'s autodiscover process tries several methods in order — SCP, root domain, autodiscover CNAME, SRV record. The root domain HTTP redirect method is not configured on our web server.',
            ticketExtra: 'IT Note: When Outlook tries the root domain method, it sends a GET to https://ourcompany.com/Autodiscover/Autodiscover.xml. Our web server needs to redirect this to https://mail.ourcompany.com/Autodiscover/Autodiscover.xml. The redirect rule is missing from IIS.',
            fixDescription: 'Configure HTTP redirect on the root domain to redirect Autodiscover requests to the CAS server',
            stateOverrides: { _httpRedirectMissing: true }
        },
        {
            id: 'xml_parse_error',
            name: 'Outlook XML Parse Error',
            ticketSubject: 'Outlook connectivity test shows XML parse error on Autodiscover response',
            ticketDetail: 'The Outlook Connectivity Analyzer shows "The Autodiscover XML response could not be parsed." When we manually browse to the Autodiscover URL, we get a response but it contains invalid XML. A web application firewall rule was recently enabled that is modifying the Autodiscover response by injecting HTML into the XML body.',
            ticketExtra: 'IT Note: The WAF (Web Application Firewall) rule "HTML Injection Protection" was enabled last Tuesday. It is appending an HTML tracking snippet to all HTTP responses, including XML API responses like Autodiscover. The WAF rule needs an exception for /Autodiscover/ paths.',
            fixDescription: 'Add a WAF exception for the Autodiscover URL path to prevent XML response corruption',
            stateOverrides: { _xmlParseError: true }
        }
    ],

    _defaultHints: [
        { id: 'hint1', text: 'Open the Autodiscover Tester to see which step of the Autodiscover process is failing.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Autodiscover checks (in order): SCP, root domain, autodiscover CNAME, SRV record.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Use nslookup, curl, and openssl to check DNS, HTTP responses, and certificates.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'Apply the fix and verify with the Autodiscover Tester.', cost: 50, penalty: -50 }
    ],

    _scenarioHints: {
        scp_wrong_url: [
            { id: 'hint1', text: 'Internal users only — SCP is the first Autodiscover method for domain-joined machines.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Run Get-SCPUrl to see the current SCP Autodiscover URL in Active Directory.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'SCP points to https://oldserver.ourcompany.com — should be https://mail.ourcompany.com.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run: Set-SCPUrl fix — updates the SCP to the correct URL.', cost: 150, penalty: -150 }
        ],
        cname_missing: [
            { id: 'hint1', text: 'External users cannot auto-configure. The autodiscover DNS record is likely missing.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Run: nslookup autodiscover.ourcompany.com to check if the CNAME exists.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'NXDOMAIN — the record does not exist. Need to add a CNAME for autodiscover.ourcompany.com.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run: dns-update cname add autodiscover — adds the CNAME record.', cost: 150, penalty: -150 }
        ],
        cert_san_missing: [
            { id: 'hint1', text: 'Certificate warning means the cert SAN list does not include the autodiscover hostname.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Run: openssl check-cert to see the current certificate SAN list.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'The cert has mail.ourcompany.com and owa.ourcompany.com but NOT autodiscover.ourcompany.com.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run: fix-certificate add-san — reissues the cert with autodiscover.ourcompany.com in the SAN.', cost: 150, penalty: -150 }
        ],
        http_redirect_missing: [
            { id: 'hint1', text: 'Outlook tries the root domain as a fallback. HTTP redirect is needed.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Run: curl -I https://ourcompany.com/Autodiscover/Autodiscover.xml to check the response.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Getting 404 instead of 301/302 redirect. The redirect rule needs to be added.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run: fix-redirect add-rule — configures the HTTP redirect in IIS.', cost: 150, penalty: -150 }
        ],
        xml_parse_error: [
            { id: 'hint1', text: 'XML parse error means the Autodiscover response is corrupted.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Run: curl https://mail.ourcompany.com/Autodiscover/Autodiscover.xml to see the raw response.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'The WAF is injecting HTML into the XML response. Need a WAF exception for /Autodiscover/.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run: fix-waf add-exception — adds the WAF bypass rule for Autodiscover paths.', cost: 150, penalty: -150 }
        ]
    },

    _ensureScenario(engine) {
        if (!engine.state._scenarioSelected) return false;
        if (engine.state._scenarioId != null && !MAIL005Config._flagRestored) {
            MAIL005Config._flagRestored = true;
            var s = MAIL005Config._scenarios[engine.state._scenarioId];
            if (s) MAIL005Config.hints = MAIL005Config._scenarioHints[s.id] || MAIL005Config._defaultHints;
        }
        return true;
    },

    _applyScenario(engine, idx) {
        engine.state._scenarioId = idx;
        engine.state._scenarioSelected = true;
        engine.state._scpWrongUrl = false;
        engine.state._cnameMissing = false;
        engine.state._certSanMissing = false;
        engine.state._httpRedirectMissing = false;
        engine.state._xmlParseError = false;
        engine.state._labComplete = false;
        engine.state._flagRevealed = false;
        engine.state._fixApplied = false;
        var overrides = MAIL005Config._scenarios[idx].stateOverrides || {};
        for (var key in overrides) { engine.state[key] = overrides[key]; }
        MAIL005Config._flagRestored = true;
        MAIL005Config.hints = MAIL005Config._scenarioHints[MAIL005Config._scenarios[idx].id] || MAIL005Config._defaultHints;
        engine.save();
    },

    _getScenario(engine) { return engine.state._scenarioId == null ? null : MAIL005Config._scenarios[engine.state._scenarioId]; },
    _requireScenario(engine) { return engine.state._scenarioSelected ? null : '\nERROR: No active ticket.\nOpen the Help Desk Ticket first.'; },
    _escHtml(str) { var d = document.createElement('div'); d.textContent = str; return d.innerHTML; },

    boot: { biosLines: ['Dell PowerEdge R640 UEFI', 'Memory: 65536 MB', 'RAID1: 1.2TB', 'Loading Windows Server...'], grubEntries: ['Windows Server 2019'], loginUser: 'ExAdmin' },

    desktop: {
        icons: [
            { id: 'terminal',          label: 'Exchange\nManagement Shell', icon: 'PS',  app: 'terminal' },
            { id: 'autodiscover_test', label: 'Autodiscover\nTester',       icon: 'AD',  app: 'autodiscover_test' },
            { id: 'dns_console',       label: 'DNS\nConsole',               icon: 'DNS', app: 'dns_console' },
            { id: 'cert_viewer',       label: 'Certificate\nViewer',        icon: 'CRT', app: 'cert_viewer' },
            { id: 'server_info',       label: 'Server\nInfo',               icon: 'SRV', app: 'server_info' },
            { id: 'ticket',            label: 'Help Desk\nTicket',          icon: 'HD',  app: 'ticket' },
            { id: 'hints',             label: 'Hints',                      icon: '?',   app: 'hints' },
            { id: 'reset',             label: 'Reset\nLab',                 icon: 'RST', app: 'reset_lab' }
        ]
    },

    terminal: { user: 'ExAdmin', hostname: 'EXCH-CAS01', startDir: 'C:\\Users\\ExAdmin', promptStyle: 'windows', welcome: 'Exchange Management Shell\nConnected to EXCH-CAS01 — Autodiscover Lab\n' },
    filesystem: { '/': { type: 'dir', children: {} } },
    flags: [{ id: 'fixed', value: '{{FLAG:scenarioId}}', points: 500 }],
    scoring: {
        minScore: 0, base: 0, maxScore: 600, hintPenalty: true, wrongFlagPenalty: 0, speedBonus: { threshold: 600000, points: 100 }, timeBonusThreshold: 1800 },
    hints: [
        { id: 'hint1', text: 'Check the Autodiscover Tester for which lookup method is failing.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Autodiscover methods: SCP, root domain, CNAME, SRV record.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Use nslookup, curl, and openssl to diagnose.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'Fix the issue and verify.', cost: 50, penalty: -50 }
    ],
    lore: { intro: 'Autodiscover is broken. Outlook clients cannot automatically configure email settings. Diagnose the specific failure in the Autodiscover chain and apply the fix.', scenario: 'Each scenario targets a different Autodiscover method — SCP, DNS CNAME, certificate SAN, HTTP redirect, or XML response. Identify which link in the chain is broken.', outro: 'Autodiscover restored. Outlook clients can connect. Your understanding of the Autodiscover process identified and fixed the exact point of failure.' },
    phases: [
        { id: 'investigate', name: 'Investigation', description: 'Read ticket and test Autodiscover.', requiredFlags: [], unlocks: ['diagnose'], locked: false },
        { id: 'diagnose', name: 'Diagnosis', description: 'Identify which Autodiscover method is failing.', requiredFlags: [], unlocks: ['repair'], locked: true },
        { id: 'repair', name: 'Repair', description: 'Fix the configuration.', requiredFlags: [], unlocks: ['verify'], locked: true },
        { id: 'verify', name: 'Verification', description: 'Verify and capture flag.', requiredFlags: ['fixed'], unlocks: [], locked: true }
    ],

    commands: {

        'get-scpurl': function(args, term, engine) {
            var gate = MAIL005Config._requireScenario(engine);
            if (gate) return gate;
            var url = engine.state._scpWrongUrl ? 'https://oldserver.ourcompany.com/Autodiscover/Autodiscover.xml' : 'https://mail.ourcompany.com/Autodiscover/Autodiscover.xml';
            return '\nServiceConnectionPoint AutoDiscover URL:\n  ' + url + '\n' + (engine.state._scpWrongUrl ? '\nWARNING: URL references "oldserver" which was decommissioned. Should be "mail.ourcompany.com".\n' : '');
        },

        'set-scpurl': function(args, term, engine) {
            var gate = MAIL005Config._requireScenario(engine);
            if (gate) return gate;
            var s = MAIL005Config._getScenario(engine);
            if (s.id === 'scp_wrong_url' && args.join(' ').toLowerCase().includes('fix')) {
                engine.state._scpWrongUrl = false;
                engine.state._fixApplied = true;
                engine.state._flagRevealed = true;
                engine.state._labComplete = true;
                engine.save();
                setTimeout(function() { engine.notify('SCP URL updated. Internal Autodiscover restored. Check Autodiscover Tester.', 'success'); }, 400);
                return '\nSCP AutoDiscover URL updated:\n  Old: https://oldserver.ourcompany.com/Autodiscover/Autodiscover.xml\n  New: https://mail.ourcompany.com/Autodiscover/Autodiscover.xml\nAD replication will propagate within 15 minutes.\n';
            }
            return '\nUsage: Set-SCPUrl fix\n';
        },

        nslookup: function(args, term, engine) {
            var gate = MAIL005Config._requireScenario(engine);
            if (gate) return gate;
            var joined = args.join(' ').toLowerCase();
            if (joined.includes('autodiscover')) {
                if (engine.state._cnameMissing) {
                    return '\nServer:  10.0.1.2\n\n** server can\'t find autodiscover.ourcompany.com: NXDOMAIN\n\n(No CNAME record exists for autodiscover.ourcompany.com in external DNS)\n';
                }
                return '\nServer:  10.0.1.2\n\nautodiscover.ourcompany.com  canonical name = autodiscover.outlook.com\nautodiscover.outlook.com    canonical name = outlook.ha.office365.com\n';
            }
            if (joined.includes('ourcompany.com')) {
                return '\nServer:  10.0.1.2\n\nName:    ourcompany.com\nAddress: 203.0.113.50\n';
            }
            return '\nUsage: nslookup hostname\nExample: nslookup autodiscover.ourcompany.com\n';
        },

        'dns-update': function(args, term, engine) {
            var gate = MAIL005Config._requireScenario(engine);
            if (gate) return gate;
            var s = MAIL005Config._getScenario(engine);
            var joined = args.join(' ').toLowerCase();
            if (s.id === 'cname_missing' && joined.includes('cname') && joined.includes('add')) {
                engine.state._cnameMissing = false;
                engine.state._fixApplied = true;
                engine.state._flagRevealed = true;
                engine.state._labComplete = true;
                engine.save();
                setTimeout(function() { engine.notify('Autodiscover CNAME added. External Autodiscover restored. Check Autodiscover Tester.', 'success'); }, 400);
                return '\n[DNS UPDATE] CNAME record added:\n  autodiscover.ourcompany.com -> autodiscover.outlook.com\nDNS propagation: immediate (authoritative zone)\n';
            }
            return '\nUsage: dns-update cname add autodiscover\n';
        },

        openssl: function(args, term, engine) {
            var gate = MAIL005Config._requireScenario(engine);
            if (gate) return gate;
            var joined = args.join(' ').toLowerCase();
            if (joined.includes('check-cert') || joined.includes('s_client')) {
                if (engine.state._certSanMissing) {
                    return '\nCertificate for mail.ourcompany.com:\n  Subject: CN=mail.ourcompany.com\n  SAN: DNS:mail.ourcompany.com, DNS:owa.ourcompany.com\n  Valid: 2026-01-15 to 2027-01-15\n  Issuer: DigiCert SHA2 Extended Validation\n\n  WARNING: autodiscover.ourcompany.com is NOT in the SAN list.\n  Outlook will show a certificate warning for Autodiscover connections.\n';
                }
                return '\nCertificate for mail.ourcompany.com:\n  Subject: CN=mail.ourcompany.com\n  SAN: DNS:mail.ourcompany.com, DNS:owa.ourcompany.com, DNS:autodiscover.ourcompany.com\n  Valid: 2026-01-15 to 2027-01-15\n  Issuer: DigiCert SHA2 Extended Validation\n';
            }
            return '\nUsage: openssl check-cert\n       openssl s_client -connect mail.ourcompany.com:443\n';
        },

        'fix-certificate': function(args, term, engine) {
            var gate = MAIL005Config._requireScenario(engine);
            if (gate) return gate;
            var s = MAIL005Config._getScenario(engine);
            if (s.id === 'cert_san_missing' && args.join(' ').toLowerCase().includes('add-san')) {
                engine.state._certSanMissing = false;
                engine.state._fixApplied = true;
                engine.state._flagRevealed = true;
                engine.state._labComplete = true;
                engine.save();
                setTimeout(function() { engine.notify('Certificate reissued with autodiscover SAN. No more cert warnings. Check Autodiscover Tester.', 'success'); }, 400);
                return '\nCertificate reissued and installed:\n  SAN: DNS:mail.ourcompany.com, DNS:owa.ourcompany.com, DNS:autodiscover.ourcompany.com\nIIS bindings updated. No restart required.\n';
            }
            return '\nUsage: fix-certificate add-san\n';
        },

        curl: function(args, term, engine) {
            var gate = MAIL005Config._requireScenario(engine);
            if (gate) return gate;
            var joined = args.join(' ').toLowerCase();
            if (joined.includes('ourcompany.com/autodiscover') && !joined.includes('mail.')) {
                if (engine.state._httpRedirectMissing) {
                    return '\nHTTP/1.1 404 Not Found\nServer: IIS/10.0\nContent-Type: text/html\n\n<h1>404 - File or directory not found.</h1>\n\n(No redirect rule configured for /Autodiscover/ on the root domain)\n';
                }
                return '\nHTTP/1.1 301 Moved Permanently\nLocation: https://mail.ourcompany.com/Autodiscover/Autodiscover.xml\n\n(Root domain redirects to CAS server)\n';
            }
            if (joined.includes('mail.ourcompany.com/autodiscover')) {
                if (engine.state._xmlParseError) {
                    return '\n<?xml version="1.0" encoding="utf-8"?>\n<Autodiscover xmlns="http://schemas.microsoft.com/exchange/autodiscover/responseschema/2006">\n  <Response>\n    <Account>\n      <Protocol><Type>EXPR</Type><Server>mail.ourcompany.com</Server></Protocol>\n    </Account>\n  </Response>\n</Autodiscover>\n<!-- WAF Tracking: <script src="https://waf.ourcompany.com/tracking.js"></script> -->\n\nWARNING: HTML/JavaScript injected by WAF into XML response.\nThis will cause XML parse errors in Outlook.\n';
                }
                return '\n<?xml version="1.0" encoding="utf-8"?>\n<Autodiscover xmlns="http://schemas.microsoft.com/exchange/autodiscover/responseschema/2006">\n  <Response>\n    <Account>\n      <Protocol><Type>EXPR</Type><Server>mail.ourcompany.com</Server></Protocol>\n    </Account>\n  </Response>\n</Autodiscover>\n';
            }
            return '\nUsage: curl [-I] <url>\nExamples:\n  curl https://ourcompany.com/Autodiscover/Autodiscover.xml\n  curl https://mail.ourcompany.com/Autodiscover/Autodiscover.xml\n';
        },

        'fix-redirect': function(args, term, engine) {
            var gate = MAIL005Config._requireScenario(engine);
            if (gate) return gate;
            var s = MAIL005Config._getScenario(engine);
            if (s.id === 'http_redirect_missing' && args.join(' ').toLowerCase().includes('add-rule')) {
                engine.state._httpRedirectMissing = false;
                engine.state._fixApplied = true;
                engine.state._flagRevealed = true;
                engine.state._labComplete = true;
                engine.save();
                setTimeout(function() { engine.notify('HTTP redirect configured. Root domain Autodiscover now redirects properly. Check Autodiscover Tester.', 'success'); }, 400);
                return '\nIIS URL Rewrite rule added:\n  Match: /Autodiscover/Autodiscover.xml\n  Action: Redirect to https://mail.ourcompany.com/Autodiscover/Autodiscover.xml\n  Status: 301 Permanent\n';
            }
            return '\nUsage: fix-redirect add-rule\n';
        },

        'fix-waf': function(args, term, engine) {
            var gate = MAIL005Config._requireScenario(engine);
            if (gate) return gate;
            var s = MAIL005Config._getScenario(engine);
            if (s.id === 'xml_parse_error' && args.join(' ').toLowerCase().includes('add-exception')) {
                engine.state._xmlParseError = false;
                engine.state._fixApplied = true;
                engine.state._flagRevealed = true;
                engine.state._labComplete = true;
                engine.save();
                setTimeout(function() { engine.notify('WAF exception added. Autodiscover XML responses no longer corrupted. Check Autodiscover Tester.', 'success'); }, 400);
                return '\nWAF Exception Rule added:\n  Path: /Autodiscover/*\n  Action: Bypass HTML injection\n  Tracking snippet will no longer be appended to XML API responses.\n';
            }
            return '\nUsage: fix-waf add-exception\n';
        },

        'test-outlookconnectivity': function(args, term, engine) {
            var gate = MAIL005Config._requireScenario(engine);
            if (gate) return gate;
            if (engine.state._fixApplied) {
                return '\nTest-OutlookConnectivity Results:\n  Autodiscover (SCP):         PASS\n  Autodiscover (Root Domain): PASS\n  Autodiscover (CNAME):       PASS\n  Autodiscover (SRV):         PASS\n  XML Response:               VALID\n  Certificate SAN:            VALID\n';
            }
            var s = MAIL005Config._getScenario(engine);
            var results = {
                scp_wrong_url: '  Autodiscover (SCP):         FAIL — URL points to decommissioned server\n  Autodiscover (Root Domain): PASS\n  Autodiscover (CNAME):       PASS',
                cname_missing: '  Autodiscover (SCP):         PASS (internal only)\n  Autodiscover (Root Domain): PASS\n  Autodiscover (CNAME):       FAIL — autodiscover.ourcompany.com NXDOMAIN',
                cert_san_missing: '  Autodiscover (SCP):         PASS\n  Autodiscover (CNAME):       PASS\n  Certificate SAN:            FAIL — autodiscover.ourcompany.com not in SAN',
                http_redirect_missing: '  Autodiscover (SCP):         PASS\n  Autodiscover (Root Domain): FAIL — 404 (no redirect configured)\n  Autodiscover (CNAME):       PASS',
                xml_parse_error: '  Autodiscover (SCP):         PASS\n  Autodiscover (CNAME):       PASS\n  XML Response:               FAIL — Invalid XML (HTML injected by WAF)'
            };
            return '\nTest-OutlookConnectivity Results:\n' + (results[s.id] || '  Unknown error') + '\n';
        },

        ping: function(args, term, engine) {
            var gate = MAIL005Config._requireScenario(engine);
            if (gate) return gate;
            if (!args.length) return '\nUsage: ping target\n';
            return '\nPinging ' + args[args.length - 1] + '...\nReply: bytes=32 time=2ms TTL=128\n';
        },

        whoami: function() { return 'OURCOMPANY\\ExAdmin'; },
        hostname: function() { return 'EXCH-CAS01'; },
        cls: function(args, term) { term.outputEl.innerHTML = ''; return null; },
        dir: function() { return ' Directory of C:\\Users\\ExAdmin\n'; },
        ifconfig: function() { return '\'ifconfig\' is not recognized.'; }
    },

    onAppLaunch(iconDef, engine) {
        var req = ['autodiscover_test', 'dns_console', 'cert_viewer', 'server_info'];
        if (req.includes(iconDef.app) && !engine.state._scenarioSelected) { engine.notify('Open the Help Desk Ticket first.', 'error'); return; }
        switch (iconDef.app) {
            case 'ticket':           MAIL005Config._openTicket(iconDef, engine); break;
            case 'autodiscover_test': MAIL005Config._openAutoTest(iconDef, engine); break;
            case 'dns_console':      MAIL005Config._openDns(iconDef, engine); break;
            case 'cert_viewer':      MAIL005Config._openCert(iconDef, engine); break;
            case 'server_info':      MAIL005Config._openServer(iconDef, engine); break;
            case 'reset_lab':        MAIL005Config._confirmReset(engine); break;
        }
    },

    _openTicket(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var c = document.createElement('div'); c.id = 'ticketContainer';
        c.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Help Desk Ticket', 'HD', c);
        MAIL005Config._ensureScenario(engine);
        if (engine.state._scenarioSelected) { MAIL005Config._renderTicket(engine, c); } else { MAIL005Config._renderPicker(engine, c); }
    },

    _renderPicker(engine, c) {
        var previews = ['Help Desk — "Internal Outlook users getting credential prompts"', 'Remote Support — "External users cannot auto-configure Outlook"', 'Security — "Certificate warning on autodiscover connections"', 'Desktop Support — "Autodiscover fails on root domain fallback"', 'Web Team — "Autodiscover XML parse error after WAF change"'];
        var html = '<div style="text-align:center; margin-bottom:20px;"><div style="color:#10b981; font-weight:bold; font-size:1.1rem;">AUTODISCOVER QUEUE</div></div><div>';
        MAIL005Config._scenarios.forEach(function(s, i) {
            html += '<button class="m5btn" data-idx="' + i + '" style="display:block; width:100%; text-align:left; padding:12px 16px; margin-bottom:8px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.12); border-radius:4px; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem; cursor:pointer;"><div style="display:flex; justify-content:space-between;"><span style="color:#10b981; font-weight:bold;">AD-' + (1000 + i) + '</span><span style="background:#e74c3c; color:#fff; padding:1px 8px; border-radius:3px; font-size:0.65rem;">URGENT</span></div><div style="color:#aaa; font-size:0.7rem; margin-top:4px;">' + previews[i] + '</div></button>';
        });
        html += '</div><div style="text-align:center; border-top:1px solid rgba(255,255,255,0.1); padding-top:16px;"><button id="m5rand" style="padding:10px 28px; background:#10b981; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold; font-family:Consolas,monospace;">Random Assignment</button></div>';
        c.innerHTML = html;
        c.querySelectorAll('.m5btn').forEach(function(b) {
            b.addEventListener('mouseenter', function() { this.style.borderColor = '#10b981'; });
            b.addEventListener('mouseleave', function() { this.style.borderColor = 'rgba(255,255,255,0.12)'; });
            b.addEventListener('click', function() { MAIL005Config._applyScenario(engine, parseInt(this.getAttribute('data-idx'))); MAIL005Config._renderTicket(engine, c); });
        });
        document.getElementById('m5rand').addEventListener('click', function() { MAIL005Config._applyScenario(engine, Math.floor(Math.random() * MAIL005Config._scenarios.length)); MAIL005Config._renderTicket(engine, c); });
    },

    _renderTicket(engine, c) {
        var s = MAIL005Config._getScenario(engine);
        var subs = ['Help Desk Tier 1', 'Remote Support Team', 'InfoSec Analyst', 'Desktop Support Lead', 'Web Operations'];
        c.innerHTML = '<div style="border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:12px; margin-bottom:16px;"><div style="display:flex; justify-content:space-between;"><span style="color:#10b981; font-weight:bold;">AUTODISCOVER #AD-' + (1000 + engine.state._scenarioId) + '</span><span style="background:#e74c3c; color:#fff; padding:2px 10px; border-radius:3px; font-size:0.7rem; font-weight:bold;">URGENT</span></div></div>'
            + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">SUBMITTED BY</div><div>' + subs[engine.state._scenarioId] + '</div></div>'
            + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">SUBJECT</div><div style="font-weight:bold;">' + MAIL005Config._escHtml(s.ticketSubject) + '</div></div>'
            + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">DESCRIPTION</div><div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:4px; padding:12px; line-height:1.6;">' + MAIL005Config._escHtml(s.ticketDetail) + '</div></div>'
            + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">INTERNAL NOTES</div><div style="background:rgba(16,185,129,0.08); border:1px solid rgba(16,185,129,0.2); border-radius:4px; padding:12px; line-height:1.6; color:#a7f3d0;">' + MAIL005Config._escHtml(s.ticketExtra) + '</div></div>'
            + '<div style="border-top:1px solid rgba(255,255,255,0.1); padding-top:12px;"><div style="color:#10b981; font-weight:bold;">ASSIGNED TO: YOU — Exchange Administrator</div></div>';
    },

    _openAutoTest(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); MAIL005Config._renderAutoTest(engine); return; }
        var c = document.createElement('div'); c.id = 'atContainer';
        c.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Autodiscover Tester', 'AD', c);
        MAIL005Config._renderAutoTest(engine);
    },

    _renderAutoTest(engine) {
        var c = document.getElementById('atContainer'); if (!c) return;
        var s = MAIL005Config._getScenario(engine);
        var html = '<div style="font-size:1rem; font-weight:bold; color:#10b981; margin-bottom:16px;">Autodiscover Connectivity Test</div>';

        var methods = [
            { name: 'SCP Lookup (AD)', status: engine.state._scpWrongUrl ? 'FAIL' : 'PASS', detail: engine.state._scpWrongUrl ? 'URL points to decommissioned server' : 'OK' },
            { name: 'Root Domain Redirect', status: engine.state._httpRedirectMissing ? 'FAIL' : 'PASS', detail: engine.state._httpRedirectMissing ? '404 — no redirect rule' : 'Redirects to CAS' },
            { name: 'CNAME: autodiscover.ourcompany.com', status: engine.state._cnameMissing ? 'FAIL' : 'PASS', detail: engine.state._cnameMissing ? 'NXDOMAIN — record missing' : 'Resolves correctly' },
            { name: 'Certificate SAN', status: engine.state._certSanMissing ? 'FAIL' : 'PASS', detail: engine.state._certSanMissing ? 'autodiscover.ourcompany.com not in SAN' : 'All names present' },
            { name: 'XML Response', status: engine.state._xmlParseError ? 'FAIL' : 'PASS', detail: engine.state._xmlParseError ? 'HTML injected by WAF — invalid XML' : 'Valid XML' }
        ];

        methods.forEach(function(m) {
            var color = m.status === 'PASS' ? '#2ecc71' : '#e74c3c';
            html += '<div style="display:flex; justify-content:space-between; align-items:center; padding:10px 12px; margin-bottom:6px; background:rgba(255,255,255,0.04); border:1px solid ' + (m.status === 'FAIL' ? 'rgba(231,76,60,0.3)' : 'rgba(255,255,255,0.08)') + '; border-radius:4px;">'
                + '<div><div style="font-weight:bold;">' + m.name + '</div><div style="font-size:0.7rem; color:#888;">' + m.detail + '</div></div>'
                + '<span style="color:' + color + '; font-weight:bold;">' + m.status + '</span></div>';
        });

        if (engine.state._flagRevealed) {
            html += '<div style="margin-top:16px; background:rgba(16,185,129,0.1); border:1px solid rgba(16,185,129,0.3); border-radius:4px; padding:12px;"><div style="color:#10b981; font-weight:bold;">Autodiscover Fixed:</div><div id="m5flag" style="color:#c8e6c9;">Recovery token: loading...</div></div>';
        }
        c.innerHTML = html;
        if (engine.state._flagRevealed) {
            BoxEngine.requestFlagText(s.id).then(function(ft) { var el = document.getElementById('m5flag'); if (el) el.textContent = 'Recovery token: ' + (ft || 'Flag unavailable'); });
        }
    },

    _openDns(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var c = document.createElement('div');
        c.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'DNS Console', 'DNS', c);
        c.innerHTML = '<div style="font-size:1rem; font-weight:bold; color:#10b981; margin-bottom:16px;">DNS Records — ourcompany.com</div><div style="font-size:0.75rem; color:#aaa; line-height:1.8;"><div>A: ourcompany.com -> 203.0.113.50</div><div>A: mail.ourcompany.com -> 203.0.113.50</div><div>CNAME: autodiscover.ourcompany.com -> ' + (engine.state._cnameMissing ? '(MISSING)' : 'autodiscover.outlook.com') + '</div><div>MX: ourcompany.com -> mx1.ourcompany.com (10)</div><div>TXT: v=spf1 ip4:203.0.113.50 -all</div></div>';
    },

    _openCert(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var c = document.createElement('div');
        c.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Certificate Viewer', 'CRT', c);
        var sans = engine.state._certSanMissing ? 'mail.ourcompany.com, owa.ourcompany.com' : 'mail.ourcompany.com, owa.ourcompany.com, autodiscover.ourcompany.com';
        c.innerHTML = '<div style="font-size:1rem; font-weight:bold; color:#10b981; margin-bottom:16px;">SSL Certificate</div><div style="font-size:0.75rem; color:#aaa; line-height:1.8;"><div>Subject: CN=mail.ourcompany.com</div><div>SAN: ' + sans + '</div><div>Issuer: DigiCert SHA2 Extended Validation</div><div>Valid: 2026-01-15 to 2027-01-15</div></div>' + (engine.state._certSanMissing ? '<div style="margin-top:12px; color:#e74c3c; font-weight:bold;">WARNING: autodiscover.ourcompany.com is NOT in the SAN list</div>' : '');
    },

    _openServer(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var c = document.createElement('div');
        c.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Server Info', 'SRV', c);
        c.innerHTML = '<div style="font-size:1rem; font-weight:bold; color:#10b981; margin-bottom:16px;">Autodiscover Infrastructure</div><div style="font-size:0.75rem; color:#aaa; line-height:1.8;"><div>CAS: EXCH-CAS01 (10.0.1.20) — Exchange 2019 CU12</div><div>Public IP: 203.0.113.50</div><div>Autodiscover URL: https://mail.ourcompany.com/Autodiscover/Autodiscover.xml</div><div>SCP: Active Directory Service Connection Point</div><div>WAF: Cloudflare Enterprise (in front of public IP)</div></div>';
    },

    _confirmReset(engine) {
        var o = document.createElement('div');
        o.style.cssText = 'position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); display:flex; align-items:center; justify-content:center; z-index:9999;';
        o.innerHTML = '<div style="background:#1a1a2e; border:1px solid rgba(255,255,255,0.2); border-radius:8px; padding:24px 32px; text-align:center; font-family:Consolas,monospace; color:#c8e6c9; max-width:360px;"><div style="color:#e74c3c; font-weight:bold; margin-bottom:12px;">Reset Lab?</div><div style="color:#aaa; font-size:0.8rem; margin-bottom:20px;">Clear all progress and restart.</div><div style="display:flex; gap:12px; justify-content:center;"><button id="m5rc" style="padding:8px 24px; background:#e74c3c; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold;">Reset</button><button id="m5cc" style="padding:8px 24px; background:rgba(255,255,255,0.1); color:#ccc; border:1px solid rgba(255,255,255,0.2); border-radius:4px; cursor:pointer;">Cancel</button></div></div>';
        document.getElementById('arena').appendChild(o);
        document.getElementById('m5rc').addEventListener('click', function() { MAIL005Config._flagRestored = false; MAIL005Config.hints = MAIL005Config._defaultHints; engine.reset(); });
        document.getElementById('m5cc').addEventListener('click', function() { o.remove(); });
        o.addEventListener('click', function(e) { if (e.target === o) o.remove(); });
    }
};
