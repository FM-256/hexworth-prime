/* ============================================================
   PIS-L08: Clearance Forge
   Principles of Information Security -- CTF Lab
   PKI from scratch: root CA, certificate issuance, CRL/OCSP,
   certificate revocation and verification
   SY0-701: 5.1, 5.2
   ============================================================ */

const PISL08Config = {

    // =========================================================
    // BOX METADATA
    // =========================================================

    title: 'Clearance Forge',
    subtitle: 'Hexworth Containment -- PKI Infrastructure Build',
    description: 'Build a PKI from scratch for Hexworth Containment. Create the root CA, issue clearance certificates to four facility servers, configure certificate validation via CRL and OCSP, then revoke a compromised certificate and confirm it fails verification.',
    difficulty: 'Intermediate',
    estimatedTime: 40,
    accent: '#8b5cf6',
    storageKey: 'hexworth_lab_pis_l08',
    registryId: 'pis-l08-clearance-forge',
    trackerKey: 'lab_pis_l08',

    // =========================================================
    // BOOT SEQUENCE
    // =========================================================

    boot: {
        biosLines: [
            'HEXWORTH CONTAINMENT WORKSTATION v4.2.1',
            'PKI Administration Terminal -- BSL-3 Clearance',
            'OpenSSL 3.2.1: LOADED',
            'CA management tools: INITIALIZED',
            'HSM (simulated): ONLINE',
            'Certificate authority database: EMPTY -- AWAITING SETUP'
        ],
        grubEntries: [
            'Containment Analyst OS 22.04 LTS',
            'Containment Analyst OS (recovery mode)'
        ],
        loginUser: 'pki-admin'
    },

    // =========================================================
    // LORE
    // =========================================================

    lore: {
        intro: 'The facility\'s old clearance credential infrastructure was compromised in last week\'s breach. The root CA is untrusted and all certificates have been revoked. You have been tasked with building a new PKI from the ground up. Four servers need clearance certificates before they can resume operations: the specimen database, the containment control system, the inter-lab relay, and the analyst workstation pool. You have 40 minutes before the morning shift arrives.',
        scenario: 'Build the PKI in sequence: initialize the root CA first (ca-init), then issue certificates to each server (cert-issue). Once all four are issued, configure the Certificate Revocation List and OCSP responder (crl-generate). After validation is live, one certificate will be flagged as compromised -- revoke it (cert-revoke) and verify it fails validation (cert-verify). The openssl commands simulate their real-world counterparts.',
        outro: 'PKI build complete. Root CA established with secure key material. Four clearance certificates issued and validated. CRL and OCSP responder online. Compromised certificate revoked and verified as untrusted. The facility can now authenticate servers using cryptographically signed clearance credentials. This is the infrastructure that underpins TLS, code signing, and every certificate you see in a browser.'
    },

    // =========================================================
    // TERMINAL CONFIG
    // =========================================================

    terminal: {
        user: 'pki-admin',
        hostname: 'pki-ws-01',
        startDir: '/home/pki-admin',
        welcome: 'Hexworth Containment -- PKI Administration Terminal\nBSL-3 Clearance Active\n\n*** PKI BUILD REQUIRED ***\n  Root CA: NOT INITIALIZED\n  Certificates issued: 0/4\n  CRL/OCSP: NOT CONFIGURED\n\nBuild sequence:\n  Step 1: ca-init          Initialize root CA\n  Step 2: cert-issue       Issue certificates to servers\n  Step 3: crl-generate     Configure CRL and OCSP\n  Step 4: cert-revoke      Revoke compromised certificate\n  Step 5: cert-verify      Verify revocation\n\nType "help" for full command reference.\nType "cert-list" to see servers awaiting certificates.\n'
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
                        'pki-admin': {
                            type: 'dir',
                            children: {
                                'notes.txt': {
                                    type: 'file',
                                    content: 'PKI BUILD NOTES -- HEXWORTH CONTAINMENT\n========================================\n\nSTEP 1: Initialize Root CA\n  Command: ca-init --cn "Hexworth Containment Root CA" --country US --org "Hexworth Containment"\n  This creates:\n    /etc/pki/ca/root-ca.crt       (self-signed root certificate)\n    /etc/pki/ca/root-ca.key       (root CA private key -- HSM-protected)\n    /etc/pki/ca/serial            (certificate serial number tracker)\n    /etc/pki/ca/index.txt         (certificate database)\n\nSTEP 2: Issue Server Certificates\n  Command: cert-issue --server <server-cn> --ca root-ca\n  Servers requiring certificates:\n    specimen-db-01.hexworth.internal       (specimen database)\n    containment-ctrl-01.hexworth.internal  (containment control system)\n    relay-01.hexworth.internal             (inter-lab relay)\n    ws-pool-01.hexworth.internal           (analyst workstation pool)\n\nSTEP 3: Configure Certificate Validation\n  Command: crl-generate\n  This configures:\n    CRL (Certificate Revocation List) -- published at /etc/pki/ca/crl.pem\n    OCSP responder -- listening on ocsp.hexworth.internal:2560\n\nSTEP 4: Revoke Compromised Certificate\n  One server certificate will be flagged after CRL is generated.\n  Command: cert-revoke --serial <serial> --reason <reason>\n  Reasons: keyCompromise, caCompromise, affiliationChanged, superseded, cessationOfOperation\n\nSTEP 5: Verify Revocation\n  Command: cert-verify --server <server-cn>\n  Or: openssl verify --crl <crlfile> <certfile>\n\nADDITIONAL COMMANDS:\n  cert-list         Show servers and certificate status\n  openssl           Run simulated openssl commands\n  ca-status         Show CA configuration and stats\n'
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'cert-list\nca-status\n'
                                }
                            }
                        }
                    }
                },
                'etc': {
                    type: 'dir',
                    children: {
                        'pki': {
                            type: 'dir',
                            children: {
                                'ca': {
                                    type: 'dir',
                                    children: {
                                        'README.txt': {
                                            type: 'file',
                                            content: 'HEXWORTH CONTAINMENT PKI DIRECTORY\n\nThis directory will contain the root CA files after ca-init is run.\n\nExpected structure after initialization:\n  root-ca.crt      Self-signed root certificate (public)\n  root-ca.key      Root CA private key (PROTECT THIS)\n  serial           Current serial number counter\n  index.txt        Certificate database\n  crl.pem          Certificate Revocation List (after crl-generate)\n\nSecurity note: The root CA private key should never leave the HSM.\nThis simulated environment stores it here for lab purposes only.\n'
                                        }
                                    }
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
        caInitialized: false,
        caSubject: null,
        certSerial: 100,                    // Tracks next serial number
        issuedCerts: {},                    // cn -> { serial, issued, revoked }
        crlConfigured: false,
        compromisedServer: 'relay-01.hexworth.internal',
        revokedSerial: null
    },

    // The four servers that need certificates
    _requiredServers: [
        'specimen-db-01.hexworth.internal',
        'containment-ctrl-01.hexworth.internal',
        'relay-01.hexworth.internal',
        'ws-pool-01.hexworth.internal'
    ],

    _flag1Awarded: false,
    _flag2Awarded: false,
    _flag3Awarded: false,

    // =========================================================
    // TERMINAL COMMANDS
    // =========================================================

    commands: {

        // ca-init -- initialize root certificate authority
        'ca-init': function(args, term, engine) {
            if (engine._state.caInitialized) {
                return 'Error: Root CA already initialized.\nUse ca-status to view current configuration.';
            }

            // Parse flags: --cn, --country, --org
            const cnIdx      = args.indexOf('--cn');
            const countryIdx = args.indexOf('--country');
            const orgIdx     = args.indexOf('--org');

            const cn      = cnIdx >= 0      ? args[cnIdx + 1]      : null;
            const country = countryIdx >= 0 ? args[countryIdx + 1] : null;
            const org     = orgIdx >= 0     ? args[orgIdx + 1]     : null;

            if (!cn || !country || !org) {
                return 'Usage: ca-init --cn "<common-name>" --country <CC> --org "<organization>"\nExample: ca-init --cn "Hexworth Containment Root CA" --country US --org "Hexworth Containment"';
            }

            engine._state.caInitialized = true;
            engine._state.caSubject = { cn, country, org };

            // Create CA files in filesystem
            const caDir = engine.filesystem['/'].children.etc.children.pki.children.ca.children;
            caDir['root-ca.crt'] = {
                type: 'file',
                content: `Certificate:\n  Subject: CN=${cn}, C=${country}, O=${org}\n  Issuer:  CN=${cn}, C=${country}, O=${org} [SELF-SIGNED]\n  Serial:  0\n  Valid:   2026-04-09 to 2036-04-09 (10-year root)\n  Key:     RSA-4096\n  Usage:   Certificate Sign, CRL Sign\n  Fingerprint (SHA-256):\n    A3:F7:2B:9E:14:C6:8D:05:7A:F1:3C:BE:92:45:D8:61\n    :19:7C:E0:AB:F4:28:6D:93:5E:17:B2:84:03:CF:9A:12\n\n-----BEGIN CERTIFICATE-----\n[RSA-4096 self-signed root CA certificate -- Hexworth Containment PKI]\n-----END CERTIFICATE-----\n`
            };
            caDir['root-ca.key'] = {
                type: 'file',
                content: '-----BEGIN ENCRYPTED PRIVATE KEY-----\n[RSA-4096 private key -- HSM-protected in production]\n[Simulation: stored locally for lab purposes]\n-----END ENCRYPTED PRIVATE KEY-----\n'
            };
            caDir['serial'] = { type: 'file', content: '0064\n' };
            caDir['index.txt'] = { type: 'file', content: '' };

            return `ROOT CA INITIALIZED\n${'='.repeat(50)}\n\nSubject:     CN=${cn}\n             C=${country}, O=${org}\nKey size:    RSA-4096\nSignature:   SHA-256 with RSA\nValidity:    10 years (2026-04-09 to 2036-04-09)\nSerial:      0\nType:        Self-signed (root CA)\n\nFiles created:\n  /etc/pki/ca/root-ca.crt    (distribute this to all clients)\n  /etc/pki/ca/root-ca.key    (HSM-protected -- never extract)\n  /etc/pki/ca/serial         (serial counter initialized at 100)\n  /etc/pki/ca/index.txt      (certificate database)\n\nRoot CA is now online.\nNext: issue certificates with cert-issue\nSee ~/notes.txt for server list.`;
        },

        // cert-issue -- issue a certificate to a server
        'cert-issue': function(args, term, engine) {
            if (!engine._state.caInitialized) {
                return 'Error: Root CA not initialized.\nRun ca-init first.';
            }

            const serverIdx = args.indexOf('--server');
            const caIdx     = args.indexOf('--ca');

            const server = serverIdx >= 0 ? args[serverIdx + 1] : null;
            const ca     = caIdx >= 0     ? args[caIdx + 1]     : null;

            if (!server || !ca) {
                return 'Usage: cert-issue --server <server-cn> --ca root-ca\nExample: cert-issue --server specimen-db-01.hexworth.internal --ca root-ca\n\nServers requiring certificates:\n  specimen-db-01.hexworth.internal\n  containment-ctrl-01.hexworth.internal\n  relay-01.hexworth.internal\n  ws-pool-01.hexworth.internal';
            }

            if (!engine._requiredServers.includes(server)) {
                return `Error: "${server}" is not in the facility server registry.\nValid servers:\n  specimen-db-01.hexworth.internal\n  containment-ctrl-01.hexworth.internal\n  relay-01.hexworth.internal\n  ws-pool-01.hexworth.internal`;
            }

            if (ca !== 'root-ca') {
                return 'Error: CA must be "root-ca".\nUsage: cert-issue --server <cn> --ca root-ca';
            }

            if (engine._state.issuedCerts[server]) {
                const existing = engine._state.issuedCerts[server];
                return `Error: Certificate already issued to ${server}.\n  Serial: ${existing.serial}\n  Issued: ${existing.issued}\nUse cert-list to see all issued certificates.`;
            }

            const serial = engine._state.certSerial++;
            engine._state.issuedCerts[server] = {
                serial,
                issued: '2026-04-09',
                revoked: false,
                revokedReason: null
            };

            // Mark the relay cert serial for later revocation reference
            if (server === engine._state.compromisedServer) {
                engine._state.revokedSerial = serial;
            }

            const issuedCount = Object.keys(engine._state.issuedCerts).length;

            let output = `CERTIFICATE ISSUED\n${'='.repeat(50)}\n\n  Subject: CN=${server}\n  Issuer:  CN=${engine._state.caSubject.cn}\n  Serial:  ${serial}\n  Issued:  2026-04-09\n  Expires: 2027-04-09 (1-year server cert)\n  Key:     RSA-2048\n  SANs:    ${server}\n  Usage:   Digital Signature, Key Encipherment\n           TLS Web Server Authentication\n\nCertificate saved: /etc/pki/ca/certs/${server}.crt\nCertificates issued: ${issuedCount}/4`;

            // Flag 1: all 4 certs issued
            if (issuedCount >= 4 && !engine._flag1Awarded) {
                engine._flag1Awarded = true;
                engine.awardFlag('flag1');
                output += '\n\n[PKI MILESTONE] Root CA created and all 4 server certificates issued. Flag unlocked.\nNext: run crl-generate to configure certificate validation.';
            }

            return output;
        },

        // cert-list -- show all servers and certificate status
        'cert-list': function(args, term, engine) {
            const lines = [
                'FACILITY SERVER CERTIFICATE STATUS',
                '='.repeat(50)
            ];

            for (const server of engine._requiredServers) {
                const cert = engine._state.issuedCerts[server];
                if (!cert) {
                    lines.push(`  ${server.padEnd(45)} [NO CERTIFICATE]`);
                } else if (cert.revoked) {
                    lines.push(`  ${server.padEnd(45)} [REVOKED] serial:${cert.serial} reason:${cert.revokedReason}`);
                } else {
                    lines.push(`  ${server.padEnd(45)} [VALID] serial:${cert.serial} issued:${cert.issued}`);
                }
            }

            lines.push('');
            lines.push(`CA Status: ${engine._state.caInitialized ? 'INITIALIZED' : 'NOT INITIALIZED'}`);
            lines.push(`CRL/OCSP:  ${engine._state.crlConfigured ? 'CONFIGURED' : 'NOT CONFIGURED'}`);
            lines.push(`Issued:    ${Object.keys(engine._state.issuedCerts).length}/4`);

            return lines.join('\n');
        },

        // crl-generate -- configure CRL and OCSP for certificate validation
        'crl-generate': function(args, term, engine) {
            if (!engine._state.caInitialized) {
                return 'Error: Root CA not initialized. Run ca-init first.';
            }

            const issuedCount = Object.keys(engine._state.issuedCerts).length;
            if (issuedCount < 4) {
                return `Error: Not all server certificates have been issued.\nIssued: ${issuedCount}/4\nIssue all certificates before configuring CRL/OCSP.\nUse: cert-issue --server <server-cn> --ca root-ca`;
            }

            engine._state.crlConfigured = true;

            // Create CRL file in filesystem
            const caDir = engine.filesystem['/'].children.etc.children.pki.children.ca.children;
            caDir['crl.pem'] = {
                type: 'file',
                content: `-----BEGIN X509 CRL-----\nHexworth Containment Root CA -- Certificate Revocation List\nIssuer: CN=${engine._state.caSubject.cn}\nThis Update: 2026-04-09T04:00:00Z\nNext Update: 2026-04-16T04:00:00Z\nRevoked Certificates: none (freshly generated)\n-----END X509 CRL-----\n`
            };

            let output = `CERTIFICATE VALIDATION CONFIGURED\n${'='.repeat(50)}\n\nCRL (Certificate Revocation List):\n  File:       /etc/pki/ca/crl.pem\n  Issuer:     ${engine._state.caSubject.cn}\n  This update: 2026-04-09T04:00:00Z\n  Next update: 2026-04-16T04:00:00Z\n  Entries:    0 (no revocations yet)\n  Published:  http://crl.hexworth.internal/root-ca.crl\n\nOCSP Responder:\n  Status:     ONLINE\n  URL:        http://ocsp.hexworth.internal:2560\n  Algorithm:  SHA-1 (OCSP standard)\n  Signing:    Root CA key (HSM)\n\nAll 4 server certificates are now VALID per CRL and OCSP.\n\n*** SECURITY ALERT ***\nIntelligence indicates relay-01.hexworth.internal (serial ${engine._state.revokedSerial}) may be compromised.\nKey material on that server may have been accessed by unauthorized personnel.\nConsider revoking: cert-revoke --serial ${engine._state.revokedSerial} --reason keyCompromise\n`;

            if (!engine._flag2Awarded) {
                engine._flag2Awarded = true;
                engine.awardFlag('flag2');
                output += '\n[PKI MILESTONE] CRL and OCSP responder configured. Certificate validation is live. Flag unlocked.';
            }

            return output;
        },

        // cert-revoke -- revoke a certificate by serial number
        'cert-revoke': function(args, term, engine) {
            if (!engine._state.crlConfigured) {
                return 'Error: CRL not configured. Run crl-generate first.';
            }

            const serialIdx = args.indexOf('--serial');
            const reasonIdx = args.indexOf('--reason');

            const serial = serialIdx >= 0 ? parseInt(args[serialIdx + 1]) : null;
            const reason = reasonIdx >= 0 ? args[reasonIdx + 1] : null;

            const validReasons = ['keyCompromise', 'caCompromise', 'affiliationChanged', 'superseded', 'cessationOfOperation'];

            if (!serial || !reason) {
                return `Usage: cert-revoke --serial <serial> --reason <reason>\nReasons: ${validReasons.join(', ')}\n\nSuspected compromised serial: ${engine._state.revokedSerial} (relay-01.hexworth.internal)`;
            }

            if (!validReasons.includes(reason)) {
                return `Error: "${reason}" is not a valid revocation reason.\nValid reasons: ${validReasons.join(', ')}`;
            }

            // Find the cert with this serial
            const entry = Object.entries(engine._state.issuedCerts).find(([, c]) => c.serial === serial);
            if (!entry) {
                const issuedSerials = Object.values(engine._state.issuedCerts).map(c => c.serial).join(', ');
                return `Error: Serial ${serial} not found in certificate database.\nIssued serials: ${issuedSerials}`;
            }

            const [serverCn, cert] = entry;

            if (cert.revoked) {
                return `Error: Serial ${serial} (${serverCn}) is already revoked.\nRevoked for: ${cert.revokedReason}`;
            }

            cert.revoked = true;
            cert.revokedReason = reason;

            // Update the CRL file
            const caDir = engine.filesystem['/'].children.etc.children.pki.children.ca.children;
            if (caDir['crl.pem']) {
                caDir['crl.pem'].content = `-----BEGIN X509 CRL-----\nHexworth Containment Root CA -- Certificate Revocation List\nIssuer: CN=${engine._state.caSubject.cn}\nThis Update: 2026-04-09T04:15:00Z\nNext Update: 2026-04-16T04:15:00Z\nRevoked Certificates:\n  Serial: ${serial}\n  CN: ${serverCn}\n  Revocation Date: 2026-04-09T04:15:00Z\n  Reason: ${reason}\n-----END X509 CRL-----\n`;
            }

            return `CERTIFICATE REVOKED\n${'='.repeat(50)}\n\n  Server:  ${serverCn}\n  Serial:  ${serial}\n  Reason:  ${reason}\n  Revoked: 2026-04-09T04:15:00Z\n\nCRL updated: /etc/pki/ca/crl.pem\nOCSP responder updated: ocsp.hexworth.internal:2560 now returns REVOKED for serial ${serial}\n\nAny TLS connection to ${serverCn} will now be rejected by clients\nthat check CRL or OCSP before completing the handshake.\n\nNext: verify with cert-verify --server ${serverCn}`;
        },

        // cert-verify -- verify a certificate's current status
        'cert-verify': function(args, term, engine) {
            if (!engine._state.crlConfigured) {
                return 'Error: CRL not configured. CRL must be active before verification.\nRun crl-generate first.';
            }

            const serverIdx = args.indexOf('--server');
            const server    = serverIdx >= 0 ? args[serverIdx + 1] : null;

            if (!server) {
                return 'Usage: cert-verify --server <server-cn>\nExample: cert-verify --server relay-01.hexworth.internal';
            }

            if (!engine._requiredServers.includes(server)) {
                return `Error: "${server}" is not in the facility server registry.`;
            }

            const cert = engine._state.issuedCerts[server];
            if (!cert) {
                return `Error: No certificate found for ${server}.\nIssue one with: cert-issue --server ${server} --ca root-ca`;
            }

            if (cert.revoked) {
                let output = `CERTIFICATE VERIFICATION -- FAILED\n${'='.repeat(50)}\n\nServer:       ${server}\nSerial:       ${cert.serial}\nIssued:       ${cert.issued}\nStatus:       REVOKED\nRevocation:   ${cert.revokedReason}\n\nCRL check:    REVOKED (found in /etc/pki/ca/crl.pem)\nOCSP check:   REVOKED (ocsp.hexworth.internal returns: revoked)\n\nThis certificate is not trusted.\nAny client validating against this CA will reject the connection.\n`;

                if (!engine._flag3Awarded) {
                    engine._flag3Awarded = true;
                    engine.awardFlag('flag3');
                    output += '\n[PKI MILESTONE] Compromised certificate revoked and verified as untrusted. Flag unlocked.';
                }

                return output;
            }

            return `CERTIFICATE VERIFICATION -- PASSED\n${'='.repeat(50)}\n\nServer:    ${server}\nSerial:    ${cert.serial}\nIssued:    ${cert.issued}\nExpires:   2027-04-09\nStatus:    VALID\n\nCRL check:  NOT REVOKED (not in /etc/pki/ca/crl.pem)\nOCSP check: GOOD (ocsp.hexworth.internal returns: good)\n\nCertificate is trusted and valid.`;
        },

        // ca-status -- show CA configuration and statistics
        'ca-status': function(args, term, engine) {
            if (!engine._state.caInitialized) {
                return 'Root CA: NOT INITIALIZED\nRun: ca-init --cn "..." --country US --org "..."';
            }

            const issued  = Object.keys(engine._state.issuedCerts).length;
            const revoked = Object.values(engine._state.issuedCerts).filter(c => c.revoked).length;

            return `ROOT CA STATUS -- HEXWORTH CONTAINMENT\n${'='.repeat(50)}\n\nCA Subject:\n  CN: ${engine._state.caSubject.cn}\n  C:  ${engine._state.caSubject.country}\n  O:  ${engine._state.caSubject.org}\n\nCA Statistics:\n  Certificates issued:  ${issued}/4\n  Certificates revoked: ${revoked}\n  CRL configured:       ${engine._state.crlConfigured ? 'YES' : 'NO'}\n  OCSP responder:       ${engine._state.crlConfigured ? 'ONLINE' : 'NOT STARTED'}\n\nSee ~/notes.txt for the build sequence.`;
        },

        // openssl -- simulate openssl verification commands
        'openssl': function(args, term, engine) {
            if (args.length === 0) {
                return 'OpenSSL 3.2.1 (simulated)\nAvailable PKI commands:\n  openssl verify --crl <crlfile> <certfile>   Verify cert against CRL\n  openssl x509 -in <certfile> -text           Inspect certificate\n  openssl ca -status <serial>                 Check serial against CA database';
            }

            const sub = args[0];

            if (sub === 'verify') {
                const crlIdx  = args.indexOf('--crl');
                const certArg = args[args.length - 1];

                if (crlIdx < 0) {
                    return 'Usage: openssl verify --crl /etc/pki/ca/crl.pem <certfile>\nExample: openssl verify --crl /etc/pki/ca/crl.pem relay-01.hexworth.internal.crt';
                }

                if (!engine._state.crlConfigured) {
                    return 'Error: CRL not available. Run crl-generate first.';
                }

                // Determine which server cert is being checked
                const matchedServer = engine._requiredServers.find(s => certArg && certArg.includes(s.split('.')[0]));
                if (!matchedServer) {
                    return `openssl: cannot find certificate for "${certArg}"\nValid cert names: specimen-db-01.crt, containment-ctrl-01.crt, relay-01.crt, ws-pool-01.crt`;
                }

                const cert = engine._state.issuedCerts[matchedServer];
                if (!cert) {
                    return `openssl: no certificate on file for ${matchedServer}`;
                }

                if (cert.revoked) {
                    return `openssl: ${certArg}: certificate revoked\nserial: ${cert.serial}\nreason: ${cert.revokedReason}\nerror ${matchedServer}: certificate revoked`;
                }

                return `openssl: ${certArg}: OK\nCRL check passed. Certificate (serial ${cert.serial}) is not revoked.`;
            }

            if (sub === 'x509') {
                const inIdx = args.indexOf('-in');
                const certFile = inIdx >= 0 ? args[inIdx + 1] : null;

                if (!certFile) {
                    return 'Usage: openssl x509 -in <certfile> -text';
                }

                const matchedServer = engine._requiredServers.find(s => certFile && certFile.includes(s.split('.')[0]));
                if (!matchedServer) {
                    return `openssl: cannot open certificate file ${certFile}`;
                }

                const cert = engine._state.issuedCerts[matchedServer];
                if (!cert) {
                    return `openssl: ${certFile} not found in database`;
                }

                return `Certificate:\n  Data:\n    Serial Number: ${cert.serial}\n    Subject: CN=${matchedServer}\n    Issuer:  CN=${engine._state.caSubject ? engine._state.caSubject.cn : 'Root CA'}\n    Validity:\n      Not Before: Apr  9 04:00:00 2026 GMT\n      Not After:  Apr  9 04:00:00 2027 GMT\n    Key Algorithm: rsaEncryption (2048 bit)\n    Status: ${cert.revoked ? 'REVOKED (' + cert.revokedReason + ')' : 'VALID'}`;
            }

            return `openssl: unknown subcommand "${sub}"`;
        },

        // help -- command reference
        'help': function(args, term, engine) {
            return 'PKI ADMIN TERMINAL -- COMMAND REFERENCE\n\n  ca-init --cn <name> --country <cc> --org <org>   Initialize root CA\n  cert-issue --server <cn> --ca root-ca            Issue a certificate\n  cert-list                                         List all cert statuses\n  crl-generate                                      Configure CRL and OCSP\n  cert-revoke --serial <n> --reason <reason>        Revoke a certificate\n  cert-verify --server <cn>                         Verify cert status\n  ca-status                                         Show CA statistics\n  openssl verify --crl <file> <certfile>            CRL verification\n  openssl x509 -in <certfile> -text                 Inspect certificate\n  cat <file>                                        Read a file\n  ls <path>                                         List directory\n\nSee ~/notes.txt for the full build sequence.';
        }
    },

    // =========================================================
    // FLAGS
    // =========================================================

    flags: [
        {
            id: 'flag1',
            value: 'FLAG{pis-l08-clearance-forge_flag1_root_ca_and_certific}',
            label: 'Root CA and Certificates Issued',
            description: 'Initialized root CA and issued clearance certificates to all 4 facility servers.',
            points: 250,
            autoCheck: true
        },
        {
            id: 'flag2',
            value: 'FLAG{pis-l08-clearance-forge_flag2_crl_and_ocsp_configu}',
            label: 'CRL and OCSP Configured',
            description: 'Configured certificate revocation list and OCSP responder for validation.',
            points: 250,
            autoCheck: true
        },
        {
            id: 'flag3',
            value: 'FLAG{pis-l08-clearance-forge_flag3_compromised_certific}',
            label: 'Compromised Certificate Revoked and Verified',
            description: 'Revoked the compromised server certificate and verified it fails CRL/OCSP validation.',
            points: 250,
            autoCheck: true
        }
    ],

    // =========================================================
    // SCORING
    // =========================================================

    scoring: {
        base: 1000,
        maxScore: 750,
        hintPenalty: true,
        wrongFlagPenalty: -25,
        speedBonus: { threshold: 900000, points: 100 },
        timeBonusThreshold: 2400
    },

    // =========================================================
    // HINTS
    // =========================================================

    hints: [
        {
            id: 'hint1',
            text: 'Start with ca-init. Use the exact flags: --cn for the common name, --country for the two-letter country code, --org for the organization. Once the CA is initialized, run cert-issue for each of the 4 servers listed in ~/notes.txt. Use --ca root-ca each time.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint2',
            text: 'Run crl-generate only after all 4 certificates are issued. After the CRL is online, check cert-list -- one server will be flagged as compromised. The serial number for that server is what you need for cert-revoke.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint3',
            text: 'To revoke: cert-revoke --serial <serial> --reason keyCompromise. Then verify the revocation worked with cert-verify --server relay-01.hexworth.internal. The verification must return REVOKED to complete the lab.',
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
            { flagId: 'flag1', objective: '5.1', description: 'Summarize elements of effective security governance', skill: 'Building a PKI hierarchy: root CA creation, CSR processing, certificate issuance chain of trust' },
            { flagId: 'flag2', objective: '5.2', description: 'Explain elements of the risk management process', skill: 'Configuring CRL distribution points and OCSP responder for real-time certificate validity checking' },
            { flagId: 'flag3', objective: '5.1', description: 'Summarize elements of effective security governance', skill: 'Certificate lifecycle management: revocation procedures, CRL publication, and OCSP status verification' }
        ]
    }

};
