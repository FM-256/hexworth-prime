/* ============================================================
   DISPATCH LAB — Box SRV005: Certificate Expiry Crisis
   Server Troubleshooting — SSL/TLS certificate management
   5 scenarios: cert expiring, intermediate missing, wrong cert
   bound, cert revoked, ACME auto-renewal broken
   ============================================================ */

var SRV005Config = {

    title: 'Certificate Expiry Crisis',
    subtitle: 'The Cert Is About to Die — Server Troubleshooting',
    difficulty: 'Advanced',
    accent: '#6366f1',
    storageKey: 'hexworth_lab_srv005',
    registryId: 'srv005-cert-expiry',
    trackerKey: 'lab_srv005',
    tutorialMode: true,

    tutorial: {
        steps: [
            { title: 'Open the Help Desk Ticket', tip: 'Read the certificate alert.', trigger: { event: 'window_open', match: { type: 'ticket' } } },
            { title: 'Inspect the certificate', tip: 'Use openssl s_client or certutil to examine the certificate chain and expiration.', trigger: { event: 'command', match: { cmd: 'contains:openssl' }, alt: [{ event: 'command', match: { cmd: 'contains:certutil' } }] } },
            { title: 'Identify the issue', tip: 'Determine if the cert is expired, missing intermediates, wrong binding, revoked, or auto-renewal broken.', trigger: { event: 'command', match: { cmd: 'contains:cert' }, alt: [{ event: 'command', match: { cmd: 'contains:netsh' } }] } },
            { title: 'Apply the fix', tip: 'Generate CSR, install intermediate, rebind, or fix ACME renewal.', trigger: { event: 'command', match: { cmd: 'contains:req' }, alt: [{ event: 'command', match: { cmd: 'contains:certbot' } }, { event: 'command', match: { cmd: 'contains:netsh' } }] } },
            { title: 'Capture the flag', tip: 'After resolving the certificate issue, find the recovery token.', trigger: { event: 'flag_correct', match: { flagId: 'fixed' } } }
        ]
    },

    certObjectives: { certPath: 'Network+', mappings: [{ flagId: 'fixed', objective: '4.1', description: 'Explain common security concepts', skill: 'SSL/TLS Certificate Management' }] },

    _servers: [{ name: 'WEB-PROD-01', ip: '10.0.1.10', os: 'Windows Server 2022', role: 'IIS Web Server' }],

    _scenarios: [
        {
            id: 'cert_expiring',
            name: 'SSL Cert Expiring in 24 Hours',
            ticketSubject: 'SSL certificate for portal.contoso.com expires TOMORROW — generate CSR immediately',
            ticketDetail: 'The monitoring system detected that the SSL certificate for portal.contoso.com expires in less than 24 hours (March 31, 2026 at 00:00 UTC). Once it expires, all browsers will show security warnings and users will be unable to access the portal securely. A new CSR must be generated and submitted to the CA immediately.',
            ticketExtra: 'Security Note: The certificate was purchased from DigiCert with a 1-year validity. The renewal reminder was sent 30 days ago but was never acted upon. The CA requires a new CSR for renewal.',
            affectedServer: 0, fixDescription: 'Generate a new CSR and submit to CA for renewal',
            stateOverrides: { _certIssue: 'expiring', _fixed: false }
        },
        {
            id: 'intermediate_missing',
            name: 'Intermediate CA Missing from Chain',
            ticketSubject: 'Some browsers showing "certificate not trusted" despite valid cert',
            ticketDetail: 'Users on certain browsers and mobile devices are getting "This certificate is not trusted" errors when visiting portal.contoso.com. Desktop Chrome works fine. The SSL certificate itself is valid and not expired, but the intermediate CA certificate was not installed in the certificate chain. Browsers that do not have the intermediate cached locally cannot validate the chain back to the root CA.',
            ticketExtra: 'Security Note: The new certificate was installed last week but the admin only imported the end-entity certificate without the intermediate bundle. The full chain should be: End Entity -> DigiCert SHA2 Extended Validation Server CA -> DigiCert Root CA.',
            affectedServer: 0, fixDescription: 'Install the intermediate CA certificate to complete the chain',
            stateOverrides: { _certIssue: 'intermediate', _fixed: false }
        },
        {
            id: 'wrong_binding',
            name: 'Wrong Cert Bound to IIS Site',
            ticketSubject: 'Certificate name mismatch — browser showing NET::ERR_CERT_COMMON_NAME_INVALID',
            ticketDetail: 'Users accessing portal.contoso.com see a certificate mismatch warning. The browser reports the certificate is for "test.contoso.com" instead of "portal.contoso.com". Somebody bound the wrong certificate to the production site. The correct certificate exists in the certificate store but is not bound to port 443.',
            ticketExtra: 'Change Note: An intern was practicing IIS configuration on the production server and accidentally changed the SSL binding from the production cert to a test certificate. The correct cert (thumbprint starting with a1b2c3) is still in the store.',
            affectedServer: 0, fixDescription: 'Rebind the correct certificate (portal.contoso.com) to the IIS site',
            stateOverrides: { _certIssue: 'wrong_binding', _fixed: false }
        },
        {
            id: 'cert_revoked',
            name: 'Certificate Revoked (CRL Check Failing)',
            ticketSubject: 'Certificate has been revoked — browsers showing SEC_ERROR_REVOKED_CERTIFICATE',
            ticketDetail: 'All users are getting "This certificate has been revoked" warnings. The certificate was flagged and revoked by the CA after a suspected key compromise incident last week. The old certificate is no longer valid and a completely new certificate must be issued with a fresh key pair. The CRL and OCSP responder both confirm the revocation.',
            ticketExtra: 'Security Incident Note: The private key for portal.contoso.com was potentially exposed during a server breach on March 23. DigiCert revoked the certificate on March 25 per incident response protocol. A new key pair and CSR must be generated.',
            affectedServer: 0, fixDescription: 'Generate a new key pair and CSR, obtain a new certificate from CA',
            stateOverrides: { _certIssue: 'revoked', _fixed: false }
        },
        {
            id: 'acme_broken',
            name: 'ACME/Let\'s Encrypt Auto-Renewal Broken',
            ticketSubject: 'Let\'s Encrypt certificate expired — certbot auto-renewal has been failing silently',
            ticketDetail: 'The Let\'s Encrypt certificate for api.contoso.com expired 2 days ago. The certbot auto-renewal cron job has been failing for 3 months because the HTTP-01 challenge is no longer accessible — a firewall change blocked port 80 on the API server. Certbot logs show "Challenge did not pass: 403 Forbidden". The renewal has failed 6 consecutive times.',
            ticketExtra: 'DevOps Note: Port 80 was intentionally blocked 3 months ago as part of HTTPS-only enforcement, but nobody realized certbot needs port 80 temporarily for HTTP-01 validation. Either re-allow port 80 for .well-known/acme-challenge or switch to DNS-01 challenge.',
            affectedServer: 0, fixDescription: 'Fix the ACME challenge (re-allow port 80 or switch to DNS-01) and renew the cert',
            stateOverrides: { _certIssue: 'acme', _fixed: false }
        }
    ],

    _defaultHints: [
        { id: 'hint1', text: 'Use openssl s_client to inspect the certificate presented by the server.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Check the certificate expiration, chain, subject name, and revocation status.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Common cert issues: expired, missing intermediate, wrong binding, revoked, auto-renewal broken.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'The flag appears after resolving the certificate issue.', cost: 50, penalty: -50 }
    ],

    _scenarioHints: {
        cert_expiring: [
            { id: 'hint1', text: 'The cert expires tomorrow. You need to generate a CSR for renewal immediately.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Use "openssl s_client -connect 10.0.1.10:443" to see the current expiration date.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Generate CSR: "openssl req -new -newkey rsa:2048 -nodes -keyout portal.key -out portal.csr"', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Full fix: Generate CSR, submit to DigiCert, import new cert with certutil -importpfx, bind to IIS.', cost: 150, penalty: -150 }
        ],
        intermediate_missing: [
            { id: 'hint1', text: 'Some browsers work, others do not. This pattern indicates a missing intermediate certificate.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Run "openssl s_client -connect 10.0.1.10:443" — the chain shows only 1 certificate, missing the intermediate.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Download the intermediate from DigiCert and install it: certutil -addstore CA intermediate.crt', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Fix: certutil -addstore CA DigiCertSHA2ExtendedValidationServerCA.crt, then restart IIS: iisreset.', cost: 150, penalty: -150 }
        ],
        wrong_binding: [
            { id: 'hint1', text: 'The error is "certificate name mismatch." The wrong cert is bound to the site.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Use "netsh http show sslcert" — the bound cert hash does not match portal.contoso.com.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Delete the wrong binding and add the correct one: netsh http delete sslcert, then add with the correct hash.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Fix: netsh http delete sslcert ipport=0.0.0.0:443, then netsh http add sslcert ipport=0.0.0.0:443 certhash=a1b2c3... appid={...}', cost: 150, penalty: -150 }
        ],
        cert_revoked: [
            { id: 'hint1', text: 'The certificate was revoked due to key compromise. A completely new key pair is needed.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Use openssl to verify — the CRL shows the certificate serial number as revoked.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Generate a NEW key pair (do not reuse the compromised key): openssl req -new -newkey rsa:2048', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Fix: Generate new keypair + CSR, submit to CA for a brand new certificate, import and bind.', cost: 150, penalty: -150 }
        ],
        acme_broken: [
            { id: 'hint1', text: 'The certbot renewal has been failing because the HTTP-01 challenge cannot reach port 80.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Check certbot logs: "certbot renew --dry-run" will show the challenge failure.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Either allow port 80 for /.well-known/acme-challenge or switch to DNS-01 challenge type.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Fix: netsh advfirewall firewall add rule for port 80, then "certbot renew --force-renewal". Or switch: certbot certonly --dns-cloudflare.', cost: 150, penalty: -150 }
        ]
    },

    _ensureScenario(engine) { if (!engine.state._scenarioSelected) return false; if (engine.state._scenarioId != null && !SRV005Config._flagRestored) { SRV005Config._flagRestored = true; var s = SRV005Config._scenarios[engine.state._scenarioId]; if (s) SRV005Config.hints = SRV005Config._scenarioHints[s.id] || SRV005Config._defaultHints; } return true; },
    _applyScenario(engine, idx) { engine.state._scenarioId = idx; engine.state._scenarioSelected = true; engine.state._certIssue = null; engine.state._fixed = false; engine.state._labComplete = false; engine.state._flagRevealed = false; var o = SRV005Config._scenarios[idx].stateOverrides || {}; for (var k in o) engine.state[k] = o[k]; SRV005Config._flagRestored = true; SRV005Config.hints = SRV005Config._scenarioHints[SRV005Config._scenarios[idx].id] || SRV005Config._defaultHints; engine.save(); },
    _getScenario(engine) { return engine.state._scenarioId == null ? null : SRV005Config._scenarios[engine.state._scenarioId]; },
    _requireScenario(engine) { return engine.state._scenarioSelected ? null : '\nERROR: No active ticket.\nOpen the Help Desk Ticket first.'; },
    _escHtml(str) { var d = document.createElement('div'); d.textContent = str; return d.innerHTML; },

    boot: { biosLines: ['Dell PowerEdge R750 UEFI BIOS', 'Memory: 65536 MB OK', 'Loading Windows Server 2022...'], grubEntries: ['Windows Server 2022'], loginUser: 'Administrator' },
    desktop: { icons: [
        { id: 'cmd', label: 'Command\nPrompt', icon: '>_', app: 'terminal' },
        { id: 'cert_store', label: 'Certificate\nStore', icon: 'CRT', app: 'cert_store' },
        { id: 'iis_manager', label: 'IIS\nManager', icon: 'IIS', app: 'iis_manager' },
        { id: 'ticket', label: 'Help Desk\nTicket', icon: 'HD', app: 'ticket' },
        { id: 'hints', label: 'Hints', icon: '?', app: 'hints' },
        { id: 'reset', label: 'Reset\nLab', icon: 'RST', app: 'reset_lab' }
    ] },
    terminal: { user: 'Administrator', hostname: 'WEB-PROD-01', startDir: 'C:\\Users\\Administrator', promptStyle: 'windows', welcome: 'Microsoft Windows [Version 10.0.20348]\n' },
    filesystem: { '/': { type: 'dir', children: {} } },
    flags: [{ id: 'fixed', value: '{{FLAG:scenarioId}}', points: 500 }],
    scoring: { base: 0, maxScore: 600, hintPenalty: true, wrongFlagPenalty: 0, speedBonus: { threshold: 600000, points: 100 }, timeBonusThreshold: 1800 },
    hints: [{ id: 'hint1', text: 'Inspect the certificate with openssl.', cost: 0, penalty: 0 }, { id: 'hint2', text: 'Check expiration, chain, CN, and revocation.', cost: 10, penalty: -10 }, { id: 'hint3', text: 'Fix depends on the issue type.', cost: 25, penalty: -25 }, { id: 'hint4', text: 'Flag appears after fixing.', cost: 50, penalty: -50 }],
    lore: { intro: 'Certificate failures break trust. When the padlock disappears, users panic, compliance fails, and revenue stops.', scenario: 'Each scenario is a different certificate nightmare. Diagnose the specific failure and apply the correct remediation.', outro: 'Certificate issue resolved. The green padlock is back. Trust restored.' },
    phases: [
        { id: 'investigate', name: 'Investigation', description: 'Inspect the certificate.', requiredFlags: [], unlocks: ['diagnose'], locked: false },
        { id: 'diagnose', name: 'Diagnosis', description: 'Identify the certificate issue.', requiredFlags: [], unlocks: ['repair'], locked: true },
        { id: 'repair', name: 'Repair', description: 'Fix the certificate.', requiredFlags: [], unlocks: ['verify'], locked: true },
        { id: 'verify', name: 'Verification', description: 'Confirm HTTPS is working.', requiredFlags: ['fixed'], unlocks: [], locked: true }
    ],

    commands: {
        openssl: function(args, term, engine) {
            var gate = SRV005Config._requireScenario(engine); if (gate) return gate;
            var joined = args.join(' ').toLowerCase();
            var scenario = SRV005Config._getScenario(engine);

            if (joined.includes('s_client') && joined.includes('443')) {
                if (scenario) {
                    if (scenario.id === 'cert_expiring') return '\nCONNECTED(00000003)\n---\nCertificate chain\n 0 s:CN = portal.contoso.com\n   i:CN = DigiCert SHA2 Extended Validation Server CA\n 1 s:CN = DigiCert SHA2 Extended Validation Server CA\n   i:CN = DigiCert Root CA\n---\nsubject=CN = portal.contoso.com\n\n    Not Before: Mar 31 00:00:00 2025 GMT\n    Not After : Mar 31 00:00:00 2026 GMT\n\n    VERIFY RESULT: 0 (ok)\n\n    WARNING: Certificate expires in less than 24 hours!';
                    if (scenario.id === 'intermediate_missing') return '\nCONNECTED(00000003)\n---\nCertificate chain\n 0 s:CN = portal.contoso.com\n   i:CN = DigiCert SHA2 Extended Validation Server CA\n---\nVerify return code: 21 (unable to verify the first certificate)\n\nWARNING: Incomplete certificate chain. Intermediate CA certificate is missing.\nOnly 1 certificate in chain (expected 2 or more).';
                    if (scenario.id === 'wrong_binding') return '\nCONNECTED(00000003)\n---\nsubject=CN = test.contoso.com\nissuer=CN = DigiCert SHA2 Extended Validation Server CA\n\n    VERIFY RESULT: 0 (ok)\n\n    WARNING: Certificate subject (test.contoso.com) does not match expected hostname (portal.contoso.com).';
                    if (scenario.id === 'cert_revoked') return '\nCONNECTED(00000003)\n---\nsubject=CN = portal.contoso.com\n\n    Verify return code: 23 (certificate revoked)\n    CRL Reason: keyCompromise\n    Revocation Date: Mar 25 12:00:00 2026 GMT\n\n    ERROR: Certificate has been REVOKED by the issuing CA.';
                    if (scenario.id === 'acme_broken') return '\nconnect: Connection refused\nCONNECT:errno=111\n\nNote: The Let\'s Encrypt certificate for api.contoso.com expired 2 days ago.\nHTTPS is not available.';
                }
            }

            if (joined.includes('req') && joined.includes('new')) {
                if (scenario && (scenario.id === 'cert_expiring' || scenario.id === 'cert_revoked')) {
                    engine.state._fixed = true; engine.state._flagRevealed = true; engine.state._labComplete = true; engine.save();
                    setTimeout(function() { engine.notify('CSR generated with new key pair. Submit to CA. Check Certificate Store for recovery token.', 'success'); }, 400);
                    return '\nGenerating RSA private key, 2048 bit long modulus\n..........+++++\nwriting new private key to \'portal.contoso.com.key\'\n\nCSR written to portal.contoso.com.csr\nSubject: CN=portal.contoso.com, O=Contoso Ltd, L=Redmond, ST=WA, C=US';
                }
            }
            return '\nUsage:\n    openssl s_client -connect <host>:443\n    openssl req -new -newkey rsa:2048 -nodes -keyout key.pem -out csr.pem\n    openssl verify -CAfile chain.pem cert.pem';
        },

        certutil: function(args, term, engine) {
            var gate = SRV005Config._requireScenario(engine); if (gate) return gate;
            var joined = args.join(' ').toLowerCase();
            var scenario = SRV005Config._getScenario(engine);

            if (joined.includes('-addstore') && joined.includes('ca') && joined.includes('intermediate')) {
                if (scenario && scenario.id === 'intermediate_missing') {
                    engine.state._fixed = true; engine.state._flagRevealed = true; engine.state._labComplete = true; engine.save();
                    setTimeout(function() { engine.notify('Intermediate CA installed. Certificate chain is now complete. Check Certificate Store for recovery token.', 'success'); }, 400);
                    return '\nCertificate "DigiCert SHA2 Extended Validation Server CA" added to store.\nCertUtil: -addstore command completed successfully.';
                }
            }
            if (joined.includes('-store')) {
                return '\n================ Certificate 0 ================\nSubject: CN=portal.contoso.com\nIssuer: CN=DigiCert SHA2 Extended Validation Server CA\nNotAfter: ' + (scenario && scenario.id === 'cert_expiring' ? '3/31/2026 (EXPIRING TOMORROW)' : '1/15/2027') + '\nThumbprint: a1b2c3d4e5f6a7b8c9d0\n\n================ Certificate 1 ================\nSubject: CN=test.contoso.com\nIssuer: CN=DigiCert SHA2 Extended Validation Server CA\nNotAfter: 6/15/2027\nThumbprint: ff00ee11dd22cc33bb44';
            }
            return '\nUsage: certutil -store My\n       certutil -addstore CA intermediate.crt\n       certutil -importpfx cert.pfx';
        },

        netsh: function(args, term, engine) {
            var gate = SRV005Config._requireScenario(engine); if (gate) return gate;
            var joined = args.join(' ').toLowerCase();
            var scenario = SRV005Config._getScenario(engine);

            if (joined.includes('http') && joined.includes('show') && joined.includes('sslcert')) {
                var hash = scenario && scenario.id === 'wrong_binding' ? 'ff00ee11dd22cc33bb44' : 'a1b2c3d4e5f6a7b8c9d0';
                return '\nSSL Certificate bindings:\n    IP:port          : 0.0.0.0:443\n    Certificate Hash : ' + hash + '\n    Application ID   : {4dc3e181-e14b-4a21-b022-59fc669b0914}\n' + (scenario && scenario.id === 'wrong_binding' ? '\n    WARNING: Bound certificate is for test.contoso.com, NOT portal.contoso.com' : '');
            }

            if (joined.includes('http') && joined.includes('delete') && joined.includes('sslcert')) {
                return '\nSSL Certificate binding deleted for IP:port 0.0.0.0:443.';
            }

            if (joined.includes('http') && joined.includes('add') && joined.includes('sslcert') && joined.includes('a1b2c3')) {
                if (scenario && scenario.id === 'wrong_binding') {
                    engine.state._fixed = true; engine.state._flagRevealed = true; engine.state._labComplete = true; engine.save();
                    setTimeout(function() { engine.notify('Correct certificate bound to port 443. Name mismatch resolved. Check Certificate Store for recovery token.', 'success'); }, 400);
                    return '\nSSL Certificate successfully added.\nIP:port: 0.0.0.0:443\nCertificate Hash: a1b2c3d4e5f6a7b8c9d0 (portal.contoso.com)';
                }
            }

            if (joined.includes('advfirewall') && joined.includes('80')) {
                if (scenario && scenario.id === 'acme_broken') {
                    return '\nOk.\nRule "Allow HTTP for ACME" added. Port 80 is now open for /.well-known/acme-challenge.';
                }
            }

            return '\nUsage:\n    netsh http show sslcert\n    netsh http add sslcert ipport=0.0.0.0:443 certhash=HASH appid={GUID}\n    netsh http delete sslcert ipport=0.0.0.0:443';
        },

        certbot: function(args, term, engine) {
            var gate = SRV005Config._requireScenario(engine); if (gate) return gate;
            var joined = args.join(' ').toLowerCase();
            var scenario = SRV005Config._getScenario(engine);

            if (scenario && scenario.id === 'acme_broken') {
                if (joined.includes('renew')) {
                    if (joined.includes('force') || joined.includes('dns')) {
                        engine.state._fixed = true; engine.state._flagRevealed = true; engine.state._labComplete = true; engine.save();
                        setTimeout(function() { engine.notify('Certificate renewed via Let\'s Encrypt. Check Certificate Store for recovery token.', 'success'); }, 400);
                        return '\nSaving debug log to /var/log/letsencrypt/letsencrypt.log\nPlugins selected: Authenticator manual, Installer None\nRenewing an existing certificate for api.contoso.com\n\nCongratulations! Your certificate has been renewed.\n  Certificate: /etc/letsencrypt/live/api.contoso.com/fullchain.pem\n  Key:         /etc/letsencrypt/live/api.contoso.com/privkey.pem\n  Expiry:      June 28, 2026';
                    }
                    return '\nAttempting to renew cert for api.contoso.com\n\nFailed authorization procedure. api.contoso.com (http-01):\n  urn:ietf:params:acme:error:unauthorized :: The client lacks sufficient\n  authorization :: Invalid response from http://api.contoso.com/.well-known/acme-challenge/...\n  403 Forbidden\n\nHint: Port 80 is blocked. Allow it temporarily or switch to DNS-01 challenge.';
                }
                if (joined.includes('dry-run')) {
                    return '\nSimulating renewal of api.contoso.com\n\nChallenge failed: HTTP-01 challenge for api.contoso.com returned 403 Forbidden.\nPort 80 appears to be blocked by the firewall.\n\nFix: Allow port 80 inbound for ACME challenges, or use --preferred-challenges dns.';
                }
            }
            return '\nUsage: certbot renew [--force-renewal] [--dry-run]\n       certbot certonly --preferred-challenges dns -d domain.com';
        },

        iisreset: function(args, term, engine) {
            var gate = SRV005Config._requireScenario(engine); if (gate) return gate;
            return '\nAttempting stop...\nInternet services successfully stopped\nAttempting start...\nInternet services successfully restarted';
        },

        ping: function(args, term, engine) { var gate = SRV005Config._requireScenario(engine); if (gate) return gate; return '\nReply from 10.0.1.10: bytes=32 time<1ms TTL=128\nPackets: Sent = 4, Received = 4, Lost = 0'; },
        whoami: function() { return 'WEB-PROD-01\\Administrator'; },
        hostname: function() { return 'WEB-PROD-01'; },
        cls: function(args, term) { term.outputEl.innerHTML = ''; return null; },
        ipconfig: function() { return '\nIPv4 Address: 10.0.1.10\nSubnet Mask: 255.255.255.0\nDefault Gateway: 10.0.1.1'; },
        curl: function(args, term, engine) {
            var gate = SRV005Config._requireScenario(engine); if (gate) return gate;
            var scenario = SRV005Config._getScenario(engine);
            if (scenario && scenario.id === 'cert_revoked') return '\ncurl: (60) SSL certificate problem: certificate has been revoked';
            if (scenario && scenario.id === 'intermediate_missing') return '\ncurl: (60) SSL certificate problem: unable to get local issuer certificate';
            if (scenario && scenario.id === 'wrong_binding') return '\ncurl: (60) SSL: certificate subject name (test.contoso.com) does not match target host name';
            return '\nHTTP/1.1 200 OK\n<html><body>Portal is working.</body></html>';
        },
        sudo: function() { return '\'sudo\' is not recognized.'; },
        grep: function() { return '\'grep\' is not recognized.'; }
    },

    onAppLaunch(iconDef, engine) {
        var req = ['cert_store', 'iis_manager'];
        if (req.includes(iconDef.app) && !engine.state._scenarioSelected) { engine.notify('Open the Help Desk Ticket first.', 'error'); return; }
        switch (iconDef.app) {
            case 'ticket': SRV005Config._openTicket(iconDef, engine); break;
            case 'cert_store': SRV005Config._openCertStore(iconDef, engine); break;
            case 'iis_manager': SRV005Config._openIIS(iconDef, engine); break;
            case 'reset_lab': SRV005Config._confirmReset(engine); break;
        }
    },

    _openTicket(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var c = document.createElement('div'); c.id = 'ticketContainer';
        c.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Help Desk Ticket', 'HD', c);
        SRV005Config._ensureScenario(engine);
        if (engine.state._scenarioSelected) SRV005Config._renderTicket(engine, c);
        else SRV005Config._renderScenarioPicker(engine, c);
    },

    _renderScenarioPicker(engine, container) {
        var previews = ['Security — "SSL cert expires TOMORROW"', 'Users — "Certificate not trusted on mobile"', 'Users — "Certificate name mismatch warning"', 'Security — "Certificate revoked after breach"', 'DevOps — "Let\'s Encrypt auto-renewal failing for 3 months"'];
        var html = '<div style="text-align:center; margin-bottom:20px;"><div style="color:#6366f1; font-weight:bold; font-size:1.1rem; margin-bottom:8px;">INCIDENT QUEUE</div></div><div>';
        SRV005Config._scenarios.forEach(function(s, i) {
            html += '<button class="srv005-btn" data-idx="' + i + '" style="display:block; width:100%; text-align:left; padding:12px 16px; margin-bottom:8px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.12); border-radius:4px; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem; cursor:pointer;"><div style="display:flex; justify-content:space-between;"><span style="color:#6366f1; font-weight:bold;">INC-' + (9001 + i) + '</span><span style="background:#e74c3c; color:#fff; padding:1px 8px; border-radius:3px; font-size:0.65rem;">SEV-1</span></div><div style="color:#aaa; font-size:0.7rem; margin-top:4px;">' + previews[i] + '</div></button>';
        });
        html += '</div><div style="text-align:center; border-top:1px solid rgba(255,255,255,0.1); padding-top:16px;"><button id="srv005RandBtn" style="padding:10px 28px; background:#6366f1; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold; font-family:Consolas,monospace;">Random Assignment</button></div>';
        container.innerHTML = html;
        container.querySelectorAll('.srv005-btn').forEach(function(b) { b.addEventListener('click', function() { SRV005Config._applyScenario(engine, parseInt(this.getAttribute('data-idx'))); SRV005Config._renderTicket(engine, container); }); });
        document.getElementById('srv005RandBtn').addEventListener('click', function() { SRV005Config._applyScenario(engine, Math.floor(Math.random() * 5)); SRV005Config._renderTicket(engine, container); });
    },

    _renderTicket(engine, container) {
        var s = SRV005Config._getScenario(engine);
        var names = ['Sarah Kim — Information Security', 'Mobile Users — Various Departments', 'QA Team — Quality Assurance', 'CISO Office — Incident Response', 'DevOps — Platform Engineering'];
        container.innerHTML = '<div style="border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:12px; margin-bottom:16px;"><div style="display:flex; justify-content:space-between;"><span style="color:#6366f1; font-weight:bold;">INCIDENT #INC-' + (9001 + engine.state._scenarioId) + '</span><span style="background:#e74c3c; color:#fff; padding:2px 10px; border-radius:3px; font-size:0.7rem;">SEV-1</span></div></div>'
            + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">REPORTED BY</div><div>' + names[engine.state._scenarioId] + '</div></div>'
            + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">SUBJECT</div><div style="font-weight:bold;">' + SRV005Config._escHtml(s.ticketSubject) + '</div></div>'
            + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">DESCRIPTION</div><div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:4px; padding:12px; line-height:1.6;">' + SRV005Config._escHtml(s.ticketDetail) + '</div></div>'
            + (s.ticketExtra ? '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">INTERNAL NOTES</div><div style="background:rgba(99,102,241,0.08); border:1px solid rgba(99,102,241,0.2); border-radius:4px; padding:12px; color:#a5b4fc;">' + SRV005Config._escHtml(s.ticketExtra) + '</div></div>' : '')
            + '<div style="border-top:1px solid rgba(255,255,255,0.1); padding-top:12px;"><div style="color:#888; font-size:0.7rem;">ASSIGNED TO</div><div style="color:#2ecc71; font-weight:bold;">YOU — PKI / Certificate Administrator</div></div>';
    },

    _openCertStore(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); SRV005Config._renderCertStore(engine); return; }
        var c = document.createElement('div'); c.id = 'certStoreContainer';
        c.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Certificate Store', 'CRT', c);
        SRV005Config._renderCertStore(engine);
    },

    _renderCertStore(engine) {
        var c = document.getElementById('certStoreContainer'); if (!c) return;
        var s = SRV005Config._getScenario(engine);
        var html = '<div style="font-size:1rem; font-weight:bold; color:#6366f1; margin-bottom:16px;">Certificate Store — Personal</div>';
        html += '<div style="padding:8px 12px; margin-bottom:8px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:4px;"><div style="font-weight:bold;">portal.contoso.com</div><div style="font-size:0.7rem; color:#888;">Thumbprint: a1b2c3d4e5f6a7b8c9d0 &mdash; Issuer: DigiCert</div><div style="font-size:0.7rem; color:' + (s && s.id === 'cert_expiring' ? '#e74c3c' : s && s.id === 'cert_revoked' ? '#e74c3c' : '#2ecc71') + ';">Expires: ' + (s && s.id === 'cert_expiring' ? 'March 31, 2026 (TOMORROW)' : 'Jan 15, 2027') + (s && s.id === 'cert_revoked' ? ' (REVOKED)' : '') + '</div></div>';
        html += '<div style="padding:8px 12px; margin-bottom:8px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:4px;"><div>test.contoso.com</div><div style="font-size:0.7rem; color:#888;">Thumbprint: ff00ee11dd22cc33bb44 &mdash; Issuer: DigiCert</div><div style="font-size:0.7rem; color:#2ecc71;">Expires: June 15, 2027</div></div>';

        if (s && s.id === 'intermediate_missing' && !engine.state._fixed) {
            html += '<div style="margin-top:12px; padding:8px; background:rgba(231,76,60,0.06); border:1px solid rgba(231,76,60,0.2); border-radius:4px; color:#e74c3c;">WARNING: Intermediate CA store is empty. Chain validation will fail on some clients.</div>';
        }

        if (engine.state._flagRevealed && s) {
            html += '<div style="margin-top:16px; background:rgba(46,204,113,0.1); border:1px solid rgba(46,204,113,0.3); border-radius:4px; padding:12px;"><div style="color:#2ecc71; font-weight:bold;">Issue Resolved:</div><div style="font-size:0.8rem;">' + s.fixDescription + '</div><div id="srv005-flag" style="font-size:0.8rem; margin-top:4px;">Recovery token: loading...</div></div>';
            setTimeout(function() { BoxEngine.requestFlagText(s.id).then(function(f) { var el = document.getElementById('srv005-flag'); if (el) el.textContent = 'Recovery token: ' + (f || 'Flag unavailable'); }); }, 0);
        }
        c.innerHTML = html;
    },

    _openIIS(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var c = document.createElement('div');
        c.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'IIS Manager', 'IIS', c);
        var s = SRV005Config._getScenario(engine);
        var boundCert = s && s.id === 'wrong_binding' ? 'test.contoso.com (ff00ee11...)' : 'portal.contoso.com (a1b2c3...)';
        c.innerHTML = '<div style="font-size:1rem; font-weight:bold; color:#6366f1; margin-bottom:16px;">IIS Manager — SSL Bindings</div>'
            + '<div style="padding:8px 12px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:4px;"><div>Default Web Site &mdash; *:443 (https)</div><div style="font-size:0.75rem; color:' + (s && s.id === 'wrong_binding' ? '#e74c3c' : '#888') + ';">Bound Certificate: ' + boundCert + '</div></div>';
    },

    _confirmReset(engine) {
        var o = document.createElement('div');
        o.style.cssText = 'position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); display:flex; align-items:center; justify-content:center; z-index:9999;';
        o.innerHTML = '<div style="background:#1a1a2e; border:1px solid rgba(255,255,255,0.2); border-radius:8px; padding:24px 32px; text-align:center; font-family:Consolas,monospace; color:#c8e6c9;"><div style="font-weight:bold; margin-bottom:12px; color:#e74c3c;">Reset Lab?</div><div style="display:flex; gap:12px; justify-content:center;"><button id="srv005RC" style="padding:8px 24px; background:#e74c3c; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold;">Reset</button><button id="srv005CC" style="padding:8px 24px; background:rgba(255,255,255,0.1); color:#ccc; border:1px solid rgba(255,255,255,0.2); border-radius:4px; cursor:pointer;">Cancel</button></div></div>';
        document.getElementById('arena').appendChild(o);
        document.getElementById('srv005RC').addEventListener('click', function() { SRV005Config._flagRestored = false; SRV005Config.hints = SRV005Config._defaultHints; engine.reset(); });
        document.getElementById('srv005CC').addEventListener('click', function() { o.remove(); });
        o.addEventListener('click', function(e) { if (e.target === o) o.remove(); });
    }
};
